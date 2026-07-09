const { updateMatchMessage } = require("./message");
const {
  getSelectedUserId,
  parseUserSelectCustomId,
  createUserSelectRow,
} = require("../components/userSelect");

const { loadMatch, saveMatch } = require("./storage");

function findUserPlace(match, userId) {
  if ((match.teamA || []).includes(userId)) return "teamA";
  if ((match.teamB || []).includes(userId)) return "teamB";
  if ((match.spectators || []).includes(userId)) return "spectators";
  return null;
}

function swapUsers(match, userA, userB) {
  if (userA === userB) {
    return "同じ人同士は入れ替えできないよ。";
  }

  const placeA = findUserPlace(match, userA);
  const placeB = findUserPlace(match, userB);

  if (!placeA || !placeB) {
    return "どちらかのユーザーが現在の試合メンバーにいないよ。";
  }

  match[placeA] = match[placeA].map((id) => (id === userA ? userB : id));
  match[placeB] = match[placeB].map((id) => (id === userB ? userA : id));

  return null;
}


async function handleSwapFirstUserSelect(interaction) {
  const { targetId: messageId } = parseUserSelectCustomId(interaction.customId);
  const firstUserId = getSelectedUserId(interaction);

  const row = createUserSelectRow(
    `match_swap_second_${firstUserId}`,
    messageId,
    "入れ替えたい2人目を選んでね"
  );

  await interaction.update({
    content: `<@${firstUserId}> と入れ替える相手を選んでね。`,
    components: [row],
  });

  return true;
}

async function handleSwapSecondUserSelect(interaction, createEmbedFromMatch) {
  const { action, targetId: messageId } = parseUserSelectCustomId(
    interaction.customId
  );

  const firstUserId = action.replace("match_swap_second_", "");
  const secondUserId = getSelectedUserId(interaction);

  const matchData = loadMatch();
  const match = matchData[messageId];

  if (!match) {
    await interaction.update({
      content: "この試合データが見つからなかったよ。",
      components: [],
    });
    return true;
  }

  const error = swapUsers(match, firstUserId, secondUserId);

  if (error) {
    await interaction.update({
      content: error,
      components: [],
    });
    return true;
  }

  saveMatch(matchData);

  await updateMatchMessage(interaction, messageId, match, createEmbedFromMatch);

  await interaction.update({
    content: `<@${firstUserId}> と <@${secondUserId}> を入れ替えたよ。`,
    components: [],
  });

  return true;
}

module.exports = {
  handleSwapFirstUserSelect,
  handleSwapSecondUserSelect,
};