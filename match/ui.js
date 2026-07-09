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

function hasId(list, id) {
  return Array.isArray(list) && list.includes(id);
}

function getLockIcon(id, match) {
  if (hasId(match.aLock, id) || hasId(match.bLock, id)) return " 🔒";
  if (hasId(match.aPrefer, id) || hasId(match.bPrefer, id)) return " 📌";
  if (hasId(match.spectatorLock, id)) return " 👀";
  return "";
}

function formatNumberedUsers(users, match = {}) {
  if (!users || users.length === 0) return "なし";

  return users
    .map((id, index) => `${index + 1}. ${formatUser(id)}${getLockIcon(id, match)}`)
    .join("\n");
}

function getStatusView(status) {
  if (status === "started") {
    return { title: "🟢 試合中", color: 0xfaa61a };
  }

  if (status === "ended") {
    return { title: "🔴 試合終了", color: 0xed4245 };
  }

  return { title: "🎮 試合準備中", color: 0x5865f2 };
}

function makeMatchEmbed({
  teamA,
  teamB,
  spectators,
  map,
  status = "waiting",
  matchNumber = 1,
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

  const match = { aLock, bLock, aPrefer, bPrefer, spectatorLock };
  const view = getStatusView(status);

  const trialText = tryCount ? `抽選${tryCount}回目` : "抽選記録なし";

  const warningText =
    reachedTarget === false
      ? `\n⚠️ ${maxTries}回試したけど平均差${targetDiff}以内にならなかったよ`
      : "";

  return new EmbedBuilder()
    .setTitle(`${view.title} | ${map} | 第${matchNumber}試合`))
    .setColor(view.color)
    .setDescription(`🎲 平均差 ${diff}　${trialText}${warningText}`)
    .addFields(
      {
        name: `🟦 Team A（平均${avgA}）`,
        value: formatNumberedUsers(teamA, match),
        inline: true,
      },
      {
        name: `🟥 Team B（平均${avgB}）`,
        value: formatNumberedUsers(teamB, match),
        inline: true,
      },
      {
        name: "👀 観戦",
        value: formatNumberedUsers(spectators, match),
        inline: false,
      }
    )
    .setFooter({
      text: "🔒 完全固定　📌 所属固定　👀 観戦固定",
    });
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
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("match_result_skip")
      .setLabel("⏭ 記録なしで次へ")
      .setStyle(ButtonStyle.Secondary)
  );
}

module.exports = {
  makeMatchEmbed,
  makeMatchButtons,
  makeMatchExtraButtons,
  makeInGameButtons,
  makeResultButtons,
};