"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Buy Data", href: "/buy-data" },
  { label: "Buy Airtime", href: "/buy-airtime" },
  { label: "Sell Airtime", href: "/sell-airtime" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Wallet", href: "/wallet" },
  { label: "Settings", href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-charcoal-900 text-gray-300">
      <div className="px-6 py-5 border-b border-gray-800">
        <span className="text-lg font-bold text-white">
          Emerc<span className="text-accent-500">Sub</span>
        </span>
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