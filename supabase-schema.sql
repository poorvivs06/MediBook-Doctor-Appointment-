-- ==============================================================================
-- MediBook Database Schema & Initial Data for Supabase
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your Project -> Click on "SQL Editor" in the left sidebar
-- 3. Click "+ New Query", paste this entire script, and click "RUN"
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Syncs with Supabase Auth)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Row Level Security for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by owner" ON public.profiles;
CREATE POLICY "Public profiles are viewable by owner" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Automatically create profile entry on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. DOCTORS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.doctors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  category TEXT NOT NULL,
  experience TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 5,
  rating TEXT NOT NULL DEFAULT '4.8',
  fee TEXT NOT NULL,
  fee_number INTEGER NOT NULL DEFAULT 500,
  photo TEXT NOT NULL DEFAULT '👨‍⚕️',
  gender TEXT NOT NULL DEFAULT 'male',
  qualifications TEXT NOT NULL,
  hospital TEXT NOT NULL,
  availability TEXT NOT NULL,
  available_slots TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  about TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Row Level Security for Doctors
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors are viewable by everyone" ON public.doctors;
CREATE POLICY "Doctors are viewable by everyone" 
  ON public.doctors FOR SELECT 
  USING (true);

-- Pre-seed doctors data
INSERT INTO public.doctors (
  id, name, specialty, category, experience, experience_years, rating, fee, fee_number, photo, gender, qualifications, hospital, availability, available_slots, about
)
VALUES
  (
    'poorvi',
    'Poorvi',
    'Dermatologist',
    'Dermatology',
    '7 Years Experience',
    7,
    '4.8',
    '₹500',
    500,
    '👩‍⚕️',
    'female',
    'MBBS, MD - Dermatology, Venereology & Leprosy',
    'MediBook Skin & Aesthetic Care Clinic',
    'Mon, Wed, Fri (10:00 AM - 04:00 PM)',
    ARRAY['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'],
    'Poorvi is an experienced dermatologist specializing in clinical dermatology, acne treatments, eczema, skin allergies, and advanced skincare therapies with 7 years of clinical excellence.'
  ),
  (
    'dr-suresh',
    'Dr. Suresh',
    'Cardiologist',
    'Cardiology',
    '10 Years Experience',
    10,
    '4.9',
    '₹700',
    700,
    '👨‍⚕️',
    'male',
    'MBBS, MD - General Medicine, DM - Cardiology',
    'MediBook Heart & Vascular Care Center',
    'Mon - Sat (09:00 AM - 02:00 PM)',
    ARRAY['09:30 AM', '11:00 AM', '12:30 PM', '01:30 PM'],
    'Dr. Suresh is a senior consultant cardiologist with a decade of expertise in non-invasive cardiology, preventive cardiac wellness, hypertension management, and echocardiography.'
  ),
  (
    'dr-vani',
    'Dr. Vani',
    'Pediatrician',
    'Pediatrics',
    '8 Years Experience',
    8,
    '4.7',
    '₹400',
    400,
    '👩‍⚕️',
    'female',
    'MBBS, DCH, MD - Pediatrics',
    'MediBook Children''s Wellness Hospital',
    'Tue, Thu, Sat (10:00 AM - 05:00 PM)',
    ARRAY['10:30 AM', '11:45 AM', '02:30 PM', '04:15 PM'],
    'Dr. Vani is a compassionate pediatrician with 8 years of dedicated experience in newborn care, childhood immunizations, developmental milestones, and pediatric nutrition.'
  ),
  (
    'dr-arjun',
    'Dr. Arjun Mehta',
    'Neurologist',
    'Neurology',
    '9 Years Experience',
    9,
    '4.8',
    '₹600',
    600,
    '👨‍⚕️',
    'male',
    'MBBS, MD, DM - Neurology',
    'MediBook Brain & Spine Institute',
    'Mon, Tue, Thu (10:00 AM - 03:00 PM)',
    ARRAY['10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM'],
    'Dr. Arjun Mehta specializes in migraine disorders, peripheral neuropathy, cognitive care, and clinical neurological consultations.'
  ),
  (
    'dr-sneha',
    'Dr. Sneha Patel',
    'Dentist',
    'Dentistry',
    '6 Years Experience',
    6,
    '4.6',
    '₹350',
    350,
    '👩‍⚕️',
    'female',
    'BDS, MDS - Conservative Dentistry',
    'MediBook Dental Clinic',
    'Mon - Fri (09:00 AM - 05:00 PM)',
    ARRAY['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM'],
    'Dr. Sneha Patel provides comprehensive oral healthcare, teeth whitening, root canal therapies, and preventative dental hygiene.'
  ),
  (
    'dr-kiran',
    'Dr. Kiran Rao',
    'Ophthalmologist',
    'Ophthalmology',
    '11 Years Experience',
    11,
    '4.9',
    '₹550',
    550,
    '👨‍⚕️',
    'male',
    'MBBS, MS - Ophthalmology',
    'MediBook Eye Care Center',
    'Mon, Wed, Thu, Sat (09:30 AM - 03:30 PM)',
    ARRAY['09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM'],
    'Dr. Kiran Rao is an experienced eye surgeon focusing on comprehensive vision assessments, refractive health, and cornea care.'
  )
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    specialty = EXCLUDED.specialty,
    category = EXCLUDED.category,
    experience = EXCLUDED.experience,
    rating = EXCLUDED.rating,
    fee = EXCLUDED.fee,
    hospital = EXCLUDED.hospital,
    availability = EXCLUDED.availability,
    available_slots = EXCLUDED.available_slots,
    about = EXCLUDED.about;

-- ------------------------------------------------------------------------------
-- 3. APPOINTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  doctor_id TEXT REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_name TEXT NOT NULL,
  doctor_specialty TEXT NOT NULL,
  doctor_fee TEXT NOT NULL,
  doctor_hospital TEXT,
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for speedy queries by email, user_id, and date
CREATE INDEX IF NOT EXISTS idx_appointments_email ON public.appointments(patient_email);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);

-- Row Level Security for Appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view their own appointments" ON public.appointments;
CREATE POLICY "Patients can view their own appointments" 
  ON public.appointments FOR SELECT 
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.jwt()->>'email' = patient_email) OR
    auth.role() = 'anon'
  );

DROP POLICY IF EXISTS "Anyone can book an appointment" ON public.appointments;
CREATE POLICY "Anyone can book an appointment" 
  ON public.appointments FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Patients can cancel their own appointments" ON public.appointments;
CREATE POLICY "Patients can cancel their own appointments" 
  ON public.appointments FOR UPDATE 
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.jwt()->>'email' = patient_email)
  );

-- ==============================================================================
-- Schema setup complete!
-- ==============================================================================
