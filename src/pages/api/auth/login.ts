import type { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";
import {
  AUTH_COOKIE_NAME,
  serializeCookie,
  signToken,
  toPublicUser,
  verifyPassword,
} from "@/lib/auth";
import type { UserRow } from "@/types/user";

interface LoginBody {
  username?: string;
  password?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body as LoginBody;
  if (!username || !password) {
    return res.status(400).json({ message: "Vui lòng nhập tên đăng nhập và mật khẩu" });
  }

  const db = getDb();
  const user = (await db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username.trim())) as unknown as UserRow | undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
  }

  const token = signToken({ sub: user.id, username: user.username });
  res.setHeader(
    "Set-Cookie",
    serializeCookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    }),
  );

  return res.status(200).json({ user: toPublicUser(user), token });
}
