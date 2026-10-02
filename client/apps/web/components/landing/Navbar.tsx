"use client";

import { useState } from "react";
import Link from "next/link";

const navigation = [
  {
    label: "Home",
    href: "#home",
  },
  {
    label: "Why Join",
    href: "#why-join",
  },
  {
    label: "Training",
    href: "#programs",
  },
  {
    label: "Services",
    href: "#services",
  },
  {
    label: "Faculty",
    href: "#faculty",
  },
  {
    label: "Governance",
    href: "#governance",
  },
  {
    label: "Testimonials",
    href: "#testimonials",
  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link
          href="#home"
          onClick={closeMenu}
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl ">
            <img
              src="/ANCILOGO.png"
              alt="ACE NextGen"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="hidden sm:block">
            <p className="font-[var(--font-jakarta)] text-sm font-extrabold tracking-tight text-[#0b1c30]">
              ACE NEXTGEN
            </p>

            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Consultancy Inc.
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1">
          {navigation.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                index === 0
                  ? "bg-[#dce9ff] font-bold text-[#0b1c30]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#2563eb]"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-[#2563eb]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-[#002b5c] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0d2142] hover:shadow-lg"
          >
            Apply Now
          </Link>

          <Link
            href="/login"
            aria-label="Login"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#002b5c] text-white transition hover:bg-[#2563eb]"
          >
            <span className="text-sm">→</span>
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#0b1c30] xl:hidden"
          aria-label="Toggle navigation"
        >
          {isOpen ? (
            <span className="text-xl">×</span>
          ) : (
            <span className="text-xl">☰</span>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-6 py-5 shadow-xl xl:hidden">
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#eff4ff] hover:text-[#2563eb]"
              >
                {item.label}
              </a>
            ))}

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <Link
                href="/login"
                onClick={closeMenu}
                className="rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={closeMenu}
                className="rounded-lg bg-[#002b5c] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Apply Now
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}