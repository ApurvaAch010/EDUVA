import express from "express";
import { register, login, logout, forgetPassword, resetPassword } from "./auth.controller.js";
import uploader from "../../middlewares/uploader.middleware.js";
import validateRequest from "../../middlewares/validation.middleware.js";
import { registerSchema, loginSchema, forgetPasswordSchema, resetPasswordSchema } from "./auth.validator.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const authRouter = express.Router();


authRouter.post(
  "/register",
  uploader.single("profilePic"), 
  validateRequest(registerSchema), 
  register                       
);

authRouter.post(
  "/login",
  validateRequest(loginSchema),
  login
);

authRouter.post(
  "/logout",
  authMiddleware,
  logout
);



authRouter.post(
  "/forget-password",
  validateRequest(forgetPasswordSchema),
  forgetPassword
);

authRouter.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  resetPassword
);

export default authRouter;
