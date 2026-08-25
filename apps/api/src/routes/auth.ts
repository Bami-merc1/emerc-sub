import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

function setAuthCookies(res: any, accessToken: string, refreshToken: string) {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

// POST /auth/register
router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });

  if (existing) {
    return res.status(409).json({ error: "Email or phone already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, phone, password: hashedPassword },
  });

  await prisma.wallet.create({ data: { userId: user.id } });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    user: { id: user.id, email: user.email, phone: user.phone, role: user.role },
  });
});

// POST /auth/login
router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    user: { id: user.id, email: user.email, phone: user.phone, role: user.role },
  });
});

// POST /auth/refresh
router.post("/refresh", async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const accessToken = signAccessToken({ userId: payload.userId, role: payload.role });

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.json({ success: true });
  } catch {
    res.status(401).json({ error: "Invalid or expired refresh token" });
  }
});

// POST /auth/logout
router.post("/logout", (_req, res) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  res.json({ success: true });
});

// GET /auth/me
router.get("/me", async (req, res) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { verifyAccessToken } = await import("../utils/jwt");
    const payload = verifyAccessToken(accessToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, phone: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ user });
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

export default router;