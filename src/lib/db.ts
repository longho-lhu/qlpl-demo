import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
const dbFile = path.join(dataDir, process.env.SQLITE_DB_FILE || "qlpl.db");

// reuse a single connection across hot reloads in dev
const globalForDb = globalThis as unknown as { sqliteDb?: DatabaseSync };

function createConnection(): DatabaseSync {
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(dbFile);
  db.exec("PRAGMA journal_mode = WAL;");
  return db;
}

function ensureSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      mssv TEXT,
      class TEXT,
      gender TEXT,
      phone TEXT,
      email TEXT,
      avatar_url TEXT,
      is_admin INTEGER NOT NULL DEFAULT 0,
      profile_completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS computers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      room TEXT NOT NULL,
      specs TEXT,
      status TEXT NOT NULL DEFAULT 'available',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS computer_borrow_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      computer_id INTEGER NOT NULL,
      borrower_id INTEGER NOT NULL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      requested_at TEXT NOT NULL DEFAULT (datetime('now')),
      approved_by INTEGER,
      approved_at TEXT,
      returned_at TEXT,
      FOREIGN KEY (computer_id) REFERENCES computers (id) ON DELETE CASCADE,
      FOREIGN KEY (borrower_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL
    );
  `);

  const columns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (!columns.some((column) => column.name === "avatar_url")) {
    db.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;");
  }
  if (!columns.some((column) => column.name === "is_admin")) {
    db.exec("ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;");
  }

  const computerColumns = db.prepare("PRAGMA table_info(computers)").all() as { name: string }[];
  if (!computerColumns.some((column) => column.name === "specs")) {
    db.exec("ALTER TABLE computers ADD COLUMN specs TEXT;");
  }
  if (!computerColumns.some((column) => column.name === "status")) {
    db.exec("ALTER TABLE computers ADD COLUMN status TEXT NOT NULL DEFAULT 'available';");
  }

  const borrowColumns = db.prepare("PRAGMA table_info(computer_borrow_requests)").all() as { name: string }[];
  if (!borrowColumns.some((column) => column.name === "returned_at")) {
    db.exec("ALTER TABLE computer_borrow_requests ADD COLUMN returned_at TEXT;");
  }
}

export function getDb(): DatabaseSync {
  if (!globalForDb.sqliteDb) {
    globalForDb.sqliteDb = createConnection();
  }
  // re-checked on every call (cheap) so schema changes apply even to a connection
  // cached in globalThis from before this code was loaded (e.g. dev hot-reload)
  ensureSchema(globalForDb.sqliteDb);
  return globalForDb.sqliteDb;
}
