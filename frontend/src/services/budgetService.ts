import { api } from "./api";
import type { BudgetSummary } from "../types/budget";

export type SaveBudgetInput = {
  amount: string;
  month: number;
  year: number;
};

export async function getBudget(year: number, month: number): Promise<BudgetSummary> {
  const response = await api.get<BudgetSummary>(`/budgets/${year}/${month}`);
  return response.data;
}

export async function saveBudget(data: SaveBudgetInput) {
  const response = await api.post<{ budget: NonNullable<BudgetSummary["budget"]> }>(
    "/budgets",
    data,
  );

  return response.data.budget;
}
