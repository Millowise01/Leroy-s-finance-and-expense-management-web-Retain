import { prisma } from "../config/prisma";

type ExpenseFilters = {
  userId: string;
  search?: string;
  categoryId?: string;
  paymentMethod?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
  page: number;
  limit: number;
};

export async function listExpenses(filters: ExpenseFilters) {
  const where = {
    userId: filters.userId,
    ...(filters.search
      ? {
          OR: [
            {
              title: {
                contains: filters.search,
                mode: "insensitive" as const
              }
            },
            {
              description: {
                contains: filters.search,
                mode: "insensitive" as const
              }
            }
          ]
        }
      : {}),
    ...(filters.categoryId
      ? { categoryId: filters.categoryId }
      : {}),
    ...(filters.paymentMethod
      ? { paymentMethod: filters.paymentMethod as any }
      : {}),
    ...(filters.startDate || filters.endDate
      ? {
          expenseDate: {
            ...(filters.startDate
              ? { gte: filters.startDate }
              : {}),
            ...(filters.endDate
              ? { lte: filters.endDate }
              : {})
          }
        }
      : {}),
    ...(filters.minAmount !== undefined ||
    filters.maxAmount !== undefined
      ? {
          amount: {
            ...(filters.minAmount !== undefined
              ? { gte: filters.minAmount }
              : {}),
            ...(filters.maxAmount !== undefined
              ? { lte: filters.maxAmount }
              : {})
          }
        }
      : {})
  };

  const skip = (filters.page - 1) * filters.limit;

  const orderBy =
    filters.sortBy === "amount"
      ? { amount: filters.sortOrder ?? "desc" }
      : { expenseDate: filters.sortOrder ?? "desc" };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: {
        category: true
      },
      orderBy,
      skip,
      take: filters.limit
    }),
    prisma.expense.count({ where })
  ]);

  return {
    expenses: expenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount)
    })),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit)
    }
  };
}

export async function getExpense(
  id: string,
  userId: string
) {
  const expense = await prisma.expense.findFirst({
    where: {
      id,
      userId
    },
    include: {
      category: true
    }
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  return {
    ...expense,
    amount: Number(expense.amount)
  };
}

export async function createExpense(data: {
  userId: string;
  title: string;
  description?: string;
  amount: string;
  categoryId: string;
  paymentMethod:
    | "CASH"
    | "MOBILE_MONEY"
    | "DEBIT_CARD"
    | "CREDIT_CARD"
    | "BANK_TRANSFER"
    | "OTHER";
  expenseDate: Date;
  notes?: string;
}) {
  const category = await prisma.category.findUnique({
    where: {
      id: data.categoryId
    }
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const expense = await prisma.expense.create({
    data: {
      userId: data.userId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      amount: data.amount,
      categoryId: data.categoryId,
      paymentMethod: data.paymentMethod,
      expenseDate: data.expenseDate,
      notes: data.notes?.trim() || null
    },
    include: {
      category: true
    }
  });

  return {
    ...expense,
    amount: Number(expense.amount)
  };
}

export async function updateExpense(
  id: string,
  userId: string,
  data: {
    title: string;
    description?: string;
    amount: string;
    categoryId: string;
    paymentMethod:
      | "CASH"
      | "MOBILE_MONEY"
      | "DEBIT_CARD"
      | "CREDIT_CARD"
      | "BANK_TRANSFER"
      | "OTHER";
    expenseDate: Date;
    notes?: string;
  }
) {
  const existing = await prisma.expense.findFirst({
    where: { id, userId }
  });

  if (!existing) {
    throw new Error("Expense not found");
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      amount: data.amount,
      categoryId: data.categoryId,
      paymentMethod: data.paymentMethod,
      expenseDate: data.expenseDate,
      notes: data.notes?.trim() || null
    },
    include: {
      category: true
    }
  });

  return {
    ...expense,
    amount: Number(expense.amount)
  };
}

export async function deleteExpense(
  id: string,
  userId: string
) {
  const existing = await prisma.expense.findFirst({
    where: { id, userId }
  });

  if (!existing) {
    throw new Error("Expense not found");
  }

  await prisma.expense.delete({
    where: { id }
  });
}