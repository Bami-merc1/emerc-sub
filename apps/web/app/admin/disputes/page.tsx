"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/AdminShell";
import { apiFetch } from "@/lib/api";

interface Dispute {
  id: string;
  amount: string;
  buyer: { email: string };
  seller: { email: string };
  listing: { network: string; bundleSize: string; assetType: string };
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadDisputes() {
    const data = await apiFetch("/admin/disputes");
    setDisputes(data.disputes);
  }

  useEffect(() => {
    loadDisputes();
  }, []);

  const dispute = disputes.find((d) => d.id === selected);

  async function handleResolve(action: "release" | "refund") {
    if (!selected) return;
    setActionLoading(true);
    try {
      await apiFetch(`/admin/disputes/${selected}/resolve`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      setSelected(null);
      loadDisputes();
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <AdminShell breadcrumb="Disputes">
      <p className="text-2xl font-bold text-gray-900 mb-6">Disputes</p>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 border border-gray-200 rounded-lg bg-white overflow-hidden h-fit">
          {disputes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8 px-4">No open disputes.</p>
          ) : (
            disputes.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelected(d.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 transition-colors ${
                  selected === d.id ? "bg-accent-50" : "hover:bg-gray-50"
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">
                  {d.listing.network} {d.listing.assetType} — {d.listing.bundleSize}
                </p>
                <p className="text-xs text-gray-500">₦{Number(d.amount).toLocaleString()}</p>
              </button>
            ))
          )}
        </div>

        <div className="col-span-2">
          {dispute ? (
            <div className="border border-gray-200 rounded-lg bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-semibold text-gray-900">Order {dispute.id.slice(-8).toUpperCase()}</p>
                <span className="px-2 py-0.5 rounded text-xs font-medium text-red-700 bg-red-50">disputed</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Buyer</p>
                  <p className="text-sm text-gray-900">{dispute.buyer.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Seller</p>
                  <p className="text-sm text-gray-900">{dispute.seller.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Asset</p>
                  <p className="text-sm text-gray-900">
                    {dispute.listing.network} {dispute.listing.bundleSize}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Escrow Amount</p>
                  <p className="text-sm font-mono font-semibold text-gray-900">
                    ₦{Number(dispute.amount).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleResolve("release")}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 disabled:bg-gray-300 transition-colors"
                >
                  Release to Seller
                </button>
                <button
                  onClick={() => handleResolve("refund")}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Refund Buyer
                </button>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg bg-white p-12 text-center">
              <p className="text-sm text-gray-500">Select a dispute to review.</p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}