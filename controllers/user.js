const { query } = require("../config/dataBase");
const bcrypt = require("bcrypt");

const getUserById = async (req, res) => {
  const userId = req.user.user_id;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const result = await query("CALL GetUserById(?);", [userId]);

    const user = result[0]?.[0];

    if (user) {
      res.status(200).json({
        message: "User retrieved successfully",
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const editUserProfile = async (req, res) => {
  const userId = req.user.user_id;
  const { name, email, pass } = req.body;

  try {
    if (!userId || !name || !email || !pass) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const hashedPass = bcrypt.hashSync(pass, 8);

    const result = await query("CALL EditUserProfile(?, ?, ?, ?);", [
      userId,
      name,
      email,
      hashedPass,
    ]);

    const message = result?.[0]?.[0]?.message;

    if (message === "Profile updated successfully") {
      res.status(200).json({
        message,
        user: { user_id: userId, name, email },
      });
    } else if (message === "Email is already in use by another user") {
      res.status(400).json({ error: message });
    } else {
      res.status(400).json({ error: message || "Failed to update profile" });
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getUserById, editUserProfile };
