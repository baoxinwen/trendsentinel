# 热搜哨兵 (TrendSentinel) Backend API

NestJS backend server for TrendSentinel hot search monitoring and email subscription service.

## Features

- 📡 **Hot Search Data**: Fetch hot search trends from 48+ platforms
- 📧 **Email Service**: Send scheduled hot search reports via email
- ⏰ **Scheduler**: Hourly, daily, and weekly automated reports
- 🔐 **API Key Authentication**: Secure configuration and email endpoints
- 📊 **Swagger Documentation**: Interactive API documentation
- 💾 **JSON Storage**: Simple file-based data persistence

## Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Email**: Nodemailer with 163 Mail SMTP
- **Scheduler**: @nestjs/schedule with cron jobs
- **Templates**: Handlebars for email HTML
- **Validation**: class-validator + class-transformer
- **Docs**: Swagger/OpenAPI

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- 163 Mail account (for SMTP)

## Installation

1. Clone the repository and navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Application
NODE_ENV=development
PORT=3001
API_PREFIX=api

# CORS
CORS_ORIGIN=http://localhost:5173

# Email (163 Mail)
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASSWORD=your-authorization-code
MAIL_FROM=热搜哨兵 <your-email@163.com>

# API Authentication
API_KEY=your-secret-api-key
API_KEY_HEADER=X-API-Key

# External API
UAPI_BASE_URL=https://uapis.cn/api/v1/misc/hotboard
API_TIMEOUT=15000
CACHE_DURATION=60000

# Storage
DATA_DIR=./data

# Swagger
SWAGGER_ENABLED=true
```

### Getting 163 Mail Authorization Code

1. Login to your 163 Mail account
2. Go to Settings -> POP3/SMTP/IMAP
3. Enable SMTP service
4. Generate an authorization code (not your password!)
5. Use the authorization code as `SMTP_PASSWORD`

## Running the Server

Development mode:
```bash
npm run start:dev
```

Production mode:
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001/api`
Swagger docs at `http://localhost:3001/api/docs`

## API Documentation

### Authentication

Protected endpoints require API Key in header:
```
X-API-Key: your-secret-api-key
```

### Public Endpoints (No Auth)

#### Get Hot Search Data
```
GET /api/hotsearch
```

Query Parameters:
- `platforms`: Comma-separated platform list (e.g., `Bilibili,Weibo`)
- `minScore`: Minimum score filter
- `keyword`: Keyword filter
- `forceRefresh`: Bypass cache (`true`/`false`)

Example:
```bash
curl "http://localhost:3001/api/hotsearch?platforms=Bilibili,Weibo&minScore=10000"
```

#### Get Available Platforms
```
GET /api/hotsearch/platforms
```

### Protected Endpoints (Requires API Key)

#### Get Email Configuration
```
GET /api/config/email
Headers: X-API-Key: your-secret-api-key
```

#### Update Email Configuration
```
POST /api/config/email
Headers: X-API-Key: your-secret-api-key
Body: {
  "recipients": ["user@example.com"],
  "frequency": "daily",
  "sendTime": "09:00",
  "enabled": true
}
```

#### Send Email Report
```
POST /api/email/send
Headers: X-API-Key: your-secret-api-key
Body: {
  "recipients": ["user@example.com"],
  "subject": "Custom Subject",
  "platforms": "Bilibili,Weibo",
  "minScore": "10000"
}
```

#### Send Test Email
```
POST /api/email/test?to=test@example.com
Headers: X-API-Key: your-secret-api-key
```

#### Verify SMTP Connection
```
GET /api/email/verify
Headers: X-API-Key: your-secret-api-key
```

#### Get Cache Statistics
```
GET /api/hotsearch/cache/stats
Headers: X-API-Key: your-secret-api-key
```

#### Clear Cache
```
GET /api/hotsearch/cache/clear
Headers: X-API-Key: your-secret-api-key
```

## Supported Platforms

### 视频/社区 (Video/Community)
- Bilibili, AcFun, Weibo, Zhihu, ZhihuDaily
- Douyin, Kuaishou, DoubanMovie, DoubanGroup
- Tieba, Hupu, Ngabbs, V2ex, 52pojie
- Hostloc, Coolapk

### 新闻/资讯 (News)
- Baidu, ThePaper, Toutiao, QqNews
- Sina, SinaNews, NeteaseNews
- Huxiu, Ifanr

### 技术/IT (Tech)
- Sspai, ITHome, ITHomeXijiayi, Juejin
- Jianshu, Guokr, 36Kr, 51Cto
- Csdn, Nodeseek, HelloGithub

### 游戏 (Games)
- Lol, Genshin, Honkai, Starrail

### 其他 (Other)
- Weread, WeatherAlarm, Earthquake, History

## Scheduled Jobs

The server includes three scheduled jobs:

1. **Hourly Job**: Runs every hour at :00
   - Only if `frequency: hourly` and `enabled: true`

2. **Daily Job**: Runs at configured time (default 9:00 AM)
   - Only if `frequency: daily` and `enabled: true`

3. **Weekly Job**: Runs every Monday at 9:00 AM
   - Only if `frequency: weekly` and `enabled: true`

## Project Structure

```
server/
├── src/
│   ├── main.ts                  # Application entry point
│   ├── app.module.ts            # Root module
│   ├── auth/                    # Authentication (API Key guard)
│   │   ├── guards/
│   │   └── decorators/
│   ├── config/                  # Configuration management
│   │   ├── dto/
│   │   ├── config.controller.ts
│   │   └── config.service.ts
│   ├── hotsearch/               # Hot search data
│   │   ├── interfaces/
│   │   ├── dto/
│   │   ├── utils/
│   │   ├── hotsearch.controller.ts
│   │   └── hotsearch.service.ts
│   ├── email/                   # Email service
│   │   ├── templates/
│   │   │   ├── hotsearch-report.hbs
│   │   │   └── styles/
│   │   ├── dto/
│   │   ├── email.controller.ts
│   │   └── email.service.ts
│   ├── scheduler/               # Scheduled tasks
│   │   ├── jobs/
│   │   └── scheduler.service.ts
│   └── storage/                 # JSON storage
│       ├── storage.service.ts
│       └── json-storage.service.ts
├── data/                        # JSON data files
├── .env                         # Environment variables
├── .env.example
└── README.md
```

## Development Tips

1. **Watch mode**: Use `npm run start:dev` for auto-reload
2. **Debug mode**: Use `npm run start:debug`
3. **Build**: Use `npm run build` to compile TypeScript
4. **Lint**: Use `npm run lint` to check code quality

## Troubleshooting

### Email Not Sending

1. Verify SMTP settings in `.env`
2. Check 163 Mail SMTP is enabled
3. Ensure you're using authorization code, not password
4. Use `/api/email/verify` to test connection

### API Rate Limiting

The hot search API has rate limits. The server includes:
- Automatic retry with exponential backoff
- Per-platform caching (60 seconds)
- Chunked fetching (2 platforms at a time)

### CORS Errors

Update `CORS_ORIGIN` in `.env` to match your frontend URL.

## License

MIT
