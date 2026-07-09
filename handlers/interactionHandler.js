const { getRandomMessage } = require("../patoto");

const {
  handleMatchStart,
  handleMatchConfig,
  handleMatchInteraction,
} = require("../matchManager");

const {
  handleEventInteraction,
  getEventParticipants,
  addTestUsers,
} = require("../eventManager");

const { handleTeamInteraction } = require("../teamManager");

const {
  setRank,
  formatUserRanks,
  formatRankList,
} = require("../rankManager");

const {
  resetMaps,
  pickRandomMap,
  getMapStatus,
  getRemainingMapList,
  getHistoryList,
} = require("../mapManager");

async function handleInteraction(interaction) {
  console.log(
    "interaction受信:",
    interaction.type,
    interaction.commandName,
    interaction.customId
  );

  try {
    if (interaction.isChatInputCommand()) {
      const commandName = interaction.commandName;
      const subcommand = interaction.options.getSubcommand(false);

      if (commandName === "match") {
        if (subcommand === "start") {
          await handleMatchStart(interaction);
          return;
        }

        if (subcommand === "config") {
          await handleMatchConfig(interaction);
          return;
        }
      }

      if (commandName === "map") {
        if (subcommand === "random") {
          const { pickedMap, wasReset } = pickRandomMap();
          const status = getMapStatus();

          let reply = "";

          if (wasReset) {
            reply += "🎉 全マップ使い切ったのでリセットしました！\n\n";
          }

          reply += `🎲 **${pickedMap}**\n`;
          reply += `残り ${status.remaining}/${status.total} マップ`;

          await interaction.reply(reply);
          return;
        }

        if (subcommand === "status") {
          const status = getMapStatus();

          await interaction.reply(
            `🗺 マップ状況\n\n` +
              `現在のマップ\n${status.current ?? "まだなし"}\n\n` +
              `残り：${status.remaining}/${status.total}\n` +
              `使用済み：${status.used}`
          );
          return;
        }

        if (subcommand === "remaining") {
          await interaction.reply(getRemainingMapList());
          return;
        }

        if (subcommand === "history") {
          await interaction.reply(getHistoryList());
          return;
        }

        if (subcommand === "reset") {
          resetMaps();
          await interaction.reply("✅ マップ履歴をリセットしました！");
          return;
        }
      }

      if (commandName === "patoto") {
        await interaction.reply(getRandomMessage());
        return;
      }

      if (commandName === "test" && subcommand === "fill") {
        const messageId = interaction.options.getString("message_id");
        const result = addTestUsers(messageId);

        if (result.error) {
          await interaction.reply({
            content: result.error,
            ephemeral: true,
          });
          return;
        }

        await interaction.reply({
          content: `✅ テスト参加者を ${result.count} 人追加したよ。`,
          ephemeral: true,
        });
        return;
      }

      if (commandName === "rank" && subcommand === "set") {
        const role = interaction.options.getString("role");
        const tier = interaction.options.getString("tier");
        const division = interaction.options.getInteger("division");

        setRank(interaction.user.id, role, tier, division);

        await interaction.reply({
          content: `✅ ${role} のランクを ${tier} ${division} に登録したよ。`,
          ephemeral: true,
        });
        return;
      }

      if (commandName === "rank" && subcommand === "me") {
        await interaction.reply({
          content: formatUserRanks(interaction.user.id),
          ephemeral: true,
        });
        return;
      }

      if (commandName === "rank" && subcommand === "list") {
        const messageId = interaction.options.getString("message_id");
        const participants = getEventParticipants(messageId);

        if (!participants) {
          await interaction.reply({
            content: "募集データが見つからなかったよ。",
            ephemeral: true,
          });
          return;
        }

        await interaction.reply({
          content: formatRankList(participants.all),
          ephemeral: true,
        });
        return;
      }
    }

    const matchHandled = await handleMatchInteraction(interaction);
    if (matchHandled) return;

    const teamHandled = await handleTeamInteraction(interaction);
    if (teamHandled) return;

    const handled = await handleEventInteraction(interaction);
    if (handled) return;
    } catch (err) {
    console.error("interactionCreate エラー:", err);

    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          content: "エラーが出たよ。コンソールを確認してね。",
          ephemeral: true,
        });
      } catch {}
    }
  }
}

module.exports = {
  handleInteraction,
};