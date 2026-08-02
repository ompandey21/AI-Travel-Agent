const jwt = require("jsonwebtoken");
const { UserAuth } = require("../../config/db");
const jwt_access_secret = process.env.JWT_ACCESS_SECRET;

async function authMiddleware(req, res, next) {
  //const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);
  const access_token = req.cookies.access_token;
  if (!access_token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(access_token, jwt_access_secret);
    const user = await UserAuth.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (e) {
    console.error("Auth middleware error", e);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
