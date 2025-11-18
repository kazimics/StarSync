const { escapeTable, formatDate } = require("../utils/helpers");

/**
 * 构建 Markdown 表格
 */
function buildMarkdownTable(rows) {
  const header =
    "| 仓库 | 简介 | 主题 | 标签 | 使用技术 | 更新时间 | 归档 |\n" +
    "| --- | --- | --- | --- | --- | --- | --- |\n";

  const body = rows
    .map((row) => {
      const nameCell = `[${escapeTable(row.name)}](${row.url})`;
      const desc = row.description
        ? escapeTable(row.description)
        : "（无简介）";
      const topicsCell = row.topics.length
        ? row.topics.map((topic) => `#${topic}#`).join(" ")
        : "—";
      const tagCell = row.tags.length
        ? row.tags.map((tag) => `#${tag}#`).join(" ")
        : "—";
      const techCell = row.technologies.length
        ? row.technologies.join(" · ")
        : row.language;
      const updated = formatDate(row.updatedAt);
      const archived = row.archived ? "是" : "否";

      return `| ${nameCell} | ${desc} | ${escapeTable(
        topicsCell
      )} | ${escapeTable(tagCell)} | ${escapeTable(
        techCell
      )} | ${updated} | ${archived} |`;
    })
    .join("\n");

  const metadata = `> 最后同步：${formatDate(
    new Date().toISOString()
  )}（自动生成）\n\n`;
  return `${metadata}${header}${body}\n`;
}

module.exports = {
  buildMarkdownTable,
};
