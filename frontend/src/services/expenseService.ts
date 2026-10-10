import { api } from "./api";
import type {
  Expense,
  ExpenseFilters,
  PaymentMethod,
} from "../types/expense";

export type ExpenseInput = {
  title: string;
  description?: string;
  amount: string;
  categoryId: string;
  paymentMethod: PaymentMethod;
  expenseDate: string;
  notes?: string;
};

export async function getExpenses(filters: ExpenseFilters) {
  const params = {
    page: filters.page,
    limit: filters.limit,
    search: filters.search || undefined,
    categoryId: filters.categoryId || undefined,
    paymentMethod: filters.paymentMethod || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    minAmount: filters.minAmount || undefined,
    maxAmount: filters.maxAmount || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };

  const response = await api.get<{
    expenses: Expense[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>("/expenses", { params });

  return response.data;
}

export async function createExpense(data: ExpenseInput) {
  const response = await api.post<{ expense: Expense }>("/expenses", data);
  return response.data.expense;
}

export async function updateExpense(id: string, data: ExpenseInput) {
  const response = await api.put<{ expense: Expense }>(`/expenses/${id}`, data);
  return response.data.expense;
}

export async function deleteExpense(id: string) {
  await api.delete(`/expenses/${id}`);
}

export async function getExpense(id: string) {
  const response = await api.get<{ expense: Expense }>(`/expenses/${id}`);
  return response.data.expense;
}
