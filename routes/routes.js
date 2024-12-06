const express = require("express");
const multer = require("multer");
const router = express.Router();
const { registerUser, loginUser, logoutUser, sendResetPasswordOTP, resetPassword, checkBlacklist } = require("../controllers/auth");
const { getAllFoods, getFoodById, searchFoodsByName, searchFoodsByOrigin, predictFood } = require("../controllers/food")
const { getUserById, editUserProfile } = require("../controllers/user");
const authenticateToken = require("../middleware/checkAuth");
const validateFile = require("../middleware/checkUpload");

const upload = multer();

// Auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticateToken, logoutUser);
router.post("/forgot-password", sendResetPasswordOTP);
router.put("/reset-password", resetPassword);
router.get("/check-token", checkBlacklist);

// Food
router.get("/foods", authenticateToken, getAllFoods);
router.get("/foods/:id", authenticateToken, getFoodById);
router.get("/foods/search/name", authenticateToken, searchFoodsByName);
router.get("/foods/search/origin", authenticateToken, searchFoodsByOrigin);
router.post("/foods/predict", authenticateToken, upload.single('image'), validateFile, predictFood);

// User
router.get("/user/profile", authenticateToken, getUserById);
router.put("/user/profile", authenticateToken, editUserProfile);

module.exports = router;
