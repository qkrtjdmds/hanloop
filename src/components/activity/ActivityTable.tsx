"use client";

import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { calculateRecordEmission } from "@/lib/carbon";
import { getActivityTypeLabel, getScopeLabel } from "@/lib/uiText";
import { useCarbonStore } from "@/stores/carbonStore";

function formatKgCo2e(value: number): string {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} kgCO2e`;
}

export function ActivityTable() {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const countries = useCarbonStore((state) => state.countries);
  const companies = useCarbonStore((state) => state.companies);
  const emissionFactors = useCarbonStore((state) => state.emissionFactors);
  const activityRecords = useCarbonStore((state) => state.activityRecords);
  const deleteActivityRecord = useCarbonStore((state) => state.deleteActivityRecord);
  const error = useCarbonStore((state) => state.error);

  const sortedActivityRecords = useMemo(() => {
    return activityRecords
      .map((record, index) => ({ record, index }))
      .sort((left, right) => {
        const dateDifference =
          new Date(right.record.date).getTime() - new Date(left.record.date).getTime();

        if (dateDifference !== 0) {
          return dateDifference;
        }

        return right.index - left.index;
      })
      .map(({ record }) => record);
  }, [activityRecords]);

  async function handleDelete(id: string) {
    setPendingDeleteId(id);
    try {
      await deleteActivityRecord(id);
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">활동 데이터</p>
          <p className="mt-1 text-sm text-slate-500">
            과제용 데이터 시트 기준 원본 정보와 계산된 배출량을 함께 확인할 수 있습니다.
          </p>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {sortedActivityRecords.length}건
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </div>
      ) : null}

      {sortedActivityRecords.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          표시할 활동 데이터가 없습니다.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    일자
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    기업
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    국가
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    활동 유형
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    설명
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    량
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    단위
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    배출계수
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Scope
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    배출량(kgCO₂e)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {sortedActivityRecords.map((record) => {
                  const companyName =
                    companies.find((company) => company.id === record.companyId)?.name ??
                    "알 수 없는 기업";
                  const countryName =
                    countries.find((country) => country.code === record.countryCode)?.name ??
                    "알 수 없는 국가";

                  return (
                    <tr key={record.id} className="align-top">
                      <td className="px-4 py-4 text-sm text-slate-700">{record.date}</td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-900">
                        {companyName}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">{countryName}</td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {getActivityTypeLabel(record.activityType)}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">{record.description}</td>
                      <td className="px-4 py-4 text-right text-sm text-slate-700">
                        {record.amount.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">{record.unit}</td>
                      <td className="px-4 py-4 text-right text-sm text-slate-700">
                        {record.emissionFactor.toLocaleString(undefined, {
                          minimumFractionDigits: 3,
                          maximumFractionDigits: 3,
                        })}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        {getScopeLabel(record.scope)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium text-slate-900">
                        {formatKgCo2e(calculateRecordEmission(record, emissionFactors))}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => void handleDelete(record.id)}
                          disabled={pendingDeleteId === record.id}
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                          {pendingDeleteId === record.id ? "삭제 중..." : "삭제"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
