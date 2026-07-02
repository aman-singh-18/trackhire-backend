const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({


  
    company: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Applied",
        "OA",
        "Interview",
        "Rejected",
        "Offer",
      ],
      default: "Applied",
    },

    appliedDate: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      default: "",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- NEW TASK SCHEDULER FIELDS TO ADD BELOW ---
    taskDate: {
      type: Date,
      default: null // Defaults to null because not every application has an active task yet
    },

    reminderSent: {
      type: Boolean,
      default: false // Defaults to false until the automatic backend worker flips it
    },
// --- NEW RESUME FILE PATH FIELD ADDED BELOW ---
resumePath: {
  type: String,
  default: "", // Stores the relative URL path destination to your saved local file
},

    history: [
      {
        status: { type: String, required: true },
        notesSnapshot: { type: String, default: "" },
        changedAt: { type: Date, default: Date.now }
      }
    ]

  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model("Interview", interviewSchema);

module.exports = Interview;