import type { NextApiRequest, NextApiResponse } from "next";
import { AUTH_COOKIE_NAME, serializeCookie } from "@/lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  res.setHeader(
    "Set-Cookie",
    serializeCookie(AUTH_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 }),
  );
  return res.status(200).json({ message: "Đã đăng xuất" });
}
