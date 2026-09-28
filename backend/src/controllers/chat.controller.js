const chatModel = require('../models/chat.model');
const { deleteMemory } = require('../services/vector.service')

// protected route
async function createChat(req, res) {
    const { title, contextMode, customContext } = req.body;
    const user = req.user;

    const chat = await chatModel.create({
        userId: user._id,
        title,
        contextMode: contextMode || 'default',
        customContext: customContext || ''
    });

    res.status(201).json({
        message: "Chat created successfully",
        chat: {
            _id: chat._id,
            title: chat.title,
            contextMode: chat.contextMode,
            customContext: chat.customContext,
            lastActivity: chat.lastActivity,
            userId: chat.userId
        }
    });
}

async function userChat(req, res) {
    const user = req.user;
    const userChats = await chatModel.find({ userId: user._id }).sort({ createdAt: -1 }).lean();

    res.json({
        message: "Chat fetched successfully",
        userChats
    });
}

async function updateChatContext(req, res) {
    try {
        const { chatId } = req.params;
        const { contextMode, customContext } = req.body;

        const updatedChat = await chatModel.findByIdAndUpdate(
            chatId,
            { contextMode, customContext },
            { new: true }
        );

        res.json({ success: true, chat: updatedChat });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function deleteChat(req, res) {
    try {
        const { chatId } = req.params;
        await chatModel.deleteOne({ _id: chatId });
        deleteMemory({ metadata: chatId });
        res.json({
            success: true,
            message: "Chat deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

module.exports = {
    createChat,
    userChat,
    updateChatContext,
    deleteChat
};