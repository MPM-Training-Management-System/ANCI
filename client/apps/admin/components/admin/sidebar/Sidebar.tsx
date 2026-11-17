
"use client";

import { useCallback, useRef } from "react";
import type { PointerEvent } from "react";

import { SidebarProps } from "./types";

import SidebarHeader from "./SidebarHeader";
import SidebarMenu from "./SidebarMenu";
import SidebarFooter from "./SidebarFooter";

export default function Sidebar({
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement>(null);
  const activeItemRef = useRef<HTMLElement | null>(null);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType === "touch") return;

      const sidebar = sidebarRef.current;
      if (!sidebar) return;

      const rect = sidebar.getBoundingClientRect();

      sidebar.style.setProperty(
        "--pointer-x",
        `${event.clientX - rect.left}px`
      );

      sidebar.style.setProperty(
        "--pointer-y",
        `${event.clientY - rect.top}px`
      );

      const target = document.elementFromPoint(
        event.clientX,
        event.clientY
      );

      const item = target?.closest<HTMLElement>(
        'a, button, [role="menuitem"]'
      );

      const nextItem =
        item && sidebar.contains(item) ? item : null;

      if (activeItemRef.current === nextItem) return;

      if (activeItemRef.current) {
        activeItemRef.current.style.transform = "";
        activeItemRef.current.style.transition = "";
        activeItemRef.current.style.willChange = "";
      }

      activeItemRef.current = nextItem;

      if (nextItem) {
        nextItem.style.transition =
          "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)";
        nextItem.style.willChange = "transform";
        nextItem.style.transform =
          "translate3d(0, -3px, 0) scale(1.015)";
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
    <aside
      ref={sidebarRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`
        sidebar-premium
        fixed
        left-0
        top-0
        bottom-0
        z-50
        flex
        flex-col
        overflow-hidden
        border-r
        border-white/[0.08]
        text-white
        shadow-2xl
        transition-[width]
        duration-300
        ease-in-out
        ${collapsed ? "w-24" : "w-72"}
      `}
    >
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="sidebar-orb sidebar-orb-top" />
        <div className="sidebar-orb sidebar-orb-bottom" />
        <div className="sidebar-dots" />
        <div className="sidebar-light" />
        <div className="sidebar-bottom-glow" />
      </div>

      {/* Top accent */}
      <div className="absolute left-0 right-0 top-0 z-20 h-[3px] bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500" />

      {/* Sidebar content */}
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {/* Header */}
        <div className="relative shrink-0 border-b border-white/[0.09]">
          <SidebarHeader collapsed={collapsed} />
        </div>

        {/* Menu */}
        <div className="relative min-h-0 flex-1 overflow-y-auto sidebar-menu-scroll">
          <div className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <SidebarMenu collapsed={collapsed} />
        </div>

        {/* Footer */}
        <div className="relative shrink-0 border-t border-white/[0.09] bg-slate-950/15">
          <div className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/20 to-transparent" />

          <SidebarFooter collapsed={collapsed} />
        </div>
      </div>

      <style jsx global>{`
        .sidebar-premium {
          background-color: #071a35;
          background-image:
            radial-gradient(
              260px circle at var(--pointer-x, -999px)
                var(--pointer-y, -999px),
              rgba(96, 165, 250, 0.17),
              rgba(59, 130, 246, 0.06) 42%,
              transparent 75%
            ),
            linear-gradient(
              155deg,
              #0b2548 0%,
              #071b38 48%,
              #06152d 100%
            );
        }

        .sidebar-orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(60px);
        }

        .sidebar-orb-top {
          top: -100px;
          right: -110px;
          width: 230px;
          height: 230px;
          background: rgba(37, 99, 235, 0.23);
        }

        .sidebar-orb-bottom {
          bottom: 15%;
          left: -140px;
          width: 240px;
          height: 240px;
          background: rgba(14, 165, 233, 0.10);
        }

        .sidebar-dots {
          position: absolute;
          inset: 0;
          opacity: 0.12;
          background-image: radial-gradient(
            rgba(191, 219, 254, 0.7) 0.7px,
            transparent 0.7px
          );
          background-size: 19px 19px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 78%
          );
        }

        .sidebar-light {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            240px circle at var(--pointer-x, -999px)
              var(--pointer-y, -999px),
            rgba(125, 211, 252, 0.08),
            transparent 75%
          );
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
        }

        .sidebar-premium a,
        .sidebar-premium button,
        .sidebar-premium [role="menuitem"] {
          transform-origin: center;
        }

        .sidebar-menu-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.25) transparent;
        }

        .sidebar-menu-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-menu-scroll::-webkit-scrollbar-thumb {
          border-radius: 9999px;
          background: rgba(148, 163, 184, 0.25);
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
    </aside>
  );
}
