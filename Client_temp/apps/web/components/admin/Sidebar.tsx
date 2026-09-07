"use client";

import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarMenu from "./sidebar/SidebarMenu";
import SidebarFooter from "./sidebar/SidebarFooter";

import { SidebarProps } from "./sidebar/types";

export default function Sidebar({
  collapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  return (
    <>
      {/* =========================================
          MOBILE OVERLAY
          ========================================= */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="
            fixed
            inset-0
            z-[80]
            cursor-default
            border-0
            bg-black/50
            p-0
            md:hidden
          "
        />
      )}

      {/* =========================================
          SIDEBAR
          ========================================= */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-[110]
          flex
          h-dvh
          flex-col
          overflow-hidden

          border-r
          border-white/10
          bg-primary

          /* =====================================
             MOBILE
             ===================================== */

          w-[280px]

          transform
          transition-transform
          duration-300
          ease-in-out

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          /* =====================================
             DESKTOP
             ===================================== */

          md:translate-x-0
          md:transition-[width]
          md:duration-300

          ${
            collapsed
              ? "md:w-32"
              : "md:w-80"
          }
        `}
      >
        {/* =====================================
            HEADER
            ===================================== */}

        <SidebarHeader
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* =====================================
            MENU
            ===================================== */}

        <SidebarMenu
          collapsed={collapsed}
        />

        {/* =====================================
            FOOTER
            ===================================== */}

        <SidebarFooter
          collapsed={collapsed}
        />
      </aside>
    </>
  );
}