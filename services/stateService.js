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
function buildNextState(rows, docId, stats, stateCache, aiEnabled) {
  const repoMap = {};
  for (const row of rows) {
    const repoData = {
      id: row.id,
      fullName: row.fullName,
      updatedAt: row.updatedAt,
    };

    // 永久保存 AI 相关数据，无论 AI 是否启用
    if (row.tags && row.technologies) {
      repoData.tags = row.tags;
      repoData.technologies = row.technologies;
      repoData.aiFingerprint = row.aiFingerprint;
    } else if (stateCache?.repos?.[row.id]?.tags) {
      // 如果当前没有 AI 数据，但历史有，则保留历史数据
      repoData.tags = stateCache.repos[row.id].tags;
      repoData.technologies = stateCache.repos[row.id].technologies;
      repoData.aiFingerprint = stateCache.repos[row.id].aiFingerprint;
    }

    repoMap[row.id] = repoData;
  }

  return {
    ...stateCache,
    repos: repoMap,
    siyuanDocId: docId || stateCache?.siyuanDocId || null,
    lastSync: new Date().toISOString(),
    stats,
    aiEnabled, // 记录当前 AI 状态
  };
}

module.exports = {
  loadState,
  saveState,
  buildNextState,
};
