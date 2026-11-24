# 🚀 MediBook - Supabase Configuration & Backend Setup Guide

This guide walks you through connecting your **MediBook** doctor appointment application to a live [Supabase](https://supabase.com) backend in under 5 minutes.

---

## 📋 What Was Added & Configured

- **Full Supabase Database Schema**: `supabase-schema.sql` creates tables for `profiles`, `doctors`, and `appointments` with Row Level Security (RLS) policies and automatic auth triggers.
- **Pre-seeded Doctors Data**: All featured doctors (`Poorvi`, `Dr. Suresh`, `Dr. Vani`, `Dr. Arjun`, `Dr. Sneha`, `Dr. Kiran`) are inserted directly into the database.
- **Authentication System**: Real cloud authentication via Supabase Auth (`signUpUser`, `signInUser`, `signOutUser`) with session persistence.
- **Live / Fallback Hybrid Mode**: If Supabase keys are not yet provided in `.env`, the app automatically runs in a local storage mode with a clear visual status indicator (`● Local Mode`). As soon as valid keys are provided, it seamlessly activates (`● Supabase Live`).
- **Cloud Appointment Booking & Management**: Appointments are saved into the Supabase `appointments` table and viewable under the **My Appointments** portal (`/my-appointments`).

---

## 🛠️ Step-by-Step Setup

### Step 1: Create a Free Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and sign in or create a free account.
2. Click **"New Project"**.
3. Choose your project name (e.g., `medibook`) and set a secure database password.
4. Select the region nearest to you and click **"Create new project"**.

---

### Step 2: Copy API Credentials into `.env`
1. In your Supabase project dashboard, navigate to **Project Settings** (gear icon in the left sidebar) ➔ **API**.
2. Find the following values:
   - **Project URL** (e.g. `https://xyzproject.supabase.co`)
   - **Project API Keys** ➔ **`anon` `public`** key
3. Open the `.env` file in the root of `doctor-appointment`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Paste your values and save the file.

---

### Step 3: Run Database Schema Script
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar.
2. Click **"+ New Query"**.
3. Open [`supabase-schema.sql`](./supabase-schema.sql), copy its entire contents, and paste them into the SQL Editor.
4. Click **"Run"** (or press `Ctrl+Enter`).
5. You will see:
   - `profiles` table created with auto-creation trigger on new user signup.
   - `doctors` table populated with 6 medical specialists.
   - `appointments` table created with RLS security policies.

---

### Step 4: Configure Supabase Auth Settings (Optional for Development)
To allow immediate user login without email confirmation emails during local development or hackathon demos:
1. In your Supabase dashboard, go to **Authentication** ➔ **Providers** ➔ **Email**.
2. Toggle **"Confirm email"** to **OFF** (disabled).
3. Click **"Save"**.

---

### Step 5: Start MediBook
From the project folder:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser:
- You will see the **"● Supabase Live"** badge in the navigation bar.
- Register an account on `/register` — your user will appear in Supabase Auth & the `profiles` table.
- Book an appointment — your appointment will be inserted into the `appointments` table.
- Go to `/my-appointments` to review and manage scheduled appointments.
