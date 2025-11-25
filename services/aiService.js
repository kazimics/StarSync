const openai = require("../clients/openaiClient");
const { CONFIG } = require("../config");
const {
  sanitizeStringList,
  chunk,
  wait,
  logError,
} = require("../utils/helpers");
const { defaultTags, defaultTechnologies } = require("../utils/repoUtils");

/**
 * 检查 AI 是否可用
 */
function isAIAvailable() {
  return CONFIG.enableAI && CONFIG.openaiKey && CONFIG.openaiKey.trim() !== "";
}

/**
 * 调用 AI 生成元数据（标签和技术栈）
 */
async function callAIForMetadata(batch) {
  const payloadRepos = batch
    .filter((repo) => repo && repo.id) // 过滤掉无效的仓库数据
    .map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.fullName,
      description: repo.description,
      language: repo.language,
      topics: repo.topics,
      archived: repo.archived,
    }));

  const systemPrompt =
    "你是资深开发者关系工程师，请为 GitHub 仓库生成中文标签与技术栈摘要，用于本地知识库搜索。";

  const userPrompt = [
    "下面是一批 GitHub 仓库，请返回 JSON 数组，数组项格式：",
    '{ "id": "仓库ID字符串", "tags": ["标签A","标签B"], "technologies": ["技术A","技术B"] }',
    "约束：",
    "1) 标签不超过 4 个，突出业务领域；",
    "2) 技术字段不超过 5 个，突出核心技术栈；",
    "3) 若信息不足，可结合语言与描述合理推断；",
    "4) 仅输出 JSON，不要添加注释或自然语言。",
    "",
    JSON.stringify(payloadRepos, null, 2),
  ].join("\n");

  try {
    const { data } = await openai.post("/chat/completions", {
      model: CONFIG.openaiModel,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const raw = data.choices?.[0]?.message?.content || "[]";
    const clean = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      id: item.id?.toString(),
      tags: sanitizeStringList(item.tags),
      technologies: sanitizeStringList(item.technologies),
    }));
  } catch (error) {
    logError("调用大模型失败，使用降级结果", error);
    return batch.map((repo) => ({
      id: repo.id,
      tags: defaultTags(repo),
      technologies: defaultTechnologies(repo),
    }));
  }
}

/**
 * 丰富仓库数据（添加 AI 生成的标签和技术栈）
 */
async function enrichRepos(repos, stateCache) {
  const prevMap = stateCache.repos || {};

  // 如果 AI 不可用或禁用，只使用历史数据，不调用 AI
  if (!isAIAvailable()) {
    console.log("📝 AI 已禁用，使用历史智能标签");
    const enriched = repos.map((repo) => {
      const previous = prevMap[repo.id];

      return {
        ...repo,
        tags: previous?.tags || [],
        technologies: previous?.technologies || [],
        aiFingerprint: previous?.aiFingerprint,
      };
    });

    // 计算新增和移除的仓库数量
    const prevIds = new Set(Object.keys(prevMap));
    const currentIds = new Set(enriched.map((r) => r.id));

    const stats = {
      added: enriched.filter((r) => !prevIds.has(r.id)).length,
      removed: Array.from(prevIds).filter((id) => !currentIds.has(id)).length,
      aiUpdated: 0,
    };

    return { enriched, stats };
  }

  // AI 可用，检查是否需要重新生成数据
  const enriched = repos.map((repo) => {
    const previous = prevMap[repo.id];

    // 检查是否需要重新生成 AI 数据
    const needsAI = shouldRegenerateAI(previous, repo);

    if (needsAI) {
      return { ...repo, needsAI: true };
    }

    // 使用历史 AI 数据
    return {
      ...repo,
      tags: previous?.tags || [],
      technologies: previous?.technologies || [],
      aiFingerprint: previous?.aiFingerprint,
    };
  });

  // 只处理需要 AI 生成的仓库
  const pending = enriched.filter((repo) => repo.needsAI);
  let aiUpdated = 0;

  if (pending.length > 0) {
    console.log(`🤖 AI 模式：需要处理 ${pending.length} 个仓库`);

    const { buildFingerprint } = require("../utils/helpers");
    const batches = chunk(pending, 20);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      console.log(
        `   ⏳ 正在处理第 ${i + 1}/${batches.length} 批，仓库 ${i * 20 + 1}-${
          i * 20 + batch.length
        }`
      );

      const aiResult = await callAIForMetadata(batch);
      for (const meta of aiResult) {
        const target = enriched.find((r) => r.id === meta.id);
        if (!target) continue;
        target.tags = sanitizeStringList(meta.tags);
        target.technologies = sanitizeStringList(meta.technologies);
        target.aiFingerprint = buildFingerprint(target);
        aiUpdated += 1;
      }

      console.log(
        `   ✅ 第 ${i + 1}/${
          batches.length
        } 批完成，累计 AI 更新 ${aiUpdated} 条`
      );
      await wait(400);
    }
  }

  const prevIds = new Set(Object.keys(prevMap));
  const currentIds = new Set(enriched.map((r) => r.id));

  const stats = {
    added: enriched.filter((r) => !prevIds.has(r.id)).length,
    removed: Array.from(prevIds).filter((id) => !currentIds.has(id)).length,
    aiUpdated,
  };

  return { enriched, stats };
}

/**
 * 检查是否需要重新生成 AI 数据
 */
function shouldRegenerateAI(previous, current) {
  // 如果之前没有 AI 数据，需要生成
  if (!previous || !previous.tags || !previous.technologies) {
    return true;
  }

  // 如果当前没有原始数据，不需要生成
  if (!current) {
    return false;
  }

  // 检查数据指纹是否发生变化
  const { buildFingerprint } = require("../utils/helpers");
  const currentFingerprint = buildFingerprint(current);
  const previousFingerprint = previous.aiFingerprint;

  // 如果指纹不匹配，说明原始数据发生了变化，需要重新生成
  if (currentFingerprint !== previousFingerprint) {
    console.log(`   🔄 仓库 ${current.name} 数据发生变化，重新生成 AI 标签`);
    return true;
  }

  // 数据没有变化，不需要重新生成
  return false;
}

module.exports = {
  callAIForMetadata,
  enrichRepos,
};
