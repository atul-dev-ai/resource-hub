"use server";

import { createClient } from "@/utils/supabase/server";

export interface CreateNotificationParams {
  user_id?: string | null;
  target_role?: string | null;
  title: string;
  message: string;
  type: string;
  link?: string | null;
}

export async function createNotification(params: CreateNotificationParams) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('notifications').insert([{
    user_id: params.user_id || null,
    target_role: params.target_role || null,
    title: params.title,
    message: params.message,
    type: params.type,
    link: params.link || null,
  }]);

  if (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
}

export async function getUserNotifications(userId: string, userRole: string) {
  const supabase = await createClient();
  
  // Get all notifications targeting this user OR their role OR 'all'
  // and left join with notification_reads to see if it's read by this user
  
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      notification_reads (user_id)
    `)
    .or(`user_id.eq.${userId},target_role.eq.all,target_role.eq.${userRole}${['admin', 'super_admin', 'moderator'].includes(userRole) ? ',target_role.eq.admin' : ''}`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error("Failed to get notifications:", error);
    return [];
  }

  // Map to a simpler structure: is_read is true if notification_reads has an entry for this user
  return data.map((n: any) => ({
    ...n,
    is_read: n.notification_reads.some((r: any) => r.user_id === userId)
  }));
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('notification_reads').insert([{
    user_id: userId,
    notification_id: notificationId
  }]);

  // Ignore unique constraint violations (already read)
  if (error && error.code !== '23505') {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
}
