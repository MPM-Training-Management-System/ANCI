"use client";

import { Menu } from "lucide-react";

import { NavbarProps } from "./navbar/types";

import NavbarCollapse from "./navbar/NavbarCollapse";
import NavbarTitle from "./navbar/NavbarTitle";
import NavbarNotification from "./navbar/NavbarNotification";
import NavbarProfile from "./navbar/NavbarProfile";

export default function Navbar({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: NavbarProps) {
  return (
    <header
      className={`
        fixed
        top-3
        left-3
        right-3
        z-[90]

        flex
        h-16
        items-center
        justify-between
        gap-2

        rounded-2xl
        border
        border-gray-200/80
        bg-white/95
        px-3
        shadow-lg
        backdrop-blur-xl

        transition-all
        duration-300

        sm:top-4
        sm:h-20
        sm:rounded-3xl
        sm:px-4

        md:right-4
        md:top-4

        ${
          collapsed
            ? "md:left-[144px]"
            : "md:left-[336px]"
        }

        ${
          mobileOpen
            ? "pointer-events-none opacity-0 md:pointer-events-auto md:opacity-100"
            : "opacity-100"
        }
      `}
    >
      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div
        className="
          flex
          min-w-0
          flex-1
          items-center
          gap-2
          sm:gap-3
          md:gap-4
        "
      >
        {/* =================================================
            MOBILE HAMBURGER
        ================================================= */}

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl

            text-gray-700

            transition-colors
            duration-200

            hover:bg-gray-100
            active:bg-gray-200

            md:hidden
          "
        >
          <Menu
            size={22}
            strokeWidth={2}
          />
        </button>

        {/* =================================================
            DESKTOP COLLAPSE BUTTON
        ================================================= */}

        <div className="hidden md:block">
          <NavbarCollapse
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </div>

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div
          className="
            hidden
            h-8
            w-px
            shrink-0
            bg-gray-200
            sm:block
          "
        />

        {/* =================================================
            TITLE
        ================================================= */}

        <div
          className="
            min-w-0
            flex-1
            overflow-hidden
          "
        >
          <NavbarTitle
            title="Dashboard"
            subtitle="Welcome back! Here's what's happening today."
          />
        </div>
      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div
        className="
          flex
          shrink-0
          items-center
          gap-1

          sm:gap-2
          md:gap-3
        "
      >
        {/* =================================================
            ACTIVE TRAINING
        ================================================= */}

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
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
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

            <div
              className="
                mt-0.5
                flex
                items-center
                gap-1.5
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-emerald-500
                "
              />

              <span
                className="
                  text-[9px]
                  text-gray-400
                "
              >
                Active Training
              </span>
            </div>
          </div>
        </div>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <NavbarNotification
          notificationCount={3}
          messageCount={1}
        />

        {/* =================================================
            DIVIDER
        ================================================= */}

        <div
          className="
            hidden
            h-9
            w-px
            bg-gray-200
            sm:block
          "
        />

        {/* =================================================
            PROFILE
        ================================================= */}

        <NavbarProfile />
      </div>
    </header>
  );
}