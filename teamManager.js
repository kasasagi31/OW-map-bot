const { handleTeamInteraction } = require("./team/interaction");

const {
  makeTeams,
  makeTeamsFromInteraction,
  getAverage,
} = require("./team/logic");

const { formatUsers } = require("./team/ui");

module.exports = {
  handleTeamInteraction,
  makeTeams,
  makeTeamsFromInteraction,
  formatUsers,
  getAverage,
};