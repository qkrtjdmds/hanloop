"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BarChart3, DatabaseZap, Factory, FileText, Leaf } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type InteractiveNavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

type StaticNavigationItem = {
  label: string;
  icon: LucideIcon;
};

type NavigationItem = InteractiveNavigationItem | StaticNavigationItem;

const navigationItems: NavigationItem[] = [
  {
    href: "/",
    label: "탄소 배출 대시보드",
    icon: BarChart3,
  },
  {
    href: "/activity",
    label: "활동 데이터",
    icon: DatabaseZap,
  },
  {
    label: "배출계수",
    icon: Factory,
  },
  {
    label: "보고서",
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-slate-800 bg-slate-950 text-slate-100 md:w-72 md:border-r md:border-b-0">
      <div className="flex h-full flex-col">
        <div className="border-b border-slate-800 px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-400/20">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300/80">
                HanaLoop
              </p>
              <h1 className="text-lg font-semibold text-white">탄소 배출 대시보드</h1>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isInteractive = "href" in item;
              const isActive = isInteractive
                ? item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
                : false;

              return (
                <li key={item.label}>
                  {isInteractive ? (
                    <Link
                      href={item.href}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                        isActive
                          ? "bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/10"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <div className="flex w-full cursor-not-allowed items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-slate-500">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-slate-800 px-5 py-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              작업 공간
            </p>
            <p className="mt-2 text-sm font-medium text-white">기업 탄소 관리</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              사업장, 운송, 원소재 데이터를 기준으로 배출량을 통합 관리합니다.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
