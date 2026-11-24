import { createClient } from "@supabase/supabase-js";
import { doctors as defaultDoctors } from "./doctorsData";

const rawUrl = import.meta.env.VITE_SUPABASE_URL || "";
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const cleanUrl = rawUrl.trim();
const cleanKey = rawKey.trim();

// Check if valid URL format and key is not a placeholder
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = Boolean(
  cleanUrl &&
  cleanKey &&
  isValidUrl(cleanUrl) &&
  !cleanUrl.includes("your-project") &&
  !cleanUrl.includes("placeholder") &&
  !cleanKey.includes("your-supabase-anon-key") &&
  !cleanKey.includes("placeholder")
);

export const supabase = isSupabaseConfigured
  ? createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Sign up a new user with Supabase Auth or fallback to local storage
 */
export async function signUpUser({ email, password, fullName, phone = "" }) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password.trim(),
      options: {
        data: {
          full_name: cleanName,
          phone: phone.trim(),
          role: "patient",
        },
      },
    });

    if (error) throw error;
    return { user: data.user, session: data.session, provider: "supabase" };
  }

  // Fallback: Local storage simulation
  const localUsers = JSON.parse(localStorage.getItem("medibook_local_users") || "[]");
  if (localUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
    throw new Error("An account with this email already exists. Please log in instead.");
  }

  const mockUser = {
    id: `local-usr-${Date.now()}`,
    email: cleanEmail,
    user_metadata: {
      full_name: cleanName,
      phone: phone.trim(),
      role: "patient",
    },
    created_at: new Date().toISOString(),
  };

  localUsers.push({
    ...mockUser,
    password: password.trim(),
    fullName: cleanName,
  });
  localStorage.setItem("medibook_local_users", JSON.stringify(localUsers));
  localStorage.setItem("medibook_current_user", JSON.stringify(mockUser));

  return { user: mockUser, session: { user: mockUser }, provider: "local" };
}

/**
 * Sign in existing user with Supabase Auth or fallback to local storage
 */
export async function signInUser({ email, password }) {
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password.trim(),
    });

    if (error) throw error;
    return { user: data.user, session: data.session, provider: "supabase" };
  }

  // Fallback: Local storage simulation
  const localUsers = JSON.parse(localStorage.getItem("medibook_local_users") || "[]");
  const found = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!found) {
    throw new Error("No account found with this email. Please register first.");
  }

  if (found.password !== password.trim()) {
    throw new Error("Incorrect password. Please verify and try again.");
  }

  const mockUser = {
    id: found.id,
    email: found.email,
    user_metadata: {
      full_name: found.fullName || found.user_metadata?.full_name || "Patient",
      role: found.role || "patient",
    },
    created_at: found.created_at,
  };

  localStorage.setItem("medibook_current_user", JSON.stringify(mockUser));
  return { user: mockUser, session: { user: mockUser }, provider: "local" };
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem("medibook_current_user");
}

/**
 * Book an appointment into Supabase table public.appointments
 */
export async function bookAppointment(appointmentData) {
  const referenceCode = `MED-${Math.floor(1000 + Math.random() * 9000)}`;

  const record = {
    reference_code: referenceCode,
    doctor_id: appointmentData.doctorId || null,
    doctor_name: appointmentData.doctorName,
    doctor_specialty: appointmentData.doctorSpecialty,
    doctor_fee: appointmentData.doctorFee,
    doctor_hospital: appointmentData.doctorHospital || "",
    patient_name: appointmentData.patientName,
    patient_email: appointmentData.patientEmail,
    patient_phone: appointmentData.patientPhone,
    appointment_date: appointmentData.appointmentDate,
    appointment_time: appointmentData.appointmentTime,
    reason: appointmentData.reason,
    consultation_type: appointmentData.consultationType || "in-clinic",
    status: "confirmed",
  };

  // If user is logged in, attach their user_id
  if (appointmentData.userId) {
    record.user_id = appointmentData.userId;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert([record])
        .select()
        .single();

      if (error) {
        console.warn("Supabase insert warning, falling back to local caching:", error.message);
      } else if (data) {
        // Cache to local storage as well for fast client retrieval
        cacheLocalAppointment(data);
        return { ...data, provider: "supabase" };
      }
    } catch (err) {
      console.warn("Supabase appointment insert error:", err);
    }
  }

  // Fallback to local storage
  const localRecord = {
    id: `local-apt-${Date.now()}`,
    ...record,
    created_at: new Date().toISOString(),
    provider: "local",
  };
  cacheLocalAppointment(localRecord);
  return localRecord;
}

function cacheLocalAppointment(item) {
  try {
    const existing = JSON.parse(localStorage.getItem("medibook_appointments") || "[]");
    const filtered = existing.filter((a) => a.reference_code !== item.reference_code);
    filtered.unshift(item);
    localStorage.setItem("medibook_appointments", JSON.stringify(filtered));
  } catch (e) {
    console.error("LocalStorage write error:", e);
  }
}

/**
 * Fetch patient appointments by email / userId
 */
export async function getPatientAppointments(patientEmail = "", userId = null) {
  const emailMatch = patientEmail ? patientEmail.trim().toLowerCase() : "";

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from("appointments").select("*").order("appointment_date", { ascending: false });

      if (userId && emailMatch) {
        query = query.or(`user_id.eq.${userId},patient_email.ilike.${emailMatch}`);
      } else if (userId) {
        query = query.eq("user_id", userId);
      } else if (emailMatch) {
        query = query.ilike("patient_email", emailMatch);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data;
      }
    } catch (err) {
      console.warn("Supabase appointments fetch failed, fallback to local:", err);
    }
  }

  // Fallback to local storage
  try {
    const localApts = JSON.parse(localStorage.getItem("medibook_appointments") || "[]");
    if (!emailMatch && !userId) return localApts;
    return localApts.filter(
      (a) =>
        (emailMatch && a.patient_email?.toLowerCase() === emailMatch) ||
        (userId && a.user_id === userId)
    );
  } catch {
    return [];
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(appointmentId, referenceCode) {
  if (isSupabaseConfigured && supabase) {
    try {
      if (appointmentId && !appointmentId.startsWith("local-")) {
        await supabase
          .from("appointments")
          .update({ status: "cancelled" })
          .eq("id", appointmentId);
      } else if (referenceCode) {
        await supabase
          .from("appointments")
          .update({ status: "cancelled" })
          .eq("reference_code", referenceCode);
      }
    } catch (err) {
      console.warn("Supabase cancel failed:", err);
    }
  }

  // Update local storage
  try {
    const localApts = JSON.parse(localStorage.getItem("medibook_appointments") || "[]");
    const updated = localApts.map((a) => {
      if (
        (appointmentId && a.id === appointmentId) ||
        (referenceCode && a.reference_code === referenceCode)
      ) {
        return { ...a, status: "cancelled" };
      }
      return a;
    });
    localStorage.setItem("medibook_appointments", JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to cancel in local storage:", e);
  }

  return true;
}

/**
 * Fetch doctors from Supabase or fallback to mock data
 */
export async function fetchDoctorsList() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("doctors").select("*");
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          name: d.name,
          specialty: d.specialty,
          category: d.category,
          experience: d.experience,
          experienceYears: d.experience_years,
          rating: d.rating,
          fee: d.fee,
          feeNumber: d.fee_number,
          photo: d.photo,
          gender: d.gender,
          qualifications: d.qualifications,
          hospital: d.hospital,
          availability: d.availability,
          availableSlots: d.available_slots || [],
          about: d.about,
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch doctors failed, using bundled list:", err);
    }
  }

  return defaultDoctors;
}
