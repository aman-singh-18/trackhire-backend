const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(cors({
   origin: [
        "http://localhost:5173",
        "https://your-vercel-domain.vercel.app"
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());


const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const interviewRoutes = require("./routes/interviewRoutes");
app.use("/api/interviews", interviewRoutes);

app.get("/", (req, res) => {
    res.send("Backend Running 🚀");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TrackHire Backend is running 🚀",
  });
});
module.exports = app;