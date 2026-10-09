import { prisma } from '../config/prisma.js';

export async function getDashboard(userId: string, month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const [expenses, budget] = await Promise.all([
    prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: start,
          lt: end,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        expenseDate: 'desc',
      },
    }),
    prisma.budget.findUnique({
      where: {
        userId_month_year: {
          userId,
          month,
          year,
        },
      },
    }),
  ]);

  const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  const highestExpense = expenses.reduce(
    (highest, expense) =>
      !highest || Number(expense.amount) > Number(highest.amount) ? expense : highest,
    null as (typeof expenses)[number] | null,
  );

  const categoryMap = new Map<
    string,
    {
      categoryId: string;
      categoryName: string;
      amount: number;
    }
  >();

  for (const expense of expenses) {
    const existing = categoryMap.get(expense.categoryId);

    if (existing) {
      existing.amount += Number(expense.amount);
    } else {
      categoryMap.set(expense.categoryId, {
        categoryId: expense.categoryId,
        categoryName: expense.category.name,
        amount: Number(expense.amount),
      });
    }
  }

  const spendingByCategory = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);

  const budgetAmount = Number(budget?.amount ?? 0);
  const remaining = budgetAmount - totalSpent;
  const percentage = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

  const status = percentage >= 100 ? 'OVER' : percentage >= 70 ? 'APPROACHING' : 'WITHIN';

  return {
    month,
    year,
    totalSpent,
    budget: budgetAmount,
    remaining,
    percentage,
    status,
    highestExpense: highestExpense
      ? {
          ...highestExpense,
          amount: Number(highestExpense.amount),
        }
      : null,
    spendingByCategory,
    recentExpenses: expenses.slice(0, 5).map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
    })),
  };
}
