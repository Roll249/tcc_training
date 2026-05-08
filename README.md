# Software Engineering Fundamentals

## Bộ tài liệu và slides cho 3 buổi học Software Engineering

> **Mục tiêu:** Xây dựng **Mental Model** chuẩn xác về Software Engineering thực tế cho sinh viên đã có kiến thức thuật toán.

---

## Tổng quan

| Buổi | Chủ đề | Thời lượng | Nội dung chính |
|-------|--------|------------|----------------|
| **1** | Hệ thống & Mạng | 3 tiếng | OS, Kernel, Linux, Networking |
| **2** | Hạ tầng & Container | 3 tiếng | VMs, Docker, Nginx |
| **3** | Kiến trúc & Bảo mật | 3 tiếng | HTTP, REST, Database, Security |

**Tổng cộng:** 3 buổi x 3 tiếng = **9 tiếng**

---

## Cấu trúc thư mục

```
tcc_hoc_thuat/
├── slides/
│   ├── slides.md          # Slidev slides (tất cả 3 buổi)
│   ├── slidev.config.ts   # Slidev config
│   └── package.json       # Dependencies
│
├── docs/
│   ├── Buoi1_OS_Network.md     # Tài liệu Buổi 1
│   ├── Buoi2_Infra_Containers.md # Tài liệu Buổi 2
│   └── Buoi3_API_Security.md   # Tài liệu Buổi 3
│
├── cheatsheets/
│   ├── linux-commands.md        # Lệnh Linux thường dùng
│   ├── docker-commands.md        # Lệnh Docker thường dùng
│   └── networking-commands.md    # Lệnh Networking thường dùng
│
├── demos/
│   ├── syscall-demo/            # System calls + strace demo
│   ├── docker-demo/             # Docker + Nginx + docker-compose
│   └── jwt-demo/                # JWT inspect + tamper demo
│
└── summary/
    └── mental-model.md          # Mind map tổng hợp toàn khóa
```

---

## Nội dung chi tiết từng buổi

### Buổi 1: Nền tảng Hệ thống & Mạng

**Phần 1 (45 phút):** Operating System & Kernel

- OS là gì? Tại sao cần OS?
- User Space vs Kernel Space
- System Calls (syscalls)
- Demo: `strace` theo dõi syscalls

**Phần 2 (60 phút):** Linux & Terminal

- File System Hierarchy (`/bin`, `/etc`, `/var`, `/home`...)
- Processes vs Threads
- Permissions (`chmod`, `chown`)
- Demo: `htop`, `kill`, process management

**Phần 3 (75 phút):** Networking

- OSI Model vs TCP/IP
- TCP vs UDP (độ tin cậy vs tốc độ)
- IP, Port, DNS
- Demo: `ping`, `traceroute`, `curl -v`

---

### Buổi 2: Hạ tầng & Triển khai

**Phần 1 (45 phút):** Servers & Cloud

- Physical Server vs VM
- Hypervisor (Type 1 vs Type 2)
- Cloud Computing (IaaS, PaaS, SaaS)

**Phần 2 (45 phút):** Containerization & Docker

- Container vs VM (Namespaces, Cgroups)
- Docker Architecture (Image, Container, Dockerfile)
- Volumes và Networks
- Demo: Viết Dockerfile, `docker build`, `docker run`

**Phần 3 (75 phút):** Web Servers

- Forward Proxy vs Reverse Proxy
- Nginx là gì? (Load balancing, SSL termination)
- Demo tổng hợp: NestJS + React + Nginx + PostgreSQL với docker-compose

---

### Buổi 3: Kiến trúc Ứng dụng & Bảo mật

**Phần 1 (60 phút):** Web Architecture & APIs

- Modern Client-Server Architecture
- HTTP Protocol (Methods, Status Codes)
- RESTful API Design
- REST vs GraphQL vs WebSocket vs gRPC

**Phần 2 (30 phút):** Database

- SQL vs NoSQL
- ACID Properties
- ORM vs Raw SQL

**Phần 3 (75 phút):** Web Security

- Authentication vs Authorization
- Session/Cookies vs JWT
- CORS (Cross-Origin Resource Sharing)
- OWASP Top 10: SQL Injection, XSS, CSRF
- Demo: JWT inspect & tamper

---

## Hướng dẫn sử dụng

### Chạy Slides

```bash
cd slides
npm install
npm run dev
```

Slides sẽ mở tại `http://localhost:3000`

### Export slides ra PDF

```bash
cd slides
npm run export
```

### Chạy Demos

**Syscall Demo:**

```bash
cd demos/syscall-demo
gcc -o syscall_demo syscall_demo.c
strace -c ./syscall_demo
```

**Docker Demo:**

```bash
cd demos/docker-demo
docker compose up --build -d
# Truy cập: http://localhost
```

**JWT Demo:**

```bash
cd demos/jwt-demo
npm install
node jwt_demo.js
```

---

## Yêu cầu hệ thống

- **Node.js:** >= 18.x
- **Docker:** >= 20.x (cho Buổi 2)
- **Docker Compose:** >= 2.x
- **Linux terminal:** Để thực hành commands
- **Trình duyệt:** Chrome/Firefox/Safari để xem slides và demo

---

## Tài liệu kèm theo

| File | Mô tả |
|------|--------|
| `cheatsheets/linux-commands.md` | Quick reference >100 lệnh Linux |
| `cheatsheets/docker-commands.md` | Quick reference Docker + Compose |
| `cheatsheets/networking-commands.md` | Quick reference Networking |
| `docs/Buoi1_OS_Network.md` | Tài liệu chi tiết Buổi 1 |
| `docs/Buoi2_Infra_Containers.md` | Tài liệu chi tiết Buổi 2 |
| `docs/Buoi3_API_Security.md` | Tài liệu chi tiết Buổi 3 |
| `summary/mental-model.md` | Mind map tổng hợp toàn khóa |

---

## Ghi nhớ

> *"Công cụ thay đổi theo năm tháng, nhưng nguyên lý tồn tại hàng thập kỷ."*
>
> Hãy hiểu **tại sao**, không chỉ **làm thế nào**.

**Lộ trình tự học sau khóa học:**

- Level 1: Deploy 1 app lên server, viết REST API
- Level 2: Kubernetes, CI/CD, Monitoring
- Level 3: Microservices, Service Mesh, Infrastructure as Code

---

## Đóng góp

Nếu phát hiện lỗi hoặc muốn cải thiện nội dung, hãy tạo issue hoặc pull request.
