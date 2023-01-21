const { Schema, model } = require("mongoose");

const TimerSchema = new Schema(
  {
    userID: String,
    messageID: String,
    startTime: {
      type: Array,
      default: []
    },
    intiationTime: {
      type: Date,
      default: null
    },
    numberOfStarts: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    longestSessionTime: {
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
    sessionBreaks: {
      type: Number,
      default: 0
    },
    sessionBreakTime: {
      type: Number,
      default: 0
    },
    breakTimerStart: Date,
    breakMessageID: String
  },
  {
    collection: "Timer data"
  }
);

module.exports = model("Timer data", TimerSchema);
