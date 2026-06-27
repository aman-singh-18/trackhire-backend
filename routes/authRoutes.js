const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// authentications
const { signup, login,getProfile,logout} = require("../controllers/authController");
router.post("/signup", signup);
router.post("/login", login);

// Temporary route for testing
router.get("/profile", authMiddleware,getProfile);
router.post("/logout", logout);


module.exports = router;