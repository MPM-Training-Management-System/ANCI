"use client";

import { useRouter } from "next/navigation";
import {Button} from "@repo/ui/button";
import Image from "next/image";
import Logo from "@/assets/image/ANCILOGO.png";
import { ArrowRight } from "lucide-react";
import {  sidebarStyles } from "@repo/token";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { radius } from "@repo/token"
import { useEffect, useState } from "react";

const NavItems = [
  { name: "Pillars", href: "#certificate"},
  { name: "Mission", href: "#mission"},
  { name: "Expertise", href: "#expertise"},
  { name: "Contact", href: "#contact"},
]


export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
   useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
   return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-card/90 backdrop-blur-xl border-b border-border shadow-soft" 
          : "bg-transparent text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
         <Image 
            src={Logo}
            alt="Logo"
            width={50}
            height={50}
          />
          <span className="font-display text-lg font-semibold text-deep-navy tracking-tight">
            ACE <span className="text-philippine-gold">NextGen</span>
          </span>
        </a>
        <nav  className="hidden md:flex items-center gap-6 text-sm text-slate-gray">
                {NavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${sidebarStyles.item} ${
  isActive
    ? sidebarStyles.active
    : sidebarStyles.inactive
}`}
            >
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
        <Button  variant="primary" style={{ borderRadius: radius.full }} onClick={() => router.push("/login")}>
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}