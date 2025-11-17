const fs = require("fs");
const { FILES } = require("../config");
const { logError } = require("../utils/helpers");

/**
 * 加载状态
 */
function loadState() {
  try {
    if (!fs.existsSync(FILES.state)) {
      return { repos: {} };
    }
    return JSON.parse(fs.readFileSync(FILES.state, "utf8"));
  } catch (error) {
    logError("读取 state 失败，使用空状态", error);
    return { repos: {} };
  }
}

/**
 * 保存状态
 */
function saveState(nextState) {
  fs.writeFileSync(FILES.state, JSON.stringify(nextState, null, 2), "utf8");
}

/**
 * 构建下一个状态
 */
function buildNextState(rows, docId, stats, stateCache) {
  const repoMap = {};
  for (const row of rows) {
    repoMap[row.id] = {
      id: row.id,
      fullName: row.fullName,
      tags: row.tags,
      technologies: row.technologies,
      aiFingerprint: row.aiFingerprint,
      updatedAt: row.updatedAt,
    };
  }

  return {
    ...stateCache,
    repos: repoMap,
    siyuanDocId: docId || stateCache?.siyuanDocId || null,
    lastSync: new Date().toISOString(),
    stats,
  };
}

module.exports = {
  loadState,
  saveState,
  buildNextState,
};

