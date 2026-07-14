import dbPool from "../../config/db.config.js";

export const getOrCreateConversation = async (customerId) => {
    try {
        const [conversations] = await dbPool.execute(
            "SELECT * FROM conversations WHERE customer_id = ?",
            [customerId]
        );

        if (conversations.length > 0) {
            return conversations[0];
        }

        // Create new conversation
        const [result] = await dbPool.execute(
            "INSERT INTO conversations (customer_id, status) VALUES (?, 'open')",
            [customerId]
        );

        return {
            conversation_id: result.insertId,
            customer_id: customerId,
            status: 'open'
        };
    } catch (err) {
        throw err;
    }
};

export const getAllConversations = async () => {
    try {
        const [conversations] = await dbPool.execute(`
            SELECT c.*, u.username as customer_name, u.email as customer_email, u.profile_pic as customer_pic,
                   (SELECT message_text FROM messages m WHERE m.conversation_id = c.conversation_id ORDER BY created_at DESC LIMIT 1) as last_message,
                   (SELECT created_at FROM messages m WHERE m.conversation_id = c.conversation_id ORDER BY created_at DESC LIMIT 1) as last_message_time
            FROM conversations c
            JOIN users u ON c.customer_id = u.id
            ORDER BY last_message_time DESC
        `);
        return conversations;
    } catch (err) {
        throw err;
    }
};

export const getMessagesByConversationId = async (conversationId) => {
    try {
        const [messages] = await dbPool.execute(`
            SELECT m.*, u.username as sender_name, u.role as sender_role
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.conversation_id = ?
            ORDER BY m.created_at ASC
        `, [conversationId]);
        return messages;
    } catch (err) {
        throw err;
    }
};

export const saveMessage = async (conversationId, senderId, text) => {
    try {
        const [result] = await dbPool.execute(
            "INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)",
            [conversationId, senderId, text]
        );
        
        const [savedMessage] = await dbPool.execute(`
            SELECT m.*, u.username as sender_name, u.role as sender_role 
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE message_id = ?
        `, [result.insertId]);

        return savedMessage[0];
    } catch (err) {
        throw err;
    }
};

export const markMessagesAsRead = async (conversationId, senderId) => {
    try {
        // Mark messages as read where sender is NOT the current user
        await dbPool.execute(
            "UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ?",
            [conversationId, senderId]
        );
    } catch (err) {
        throw err;
    }
}
