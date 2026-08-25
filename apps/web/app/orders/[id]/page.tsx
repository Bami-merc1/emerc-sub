"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function OrderStatusPage() {
  const params = useParams();
  const reference = params.id as string;

  return (
    <PageShell breadcrumb="Order Status">
      <div className="max-w-lg mx-auto">
        <div className="border border-gray-200 rounded-lg bg-white p-8 text-center">
          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl text-accent-700 bg-accent-50">
            ✓
          </div>
          <p className="text-lg font-semibold text-gray-900 mb-1">Order Submitted</p>
          <p className="text-sm text-gray-500 mb-6">
            Check your Wallet transaction history for the final status.
          </p>

          <div className="border-t border-gray-100 pt-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Reference</span>
              <span className="font-mono text-gray-900">{reference}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Link
              href="/buy-data"
              className="flex-1 py-2.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-center"
            >
              Buy Again
            </Link>
            <Link
              href="/wallet"
              className="flex-1 py-2.5 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 transition-colors text-center"
            >
              View Wallet
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}