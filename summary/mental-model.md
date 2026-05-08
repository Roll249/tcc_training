# Mind Map Tổng hợp: Software Engineering Mental Model

## Tổng quan luồng một HTTP Request

```
┌──────────────┐     HTTPS      ┌──────────────┐     HTTP      ┌──────────────┐
│              │ ─────────────▶ │              │ ───────────▶ │              │
│   Browser    │ ◀───────────── │    Nginx     │ ◀─────────── │   Container  │
│   (Client)   │    Response    │ (Reverse     │    Proxy     │   (Docker)   │
│              │                │   Proxy)     │              │              │
└──────────────┘                └──────┬───────┘              └──────┬───────┘
                                       │ DNS Resolution               │
                                       │ ◀─────────────────────────   │
                                       ▼                              │
                               ┌──────────────┐                       │
                               │   DNS        │                       │
                               │  Resolver    │                       │
                               └──────────────┘                       │
                                                                   │
                                                                   ▼
                                                     ┌──────────────────────┐
                                                     │    OS / Kernel       │
                                                     │                      │
                                                     │  ┌────────────────┐  │
                                                     │  │ User Space     │  │
                                                     │  │ (NestJS App)   │  │
                                                     │  └───────┬────────┘  │
                                                     │          │             │
                                                     │          │ syscall     │
                                                     │          ▼             │
                                                     │  ┌────────────────┐  │
                                                     │  │ Kernel Space   │  │
                                                     │  │ Process Mem   │  │
                                                     │  │ File System    │  │
                                                     │  │ Network Stack  │  │
                                                     │  └───────┬────────┘  │
                                                     └──────────┼───────────┘
                                                                │
                                                                ▼
                                                     ┌──────────────────────┐
                                                     │     Database          │
                                                     │  PostgreSQL / Redis   │
                                                     └──────────────────────┘
```

---

## Buổi 1: System & Network

### Operating System

```
OS (Operating System)
│
├── Tại sao cần OS?
│   ├── Phần mềm không thể nói chuyện trực tiếp với phần cứng
│   ├── OS kiểm soát quyền truy cập phần cứng
│   └── Nếu app bug → không xóa toàn bộ đĩa được
│
├── Kernel Space
│   ├── Quản lý process
│   ├── Quản lý bộ nhớ (RAM)
│   ├── File system
│   ├── Network stack
│   ├── Device drivers
│   └── System calls (syscall)
│
└── User Space
    ├── Ứng dụng (React, Node, Python...)
    ├── Libraries (libc, libc.so)
    ├── Thư viện (npm, pip packages)
    └── Giao tiếp với Kernel qua Syscall
        ├── read() → đọc file
        ├── write() → ghi file
        ├── open() → mở file
        ├── fork() → tạo process mới
        ├── exec() → chạy chương trình khác
        └── mmap() → ánh xạ bộ nhớ
```

### Linux

```
Linux
│
├── Tại sao phải biết?
│   ├── 96% server production chạy Linux
│   ├── Docker, Kubernetes, CI/CD → Linux
│   └── Cloud (AWS, GCP) → Linux VMs
│
├── File System Hierarchy
│   ├── /           → Root (thư mục gốc)
│   ├── /bin        → Binary (chương trình cơ bản)
│   ├── /sbin       → System binary (root only)
│   ├── /etc        → Config (cấu hình hệ thống)
│   ├── /home       → User home directories
│   ├── /var        → Variable (log, www, tmp)
│   ├── /usr        → User programs
│   ├── /tmp        → Temporary (xóa khi reboot)
│   ├── /dev        → Devices (everything is a file)
│   └── /proc       → Process info (filesystem ảo)
│
├── Process
│   ├── Process = instance đang chạy (PID duy nhất)
│   ├── Thread = đơn vị nhỏ trong process
│   ├── Process cách ly bộ nhớ
│   └── Thread chia sẻ bộ nhớ với process cha
│
└── Permissions
    ├── rwxr-xr-x
    │   └── Owner / Group / Others
    ├── chmod → thay đổi quyền
    └── chown → thay đổi chủ sở hữu
```

### Networking

```
Networking
│
├── OSI Model (7 tầng)
│   ├── 7. Application    → HTTP, FTP, DNS
│   ├── 6. Presentation   → SSL/TLS, JSON
│   ├── 5. Session        → Sessions
│   ├── 4. Transport      → TCP, UDP
│   ├── 3. Network        → IP
│   ├── 2. Data Link      → Ethernet
│   └── 1. Physical       → Cables, Signals
│
├── TCP vs UDP
│   ├── TCP
│   │   ├── Connection-oriented
│   │   ├── Guaranteed delivery
│   │   ├── Ordered packets
│   │   ├── Header 20-60 bytes
│   │   └── Use: HTTP, Email, SSH, File Transfer
│   │
│   └── UDP
│       ├── Connectionless
│       ├── No guarantee
│       ├── Fast
│       ├── Header 8 bytes
│       └── Use: DNS, Video streaming, Gaming
│
├── IP Address
│   ├── IPv4: 192.168.1.1
│   └── IPv6: 2001:db8::1
│
├── Port
│   ├── 22 → SSH
│   ├── 80 → HTTP
│   ├── 443 → HTTPS
│   ├── 3000 → Node.js dev
│   └── 3306 → MySQL
│
└── DNS
    ├── Domain → IP
    └── Các record: A, AAAA, MX, TXT, NS, CNAME
```

