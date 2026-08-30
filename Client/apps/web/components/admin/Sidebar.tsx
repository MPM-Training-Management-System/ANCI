"use client";

import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarMenu from "./sidebar/SidebarMenu";
import SidebarFooter from "./sidebar/SidebarFooter";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (
    value: boolean
  ) => void;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
}: SidebarProps) {
  return (
    <aside
      className={`
        fixed
        left-0
        top-0
        z-40
        flex
        h-screen
        flex-col
        border-r
        border-white/10
        bg-primary
        transition-all
        duration-300
        ${
          collapsed
            ? "w-32"
            : "w-80"
        }
      `}
    >

   

      <SidebarHeader
        collapsed={
          collapsed
        }
      />

   

      <SidebarMenu
        collapsed={
          collapsed
        }
      />

     

      <SidebarFooter
        collapsed={
          collapsed
        }
      />

    </aside>
  );
}