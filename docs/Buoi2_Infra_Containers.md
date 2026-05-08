# Buổi 2: Hạ tầng & Triển khai

> **Mục tiêu:** Hiểu cách đóng gói ứng dụng và đưa nó lên môi trường server thực tế.
>
> **Thời lượng:** 3 tiếng (180 phút)
>
> **Ghi nhớ quan trọng:** "Từ code của bạn đến production, có hàng chục layer hạ tầng. Buổi này giúp bạn nhìn thấy mỗi layer đó và biết cách tương tác với chúng."

---

## Phần 1: Servers, Virtualization & Cloud (45 phút)

### 1.1. Physical Server vs Virtual Machine - Từ hardware đến virtualization

**Physical Server (Bare-metal):**

Máy chủ vật lý thuần túy - bạn mua hoặc thuê một máy vật lý, cài đặt OS trực tiếp lên phần cứng.

```
┌─────────────────────────────────────────────────────┐
│                   Physical Server                     │
│  ┌─────────────────────────────────────────────┐  │
│  │             Hardware (Server)                 │  │
│  │  ┌─────────┐  ┌───────┐  ┌──────────┐   │  │
│  │  │  CPU    │  │  RAM  │  │   SSD    │   │  │
│  │  │ 64 cores│  │ 256GB │  │  1 TB   │   │  │
│  │  └─────────┘  └───────┘  └──────────┘   │  │
│  └──────────────┬──────────────────────────────┘  │
│                 │                                    │
│         OS installed directly                        │
│         (CentOS, Ubuntu Server)                    │
│                 │                                    │
│         ┌───────┴────────┐                        │
│         │ Application    │                        │
│         │ (your code)   │                        │
│         └───────────────┘                        │
└─────────────────────────────────────────────────────┘

Ưu điểm:
✓ Hiệu suất tối đa (không có overhead)
✓ Toàn quyền kiểm soát phần cứng
✓ Độ tin cậy cao cho workload nặng

Nhược điểm:
✗ Lãng phí tài nguyên nếu chỉ chạy 1 app nhỏ
✗ Không linh hoạt - muốn scale phải mua thêm server
✗ Khôi phục thủ công nếu server chết
```

**Virtual Machine (Máy ảo):**

Một physical server chạy nhiều VM, mỗi VM có OS riêng hoàn toàn cô lập.

```
┌─────────────────────────────────────────────────────────────┐
│                Physical Server (Host)                     │
│  ┌──────────────────────────────────────────────────┐ │
│  │                  Hardware                            │ │
│  │  CPU: 64 cores │ RAM: 512GB │ SSD: 4TB          │ │
│  └──────────────────────────────────────────────────┘ │
│                         │                               │
│               ┌─────────┴─────────┐                    │
│               │   Hypervisor     │                    │
│               │ (VMware ESXi)   │                    │
│               └─────────┬─────────┘                    │
│           ┌────────────┼────────────┐                 │
│           │            │            │                 │
│  ┌────────▼────┐ ┌───▼─────┐ ┌───▼──────┐        │
│  │  VM #1      │ │  VM #2  │ │  VM #3   │        │
│  │  Ubuntu     │ │ CentOS  │ │ Windows   │        │
│  │  16 vCPU   │ │ 8 vCPU  │ │ 4 vCPU   │        │
│  │  64GB RAM  │ │ 32GB RAM│ │ 16GB RAM │        │
│  │  ┌───────┐  │ │         │ │          │        │
│  │  │ App A │  │ │  App B  │ │  App C   │        │
│  │  └───────┘  │ │         │ │          │        │
│  └─────────────┘ └─────────┘ └──────────┘        │
└─────────────────────────────────────────────────────────┘

VM #1 nghĩ: "Tôi có 16 cores CPU, 64GB RAM riêng"
Thực tế: Hypervisor phân chia tài nguyên vật lý
```

### 1.2. Hypervisor - Phần mềm tạo VM

**Hypervisor** là phần mềm cho phép nhiều VMs chạy trên cùng một physical server bằng cách trừu tượng hóa (abstract) phần cứng.

**Type 1: Bare-metal Hypervisor**

Chạy trực tiếp trên phần cứng, không cần OS host. Dùng trong datacenters, enterprises.

```
┌────────────────────────────────────────┐
│           Hardware (Server)             │
├────────────────────────────────────────┤
│    Hypervisor (VMware ESXi / KVM / Xen) │ ← Boot directly on hardware
├────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐          │
│  │   VM 1   │  │   VM 2   │          │
│  │  Ubuntu  │  │ CentOS   │          │
│  └──────────┘  └──────────┘          │
│                                          │
└────────────────────────────────────────┘

Ví dụ thực tế:
├── VMware vSphere/ESXi     → Doanh nghiệp lớn
├── Microsoft Hyper-V      → Windows Server environments
├── Xen                   → Amazon EC2 (trước đây)
├── KVM (Kernel-based VM) → Cloud providers, Linux servers
```

**Type 2: Hosted Hypervisor**

Chạy trên một OS thông thường. Dùng cho development, testing, desktop virtualization.

```
┌────────────────────────────────────────┐
│         OS (macOS / Windows / Linux)    │
├────────────────────────────────────────┤
│       Hypervisor (VirtualBox/VMware)    │ ← Runs as application
├────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐          │
│  │   VM 1   │  │   VM 2   │          │
│  │  Ubuntu  │  │ Windows  │          │
│  └──────────┘  └──────────┘          │
│                                          │
└────────────────────────────────────────┘

Ví dụ:
├── Oracle VirtualBox   → Miễn phí, cross-platform
├── VMware Workstation/Fusion → Trả phí, enterprise features
├── Parallels           → macOS (chạy Windows/Linux trên Mac)
```

### 1.3. Cloud Computing - Thuê thay vì mua

Cloud computing thay đổi hoàn toàn cách chúng ta nghĩ về infrastructure.

