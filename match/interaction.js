const {
  getRankDiffLimit,
  setRankDiffLimit,
  setVcMoveEnabled,
} = require("../matchSettings");
const { createMatchConfig } = require("./config");

const { pickRandomMap, commitMap } = require("../mapManager");
const { makeTeams } = require("../teamManager");
const { getEventData } = require("../eventManager");
const { handleMatchUserSelect } = require("./userSelect");
const { isTeamChoiceAction } = require("../components/buttons");
const { handleTeamChoiceButton } = require("./locks");
const {
  moveMatchMembers,
  returnMatchMembers,
} = require("../vc");

const {
  decideRotationSpectators,
  commitRotationResult,
} = require("./rotation");

const {
  makeMatchEmbed,
  makeMatchButtons,
  makeMatchExtraButtons,
  makeInGameButtons,
  makeResultButtons,
} = require("./ui");

const { loadMatch, saveMatch } = require("./storage");
const { handleMatchModal } = require("./modals");

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
    status: match.status || "waiting",
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

  await interaction.update(createMatchConfig());

  return true;
}

if (interaction.customId === "config_vc_move_on") {
  setVcMoveEnabled(true);

  await interaction.update(createMatchConfig());

  return true;
}

if (interaction.customId === "config_vc_move_off") {
  setVcMoveEnabled(false);

  await interaction.update(createMatchConfig());

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
    const rotationSpectators = decideRotationSpectators(match, allUsers);
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
    if (match.status === "started") {
      await interaction.deferUpdate();
      return true;
    }

    if (match.status === "ended") {
      await interaction.deferUpdate();
      return true;
    }

    const allUsers = getMatchParticipants(match.eventMessageId);

    commitRotationResult(match, allUsers);
commitMap(match.map);

match.status = "started";
saveMatch(matchData);

await interaction.update({
  embeds: [createEmbedFromMatch(match)],
  components: [makeInGameButtons()],
});

// VC自動移動は画面更新後に実行
await moveMatchMembers(interaction.guild, match);
    return true;
  }

  if (interaction.customId === "match_end_game") {
    if (match.status !== "started") {
      await interaction.deferUpdate();
      return true;
    }

    match.status = "ended";
saveMatch(matchData);

await interaction.update({
  embeds: [createEmbedFromMatch(match)],
  components: [makeResultButtons()],
});

// 全員を集合VCへ戻す
await returnMatchMembers(interaction.guild, match);

    return true;
  }

  if (
    interaction.customId === "match_result_a" ||
    interaction.customId === "match_result_b" ||
    interaction.customId === "match_result_draw" ||
    interaction.customId === "match_result_skip"
  ) {
    if (interaction.customId !== "match_result_skip") {
      match.result =
        interaction.customId === "match_result_a"
          ? "TeamA勝利"
          : interaction.customId === "match_result_b"
          ? "TeamB勝利"
          : "引き分け";
    } else {
      match.result = null;
    }

    const allUsers = getMatchParticipants(match.eventMessageId);
    const rotationSpectators = decideRotationSpectators(match, allUsers);
    const result = makeTeams(buildTeamArgs(match, rotationSpectators));

    if (result.error) {
      await interaction.reply({
        content: result.error,
        ephemeral: true,
      });
      return true;
    }

    const { pickedMap } = pickRandomMap();

    applyTeamResultToMatch(match, result);
    match.map = pickedMap;
    match.matchNumber = (match.matchNumber || 1) + 1;
    match.status = "waiting";

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