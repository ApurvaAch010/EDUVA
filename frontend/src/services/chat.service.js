import api from "../utils/api";

export const getUserConversation = async () => {
    try {
        const res = await api.get("/chat/user/conversation");
        return res.data;
    } catch (err) {
        throw err.response?.data || { message: "Unable to fetch conversation" };
    }
};

export const getAllConversations = async () => {
    try {
        const res = await api.get("/chat/conversations");
        return res.data;
    } catch (err) {
        throw err.response?.data || { message: "Unable to fetch conversations" };
    }
};

export const getMessages = async (conversationId) => {
    try {
        const res = await api.get(`/chat/${conversationId}/messages`);
        return res.data;
    } catch (err) {
        throw err.response?.data || { message: "Unable to fetch messages" };
    }
};
