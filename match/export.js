function ensureMatchLogs(match) {
  if (!Array.isArray(match.matchLogs)) {
    match.matchLogs = [];
  }

  return match.matchLogs;
}

function addMatchLog(match) {
  const logs = ensureMatchLogs(match);

  const matchNumber = match.matchNumber || logs.length + 1;

  // 同じ試合番号を二重保存しない
  if (logs.some((log) => log.matchNumber === matchNumber)) {
    return false;
  }

  logs.push({
    matchNumber,
    map: match.map || null,
    result: match.result || null,

    teamA: [...(match.teamA || [])],
    teamB: [...(match.teamB || [])],
    spectators: [...(match.spectators || [])],

    averageDiff:
      typeof match.averageDiff === "number"
        ? match.averageDiff
        : null,

    historyPenalty:
      typeof match.historyPenalty === "number"
        ? match.historyPenalty
        : null,

    sessionPenalty:
      typeof match.sessionPenalty === "number"
        ? match.sessionPenalty
        : null,

    createdAt: new Date().toISOString(),
  });

  return true;
}

function createMatchExport(match) {
  const logs = ensureMatchLogs(match);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),

    eventMessageId: match.eventMessageId || null,
    matchMessageId: match.messageId || null,

    completedMatchCount: logs.length,

    matches: logs,

    sessionStats: match.sessionStats || {},

    rotation: match.rotation || {
      lastSpectators: [],
      users: {},
    },

    settings: {
      targetDiff: match.targetDiff ?? null,
      maxTries: match.maxTries ?? null,
      sessionBalanceEnabled: true,
    },
  };
}

function createExportFile(match) {
  const exportData = createMatchExport(match);

  const json = JSON.stringify(exportData, null, 2);
  const buffer = Buffer.from(json, "utf8");

  const date = new Date()
    .toISOString()
    .slice(0, 10);

  return {
    attachment: buffer,
    name: `ow-custom-${date}.json`,
  };
}

module.exports = {
  ensureMatchLogs,
  addMatchLog,
  createMatchExport,
  createExportFile,
};