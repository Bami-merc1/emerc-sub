import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { resolveAccountNumber, listBanks, createTransferRecipient } from "../services/paystack";

const router = Router();

// GET /bank/list
router.get("/list", async (_req, res) => {
  try {
    const data = await listBanks();
    res.json({ banks: data.data });
  } catch {
    res.status(502).json({ error: "Could not fetch bank list" });
  }
});

const addAccountSchema = z.object({
  bankCode: z.string(),
  bankName: z.string(),
  accountNumber: z.string().length(10),
});

// POST /bank/accounts — resolve + save a bank account
router.post("/accounts", requireAuth, async (req: AuthRequest, res) => {
  const parsed = addAccountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { bankCode, bankName, accountNumber } = parsed.data;
  const userId = req.user!.userId;

  try {
    const resolved = await resolveAccountNumber(accountNumber, bankCode);
    const accountName = resolved.data.account_name;

    const recipient = await createTransferRecipient({
      name: accountName,
      accountNumber,
      bankCode,
    });

    const bankAccount = await prisma.bankAccount.create({
      data: {
        userId,
        bankCode,
        bankName,
        accountNumber,
        accountName,
        recipientCode: recipient.data.recipient_code,
        isVerified: true,
      },
    });

    res.status(201).json({ bankAccount });
  } catch (err: any) {
    res.status(400).json({
      error: err.response?.data?.message || "Could not verify bank account",
    });
  }
});

// GET /bank/accounts
router.get("/accounts", requireAuth, async (req: AuthRequest, res) => {
  const accounts = await prisma.bankAccount.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ accounts });
});

// DELETE /bank/accounts/:id
router.delete("/accounts/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const account = await prisma.bankAccount.findUnique({ where: { id } });
  if (!account || account.userId !== req.user!.userId) {
    return res.status(404).json({ error: "Bank account not found" });
  }
  await prisma.bankAccount.delete({ where: { id } });
  res.json({ success: true });
});

export default router;