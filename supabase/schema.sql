CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  mssv TEXT,
  class TEXT,
  gender TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS computers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  room TEXT NOT NULL,
  specs TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS computer_borrow_requests (
  id BIGSERIAL PRIMARY KEY,
  computer_id BIGINT NOT NULL REFERENCES computers(id) ON DELETE CASCADE,
  borrower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_computers_name ON computers(name);
CREATE INDEX IF NOT EXISTS idx_borrow_requests_status ON computer_borrow_requests(status);
