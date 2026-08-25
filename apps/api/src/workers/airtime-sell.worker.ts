import { prisma } from "../utils/prisma";
import { airtimeExpiryQueue, airtimePollingQueue } from "./queues";

// Auto-expiry worker — cancels unfulfilled sell orders after their deadline
airtimeExpiryQueue.process(async (job) => {
  const { orderId } = job.data;

  const order = await prisma.airtimeSellOrder.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "PENDING") return; // already handled

  await prisma.airtimeSellOrder.update({
    where: { id: orderId },
    data: { status: "EXPIRED" },
  });

  console.log(`[airtime-expiry] Order ${orderId} expired`);
});

// Polling worker — checks for incoming airtime matching pending reference codes
// STUB: the actual SIM-balance-check call depends on VTU provider endpoints
// that haven't been verified yet (CheapDataHub/Peyflex). This structure is
// real and ready — only the checkForIncomingAirtime() call body needs the
// confirmed provider API once available.
airtimePollingQueue.process(async () => {
  const pendingOrders = await prisma.airtimeSellOrder.findMany({
    where: { status: "PENDING", expiresAt: { gt: new Date() } },
  });

  for (const order of pendingOrders) {
    const received = await checkForIncomingAirtime(order.referenceCode, order.network);

    if (received) {
      await prisma.$transaction([
        prisma.airtimeSellOrder.update({
          where: { id: order.id },
          data: { status: "COMPLETED", confirmedAt: new Date() },
        }),
        prisma.wallet.update({
          where: { userId: order.userId },
          data: { balance: { increment: order.cashValue } },
        }),
        prisma.transaction.create({
          data: {
            userId: order.userId,
            type: "AIRTIME_SELL",
            amount: order.cashValue,
            status: "SUCCESS",
            reference: order.referenceCode,
            meta: { network: order.network, method: "share" },
          },
        }),
      ]);
      console.log(`[airtime-polling] Order ${order.id} matched and credited`);
    }
  }
});

// STUB — replace with real VTU provider SIM balance check once confirmed
async function checkForIncomingAirtime(referenceCode: string, network: string): Promise<boolean> {
  // TODO: call CheapDataHub or Peyflex's SIM balance endpoint here
  // and match incoming credit amounts against pending reference codes.
  // Returning false until this is wired to a real, verified endpoint.
  return false;
}

console.log("Airtime sell workers initialized");