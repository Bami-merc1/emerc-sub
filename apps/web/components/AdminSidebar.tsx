"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Overview", href: "/admin" },
  { label: "Users", href: "/admin/users" },
  { label: "Transactions", href: "/admin/transactions" },
  { label: "Data Plans", href: "/admin/plans" },
  { label: "Disputes", href: "/admin/disputes" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-charcoal-900 text-gray-300">
      <div className="px-6 py-5 border-b border-gray-800">
        <span className="text-lg font-bold text-white">
          Emerc<span className="text-accent-500">Sub</span>
        </span>
        <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
      </div>
      <nav className="px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-accent-600 text-white"
                  : "text-gray-300 hover:bg-charcoal-700 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}