"use client";

import {
  useEffect,
  useState,
} from "react";

import { auth } from "@/lib/auth";
import { authApi } from "@/lib/api";

import { useTrainerApplication } from "@/hooks/useTrainerApplication";

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
    useState<StoredUser | null>(null);

  useEffect(() => {
    const storedUser = auth.getUser();

    setUser(storedUser);
  }, []);

  const isTrainer =
    user?.role?.toLowerCase() === "trainer";

  const {
    application,
  } = useTrainerApplication(authApi);

  const applicationStatus =
    application?.status?.toLowerCase();

  const isApproved =
    applicationStatus === "approved";

  return (
    <nav
      className="
        min-h-0
        flex-1
        overflow-y-auto
        overflow-x-hidden
        px-3
        py-2
        scrollbar-thin
        scrollbar-thumb-white/10
        scrollbar-track-transparent
      "
    >
      {sidebarMenu.map((section) => (
        <div
          key={section.title}
          className="mb-6"
        >
          {!collapsed && (
            <h3
              className="
                mb-2
                px-3
                text-[10px]
                font-bold
                uppercase
                tracking-[0.25em]
                text-white/40
              "
            >
              {section.title}
            </h3>
          )}

          <div className="space-y-1">
            {section.items.map((item) => {
              const isApplicationPage =
                item.href === "/trainer-application";

              const locked =
                isTrainer &&
                !isApproved &&
                !isApplicationPage;

              return (
                <SidebarItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  locked={locked}
                />
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}