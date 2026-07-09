const { getRankDiffLimit } = require("./matchSettings");

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const { pickRandomMap } = require("./mapManager");
const { makeTeams } = require("./teamManager");

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

const { updateRotationQueue } = require("./match/rotation");

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
  };

  const allUsers = getMatchParticipants(eventMessageId);
  updateRotationQueue(tempMatch, allUsers, uniqueUsers);
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
  const current = getRankDiffLimit();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("config_diff_100")
      .setLabel("100")
      .setStyle(current === 100 ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("config_diff_200")
      .setLabel("200")
      .setStyle(current === 200 ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("config_diff_300")
      .setLabel("300")
      .setStyle(current === 300 ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("config_diff_500")
      .setLabel("500")
      .setStyle(current === 500 ? ButtonStyle.Success : ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId("config_diff_999999")
      .setLabel("∞")
      .setStyle(current >= 999999 ? ButtonStyle.Success : ButtonStyle.Secondary)
  );

  await interaction.reply({
    content: `⚙️ 現在の許容ランク差：${current >= 999999 ? "∞" : current}`,
    components: [row],
    ephemeral: true,
  });
}

module.exports = {
  loadMatch,
  saveMatch,
  handleMatchStart,
  handleMatchConfig,
  handleMatchInteraction,
};