import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { initiateTransfer } from "../services/paystack";

const router = Router();

const withdrawSchema = z.object({
  amount: z.number().min(500),
  bankAccountId: z.string(),
});

// POST /withdraw
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = withdrawSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { amount, bankAccountId } = parsed.data;
  const userId = req.user!.userId;

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet || Number(wallet.balance) < amount) {
    return res.status(400).json({ error: "Insufficient wallet balance" });
  }

  const bankAccount = await prisma.bankAccount.findUnique({ where: { id: bankAccountId } });
  if (!bankAccount || bankAccount.userId !== userId || !bankAccount.recipientCode) {
    return res.status(400).json({ error: "Invalid bank account" });
  }

  const reference = `WD-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

  await prisma.$transaction([
    prisma.wallet.update({ where: { userId }, data: { balance: { decrement: amount } } }),
    prisma.withdrawalRequest.create({
      data: { userId, amount, bankAccountId, status: "PENDING", reference },
    }),
    prisma.transaction.create({
      data: { userId, type: "WITHDRAWAL", amount, status: "PENDING", reference },
    }),
  ]);

  try {
    await initiateTransfer({
      amountKobo: Math.round(amount * 100),
      recipientCode: bankAccount.recipientCode,
      reference,
      reason: "EmercSub wallet withdrawal",
    });

    await prisma.$transaction([
      prisma.withdrawalRequest.update({ where: { reference }, data: { status: "SUCCESS", processedAt: new Date() } }),
      prisma.transaction.update({ where: { reference }, data: { status: "SUCCESS" } }),
    ]);

    return res.json({ success: true, reference });
  } catch (err: any) {
    // Refund on failure
    await prisma.$transaction([
      prisma.wallet.update({ where: { userId }, data: { balance: { increment: amount } } }),
      prisma.withdrawalRequest.update({ where: { reference }, data: { status: "FAILED" } }),
      prisma.transaction.update({ where: { reference }, data: { status: "FAILED" } }),
    ]);

    return res.status(502).json({
      error: err.response?.data?.message || "Withdrawal failed, wallet refunded",
    });
  }
});

export default router;