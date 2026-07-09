const { SlashCommandBuilder } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setName("test")
  .setDescription("開発用テストコマンド")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("fill")
      .setDescription("募集にテスト参加者を追加")
      .addStringOption((option) =>
        option
          .setName("message_id")
          .setDescription("募集メッセージID")
          .setRequired(true)
      )
  )
  .toJSON();