"use client";
import Image from "next/image";
import Link from "next/dist/client/link";
import type { ReactNode } from "react";
import Logo from "@/assets/image/ANCILOGO.png";
interface TrainerLayoutProps {
  children: ReactNode;
}

export default function TrainerLayout({
  children,
}: TrainerLayoutProps) {
  return (
    <div>
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
            <Link
              href="/"
              className="flex items-center gap-3"
            >
              <Image
                src={Logo}
                alt="ACE NextGen"
                width={48}
                height={48}
                className="h-11 w-11 object-contain"
              />

              <div>
                <p className="text-sm font-bold tracking-wide text-[#002b5c]">
                  ACE NEXTGEN
                </p>

                <p className="text-[11px] text-[#3B7597]">
                  Consultancy Inc.
                </p>
              </div>
            </Link>

            <Link
              href="/login"
              className="text-sm font-semibold text-[#3B7597] transition hover:text-[#002b5c]"
            >
              Already have an account?
              <span className="ml-1 text-[#002b5c]">
                Sign in
              </span>
            </Link>
          </div>
        </header>
    
    <div className="min-h-screen bg-slate-50">
      <main className="min-h-screen">
        {children}
      </main>
    </div>
    </div>
  );
}