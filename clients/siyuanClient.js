const axios = require("axios");
const { CONFIG } = require("../config");

const siyuan =
  CONFIG.siyuan.token && CONFIG.siyuan.notebookId
    ? axios.create({
        baseURL: CONFIG.siyuan.apiUrl,
        headers: {
          Authorization: `Token ${CONFIG.siyuan.token}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      })
    : null;

module.exports = siyuan;

