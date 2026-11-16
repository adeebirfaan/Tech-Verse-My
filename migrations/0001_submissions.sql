-- Submissions from the /submit page. Run once against the D1 database bound as DB:
--   npx wrangler d1 execute techverse-submissions --remote --file=migrations/0001_submissions.sql
CREATE TABLE IF NOT EXISTS submissions (
  id             TEXT PRIMARY KEY,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  name           TEXT NOT NULL,
  description    TEXT NOT NULL,
  category       TEXT NOT NULL,
  type           TEXT NOT NULL CHECK (type IN ('App', 'Website')),
  creator_handle TEXT NOT NULL,
  website_url    TEXT,
  android_url    TEXT,
  ios_url        TEXT,
  logo_key       TEXT,
  contact_email  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS submissions_status_created ON submissions (status, created_at);
