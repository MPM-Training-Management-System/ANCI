
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import { useAdminMe } from "@repo/hooks";

import { adminApi } from "@/lib/api";
import { auth } from "@/lib/auth";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/index";

export default function NavbarProfile() {
  const {
    profile,
    isLoading,
    error,
    refetch,
  } = useAdminMe(adminApi);

  console.log("PROFILE DATA:", profile);

  const router = useRouter();

  const handleLogout = () => {
    auth.logout();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-12 rounded-xl border border-gray-200 bg-white px-3 shadow-sm hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
                <Image
                  src="/assets/image/ANCILOGO.png"
                  alt={profile?.fullName || "Profile"}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
            </div>

            {/* ============================================ */}
            {/* NAME + ROLE */}
            {/* ============================================ */}

            <div className="hidden text-left lg:block">
              <h4 className="text-sm font-semibold text-gray-900">
                {profile?.fullName}
              </h4>

              <p className="text-xs text-gray-500">
                {profile?.role}
              </p>
            </div>

            {/* ============================================ */}
            {/* DROPDOWN ICON */}
            {/* ============================================ */}

            <ChevronDown
              size={18}
              className="hidden text-gray-500 lg:block"
            />
          </div>
        </Button>
      </DropdownMenuTrigger>

      {/* ============================================== */}
      {/* DROPDOWN CONTENT */}
      {/* ============================================== */}

      <DropdownMenuContent align="end">
        {/* Profile Information */}
        <div className="px-3 py-2">
          <p className="text-sm font-semibold">
            {profile?.fullName}
          </p>

          <p className="text-xs text-gray-500">
            {profile?.email}
          </p>

          <p className="text-xs text-gray-500">
            {profile?.role}
          </p>
        </div>

        <DropdownMenuSeparator />

        {/* Profile */}
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        {/* Settings */}
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

