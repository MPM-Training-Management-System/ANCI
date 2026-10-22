
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  LogOut,
  AlertTriangle,
} from "lucide-react";

import {
  Button,
  Alert,
  AlertTitle,
  AlertDescription,
  Spinner,
} from "@repo/ui/index";

import { auth } from "@/lib/auth";
import { SidebarFooterProps } from "./types";

export default function SidebarFooter({
  collapsed,
}: SidebarFooterProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    if (loading) return;

    try {
      setLoading(true);

      auth.logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Sidebar Logout Button */}
      <div className="border-t border-white/10 p-2 sm:p-4">
        <Button
          variant="ghost"
          disabled={loading}
          onClick={() => setOpen(true)}
          aria-label={collapsed ? "Logout" : undefined}
          className={`
            flex h-11 w-full rounded-xl
            transition-colors duration-200
            ${
              collapsed
                ? "items-center justify-center p-0 sm:h-12 sm:w-12"
                : "items-center gap-3 px-3 py-3 sm:px-4"
            }
            bg-white/5
            text-white/80
            hover:bg-red-500
            hover:text-black
            disabled:cursor-not-allowed
            disabled:opacity-60
          `}
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <LogOut size={20} className="shrink-0" />

              {!collapsed && (
                <span className="truncate font-medium">
                  Logout
                </span>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Reusable Logout Confirmation Alert */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loading) {
              setOpen(false);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="sidebar-logout-title"
            aria-describedby="sidebar-logout-description"
            className="w-full max-w-md"
          >
            <Alert
              variant="warning"
              className="rounded-2xl border-yellow-200 bg-white p-5 shadow-2xl sm:p-6"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                  <AlertTriangle className="h-5 w-5 text-yellow-700" />
                </div>

                <div className="min-w-0 flex-1">
                  <AlertTitle
                    id="sidebar-logout-title"
                    className="text-base text-gray-900"
                  >
                    Confirm Logout
                  </AlertTitle>

                  <AlertDescription
                    id="sidebar-logout-description"
                    className="mt-2 text-sm text-gray-600"
                  >
                    Are you sure you want to log out of your
                    admin account? You will need to log in again
                    to access the dashboard.
                  </AlertDescription>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => setOpen(false)}
                  className="w-full rounded-lg sm:w-auto"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  disabled={loading}
                  onClick={handleLogout}
                  className="w-full rounded-lg bg-red-600 text-white hover:bg-red-700 sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" />
                      <span className="ml-2">Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Yes, Logout
                    </>
                  )}
                </Button>
              </div>
            </Alert>
          </div>
        </div>
      )}
    </>
  );
}
