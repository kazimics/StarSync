const { formatDate } = require("../utils/helpers");

function sanitize(text) {
  return (text || "").replace(/\r?\n/g, " ").trim();
}

function formatTags(tags = []) {
  if (!(tags && Array.isArray(tags)) || !tags.length) return "";
  return tags.map((tag) => `#[[${tag}]]`).join(" ");
}

function formatTechnologies(row) {
  if (Array.isArray(row.technologies) && row.technologies.length > 0) {
    return row.technologies.join(" · ");
  }
  return row.language || "未标注";
}

function buildLogseqBlock(row, aiEnabled = true) {
  const headerParts = [`[[${row.fullName}]]`];
  if (row.url) {
    headerParts.push(`([GitHub](${row.url}))`);
  }

  const lines = [
    `- ${headerParts.join(" ")}`,
    `  repo:: ${row.url || ""}`,
    `  desc:: ${sanitize(row.description) || "（无简介）"}`,
    `  topics:: ${
      row.topics && Array.isArray(row.topics) && row.topics.length
        ? row.topics.map((topic) => `[[${topic}]]`).join(" ")
        : "—"
    }`,
  ];

  // 检查是否有历史 AI 数据
  const hasHistoricalAIData =
    (row.tags && row.tags.length > 0) ||
    (row.technologies && row.technologies.length > 0);

  // 如果启用 AI 或有历史 AI 数据，显示标签
  if ((aiEnabled || hasHistoricalAIData) && row.tags && row.tags.length > 0) {
    lines.push(`  tags:: ${formatTags(row.tags) || "—"}`);
  }

  // 如果启用 AI，显示 AI 技术栈；如果有历史数据，显示历史技术栈；否则显示语言
  if (aiEnabled || hasHistoricalAIData) {
    if (row.technologies && row.technologies.length > 0) {
      lines.push(`  tech:: ${formatTechnologies(row)}`);
    } else {
      lines.push(`  tech:: ${row.language || "未标注"}`);
    }
  } else {
    // 完全没有 AI 数据时，只显示语言信息
    lines.push(`  tech:: ${row.language || "未标注"}`);
  }

  lines.push(`  updated:: ${formatDate(row.updatedAt)}`);
  lines.push(`  archived:: ${row.archived ? "Yes" : "No"}`);

  return lines.join("\n");
}

function buildLogseqBlocks(rows, aiEnabled = true) {
  const header = `- Last synced:: ${formatDate(new Date().toISOString())}\n`;
  const body = rows.map((row) => buildLogseqBlock(row, aiEnabled)).join("\n\n");
  return `${header}\n${body}\n`;
}

module.exports = {
  buildLogseqBlocks,
};