**So sánh: Mua vs Thuê vs Serverless**

```
┌────────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ON-PREMISES                   CLOUD (IaaS)           SERVERLESS    │
│                                                                     │
│  ┌─────────────┐           ┌─────────────┐         ┌─────────────┐ │
│  │  Bạn mua   │           │  Bạn thuê  │         │  Bạn chỉ   │ │
│  │  Hardware  │           │  VMs        │         │  viết code  │ │
│  └──────┬──────┘           └──────┬──────┘         └──────┬─────┘ │
│         │                         │                        │         │
│         ▼                         ▼                        ▼         │
│  ┌────────────────┐      ┌────────────────┐     ┌────────────────┐│
│  │ Buy Server     │      │ Rent VMs       │     │  Pay per call  ││
│  │ Install OS    │      │ SSH & Deploy   │     │  Auto-scale    ││
│  │ Configure    │      │                │     │  No servers    ││
│  │ Maintain     │      │                │     │  to manage    ││
│  └────────────────┘      └────────────────┘     └────────────────┘│
│                                                                     │
│  Control: ████████████  Control: ████████░░░░  Control: ██░░░░░░░░ │
│  Complexity: ████████████  Complexity: ████████░░░  Complexity: ██░░░░░░░ │
│  Cost upfront: ████████  Cost upfront: █░░░░░░░░  Cost upfront: ░░░░░░░░ │
└────────────────────────────────────────────────────────────────────────┘
```

**IaaS, PaaS, SaaS chi tiết:**

| Mức độ | Tên | Bạn quản lý | Nhà cung cấp quản lý | Ví dụ |
|---------|-----|---------------|----------------------|---------|
| **IaaS** | Infrastructure as a Service | OS, apps, data | Physical, network, storage | AWS EC2, GCP Compute, Azure VMs |
| **PaaS** | Platform as a Service | Code, data | Runtime, middleware, OS, VMs | Heroku, Railway, Google App Engine, Azure App Service |
| **SaaS** | Software as a Service | - | Mọi thứ | Gmail, Slack, Salesforce, Notion |

**AWS Services Map:**

```
Compute:           EC2 (VMs) | Lambda (serverless) | ECS/EKS (containers)
Storage:           S3 (object) | EBS (block) | EFS (file) | Glacier (archive)
Database:          RDS (relational) | DynamoDB (NoSQL) | ElastiCache (Redis)
Networking:        VPC (private cloud) | Route53 (DNS) | CloudFront (CDN) | ELB (load balancer)
AI/ML:             SageMaker | Rekognition | Comprehend
Serverless:        Lambda | API Gateway | Step Functions | EventBridge
```

### 1.4. Ảo hóa vs Container - So sánh chi tiết

Đây là một trong những khác biệt quan trọng nhất mà nhiều người nhầm lẫn:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     VIRTUAL MACHINE                                     │
│  Mỗi VM có HOÀN TOÀNGuest OS riêng                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  App A        App B        App C                                       │
│    │           │           │                                            │
│  ┌─┴─┐       ┌─┴─┐      ┌─┴─┐                                    │
│  │Lib A│       │Lib B│      │Lib C│                                    │
│  └─┬─┘       └─┬─┘      └─┬─┘                                      │
│  ┌─┴─┐       ┌─┴─┐      ┌─┴─┐                                      │
│  │Guest│       │Guest│      │Guest│                                    │
│  │ OS  │       │ OS  │      │ OS  │    ← Mỗi VM tải ~500MB-10GB     │
│  │Ubuntu│      │CentOS│     │Windows│                                  │
│  └──┬──┘       └──┬──┘      └──┬──┘                                   │
│     │              │             │                                       │
│  ┌──▼───────────────────────────▼──┐                                │
│  │           Hypervisor              │    ← Software layer                │
│  │   (VMware / VirtualBox / KVM)   │                                │
│  └───────────────────────────────────┘                                │
│                    │                                                   │
│            ┌───────▼────────┐                                        │
│            │  Host OS Kernel │   ← Cần chạy đầy đủ OS              │
│            └────────────────┘                                        │
│                    │                                                   │
│  ┌──────────────────────────────────────────┐                        │
│  │           Hardware (CPU, RAM, Disk)        │                        │
│  └──────────────────────────────────────────┘                        │
│                                                                          │
│  Boot time: ~30-60 giây                                              │
│  Size: ~500MB - 10GB mỗi VM                                         │
│  Resource overhead: ~10-30% (Guest OS, Hypervisor)                    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                       CONTAINER                                          │
│  Container share Host Kernel, chỉ có User Space riêng                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  App A        App B        App C                                       │
│    │           │           │                                            │
│  ┌─┴─┐       ┌─┴─┐      ┌─┴─┐                                    │
│  │Lib A│       │Lib B│      │Lib C│    ← Chỉ libraries, không có OS │
│  └─┬─┘       └─┬─┘      └─┬─┘                                      │
│  ┌─┴─┐       ┌─┴─┐      ┌─┴─┐                                      │
│  │User│       │User│      │User│                                     │
│  │Space│      │Space│     │Space│   ← Namespace isolation           │
│  │(ls)│       │(ls)│      │(ls)│                                    │
│  │(cat)│       │(cat)│     │(cat)│                                   │
│  └──┬──┘       └──┬──┘      └──┬──┘                                   │
│     │              │             │                                       │
│  ┌──▼──────────────▼───────────▼──┐                                │
│  │         Docker Daemon           │    ← Docker quản lý containers  │
│  └──────────────┬───────────────────┘                                │
│                 │                                                        │
│  ┌──────────────▼───────────────────┐                               │
│  │          Host OS Kernel            │   ← CHIA SẺ kernel với host!  │
│  │    Linux Kernel (namespaces)       │                               │
│  │    (cgroups, seccomp, AppArmor)   │                               │
│  └──────────────┬───────────────────┘                                │
│                 │                                                        │
│  ┌──────────────────────────────────────────┐                        │
│  │           Hardware (CPU, RAM, Disk)        │                        │
│  └──────────────────────────────────────────┘                        │
│                                                                          │
│  Boot time: ~100-500 mili giây                                       │
│  Size: ~5MB - 500MB mỗi container                                   │
│  Resource overhead: ~1-5%                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

