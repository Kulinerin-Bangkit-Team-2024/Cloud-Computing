const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json(
      res.status(401).json({
        status: "error",
        message: "Unauthorized User",
      })
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    res.status(403).json({
      status: "error",
      message: "User is Forbidden",
    });
  }
};

module.exports = authenticateToken;
