"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import { apiFetch } from "@/lib/api";

interface Transaction {
  id: string;
  reference: string;
  type: string;
  amount: string;
  status: string;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  SUCCESS: "text-accent-700 bg-accent-50",
  PENDING: "text-amber-700 bg-amber-50",
  FAILED: "text-red-700 bg-red-50",
  REFUNDED: "text-gray-700 bg-gray-100",
};

const typeLabels: Record<string, string> = {
  WALLET_FUNDING: "Wallet Funding",
  DATA_PURCHASE: "Data Purchase",
  AIRTIME_PURCHASE: "Airtime Purchase",
  AIRTIME_SELL: "Airtime Sell",
  WITHDRAWAL: "Withdrawal",
  REFUND: "Refund",
  MARKETPLACE_ESCROW: "Marketplace",
};

export default function DashboardPage() {
  const [balance, setBalance] = useState("0");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [walletData, meData, txnData] = await Promise.all([
          apiFetch("/wallet"),
          apiFetch("/auth/me"),
          apiFetch("/wallet/transactions"),
        ]);
        setBalance(walletData.balance);
        setUserEmail(meData.user.email);
        setTransactions(txnData.transactions.slice(0, 5));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <PageShell breadcrumb="Overview">
        <p className="text-sm text-gray-500">Loading...</p>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell breadcrumb="Overview">
        <div className="border border-red-200 rounded-lg bg-red-50 p-6">
          <p className="text-sm text-red-700">{error}</p>
          <Link href="/login" className="text-sm text-red-700 underline mt-2 inline-block">
            Please log in again
          </Link>
        </div>
      </PageShell>
    );
  }

  const quickActions = [
    { label: "Buy Data", href: "/buy-data" },
    { label: "Buy Airtime", href: "/buy-airtime" },
    { label: "Sell Airtime", href: "/sell-airtime" },
    { label: "Marketplace", href: "/marketplace" },
  ];

  return (
    <PageShell breadcrumb="Overview">
      <div className="border border-gray-200 rounded-lg bg-white p-6 mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Wallet Balance
        </p>
        <div className="flex items-end justify-between">
          <p className="text-4xl font-bold font-mono text-gray-900">
            ₦{Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className="flex gap-2">
            <Link
              href="/wallet"
              className="px-4 py-2 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 transition-colors"
            >
              Fund Wallet
            </Link>
            <Link
              href="/wallet"
              className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Withdraw
            </Link>
          </div>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
        Quick Actions
      </p>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="border border-gray-200 rounded-lg bg-white p-4 text-left hover:border-accent-500 transition-colors"
          >
            <p className="text-sm font-semibold text-gray-900">{action.label}</p>
          </Link>
        ))}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
        Recent Transactions
      </p>
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            {userEmail} — no transactions yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Reference</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Type</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{txn.reference}</td>
                  <td className="px-4 py-3 text-gray-900">{typeLabels[txn.type] || txn.type}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">
                    ₦{Number(txn.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyles[txn.status]}`}>
                      {txn.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(txn.createdAt).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </PageShell>
  );
}