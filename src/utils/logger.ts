import { createClient } from "@/utils/supabase/client";

export const logActivity = async (action: string, description: string) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { error } = await supabase.from("activity_logs").insert({
      user_id: user.id,
      user_email: user.email,
      action: action,
      description: description,
    });
    
    // ডাটাবেজে সেভ হতে কোনো সমস্যা হলে কনসোলে দেখাবে
    if (error) {
      console.error("Failed to save activity log:", error.message);
    }
  }
};