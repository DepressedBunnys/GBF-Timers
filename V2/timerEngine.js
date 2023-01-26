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

    const messageOwner =
      (await timerSchema.findOne({
        messageID: interaction.message.id
      })) || undefined;

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

    // Function that calculates the amount of XP required to level up
    function xpRequired(level) {
      return level * 400 + (level - 1) * 200;
    }
    // Function that gives the user XP dependant on the time spent

    /**
     *
     * @param {time} - Used to calculate the XP given, every 5 minutes is 10 XP
     */

    function calculateXP(time) {
      let givenXP = 0;
      for (
        let remainingTime = time;
        remainingTime < 5;
        remainingTime = remainingTime - 5
      ) {
        givenXP = givenXP + 10;
      }
      return givenXP;
    }

    // Function from GBF's engine that calculates the levels given

    function checkRank(currentRank, currentRP, addedRP) {
      let addedLevels = 0;
      let hasRankedUp = false;

      let requiredRP = xpRequired(currentRank + addedLevels, currentRP);

      if (currentRank >= 5000) return;

      if (addedRP > requiredRP) {
        hasRankedUp = true;
        addedLevels++;
      }

      let remainingRP = addedRP - requiredRP;
      if (Math.abs(remainingRP) === remainingRP && remainingRP > requiredRP) {
        for (remainingRP; remainingRP > requiredRP; remainingRP -= requiredRP) {
          addedLevels++;
          if (currentRank + addedLevels >= 5000) {
            addedLevels--;
            break;
          }
          requiredRP = xpRequired(currentRank + addedLevels, currentRP);
        }
      }
      if (Math.abs(remainingRP) !== remainingRP) remainingRP = 0;
      if (addedLevels + currentRank >= 5000) addedLevels--;
      return [hasRankedUp, addedLevels, remainingRP];
    }

    if (interaction.customId === "startTimer") {
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

      // Creating the same buttons but with a disabled start to stop users from trying to start twice

      /**
       * @DS : [Disabled Start]
       */

      const mainButtonsRowDS = new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("startTimer")
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

      // Checking if the timer was already on

      const timerAlreadyOn = new MessageEmbed()
        .setTitle(`${emojis.ERROR} Error Starting Session`)
        .setColor(colours.ERRORRED)
        .setDescription(`The timer is already on.`);

      if (timerData.initationTime) {
        // Attempting to fix the buttons

        await originalMessage.edit({
          components: [mainButtonsRowDS]
        });

        // Error messages will be set to ephemeral to avoid clutter

        return interaction.reply({
          embeds: [timerAlreadyOn],
          ephemeral: true
        });
      }

      // Starting the timer

      const timerStarted = new MessageEmbed()
        .setTitle(`${emojis.VERIFY} Success`)
        .setColor(colours.DEFAULT)
        .setDescription(`Timer started, best of luck.`);

      // Adding the start time to the DB

      await timerData.startTime.push(new Date().getHours());

      // Adding the current date to the DB, we subtract the end time from the start time to get the time elapsed
      // Reseting the break data incase it never reset

      await timerData.updateOne({
        intiationTime: new Date(Date.now()),
        numberOfStarts: timerData.numberOfStarts + 1,
        lastSessionDate: new Date(Date.now()),
        breakTimerStart: null,
        sessionBreakTime: 0
      });

      await timerData.save();

      // Updating the original message to disable the start button

      await originalMessage.edit({
        components: [mainButtonsRowDS]
      });

      return interaction.reply({
        embeds: [timerStarted]
      });
    } else if (interaction.customId === "stopTimer") {
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

      // Creating the same buttons but with disabled buttons since the session ended

      /**
       * @DA : [Disabled All]
       */

      const mainButtonsRowDA = new MessageActionRow().addComponents([
        new MessageButton()
          .setCustomId("startTimer")
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

      // Checking if the timer is already off

      const timerAlreadyOff = new MessageEmbed()
        .setTitle(`${emojis.ERROR} Error Stopping Session`)
        .setColor(colours.ERRORRED)
        .setDescription(`Specified session has already ended.`)
        .setFooter({
          text: `Session Number: ${timerData.numberOfStarts}`
        });

      if (!timerData.intiationTime) {
        // Fixing the buttons

        await originalMessage.edit({
          components: [mainButtonsRowDA]
        });

        return interaction.reply({
          embeds: [timerAlreadyOff],
          ephemeral: true
        });
      }

      // Getting the total break time

      const breakTime =
        timerData.sessionBreakTime > 0 ? timerData.sessionBreakTime : 0;

      // Calculating the time between the current date and the time when the session started then subtracting it from the break time

      const timeElapsed = Math.abs(
        ((Date.now() - timerData.intiationTime.getTime()) / 1000).toFixed(3) -
          breakTime
      );

      // Calculating the average break time
      // Here we don't check if the numerator is 0 since 0 / Number = 0 while Number / 0 is undefined

      let averageBreakTime;

      if (timerData.sessionBreaks > 0)
        averageBreakTime = Math.abs(
          timerData.sessionBreakTime / timerData.sessionBreaks
        );
      else averageBreakTime = 0;

      // Calcuating the time difference, this is used for the session time movement quadrant

      const oldAverageTime = timerData.timeSpent / timerData.numberOfStarts;
      const newAverageTime =
        (timerData.timeSpent + timeElapsed) / (timerData.numberOfStarts + 1);

      // Calculate the change in average time
      const deltaAverageTime = newAverageTime - oldAverageTime;

      // Initialize the displayDeltaAverageTime variable, this is the variable that will be used to display the difference
      let displayDeltaAverageTime;

      // Determine the absolute value of deltaAverageTime and format it to display
      if (Math.abs(deltaAverageTime) !== deltaAverageTime) {
        displayDeltaAverageTime = `-${msToTime(
          Math.abs(deltaAverageTime * 1000)
        )}`;
      } else displayDeltaAverageTime = `${msToTime(deltaAverageTime * 1000)}`;

      // Making the description here so it's easier to update

      const embedDescription = `• Time Elapsed: ${msToTime(
        (timeElapsed + breakTime) * 1000
      )} [${Number(
        (timeElapsed + breakTime).toFixed(2)
      ).toLocaleString()} Seconds]\n• Session Time: ${msToTime(
        timeElapsed * 1000
      )} [${Number(
        timeElapsed.toFixed(2)
      ).toLocaleString()} Seconds]\n\n• Average Break Time: ${
        averageBreakTime > 0 ? msToTime(averageBreakTime * 1000) : "0 seconds"
      } [${Number(
        averageBreakTime.toFixed(2)
      ).toLocaleString()} Seconds]\n• Break Time: ${
        breakTime > 0 ? msToTime(breakTime * 1000) : "0 seconds"
      } [${Number(
        breakTime.toFixed(2)
      ).toLocaleString()} Seconds]\n• Number of Breaks: ${
        timerData.sessionBreaks
      }\n\n• Average Session Time Movement: ${displayDeltaAverageTime} [${Number(
        deltaAverageTime.toFixed(2)
      ).toLocaleString()} Seconds]`;

      // Updating the data to the DB & resetting the timer

      await timerData.updateOne({
        intiationTime: null,
        messageID: null,
        timeSpent: timerData.timeSpent + timeElapsed,
        longestSessionTime:
          timerData.longestSessionTime < timeElapsed
            ? timeElapsed
            : timerData.longestSessionTime,
        breakTime: timerData.breakTime + breakTime,
        breakTimerStart: null,
        lastSessionTime: timeElapsed,
        sessionBreaks: 0,
        sessionBreakTime: 0
      });

      const sessionStats = new MessageEmbed()
        .setTitle(`${emojis.VERIFY} Session Ended`)
        .setColor(colours.DEFAULT)
        .setDescription(`${embedDescription}`)
        .setFooter({
          text: `Good Job`
        });

      // Disabling the buttons

      await originalMessage.edit({
        components: [mainButtonsRowDA]
      });

      return interaction.reply({
        embeds: [sessionStats]
      });
    }
  });
};
