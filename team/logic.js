const { getUserRanks } = require("../rankManager");
const { getEventData } = require("../eventManager");

const TARGET_DIFF = 500;
const MAX_TRIES = 50;

function extractUserId(text) {
  if (!text) return null;
  return text.replace(/[<@!>]/g, "");
}

function getUserPoint(userId) {
  const ranks = getUserRanks(userId);
  if (!ranks) return 2500;

  const points = Object.values(ranks)
    .map((rank) => rank.point)
    .filter((point) => typeof point === "number");

  if (points.length === 0) return 2500;

  return Math.round(points.reduce((a, b) => a + b, 0) / points.length);
}

function uniqueUsers(users) {
  return [...new Set(users.filter(Boolean))];
}

function shuffleArray(array) {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
}

function getAverage(users) {
  if (!users || users.length === 0) return 0;

  const total = users.reduce((sum, id) => sum + getUserPoint(id), 0);
  return Math.round(total / users.length);
}

function getAverageDiff(teamA, teamB) {
  return Math.abs(getAverage(teamA) - getAverage(teamB));
}

function buildRandomTeams({
  allUsers,
  aPrefer,
  bPrefer,
  aLock,
  bLock,
  spectatorLock,
}) {
  let teamA = [...aLock];
  let teamB = [...bLock];
  let spectators = [...spectatorLock];

  let remaining = allUsers.filter(
    (id) => !teamA.includes(id) && !teamB.includes(id) && !spectators.includes(id)
  );

  const availableSlots = Math.max(0, 10 - teamA.length - teamB.length);
  const needSpectators = Math.max(0, remaining.length - availableSlots);

  remaining = shuffleArray(remaining);

  for (let i = 0; i < needSpectators; i++) {
    const picked = remaining.pop();
    if (picked) spectators.push(picked);
  }

  const players = shuffleArray(remaining);

  for (const userId of players) {
    if (aPrefer.includes(userId)) {
      if (teamA.length >= 5) return null;
      teamA.push(userId);
      continue;
    }

    if (bPrefer.includes(userId)) {
      if (teamB.length >= 5) return null;
      teamB.push(userId);
      continue;
    }
  }

  const freePlayers = shuffleArray(
    players.filter((id) => !aPrefer.includes(id) && !bPrefer.includes(id))
  );

  for (const userId of freePlayers) {
    if (teamA.length < 5 && teamB.length < 5) {
      if (getAverage(teamA) <= getAverage(teamB)) {
        teamA.push(userId);
      } else {
        teamB.push(userId);
      }
    } else if (teamA.length < 5) {
      teamA.push(userId);
    } else if (teamB.length < 5) {
      teamB.push(userId);
    } else {
      spectators.push(userId);
    }
  }

  if (teamA.length !== 5 || teamB.length !== 5) {
    return null;
  }

  return { teamA, teamB, spectators };
}

function makeTeams({
  eventMessageId,
  aPrefer = [],
  bPrefer = [],
  aLock = [],
  bLock = [],
  spectatorLock = [],
  forcedSpectators = [],
  targetDiff = TARGET_DIFF,
}) {
  forcedSpectators = uniqueUsers(forcedSpectators);
  spectatorLock = uniqueUsers([...spectatorLock, ...forcedSpectators]);

  const eventData = getEventData();
  const event = eventData[eventMessageId];

  if (!event) {
    return {
      error: "その募集データが見つからなかったよ。",
    };
  }

  const joined = (event.joined || []).map(extractUserId);
  const late = (event.late || []).map(extractUserId);

  const allUsers = uniqueUsers([...joined, ...late]);

  aPrefer = uniqueUsers(aPrefer);
  bPrefer = uniqueUsers(bPrefer);
  aLock = uniqueUsers(aLock);
  bLock = uniqueUsers(bLock);
  spectatorLock = uniqueUsers(spectatorLock);

  let bestResult = null;
  let bestDiff = Infinity;

  for (let tryCount = 1; tryCount <= MAX_TRIES; tryCount++) {
    const result = buildRandomTeams({
      allUsers,
      aPrefer,
      bPrefer,
      aLock,
      bLock,
      spectatorLock,
    });

    if (!result) continue;

    const diff = getAverageDiff(result.teamA, result.teamB);

    const currentResult = {
      ...result,
      averageDiff: diff,
      tryCount,
      targetDiff,
      maxTries: MAX_TRIES,
      reachedTarget: diff <= targetDiff,
    };

    if (diff < bestDiff) {
      bestDiff = diff;
      bestResult = currentResult;
    }

    if (diff <= targetDiff) {
      return currentResult;
    }
  }

  if (!bestResult) {
    return {
      error:
        "所属固定の条件が強すぎて、5:5を維持したままチーム分けできなかったよ。固定人数を減らすか、所属固定を調整してね。",
    };
  }

  return bestResult;
}

function makeTeamsFromInteraction(interaction) {
  return makeTeams({
    eventMessageId: interaction.options.getString("message_id"),

    aPrefer: [
      interaction.options.getUser("a_prefer_1")?.id,
      interaction.options.getUser("a_prefer_2")?.id,
      interaction.options.getUser("a_prefer_3")?.id,
    ],

    bPrefer: [
      interaction.options.getUser("b_prefer_1")?.id,
      interaction.options.getUser("b_prefer_2")?.id,
      interaction.options.getUser("b_prefer_3")?.id,
    ],

    aLock: [
      interaction.options.getUser("a_lock_1")?.id,
      interaction.options.getUser("a_lock_2")?.id,
      interaction.options.getUser("a_lock_3")?.id,
    ],

    bLock: [
      interaction.options.getUser("b_lock_1")?.id,
      interaction.options.getUser("b_lock_2")?.id,
      interaction.options.getUser("b_lock_3")?.id,
    ],

    spectatorLock: [
      interaction.options.getUser("spectator_1")?.id,
      interaction.options.getUser("spectator_2")?.id,
      interaction.options.getUser("spectator_3")?.id,
      interaction.options.getUser("spectator_4")?.id,
    ],
  });
}

module.exports = {
  makeTeams,
  makeTeamsFromInteraction,
  getAverage,
};