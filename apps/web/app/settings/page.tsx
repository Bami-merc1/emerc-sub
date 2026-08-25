"use client";

import { useState, useEffect } from "react";
import PageShell from "@/components/PageShell";
import { apiFetch } from "@/lib/api";

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface Bank {
  name: string;
  code: string;
}

export default function SettingsPage() {
  const [tab, setTab] = useState<"profile" | "security" | "bank">("profile");
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadAccounts() {
    const data = await apiFetch("/bank/accounts");
    setAccounts(data.accounts);
  }

  useEffect(() => {
    if (tab === "bank") {
      loadAccounts();
      if (banks.length === 0) {
        apiFetch("/bank/list").then((data) => setBanks(data.banks));
      }
    }
  }, [tab]);

  async function handleAddAccount() {
    const bank = banks.find((b) => b.code === selectedBank);
    if (!bank || accountNumber.length !== 10) return;

    setLoading(true);
    setError("");
    try {
      await apiFetch("/bank/accounts", {
        method: "POST",
        body: JSON.stringify({
          bankCode: bank.code,
          bankName: bank.name,
          accountNumber,
        }),
      });
      setShowAddForm(false);
      setAccountNumber("");
      setSelectedBank("");
      loadAccounts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: string) {
    await apiFetch(`/bank/accounts/${id}`, { method: "DELETE" });
    loadAccounts();
  }

  return (
    <PageShell breadcrumb="Settings">
      <p className="text-2xl font-bold text-gray-900 mb-6">Settings</p>

      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="flex border-b border-gray-200">
          {[
            { key: "profile", label: "Profile" },
            { key: "security", label: "Security" },
            { key: "bank", label: "Bank Accounts" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "text-accent-700 border-b-2 border-accent-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "profile" && (
            <p className="text-sm text-gray-500">Profile editing coming soon.</p>
          )}

          {tab === "security" && (
            <p className="text-sm text-gray-500">Password change coming soon.</p>
          )}

          {tab === "bank" && (
            <div className="max-w-md">
              {error && (
                <div className="px-3 py-2 text-xs text-red-700 bg-red-50 rounded-md mb-4">
                  {error}
                </div>
              )}

              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="border border-gray-200 rounded-lg p-4 mb-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {acc.bankName} — {acc.accountNumber}
                    </p>
                    <p className="text-xs text-gray-500">{acc.accountName}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(acc.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}

              {showAddForm ? (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                      Bank
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500"
                    >
                      <option value="">Select a bank</option>
                      {banks.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      maxLength={10}
                      placeholder="0123456789"
                      className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddAccount}
                      disabled={loading || !selectedBank || accountNumber.length !== 10}
                      className="flex-1 py-2 text-sm font-medium rounded-md bg-accent-600 text-white hover:bg-accent-700 disabled:bg-gray-300 transition-colors"
                    >
                      {loading ? "Verifying..." : "Verify & Add"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-5 py-2.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  + Add Bank Account
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}