**Linux Namespaces - Công nghệ đằng sau Container:**

Namespaces là tính năng của Linux kernel cho phép cô lập resources:

| Namespace | Viết tắt | Cô lập gì | Ví dụ |
|-----------|-----------|-----------|--------|
| PID Namespace | PID | Process IDs | Container thấy PID 1 là process của nó, không thấy host processes |
| Network | NET | Network interfaces, ports | Container có network stack riêng |
| Mount | MNT | Filesystem mount points | Container có root filesystem riêng |
| User | USER | User/Group IDs | UID 0 (root) trong container ≠ UID 0 ngoài container |
| UTS | UTS | Hostname, domain name | Container có hostname riêng |
| IPC | IPC | Shared memory, semaphores | Container không thấy shared memory của container khác |
| Cgroup | CGROUP | Cgroup resources | Giới hạn CPU, RAM, I/O của container |

**Cgroups (Control Groups) - Giới hạn tài nguyên:**

```
Cgroup hierarchy cho container
│
├── memory
│   └── /docker/abc123
│       memory.limit_in_bytes = 512MB
│       memory.soft_limit_in_bytes = 256MB
│       memory.swappiness = 0
│
├── cpu
│   └── /docker/abc123
│       cpu.shares = 1024
│       cpu.cfs_period_us = 100000
│       cpu.cfs_quota_us = 50000   (50% CPU)
│
├── cpuacct
│   └── /docker/abc123
│       cpuacct.usage          (CPU time đã dùng)
│
├── blkio
│   └── /docker/abc123
│       blkio.throttle.read_bps_device
│       blkio.throttle.write_iops_device
│
└── pids
    └── /docker/abc123
        pids.max = 1024   (max 1024 processes)
```

---

## Phần 2: Containerization & Docker (45 phút)

### 2.1. Vấn đề "It works on my machine" - Nguồn gốc của Docker

Đây là một trong những vấn đề đau đầu nhất của software development trước khi Docker ra đời:

```
Năm 2010-2013: Trước Docker
═══════════════════════════════════════════════════════════════

Developer (macOS, Node 14)                    Production (Ubuntu 18.04, Node 18)
│                                              │
│  $ node --version                           │  $ node --version
│  v14.2.0                                    │  v18.16.0
│  $ npm --version                            │  $ npm --version
│  6.14.4                                    │  9.5.1
│  $ python --version                         │  $ python --version
│  3.8.2                                     │  2.7.17
│  $ which python                              │  $ which python
│  /usr/local/bin/python                      │  /usr/bin/python
│                                              │
│  app requires:                               │  app requires:
│  ├── node@14                                │  ├── node@18
│  ├── python@3.8                             │  ├── python@2.7 (system default)
│  ├── mysql@8.0                              │  ├── mysql@5.7
│  ├── redis@6.0                              │  ├── redis@4.0
│  └── elasticsearch@7.9                       │  └── elasticsearch@6.8
│                                              │
│  Bug: "Database connection timeout"          │
│  Reason: mysql client version không tương │  ← Đêm hôm khuya debug
│  thích với mysql server 5.7              │     production!
│
Năm 2013: Docker ra đời - giải pháp hoàn hảo
═══════════════════════════════════════════════════════════════

Developer                        Production
│                                  │
│  $ docker build -t myapp .     │  $ docker pull myapp
│  $ docker run myapp            │  $ docker run myapp
│                                  │
│  Cùng environment chính xác!   │  Cùng environment chính xác!
│  ✓ Node 14                     │  ✓ Node 14
│  ✓ Python 3.8                 │  ✓ Python 3.8
│  ✓ MySQL 8.0                  │  ✓ MySQL 8.0
│  ✓ Redis 6.0                  │  ✓ Redis 6.0
```

### 2.2. Docker Architecture - Từ Image đến Container

