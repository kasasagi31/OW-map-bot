const fs = require("fs");

const MATCH_FILE = "./matchData.json";

function loadMatch() {
  if (!fs.existsSync(MATCH_FILE)) return {};

  try {
    const raw = fs.readFileSync(MATCH_FILE, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error("matchData.json 読み込みエラー:", error);
    return {};
  }
}

function saveMatch(data) {
  fs.writeFileSync(MATCH_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  loadMatch,
  saveMatch,
};
