const fs = require("fs");
const { CONFIG, FILES, FORCE_SYNC } = require("./config");
const { isSameDay, logError } = require("./utils/helpers");
const {
  fetchStarredRepos,
  normalizeRepos,
} = require("./services/githubService");
const { enrichRepos } = require("./services/aiService");
const { syncToSiYuan } = require("./services/siyuanService");
const { syncToObsidian } = require("./services/obsidianService");
const {
  loadState,
  saveState,
  buildNextState,
} = require("./services/stateService");
const { buildMarkdownTable } = require("./formatters/markdownFormatter");
const { buildObsidianTable } = require("./formatters/obsidianFormatter");

let stateCache = loadState();
let isRunning = false;

/**
 * 主函数
 */
async function main() {
  try {
    await runCycle({ force: FORCE_SYNC });
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

/**
 * 运行同步周期
 */
async function runCycle(options = {}) {
  const force = !!options.force;

  if (isRunning) {
    console.warn("⚠️ 上一次同步仍在进行，跳过本次触发");
    return;
  }

  if (
    !force &&
    stateCache.lastSync &&
    isSameDay(stateCache.lastSync, CONFIG.timezone)
  ) {
    console.log("✅ 今日已同步，跳过本次执行。使用 --force 可强制刷新。");
    return false;
  }

  isRunning = true;
  console.log(`\n🚀 ${new Date().toISOString()} 开始同步 GitHub ⭐ 列表...`);
  const start = Date.now();

  try {
    // 1. 获取并规范化仓库数据
    const rawRepos = await fetchStarredRepos();
    const normalizedRepos = normalizeRepos(rawRepos);

    // 2. 丰富仓库数据（AI 生成标签和技术栈）
    const { enriched, stats } = await enrichRepos(normalizedRepos, stateCache);

    // 3. 根据配置选择同步目标
    const syncTarget = CONFIG.syncTarget.toLowerCase();
    const shouldSyncSiYuan = syncTarget === "siyuan" || syncTarget === "both";
    const shouldSyncObsidian =
      syncTarget === "obsidian" || syncTarget === "both";

    let docId = stateCache?.siyuanDocId || null;
    let obsidianPath = null;

    // 4. 构建并同步到 SiYuan (如果启用)
    if (shouldSyncSiYuan) {
      const markdown = buildMarkdownTable(enriched);
      fs.writeFileSync(FILES.mdCache, markdown, "utf8");
      docId = await syncToSiYuan(markdown, stateCache);
    }

    // 5. 构建并同步到 Obsidian (如果启用)
    if (shouldSyncObsidian) {
      const obsidianMarkdown = buildObsidianTable(enriched);
      fs.writeFileSync(FILES.obsidianTable, obsidianMarkdown, "utf8");
      obsidianPath = await syncToObsidian(obsidianMarkdown, stateCache);
    }

    // 6. 保存状态
    const nextState = buildNextState(enriched, docId, stats, stateCache);
    saveState(nextState);
    stateCache = nextState;

    console.log(
      `✅ 同步完成：总计 ${enriched.length} 个仓库，新增 ${stats.added}，移除 ${
        stats.removed
      }，AI 更新 ${stats.aiUpdated}，耗时 ${Math.round(
        (Date.now() - start) / 1000
      )} 秒`
    );
    return true;
  } catch (error) {
    logError("同步失败", error);
    throw error;
  } finally {
    isRunning = false;
  }
}

main();
