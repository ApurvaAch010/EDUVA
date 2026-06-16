import express from "express";
import cors from "cors";
import mainRouter from "../routes/route.js";
import cookieParser from "cookie-parser";

const app = express();


app.use(cors({
  origin: "http://localhost:5173",
  credentials:true  
}));
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("./public/uploads"));

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Eduva API backend"
  });
});


app.use("/", mainRouter);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || null
  });
});

export default app;