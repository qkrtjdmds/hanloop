import type {
  ActivityRecord,
  ActivityType,
  EmissionFactor,
  Scope,
} from "@/types/carbon";

const CARBON_TAX_USD_PER_TON_CO2E = 25;

export interface EmissionByMonth {
  month: string;
  totalKgCo2e: number;
}

export interface EmissionByActivityType {
  activityType: ActivityType;
  totalKgCo2e: number;
}

export interface EmissionByScope {
  scope: Scope;
  totalKgCo2e: number;
}

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function findEmissionFactor(
  record: ActivityRecord,
  factors: EmissionFactor[],
): EmissionFactor | undefined {
  return factors.find(
    (factor) =>
      factor.activityType === record.activityType && factor.unit === record.unit,
  );
}

export function calculateEmission(amount: number, factor: number): number {
  return roundToTwoDecimals(amount * factor);
}

export function calculateRecordEmission(
  record: ActivityRecord,
  factors: EmissionFactor[],
): number {
  const factor = record.emissionFactor ?? findEmissionFactor(record, factors)?.factor;

  if (typeof factor !== "number") {
    return 0;
  }

  return calculateEmission(record.amount, factor);
}

export function getTotalEmission(
  records: ActivityRecord[],
  factors: EmissionFactor[],
): number {
  const total = records.reduce((sum, record) => {
    return sum + calculateRecordEmission(record, factors);
  }, 0);

  return roundToTwoDecimals(total);
}

export function getEmissionByMonth(
  records: ActivityRecord[],
  factors: EmissionFactor[],
): EmissionByMonth[] {
  const grouped = records.reduce<Map<string, number>>((accumulator, record) => {
    const month = record.date.slice(0, 7);
    const emission = calculateRecordEmission(record, factors);
    const current = accumulator.get(month) ?? 0;

    accumulator.set(month, current + emission);
    return accumulator;
  }, new Map<string, number>());

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, totalKgCo2e]) => ({
      month,
      totalKgCo2e: roundToTwoDecimals(totalKgCo2e),
    }));
}

export function getEmissionByActivityType(
  records: ActivityRecord[],
  factors: EmissionFactor[],
): EmissionByActivityType[] {
  const grouped = records.reduce<Map<ActivityType, number>>((accumulator, record) => {
    const emission = calculateRecordEmission(record, factors);
    const current = accumulator.get(record.activityType) ?? 0;

    accumulator.set(record.activityType, current + emission);
    return accumulator;
  }, new Map<ActivityType, number>());

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([activityType, totalKgCo2e]) => ({
      activityType,
      totalKgCo2e: roundToTwoDecimals(totalKgCo2e),
    }));
}

export function getEmissionByScope(
  records: ActivityRecord[],
  factors: EmissionFactor[],
): EmissionByScope[] {
  const grouped = records.reduce<Map<Scope, number>>((accumulator, record) => {
    const emission = calculateRecordEmission(record, factors);
    const current = accumulator.get(record.scope) ?? 0;

    accumulator.set(record.scope, current + emission);
    return accumulator;
  }, new Map<Scope, number>());

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([scope, totalKgCo2e]) => ({
      scope,
      totalKgCo2e: roundToTwoDecimals(totalKgCo2e),
    }));
}

export function getEstimatedCarbonTax(totalKgCo2e: number): number {
  const totalTonsCo2e = totalKgCo2e / 1000;
  return roundToTwoDecimals(totalTonsCo2e * CARBON_TAX_USD_PER_TON_CO2E);
}
