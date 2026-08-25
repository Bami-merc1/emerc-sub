"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import CreateListingModal from "@/components/CreateListingModal";
import { apiFetch } from "@/lib/api";

interface Listing {
  id: string;
  network: string;
  assetType: string;
  bundleSize: string;
  askingPrice: string;
  seller: { email: string };
}

const networks = ["All", "MTN", "AIRTEL", "GLO", "NINE_MOBILE"];
const assetTypes = ["All", "DATA", "AIRTIME"];

export default function MarketplacePage() {
  const [network, setNetwork] = useState("All");
  const [assetType, setAssetType] = useState("All");
  const [listings, setListings] = useState<Listing[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadListings() {
    setLoading(true);
    const params = new URLSearchParams();
    if (network !== "All") params.set("network", network);
    if (assetType !== "All") params.set("assetType", assetType);
    const data = await apiFetch(`/market/listings?${params}`);
    setListings(data.listings);
    setLoading(false);
  }

  useEffect(() => {
    loadListings();
  }, [network, assetType]);

  async function handleBuy(listingId: string) {
    const phone = prompt("Enter recipient phone number:");
    if (!phone) return;

    setBuyingId(listingId);
    setError("");
    try {
      await apiFetch("/market/orders", {
        method: "POST",
        body: JSON.stringify({ listingId, recipientPhone: phone }),
      });
      loadListings();
      alert("Purchase successful! Check your active orders.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <PageShell breadcrumb="Marketplace">
      <div className="flex items-center justify-between mb-6">
        <p className="text-2xl font-bold text-gray-900">Marketplace</p>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 transition-colors"
        >
          Create Listing
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 text-sm text-red-700 bg-red-50 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="flex gap-6 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Network</p>
          <div className="flex gap-2">
            {networks.map((n) => (
              <button
                key={n}
                onClick={() => setNetwork(n)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  network === n
                    ? "border-accent-600 bg-accent-50 text-accent-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {n === "NINE_MOBILE" ? "9mobile" : n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Asset Type</p>
          <div className="flex gap-2">
            {assetTypes.map((a) => (
              <button
                key={a}
                onClick={() => setAssetType(a)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  assetType === a
                    ? "border-accent-600 bg-accent-50 text-accent-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {a === "All" ? "All" : a.charAt(0) + a.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading listings...</p>
      ) : listings.length === 0 ? (
        <div className="border border-gray-200 rounded-lg bg-white p-12 text-center">
          <p className="text-sm text-gray-500">No listings match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="border border-gray-200 rounded-lg bg-white p-5 hover:border-accent-500 transition-colors"
            >
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {listing.network === "NINE_MOBILE" ? "9mobile" : listing.network} {listing.assetType} — {listing.bundleSize}
              </p>
              <p className="text-xs text-gray-500 mb-3">{listing.seller.email}</p>

              <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                <p className="text-lg font-mono font-bold text-gray-900">
                  ₦{Number(listing.askingPrice).toLocaleString()}
                </p>
                <button
                  onClick={() => handleBuy(listing.id)}
                  disabled={buyingId === listing.id}
                  className="px-4 py-1.5 text-xs font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 disabled:bg-gray-300 transition-colors"
                >
                  {buyingId === listing.id ? "Processing..." : "Buy Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateListingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={loadListings}
      />
    </PageShell>
  );
}