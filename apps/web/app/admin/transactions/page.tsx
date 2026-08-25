"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/AdminShell";
import { apiFetch } from "@/lib/api";

interface Transaction {
  id: string;
  reference: string;
  type: string;
  amount: string;
  status: string;
  createdAt: string;
  user: { email: string };
}

const statusStyles: Record<string, string> = {
  SUCCESS: "text-accent-700 bg-accent-50",
  PENDING: "text-amber-700 bg-amber-50",
  FAILED: "text-red-700 bg-red-50",
  REFUNDED: "text-gray-700 bg-gray-100",
};

export default function AdminTransactionsPage() {
  const [filter, setFilter] = useState("All");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/admin/transactions?status=${filter}`)
      .then((data) => setTransactions(data.transactions))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <AdminShell breadcrumb="Transactions">
      <p className="text-2xl font-bold text-gray-900 mb-6">Transactions</p>

      <div className="flex gap-2 mb-4">
        {["All", "Success", "Pending", "Failed", "Refunded"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              filter === f
                ? "border-accent-600 bg-accent-50 text-accent-700"
                : "border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-8">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Reference</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">User</th>
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
                  <td className="px-4 py-3 text-gray-900">{txn.user.email}</td>
                  <td className="px-4 py-3 text-gray-500">{txn.type}</td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">
                    ₦{Number(txn.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyles[txn.status]}`}>
                      {txn.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}