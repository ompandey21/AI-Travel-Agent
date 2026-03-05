const express = require("express");
const router = express.Router();
const {createUser, loginUser, createpassword, forgetPassword, logout, getMe, verifyResetToken} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");
const { signUpSchema, loginSchema, forgetSchema, createPasswordSchema } = require("../../validations/authValidator");

router.post("/signup", validate(signUpSchema), createUser);
router.post("/login", validate(loginSchema), loginUser);
router.post('/forgetpassword' ,validate(forgetSchema), forgetPassword);
router.post("/createpassword",validate(createPasswordSchema), createpassword);
router.get('/verifyreset/:token', verifyResetToken);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

module.exports = router;