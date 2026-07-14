import * as chatService from './chat.service.js';

export const getConversationsController = async (req, res, next) => {
    try {
        const conversations = await chatService.getAllConversations();
        res.status(200).json({
            success: true,
            data: conversations
        });
    } catch (err) {
        next(err);
    }
};

export const getUserConversationController = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const conversation = await chatService.getOrCreateConversation(customerId);
        res.status(200).json({
            success: true,
            data: conversation
        });
    } catch (err) {
        next(err);
    }
};

export const getMessagesController = async (req, res, next) => {
    try {
        const { conversation_id } = req.params;
        const messages = await chatService.getMessagesByConversationId(conversation_id);
        
        // Optionally mark as read when fetched
        await chatService.markMessagesAsRead(conversation_id, req.user.id);
        
        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (err) {
        next(err);
    }
};
