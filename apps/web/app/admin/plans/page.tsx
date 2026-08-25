"use client";

import { useState } from "react";
import AdminShell from "@/components/AdminShell";

const initialPlans = [
  { id: 1, network: "MTN", size: "1GB", wholesale: 228, retail: 260 },
  { id: 2, network: "MTN", size: "5GB", wholesale: 1150, retail: 1280 },
  { id: 3, network: "Airtel", size: "2GB", wholesale: 490, retail: 550 },
  { id: 4, network: "Glo", size: "10GB", wholesale: 2200, retail: 2450 },
];

export default function AdminPlansPage() {
  const [plans] = useState(initialPlans);

  return (
    <AdminShell breadcrumb="Data Plans">
      <div className="flex items-center justify-between mb-6">
        <p className="text-2xl font-bold text-gray-900">Data Plans</p>
        <button className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
          Bulk Update Margin
        </button>
      </div>

      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Network</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Size</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Wholesale</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Retail</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Margin</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-gray-900 font-medium">{plan.network}</td>
                <td className="px-4 py-3 text-gray-500">{plan.size}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-500">₦{plan.wholesale}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-900">₦{plan.retail}</td>
                <td className="px-4 py-3 text-right font-mono text-accent-700">
                  ₦{plan.retail - plan.wholesale}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-xs font-medium text-accent-700 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}