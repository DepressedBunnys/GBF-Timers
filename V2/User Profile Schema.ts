import { Schema, model, Document } from "mongoose";

interface IUserProfileData extends Document {
  userID: string;
  friends: [string];
  characterProfile: {
    characterName: string;
    characterSex: string;
  };
  creationDate: Date;
  privateProfile: boolean;
  cash: number;
  bank: number;
  dunkelCoins: number;
  totalEarned: number;
  RP: number;
  Rank: number;
  badges: {
    levelHundred: boolean;
  };
  achievements: {
    welcomeToSueLuz: boolean;
  };
  dailyCooldown: Date | null;
  dailyStreak: number;
  extraTimerXP: number | null;
  completedMissions: {
    intro: boolean | false;
    MeetRobin: boolean | false;
    MojaveJob: boolean | false;
  };
  weapons: {
    pistol: boolean;
    uzi: boolean | false;
  };
}

const UserProfileSchema = new Schema<IUserProfileData>(
  {
    userID: String,
    creationDate: Date,
    friends: [String],
    characterProfile: {
      characterName: String,
      characterSex: String
    },
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
      levelHundred: Boolean
    },
    achievements: {
      welcomeToSueLuz: Boolean
    },
    weapons: {
      pistol: Boolean,
      uzi: Boolean
    },
    dailyCooldown: Date,
    dailyStreak: Number,
    extraTimerXP: Number,
    completedMissions: {
      intro: Boolean,
      MeetRobin: Boolean,
      MojaveJob: Boolean
    }
  },
  {
    collection: "User Profile Data"
  }
);

export default model<IUserProfileData>("User Profile Data", UserProfileSchema);