**Docker Engine Components:**

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Docker Client (docker CLI)                       │
│  $ docker build, run, pull, ps, exec...                               │
│                           │                                              │
│                           │ REST API over Unix socket                    │
│                           ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                   Docker Daemon (dockerd)                       │ │
│  │                                                                 │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │ │
│  │  │   Image     │  │  Container  │  │   Volume            │ │ │
│  │  │  Manager    │  │   Manager   │  │   Manager          │ │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬─────────┘ │ │
│  │         │                 │                       │             │ │
│  └─────────┼─────────────────┼───────────────────────┼─────────────┘ │
│            │                 │                       │                 │
│            ▼                 ▼                       ▼                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                 Container Runtime (containerd)              │    │
│  │                                                              │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │    │
│  │  │   shim   │  │   shim   │  │   shim   │  │   shim   │   │    │
│  │  │container1│  │container2│  │container3│  │container4│   │    │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │    │
│  │       │             │             │             │            │    │
│  └───────┼─────────────┼─────────────┼─────────────┼────────────┘    │
│          │             │             │             │                   │
│          ▼             ▼             ▼             ▼                   │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                 runc (OCI runtime)                          │    │
│  │  Creates containers using Linux namespaces & cgroups        │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Linux Kernel                              │    │
│  │  namespaces | cgroups | seccomp | AppArmor | Linux Security │    │
│  └─────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
```

**Docker Image vs Container:**

```
┌────────────────────────────────────────────────────────────────────────┐
│                       DOCKER IMAGE                                     │
│  Template read-only để tạo container                                  │
│                                                                          │
│  Layers (read-only):                                                   │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │  Layer 5: my-app (read-write khi container chạy)           │     │
│  ├──────────────────────────────────────────────────────────────┤     │
│  │  Layer 4: /app/node_modules                               │     │
│  ├──────────────────────────────────────────────────────────────┤     │
│  │  Layer 3: /app/src                                       │     │
│  ├──────────────────────────────────────────────────────────────┤     │
│  │  Layer 2: npm install                                      │     │
│  ├──────────────────────────────────────────────────────────────┤     │
│  │  Layer 1: package.json                                    │     │
│  ├──────────────────────────────────────────────────────────────┤     │
│  │  Layer 0: node:20-alpine (base image)                    │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  Metadata:                                                            │
│  ├── Config: ENTRYPOINT, CMD, ENV, EXPOSE, WORKDIR                   │
│  ├── Created: 2024-01-15T10:30:00.000000000Z                       │
│  └── Architecture: amd64                                            │
└────────────────────────────────────────────────────────────────────────┘
                              │
                              │ docker run
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       DOCKER CONTAINER                                 │
│  Running instance của image                                              │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │  Container Layer (read-write)                              │     │
│  │  + Các thay đổi khi container chạy                      │     │
│  │  + Files được tạo/sửa bởi app                           │     │
│  ├──────────────────────────────────────────────────────────────┤     │
│  │  Image Layers (read-only)                                 │     │
│  │  + Layer 4-0 giống hệt image                           │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  Runtime:                                                             │
│  ├── Process: PID 1 là ENTRYPOINT/CMD của bạn                      │
│  ├── Network: Virtual ethernet (docker0 bridge)                     │
│  ├── Filesystem: OverlayFS                                             │
│  └── Resources: Cgroups limits (CPU, MEM)                          │
│                                                                          │
│  Isolation:                                                            │
│  ├── PID namespace: Container thấy PID 1,2,3...                   │
│  ├── Network namespace: Container có IP riêng (172.17.0.x)          │
│  ├── Mount namespace: Root filesystem riêng                         │
│  └── User namespace: UID mapping (container root ≠ host root)        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.3. Dockerfile chi tiết - Từ Dockerfile đến Image

Dockerfile là "công thức nấu ăn" để build Docker Image. Mỗi instruction tạo một layer mới.

```dockerfile
# ============================================================
# Dockerfile chi tiết - Node.js Backend
# ============================================================

# ─────────────────────────────────────────────────────────────
# Stage 1: Builder (build production artifacts)
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Metadata
LABEL maintainer="khang@example.com"
LABEL version="1.0.0"
LABEL description="Node.js backend API"

# Đặt working directory
WORKDIR /app

# Copy package files TRƯỚC khi copy code
# Đặc biệt quan trọng: Docker cache layer này!
# Nếu package.json không đổi, layer này được cache
COPY package*.json ./

# Install ALL dependencies (kể cả devDependencies để build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript/NextJS/Vite project
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2: Production (runtime nhẹ)
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Tạo non-root user cho bảo mật
# Container không nên chạy với root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Chỉ cài production dependencies
# Production image không cần devDependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built artifacts từ stage builder
# --from=builder refer đến stage trước đó
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Healthcheck - Docker tự kiểm tra container health
HEALTHCHECK --interval=30s --timeout=3s --retries=3 --start-period=10s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Runtime command
CMD ["node", "dist/main.js"]

# ─────────────────────────────────────────────────────────────
# TẠI SAO MULTI-STAGE BUILD?
# ─────────────────────────────────────────────────────────────
# Builder stage: đầy đủ tools (npm, build tools, compiler)
# Production stage: chỉ có runtime (node) + artifacts đã build
#
# Kết quả:
# ├── Single-stage: ~1.2GB (node + npm + source + devDeps)
# └── Multi-stage: ~150MB (node + artifacts only)
# Tiết kiệm ~85% disk space!
```

**Các Dockerfile Instructions chi tiết:**

| Instruction | Mô tả | Tips |
|------------|--------|------|
| `FROM` | Base image | Luôn dùng version cụ thể: `node:20-alpine`, không dùng `node:latest` |
| `COPY` | Copy file | `COPY package*.json ./` → copy đến Dockerfile dir |
| `ADD` | Copy file/URL/archive | Ưu tiên `COPY`, dùng `ADD` chỉ cho URL hoặc tar extraction |
| `RUN` | Chạy command | Gộp commands: `RUN apt-get update && apt-get install -y pkg && rm -rf /var/lib/apt/lists/*` |
| `WORKDIR` | Set working directory | Tự động tạo dir nếu chưa có |
| `ENV` | Environment variable | `ENV NODE_ENV=production` |
| `EXPOSE` | Khai báo port | Chỉ là documentation, không tự động publish port |
| `USER` | Set user | Dùng non-root user cho bảo mật |
| `ENTRYPOINT` | Command khi container start | Dùng exec form: `["node", "server.js"]` |
| `CMD` | Default command | Bị override bởi `docker run <args>` |
| `ARG` | Build-time variable | `ARG VERSION=1.0` → `docker build --build-arg VERSION=2.0` |
| `ONBUILD` | Trigger cho child image | Thường dùng cho base images |
| `HEALTHCHECK` | Container health check | Docker tự kiểm tra và restart nếu fail |
| `LABEL` | Metadata | `LABEL maintainer="email"` |

### 2.4. Docker Network - Container nói chuyện với nhau

