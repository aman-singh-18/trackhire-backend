const cron = require("node-cron");
const nodemailer = require("nodemailer");
const Interview = require("../models/Interview");
require("../models/User"); // Forces Mongoose to pre-load User model relation parameters

const startReminderScheduler = () => {
  // Configured to run every single day at 8:00 AM
  // For local testing purposes right now, change the expression string to "* * * * *" to run every single minute!
  cron.schedule("0 8 * * *", async () => {
    console.log("⏰ Background cron sweep initiated: Reviewing pending milestone task notifications...");

    try {
      // 1. Calculate today's date range boundaries (00:00:00 to 23:59:59)
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      // 2. Query MongoDB for matches using Mongoose operators
      const pendingTasks = await Interview.find({
        taskDate: {
          $gte: startOfToday,
          $lte: endOfToday
        },
        reminderSent: false
      }).populate("user", "name email"); // Deep-populates the linked User table properties

      if (pendingTasks.length === 0) {
        console.log("📄 Zero pending task milestone date alerts found for today.");
        return;
      }

      console.log(`📬 Found ${pendingTasks.length} pending task milestone date matches. Launching SMTP relays...`);

      // 3. Configure Nodemailer Secure SMTP Relay Server
      // For temporary localhost verification, you can use a free Mailtrap account or a Gmail App Password
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.SYSTEM_EMAIL,     // Stored securely inside your environment file
          pass: process.env.SYSTEM_EMAIL_PASS  // Gmail App Password vector parameter
        }
      });

      // 4. Iterate through found matches asynchronously
      for (const task of pendingTasks) {
        // Validation check to make sure relation payload links exist safely
        if (!task.user || !task.user.email) continue;

        const emailOptions = {
          from: `"TrackHire Alerts" <${process.env.SYSTEM_EMAIL}>`,
          to: task.user.email,
          subject: `⚠️ TrackHire Action Required: Upcoming Milestone for ${task.company}!`,
          html: `
            <div style="font-family: sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 16px; max-width: 600px;">
              <h2 style="color: #6366f1; margin-bottom: 4px;">Hello, ${task.user.name}! 👋</h2>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 0;">This is an automated system reminder for your active placement pipeline.</p>
              <hr style="border-color: #334155; margin: 20px 0;" />
              <div style="background-color: #1e293b; padding: 16px; border-radius: 12px; border: 1px solid #334155;">
                <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #a1a1aa; font-weight: bold; tracking: 1px;">Company Name</p>
                <p style="margin: 4px 0 12px 0; font-size: 18px; font-weight: bold; color: #ffffff;">${task.company}</p>
                
                <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #a1a1aa; font-weight: bold; tracking: 1px;">Target Role / Title</p>
                <p style="margin: 4px 0 12px 0; font-size: 16px; color: #e2e8f0;">${task.role}</p>

                <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #a1a1aa; font-weight: bold; tracking: 1px;">Current Stage Tracker Block</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #fbbf24; font-weight: 600;">🎯 ${task.status} Round Scheduled for Today</p>
              </div>
              <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">Good luck! Prepare well and track updates on your TrackHire Dashboard.</p>
            </div>
          `
        };

        // Trigger individual dispatch relay
        await transporter.sendMail(emailOptions);

        // 5. Flip the reminder flag and save changes safely
        task.reminderSent = true;
        await task.save();

        console.log(`✅ Email confirmation delivered to ${task.user.email} for ${task.company}.`);
      }

    } catch (error) {
      console.error("❌ Exception running background reminder scheduler routine:", error.message);
    }
  });
};

module.exports = startReminderScheduler;