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
 * 调用 AI 生成元数据（标签和技术栈）
 */
async function callAIForMetadata(batch) {
  const payloadRepos = batch.map((repo) => ({
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
  const pending = [];
  const { buildFingerprint } = require("../utils/helpers");

  const enriched = repos.map((repo) => {
    const fingerprint = buildFingerprint(repo);
    const previous = prevMap[repo.id];

    if (!previous || previous.aiFingerprint !== fingerprint) {
      pending.push({ repo, fingerprint });
    }

    return {
      ...repo,
      aiFingerprint: fingerprint,
      tags: previous?.tags || defaultTags(repo),
      technologies: previous?.technologies || defaultTechnologies(repo),
    };
  });

  let aiUpdated = 0;

  if (pending.length > 0) {
    console.log(`🤖 需要 AI 更新的仓库: ${pending.length}`);

    const batches = chunk(pending, 20);
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(
        `   ⏳ 正在处理第 ${i + 1}/${batches.length} 批，仓库 ${i * 20 + 1}-${
          i * 20 + batch.length
        }`
      );
      const aiResult = await callAIForMetadata(batch.map((b) => b.repo));
      for (const meta of aiResult) {
        const target = enriched.find((r) => r.id === meta.id);
        if (!target) continue;
        target.tags = sanitizeStringList(meta.tags, defaultTags(target));
        target.technologies = sanitizeStringList(
          meta.technologies,
          defaultTechnologies(target)
        );
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

module.exports = {
  callAIForMetadata,
  enrichRepos,
};

