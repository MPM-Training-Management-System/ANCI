"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
} from "lucide-react";

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth",
    });

    setOpen(false);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 lg:px-8 lg:pt-5">

      {/* ========================================================= */}
      {/* NAVBAR */}
      {/* ========================================================= */}

      <div
        className="
          mx-auto
          flex
          h-[72px]
          max-w-7xl
          items-center
          justify-between
          rounded-full
          border
          border-white/50
          bg-white/80
          px-4
          shadow-[0_15px_50px_rgba(0,43,92,0.10)]
          backdrop-blur-2xl
          transition-all
          duration-300
          sm:px-6
          lg:h-20
          lg:px-7
        "
      >

        {/* ======================================================= */}
        {/* LOGO */}
        {/* ======================================================= */}

        {loading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full lg:h-14 lg:w-14" />

            <div className="hidden space-y-2 sm:block">
              <Skeleton className="h-5 w-32 lg:w-40" />
              <Skeleton className="h-2.5 w-24 lg:w-28" />
            </div>
          </div>
        ) : (
          <Link
            href="/"
            className="
              group
              flex
              items-center
              gap-2.5
              sm:gap-3
            "
          >
            {/* Logo */}
            <div className="relative">

              <div
                className="
                  absolute
                  inset-0
                  rounded-full
                  bg-[#C5A059]/20
                  opacity-0
                  blur-md
                  transition-all
                  duration-300
                  group-hover:opacity-100
                "
              />

              <Image
                src={Logo}
                alt="ACE NextGen Consultancy Inc. logo"
                width={58}
                height={58}
                priority
                className="
                  relative
                  h-11
                  w-11
                  rounded-full
                  object-cover
                  transition-transform
                  duration-300
                  group-hover:scale-105
                  sm:h-12
                  sm:w-12
                  lg:h-[58px]
                  lg:w-[58px]
                "
              />
            </div>

            {/* Brand Name */}
            <div className="flex flex-col leading-none">

              <h1
                className="
                  text-lg
                  font-extrabold
                  tracking-tight
                  sm:text-xl
                  lg:text-2xl
                "
              >
                <span className="text-primary">
                  ACE{" "}
                </span>

                <span
                  className="
                    bg-gradient-to-r
                    from-primary
                    to-secondary
                    bg-clip-text
                    text-transparent
                  "
                >
                  NEXTGEN
                </span>
              </h1>

              <span
                className="
                  mt-1
                  text-[7px]
                  font-bold
                  uppercase
                  tracking-[0.25em]
                  text-primary/50
                  sm:text-[8px]
                  lg:text-[10px]
                "
              >
                Consultancy Inc.
              </span>

            </div>
          </Link>
        )}

        {/* ======================================================= */}
        {/* DESKTOP NAVIGATION */}
        {/* ======================================================= */}

        <nav className="hidden items-center gap-8 md:flex lg:gap-10">

          {navLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="
                group
                relative
                py-2
                text-[11px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-primary/80
                transition-colors
                duration-300
                hover:text-secondary
                lg:text-xs
              "
            >
              {item.title}

              {/* Underline */}
              <span
                className="
                  absolute
                  bottom-0
                  left-0
                  h-[2px]
                  w-0
                  rounded-full
                  bg-secondary
                  transition-all
                  duration-300
                  group-hover:w-full
                "
              />
            </Link>
          ))}

        </nav>

        {/* ======================================================= */}
        {/* DESKTOP CTA */}
        {/* ======================================================= */}

        <div className="hidden md:block">

          <Button
            variant="primary"
            onClick={scrollToContact}
            className="
              rounded-full
              px-5
              text-xs
              font-bold
              shadow-md
              shadow-primary/10
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:shadow-lg
            "
          >
            <span className="flex items-center gap-2">
              Book Consultation

              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Button>

        </div>

        {/* ======================================================= */}
        {/* MOBILE MENU BUTTON */}
        {/* ======================================================= */}

        <button
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-primary/10
            bg-primary/5
            text-primary
            transition-all
            duration-300
            hover:bg-primary
            hover:text-white
            md:hidden
          "
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

      </div>

      {/* ========================================================= */}
      {/* MOBILE MENU */}
      {/* ========================================================= */}

      <div
        className={`
          mx-auto
          mt-3
          max-w-7xl
          overflow-hidden
          rounded-[28px]
          border
          border-white/50
          bg-white/90
          shadow-[0_20px_50px_rgba(0,43,92,0.12)]
          backdrop-blur-2xl
          transition-all
          duration-300
          md:hidden
          ${
            open
              ? "max-h-[500px] translate-y-0 opacity-100"
              : "pointer-events-none max-h-0 -translate-y-2 opacity-0"
          }
        `}
      >

        <nav className="p-5">

          {/* Mobile Links */}
          <div className="space-y-1">

            {navLinks.map((item, index) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setOpen(false)}
                className="
                  group
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  px-4
                  py-4
                  text-sm
                  font-bold
                  text-primary
                  transition-all
                  duration-300
                  hover:bg-primary/5
                  hover:text-secondary
                "
              >
                <span className="flex items-center gap-3">

                  <span
                    className="
                      text-[9px]
                      font-extrabold
                      text-primary/30
                      transition-colors
                      group-hover:text-secondary
                    "
                  >
                    0{index + 1}
                  </span>

                  {item.title}

                </span>

                <ArrowRight
                  className="
                    h-4
                    w-4
                    -translate-x-1
                    text-primary/20
                    transition-all
                    duration-300
                    group-hover:translate-x-0
                    group-hover:text-secondary
                  "
                />
              </Link>
            ))}

          </div>

          {/* Divider */}
          <div className="my-3 h-px bg-gray-100" />

          {/* Mobile CTA */}
          <Button
            variant="primary"
            onClick={scrollToContact}
            className="
              w-full
              rounded-2xl
              py-4
              text-sm
              font-bold
            "
          >
            <span className="flex items-center justify-center gap-2">
              Book Consultation

              <ArrowRight className="h-4 w-4" />
            </span>
          </Button>

          {/* Mobile Trust Indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">

            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />

            <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
              Integrated Services & Training Platform
            </span>

          </div>

        </nav>

      </div>

    </header>
  );
}