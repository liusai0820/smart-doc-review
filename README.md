# Smart Doc Review

智能文档审阅系统，支持AI自动分析文档并提供修改建议。

## 功能特点

- 文档审阅界面，展示原文和修改建议
- 支持错误、警告和建议三种级别的修改
- 集成OpenRouter API，支持AI自动审阅文档
- 高亮显示删除、添加和修改的内容
- 鼠标悬停查看详细修改说明

## 开始使用

### 环境要求

- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
npm install
# 或
yarn
```

### 配置环境变量

1. 复制 `.env.example` 文件并重命名为 `.env.local`
2. 在 `.env.local` 文件中填入您的 OpenRouter API 密钥:

```
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

> 您可以从 [OpenRouter](https://openrouter.ai/keys) 获取API密钥

### 运行开发服务器

```bash
npm run dev
# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用AI文档审阅

1. 从左侧选择要审阅的文档
2. 点击 "AI文档审阅" 按钮
3. 等待AI分析完成
4. 查看带有高亮的修改建议

## 技术栈

- Next.js
- React
- Tailwind CSS
- OpenRouter API
