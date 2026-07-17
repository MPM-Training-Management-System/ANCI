"use client";

import {
  Avatar,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@repo/ui/index";

import {
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

type NavbarProps = {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Navbar({
  collapsed,
  setCollapsed,
}: NavbarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-2 transition hover:bg-gray-100"
        >
          {collapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>

        <h2 className="text-lg font-semibold text-gray-700">
          Dashboard
        </h2>
      </div>

      {/* Right */}
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