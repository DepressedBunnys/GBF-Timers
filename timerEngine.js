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
            content: `Developer only`,
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
            content: `Developer only`,
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

        let breakTime = 0;
        let readableBreakTime;

        if (timerData.sessionBreakTime) {
          breakTime = timerData.sessionBreakTime;
          readableBreakTime = msToTime(breakTime * 1000);
        } else readableBreakTime = "0 Seconds";

        const timeElapsed = (Date.now() - startedAtUNIX) / 1000 - breakTime;

        const oldAvg = timerData.timeSpent / timerData.numberOfStarts;

        const newAvg =
          (timerData.timeSpent + timeElapsed) / (timerData.numberOfStarts + 1);

        const averageDifference = (newAvg - oldAvg).toFixed(2);

        const readableDifference = msToTime(averageDifference * 1000);

        const sessionDetails = new MessageEmbed()
          .setTitle(`🕛 Session Ended`)
          .setColor(colours.DEFAULT)
          .setDescription(
            `• Time Elapsed:\n${msToTime(timeElapsed * 1000)} [${Math.round(
              timeElapsed
            ).toLocaleString()} seconds]\n• Break Time: ${readableBreakTime} [${breakTime}]\n\n• Average Study Session Time Movement: ${averageDifference.toLocaleString()}s [${readableDifference}]`
          )
          .setTimestamp();

        await interaction.reply({
          embeds: [sessionDetails],
          components: []
        });

        return timerData.updateOne({
          intiationTime: null,
          sessionBreakTime: null,
          breakTimerStart: null,
          numberOfStarts: timerData.numberOfStarts + 1,
          timeSpent: Math.round(timerData.timeSpent + timeElapsed),
          lastSessionTime: timeElapsed
        });
      } else if (interaction.customId === "unpauseTimer") {
        if (interaction.user.id !== "333644367539470337")
          return interaction.reply({
            content: `Developer only`,
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

        const startedAtUNIX = timerData.breakTimerStart.getTime();

        const timeElapsed = (Date.now() - startedAtUNIX) / 1000;

        const readableTimeElapsed = msToTime(timeElapsed * 1000);

        await timerData.updateOne({
          breakTimerStart: null,
          sessionBreakTime: timerData.sessionBreakTime + timeElapsed,
          breakTime: timerData.breakTime + timeElapsed
        });

        const timerUnpaused = new MessageEmbed()
          .setTitle(`🕜 Timer Un-Paused`)
          .setColor(colours.DEFAULT)
          .setDescription(
            `• Break Duration: ${readableTimeElapsed} [${timeElapsed.toFixed(2)} s]`
          );

        return interaction.reply({
          embeds: [timerUnpaused]
        });
      }
    }
  });
};
