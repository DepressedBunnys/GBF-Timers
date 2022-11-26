const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const title = require("../gbfembedmessages.json");
const colours = require("../GBFColor.json");
const emojis = require("../GBFEmojis.json");

const { greenBright, redBright } = require("chalk");

const timerSchema = require("../schemas/GBF Schemas/timer schema");

const { msToTime } = require("../utils/engine");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.user.id !== "333644367539470337")
      return interaction.reply({
        content: `Developer only system.`,
        ephemeral: true
      });

    const timerData = await timerSchema.findOne({
      userID: interaction.user.id
    });

    if (!timerData)
      return interaction.reply({
        content: `No data found.`,
        ephemeral: true
      });

    if (interaction.customId === "startTimer") {
      const initiationButtonsDisabledStart =
        new MessageActionRow().addComponents([
          new MessageButton()
            .setCustomId("startTimerD")
            .setLabel("Start Timer")
            .setDisabled(true)
            .setStyle("SECONDARY")
            .setEmoji("🕜"),
          new MessageButton()
            .setCustomId("stopTimer")
            .setLabel("Stop Timer")
            .setStyle("SECONDARY")
            .setEmoji("🕛")
        ]);

      const timerAlreadyOn = new MessageEmbed()
        .setTitle(`${emojis.ERROR} You can't do that`)
        .setColor(colours.ERRORRED)
        .setDescription(`The timer is already on.`);

      if (timerData.intiationTime !== null)
        return interaction.reply({
          embeds: [timerAlreadyOn],
          ephemeral: true
        });

      const timerStarted = new MessageEmbed()
        .setTitle(`${emojis.VERIFY} Success`)
        .setColor(colours.DEFAULT)
        .setDescription(`Timer started, best of luck.`);

      await timerData.updateOne({
        intiationTime: new Date(Date.now()),
        numberOfStarts: timerData.numberOfStarts + 1,
        lastSessionDate: new Date(Date.now()),
        breakTimerStart: null,
        sessionBreakTime: 0
      });

      const originalMessage = await interaction.channel.messages.fetch(
        timerData.messageID
      );

      await originalMessage.edit({
        components: [initiationButtonsDisabledStart]
      });

      return interaction.reply({
        embeds: [timerStarted]
      });
    } else if (interaction.customId === "stopTimer") {
      const initiationButtonsDisabled = new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("startTimerD")
          .setLabel("Start Timer")
          .setDisabled(true)
          .setStyle("SECONDARY")
          .setEmoji("🕜"),
        new MessageButton()
          .setCustomId("stopTimer")
          .setLabel("Stop Timer")
          .setDisabled(true)
          .setStyle("SECONDARY")
          .setEmoji("🕛")
      ]);

      const timerAlreadyOff = new MessageEmbed()
        .setTitle(`${emojis.ERROR} You can't do that`)
        .setColor(colours.ERRORRED)
        .setDescription(`There's no previous recorded start time.`);

      if (timerData.intiationTime === null)
        return interaction.reply({
          embeds: [timerAlreadyOff],
          ephemeral: true
        });

      let breakTime;

      if (timerData.sessionBreakTime > 0)
        breakTime = timerData.sessionBreakTime;
      else breakTime = 0;

      const timeElapsed =
        ((Date.now() - timerData.intiationTime.getTime()) / 1000).toFixed(3) -
        breakTime;

      const averageBreakTime = (
        timerData.sessionBreakTime / timerData.sessionBreaks !== 0
          ? timerData.sessionBreaks
          : 1
      ).toFixed(2);

      let displayAvgBreakTime;
      let totalBreakTimeDisplay;

      if (!msToTime(averageBreakTime * 1000)) {
        displayAvgBreakTime = `0 seconds`;
        totalBreakTimeDisplay = `0 seconds`;
      } else {
        displayAvgBreakTime = `${msToTime(displayAvgBreakTime * 1000)}`;
        totalBreakTimeDisplay = `${msToTime(
          Math.abs(timerData.sessionBreakTime) * 1000
        )}`;
      }
      const oldAverageTime = timerData.timeSpent / timerData.numberOfStarts - 1;
      const newAverageTime =
        (timerData.timeSpent + timeElapsed) / timerData.numberOfStarts;

      const deltaAverageTime = newAverageTime - oldAverageTime;

      let displayDeltaAverageTime;

      if (deltaAverageTime < 0)
        displayDeltaAverageTime = `-${msToTime(
          Math.abs(deltaAverageTime * 1000)
        )}`;
      else displayDeltaAverageTime = `${msToTime(deltaAverageTime * 1000)}`;

      const sessionStats = `• Time Elapsed: ${msToTime(
        Math.abs(Math.round(timeElapsed + breakTime) * 1000)
      )} [${Math.round(
        timeElapsed + breakTime
      ).toLocaleString()} Seconds]\n• Session Time: ${msToTime(
        Math.abs(timeElapsed) * 1000
      )} [${Math.round(
        timeElapsed
      ).toLocaleString()} Seconds]\n\n• Average Break Time: ${displayAvgBreakTime} [${Math.round(
        averageBreakTime
      ).toLocaleString()} Seconds]\n• Total Break Time: ${totalBreakTimeDisplay} [${Math.round(
        timerData.sessionBreakTime
      ).toLocaleString()} Seconds]\n• Total Number of Breaks: ${
        timerData.sessionBreaks
      }\n\n• Average Study Session Time Movement: ${displayDeltaAverageTime} [${deltaAverageTime.toFixed(
        3
      )} Seconds]`;

      const sessionEnded = new MessageEmbed()
        .setTitle(`${emojis.VERIFY} Session Ended`)
        .setColor(colours.DEFAULT)
        .setDescription(`${sessionStats}`)
        .setFooter({
          text: `Good Job`
        });

      let longestSession;

      if (timerData.longestSessionTime < timeElapsed)
        longestSession = timeElapsed;
      else longestSession = timerData.longestSessionTime;

      const originalMessage = await interaction.channel.messages.fetch(
        timerData.messageID
      );

      await originalMessage.edit({
        components: [initiationButtonsDisabled]
      });

      await timerData.updateOne({
        intiationTime: null,
        messageID: null,
        timeSpent: timerData.timeSpent + timeElapsed,
        longestSessionTime: longestSession,
        lastSessionTime: new Date(Date.now()),
        breakTime: timerData.breakTime + timerData.sessionBreakTime,
        breakTimerStart: null,
        lastSessionTime: timeElapsed
      });

      await timerData.updateOne({
        sessionBreaks: 0,
        sessionBreakTime: 0
      });

      await interaction.reply({
        embeds: [sessionEnded]
      });
    } else if (interaction.customId === "unpauseButton") {
      const disabledPauseButton = new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("unpauseButton")
          .setLabel("Un-pause")
          .setEmoji("🕜")
          .setDisabled(true)
          .setStyle("SECONDARY")
      ]);

      const noDataFound = new MessageEmbed()
        .setTitle(`${emojis.ERROR} You can't do that`)
        .setColor(colours.ERRORRED)
        .setDescription(`The break timer was not started.`);

      if (timerData.breakTimerStart === null)
        return interaction.reply({
          embeds: [noDataFound],
          ephemeral: true
        });

      const timeElaped =
        (Date.now() - timerData.breakTimerStart.getTime()) / 1000;

      await timerData.updateOne({
        breakTime: timerData.breakTime + timeElaped,
        sessionBreakTime: timerData.sessionBreakTime + timeElaped,
        breakTimerStart: null,
        breakMessageID: null
      });

      const originalMessage = await interaction.channel.messages.fetch(
        timerData.breakMessageID
      );

      const unpausedTimer = new MessageEmbed()
        .setTitle(`${emojis.VERIFY} Done`)
        .setColor(colours.DEFAULT)
        .setDescription(
          `Session timer has been un-paused\n\n• Break Time: ${msToTime(
            Math.abs(timeElaped * 1000)
          )} [${timeElaped.toFixed(2)} Seconds]`
        );

      await originalMessage.edit({
        components: [disabledPauseButton]
      });

      return interaction.reply({
        embeds: [unpausedTimer]
      });
    }
  });
};
