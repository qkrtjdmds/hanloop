"use client";

import { Building2, CalendarRange, Search } from "lucide-react";

import { formatMonthLabel } from "@/lib/uiText";
import { useCarbonStore } from "@/stores/carbonStore";

export function Header() {
  const companies = useCarbonStore((state) => state.companies);
  const selectedCompanyId = useCarbonStore((state) => state.selectedCompanyId);
  const selectedMonth = useCarbonStore((state) => state.selectedMonth);

  const selectedCompany = companies.find((company) => company.id === selectedCompanyId);

  return (
    <header className="border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">운영 탄소 현황</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            하나루프 탄소 배출 대시보드
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            사업장별 활동 데이터, 배출량 현황, 내부 지속가능성 업데이트를 한눈에 확인합니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">기업</p>
              <p className="truncate text-sm font-medium text-slate-700">
                {selectedCompany?.name ?? "전체 기업"}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
              <CalendarRange className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">조회 기간</p>
              <p className="truncate text-sm font-medium text-slate-700">
                {formatMonthLabel(selectedMonth, "전체 월")}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200">
              <Search className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">불러온 기업 수</p>
              <p className="truncate text-sm font-medium text-slate-700">{companies.length}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
