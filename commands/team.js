const { SlashCommandBuilder } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setName("team")
  .setDescription("チーム分け")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("make")
      .setDescription("募集メンバーからチーム分け")
      .addStringOption((option) =>
        option
          .setName("message_id")
          .setDescription("募集メッセージID")
          .setRequired(true)
      )
      .addUserOption((option) =>
        option.setName("a_prefer_1").setDescription("A希望固定1")
      )
      .addUserOption((option) =>
        option.setName("a_prefer_2").setDescription("A希望固定2")
      )
      .addUserOption((option) =>
        option.setName("a_prefer_3").setDescription("A希望固定3")
      )
      .addUserOption((option) =>
        option.setName("b_prefer_1").setDescription("B希望固定1")
      )
      .addUserOption((option) =>
        option.setName("b_prefer_2").setDescription("B希望固定2")
      )
      .addUserOption((option) =>
        option.setName("b_prefer_3").setDescription("B希望固定3")
      )
      .addUserOption((option) =>
        option.setName("a_lock_1").setDescription("A試合固定1")
      )
      .addUserOption((option) =>
        option.setName("a_lock_2").setDescription("A試合固定2")
      )
      .addUserOption((option) =>
        option.setName("a_lock_3").setDescription("A試合固定3")
      )
      .addUserOption((option) =>
        option.setName("b_lock_1").setDescription("B試合固定1")
      )
      .addUserOption((option) =>
        option.setName("b_lock_2").setDescription("B試合固定2")
      )
      .addUserOption((option) =>
        option.setName("b_lock_3").setDescription("B試合固定3")
      )
      .addUserOption((option) =>
        option.setName("spectator_1").setDescription("観戦固定1")
      )
      .addUserOption((option) =>
        option.setName("spectator_2").setDescription("観戦固定2")
      )
      .addUserOption((option) =>
        option.setName("spectator_3").setDescription("観戦固定3")
      )
      .addUserOption((option) =>
        option.setName("spectator_4").setDescription("観戦固定4")
      )
  )
  .toJSON();