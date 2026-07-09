const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function createTeamChoiceRow(action, targetId, userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`team_choice:${action}:A:${targetId}:${userId}`)
      .setLabel("Team A")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`team_choice:${action}:B:${targetId}:${userId}`)
      .setLabel("Team B")
      .setStyle(ButtonStyle.Danger)
  );
}

function isTeamChoiceAction(interaction, action) {
  return (
    interaction.isButton() &&
    interaction.customId.startsWith(`team_choice:${action}:`)
  );
}

function parseTeamChoiceCustomId(customId) {
  const parts = customId.split(":");

  return {
    prefix: parts[0],
    action: parts[1],
    team: parts[2],
    targetId: parts[3],
    userId: parts[4],
  };
}

module.exports = {
  createTeamChoiceRow,
  isTeamChoiceAction,
  parseTeamChoiceCustomId,
};