"use client";

import { useState } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";

const activeListings = [
  { id: 1, network: "MTN", size: "5GB", price: 2100, status: "active", createdAt: "2h ago" },
  { id: 2, network: "Airtel", size: "₦2,000", price: 1750, status: "active", createdAt: "5h ago" },
];

const orderQueue = [
  { id: "MKT-2291", buyer: "@tunde_k", asset: "MTN 5GB", price: 2100, deadline: "12:41 remaining" },
];

const earnings = { total: 48200, thisMonth: 12600, trades: 143 };

export default function SellerDashboardPage() {
  const [tab, setTab] = useState<"listings" | "orders" | "earnings">("orders");

  return (
    <PageShell breadcrumb="Seller Dashboard">
      <div className="flex items-center justify-between mb-6">
        <p className="text-2xl font-bold text-gray-900">Seller Dashboard</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">4.8★</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-500">143 trades</span>
          <span className="px-2 py-0.5 rounded text-xs font-medium text-accent-700 bg-accent-50">
            Verified Seller
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border border-gray-200 rounded-lg bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Total Earnings</p>
          <p className="text-2xl font-mono font-bold text-gray-900">₦{earnings.total.toLocaleString()}</p>
        </div>
        <div className="border border-gray-200 rounded-lg bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">This Month</p>
          <p className="text-2xl font-mono font-bold text-accent-700">₦{earnings.thisMonth.toLocaleString()}</p>
        </div>
        <div className="border border-gray-200 rounded-lg bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Total Trades</p>
          <p className="text-2xl font-mono font-bold text-gray-900">{earnings.trades}</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { key: "orders", label: `Order Queue (${orderQueue.length})` },
            { key: "listings", label: `Active Listings (${activeListings.length})` },
            { key: "earnings", label: "Earnings History" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "text-accent-700 border-b-2 border-accent-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "orders" && (
            orderQueue.length > 0 ? (
              <div className="space-y-3">
                {orderQueue.map((order) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{order.asset}</p>
                      <p className="text-xs text-gray-500">
                        {order.id} · Buyer: {order.buyer}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-mono font-semibold text-gray-900">
                          ₦{order.price.toLocaleString()}
                        </p>
                        <p className="text-xs font-mono text-amber-700">{order.deadline}</p>
                      </div>
                      <Link
                        href={`/marketplace/order/${order.id}`}
                        className="px-4 py-2 text-xs font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 transition-colors"
                      >
                        Fulfill
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No pending orders.</p>
            )
          )}

          {tab === "listings" && (
            <div className="space-y-3">
              {activeListings.map((listing) => (
                <div
                  key={listing.id}
                  className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {listing.network} — {listing.size}
                    </p>
                    <p className="text-xs text-gray-500">Listed {listing.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-mono font-semibold text-gray-900">
                      ₦{listing.price.toLocaleString()}
                    </p>
                    <button className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                      Edit
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-red-600 hover:bg-red-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "earnings" && (
            <p className="text-sm text-gray-500 text-center py-8">
              Full earnings history will appear here once transactions are recorded.
            </p>
          )}
        </div>
      </div>
    </PageShell>
  );
}