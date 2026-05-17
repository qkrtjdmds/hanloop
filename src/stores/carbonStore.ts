"use client";

import { create } from "zustand";

import {
  createOrUpdateActivityRecord,
  createOrUpdateSustainabilityPost,
  deleteActivityRecord as deleteActivityRecordApi,
  fetchActivityRecords,
  fetchCompanies,
  fetchCountries,
  fetchEmissionFactors,
  fetchSustainabilityPosts,
} from "@/lib/api";
import {
  getEmissionByActivityType as calculateEmissionByActivityType,
  getEmissionByMonth as calculateEmissionByMonth,
  getEstimatedCarbonTax as calculateEstimatedCarbonTax,
  getTotalEmission as calculateTotalEmission,
  type EmissionByActivityType,
  type EmissionByMonth,
} from "@/lib/carbon";
import type {
  ActivityRecord,
  Company,
  Country,
  EmissionFactor,
  SustainabilityPost,
} from "@/types/carbon";

type ActivityRecordInput = Omit<ActivityRecord, "id"> & Partial<Pick<ActivityRecord, "id">>;
type SustainabilityPostInput = Omit<SustainabilityPost, "id"> &
  Partial<Pick<SustainabilityPost, "id">>;

interface CarbonStoreState {
  countries: Country[];
  companies: Company[];
  emissionFactors: EmissionFactor[];
  activityRecords: ActivityRecord[];
  sustainabilityPosts: SustainabilityPost[];
  isLoading: boolean;
  error: string | null;
  selectedCompanyId: string | null;
  selectedMonth: string | null;
  loadDashboardData: () => Promise<void>;
  setSelectedCompanyId: (companyId: string | null) => void;
  setSelectedMonth: (month: string | null) => void;
  saveActivityRecord: (record: ActivityRecordInput) => Promise<ActivityRecord | null>;
  deleteActivityRecord: (id: string) => Promise<boolean>;
  saveSustainabilityPost: (
    post: SustainabilityPostInput,
  ) => Promise<SustainabilityPost | null>;
  getFilteredActivityRecords: () => ActivityRecord[];
  getTotalEmission: () => number;
  getEmissionByMonth: () => EmissionByMonth[];
  getEmissionByActivityType: () => EmissionByActivityType[];
  getEstimatedCarbonTax: () => number;
}

function filterRecords(
  records: ActivityRecord[],
  selectedCompanyId: string | null,
  selectedMonth: string | null,
): ActivityRecord[] {
  return records.filter((record) => {
    const matchesCompany = selectedCompanyId ? record.companyId === selectedCompanyId : true;
    const matchesMonth = selectedMonth ? record.date.startsWith(selectedMonth) : true;

    return matchesCompany && matchesMonth;
  });
}

function filterRecordsByCompany(
  records: ActivityRecord[],
  selectedCompanyId: string | null,
): ActivityRecord[] {
  if (!selectedCompanyId) {
    return records;
  }

  return records.filter((record) => record.companyId === selectedCompanyId);
}

export const useCarbonStore = create<CarbonStoreState>((set, get) => ({
  countries: [],
  companies: [],
  emissionFactors: [],
  activityRecords: [],
  sustainabilityPosts: [],
  isLoading: false,
  error: null,
  selectedCompanyId: null,
  selectedMonth: null,

  async loadDashboardData() {
    set({ isLoading: true, error: null });

    try {
      const [
        countries,
        companies,
        emissionFactors,
        activityRecords,
        sustainabilityPosts,
      ] = await Promise.all([
        fetchCountries(),
        fetchCompanies(),
        fetchEmissionFactors(),
        fetchActivityRecords(),
        fetchSustainabilityPosts(),
      ]);

      set({
        countries,
        companies,
        emissionFactors,
        activityRecords,
        sustainabilityPosts,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Dashboard data load failed", error);
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "대시보드 데이터를 불러오지 못했습니다.",
      });
    }
  },

  setSelectedCompanyId(companyId) {
    set({ selectedCompanyId: companyId });
  },

  setSelectedMonth(month) {
    set({ selectedMonth: month });
  },

  async saveActivityRecord(record) {
    set({ isLoading: true, error: null });

    try {
      const savedRecord = await createOrUpdateActivityRecord(record);

      set((state) => {
        const existingIndex = state.activityRecords.findIndex(
          (item) => item.id === savedRecord.id,
        );

        const nextActivityRecords =
          existingIndex >= 0
            ? state.activityRecords.map((item, index) =>
                index === existingIndex ? savedRecord : item,
              )
            : [...state.activityRecords, savedRecord];

        return {
          activityRecords: nextActivityRecords,
          isLoading: false,
          error: null,
        };
      });

      return savedRecord;
    } catch (error) {
      console.error("Activity record save failed", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "저장 실패",
      });
      return null;
    }
  },

  async deleteActivityRecord(id) {
    set({ isLoading: true, error: null });

    try {
      await deleteActivityRecordApi(id);

      set((state) => ({
        activityRecords: state.activityRecords.filter((record) => record.id !== id),
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error) {
      console.error("Activity record delete failed", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "삭제 실패",
      });
      return false;
    }
  },

  async saveSustainabilityPost(post) {
    set({ isLoading: true, error: null });

    try {
      const savedPost = await createOrUpdateSustainabilityPost(post);

      set((state) => {
        const existingIndex = state.sustainabilityPosts.findIndex(
          (item) => item.id === savedPost.id,
        );

        const nextSustainabilityPosts =
          existingIndex >= 0
            ? state.sustainabilityPosts.map((item, index) =>
                index === existingIndex ? savedPost : item,
              )
            : [...state.sustainabilityPosts, savedPost];

        return {
          sustainabilityPosts: nextSustainabilityPosts,
          isLoading: false,
          error: null,
        };
      });

      return savedPost;
    } catch (error) {
      console.error("Sustainability post save failed", error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "저장 실패",
      });
      return null;
    }
  },

  getFilteredActivityRecords() {
    const { activityRecords, selectedCompanyId, selectedMonth } = get();
    return filterRecords(activityRecords, selectedCompanyId, selectedMonth);
  },

  getTotalEmission() {
    const { emissionFactors } = get();
    return calculateTotalEmission(get().getFilteredActivityRecords(), emissionFactors);
  },

  getEmissionByMonth() {
    const { activityRecords, emissionFactors, selectedCompanyId } = get();
    const records = filterRecordsByCompany(activityRecords, selectedCompanyId);
    return calculateEmissionByMonth(records, emissionFactors);
  },

  getEmissionByActivityType() {
    const { emissionFactors } = get();
    return calculateEmissionByActivityType(get().getFilteredActivityRecords(), emissionFactors);
  },

  getEstimatedCarbonTax() {
    return calculateEstimatedCarbonTax(get().getTotalEmission());
  },
}));
