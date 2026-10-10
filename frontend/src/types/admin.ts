import type { User, UserRole } from "./auth";
import type { Category } from "./category";
import type { Expense } from "./expense";

export type AdminCategoryStat = {
  id: string;
  name: string;
  expenseCount: number;
  totalSpent: number;
};

export type AdminRecentExpense = Expense & {
  user: Pick<User, "id" | "name" | "email">;
};

export type AdminRecentUser = Pick<User, "id" | "name" | "email" | "createdAt"> & {
  role: UserRole;
};

export type AdminInsights = {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseValue: number;
  currentMonthExpenses: number;
  spendingPerCategory: AdminCategoryStat[];
  topCategories: AdminCategoryStat[];
  bottomCategories: AdminCategoryStat[];
  recentExpenses: AdminRecentExpense[];
  recentUsers: AdminRecentUser[];
};

export type AdminCategory = Category;
