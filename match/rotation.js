function uniqueUsers(users) {
  return [...new Set((users || []).filter(Boolean))];
}

function shuffleArray(array) {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
}

function createDefaultUserRotation() {
  return {
    rotationSpectatorCount: 0,
    fixedSpectatorCount: 0,
    playCount: 0,
    playStreak: 0,
    lastStatus: null,
  };
}

function ensureRotation(match, allUsers) {
  if (!match.rotation) {
    match.rotation = {
      lastSpectators: [],
      users: {},
    };
  }

  if (!Array.isArray(match.rotation.lastSpectators)) {
    match.rotation.lastSpectators = [];
  }

  if (!match.rotation.users) {
    match.rotation.users = {};
  }

  for (const userId of allUsers) {
    if (!match.rotation.users[userId]) {
      match.rotation.users[userId] = createDefaultUserRotation();
    }
  }

  return match.rotation;
}

function getUserRotation(rotation, userId) {
  return rotation.users[userId] || createDefaultUserRotation();
}

function isFirstMatchUser(rotation, userId) {
  const data = getUserRotation(rotation, userId);

  return (
    data.playCount === 0 &&
    data.rotationSpectatorCount === 0 &&
    data.fixedSpectatorCount === 0
  );
}

function getSpectatorRate(data) {
  const total = data.playCount + data.rotationSpectatorCount;
  if (total <= 0) return 0;

  return data.rotationSpectatorCount / total;
}

function sortCandidates(candidates, rotation) {
  return shuffleArray(candidates).sort((a, b) => {
    const dataA = getUserRotation(rotation, a);
    const dataB = getUserRotation(rotation, b);

    if (dataA.playStreak !== dataB.playStreak) {
      return dataB.playStreak - dataA.playStreak;
    }

    if (dataA.rotationSpectatorCount !== dataB.rotationSpectatorCount) {
      return dataA.rotationSpectatorCount - dataB.rotationSpectatorCount;
    }

    return 0;
  });
}

function pickCandidates(candidates, count, rotation) {
  return sortCandidates(candidates, rotation).slice(0, count);
}

function decideRotationSpectators(match, allUsers) {
  allUsers = uniqueUsers(allUsers);
  const rotation = ensureRotation(match, allUsers);

  const fixedSpectators = uniqueUsers(match.spectatorLock || []);
  const nonFixedUsers = allUsers.filter(
    (userId) => !fixedSpectators.includes(userId)
  );

  const needRotationSpectators = Math.max(0, nonFixedUsers.length - 10);

  if (needRotationSpectators <= 0) {
    return [];
  }

  const lastSpectators = uniqueUsers(rotation.lastSpectators || []);

  const firstMatchUsers = nonFixedUsers.filter((userId) =>
    isFirstMatchUser(rotation, userId)
  );

  const normalCandidates = nonFixedUsers.filter(
    (userId) =>
      !lastSpectators.includes(userId) &&
      !firstMatchUsers.includes(userId)
  );

  let picked = pickCandidates(
    normalCandidates,
    needRotationSpectators,
    rotation
  );

  if (picked.length < needRotationSpectators) {
    const shortage = needRotationSpectators - picked.length;

    const withLastSpectators = nonFixedUsers.filter(
      (userId) =>
        !picked.includes(userId) &&
        !firstMatchUsers.includes(userId)
    );

    picked.push(...pickCandidates(withLastSpectators, shortage, rotation));
  }

  if (picked.length < needRotationSpectators) {
    const shortage = needRotationSpectators - picked.length;

    const withFirstMatchUsers = nonFixedUsers.filter(
      (userId) => !picked.includes(userId)
    );

    picked.push(...pickCandidates(withFirstMatchUsers, shortage, rotation));
  }

  return uniqueUsers(picked);
}

function commitRotationResult(match, allUsers) {
  allUsers = uniqueUsers(allUsers);
  const rotation = ensureRotation(match, allUsers);

  const fixedSpectators = uniqueUsers(match.spectatorLock || []);
  const actualSpectators = uniqueUsers(match.spectators || []);

  const fixedSpectatorSet = new Set(fixedSpectators);
  const actualSpectatorSet = new Set(actualSpectators);

  const rotationSpectators = actualSpectators.filter(
    (userId) => !fixedSpectatorSet.has(userId)
  );

  const rotationSpectatorSet = new Set(rotationSpectators);

  for (const userId of allUsers) {
    const data = getUserRotation(rotation, userId);

    if (fixedSpectatorSet.has(userId)) {
      data.fixedSpectatorCount += 1;
      data.playStreak = 0;
      data.lastStatus = "fixedSpectated";
    } else if (rotationSpectatorSet.has(userId)) {
      data.rotationSpectatorCount += 1;
      data.playStreak = 0;
      data.lastStatus = "rotationSpectated";
    } else if (!actualSpectatorSet.has(userId)) {
      data.playCount += 1;
      data.playStreak += 1;
      data.lastStatus = "played";
    }

    rotation.users[userId] = data;
  }

  rotation.lastSpectators = rotationSpectators;

  console.log("=== 観戦ローテ確定 ===");
  console.log("参加者数:", allUsers.length);
  console.log("固定観戦:", fixedSpectators);
  console.log("今回ローテ観戦:", rotationSpectators);
  console.log("====================");
}

module.exports = {
  ensureRotation,
  decideRotationSpectators,
  commitRotationResult,
};