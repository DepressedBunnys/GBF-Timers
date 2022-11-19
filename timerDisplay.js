const SlashCommand = require("../../utils/slashCommands");

const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const title = require("../../gbfembedmessages.json");
const colours = require("../../GBFColor.json");
const emojis = require("../../GBFEmojis.json");

const timerSchema = require("../../schemas/GBF Schemas/timer schema");

const { msToTime } = require("../../utils/engine");

const fetch = require("node-fetch");
module.exports = class botBans extends SlashCommand {
  constructor(client) {
    super(client, {
      name: "dev-timer",
      description: "[Developer] GBF Timer and clock commands",
      category: "Developer",
      userPermission: [],
      botPermission: [],
      cooldown: 0,
      development: false,
      devOnly: true,
      subcommands: {
        display: {
          description: "Display current time",
          execute: async ({ client, interaction }) => {
            if (interaction.user.id !== "333644367539470337")
              return interaction.reply({
                content: `Developer only L`,
                ephemeral: true
              });

            const userData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            if (!userData) {
              const newData = new timerSchema({
                userID: interaction.user.id
              });
              await newData.save();
              return interaction.reply({
                content: `Please re-run the program`,
                ephemeral: true
              });
            }

            const updatedUserData = msToTime(
              (userData.timeSpent * 1000) / userData.numberOfStarts
            );

            const totalTime = msToTime(userData.timeSpent * 1000);

            let titleText;

            const currentHour = new Date().getHours();

            if (currentHour < 13)
              titleText = `How's your morning ${interaction.user.username}`;
            else if (currentHour >= 13 && currentHour < 19)
              titleText = `Good afternoon ${interaction.user.username}`;
            else if (currentHour >= 19 && currentHour < 24)
              titleText = `Enjoying your evening ${interaction.user.username}?`;

            const timerStart = new MessageEmbed()
              .setTitle(`${titleText}`)
              .setColor(colours.DEFAULT)
              .setDescription(
                `• Average session time: ${updatedUserData}\n• Total time spent: ${totalTime}\n• Number of sessions: ${userData.numberOfStarts}`
              )
              .setFooter({
                text: `Best of luck!`
              });

            return interaction.reply({
              embeds: [timerStart]
            });
          }
        },
        initiate: {
          description: "Initiate the timer",
          execute: async ({ client, interaction }) => {
            if (interaction.user.id !== "333644367539470337")
              return interaction.reply({
                content: `Developer only L`,
                ephemeral: true
              });

            const userData = await timerSchema.findOne({
              userID: interaction.user.id
            });

            if (!userData) {
              const newData = new timerSchema({
                userID: interaction.user.id
              });
              await newData.save();
              return interaction.reply({
                content: `Please re-run the program`,
                ephemeral: true
              });
            }

            const timerButtonA = new MessageActionRow().addComponents([
              new MessageButton()
                .setCustomId("devTimerA")
                .setLabel("Start timer")
                .setStyle("SECONDARY")
                .setEmoji("🕛"),
              new MessageButton()
                .setCustomId("devTimer")
                .setLabel("End timer")
                .setStyle("SECONDARY")
                .setEmoji("🕛")
            ]);

            const updatedUserData = msToTime(
              (userData.timeSpent * 1000) / userData.numberOfStarts
            );

            const totalTime = msToTime(userData.timeSpent * 1000);

            let goofyAdvice;

            await fetch(`https://luminabot.xyz/api/json/advice`)
              .then((response) => response.json())
              .then((data) => {
                goofyAdvice = `Advice: ${data.advice}`;
              });

            let titleText;

            const currentHour = new Date().getHours();

            if (currentHour < 13)
              titleText = `How's your morning ${interaction.user.username}`;
            else if (currentHour >= 13 && currentHour < 19)
              titleText = `Good afternoon ${interaction.user.username}`;
            else if (currentHour >= 19 && currentHour < 24)
              titleText = `Enjoying your evening ${interaction.user.username}?`;

            const timerStart = new MessageEmbed()
              .setTitle(`${titleText}`)
              .setColor(colours.DEFAULT)
              .setDescription(
                `Average session time: ${updatedUserData}\nTotal time spent: ${totalTime}\nNumber of sessions: ${userData.numberOfStarts}\n\n${goofyAdvice}`
              )
              .setFooter({
                text: `Best of luck!`
              });

            await interaction.reply({
              embeds: [timerStart],
              components: [timerButtonA]
            });
          }
        }
      }
    });
  }
};
