"use server";

import { createClient } from "@/utils/supabase/server";

// Validation Helper
const isDiuEmail = (email: string) => {
  return email.trim().toLowerCase().endsWith("@diu.edu.bd");
};

export async function signupUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;
  const department = formData.get("department") as string;
  const semester = formData.get("semester") as string;

  // 1. Strict Backend Validation
  if (!isDiuEmail(email)) {
    return { error: "Only @diu.edu.bd emails are allowed." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  if (!fullName || !department || !semester) {
    return { error: "Please fill in all required fields." };
  }

  const supabase = await createClient();

  try {
    // 2. Signup User with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return { error: authError.message };
    }

    if (authData.user) {
      // 3. Insert into public profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          full_name: fullName,
          department,
          semester,
        });

      if (profileError) {
        console.error("Profile Creation Error:", profileError);
        return { error: "Failed to create user profile in the database." };
      }
    }

    return { success: true, message: "Signup successful. Please verify your DIU email." };
  } catch (error) {
    return { error: "Internal server error during signup." };
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. Strict Backend Validation
  if (!isDiuEmail(email)) {
    return { error: "Only @diu.edu.bd emails are allowed." };
  }

  const supabase = await createClient();

  // 2. Sign in with Supabase Auth
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Login successful!" };
}
