# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TrendMonitor (热搜哨兵)** is a comprehensive hot search trend monitoring application with real-time data aggregation from 48+ Chinese platforms. The application consists of:

- **Frontend**: React 19 + TypeScript + Vite application for visualizing hot search trends
- **Backend**: NestJS API server for email subscriptions and scheduled reports
- **Data Source**: UApiPro API for fetching hot search data across multiple platforms

---

## Commands

### Docker Deployment (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Frontend (root directory)
```bash
npm run dev        # Start dev server on port 5173 (Vite)
npm run build      # Build for production
npm run lint        # Run ESLint (if configured)
```

### Backend (server/ directory)
```bash
cd server
npm install        # Install dependencies
npm run start:dev  # Development with auto-reload (nodemon)
npm run build      # Compile TypeScript
npm run start:prod # Production mode
npm run lint        # Run ESLint (if configured)
```

**Default Ports**:
- Docker Frontend: `http://localhost:3000`
- Docker Backend: `http://localhost:3001`
- Dev Frontend: `http://localhost:5173`
- Dev Backend: `http://localhost:3001`
- Swagger Docs: `http://localhost:3001/api/docs`

---

## Docker Deployment

### Quick Start with Docker

```bash
# Clone and setup
git clone https://github.com/your-username/hotsearch-monitor.git
cd hotsearch-monitor
cp .env.docker.example .env

# Edit .env and configure:
# - SMTP_USER: Your 163 email
# - SMTP_PASSWORD: Your 163 authorization code
# - API_KEY: Custom API key

# Start services
docker-compose up -d
```

### Docker Architecture

The project uses a multi-container setup:

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| frontend | trendmonitor-frontend | 3000 | React app served by nginx |
| backend | trendmonitor-backend | 3001 | NestJS API server |

### Docker Files Reference

| File | Purpose |
|------|---------|
| `Dockerfile` | Frontend multi-stage build (Vite → nginx) |
| `server/Dockerfile` | Backend multi-stage build (NestJS) |
| `nginx.conf` | nginx config for serving SPA + API proxy |
| `docker-compose.yml` | Development compose configuration |
| `docker-compose.prod.yml` | Production compose configuration |
| `.github/workflows/docker.yml` | GitHub Actions for CI/CD |

### GitHub Actions CI/CD

Pushing to `main` branch or creating a version tag triggers automated builds:
- Multi-platform images (linux/amd64, linux/arm64)
- Pushes to GitHub Container Registry (ghcr.io)
- Tags: `latest`, branch name, version tags

### Environment Variables for Docker

Required variables in `.env`:
- `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_HOST` - Email configuration
- `API_KEY` - API authentication key
- `CORS_ORIGIN` - Allowed origins for API access
- `FRONTEND_PORT`, `BACKEND_PORT` - Port mappings

### Data Persistence

Email configuration and snapshots are stored in Docker volume `trendmonitor-data`:
```bash
# Backup volume
docker run --rm -v trendmonitor-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data

# Restore volume
docker run --rm -v trendmonitor-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /
```

---

## Architecture

### Frontend Structure
```
hotsearch-monitor/
├── components/           # React Components
│   ├── AnalysisView.tsx # Trend analysis with bar charts
│   ├── EmailModal.tsx   # Email subscription settings
│   ├── FilterBar.tsx    # Platform filter with auto-collapse
│   ├── HistoryView.tsx  # Historical snapshots view
│   ├── PlatformCard.tsx # Individual platform hot search cards
│   └── Sidebar.tsx      # Navigation sidebar
├── src/api/             # API configuration
├── utils/               # Utility functions
├── types.ts            # Core TypeScript definitions
├── constants.ts        # Platform categories and display configs
└── index.html          # Entry point with Tailwind CDN
```

### Backend Structure (server/)
```
server/
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.module.ts        # Root module
│   ├── auth/                # API Key authentication (@Public() decorator)
│   ├── config/              # Email configuration CRUD
│   ├── hotsearch/          # Hot search data fetching
│   ├── email/               # Nodemailer + Handlebars templates
│   ├── scheduler/          # Cron jobs (hourly, daily, weekly)
│   └── storage/            # JSON file persistence with backups
└── data/                   # JSON data storage
    └── email-config.json    # Email subscription settings
```

