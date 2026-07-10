const fs = require("fs");

const PLAYER_STATS_FILE = "./playerStats.json";

function createEmptyStats() {
  return {
    wins: 0,
    losses: 0,
    draws: 0,
    games: 0,
  };
}

function loadPlayerStats() {
  if (!fs.existsSync(PLAYER_STATS_FILE)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(PLAYER_STATS_FILE, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error("playerStats.json 読み込みエラー:", error);
    return {};
  }
}

function savePlayerStats(data) {
  try {
    fs.writeFileSync(
      PLAYER_STATS_FILE,
      JSON.stringify(data, null, 2)
    );
  } catch (error) {
    console.error("playerStats.json 保存エラー:", error);
  }
}

function ensureUserStats(statsData, userId) {
  if (!statsData[userId]) {
    statsData[userId] = createEmptyStats();
  }

  return statsData[userId];
}

function addWin(stats) {
  stats.wins += 1;
  stats.games += 1;
}

function addLoss(stats) {
  stats.losses += 1;
  stats.games += 1;
}

function addDraw(stats) {
  stats.draws += 1;
  stats.games += 1;
}

function updateUserResult(statsData, userId, result) {
  const stats = ensureUserStats(statsData, userId);

  if (result === "win") {
    addWin(stats);
    return;
  }

  if (result === "loss") {
    addLoss(stats);
    return;
  }

  if (result === "draw") {
    addDraw(stats);
  }
}

function recordMatchResult(match, resultType) {
  const teamA = Array.isArray(match.teamA) ? match.teamA : [];
  const teamB = Array.isArray(match.teamB) ? match.teamB : [];

  const globalStats = loadPlayerStats();

  if (!match.sessionStats || typeof match.sessionStats !== "object") {
    match.sessionStats = {};
  }

  if (resultType === "a") {
    for (const userId of teamA) {
      updateUserResult(globalStats, userId, "win");
      updateUserResult(match.sessionStats, userId, "win");
    }

    for (const userId of teamB) {
      updateUserResult(globalStats, userId, "loss");
      updateUserResult(match.sessionStats, userId, "loss");
    }
  }

  if (resultType === "b") {
    for (const userId of teamA) {
      updateUserResult(globalStats, userId, "loss");
      updateUserResult(match.sessionStats, userId, "loss");
    }

    for (const userId of teamB) {
      updateUserResult(globalStats, userId, "win");
      updateUserResult(match.sessionStats, userId, "win");
    }
  }

  if (resultType === "draw") {
    for (const userId of [...teamA, ...teamB]) {
      updateUserResult(globalStats, userId, "draw");
      updateUserResult(match.sessionStats, userId, "draw");
    }
  }

  savePlayerStats(globalStats);
}

module.exports = {
  loadPlayerStats,
  savePlayerStats,
  recordMatchResult,
};