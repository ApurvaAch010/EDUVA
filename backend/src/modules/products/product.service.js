import dbPool from "../../config/db.config.js";
import { generateSlug } from "../../slug/slug.js";
import fs from "fs";

export const createProductService = async (data, imagePath, userId) => {
    try {
        const slug = await generateSlug(data.name);

        const [result] = await dbPool.execute(
            `INSERT INTO products 
        (name, slug, description, image, price, discount_price, stock, category_id, is_active, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.name,
                slug,
                data.description ?? null,
                imagePath ?? null,
                data.price,
                data.discount_price ?? null,
                data.stock,
                data.category_id,
                data.is_active ?? true,
                userId,
            ]
        );

        return { id: result.insertId, slug, ...data, image: imagePath };
    } catch (err) {
        throw err;
    }
};

export const findProductById = async (identifier) => {
    try {
        // if  number, search by product_id, else search by slug
        const isId = /^\d+$/.test(identifier);
        const column = isId ? "product_id" : "slug";
        const [rows] = await dbPool.query(
            `SELECT p.*, c.name as category_name 
   FROM products p
   LEFT JOIN categories c ON p.category_id = c.cat_id
   WHERE p.${column} = ? AND p.is_active = true`,
            [identifier]
        );
       

        if (rows.length === 0) return null;
        return rows[0];
    } catch (err) {
        throw err;
    }
};

export const getAllProductsService = async (limit, page, search, category_id, sort) => {
    try {
        const parsedLimit = parseInt(limit);
        const parsedOffset = parseInt((page - 1) * limit);
        const params = [];

        let dataQuery = `
  SELECT p.*, c.name as category_name 
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.cat_id
  WHERE p.is_active = true
`;
        let totalQuery = `
  SELECT COUNT(*) as count 
  FROM products p 
  WHERE p.is_active = true
`;

        if (search) {
            dataQuery += " AND p.name LIKE ?";
            totalQuery += " AND p.name LIKE ?";
            params.push(`%${search}%`);
        }

        if (category_id) {
            dataQuery += " AND p.category_id = ?";
            totalQuery += " AND p.category_id = ?";
            params.push(category_id);
        }

        const sortOptions = {
            price_asc: "p.price ASC",
            price_desc: "p.price DESC",
            newest: "p.created_at DESC",
            oldest: "p.created_at ASC",
        };
        dataQuery += ` ORDER BY ${sortOptions[sort] ?? "p.created_at DESC"}`;
        dataQuery += " LIMIT ? OFFSET ?";

        const [total] = await dbPool.query(totalQuery, params);
        const [products] = await dbPool.query(dataQuery, [...params, parsedLimit, parsedOffset]);
        return {
            total: total[0].count,
            page,
            limit: parsedLimit,
            totalPages: Math.ceil(total[0].count / parsedLimit),
            data: products,
        };
    } catch (err) {
        throw err;
    }
};

export const updateProductByService = async (data, newImagePath, productId) => {
    try {

        const existing = await findProductById(productId);
        if (!existing) throw new Error("Product not found");

        //remove old image
        if (newImagePath && existing.image) {
            fs.unlink(existing.image, () => { });
        }

        // only regenerate slug if name is actually changing
        const slug = data.name && data.name !== existing.name
            ? await generateSlug(data.name)
            : existing.slug;

        const updated = {
            name: data.name !== undefined ? data.name : existing.name,
            slug,
            description: data.description !== undefined ? data.description : existing.description,
            image: newImagePath !== null ? newImagePath : existing.image,
            price: data.price !== undefined ? data.price : existing.price,
            discount_price: data.discount_price !== undefined ? data.discount_price : existing.discount_price,
            stock: data.stock !== undefined ? data.stock : existing.stock,
            category_id: data.category_id !== undefined ? data.category_id : existing.category_id,
            is_active: data.is_active !== undefined ? data.is_active : existing.is_active,
        };

        await dbPool.execute(
            `UPDATE products 
       SET name=?, slug=?, description=?, image=?, price=?, discount_price=?, stock=?, category_id=?, is_active=?
       WHERE product_id=?`,
            [
                updated.name,
                updated.slug,
                updated.description,
                updated.image,
                updated.price,
                updated.discount_price,
                updated.stock,
                updated.category_id,
                updated.is_active,
                productId,
            ]
        );

        return { id: productId, ...updated };
    } catch (err) {
        throw err;
    }
};

export const deleteProductByService = async (productId) => {
    try {
        const existing = await findProductById(productId);
        if (!existing) throw new Error("Product not found");

        const [result] = await dbPool.execute(
            "UPDATE products SET is_active = false WHERE product_id = ?",
            [productId]
        );
        if (result.affectedRows === 0) throw new Error("Failed to delete product");

        return true;
    } catch (err) {
        throw err;
    }
};