---

## Key Integration Points

### Platform API Mapping
Both frontend and backend use the same platform enum to API type mapping:
- Frontend: `services/geminiService.ts` - `PLATFORM_API_MAP`
- Backend: `server/src/hotsearch/utils/platform-mapper.util.ts`
- Maps 48 Platform enum values to UApiPro API type parameters

### Score Parsing
Handles Chinese numerical units (亿=100M, 万=10K, kw=10M, 千万=10M):
- Frontend: `services/geminiService.ts` - `parseScore()` function
- Backend: `server/src/hotsearch/utils/score-parser.util.ts`

### Type Synchronization
Core types are defined in `types.ts` at the root. Backend DTOs mirror these types in `server/src/hotsearch/dto/`. When adding fields, update both.

---

## API Authentication

### API Key Authentication
Protected endpoints require `X-API-Key` header:

```
X-API-Key: your-secret-api-key
```

**Public Endpoints** (no auth required):
- `GET /api/hotsearch` - Fetch hot search data
- `GET /api/hotsearch/platforms` - Get available platforms
- `GET /api/docs` - Swagger documentation

**Protected Endpoints** (require auth):
- `GET/POST/PUT /api/config/email` - Email configuration management
- `POST /api/email/send` - Send test email
- `GET /api/hotsearch/cache/stats` - Cache statistics
- `GET /api/hotsearch/cache/clear` - Clear cache

### Using @Public() Decorator
To make an endpoint public, add `@Public()` decorator to the controller method:

```typescript
@Public()
@Get()
getAllHotSearches() {
  // ...
}
```

---

## Email Service Configuration

### SMTP Setup (163 Mail Example)
1. Get authorization code from 163 Mail settings
2. Configure in `server/.env`:
```env
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@163.com
SMTP_PASSWORD=your-authorization-code
```

### Email Template Location
- Template file: `server/src/email/templates/hotsearch-report.hbs`
- Template helpers are registered in `email.service.ts`

**Important**: The email config was previously using a `minScore` filter that blocked all emails. This has been removed from the config.

---

## Scheduled Jobs

The backend includes three cron jobs that check `emailConfig.enabled` and `emailConfig.frequency`:
- **Hourly**: Runs every hour at :00
- **Daily**: Runs at configured time (default 9:00 AM Asia/Shanghai)
- **Weekly**: Runs every Monday at 9:00 AM

Jobs are defined in `server/src/scheduler/jobs/`:
- `hourly.job.ts`
- `daily.job.ts`
- `weekly.job.ts`

**Important**: All job classes must have `@Injectable()` decorator for NestJS dependency injection.

---

## Rate Limiting & Caching

### API Rate Limits
The UApiPro API has rate limits. Implementations include:
- Chunk requests (2 platforms at a time)
- 800ms delay between chunks
- Exponential backoff on 429 responses (max 3 retries)
- 60-second cache duration per platform

### Cache Management
- Frontend: In-memory cache in `services/geminiService.ts`
- Backend: In-memory cache with `MAX_CACHE_SIZE = 50`
- Auto-cleanup of expired entries every 5 minutes

---

## UI Design System

### Color Palette
```css
Primary (Teal):  #14b8a6 → #0d9488
Accent (Purple): #a855f7 → #9333ea
Success:        #10b981
Warning:        #f59e0b
Danger:         #ef4444
```

### Typography
- **English**: Plus Jakarta Sans
- **Chinese**: Noto Sans SC

### Custom Classes
- `.card` - Glass morphism card with backdrop-blur
- `.badge` - Pill-shaped badge component
- `.rank-badge` - Numbered rank badges (gold/silver/bronze)

---

## Known Issues & Solutions

### Issue: Black Border on Bar Chart Click
**Solution**: Global CSS rule in `index.html`:
```css
.recharts-bar-rectangle,
.recharts-bar-rectangle:focus,
.recharts-bar-rectangle:active {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}
```

### Issue: FilterBar Auto-Collapse Bouncing
**Solution**: Animation locking with ref to track animation state:
```typescript
const scrollStateRef = useRef({ isScrolled: false, isAnimating: false });
// Only update state when not animating
if (!scrollStateRef.current.isAnimating) {
  // ... state update logic
}
```

