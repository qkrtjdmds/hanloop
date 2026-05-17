import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  accentClassName: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentClassName,
}: KpiCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-inset ${accentClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{subtitle}</p>
    </article>
  );
}
