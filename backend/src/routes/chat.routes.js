const express = require('express');
const authMiddleware = require("../middlewares/auth.middleware")
const chatController = require("../controllers/chat.controller")


const router = express.Router();

/* POST /api/chat/ */
router.post('/', authMiddleware.authUser, chatController.createChat)

router.get("/user",authMiddleware.authUser, chatController.userChat)

router.delete("/:chatId", authMiddleware.authUser, chatController.deleteChat)
router.patch("/:chatId/context", authMiddleware.authUser, chatController.updateChatContext)


module.exports = router;