Docker cung cấp nhiều network drivers cho các use cases khác nhau:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DOCKER NETWORKS                                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                    bridge (default)                         │     │
│  │  docker0 interface: 172.17.0.1                            │     │
│  │                                                               │     │
│  │  Container A ─── eth0 ──┐                                   │     │
│  │  Container B ─── eth0 ──┼── docker0 bridge ─── eth0 ──┐  │     │
│  │  Container C ─── eth0 ──┘                           │  │     │
│  │                                            veth ────────┘  │     │
│  │                                                Host eth0 ──┘     │
│  │  Mỗi container có IP riêng: 172.17.0.x                │     │
│  │  Containers thấy nhau qua tên (Docker DNS)              │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                    host                                         │     │
│  │  Container dùng trực tiếp host network                      │     │
│  │  Không có namespace isolation về network                     │     │
│  │                                                               │     │
│  │  Container ────────── host network stack                     │     │
│  │  → Port 3000 trên container = port 3000 trên host          │     │
│  │  → Phù hợp cho performance-critical apps                  │     │
│  │  → Mất isolation (không chạy 2 containers cùng port)      │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                    overlay (Docker Swarm)                     │     │
│  │  Nhiều Docker hosts giao tiếp như một network              │     │
│  │                                                               │     │
│  │  Host A ─── VXLAN tunnel ─── Host B                        │     │
│  │     │                              │                         │     │
│  │  Container1                       Container2                 │     │
│  │  (swarm network)                 (swarm network)              │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                    none                                        │     │
│  │  Container không có network interface                        │     │
│  │  → Hoàn toàn isolated                                       │     │
│  └───────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.5. Demo: Docker Commands chi tiết

```bash
# ═══════════════════════════════════════════════════════════════
# DOCKER IMAGES
# ═══════════════════════════════════════════════════════════════

# Build image từ Dockerfile
docker build -t myapp:1.0 .                       # Tag là myapp:1.0
docker build -t myapp:latest -f Dockerfile.prod  # Dockerfile khác
docker build --no-cache -t myapp .              # Không dùng cache

# Build với build arguments
docker build --build-arg NODE_ENV=production \
             --build-arg VERSION=2.0 \
             -t myapp:2.0 .

# Xem image layers (Dockerfile instructions tạo layers)
docker history myapp:1.0
# IMAGE          CREATED        BY                      SIZE
# a1b2c3d4e5f   5 minutes ago  CMD ["node"...]       0B
# <missing>      5 minutes ago  EXPOSE 3000          0B
# <missing>      5 minutes ago  USER nestjs           0B
# <missing>      5 minutes ago  RUN npm ci...       45MB
# <missing>      5 minutes ago  COPY package*.json   2KB
# <missing>      5 minutes ago  WORKDIR /app           0B
# abc123def456   2 weeks ago    FROM node:20-alpine   140MB

# Inspect image
docker image inspect myapp:1.0    # JSON chi tiết
docker image inspect myapp:1.0 | jq '.[0].Config.Env'

# Liệt kê và quản lý
docker images                        # Local images
docker images -a                    # Bao gồm intermediate
docker image prune                  # Xóa dangling images
docker image prune -a              # Xóa tất cả unused images
docker rmi myapp:1.0              # Xóa image

# Pull từ registry
docker pull nginx:alpine
docker pull redis:7-alpine
docker pull postgres:16

# Tag và push
docker tag myapp:1.0 registry.com/myapp:1.0
docker push registry.com/myapp:1.0

# ═══════════════════════════════════════════════════════════════
# DOCKER CONTAINERS
# ═══════════════════════════════════════════════════════════════

# Chạy container mới
docker run myapp:1.0                      # Chạy foreground
docker run -d myapp:1.0                  # Detach (background)
docker run -d --name my-app myapp:1.0    # Đặt tên

# Port mapping
docker run -d -p 3000:3000 myapp        # host:container
docker run -d -p 8080:80 nginx          # Port 8080 trên host → port 80 trong container
docker run -d -p 80:80 -p 443:443 nginx  # Map nhiều ports

# Environment variables
docker run -d -e NODE_ENV=production \
               -e DATABASE_URL=postgres://... \
               myapp

# Volume mounts
docker run -d -v /host/path:/container/path myapp    # Bind mount
docker run -d -v my-volume:/app/data myapp            # Named volume
docker run -d --mount type=bind,source=/host,target=/app myapp  # Explicit mount

# Resource limits
docker run -d --memory="512m" myapp           # Max 512MB RAM
docker run -d --cpus="1.5" myapp             # Max 1.5 CPU cores
docker run -d --memory-swap="1g" myapp        # Max RAM + swap
docker run -d --pids-limit=100 myapp          # Max 100 processes

# Restart policy
docker run -d --restart unless-stopped myapp  # Restart trừ khi stop thủ công
docker run -d --restart always myapp           # Luôn restart
docker run -d --restart on-failure:5 myapp   # Restart khi fail, max 5 lần

# Network
docker run -d --network my-network myapp      # Trong network cụ thể
docker run -d --network none myapp            # Không có network

# Non-root user
docker run -d --user 1001:1001 myapp        # Chạy với UID:GID cụ thể

# Cleanup
docker rm my-container                     # Xóa container (phải stop trước)
docker rm -f my-container                   # Force remove (đang chạy cũng xóa)
docker rm $(docker ps -aq)               # Xóa tất cả stopped containers

# Lifecycle
docker start my-container                  # Start
docker stop my-container                   # Stop (SIGTERM, graceful)
docker stop -t 10 my-container           # Đợi 10s trước khi SIGKILL
docker restart my-container               # Stop + Start
docker pause my-container                # Tạm dừng (SIGSTOP)
docker unpause my-container               # Tiếp tục (SIGCONT)

# Truy cập container
docker exec -it my-container bash          # Bash shell
docker exec -it my-container sh          # Sh (Alpine)
docker exec my-container ls /app          # Chạy command không vào shell
docker exec -u root my-container bash    # Với root user
docker attach my-container              # Attach vào container đang chạy

# Logs
docker logs my-container                 # Xem logs
docker logs -f my-container             # Follow real-time
docker logs --tail 100 my-container     # 100 dòng cuối
docker logs --since 1h my-container    # Từ 1 giờ trước
docker logs --timestamps my-container  # Thêm timestamps

# Inspect
docker inspect my-container             # JSON chi tiết
docker port my-container               # Xem port mappings
docker diff my-container               # Xem thay đổi filesystem
docker top my-container               # Xem processes

# Stats
docker stats                         # Real-time CPU/RAM/Network
docker stats --no-stream               # Snapshot một lần
docker stats --format "table {{.Name}}\t{{.CPUPerc}}"  # Custom format

# ═══════════════════════════════════════════════════════════════
# DOCKER COMPOSE
# ═══════════════════════════════════════════════════════════════

docker compose up -d                    # Start all (detach)
docker compose up --build              # Build trước khi start
docker compose up -d --scale api=3    # Scale api lên 3 instances
docker compose down                    # Stop và remove
docker compose down -v                # Xóa cả volumes
docker compose restart                # Restart all
docker compose logs -f api            # Logs của service cụ thể
docker compose ps                      # Trạng thái services
docker compose exec api bash          # Exec vào container
docker compose config                  # Validate docker-compose.yml
docker compose top                    # Processes trong mỗi container
docker compose pull                    # Pull images
docker compose build                  # Build images
```

