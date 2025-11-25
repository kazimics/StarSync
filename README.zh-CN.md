# GitHub 星标仓库同步工具

一个自动化工具，用于将 GitHub 已星标的仓库同步到知识库系统（支持思源笔记、Obsidian 和 Logseq），并使用 AI 为每个仓库生成中文标签和技术栈信息。

## ✨ 功能特性

- 🔄 **自动同步**：自动从 GitHub 获取所有已星标的仓库
- 🤖 **AI 标签生成**：使用 OpenAI API 为仓库生成中文标签和技术栈摘要（可选，可禁用）
- 📊 **Markdown 表格**：生成格式化的 Markdown 表格，包含仓库信息、标签和技术栈
- 📝 **知识库同步**：自动将生成的表格同步到知识库系统（思源笔记、Obsidian）
- 🧩 **Logseq 块导出**：为 Logseq 生成每仓库一个块，保持可检索可编辑
- 💾 **状态管理**：保存同步状态，支持增量更新
- 🚀 **智能缓存**：仅更新变更的仓库，减少 AI API 调用
- 🏷️ **标签格式**：生成知识库原生标签格式（思源笔记：`#标签名#`，Obsidian：`#标签名`）
- ⚙️ **可配置目标**：通过配置选择同步目标（思源笔记、Obsidian 或两者）

## 📁 项目结构

```
OrganizeRepositories/
├── config/              # 配置管理
│   └── index.js        # 环境变量配置、文件路径配置
├── clients/            # API 客户端
│   ├── githubClient.js # GitHub API 客户端
│   ├── openaiClient.js # OpenAI API 客户端
│   └── siyuanClient.js # SiYuan API 客户端
├── services/           # 业务逻辑服务
│   ├── githubService.js # GitHub 仓库获取和规范化
│   ├── aiService.js     # AI 元数据生成
│   ├── siyuanService.js # SiYuan 同步服务
│   ├── obsidianService.js # Obsidian 同步服务
│   └── stateService.js  # 状态管理服务
├── utils/              # 工具函数
│   ├── helpers.js      # 通用工具函数
│   └── repoUtils.js    # 仓库相关工具函数
├── formatters/         # 格式化模块
│   ├── markdownFormatter.js # SiYuan 格式 Markdown 表格生成
│   └── obsidianFormatter.js # Obsidian 格式 Markdown 表格生成
├── index.js            # 入口文件（主流程控制）
├── package.json        # 项目依赖
└── README.md           # 项目说明文档
```

## 🚀 快速开始

### 前置要求

- Node.js >= 14.0.0
- GitHub Personal Access Token
- OpenAI API Key（或兼容的 API）
- 思源笔记或 Obsidian（可选，如需同步到知识库）

### 安装

1. 克隆仓库
```bash
git clone <repository-url>
cd OrganizeRepositories
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量

创建 `.env` 文件，添加以下配置：

```env
# GitHub 配置（必需）
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your_username

# OpenAI 配置（启用 AI 时必需）
ENABLE_AI=true
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1

# 同步目标配置（可选）
# 选项: siyuan | obsidian | logseq | all | 逗号分隔组合（默认: siyuan）
SYNC_TARGET=siyuan

# 思源笔记配置（可选）
SIYUAN_API_URL=http://127.0.0.1:6806
SIYUAN_API_TOKEN=your_siyuan_token
SIYUAN_NOTEBOOK_ID=your_notebook_id
SIYUAN_DOC_PATH=/GitHub/Stars

# Obsidian 配置（可选）
OBSIDIAN_VAULT_PATH=C:/Users/username/Documents/ObsidianVault
OBSIDIAN_FILE_PATH=GitHub/Stars.md

# Logseq 配置（可选）
LOGSEQ_GRAPH_PATH=D:/Documents/Logseq
LOGSEQ_PAGE_PATH=pages/github-stars.md

