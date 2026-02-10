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

# Build the application
RUN npm run build

# Stage 2: Production with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nginx -u 1001 && \
    chown -R nginx:nodejs /usr/share/nginx/html && \
    chown -R nginx:nodejs /var/cache/nginx && \
    chown -R nginx:nodejs /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nodejs /var/run/nginx.pid

# Switch to non-root user
USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
