"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { apiFetch } from "@/lib/api";

interface Activity {
  id: string;
  reference: string;
  type: string;
  amount: string;
  user: { email: string };
  createdAt: string;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([apiFetch("/admin/stats"), apiFetch("/admin/activity")])
      .then(([statsData, activityData]) => {
        setStats(statsData);
        setActivity(activityData.activity);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <AdminShell breadcrumb="Overview">
        <div className="border border-red-200 rounded-lg bg-red-50 p-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell breadcrumb="Overview">
      <p className="text-2xl font-bold text-gray-900 mb-6">Overview</p>

      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border border-gray-200 rounded-lg bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Revenue (Today)</p>
            <p className="text-2xl font-mono font-bold text-gray-900">₦{Number(stats.revenueToday).toLocaleString()}</p>
          </div>
          <div className="border border-gray-200 rounded-lg bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Total Users</p>
            <p className="text-2xl font-mono font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          <div className="border border-gray-200 rounded-lg bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Orders Today</p>
            <p className="text-2xl font-mono font-bold text-gray-900">{stats.ordersToday}</p>
          </div>
          <div className="border border-gray-200 rounded-lg bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Success Rate</p>
            <p className="text-2xl font-mono font-bold text-gray-900">{stats.successRate}%</p>
          </div>
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Recent Activity</p>
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Type</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Time</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-gray-900">{row.user.email}</td>
                <td className="px-4 py-3 text-gray-500">{row.type}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-900">₦{Number(row.amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(row.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}