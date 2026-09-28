const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const chatModel = require("../models/chat.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");
const { buildSystemPrompt } = require("../services/context.service");


function initSocketServer(httpServer) {

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Auth middleware
    io.use(async (socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

        if (!cookies.token) {
            next(new Error("Authentication error: No token provided"));
            return;
        }

        try {
            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.id);
            socket.user = user;
            next();
        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("ai-message", async (messagePayload) => {
            /* messagePayload = { chatId, content } */
            try {
                const [message, vectors, chat] = await Promise.all([
                    messageModel.create({
                        chatId: messagePayload.chatId,
                        userId: socket.user._id,
                        content: messagePayload.content,
                        role: "user"
                    }),
                    aiService.generateVector(messagePayload.content),
                    chatModel.findById(messagePayload.chatId).lean()
                ]);

                const [memory, chatHistory] = await Promise.all([
                    queryMemory({
                        queryVector: vectors,
                        limit: 5,
                        metadata: {
                            userId: socket.user._id.toString()
                        }
                    }),
                    messageModel
                        .find({ chatId: messagePayload.chatId })
                        .sort({ createdAt: -1 })
                        .limit(20)
                        .lean()
                        .then(messages => messages.reverse())
                ]);

                await createMemory({
                    vectors,
                    messageId: message._id,
                    metadata: {
                        chatId: messagePayload.chatId,
                        userId: socket.user._id.toString(),
                        text: messagePayload.content
                    }
                });

                // Build short-term memory (recent chat history)
                const stm = chatHistory.map(item => ({
                    role: item.role === "model" ? "model" : "user",
                    parts: [{ text: item.content }]
                }));

                // Build long-term memory (relevant past messages from Pinecone)
                const ltmTexts = memory.map(item => item.metadata.text).filter(Boolean).join("\n");
                const ltm = ltmTexts
                    ? [{
                        role: "user",
                        parts: [{ text: `Relevant past context from our previous conversations:\n${ltmTexts}` }]
                    }]
                    : [];

                // Build context-aware system instruction
                const systemInstruction = buildSystemPrompt(
                    chat?.contextMode || 'default',
                    chat?.customContext || ''
                );

                // Generate AI response with system instruction
                const response = await aiService.generateResponse(
                    [...ltm, ...stm],
                    systemInstruction
                );

                // Emit response back to the user
                socket.emit("ai-response", {
                    content: response,
                    chatId: messagePayload.chatId
                });

                // Persist AI response and store in vector memory
                const [responseMessage, responseVectors] = await Promise.all([
                    messageModel.create({
                        chatId: messagePayload.chatId,
                        userId: socket.user._id,
                        content: response,
                        role: "model"
                    }),
                    aiService.generateVector(response)
                ]);

                await createMemory({
                    vectors: responseVectors,
                    messageId: responseMessage._id,
                    metadata: {
                        chatId: messagePayload.chatId,
                        userId: socket.user._id.toString(),
                        text: response
                    }
                });

            } catch (error) {
                console.error("Socket ai-message error:", error);
                socket.emit("ai-error", { error: error.message });
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
}


module.exports = initSocketServer;