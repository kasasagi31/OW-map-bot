const { EmbedBuilder } = require("discord.js");

const { saveEventData } = require("./storage");
const { createEventDescription } = require("./ui");

async function handleEventJoinButton(interaction, eventData) {
  const userId = interaction.user.id;
  const embed = interaction.message.embeds[0];

  if (!embed) {
    await interaction.reply({
      content: "募集データが見つからなかったよ。",
      ephemeral: true,
    });
    return true;
  }

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

  const nameText = `<@${userId}>`;

  let joined = event.joined || [];
  let late = event.late || [];

  const wasJoined = joined.includes(nameText);
  const wasLate = late.includes(nameText);

  joined = joined.filter((name) => name !== nameText);
  late = late.filter((name) => name !== nameText);

  if (interaction.customId === "event_join") {
    if (!wasJoined) joined.push(nameText);
  }

  if (interaction.customId === "event_late") {
    if (!wasLate) late.push(nameText);
  }

  event.joined = joined;
  event.late = late;

  const newDescription = createEventDescription(event);
  const newEmbed = EmbedBuilder.from(embed).setDescription(newDescription);

  saveEventData();

  await interaction.update({
    embeds: [newEmbed],
    components: interaction.message.components,
  });

  return true;
}

module.exports = {
  handleEventJoinButton,
};