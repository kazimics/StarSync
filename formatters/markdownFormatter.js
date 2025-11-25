const { escapeTable, formatDate } = require("../utils/helpers");

/**
 * 构建 Markdown 表格
 */
function buildMarkdownTable(rows, aiEnabled = true) {
  // 检查是否有任何仓库包含 AI 生成的数据（包括历史数据）
  const hasAnyAIData = rows.some(
    (row) =>
      (row.tags && Array.isArray(row.tags) && row.tags.length > 0) ||
      (row.technologies &&
        Array.isArray(row.technologies) &&
        row.technologies.length > 0)
  );

  // 始终显示完整表格，但根据 AI 状态调整新项目的显示方式
  const header =
    "| 仓库 | 简介 | 主题 | 标签 | 使用技术 | 更新时间 | 归档 |\n" +
    "| --- | --- | --- | --- | --- | --- | --- |\n";

  const body = rows
    .map((row) => {
      const nameCell = `[${escapeTable(row.name)}](${row.url})`;
      const desc = row.description
        ? escapeTable(row.description)
        : "（无简介）";
      const topicsCell = (row.topics || []).length
        ? (row.topics || []).map((topic) => `#${topic}#`).join(" ")
        : "—";

      // 根据是否有历史 AI 数据决定显示内容
      const hasHistoricalData =
        (row.tags && Array.isArray(row.tags) && row.tags.length > 0) ||
        (row.technologies &&
          Array.isArray(row.technologies) &&
          row.technologies.length > 0);

      let tagCell, techCell;

      if (hasHistoricalData) {
        // 有历史 AI 数据，显示历史数据
        tagCell =
          row.tags && row.tags.length
            ? row.tags.map((tag) => `#${tag}#`).join(" ")
            : "—";
        techCell =
          row.technologies && row.technologies.length
            ? row.technologies.join(" · ")
            : row.language;
      } else {
        // 没有历史 AI 数据，根据 AI 状态决定显示内容
        if (aiEnabled) {
          // AI 开启时显示占位符
          tagCell = "—";
          techCell = row.language;
        } else {
          // AI 关闭时显示空，表示需要 AI 生成
          tagCell = "";
          techCell = "";
        }
      }

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
