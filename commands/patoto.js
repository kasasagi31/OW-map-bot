const { SlashCommandBuilder } = require("discord.js");

module.exports = new SlashCommandBuilder()
  .setName("patoto")
  .setDescription("patotoがしゃべる")
  .toJSON();