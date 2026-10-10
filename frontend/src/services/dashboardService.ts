import { api } from "./api";
import type { DashboardData } from "../types/dashboard";

export async function getDashboard(month: number, year: number): Promise<DashboardData> {
  const response = await api.get<{ dashboard: DashboardData }>("/dashboard", {
    params: { month, year },
  });

  return response.data.dashboard;
}
