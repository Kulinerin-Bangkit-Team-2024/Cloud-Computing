const { query } = require("../config/dataBase");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const registerUser = async (req, res) => {
  const { name, email, pass } = req.body;

  try {
    if (!name || !email || !pass) {
      return res.status(400).json({
        status: "error",
        message:
          "Invalid request. Please provide valid name, email and password",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email format. Please provide a valid email address.",
      });
    }

    const existingUser = await query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (existingUser.length > 0) {
      return res.status(400).json({
        status: "error",
        message:
          "The email address is already in use. Please choose a different one.",
      });
    }

    const userId = uuidv4();
    const hashedPass = await bcrypt.hash(pass, 10);

    await query(
      "INSERT INTO users (user_id, name, email, pass) VALUES (?, ?, ?, ?)",
      [userId, name, email, hashedPass]
    );

    res.status(201).json({
      status: "success",
      message: "Registration completed successfully. Welcome to KulinerIn!",
      user: { name, email },
    });
  } catch (err) {
    console.error("Error:", err.message);
    res
      .status(500)
      .json({ status: "error", message: "Failed to register user" });
  }
};

const loginUser = async (req, res) => {
  const { email, pass } = req.body;

  try {
    if (!email || !pass) {
      return res
        .status(400)
        .json({ status: "error", message: "Email and password are required" });
    }

    const result = await query("SELECT * FROM users WHERE email = ?", [email]);

    if (result.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password. Please check your credentials.",
      });
    }

    const user = result[0];

    if (user) {
      const {
        user_id,
        name: user_name,
        email: user_email,
        pass: password_hash,
      } = user;

      const isPasswordValid = await bcrypt.compare(pass, password_hash);

      if (isPasswordValid) {
        const tokenPayload = { user_id, user_email: email, jti: uuidv4() };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        res.status(200).json({
          status: "success",
          message: "Login successful. Let's explore Kuliner Indonesia!",
          token,
          user: { user_id, user_name, user_email },
        });
      } else {
        res.status(401).json({
          status: "error",
          message: "Invalid email or password. Please check your credentials.",
        });
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "No token provided. User is not logged in.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tokenId = decoded.jti;

    await query(
      "INSERT INTO blacklisted_tokens (token_id, user_id) VALUES (?, ?)",
      [tokenId, decoded.user_id]
    );

    res.status(200).json({
      status: "success",
      message: "You have successfully logged out. Your session has been securely terminated.",
    });
  } catch (err) {
    console.error("Error:", err.message);
    res
      .status(500)
      .json({ status: "error", message: "Failed to log out user" });
  }
};

module.exports = { registerUser, loginUser, logoutUser };
