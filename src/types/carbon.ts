export type ActivityType =
  | "electricity"
  | "diesel"
  | "gasoline"
  | "lpg"
  | "transport"
  | "materials";

export type Scope = "scope1" | "scope2" | "scope3";

export interface Country {
  code: string;
  name: string;
  region: string;
  currency: string;
}

export interface Company {
  id: string;
  name: string;
  countryCode: Country["code"];
  industry: string;
  facilityName: string;
}

export interface EmissionFactor {
  activityType: ActivityType;
  label: string;
  unit: string;
  factor: number;
  sourceLabel: string;
}

export interface ActivityRecord {
  id: string;
  companyId: Company["id"];
  countryCode: Country["code"];
  date: string;
  activityType: ActivityType;
  description: string;
  amount: number;
  unit: string;
  emissionFactor: number;
  scope: Scope;
}

export interface ActivityPreset {
  description: string;
  unit: string;
  emissionFactor: number;
  scope: Scope;
}

export interface ActivityTypeDefinition {
  id: ActivityType;
  label: string;
  defaultDescription: string;
  presets: ActivityPreset[];
}

export interface SustainabilityPost {
  id: string;
  companyId: Company["id"];
  title: string;
  summary: string;
  publishedAt: string;
  category: "initiative" | "report" | "milestone";
}
