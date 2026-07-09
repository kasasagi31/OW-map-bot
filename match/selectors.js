const { createUserSelectRow } = require("../components/userSelect");

async function showSwapUserSelect(interaction) {
  const row = createUserSelectRow(
    "match_swap_first",
    interaction.message.id,
    "入れ替えたい1人目を選んでね"
  );

  await interaction.reply({
    content: "🔀 入れ替えたい1人目を選んでね。",
    components: [row],
    ephemeral: true,
  });
}

async function showTeamLockUserSelect(interaction) {
  const row = createUserSelectRow(
    "match_team_lock",
    interaction.message.id,
    "完全固定したい人を選んでね"
  );

  await interaction.reply({
    content: "🔒 完全固定したい人を選んでね。",
    components: [row],
    ephemeral: true,
  });
}

async function showTeamPreferUserSelect(interaction) {
  const row = createUserSelectRow(
    "match_team_prefer",
    interaction.message.id,
    "所属固定したい人を選んでね"
  );

  await interaction.reply({
    content: "📌 所属固定したい人を選んでね。",
    components: [row],
    ephemeral: true,
  });
}

async function showSpectatorLockUserSelect(interaction) {
  const row = createUserSelectRow(
    "match_spectator_lock",
    interaction.message.id,
    "観戦固定したい人を選んでね"
  );

  await interaction.reply({
    content: "👀 観戦固定したい人を選んでね。",
    components: [row],
    ephemeral: true,
  });
}

async function showUnlockUserSelect(interaction) {
  const row = createUserSelectRow(
    "match_unlock",
    interaction.message.id,
    "固定解除したい人を選んでね"
  );

  await interaction.reply({
    content: "🔓 固定解除したい人を選んでね。",
    components: [row],
    ephemeral: true,
  });
}

module.exports = {
  showSwapUserSelect,
  showTeamLockUserSelect,
  showTeamPreferUserSelect,
  showSpectatorLockUserSelect,
  showUnlockUserSelect,
};