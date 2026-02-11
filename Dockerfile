# Multi-stage build for TrendMonitor Frontend
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application with production API base URL
# Using relative path /api so nginx can proxy to backend
ARG VITE_API_BASE=/api
ENV VITE_API_BASE=${VITE_API_BASE}
ARG VITE_API_KEY=docker-api-key
ENV VITE_API_KEY=${VITE_API_KEY}

RUN npm run build

# Stage 2: Production with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
