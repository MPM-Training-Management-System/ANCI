"use client";

import {
  useEffect,
  useState,
} from "react";

import { auth } from "@/lib/auth";

import { sidebarMenu } from "./menu";
import SidebarItem from "./SidebarItem";
import { SidebarMenuProps } from "./types";

interface StoredUser {
  id?: string;
  role?: string;
  status?: string;
  isActive?: boolean;
}

export default function SidebarMenu({
  collapsed,
}: SidebarMenuProps) {
  const [user, setUser] =
    useState<StoredUser | null>(
      null
    );

  // =========================================================
  // LOAD USER
  // =========================================================

  useEffect(() => {
    const storedUser =
      auth.getUser();

    setUser(
      storedUser
    );
  }, []);

  // =========================================================
  // CHECK TRAINER
  // =========================================================

  const isTrainer =
    user?.role?.toLowerCase() ===
    "trainer";

  // =========================================================
  // CHECK ACTIVE
  // =========================================================

  /*
   * Supports both:
   *
   * status: "Active"
   *
   * and
   *
   * isActive: true
   */

  const isActive =
    user?.isActive === true ||
    user?.status?.toLowerCase() ===
      "active";

  // =========================================================
  // PENDING TRAINER
  // =========================================================

  const isPendingTrainer =
    isTrainer &&
    !isActive;

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {sidebarMenu.map(
        (section) => (
          <div
            key={
              section.title
            }
            className="mb-6"
          >
            {/* =================================================
                SECTION TITLE
            ================================================= */}

            {!collapsed && (
              <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                {section.title}
              </h3>
            )}

            {/* =================================================
                MENU ITEMS
            ================================================= */}

            <div className="space-y-1">
              {section.items.map(
                (item) => {

                  /*
                   * Pending trainer:
                   *
                   * Lock everything except Settings.
                   */

                  const locked =
                    isPendingTrainer &&
                    item.href !==
                      "/setting";

                  return (
                    <SidebarItem
                      key={
                        item.href
                      }
                      item={
                        item
                      }
                      collapsed={
                        collapsed
                      }
                      locked={
                        locked
                      }
                    />
                  );
                }
              )}
            </div>
          </div>
        )
      )}
    </nav>
  );
}