import { Activity } from "lucide-react";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Activity className="h-5 w-5" />
      </div>

      <p className="mt-3 text-sm font-medium text-slate-700">
        {title}
      </p>

      <p className="mt-1 max-w-xs text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}