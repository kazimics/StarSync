const fs = require("fs");
const path = require("path");
const { CONFIG } = require("../config");
const { logError } = require("../utils/helpers");

function normalizePagePath(pagePath = "") {
  let normalized = pagePath.trim();
  if (!normalized) {
    normalized = "pages/github-stars.md";
  }
  if (!normalized.toLowerCase().endsWith(".md")) {
    normalized = `${normalized}.md`;
  }
  return normalized;
}

async function syncToLogseq(blocks) {
  const graphPath = CONFIG.logseq.graphPath;
  if (!graphPath) {
    console.warn(
      "⚠️ 未配置 LOGSEQ_GRAPH_PATH，已跳过 Logseq 同步（但生成了本地缓存）。"
    );
    return null;
  }

  try {
    const pagePath = normalizePagePath(CONFIG.logseq.pagePath);
    const fullPath = path.resolve(graphPath, pagePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 已创建 Logseq 目录: ${dir}`);
    }

    fs.writeFileSync(fullPath, blocks, "utf8");
    console.log(`📒 已同步到 Logseq: ${fullPath}`);
    return fullPath;
  } catch (error) {
    logError("Logseq 同步失败", error);
    return null;
  }
}

module.exports = {
  syncToLogseq,
};

