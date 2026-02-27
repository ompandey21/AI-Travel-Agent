const express = require("express");
const router = express.Router();
const {createUser, loginUser, createpassword, forgetPassword} = require("../controllers/authController");

router.post("/signup", createUser);
router.post("/login", loginUser);
router.post('/forgetpassword', forgetPassword);
router.post("/createpassword/:token", createpassword);

module.exports = router;