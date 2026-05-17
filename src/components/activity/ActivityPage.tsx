"use client";

import { Factory, FileStack } from "lucide-react";

import { useCarbonStore } from "@/stores/carbonStore";

import { ActivityForm } from "./ActivityForm";
import { ActivityTable } from "./ActivityTable";

export function ActivityPage() {
  const companies = useCarbonStore((state) => state.companies);
  const activityRecords = useCarbonStore((state) => state.activityRecords);

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200/80 bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 p-6 text-white shadow-[0_24px_48px_-24px_rgba(15,23,42,0.55)] sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">
              활동 데이터 관리
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              과제용 데이터 시트 형식에 맞춰 탄소 활동 데이터를 입력합니다.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              일자, 기업, 국가, 활동 유형, 설명, 량, 단위, 배출계수, Scope를 입력하면
              대시보드 요약 카드와 차트에 즉시 반영됩니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[320px]">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <Factory className="h-5 w-5 text-sky-200" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    기업 수
                  </p>
                  <p className="mt-2 text-lg font-semibold">{companies.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <FileStack className="h-5 w-5 text-sky-200" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                    전체 활동 데이터
                  </p>
                  <p className="mt-2 text-lg font-semibold">{activityRecords.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(420px,0.95fr)_minmax(0,1.45fr)]">
        <ActivityForm />
        <ActivityTable />
      </div>
    </section>
  );
}
