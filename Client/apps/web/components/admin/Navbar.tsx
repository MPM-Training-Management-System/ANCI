"use client";

import { NavbarProps } from "./navbar/types";

import NavbarCollapse from "./navbar/NavbarCollapse";
import NavbarTitle from "./navbar/NavbarTitle";
import NavbarNotification from "./navbar/NavbarNotification";
import NavbarProfile from "./navbar/NavbarProfile";

export default function Navbar({
  collapsed,
  setCollapsed,
}: NavbarProps) {
  return (
    <header
      className="
        fixed
        left-80
        right-0
        top-4
        z-[90]
        mx-4
        flex
        h-20
        items-center
        justify-between
        rounded-3xl
        border
        border-gray-200/80
        bg-white/95
        px-5
        shadow-lg
        backdrop-blur-xl
        transition-all
        duration-300
      "
    >
      {/* =====================================================
          LEFT SIDE
      ====================================================== */}

      <div className="flex min-w-0 items-center gap-4">

        <NavbarCollapse
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div className="h-8 w-px bg-gray-200" />

        <NavbarTitle
          title="Dashboard"
          subtitle="Welcome back! Here's what's happening today."
        />

      </div>

      {/* =====================================================
          RIGHT SIDE
      ====================================================== */}

      <div className="flex shrink-0 items-center gap-3">

        {/* ===================================================
            CURRENT TRAINING
        ==================================================== */}

        <div
          className="
            hidden
            items-center
            gap-3
            rounded-2xl
            border
            border-gray-200
            bg-gray-50
            px-3
            py-2
            xl:flex
          "
        >

          {/* Training Icon */}

          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-[#191c1e]
              text-xs
              font-bold
              text-white
            "
          >
            CS
          </div>

          {/* Training Info */}

          <div className="min-w-0">

            <p
              className="
                max-w-[170px]
                truncate
                text-[10px]
                font-bold
                text-gray-800
              "
            >
              Computer Systems Servicing
            </p>

            <div className="mt-0.5 flex items-center gap-1.5">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span className="text-[9px] text-gray-400">
                Active Training
              </span>

            </div>

          </div>

        </div>

        {/* ===================================================
            NOTIFICATIONS
        ==================================================== */}

        <NavbarNotification
          notificationCount={3}
          messageCount={1}
        />

        {/* Divider */}

        <div className="hidden h-9 w-px bg-gray-200 sm:block" />

        {/* ===================================================
            PROFILE
        ==================================================== */}

        <NavbarProfile />

      </div>
    </header>
  );
}