const axios = require("axios");
const { CONFIG } = require("../config");

const github = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `Bearer ${CONFIG.githubToken}`,
    Accept:
      "application/vnd.github+json, application/vnd.github.star+json, application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
  timeout: 30000,
});

module.exports = github;

