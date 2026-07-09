function updateRotationQueue(match, allUsers, uniqueUsers) {
  const lockedUsers = uniqueUsers([
    ...(match.aLock || []),
    ...(match.bLock || []),
    ...(match.spectatorLock || []),
  ]);

  const rotationUsers = allUsers.filter((id) => !lockedUsers.includes(id));
  const oldQueue = match.rotationQueue || [];
  const newQueue = oldQueue.filter((id) => rotationUsers.includes(id));

  for (const id of rotationUsers) {
    if (!newQueue.includes(id)) {
      newQueue.push(id);
    }
  }

  match.rotationQueue = newQueue;
}

module.exports = {
  updateRotationQueue,
};