import type { ActivityType, Scope, SustainabilityPost } from "@/types/carbon";

const activityTypeLabels: Record<ActivityType, string> = {
  electricity: "전기",
  diesel: "디젤",
  gasoline: "가솔린",
  lpg: "LPG",
  transport: "운송",
  materials: "원소재",
};

const scopeLabels: Record<Scope, string> = {
  scope1: "Scope 1 (직접 배출)",
  scope2: "Scope 2 (전력 간접 배출)",
  scope3: "Scope 3 (공급망/기타 간접 배출)",
};

const postCategoryLabels: Record<SustainabilityPost["category"], string> = {
  initiative: "추진 과제",
  report: "보고서",
  milestone: "주요 성과",
};

export function getActivityTypeLabel(activityType: ActivityType | string): string {
  if (activityType in activityTypeLabels) {
    return activityTypeLabels[activityType as ActivityType];
  }

  return activityType;
}

export function getScopeLabel(scope: Scope | string): string {
  if (scope in scopeLabels) {
    return scopeLabels[scope as Scope];
  }

  return scope;
}

export function getPostCategoryLabel(category: SustainabilityPost["category"]): string {
  return postCategoryLabels[category];
}

export function formatMonthLabel(month: string | null, allLabel = "전체 기간"): string {
  if (!month) {
    return allLabel;
  }

  const [year, monthValue] = month.split("-");
  return `${year}.${monthValue}`;
}
