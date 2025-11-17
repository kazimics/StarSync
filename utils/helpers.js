const crypto = require("crypto");

/**
 * 数组分块
 */
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * 等待指定毫秒数
 */
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 构建仓库指纹（用于检测变更）
 */
function buildFingerprint(repo) {
  const content = [
    repo.fullName,
    repo.description,
    repo.language,
    repo.topics.join("|"),
    repo.archived,
  ].join("::");

  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * 清理字符串数组
 */
function sanitizeStringList(list, fallback = []) {
  if (!Array.isArray(list)) return fallback;
  const cleaned = list.map((item) => String(item || "").trim()).filter(Boolean);
  return cleaned.length ? Array.from(new Set(cleaned)) : fallback;
}

/**
 * 判断是否为同一天
 */
function isSameDay(timestamp, timezone = "Asia/Shanghai") {
  try {
    const formatter = new Intl.DateTimeFormat("zh-CN", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const target = formatter.format(new Date(timestamp));
    const today = formatter.format(new Date());
    return target === today;
  } catch (error) {
    // 如果时区不受支持，退回 UTC 日期比较
    const target = new Date(timestamp).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    return target === today;
  }
}

/**
 * 格式化日期
 */
function formatDate(input) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return date.toISOString().split("T")[0];
}

/**
 * 转义 Markdown 表格中的管道符
 */
function escapeTable(text) {
  return text.replace(/\|/g, "\\|");
}

/**
 * 日志错误
 */
function logError(label, error) {
  console.error(`\n❌ ${label}: ${error.message}`);
  if (error.response) {
    console.error(
      `HTTP ${error.response.status}:`,
      JSON.stringify(error.response.data, null, 2)
    );
  } else if (error.stack) {
    console.error(error.stack);
  }
}

module.exports = {
  chunk,
  wait,
  buildFingerprint,
  sanitizeStringList,
  isSameDay,
  formatDate,
  escapeTable,
  logError,
};

