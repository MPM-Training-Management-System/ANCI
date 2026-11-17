
"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent } from "react";

import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarMenu from "./sidebar/SidebarMenu";
import SidebarFooter from "./sidebar/SidebarFooter";

import { SidebarProps } from "./sidebar/types";

export default function Sidebar({
  collapsed,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const activeItemRef = useRef<HTMLElement | null>(null);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === "touch") return;

      const sidebar = sidebarRef.current;
      if (!sidebar) return;

      const rect = sidebar.getBoundingClientRect();

      sidebar.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
      sidebar.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);

      const target = document.elementFromPoint(event.clientX, event.clientY);
      const item = target?.closest<HTMLElement>('a, button, [role="menuitem"]');
      const nextItem = item && sidebar.contains(item) ? item : null;

      if (activeItemRef.current === nextItem) return;

      if (activeItemRef.current) {
        activeItemRef.current.style.transform = "";
        activeItemRef.current.style.transition = "";
        activeItemRef.current.style.willChange = "";
      }

      activeItemRef.current = nextItem;

      if (nextItem) {
        nextItem.style.transition = "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)";
        nextItem.style.willChange = "transform";
        nextItem.style.transform = "translate3d(0, -3px, 0) scale(1.015)";
      }
    },
    []
  );

  const handlePointerLeave = useCallback(() => {
    const sidebar = sidebarRef.current;

    if (sidebar) {
      sidebar.style.setProperty("--pointer-x", "-999px");
      sidebar.style.setProperty("--pointer-y", "-999px");
    }

    if (activeItemRef.current) {
      activeItemRef.current.style.transform = "";
      activeItemRef.current.style.transition = "";
      activeItemRef.current.style.willChange = "";
      activeItemRef.current = null;
    }
  }, []);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[80] cursor-default border-0 bg-slate-950/60 p-0 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        ref={sidebarRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className={`sidebar-premium fixed left-0 top-0 z-[110] flex h-dvh flex-col overflow-hidden border-r border-white/10 w-[280px] transform transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:transition-[width] md:duration-300 ${collapsed ? "md:w-32" : "md:w-80"}`}
      >
        {/* Decorative background elements */}
        <div className="sidebar-decoration pointer-events-none absolute inset-0 overflow-hidden">
          <div className="sidebar-orb sidebar-orb-one" />
          <div className="sidebar-orb sidebar-orb-two" />
          <div className="sidebar-grid-pattern" />
          <div className="sidebar-pointer-light" />
          <div className="sidebar-bottom-glow" />
        </div>

        {/* Top accent line */}
        <div className="absolute left-0 right-0 top-0 z-20 h-[3px] bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500" />

        {/* Sidebar content */}
        <div className="relative z-10 flex h-full min-h-0 flex-col">
          <div className="relative border-b border-white/[0.09]">
            <SidebarHeader
              collapsed={collapsed}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
            />
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto sidebar-scroll">
            <div className="pointer-events-none absolute left-5 right-5 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <SidebarMenu collapsed={collapsed} />
          </div>

          <div className="relative border-t border-white/[0.09] bg-slate-950/15">
            <div className="pointer-events-none absolute left-5 right-5 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/20 to-transparent" />
            <SidebarFooter collapsed={collapsed} />
          </div>
        </div>
      </aside>

      <style jsx global>{`
        .sidebar-premium {
          background-color: #071a35;
          background-image:
            radial-gradient(
              280px circle at var(--pointer-x, -999px) var(--pointer-y, -999px),
              rgba(96, 165, 250, 0.19),
              rgba(59, 130, 246, 0.07) 42%,
              transparent 75%
            ),
            linear-gradient(
              155deg,
              #0b2548 0%,
              #071b38 48%,
              #06152d 100%
            );
          box-shadow: 12px 0 40px rgba(2, 12, 30, 0.16);
        }

        .sidebar-decoration {
          z-index: 0;
        }

        .sidebar-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(55px);
          pointer-events: none;
        }

        .sidebar-orb-one {
          top: -95px;
          right: -100px;
          width: 230px;
          height: 230px;
          background: rgba(37, 99, 235, 0.22);
        }

        .sidebar-orb-two {
          bottom: 12%;
          left: -145px;
          width: 250px;
          height: 250px;
          background: rgba(14, 165, 233, 0.10);
        }

        .sidebar-grid-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.12;
          background-image: radial-gradient(rgba(191, 219, 254, 0.7) 0.7px, transparent 0.7px);
          background-size: 19px 19px;
          mask-image: linear-gradient(to bottom, black, transparent 75%);
          pointer-events: none;
        }

        .sidebar-pointer-light {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            240px circle at var(--pointer-x, -999px) var(--pointer-y, -999px),
            rgba(125, 211, 252, 0.09),
            transparent 75%
          );
          pointer-events: none;
        }

        .sidebar-bottom-glow {
          position: absolute;
          bottom: -100px;
          left: 15%;
          width: 70%;
          height: 170px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.12);
          filter: blur(65px);
          pointer-events: none;
        }

        .sidebar-premium a,
        .sidebar-premium button,
        .sidebar-premium [role="menuitem"] {
          transform-origin: center;
        }

        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.25) transparent;
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.25);
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.45);
        }

        @media (hover: none) {
          .sidebar-premium {
            background-image: linear-gradient(
              155deg,
              #0b2548 0%,
              #071b38 48%,
              #06152d 100%
            );
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sidebar-premium a,
          .sidebar-premium button,
          .sidebar-premium [role="menuitem"] {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
