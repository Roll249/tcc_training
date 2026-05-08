# Cheat Sheet: Các lệnh Docker thường dùng

> Dành cho sinh viên CLB TCC Hoc Thuat - Software Engineering Fundamentals

## Docker Images

```bash
# Build Image
docker build -t my-app:1.0 .                    # Build với tag
docker build -t my-app:latest -f Dockerfile.dev # Build từ Dockerfile khác
docker build --no-cache -t my-app .              # Build không dùng cache

# Liệt kê & Quản lý Images
docker images                                   # Liệt kê local images
docker images -a                                # Liệt kê tất cả (bao gồm intermediate)
docker image ls                                 # Tương tự images
docker image prune                              # Xóa dangling images
docker image prune -a                           # Xóa tất cả unused images
docker rmi my-app:1.0                           # Xóa image
docker rmi $(docker images -q)                  # Xóa tất cả images

# Pull & Push
docker pull nginx:latest                        # Pull từ Docker Hub
docker pull ubuntu:22.04                        # Pull version cụ thể
docker push myregistry.com/my-app:1.0          # Push lên registry

# Inspect Image
docker image inspect my-app:1.0                # Chi tiết image (JSON)
docker history my-app:1.0                      # Lịch sử layers
```

## Docker Containers

```bash
# Chạy Container
docker run nginx                                # Chạy nginx (detach mode)
docker run -d --name web nginx                 # Chạy với tên, detach
docker run -d -p 8080:80 nginx                 # Map port: host:container
docker run -it ubuntu bash                     # Chạy interactive + pseudo-TTY
docker run --rm nginx                          # Tự động xóa container khi stop
docker run -e NODE_ENV=production my-app       # Set environment variable
docker run -v /host/path:/container/path nginx # Mount volume
docker run --network my-net my-app             # Chạy trong network cụ thể

# Restart Policy
docker run -d --restart unless-stopped nginx   # Restart trừ khi stop thủ công
docker run -d --restart always nginx           # Luôn restart khi container dừng
docker run -d --restart on-failure:3 nginx     # Restart khi fail, max 3 lần

# Liệt kê Containers
docker ps                                      # Containers đang chạy
docker ps -a                                   # Tất cả containers
docker ps -l                                   # Container cuối cùng
docker ps -q                                   # Chỉ hiện container IDs
docker ps --filter "status=exited"             # Lọc theo status

# Container Lifecycle
docker start my-container                      # Bắt đầu container đã stop
docker stop my-container                        # Dừng gracefully (SIGTERM)
docker stop -t 10 my-container                  # Dừng, đợi 10s trước SIGKILL
docker kill my-container                        # Buộc dừng (SIGKILL)
docker restart my-container                     # Stop + Start
docker rm my-container                          # Xóa container (phải stop trước)
docker rm -f my-container                       # Xóa kể cả đang chạy
docker rm $(docker ps -aq)                     # Xóa tất cả stopped containers
docker container prune                          # Xóa tất cả stopped containers

# Truy cập Container
docker exec -it my-container bash              # Mở bash shell trong container
docker exec -it my-container sh                # (Alpine/dise-based)
docker exec my-container ls /app               # Chạy command không vào shell
docker attach my-container                     # Attach vào container đang chạy
# (Ctrl+P, Ctrl+Q để detach từ attach)

# Logs & Stats
docker logs my-container                        # Xem logs
docker logs -f my-container                     # Follow logs real-time
docker logs --tail 100 my-container             # 100 dòng cuối
docker logs --since 1h my-container            # Logs từ 1 giờ trước
docker stats                                   # Real-time resource usage
docker stats --no-stream                        # Snapshot một lần
```

## Docker Networking

```bash
# Networks
docker network ls                               # Liệt kê networks
docker network create my-network               # Tạo network mới
docker network create --driver bridge my-net    # Tạo bridge network
docker network rm my-network                   # Xóa network

# Kết nối Container vào Network
docker network connect my-network my-container  # Thêm container vào network
docker network disconnect my-network my-container # Gỡ container khỏi network

# Inspect Network
docker network inspect my-network              # Chi tiết network (JSON)

# DNS Resolution
# Trong cùng network, container có thể truy cập nhau qua tên
# Ví dụ: container "api" truy cập "db" bằng host="db"
```

## Docker Volumes

