const SlashCommand = require("../../utils/slashCommands");

const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const title = require("../../gbfembedmessages.json");
const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

const timerSchema = require("../../schemas/GBF Schemas/timer schema");

const {
  msToTime,
  chunkAverage,
  twentyFourToTwelve
} = require("../../utils/engine");

const fetch = require("node-fetch");

module.exports = class BasicTimerUI extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "timer",
      description: "Track your daily activites using GBF timers",
      category: "Timer",
      userPermission: [],
      botPermission: [""],
      cooldown: 0,
      development: true,
      subcommands: {
        stats: {
          description: "Get the stats of the current tracking season",
          execute: async ({ client, interaction }) => {
            //Abbreviation dictionary
            /**
             - dhms : Day, Hours, Minutes, Seconds | Means that this variable stores a human readable dynamic date
             - HR : Human readable variable 
             - hr : Hours 
             - s : Seconds | Means that this variable's units is seconds only
             - ms : MiliSeconds | Means that this variable's units is miliseconds only
             - avg : Average of data
             */

            // timerData object stores time in seconds, so we have to convert it to miliseconds to be able to use the msToTime function

            //Checking if the user data on the current season

            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            const noAccount = new MessageEmbed()
              .setTitle(`⚠️ You cannot do that ⚠️`)
              .setColor(colours.ERRORRED)
              .setDescription(
                `I couldn't find any data matching your user ID.\n\nCreate a new seasonal account using <>`
              );

            if (!timerData)
              return interaction.reply({
                embeds: [noAccount],
                ephemeral: true
              });

            // First quadrant | Basic data
            const HRTotalTime = msToTime(timerData.timeSpent * 1000);
            const hrTotalTime = Math.round(timerData.timeSpent / 3600);
            // Getting the average time by dividing the total time by number of starts
            let avgTotalTime = timerData.timeSpent / timerData.numberOfStarts;
            let rawTotalTime = timerData.timeSpent / timerData.numberOfStarts;

            // There is a chance that the average time can be infinity/undefined, so we need to check for this to avoid errors
            // The way this works is the msToTime returns undefined if the value entered is infinity or NaN, so we check for that
            if (!msToTime(avgTotalTime * 1000)) {
              avgTotalTime = `In-sufficient data`;
              rawTotalTime = 0;
            }
            // This variable will be pasted in the display so we can change it here
            else avgTotalTime = msToTime(avgTotalTime * 1000);

            // Second quadrant | Break data
            const HRBreakTime = msToTime(timerData.breakTime * 1000);
            const hrBreakTime = Math.round(timerData.breakTime / 3600);

            let avgBreakTime = timerData.breakTime / timerData.totalBreaks;
            let rawBreakTime = timerData.breakTime / timerData.totalBreaks;

            if (!msToTime(avgBreakTime * 1000)) {
              avgBreakTime = `In-sufficient data`;
              rawBreakTime = 0;
            } else avgBreakTime = msToTime(avgBreakTime * 1000);

            // Fourth quadrant | Previous session details

            // Checking if there was a last session

            let HRSessionTime;
            let UNIXSessionDate;
            let deltaTime;

            if (timerData.lastSessionTime && timerData.lastSessionDate) {
              HRSessionTime = msToTime(timerData.lastSessionTime * 1000);
              // Switching basic JS date to dynamic UNIX
              UNIXSessionDate = `<t:${Math.round(
                timerData.lastSessionDate / 1000
              )}:F>, <t:${Math.round(timerData.lastSessionDate / 1000)}:R>`;
              // By switching this to true, we can tell the system that a previous session exists so it can display it
              deltaTime = timerData.lastSessionTime - rawTotalTime;
            } else {
              HRSessionTime = `In-sufficient data`;
              UNIXSessionDate = `In-sufficient data`;
              deltaTime = `In-sufficient data`;
            }

            // Fifth quadrant | Weekly averages
            // This quadrant uses an external function that can be found in GBF's engine

            const weeklyAverages = chunkAverage(timerData.sessionLengths, 7);

            // It is very likely that there isn't enough data to be able to provide a week's average, so we need to check for that

            // This will be the variable that will hold the average time spent per week
            let displayWeeklyTimeAverage;

            // Getting the average of the weekly data
            function averageTotal(data) {
              let sum = 0;
              for (let k = 0; k < data.length; k++) {
                sum += data[k];
              }
              return sum / data.length;
            }

            if (!weeklyAverages.length || weeklyAverages.length < 1)
              displayWeeklyTimeAverage = `In-sufficient data`;
            else {
              displayWeeklyTimeAverage = `${msToTime(
                averageTotal(weeklyAverages) * 1000
              )} [${toHours(averageTotal(weeklyAverages)).toFixed(
                2
              )} Hours]\n\nNumber of weeks used: ${weeklyAverages.length}`;
            }

            // Getting the average start time (Old code)

            let averageStartTime;

            const sumOfTimes = timerData.startTime.reduce(
              (partialSum, a) => partialSum + a,
              0
            );

            averageStartTime = (
              sumOfTimes / timerData.startTime.length
            ).toFixed(2);

            let displayAverageStartTime;

            if (!averageStartTime)
              displayAverageStartTime = `In-sufficient data`;
            else displayAverageStartTime = twentyFourToTwelve(averageStartTime);

            // Random welcome message to the user

            const randomMessages = [
              `How's your day ${interaction.user.username}`,
              `Enjoying this day ${interaction.user.username}?`,
              `Best of luck to you ${interaction.user.username}`,
              `Enjoy your day ${interaction.user.username}`
            ];

            // Getting a randomized message

            const randomTitleText =
              randomMessages[Math.floor(Math.random() * randomMessages.length)];

            // The main message that stores all of the information and the third quadrant | Longest session

            const messageDescription = `• Total Season Time: ${HRTotalTime} [${hrTotalTime}]\n• Average Session Time: ${avgTotalTime} [${rawTotalTime
              .toFixed(2)
              .toLocaleString()}]\n• Total Number of Sessions: ${
              timerData.numberOfStarts
            }\n\n• Total Break Time: ${HRBreakTime} [${hrBreakTime}]\n• Average Break Time: ${avgBreakTime} [${rawBreakTime
              .toFixed(2)
              .toLocaleString()}]\n• Total Number of Breaks: ${
              timerData.totalBreaks
            }\n\n• Longest Session Time: ${msToTime(
              timerData.longestSessionTime * 1000
            )}\n\n**Previous Session Details:**\n• Session Duration: ${HRSessionTime}\n• Session Date: ${UNIXSessionDate}\n• Difference from average: ${
              msToTime(deltaTime) ? msToTime(deltaTime) : deltaTime.toFixed(2)
            }\n\n• Average Start Time: ${displayAverageStartTime}\n• Average Session Time per Week: ${displayWeeklyTimeAverage}`;

            const displayMessageEmbed = new MessageEmbed()
              .setTitle(
                `${randomTitleText} | ${
                  timerData.seasonName
                    ? timerData.seasonName
                    : "No Season Name Set"
                }`
              )
              .setDescription(`${messageDescription}`)
              .setColor(colours.DEFAULT);

            return interaction.reply({
              embeds: [displayMessageEmbed]
            });
          }
        }
      }
    });
  }
};
