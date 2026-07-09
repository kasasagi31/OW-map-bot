const { EmbedBuilder } = require("discord.js");

const {
  makeTeamEmbed,
  makeTeamButtons,
  disableRows,
} = require("./ui");

const {
  makeTeamsFromInteraction,
  getAverage,
} = require("./logic");

function buildTeamEmbed(result) {
  const avgA = getAverage(result.teamA);
  const avgB = getAverage(result.teamB);
  const diff = Math.abs(avgA - avgB);

  return makeTeamEmbed({
    ...result,
    avgA,
    avgB,
    diff,
  });
}

async function handleTeamInteraction(interaction) {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName !== "team") return false;

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "make") {
      await interaction.deferReply();

      const result = makeTeamsFromInteraction(interaction);

      if (result.error) {
        await interaction.editReply({
          content: result.error,
        });
        return true;
      }

      const embed = buildTeamEmbed(result);
      const row = makeTeamButtons();

      await interaction.editReply({
        embeds: [embed],
        components: [row],
      });

      return true;
    }
  }

  if (interaction.isButton()) {
    if (!interaction.customId.startsWith("team_")) return false;

    if (interaction.customId === "team_confirm") {
      const oldEmbed = interaction.message.embeds[0];
      const newEmbed = EmbedBuilder.from(oldEmbed)
        .setColor(0x57f287)
        .setFooter({ text: "チーム確定" });

      const disabledRows = disableRows(interaction.message.components);

      await interaction.update({
        embeds: [newEmbed],
        components: disabledRows,
      });

      return true;
    }

    await interaction.reply({
      content: "このボタンの処理は次に作るよ。",
      ephemeral: true,
    });

    return true;
  }

  return false;
}

module.exports = {
  handleTeamInteraction,
};