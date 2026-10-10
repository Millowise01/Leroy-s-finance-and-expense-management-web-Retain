import type { Expense } from "./expense";

export type DashboardData = {
  month: number;
  year: number;
  totalSpent: number;
  budget: number;
  remaining: number;
  percentage: number;
  status: "WITHIN" | "APPROACHING" | "OVER";
  highestExpense: Expense | null;
  spendingByCategory: {
    categoryId: string;
    categoryName: string;
    amount: number;
  }[];
  recentExpenses: Expense[];
};