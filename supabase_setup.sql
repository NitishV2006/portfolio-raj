-- 1. Create a table for contact form submissions
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy to allow anyone to insert (public submissions)
CREATE POLICY "Allow public inserts" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- 4. (Optional) Create a policy to allow only authenticated users to view submissions
CREATE POLICY "Allow authenticated selects" ON contact_submissions
  FOR SELECT USING (auth.role() = 'authenticated');
