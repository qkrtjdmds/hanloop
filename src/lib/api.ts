import {
  activityRecords as seedActivityRecords,
  companies as seedCompanies,
  countries as seedCountries,
  emissionFactors as seedEmissionFactors,
  sustainabilityPosts as seedSustainabilityPosts,
} from "@/data/seed";
import type {
  ActivityRecord,
  Company,
  Country,
  EmissionFactor,
  SustainabilityPost,
} from "@/types/carbon";

const MIN_LATENCY_MS = 200;
const MAX_LATENCY_MS = 800;

const countries: Country[] = seedCountries.map((country) => ({ ...country }));
const companies: Company[] = seedCompanies.map((company) => ({ ...company }));
const emissionFactors: EmissionFactor[] = seedEmissionFactors.map((factor) => ({
  ...factor,
}));
let activityRecords: ActivityRecord[] = seedActivityRecords.map((record) => ({
  ...record,
}));
let sustainabilityPosts: SustainabilityPost[] = seedSustainabilityPosts.map((post) => ({
  ...post,
}));

function generateId(prefix: string): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getLatencyMs(): number {
  return Math.floor(Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS + 1)) + MIN_LATENCY_MS;
}

function delay(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

async function simulateReadLatency(): Promise<void> {
  await delay(getLatencyMs());
}

async function simulateWriteLatency(): Promise<void> {
  await delay(getLatencyMs());
}

function cloneCountries(items: Country[]): Country[] {
  return items.map((item) => ({ ...item }));
}

function cloneCompanies(items: Company[]): Company[] {
  return items.map((item) => ({ ...item }));
}

function cloneEmissionFactors(items: EmissionFactor[]): EmissionFactor[] {
  return items.map((item) => ({ ...item }));
}

function cloneActivityRecords(items: ActivityRecord[]): ActivityRecord[] {
  return items.map((item) => ({ ...item }));
}

function cloneSustainabilityPosts(items: SustainabilityPost[]): SustainabilityPost[] {
  return items.map((item) => ({ ...item }));
}

export async function fetchCountries(): Promise<Country[]> {
  await simulateReadLatency();
  return cloneCountries(countries);
}

export async function fetchCompanies(): Promise<Company[]> {
  await simulateReadLatency();
  return cloneCompanies(companies);
}

export async function fetchEmissionFactors(): Promise<EmissionFactor[]> {
  await simulateReadLatency();
  return cloneEmissionFactors(emissionFactors);
}

export async function fetchActivityRecords(): Promise<ActivityRecord[]> {
  await simulateReadLatency();
  return cloneActivityRecords(activityRecords);
}

export async function fetchSustainabilityPosts(): Promise<SustainabilityPost[]> {
  await simulateReadLatency();
  return cloneSustainabilityPosts(sustainabilityPosts);
}

export async function createOrUpdateActivityRecord(
  record: Omit<ActivityRecord, "id"> & Partial<Pick<ActivityRecord, "id">>,
): Promise<ActivityRecord> {
  await simulateWriteLatency();

  const nextRecord: ActivityRecord = {
    ...record,
    id: record.id ?? generateId("activity"),
  };

  const existingIndex = activityRecords.findIndex((item) => item.id === nextRecord.id);

  if (existingIndex >= 0) {
    activityRecords = activityRecords.map((item, index) =>
      index === existingIndex ? { ...nextRecord } : item,
    );
  } else {
    activityRecords = [...activityRecords, { ...nextRecord }];
  }

  return { ...nextRecord };
}

export async function deleteActivityRecord(id: string): Promise<void> {
  await simulateWriteLatency();
  activityRecords = activityRecords.filter((record) => record.id !== id);
}

export async function createOrUpdateSustainabilityPost(
  post: Omit<SustainabilityPost, "id"> & Partial<Pick<SustainabilityPost, "id">>,
): Promise<SustainabilityPost> {
  await simulateWriteLatency();

  const nextPost: SustainabilityPost = {
    ...post,
    id: post.id ?? generateId("post"),
  };

  const existingIndex = sustainabilityPosts.findIndex((item) => item.id === nextPost.id);

  if (existingIndex >= 0) {
    sustainabilityPosts = sustainabilityPosts.map((item, index) =>
      index === existingIndex ? { ...nextPost } : item,
    );
  } else {
    sustainabilityPosts = [...sustainabilityPosts, { ...nextPost }];
  }

  return { ...nextPost };
}
