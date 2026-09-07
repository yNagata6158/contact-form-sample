CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'other',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 既存テーブルに対する追従 (再実行しても安全)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'other';
