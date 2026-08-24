import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";

interface ComputerBody {
  name?: string;
  room?: string;
  specs?: string;
  status?: "available" | "in_use" | "maintenance";
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return res.status(401).json({ message: "Vui lòng đăng nhập" });
  }

  const db = getDb();
  const user = db
    .prepare("SELECT is_admin FROM users WHERE id = ?")
    .get(auth.sub) as { is_admin: number } | undefined;

  if (!user || !user.is_admin) {
    return res.status(403).json({ message: "Chỉ quản trị viên mới được quản lý máy tính" });
  }

  const id = Number(req.query.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: "ID máy không hợp lệ" });
  }

  const existing = db.prepare("SELECT * FROM computers WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!existing) {
    return res.status(404).json({ message: "Không tìm thấy máy tính" });
  }

  if (req.method === "PUT") {
    const { name, room, specs, status } = req.body as ComputerBody;
    const trimmedName = (name?.trim() || String(existing.name ?? "")).trim();
    const trimmedRoom = room?.trim() || String(existing.room ?? "");
    const validStatus = status === "in_use" || status === "maintenance" || status === "available" ? status : String(existing.status ?? "available");

    const normalizedName = trimmedName.toLowerCase();
    const duplicate = db
      .prepare("SELECT id FROM computers WHERE id != ? AND LOWER(TRIM(name)) = ?")
      .get(id, normalizedName) as { id: number } | undefined;

    if (duplicate) {
      return res.status(409).json({ message: "Tên máy đã tồn tại, vui lòng chọn tên khác" });
    }

    db.prepare(
      "UPDATE computers SET name = ?, room = ?, specs = ?, status = ? WHERE id = ?",
    ).run(trimmedName, trimmedRoom, specs?.trim() ?? String(existing.specs ?? ""), validStatus, id);

    const updated = db.prepare("SELECT * FROM computers WHERE id = ?").get(id);
    return res.status(200).json({ computer: updated });
  }

  if (req.method === "DELETE") {
    db.prepare("DELETE FROM computers WHERE id = ?").run(id);
    return res.status(200).json({ message: "Xoá máy tính thành công" });
  }

  res.setHeader("Allow", "PUT, DELETE");
  return res.status(405).json({ message: "Method not allowed" });
}
