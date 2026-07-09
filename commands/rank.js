const { SlashCommandBuilder } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setName("rank")
  .setDescription("OWランク登録")

  .addSubcommand((subcommand) =>
    subcommand
      .setName("set")
      .setDescription("自分のランクを登録")
      .addStringOption((option) =>
        option
          .setName("role")
          .setDescription("ロール")
          .setRequired(true)
          .addChoices(
            { name: "Tank", value: "tank" },
            { name: "DPS", value: "dps" },
            { name: "Support", value: "support" }
          )
      )
      .addStringOption((option) =>
        option
          .setName("tier")
          .setDescription("ティア")
          .setRequired(true)
          .addChoices(
            { name: "Bronze", value: "bronze" },
            { name: "Silver", value: "silver" },
            { name: "Gold", value: "gold" },
            { name: "Platinum", value: "platinum" },
            { name: "Diamond", value: "diamond" },
            { name: "Master", value: "master" },
            { name: "Grandmaster", value: "grandmaster" },
            { name: "Champion", value: "champion" }
          )
      )
      .addIntegerOption((option) =>
        option
          .setName("division")
          .setDescription("ディビジョン")
          .setRequired(true)
          .addChoices(
            { name: "5", value: 5 },
            { name: "4", value: 4 },
            { name: "3", value: 3 },
            { name: "2", value: 2 },
            { name: "1", value: 1 }
          )
      )
  )

  .addSubcommand((subcommand) =>
    subcommand
      .setName("me")
      .setDescription("自分のランクを見る")
  )

  .addSubcommand((subcommand) =>
    subcommand
      .setName("list")
      .setDescription("参加者のランク一覧")
      .addStringOption((option) =>
        option
          .setName("message_id")
          .setDescription("募集メッセージID")
          .setRequired(true)
      )
  )

  .toJSON();