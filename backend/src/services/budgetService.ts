import { prisma } from "../config/prisma";

export async function getBudget(
  userId: string,
  month: number,
  year: number
) {
  const budget = await prisma.budget.findUnique({
    where: {
      userId_month_year: {
        userId,
        month,
        year
      }
    }
  });

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const aggregate = await prisma.expense.aggregate({
    where: {
      userId,
      expenseDate: {
        gte: start,
        lt: end
      }
    },
    _sum: {
      amount: true
    }
  });

  const spent = Number(aggregate._sum.amount ?? 0);
  const budgetAmount = Number(budget?.amount ?? 0);
  const remaining = budgetAmount - spent;

  const percentage =
    budgetAmount > 0
      ? (spent / budgetAmount) * 100
      : 0;

  let status: "WITHIN" | "APPROACHING" | "OVER";

  if (percentage >= 100) {
    status = "OVER";
  } else if (percentage >= 70) {
    status = "APPROACHING";
  } else {
    status = "WITHIN";
  }

  return {
    budget: budget
      ? {
          ...budget,
          amount: Number(budget.amount)
        }
      : null,
    spent,
    remaining,
    percentage,
    status
  };
}

export async function upsertBudget(
  userId: string,
  amount: string,
  month: number,
  year: number
) {
  const budget = await prisma.budget.upsert({
    where: {
      userId_month_year: {
        userId,
        month,
        year
      }
    },
    update: {
      amount
    },
    create: {
      userId,
      amount,
      month,
      year
    }
  });

  return {
    ...budget,
    amount: Number(budget.amount)
  };
}