import { Router } from "express";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /market/orders — buyer purchases a listing
router.post("/orders", requireAuth, async (req: AuthRequest, res) => {
  const { listingId, recipientPhone } = req.body;
  const buyerId = req.user!.userId;

  const listing = await prisma.marketListing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "ACTIVE") {
    return res.status(404).json({ error: "Listing not available" });
  }
  if (listing.sellerId === buyerId) {
    return res.status(400).json({ error: "You cannot buy your own listing" });
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId: buyerId } });
  if (!wallet || Number(wallet.balance) < Number(listing.askingPrice)) {
    return res.status(400).json({ error: "Insufficient wallet balance" });
  }

  const fulfillmentDeadline = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  const order = await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { userId: buyerId },
      data: { balance: { decrement: listing.askingPrice } },
    });

    const newOrder = await tx.marketOrder.create({
      data: {
        listingId: listing.id,
        buyerId,
        sellerId: listing.sellerId,
        recipientPhone,
        amount: listing.askingPrice,
        status: "AWAITING_FULFILLMENT",
        fulfillmentDeadline,
      },
    });

    await tx.escrowLedger.create({
      data: {
        orderId: newOrder.id,
        amount: listing.askingPrice,
        status: "HELD",
      },
    });

    await tx.marketListing.update({
      where: { id: listing.id },
      data: { status: "SOLD" },
    });

    return newOrder;
  });

  res.status(201).json({ order });
});

// POST /market/orders/:id/fulfill — seller marks fulfilled
router.post("/orders/:id/fulfill", requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id as string;

  const order = await prisma.marketOrder.findUnique({ where: { id } });
  if (!order || order.sellerId !== req.user!.userId) {
    return res.status(404).json({ error: "Order not found" });
  }
  if (order.status !== "AWAITING_FULFILLMENT") {
    return res.status(400).json({ error: "Order cannot be fulfilled in its current state" });
  }

  const updated = await prisma.marketOrder.update({
    where: { id },
    data: { status: "FULFILLED" },
  });

  res.json({ order: updated });
});

// POST /market/orders/:id/confirm — buyer confirms, releases escrow
router.post("/orders/:id/confirm", requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id as string;

  const order = await prisma.marketOrder.findUnique({ where: { id } });
  if (!order || order.buyerId !== req.user!.userId) {
    return res.status(404).json({ error: "Order not found" });
  }
  if (order.status !== "FULFILLED") {
    return res.status(400).json({ error: "Order must be fulfilled before confirming" });
  }

  const commission = Number(order.amount) * 0.025;
  const sellerPayout = Number(order.amount) - commission;

  await prisma.$transaction([
    prisma.marketOrder.update({
      where: { id },
      data: { status: "CONFIRMED", confirmedAt: new Date() },
    }),
    prisma.escrowLedger.update({
      where: { orderId: id },
      data: { status: "RELEASED", releasedAt: new Date() },
    }),
    prisma.wallet.update({
      where: { userId: order.sellerId },
      data: { balance: { increment: sellerPayout } },
    }),
  ]);

  res.json({ success: true, sellerPayout });
});

// POST /market/orders/:id/dispute
router.post("/orders/:id/dispute", requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id as string;

  const order = await prisma.marketOrder.findUnique({ where: { id } });
  if (!order || order.buyerId !== req.user!.userId) {
    return res.status(404).json({ error: "Order not found" });
  }

  const updated = await prisma.marketOrder.update({
    where: { id },
    data: { status: "DISPUTED" },
  });

  res.json({ order: updated });
});

// GET /market/orders/:id
router.get("/orders/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const order = await prisma.marketOrder.findUnique({
    where: { id },
    include: { listing: true, escrow: true, seller: { select: { email: true } } },
  });

  if (!order || (order.buyerId !== req.user!.userId && order.sellerId !== req.user!.userId)) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json({ order });
});

export default router;