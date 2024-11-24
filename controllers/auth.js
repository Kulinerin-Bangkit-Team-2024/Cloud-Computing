const { query } = require("../config/dataBase");
const jwt = require("jsonwebtoken");

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

    const result = await query("CALL RegisterUsers(?, ?, ?);", [
      name,
      email,
      pass,
    ]);

    const message = result[0]?.[0]?.message;

    if (message === "Registration successful") {
      res.status(201).json({
        status: "success",
        message: "Registration completed successfully. Welcome to KulinerIn!",
        user: { name, email },
      });
    } else if (message === "Email already Registered") {
      res.status(400).json({
        status: "error",
        message: "The email address is already in use. Please choose a different one.",
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "Failed to register user. Please try again later.",
      });
    }
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

    const result = await query("CALL LoginUsers(?, ?);", [email, pass]);

    const user = result[0]?.[0];
    const { user_id, user_name, user_email, message } = user;

    if (message === "Login successful") {
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
          message ||
          "Invalid email or password. Please check your credentials.",
      });
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

module.exports = { registerUser, loginUser };
