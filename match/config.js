const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const {
  getRankDiffLimit,
  getVcMoveEnabled,
} = require("../matchSettings");

function createMatchConfig() {
  const current = getRankDiffLimit();
  const vcMoveEnabled = getVcMoveEnabled();

  const rankRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("config_diff_100")
      .setLabel("100")
      .setStyle(current === 100 ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("config_diff_200")
      .setLabel("200")
      .setStyle(current === 200 ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("config_diff_300")
      .setLabel("300")
      .setStyle(current === 300 ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("config_diff_500")
      .setLabel("500")
      .setStyle(current === 500 ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("config_diff_999999")
      .setLabel("∞")
      .setStyle(current >= 999999 ? ButtonStyle.Success : ButtonStyle.Secondary)
  );

  const vcRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("config_vc_move_on")
      .setLabel("VC自動移動 ON")
      .setStyle(vcMoveEnabled ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("config_vc_move_off")
      .setLabel("VC自動移動 OFF")
      .setStyle(!vcMoveEnabled ? ButtonStyle.Danger : ButtonStyle.Secondary)
  );

  return {
    content:
      `⚙️ Match設定\n` +
      `許容ランク差：${current >= 999999 ? "∞" : current}\n` +
      `VC自動移動：${vcMoveEnabled ? "ON" : "OFF"}`,
    components: [rankRow, vcRow],
    ephemeral: true,
  };
}

module.exports = {
  createMatchConfig,
};