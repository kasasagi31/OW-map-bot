const {
  getRankDiffLimit,
  setRankDiffLimit,
} = require("../matchSettings");

const { EmbedBuilder } = require("discord.js");

const { pickRandomMap } = require("../mapManager");
const { makeTeams } = require("../teamManager");
const { getEventData } = require("../eventManager");
const { handleMatchUserSelect } = require("./userSelect");
const { isTeamChoiceAction } = require("../components/buttons");
const { handleTeamChoiceButton } = require("./locks");


const {
  makeMatchEmbed,
  makeMatchButtons,
  makeMatchExtraButtons,
  makeInGameButtons,
  makeResultButtons,
  makeNextMatchButtons,
} = require("./ui");

const {
  loadMatch,
  saveMatch,
} = require("./storage");

const {
  handleMatchModal,
} = require("./modals");
const {
  showSwapUserSelect,
  showTeamLockUserSelect,
  showTeamPreferUserSelect,
  showSpectatorLockUserSelect,
  showUnlockUserSelect,
} = require("./selectors");

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

function updateRotationQueue(match, allUsers) {
  const lockedUsers = uniqueUsers([
    ...(match.aLock || []),
    ...(match.bLock || []),
    ...(match.spectatorLock || []),
  ]);

  const rotationUsers = allUsers.filter((id) => !lockedUsers.includes(id));
  const oldQueue = match.rotationQueue || [];
  const newQueue = oldQueue.filter((id) => rotationUsers.includes(id));

  for (const id of rotationUsers) {
    if (!newQueue.includes(id)) {
      newQueue.push(id);
    }
  }

  match.rotationQueue = newQueue;
}