### Issue: Email Config Not Persisting
**Solution**: Fetch config on component mount in both `App.tsx` and `EmailModal.tsx`

### Issue: Toggle Button Size
**Solution**: Use arbitrary value syntax for Tailwind: `w-[52px]` instead of `w-13`

### Issue: Input/FilterBar Layout Overlap
**Solution**: Fixed padding structure in FilterBar - moved from dynamic padding to fixed values per section

---

## Development Guidelines

### Component Development
1. Use functional components with hooks
2. Wrap functions in `useCallback` with proper dependencies
3. Use `useMemo` for expensive computations
4. Use `useRef` to track values for timers/intervals to avoid stale closures

### State Management
- Keep state as local as possible
- Lift state up only when necessary
- Use refs for values that don't trigger re-renders
- Avoid prop drilling by keeping related state together

### Performance Optimization
- Implement cache cleanup for memory management
- Use `URL.revokeObjectURL` for blob URLs
- Clean up intervals in useEffect cleanup functions
- Implement proper cleanup for event listeners

### Adding a New Platform
1. Add to `Platform` enum in `types.ts`
2. Add mapping to `PLATFORM_API_MAP` in `services/geminiService.ts`
3. Add to backend `Platform` enum in `server/src/hotsearch/interfaces/platform.enum.ts`
4. Add mapping to backend `PLATFORM_API_MAP` in `server/src/hotsearch/utils/platform-mapper.util.ts`
5. (Optional) Add to `PLATFORM_CATEGORIES` and `PLATFORM_CONFIG` in `constants.ts`

---

## Testing Before Committing

- [ ] Frontend builds without errors: `npm run build`
- [ ] Backend compiles without errors: `cd server && npm run build`
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Email functionality works (test with test email button)
- [ ] All major features work in both light and dark mode
- [ ] Mobile responsive design works

---

## Troubleshooting

### Backend Port Already in Use
```bash
# Find process using port 3001
netstat -ano | findstr :3001  # Windows
taskkill /F /PID <pid>      # Windows
lsof -ti:3001 | xargs kill -9  # Linux/Mac
```

### CORS Errors
Check `server/.env` for correct `CORS_ORIGIN`:
```env
CORS_ORIGIN=http://localhost:5173,http://192.168.1.94:5173
```

### Email Not Sending
1. Check `server/data/email-config.json` for `enabled: true`
2. Verify SMTP credentials in `server/.env`
3. Check backend logs for error messages
4. Ensure no `minScore` filter is blocking items (removed from config)

### Component Errors
- Check for missing imports
- Verify all useCallback dependencies are correct
- Ensure useState/setRef is declared before use
- Check for stale closures in timers/intervals

---

## Important Files Reference

| File | Purpose |
|------|---------|
| `types.ts` | Core type definitions (Platform, HotSearchItem, etc.) |
| `services/geminiService.ts` | API integration with platform mapping |
| `components/FilterBar.tsx` | Platform filter with scroll-based collapse |
| `components/AnalysisView.tsx` | Trend analysis with bar charts |
| `server/src/email/email.service.ts` | Email sending with Handlebars templates |
| `server/src/scheduler/jobs/*.ts` | Scheduled email jobs |
| `server/src/auth/guards/api-key.guard.ts` | API Key authentication |
| `server/src/health/health.controller.ts` | Health check endpoint for Docker |
| `index.html` | Global styles, fonts, and Tailwind config |
| `src/api/config.ts` | Centralized API configuration |
| `Dockerfile` | Frontend Docker image build |
| `server/Dockerfile` | Backend Docker image build |
| `nginx.conf` | nginx configuration for serving SPA |
| `docker-compose.yml` | Docker Compose orchestration |
| `.github/workflows/docker.yml` | GitHub Actions CI/CD pipeline |

---

## Notes

- This project uses CDN-based Tailwind CSS via `index.html`
- Font imports: Plus Jakarta Sans + Noto Sans SC via Google Fonts
- The frontend uses esm.sh for module imports (check `index.html` importmap)
- LocalStorage is used for saving history snapshots (`trendmonitor_history`)
- JSON file storage is used for email config persistence
- Focus on code quality, performance, and user experience
- The project name was TrendSentinel, now updated to TrendMonitor
