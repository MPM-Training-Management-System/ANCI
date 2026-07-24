"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

import {
  Button,
  ConfirmDialog,
  Spinner,
} from "@repo/ui/index";

import { auth } from "@repo/api";

import { SidebarFooterProps } from "./types";

export default function SidebarFooter({
  collapsed,
}: SidebarFooterProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
      <div className="border-t border-white/10 p-4">
        <Button
          variant="ghost"
          onClick={() => setOpen(true)}
          className={`
            w-full rounded-xl
            ${
              collapsed
                ? "flex h-12 w-12 items-center justify-center p-0"
                : "flex items-center gap-3 px-4 py-3"
            }
            bg-white/5
            text-white/80
            hover:bg-red-500
            hover:text-white
            transition-all
          `}
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <LogOut size={20} />

              {!collapsed && (
                <span className="font-medium">
                  Logout
                </span>
              )}
            </>
          )}
        </Button>
      </div>

      <ConfirmDialog
        open={open}
        title="Logout"
        description="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onCancel={() => setOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}