"use client";

import {
  Bell,
  MessageCircle,
} from "lucide-react";

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/index";

import { NavbarNotificationProps } from "./types";

export default function NavbarNotification({
  notificationCount = 3,
  messageCount = 1,
}: NavbarNotificationProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-2">

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="
                relative
                h-10
                w-10
                rounded-xl
                border
                border-gray-200
                bg-white
                shadow-sm
                hover:bg-gray-100
              "
            >
              <Bell size={19} />

              {notificationCount > 0 && (
                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    h-5
                    min-w-[20px]
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    px-1
                    text-[10px]
                    font-bold
                    text-white
                  "
                >
                  {notificationCount > 99
                    ? "99+"
                    : notificationCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            Notifications
          </TooltipContent>
        </Tooltip>

        {/* Messages */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="
                relative
                h-10
                w-10
                rounded-xl
                border
                border-gray-200
                bg-white
                shadow-sm
                hover:bg-gray-100
              "
            >
              <MessageCircle size={19} />

              {messageCount > 0 && (
                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    flex
                    h-5
                    min-w-[20px]
                    items-center
                    justify-center
                    rounded-full
                    bg-red-500
                    px-1
                    text-[10px]
                    font-bold
                    text-white
                  "
                >
                  {messageCount > 99
                    ? "99+"
                    : messageCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            Messages
          </TooltipContent>
        </Tooltip>

      </div>
    </TooltipProvider>
  );
}