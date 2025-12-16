# 社媒文章一键解析器

一个基于 Cloudflare Workers + React 构建的社交媒体文章分析工具，支持小红书和微信公众号文章的关键词提取与 AI 分析。

## 功能特性

- ✅ **多平台支持**：小红书、微信公众号文章解析
- ✅ **AI 智能分析**：支持 OpenAI 和 DeepSeek 模型
- ✅ **关键词提取**：自动提取文章核心关键词
- ✅ **内容摘要**：生成 150-300 字的精炼摘要
- ✅ **互动数据**：展示文章的阅读量、点赞、评论等数据（如可获取）
- ✅ **一键复制**：支持关键词、标签、摘要的快速复制

## 技术栈

### 后端
- Cloudflare Workers (Serverless)
- TypeScript
- Cheerio (HTML 解析)

### 前端
- React 18
- TypeScript
- Vite
- Cloudflare Pages

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- Cloudflare 账号（用于部署）

### 安装依赖

```bash
# 安装所有依赖
npm run install:all

# 或分别安装
cd worker && npm install
cd ../frontend && npm install
```

### 配置环境变量

#### Worker 环境变量（通过 wrangler secret）

```bash
cd worker

# 设置 OpenAI API Key
npx wrangler secret put OPENAI_API_KEY

# 设置 DeepSeek API Key
npx wrangler secret put DEEPSEEK_API_KEY
```

#### 前端环境变量

```bash
cd frontend
cp .env.example .env

# 编辑 .env 文件，设置 API URL
# 开发环境: http://localhost:8787/api/analyze
# 生产环境: https://your-worker.your-subdomain.workers.dev/api/analyze
```

### 本地开发

#### 启动 Worker (后端)

```bash
cd worker
npm run dev
# Worker 将运行在 http://localhost:8787
```

#### 启动前端

```bash
cd frontend
npm run dev
# 前端将运行在 http://localhost:3000
```

### 部署

#### 部署 Worker

**通过 Cloudflare Dashboard 部署 Worker:**

1. 登录 https://dash.cloudflare.com/
2. 点击 "Workers & Pages"
3. 点击 "Create application" → "Create Worker"
4. 给 Worker 命名（如：social-media-parser）
5. 复制 `worker/src/index.ts` 及所有源代码文件
6. 在 Worker 编辑器中粘贴代码
7. 点击 "Save and Deploy"

**设置环境变量：**
- 在 Worker 设置页面，找到 "Variables and Secrets"
- 添加两个 Secret:
  - `OPENAI_API_KEY`: 你的 OpenAI API Key
  - `DEEPSEEK_API_KEY`: 你的 DeepSeek API Key

**或使用 wrangler 命令行部署：**
```bash
cd worker
npm run deploy
```

#### 部署前端到 Cloudflare Pages（自动部署 - 推荐）

**方法：通过 GitHub 自动部署**

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 选择你的账号

2. **创建 Pages 项目**
   - 点击左侧菜单 "Workers & Pages"
   - 点击 "Create application"
   - 选择 "Pages" 标签
   - 点击 "Connect to Git"

3. **连接 GitHub 仓库**
   - 选择你的 GitHub 账号
   - 找到并选择 `key-word-analyzer` 仓库
   - 点击 "Begin setup"

4. **配置构建设置（重要！）**
   ```
   Framework preset: React (Vite)
   Build command: npm run build
   Build output directory: frontend/dist
   Root directory: (留空，使用根目录)
   ```

   **📸 设置截图对照：**
   - Framework preset: `React (Vite)` ✅
   - Build command: `npm run build` ✅
   - Build output directory: `frontend/dist` ✅ （注意不是 `/dist` 也不是 `dist`）

5. **环境变量（可选）**
   - 点击 "Environment variables (advanced)"
   - 添加 `VITE_API_URL` = `https://your-worker.workers.dev/api/analyze`
   - （替换为你的 Worker 部署后的 URL）

6. **保存并部署**
   - 点击 "Save and Deploy"
   - 等待首次构建完成（约 1-2 分钟）

7. **后续自动部署**
   - 每次你推送代码到 GitHub，Cloudflare Pages 会自动构建和部署
   - 无需手动操作！✨

