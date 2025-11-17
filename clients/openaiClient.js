const axios = require("axios");
const { CONFIG } = require("../config");

const openai = axios.create({
  baseURL: CONFIG.openaiBaseUrl,
  headers: {
    Authorization: `Bearer ${CONFIG.openaiKey}`,
    "Content-Type": "application/json",
  },
  timeout: 70000,
});

module.exports = openai;

