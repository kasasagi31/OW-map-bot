const { getEventData } = require("../eventManager");
const { makeMatchEmbed } = require("./ui");

function extractUserId(text) {
  if (!text) return null;
  return text.replace(/[<@!>]/g, "");
}

function uniqueUsers(users) {
  return [...new Set((users || []).filter(Boolean))];
}

function getMatchParticipants(eventMessageId) {
  const eventData = getEventData();
  const event = eventData[eventMessageId];

  if (!event) return [];

  const joined = (event.joined || []).map(extractUserId);
  const late = (event.late || []).map(extractUserId);

  return uniqueUsers([...joined, ...late]);
}

function applyTeamResultToMatch(match, result) {
  match.teamA = result.teamA;
  match.teamB = result.teamB;
  match.spectators = result.spectators;

  match.tryCount = result.tryCount;
  match.targetDiff = result.targetDiff;
  match.maxTries = result.maxTries;
  match.reachedTarget = result.reachedTarget;
}

function createEmbedFromMatch(match) {
  return makeMatchEmbed({
    teamA: match.teamA || [],
    teamB: match.teamB || [],
    spectators: match.spectators || [],
    map: match.map,
    tryCount: match.tryCount,
    targetDiff: match.targetDiff,
    maxTries: match.maxTries,
    reachedTarget: match.reachedTarget,
    aLock: match.aLock || [],
    bLock: match.bLock || [],
    aPrefer: match.aPrefer || [],
    bPrefer: match.bPrefer || [],
    spectatorLock: match.spectatorLock || [],
  });
}

module.exports = {
  extractUserId,
  uniqueUsers,
  getMatchParticipants,
  applyTeamResultToMatch,
  createEmbedFromMatch,
};