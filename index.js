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
const { syncToLogseq } = require("./services/logseqService");
const {
  loadState,
  saveState,
  buildNextState,
} = require("./services/stateService");
const { buildMarkdownTable } = require("./formatters/markdownFormatter");
const { buildObsidianTable } = require("./formatters/obsidianFormatter");
const { buildLogseqBlocks } = require("./formatters/logseqFormatter");

let stateCache = loadState();
let isRunning = false;

function parseTargets(input) {
  const fallback = new Set(["siyuan"]);
  if (!input) {
    return fallback;
  }
  const normalized = String(input).toLowerCase().trim();
  if (!normalized) {
    return fallback;
  }
  if (normalized === "all") {
    return new Set(["siyuan", "obsidian", "logseq"]);
  }
  const targets = normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return targets.length ? new Set(targets) : fallback;
}

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

    // 2. 丰富仓库数据（AI 生成标签和技术栈，根据配置决定是否启用）
    const aiEnabled = CONFIG.enableAI;
    console.log(
      aiEnabled ? "🤖 AI 模式：启用智能标签生成" : "📝 基础模式：仅同步基础信息"
    );
    const { enriched, stats } = await enrichRepos(normalizedRepos, stateCache);

    // 3. 根据配置选择同步目标
    const targets = parseTargets(CONFIG.syncTarget);
    const shouldSyncSiYuan = targets.has("siyuan");
    const shouldSyncObsidian = targets.has("obsidian");
    const shouldSyncLogseq = targets.has("logseq");

    let docId = stateCache?.siyuanDocId || null;
    let obsidianPath = null;
    let logseqPath = null;

    // 4. 构建并同步到各平台 (独立进行，互不影响)
    if (shouldSyncSiYuan) {
      try {
        const markdown = buildMarkdownTable(enriched, aiEnabled);
        fs.writeFileSync(FILES.mdCache, markdown, "utf8");
        docId = await syncToSiYuan(markdown, stateCache);
        console.log("✅ SiYuan 同步成功");
      } catch (error) {
        logError("⚠️ SiYuan 同步失败，继续其他平台同步", error);
        docId = stateCache?.siyuanDocId || null; // 保持原有 docId
      }
    }

    if (shouldSyncObsidian) {
      try {
        const obsidianMarkdown = buildObsidianTable(enriched, aiEnabled);
        fs.writeFileSync(FILES.obsidianTable, obsidianMarkdown, "utf8");
        obsidianPath = await syncToObsidian(obsidianMarkdown, stateCache);
        console.log("✅ Obsidian 同步成功");
      } catch (error) {
        logError("⚠️ Obsidian 同步失败，继续其他平台同步", error);
        obsidianPath = null;
      }
    }

    if (shouldSyncLogseq) {
      try {
        const logseqBlocks = buildLogseqBlocks(enriched, aiEnabled);
        fs.writeFileSync(FILES.logseqBlocks, logseqBlocks, "utf8");
        logseqPath = await syncToLogseq(logseqBlocks);
        console.log("✅ Logseq 同步成功");
      } catch (error) {
        logError("⚠️ Logseq 同步失败，继续其他平台同步", error);
        logseqPath = null;
      }
    }

    // 6. 保存状态
    const nextState = buildNextState(
      enriched,
      docId,
      stats,
      stateCache,
      aiEnabled
    );
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
