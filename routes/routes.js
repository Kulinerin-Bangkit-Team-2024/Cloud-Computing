const express = require("express");
const router = express.Router();
const userConstroller = require("../controllers/user")
const foodConstroller = require("../controllers/food");
const {registerUser, loginUser} = require("../controllers/auth");

//Auth
router.post("/register", registerUser);
router.post("/login", loginUser);

//User

//Food

module.exports = router;