"use client";

import {
  NavbarProps,
} from "./navbar/types";

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
        flex
        h-20
        items-center
        justify-between
        rounded-3xl
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
          name="Ralph Joed"
          role="Administrator"
        />

      </div>
    </header>
  );
}