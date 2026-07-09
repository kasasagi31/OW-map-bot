const TEAM_HISTORY_LIMIT = 5;

function countSameTeamPairs(team, historyTeam) {
  let count = 0;

  for (let i = 0; i < team.length; i++) {
    for (let j = i + 1; j < team.length; j++) {
      if (historyTeam.includes(team[i]) && historyTeam.includes(team[j])) {
        count++;
      }
    }
  }

  return count;
}

function getTeamHistoryPenalty(teamA, teamB, teamHistory = []) {
  let penalty = 0;

  const recentHistory = teamHistory.slice(-TEAM_HISTORY_LIMIT).reverse();

  recentHistory.forEach((history, index) => {
    const weight = TEAM_HISTORY_LIMIT - index;

    penalty += countSameTeamPairs(teamA, history.teamA || []) * weight;
    penalty += countSameTeamPairs(teamA, history.teamB || []) * weight;
    penalty += countSameTeamPairs(teamB, history.teamA || []) * weight;
    penalty += countSameTeamPairs(teamB, history.teamB || []) * weight;
  });

  return penalty;
}

module.exports = {
  TEAM_HISTORY_LIMIT,
  getTeamHistoryPenalty,
};