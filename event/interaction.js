const {
  saveEventData,
  getEventData,
} = require("./storage");

const {
  createEventCreateModal,
  createNotifyRow,
  createEventEmbed,
  createJoinRow,
} = require("./ui");

const { handleEventClose } = require("./close");
const { handleEventJoinButton } = require("./join");
const {
  handleEventManageButton,
  handleEventRemoveUserSelect,
} = require("./manage");

const { isUserSelectAction } = require("../components/userSelect");

async function handleEventInteraction(interaction) {
  const eventData = getEventData();

  if (interaction.isChatInputCommand()) {
    if (interaction.commandName !== "event") return false;

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "create") {
      const modal = createEventCreateModal();
      await interaction.showModal(modal);
      return true;
    }

    if (subcommand === "close") {
      return await handleEventClose(interaction, eventData);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId !== "event_create_modal") return false;

    const title = interaction.fields.getTextInputValue("event_title");
    const time = interaction.fields.getTextInputValue("event_time");
    const maxText = interaction.fields.getTextInputValue("event_max");
    const max = maxText ? Number(maxText) : null;

    if (maxText && (!Number.isInteger(max) || max <= 0)) {
      await interaction.reply({
        content: "募集人数は数字で入れてね。例：10",
        ephemeral: true,
      });
      return true;
    }

    const data = {
      title,
      time,
      max,
    };

    const encodedData = encodeURIComponent(JSON.stringify(data));
    const row = createNotifyRow(encodedData);

    await interaction.reply({
      content: "📢 @everyone通知する？",
      components: [row],
      ephemeral: true,
    });

    return true;
  }

  if (interaction.isButton()) {
    if (
      interaction.customId === "event_join" ||
      interaction.customId === "event_late"
    ) {
      return await handleEventJoinButton(interaction, eventData);
    }

    if (interaction.customId === "event_manage") {
      return await handleEventManageButton(interaction, eventData);
    }

    if (
      !interaction.customId.startsWith("event_notify_yes:") &&
      !interaction.customId.startsWith("event_notify_no:")
    ) {
      return false;
    }

    const everyone = interaction.customId.startsWith("event_notify_yes:");
    const encodedData = interaction.customId.split(":")[1];
    const data = JSON.parse(decodeURIComponent(encodedData));

    const event = {
      title: data.title,
      time: data.time,
      max: data.max,
      joined: [],
      late: [],
    };

    const embed = createEventEmbed(event);
    const row = createJoinRow();

    const eventMessage = await interaction.channel.send({
      content: everyone ? "@everyone" : "",
      embeds: [embed],
      components: [row],
    });

    eventData[eventMessage.id] = {
      messageId: eventMessage.id,
      channelId: eventMessage.channel.id,
      title: data.title,
      time: data.time,
      max: data.max,
      everyone,
      joined: [],
      late: [],
      closed: false,
    };

    saveEventData();

    await interaction.update({
      content: "募集を作ったよ",
      components: [],
    });

    return true;
  }

  if (interaction.isUserSelectMenu()) {
    if (isUserSelectAction(interaction, "event_remove")) {
      return await handleEventRemoveUserSelect(interaction, eventData);
    }

    return false;
  }

  return false;
}

module.exports = {
  handleEventInteraction,
};