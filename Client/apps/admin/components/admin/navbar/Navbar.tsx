"use client";

import {
  NavbarProps,
} from "./types";

import NavbarCollapse from "./NavbarCollapse";
import NavbarTitle from "./NavbarTitle";

import NavbarNotification from "./NavbarNotification";
import NavbarProfile from "./NavbarProfile";

export default function Navbar({
  collapsed,
  setCollapsed,
}: NavbarProps) {
  return (
    <header
      className="
      fixed
      left-72
      right-0
      z-90
      top-0
        flex
        h-20
        items-center
        justify-between
        
        border
        border-gray-200
        bg-white
        px-6
        shadow-lg
      "
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

        <NavbarNotification
          notificationCount={3}
          messageCount={1}
        />

        <NavbarProfile
        />

      </div>
    </header>
  );
}