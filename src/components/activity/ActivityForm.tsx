"use client";

import { useEffect, useMemo, useState } from "react";

import { activityTypes } from "@/data/seed";
import { calculateEmission } from "@/lib/carbon";
import { getScopeLabel } from "@/lib/uiText";
import { useCarbonStore } from "@/stores/carbonStore";
import type { ActivityType, Scope } from "@/types/carbon";

interface ActivityFormValues {
  date: string;
  companyId: string;
  countryCode: string;
  activityType: ActivityType | "";
  description: string;
  amount: string;
  unit: string;
  emissionFactor: string;
  scope: Scope | "";
}

type ActivityFormErrors = Partial<Record<keyof ActivityFormValues, string>>;

const initialValues: ActivityFormValues = {
  date: "",
  companyId: "",
  countryCode: "",
  activityType: "",
  description: "",
  amount: "",
  unit: "",
  emissionFactor: "",
  scope: "",
};

const scopeOptions: Scope[] = ["scope1", "scope2", "scope3"];

function formatKgCo2e(value: number): string {
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} kgCO2e`;
}

function isNumericValue(value: string): boolean {
  if (!value.trim()) {
    return false;
  }

  return Number.isFinite(Number(value));
}

export function ActivityForm() {
  const countries = useCarbonStore((state) => state.countries);
  const companies = useCarbonStore((state) => state.companies);
  const saveActivityRecord = useCarbonStore((state) => state.saveActivityRecord);
  const storeError = useCarbonStore((state) => state.error);

  const [values, setValues] = useState<ActivityFormValues>(initialValues);
  const [errors, setErrors] = useState<ActivityFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedActivityType = useMemo(
    () => activityTypes.find((item) => item.id === values.activityType),
    [values.activityType],
  );

  const unitOptions = useMemo(() => {
    if (!selectedActivityType) {
      return [];
    }

    return Array.from(new Set(selectedActivityType.presets.map((preset) => preset.unit)));
  }, [selectedActivityType]);

  const descriptionExamples = useMemo(() => {
    if (!selectedActivityType) {
      return [];
    }

    return Array.from(
      new Set(selectedActivityType.presets.map((preset) => preset.description)),
    );
  }, [selectedActivityType]);

  const matchedPreset = useMemo(() => {
    if (!selectedActivityType) {
      return undefined;
    }

    const normalizedDescription = values.description.trim();

    return (
      selectedActivityType.presets.find(
        (preset) => preset.description === normalizedDescription,
      ) ?? selectedActivityType.presets[0]
    );
  }, [selectedActivityType, values.description]);

  useEffect(() => {
    if (!values.companyId && companies.length === 1) {
      setValues((current) => ({
        ...current,
        companyId: companies[0].id,
        countryCode: companies[0].countryCode,
      }));
    }
  }, [companies, values.companyId]);

  useEffect(() => {
    if (!values.countryCode && countries.length === 1) {
      setValues((current) => ({
        ...current,
        countryCode: countries[0].code,
      }));
    }
  }, [countries, values.countryCode]);

  useEffect(() => {
    if (!matchedPreset || !selectedActivityType) {
      return;
    }

    setValues((current) => {
      const nextDescription = current.description || selectedActivityType.defaultDescription;
      const nextUnit = current.unit || matchedPreset.unit;
      const nextEmissionFactor = current.emissionFactor || String(matchedPreset.emissionFactor);
      const nextScope = current.scope || matchedPreset.scope;

      if (
        nextDescription === current.description &&
        nextUnit === current.unit &&
        nextEmissionFactor === current.emissionFactor &&
        nextScope === current.scope
      ) {
        return current;
      }

      return {
        ...current,
        description: nextDescription,
        unit: nextUnit,
        emissionFactor: nextEmissionFactor,
        scope: nextScope,
      };
    });
  }, [matchedPreset, selectedActivityType]);

  const amountNumber = Number(values.amount);
  const emissionFactorNumber = Number(values.emissionFactor);
  const emissionPreview =
    isNumericValue(values.amount) &&
    amountNumber > 0 &&
    isNumericValue(values.emissionFactor) &&
    emissionFactorNumber > 0
      ? calculateEmission(amountNumber, emissionFactorNumber)
      : 0;

  function validate(nextValues: ActivityFormValues): ActivityFormErrors {
    const nextErrors: ActivityFormErrors = {};

    if (!nextValues.date) {
      nextErrors.date = "일자를 선택해주세요.";
    }

    if (!nextValues.companyId) {
      nextErrors.companyId = "기업을 선택해주세요.";
    }

    if (!nextValues.countryCode) {
      nextErrors.countryCode = "국가를 선택해주세요.";
    }

    if (!nextValues.activityType) {
      nextErrors.activityType = "활동 유형을 선택해주세요.";
    }

    if (!nextValues.description.trim()) {
      nextErrors.description = "설명을 입력해주세요.";
    }

    if (!nextValues.amount.trim()) {
      nextErrors.amount = "사용량은 숫자로 입력해주세요.";
    } else if (!isNumericValue(nextValues.amount)) {
      nextErrors.amount = "사용량은 숫자로 입력해주세요.";
    } else if (Number(nextValues.amount) <= 0) {
      nextErrors.amount = "사용량은 0보다 커야 합니다.";
    }

    if (!nextValues.unit) {
      nextErrors.unit = "단위를 선택해주세요.";
    }

    if (!nextValues.emissionFactor.trim()) {
      nextErrors.emissionFactor = "배출계수는 숫자로 입력해주세요.";
    } else if (!isNumericValue(nextValues.emissionFactor)) {
      nextErrors.emissionFactor = "배출계수는 숫자로 입력해주세요.";
    } else if (Number(nextValues.emissionFactor) <= 0) {
      nextErrors.emissionFactor = "배출계수는 0보다 커야 합니다.";
    }

    if (!nextValues.scope) {
      nextErrors.scope = "배출 범위를 선택해주세요.";
    }

    return nextErrors;
  }

  function updateField<K extends keyof ActivityFormValues>(key: K, value: ActivityFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));

    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }

    if (submitError) {
      setSubmitError(null);
    }
  }

  function handleCompanyChange(companyId: string) {
    const selectedCompany = companies.find((company) => company.id === companyId);

    setValues((current) => ({
      ...current,
      companyId,
      countryCode: selectedCompany?.countryCode ?? "",
    }));

    setErrors((current) => ({
      ...current,
      companyId: undefined,
      countryCode: undefined,
    }));

    if (submitError) {
      setSubmitError(null);
    }
  }

  function handleActivityTypeChange(activityType: ActivityType | "") {
    const selectedDefinition = activityTypes.find((item) => item.id === activityType);
    const firstPreset = selectedDefinition?.presets[0];

    setValues((current) => ({
      ...current,
      activityType,
      description: selectedDefinition?.defaultDescription ?? "",
      unit: firstPreset?.unit ?? "",
      emissionFactor: firstPreset ? String(firstPreset.emissionFactor) : "",
      scope: firstPreset?.scope ?? "",
    }));

    setErrors((current) => ({
      ...current,
      activityType: undefined,
      description: undefined,
      unit: undefined,
      emissionFactor: undefined,
      scope: undefined,
    }));

    if (submitError) {
      setSubmitError(null);
    }
  }

  function handleDescriptionChange(description: string) {
    setValues((current) => {
      const selectedDefinition = activityTypes.find((item) => item.id === current.activityType);
      const exactPreset = selectedDefinition?.presets.find(
        (preset) => preset.description === description.trim(),
      );

      return {
        ...current,
        description,
        unit: exactPreset?.unit ?? current.unit,
        emissionFactor: exactPreset ? String(exactPreset.emissionFactor) : current.emissionFactor,
        scope: exactPreset?.scope ?? current.scope,
      };
    });

    setErrors((current) => ({
      ...current,
      description: undefined,
      unit: undefined,
      emissionFactor: undefined,
      scope: undefined,
    }));

    if (submitError) {
      setSubmitError(null);
    }
  }

  function handleCancel() {
    setValues({
      ...initialValues,
      companyId: companies.length === 1 ? companies[0].id : "",
      countryCode: countries.length === 1 ? countries[0].code : "",
    });
    setErrors({});
    setSubmitError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const { activityType, scope } = values;

    if (!activityType || !scope) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const savedRecord = await saveActivityRecord({
        companyId: values.companyId,
        countryCode: values.countryCode,
        date: values.date,
        activityType,
        description: values.description.trim(),
        amount: Number(values.amount),
        unit: values.unit,
        emissionFactor: Number(values.emissionFactor),
        scope,
      });

      if (!savedRecord) {
        setSubmitError(storeError ?? "저장에 실패했습니다.");
        return;
      }

      setValues({
        ...initialValues,
        companyId: companies.length === 1 ? companies[0].id : "",
        countryCode: countries.length === 1 ? countries[0].code : "",
      });
      setErrors({});
      setSubmitError(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
      <div>
        <p className="text-sm font-semibold text-slate-900">활동 데이터 추가</p>
        <p className="mt-1 text-sm text-slate-500">
          과제용 데이터 시트 형식에 맞춰 활동량과 배출계수를 입력하면 대시보드 요약과
          차트에 바로 반영됩니다.
        </p>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">일자</span>
            <input
              type="date"
              value={values.date}
              onChange={(event) => updateField("date", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
            />
            {errors.date ? <p className="mt-2 text-sm text-rose-600">{errors.date}</p> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">기업</span>
            <select
              value={values.companyId}
              onChange={(event) => handleCompanyChange(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
            >
              <option value="">기업을 선택해주세요</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {errors.companyId ? <p className="mt-2 text-sm text-rose-600">{errors.companyId}</p> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">국가</span>
            <select
              value={values.countryCode}
              onChange={(event) => updateField("countryCode", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
            >
              <option value="">국가를 선택해주세요</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.countryCode ? (
              <p className="mt-2 text-sm text-rose-600">{errors.countryCode}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">활동 유형</span>
            <select
              value={values.activityType}
              onChange={(event) =>
                handleActivityTypeChange(event.target.value as ActivityType | "")
              }
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
            >
              <option value="">활동 유형을 선택해주세요</option>
              {activityTypes.map((activityType) => (
                <option key={activityType.id} value={activityType.id}>
                  {activityType.label}
                </option>
              ))}
            </select>
            {errors.activityType ? (
              <p className="mt-2 text-sm text-rose-600">{errors.activityType}</p>
            ) : null}
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">설명</span>
            <textarea
              rows={4}
              value={values.description}
              onChange={(event) => handleDescriptionChange(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
              placeholder={
                descriptionExamples.length > 0
                  ? `예: ${descriptionExamples.join(", ")}`
                  : "설명을 입력해주세요"
              }
            />
            {descriptionExamples.length > 0 ? (
              <p className="mt-2 text-xs text-slate-500">
                예시 설명: {descriptionExamples.join(", ")}
              </p>
            ) : null}
            {errors.description ? (
              <p className="mt-2 text-sm text-rose-600">{errors.description}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">량</span>
            <input
              type="text"
              value={values.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
              placeholder="숫자로 입력해주세요"
            />
            {errors.amount ? <p className="mt-2 text-sm text-rose-600">{errors.amount}</p> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">단위</span>
            <select
              value={values.unit}
              onChange={(event) => updateField("unit", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
            >
              <option value="">단위를 선택해주세요</option>
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            {errors.unit ? <p className="mt-2 text-sm text-rose-600">{errors.unit}</p> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">배출계수</span>
            <input
              type="text"
              value={values.emissionFactor}
              onChange={(event) => updateField("emissionFactor", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
              placeholder="숫자로 입력해주세요"
            />
            {errors.emissionFactor ? (
              <p className="mt-2 text-sm text-rose-600">{errors.emissionFactor}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Scope</span>
            <select
              value={values.scope}
              onChange={(event) => updateField("scope", event.target.value as Scope | "")}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
            >
              <option value="">배출 범위를 선택해주세요</option>
              {scopeOptions.map((scope) => (
                <option key={scope} value={scope}>
                  {getScopeLabel(scope)}
                </option>
              ))}
            </select>
            {errors.scope ? <p className="mt-2 text-sm text-rose-600">{errors.scope}</p> : null}
          </label>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            예상 배출량
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {formatKgCo2e(emissionPreview)}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            배출량은 활동 데이터 × 배출계수로 계산됩니다.
          </p>
        </div>

        {submitError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {submitError}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            취소
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">
              활동 데이터 추가
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
