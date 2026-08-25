import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth";
import walletRoutes from "./routes/wallet";
import dataRoutes from "./routes/data";
import airtimeRoutes from "./routes/airtime";
import airtimeSellRoutes from "./routes/airtime-sell";
import marketplaceRoutes from "./routes/marketplace";
import marketplaceOrderRoutes from "./routes/marketplace-orders";
import adminRoutes from "./routes/admin";
import bankRoutes from "./routes/bank";
import withdrawRoutes from "./routes/withdraw";
import "./workers/airtime-sell.worker";
import { airtimePollingQueue } from "./workers/queues";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/bank", bankRoutes);
app.use("/withdraw", withdrawRoutes);
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/wallet", walletRoutes);
app.use("/data", dataRoutes);
app.use("/airtime", airtimeRoutes);
app.use("/airtime", airtimeSellRoutes);
app.use("/market", marketplaceRoutes);
app.use("/market", marketplaceOrderRoutes);

airtimePollingQueue.add(
  {},
  { repeat: { every: 30000 }, removeOnComplete: true }
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});