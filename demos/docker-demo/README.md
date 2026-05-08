# Docker Demo - Backend + Frontend + Nginx + PostgreSQL

## Cấu trúc thư mục

```
docker-demo/
├── backend/
│   ├── Dockerfile
│   ├── src/
│   └── package.json
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
├── nginx/
│   └── nginx.conf
└── docker-compose.yml
```

## Luồng request

```
Browser (http://localhost)
    │
    ▼
Nginx :80 (Reverse Proxy)
    │
    ├── /api/* ────────────▶ NestJS API :3000
    │                         │
    │                         ▼
    │                      PostgreSQL :5432
    │
    └── /* ─────────────────▶ React Frontend (static files)
```

## Hướng dẫn

### 1. Build và chạy tất cả services

```bash
# Build images và chạy (detach mode)
docker compose up --build -d

# Xem logs của tất cả services
docker compose logs -f

# Xem logs của một service cụ thể
docker compose logs -f api
docker compose logs -f nginx
```

### 2. Kiểm tra các endpoints

```bash
# Health check
curl http://localhost/health

# API endpoint
curl http://localhost/api/users

# Frontend
curl http://localhost/ | head -20
```

### 3. Mở trình duyệt

- Frontend: http://localhost
- API: http://localhost/api
- Health: http://localhost/health

### 4. Dừng và dọn dẹp

```bash
# Dừng tất cả
docker compose down

# Dừng và xóa volumes (CẨN THẬN: xóa database!)
docker compose down -v

# Dừng và xóa images
docker compose down --rmi local
```

### 5. Scale services

```bash
# Scale API lên 3 instances (cần load balancing)
docker compose up -d --scale api=3

# Nginx cần điều chỉnh để load balance
```

### 6. Inspect containers

```bash
# Vào bash của container
docker exec -it nestjs-api sh
docker exec -it nginx-proxy sh

# Kiểm tra processes trong container
docker compose top

# Xem resource usage
docker stats

# Inspect network
docker network inspect docker-demo_app-network
```

## Demo commands

```bash
# Xem tất cả containers đang chạy
docker ps

# Xem logs real-time của tất cả
docker compose logs -f --tail=50

# Restart một service
docker compose restart api

# Rebuild không dùng cache
docker compose build --no-cache

# Validate config
docker compose config
```

## Kịch bản demo

### Kịch bản 1: Scale API

```bash
# Ban đầu: 1 API container
docker compose up -d --scale api=2
curl http://localhost/api/users  # Request 1
curl http://localhost/api/users  # Request 2 (round robin)

# Nginx phân phối request đến 2 API containers
```

### Kịch bản 2: Restart database

```bash
# Database down
docker compose restart postgres

# API tự reconnect
docker compose logs api | grep -i "database\|reconnect"
```

### Kịch bản 3: Hot reload backend

```bash
# Sửa code backend...

# Chỉ rebuild và restart API
docker compose up --build -d api

# Frontend không bị ảnh hưởng
```

## Troubleshooting

```bash
# Container không start được
docker compose logs <service-name>

# Kiểm tra port có bị conflict không
ss -tulpn | grep -E ':80|:443|:3000|:5432'

# Reset hoàn toàn
docker compose down -v --remove-orphans
docker system prune -af
docker compose up --build -d
```
