const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// --- IMPORT YOUR NEW MULTER MIDDLEWARE ENGINE ---
const upload = require("../middleware/uploadMiddleware");

const { 
  createInterview,
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getInterviewStats
} = require("../controllers/interviewController");

const { getAnalytics } = require("../controllers/getAnalytics");

// Injects the upload middleware right between auth checking and data storage execution
router.get("/", authMiddleware, getAllInterviews);
router.get("/stats", authMiddleware, getInterviewStats);
router.get("/analytics", authMiddleware, getAnalytics);
router.get("/:id", authMiddleware, getInterviewById);
router.delete("/:id", authMiddleware, deleteInterview);
router.put("/:id", authMiddleware, updateInterview);

module.exports = router;