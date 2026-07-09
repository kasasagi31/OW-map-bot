const { ActionRowBuilder, UserSelectMenuBuilder } = require("discord.js");

/**
 * 共通ユーザー選択メニュー
 *
 * customId例:
 * user_select:event_remove:1234567890
 * user_select:match_fix_team_a:1234567890
 * user_select:match_swap_a:1234567890
 */
function createUserSelectRow(action, targetId, placeholder = "ユーザーを選んでね") {
  return new ActionRowBuilder().addComponents(
    new UserSelectMenuBuilder()
      .setCustomId(`user_select:${action}:${targetId}`)
      .setPlaceholder(placeholder)
      .setMinValues(1)
      .setMaxValues(1)
  );
}

function isUserSelectAction(interaction, action) {
  return (
    interaction.isUserSelectMenu() &&
    interaction.customId.startsWith(`user_select:${action}:`)
  );
}

function parseUserSelectCustomId(customId) {
  const parts = customId.split(":");

  return {
    prefix: parts[0],
    action: parts[1],
    targetId: parts[2],
  };
}

function getSelectedUserId(interaction) {
  return interaction.values[0];
}

module.exports = {
  createUserSelectRow,
  isUserSelectAction,
  parseUserSelectCustomId,
  getSelectedUserId,
};