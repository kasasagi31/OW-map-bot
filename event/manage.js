const { EmbedBuilder } = require("discord.js");

const { saveEventData } = require("./storage");
const {
  createEventDescription,
  createParticipantUserSelectRow,
} = require("./ui");

const {
  parseUserSelectCustomId,
  getSelectedUserId,
} = require("../components/userSelect");
async function handleEventManageButton(interaction, eventData) {
  const event = eventData[interaction.message.id];

  if (!event) {
    await interaction.reply({
      content: "保存された募集データが見つからなかったよ。",
      ephemeral: true,
    });
    return true;
  }

  if (event.closed) {
    await interaction.reply({
      content: "この募集はもう終了してるよ。",
      ephemeral: true,
    });
    return true;
  }

  const joined = event.joined || [];
  const late = event.late || [];

  if (joined.length + late.length === 0) {
    await interaction.reply({
      content: "まだ参加者がいないよ。",
      ephemeral: true,
    });
    return true;
  }

  const row = createParticipantUserSelectRow(interaction.message.id);

  await interaction.reply({
    content: "外す人を選んでね。",
    components: [row],
    ephemeral: true,
  });

  return true;
}

async function handleEventRemoveUserSelect(interaction, eventData) {
  const { targetId: messageId } =
  parseUserSelectCustomId(interaction.customId);

const userId = getSelectedUserId(interaction);
  const nameText = `<@${userId}>`;

  const event = eventData[messageId];

  if (!event) {
    await interaction.reply({
      content: "保存された募集データが見つからなかったよ。",
      ephemeral: true,
    });
    return true;
  }

  if (event.closed) {
    await interaction.reply({
      content: "この募集はもう終了してるよ。",
      ephemeral: true,
    });
    return true;
  }

  const wasJoined = (event.joined || []).includes(nameText);
  const wasLate = (event.late || []).includes(nameText);

  if (!wasJoined && !wasLate) {
    await interaction.update({
      content: `${nameText} はこの募集に参加していないよ。`,
      components: [],
    });
    return true;
  }

  event.joined = (event.joined || []).filter((name) => name !== nameText);
  event.late = (event.late || []).filter((name) => name !== nameText);

  saveEventData();

  try {
    const channel = await interaction.client.channels.fetch(event.channelId);
    const message = await channel.messages.fetch(messageId);
    const oldEmbed = message.embeds[0];

    if (!oldEmbed) {
      await interaction.update({
        content: "募集メッセージのEmbedが見つからなかったよ。",
        components: [],
      });
      return true;
    }

    const newDescription = createEventDescription(event);
    const newEmbed = EmbedBuilder.from(oldEmbed).setDescription(newDescription);

    await message.edit({
      embeds: [newEmbed],
      components: message.components,
    });

    await interaction.update({
      content: `${nameText} を参加者から外したよ。`,
      components: [],
    });

    return true;
  } catch (error) {
    console.error("参加者削除エラー:", error);

    await interaction.update({
      content: "募集メッセージの更新に失敗したよ。",
      components: [],
    });

    return true;
  }
}

module.exports = {
  handleEventManageButton,
  handleEventRemoveUserSelect,
};