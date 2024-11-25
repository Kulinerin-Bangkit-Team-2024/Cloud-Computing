const { query } = require("../config/dataBase");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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

    const hashedPass = await bcrypt.hash(pass, 10);
    
    await query(
      "INSERT INTO users (name, email, pass) VALUES (?, ?, ?)",
      [name, email, hashedPass]
    );

    res.status(201).json({
      status: "success",
      message: "Registration completed successfully. Welcome to KulinerIn!",
      user: { name, email },
    });
    res.status(400).json({
      status: "error",
      message: "Failed to register user. Please try again later.",
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
        const tokenPayload = { user_id, user_email: email };
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
          message:
            "Invalid email or password. Please check your credentials.",
        });
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

module.exports = { registerUser, loginUser };
