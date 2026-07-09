const fs = require("fs");

const SETTINGS_FILE = "./matchSettings.json";

const defaultSettings = {
  rankDiffLimit: 500,
};

function loadSettings() {
  if (!fs.existsSync(SETTINGS_FILE)) {
    saveSettings(defaultSettings);
    return { ...defaultSettings };
  }

  try {
    const raw = fs.readFileSync(SETTINGS_FILE, "utf8");
    const data = raw ? JSON.parse(raw) : {};

    return {
      ...defaultSettings,
      ...data,
    };
  } catch (error) {
    console.error("matchSettings.json 読み込みエラー:", error);
    saveSettings(defaultSettings);
    return { ...defaultSettings };
  }
}

function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
}

function setRankDiffLimit(limit) {
  const settings = loadSettings();
  settings.rankDiffLimit = limit;
  saveSettings(settings);
  return settings;
}

function getRankDiffLimit() {
  return loadSettings().rankDiffLimit;
}

module.exports = {
  loadSettings,
  saveSettings,
  setRankDiffLimit,
  getRankDiffLimit,
};