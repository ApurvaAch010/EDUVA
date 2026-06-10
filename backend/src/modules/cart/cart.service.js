import dbPool from "../../config/db.config.js";

const getOrCreateCart = async (userId) => {
  const [rows] = await dbPool.query(
    "SELECT * FROM cart WHERE user_id = ?",
    [userId]
  );

  if (rows.length > 0) return rows[0];

  const [result] = await dbPool.execute(
    "INSERT INTO cart (user_id) VALUES (?)",
    [userId]
  );

  return { id: result.insertId, user_id: userId };
};

export const getCartService = async (userId) => {
  try {
    const cart = await getOrCreateCart(userId);

    const [items] = await dbPool.query(
      `SELECT 
        ci.cart_items_id,
        ci.quantity,
        p.product_id,
        p.name,
        p.image,
        p.price,
        p.discount_price,
        p.stock,
        p.slug,
        (CASE WHEN p.discount_price IS NOT NULL 
          THEN p.discount_price 
          ELSE p.price END) as effective_price,
        (ci.quantity * CASE WHEN p.discount_price IS NOT NULL 
          THEN p.discount_price 
          ELSE p.price END) as subtotal
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.product_id
       WHERE ci.cart_id = ? AND p.is_active = true`,
      [cart.cart_id]
    );

    const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    return {
      cart_id: cart.cart_id,
      total: total.toFixed(2),
      item_count: items.length,
      items,
    };
  } catch (err) {
    throw err;
  }
};

export const addToCartService = async (userId, productId, quantity) => {
  try {
    const cart = await getOrCreateCart(userId);

    const [product] = await dbPool.query(
      "SELECT * FROM products WHERE product_id = ? AND is_active = true",
      [productId]
    );

    if (product.length === 0) throw new Error("Product not found");
    if (parseInt(product[0].stock) < parseInt(quantity)) throw new Error("Insufficient stock");

    const [existing] = await dbPool.query(
      "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cart.cart_id, productId]
    );

    if (existing.length > 0) {
      const newQuantity = parseInt(existing[0].quantity) + parseInt(quantity);
      if (parseInt(product[0].stock) < newQuantity) throw new Error("Insufficient stock");

      await dbPool.execute(
        "UPDATE cart_items SET quantity = ? WHERE cart_items_id = ?",
        [newQuantity, existing[0].cart_items_id]
      );

      return { cart_items_id: existing[0].cart_items_id, product_id: productId, quantity: newQuantity };
    }

    const [result] = await dbPool.execute(
      "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
      [cart.cart_id, productId, quantity]
    );

    return { cart_items_id: result.insertId, product_id: productId, quantity };
  } catch (err) {
    throw err;
  }
};

export const updateCartService = async (userId, itemId, quantity) => {
  try {
    const cart = await getOrCreateCart(userId);

    const [item] = await dbPool.query(
      `SELECT ci.*, p.stock 
       FROM cart_items ci 
       JOIN products p ON ci.product_id = p.product_id 
       WHERE ci.cart_items_id = ? AND ci.cart_id = ?`,
      [itemId, cart.cart_id]
    );
    if (item.length === 0) throw new Error("Cart item not found");

    if (quantity === 0) {
      await dbPool.execute(
        "DELETE FROM cart_items WHERE cart_items_id = ?",
        [itemId]
      );
      return { removed: true, cart_items_id: itemId };
    }

    if (parseInt(item[0].stock) < parseInt(quantity)) throw new Error("Insufficient stock");

    await dbPool.execute(
      "UPDATE cart_items SET quantity = ? WHERE cart_items_id = ?",
      [quantity, itemId]
    );

    return { cart_items_id: itemId, quantity };
  } catch (err) {
    throw err;
  }
};

export const removeItemCartService = async (userId, itemId) => {
  try {
    const cart = await getOrCreateCart(userId);
    console.log("cart", cart)
    const [item] = await dbPool.query(
      "SELECT * FROM cart_items WHERE cart_items_id = ? AND cart_id = ?",
      [itemId, cart.cart_id]
    );
    if (item.length === 0) throw new Error("Cart item not found");

    await dbPool.execute(
      "DELETE FROM cart_items WHERE cart_items_id = ?",
      [itemId]
    );

    return true;
  } catch (err) {
    throw err;
  }
};

export const clearCartService = async (userId) => {
  try {
    const cart = await getOrCreateCart(userId);

    await dbPool.execute(
      "DELETE FROM cart_items WHERE cart_id = ?",
      [cart.cart_id]
    );

    return true;
  } catch (err) {
    throw err;
  }
};