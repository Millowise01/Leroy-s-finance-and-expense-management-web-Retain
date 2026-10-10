export type BudgetStatus =
  | "WITHIN"
  | "APPROACHING"
  | "OVER";

export type BudgetSummary = {
  budget: {
    id: string;
    amount: number;
    month: number;
    year: number;
  } | null;
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
};