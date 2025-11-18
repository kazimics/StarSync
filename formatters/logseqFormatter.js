const { formatDate } = require("../utils/helpers");

function sanitize(text) {
  return (text || "").replace(/\r?\n/g, " ").trim();
}

function formatTags(tags = []) {
  if (!tags.length) return "";
  return tags.map((tag) => `#[[${tag}]]`).join(" ");
}

function formatTechnologies(row) {
  if (Array.isArray(row.technologies) && row.technologies.length > 0) {
    return row.technologies.join(" · ");
  }
  return row.language || "未标注";
}

function buildLogseqBlock(row) {
  const headerParts = [`[[${row.fullName}]]`];
  if (row.url) {
    headerParts.push(`([GitHub](${row.url}))`);
  }

  const lines = [
    `- ${headerParts.join(" ")}`,
    `  repo:: ${row.url || ""}`,
    `  desc:: ${sanitize(row.description) || "（无简介）"}`,
    `  tags:: ${formatTags(row.tags) || "—"}`,
    `  tech:: ${formatTechnologies(row)}`,
    `  updated:: ${formatDate(row.updatedAt)}`,
    `  archived:: ${row.archived ? "Yes" : "No"}`,
  ];

  if (row.language) {
    lines.splice(5, 0, `  language:: ${row.language}`);
  }

  if (row.topics?.length) {
    lines.push(`  topics:: ${row.topics.map((topic) => `[[${topic}]]`).join(" ")}`);
  }

  return lines.join("\n");
}

function buildLogseqBlocks(rows) {
  const header = `- Last synced:: ${formatDate(new Date().toISOString())}\n`;
  const body = rows.map((row) => buildLogseqBlock(row)).join("\n\n");
  return `${header}\n${body}\n`;
}

module.exports = {
  buildLogseqBlocks,
};

