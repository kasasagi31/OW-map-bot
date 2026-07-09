const { SlashCommandBuilder } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setName("map")
  .setDescription("マップ管理")

  .addSubcommand((sub) =>
    sub
      .setName("random")
      .setDescription("マップを抽選")
  )

  .addSubcommand((sub) =>
    sub
      .setName("status")
      .setDescription("現在のマップ状況")
  )

  .addSubcommand((sub) =>
    sub
      .setName("remaining")
      .setDescription("残っているマップ一覧")
  )

  .addSubcommand((sub) =>
    sub
      .setName("history")
      .setDescription("使用済みマップ一覧")
  )

  .addSubcommand((sub) =>
    sub
      .setName("reset")
      .setDescription("マップ履歴をリセット")
  )

  .toJSON();