import dbPool from "../../config/db.config.js";
import { getCartService } from "../cart/cart.service.js";



export const placeOrderService = async (userId, primary_phone, secondary_phone, shipping_address) => {
    let connection
    try {
        connection = await dbPool.getConnection()
        await connection.beginTransaction();//not using dbPool cause transaction requires running every query simultaneously

        const cart = await getCartService(userId);
        if (!cart.items || cart.items.length === 0) {
            throw new Error("Cart is empty");
        }
        //validate stock for every item before doing anything (using FOR UPDATE to prevent race conditions)
        for (const item of cart.items) {
            const [product] = await connection.query(
                "SELECT stock FROM products WHERE product_id = ? AND is_active = true FOR UPDATE",
                [item.product_id]
            );
            if (product.length === 0) throw new Error(`Product ${item.name} is no longer available`);
            if (parseInt(product[0].stock) < parseInt(item.quantity)) {
                throw new Error(`Insufficient stock for ${item.name}`);
            }
        }
        // create order
        const [orderResult] = await connection.execute(
            `INSERT INTO orders (user_id, total_amount, shipping_address, primary_phone, secondary_phone,payment_method) 
       VALUES (?, ?, ?, ?, ?,?)`,
            [userId, cart.total, shipping_address, primary_phone, secondary_phone ?? null, "COD"]
        );
        const orderId = orderResult.insertId;

        // insert order_items 
        for (const item of cart.items) {
            await connection.execute(
                `INSERT INTO order_items (order_id, product_id, quantity, price, discount_price) 
         VALUES (?, ?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.price, item.discount_price ?? null]
            );

            // decrementing stock
            await connection.execute(
                "UPDATE products SET stock = stock - ? WHERE product_id = ?",
                [parseInt(item.quantity), item.product_id]
            );
        }

        // clear cart after successful order
        await connection.execute(
            "DELETE FROM cart_items WHERE cart_id = ?",
            [cart.cart_id]
        );

        await connection.commit();

        return {
            order_id: orderId,
            total_amount: cart.total,
            item_count: cart.items.length,
            status: "pending",
            shipping_address,
            primary_phone,
            secondary_phone,
        };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

export const getMyOrdersService = async (userId) => {
    try {
        // get all orders for user
        const [orders] = await dbPool.query(
            `SELECT * FROM orders 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
            [userId]
        );

        if (orders.length === 0) return [];

        const orderIds = orders.map((o) => o.order_id);
        const [allItems] = await dbPool.query(
            `SELECT 
                oi.order_id,
                oi.order_item_id,
                oi.quantity,
                oi.price,
                oi.discount_price,
                p.name,
                p.image,
                p.slug
             FROM order_items oi
             JOIN products p ON oi.product_id = p.product_id
             WHERE oi.order_id IN (?)`,
            [orderIds]
        );

        const itemsByOrderId = {};
        allItems.forEach((item) => {
            if (!itemsByOrderId[item.order_id]) {
                itemsByOrderId[item.order_id] = [];
            }
            const { order_id, ...itemDetails } = item;
            itemsByOrderId[order_id].push(itemDetails);
        });

        return orders.map((order) => ({
            ...order,
            items: itemsByOrderId[order.order_id] || [],
        }));
    } catch (err) {
        throw err;
    }
};

export const findOrderByIdService = async (orderId, userId) => {
  try {
    const [orders] = await dbPool.query(
      `SELECT * FROM orders WHERE order_id = ? AND user_id = ?`,
      [orderId, userId]
    );

    if (orders.length === 0) throw new Error("Order not found");

    const [items] = await dbPool.query(
      `SELECT 
        oi.order_item_id,
        oi.quantity,
        oi.price,
        oi.discount_price,
        p.name,
        p.image,
        p.slug,
        p.product_id,
        -- effective price at time of order
        (CASE WHEN oi.discount_price IS NOT NULL 
          THEN oi.discount_price 
          ELSE oi.price END) as effective_price,
        -- subtotal per item
        (oi.quantity * CASE WHEN oi.discount_price IS NOT NULL 
          THEN oi.discount_price 
          ELSE oi.price END) as subtotal
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    return { ...orders[0], items };
  } catch (err) {
    throw err;
  }
};

export const cancelOrderByIdService = async (orderId, userId) => {
  let connection;
  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    // verify order exists and belongs to user
    const [orders] = await connection.query(
      "SELECT * FROM orders WHERE order_id = ? AND user_id = ? FOR UPDATE",
      [orderId, userId]
    );
    if (orders.length === 0) throw new Error("Order not found");

    const order = orders[0];

    // can only cancel pending or processing orders
    if (!["pending", "processing"].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    // get order items to restore stock
    const [items] = await connection.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [orderId]
    );

    // restore stock for each item
    for (const item of items) {
      await connection.execute(
        "UPDATE products SET stock = stock + ? WHERE product_id = ?",
        [parseInt(item.quantity), item.product_id]
      );
    }

    // update order status to cancelled
    await connection.execute(
      "UPDATE orders SET status = 'cancelled' WHERE order_id = ?",
      [orderId]
    );

    await connection.commit();

    return { order_id: orderId, status: "cancelled" };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) connection.release();
  }
};

export const getAllOrdersService = async (limit, page, status) => {
  try {
    const parsedLimit = parseInt(limit);
    const parsedOffset = parseInt((page - 1) * limit);
    const params = [];

    let dataQuery = `
      SELECT o.*, u.username, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;
    let totalQuery = `SELECT COUNT(*) as count FROM orders o`;

    if (status) {
      dataQuery  += " WHERE o.status = ?";
      totalQuery += " WHERE o.status = ?";
      params.push(status);
    }

    dataQuery += " ORDER BY o.created_at DESC LIMIT ? OFFSET ?";

    const [total]  = await dbPool.query(totalQuery, params);
    const [orders] = await dbPool.query(dataQuery, [...params, parsedLimit, parsedOffset]);

    if (orders.length === 0) {
      return {
        total: total[0].count,
        page,
        limit: parsedLimit,
        totalPages: Math.ceil(total[0].count / parsedLimit),
        data: [],
      };
    }

    const orderIds = orders.map((o) => o.order_id);
    const [allItems] = await dbPool.query(
      `SELECT 
          oi.order_id,
          oi.order_item_id,
          oi.quantity,
          oi.price,
          oi.discount_price,
          p.name,
          p.image,
          p.slug
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product_id
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    const itemsByOrderId = {};
    allItems.forEach((item) => {
      if (!itemsByOrderId[item.order_id]) {
        itemsByOrderId[item.order_id] = [];
      }
      const { order_id, ...itemDetails } = item;
      itemsByOrderId[order_id].push(itemDetails);
    });

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: itemsByOrderId[order.order_id] || [],
    }));

    return {
      total: total[0].count,
      page,
      limit: parsedLimit,
      totalPages: Math.ceil(total[0].count / parsedLimit),
      data: ordersWithItems,
    };
  } catch (err) {
    throw err;
  }
};

export const updateOrderStatusService = async (orderId, status) => {
  try {
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    const [orders] = await dbPool.query(
      "SELECT * FROM orders WHERE order_id = ?",
      [orderId]
    );
    if (orders.length === 0) throw new Error("Order not found");

    // restore stock if admin is cancelling
    if (status === "cancelled" && orders[0].status !== "cancelled") {
      let connection;
      try {
        connection = await dbPool.getConnection();
        await connection.beginTransaction();

        const [items] = await connection.query(
          "SELECT * FROM order_items WHERE order_id = ?",
          [orderId]
        );

        for (const item of items) {
          await connection.execute(
            "UPDATE products SET stock = stock + ? WHERE product_id = ?",
            [parseInt(item.quantity), item.product_id]
          );
        }

        await connection.execute(
          "UPDATE orders SET status = ? WHERE order_id = ?",
          [status, orderId]
        );

        await connection.commit();
      } catch (err) {
        if (connection) await connection.rollback();
        throw err;
      } finally {
        if (connection) connection.release();
      }
    } else {
      await dbPool.execute(
        "UPDATE orders SET status = ? WHERE order_id = ?",
        [status, orderId]
      );
    }

    return { order_id: orderId, status };
  } catch (err) {
    throw err;
  }
};