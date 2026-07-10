function getTeamPairs(team) {
  const pairs = [];

  for (let i = 0; i < team.length; i++) {
    for (let j = i + 1; j < team.length; j++) {
      const pair = [team[i], team[j]].sort();
      pairs.push(pair.join(":"));
    }
  }

  return pairs;
}

function getTeamHistoryPenalty(teamA, teamB, teamHistory = []) {
  if (!Array.isArray(teamHistory) || teamHistory.length === 0) {
    return 0;
  }

  const currentPairs = new Set([
    ...getTeamPairs(teamA || []),
    ...getTeamPairs(teamB || []),
  ]);

  let penalty = 0;

  for (const history of teamHistory) {
    const historyPairs = [
      ...getTeamPairs(history.teamA || []),
      ...getTeamPairs(history.teamB || []),
    ];

    for (const pair of historyPairs) {
      if (currentPairs.has(pair)) {
        penalty += 1;
      }
    }
  }

  return penalty;
}

module.exports = {
  getTeamHistoryPenalty,
};