import express from "express";
import { body, param, query } from "express-validator";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const router = express.Router();

// Validators
const createProductValidators = [
  body("name").notEmpty().withMessage("Name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["hibachi", "sushi", "side", "appetizer"])
    .withMessage("Category must be one of: hibachi, sushi, side, appetizer"),
  body("imageUrls")
    .optional()
    .isArray({ min: 1 })
    .withMessage("imageUrls must be an array with at least one URL"),
  body("imageUrls.*")
    .optional()
    .isURL()
    .withMessage("Each image URL in imageUrls must be a valid URL"),
  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be boolean"),
];

const updateProductValidators = [
  param("id").notEmpty().withMessage("Product id is required"),
  body("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),
  body("category")
    .optional()
    .isIn(["hibachi", "sushi", "side", "appetizer"])
    .withMessage("Category must be one of: hibachi, sushi, side, appetizer"),
  body("imageUrls")
    .optional()
    .isArray()
    .withMessage("imageUrls must be an array"),
  body("imageUrls.*")
    .optional()
    .isURL()
    .withMessage("Each image URL in imageUrls must be a valid URL"),
  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be boolean"),
];

// Public routes
router.get(
  "/",
  [
    query("category")
      .optional()
      .isIn(["hibachi", "sushi", "side", "appetizer"])
      .withMessage("Invalid category filter"),
    query("search").optional().isString(),
  ],
  validateRequest,
  getProducts
);

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Product id is required")],
  validateRequest,
  getProductById
);

// Protected routes (admin only)
router.post(
  "/",
  // verifyFirebaseToken,
  createProductValidators,
  // validateRequest,
  createProduct
);

router.put(
  "/:id",
  // verifyFirebaseToken,
  updateProductValidators,
  // validateRequest,
  updateProduct
);

router.delete(
  "/:id",
  // verifyFirebaseToken,
  [param("id").notEmpty().withMessage("Product id is required")],
  // validateRequest,
  deleteProduct
);

export default router;