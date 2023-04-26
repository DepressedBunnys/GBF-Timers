import { Schema, model, Document } from "mongoose";

interface IUserProfileData extends Document {
  userID: string;
  privateProfile: boolean;
  cash: number;
  bank: number;
  dunkelCoins: number;
  totalEarned: number;
  RP: number;
  Rank: number;
  badges: string[];
  dailyCooldown: Date | null;
  dailyStreak: number;
  extraTimerXP: number | null;
}

const UserProfileSchema = new Schema<IUserProfileData>(
  {
    userID: String,
    privateProfile: {
      type: Boolean,
      default: false
    },
    cash: {
      type: Number,
      default: 0
    },
    bank: {
      type: Number,
      default: 1500
    },
    dunkelCoins: {
      type: Number,
      default: 500
    },
    totalEarned: {
      type: Number,
      default: 1500
    },
    RP: {
      type: Number,
      default: 0
    },
    Rank: {
      type: Number,
      default: 1
    },
    badges: {
      type: [String],
      default: []
    },
    dailyCooldown: Date,
    dailyStreak: Number,
    extraTimerXP: Number
  },
  {
    collection: "User Profile Data"
  }
);

export default model<IUserProfileData>("User Profile Data", UserProfileSchema);
