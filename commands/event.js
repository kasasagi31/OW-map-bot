const { SlashCommandBuilder } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setName("event")
  .setDescription("募集イベント管理")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("create")
      .setDescription("募集を作成")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("close")
      .setDescription("募集を終了")
      .addStringOption((option) =>
        option
          .setName("message_id")
          .setDescription("終了したい募集メッセージのID")
          .setRequired(true)
      )
  )
  .toJSON();