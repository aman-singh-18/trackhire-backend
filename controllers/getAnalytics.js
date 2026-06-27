const Interview = require("../models/Interview");
const mongoose = require("mongoose");

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

    // Total Applications
    const [
      totalApplications,
      appliedCount,
      oaCount,
      interviewCount,
      offerCount,
      rejectedCount,
      applicationsThisMonth,
      applicationsThisYear,
      monthlyApplications,
    ] = await Promise.all([
      // Total Applications
      Interview.countDocuments({
        user: userId,
      }),

      // Applied Count
      Interview.countDocuments({
        user: userId,
        status: "Applied",
      }),

      // OA Count
      Interview.countDocuments({
        user: userId,
        status: "OA",
      }),

      // Interview Count
      Interview.countDocuments({
        user: userId,
        status: "Interview",
      }),

      // Offer Count
      Interview.countDocuments({
        user: userId,
        status: "Offer",
      }),

      // Rejected Count
      Interview.countDocuments({
        user: userId,
        status: "Rejected",
      }),

      // Applications This Month
      Interview.countDocuments({
        user: userId,
        appliedDate: {
          $gte: startOfMonth,
          $lt: endOfMonth,
        },
      }),

      // Applications This Year
      Interview.countDocuments({
        user: userId,
        appliedDate: {
          $gte: startOfYear,
          $lt: endOfYear,
        },
      }),

      // Monthly Applications Aggregation
      Interview.aggregate([
        {
          $match: {
            user: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$appliedDate" },
              month: { $month: "$appliedDate" },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyApplicationsData = monthlyApplications.map((item) => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      count: item.count,
    }));

    const statusDistribution = [
      {
        status: "Applied",
        count: appliedCount,
      },
      {
        status: "OA",
        count: oaCount,
      },
      {
        status: "Interview",
        count: interviewCount,
      },
      {
        status: "Offer",
        count: offerCount,
      },
      {
        status: "Rejected",
        count: rejectedCount,
      },
    ];

    const activeApplications = appliedCount + oaCount + interviewCount;

    const offerConversionRate =
      interviewCount > 0
        ? Number(((offerCount / interviewCount) * 100).toFixed(2))
        : 0;

    const interviewRate =
      totalApplications > 0
        ? Number(((interviewCount / totalApplications) * 100).toFixed(2))
        : 0;

    const offerRate =
      totalApplications > 0
        ? Number(((offerCount / totalApplications) * 100).toFixed(2))
        : 0;

    const oaRate =
      totalApplications > 0
        ? Number(((oaCount / totalApplications) * 100).toFixed(2))
        : 0;

    const rejectionRate =
      totalApplications > 0
        ? Number(((rejectedCount / totalApplications) * 100).toFixed(2))
        : 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalApplications,
        applicationsThisMonth,
        applicationsThisYear,

        appliedCount,
        oaCount,
        interviewCount,
        offerCount,
        rejectedCount,

         activeApplications,
  offerConversionRate,


        statusDistribution,

        monthlyApplications: monthlyApplicationsData,

        interviewRate,
        offerRate,
        oaRate,
        rejectionRate,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  getAnalytics,
};
