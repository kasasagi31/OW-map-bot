const fs = require("fs");

const DATA_FILE = "./rankData.json";

let rankData = {};

function loadRankData() {
  if (!fs.existsSync(DATA_FILE)) {
    saveRankData();
    return;
  }

  try {
    rankData = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    rankData = {};
    saveRankData();
  }
}

function formatUserRanks(userId) {
  const ranks = getUserRanks(userId);

  const roles = {
    tank: "🛡 Tank",
    damage: "⚔ Damage",
    support: "💚 Support",
  };

  let text = "🏅 あなたのランク\n\n";

  for (const role of ["tank", "damage", "support"]) {
    const rank = ranks?.[role];

    if (!rank) {
      text += `${roles[role]}：未登録\n`;
    } else {
      text += `${roles[role]}：${rank.tier} ${rank.division}\n`;
    }
  }

  return text;
}

function formatRankList(users) {
  let text = `👥 参加者ランク (${users.length}人)\n\n`;

  const roleNames = {
    tank: "🛡 Tank",
    dps: "⚔ Damage",
    support: "💚 Support",
  };

  const unregistered = [];

  users.forEach((user, index) => {
    const userId = user.replace(/[<@!>]/g, "");
    const ranks = getUserRanks(userId);

    text += `${index + 1}. ${user}\n`;

    for (const role of ["tank", "dps", "support"]) {
      const rank = ranks?.[role];

      if (rank) {
        text += `${roleNames[role]}：${rank.tier} ${rank.division}\n`;
      } else {
        text += `${roleNames[role]}：未登録\n`;
        unregistered.push(`${user} (${roleNames[role]})`);
      }
    }

    text += "\n";
  });

  if (unregistered.length) {
    text += "━━━━━━━━━━\n";
    text += "⚠ 未登録\n";
    text += "━━━━━━━━━━\n";

    for (const line of unregistered) {
      text += `・${line}\n`;
    }
  }

  return text;
}

function saveRankData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(rankData, null, 2), "utf8");
}

function getRankPoint(tier, division) {
  const tierBase = {
    bronze: 1000,
    silver: 1500,
    gold: 2000,
    platinum: 2500,
    diamond: 3000,
    master: 3500,
    grandmaster: 4000,
    champion: 4500,
  };

  return tierBase[tier] + (5 - division) * 100;
}

function setRank(userId, role, tier, division) {
  if (!rankData[userId]) {
    rankData[userId] = {};
  }

  rankData[userId][role] = {
    tier,
    division,
    point: getRankPoint(tier, division),
  };

  saveRankData();
}

function getUserRanks(userId) {
  return rankData[userId] || null;
}

loadRankData();

module.exports = {
  setRank,
  getUserRanks,
  getRankPoint,
  formatUserRanks,
  formatRankList,
};