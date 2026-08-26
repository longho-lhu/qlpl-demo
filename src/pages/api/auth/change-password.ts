import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";
import { getAuthFromRequest, hashPassword, verifyPassword } from "@/lib/auth";
import type { UserRow } from "@/types/user";

interface ChangePasswordBody {
  current_password?: string;
  new_password?: string;
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

  const { current_password, new_password } = req.body as ChangePasswordBody;
  if (!current_password || !new_password || new_password.length < 2) {
    return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 2 ký tự" });
  }

  const db = getDb();
  const user = (await db.prepare("SELECT * FROM users WHERE id = ?").get(auth.sub)) as unknown as
    | UserRow
    | undefined;

  if (!user || !verifyPassword(current_password, user.password_hash)) {
    return res.status(401).json({ message: "Mật khẩu hiện tại không đúng" });
  }

  await db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    hashPassword(new_password),
    auth.sub,
  );

  return res.status(200).json({ message: "Đổi mật khẩu thành công" });
}
