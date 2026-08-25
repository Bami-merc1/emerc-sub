"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PageShell from "@/components/PageShell";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

interface Transaction {
  id: string;
  reference: string;
  type: string;
  amount: string;
  status: string;
  createdAt: string;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
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

export default function WalletPage() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"fund" | "withdraw">("fund");
  const [balance, setBalance] = useState<string>("0");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadWalletData() {
    const walletData = await apiFetch("/wallet");
    setBalance(walletData.balance);
    const txnData = await apiFetch("/wallet/transactions");
    setTransactions(txnData.transactions);
  }

  useEffect(() => {
    loadWalletData();
    apiFetch("/bank/accounts").then((data) => setAccounts(data.accounts));

    const reference = searchParams.get("reference");
    if (searchParams.get("status") === "callback" && reference) {
      apiFetch(`/wallet/fund/verify/${reference}`).then((data) => {
        if (data.status === "success") {
          setMessage("Wallet funded successfully!");
          loadWalletData();
        }
      });
    }
  }, [searchParams]);

  async function handleFund(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/wallet/fund/initiate", {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount) }),
      });
      window.location.href = data.authorizationUrl;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await apiFetch("/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount), bankAccountId: selectedAccount }),
      });
      setMessage("Withdrawal successful!");
      setAmount("");
      loadWalletData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell breadcrumb="Wallet">
      <p className="text-2xl font-bold text-gray-900 mb-6">Wallet</p>

      <div className="border border-gray-200 rounded-lg bg-white p-6 mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          Current Balance
        </p>
        <p className="text-4xl font-bold font-mono text-gray-900">
          ₦{Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>

      {message && (
        <div className="px-4 py-3 text-sm text-accent-700 bg-accent-50 rounded-md mb-6">
          {message}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 text-sm text-red-700 bg-red-50 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab("fund")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === "fund"
                ? "text-accent-700 border-b-2 border-accent-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Fund Wallet
          </button>
          <button
            onClick={() => setTab("withdraw")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === "withdraw"
                ? "text-accent-700 border-b-2 border-accent-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Withdraw
          </button>
        </div>

        <div className="p-6">
          {tab === "fund" ? (
            <form onSubmit={handleFund} className="flex gap-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (NGN)"
                required
                min={100}
                className="flex-1 px-3 py-2 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 disabled:bg-gray-300 transition-colors"
              >
                {loading ? "Redirecting..." : "Proceed to Payment"}
              </button>
            </form>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-gray-500">
              No bank accounts saved. Add one in{" "}
              <Link href="/settings" className="text-accent-700 hover:underline">Settings</Link>{" "}
              before withdrawing.
            </p>
          ) : (
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                  Bank Account
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">Select an account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.bankName} — {acc.accountNumber} ({acc.accountName})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount (min. ₦500)"
                  required
                  min={500}
                  className="flex-1 px-3 py-2 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <button
                  type="submit"
                  disabled={loading || !selectedAccount}
                  className="px-6 py-2.5 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 disabled:bg-gray-300 transition-colors"
                >
                  {loading ? "Processing..." : "Withdraw to Bank"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
        Transaction History
      </p>
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No transactions yet.</p>
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