const express = require("express");
const multer = require("multer");
const router = express.Router();
const { registerUser, loginUser, logoutUser, sendResetPasswordOTP, resetPassword } = require("../controllers/auth");
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

// Food
router.get('/foods', authenticateToken, getAllFoods);
router.get('/foods/:id', getFoodById);
router.get('/foods/search/name', searchFoodsByName);
router.get('/foods/search/origin', searchFoodsByOrigin);
router.post("/foods/predict", upload.single('image'), validateFile, predictFood);

// User
router.get("/user/profile", authenticateToken, getUserById);
router.put("/user/profile", authenticateToken, editUserProfile);

module.exports = router;
