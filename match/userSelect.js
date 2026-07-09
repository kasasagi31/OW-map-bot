const { parseUserSelectCustomId } = require("../components/userSelect");

const {
  handleSwapFirstUserSelect,
  handleSwapSecondUserSelect,
} = require("./swap");

const {
  handleLockUserSelect,
  handleUnlockUserSelect,
} = require("./locks");

async function handleMatchUserSelect(interaction, createEmbedFromMatch) {
  const { action } = parseUserSelectCustomId(interaction.customId);

  if (action === "match_swap_first") {
    return await handleSwapFirstUserSelect(interaction);
  }

  if (action.startsWith("match_swap_second_")) {
    return await handleSwapSecondUserSelect(interaction, createEmbedFromMatch);
  }

  if (action === "match_team_lock") {
    return await handleLockUserSelect(
      interaction,
      createEmbedFromMatch,
      "team_lock"
    );
  }

  if (action === "match_team_prefer") {
    return await handleLockUserSelect(
      interaction,
      createEmbedFromMatch,
      "team_prefer"
    );
  }

  if (action === "match_spectator_lock") {
    return await handleLockUserSelect(
      interaction,
      createEmbedFromMatch,
      "spectator_lock"
    );
  }

  if (action === "match_unlock") {
    return await handleUnlockUserSelect(interaction, createEmbedFromMatch);
  }

  return false;
}

module.exports = {
  handleMatchUserSelect,
};