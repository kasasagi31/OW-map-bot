const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

const {
  makeMatchEmbed,
  makeMatchButtons,
  makeMatchExtraButtons,
} = require("./ui");

const {
  loadMatch,
  saveMatch,
} = require("./storage");

function uniqueUsers(users) {
  return [...new Set((users || []).filter(Boolean))];
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

function getListByTeamText(match, teamText) {
  if (teamText === "A") return match.teamA;
  if (teamText === "B") return match.teamB;
  if (teamText === "S") return match.spectators;
  return null;
}

function getUserFromVisibleList(match, teamText, number) {
  const list = getListByTeamText(match, teamText);
  const index = number - 1;

  if (!list) {
    return { error: "チームは A / B / S のどれかで入力してね。S は観戦だよ。" };
  }

  if (!Number.isInteger(number) || index < 0 || index >= list.length) {
    return { error: "番号が正しくないよ。表示されてる番号を入れてね。" };
  }

  return { userId: list[index], list, index };
}

function removeUserFromAllLocks(match, userId) {
  match.aLock = (match.aLock || []).filter((id) => id !== userId);
  match.bLock = (match.bLock || []).filter((id) => id !== userId);
  match.aPrefer = (match.aPrefer || []).filter((id) => id !== userId);
  match.bPrefer = (match.bPrefer || []).filter((id) => id !== userId);
  match.spectatorLock = (match.spectatorLock || []).filter((id) => id !== userId);
}

async function handleSwapModal(interaction) {
  if (!interaction.customId.startsWith("match_swap_modal:")) return false;

  const messageId = interaction.customId.split(":")[1];
  const matchData = loadMatch();
  const match = matchData[messageId];

  if (!match) {
    await interaction.reply({ content: "この試合データが見つからなかったよ。", ephemeral: true });
    return true;
  }

  const fromTeamText = interaction.fields.getTextInputValue("from_team").trim().toUpperCase();
  const fromNumber = Number(interaction.fields.getTextInputValue("from_number"));
  const toTeamText = interaction.fields.getTextInputValue("to_team").trim().toUpperCase();
  const toNumber = Number(interaction.fields.getTextInputValue("to_number"));

  const from = getUserFromVisibleList(match, fromTeamText, fromNumber);
  const to = getUserFromVisibleList(match, toTeamText, toNumber);

  if (from.error) {
    await interaction.reply({ content: from.error, ephemeral: true });
    return true;
  }

  if (to.error) {
    await interaction.reply({ content: to.error, ephemeral: true });
    return true;
  }

  if (from.list === to.list && from.index === to.index) {
    await interaction.reply({ content: "同じ場所同士は入れ替えできないよ。", ephemeral: true });
    return true;
  }

  const temp = from.list[from.index];
  from.list[from.index] = to.list[to.index];
  to.list[to.index] = temp;

  saveMatch(matchData);

  await interaction.update({
    embeds: [createEmbedFromMatch(match)],
    components: [makeMatchButtons(), makeMatchExtraButtons()],
  });

  return true;
}

async function handleTeamLockModal(interaction) {
  if (!interaction.customId.startsWith("match_team_lock_modal:")) return false;

  const messageId = interaction.customId.split(":")[1];
  const matchData = loadMatch();
  const match = matchData[messageId];

  if (!match) {
    await interaction.reply({ content: "この試合データが見つからなかったよ。", ephemeral: true });
    return true;
  }

  const teamText = interaction.fields.getTextInputValue("team_name").trim().toUpperCase();
  const playerNumber = Number(interaction.fields.getTextInputValue("player_number"));

  if (teamText !== "A" && teamText !== "B") {
    await interaction.reply({ content: "チームは A か B で入力してね。", ephemeral: true });
    return true;
  }

  const picked = getUserFromVisibleList(match, teamText, playerNumber);
  if (picked.error) {
    await interaction.reply({ content: picked.error, ephemeral: true });
    return true;
  }

  removeUserFromAllLocks(match, picked.userId);

  if (teamText === "A") {
    match.aLock = uniqueUsers([...(match.aLock || []), picked.userId]);
  } else {
    match.bLock = uniqueUsers([...(match.bLock || []), picked.userId]);
  }

  saveMatch(matchData);

  await interaction.update({
    embeds: [createEmbedFromMatch(match)],
    components: [makeMatchButtons(), makeMatchExtraButtons()],
  });

  return true;
}

async function handleTeamPreferModal(interaction) {
  if (!interaction.customId.startsWith("match_team_prefer_modal:")) return false;

  const messageId = interaction.customId.split(":")[1];
  const matchData = loadMatch();
  const match = matchData[messageId];

  if (!match) {
    await interaction.reply({ content: "この試合データが見つからなかったよ。", ephemeral: true });
    return true;
  }

  const teamText = interaction.fields.getTextInputValue("team_name").trim().toUpperCase();
  const playerNumber = Number(interaction.fields.getTextInputValue("player_number"));

  if (teamText !== "A" && teamText !== "B") {
    await interaction.reply({ content: "チームは A か B で入力してね。", ephemeral: true });
    return true;
  }

  const picked = getUserFromVisibleList(match, teamText, playerNumber);
  if (picked.error) {
    await interaction.reply({ content: picked.error, ephemeral: true });
    return true;
  }

  removeUserFromAllLocks(match, picked.userId);

  if (teamText === "A") {
    match.aPrefer = uniqueUsers([...(match.aPrefer || []), picked.userId]);
  } else {
    match.bPrefer = uniqueUsers([...(match.bPrefer || []), picked.userId]);
  }

  saveMatch(matchData);

  await interaction.update({
    embeds: [createEmbedFromMatch(match)],
    components: [makeMatchButtons(), makeMatchExtraButtons()],
  });

  return true;
}

async function handleSpectatorLockModal(interaction) {
  if (!interaction.customId.startsWith("match_spectator_lock_modal:")) return false;

  const messageId = interaction.customId.split(":")[1];
  const matchData = loadMatch();
  const match = matchData[messageId];

  if (!match) {
    await interaction.reply({ content: "この試合データが見つからなかったよ。", ephemeral: true });
    return true;
  }

  const teamText = interaction.fields.getTextInputValue("team_name").trim().toUpperCase();
  const playerNumber = Number(interaction.fields.getTextInputValue("player_number"));

  const picked = getUserFromVisibleList(match, teamText, playerNumber);
  if (picked.error) {
    await interaction.reply({ content: picked.error, ephemeral: true });
    return true;
  }

  removeUserFromAllLocks(match, picked.userId);
  match.spectatorLock = uniqueUsers([...(match.spectatorLock || []), picked.userId]);

  if (teamText === "A" || teamText === "B") {
    picked.list.splice(picked.index, 1);
    match.spectators = uniqueUsers([...(match.spectators || []), picked.userId]);
  }

  saveMatch(matchData);

  await interaction.update({
    embeds: [createEmbedFromMatch(match)],
    components: [makeMatchButtons(), makeMatchExtraButtons()],
  });

  return true;
}

async function handleUnlockModal(interaction) {
  if (!interaction.customId.startsWith("match_unlock_modal:")) return false;

  const messageId = interaction.customId.split(":")[1];
  const matchData = loadMatch();
  const match = matchData[messageId];

  if (!match) {
    await interaction.reply({ content: "この試合データが見つからなかったよ。", ephemeral: true });
    return true;
  }

  const lockType = interaction.fields.getTextInputValue("lock_type").trim().toUpperCase();
  const unlockNumber = Number(interaction.fields.getTextInputValue("unlock_number"));
  const unlockIndex = unlockNumber - 1;

  const lockMap = {
    AL: "aLock",
    BL: "bLock",
    AP: "aPrefer",
    BP: "bPrefer",
    S: "spectatorLock",
  };

  const key = lockMap[lockType];

  if (!key) {
    await interaction.reply({
      content: "種類は AL / BL / AP / BP / S のどれかで入力してね。",
      ephemeral: true,
    });
    return true;
  }

  const targetList = match[key] || [];

  if (!Number.isInteger(unlockNumber) || unlockIndex < 0 || unlockIndex >= targetList.length) {
    await interaction.reply({
      content: "解除番号が正しくないよ。Embedの固定リストに表示されてる番号を入れてね。",
      ephemeral: true,
    });
    return true;
  }

  targetList.splice(unlockIndex, 1);
  match[key] = targetList;

  saveMatch(matchData);

  await interaction.update({
    embeds: [createEmbedFromMatch(match)],
    components: [makeMatchButtons(), makeMatchExtraButtons()],
  });

  return true;
}

function createTwoInputModal({ customId, title, firstId, firstLabel, firstPlaceholder, secondId, secondLabel, secondPlaceholder }) {
  const modal = new ModalBuilder().setCustomId(customId).setTitle(title);

  const firstInput = new TextInputBuilder()
    .setCustomId(firstId)
    .setLabel(firstLabel)
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder(firstPlaceholder);

  const secondInput = new TextInputBuilder()
    .setCustomId(secondId)
    .setLabel(secondLabel)
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder(secondPlaceholder);

  modal.addComponents(
    new ActionRowBuilder().addComponents(firstInput),
    new ActionRowBuilder().addComponents(secondInput)
  );

  return modal;
}

async function showSwapModal(interaction) {
  const modal = new ModalBuilder()
    .setCustomId(`match_swap_modal:${interaction.message.id}`)
    .setTitle("入れ替え");

  const fromTeamInput = new TextInputBuilder()
    .setCustomId("from_team")
    .setLabel("入れ替え元 A / B / S")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder("例: A");

  const fromNumberInput = new TextInputBuilder()
    .setCustomId("from_number")
    .setLabel("入れ替え元の番号")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder("例: 3");

  const toTeamInput = new TextInputBuilder()
    .setCustomId("to_team")
    .setLabel("入れ替え先 A / B / S")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder("例: S");

  const toNumberInput = new TextInputBuilder()
    .setCustomId("to_number")
    .setLabel("入れ替え先の番号")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setPlaceholder("例: 1");

  modal.addComponents(
    new ActionRowBuilder().addComponents(fromTeamInput),
    new ActionRowBuilder().addComponents(fromNumberInput),
    new ActionRowBuilder().addComponents(toTeamInput),
    new ActionRowBuilder().addComponents(toNumberInput)
  );

  await interaction.showModal(modal);
}

async function showTeamLockModal(interaction) {
  const modal = createTwoInputModal({
    customId: `match_team_lock_modal:${interaction.message.id}`,
    title: "完全固定",
    firstId: "team_name",
    firstLabel: "完全固定するチーム A / B",
    firstPlaceholder: "例: A",
    secondId: "player_number",
    secondLabel: "固定したい参加者番号",
    secondPlaceholder: "例: 3",
  });

  await interaction.showModal(modal);
}

async function showTeamPreferModal(interaction) {
  const modal = createTwoInputModal({
    customId: `match_team_prefer_modal:${interaction.message.id}`,
    title: "所属固定",
    firstId: "team_name",
    firstLabel: "所属固定するチーム A / B",
    firstPlaceholder: "例: A",
    secondId: "player_number",
    secondLabel: "所属固定したい参加者番号",
    secondPlaceholder: "例: 3",
  });

  await interaction.showModal(modal);
}

async function showSpectatorLockModal(interaction) {
  const modal = createTwoInputModal({
    customId: `match_spectator_lock_modal:${interaction.message.id}`,
    title: "観戦固定",
    firstId: "team_name",
    firstLabel: "チーム A / B / S",
    firstPlaceholder: "例: A",
    secondId: "player_number",
    secondLabel: "観戦固定したい番号",
    secondPlaceholder: "例: 3",
  });

  await interaction.showModal(modal);
}

async function showUnlockModal(interaction) {
  const modal = createTwoInputModal({
    customId: `match_unlock_modal:${interaction.message.id}`,
    title: "固定解除",
    firstId: "lock_type",
    firstLabel: "解除する種類 AL/BL/AP/BP/S",
    firstPlaceholder: "例: S",
    secondId: "unlock_number",
    secondLabel: "解除する固定リストの番号",
    secondPlaceholder: "例: 1",
  });

  await interaction.showModal(modal);
}

async function handleMatchModal(interaction) {
  if (await handleSwapModal(interaction)) return true;
  if (await handleTeamLockModal(interaction)) return true;
  if (await handleTeamPreferModal(interaction)) return true;
  if (await handleSpectatorLockModal(interaction)) return true;
  if (await handleUnlockModal(interaction)) return true;
  return false;
}

module.exports = {
  handleMatchModal,
  showSwapModal,
  showTeamLockModal,
  showTeamPreferModal,
  showSpectatorLockModal,
  showUnlockModal,
};
