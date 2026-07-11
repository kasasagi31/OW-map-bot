const {
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const { saveEventData } = require("./storage");
const { createEventDescription } = require("./ui");

async function handleEventJoinButton(interaction, eventData) {
  // 最初にDiscordへ応答して、Interactionの期限切れを防ぐ
  await interaction.deferUpdate();

  try {
    const messageId = interaction.message.id;
    const embed = interaction.message.embeds[0];
    const event = eventData[messageId];

    if (!embed) {
      await interaction.followUp({
        content: "募集メッセージのEmbedが見つからなかったよ。",
        flags: MessageFlags.Ephemeral,
      });

      return true;
    }

    if (!event) {
      await interaction.followUp({
        content: "保存された募集データが見つからなかったよ。",
        flags: MessageFlags.Ephemeral,
      });

      return true;
    }

    if (event.closed) {
      await interaction.followUp({
        content: "この募集はもう終了してるよ。",
        flags: MessageFlags.Ephemeral,
      });

      return true;
    }

    const userId = interaction.user.id;
    const nameText = `<@${userId}>`;

    let joined = Array.isArray(event.joined)
      ? [...event.joined]
      : [];

    let late = Array.isArray(event.late)
      ? [...event.late]
      : [];

    const wasJoined = joined.includes(nameText);
    const wasLate = late.includes(nameText);

    // いったん両方から外す
    joined = joined.filter((name) => name !== nameText);
    late = late.filter((name) => name !== nameText);

    // 同じボタンを押し直した場合は参加取消
    if (
      interaction.customId === "event_join" &&
      !wasJoined
    ) {
      joined.push(nameText);
    }

    if (
      interaction.customId === "event_late" &&
      !wasLate
    ) {
      late.push(nameText);
    }

    event.joined = joined;
    event.late = late;

    saveEventData();

    const newDescription = createEventDescription(event);
    const newEmbed = EmbedBuilder.from(embed)
      .setDescription(newDescription);

    // deferUpdate後なので updateではなくeditReply
    await interaction.editReply({
      embeds: [newEmbed],
      components: interaction.message.components,
    });

    return true;
  } catch (error) {
    console.error("イベント参加処理エラー:", error);

    try {
      await interaction.followUp({
        content: "参加状態の更新に失敗したよ。",
        flags: MessageFlags.Ephemeral,
      });
    } catch {}

    return true;
  }
}

module.exports = {
  handleEventJoinButton,
};