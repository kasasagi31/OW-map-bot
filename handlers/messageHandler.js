const {
  resetMaps,
  pickRandomMap,
  undoLastMap,
  makeList,
  getMapData,
  getAllMaps,
} = require("../mapManager");

async function handleMessage(message) {
  if (message.author.bot) return;

  const command = message.content.trim();
  const mapData = getMapData();
  const allMaps = getAllMaps();

  console.log("受信:", command);

  try {
    if (command === "!map") {
      const { pickedMap, wasReset } = pickRandomMap();

      let reply = "";

      if (wasReset) {
        reply += "🎉 全マップ使い切ったのでリセットしました！\n\n";
      }

      reply += `🎲 **${pickedMap}**\n`;
      reply += `残り ${mapData.remainingMaps.length}/${allMaps.length} マップ`;

      await message.reply(reply);
      return;
    }

    if (command === "!maps") {
      await message.reply(
        makeList(
          `📋 残りマップ（${mapData.remainingMaps.length}/${allMaps.length}）`,
          mapData.remainingMaps
        )
      );
      return;
    }

    if (command === "!history") {
      await message.reply(
        makeList(
          `📜 今回選ばれたマップ（${mapData.history.length}）`,
          mapData.history
        )
      );
      return;
    }

    if (command === "!resetmaps") {
      resetMaps();
      await message.reply(
        `🔄 マップをリセットしました！\n全${allMaps.length}マップから再開します。`
      );
      return;
    }

    if (command === "!undo") {
      const restoredMap = undoLastMap();

      if (restoredMap === null) {
        await message.reply("戻せるマップがないよ。");
        return;
      }

      await message.reply(
        `↩️ **${restoredMap}** を残りマップに戻しました。\n残り ${mapData.remainingMaps.length}/${allMaps.length} マップ`
      );
      return;
    }

    if (command === "!remaining") {
      await message.reply(
        `📊 残り ${mapData.remainingMaps.length}/${allMaps.length} マップ`
      );
      return;
    }

    if (command === "!last") {
      if (mapData.history.length === 0) {
        await message.reply("まだマップは選ばれてないよ。");
        return;
      }

      const lastMap = mapData.history[mapData.history.length - 1];
      await message.reply(`🎲 最後に選ばれたマップ：**${lastMap}**`);
      return;
    }

    if (command === "!help") {
      await message.reply(
        "使えるコマンド\n" +
          "`!map` マップ抽選\n" +
          "`!maps` 残り一覧\n" +
          "`!history` 履歴\n" +
          "`!resetmaps` リセット\n" +
          "`!undo` 最後の抽選を戻す\n" +
          "`!remaining` 残り枚数\n" +
          "`!last` 最後のマップ"
      );
      return;
    }
  } catch (error) {
    console.error("返信エラー:", error);
  }
}

module.exports = {
  handleMessage,
};