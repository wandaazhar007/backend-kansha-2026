// routes/categoryRoutes.js
import express from "express";
import { body, param, query } from "express-validator";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

// Validators
const createCategoryValidators = [
  body("name").notEmpty().withMessage("Name is required"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
];

const updateCategoryValidators = [
  param("id").notEmpty().withMessage("Category id is required"),
  body("name").optional().isString().withMessage("Name must be a string"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
];

// Public routes
router.get(
  "/",
  [query("search").optional().isString()],
  validateRequest,
  getCategories
);

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Category id is required")],
  validateRequest,
  getCategoryById
);

// Protected (admin only)
router.post(
  "/",
  verifyFirebaseToken,
  createCategoryValidators,
  validateRequest,
  createCategory
);

router.put(
  "/:id",
  verifyFirebaseToken,
  updateCategoryValidators,
  validateRequest,
  updateCategory
);

router.delete(
  "/:id",
  verifyFirebaseToken,
  [param("id").notEmpty().withMessage("Category id is required")],
  validateRequest,
  deleteCategory
);

export default router;