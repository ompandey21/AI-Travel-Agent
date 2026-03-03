const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  //const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (e) {
    console.error("Auth middleware error", e);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;
