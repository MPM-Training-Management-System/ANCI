"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  ChevronDown,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/index";

import { NavbarProfileProps } from "./types";
import { auth } from "@/lib/auth";

export default function NavbarProfile({
  name,
  role,
  image,
}: NavbarProfileProps) {
  const router = useRouter();

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

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
            {/* Avatar */}
            <div className="relative">
              {image ? (
                <Image
                  src={image}
                  alt={name}
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
                {name}
              </h4>

              <p className="text-xs text-gray-500">
                {role}
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
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-xs text-gray-500">{role}</p>
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