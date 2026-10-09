import { prisma } from '../config/prisma.js';

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export async function createCategory(name: string, description?: string) {
  return prisma.category.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
    },
  });
}

export async function updateCategory(id: string, name: string, description?: string) {
  return prisma.category.update({
    where: { id },
    data: {
      name: name.trim(),
      description: description?.trim() || null,
    },
  });
}

export async function deleteCategory(id: string) {
  const expenseCount = await prisma.expense.count({
    where: { categoryId: id },
  });

  if (expenseCount > 0) {
    throw new Error('This category cannot be deleted because expenses use it');
  }

  return prisma.category.delete({
    where: { id },
  });
}
