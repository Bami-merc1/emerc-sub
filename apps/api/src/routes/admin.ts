import { Router } from "express";
import { prisma } from "../utils/prisma";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth, requireAdmin);

// GET /admin/stats
router.get("/stats", async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalUsers, ordersToday, revenueToday, successCount, totalCount] = await Promise.all([
    prisma.user.count(),
    prisma.transaction.count({ where: { createdAt: { gte: today } } }),
    prisma.transaction.aggregate({
      where: { createdAt: { gte: today }, status: "SUCCESS", type: { not: "WALLET_FUNDING" } },
      _sum: { amount: true },
    }),
    prisma.transaction.count({ where: { status: "SUCCESS" } }),
    prisma.transaction.count(),
  ]);

  const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : "0.0";

  res.json({
    totalUsers,
    ordersToday,
    revenueToday: revenueToday._sum.amount || 0,
    successRate,
  });
});

// GET /admin/activity — recent transactions across all users
router.get("/activity", async (_req, res) => {
  const activity = await prisma.transaction.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } },
  });
  res.json({ activity });
});

// GET /admin/users
router.get("/users", async (req, res) => {
  const search = (req.query.search as string) || "";

  const users = await prisma.user.findMany({
    where: search
      ? { email: { contains: search, mode: "insensitive" } }
      : undefined,
    include: { wallet: true },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      isVerified: u.isVerified,
      createdAt: u.createdAt,
      balance: u.wallet?.balance || 0,
    })),
  });
});

// PUT /admin/users/:id/suspend
router.put("/users/:id/suspend", async (req, res) => {
  const id = req.params.id as string;
  const wallet = await prisma.wallet.findUnique({ where: { userId: id } });
  if (!wallet) return res.status(404).json({ error: "User wallet not found" });

  const updated = await prisma.wallet.update({
    where: { userId: id },
    data: { isActive: !wallet.isActive },
  });

  res.json({ isActive: updated.isActive });
});

// GET /admin/transactions
router.get("/transactions", async (req, res) => {
  const status = req.query.status as string;

  const transactions = await prisma.transaction.findMany({
    where: status && status !== "All" ? { status: status.toUpperCase() as any } : undefined,
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.json({ transactions });
});

// GET /admin/disputes
router.get("/disputes", async (_req, res) => {
  const disputes = await prisma.marketOrder.findMany({
    where: { status: "DISPUTED" },
    include: {
      buyer: { select: { email: true } },
      seller: { select: { email: true } },
      listing: true,
      escrow: true,
    },
    orderBy: { updatedAt: "desc" },
  });
  res.json({ disputes });
});

// POST /admin/disputes/:id/resolve
router.post("/disputes/:id/resolve", async (req, res) => {
  const id = req.params.id as string;
  const { action } = req.body; // "release" | "refund"

  const order = await prisma.marketOrder.findUnique({ where: { id } });
  if (!order || order.status !== "DISPUTED") {
    return res.status(404).json({ error: "Dispute not found" });
  }

  if (action === "release") {
    const commission = Number(order.amount) * 0.025;
    const sellerPayout = Number(order.amount) - commission;

    await prisma.$transaction([
      prisma.marketOrder.update({ where: { id }, data: { status: "CONFIRMED", confirmedAt: new Date() } }),
      prisma.escrowLedger.update({ where: { orderId: id }, data: { status: "RELEASED", releasedAt: new Date() } }),
      prisma.wallet.update({ where: { userId: order.sellerId }, data: { balance: { increment: sellerPayout } } }),
    ]);
  } else if (action === "refund") {
    await prisma.$transaction([
      prisma.marketOrder.update({ where: { id }, data: { status: "REFUNDED" } }),
      prisma.escrowLedger.update({ where: { orderId: id }, data: { status: "REFUNDED", releasedAt: new Date() } }),
      prisma.wallet.update({ where: { userId: order.buyerId }, data: { balance: { increment: order.amount } } }),
    ]);
  } else {
    return res.status(400).json({ error: "Invalid action" });
  }

  res.json({ success: true });
});

export default router;