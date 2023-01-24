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

    // Creating a function that checks if the user who clicked the button is the same user who ran the command

    async function checkUser(data, originalMessage, interaction) {
      let functionOutput;
      // Checking if the message ID exists in the DB
      if (!data.messageID) {
        // Resetting the timer data since the original message could not be found in the DB

        await data.updateOne({
          intiationTime: null
        });

        await interaction.reply({
          content: `No data on the original message could be found.`,
          ephemeral: true
        });

        functionOutput = false;
      }
      // Checking if the message exists
      else if (!originalMessage) {
        // Deleting the message ID from the DB

        await data.updateOne({
          messageID: null
        });

        await interaction.reply({
          content: `I couldn't find the original message, please re-run the initiate command <>.`,
          ephemeral: true
        });
        functionOutput = false;
      }

      // Checking if the interaction belongs to the original author
      else if (data.interaction.user.id !== interaction.user.id) {
        await interaction.reply({
          content: `${invalidPermissionsMessage}`,
          ephemeral: true
        });
        functionOutput = false;
      } else functionOutput = true;

      return functionOutput;
    }

    // Checking if the document contains valid data
    if (
      interaction.customId !== "startTimer" &&
      interaction.customId !== "pauseTimer" &&
      interaction.customId !== "unpauseTimer" &&
      interaction.customId !== "stopTimer"
    ) {
      if (!timerData || !timerData.seasonName) return;
    }

    if (interaction.customId === "startTimer") {
      // Checking if the user who ran the command is the user who clicked the button
      // Fetching the original message

      const originalMessage = await interaction.channel.messages.fetch(
        timerData.messageID
      );

      const userCheck = await checkUser(
        timerData,
        originalMessage,
        interaction
      );

      if (!userCheck) return;

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

      // Checking if the timer is already on

      if (timerData.intiationTime) {
        await interaction.reply({
          content: `The timer is already on.`,
          ephemeral: true
        });
        // Fixing the original message
        return originalMessage.edit({
          components: [mainButtonsRowD]
        });
      }

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
    } else if (interaction.customId === "pauseTimer") {
      // Fetching the original message

      const originalMessage = await interaction.channel.messages.fetch(
        timerData.messageID
      );

      const userCheck = await checkUser(
        timerData,
        originalMessage,
        interaction
      );

      if (!userCheck) return;

      // Creating an upause button

      const mainButtonsRowUnpause = new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("startTimerD")
          .setDisabled(true)
          .setEmoji("🕜")
          .setLabel("Start Timer")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("unpauseTimer")
          .setEmoji("⏰")
          .setLabel("Un-pause Timer")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("stopTimer")
          .setEmoji("🕛")
          .setLabel("Stop Timer")
          .setStyle("SECONDARY")
      ]);

      // Checking if the timer is already paused

      if (timerData.breakTimerStart) {
        await interaction.reply({
          content: `Timer is already paused.`,
          ephemeral: true
        });

        return originalMessage.edit({
          components: [mainButtonsRowUnpause]
        });
      }

      // Adding pause time data to the DB, we use the start time to calcualte the time elapsed

      await timerData.updateOne({
        breakTimerStart: new Date(Date.now()),
        sessionBreaks: timerData.sessionBreaks + 1,
        totalBreaks: timerData.totalBreaks + 1
      });

      // Compared to V1, we don't need to add a break message ID since the pause timer is not part of the initiate

      const timerPaused = new MessageEmbed()
        .setTitle(`${emojis.VERIFY} Success`)
        .setColor(colours.DEFAULT)
        .setDescription(
          `The timer has been paused, time elapsed from now till un-pause time won't be added to the session time.`
        );

      await interaction.reply({
        embeds: [timerPaused]
      });

      return originalMessage.edit({
        components: [mainButtonsRowUnpause]
      });
      // Checking if the user unpaused
    } else if (interaction.customId === "unpauseTimer") {
      // Fetching the original message

      const originalMessage = await interaction.channel.messages.fetch(
        timerData.messageID
      );
      const userCheck = await checkUser(
        timerData,
        originalMessage,
        interaction
      );

      if (!userCheck) return;

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

      // Checking if the user's timer is paused

      const timerNotPaused = new MessageEmbed()
        .setTitle(`${emojis.ERROR} You can't do that`)
        .setColor(colours.ERRORRED)
        .setDescription(
          `Your timer is not paused, I'll look for the initiation message and fix the buttons.\n\nIf they're not fixed, please re-run the initiation command`
        );

      if (!timerData.breakTimerStart) {
        if (originalMessage)
          await originalMessage.edit({
            components: [mainButtonsRowD]
          });
        // Fixing the original message
        return interaction.reply({
          embeds: [timerNotPaused],
          ephemeral: true
        });
      }

      // Calculating the break time

      const timeElaped =
        (Date.now() - timerData.breakTimerStart.getTime()) / 1000;

      // Adding the data to the DB

      await timerData.updateOne({
        breakTime: timerData.breakTime + timeElaped,
        sessionBreakTime: timerData.sessionBreakTime + timeElaped,
        breakTimerStart: null
      });

      // Removing the un-pause button

      await originalMessage.edit({
        components: [mainButtonsRowD]
      });

      const timerUnpaused = new MessageEmbed()
        .setTitle(`${emojis.VERIFY} Success`)
        .setColor(colours.DEFAULT)
        .setDescription(
          `Session timer has been un-paused\n\n• Break Time: ${msToTime(
            Math.abs(timeElaped * 1000)
          )} [${timeElaped.toFixed(2)} Seconds]`
        );

      return interaction.reply({
        embeds: [timerUnpaused]
      });
      // If the user stops the timer
    } else if (interaction.customId === "stopTimer") {
      // Fetching the original message

      const originalMessage = await interaction.channel.messages.fetch(
        timerData.messageID
      );

      const userCheck = await checkUser(
        timerData,
        originalMessage,
        interaction
      );

      if (!userCheck) return;

      const mainButtonsRowDisabled = new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("startTimerD")
          .setDisabled(true)
          .setEmoji("🕜")
          .setLabel("Start Timer")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("pauseTimer")
          .setDisabled(true)
          .setEmoji("⏰")
          .setLabel("Pause Timer")
          .setStyle("SECONDARY"),
        new MessageButton()
          .setCustomId("stopTimer")
          .setDisabled(true)
          .setEmoji("🕛")
          .setLabel("Stop Timer")
          .setStyle("SECONDARY")
      ]);

      // Checking if the session is still on

      const sessionEnded = new MessageEmbed()
        .setTitle(`${emojis.ERROR} You can't do that`)
        .setColor(colours.ERRORRED)
        .setDescription(`Session has already ended.`);

      if (!timerData.intiationTime) {
        await interaction.reply({
          embeds: [sessionEnded],
          ephemeral: true
        });
        return originalMessage.edit({
          components: [mainButtonsRowDisabled]
        });
      }

      // Calculating the session time

      // Calculating the break time first

      let breakTime;
      let timeElapsed;
      let averageBreakTime;
      let displayAvgBreakTime;
      let totalBreakTimeDisplay;

      // use ternary operator to assign breakTime
      breakTime =
        timerData.sessionBreakTime > 0 ? timerData.sessionBreakTime : 0;

      // Subtracting the break time from the time elapsed
      // use Date.now() to get the time in ms since epoch and convert it to seconds
      timeElapsed =
        ((Date.now() - timerData.intiationTime.getTime()) / 1000).toFixed(3) -
        breakTime;

      // use an if statement to assign the average break time
      if (timerData.sessionBreaks > 0)
        averageBreakTime = timerData.sessionBreakTime / timerData.sessionBreaks;
      else averageBreakTime = 0;

      // Checking if the break time is not equal to undefined

      if (!msToTime(averageBreakTime * 1000)) {
        displayAvgBreakTime = `0 seconds`;
        totalBreakTimeDisplay = `0 seconds`;
      } else {
        displayAvgBreakTime = `${msToTime(averageBreakTime * 1000)}`;
        totalBreakTimeDisplay = `${msToTime(
          Math.abs(timerData.sessionBreakTime) * 1000
        )}`;
      }

      // Calcuating the time difference

      const oldAverageTime = timerData.timeSpent / timerData.numberOfStarts;
      const newAverageTime =
        (timerData.timeSpent + timeElapsed) / (timerData.numberOfStarts + 1);

      // Calculate the change in average time
      const deltaAverageTime = newAverageTime - oldAverageTime;

      // Initialize the displayDeltaAverageTime variable
      let displayDeltaAverageTime;

      // Determine the absolute value of deltaAverageTime and format it to display
      if (Math.abs(deltaAverageTime) !== deltaAverageTime) {
        displayDeltaAverageTime = `-${msToTime(
          Math.abs(deltaAverageTime * 1000)
        )}`;
      } else displayDeltaAverageTime = `${msToTime(deltaAverageTime * 1000)}`;

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

      // Checking if the session is longer than the previously recorded longest session

      let longestSession;

      if (timerData.longestSessionTime < timeElapsed)
        longestSession = timeElapsed;
      else longestSession = timerData.longestSessionTime;

      // Disabling the buttons

      await originalMessage.edit({
        components: [mainButtonsRowDisabled]
      });

      const sessionStatistics = new MessageEmbed()
        .setTitle(`${emojis.VERIFY} Session Ended`)
        .setColor(colours.DEFAULT)
        .setDescription(`${sessionStats}`)
        .setFooter({
          text: `Good Job`,
          iconURL: interaction.user.displayAvatarURL()
        });

      // Updating the data to the database

      await timerData.updateOne({
        intiationTime: null,
        messageID: null,
        timeSpent: timerData.timeSpent + timeElapsed,
        longestSessionTime: longestSession,
        lastSessionTime: new Date(Date.now()),
        breakTime: timerData.breakTime + timerData.sessionBreakTime,
        breakTimerStart: null,
        lastSessionTime: timeElapsed,
        sessionBreaks: 0,
        sessionBreakTime: 0
      });

      // Adding number since toFixed switches it to a string

      await timerData.sessionLengths.push(Number(timeElapsed.toFixed(4)));
      await timerData.save();

      return interaction.reply({
        embeds: [sessionStatistics]
      });
    }
  });
};
