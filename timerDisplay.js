const SlashCommand = require("../../utils/slashCommands");

const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const title = require("../../gbfembedmessages.json");
const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

const timerSchema = require("../../schemas/GBF Schemas/timer schema");

const { msToTime, delay } = require("../../utils/engine");

const fetch = require("node-fetch");

module.exports = class Tests extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "timer",
      description: "GBF Developer timer command",
      category: "Developer",
      userPermission: [],
      botPermission: [""],
      cooldown: 0,
      development: false,
      subcommands: {
        display: {
          description: "Display the timer data",
          execute: async ({ client, interaction }) => {
            if (interaction.user.id !== "333644367539470337")
              return interaction.reply({
                content: `Developer only command`,
                ephemeral: true
              });

            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            if (!timerData) {
              const newTimerData = new timerSchema({
                userID: interaction.user.id
              });

              await newTimerData.save();

              return interaction.reply({
                content: `New user profile created, please re-run this command.`,
                ephemeral: true
              });
            }

            const averageSessionTime =
              timerData.timeSpent / timerData.numberOfStarts;

            let displayAverage;

            if (!msToTime(averageSessionTime * 1000))
              displayAverage = `0 seconds`;
            else displayAverage = `${msToTime(averageSessionTime * 1000)}`;

            const averageBreakTime =
              timerData.breakTime / timerData.totalBreaks;

            let displayAverageBreakTime;

            if (!msToTime(averageBreakTime * 1000))
              displayAverageBreakTime = `0 seconds`;
            else
              displayAverageBreakTime = `${msToTime(averageBreakTime * 1000)}`;

            const accountDetails = `• Total Study Session Time: ${msToTime(
              timerData.timeSpent * 1000
            )} [${Math.round(
              timerData.timeSpent / 3600
            ).toLocaleString()} Hours]\n• Average Study Session Time: ${displayAverage} [${
              averageSessionTime ? averageSessionTime.toLocaleString() : "0"
            } Seconds]\n• Total Number of Sessions: ${timerData.numberOfStarts.toLocaleString()}\n\n• Total Break Time: ${msToTime(
              Math.abs(timerData.breakTime * 1000)
            )} [${Math.round(
              timerData.breakTime / 3600
            ).toLocaleString()} Hours]\n• Total Number of Breaks: ${timerData.totalBreaks.toLocaleString()}\n• Average Break Time: ${displayAverageBreakTime} [${
              averageBreakTime ? averageBreakTime.toLocaleString() : "0"
            } Seconds]\n\n• Longest Session: ${msToTime(
              timerData.longestSessionTime * 1000
            )}\n\n**Last Session Details**\n• Session Duration: ${msToTime(
              timerData.lastSessionTime * 1000
            )}\n• Session Date:<t:${Math.round(
              timerData.lastSessionDate / 1000
            )}:F>, <t:${Math.round(timerData.lastSessionDate / 1000)}:R>`;

            const currentTimeOfDay = new Date().getHours();

            let titleText;

            const titleTextArray = [
              "Good",
              "How's your",
              "Enjoy your",
              "Nice to see you this"
            ];

            const randomTitleText =
              titleTextArray[Math.floor(Math.random() * titleTextArray.length)];

            if (currentTimeOfDay <= 13 && currentTimeOfDay > 3)
              titleText = `${randomTitleText} Morning ${interaction.user.username}`;
            else if (currentTimeOfDay > 13 && currentTimeOfDay <= 19)
              titleText = `${randomTitleText} Afternoon ${interaction.user.username}`;
            else if (currentTimeOfDay > 19 && currentTimeOfDay <= 22)
              titleText = `${randomTitleText} Evening ${interaction.user.username}`;
            else if (currentTimeOfDay > 22 && currentTimeOfDay <= 3)
              titleText = `${randomTitleText} Night ${interaction.user.username}`;
            else
              titleText = `${randomTitleText} Night ${interaction.user.username}`;

            const accountDetailsMessage = new MessageEmbed()
              .setTitle(`${titleText}`)
              .setColor(colours.DEFAULT)
              .setDescription(`${accountDetails}`);

            return interaction.reply({
              embeds: [accountDetailsMessage]
            });
          }
        },
        initiate: {
          description: "Start the timer",
          execute: async ({ client, interaction }) => {
            if (interaction.user.id !== "333644367539470337")
              return interaction.reply({
                content: `Developer only command`,
                ephemeral: true
              });

            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            if (!timerData) {
              const newTimerData = new timerSchema({
                userID: interaction.user.id
              });

              await newTimerData.save();

              return interaction.reply({
                content: `New user profile created, please re-run this command.`,
                ephemeral: true
              });
            }

            const timerAlreadyOn = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You cannot do that`)
              .setColor(colours.ERRORRED)
              .setDescription(`The timer is already on!`);

            if (timerData.intiationTime !== null)
              return interaction.reply({
                embeds: [timerAlreadyOn],
                ephemeral: true
              });

            let goofyAdvice;

            await fetch(`https://luminabot.xyz/api/json/advice`)
              .then((response) => response.json())
              .then((data) => {
                goofyAdvice = `${data.advice}`;
              });

            const currentTimeOfDay = new Date().getHours();

            let titleText;

            const titleTextArray = [
              "Good",
              "How's your",
              "Enjoy your",
              "Nice to see you this"
            ];

            const randomTitleText =
              titleTextArray[Math.floor(Math.random() * titleTextArray.length)];

            if (currentTimeOfDay <= 13 && currentTimeOfDay > 3)
              titleText = `${randomTitleText} Morning ${interaction.user.username}`;
            else if (currentTimeOfDay > 13 && currentTimeOfDay <= 19)
              titleText = `${randomTitleText} Afternoon ${interaction.user.username}`;
            else if (currentTimeOfDay > 19 && currentTimeOfDay <= 22)
              titleText = `${randomTitleText} Evening ${interaction.user.username}`;
            else if (currentTimeOfDay > 22 && currentTimeOfDay <= 3)
              titleText = `${randomTitleText} Night ${interaction.user.username}`;
            else
              titleText = `${randomTitleText} Night ${interaction.user.username}`;

            const displayStats = `• Total Study Session Time: ${msToTime(
              Math.abs(timerData.timeSpent) * 1000
            )} [${Math.floor(
              timerData.timeSpent / 3600
            ).toLocaleString()} Hours]\n• Total Study Sessions: ${timerData.numberOfStarts.toLocaleString()}\n• Average Study Session Time: ${msToTime(
              (Math.abs(timerData.timeSpent) * 1000) / timerData.numberOfStarts
            )} [${Math.floor(
              (timerData.timeSpent * 1000) / timerData.numberOfStarts
            ).toLocaleString()} Seconds]\n\n• Average Break Time: ${msToTime(
              (Math.abs(timerData.breakTime) * 1000) / timerData.totalBreaks
            )} [${(
              Math.abs(timerData.breakTime) / timerData.totalBreaks
            ).toLocaleString()} Seconds]\n• Longest Study Session: ${msToTime(
              Math.abs(timerData.longestSessionTime * 1000)
            )} [${Math.abs(
              timerData.longestSessionTime
            ).toLocaleString()} Seconds]\n\n**Previous Session Details**\n• Session Time: ${msToTime(
              Math.abs(timerData.lastSessionTime) * 1000
            )} [${Math.abs(
              timerData.lastSessionTime * 1000
            ).toLocaleString()} Seconds]\n• Session Start Date: <t:${Math.round(
              timerData.lastSessionDate / 1000
            )}:F>`;

            const timerStarted = new MessageEmbed()
              .setTitle(`${titleText}`)
              .setColor(colours.DEFAULT)
              .setDescription(`${displayStats}`)
              .setFooter({
                text: `${goofyAdvice}`
              });

            const initiationButtons = new MessageActionRow().addComponents([
              new MessageButton()
                .setCustomId("startTimer")
                .setLabel("Start Timer")
                .setStyle("SECONDARY")
                .setEmoji("🕜"),
              new MessageButton()
                .setCustomId("stopTimer")
                .setLabel("Stop Timer")
                .setStyle("SECONDARY")
                .setEmoji("🕛")
            ]);

            const replyMessage = await interaction.reply({
              embeds: [timerStarted],
              components: [initiationButtons],
              fetchReply: true
            });

            await timerData.updateOne({
              messageID: replyMessage.id
            });
          }
        },
        pause: {
          description: "Pause the GBF Developer timer",
          execute: async ({ client, interaction }) => {
            if (interaction.user.id !== "333644367539470337")
              return interaction.reply({
                content: `Developer only command`,
                ephemeral: true
              });

            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            if (!timerData) {
              const newTimerData = new timerSchema({
                userID: interaction.user.id
              });

              await newTimerData.save();

              return interaction.reply({
                content: `New user profile created, please re-run this command.`,
                ephemeral: true
              });
            }

            const timerAlreadyOff = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED)
              .setDescription(`There's no previous recorded start time.`);

            if (timerData.intiationTime === null)
              return interaction.reply({
                embeds: [timerAlreadyOff],
                ephemeral: true
              });

            const alreadyPaused = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED)
              .setDescription(`The timer is already paused.`);

            if (timerData.breakTimerStart !== null)
              return interaction.reply({
                embeds: [alreadyPaused],
                ephemeral: true
              });

            const pausedTimer = new MessageEmbed()
              .setTitle(`${emojis.VERIFY} Success`)
              .setColor(colours.DEFAULT)
              .setDescription(
                `The timer has been paused, time elapsed from now till un-pause time won't be added to the session time.`
              );

            const unpauseTimerButton = new MessageActionRow().addComponents([
              new MessageButton()
                .setCustomId("unpauseButton")
                .setLabel("Un-pause")
                .setEmoji("🕜")
                .setStyle("SECONDARY")
            ]);

            const pauseMessage = await interaction.reply({
              embeds: [pausedTimer],
              components: [unpauseTimerButton],
              fetchReply: true
            });

            await timerData.updateOne({
              breakTimerStart: new Date(Date.now()),
              sessionBreaks: timerData.sessionBreaks + 1,
              totalBreaks: timerData.totalBreaks + 1,
              breakMessageID: pauseMessage.id
            });
          }
        },
        info: {
          description: "Get information about the currently active timer",
          execute: async ({ client, interaction }) => {
            if (interaction.user.id !== "333644367539470337")
              return interaction.reply({
                content: `Developer only command`,
                ephemeral: true
              });

            const timerData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            if (!timerData) {
              const newTimerData = new timerSchema({
                userID: interaction.user.id
              });

              await newTimerData.save();

              return interaction.reply({
                content: `New user profile created, please re-run this command.`,
                ephemeral: true
              });
            }

            const noData = new MessageEmbed()
              .setTitle(`${emojis.ERROR} You can't do that`)
              .setColor(colours.ERRORRED)
              .setDescription(`There are no active sessions.`);

            if (timerData.intiationTime === null)
              return interaction.reply({
                embeds: [noData],
                ephemeral: true
              });

            let breakTime;

            if (timerData.sessionBreakTime > 0)
              breakTime = timerData.sessionBreakTime;
            else breakTime = 0;

            const timeElapsed =
              ((Date.now() - timerData.intiationTime.getTime()) / 1000).toFixed(
                3
              ) - breakTime;

            const sessionStats = `• Time Elapsed: ${msToTime(
              Math.abs(timeElapsed)
            )}\n• Total Break Time: ${msToTime(
              msToTime(breakTime)
            )}\n• Total Breaks: ${timerData.sessionBreaks}`;

            const sessionStatsDisplay = new MessageEmbed()
              .setDescription(
                `**<t:${Math.round(
                  timerData.lastSessionDate / 1000
                )}:R> Session Stats**\n\n${sessionStats}`
              )
              .setColor(colours.DEFAULT);

            return interaction.reply({
              embeds: [sessionStatsDisplay]
            });
          }
        }
      }
    });
  }
};
