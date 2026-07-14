import{ useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { getUserConversation, getMessages } from "../../../services/chat.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import "./UserChatPage.css";

export const UserChatPage = () => {
    const { user } = useSelector((state) => state.auth);
    const [socket, setSocket] = useState(null);
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const convRes = await getUserConversation();
                if (convRes.success && convRes.data) {
                    setConversation(convRes.data);
                    const msgRes = await getMessages(convRes.data.conversation_id);
                    if (msgRes.success) {
                        setMessages(msgRes.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching chat data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!conversation) return;

        const API_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8080";
        const newSocket = io(API_URL, {
            withCredentials: true
        });

        newSocket.on("connect", () => {
            newSocket.emit("join_room", { conversationId: conversation.conversation_id });
        });

        newSocket.on("receive_message", (message) => {
            setMessages((prev) => [...prev, message]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit("leave_room", { conversationId: conversation.conversation_id });
            newSocket.disconnect();
        };
    }, [conversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !conversation) return;

        socket.emit("send_message", {
            conversationId: conversation.conversation_id,
            text: newMessage
        });
        setNewMessage("");
    };

    if (loading) {
        return <div className="user-chat-loading">Loading chat...</div>;
    }

    return (
        <div className="user-chat-container">
            <h1 className="user-chat-title">Support Chat</h1>
            
            <div className="user-chat-box">
                {/* Header */}
                <div className="user-chat-header">
                    <h2>Chat with Support</h2>
                    <p>We typically reply in a few minutes.</p>
                </div>
                
                {/* Messages Area */}
                <div className="user-chat-messages">
                    {messages.length === 0 ? (
                        <div className="user-chat-empty">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isMe = msg.sender_id === user?.id;
                            return (
                                <div key={msg.message_id || index} className={`chat-message-row ${isMe ? "me" : "them"}`}>
                                    <div className={`chat-bubble ${isMe ? "me" : "them"}`}>
                                        <div className="chat-bubble-text">{msg.message_text}</div>
                                        <div className="chat-bubble-time">
                                            {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="user-chat-input-area">
                    <form onSubmit={handleSendMessage} className="user-chat-form">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="user-chat-input"
                        />
                        <button 
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="user-chat-submit"
                        >
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
