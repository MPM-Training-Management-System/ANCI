"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  LogOut,
  X,
  AlertTriangle,
} from "lucide-react";

import {
  Button,
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

  const handleLogout = async () => {
    try {
      setLoading(true);

      auth.logout();

      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      {/* =====================================================
          SIDEBAR FOOTER
          ===================================================== */}
      <div
        className="
          shrink-0
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
            duration-200
            hover:bg-red-500
            hover:text-white

            ${
              collapsed
                ? "flex h-12 w-12 items-center justify-center p-0"
                : "flex w-full items-center gap-3 px-4 py-3"
            }

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
                strokeWidth={2}
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

      {/* =====================================================
          LOGOUT MODAL
          ===================================================== */}
      {open && (
        <div
          className="
            fixed
            inset-0
            z-[999]
            flex
            items-center
            justify-center
            bg-black/45
            px-4
            backdrop-blur-[4px]
          "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          {/* =================================================
              MODAL CARD
              ================================================= */}
          <div
            className="
              relative
              w-full
              max-w-[420px]
              overflow-hidden
              rounded-[24px]
              bg-white
              shadow-[0_25px_70px_rgba(0,0,0,0.20)]
              animate-in
              fade-in
              zoom-in-95
              duration-200
            "
          >
            {/* =================================================
                CLOSE BUTTON
                ================================================= */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
              aria-label="Close logout dialog"
              className="
                absolute
                right-5
                top-5
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-slate-100
                text-slate-500
                transition
                hover:bg-slate-200
                hover:text-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <X size={18} />
            </button>

            {/* =================================================
                CONTENT
                ================================================= */}
            <div className="px-7 pb-7 pt-8 sm:px-8 sm:pb-8">
              {/* Icon */}
              <div
                className="
                  mb-6
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-50
                  text-red-500
                "
              >
                <AlertTriangle
                  size={26}
                  strokeWidth={2}
                />
              </div>

              {/* Title */}
              <h2
                className="
                  pr-10
                  text-xl
                  font-bold
                  tracking-tight
                  text-[#0d2142]
                "
              >
                Logout from your account?
              </h2>

              {/* Description */}
              <p
                className="
                  mt-2
                  max-w-[340px]
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                You will be signed out of your ACE
                NextGen account and returned to the
                login page.
              </p>

              {/* =================================================
                  ACTIONS
                  ================================================= */}
              <div
                className="
                  mt-7
                  flex
                  flex-col-reverse
                  gap-3
                  sm:flex-row
                  sm:justify-end
                "
              >
                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="
                    h-11
                    rounded-xl
                    bg-slate-100
                    px-5
                    text-sm
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-200
                    hover:text-slate-800
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    sm:min-w-[110px]
                  "
                >
                  Cancel
                </button>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loading}
                  className="
                    flex
                    h-11
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#002b5c]
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#0d2142]
                    disabled:cursor-not-allowed
                    disabled:opacity-70
                    sm:min-w-[110px]
                  "
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogOut
                        size={17}
                        strokeWidth={2.2}
                      />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}