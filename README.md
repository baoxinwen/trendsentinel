<div align="center">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" alt="TrendMonitor Banner" width="100%" max-width="1200" />
</div>

# TrendMonitor (热搜哨兵)

> 全网热搜实时监控平台 - 支持 48+ 平台的热搜数据聚合、趋势分析与邮件订阅

<div align="center">

![Frontend](https://img.shields.io/badge/Frontend-React%2020+-blue?style=flat-square&logo=react)
![Backend](https://img.shields.io/badge/Backend-NestJS-red?style=flat-square&logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

## ✨ 功能特性

### 📊 实时监控
- 支持 48+ 中文主流平台（微博、知乎、B站、抖音、百度等）
- 实时数据刷新，自动获取最新热搜
- 平台分类展示，支持按类别筛选
- 移动端适配，随时随地查看

### 📈 趋势分析
- 关键词频次统计（TOP 20）
- 智能分词提取（基于 segmentit）
- 点击关键词快速筛选相关热搜
- 数据可视化图表展示

### 📧 邮件订阅
- 定时发送热搜报告
- 支持每小时/每天/每周三种频率
- 自定义收件人和发送时间
- 精美的 HTML 邮件模板

### 📜 历史回溯
- 手动保存热搜快照
- 本地存储历史记录
- 导出 CSV 格式数据
- 快照详情查看

## 🚀 快速开始

### 方式一：Docker 部署（推荐）

#### 环境要求
- Docker >= 20.10
- Docker Compose >= 2.0

#### 使用预构建镜像

```bash
# 克隆项目
git clone https://github.com/your-username/hotsearch-monitor.git
cd hotsearch-monitor

# 复制环境变量配置
cp .env.docker.example .env

# 编辑 .env 文件，填入你的配置
# 必填项：
# - SMTP_USER: 你的 163 邮箱地址
# - SMTP_PASSWORD: 163 邮箱授权码
# - API_KEY: 自定义 API 密钥

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

服务启动后访问：
- 前端：http://localhost:3002
- 后端 API：http://localhost:3001
- Swagger 文档：http://localhost:3001/docs

#### 本地构建镜像

```bash
# 构建并启动
docker-compose up -d --build

# 仅构建不启动
docker-compose build
```

### 方式二：本地开发

#### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

#### 安装与运行

```bash
# 克隆项目
git clone https://github.com/your-username/hotsearch-monitor.git
cd hotsearch-monitor

# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
cd ..

# 配置环境变量
cp .env.example .env.local

# 启动后端服务
cd server && npm run start:dev

# 启动前端服务（新终端窗口）
npm run dev -- --port 5173
```

### 环境变量配置

**前端 (.env.local)**:
```env
# API 配置
VITE_API_BASE=http://localhost:3001/api
VITE_API_KEY=your-api-key-here
```

**后端 (server/.env)**:
```env
# 应用配置
NODE_ENV=development
PORT=3001
API_PREFIX=api

# CORS 配置
CORS_ORIGIN=http://localhost:5173

# 邮件服务配置
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASSWORD=your-authorization-code
MAIL_FROM=热搜哨兵 <your-email@163.com>

# API 认证
API_KEY=your-secret-api-key

# 数据存储
DATA_DIR=./data
```

## 🐳 Docker 部署

### 镜像信息

项目提供预构建的 Docker 镜像，支持多架构（amd64/arm64）：

- **Frontend**: `ghcr.io/your-username/trendmonitor-frontend:latest`
- **Backend**: `ghcr.io/your-username/trendmonitor-backend:latest`

### GitHub Actions 自动构建

每次推送到 `main` 分支或创建新的版本标签时，GitHub Actions 会自动构建并推送 Docker 镜像到 GitHub Container Registry。

#### 触发构建

```bash
# 推送到 main 分支触发构建
git push origin main

# 创建版本标签触发构建
git tag v1.0.0
git push origin v1.0.0
```

### 本地构建镜像

如果你需要自定义构建：

```bash
# 构建前端镜像
docker build -t trendmonitor-frontend:latest .

# 构建后端镜像
docker build -t trendmonitor-backend:latest ./server

# 多架构构建（需要 buildx）
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64 -t trendmonitor-frontend:latest .
```

### 生产环境部署

使用 `docker-compose.prod.yml` 进行生产部署：

```bash
# 修改 .env 中的配置
# - CORS_ORIGIN 设置为你的域名
# - 使用强密码和 API 密钥
# - 配置真实的 SMTP 服务

# 使用生产配置启动
docker-compose -f docker-compose.prod.yml up -d

# 查看运行状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f
```

### 容器管理

```bash
# 查看所有容器
docker ps

# 进入后端容器
docker exec -it trendmonitor-backend sh

# 查看后端日志
docker logs trendmonitor-backend -f

# 重启服务
docker-compose restart

# 删除所有数据（谨慎使用）
docker-compose down -v
```

### 数据持久化

Email 配置和历史快照数据存储在 Docker volume `trendmonitor-data` 中：

```bash
# 查看 volumes
docker volume ls

# 备份数据
docker run --rm -v trendmonitor-data:/data -v $(pwd):/backup alpine tar czf /backup/trendmonitor-data-backup.tar.gz /data

# 恢复数据
docker run --rm -v trendmonitor-data:/data -v $(pwd):/backup alpine tar xzf /backup/trendmonitor-data-backup.tar.gz -C /
```

## 📁 项目结构

```
hotsearch-monitor/
├── components/           # React 组件
│   ├── AnalysisView.tsx # 趋势分析
│   ├── EmailModal.tsx   # 邮件订阅
│   ├── FilterBar.tsx    # 平台筛选
│   ├── HistoryView.tsx  # 历史记录
│   ├── PlatformCard.tsx # 平台卡片
│   └── Sidebar.tsx      # 侧边栏
├── server/              # NestJS 后端
│   ├── src/
│   │   ├── auth/        # 认证模块
│   │   ├── config/      # 配置管理
│   │   ├── email/       # 邮件服务
│   │   ├── hotsearch/   # 热搜数据
│   │   ├── scheduler/   # 定时任务
│   │   └── storage/     # 数据存储
│   ├── data/            # JSON 数据存储
│   └── .env             # 后端环境变量
├── src/                 # 前端源码
│   └── api/            # API 配置
├── utils/              # 工具函数
├── types.ts            # 类型定义
├── constants.ts        # 常量配置
└── index.html          # HTML 入口
```

## 🎨 设计系统

### 配色方案

- **主色**: Teal (#14b8a6) - 清新现代的数据可视化颜色
- **强调色**: Purple (#a855f7) - 补色，用于强调和渐变
- **成功**: Green (#10b981)
- **警告**: Amber (#f59e0b)
- **危险**: Red (#ef4444)

### 字体

- **英文**: Plus Jakarta Sans
- **中文**: Noto Sans SC

## 🔧 技术栈

### 前端
- **框架**: React 19 + TypeScript
- **构建**: Vite
- **样式**: Tailwind CSS
- **图表**: Recharts
- **图标**: Lucide React
- **分词**: segmentit

### 后端
- **框架**: NestJS
- **语言**: TypeScript
- **邮件**: Nodemailer + Handlebars
- **定时任务**: @nestjs/schedule
- **API 文档**: Swagger/OpenAPI

## 📸 截图

<div align="center">
  <img src="docs/images/dashboard.png" alt="实时监控看板" width="80%" />
  <p>实时监控看板</p>
</div>

<div align="center">
  <img src="docs/images/analysis.png" alt="趋势分析" width="80%" />
  <p>趋势分析</p>
</div>

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范

- 使用 ESLint 和 Prettier 进行代码格式化
- 遵循 TypeScript 最佳实践
- 组件使用函数式写法
- 样式优先使用 Tailwind CSS 工具类

## 📄 许可证

[MIT](LICENSE)

## 🙏 致谢

- [UApiPro](https://uapis.cn) - 热搜数据 API 提供方
- [segmentit](https://github.com/linzewen/segmentit) - 中文分词库
- [Recharts](https://recharts.org/) - 数据可视化库
- [NestJS](https://nestjs.com/) - Node.js 企业级框架

---

<div align="center">
  <p>Made with ❤️ by TrendMonitor Team</p>
</div>
