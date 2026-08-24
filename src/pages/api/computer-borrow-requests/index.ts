import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";

interface BorrowRequestBody {
  computer_id?: number;
  reason?: string;
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

  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy người dùng" });
  }

  if (req.method === "GET") {
    const rows = user.is_admin
      ? db
          .prepare(`
            SELECT r.*, u.username AS borrower_username, u.full_name AS borrower_full_name,
                   c.name AS computer_name, c.room AS computer_room, c.status AS computer_status
            FROM computer_borrow_requests r
            LEFT JOIN users u ON u.id = r.borrower_id
            LEFT JOIN computers c ON c.id = r.computer_id
            ORDER BY r.requested_at DESC
          `)
          .all()
      : db
          .prepare(`
            SELECT r.*, u.username AS borrower_username, u.full_name AS borrower_full_name,
                   c.name AS computer_name, c.room AS computer_room, c.status AS computer_status
            FROM computer_borrow_requests r
            LEFT JOIN users u ON u.id = r.borrower_id
            LEFT JOIN computers c ON c.id = r.computer_id
            WHERE r.borrower_id = ?
            ORDER BY r.requested_at DESC
          `)
          .all(auth.sub);

    return res.status(200).json({ requests: rows });
  }

  if (req.method === "POST") {
    const { computer_id, reason } = req.body as BorrowRequestBody;
    const computerId = Number(computer_id);
    if (!Number.isFinite(computerId)) {
      return res.status(400).json({ message: "Máy không hợp lệ" });
    }

    const computer = db
      .prepare("SELECT * FROM computers WHERE id = ?")
      .get(computerId) as { id: number; status: string } | undefined;

    if (!computer) {
      return res.status(404).json({ message: "Không tìm thấy máy tính" });
    }

    const pendingRequest = db
      .prepare("SELECT id FROM computer_borrow_requests WHERE computer_id = ? AND status = 'pending'")
      .get(computerId) as { id: number } | undefined;

    if (pendingRequest) {
      return res.status(409).json({ message: "Máy này đang có yêu cầu chờ duyệt" });
    }

    if (computer.status !== "available") {
      return res.status(409).json({ message: "Máy hiện không còn trống để mượn" });
    }

    const trimmedReason = reason?.trim();
    db.prepare(
      "INSERT INTO computer_borrow_requests (computer_id, borrower_id, reason, status) VALUES (?, ?, ?, 'pending')",
    ).run(computerId, auth.sub, trimmedReason || null);

    return res.status(201).json({ message: "Yêu cầu mượn máy đã được gửi" });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ message: "Method not allowed" });
}
