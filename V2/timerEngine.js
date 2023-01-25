const {
  MessageEmbed,
  MessageActionRow,
  MessageButton,
  Message
} = require("discord.js");

const title = require("../gbfembedmessages.json");
const colours = require("../GBFColor.json");
const emojis = require("../GBFEmojis.json");

const timerSchema = require("../schemas/GBF Schemas/timer schema");

const { msToTime } = require("../utils/engine");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    // Checking if the interaction type is a button

    if (!interaction.isButton()) return;

    // Checking if the button clicked is part of the timer system

    if (
      interaction.customId !== "startTimer" &&
      interaction.customId !== "pauseTimer" &&
      interaction.customId !== "stopTimer" &&
      interaction.customId !== "unpauseTimer"
    )
      return;

    // Getting the user's data

    /**
     @messageID [message ID]
     @userID [interaction user ID]
     @initationTime [Date]
     @sessionLengths [Array]
     */

    const timerData =
      (await timerSchema.findOne({
        userID: interaction.user.id
      })) || undefined;

    // If the user's data does not exist we return EMBED

    const noAccount = new MessageEmbed()
      .setTitle(`${emojis.ERROR} 404 Not Found`)
      .setColor(colours.ERRORRED)
      .setDescription(
        `I couldn't find any data matching your user ID.\n\nCreate a new semester account using <>`
      );

    if (!timerData)
      return interaction.reply({
        embeds: [noAccount],
        ephemeral: true
      });

    // Checking if the user initiated using message IDs EMBED

    const noMessageData = new MessageEmbed()
      .setTitle(`${emojis.ERROR} 403 Forbidden`)
      .setColor(colours.ERRORRED)
      .setDescription(`You can't use that button, to create your own use <>.`);

    // Fetching the original message
    const originalMessage = await interaction.channel.messages.fetch(
      timerData.messageID
    );

    // If the original message does not exist EMBED

    const noMessage = new MessageEmbed()
      .setTitle(`${emojis.ERROR} 404-1 Not Found`)
      .setColor(colours.ERRORRED)
      .setDescription(
        `The session initiation message tied to this account was not found, please use <> to start a new session or create a new initiation message.`
      );

    // Checking if the user who used the button is the same user who used the command

    const invalidPermissions = new MessageEmbed()
      .setTitle(`${emojis.ERROR} 403-1 Forbidden`)
      .setColor(colours.ERRORRED)
      .setDescription(`You can't use that, create your own using <>.`);

    function checkUser(data, message, originalUser, interaction) {
      let status;
      if (!data) return (status = "404");
      else if (data && !data.messageID) return (status = "403");
      if (data && !message) return (status = "404-1");
      if (data && !originalUser) return (status = "404-1");
      if (
        data &&
        message &&
        originalUser &&
        originalUser.userID !== interaction.user.id
      )
        return (status = "403-1");
      else return (status = "200");
    }

    if (interaction.customId === "startTimer") {
      const messageOwner =
        (await timerSchema.findOne({
          messageID: interaction.message.id
        })) || undefined;

      const statusCheck = checkUser(
        timerData,
        originalMessage,
        messageOwner,
        interaction
      );

      if (statusCheck === "404")
        return interaction.reply({
          embeds: [noAccount],
          ephemeral: true
        });

      if (statusCheck === "403")
        return interaction.reply({
          embeds: [noMessageData],
          ephemeral: true
        });

      if (statusCheck === "404-1") {
        await timerData.updateOne({
          messageID: null
        });

        return interaction.reply({
          embeds: [noMessage],
          ephemeral: true
        });
      }

      if (statusCheck === "403-1") {
        return interaction.reply({
          embeds: [invalidPermissions],
          ephemeral: true
        });
      }
    }
  });
};
