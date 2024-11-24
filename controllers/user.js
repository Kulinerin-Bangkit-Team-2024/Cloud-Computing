const { query } = require("../config/dataBase");
const bcrypt = require("bcrypt");

const getUserById = async (req, res) => {
  const userId = req.user.user_id;

  try {
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is missing. Please ensure you are logged in and provide a valid token.",
      });
    }

    const result = await query(
      "SELECT user_id, name, email FROM users WHERE user_id = ?",
      [userId]
    );

    const user = result[0];

    if (user) {
      res.status(200).json({
        status: "success",
        message: "User retrieved successfully",
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "User not found. Please ensure the provided user ID is correct.",
      });
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const editUserProfile = async (req, res) => {
  const userId = req.user.user_id;
  const { name, email, pass } = req.body;

  try {
    if (!userId || !name || !email || !pass) {
      return res.status(400).json({
        status: "error",
        message: "All fields (name, email, and password) are required to update your profile.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email format. Please provide a valid email address.",
      });
    }

    const existingUser = await query(
      "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
      [email, userId]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        status: "error",
        message:
          "The email address you provided is already in use. Please choose a different one.",
      });
    }

    const hashedPass = bcrypt.hashSync(pass, 10);

    const result = await query(
      "UPDATE users SET name = ?, email = ?, pass = ? WHERE user_id = ?",
      [name, email, hashedPass, userId]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({
        status: "success",
        message: "Your profile has been successfully updated.",
        user: { user_id: userId, name, email },
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "Failed to update profile. Please try again later.",
      });
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

module.exports = { getUserById, editUserProfile };
