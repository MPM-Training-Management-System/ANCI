"use client";

import Image from "next/image";
import Link from "next/link";

import Logo from "@/assets/image/ANCILOGO.png";

import { SidebarHeaderProps } from "./types";

export default function SidebarHeader({
  collapsed,
}: SidebarHeaderProps) {
  return (
    <div className="shrink-0 px-4 py-5">
      <Link
        href="/dashboard"
        className={`
          flex
          min-w-0
          items-center
          rounded-xl
          transition-colors
          hover:bg-white/5

          ${collapsed
            ? "justify-center p-1"
            : "gap-3 px-2 py-2"
          }

          /* On mobile, sidebar is always full width */
          max-md:!justify-start
          max-md:gap-3
          max-md:px-2
          max-md:py-2
        `}
      >
        {/* Logo */}
        <div
          className="
            relative
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-white
            shadow
          "
        >
          <Image
            src={Logo}
            alt="ACE NextGen"
            width={36}
            height={36}
            priority
            className="object-contain"
          />
        </div>

        {/* Company Name */}
        <div
          className={`
            min-w-0
            overflow-hidden

            ${collapsed
              ? "md:hidden"
              : "block"
            }
          `}
        >
          <h1
            className="
              truncate
              text-lg
              font-bold
              tracking-tight
              text-white
            "
          >
            ACE NEXTGEN
          </h1>

          <p
            className="
              truncate
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.25em]
              text-yellow-400
            "
          >
            Consultancy Inc.
          </p>
        </div>
      </Link>
    </div>
  );
}