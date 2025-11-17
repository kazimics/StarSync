require("dotenv").config();
const path = require("path");

function assertEnv(value, name) {
  if (!value) {
    console.error(`❌ 缺少 ${name}，请在 .env 中配置`);
    process.exit(1);
  }
}

const CONFIG = {
  githubToken: process.env.GITHUB_TOKEN,
  githubUsername: process.env.GITHUB_USERNAME,
  openaiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  openaiBaseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  timezone: process.env.SYNC_TZ || "Asia/Shanghai",
  siyuan: {
    apiUrl: process.env.SIYUAN_API_URL || "http://127.0.0.1:6806",
    token: process.env.SIYUAN_API_TOKEN,
    notebookId: process.env.SIYUAN_NOTEBOOK_ID,
    docPath: process.env.SIYUAN_DOC_PATH || "/GitHub/Stars",
  },
};

// 规范化 docPath
if (
  CONFIG.siyuan.docPath &&
  typeof CONFIG.siyuan.docPath === "string" &&
  !CONFIG.siyuan.docPath.startsWith("/")
) {
  CONFIG.siyuan.docPath = `/${CONFIG.siyuan.docPath}`;
}

const FILES = {
  rawStarred: path.resolve(__dirname, "..", "starred_repos.json"),
  state: path.resolve(__dirname, "..", "starred_state.json"),
  mdCache: path.resolve(__dirname, "..", "siyuan_table.md"),
};

// 验证必需的环境变量
assertEnv(CONFIG.githubToken, "GITHUB_TOKEN");
assertEnv(CONFIG.githubUsername, "GITHUB_USERNAME");
assertEnv(CONFIG.openaiKey, "OPENAI_API_KEY");

const FORCE_SYNC =
  process.argv.includes("--force") || process.env.FORCE_SYNC === "true";

module.exports = {
  CONFIG,
  FILES,
  FORCE_SYNC,
  assertEnv,
};