---

## Phần 3: Web Servers & Demo tổng hợp (75 phút)

### 3.1. Proxy - Forward vs Reverse

**Forward Proxy (Proxy thuận):**

Client chủ động sử dụng proxy để ẩn identity hoặc bypass restrictions.

```
User (192.168.1.100)
    │
    │ Tôi muốn truy cập blocked-site.com qua proxy
    ▼
┌─────────────────┐
│  Forward Proxy   │
│  (VPN/Proxy)    │
│  203.0.113.50   │
└────────┬────────┘
         │
         │ Request từ 203.0.113.50 đến blocked-site.com
         ▼
    blocked-site.com
    thấy: 203.0.113.50
    không thấy: 192.168.1.100

Use cases:
├── Corporate proxy: Công ty kiểm soát internet access
├── VPN: Ẩn IP thật, bypass geo-restrictions
└── Web proxy: Ẩn identity khi browsing
```

**Reverse Proxy (Proxy ngược):**

Server đặt proxy phía trước để điều hướng, cân bằng tải, hoặc bảo mật.

```
User                        Reverse Proxy              Backend Servers
    │                           │                           │
    │ https://api.example.com   │                           │
    │──────────────────────────▶│                           │
    │                           │                           │
    │                           │ /api/users → server1:3000 │
    │                           │──────────────────────────▶│
    │                           │                           │
    │                           │◀─────────────────────────│
    │                           │                           │
    │◀────────────────────────│ (response)              │
    │  (không biết có bao     │                          │
    │   nhiêu backend servers)│                          │
    │                           │ /api/products → server2:3000│
    │                           │──────────────────────────▶│
    │                           │                           │
    │                           │◀─────────────────────────│

Use cases:
├── Load balancing: Phân phối request đến nhiều servers
├── SSL termination: Mã hóa HTTPS một nơi
├── Caching: Cache static files, API responses
├── Security: Ẩn backend servers khỏi internet
└── Compression: Gzip compression
```

### 3.2. Nginx - Reverse Proxy mạnh nhất

Nginx xử lý hơn 33% website thế giới (theo W3Techs). Nó nổi tiếng về hiệu suất cao, low memory footprint, và khả năng handle 10,000+ concurrent connections.

**Nginx Architecture - Event-driven:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    NGINX PROCESSES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Master Process (PID 1)                                   │ │
│  │ ├── Đọc config                                          │ │
│  │ ├── Quản lý worker processes                           │ │
│  │ ├── Signal handling (reload, stop, reopen logs)         │ │
│  │ └── Không xử lý requests                                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Worker 1 │  │ Worker 2 │  │ Worker 3 │  │ Worker N │   │
│  │ (event   │  │ (event   │  │ (event   │  │ (event   │   │
│  │  loop)   │  │  loop)   │  │  loop)   │  │  loop)   │   │
│  │          │  │          │  │          │  │          │   │
│  │ Handles  │  │ Handles  │  │ Handles  │  │ Handles  │   │
│  │ ~10K conn│  │ ~10K conn│  │ ~10K conn│  │ ~10K conn│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│       │              │              │              │             │
└───────┼──────────────┼──────────────┼──────────────┼─────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
    ┌───────────────────────────────────────────────────────┐
    │                 Event Loop (epoll/kqueue/select)    │
    │                                                       │
    │  Non-blocking I/O + Event-driven architecture      │
    │  = Handle 100,000+ connections với 1 worker!       │
    │                                                       │
    └───────────────────────────────────────────────────────┘
```

**So sánh Apache vs Nginx:**

| Khía cạnh | Apache | Nginx |
|-----------|--------|-------|
| Architecture | Process/thread per connection | Event-driven, async |
| Memory usage | Cao (mỗi process chiếm RAM) | Thấp (shared memory) |
| Concurrent connections | 10-20K (worker process limit) | 100K+ |
| Static files | Tốt | Rất tốt |
| Dynamic content | Tích hợp mod_php | Proxy đến PHP-FPM |
| Configuration | .htaccess (per directory) | Centralized config |
| Use case | Shared hosting (cần .htaccess) | High-traffic production |

### 3.3. Nginx Configuration - Chi tiết từng block

```nginx
# ═══════════════════════════════════════════════════════════════
# nginx.conf - Cấu hình toàn cục
# ═══════════════════════════════════════════════════════════════

user nginx;                                    # User chạy worker processes
worker_processes auto;                          # Tự động = CPU cores
worker_rlimit_nofile 65535;                   # Max files mỗi worker
error_log /var/log/nginx/error.log warn;       # Error log
pid /var/run/nginx.pid;                        # PID file

events {
    worker_connections 10240;                 # Max connections mỗi worker
    use epoll;                                # Linux event driver (高效)
    multi_accept on;                           # Accept nhiều connections cùng lúc
}

