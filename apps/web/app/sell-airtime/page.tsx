"use client";

import { useState } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { apiFetch } from "@/lib/api";

const networks = [
  { label: "MTN", value: "MTN" },
  { label: "Airtel", value: "AIRTEL" },
  { label: "Glo", value: "GLO" },
  { label: "9mobile", value: "NINE_MOBILE" },
];

export default function SellAirtimePage() {
  const [network, setNetwork] = useState("MTN");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ cashValue: number; faceValue: number } | null>(null);

  async function handleSubmitPin() {
    if (pin.length < 10) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await apiFetch("/airtime/sell/pin", {
        method: "POST",
        body: JSON.stringify({ network, pin }),
      });
      setResult({ cashValue: data.cashValue, faceValue: data.faceValue });
      setPin("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <PageShell breadcrumb="Sell Airtime">
        <div className="max-w-lg mx-auto border border-gray-200 rounded-lg bg-white p-8 text-center">
          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl text-accent-700 bg-accent-50">
            ✓
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-1">PIN Validated</p>
          <p className="text-sm text-gray-500 mb-6">Your wallet has been credited.</p>

          <div className="border-t border-gray-100 pt-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Face Value</span>
              <span className="font-mono text-gray-900">₦{result.faceValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount Credited</span>
              <span className="font-mono font-semibold text-accent-700">₦{result.cashValue.toLocaleString()}</span>
            </div>
          </div>

          <Link
            href="/wallet"
            className="block w-full py-2.5 mt-8 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 transition-colors text-center"
          >
            View Wallet
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell breadcrumb="Sell Airtime">
      <p className="text-2xl font-bold text-gray-900 mb-6">Sell Airtime</p>

      <div className="px-4 py-3 text-sm text-amber-700 bg-amber-50 rounded-md mb-6">
        Airtime share/transfer method is coming soon. PIN submission is available now.
      </div>

      {error && (
        <div className="px-4 py-3 text-sm text-red-700 bg-red-50 rounded-md mb-6">
          {error}
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
        Network
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
        Recharge PIN
      </p>
      <div className="border border-gray-200 rounded-lg bg-white p-6 mb-8">
        <input
          type="text"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter 14-digit PIN"
          className="w-full px-3 py-2 text-lg font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
        />
      </div>

      <div className="border border-gray-200 rounded-lg bg-white p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Status</p>
          <p className="text-lg font-mono font-bold text-gray-900">Awaiting PIN</p>
        </div>
        <button
          disabled={pin.length < 10 || loading}
          onClick={handleSubmitPin}
          className="px-6 py-2.5 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
        >
          {loading ? "Validating..." : "Validate & Submit PIN"}
        </button>
      </div>
    </PageShell>
  );
}