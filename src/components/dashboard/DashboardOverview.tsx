"use client";

import { useMemo } from "react";

import {
  AlertCircle,
  ArrowRight,
  Coins,
  Flame,
  Layers3,
  LoaderCircle,
  TrendingUp,
} from "lucide-react";

import { ActivityBreakdownChart } from "@/components/charts/ActivityBreakdownChart";
import { MonthlyEmissionChart } from "@/components/charts/MonthlyEmissionChart";
import {
  calculateRecordEmission,
  getEmissionByActivityType,
  getEstimatedCarbonTax,
  getTotalEmission,
} from "@/lib/carbon";
import {
  formatMonthLabel,
  getActivityTypeLabel,
  getPostCategoryLabel,
} from "@/lib/uiText";
import { useCarbonStore } from "@/stores/carbonStore";

import { KpiCard } from "./KpiCard";

function formatKgCo2e(value: number): string {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} kgCO2e`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function DashboardOverview() {
  const isLoading = useCarbonStore((state) => state.isLoading);
  const error = useCarbonStore((state) => state.error);
  const companies = useCarbonStore((state) => state.companies);
  const activityRecords = useCarbonStore((state) => state.activityRecords);
  const sustainabilityPosts = useCarbonStore((state) => state.sustainabilityPosts);
  const emissionFactors = useCarbonStore((state) => state.emissionFactors);
  const selectedCompanyId = useCarbonStore((state) => state.selectedCompanyId);
  const selectedMonth = useCarbonStore((state) => state.selectedMonth);

  const filteredActivityRecords = useMemo(() => {
    return activityRecords.filter((record) => {
      const matchesCompany = selectedCompanyId ? record.companyId === selectedCompanyId : true;
      const matchesMonth = selectedMonth ? record.date.startsWith(selectedMonth) : true;

      return matchesCompany && matchesMonth;
    });
  }, [activityRecords, selectedCompanyId, selectedMonth]);

  const totalEmission = useMemo(() => {
    return getTotalEmission(filteredActivityRecords, emissionFactors);
  }, [filteredActivityRecords, emissionFactors]);

  const estimatedCarbonTax = useMemo(() => {
    return getEstimatedCarbonTax(totalEmission);
  }, [totalEmission]);

  const emissionByActivityType = useMemo(() => {
    return getEmissionByActivityType(filteredActivityRecords, emissionFactors);
  }, [filteredActivityRecords, emissionFactors]);

  const highestActivitySource = emissionByActivityType[0];
  const highestActivityFactor = emissionFactors.find(
    (factor) => factor.activityType === highestActivitySource?.activityType,
  );
  const selectedCompany = companies.find((company) => company.id === selectedCompanyId);

  if (isLoading && companies.length === 0) {
    return (
      <section className="flex min-h-[420px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <LoaderCircle className="h-7 w-7 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              대시보드 데이터를 불러오는 중입니다
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              기업, 배출량, 활동 데이터를 준비하고 있습니다.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error && companies.length === 0) {
    return (
      <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8 text-rose-900 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-rose-600 ring-1 ring-rose-200">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">대시보드를 불러오지 못했습니다</h3>
            <p className="mt-2 text-sm leading-6 text-rose-800/80">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {error ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
          {error}
        </div>
      ) : null}

      <div className="rounded-[2rem] border border-slate-200/80 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-[0_24px_48px_-24px_rgba(15,23,42,0.55)] sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-[0.2em] text-emerald-200 uppercase">
              탄소 운영 현황
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              사업장, 운송, 원소재 배출량을 한눈에 확인합니다.
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              활동 데이터와 배출계수를 기반으로 총 배출량과 Scope별 배출 분포를 쉽게 파악할 수 있습니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[320px]">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
                기업 범위
              </p>
              <p className="mt-2 text-lg font-semibold">
                {selectedCompany?.name ?? "전체 기업"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-300 uppercase">
                조회 데이터 수
              </p>
              <p className="mt-2 text-lg font-semibold">{filteredActivityRecords.length}건</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="총 배출량"
          value={formatKgCo2e(totalEmission)}
          subtitle="현재 선택한 조건을 기준으로 계산된 총 배출량입니다."
          icon={TrendingUp}
          accentClassName="bg-emerald-50 text-emerald-700 ring-emerald-100"
        />
        <KpiCard
          title="예상 탄소 비용"
          value={formatCurrency(estimatedCarbonTax)}
          subtitle="현재 kgCO2e 기준으로 추정한 예상 탄소 비용입니다."
          icon={Coins}
          accentClassName="bg-sky-50 text-sky-700 ring-sky-100"
        />
        <KpiCard
          title="최대 배출 활동"
          value={highestActivityFactor?.label ?? "표시할 데이터가 없습니다"}
          subtitle={
            highestActivitySource
              ? `${getActivityTypeLabel(highestActivitySource.activityType)} · ${formatKgCo2e(highestActivitySource.totalKgCo2e)}`
              : "활동 데이터를 추가하면 주요 배출 원인을 계산할 수 있습니다."
          }
          icon={Flame}
          accentClassName="bg-amber-50 text-amber-700 ring-amber-100"
        />
        <KpiCard
          title="선택한 월"
          value={formatMonthLabel(selectedMonth)}
          subtitle="현재 활동 데이터에 적용된 조회 기간입니다."
          icon={Layers3}
          accentClassName="bg-violet-50 text-violet-700 ring-violet-100"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MonthlyEmissionChart />
        <ActivityBreakdownChart />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">활동 데이터 요약</p>
              <p className="mt-1 text-sm text-slate-500">
                현재 불러온 최근 활동 데이터를 빠르게 확인할 수 있습니다.
              </p>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {filteredActivityRecords.length}건 표시
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {filteredActivityRecords.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{record.description}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {record.date} • {getActivityTypeLabel(record.activityType)} •{" "}
                    {record.amount.toLocaleString()} {record.unit}
                  </p>
                </div>
                <div className="text-sm font-medium text-slate-700">
                  {formatKgCo2e(calculateRecordEmission(record, emissionFactors))}
                </div>
              </div>
            ))}

            {filteredActivityRecords.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                현재 조건에 맞는 활동 데이터가 없습니다.
              </div>
            ) : null}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">지속가능성 업데이트</p>
                <p className="mt-1 text-sm text-slate-500">
                  내부 추진 과제와 보고서 주요 내용을 확인할 수 있습니다.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>

            <div className="mt-6 space-y-4">
              {sustainabilityPosts.slice(0, 3).map((post) => (
                <article key={post.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold tracking-[0.2em] text-emerald-700 uppercase">
                    {getPostCategoryLabel(post.category)}
                  </p>
                  <h4 className="mt-2 text-sm font-semibold text-slate-900">{post.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{post.summary}</p>
                  <p className="mt-3 text-xs font-medium text-slate-400">{post.publishedAt}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
            <p className="text-sm font-semibold text-slate-900">데이터 현황</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  기업 수
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{companies.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  활동 데이터
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {activityRecords.length}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  배출계수
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {emissionFactors.length}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">
                  업데이트
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {sustainabilityPosts.length}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
