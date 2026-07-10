const {
  getRankDiffLimit,
  getVcMoveEnabled,
} = require("./matchSettings");
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { pickRandomMap } = require("./mapManager");
const { makeTeams } = require("./teamManager");
const { createMatchConfig } = require("./match/config");
const { createExportFile } = require("./match/export");

const {
  makeMatchButtons,
  makeMatchExtraButtons,
} = require("./match/ui");

const {
  loadMatch,
  saveMatch,
} = require("./match/storage");

const { handleMatchInteraction } = require("./match/interaction");

const {
  uniqueUsers,
  getMatchParticipants,
  applyTeamResultToMatch,
  createEmbedFromMatch,
} = require("./match/helpers");
const { ensureRotation } = require("./match/rotation");

async function handleMatchStart(interaction) {
  await interaction.deferReply();

  const eventMessageId = interaction.options.getString("message_id");

  const aLock = uniqueUsers([
    interaction.options.getUser("a_lock_1")?.id,
    interaction.options.getUser("a_lock_2")?.id,
    interaction.options.getUser("a_lock_3")?.id,
  ]);

  const bLock = uniqueUsers([
    interaction.options.getUser("b_lock_1")?.id,
    interaction.options.getUser("b_lock_2")?.id,
    interaction.options.getUser("b_lock_3")?.id,
  ]);

  const spectatorLock = uniqueUsers([
    interaction.options.getUser("spectator_1")?.id,
    interaction.options.getUser("spectator_2")?.id,
    interaction.options.getUser("spectator_3")?.id,
    interaction.options.getUser("spectator_4")?.id,
  ]);

  const result = makeTeams({
    eventMessageId,
    aLock,
    bLock,
    spectatorLock,
    aPrefer: [],
    bPrefer: [],
    targetDiff: getRankDiffLimit(),
  });

  if (result.error) {
    await interaction.editReply({ content: result.error });
    return;
  }

  const { pickedMap } = pickRandomMap();

  const tempMatch = {
  eventMessageId,
  channelId: interaction.channelId,
  map: pickedMap,
  status: "ready",
  result: null,
  rotationQueue: [],
  aLock,
  bLock,
  aPrefer: [],
  bPrefer: [],
  spectatorLock,

  matchNumber: 1, // ←追加
};

  const allUsers = getMatchParticipants(eventMessageId);
  ensureRotation(tempMatch, allUsers);
  applyTeamResultToMatch(tempMatch, result);

  const reply = await interaction.editReply({
    embeds: [createEmbedFromMatch(tempMatch)],
    components: [makeMatchButtons(), makeMatchExtraButtons()],
  });

  const matchData = loadMatch();
  matchData[reply.id] = {
    messageId: reply.id,
    ...tempMatch,
  };

  saveMatch(matchData);
}

async function handleMatchConfig(interaction) {
  await interaction.reply(createMatchConfig());
}

async function handleMatchExport(interaction) {
  const matchData = loadMatch();

  const match = Object.values(matchData).find(
    (m) => m.channelId === interaction.channelId
  );

  if (!match) {
    await interaction.reply({
      content: "このチャンネルに進行中のマッチが見つからないよ。",
      ephemeral: true,
    });
    return;
  }

  const file = createExportFile(match);

  await interaction.reply({
    content: `📄 ${match.matchLogs?.length || 0}試合分のログを書き出したよ。`,
    files: [file],
    ephemeral: true,
  });
}

module.exports = {
  loadMatch,
  saveMatch,
  handleMatchStart,
  handleMatchConfig,
  handleMatchExport,
  handleMatchInteraction,
};