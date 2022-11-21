const { Schema, model } = require("mongoose");

const TimerSchema = new Schema(
  {
    userID: String,
    intiationTime: Date,
    numberOfStarts: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    lastSessionTime: Number,
    lastSessionDate: Date,
    breakTime: {
      type: Number,
      default: 0
    },
    totalBreaks: {
      type: Number,
      default: 0
    },
    sessionBreakTime: {
      type: Number,
      default: 0
    },
    breakTimerStart: Date
  },
  {
    collection: "Timer data"
  }
);

module.exports = model("Timer data", TimerSchema);
