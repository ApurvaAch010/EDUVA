import dbPool from "../../config/db.config.js";



export const createCategoryService=async(name)=>{
    try{
        const [result]=await dbPool.query("INSERT INTO categories (name) VALUES (?)",[name])
        return result
    }
    catch(error){
        throw error;
    }
}

export const getAllCategoriesService = async (limit, filter, page) => {
  try {
    const offset = (page - 1) * limit;
    const params = [];

    let dataQuery = "SELECT * FROM categories";
    let totalQuery = "SELECT COUNT(*) as count FROM categories";

    
    if (filter) {
      dataQuery += " WHERE name LIKE ?";
      totalQuery += " WHERE name LIKE ?";
      params.push(`%${filter}%`);
    }

    dataQuery += " LIMIT ? OFFSET ?";

    const [total] = await dbPool.query(totalQuery, params);
    const [result] = await dbPool.query(dataQuery, [...params, limit, offset]);

    return {
      total: total[0].count,
      page,
      limit,
      totalPages: Math.ceil(total[0].count / limit),
      data: result,
    };
  } catch (error) {
    throw error;
  }
};

export const getCategoryByIdService=async(id)=>{
    try{
        const [result]=await dbPool.query("SELECT * FROM categories WHERE id=?",[id])
        return result
    }
    catch(error){
        throw error;
    }
}

export const updateCategoryService=async(id,name)=>{
    try{
        const [result]=await dbPool.query("UPDATE categories SET name=? WHERE id=?",[name,id])
        return result
    }
    catch(error){
        throw error;
    }
}

export const deleteCategoryService=async(id)=>{
    try{
        const [result]=await dbPool.query("DELETE FROM categories WHERE id=?",[id])
        return result
    }
    catch(error){
        throw error;
    }
}