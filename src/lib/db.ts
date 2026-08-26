import { supabaseAdmin } from "@/lib/supabase";

type DbRow = Record<string, unknown>;

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "boolean") return value ? 1 : 0;
  return 0;
}

function normalizeRow(row: DbRow | null | undefined): DbRow | null {
  if (!row) return null;

  const nextRow = { ...row };

  if (Object.prototype.hasOwnProperty.call(nextRow, "id")) {
    nextRow.id = toNumber(nextRow.id);
  }

  if (Object.prototype.hasOwnProperty.call(nextRow, "computer_id")) {
    nextRow.computer_id = toNumber(nextRow.computer_id);
  }

  if (Object.prototype.hasOwnProperty.call(nextRow, "borrower_id")) {
    nextRow.borrower_id = toNumber(nextRow.borrower_id);
  }

  if (Object.prototype.hasOwnProperty.call(nextRow, "approved_by")) {
    nextRow.approved_by = nextRow.approved_by == null ? null : toNumber(nextRow.approved_by);
  }

  if (Object.prototype.hasOwnProperty.call(nextRow, "is_admin")) {
    nextRow.is_admin = nextRow.is_admin === true ? 1 : nextRow.is_admin === false ? 0 : toNumber(nextRow.is_admin);
  }

  if (Object.prototype.hasOwnProperty.call(nextRow, "profile_completed")) {
    nextRow.profile_completed = nextRow.profile_completed === true ? 1 : nextRow.profile_completed === false ? 0 : toNumber(nextRow.profile_completed);
  }

  return nextRow;
}

function normalizeRows(rows: DbRow[] | null | undefined): DbRow[] {
  return (rows ?? []).map((row) => normalizeRow(row) as DbRow);
}

