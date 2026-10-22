
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  ChevronDown,
  LogOut,
  Settings,
  User,
  AlertTriangle,
} from "lucide-react";

import { useAdminMe } from "@repo/hooks";
import { adminApi } from "@/lib/api";
import { auth } from "@/lib/auth";

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@repo/ui/index";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/index";

export default function NavbarProfile() {
  const { profile } = useAdminMe(adminApi);
  const router = useRouter();

  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleLogout = () => {
    auth.logout();
    router.push("/");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            aria-label="Open profile menu"
            className="
              flex h-11 max-w-full items-center gap-2
              rounded-xl border border-gray-200 bg-white
              px-2 shadow-sm transition-colors
              hover:bg-gray-50
              sm:h-12 sm:gap-3 sm:px-3
            "
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full sm:h-10 sm:w-10">
              <Image
                src="/assets/image/ANCILOGO.png"
                alt="Profile"
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>

            <div className="hidden min-w-0 text-left md:block">
              <h4 className="max-w-[180px] truncate text-sm font-semibold text-gray-900">
                {profile?.fullName || "Admin"}
              </h4>

              <p className="max-w-[180px] truncate text-xs text-gray-500">
                {profile?.role || "Administrator"}
              </p>
            </div>

            <ChevronDown
              size={16}
              className="shrink-0 text-gray-500"
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-[min(18rem,calc(100vw-1rem))] rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
        >
          <div className="min-w-0 px-3 py-3">
            <p className="truncate text-sm font-semibold text-gray-900">
              {profile?.fullName || "Admin"}
            </p>

            <p className="mt-1 break-all text-xs text-gray-500">
              {profile?.email || "No email available"}
            </p>

            <p className="mt-1 truncate text-xs text-gray-500">
              {profile?.role || "Administrator"}
            </p>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="cursor-pointer rounded-lg py-2.5">
            <User className="mr-2 h-4 w-4 shrink-0" />
            <span>Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer rounded-lg py-2.5">
            <Settings className="mr-2 h-4 w-4 shrink-0" />
            <span>Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setShowLogoutAlert(true);
            }}
            className="cursor-pointer rounded-lg py-2.5 text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4 shrink-0" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Logout Confirmation Alert */}
      {showLogoutAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md">
            <Alert
              variant="warning"
              className="rounded-2xl border-yellow-200 bg-white p-5 shadow-2xl sm:p-6"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                  <AlertTriangle className="h-5 w-5 text-yellow-700" />
                </div>

                <div className="min-w-0 flex-1">
                  <AlertTitle className="text-base text-gray-900">
                    Confirm Logout
                  </AlertTitle>

                  <AlertDescription className="mt-2 text-sm text-gray-600">
                    Are you sure you want to log out of your admin
                    account? You will need to log in again to access
                    the admin dashboard.
                  </AlertDescription>
                </div>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowLogoutAlert(false)}
                  className="w-full rounded-lg sm:w-auto"
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg bg-red-600 text-white hover:bg-red-700 sm:w-auto"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Yes, Logout
                </Button>
              </div>
            </Alert>
          </div>
        </div>
      )}
    </>
  );
}
