import jwt from "jsonwebtoken";
import dbPool from "../config/db.config.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACTIVE_SECRET
    );

    
    try {
      const [users] = await dbPool.execute(
        "SELECT active_tokens FROM users WHERE id = ?",
        [decoded.id]
      );

      if (users.length === 0 || users[0].active_tokens !== token) {
        return res.status(401).json({
          success: false,
          message: "Session has expired or you have logged out. Please log in again."
        });
      }
    } catch (dbError) {
      if (
        dbError.code !== "ER_NO_SUCH_TABLE" &&
        dbError.code !== "ECONNREFUSED" &&
        dbError.code !== "ENOTFOUND"
      ) {
        throw dbError;
      }
      console.log("Database table users not found or offline - bypassing session validation in middleware.");
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    
    let message = "Invalid token";
    if (error.name === "TokenExpiredError") {
      message = "Token has expired";
    }

    return res.status(401).json({
      success: false,
      message
    });
  }
};

export default authMiddleware;
