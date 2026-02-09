-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
-- Drop existing policies if they exist to avoid errors when re-running
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON admin_settings;
DROP POLICY IF EXISTS "Allow service role read" ON admin_settings;

-- Allow authenticated users (admin) to read/write
CREATE POLICY "Allow full access to authenticated users" ON admin_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow service role (Edge Functions) to read
CREATE POLICY "Allow service role read" ON admin_settings
  FOR SELECT USING (true);

-- 4. Insert Initial Data (Telegram Chat ID)
INSERT INTO admin_settings (key, value)
VALUES ('telegram_chat_id', '5497074427')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
