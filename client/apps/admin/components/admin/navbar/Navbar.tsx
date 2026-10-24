"use client";

import {
  NavbarProps,
} from "./types";

import NavbarCollapse from "./NavbarCollapse";
import NavbarTitle from "./NavbarTitle";
import NavbarProfile from "./NavbarProfile";

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
        
        z-90

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
      {/* Left */}
      <div className="flex items-center gap-5">
        <NavbarCollapse
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <NavbarTitle
          title="Dashboard"
          subtitle="Welcome back! Here's what's happening today."
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        <NavbarProfile
        />

      </div>
    </header>
  );
}