**查看部署状态：**
- Cloudflare Dashboard → Workers & Pages → 你的项目
- 可以看到每次部署的历史记录和日志
```

## API 使用说明

### 请求格式

```typescript
POST /api/analyze
Content-Type: application/json

{
  "url": "https://mp.weixin.qq.com/s/...",
  "provider": "openai" | "deepseek",
  "model": "gpt-4o-mini",  // 可选
  "topK": 12,              // 可选，默认 12
  "language": "zh"         // 可选，默认 "zh"
}
```

### 响应格式

```typescript
{
  "platform": "wechat" | "xiaohongshu",
  "meta": {
    "title": "文章标题",
    "author": "作者",
    "publishTime": "发布时间",
    "wordCount": 1234
  },
  "metrics": {
    "views": "N/A" | 12345,
    "replies": "N/A" | 36,
    "likes": "N/A" | 120,
    "collects": "N/A" | 89
  },
  "content": {
    "text": "完整文本...",
    "excerpt": "摘录..."
  },
  "ai": {
    "keywords": ["关键词1", "关键词2", ...],
    "tags": ["标签1", "标签2", ...],
    "summary": "AI 生成的摘要"
  },
  "debug": {
    "fetchStatus": 200,
    "notes": ["提示信息"]
  }
}
```

## 项目结构

```
key-word-analyzer/
├── worker/                 # Cloudflare Worker (后端)
│   ├── src/
│   │   ├── index.ts       # Worker 入口
│   │   ├── types.ts       # 类型定义
│   │   ├── utils.ts       # 工具函数
│   │   ├── ai/            # AI 调用模块
│   │   │   └── index.ts
│   │   └── parsers/       # 平台解析器
│   │       ├── index.ts
│   │       ├── wechat.ts
│   │       └── xiaohongshu.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/              # React 前端
│   ├── src/
│   │   ├── components/    # React 组件
│   │   ├── types/         # 类型定义
│   │   ├── utils/         # 工具函数
│   │   ├── App.tsx        # 主应用
│   │   └── main.tsx       # 入口文件
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── wrangler.toml          # Cloudflare Worker 配置
├── package.json           # 根项目配置
└── README.md
```

## 支持的平台

### 微信公众号
- URL 格式: `https://mp.weixin.qq.com/s/...`
- 支持提取: 标题、作者、发布时间、正文
- 互动数据: 仅当页面公开显示时可获取

### 小红书
- URL 格式: `https://www.xiaohongshu.com/...`
- 支持提取: 标题、作者、正文
- 互动数据: 点赞、评论、收藏（视页面结构而定）

## 注意事项

1. **互动数据获取**：阅读量、评论数等数据只能在页面公开展示时获取，部分平台需要登录或通过官方 API 才能访问完整数据。

2. **API 成本**：建议使用 DeepSeek 模型，成本更低。项目已实现缓存机制，相同 URL 的重复请求会直接返回缓存结果。

3. **页面结构变化**：社交媒体平台的页面结构可能随时变化，导致解析失败。遇到问题请及时更新解析器代码。

4. **合规使用**：本工具仅用于个人学习和合法的内容分析，请遵守各平台的服务条款和 robots.txt 规则。

## 常见问题

### Q: 为什么有些文章无法获取阅读量？
A: 部分平台的阅读量数据不在 HTML 中直接展示，需要通过官方 API 获取，且仅对已授权账号有效。

### Q: 如何降低 AI 分析成本？
A: 1) 使用 DeepSeek 模型（成本更低）；2) 项目自带缓存功能，相同 URL 不会重复调用 AI。

### Q: 支持其他平台吗？
A: 目前仅支持微信公众号和小红书。如需添加其他平台，可参考 `parsers/` 目录下的代码实现新的解析器。

## 开发路线图

- [ ] 添加更多平台支持（知乎、今日头条等）
- [ ] 支持批量分析
- [ ] 添加历史记录功能
- [ ] 支持导出为 Excel/PDF
- [ ] 添加用户认证和配额管理

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 作者

Ben - [@Ben-noncodingceo](https://github.com/Ben-noncodingceo)
