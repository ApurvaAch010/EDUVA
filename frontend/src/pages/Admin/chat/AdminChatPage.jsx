import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { getAllConversations, getMessages } from "../../../services/chat.service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faUserCircle, faUserSecret } from "@fortawesome/free-solid-svg-icons";
import "../../User/chat/UserChatPage.css"
import "./AdminChatPage.css";

export const AdminChatPage = () => {
    const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "";

    const imgSrc = (path) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        return `${BASE_URL}/${path.replace(/^\//, "")}`;
    };
    const { user } = useSelector((state) => state.auth);
    const [socket, setSocket] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const res = await getAllConversations();
                console.log(res)
                if (res.success) {
                    setConversations(res.data);
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, []);

    useEffect(() => {
        const API_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8080";
        const newSocket = io(API_URL, {
            withCredentials: true
        });

        // The socket on backend automatically joins admins to "admin_notifications"
        newSocket.on("new_global_message", ({ conversationId, message }) => {
            // Update conversation list with latest message
            setConversations(prev => {
                const convIndex = prev.findIndex(c => String(c.conversation_id) === String(conversationId));
                if (convIndex > -1) {
                    const updated = [...prev];
                    updated[convIndex].last_message = message.message_text;
                    updated[convIndex].last_message_time = message.created_at;
                    // move to top
                    const [item] = updated.splice(convIndex, 1);
                    updated.unshift(item);
                    return updated;
                } else {
                    // If conversation is new and not in the list, refresh the whole list
                    getAllConversations().then(res => {
                        if (res.success) {
                            setConversations(res.data);
                        }
                    });
                }
                return prev;
            });

            // If this message belongs to the currently active conversation, it will be handled by 'receive_message' event
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const handleSelectConversation = async (conv) => {
        if (activeConversation) {
            socket?.emit("leave_room", { conversationId: activeConversation.conversation_id });
        }

        setActiveConversation(conv);
        setMessages([]);

        try {
            const res = await getMessages(conv.conversation_id);
            if (res.success) {
                setMessages(res.data);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }

        socket?.emit("join_room", { conversationId: conv.conversation_id });
    };

    useEffect(() => {
        if (!socket || !activeConversation) return;

        const handleReceiveMessage = (message) => {
            if (String(message.conversation_id) === String(activeConversation.conversation_id)) {
                setMessages((prev) => [...prev, message]);
            }
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [socket, activeConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !activeConversation) return;

        socket.emit("send_message", {
            conversationId: activeConversation.conversation_id,
            text: newMessage
        });
        setNewMessage("");
    };

    if (loading) {
        return <div className="admin-chat-loading">Loading conversations...</div>;
    }

    return (
        <div className="admin-chat-container">
            <h1 className="admin-chat-title">Customer Support</h1>

            <div className="admin-chat-box">
                {/* Conversations List (Sidebar) */}
                <div className="admin-chat-sidebar">
                    <div className="admin-chat-sidebar-header">
                        <h2>Active Conversations</h2>
                    </div>
                    <div className="admin-chat-conv-list">
                        {conversations.length === 0 ? (
                            <div className="admin-chat-empty-list">No active conversations.</div>
                        ) : (
                            conversations.map((conv) => (
                                <div
                                    key={conv.conversation_id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`admin-chat-conv-item ${activeConversation?.conversation_id === conv.conversation_id ? "active" : ""
                                        }`}
                                >
                                    <div className="admin-chat-avatar">
                                        {imgSrc(conv?.customer_pic) ? (
                                            <img
                                                src={imgSrc(conv.customer_pic)}
                                                alt="profile"
                                                className="profile-img"
                                            />
                                        ) : (
                                            <div className="profile-avatar-fallback">
                                                <FontAwesomeIcon icon={faUserSecret} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="admin-chat-conv-info">
                                        <div className="admin-chat-conv-header">
                                            <h3 className="admin-chat-conv-name">{conv.customer_name || 'Unknown User'}</h3>
                                            <span className="admin-chat-conv-time">
                                                {conv.last_message_time ? new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                            </span>
                                        </div>
                                        <p className="admin-chat-conv-preview">
                                            {conv.last_message || "No messages yet"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="admin-chat-main">
                    {activeConversation ? (
                        <>
                            {/* Header */}
                            <div className="admin-chat-main-header">
                                <div className="admin-chat-avatar admin-chat-avatar-small">
                                    {activeConversation.customer_pic ? (
                                        <img src={activeConversation.customer_pic} alt="" />
                                    ) : (
                                        <FontAwesomeIcon icon={faUserCircle} />
                                    )}
                                </div>
                                <div>
                                    <h2>{activeConversation.customer_name}</h2>
                                    <p>{activeConversation.customer_email}</p>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="admin-chat-messages">
                                {messages.length === 0 ? (
                                    <div className="user-chat-empty">
                                        No messages in this conversation.
                                    </div>
                                ) : (
                                    messages.map((msg, index) => {
                                        const isMe = msg.sender_id === user?.id;
                                        return (
                                            <div key={msg.message_id || index} className={`chat-message-row ${isMe ? "me" : "them"}`}>
                                                <div className={`chat-bubble ${isMe ? "me" : "them"}`}>
                                                    <div className="chat-bubble-text">{msg.message_text}</div>
                                                    <div className="chat-bubble-time">
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        </>
                    ) : (
                        <div className="admin-chat-no-selection">
                            <FontAwesomeIcon icon={faUserCircle} />
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
