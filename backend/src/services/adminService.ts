import { prisma } from "../config/prisma";

export async function getAdminInsights() {
  const now = new Date();
  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );

  const [
    totalUsers,
    totalExpenses,
    totalExpenseValue,
    currentMonthExpenses,
    categorySpending,
    recentExpenses,
    recentUsers
  ] = await Promise.all([
    prisma.user.count(),

    prisma.expense.count(),

    prisma.expense.aggregate({
      _sum: {
        amount: true
      }
    }),

    prisma.expense.count({
      where: {
        expenseDate: {
          gte: monthStart,
          lt: monthEnd
        }
      }
    }),

    prisma.category.findMany({
      include: {
        _count: {
          select: {
            expenses: true
          }
        },
        expenses: {
          select: {
            amount: true
          }
        }
      }
    }),

    prisma.expense.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    }),

    prisma.user.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })
  ]);

  const normalizedCategories = categorySpending
    .map((category) => ({
      id: category.id,
      name: category.name,
      expenseCount: category._count.expenses,
      totalSpent: category.expenses.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
      )
    }))
    .sort((a, b) => b.expenseCount - a.expenseCount);

  return {
    totalUsers,
    totalExpenses,
    totalExpenseValue: Number(
      totalExpenseValue._sum.amount ?? 0
    ),
    currentMonthExpenses,
    spendingPerCategory: normalizedCategories,
    topCategories: normalizedCategories.slice(0, 5),
    bottomCategories: [...normalizedCategories]
      .sort((a, b) => a.expenseCount - b.expenseCount)
      .slice(0, 5),
    recentExpenses: recentExpenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount)
    })),
    recentUsers
  };
}