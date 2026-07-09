const {
  VC_A_ID,
  VC_B_ID,
  VC_C_ID,
} = require("./channels");

const {
  getVcMoveEnabled,
} = require("../matchSettings");

function getUniqueIds(ids) {
  return [...new Set(ids.filter(Boolean))];
}

async function moveUserToChannel(guild, userId, channelId) {
  try {
    if (!guild || !userId || !channelId) return;

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return;

    const currentChannelId = member.voice?.channelId;

    // VCにいない人はスキップ
    if (!currentChannelId) return;

    // すでに目的VCなら何もしない
    if (currentChannelId === channelId) return;

    await member.voice.setChannel(channelId);
  } catch (error) {
    console.log(`VC移動失敗 userId=${userId} channelId=${channelId}`, error);
  }
}

async function moveUsersToChannel(guild, userIds, channelId) {
  const uniqueIds = getUniqueIds(userIds);

  for (const userId of uniqueIds) {
    await moveUserToChannel(guild, userId, channelId);
  }
}

async function moveMatchMembers(guild, match) {
  if (!getVcMoveEnabled()) return;
  if (!VC_MOVE_ENABLED) return;
  if (!match) return;

  await moveUsersToChannel(guild, match.teamA || [], VC_A_ID);
  await moveUsersToChannel(guild, match.teamB || [], VC_B_ID);
  await moveUsersToChannel(guild, match.spectators || [], VC_C_ID);
}

async function returnMatchMembers(guild, match) {
  if (!getVcMoveEnabled()) return;
  if (!VC_MOVE_ENABLED) return;
  if (!match) return;

  const allUserIds = getUniqueIds([
    ...(match.teamA || []),
    ...(match.teamB || []),
    ...(match.spectators || []),
  ]);

  await moveUsersToChannel(guild, allUserIds, VC_A_ID);
}
module.exports = {
  moveMatchMembers,
  returnMatchMembers,
};