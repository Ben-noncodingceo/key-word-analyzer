# 部署指南

## 📋 概述

本项目包含两个部分：
- **前端（Frontend）**: 通过 Cloudflare Pages 自动部署
- **后端（Worker）**: 通过 GitHub Actions 自动部署

---

## 🎯 前端部署（Cloudflare Pages）

### 自动部署设置

**Cloudflare Pages 配置：**
```
Project name: key-word-analyzer
Framework preset: React (Vite)
Build command: npm run build
Build output directory: frontend/dist
Root directory: (留空)
```

**❌ 重要：不要设置 "Deploy command"**

### 每次推送代码到 main 分支，前端会自动部署

访问地址：https://key-word-analyzer.pages.dev

---

## 🔧 后端部署（Cloudflare Worker）

### 一次性设置（只需要做一次）

#### 1. 获取 Cloudflare API Token

1. 访问：https://dash.cloudflare.com/profile/api-tokens
2. 点击 "Create Token"
3. 选择 "Edit Cloudflare Workers" 模板
4. 或自定义权限：
   - Account: Workers Scripts: Edit
   - Account: Account Settings: Read
5. 点击 "Continue to summary" → "Create Token"
6. **复制并保存这个 Token**（只显示一次！）

#### 2. 获取 Cloudflare Account ID

1. 访问：https://dash.cloudflare.com/
2. 选择任意域名或进入 Workers & Pages
3. 在右侧边栏找到 "Account ID"
4. 复制这个 ID

#### 3. 配置 GitHub Secrets

1. 访问你的 GitHub 仓库：https://github.com/Ben-noncodingceo/key-word-analyzer
2. 点击 "Settings" → "Secrets and variables" → "Actions"
3. 点击 "New repository secret"，添加以下 3 个 secrets：

**Secret 1:**
```
Name: CLOUDFLARE_API_TOKEN
Value: 你在步骤1获取的 API Token
```

**Secret 2:**
```
Name: CLOUDFLARE_ACCOUNT_ID
Value: 你在步骤2获取的 Account ID
```

**Secret 3（稍后设置）:**
```
Name: OPENAI_API_KEY
Value: 你的 OpenAI API Key
```

**Secret 4（稍后设置）:**
```
Name: DEEPSEEK_API_KEY
Value: 你的 DeepSeek API Key
```

#### 4. 首次手动部署 Worker（设置 API Keys）

**在本地执行：**

```bash
cd worker
npm install

# 设置 API Keys（只需要做一次）
npx wrangler secret put OPENAI_API_KEY
# 输入你的 OpenAI API Key

npx wrangler secret put DEEPSEEK_API_KEY
# 输入你的 DeepSeek API Key

# 首次部署
npx wrangler deploy
```

如果遇到登录问题，执行：
```bash
npx wrangler login
```

---

## 🚀 自动部署

### 设置完成后

✅ **前端**：推送到 main 分支 → 自动部署
✅ **后端**：修改 `worker/` 目录的代码 → 推送到 main 分支 → 自动部署

### 查看部署状态

**前端：**
- https://dash.cloudflare.com/ → Workers & Pages → key-word-analyzer

**后端：**
- https://github.com/Ben-noncodingceo/key-word-analyzer/actions

---

## 🔗 连接前端和后端

部署完成后，需要让前端知道后端的 URL。

**方法 1：通过 Cloudflare Pages 环境变量**

1. 进入 Pages 项目：https://dash.cloudflare.com/
2. 选择 `key-word-analyzer`
3. Settings → Environment variables
4. 添加变量：
   ```
   Variable name: VITE_API_URL
   Value: https://social-media-parser.peungsun.workers.dev/api/analyze
   ```
5. 选择 "Production" 和 "Preview" 环境
6. 保存后重新部署

**方法 2：修改前端代码默认值**

编辑 `frontend/src/utils/api.ts`，修改默认 API URL。

---

## 🎯 完整流程总结

1. ✅ 配置 GitHub Secrets（CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID）
2. ✅ 本地首次部署 Worker 并设置 API Keys
3. ✅ 在 Pages 中设置环境变量 VITE_API_URL
4. ✅ 推送代码 → 自动部署完成！

---

## 🆘 故障排除

### Worker 部署失败

**检查：**
- GitHub Actions 中的 Secrets 是否正确设置
- worker/package.json 中的依赖是否正确

### 前端无法调用后端

**检查：**
- VITE_API_URL 环境变量是否设置
- Worker 是否成功部署
- CORS 是否正常（应该已经配置好）

### API Keys 未生效

Worker 的 API Keys 是通过 `wrangler secret put` 设置的，不在代码中。

**重新设置：**
```bash
cd worker
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put DEEPSEEK_API_KEY
```

---

## 📝 维护

### 更新前端
```bash
# 修改代码
git add frontend/
git commit -m "更新前端"
git push
# 自动部署！
```

### 更新后端
```bash
# 修改代码
git add worker/
git commit -m "更新后端"
git push
# 自动部署！
```

### 查看 Worker 日志
```bash
cd worker
npx wrangler tail
```
