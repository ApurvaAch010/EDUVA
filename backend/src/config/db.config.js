import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbPool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "eduva",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  waitForConnections: true,
  connectionLimit:30,
  queueLimit: 0
});

export const testDbConnection = async () => {
  try {
    const connection = await dbPool.getConnection();
    console.log("Database connection pool established successfully!");
    connection.release();
  } catch (error) {
    console.warn("Database connection could not be verified (this is expected if you haven't created the database yet):", error.message);
  }
};

export default dbPool;
