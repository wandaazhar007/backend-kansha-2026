import { db } from "../config/firebaseAdmin.js";

// GET /api/products?category=&search=
export async function getProducts(req, res, next) {
  try {
    const { category, search } = req.query;

    let query = db.collection("products");

    if (category) {
      query = query.where("category", "==", category);
    }

    const snapshot = await query.get();
    let products = [];

    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Simple search filter (by name/description) on server-side
    if (search) {
      const lower = String(search).toLowerCase();
      products = products.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower)
      );
    }

    res.json({ products });
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id
export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    const docRef = db.collection("products").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    next(err);
  }
}

// POST /api/products (admin only)
export async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, imageUrls, isAvailable } = req.body;

    const now = new Date();

    const normalizedImageUrls = Array.isArray(imageUrls) ? imageUrls : [];

    const docRef = await db.collection("products").add({
      name,
      description,
      price: Number(price),
      category,
      imageUrls: normalizedImageUrls,
      isAvailable: typeof isAvailable === "boolean" ? isAvailable : true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    res.status(201).json({
      id: docRef.id,
      message: "Product created successfully",
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id (admin only)
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, price, category, imageUrls, isAvailable } = req.body;

    const docRef = db.collection("products").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    const now = new Date();

    const updates = {
      updatedAt: now.toISOString(),
    };

    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = Number(price);
    if (category !== undefined) updates.category = category;
    if (imageUrls !== undefined) {
      updates.imageUrls = Array.isArray(imageUrls) ? imageUrls : [];
    }
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;

    await docRef.update(updates);

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id (admin only)
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const docRef = db.collection("products").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Product not found" });
    }

    await docRef.delete();

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
}