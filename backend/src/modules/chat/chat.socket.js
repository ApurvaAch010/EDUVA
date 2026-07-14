import jwt from "jsonwebtoken";
import dbPool from "../../config/db.config.js";
import * as chatService from "./chat.service.js";
import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

let io;

export const setupSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true,
            methods: ["GET", "POST"]
        }
    });

    // Socket authentication middleware
    io.use(async (socket, next) => {
        try {
            let token = socket.handshake.auth.token;
            
            // If token is not in auth, check cookies (HTTP-only session cookie)
            if (!token && socket.handshake.headers.cookie) {
                const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
                    const [key, value] = cookie.trim().split('=');
                    acc[key] = value;
                    return acc;
                }, {});
                token = cookies['token'];
            }
            
            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            const decoded = jwt.verify(token, process.env.JWT_ACTIVE_SECRET);

            const [users] = await dbPool.execute(
                "SELECT active_tokens, username, role FROM users WHERE id = ?",
                [decoded.id]
            );

            if (users.length === 0 || users[0].active_tokens !== token) {
                return next(new Error("Authentication error: Invalid session"));
            }

            socket.user = { id: decoded.id, ...users[0] };
            next();
        } catch (error) {
            next(new Error("Authentication error: " + error.message));
        }
    });

    io.on("connection", (socket) => {
        // console.log(`User connected: ${socket.user.username} (${socket.id})`);

        socket.on("join_room", ({ conversationId }) => {
            if (conversationId) {
                socket.join(`chat_${conversationId}`);
                // console.log(`User ${socket.user.username}    joined room chat_${conversationId}`);
            }
        });

        socket.on("leave_room", ({ conversationId }) => {
            if (conversationId) {
                socket.leave(`chat_${conversationId}`);
                // console.log(`User ${socket.user.username} left room chat_${conversationId}`);
            }
        });

        socket.on("send_message", async (data, callback) => {
            try {
                const { conversationId, text } = data;
                
                if (!conversationId || !text) {
                    throw new Error("Missing conversationId or text");
                }

                // Save message to DB
                const savedMessage = await chatService.saveMessage(
                    conversationId,
                    socket.user.id,
                    text
                );

                // Broadcast message to everyone in the room (including sender)
                io.to(`chat_${conversationId}`).emit("receive_message", savedMessage);
                
                // If it's a new message, also emit to a global admin room so admins see incoming messages dynamically
                io.to("admin_notifications").emit("new_global_message", {
                    conversationId,
                    message: savedMessage
                });

                if (typeof callback === "function") callback({ success: true, message: savedMessage });
            } catch (err) {
                console.error("Error sending message:", err.message);
                if (typeof callback === "function") callback({ success: false, error: err.message });
            }
        });

        // Admins can join a global room to get notifications for all chats
        if (socket.user.role === 'admin' || socket.user.role === 'mod') {
            socket.join("admin_notifications");
            // console.log(`Admin ${socket.user.username} joined global notifications`);
        }

        socket.on("disconnect", () => {
            // console.log(`User disconnected: ${socket.user.username}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
