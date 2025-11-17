# GitHub Stars Sync Tool

An automated tool that synchronizes your GitHub starred repositories to knowledge base systems (currently supports SiYuan) and generates Chinese tags and tech stack summaries using AI.

**Language**: [中文简体](README.zh-CN.md) | English

## ✨ Features

- 🔄 **Auto Sync**: Automatically fetches all starred repositories from GitHub
- 🤖 **AI Tag Generation**: Uses OpenAI API to generate Chinese tags and tech stack summaries for repositories
- 📊 **Markdown Table**: Generates formatted Markdown tables with repository info, tags, and tech stacks
- 📝 **Knowledge Base Sync**: Automatically syncs generated tables to knowledge base systems
- 💾 **State Management**: Saves sync state for incremental updates
- 🚀 **Smart Caching**: Only updates changed repositories, reducing AI API calls
- 🏷️ **Tag Format**: Generates native tag format for knowledge bases (e.g., `#标签名#` for SiYuan)

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
│   └── stateService.js  # State management service
├── utils/              # Utility functions
│   ├── helpers.js      # Common utility functions
│   └── repoUtils.js    # Repository-related utilities
├── formatters/         # Formatting modules
│   └── markdownFormatter.js # Markdown table generation
├── index.js            # Entry point (main workflow control)
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 14.0.0
- GitHub Personal Access Token
- OpenAI API Key (or compatible API)
- SiYuan Note (optional, if you want to sync to SiYuan)

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

# OpenAI Configuration (Required)
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1

# SiYuan Configuration (Optional)
SIYUAN_API_URL=http://127.0.0.1:6806
SIYUAN_API_TOKEN=your_siyuan_token
SIYUAN_NOTEBOOK_ID=your_notebook_id
SIYUAN_DOC_PATH=/GitHub/Stars

# Other Configuration (Optional)
SYNC_TZ=Asia/Shanghai
FORCE_SYNC=false
```

### Get GitHub Token

1. Visit [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Check `public_repo` and `read:user` permissions
4. Generate and copy the token

### Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get an API Key
3. Or set `OPENAI_BASE_URL` to a compatible API endpoint

### Configure SiYuan (Optional)

1. Start SiYuan Note
2. Enable API service in settings
3. Get API Token and Notebook ID
4. Configure document path (e.g., `/GitHub/Stars`)

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
4. **Generate Table**: Formats data as Markdown table
5. **Sync to Knowledge Base**: Syncs table to knowledge base system (if configured)

### Generated Files

- `starred_repos.json`: Raw repository data
- `starred_state.json`: Sync state (contains repository metadata)
- `siyuan_table.md`: Generated Markdown table

### Table Format

The generated table contains the following columns:

| Column | Description |
|--------|-------------|
| Repository | Repository name (link) |
| Description | Repository description |
| Tags | AI-generated Chinese tags (SiYuan format: `#标签名#`) |
| Technologies | Tech stack summary |
| Updated | Last update time |
| Archived | Whether archived |

### Example Output

```
> Last synced: 2025-11-17 (Auto-generated)

| Repository | Description | Tags | Technologies | Updated | Archived |
| --- | --- | --- | --- | --- | --- |
| [Pake](https://github.com/tw93/Pake) | Turn any webpage into a desktop app with one command | #桌面应用# #网页打包# #跨平台# | Rust · Tauri | 2025-11-17 | No |
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GITHUB_TOKEN` | ✅ | - | GitHub Personal Access Token |
| `GITHUB_USERNAME` | ✅ | - | GitHub username |
| `OPENAI_API_KEY` | ✅ | - | OpenAI API Key |
| `OPENAI_MODEL` | ❌ | `gpt-4o-mini` | OpenAI model name |
| `OPENAI_BASE_URL` | ❌ | `https://api.openai.com/v1` | OpenAI API endpoint |
| `SIYUAN_API_URL` | ❌ | `http://127.0.0.1:6806` | SiYuan API address |
| `SIYUAN_API_TOKEN` | ❌ | - | SiYuan API Token |
| `SIYUAN_NOTEBOOK_ID` | ❌ | - | SiYuan notebook ID |
| `SIYUAN_DOC_PATH` | ❌ | `/GitHub/Stars` | SiYuan document path |
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

- [ ] **Obsidian Sync Support**

- [ ] **Logseq Sync Support**

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

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit Issues and Pull Requests.

## 📧 Contact

If you have questions or suggestions, please submit an Issue.
