import type { Request, Response } from "express";
import { z } from "zod";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory
} from "../services/categoryService";

const categorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional()
});

export async function listCategories(
  _req: Request,
  res: Response
): Promise<void> {
  const categories = await getCategories();
  res.json({ categories });
}

export async function createCategoryController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data = categorySchema.parse(req.body);
    const category = await createCategory(
      data.name,
      data.description
    );

    res.status(201).json({ category });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error
        ? error.message
        : "Unable to create category"
    });
  }
}

export async function updateCategoryController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const data = categorySchema.parse(req.body);
    const category = await updateCategory(
      req.params.id,
      data.name,
      data.description
    );

    res.json({ category });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error
        ? error.message
        : "Unable to update category"
    });
  }
}

export async function deleteCategoryController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await deleteCategory(req.params.id);

    res.json({
      message: "Category deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error
        ? error.message
        : "Unable to delete category"
    });
  }
}