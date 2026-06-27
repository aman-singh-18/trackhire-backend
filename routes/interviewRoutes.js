const express = require("express");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// interview
const { createInterview,getAllInterviews,getInterviewById,updateInterview,deleteInterview,getInterviewStats} = require("../controllers/interviewController");
const {getAnalytics} = require("../controllers/getAnalytics");

router.post("/", authMiddleware, createInterview);
router.get("/", authMiddleware, getAllInterviews);
router.get("/stats", authMiddleware, getInterviewStats);
router.get("/analytics", authMiddleware, getAnalytics);
router.get("/:id", authMiddleware, getInterviewById);
router.put("/:id", authMiddleware, updateInterview);
router.delete("/:id", authMiddleware, deleteInterview);

module.exports = router;    