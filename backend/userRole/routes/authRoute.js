const express = require("express");
const router = express.Router();
const passport = require("passport");

const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validate");

const {createUser, loginUser, createpassword, forgetPassword, logout, getMe, verifyResetToken, getUserById, authRefreshToken, googleOauthCallback} = require("../controllers/authController");
const { signUpSchema, loginSchema, createPasswordSchema } = require("../../validations/authValidator");

router.get("/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false,
    })
)
router.get("/google/callback", passport.authenticate("google",
    {
        failureRedirect: "/api/auth/google/failure",
        session: false
    }),
    googleOauthCallback
);

router.post("/signup", validate(signUpSchema), createUser);
router.post("/login", validate(loginSchema), loginUser);
router.post('/forgetpassword' , forgetPassword);
router.post("/createpassword",validate(createPasswordSchema), createpassword);
router.get('/verifyreset/:token', verifyResetToken);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);
router.get('/get-user/:id', authMiddleware, getUserById);
router.post('/refresh', authRefreshToken);

module.exports = router;