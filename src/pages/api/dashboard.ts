import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const auth = getAuthFromRequest(req);
  if (!auth) {
    return res.status(401).json({ message: "Vui lòng đăng nhập" });
  }

  const db = getDb();

  const userCount = (await db.prepare("SELECT COUNT(*) AS total FROM users").get()) as { total: number };
  const totalComputers = (await db.prepare("SELECT COUNT(*) AS total FROM computers").get()) as { total: number };
  const availableComputers = (await db.prepare("SELECT COUNT(*) AS total FROM computers WHERE status = 'available'").get()) as { total: number };
  const inUseComputers = (await db.prepare("SELECT COUNT(*) AS total FROM computers WHERE status = 'in_use'").get()) as { total: number };
  const maintenanceComputers = (await db.prepare("SELECT COUNT(*) AS total FROM computers WHERE status = 'maintenance'").get()) as { total: number };

  const usageRows = (await db
    .prepare(`
      SELECT c.id, c.name, c.room,
             COALESCE(SUM((strftime('%s', r.returned_at) - strftime('%s', r.approved_at))) / 3600.0, 0) AS hours
      FROM computers c
      LEFT JOIN computer_borrow_requests r
        ON r.computer_id = c.id AND r.status IN ('returned', 'approved')
      GROUP BY c.id, c.name, c.room
      ORDER BY hours DESC
    `)
    .all()) as Array<{ id: number; name: string; room: string; hours: number | string }>;

  const totalUsageHours = usageRows.reduce((sum, item) => sum + Number(item.hours || 0), 0);

  return res.status(200).json({
    users: userCount.total,
    computers: {
      total: totalComputers.total,
      available: availableComputers.total,
      in_use: inUseComputers.total,
      maintenance: maintenanceComputers.total,
    },
    usageByComputer: usageRows.map((item) => ({
      id: item.id,
      name: item.name,
      room: item.room,
      hours: Number(item.hours || 0),
    })),
    totalUsageHours,
  });
}
