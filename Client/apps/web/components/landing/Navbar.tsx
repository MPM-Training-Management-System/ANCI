"use client";

import { useRouter } from "next/navigation";
import {Button} from "@repo/ui/button";
export default function Navbar() {
  const router = useRouter();

  return (
    <header className="fixed top-0 z-50 w-full bg-white shadow-sm h-16">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-full">
        <div className="flex items-center gap-8">
          <h1 className="font-bold text-xl">
            ACE NextGen ISTMS
          </h1>

          <nav className="hidden md:flex gap-6">
            <a href="#">Courses</a>
            <a href="#">About</a>
            <a href="#">Certifications</a>
            <a href="#">Consulting</a>
          </nav>
        </div>

        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => router.push("/login")}>
            Login
          </Button>

          <Button variant="primary" onClick={() => router.push("/contact")}>
            Contact Us
          </Button>
        </div>
      </div>
    </header>
  );
}