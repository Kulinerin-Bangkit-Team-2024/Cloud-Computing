const express = require("express");
const router = express.Router();
const { getUserById, editUserProfile } = require("../controllers/user");
const foodConstroller = require("../controllers/food");
const { registerUser, loginUser } = require("../controllers/auth");
const authenticateToken = require("../middleware/checkAuth");

//Auth
router.post("/register", registerUser);
router.post("/login", loginUser);

//User
router.get("/user/profile", authenticateToken, getUserById);
router.put("/user/profile", authenticateToken, editUserProfile);

//Food

module.exports = router;