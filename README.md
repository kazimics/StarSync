# GitHub Stars Sync Tool

An automated tool that synchronizes your GitHub starred repositories to knowledge base systems (supports SiYuan, Obsidian, and Logseq) and generates Chinese tags and tech stack summaries using AI.

**Language**: [中文简体](README.zh-CN.md) | English

## ✨ Features

- 🔄 **Auto Sync**: Automatically fetches all starred repositories from GitHub
- 🤖 **AI Tag Generation**: Uses OpenAI API to generate Chinese tags and tech stack summaries for repositories (optional, can be disabled)
- 📊 **Markdown Table**: Generates formatted Markdown tables with repository info, tags, and tech stacks
- 📝 **Knowledge Base Sync**: Automatically syncs generated tables to knowledge base systems (SiYuan, Obsidian)
- 🧩 **Logseq Blocks**: Exports each repository as a structured block tailored for Logseq
- 💾 **State Management**: Saves sync state for incremental updates
- 🚀 **Smart Caching**: Only updates changed repositories, reducing AI API calls
- 🏷️ **Tag Format**: Generates native tag format for knowledge bases (`#标签名#` for SiYuan, `#标签名` for Obsidian)
- ⚙️ **Configurable Targets**: Choose sync target (SiYuan, Obsidian, Logseq, or all) via configuration

## 📁 Project Structure

```
OrganizeRepositories/
├── config/              # Configuration management
│   └── index.js        # Environment variables and file paths
├── clients/            # API clients
│   ├── githubClient.js # GitHub API client
│   ├── openaiClient.js # OpenAI API client
│   └── siyuanClient.js # SiYuan API client
├── services/           # Business logic services
│   ├── githubService.js # GitHub repository fetching and normalization
│   ├── aiService.js     # AI metadata generation
│   ├── siyuanService.js # SiYuan sync service
│   ├── obsidianService.js # Obsidian sync service
│   └── stateService.js  # State management service
├── utils/              # Utility functions
│   ├── helpers.js      # Common utility functions
│   └── repoUtils.js    # Repository-related utilities
├── formatters/         # Formatting modules
│   ├── markdownFormatter.js # SiYuan format Markdown table generation
│   └── obsidianFormatter.js # Obsidian format Markdown table generation
├── index.js            # Entry point (main workflow control)
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 14.0.0
- GitHub Personal Access Token
- OpenAI API Key (or compatible API)
- SiYuan Note or Obsidian (optional, if you want to sync to knowledge bases)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd OrganizeRepositories
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables

Create a `.env` file with the following configuration:

```env
# GitHub Configuration (Required)
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your_username

# OpenAI Configuration (Required if AI enabled)
ENABLE_AI=true
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1

# Sync Target Configuration (Optional)
# Options: siyuan | obsidian | logseq | all | comma-separated combos (default: siyuan)
SYNC_TARGET=siyuan

# SiYuan Configuration (Optional)
SIYUAN_API_URL=http://127.0.0.1:6806
SIYUAN_API_TOKEN=your_siyuan_token
SIYUAN_NOTEBOOK_ID=your_notebook_id
SIYUAN_DOC_PATH=/GitHub/Stars

# Obsidian Configuration (Optional)
OBSIDIAN_VAULT_PATH=C:/Users/username/Documents/ObsidianVault
OBSIDIAN_FILE_PATH=GitHub/Stars.md

# Logseq Configuration (Optional)
LOGSEQ_GRAPH_PATH=D:/Documents/Logseq
LOGSEQ_PAGE_PATH=pages/github-stars.md

