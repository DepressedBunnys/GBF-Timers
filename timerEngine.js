const { MessageEmbed, Permissions } = require("discord.js");

const colours = require("../GBFColor.json");

const { greenBright, redBright } = require("chalk");

const timerSchema = require("../schemas/GBF Schemas/timer schema");

const { msToTime } = require("../utils/engine");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) {
      if (interaction.customId === "devTimerA") {
        if (interaction.user.id !== "333644367539470337")
          return interaction.reply({
            content: `Fuck off will you`,
            ephemeral: true
          });
        const timerData = await timerSchema.findOne({
          userID: interaction.user.id
        });
        if (!timerData) {
          const newData = new timerSchema({
            userID: interaction.user.id,
            intiationTime: new Date(Date.now()),
            lastSessionDate: new Date(Date.now())
          });
          await newData.save();
        } else {
          await timerData.updateOne({
            intiationTime: new Date(Date.now()),
            lastSessionDate: new Date(Date.now())
          });
        }

        const readyEmbed = new MessageEmbed()
          .setTitle(`🕜 Session Started`)
          .setDescription(`Best of luck!`)
          .setColor(colours.DEFAULT);

        await interaction.reply({
          embeds: [readyEmbed]
        });
      } else if (interaction.customId === "devTimer") {
        if (interaction.user.id !== "333644367539470337")
          return interaction.reply({
            content: `Fuck off will you`,
            ephemeral: true
          });
        const timerData = await timerSchema.findOne({
          userID: interaction.user.id
        });

        if (!timerData || timerData.intiationTime === null) {
          return interaction.reply({
            content: `There's no previous recorded start time.`
          });
        }

        const startedAtUNIX = timerData.intiationTime.getTime();

        const timeElapsed = (Date.now() - startedAtUNIX) / 1000;

        const oldAvg = timerData.timeSpent / timerData.numberOfStarts;
        const newAvg =
          (timerData.timeSpent + timeElapsed) / (timerData.numberOfStarts + 1);

        const averageDifference = (newAvg - oldAvg).toFixed(2);

        const readableDifference = msToTime(averageDifference * 1000);

        const sessionDetails = new MessageEmbed()
          .setTitle(`🕛 Session Ended`)
          .setColor(colours.DEFAULT)
          .setDescription(
            `Time Elapsed:\n${msToTime(timeElapsed * 1000)} [${Math.round(
              timeElapsed
            ).toLocaleString()} seconds]\n\nAverage Session Time Movement: ${averageDifference.toLocaleString()}s [${readableDifference}]`
          )
          .setTimestamp();

        await interaction.reply({
          embeds: [sessionDetails],
          components: []
        });

        return timerData.updateOne({
          intiationTime: null,
          numberOfStarts: timerData.numberOfStarts + 1,
          timeSpent: Math.round(timerData.timeSpent + timeElapsed),
          lastSessionTime: timeElapsed
        });
      }
    }
  });
};
