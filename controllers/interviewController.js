const Interview = require("../models/Interview");
const mongoose = require("mongoose");

const createInterview = async (req, res) => {
  try {
    const { company, role, status, appliedDate, notes } = req.body;

    const interview = await Interview.create({
      company,
      role,
      status,
      appliedDate,
      notes,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interview,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAllInterviews = async (req, res) => {
  try {
    const { search, status, sort, page = 1, limit = 10 } = req.query;
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;
    // Base query (only logged-in user's interviews)
    const query = {
      user: req.user.id,
    };

    // Search by company name
    if (search) {
      query.company = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by status
    if (status && status !== "All") {
      query.status = status;
    }

    // Create mongoose query
    let interviews = Interview.find(query);

    // Sorting
    if (sort === "oldest") {
      interviews = interviews.sort({ createdAt: 1 });
    } else {
      interviews = interviews.sort({ createdAt: -1 });
    }

    const totalInterviews = await Interview.countDocuments(query);
    interviews = interviews.skip(skip).limit(limitNumber);
    // Execute query
    const result = await interviews;
    const totalPages = Math.ceil(totalInterviews / limitNumber);

    res.status(200).json({
      success: true,
      interviews: result,
      currentPage: pageNumber,
      totalPages,
      totalInterviews,
      limit: limitNumber,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const updateInterview = async (req, res) => {
  try {
    const { company, role, status, appliedDate, notes } = req.body;

    const interview = await Interview.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      {
        company,
        role,
        status,
        appliedDate,
        notes,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      interview,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getInterviewStats = async (req, res) => {
  try {
    // Total applications
    const totalApplications = await Interview.countDocuments({
      user: req.user.id,
    });

    // Group applications by status
    const stats = await Interview.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    // Default response
    const formattedStats = {
      total: totalApplications,
      Applied: 0,
      OA: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };

    // Fill actual counts
    stats.forEach((item) => {
      formattedStats[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      stats: formattedStats,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createInterview,
  getAllInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  getInterviewStats,
};