# Other Configuration (Optional)
SYNC_TZ=Asia/Shanghai
FORCE_SYNC=false
```

### Get GitHub Token

1. Visit [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Check `public_repo` and `read:user` permissions
4. Generate and copy the token

### Disable AI Features

To disable AI features (tag generation and tech stack analysis), set `ENABLE_AI=false` in your `.env` file:

```env
ENABLE_AI=false
```

When AI is disabled:
- No OpenAI API Key is required
- Tags and tech stack columns will be empty or contain only GitHub topics
- Sync process will be faster as no AI calls are made
- The tool will still fetch and organize your starred repositories

### Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get an API Key
3. Or set `OPENAI_BASE_URL` to a compatible API endpoint

### Configure SiYuan (Optional)

1. Start SiYuan Note
2. Enable API service in settings
3. Get API Token and Notebook ID
4. Configure document path (e.g., `/GitHub/Stars`)

### Configure Obsidian (Optional)

1. Set `SYNC_TARGET=obsidian` or `SYNC_TARGET=all` in `.env`
2. Configure `OBSIDIAN_VAULT_PATH` to your Obsidian vault directory
3. Configure `OBSIDIAN_FILE_PATH` (with or without `.md` extension, will auto-add if missing)
4. Example:
   ```env
   SYNC_TARGET=obsidian
   OBSIDIAN_VAULT_PATH="C:/Users/username/Documents/My Obsidian Vault"
   OBSIDIAN_FILE_PATH="GitHub/Stars"
   ```

### Configure Logseq (Optional)

1. Add `logseq` (or `all`, or a comma-separated combination including `logseq`) to `SYNC_TARGET`
2. Point `LOGSEQ_GRAPH_PATH` to the root folder of your Logseq graph (contains `pages/`, `journals/`, etc.)
3. Set `LOGSEQ_PAGE_PATH` to the relative page path (defaults to `pages/github-stars.md`, `.md` auto-added)
4. Each repository becomes its own block with Logseq properties (`repo::`, `tags::`, `tech::`, ...), enabling full-text search without huge tables

### Run

```bash
# Normal sync (executes once per day)
node index.js

# Force sync (ignore daily limit)
node index.js --force
```

## 📖 Usage

### Sync Workflow

1. **Fetch Repositories**: Gets all starred repositories from GitHub API
2. **Normalize Data**: Converts raw data to unified format
3. **AI Enhancement**:
   - Checks if repositories have changed (using fingerprint mechanism)
   - Calls AI to generate Chinese tags and tech stacks for changed repositories
   - Uses cached data for unchanged repositories
4. **Generate Table**: Formats data as Markdown table (format depends on sync target)
5. **Sync to Knowledge Base**: Syncs table to configured knowledge base system(s)

### Generated Files

- `starred_repos.json`: Raw repository data
- `starred_state.json`: Sync state (contains repository metadata)
- `siyuan_table.md`: Generated Markdown table (SiYuan format, if SiYuan sync enabled)
- `obsidian_table.md`: Generated Markdown table (Obsidian format, if Obsidian sync enabled)

### Table Format

The generated table contains the following columns:

| Column | Description |
|--------|-------------|
| Repository | Repository name (link) |
| Description | Repository description |
| Topics | Native GitHub topics (`#topic1# #topic2#` for SiYuan, `#topic1 #topic2` for Obsidian) |
| Tags | AI-generated Chinese tags (`#标签名#` for SiYuan, `#标签名` for Obsidian) |
| Technologies | Tech stack summary |
| Updated | Last update time |
| Archived | Whether archived |

### Example Output

```
> Last synced: 2025-11-17 (Auto-generated)

| Repository | Description | Topics | Tags | Technologies | Updated | Archived |
| --- | --- | --- | --- | --- | --- | --- |
| [Pake](https://github.com/tw93/Pake) | Turn any webpage into a desktop app with one command | #desktop# #app# #web# | #桌面应用# #网页打包# #跨平台# | Rust · Tauri | 2025-11-17 | No |
```

### Logseq Block Format

When `logseq` is included in `SYNC_TARGET`, the script writes a normal Markdown page inside your Logseq graph. Each repository is rendered as its own block:

```
- [[owner/repo]] ([GitHub](https://github.com/owner/repo))
  repo:: https://github.com/owner/repo
  desc:: Project description...
  tags:: #[[AI]] #[[工具]]
  tech:: Rust · Tauri
  language:: Rust
  updated:: 2025-11-18
  archived:: No
```

