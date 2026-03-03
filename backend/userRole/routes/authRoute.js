const express = require("express");
const router = express.Router();
const {createUser, loginUser, createpassword, forgetPassword, logout, getMe} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/signup", createUser);
router.post("/login", loginUser);
router.post('/forgetpassword', forgetPassword);
router.post("/createpassword/:token", createpassword);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

module.exports = router;