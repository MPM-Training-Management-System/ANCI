"use client";

import { Avatar, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@repo/ui/index";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@repo/ui/index";

export default function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <h2 className="text-lg font-semibold text-gray-700">
        Dashboard
      </h2>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">
            Ralph Joed
          </p>

          <p className="text-xs text-gray-500">
            Administrator
          </p>
        </div>

       <TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full outline-none focus:ring-2 focus:ring-primary">
            <Avatar
              size="sm"
              fallback="RJ"
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem>
            Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipTrigger>

    <TooltipContent>
      Account
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
      </div>
    </header>
  );
}