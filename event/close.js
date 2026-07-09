const { EmbedBuilder } = require("discord.js");

const { saveEventData } = require("./storage");
const { disableRows } = require("./ui");

async function handleEventClose(interaction, eventData) {
  await interaction.deferReply({ ephemeral: true });

  const messageId = interaction.options.getString("message_id");
  const event = eventData[messageId];

  if (!event) {
    await interaction.editReply({
      content: "その募集データが見つからなかったよ。",
    });
    return true;
  }

  try {
    const channel = await interaction.client.channels.fetch(event.channelId);
    const message = await channel.messages.fetch(messageId);

    const oldEmbed = message.embeds[0];

    if (!oldEmbed) {
      await interaction.editReply({
        content: "募集メッセージのEmbedが見つからなかったよ。",
      });
      return true;
    }

    const newEmbed = EmbedBuilder.from(oldEmbed)
      .setColor(0xed4245)
      .setFooter({ text: "募集終了" });

    const disabledRows = disableRows(message.components);

    await message.edit({
      embeds: [newEmbed],
      components: disabledRows,
    });

    event.closed = true;
    saveEventData();

    await interaction.editReply({
      content: "募集を終了したよ。",
    });

    return true;
  } catch (error) {
    console.error("募集終了エラー:", error);

    await interaction.editReply({
      content:
        "募集メッセージの取得に失敗したよ。メッセージIDが合ってるか確認してね。",
    });

    return true;
  }
}

module.exports = {
  handleEventClose,
};