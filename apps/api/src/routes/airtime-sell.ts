import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { cheapDataHubProvider } from "../services/vtu/cheapdatahub";
import { airtimeExpiryQueue } from "../workers/queues";

const router = Router();

const rates: Record<string, number> = {
  MTN: 0.78,
  AIRTEL: 0.75,
  GLO: 0.73,
  NINE_MOBILE: 0.70,
};

const receivingNumbers: Record<string, string> = {
  MTN: "0803 456 7890",
  AIRTEL: "0802 345 6789",
  GLO: "0805 678 9012",
  NINE_MOBILE: "0809 012 3456",
};

const pinSellSchema = z.object({
  network: z.enum(["MTN", "AIRTEL", "GLO", "NINE_MOBILE"]),
  pin: z.string().min(10),
});

// POST /airtime/sell/pin
router.post("/sell/pin", requireAuth, async (req: AuthRequest, res) => {
  const parsed = pinSellSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { network, pin } = parsed.data;
  const userId = req.user!.userId;

  if (!cheapDataHubProvider.validatePin) {
    return res.status(500).json({ error: "PIN validation not available" });
  }

  const validation = await cheapDataHubProvider.validatePin({ network, pin });

  if (!validation.valid || !validation.denomination) {
    return res.status(400).json({ error: validation.message || "Invalid or already-used PIN" });
  }

  const faceValue = validation.denomination;
  const rate = rates[network];
  const cashValue = Math.round(faceValue * rate);

  const reference = `SELL-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;

  await prisma.$transaction([
    prisma.wallet.update({
      where: { userId },
      data: { balance: { increment: cashValue } },
    }),
    prisma.transaction.create({
      data: {
        userId,
        type: "AIRTIME_SELL",
        amount: cashValue,
        status: "SUCCESS",
        reference,
        meta: { network, faceValue, rate, method: "pin" },
      },
    }),
  ]);

  res.json({
    success: true,
    reference,
    faceValue,
    cashValue,
    rate,
    message: "PIN validated and wallet credited",
  });
});

const shareInitiateSchema = z.object({
  network: z.enum(["MTN", "AIRTEL", "GLO", "NINE_MOBILE"]),
  amount: z.number().min(100),
});

// POST /airtime/sell/initiate — share method
router.post("/sell/initiate", requireAuth, async (req: AuthRequest, res) => {
  const parsed = shareInitiateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { network, amount } = parsed.data;
  const userId = req.user!.userId;

  const rate = rates[network];
  const cashValue = Math.round(amount * rate);
  const referenceCode = `EM-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const order = await prisma.airtimeSellOrder.create({
    data: {
      userId,
      network,
      amount,
      cashValue,
      referenceCode,
      receivingNumber: receivingNumbers[network],
      status: "PENDING",
      expiresAt,
    },
  });

  await airtimeExpiryQueue.add(
    { orderId: order.id },
    { delay: 30 * 60 * 1000 }
  );

  res.status(201).json({
    orderId: order.id,
    referenceCode,
    receivingNumber: order.receivingNumber,
    cashValue,
    expiresAt,
  });
});

// GET /airtime/sell/orders/:id
router.get("/sell/orders/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const order = await prisma.airtimeSellOrder.findUnique({ where: { id } });

  if (!order || order.userId !== req.user!.userId) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json({ order });
});

// GET /airtime/rates
router.get("/rates", async (_req, res) => {
  res.json({ rates });
});

export default router;