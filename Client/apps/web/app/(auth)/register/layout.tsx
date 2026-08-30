"use client";

import type { ReactNode } from "react";

interface TrainerLayoutProps {
  children: ReactNode;
}

export default function TrainerLayout({
  children,
}: TrainerLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}