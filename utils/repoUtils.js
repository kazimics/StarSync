/**
 * 生成默认标签
 */
function defaultTags(repo) {
  const tags = [repo.language].filter(Boolean);
  if (repo.topics.length) {
    tags.push(...repo.topics.slice(0, 2));
  }
  return Array.from(new Set(tags));
}

/**
 * 生成默认技术栈
 */
function defaultTechnologies(repo) {
  return Array.from(new Set([repo.language].filter(Boolean)));
}

module.exports = {
  defaultTags,
  defaultTechnologies,
};

