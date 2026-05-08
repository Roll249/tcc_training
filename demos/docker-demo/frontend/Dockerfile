/*
 * Demo: Dockerfile - Frontend React (Vite)
 * ========================================
 * File: frontend/Dockerfile
 */

# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Copy source code
COPY . .

# Build với environment variable
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Production stage ----
FROM nginx:alpine AS production

# Copy built files vào nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
