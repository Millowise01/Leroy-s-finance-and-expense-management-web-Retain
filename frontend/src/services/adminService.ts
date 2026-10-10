import { api } from "./api";
import type { AdminInsights } from "../types/admin";

export async function getAdminInsights(): Promise<AdminInsights> {
  const response = await api.get<{ insights: AdminInsights }>("/admin/insights");
  return response.data.insights;
}
