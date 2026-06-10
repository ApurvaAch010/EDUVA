
import slugify from "slugify";
import dbPool from "../config/db.config.js";

export const generateSlug = async (name) => {
  let slug = slugify(name, { lower: true, strict: true });
  
  // check if slug already exists and make it unique
  const [existing] = await dbPool.query(
    "SELECT slug FROM products WHERE slug LIKE ?",
    [`${slug}%`]
  );

  // if no conflict return as is
  if (!existing) return slug;

  // otherwise put a number on back of slug
  const slugs = await dbPool.query(
    "SELECT slug FROM products WHERE slug LIKE ?",
    [`${slug}%`]
  );
  return `${slug}-${slugs.length + 1}`;
};