const express = require("express");
const app = express();

require("dotenv").config();

const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");

const commands = require("./commands");
const { loadData } = require("./mapManager");
const { handleMessage } = require("./handlers/messageHandler");
const { handleInteraction } = require("./handlers/interactionHandler");

loadData();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("clientReady", () => {
  console.log(`${client.user.tag} でログインしました`);
});

client.on("messageCreate", handleMessage);
client.on("interactionCreate", handleInteraction);

const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Web server running on port ${PORT}`);
});

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

async function registerCommands() {
  try {
    console.log("スラッシュコマンド登録中...");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("スラッシュコマンド登録完了！");
  } catch (error) {
    console.error("スラッシュコマンド登録エラー:", error);
  }
}

registerCommands();
client.login(process.env.DISCORD_TOKEN);