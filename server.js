const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

// --- IMPORT THE SCHEDULER SYSTEM HERE ---
const startReminderScheduler = require("./utils/reminderScheduler");

// Establish MongoDB connection infrastructure link
connectDB().then(() => {
    // --- START THE BACKGROUND WORKER SYSTEM ONCE DB IS LIVE ---
    startReminderScheduler();
    console.log("⏰ Task Scheduler Worker initialized successfully.");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});