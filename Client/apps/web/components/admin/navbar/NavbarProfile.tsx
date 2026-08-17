"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import type { LoginUser } from "@repo/api";
import { authApi,auth } from "@/lib/api";


import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/index";

export default function NavbarProfile() {
  const router = useRouter();
  const [user, setUser] = useState<LoginUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await authApi.me();
        console.log(data);
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadUser();
  }, []);

  if (!user) return null;

  const initials =
    user.fullName
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() ?? "U";

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
              {user.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user.fullName || "Profile"}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#002B5C] font-semibold text-white">
                  {initials}
                </div>
              )}

              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            </div>

            <div className="hidden text-left lg:block">
              <h4 className="text-sm font-semibold text-gray-900">
                {user.username}
              </h4>

              <p className="text-xs text-gray-500">
                {user.role}
              </p>
            </div>

            <ChevronDown
              size={18}
              className="hidden text-gray-500 lg:block"
            />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <div className="px-3 py-2">
          <p className="text-sm font-semibold">
            {user.fullName}
          </p>

          <p className="text-xs text-gray-500">
            {user.email}
          </p>

          <p className="text-xs text-gray-500">
            {user.role}
          </p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

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