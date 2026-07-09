const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

const TEST_USER_NAMES = {
  "100000000000000001": "patoto",
  "100000000000000002": "marycia",
  "100000000000000003": "sio",
  "100000000000000004": "sumiha",
  "100000000000000005": "Alue",
  "100000000000000006": "kipfel",
  "100000000000000007": "mamehinata",
  "100000000000000008": "mao",
  "100000000000000009": "rurune",
  "100000000000000010": "sian",
};

function formatUsers(users) {
  if (!users || users.length === 0) return "なし";

  return users
    .map((id) => {
      if (TEST_USER_NAMES[id]) {
        return `・${TEST_USER_NAMES[id]}`;
      }

      return `・<@${id}>`;
    })
    .join("\n");
}

function makeTeamEmbed({
  teamA,
  teamB,
  spectators,
  avgA,
  avgB,
  diff,
  tryCount,
  reachedTarget,
  targetDiff,
  maxTries,
}) {
  return new EmbedBuilder()
    .setTitle("⚖️ チーム分け結果")
    .setColor(0x5865f2)
    .setDescription(
      `🟦 Team A 平均 ${avgA}\n${formatUsers(teamA)}\n\n` +
        `🟥 Team B 平均 ${avgB}\n${formatUsers(teamB)}\n\n` +
        `👀 観戦\n${formatUsers(spectators)}\n\n` +
        `平均差：${diff}\n` +
        `🎲 抽選：${tryCount || "?"}回目で決定` +
        `${reachedTarget === false ? `\n⚠️  ${maxTries}回試したけど平均差${targetDiff}以内にならなかったよ` : ""}`
    );
}

function makeTeamButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("team_reroll")
      .setLabel("再抽選")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("team_swap")
      .setLabel("入れ替え")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("team_spectator_swap")
      .setLabel("観戦変更")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("team_confirm")
      .setLabel("確定")
      .setStyle(ButtonStyle.Success)
  );
}

function disableRows(rows) {
  return rows.map((row) => {
    const newRow = ActionRowBuilder.from(row);
    newRow.components = newRow.components.map((button) =>
      ButtonBuilder.from(button).setDisabled(true)
    );
    return newRow;
  });
}

module.exports = {
  formatUsers,
  makeTeamEmbed,
  makeTeamButtons,
  disableRows,
};