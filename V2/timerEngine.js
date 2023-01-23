const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const title = require("../gbfembedmessages.json");
const colours = require("../GBFColor.json");
const emojis = require("../GBFEmojis.json");

const timerSchema = require("../schemas/GBF Schemas/timer schema");

const { msToTime } = require("../utils/engine");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    // Checking if the interaction is a button

    if (!interaction.isButton()) return;

    // Checking if a document already exists

    const timerData = await timerSchema.findOne({
      userID: interaction.user.id
    });

    const invalidPermissionsMessage = `You cannot use this`;

    // Checking if the document contains valid data

    if (!timerData || !timerData.seasonName) return;

    if (interaction.customId === "startTimer") {
      // Unfortunately this has to be done inside of each condition since buttons outside of this system exist and adding this check outside the ID checks will cause a clash
      // Checking if the user who ran the command is the user who clicked the button
      // The message contains a user property containing the ID of the user who orignally clicked it, we can use that to check

      if (!timerData.messageDetails[0])
        return interaction.reply({
          content: `${invalidPermissionsMessage}`,
          ephemeral: true
        });

      // Fetching the original message so we can edit it later

      const originalMessage = await interaction.channel.messages.fetch(
        timerData.messageID
      );
      // Checking if the message exists
      if (!originalMessage) {
        // Deleting the message ID from the DB

        await timerData.updateOne({
          messageID: null
        });

        return interaction.reply({
          content: `I couldn't find the original message, please re-run the initiate command <>.`,
          ephemeral: true
        });
      }

      // Checking if the interaction belongs to the original author

      if (originalMessage.interaction.user.id !== interaction.user.id)
        return interaction.reply({
          content: `${invalidPermissionsMessage}`,
          ephemeral: true
        });

      // Creating disabled buttons so the user can't start twice

      const mainButtonsRowD = new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("startTimerD")
          .setDisabled(true)
          .setEmoji("🕜")
          .setLabel("Start Timer")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("pauseTimer")
          .setEmoji("⏰")
          .setLabel("Pause Timer")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("stopTimer")
          .setEmoji("🕛")
          .setLabel("Stop Timer")
          .setStyle("SECONDARY")
      ]);

      const timerStarted = new MessageEmbed()
        .setTitle(`${emojis.VERIFY} Success`)
        .setColor(colours.DEFAULT)
        .setDescription(`Timer started, best of luck!`);

      // Adding start data to the database

      // Pushing the start time to the DB

      await timerData.startTime.push(new Date().getHours());

      // Setting the initiation date to the DB, we will subtract that time from the end time to get the time elapsed & resetting the break time in-case it didn't reset

      await timerData.updateOne({
        intiationTime: new Date(Date.now()),
        numberOfStarts: timerData.numberOfStarts + 1,
        lastSessionDate: new Date(Date.now()),
        breakTimerStart: null,
        sessionBreakTime: 0
      });

      // Saving since the push does not automatically update to the DB

      await timerData.save();

      // Updating the old buttons

      await originalMessage.edit({
        components: [mainButtonsRowD]
      });

      return interaction.reply({
        embeds: [timerStarted]
      });
    }
  });
};
