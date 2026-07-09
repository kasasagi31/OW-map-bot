const fs = require("fs");

const EVENT_DATA_FILE = "./eventData.json";

let eventData = {};

function saveEventData() {
  fs.writeFileSync(EVENT_DATA_FILE, JSON.stringify(eventData, null, 2), "utf-8");
}

function loadEventData() {
  if (!fs.existsSync(EVENT_DATA_FILE)) {
    eventData = {};
    saveEventData();
    return;
  }

  try {
    const raw = fs.readFileSync(EVENT_DATA_FILE, "utf-8");
    eventData = raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error("eventData.json 読み込みエラー:", error);
    eventData = {};
    saveEventData();
  }
}

function getEventData() {
  return eventData;
}

module.exports = {
  loadEventData,
  saveEventData,
  getEventData,
};