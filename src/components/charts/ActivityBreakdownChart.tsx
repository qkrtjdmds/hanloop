"use client";

import { useMemo } from "react";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { getEmissionByScope } from "@/lib/carbon";
import { getScopeLabel } from "@/lib/uiText";
import { useCarbonStore } from "@/stores/carbonStore";

const CHART_COLORS = ["#10b981", "#0f172a", "#0ea5e9"];

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

export function ActivityBreakdownChart() {
  const activityRecords = useCarbonStore((state) => state.activityRecords);
  const emissionFactors = useCarbonStore((state) => state.emissionFactors);
  const selectedCompanyId = useCarbonStore((state) => state.selectedCompanyId);
  const selectedMonth = useCarbonStore((state) => state.selectedMonth);

  const scopeBreakdown = useMemo(() => {
    const scopedRecords = activityRecords.filter((record) => {
      const matchesCompany = selectedCompanyId ? record.companyId === selectedCompanyId : true;
      const matchesMonth = selectedMonth ? record.date.startsWith(selectedMonth) : true;

      return matchesCompany && matchesMonth;
    });

    return getEmissionByScope(scopedRecords, emissionFactors);
  }, [activityRecords, emissionFactors, selectedCompanyId, selectedMonth]);

  if (scopeBreakdown.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-[2rem] border border-slate-200/80 bg-white p-6 text-center shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
        <div>
          <p className="text-sm font-semibold text-slate-900">Scope별 배출 비중</p>
          <p className="mt-2 text-sm text-slate-500">
            현재 조건에서 표시할 Scope별 배출량 데이터가 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
      <div>
        <p className="text-sm font-semibold text-slate-900">Scope별 배출 비중</p>
        <p className="mt-1 text-sm text-slate-500">
          Scope 1, 2, 3 기준으로 배출량이 어떻게 나뉘는지 보여줍니다.
        </p>
      </div>

      <div className="mt-6 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={scopeBreakdown}
              dataKey="totalKgCo2e"
              nameKey="scope"
              innerRadius={72}
              outerRadius={110}
              paddingAngle={2}
            >
              {scopeBreakdown.map((entry, index) => (
                <Cell key={entry.scope} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown) => [
                formatKgCo2e(getNumericValue(value)),
                "배출량",
              ]}
              labelFormatter={(label: unknown) => getScopeLabel(getStringValue(label) as never)}
              contentStyle={{
                borderRadius: "16px",
                borderColor: "#e2e8f0",
                boxShadow: "0 18px 40px -28px rgba(15,23,42,0.35)",
              }}
            />
            <Legend
              verticalAlign="bottom"
              formatter={(value: string) => getScopeLabel(value as never)}
              wrapperStyle={{ paddingTop: "12px", fontSize: "12px", color: "#475569" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
