const fs = require("fs");
const github = require("../clients/githubClient");
const { FILES } = require("../config");
const { wait } = require("../utils/helpers");

/**
 * 获取所有已星标仓库
 */
async function fetchStarredRepos() {
  const perPage = 100;
  let page = 1;
  const repos = [];

  while (true) {
    const { data } = await github.get("/user/starred", {
      params: { per_page: perPage, page },
    });

    if (!Array.isArray(data) || data.length === 0) {
      break;
    }

    repos.push(...data);
    console.log(`   ➕ 已抓取 ${repos.length} 条 (第 ${page} 页)`);

    if (data.length < perPage || page >= 400) {
      break;
    }

    page += 1;
    await wait(350);
  }

  fs.writeFileSync(FILES.rawStarred, JSON.stringify(repos, null, 2), "utf8");
  return repos;
}

/**
 * 规范化仓库数据
 */
function normalizeRepos(repos) {
  return repos
    .map((entry, index) => {
      if (!entry) return null;
      const repo = entry.repo || entry;
      if (!repo || typeof repo !== "object" || repo.id == null) {
        console.warn(
          `⚠️ 跳过无法解析的仓库记录 (index=${index})：缺少 repo.id`
        );
        return null;
      }

      return {
        id: repo.id.toString(),
        name: repo.name || repo.full_name?.split("/")?.[1] || repo.id,
        fullName:
          repo.full_name || `${repo.owner?.login || "unknown"}/${repo.name}`,
        owner: repo.owner?.login,
        url: repo.html_url || `https://github.com/${repo.full_name}`,
        description: (repo.description || "").replace(/\s+/g, " ").trim(),
        language: repo.language || "未标注",
        topics: Array.isArray(repo.topics) ? repo.topics.slice(0, 12) : [],
        updatedAt:
          repo.updated_at || entry.starred_at || new Date().toISOString(),
        pushedAt: repo.pushed_at,
        archived: !!repo.archived,
        homepage: repo.homepage,
        license: repo.license?.spdx_id || repo.license?.name || "",
        stars: repo.stargazers_count,
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

module.exports = {
  fetchStarredRepos,
  normalizeRepos,
};

