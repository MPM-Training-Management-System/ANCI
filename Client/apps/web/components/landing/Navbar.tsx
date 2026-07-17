"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Logo from "@/assets/image/ANCILOGO.png";
import { Button, Skeleton } from "@repo/ui/index";

const navLinks = [
  {
    title: "Services",
    href: "#services",
  },
  {
    title: "Our Mission",
    href: "#mission",
  },
  {
    title: "Certifications",
    href: "#certificate",
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const timer = setTimeout(() => setLoading(false), 2000);

  return () => clearTimeout(timer);
}, []);
  return (
    <header className="fixed top-0 right-0 left-0 pt-5 bg-transparent z-50 px-4 lg:px-8">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between rounded-full border border-white/40 bg-white/80 px-6 shadow-[0_15px_45px_rgba(0,0,0,0.08)] backdrop-blur-2xl transition-all duration-300 lg:px-8">

        {loading ? (
  <div className="flex items-center gap-3">
    <Skeleton className="h-14 w-14 rounded-full" />

    <div className="space-y-2">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-3 w-28" />
    </div>
  </div>
) : (
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={Logo}
            alt="Logo"
            width={58}
            height={58}
            className="rounded-full object-cover"
          />

          <div className="flex flex-col leading-tight">
            <h1 className="text-2xl font-extrabold tracking-tight">
              <span className="text-primary">ACE </span>

              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                NEXTGEN
              </span>
            </h1>

            <span className="text-[11px] font-semibold uppercase tracking-[0.30em] text-primary/60">
              Consultancy Inc.
            </span>
          </div>
        </Link>)}

        {/* Desktop Menu */}
        <nav className=" hidden items-center gap-10 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="relative text-sm font-semibold uppercase tracking-widest text-primary transition-all duration-300 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-secondary after:transition-all after:duration-300 hover:text-secondary hover:after:w-full"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Desktop Button */}
        <div className="hidden md:block">
          <Button  variant="primary"  onClick={() => {
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth",
    });
  }}>
            Book Consultation
          </Button>
        </div>

        {/* Mobile Button */}
        <Button
          variant="ghost"
          onClick={() => setOpen(!open)}
          className="rounded-full p-2 md:hidden"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-3xl border border-white/30 bg-white/90 shadow-xl backdrop-blur-xl md:hidden">
          <nav className="flex flex-col p-6">
            {navLinks.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-gray-100 py-4 font-semibold text-primary transition hover:text-secondary"
              >
                {item.title}
              </Link>
            ))}

            <Button
              variant="primary"
              onClick={() => {
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth",
    });
  }}
              
            >
              Book Consultation
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}