const { SlashCommandBuilder } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setName("match")
  .setDescription("試合管理")

  .addSubcommand((sub) =>
    sub
      .setName("start")
      .setDescription("試合を開始")
      .addStringOption((option) =>
        option
          .setName("message_id")
          .setDescription("募集メッセージID")
          .setRequired(true)
      )
  )

  .addSubcommand((sub) =>
    sub
      .setName("config")
      .setDescription("マッチ設定を変更")
  )

.addSubcommand((sub) =>
  sub
    .setName("export")
    .setDescription("今回のカスタムログを書き出す")
)

  .toJSON();