function ensureClient() {
  if (!supabaseAdmin) {
    throw new Error("Supabase chưa được cấu hình. Vui lòng cập nhật NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return supabaseAdmin;
}

function parseSql(sql: string): string {
  return sql.replace(/\s+/g, " ").trim();
}

class PreparedStatement {
  constructor(private readonly sql: string) {}

  private async selectOne(table: string, query: any, select: string = "*") {
    const { data, error } = await query.select(select).maybeSingle();
    if (error) throw error;
    return normalizeRow(data as DbRow | null);
  }

  private async selectAll(table: string, query: any, select: string = "*") {
    const { data, error } = await query.select(select);
    if (error) throw error;
    return normalizeRows((data ?? []) as DbRow[]);
  }

  async get(...params: unknown[]) {
    const sql = parseSql(this.sql);
    const client = ensureClient();

    if (sql.startsWith("SELECT * FROM users WHERE id = ?")) {
      const { data, error } = await client.from("users").select("*").eq("id", Number(params[0])).maybeSingle();
      if (error) throw error;
      return normalizeRow(data as DbRow | null);
    }

    if (sql.startsWith("SELECT * FROM users WHERE username = ?")) {
      const { data, error } = await client.from("users").select("*").eq("username", String(params[0])).maybeSingle();
      if (error) throw error;
      return normalizeRow(data as DbRow | null);
    }

    if (sql.startsWith("SELECT id FROM users WHERE username = ?")) {
      const { data, error } = await client.from("users").select("id").eq("username", String(params[0])).maybeSingle();
      if (error) throw error;
      return normalizeRow(data as DbRow | null);
    }

    if (sql.startsWith("SELECT is_admin FROM users WHERE id = ?")) {
      const { data, error } = await client.from("users").select("is_admin").eq("id", Number(params[0])).maybeSingle();
      if (error) throw error;
      return normalizeRow(data as DbRow | null);
    }

    if (sql.startsWith("SELECT COUNT(*) AS total FROM users")) {
      const { count, error } = await client.from("users").select("id", { count: "exact", head: true });
      if (error) throw error;
      return { total: count ?? 0 };
    }

    if (sql.startsWith("SELECT * FROM computers ORDER BY id DESC")) {
      return (await this.selectAll("computers", client.from("computers").select("*").order("id", { ascending: false })))[0] ?? null;
    }

    if (sql.startsWith("SELECT * FROM computers WHERE id = ?")) {
      const { data, error } = await client.from("computers").select("*").eq("id", Number(params[0])).maybeSingle();
      if (error) throw error;
      return normalizeRow(data as DbRow | null);
    }

    if (sql.startsWith("SELECT id FROM computers WHERE LOWER(TRIM(name)) = ?")) {
      const { data, error } = await client.from("computers").select("id").ilike("name", String(params[0])).maybeSingle();
      if (error) throw error;
      return normalizeRow(data as DbRow | null);
    }

    if (sql.startsWith("SELECT id FROM computers WHERE id != ? AND LOWER(TRIM(name)) = ?")) {
      const { data, error } = await client
        .from("computers")
        .select("id")
        .neq("id", Number(params[0]))
        .ilike("name", String(params[1]))
        .maybeSingle();
      if (error) throw error;
      return normalizeRow(data as DbRow | null);
    }

    if (sql.startsWith("SELECT * FROM computer_borrow_requests WHERE id = ?")) {
      const { data, error } = await client.from("computer_borrow_requests").select("*").eq("id", Number(params[0])).maybeSingle();
      if (error) throw error;
      return normalizeRow(data as DbRow | null);
    }

    if (sql.startsWith("SELECT id FROM computer_borrow_requests WHERE computer_id = ? AND status = 'pending'")) {
      const { data, error } = await client
        .from("computer_borrow_requests")
        .select("id")
        .eq("computer_id", Number(params[0]))
        .eq("status", "pending")
        .maybeSingle();
      if (error) throw error;
      return normalizeRow(data as DbRow | null);
    }

    if (sql.startsWith("SELECT COUNT(*) AS total FROM computers")) {
      const { count, error } = await client.from("computers").select("id", { count: "exact", head: true });
      if (error) throw error;
      return { total: count ?? 0 };
    }

    if (sql.startsWith("SELECT COUNT(*) AS total FROM computers WHERE status = 'available'")) {
      const { count, error } = await client.from("computers").select("id", { count: "exact", head: true }).eq("status", "available");
      if (error) throw error;
      return { total: count ?? 0 };
    }

    if (sql.startsWith("SELECT COUNT(*) AS total FROM computers WHERE status = 'in_use'")) {
      const { count, error } = await client.from("computers").select("id", { count: "exact", head: true }).eq("status", "in_use");
      if (error) throw error;
      return { total: count ?? 0 };
    }

    if (sql.startsWith("SELECT COUNT(*) AS total FROM computers WHERE status = 'maintenance'")) {
      const { count, error } = await client.from("computers").select("id", { count: "exact", head: true }).eq("status", "maintenance");
      if (error) throw error;
      return { total: count ?? 0 };
    }

    throw new Error(`Unsupported SQL query in Supabase adapter: ${this.sql}`);
  }

  async all(...params: unknown[]) {
    const sql = parseSql(this.sql);
    const client = ensureClient();

    if (sql.startsWith("SELECT * FROM computers ORDER BY id DESC")) {
      const { data, error } = await client.from("computers").select("*").order("id", { ascending: false });
      if (error) throw error;
      return normalizeRows((data ?? []) as DbRow[]);
    }

    if (sql.startsWith("SELECT * FROM computers WHERE status = 'available'")) {
      const { data, error } = await client.from("computers").select("*").eq("status", "available");
      if (error) throw error;
      return normalizeRows((data ?? []) as DbRow[]);
    }

    if (sql.startsWith("SELECT r.*, u.username AS borrower_username, u.full_name AS borrower_full_name, c.name AS computer_name, c.room AS computer_room, c.status AS computer_status FROM computer_borrow_requests r LEFT JOIN users u ON u.id = r.borrower_id LEFT JOIN computers c ON c.id = r.computer_id WHERE r.borrower_id = ? ORDER BY r.requested_at DESC")) {
      const { data, error } = await client
        .from("computer_borrow_requests")
        .select("*, users!borrower_id(username, full_name), computers!computer_id(name, room, status)")
        .eq("borrower_id", Number(params[0]))
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        ...row,
        borrower_username: row.users?.username ?? null,
        borrower_full_name: row.users?.full_name ?? null,
        computer_name: row.computers?.name ?? null,
        computer_room: row.computers?.room ?? null,
        computer_status: row.computers?.status ?? null,
        users: undefined,
        computers: undefined,
      }));
    }

    if (sql.startsWith("SELECT r.*, u.username AS borrower_username, u.full_name AS borrower_full_name, c.name AS computer_name, c.room AS computer_room, c.status AS computer_status FROM computer_borrow_requests r LEFT JOIN users u ON u.id = r.borrower_id LEFT JOIN computers c ON c.id = r.computer_id ORDER BY r.requested_at DESC")) {
      const { data, error } = await client
        .from("computer_borrow_requests")
        .select("*, users!borrower_id(username, full_name), computers!computer_id(name, room, status)")
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        ...row,
        borrower_username: row.users?.username ?? null,
        borrower_full_name: row.users?.full_name ?? null,
        computer_name: row.computers?.name ?? null,
        computer_room: row.computers?.room ?? null,
        computer_status: row.computers?.status ?? null,
        users: undefined,
        computers: undefined,
      }));
    }

    if (sql.startsWith("SELECT * FROM users WHERE id = ?")) {
      const { data, error } = await client.from("users").select("*").eq("id", Number(params[0]));
      if (error) throw error;
      return normalizeRows((data ?? []) as DbRow[]);
    }

    if (sql.startsWith("SELECT * FROM users WHERE username = ?")) {
      const { data, error } = await client.from("users").select("*").eq("username", String(params[0]));
      if (error) throw error;
      return normalizeRows((data ?? []) as DbRow[]);
    }

    if (sql.startsWith("SELECT * FROM computers WHERE LOWER(TRIM(name)) = ?")) {
      const { data, error } = await client.from("computers").select("*").ilike("name", String(params[0]));
      if (error) throw error;
      return normalizeRows((data ?? []) as DbRow[]);
    }

    throw new Error(`Unsupported SQL select list in Supabase adapter: ${this.sql}`);
  }

  async run(...params: unknown[]) {
    const sql = parseSql(this.sql);
    const client = ensureClient();

    if (sql.startsWith("INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)")) {
      const [username, passwordHash, isAdmin] = params;
      const { data, error } = await client
        .from("users")
        .insert([{ username: String(username), password_hash: String(passwordHash), is_admin: Boolean(isAdmin) }])
        .select("id")
        .single();
      if (error) throw error;
      return { lastInsertRowid: Number(data?.id ?? 0) };
    }

    if (sql.startsWith("INSERT INTO computers (name, room, specs, status) VALUES (?, ?, ?, ?)")) {
      const [name, room, specs, status] = params;
      const { data, error } = await client
        .from("computers")
        .insert([{ name: String(name), room: String(room), specs: specs ?? null, status: String(status) }])
        .select("id")
        .single();
      if (error) throw error;
      return { lastInsertRowid: Number(data?.id ?? 0) };
    }

    if (sql.startsWith("INSERT INTO computer_borrow_requests (computer_id, borrower_id, reason, status) VALUES (?, ?, ?, 'pending')")) {
      const [computerId, borrowerId, reason] = params;
      const { error } = await client.from("computer_borrow_requests").insert([
        { computer_id: Number(computerId), borrower_id: Number(borrowerId), reason: reason ?? null, status: "pending" },
      ]);
      if (error) throw error;
      return { lastInsertRowid: 0 };
    }

    if (sql.startsWith("UPDATE users SET password_hash = ? WHERE id = ?")) {
      const [passwordHash, userId] = params;
      const { error } = await client.from("users").update({ password_hash: String(passwordHash) }).eq("id", Number(userId));
      if (error) throw error;
      return { changes: 1 };
    }

    if (sql.startsWith("UPDATE users SET full_name = ?, mssv = ?, class = ?, gender = ?, phone = ?, email = ?, avatar_url = ?, profile_completed = 1 WHERE id = ?")) {
      const [fullName, mssv, className, gender, phone, email, avatarUrl, userId] = params;
      const { error } = await client
        .from("users")
        .update({
          full_name: fullName ?? null,
          mssv: mssv ?? null,
          class: className ?? null,
          gender: gender ?? null,
          phone: phone ?? null,
          email: email ?? null,
          avatar_url: avatarUrl ?? null,
          profile_completed: true,
        })
        .eq("id", Number(userId));
      if (error) throw error;
      return { changes: 1 };
    }

    if (sql.startsWith("UPDATE computer_borrow_requests SET status = 'approved', approved_by = ?, approved_at = ? WHERE id = ?")) {
      const [approvedBy, approvedAt, requestId] = params;
      const { error } = await client
        .from("computer_borrow_requests")
        .update({ status: "approved", approved_by: Number(approvedBy), approved_at: String(approvedAt) })
        .eq("id", Number(requestId));
      if (error) throw error;
      return { changes: 1 };
    }

    if (sql.startsWith("UPDATE computer_borrow_requests SET status = 'rejected' WHERE id = ?")) {
      const [requestId] = params;
      const { error } = await client.from("computer_borrow_requests").update({ status: "rejected" }).eq("id", Number(requestId));
      if (error) throw error;
      return { changes: 1 };
    }

    if (sql.startsWith("UPDATE computer_borrow_requests SET status = 'returned', returned_at = ? WHERE id = ?")) {
      const [returnedAt, requestId] = params;
      const { error } = await client
        .from("computer_borrow_requests")
        .update({ status: "returned", returned_at: String(returnedAt) })
        .eq("id", Number(requestId));
      if (error) throw error;
      return { changes: 1 };
    }

    if (sql.startsWith("UPDATE computers SET status = 'in_use' WHERE id = ?")) {
      const [computerId] = params;
      const { error } = await client.from("computers").update({ status: "in_use" }).eq("id", Number(computerId));
      if (error) throw error;
      return { changes: 1 };
    }

    if (sql.startsWith("UPDATE computers SET status = 'available' WHERE id = ?")) {
      const [computerId] = params;
      const { error } = await client.from("computers").update({ status: "available" }).eq("id", Number(computerId));
      if (error) throw error;
      return { changes: 1 };
    }

    if (sql.startsWith("UPDATE computers SET name = ?, room = ?, specs = ?, status = ? WHERE id = ?")) {
      const [name, room, specs, status, computerId] = params;
      const { error } = await client
        .from("computers")
        .update({ name: String(name), room: String(room), specs: specs == null ? null : String(specs), status: String(status) })
        .eq("id", Number(computerId));
      if (error) throw error;
      return { changes: 1 };
    }

    if (sql.startsWith("DELETE FROM computers WHERE id = ?")) {
      const [computerId] = params;
      const { error } = await client.from("computers").delete().eq("id", Number(computerId));
      if (error) throw error;
      return { changes: 1 };
    }

    throw new Error(`Unsupported SQL update/delete in Supabase adapter: ${this.sql}`);
  }

  async exec() {
    return undefined;
  }
}

export function getDb() {
  return {
    prepare(sql: string) {
      return new PreparedStatement(sql);
    },
    exec(sql: string) {
      return new PreparedStatement(sql).exec();
    },
  };
}
