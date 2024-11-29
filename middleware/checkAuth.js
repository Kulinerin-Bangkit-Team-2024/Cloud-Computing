const jwt = require("jsonwebtoken");
const { query } = require("../config/dataBase");

const checkBlacklist = async (tokenId) => {
  const result = await query(
    "SELECT * FROM blacklisted_tokens WHERE token_id = ?",
    [tokenId]
  );
  return result.length > 0;
};


const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized User",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const isBlacklisted = await checkBlacklist(decoded.jti);
    if (isBlacklisted) {
      return res.status(401).json({
        status: "error",
        message: "Your session has been logged out. Please log in again to continue.",
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    res.status(403).json({
      status: "error",
      message: "Your session has expired or is invalid. Please log in again.",
    });
  }
};

module.exports = authenticateToken;
