-- Notifications Table Setup

CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- the specific user this is meant for (null if meant for a specific role)
  target_role TEXT, -- 'admin', 'student', 'all' (null if meant for a specific user)
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notification_reads (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, notification_id)
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view notifications that target them
CREATE POLICY "Users can view their notifications"
ON notifications FOR SELECT
USING (
  auth.uid() = user_id OR 
  target_role = 'all' OR 
  target_role = (SELECT role FROM profiles WHERE id = auth.uid()) OR
  (target_role = 'admin' AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'moderator'))
);

-- Allow authenticated users to insert notifications (needed for triggers)
CREATE POLICY "Users can insert notifications"
ON notifications FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to view and insert their own reads
CREATE POLICY "Users can view own reads"
ON notification_reads FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reads"
ON notification_reads FOR INSERT
WITH CHECK (auth.uid() = user_id);
