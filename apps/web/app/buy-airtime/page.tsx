"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageShell from "@/components/PageShell";
import { apiFetch } from "@/lib/api";

const networks = [
  { label: "MTN", value: "MTN" },
  { label: "Airtel", value: "AIRTEL" },
  { label: "Glo", value: "GLO" },
  { label: "9mobile", value: "NINE_MOBILE" },
];

const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

export default function BuyAirtimePage() {
  const router = useRouter();
  const [network, setNetwork] = useState("MTN");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    if (!amount || !phone) return;
    setLoading(true);
    setError("");

    try {
      const result = await apiFetch("/airtime/buy", {
        method: "POST",
        body: JSON.stringify({ network, phone, amount: Number(amount) }),
      });
      router.push(`/orders/${result.reference}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <PageShell breadcrumb="Buy Airtime">
      <p className="text-2xl font-bold text-gray-900 mb-6">Buy Airtime</p>

      {error && (
        <div className="px-4 py-3 text-sm text-red-700 bg-red-50 rounded-md mb-6">
          {error}
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
        Select Network
      </p>
      <div className="grid grid-cols-4 gap-3 mb-8">
        {networks.map((n) => (
          <button
            key={n.value}
            onClick={() => setNetwork(n.value)}
            className={`border rounded-lg py-3 text-sm font-medium transition-colors ${
              network === n.value
                ? "border-accent-600 bg-accent-50 text-accent-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
        Amount
      </p>
      <div className="border border-gray-200 rounded-lg bg-white p-6 mb-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full px-3 py-2 text-lg font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent mb-4"
        />
        <div className="grid grid-cols-6 gap-2">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => setAmount(String(amt))}
              className={`py-2 text-xs font-mono font-medium rounded-md border transition-colors ${
                amount === String(amt)
                  ? "border-accent-600 bg-accent-50 text-accent-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              ₦{amt.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
        Recipient
      </p>
      <div className="border border-gray-200 rounded-lg bg-white p-6 mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
          Phone Number
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0801 234 5678"
          className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
        />
      </div>

      <div className="border border-gray-200 rounded-lg bg-white p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-lg font-mono font-bold text-gray-900">
            {amount ? `₦${Number(amount).toLocaleString()}` : "—"}
          </p>
        </div>
        <button
          disabled={!amount || !phone || loading}
          onClick={handleConfirm}
          className="px-6 py-2.5 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
        >
          {loading ? "Processing..." : "Confirm Purchase"}
        </button>
      </div>
    </PageShell>
  );
}