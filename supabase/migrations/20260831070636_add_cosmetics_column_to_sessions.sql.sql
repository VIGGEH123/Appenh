ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS cosmetics jsonb DEFAULT '{}'::jsonb;
