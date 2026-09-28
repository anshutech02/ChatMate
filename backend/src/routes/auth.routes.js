const express = require('express');
const authControllers = require("../controllers/auth.controller")
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware')



router.post("/register", authControllers.registerUser)
router.post("/login", authControllers.loginUser)
router.get('/profile',authMiddleware.authUser,authControllers.userProfile)



module.exports = router;