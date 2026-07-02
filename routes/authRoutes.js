const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// authentications
const { signup, login,getProfile,logout,uploadResumeToPool, getResumePool,deleteResumeFromPool} = require("../controllers/authController");
router.post("/signup", signup);
router.post("/login", login);

// Temporary route for testing
router.get("/profile", authMiddleware,getProfile);
router.post("/logout", logout);
router.post("/resumes", authMiddleware, upload.single("resume"), uploadResumeToPool);
router.get("/resumes", authMiddleware, getResumePool);
router.delete("/resumes/:resumeId", authMiddleware, deleteResumeFromPool);

module.exports = router;