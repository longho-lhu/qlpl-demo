import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import type { UserRow } from "@/types/user";

interface RegisterBody {
  username?: string;
  password?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body as RegisterBody;
  const trimmedUsername = username?.trim() ?? "";

  if (!trimmedUsername) {
    return res.status(400).json({ message: "Tên đăng nhập không được để trống" });
  }
  if (!password || password.length < 2) {
    return res.status(400).json({ message: "Mật khẩu phải có ít nhất 2 ký tự" });
  }

  const db = getDb();
  const existing = (await db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(trimmedUsername)) as Pick<UserRow, "id"> | undefined;

  if (existing) {
    return res.status(409).json({ message: "Tên đăng nhập đã tồn tại" });
  }

  const passwordHash = hashPassword(password);
  const totalUsers = (await db.prepare("SELECT COUNT(*) AS total FROM users").get()) as { total: number };
  const isAdmin = totalUsers.total === 0 ? 1 : 0;

  const result = await db
    .prepare("INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)")
    .run(trimmedUsername, passwordHash, isAdmin);

  return res.status(201).json({
    id: Number(result.lastInsertRowid ?? 0),
    username: trimmedUsername,
    is_admin: isAdmin,
  });
}
