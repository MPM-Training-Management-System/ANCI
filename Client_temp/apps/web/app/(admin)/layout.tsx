"use client";

import { useState } from "react";

import ProtectedRoute from "@/components/admin/ProtectedRoute";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // =========================================
  // DESKTOP SIDEBAR
  // false = expanded (320px)
  // true  = collapsed (128px)
  // =========================================

  const [
    collapsed,
    setCollapsed,
  ] = useState(false);

  // =========================================
  // MOBILE SIDEBAR
  // false = closed
  // true  = open
  // =========================================

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface">
        {/* =====================================
            SIDEBAR
            ===================================== */}

        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* =====================================
            MAIN WRAPPER
            ===================================== */}

        <div
          className={`
            min-h-screen
            ml-0

            transition-[margin]
            duration-300
            ease-in-out

            ${
              collapsed
                ? "md:ml-32"
                : "md:ml-80"
            }
          `}
        >
          <div
            className="
              flex
              min-h-screen
              flex-col

              p-3
              sm:p-4
              md:p-4
            "
          >
            {/* =================================
                NAVBAR
                ================================= */}

            <Navbar
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
            />

            {/* =================================
                CONTENT
                ================================= */}

            <main
              className="
                mt-20
                flex-1

                sm:mt-24
                md:mt-25
              "
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}