This structure keeps every entry searchable/editable in Logseq without triggering the “large block” warning.

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | ✅ | - | GitHub Personal Access Token |
| `GITHUB_USERNAME` | ✅ | - | GitHub username |
| `ENABLE_AI` | ❌ | `true` | Enable AI features (tag generation, tech stack analysis) |
| `OPENAI_API_KEY` | ✅ (if AI enabled) | - | OpenAI API Key |
| `OPENAI_MODEL` | ❌ | `gpt-4o-mini` | OpenAI model name |
| `OPENAI_BASE_URL` | ❌ | `https://api.openai.com/v1` | OpenAI API endpoint |
| `SIYUAN_API_URL` | ❌ | `http://127.0.0.1:6806` | SiYuan API address |
| `SIYUAN_API_TOKEN` | ❌ | - | SiYuan API Token |
| `SIYUAN_NOTEBOOK_ID` | ❌ | - | SiYuan notebook ID |
| `SIYUAN_DOC_PATH` | ❌ | `/GitHub/Stars` | SiYuan document path |
| `SYNC_TARGET` | ❌ | `siyuan` | `siyuan` \| `obsidian` \| `logseq` \| `all` \| comma-separated combos |
| `OBSIDIAN_VAULT_PATH` | ❌ | - | Obsidian vault directory path |
| `OBSIDIAN_FILE_PATH` | ❌ | `GitHub/Stars.md` | File path within vault (.md extension auto-added if missing) |
| `LOGSEQ_GRAPH_PATH` | ❌ | - | Logseq graph root folder (where `pages/` lives) |
| `LOGSEQ_PAGE_PATH` | ❌ | `pages/github-stars.md` | Relative page path inside the graph (.md auto-added if missing) |
| `SYNC_TZ` | ❌ | `Asia/Shanghai` | Timezone setting |
| `FORCE_SYNC` | ❌ | `false` | Force sync flag |

### Command Line Arguments

- `--force`: Force sync, ignoring the once-per-day limit

## 🛠️ Development

### Project Architecture

The project uses a modular design with clear responsibilities:

- **config/**: Configuration management
- **clients/**: External API client wrappers
- **services/**: Business logic services
- **utils/**: Common utility functions
- **formatters/**: Formatting output modules

### Adding New Features

1. Create a new file in the corresponding module directory
2. Export the required functions
3. Import and use in `index.js`

### Debugging

```bash
# View sync logs
node index.js

# Force sync and view detailed logs
FORCE_SYNC=true node index.js --force
```

## 📋 TODO / Roadmap

### Planned Features

- [x] **Obsidian Sync Support** ✅

- [x] **Logseq Sync Support** ✅

- [ ] **Notion Sync Support**

- [ ] **Documentation & Testing**
  - [ ] Add unit tests
  - [ ] Add integration tests
  - [ ] Improve documentation with examples
  - [ ] Add troubleshooting guide

## 📝 FAQ

### Q: What if sync fails?

A: Check the following:
1. Is the network connection working?
2. Are the API tokens valid?
3. Are the environment variables configured correctly?
4. Check console error messages

### Q: AI-generated tags are inaccurate?

A: You can:
1. Adjust `OPENAI_MODEL` to use a stronger model
2. Modify the prompt in `services/aiService.js`
3. Manually edit tags in `starred_state.json`

### Q: How to update only some repositories?

A: Delete the corresponding repository records in `starred_state.json` and run sync again.

### Q: SiYuan sync failed?

A: Confirm:
1. Is SiYuan Note running?
2. Is API service enabled?
3. Are the Token and Notebook ID correct?
4. Does the document path exist or can it be created?

### Q: Obsidian sync failed?

A: Check the following:
1. Is `OBSIDIAN_VAULT_PATH` correctly configured? (Use quotes if path contains spaces)
2. Does the vault path exist and is writable?
3. Is `OBSIDIAN_FILE_PATH` configured correctly? (`.md` extension will be auto-added)
4. Check console error messages for detailed information


## 📄 License

GNU Affero General Public License v3.0. See `GNU-AGPL-3.0.txt` for full terms.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit Issues and Pull Requests.

## 📧 Contact

If you have questions or suggestions, please submit an Issue.
