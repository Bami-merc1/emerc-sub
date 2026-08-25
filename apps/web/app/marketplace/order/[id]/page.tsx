"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageShell from "@/components/PageShell";
import { apiFetch } from "@/lib/api";

interface Order {
  id: string;
  status: string;
  amount: string;
  recipientPhone: string;
  fulfillmentDeadline: string;
  confirmedAt: string | null;
  buyerId: string;
  sellerId: string;
  listing: { network: string; bundleSize: string; assetType: string };
  seller: { email: string };
  escrow: { status: string; amount: string } | null;
}

const statusConfig: Record<string, { label: string; style: string }> = {
  AWAITING_FULFILLMENT: { label: "awaiting fulfillment", style: "text-amber-700 bg-amber-50" },
  FULFILLED: { label: "awaiting your confirmation", style: "text-accent-700 bg-accent-50" },
  CONFIRMED: { label: "completed", style: "text-accent-700 bg-accent-50" },
  DISPUTED: { label: "disputed", style: "text-red-700 bg-red-50" },
  REFUNDED: { label: "refunded", style: "text-gray-700 bg-gray-100" },
};

export default function ActiveOrderPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadOrder() {
    try {
      const [orderData, meData] = await Promise.all([
        apiFetch(`/market/orders/${orderId}`),
        apiFetch("/auth/me"),
      ]);
      setOrder(orderData.order);
      setCurrentUserId(meData.user.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  async function handleFulfill() {
    setActionLoading(true);
    try {
      await apiFetch(`/market/orders/${orderId}/fulfill`, { method: "POST" });
      loadOrder();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirm() {
    setActionLoading(true);
    try {
      await apiFetch(`/market/orders/${orderId}/confirm`, { method: "POST" });
      loadOrder();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDispute() {
    setActionLoading(true);
    try {
      await apiFetch(`/market/orders/${orderId}/dispute`, { method: "POST" });
      loadOrder();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <PageShell breadcrumb="Active Order">
        <p className="text-sm text-gray-500">Loading order...</p>
      </PageShell>
    );
  }

  if (!order) {
    return (
      <PageShell breadcrumb="Active Order">
        <div className="border border-red-200 rounded-lg bg-red-50 p-6">
          <p className="text-sm text-red-700">{error || "Order not found"}</p>
        </div>
      </PageShell>
    );
  }

  const isBuyer = currentUserId === order.buyerId;
  const isSeller = currentUserId === order.sellerId;
  const config = statusConfig[order.status] || statusConfig.AWAITING_FULFILLMENT;

  return (
    <PageShell breadcrumb="Active Order">
      <p className="text-2xl font-bold text-gray-900 mb-6">
        Order #{order.id.slice(-8).toUpperCase()}
      </p>

      {error && (
        <div className="px-4 py-3 text-sm text-red-700 bg-red-50 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 border border-gray-200 rounded-lg bg-white p-6">
          <div className="flex items-center justify-between mb-6">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.style}`}>
              {config.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1">Asset</p>
              <p className="text-sm font-semibold text-gray-900">
                {order.listing.network} {order.listing.assetType} — {order.listing.bundleSize}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Price</p>
              <p className="text-sm font-mono font-semibold text-gray-900">
                ₦{Number(order.amount).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Seller</p>
              <p className="text-sm text-gray-900">{order.seller.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Recipient Number</p>
              <p className="text-sm font-mono text-gray-900">{order.recipientPhone}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            {isSeller && order.status === "AWAITING_FULFILLMENT" && (
              <button
                onClick={handleFulfill}
                disabled={actionLoading}
                className="px-5 py-2.5 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 disabled:bg-gray-300 transition-colors"
              >
                {actionLoading ? "Processing..." : "Mark as Fulfilled"}
              </button>
            )}
            {isBuyer && order.status === "FULFILLED" && (
              <>
                <button
                  onClick={handleConfirm}
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 disabled:bg-gray-300 transition-colors"
                >
                  {actionLoading ? "Processing..." : "Confirm Receipt"}
                </button>
                <button
                  onClick={handleDispute}
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Open Dispute
                </button>
              </>
            )}
            {order.status === "CONFIRMED" && (
              <p className="text-sm text-accent-700 font-medium">
                ✓ Escrow released to seller. Transaction complete.
              </p>
            )}
            {order.status === "DISPUTED" && (
              <p className="text-sm text-red-600">
                This dispute has been sent to our admin team for review.
              </p>
            )}
            {order.status === "AWAITING_FULFILLMENT" && isBuyer && (
              <p className="text-sm text-gray-500">Waiting for seller to fulfill this order.</p>
            )}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white p-6 h-fit">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Escrow Status
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Amount held</span>
              <span className="font-mono text-gray-900">
                ₦{Number(order.escrow?.amount || order.amount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span
                className={
                  order.escrow?.status === "RELEASED"
                    ? "text-accent-700 font-medium"
                    : "text-amber-700 font-medium"
                }
              >
                {order.escrow?.status === "RELEASED" ? "Released" : "Held"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}