# 其他配置（可选）
SYNC_TZ=Asia/Shanghai
FORCE_SYNC=false
```

### 获取 GitHub Token

1. 访问 [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token (classic)"
3. 勾选 `public_repo` 和 `read:user` 权限
4. 生成并复制 token

### 禁用 AI 功能

要禁用 AI 功能（标签生成和技术栈分析），在 `.env` 文件中设置 `ENABLE_AI=false`：

```env
ENABLE_AI=false
```

禁用 AI 后：
- 不需要 OpenAI API Key
- 标签和技术栈列将为空或仅包含 GitHub topics
- 同步过程会更快，因为不会调用 AI
- 工具仍会获取和整理你的星标仓库

### 获取 OpenAI API Key

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 创建账户并获取 API Key
3. 或将 `OPENAI_BASE_URL` 设置为兼容的 API 端点

### 配置思源笔记（可选）

1. 启动思源笔记
2. 在设置中启用 API 服务
3. 获取 API Token 和 Notebook ID
4. 配置文档路径（如 `/GitHub/Stars`）

### 配置 Obsidian（可选）

1. 在 `.env` 中设置 `SYNC_TARGET=obsidian` 或 `SYNC_TARGET=all`
2. 配置 `OBSIDIAN_VAULT_PATH` 为你的 Obsidian vault 目录路径
3. 配置 `OBSIDIAN_FILE_PATH`（可包含或不包含 `.md` 扩展名，缺失会自动添加）
4. 示例：
   ```env
   SYNC_TARGET=obsidian
   OBSIDIAN_VAULT_PATH="C:/Users/username/Documents/My Obsidian Vault"
   OBSIDIAN_FILE_PATH="GitHub/Stars"
   ```

### 配置 Logseq（可选）

1. 在 `SYNC_TARGET` 中加入 `logseq`（或 `all` / 包含 `logseq` 的逗号组合）
2. 将 `LOGSEQ_GRAPH_PATH` 指向 Logseq 图谱根目录（包含 `pages/`、`journals/` 等文件夹）
3. 设置 `LOGSEQ_PAGE_PATH` 为图谱内的页面路径（默认 `pages/github-stars.md`，缺失会自动补 `.md`）
4. 每个仓库会生成独立块及属性（`repo::`、`tags::`、`tech::` 等），从而避免 “Large block” 限制并保持可搜索性

### 运行

```bash
# 正常同步（一天内只会执行一次）
node index.js

# 强制同步（忽略一天限制）
node index.js --force
```

## 📖 使用说明

### 同步流程

1. **获取仓库**：从 GitHub API 获取所有已星标的仓库
2. **规范化数据**：将原始数据转换为统一格式
3. **AI 增强**：
   - 检查仓库是否有变更（使用指纹机制）
   - 为变更的仓库调用 AI 生成中文标签和技术栈
   - 使用缓存数据更新未变更的仓库
4. **生成表格**：将数据格式化为 Markdown 表格（格式取决于同步目标）
5. **同步到知识库**：将表格同步到配置的知识库系统

### 生成的文件

- `starred_repos.json`：原始仓库数据
- `starred_state.json`：同步状态（包含仓库元数据）
- `siyuan_table.md`：生成的 Markdown 表格（思源笔记格式，如果启用了思源笔记同步）
- `obsidian_table.md`：生成的 Markdown 表格（Obsidian 格式，如果启用了 Obsidian 同步）

### 表格格式

生成的表格包含以下列：

| 列名 | 说明 |
|------|------|
| 仓库 | 仓库名称（链接） |
| 简介 | 仓库描述 |
| 主题 | 原生 GitHub topics（思源笔记：`#topic1# #topic2#`，Obsidian：`#topic1 #topic2`） |
| 标签 | AI 生成的中文标签（思源笔记：`#标签名#`，Obsidian：`#标签名`） |
| 使用技术 | 技术栈摘要 |
| 更新时间 | 仓库最后更新时间 |
| 归档 | 是否已归档 |

### 示例输出

```
> 最后同步：2025-11-17（自动生成）

| 仓库 | 简介 | 主题 | 标签 | 使用技术 | 更新时间 | 归档 |
| --- | --- | --- | --- | --- | --- | --- |
| [Pake](https://github.com/tw93/Pake) | 一键打包网页生成轻量桌面应用 | #desktop# #app# #web# | #桌面应用# #网页打包# #跨平台# | Rust · Tauri | 2025-11-17 | 否 |
```

### Logseq 块格式

当 `SYNC_TARGET` 包含 `logseq` 时，脚本会在 Logseq 图谱中写入普通 Markdown 页面，每个仓库对应一个块：

```
- [[owner/repo]] ([GitHub](https://github.com/owner/repo))
  repo:: https://github.com/owner/repo
  desc:: 仓库简介……
  tags:: #[[AI]] #[[工具]]
  tech:: Rust · Tauri
  language:: Rust
  updated:: 2025-11-18
  archived:: No
```

这种结构避免了单个巨大表格，完整保留搜索与属性查询能力。

