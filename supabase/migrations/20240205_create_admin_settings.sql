CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admin) to read/write
CREATE POLICY "Allow full access to authenticated users" ON admin_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow service role (Edge Functions) to read
CREATE POLICY "Allow service role read" ON admin_settings
  FOR SELECT USING (true);
