const { updateMatchMessage } = require("./message");

const {
  getSelectedUserId,
  parseUserSelectCustomId,
} = require("../components/userSelect");

const {
  createTeamChoiceRow,
  parseTeamChoiceCustomId,
} = require("../components/buttons");

const { loadMatch, saveMatch } = require("./storage");

function removeFromArray(array, userId) {
  return (array || []).filter((id) => id !== userId);
}

function addUnique(array, userId) {
  const list = array || [];

  if (!list.includes(userId)) {
    list.push(userId);
  }

  return list;
}

function removeUserFromAllLocks(match, userId) {
  const before = {
    aLock: match.aLock || [],
    bLock: match.bLock || [],
    aPrefer: match.aPrefer || [],
    bPrefer: match.bPrefer || [],
    spectatorLock: match.spectatorLock || [],
  };

  match.aLock = removeFromArray(before.aLock, userId);
  match.bLock = removeFromArray(before.bLock, userId);
  match.aPrefer = removeFromArray(before.aPrefer, userId);
  match.bPrefer = removeFromArray(before.bPrefer, userId);
  match.spectatorLock = removeFromArray(before.spectatorLock, userId);

  return (
    before.aLock.length !== match.aLock.length ||
    before.bLock.length !== match.bLock.length ||
    before.aPrefer.length !== match.aPrefer.length ||
    before.bPrefer.length !== match.bPrefer.length ||
    before.spectatorLock.length !== match.spectatorLock.length
  );
}

async function handleLockUserSelect(interaction, createEmbedFromMatch, type) {
  const { targetId: messageId } = parseUserSelectCustomId(interaction.customId);
  const userId = getSelectedUserId(interaction);

  if (type === "team_lock" || type === "team_prefer") {
    const action =
      type === "team_lock" ? "match_team_lock" : "match_team_prefer";

    const row = createTeamChoiceRow(action, messageId, userId);

    await interaction.update({
      content: `<@${userId}> をどっちのチームに固定する？`,
      components: [row],
    });

    return true;
  }

  const matchData = loadMatch();
  const match = matchData[messageId];

  if (!match) {
    await interaction.update({
      content: "この試合データが見つからなかったよ。",
      components: [],
    });
    return true;
  }

  removeUserFromAllLocks(match, userId);
  match.spectatorLock = addUnique(match.spectatorLock, userId);

  saveMatch(matchData);

  await updateMatchMessage(interaction, messageId, match, createEmbedFromMatch);

  await interaction.update({
    content: `<@${userId}> を観戦固定したよ。`,
    components: [],
  });

  return true;
}

async function handleTeamChoiceButton(interaction, createEmbedFromMatch) {
  const {
    action,
    team,
    targetId: messageId,
    userId,
  } = parseTeamChoiceCustomId(interaction.customId);

  const matchData = loadMatch();
  const match = matchData[messageId];

  if (!match) {
    await interaction.update({
      content: "この試合データが見つからなかったよ。",
      components: [],
    });
    return true;
  }

  removeUserFromAllLocks(match, userId);

  if (action === "match_team_lock") {
    if (team === "A") {
      match.aLock = addUnique(match.aLock, userId);
    } else {
      match.bLock = addUnique(match.bLock, userId);
    }
  }

  if (action === "match_team_prefer") {
    if (team === "A") {
      match.aPrefer = addUnique(match.aPrefer, userId);
    } else {
      match.bPrefer = addUnique(match.bPrefer, userId);
    }
  }

  saveMatch(matchData);

  await updateMatchMessage(interaction, messageId, match, createEmbedFromMatch);

  const label = action === "match_team_lock" ? "完全固定" : "所属固定";

  await interaction.update({
    content: `<@${userId}> を Team ${team} に${label}したよ。`,
    components: [],
  });

  return true;
}

async function handleUnlockUserSelect(interaction, createEmbedFromMatch) {
  const { targetId: messageId } = parseUserSelectCustomId(interaction.customId);
  const userId = getSelectedUserId(interaction);

  const matchData = loadMatch();
  const match = matchData[messageId];

  if (!match) {
    await interaction.update({
      content: "この試合データが見つからなかったよ。",
      components: [],
    });
    return true;
  }

  const removed = removeUserFromAllLocks(match, userId);

  if (!removed) {
    await interaction.update({
      content: `<@${userId}> は固定されていなかったよ。`,
      components: [],
    });
    return true;
  }

  saveMatch(matchData);

  await updateMatchMessage(interaction, messageId, match, createEmbedFromMatch);

  await interaction.update({
    content: `<@${userId}> の固定を解除したよ。`,
    components: [],
  });

  return true;
}

module.exports = {
  removeUserFromAllLocks,
  handleLockUserSelect,
  handleUnlockUserSelect,
  handleTeamChoiceButton,
};