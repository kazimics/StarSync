const siyuan = require("../clients/siyuanClient");
const { CONFIG } = require("../config");
const { logError } = require("../utils/helpers");

/**
 * 向 SiYuan API 发送 POST 请求
 */
async function postToSiyuan(endpoint, payload) {
  if (!siyuan) {
    throw new Error("SiYuan 客户端未初始化");
  }
  const { data } = await siyuan.post(endpoint, payload);
  if (data.code !== 0) {
    throw new Error(data.msg || "SiYuan API 返回异常");
  }
  return data.data;
}

/**
 * 确保 SiYuan 文档存在
 */
async function ensureSiyuanDoc(markdown) {
  try {
    const existing = await postToSiyuan("/api/filetree/getIDsByHPath", {
      notebook: CONFIG.siyuan.notebookId,
      path: CONFIG.siyuan.docPath,
    });

    const docId = existing?.[0];
    if (docId) {
      await updateSiyuanDoc(docId, markdown);
      return docId;
    }

    const created = await postToSiyuan("/api/filetree/createDocWithMd", {
      notebook: CONFIG.siyuan.notebookId,
      path: CONFIG.siyuan.docPath,
      markdown,
    });

    console.log(
      `📓 已在 SiYuan 中创建文档 ${CONFIG.siyuan.docPath} (ID: ${created})`
    );
    return created;
  } catch (error) {
    throw new Error(`SiYuan 文档创建失败：${error.message}`);
  }
}

/**
 * 更新 SiYuan 文档
 */
async function updateSiyuanDoc(docId, markdown) {
  await postToSiyuan("/api/block/updateBlock", {
    id: docId,
    dataType: "markdown",
    data: markdown,
  });
  console.log(`🗂️  已更新 SiYuan 文档 (ID: ${docId})`);
}

/**
 * 同步 Markdown 到 SiYuan
 */
async function syncToSiYuan(markdown, stateCache) {
  if (!siyuan) {
    console.warn(
      "⚠️ 未配置 SiYuan API（SIYUAN_API_TOKEN / SIYUAN_NOTEBOOK_ID），已仅生成本地 Markdown。"
    );
    return stateCache?.siyuanDocId || null;
  }

  let docId = stateCache?.siyuanDocId;

  if (!docId) {
    docId = await ensureSiyuanDoc(markdown);
  } else {
    await updateSiyuanDoc(docId, markdown);
  }

  return docId;
}

module.exports = {
  syncToSiYuan,
  ensureSiyuanDoc,
  updateSiyuanDoc,
  postToSiyuan,
};

