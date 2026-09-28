const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware")
const MessageController = require('../controllers/message.controller')


router.get("/:chatId",authMiddleware.authUser,MessageController.getMessages);
router.delete("/:chatId",authMiddleware.authUser,MessageController.deleteMessage);


module.exports = router;