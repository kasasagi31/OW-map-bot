const fs = require("fs");

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
  "Neon Junction",
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
  if (mapData.remainingMaps.length === 0) {
    return {
      pickedMap: allMaps[Math.floor(Math.random() * allMaps.length)],
      wasReset: false,
    };
  }

  return {
    pickedMap:
      mapData.remainingMaps[
        Math.floor(Math.random() * mapData.remainingMaps.length)
      ],
    wasReset: false,
  };
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

function getMapData() {
  return mapData;
}

function getMapStatus() {
  return {
    current:
      mapData.history.length > 0
        ? mapData.history[mapData.history.length - 1]
        : null,

    remaining: mapData.remainingMaps.length,
    used: mapData.history.length,
    total: allMaps.length,
  };
}

function getRemainingMapList() {
  return makeList(
    `🎲 残りマップ (${mapData.remainingMaps.length})`,
    mapData.remainingMaps
  );
}

function getHistoryList() {
  return makeList(
    `📜 使用済みマップ (${mapData.history.length})`,
    mapData.history
  );
}

function getAllMaps() {
  return allMaps;
}

function commitMap(map) {
  let wasReset = false;

  if (mapData.remainingMaps.length === 0) {
    resetMaps();
    wasReset = true;
  }

  const index = mapData.remainingMaps.indexOf(map);

  if (index !== -1) {
    mapData.remainingMaps.splice(index, 1);
  }

  if (!mapData.history.includes(map)) {
    mapData.history.push(map);
  }

  saveData();

  return { wasReset };
}

module.exports = {
  loadData,
  resetMaps,
  pickRandomMap,
  commitMap,
  undoLastMap,
  makeList,
  getMapData,
  getAllMaps,

  getMapStatus,
  getRemainingMapList,
  getHistoryList,
};