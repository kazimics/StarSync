const fs = require("fs");
const path = require("path");
const { CONFIG, FILES } = require("../config");
const { logError } = require("../utils/helpers");

/**
 * 同步 Markdown 到 Obsidian (文件系统方式)
 */
async function syncToObsidianFileSystem(markdown) {
  const vaultPath = CONFIG.obsidian.vaultPath;
  const filePath = CONFIG.obsidian.filePath;

  if (!vaultPath) {
    console.warn(
      "⚠️ 未配置 Obsidian Vault 路径（OBSIDIAN_VAULT_PATH），已仅生成本地 Markdown。"
    );
    return null;
  }

  try {
    // 确保文件路径以 .md 结尾（如果没有则自动添加）
    let normalizedFilePath = filePath;
    if (!normalizedFilePath.toLowerCase().endsWith(".md")) {
      normalizedFilePath = `${normalizedFilePath}.md`;
    }

    // 解析完整路径
    const fullPath = path.resolve(vaultPath, normalizedFilePath);
    const dirPath = path.dirname(fullPath);

    // 确保目录存在
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 已创建目录: ${dirPath}`);
    }

    // 写入文件
    fs.writeFileSync(fullPath, markdown, "utf8");
    console.log(`📝 已同步到 Obsidian: ${fullPath}`);
    return fullPath;
  } catch (error) {
    throw new Error(`Obsidian 文件同步失败：${error.message}`);
  }
}

/**
 * 向 Obsidian API 发送请求 (未来 API 支持)
 */
async function postToObsidian(endpoint, payload) {
  // TODO: 实现 Obsidian API 支持（如果 Obsidian 提供官方 API）
  // 目前 Obsidian 没有官方 API，此函数为未来扩展预留
  throw new Error("Obsidian API 暂未实现，请使用文件系统方式");
}

/**
 * 同步 Markdown 到 Obsidian (API 方式)
 */
async function syncToObsidianAPI(markdown) {
  // TODO: 实现 Obsidian API 同步（如果 Obsidian 提供官方 API）
  // 目前 Obsidian 没有官方 API，此函数为未来扩展预留
  if (CONFIG.obsidian.apiUrl && CONFIG.obsidian.token) {
    throw new Error(
      "Obsidian API 暂未实现，请使用文件系统方式（OBSIDIAN_VAULT_PATH）"
    );
  }
  return null;
}

/**
 * 同步 Markdown 到 Obsidian
 */
async function syncToObsidian(markdown, stateCache) {
  try {
    // 优先尝试 API 方式（如果配置了）
    if (CONFIG.obsidian.apiUrl && CONFIG.obsidian.token) {
      try {
        return await syncToObsidianAPI(markdown);
      } catch (error) {
        console.warn(
          `⚠️ Obsidian API 同步失败，回退到文件系统方式: ${error.message}`
        );
      }
    }

    // 使用文件系统方式
    return await syncToObsidianFileSystem(markdown);
  } catch (error) {
    logError("Obsidian 同步失败", error);
    // 即使失败也继续，不影响其他同步目标
    return null;
  }
}

module.exports = {
  syncToObsidian,
  syncToObsidianFileSystem,
  syncToObsidianAPI,
  postToObsidian,
};
