import type { Category } from "./category";

export type PaymentMethod =
  | "CASH"
  | "MOBILE_MONEY"
  | "DEBIT_CARD"
  | "CREDIT_CARD"
  | "BANK_TRANSFER"
  | "OTHER";

export type Expense = {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  categoryId: string;
  paymentMethod: PaymentMethod;
  expenseDate: string;
  notes?: string | null;
  category: Category;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseFilters = {
  search: string;
  categoryId: string;
  paymentMethod: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  sortBy: "date" | "amount";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
};
