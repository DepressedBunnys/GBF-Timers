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

            if (currentTimeOfDay <= 13)
              titleText = `${randomTitleText} Morning ${interaction.user.username}`;
            else if (currentTimeOfDay > 13 && currentTimeOfDay <= 19)
              titleText = `${randomTitleText} Afternoon ${interaction.user.username}`;
            else if (currentTimeOfDay > 19)
              titleText = `${randomTitleText} Evening ${interaction.user.username}`;

            const displayStats = `• Total Study Session Time: ${msToTime(
              Math.abs(timerData.timeSpent) * 1000
            )} [${Math.floor(
              timerData.timeSpent / 3600
            ).toLocaleString()} Hours]\n• Total Study Sessions: ${timerData.numberOfStarts.toLocaleString()}\n• Average Study Session Time: ${msToTime(
              (Math.abs(timerData.timeSpent) * 1000) / timerData.numberOfStarts
            )} [${Math.floor(
              timerData.timeSpent / timerData.numberOfStarts
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
              timerData.lastSessionTime
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
        }
      }
    });
  }
};
