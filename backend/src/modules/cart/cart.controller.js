import {
  addToCartService,
  clearCartService,
  getCartService,
  removeItemCartService,
  updateCartService,
} from "./cart.service.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await getCartService(userId);

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: "product_id is required" });
    }
    if (quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
    }

    const result = await addToCartService(userId, product_id, quantity);

    return res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ success: false, message: "Valid quantity is required" });
    }

    const result = await updateCartService(userId, itemId, quantity);

    return res.status(200).json({
      success: true,
      message: result.removed ? "Item removed from cart" : "Cart updated successfully",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const removeItemCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    await removeItemCartService(userId, itemId);

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await clearCartService(userId);

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};