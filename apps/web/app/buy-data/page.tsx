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

const plans = [
  { id: "1", size: "500MB", validity: "30 days", price: 260 },
  { id: "2", size: "1GB", validity: "30 days", price: 480 },
  { id: "3", size: "2GB", validity: "30 days", price: 950 },
  { id: "4", size: "5GB", validity: "30 days", price: 2280 },
  { id: "5", size: "10GB", validity: "30 days", price: 4350 },
];

export default function BuyDataPage() {
  const router = useRouter();
  const [network, setNetwork] = useState("MTN");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const plan = plans.find((p) => p.id === selectedPlan);

  async function handleConfirm() {
    if (!plan || !phone) return;
    setLoading(true);
    setError("");

    try {
      const result = await apiFetch("/data/buy", {
        method: "POST",
        body: JSON.stringify({
          network,
          phone,
          planId: plan.id,
          bundleLabel: `${plan.size} - ${plan.validity}`,
          amount: plan.price,
        }),
      });
      router.push(`/orders/${result.reference}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <PageShell breadcrumb="Buy Data">
      <p className="text-2xl font-bold text-gray-900 mb-6">Buy Data</p>

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
        Select Plan
      </p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {plans.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlan(p.id)}
            className={`border rounded-lg p-4 text-left transition-colors ${
              selectedPlan === p.id
                ? "border-accent-600 bg-accent-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-sm font-semibold text-gray-900">{p.size}</p>
            <p className="text-xs text-gray-500 mb-2">{p.validity}</p>
            <p className="text-sm font-mono font-semibold text-accent-700">
              ₦{p.price.toLocaleString()}
            </p>
          </button>
        ))}
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
            {plan ? `₦${plan.price.toLocaleString()}` : "—"}
          </p>
        </div>
        <button
          disabled={!plan || !phone || loading}
          onClick={handleConfirm}
          className="px-6 py-2.5 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
        >
          {loading ? "Processing..." : "Confirm Purchase"}
        </button>
      </div>
    </PageShell>
  );
}