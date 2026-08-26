import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";

interface ComputerBody {
  name?: string;
  room?: string;
  specs?: string;
  status?: "available" | "in_use" | "maintenance";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return res.status(401).json({ message: "Vui lòng đăng nhập" });
  }

  const db = getDb();
  const user = (await db
    .prepare("SELECT is_admin FROM users WHERE id = ?")
    .get(auth.sub)) as { is_admin: number } | undefined;

  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy người dùng" });
  }

  if (req.method === "GET") {
    const computers = await db.prepare("SELECT * FROM computers ORDER BY id DESC").all();
    return res.status(200).json({ computers });
  }

  if (req.method === "POST") {
    if (!user.is_admin) {
      return res.status(403).json({ message: "Chỉ quản trị viên mới được quản lý máy tính" });
    }

    const { name, room, specs, status } = req.body as ComputerBody;
    const trimmedName = name?.trim();
    const trimmedRoom = room?.trim();

    if (!trimmedName || !trimmedRoom) {
      return res.status(400).json({ message: "Tên máy và phòng không được để trống" });
    }

    const normalizedName = trimmedName.toLowerCase();
    const duplicate = (await db
      .prepare("SELECT id FROM computers WHERE LOWER(TRIM(name)) = ?")
      .get(normalizedName)) as { id: number } | undefined;

    if (duplicate) {
      return res.status(409).json({ message: "Tên máy đã tồn tại, vui lòng chọn tên khác" });
    }

    const validStatus = status === "in_use" || status === "maintenance" ? status : "available";
    const result = await db
      .prepare(
        "INSERT INTO computers (name, room, specs, status) VALUES (?, ?, ?, ?)",
      )
      .run(trimmedName, trimmedRoom, specs?.trim() || null, validStatus);

    const computer = (await db
      .prepare("SELECT * FROM computers WHERE id = ?")
      .get(Number(result.lastInsertRowid ?? 0))) as Record<string, unknown> | undefined;

    return res.status(201).json({ computer });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ message: "Method not allowed" });
}
