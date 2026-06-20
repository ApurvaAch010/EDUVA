import authMiddleware from "../../middlewares/auth.middleware.js";
import uploader from "../../middlewares/uploader.middleware.js";
import { dashboard, getMe, findUserById, updateUser, getAllUsers, getAdminStats } from "./user.controller.js";
import express from "express";
import { updateUserSchema } from "./user.validator.js";
import validateRequest from "../../middlewares/validation.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";


const userRouter = express.Router();

userRouter.get(
  "/dashboard",
  authMiddleware,
  dashboard
);

userRouter.get("/me", authMiddleware, getMe);
userRouter.get("/get-user/:id", authMiddleware, findUserById);
userRouter.put("/updateUser/:id", authMiddleware, validateRequest(updateUserSchema), uploader.single("profilePic"), updateUser);
userRouter.get("/get-allUsers", authMiddleware, roleMiddleware('admin','mod'), getAllUsers);
userRouter.get("/admin-stats", authMiddleware, roleMiddleware('admin', 'mod'), getAdminStats);

export default userRouter