## 🔧 配置说明

### 环境变量

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `GITHUB_TOKEN` | ✅ | - | GitHub Personal Access Token |
| `GITHUB_USERNAME` | ✅ | - | GitHub 用户名 |
| `ENABLE_AI` | ❌ | `true` | 启用 AI 功能（标签生成、技术栈分析） |
| `OPENAI_API_KEY` | ✅ (启用 AI 时) | - | OpenAI API Key |
| `OPENAI_MODEL` | ❌ | `gpt-4o-mini` | OpenAI 模型名称 |
| `OPENAI_BASE_URL` | ❌ | `https://api.openai.com/v1` | OpenAI API 端点 |
| `SIYUAN_API_URL` | ❌ | `http://127.0.0.1:6806` | 思源笔记 API 地址 |
| `SIYUAN_API_TOKEN` | ❌ | - | 思源笔记 API Token |
| `SIYUAN_NOTEBOOK_ID` | ❌ | - | 思源笔记笔记本 ID |
| `SIYUAN_DOC_PATH` | ❌ | `/GitHub/Stars` | 思源笔记文档路径 |
| `SYNC_TARGET` | ❌ | `siyuan` | 同步目标：`siyuan` \| `obsidian` \| `logseq` \|`all` \| 逗号分隔组合 |
| `OBSIDIAN_VAULT_PATH` | ❌ | - | Obsidian vault 目录路径 |
| `OBSIDIAN_FILE_PATH` | ❌ | `GitHub/Stars.md` | vault 内的文件路径（缺失 .md 扩展名会自动添加） |
| `LOGSEQ_GRAPH_PATH` | ❌ | - | Logseq 图谱根目录（包含 `pages/`） |
| `LOGSEQ_PAGE_PATH` | ❌ | `pages/github-stars.md` | 图谱内的页面路径（缺失 `.md` 会自动补全） |
| `SYNC_TZ` | ❌ | `Asia/Shanghai` | 时区设置 |
| `FORCE_SYNC` | ❌ | `false` | 强制同步标志 |

### 命令行参数

- `--force`：强制同步，忽略一天内只能同步一次的限制

## 🛠️ 开发

### 项目架构

项目采用模块化设计，各模块职责清晰：

- **config/**：配置管理
- **clients/**：外部 API 客户端封装
- **services/**：业务逻辑服务
- **utils/**：通用工具函数
- **formatters/**：格式化输出模块

### 添加新功能

1. 在对应的模块目录下创建新文件
2. 导出需要的函数
3. 在 `index.js` 中引入并使用

### 调试

```bash
# 查看同步日志
node index.js

# 强制同步并查看详细日志
FORCE_SYNC=true node index.js --force
```

## 📋 TODO / 开发计划

### 计划中的功能

- [x] **Obsidian 同步支持** ✅

- [x] **Logseq 同步支持** ✅

- [ ] **Notion 同步支持**

- [ ] **文档与测试**
  - [ ] 添加单元测试
  - [ ] 添加集成测试
  - [ ] 完善文档和使用示例
  - [ ] 添加故障排除指南

## 📝 常见问题

### Q: 同步失败怎么办？

A: 检查以下内容：
1. 网络连接是否正常
2. API Token 是否有效
3. 环境变量配置是否正确
4. 查看控制台错误信息

### Q: AI 生成标签不准确？

A: 可以：
1. 调整 `OPENAI_MODEL` 使用更强的模型
2. 修改 `services/aiService.js` 中的 prompt
3. 手动编辑 `starred_state.json` 中的标签

### Q: 如何只更新部分仓库？

A: 删除 `starred_state.json` 中对应仓库的记录，重新运行同步即可。

### Q: 思源笔记同步失败？

A: 确认：
1. 思源笔记是否已启动
2. API 服务是否已启用
3. Token 和 Notebook ID 是否正确
4. 文档路径是否存在或可创建

### Q: Obsidian 同步失败？

A: 检查以下内容：
1. `OBSIDIAN_VAULT_PATH` 是否正确配置？（如果路径包含空格，请使用引号）
2. vault 路径是否存在且可写？
3. `OBSIDIAN_FILE_PATH` 是否正确配置？（`.md` 扩展名会自动添加）
4. 查看控制台错误信息获取详细信息

## 📄 许可证

GNU Affero General Public License v3.0，完整条款见 `GNU-AGPL-3.0.txt`。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请提交 Issue。
