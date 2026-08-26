import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";
import { getAuthFromRequest, toPublicUser } from "@/lib/auth";
import type { UserRow } from "@/types/user";

interface ProfileBody {
  full_name?: string;
  mssv?: string;
  class?: string;
  gender?: string;
  phone?: string;
  email?: string;
  avatar_url?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", "PUT");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const auth = getAuthFromRequest(req);
  if (!auth) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  const { full_name, mssv, class: className, gender, phone, email, avatar_url } =
    req.body as ProfileBody;

  const db = getDb();
  await db.prepare(
    `UPDATE users
     SET full_name = ?, mssv = ?, class = ?, gender = ?, phone = ?, email = ?, avatar_url = ?, profile_completed = 1
     WHERE id = ?`,
  ).run(
    full_name ?? null,
    mssv ?? null,
    className ?? null,
    gender ?? null,
    phone ?? null,
    email ?? null,
    avatar_url ?? null,
    auth.sub,
  );

  const user = (await db.prepare("SELECT * FROM users WHERE id = ?").get(auth.sub)) as unknown as UserRow;
  return res.status(200).json({ user: toPublicUser(user) });
}
