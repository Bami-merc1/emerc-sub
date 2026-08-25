import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { buyAirtimeWithFallback } from "../services/vtu";

const router = Router();

const buySchema = z.object({
  network: z.enum(["MTN", "AIRTEL", "GLO", "NINE_MOBILE"]),
  phone: z.string().min(10),
  amount: z.number().positive().min(50),
});

// POST /airtime/buy
router.post("/buy", requireAuth, async (req: AuthRequest, res) => {
  const parsed = buySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { network, phone, amount } = parsed.data;
  const userId = req.user!.userId;

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet || Number(wallet.balance) < amount) {
    return res.status(400).json({ error: "Insufficient wallet balance" });
  }

  const reference = `AIR-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

  await prisma.$transaction([
    prisma.wallet.update({
      where: { userId },
      data: { balance: { decrement: amount } },
    }),
    prisma.transaction.create({
      data: {
        userId,
        type: "AIRTIME_PURCHASE",
        amount,
        status: "PENDING",
        reference,
      },
    }),
  ]);

  const result = await buyAirtimeWithFallback({ network, phone, amount });

  if (result.success) {
    await prisma.transaction.update({
      where: { reference },
      data: { status: "SUCCESS" },
    });
    return res.json({ success: true, reference, message: result.message, provider: result.providerUsed });
  }

  // Failure — auto-refund
  await prisma.$transaction([
    prisma.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
    }),
    prisma.transaction.update({
      where: { reference },
      data: { status: "FAILED" },
    }),
  ]);

  res.status(502).json({ success: false, error: result.message, reference });
});

export default router;