http {
    # ─────────────────────────────────────────────────────
    # Logging
    # ─────────────────────────────────────────────────────
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # ─────────────────────────────────────────────────────
    # Performance
    # ─────────────────────────────────────────────────────
    sendfile on;                               # Zero-copy file serving
    tcp_nopush on;                             # Gửi headers + first chunk cùng lúc
    tcp_nodelay on;                            # Disable Nagle's algorithm
    keepalive_timeout 65;
    keepalive_requests 1000;

    # Buffer sizes
    client_body_buffer_size 16k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 8k;
    client_max_body_size 8m;

    # ─────────────────────────────────────────────────────
    # Compression
    # ─────────────────────────────────────────────────────
    gzip on;
    gzip_vary on;
    gzip_proxied any;                           # Compress even from proxy
    gzip_comp_level 6;                          # 1-9, cao hơn = nén tốt hơn nhưng tốn CPU
    gzip_min_length 1024;                       # Chỉ compress files > 1KB
    gzip_types text/plain text/css
           application/json application/javascript
           application/xml application/xml+rss
           text/javascript image/svg+xml;

    # ─────────────────────────────────────────────────────
    # Rate Limiting
    # ─────────────────────────────────────────────────────
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    # ─────────────────────────────────────────────────────
    # SSL/TLS
    # ─────────────────────────────────────────────────────
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # ─────────────────────────────────────────────────────
    # Server Blocks (Virtual Hosts)
    # ─────────────────────────────────────────────────────
    include /etc/nginx/conf.d/*.conf;
}

# ═══════════════════════════════════════════════════════════════
# /etc/nginx/conf.d/app.conf - Server block chi tiết
# ═══════════════════════════════════════════════════════════════

upstream api_backend {
    least_conn;                    # Load balancing: ít connections nhất

    server 172.17.0.2:3000;      # Container 1
    server 172.17.0.3:3000;      # Container 2
    server 172.17.0.4:3000;      # Container 3

    keepalive 32;                 # Keep 32 idle connections đến upstream
}

server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.com www.example.com;

    # SSL Certificate
    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Root directory
    root /usr/share/nginx/html;
    index index.html index.htm;

    # ─────────────────────────────────────────────────────
    # Static Files - Cache
    # ─────────────────────────────────────────────────────
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # ─────────────────────────────────────────────────────
    # HTML - No cache
    # ─────────────────────────────────────────────────────
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # ─────────────────────────────────────────────────────
    # API Proxy
    # ─────────────────────────────────────────────────────
    location /api {
        # Rate limiting
        limit_req zone=api_limit burst=20 nodelay;
        limit_req_status 429;

        # Proxy settings
        proxy_pass http://api_backend;
        proxy_http_version 1.1;

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }

    # ─────────────────────────────────────────────────────
    # WebSocket Proxy
    # ─────────────────────────────────────────────────────
    location /ws {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;

        proxy_read_timeout 86400;
    }

    # ─────────────────────────────────────────────────────
    # SPA (React/Vue) Routing
    # ─────────────────────────────────────────────────────
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ─────────────────────────────────────────────────────
    # Error Pages
    # ─────────────────────────────────────────────────────
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### 3.4. Demo: Docker Compose đầy đủ - NestJS + React + Nginx + PostgreSQL + Redis

Đây là kiến trúc production-ready phổ biến nhất:

```yaml
# ═══════════════════════════════════════════════════════════════════
# docker-compose.yml - Full Stack Production Architecture
# ═══════════════════════════════════════════════════════════════════
version: "3.8"

services:
  # ─────────────────────────────────────────────────────────
  # Nginx - Reverse Proxy / Load Balancer
  # ─────────────────────────────────────────────────────────
  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/ssl:ro                    # SSL certificates
      - ./logs/nginx:/var/log/nginx          # Log volume
    depends_on:
      api:
        condition: service_healthy
      frontend:
        condition: service_started
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ─────────────────────────────────────────────────────────
  # Backend API - NestJS
  # ─────────────────────────────────────────────────────────
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: production
      args:
        - NODE_ENV=production
    container_name: nestjs-api
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_NAME=myapp
      - DATABASE_USER=${DB_USER:-admin}
      - DATABASE_PASSWORD=${DB_PASSWORD:-secret123}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=${JWT_SECRET:-change-me-in-production}
      - JWT_EXPIRES_IN=7d
    ports:
      - "3000:3000"                         # Dev access
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M

  # ─────────────────────────────────────────────────────────
  # Frontend - React (build artifact served by Nginx)
  # ─────────────────────────────────────────────────────────
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=${API_URL:-http://localhost/api}
    container_name: react-frontend
    restart: unless-stopped
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "wget --spider -q http://localhost || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3

  # ─────────────────────────────────────────────────────────
  # PostgreSQL - Primary Database
  # ─────────────────────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: postgres-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: ${DB_USER:-admin}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-secret123}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres-data:/var/lib/postgresql/data  # Persistent storage
      - ./backups:/backups                     # Backup directory
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-admin} -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 1G

  # ─────────────────────────────────────────────────────────
  # Redis - Cache & Session Store
  # ─────────────────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: redis-cache
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  # ─────────────────────────────────────────────────────────
  # Prometheus - Metrics Collection
  # ─────────────────────────────────────────────────────────
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - app-network

# ═══════════════════════════════════════════════════════════════════
# NETWORKS
# ═══════════════════════════════════════════════════════════════════
networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16

# ═══════════════════════════════════════════════════════════════════
# VOLUMES (Persistent Storage)
# ═══════════════════════════════════════════════════════════════════
volumes:
  postgres-data:        # Database data
  redis-data:          # Cache data
  prometheus-data:     # Metrics history
```

### 3.5. Load Balancing Strategies - Chiến lược cân bằng tải

Nginx hỗ trợ nhiều thuật toán load balancing:

```nginx
# ══════════════════════════════════════════════════════════════════════
# upstream{} block với different load balancing methods
# ══════════════════════════════════════════════════════════════════════

# ──────────────────────────────────────────────────────────────────
# 1. Round Robin (mặc định) - Mỗi request đến server tiếp theo
# ──────────────────────────────────────────────────────────────────
upstream round_robin {
    server 172.17.0.2:3000;
    server 172.17.0.3:3000;
    server 172.17.0.4:3000;
    # Request 1 → server 1
    # Request 2 → server 2
    # Request 3 → server 3
    # Request 4 → server 1
}

# ──────────────────────────────────────────────────────────────────
# 2. Least Connections - Server nào ít connections nhất
# ──────────────────────────────────────────────────────────────────
upstream least_conn {
    least_conn;

    server 172.17.0.2:3000 weight=3;   # weight = 3x capacity
    server 172.17.0.3:3000 weight=2;    # weight = 2x capacity
    server 172.17.0.4:3000 weight=1;    # weight = 1x capacity
}

# ──────────────────────────────────────────────────────────────────
# 3. IP Hash - Cùng IP luôn đến cùng server (session affinity)
# ──────────────────────────────────────────────────────────────────
upstream ip_hash {
    ip_hash;

    server 172.17.0.2:3000;
    server 172.17.0.3:3000;
    server 172.17.0.4:3000;
    # user1 (IP A) → server 1 → luôn luôn server 1
    # user2 (IP B) → server 2 → luôn luôn server 2
}

# ──────────────────────────────────────────────────────────────────
# 4. Generic Hash - Hash theo URL hoặc parameter
# ──────────────────────────────────────────────────────────────────
upstream url_hash {
    hash $request_uri consistent;

    server 172.17.0.2:3000;
    server 172.17.0.3:3000;
    server 172.17.0.4:3000;
    # /api/users → server 2
    # /api/products → server 1
    # /api/users → server 2 (consistent)
}

# ──────────────────────────────────────────────────────────────────
# 5. Weighted - Server có weight khác nhau
# ──────────────────────────────────────────────────────────────────
upstream weighted {
    server 172.17.0.2:3000 weight=5;    # Server mạnh = nhận 5 requests
    server 172.17.0.3:3000 weight=3;     # Server trung bình = nhận 3 requests
    server 172.17.0.4:3000 weight=2;     # Server yếu = nhận 2 requests
}

# ══════════════════════════════════════════════════════════════════════
# HEALTH CHECK - Tự động loại bỏ server không healthy
# ══════════════════════════════════════════════════════════════════════
upstream with_health_check {
    server 172.17.0.2:3000 max_fails=3 fail_timeout=30s;
    server 172.17.0.3:3000 max_fails=3 fail_timeout=30s;
    server 172.17.0.4:3000 max_fails=3 fail_timeout=30s;

    # max_fails: Số lần fail liên tiếp trước khi loại bỏ
    # fail_timeout: Thời gian chờ trước khi thử lại
}

# ══════════════════════════════════════════════════════════════════════
# SOCKET UPDATES - Keep connections alive
# ══════════════════════════════════════════════════════════════════════
upstream websocket_backend {
    least_conn;

    server 172.17.0.2:3000;
    server 172.17.0.3:3000;

    keepalive 32;             # 32 idle connections per worker
}
```

---

## Tóm tắt Buổi 2

### Những điểm cần nhớ (vĩnh viễn)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MENTAL MODEL - BUỔI 2                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. PHYSICAL → VM → CONTAINER                                     │
│     VM: Chia sẻ hardware qua Hypervisor                            │
│     Container: Chia sẻ Kernel qua Namespaces + Cgroups              │
│                                                                      │
│  2. DOCKER = IMAGE + CONTAINER                                    │
│     Image = Template (class) | Container = Instance (object)      │
│     Dockerfile = Công thức nấu ăn | Layer = Mỗi instruction     │
│                                                                      │
│  3. DOCKER COMPOSE = Multi-container orchestration                 │
│     Quản lý: build, network, volume, depends_on, healthcheck     │
│                                                                      │
│  4. NGINX = Reverse Proxy + Load Balancer                        │
│     Event-driven architecture → handle 100K+ connections          │
│     upstream{} → load balancing methods                           │
│     location{} → routing rules                                    │
│                                                                      │
│  5. NAMES + CGROUPS = Container Isolation                       │
│     Namespaces: PID, NET, MNT, USER, UTS, IPC                    │
│     Cgroups: CPU, Memory, I/O limits                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Câu hỏi ôn tập

1. Tại sao Docker container nhẹ hơn VM về kích thước và tốc độ khởi động?

2. Giải thích sự khác nhau giữa `CMD` và `ENTRYPOINT` trong Dockerfile. Khi nào dùng cái nào?

3. Tại sao `COPY package*.json ./` nên đứng TRƯỚC `COPY . .` trong Dockerfile?

4. Cấu hình Nginx để proxy `/api` đến backend server, và `/` đến frontend.

5. Thuật toán load balancing nào phù hợp cho:
   - Stateless API?
   - WebSocket connections (cần session affinity)?
   - Server có hardware specs khác nhau?

6. Multi-stage build tiết kiệm được bao nhiêu? Tại sao?

### Bài tập thực hành

1. Viết Dockerfile cho một ứng dụng Python Flask với multi-stage build
2. Setup docker-compose với 3 services: app, database, redis
3. Cấu hình Nginx với SSL certificate (self-signed cho dev)
4. Thực hành `docker stats` và `docker exec` để inspect running containers
5. Setup healthcheck cho container trong docker-compose

---

## Tài liệu tham khảo

- `cheatsheets/docker-commands.md` - Docker commands đầy đủ
- `demos/docker-demo/` - Docker compose project hoàn chỉnh
- Docker documentation: https://docs.docker.com/
- Nginx documentation: https://nginx.org/en/docs/
