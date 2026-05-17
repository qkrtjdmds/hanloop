"use client";

import { useMemo } from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { getEmissionByMonth } from "@/lib/carbon";
import { formatMonthLabel } from "@/lib/uiText";
import { useCarbonStore } from "@/stores/carbonStore";

function formatKgCo2e(value: number): string {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} kgCO2e`;
}

function getNumericValue(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function getStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function MonthlyEmissionChart() {
  const activityRecords = useCarbonStore((state) => state.activityRecords);
  const emissionFactors = useCarbonStore((state) => state.emissionFactors);
  const selectedCompanyId = useCarbonStore((state) => state.selectedCompanyId);

  const monthlyEmission = useMemo(() => {
    const scopedRecords = selectedCompanyId
      ? activityRecords.filter((record) => record.companyId === selectedCompanyId)
      : activityRecords;

    return getEmissionByMonth(scopedRecords, emissionFactors);
  }, [activityRecords, emissionFactors, selectedCompanyId]);

  if (monthlyEmission.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-[2rem] border border-slate-200/80 bg-white p-6 text-center shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
        <div>
          <p className="text-sm font-semibold text-slate-900">월별 탄소 배출량</p>
          <p className="mt-2 text-sm text-slate-500">
            현재 조건에서 표시할 월별 배출량 데이터가 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
      <div>
        <p className="text-sm font-semibold text-slate-900">월별 탄소 배출량</p>
        <p className="mt-1 text-sm text-slate-500">
          선택한 기업 기준으로 월별 kgCO2e 추이를 보여줍니다.
        </p>
      </div>

      <div className="mt-6 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyEmission} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="monthlyEmissionFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.32} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="month"
              tickFormatter={(month: string) => formatMonthLabel(month)}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(value: number) => `${value.toLocaleString()} kg`}
              tickLine={false}
              axisLine={false}
              width={72}
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: unknown) => [
                formatKgCo2e(getNumericValue(value)),
                "배출량",
              ]}
              labelFormatter={(label: unknown) => formatMonthLabel(getStringValue(label))}
              contentStyle={{
                borderRadius: "16px",
                borderColor: "#e2e8f0",
                boxShadow: "0 18px 40px -28px rgba(15,23,42,0.35)",
              }}
            />
            <Area
              type="monotone"
              dataKey="totalKgCo2e"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#monthlyEmissionFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
