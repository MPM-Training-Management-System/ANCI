"use client";

import { sidebarMenu } from "./menu";
import SidebarItem from "./SidebarItem";
import { SidebarMenuProps } from "./types";

export default function SidebarMenu({
  collapsed,
}: SidebarMenuProps) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {sidebarMenu.map((section) => (
        <div key={section.title} className="mb-6">
          {/* Section Title */}
          {!collapsed && (
            <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
              {section.title}
            </h3>
          )}

          {/* Menu Items */}
          <div className="space-y-1">
            {section.items.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                collapsed={collapsed}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}