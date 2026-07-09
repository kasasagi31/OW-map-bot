const {
  loadEventData,
  saveEventData,
  getEventData,
} = require("./event/storage");

const { handleEventInteraction } = require("./event/interaction");

function addTestUsers(messageId) {
  const eventData = getEventData();
  const event = eventData[messageId];

  if (!event) {
    return {
      error: "その募集データが見つからなかったよ。",
    };
  }

  event.joined = [
    "100000000000000001",
    "100000000000000002",
    "100000000000000003",
    "100000000000000004",
    "100000000000000005",
    "100000000000000006",
    "100000000000000007",
    "100000000000000008",
    "100000000000000009",
    "100000000000000010",
  ];

  event.late = [];

  saveEventData();

  return {
    count: event.joined.length,
  };
}

function getEventParticipants(messageId) {
  const eventData = getEventData();
  const event = eventData[messageId];

  if (!event) {
    return null;
  }

  return {
    joined: event.joined || [],
    late: event.late || [],
    all: [...(event.joined || []), ...(event.late || [])],
  };
}

loadEventData();

module.exports = {
  handleEventInteraction,
  getEventData,
  addTestUsers,
  getEventParticipants,
};