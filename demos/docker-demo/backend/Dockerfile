/*
 * Demo: Dockerfile - Backend NestJS
 * ================================
 * File: Dockerfile
 */

# ---- Stage 1: Build ----
# Dùng Alpine để build nhẹ hơn
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files trước (để tận dụng Docker cache)
COPY package*.json ./

# Cài đặt dependencies (kể cả devDependencies để build)
RUN npm ci

# Copy source code
COPY . .

# Build NestJS
RUN npm run build

# ---- Stage 2: Production ----
FROM node:20-alpine AS production

WORKDIR /app

# Tạo user không phải root (bảo mật)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Chỉ cài production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built artifacts từ stage build
COPY --from=builder /app/dist ./dist

# Chown files cho non-root user
COPY --from=builder --chown=nestjs:nodejs ./dist ./dist

# Chuyển sang non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start
CMD ["node", "dist/main.js"]