---

## Buổi 2: Infrastructure & Containers

### Virtualization

```
Virtualization
│
├── Physical Server (Bare-metal)
│   ├── Server vật lý thuần túy
│   ├── OS cài trực tiếp
│   └── Toàn quyền kiểm soát
│
├── Virtual Machine
│   ├── Hypervisor (VMware, KVM, VirtualBox)
│   ├── Mỗi VM có OS riêng
│   ├── Giả lập toàn bộ phần cứng
│   ├── Nặng (GB), khởi động chậm (phút)
│   └── Isolation hoàn toàn
│
└── Cloud Computing
    ├── IaaS (Infrastructure as a Service)
    │   └── AWS EC2, GCP Compute
    ├── PaaS (Platform as a Service)
    │   └── Heroku, Google App Engine
    └── SaaS (Software as a Service)
        └── Gmail, Slack, Notion
```

### Container vs VM

```
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│        CONTAINER                │     │         VIRTUAL MACHINE         │
├─────────────────────────────────┤     ├─────────────────────────────────┤
│ Share Host Kernel               │     │ Full Guest OS                  │
│ ├── Namespaces (isolation)      │     │ ├── OS Kernel                   │
│ │   ├── PID namespace           │     │ ├── OS User Space               │
│ │   ├── Network namespace       │     │ └── App                         │
│ │   ├── Mount namespace         │     │                                │
│ │   └── User namespace          │     │ Hypervisor                      │
│ └── Cgroups (resource limits)   │     │ (emulate hardware)              │
│     ├── CPU                     │     │                                │
│     └── Memory                  │     │ Host OS + Kernel                │
│                                 │     │                                │
│ Kích thước: ~MB                 │     │ Kích thước: ~GB                │
│ Khởi động: ~ms                  │     │ Khởi động: ~phút              │
│ Overhead: rất thấp             │     │ Overhead: cao                  │
│ Security: cô lập nhẹ hơn       │     │ Security: cô lập hoàn toàn      │
└─────────────────────────────────┘     └─────────────────────────────────┘
```

### Docker

```
Docker
│
├── Image
│   ├── Template read-only
│   ├── Build từ Dockerfile
│   ├── Share qua Docker Hub
│   └── Ví dụ: nginx:latest, node:20-alpine
│
├── Container
│   ├── Instance đang chạy của image
│   ├── Có thể write (layer trên image)
│   └── Có trạng thái
│
├── Dockerfile
│   ├── FROM → base image
│   ├── COPY → copy files
│   ├── RUN → chạy commands
│   ├── EXPOSE → khai báo port
│   ├── ENV → environment variables
│   └── CMD → command mặc định khi chạy
│
├── Volumes
│   ├── Named volumes → docker quản lý
│   └── Bind mounts → host filesystem
│
├── Networks
│   ├── Bridge → mặc định
│   ├── Host → dùng network của host luôn
│   └── Custom → tự tạo
│
└── Docker Compose
    ├── Multi-container orchestration
    ├── docker-compose.yml
    └── Quản lý: build, network, volume, depends_on
```

### Nginx Reverse Proxy

```
Nginx (Reverse Proxy)
│
├── Đứng trước backend
│   └── Browser → Nginx → Backend App
│
├── Features
│   ├── Load Balancing (round robin, least_conn...)
│   ├── SSL Termination (HTTPS ở Nginx)
│   ├── Static File Serving
│   ├── Gzip Compression
│   ├── Rate Limiting
│   └── Cache
│
└── Luồng request
    client ─HTTPS─▶ nginx:443
                     │
                     ├── /api/* ──▶ proxy_pass backend:3000
                     │
                     └── /* ──────▶ static files
```

---

## Buổi 3: Architecture & Security

### HTTP & REST

```
HTTP Protocol
│
├── Methods (CRUD)
│   ├── GET     → Read
│   ├── POST    → Create
│   ├── PUT     → Replace (full update)
│   ├── PATCH   → Update (partial)
│   └── DELETE  → Delete
│
├── Status Codes
│   ├── 2xx → Success (200 OK, 201 Created)
│   ├── 3xx → Redirect (301, 302, 304)
│   ├── 4xx → Client Error (400, 401, 403, 404)
│   └── 5xx → Server Error (500, 502, 503)
│
└── Headers
    ├── Request: Host, Authorization, Content-Type
    └── Response: Content-Type, Set-Cookie

RESTful API
│
├── 6 nguyên tắc
│   ├── Client-Server Separation
│   ├── Stateless (mỗi request độc lập)
│   ├── Cacheable
│   ├── Uniform Interface (Resource-based URL)
│   ├── Layered System
│   └── Code on Demand (optional)
│
├── URL Structure
│   └── /api/users/{id}/posts
│
└── REST vs Others
    ├── GraphQL: Client chọn fields cần
    ├── WebSocket: Real-time, bidirectional
    └── gRPC: Binary, streaming, high perf
```

