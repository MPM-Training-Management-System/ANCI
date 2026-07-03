
"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@repo/ui/button";
import { Home } from "lucide-react";


const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: <Home size={20} /> },
  { name: "Users", href: "/admin/users", icon: <Home size={20} /> },
  { name: "Settings", href: "/admin/settings", icon: <Home size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 h-screen bg-white border-r shrink-0">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">ACE NextGen ISTMS</h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-primaryContainer text-white font-semibold"
                  : "text-onPrimary hover:bg-primaryContainer"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom - Logout */}
      <div className="px-4 py-4 border-t ">
        <Button variant="primary" className="w-full flex items-center justify-center gap-2">
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
