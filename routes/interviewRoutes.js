const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const { 
  createInterview,
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getInterviewStats
} = require("../controllers/interviewController");

const { getAnalytics } = require("../controllers/getAnalytics");

// --- ADD THIS LINE BACK TO HANDLE CREATING ENTRIES ---
router.post("/", authMiddleware, createInterview);

// Existing active endpoints
router.get("/", authMiddleware, getAllInterviews);
router.get("/stats", authMiddleware, getInterviewStats);
router.get("/analytics", authMiddleware, getAnalytics);
router.get("/:id", authMiddleware, getInterviewById);
router.delete("/:id", authMiddleware, deleteInterview);
router.put("/:id", authMiddleware, updateInterview);

module.exports = router;