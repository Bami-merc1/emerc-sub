"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

const networks = [
  { label: "MTN", value: "MTN" },
  { label: "Airtel", value: "AIRTEL" },
  { label: "Glo", value: "GLO" },
  { label: "9mobile", value: "NINE_MOBILE" },
];
const assetTypes = ["DATA", "AIRTIME"];

export default function CreateListingModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [assetType, setAssetType] = useState("DATA");
  const [network, setNetwork] = useState("MTN");
  const [size, setSize] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handlePublish() {
    setLoading(true);
    setError("");
    try {
      await apiFetch("/market/listings", {
        method: "POST",
        body: JSON.stringify({
          assetType,
          network,
          bundleSize: size,
          askingPrice: Number(price),
        }),
      });
      setSize("");
      setPrice("");
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <p className="text-sm font-semibold text-gray-900">Create Listing</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="px-3 py-2 text-xs text-red-700 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Asset Type</p>
            <div className="grid grid-cols-2 gap-2">
              {assetTypes.map((a) => (
                <button
                  key={a}
                  onClick={() => setAssetType(a)}
                  className={`py-2 text-sm font-medium rounded-md border transition-colors ${
                    assetType === a
                      ? "border-accent-600 bg-accent-50 text-accent-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {a.charAt(0) + a.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Network</p>
            <div className="grid grid-cols-4 gap-2">
              {networks.map((n) => (
                <button
                  key={n.value}
                  onClick={() => setNetwork(n.value)}
                  className={`py-2 text-xs font-medium rounded-md border transition-colors ${
                    network === n.value
                      ? "border-accent-600 bg-accent-50 text-accent-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              {assetType === "DATA" ? "Bundle Size" : "Amount"}
            </label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder={assetType === "DATA" ? "e.g. 5GB" : "e.g. ₦2,000"}
              className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              Asking Price (NGN)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!size || !price || loading}
            onClick={handlePublish}
            className="flex-1 py-2.5 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
          >
            {loading ? "Publishing..." : "Publish Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}