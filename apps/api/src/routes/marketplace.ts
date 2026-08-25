import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

const createListingSchema = z.object({
  assetType: z.enum(["DATA", "AIRTIME"]),
  network: z.enum(["MTN", "AIRTEL", "GLO", "NINE_MOBILE"]),
  bundleSize: z.string().min(1),
  askingPrice: z.number().positive(),
});

// POST /market/listings
router.post("/listings", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createListingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { assetType, network, bundleSize, askingPrice } = parsed.data;
  const sellerId = req.user!.userId;

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const listing = await prisma.marketListing.create({
    data: {
      sellerId,
      assetType,
      network,
      bundleSize,
      amount: askingPrice,
      askingPrice,
      status: "ACTIVE",
      expiresAt,
    },
  });

  res.status(201).json({ listing });
});

// GET /market/listings — public feed with filters
router.get("/listings", async (req, res) => {
  const { network, assetType } = req.query;

  const listings = await prisma.marketListing.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
      ...(network && network !== "All" ? { network: network as any } : {}),
      ...(assetType && assetType !== "All" ? { assetType: assetType as any } : {}),
    },
    include: {
      seller: { select: { id: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ listings });
});

// PUT /market/listings/:id — edit or cancel (seller only)
router.put("/listings/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const { askingPrice, status } = req.body;

  const listing = await prisma.marketListing.findUnique({ where: { id } });
  if (!listing || listing.sellerId !== req.user!.userId) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const updated = await prisma.marketListing.update({
    where: { id },
    data: {
      ...(askingPrice ? { askingPrice, amount: askingPrice } : {}),
      ...(status ? { status } : {}),
    },
  });

  res.json({ listing: updated });
});

export default router;