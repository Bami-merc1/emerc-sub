"use client";

import { useState, useEffect } from "react";
import AdminShell from "@/components/AdminShell";
import { apiFetch } from "@/lib/api";

interface User {
  id: string;
  email: string;
  phone: string;
  isVerified: boolean;
  createdAt: string;
  balance: string;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const data = await apiFetch(`/admin/users?${params}`);
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(loadUsers, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function handleToggleSuspend(userId: string) {
    try {
      await apiFetch(`/admin/users/${userId}/suspend`, { method: "PUT" });
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <AdminShell breadcrumb="Users">
      <div className="flex items-center justify-between mb-6">
        <p className="text-2xl font-bold text-gray-900">Users</p>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="px-3 py-2 text-sm border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      {error && (
        <div className="px-4 py-3 text-sm text-red-700 bg-red-50 rounded-md mb-6">{error}</div>
      )}

      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-8">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Verified</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Balance</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 text-gray-900 font-medium">{user.email}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono">{user.phone}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        user.isVerified ? "text-accent-700 bg-accent-50" : "text-gray-500 bg-gray-100"
                      }`}
                    >
                      {user.isVerified ? "verified" : "unverified"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-gray-900">
                    ₦{Number(user.balance).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleSuspend(user.id)}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Toggle Suspend
                    </button>
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