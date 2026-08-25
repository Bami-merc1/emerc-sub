import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { initializeTransaction, verifyTransaction } from "../services/paystack";

const router = Router();

// GET /wallet
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId: req.user!.userId },
  });

  if (!wallet) {
    return res.status(404).json({ error: "Wallet not found" });
  }

  res.json({
    balance: wallet.balance,
    currency: wallet.currency,
    isActive: wallet.isActive,
  });
});

// GET /wallet/transactions
router.get("/transactions", requireAuth, async (req: AuthRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;

  const transactions = await prisma.transaction.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  res.json({ transactions, page });
});

// POST /wallet/fund/initiate
router.post("/fund/initiate", requireAuth, async (req: AuthRequest, res) => {
  const { amount } = req.body;

  if (!amount || amount < 100) {
    return res.status(400).json({ error: "Minimum funding amount is ₦100" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const reference = `EMS-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
  const amountKobo = Math.round(amount * 100);

  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: "WALLET_FUNDING",
      amount,
      status: "PENDING",
      reference,
    },
  });

  try {
    const paystackRes = await initializeTransaction(user.email, amountKobo, reference);
    res.json({
      authorizationUrl: paystackRes.data.authorization_url,
      reference,
    });
  } catch (err) {
    res.status(502).json({ error: "Could not initiate payment with Paystack" });
  }
});

// POST /wallet/fund/webhook — Paystack calls this directly
router.post("/fund/webhook", async (req, res) => {
  const signature = req.headers["x-paystack-signature"] as string;
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY as string)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== signature) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = req.body;

  if (event.event === "charge.success") {
    const { reference, amount } = event.data;

    const transaction = await prisma.transaction.findUnique({ where: { reference } });
    if (!transaction || transaction.status === "SUCCESS") {
      return res.status(200).json({ received: true });
    }

    await prisma.$transaction([
      prisma.transaction.update({
        where: { reference },
        data: { status: "SUCCESS" },
      }),
      prisma.wallet.update({
        where: { userId: transaction.userId },
        data: { balance: { increment: amount / 100 } },
      }),
    ]);
  }

  res.status(200).json({ received: true });
});

// GET /wallet/fund/verify/:reference — frontend polls this after redirect back
router.get("/fund/verify/:reference", requireAuth, async (req: AuthRequest, res) => {
  const reference = req.params.reference as string;

  const transaction = await prisma.transaction.findFirst({
    where: { reference, userId: req.user!.userId },
  });

  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  if (transaction.status === "SUCCESS") {
    return res.json({ status: "success" });
  }

  try {
    const verifyRes = await verifyTransaction(reference);
    if (verifyRes.data.status === "success") {
      await prisma.$transaction([
        prisma.transaction.update({
          where: { reference },
          data: { status: "SUCCESS" },
        }),
        prisma.wallet.update({
          where: { userId: transaction.userId },
          data: { balance: { increment: Number(transaction.amount) } },
        }),
      ]);
      return res.json({ status: "success" });
    }
    res.json({ status: transaction.status.toLowerCase() });
  } catch {
    res.json({ status: transaction.status.toLowerCase() });
  }
});

export default router;