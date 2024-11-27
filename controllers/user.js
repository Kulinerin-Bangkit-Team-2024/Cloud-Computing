const { query } = require("../config/dataBase");
const bcrypt = require("bcrypt");
const Imgupload = require("../config/cloudStorage");

const getUserById = async (req, res) => {
  const userId = req.user.user_id;

  try {
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message:
          "User ID is missing. Please ensure you are logged in and provide a valid token.",
      });
    }

    const result = await query(
      "SELECT user_id, name, email, profile_pic FROM users WHERE user_id = ?",
      [userId]
    );

    const user = result[0];

    if (user) {
      let profilePicture = null;
      if (user.profile_pic instanceof Buffer) {
        profilePicture = user.profile_pic.toString("utf-8");
      } else {
        profilePicture = user.profile_pic;
      }
      res.status(200).json({
        status: "success",
        message: "User retrieved successfully",
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          profile_picture: profilePicture,
        },
      });
    } else {
      res.status(404).json({
        status: "error",
        message:
          "User not found. Please ensure the provided user ID is correct.",
      });
    }
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

const editUserProfile = [
  Imgupload.uploadToGcs, // handle file upload to GCS
  Imgupload.handleUpload, // handle for additional file processing
  Imgupload.multerErrorHandler, // handle multer errors
  async (req, res) => {
    const userId = req.user.user_id;
    const { name, email, pass } = req.body;

    try {
      if (!userId || !name || !email || !pass) {
        return res.status(400).json({
          status: "error",
          message:
            "All fields (name, email, and password) are required to update your profile.",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid email format. Please provide a valid email address.",
        });
      }

      const existingUser = await query(
        "SELECT user_id FROM users WHERE email = ?",
        [email]
      );
      if (
        existingUser.length > 0 &&
        existingUser[0].user_id !== userId
      ) {
        return res.status(400).json({
          status: "error",
          message:
            "The email address you provided is already in use. Please choose a different one.",
        });
      }

      let profilePictureUrl = null;
      if (req.file && req.file.cloudStoragePublicUrl) {
        profilePictureUrl = req.file.cloudStoragePublicUrl;
      }

      const hashedPass = bcrypt.hashSync(pass, 10);

      let queryText =
        "UPDATE users SET name = ?, email = ?, pass = ? WHERE user_id = ?";
      let queryParams = [name, email, hashedPass, userId];

      if (profilePictureUrl) {
        queryText =
          "UPDATE users SET name = ?, email = ?, pass = ?, profile_pic = ? WHERE user_id = ?";
        queryParams = [name, email, hashedPass, profilePictureUrl, userId];
      }

      const result = await query(queryText, queryParams);

      if (result.affectedRows > 0) {
        res.status(200).json({
          status: "success",
          message: "Your profile has been successfully updated.",
          user: {
            user_id: userId,
            name,
            email,
            profile_picture: profilePictureUrl,
          },
        });
      } else {
        res.status(400).json({
          status: "error",
          message: "Failed to update profile. Please try again later.",
        });
      }
    } catch (err) {
      console.error("Error:", err.message);
      res
        .status(500)
        .json({ status: "error", message: "Internal Server Error" });
    }
  },
];

module.exports = { getUserById, editUserProfile };
