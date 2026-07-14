import express from "express";
import * as chatController from "./chat.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";

const router = express.Router();


router.get("/conversations",authMiddleware, chatController.getConversationsController);
router.get("/user/conversation",authMiddleware, chatController.getUserConversationController);
router.get("/:conversation_id/messages",authMiddleware, chatController.getMessagesController);

export default router;