```bash
# Volumes
docker volume ls                               # Liệt kê volumes
docker volume create my-volume                # Tạo volume
docker volume inspect my-volume               # Chi tiết volume
docker volume rm my-volume                    # Xóa volume
docker volume prune                           # Xóa unused volumes

# Mount Volume vào Container
docker run -v my-volume:/app/data nginx       # Named volume
docker run -v /host/data:/app/data nginx      # Bind mount (host path)

# Bind mount với read-only
docker run -v /host/data:/app/data:ro nginx   # Read-only mount

# Sao chép file giữa host và container
docker cp my-container:/app/file.txt ./       # Copy từ container ra host
docker cp ./local-file.txt my-container:/app/ # Copy từ host vào container
```

## Docker Compose

```yaml
# docker-compose.yml - Ví dụ đầy đủ
version: "3.8"

services:
  api:
    build: ./backend
    container_name: my-api
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://db:5432/myapp
    depends_on:
      - db
      - redis
    networks:
      - backend-net
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

  frontend:
    build: ./frontend
    container_name: my-frontend
    ports:
      - "5173:5173"
    depends_on:
      - api
    networks:
      - frontend-net
      - backend-net

  db:
    image: postgres:16-alpine
    container_name: postgres-db
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret123
    volumes:
      - pg-data:/var/lib/postgresql/data
    networks:
      - backend-net

  redis:
    image: redis:7-alpine
    container_name: redis-cache
    networks:
      - backend-net

networks:
  frontend-net:
  backend-net:

volumes:
  pg-data:
```

```bash
# Docker Compose Commands
docker compose up -d                          # Start all services (detach)
docker compose up --build                     # Build trước khi start
docker compose up -d --scale api=3           # Scale service api lên 3 instances
docker compose down                            # Stop và remove containers
docker compose down -v                         # Xóa cả volumes
docker compose restart                         # Restart all
docker compose stop                            # Stop all (không remove)
docker compose start                           # Start all (đã stop)
docker compose ps                               # Trạng thái services
docker compose logs -f api                     # Logs của service cụ thể
docker compose logs --tail=100 -f              # 100 dòng cuối của tất cả
docker compose exec api bash                   # Exec vào container
docker compose exec db psql -U admin myapp    # Exec psql command
docker compose build                          # Build images
docker compose pull                            # Pull images
docker compose config                          # Validate docker-compose.yml
docker compose top                             # Processes trong mỗi container
```

## Docker System

```bash
# Cleanup
docker system df                              # Xem disk usage
docker system prune                            # Xóa tất cả unused (containers, images, networks)
docker system prune -a                          # Xóa cả unused images
docker system prune --volumes                  # Xóa cả unused volumes
docker container prune                         # Xóa stopped containers
docker image prune                             # Xóa dangling images
docker volume prune                            # Xóa unused volumes
docker network prune                           # Xóa unused networks

# System Info
docker info                                    # Thông tin Docker system
docker version                                 # Docker version
docker compose version                          # Docker Compose version

# Dockerignore
# Tạo file .dockerignore trong project root
node_modules
.git
.gitignore
.env
*.log
dist
coverage
```

## Dockerfile Best Practices

```dockerfile
# TỐT: Multi-stage build để giảm kích thước
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "dist/server.js"]

# TỐT: .dockerignore ngăn copy không cần thiết
# TỐT: Kết hợp layer để giảm build time
# TỐT: Healthcheck để container tự kiểm tra
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

# XẤU: Không nên dùng root trong container (bảo mật)
USER node
```

## Common Scenarios

```bash
# Port conflicts (port đã được dùng)
docker run -d -p 8080:80 nginx               # Thử port khác
ss -tulpn | grep 8080                        # Kiểm tra port đang dùng gì

# Xem logs của container đã stop
docker run --rm --entrypoint "" my-image cat /var/log/error.log

# Copy file từ container ra ngoài
docker cp container_id:/app/config.json ./config.json

# Xem processes trong container
docker top my-container

# Inspect container resource limits
docker inspect --format='{{json .HostConfig}}' my-container | jq

# Chạy với resource limits
docker run -d \
  --memory="512m" \
  --cpus="1.0" \
  --memory-swap="1g" \
  my-app

# Docker Desktop (Linux)
# Nếu không có docker group quyền:
sudo usermod -aG docker $USER
newgrp docker
```

## Troubleshooting

```bash
# Container không start được
docker logs my-container                      # Xem logs
docker inspect my-container                   # Chi tiết container
docker events --since '10m'                 # Events gần đây

# Network không hoạt động
docker network inspect bridge               # Kiểm tra default bridge
docker network ls                           # Liệt kê networks
ping my-other-container                      # Test connectivity

# Volume không mount được
docker volume inspect my-volume             # Kiểm tra volume
ls -la /var/lib/docker/volumes/            # Vị trí volumes

# Build failed
docker build --progress=plain -t my-app .  # Xem output chi tiết
docker build --no-cache -t my-app .         # Build không cache
```
