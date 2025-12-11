// controllers/categoryController.js
import { db } from "../config/firebaseAdmin.js";

// GET /api/categories?search=
export async function getCategories(req, res, next) {
  try {
    const { search } = req.query;

    const snapshot = await db.collection("categories").get();

    let categories = [];
    snapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Optional search filter by name/description
    if (search) {
      const lower = String(search).toLowerCase();
      categories = categories.filter(
        (c) =>
          c.name?.toLowerCase().includes(lower) ||
          c.description?.toLowerCase().includes(lower)
      );
    }

    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

// GET /api/categories/:id
export async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;

    const docRef = db.collection("categories").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    next(err);
  }
}

// POST /api/categories (admin only)
export async function createCategory(req, res, next) {
  try {
    const { name, description } = req.body;
    const now = new Date();

    const docRef = await db.collection("categories").add({
      name,
      description: description || "",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    res.status(201).json({
      id: docRef.id,
      message: "Category created successfully",
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/categories/:id (admin only)
export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const docRef = db.collection("categories").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Category not found" });
    }

    const now = new Date();
    const updates = {
      updatedAt: now.toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;

    await docRef.update(updates);

    res.json({ message: "Category updated successfully" });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/categories/:id (admin only)
export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const docRef = db.collection("categories").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Category not found" });
    }

    await docRef.delete();

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    next(err);
  }
}