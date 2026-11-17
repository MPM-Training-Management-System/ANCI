
import type { ReactNode } from "react";

interface PageSectionHeaderProps {
  title: string;
  description: string;
  badge?: string;
  icon?: ReactNode;
  stats?: {
    label: string;
    value: string | number;
    icon?: ReactNode;
  }[];
  actions?: ReactNode;
}

export function PageSectionHeader({
  title,
  description,
  badge = "Trainer Workspace",
  icon,
  stats = [],
  actions,
}: PageSectionHeaderProps) {
  return (
    <section className="relative isolate overflow-hidden rounded-[22px] bg-gradient-to-br from-[#071a35] via-[#103967] to-[#17619a] px-5 py-5 text-white shadow-[0_12px_32px_rgba(9,42,80,0.16)] sm:px-6 sm:py-6">

      {/* Decorative Background */}
      <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full border-[32px] border-white/[0.045]" />

      <div className="pointer-events-none absolute -bottom-40 right-36 h-72 w-72 rounded-full border border-white/[0.09]" />

      <div className="pointer-events-none absolute right-20 top-10 h-32 w-32 rounded-full bg-cyan-300/[0.08] blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">

        {/* Header Information */}
        <div className="min-w-0 max-w-xl">
          {/* Badge */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.09] px-2.5 py-1 backdrop-blur">
            {icon ? (
              <span className="flex items-center justify-center text-cyan-200">
                {icon}
              </span>
            ) : (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
            )}

            <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-100">
              {badge}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl lg:text-[28px]">
            {title}
          </h1>

          {/* Description */}
          <p className="mt-2 max-w-lg text-xs leading-5 text-blue-100/75 sm:text-[13px]">
            {description}
          </p>

          {/* Statistics */}
          {stats.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {stats.map((stat, index) => (
                <div
                  key={`${stat.label}-${index}`}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.08] px-2.5 py-1.5 backdrop-blur-sm"
                >
                  {stat.icon && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-cyan-200">
                      {stat.icon}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-blue-200/70">
                      {stat.label}
                    </p>

                    <p className="mt-0.5 text-[11px] font-bold text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Actions */}
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
