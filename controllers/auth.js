const { query } = require("../config/dataBase");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");

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

const sendResetPasswordOTP = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required to request a password reset",
      });
    }

    const userResult = await query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (userResult.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No user found with this email address",
      });
    }

    const user = userResult[0];
    const userId = user.user_id;

    const existingOtp = await query(
      "SELECT * FROM password_reset_otp WHERE user_id = ?",
      [userId]
    );

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const createdAt = new Date();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    if (existingOtp.length > 0) {
      const otpRecord = existingOtp[0];

      if (otpRecord.is_used || otpRecord.expires_at < new Date()) {
        await query(
          "UPDATE password_reset_otp SET otp = ?, created_at = ?, expires_at = ?, is_used = false WHERE user_id = ?",
          [otp, createdAt, expiresAt, userId]
        );
      } else {
        return res.status(400).json({
          status: "error",
          message: "You already have a valid OTP request. Please check your email.",
        });
      }
    } else {
      await query(
        "INSERT INTO password_reset_otp (user_id, otp, created_at, expires_at, is_used) VALUES (?, ?, ?, ?, false)",
        [userId, otp, createdAt, expiresAt]
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: "success",
      message: "OTP sent to your email address. Please check your inbox.",
    });
  } catch (err) {
    console.error("Error:", err.message);

    if (err.message.includes("ENOTFOUND")) {
      return res.status(500).json({
        status: "error",
        message: "Network error. Please try again later.",
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to send OTP. Please try again later.",
    });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newpass } = req.body;
  
  if (!email || !otp || !newpass) {
    return res.status(400).json({
      status: "error",
      message: "Email, OTP and new password are required to reset password",
    });
  }

  try {
    const userResult = await query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (userResult.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No user found with this email address",
      });
    }

    const user = userResult[0];
    const userId = user.user_id;

    const otpResult = await query(
      "SELECT * FROM password_reset_otp WHERE user_id = ? AND otp = ? AND is_used = false",
      [userId, otp]
    );

    if (otpResult.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid OTP. Please check your email and try again.",
      });
    }

    const otpRecord = otpResult[0];
    const expiresAt = new Date(otpRecord.expires_at);

    if (expiresAt < new Date()) {
      return res.status(400).json({
        status: "error",
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const hashedPass = await bcrypt.hash(newpass, 10);

    await query("UPDATE users SET pass = ? WHERE user_id = ?", [
      hashedPass,
      userId,
    ]);

    await query(
      "UPDATE password_reset_otp SET is_used = true WHERE user_id = ? AND otp = ?",
      [userId, otp]
    );

    res.status(200).json({
      status: "success",
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({
      status: "error",
      message: "Failed to reset password. Please try again later.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  sendResetPasswordOTP,
  resetPassword,
};
