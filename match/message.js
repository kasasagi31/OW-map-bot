const { EmbedBuilder } = require("discord.js");

async function updateMatchMessage(
  interaction,
  messageId,
  match,
  createEmbedFromMatch
) {
  const channel = await interaction.client.channels.fetch(interaction.channelId);
  const message = await channel.messages.fetch(messageId);
  const oldEmbed = message.embeds[0];

  const newEmbed = oldEmbed
    ? EmbedBuilder.from(oldEmbed).setDescription(
        createEmbedFromMatch(match).data.description
      )
    : createEmbedFromMatch(match);

  await message.edit({
    embeds: [newEmbed],
    components: message.components,
  });
}

module.exports = {
  updateMatchMessage,
};