### Authentication & Authorization

```
Security
│
├── Authentication (Xác thực)
│   ├── "Bạn là ai?"
│   ├── Password, OAuth, JWT, API Key
│   └── Kết quả: User đã đăng nhập
│
├── Authorization (Phân quyền)
│   ├── "Bạn được làm gì?"
│   ├── Role-based: admin, editor, viewer
│   └── Kết quả: Cho phép hoặc từ chối
│
├── Session-based Auth
│   ├── Server lưu session trong memory/DB/Redis
│   ├── Cookie chỉ chứa session ID
│   └── Dễ revoke (xóa session trong DB)
│
└── JWT Auth
    ├── Token chứa tất cả thông tin
    ├── Stateless (server không lưu gì)
    ├── Signature để verify
    ├── Khó revoke (cần blacklist hoặc short expiry)
    └── Cấu trúc: Header.Payload.Signature
```

### OWASP Top 10 (Cơ bản)

```
Security Vulnerabilities
│
├── SQL Injection
│   ├── User input trở thành SQL
│   ├── Ví dụ: ' OR 1=1 --
│   └── Phòng: Parameterized query / ORM
│
├── XSS (Cross-Site Scripting)
│   ├── Inject script vào trang web
│   ├── Stored XSS: Lưu vào DB
│   ├── Reflected XSS: URL
│   └── Phòng: Sanitize HTML, CSP, HTTPOnly cookie
│
├── CSRF (Cross-Site Request Forgery)
│   ├── Lừa user gửi request không biết
│   ├── Browser tự gửi cookie
│   └── Phòng: CSRF Token, SameSite cookie
│
└── CORS (Cross-Origin Resource Sharing)
    ├── Browser chặn cross-origin request
    ├── SOP: Same-Origin Policy
    ├── Origin = Protocol + Domain + Port
    └── Giải quyết: Access-Control-Allow-Origin header
```

---

## Tổng hợp: Từ Request đến Response

```
┌──────────────────────────────────────────────────────────────────────┐
│                         HTTP Request Lifecycle                        │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. USER ACTION                                                       │
│     User click button → Browser tạo HTTP Request                       │
│                                                                       │
│  2. DNS RESOLUTION                                                    │
│     example.com → 93.184.216.34                                       │
│     (Local cache → OS cache → Resolver → Authoritative DNS)          │
│                                                                       │
│  3. TCP HANDSHAKE (3-way)                                             │
│     SYN → SYN-ACK → ACK                                               │
│                                                                       │
│  4. TLS HANDSHAKE (HTTPS only)                                        │
│     Client Hello → Server Hello → Certificate → Keys                   │
│                                                                       │
│  5. HTTP REQUEST                                                      │
│     GET /api/users HTTP/1.1                                           │
│     Host: example.com                                                  │
│     Authorization: Bearer eyJhbG...                                   │
│                                                                       │
│  6. LOAD BALANCER / REVERSE PROXY                                     │
│     Nginx phân phối request đến backend phù hợp                      │
│                                                                       │
│  7. CONTAINER (Docker)                                                │
│     Kernel namespace isolation + cgroup limits                        │
│                                                                       │
│  8. APPLICATION                                                       │
│     ├── Middleware (Auth, Logging, CORS)                             │
│     ├── Route Handler                                                 │
│     ├── Business Logic                                               │
│     └── Database Query (ORM / Raw SQL)                               │
│                                                                       │
│  9. KERNEL                                                            │
│     System calls: read(), write(), mmap(), fork()...                  │
│                                                                       │
│  10. DATABASE                                                         │
│      PostgreSQL / MySQL / MongoDB / Redis                             │
│                                                                       │
│  11. RESPONSE                                                         │
│      HTTP/1.1 200 OK                                                  │
│      Content-Type: application/json                                   │
│      {"users": [...]}                                                 │
│                                                                       │
│  12. RESPONSE về CLIENT                                              │
│      ← TCP ACK ← ... ← TLS ← TCP ← ...                               │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Mối quan hệ giữa các khái niệm

```
Physical ──► Bare-metal ──► VM ──► Container ──► Function/Serverless
                                      │
                                      ▼
                               Linux Kernel
                               ├── Namespaces
                               ├── Cgroups
                               └── Syscalls
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │                             │                             │
        ▼                             ▼                             ▼
    System Calls                  File System                  Network Stack
    ├── read/write                  ├── /dev                    ├── TCP/UDP
    ├── fork/exec                   ├── /proc                   ├── IP
    └── mmap                        └── /var                    └── DNS
        │                             │                             │
        ▼                             ▼                             ▼
    Process Mgmt                 Everything is a file        Port + Socket
```
