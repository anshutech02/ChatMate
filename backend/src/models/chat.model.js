const mongoose = require('mongoose');


const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    contextMode: {
        type: String,
        default: 'default'
    },
    customContext: {
        type: String,
        default: ''
    },
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

const chatModel = mongoose.model("chat", chatSchema)


module.exports = chatModel;