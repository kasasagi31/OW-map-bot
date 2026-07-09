const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

const { getAverage } = require("../teamManager");

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


function formatUser(id) {
  if (!id) return "不明";
  if (TEST_USER_NAMES[id]) return TEST_USER_NAMES[id];
  return `<@${id}>`;
}

function formatNumberedUsers(users) {
  if (!users || users.length === 0) return "なし";

  return users.map((id, index) => `${index + 1}. ${formatUser(id)}`).join("\n");
}

function makeLockText(match) {
  const aLock = formatNumberedUsers(match.aLock || []);
  const bLock = formatNumberedUsers(match.bLock || []);
  const aPrefer = formatNumberedUsers(match.aPrefer || []);
  const bPrefer = formatNumberedUsers(match.bPrefer || []);
  const spectatorLock = formatNumberedUsers(match.spectatorLock || []);

  return (
    `\n\n🔒 **完全固定**\n` +
    `🟦 A固定\n${aLock}\n` +
    `🟥 B固定\n${bLock}\n\n` +
    `📌 **所属固定**\n` +
    `🟦 A所属\n${aPrefer}\n` +
    `🟥 B所属\n${bPrefer}\n\n` +
    `👀 **観戦固定**\n${spectatorLock}`
  );
}

function makeMatchEmbed({
  teamA,
  teamB,
  spectators,
  map,
  tryCount,
  reachedTarget,
  targetDiff,
  maxTries,
  aLock = [],
  bLock = [],
  aPrefer = [],
  bPrefer = [],
  spectatorLock = [],
}) {
  const avgA = getAverage(teamA);
  const avgB = getAverage(teamB);
  const diff = Math.abs(avgA - avgB);

  const trialText = tryCount
    ? `🎲 抽選：${tryCount}回目で決定`
    : "🎲 抽選：記録なし";

  const warningText =
    reachedTarget === false
      ? `\n⚠️ ${maxTries}回試したけど平均差${targetDiff}以内にならなかったよ`
      : "";

  return new EmbedBuilder()
    .setTitle("🎮 試合開始")
    .setColor(0x5865f2)
    .setDescription(
      `🗺 **${map}**\n\n` +
        `🟦 Team A 平均 ${avgA}\n${formatNumberedUsers(teamA)}\n\n` +
        `🟥 Team B 平均 ${avgB}\n${formatNumberedUsers(teamB)}\n\n` +
        `👀 観戦\n${formatNumberedUsers(spectators)}\n\n` +
        `平均差：${diff}\n` +
        trialText +
        warningText +
        makeLockText({ aLock, bLock, aPrefer, bPrefer, spectatorLock })
    );
}

function makeMatchButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("match_team_reroll")
      .setLabel("🔄 チーム再抽選")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("match_map_reroll")
      .setLabel("🗺 マップ変更")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("match_all_reroll")
      .setLabel("🎲 全部再抽選")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("match_swap")
      .setLabel("🔀 入れ替え")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("match_start_game")
      .setLabel("▶ 試合開始")
      .setStyle(ButtonStyle.Success)
  );
}

function makeMatchExtraButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("match_team_lock")
      .setLabel("🔒 完全固定")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("match_team_prefer")
      .setLabel("📌 所属固定")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("match_spectator_lock")
      .setLabel("👀 観戦固定")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("match_unlock")
      .setLabel("🔓 固定解除")
      .setStyle(ButtonStyle.Secondary)
  );
}

function makeInGameButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("match_end_game")
      .setLabel("🏁 試合終了")
      .setStyle(ButtonStyle.Danger)
  );
}

function makeResultButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("match_result_a")
      .setLabel("🏆 TeamA勝利")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("match_result_b")
      .setLabel("🏆 TeamB勝利")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("match_result_draw")
      .setLabel("🤝 引き分け")
      .setStyle(ButtonStyle.Secondary)
  );
}

function makeNextMatchButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("match_next")
      .setLabel("▶ 次試合")
      .setStyle(ButtonStyle.Success)
  );
}

module.exports = {
  makeMatchEmbed,
  makeMatchButtons,
  makeMatchExtraButtons,
  makeInGameButtons,
  makeResultButtons,
  makeNextMatchButtons,
};