function pickRotationSpectators(match, allUsers) {
  updateRotationQueue(match, allUsers);

  const fixedPlayers = uniqueUsers([
    ...(match.aLock || []),
    ...(match.bLock || []),
  ]);

  const fixedSpectators = uniqueUsers(match.spectatorLock || []);
  const playableUsers = allUsers.filter((id) => !fixedSpectators.includes(id));

  const needSpectators = Math.max(0, playableUsers.length - 10);
  const picked = [];

  while (picked.length < needSpectators && match.rotationQueue.length > 0) {
    const userId = match.rotationQueue.shift();

    if (
      allUsers.includes(userId) &&
      !fixedPlayers.includes(userId) &&
      !fixedSpectators.includes(userId)
    ) {
      picked.push(userId);
    }
  }

  match.rotationQueue.push(...picked);

  return picked;
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

function buildTeamArgs(match, forcedSpectators = []) {
  return {
    eventMessageId: match.eventMessageId,
    aLock: match.aLock || [],
    bLock: match.bLock || [],
    aPrefer: match.aPrefer || [],
    bPrefer: match.bPrefer || [],
    spectatorLock: match.spectatorLock || [],
    forcedSpectators,
    targetDiff: getRankDiffLimit(),
  };
}

async function handleMatchInteraction(interaction) {
  if (interaction.isModalSubmit()) {
    return await handleMatchModal(interaction);
  }
   if (interaction.isUserSelectMenu()) {
  return await handleMatchUserSelect(interaction, createEmbedFromMatch);
}
if (
  isTeamChoiceAction(interaction, "match_team_lock") ||
  isTeamChoiceAction(interaction, "match_team_prefer")
) {
  return await handleTeamChoiceButton(interaction, createEmbedFromMatch);
}
  if (!interaction.isButton()) return false;

  if (interaction.customId.startsWith("config_diff_")) {
    const value = Number(interaction.customId.replace("config_diff_", ""));

    setRankDiffLimit(value);

    await interaction.update({
      content: `✅ 許容ランク差を ${value >= 999999 ? "∞" : value} に変更しました。`,
      components: [],
    });

    return true;
  }

  if (!interaction.customId.startsWith("match_")) return false;

  const matchData = loadMatch();
  const match = matchData[interaction.message.id];

  if (!match) {
    await interaction.reply({
      content: "この試合データが見つからなかったよ。",
      ephemeral: true,
    });
    return true;
  }

  if (interaction.customId === "match_swap") {
  await showSwapUserSelect(interaction);
  return true;
}

  if (interaction.customId === "match_team_lock") {
  await showTeamLockUserSelect(interaction);
  return true;
}

  if (interaction.customId === "match_team_prefer") {
  await showTeamPreferUserSelect(interaction);
  return true;
}

 if (interaction.customId === "match_spectator_lock") {
  await showSpectatorLockUserSelect(interaction);
  return true;
}

  if (interaction.customId === "match_unlock") {
  await showUnlockUserSelect(interaction);
  return true;
}

  if (interaction.customId === "match_team_reroll") {
    const result = makeTeams(buildTeamArgs(match));

    if (result.error) {
      await interaction.reply({ content: result.error, ephemeral: true });
      return true;
    }

    applyTeamResultToMatch(match, result);
    saveMatch(matchData);

    await interaction.update({
      embeds: [createEmbedFromMatch(match)],
      components: interaction.message.components,
    });

    return true;
  }

  if (interaction.customId === "match_map_reroll") {
    const { pickedMap } = pickRandomMap();

    match.map = pickedMap;
    saveMatch(matchData);

    await interaction.update({
      embeds: [createEmbedFromMatch(match)],
      components: interaction.message.components,
    });

    return true;
  }

  if (interaction.customId === "match_all_reroll") {
    const allUsers = getMatchParticipants(match.eventMessageId);
    const rotationSpectators = pickRotationSpectators(match, allUsers);
    const result = makeTeams(buildTeamArgs(match, rotationSpectators));

    if (result.error) {
      await interaction.reply({ content: result.error, ephemeral: true });
      return true;
    }

    const { pickedMap } = pickRandomMap();

    applyTeamResultToMatch(match, result);
    match.map = pickedMap;

    saveMatch(matchData);

    await interaction.update({
      embeds: [createEmbedFromMatch(match)],
      components: interaction.message.components,
    });

    return true;
  }

  if (interaction.customId === "match_start_game") {
    match.status = "in_game";
    saveMatch(matchData);

    const oldEmbed = interaction.message.embeds[0];
    const newEmbed = EmbedBuilder.from(oldEmbed)
      .setColor(0xfaa61a)
      .setFooter({ text: "試合中" });

    await interaction.update({
      embeds: [newEmbed],
      components: [makeInGameButtons()],
    });

    return true;
  }

  if (interaction.customId === "match_end_game") {
    match.status = "ended";
    saveMatch(matchData);

    const oldEmbed = interaction.message.embeds[0];
    const newEmbed = EmbedBuilder.from(oldEmbed)
      .setColor(0xed4245)
      .setFooter({ text: "試合終了：勝敗を選んでね" });

    await interaction.update({
      embeds: [newEmbed],
      components: [makeResultButtons()],
    });

    return true;
  }

  if (
    interaction.customId === "match_result_a" ||
    interaction.customId === "match_result_b" ||
    interaction.customId === "match_result_draw"
  ) {
    const resultLabel =
      interaction.customId === "match_result_a"
        ? "TeamA勝利"
        : interaction.customId === "match_result_b"
        ? "TeamB勝利"
        : "引き分け";

    match.status = "result_saved";
    match.result = resultLabel;
    saveMatch(matchData);

    const oldEmbed = interaction.message.embeds[0];
    const newEmbed = EmbedBuilder.from(oldEmbed)
      .setColor(0x57f287)
      .setFooter({ text: `結果：${resultLabel}` });

    await interaction.update({
      embeds: [newEmbed],
      components: [makeNextMatchButtons()],
    });

    return true;
  }

  if (interaction.customId === "match_next") {
    const allUsers = getMatchParticipants(match.eventMessageId);
    const rotationSpectators = pickRotationSpectators(match, allUsers);
    const result = makeTeams(buildTeamArgs(match, rotationSpectators));

    if (result.error) {
      await interaction.reply({ content: result.error, ephemeral: true });
      return true;
    }

    const { pickedMap } = pickRandomMap();

    applyTeamResultToMatch(match, result);
    match.map = pickedMap;
    match.status = "ready";
    match.result = null;

    saveMatch(matchData);

    await interaction.update({
      embeds: [createEmbedFromMatch(match)],
      components: [makeMatchButtons(), makeMatchExtraButtons()],
    });

    return true;
  }

  await interaction.reply({
    content: "このボタンの処理は次に作るよ。",
    ephemeral: true,
  });

  return true;
}

module.exports = {
  handleMatchInteraction,
};
