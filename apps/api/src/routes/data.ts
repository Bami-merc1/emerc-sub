import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { buyDataWithFallback } from "../services/vtu";

const router = Router();

const buySchema = z.object({
  network: z.enum(["MTN", "AIRTEL", "GLO", "NINE_MOBILE"]),
  phone: z.string().min(10),
  planId: z.string(),
  bundleLabel: z.string(),
  amount: z.number().positive(),
});

// POST /data/buy
router.post("/buy", requireAuth, async (req: AuthRequest, res) => {
  const parsed = buySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { network, phone, planId, bundleLabel, amount } = parsed.data;
  const userId = req.user!.userId;

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet || Number(wallet.balance) < amount) {
    return res.status(400).json({ error: "Insufficient wallet balance" });
  }

  const reference = `DATA-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

  // Deduct first, refund on failure — matches Implementation Plan's auto-refund pattern
  await prisma.$transaction([
    prisma.wallet.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    }),
    prisma.transaction.create({
      data: {
        userId,
        type: "DATA_PURCHASE",
        amount,
        status: "PENDING",
        reference,
      },
    }),
  ]);

  const order = await prisma.dataOrder.create({
    data: {
      userId,
      network,
      phone,
      bundle: bundleLabel,
      amount,
      status: "PENDING",
    },
  });

  const result = await buyDataWithFallback({ network, phone, planId });

  if (result.success) {
    await prisma.$transaction([
      prisma.transaction.update({
        where: { reference },
        data: { status: "SUCCESS" },
      }),
      prisma.dataOrder.update({
        where: { id: order.id },
        data: { status: "SUCCESS", vtuRef: result.providerRef },
      }),
    ]);
    return res.json({ success: true, reference, message: result.message, provider: result.providerUsed });
  }

  // Failure — refund the wallet automatically
  await prisma.$transaction([
    prisma.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
    }),
    prisma.transaction.update({
      where: { reference },
      data: { status: "FAILED" },
    }),
    prisma.dataOrder.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    }),
  ]);

  res.status(502).json({ success: false, error: result.message, reference });
});

export default router;