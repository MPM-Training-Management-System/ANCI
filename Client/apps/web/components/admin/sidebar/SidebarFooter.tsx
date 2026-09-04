"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

import {
  Button,
  ConfirmDialog,
  Spinner,
} from "@repo/ui/index";

import { auth } from "@/lib/auth";

import { SidebarFooterProps } from "./types";

export default function SidebarFooter({
  collapsed,
}: SidebarFooterProps) {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);

      auth.logout();

      router.push("/");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      {/* Footer */}
      <div
        className="
          shrink-0
          border-t
          border-white/10
          p-4
        "
      >
        <Button
          variant="ghost"
          onClick={() => setOpen(true)}
          disabled={loading}
          className={`
            min-h-12
            rounded-xl
            bg-white/5
            text-white/80
            transition-all
            hover:bg-red-500
            hover:text-white

            ${
              collapsed
                ? "flex h-12 w-12 items-center justify-center p-0"
                : "flex w-full items-center gap-3 px-4 py-3"
            }

            /* Mobile */
            max-md:!flex
            max-md:!h-12
            max-md:!w-full
            max-md:!justify-start
            max-md:!gap-3
            max-md:!px-4
            max-md:!py-3
          `}
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <LogOut
                size={20}
                className="shrink-0"
              />

              {!collapsed && (
                <span className="font-medium">
                  Logout
                </span>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Confirm Logout */}
      <ConfirmDialog
        open={open}
        title="Logout"
        description="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onCancel={() =>
          setOpen(false)
        }
        onConfirm={handleLogout}
      />
    </>
  );
}