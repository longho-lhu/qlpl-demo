import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";

type Action = "approve" | "reject" | "return";

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
    return res.status(403).json({ message: "Chỉ quản trị viên mới được xử lý yêu cầu" });
  }

  const requestId = Number(req.query.id);
  if (!Number.isFinite(requestId)) {
    return res.status(400).json({ message: "ID yêu cầu không hợp lệ" });
  }

  const request = db
    .prepare("SELECT * FROM computer_borrow_requests WHERE id = ?")
    .get(requestId) as { id: number; computer_id: number; status: string } | undefined;

  if (!request) {
    return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
  }

  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { action } = req.body as { action?: Action };
  const now = new Date().toISOString();

  if (action === "approve") {
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Yêu cầu này không còn ở trạng thái chờ duyệt" });
    }

    db.prepare(
      "UPDATE computer_borrow_requests SET status = 'approved', approved_by = ?, approved_at = ? WHERE id = ?",
    ).run(auth.sub, now, requestId);
    db.prepare("UPDATE computers SET status = 'in_use' WHERE id = ?").run(request.computer_id);

    return res.status(200).json({ message: "Đã duyệt yêu cầu mượn máy" });
  }

  if (action === "reject") {
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Chỉ có thể từ chối yêu cầu đang chờ duyệt" });
    }

    db.prepare("UPDATE computer_borrow_requests SET status = 'rejected' WHERE id = ?").run(requestId);
    return res.status(200).json({ message: "Đã từ chối yêu cầu mượn máy" });
  }

  if (action === "return") {
    if (request.status !== "approved") {
      return res.status(400).json({ message: "Chỉ máy đang được mượn mới có thể xác nhận trả" });
    }

    db.prepare(
      "UPDATE computer_borrow_requests SET status = 'returned', returned_at = ? WHERE id = ?",
    ).run(now, requestId);
    db.prepare("UPDATE computers SET status = 'available' WHERE id = ?").run(request.computer_id);

    return res.status(200).json({ message: "Xác nhận máy đã được trả về" });
  }

  return res.status(400).json({ message: "Hành động không hợp lệ" });
}
