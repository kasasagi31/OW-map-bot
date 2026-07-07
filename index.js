require("dotenv").config();

const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");

const DATA_FILE = "./mapData.json";

const allMaps = [
  "Antarctic Peninsula",
  "Aatlis",
  "Blizzard World",
  "Busan",
  "Circuit Royal",
  "Colosseo",
  "Dorado",
  "Eichenwalde",
  "Esperança",
  "Hanaoka",
  "Havana",
  "Hollywood",
  "Ilios",
  "Junkertown",
  "King's Row",
  "Lijiang Tower",
  "Midtown",
  "Nepal",
  "New Junk City",
  "New Queen Street",
  "Numbani",
  "Oasis",
  "Paraíso",
  "Rialto",
  "Route 66",
  "Runasapi",
  "Samoa",
  "Shambali Monastery",
  "Suravasa",
  "Throne of Anubis",
  "Watchpoint: Gibraltar",
];

let mapData = {
  remainingMaps: [...allMaps],
  history: [],
};

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(mapData, null, 2), "utf-8");
}

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    saveData();
    return;
  }

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);

    mapData.remainingMaps = Array.isArray(data.remainingMaps)
      ? data.remainingMaps
      : [...allMaps];

    mapData.history = Array.isArray(data.history)
      ? data.history
      : [];
  } catch {
    mapData.remainingMaps = [...allMaps];
    mapData.history = [];
    saveData();
  }
}

function resetMaps() {
  mapData.remainingMaps = [...allMaps];
  mapData.history = [];
  saveData();
}

function pickRandomMap() {
  let wasReset = false;

  if (mapData.remainingMaps.length === 0) {
    resetMaps();
    wasReset = true;
  }

  const index = Math.floor(Math.random() * mapData.remainingMaps.length);
  const pickedMap = mapData.remainingMaps.splice(index, 1)[0];

  mapData.history.push(pickedMap);
  saveData();

  return { pickedMap, wasReset };
}

function undoLastMap() {
  if (mapData.history.length === 0) return null;

  const lastMap = mapData.history.pop();

  if (!mapData.remainingMaps.includes(lastMap)) {
    mapData.remainingMaps.push(lastMap);
  }

  saveData();
  return lastMap;
}

function makeList(title, items) {
  if (items.length === 0) return `${title}\nなし`;

  return `${title}\n${items.map((item, index) => `${index + 1}. ${item}`).join("\n")}`;
}

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

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const command = message.content.trim();

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
      await message.reply(`🔄 マップをリセットしました！\n全${allMaps.length}マップから再開します。`);
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
      await message.reply(`📊 残り ${mapData.remainingMaps.length}/${allMaps.length} マップ`);
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
});

client.login(process.env.DISCORD_TOKEN);