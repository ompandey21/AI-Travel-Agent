const { UserAuth } = require("../../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../../utils/sendMail");
const { get } = require("../routes/authRoute");

const saltRounds = 10;
const jwt_secret = process.env.JWT_SECRET;
const jwt_access_secret = process.env.JWT_ACCESS_SECRET;
const jwt_refresh_secret = process.env.JWT_REFRESH_SECRET;
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || "7d";

async function hashPass(password) {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (e) {
    console.error("error hashing password", e);
    throw e;
  }
}

async function verifyUser(plainPass, hashedPass) {
  try {
    const match = await bcrypt.compare(plainPass, hashedPass);
    return match;
  } catch (e) {
    console.error("user not verified", e);
    throw e;
  }
}

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
});

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, cpassword } = req.body;
    const existUser = await UserAuth.findOne({ where: { email } });
    if (existUser) {
      return res.status(400).json({ message: "User already created" });
    }
    if (password !== cpassword) {
      return res.status(400).json({ message: "password do not match" });
    }
    const hashedPass = await hashPass(password);
    const user = await UserAuth.create({ name, email, password: hashedPass });
    const payload = { id: user.id };
    const access_token = jwt.sign(payload, jwt_access_secret, { expiresIn: accessTokenExpiry });
    const refresh_token = jwt.sign(payload, jwt_refresh_secret, { expiresIn: refreshTokenExpiry });
    const hash_token = await hashPass(refresh_token);
    user.refresh_token = hash_token;
    await user.save();
    res.cookie("access_token", access_token, {
      ...getCookieOptions(),
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", refresh_token, {
      ...getCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res
      .status(201)
      .json({
        message: "User created successfully",
        id: user.id,
        name: user.name,
        email: user.email,
      });
  } catch (e) {
    console.error("error creating user", e.message);
    res.status(500).json({ message: `Internal server error ${e.message}` });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await UserAuth.findOne({ where: { email } });
    if (!findUser) {
      return res.status(400).json({ message: "user does not exist" });
    }
    const match = await verifyUser(password, findUser.password);
    if (match) {
      const payLoad = {
        id: findUser.id,
      };
      const access_token = jwt.sign(payLoad, jwt_access_secret, { expiresIn: accessTokenExpiry });
      const refresh_token = jwt.sign(payLoad, jwt_refresh_secret, { expiresIn: refreshTokenExpiry });
      const hash_token = await hashPass(refresh_token);
      findUser.refresh_token = hash_token;
      await findUser.save();
      res.cookie("access_token", access_token, {
        ...getCookieOptions(),
      });
      res.cookie("refresh_token", refresh_token, {
        ...getCookieOptions(),
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({
        message: "Login successfull",
        id: findUser.id,
        name: findUser.name,
        email: findUser.email,
        createdAt: findUser.createdAt,
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (e) {
    console.error("Internal server error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email fields is required." });
    }

    const findUser = await UserAuth.findOne({ where: { email } });
    if (!findUser) {
      return res.status(404).json({ message: "user not found" });
    }

    // generate numeric OTP, store it with expiry and email it to user
    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
    const otp_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    findUser.otp = otp;
    findUser.otp_expires = otp_expires;
    await findUser.save();

    const subject = "Your password reset OTP";
    const text = `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`;
    await sendEmail(email, subject, text);

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (e) {
    console.error("Internal server error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token)
      return res
        .status(400)
        .json({ valid: false, message: "Token is required" });
    const decoded = jwt.verify(token, jwt_secret);
    return res.status(200).json({ valid: true, email: decoded.email });
  } catch (e) {
    return res
      .status(400)
      .json({ valid: false, message: "Invalid or expired token" });
  }
};

exports.createpassword = async (req, res) => {
  try {
    const { otp, password, cpassword } = req.body;
    if (!otp || !password || !cpassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== cpassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const user = await UserAuth.findOne({ where: { otp } });
    if (!user) {
      return res.status(400).json({ message: "Invalid OTP." });
    }
    const isSamePassword = await verifyUser(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "New password cannot be same as old password." });
    }
    if (!user.otp_expires || new Date() > user.otp_expires) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
    }

    const hashedPass = await hashPass(password);
    user.password = hashedPass;
    user.otp = null;
    user.otp_expires = null;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (e) {
    console.error("Internal server error", e);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const cookieOptions = {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };

    const access_token = req.cookies.access_token;
    const decode = jwt.verify(access_token, jwt_access_secret);
    const user = await UserAuth.findByPk(decode.id);
    user.refresh_token = null;
    await user.save();

    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("refresh_token", cookieOptions);

    return res.status(200).json({ message: "Logged out" });
  } catch (e) {
    console.error("Logout error", e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMe = async (req, res) => {
  try {
    const access_token = req.cookies.access_token;
    if (!access_token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(access_token, jwt_access_secret);
    const user = await UserAuth.findByPk(decoded.id, {
      attributes: ["id", "name", "email", "createdAt"],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (e) {
    console.error("Error fetching current user", e);
    return res.status(500).json({ message: "Internal server error" });
  }
};
exports.getUserById = async (req, res) => {
  try {
    const access_token = req.cookies.access_token;
    
    if (!access_token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(access_token, jwt_access_secret);
    const id = req.params.id;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await UserAuth.findByPk(id, {
      attributes: ["id", "name", "email"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (e) {
    console.error("Error fetching current user", e);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.authRefreshToken = async (req, res) => {
  try{
    const refresh_token = req.cookies.refresh_token;
    if(!refresh_token){
      return res.status(401).json({message : "unauthorized"});
    }

    const decoded = jwt.verify(refresh_token, jwt_refresh_secret);
    const user = await UserAuth.findByPk(decoded.id);

    if(!user){
      return res.status(401).json({message : "user not found"});
    }

    const user_refresh_token = user.refresh_token;
    const isMatch = await verifyUser(refresh_token, user_refresh_token);

    if(!isMatch){
      return res.status(401).json({message : "invalid refresh token"});
    }

    const payLoad = {id : user.id};

    const new_refresh_token = jwt.sign(payLoad, jwt_refresh_secret, {expiresIn : refreshTokenExpiry});
    const hash_token = await hashPass(new_refresh_token);
    user.refresh_token = hash_token;
    await user.save();

    const new_access_token = jwt.sign(payLoad, jwt_access_secret, {expiresIn : accessTokenExpiry});

    res.cookie("access_token", new_access_token, {
      ...getCookieOptions(),
      maxAge : 15 * 60 * 1000
    });
    res.cookie("refresh_token", new_refresh_token, {
      ...getCookieOptions(),
      secure : process.env.NODE_ENV === "production",
      maxAge : 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({message : "Access token refreshed"});
  }
  catch(e){
    console.error("Error refreshing token", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  hashPass,
  verifyUser,
  createUser: exports.createUser,
  loginUser: exports.loginUser,
  forgetPassword: exports.forgetPassword,
  verifyResetToken: exports.verifyResetToken,
  createpassword: exports.createpassword,
  logout: exports.logout,
  getMe: exports.getMe,
  getUserById: exports.getUserById,
  authRefreshToken: exports.authRefreshToken
};
