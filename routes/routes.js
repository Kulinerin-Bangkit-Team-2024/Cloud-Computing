const express = require("express");
const router = express.Router();
const { getUserById, editUserProfile } = require("../controllers/user");
const foodConstroller = require("../controllers/food");
const { registerUser, loginUser, logoutUser } = require("../controllers/auth");
const authenticateToken = require("../middleware/checkAuth");

//Auth
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticateToken, logoutUser);
// router.put("forgot-password", forgotPassword);
// router.put("reset-password", resetPassword);
// router.put("change-password", changePassword);

//User
router.get("/user/profile", authenticateToken, getUserById);
router.put("/user/profile", authenticateToken, editUserProfile);

//Food
router.get("/food/list", authenticateToken);
router.get("/food/:id", authenticateToken);
router.post("/food/predict", authenticateToken);

module.exports = router;