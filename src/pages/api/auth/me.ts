import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";
import { getAuthFromRequest, toPublicUser } from "@/lib/auth";
import type { UserRow } from "@/types/user";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const auth = getAuthFromRequest(req);
  if (!auth) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  const db = getDb();
  const user = (await db.prepare("SELECT * FROM users WHERE id = ?").get(auth.sub)) as unknown as
    | UserRow
    | undefined;

  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy người dùng" });
  }

  return res.status(200).json({ user: toPublicUser(user) });
}
