# Software Engineering Fundamentals - CLB TCC Hoc Thuat

Khoá học 3 buổi x 3 tiếng = 9 tiếng bứt phá. Xây dựng "mental model" hoàn chỉnh về cách một HTTP request di chuyển từ trình duyệt, qua network, đến server, vào container, xuống OS/Kernel, rồi quay lại.

---

## Cấu trúc Project

```
tcc_hoc_thuat/
├── slides/                          # Slidev presentation
│   ├── slides.md                   # Nội dung slides (2,818 dòng)
│   ├── slides-export.pdf           # PDF export
│   ├── package.json
│   └── slidev.config.ts
├── docs/                            # Tài liệu chi tiết
│   ├── Buoi1_OS_Network.md        # Buổi 1: OS & Network (1,072 dòng)
│   ├── Buoi2_Infra_Containers.md  # Buổi 2: Infra & Containers (1,422 dòng)
│   ├── Buoi3_API_Security.md      # Buổi 3: API & Security (1,306 dòng)
│   ├── SCRIPT_GiangDay_Buoi1.md  # Script giảng dạy Buổi 1
│   ├── SCRIPT_GiangDay_Buoi2.md  # Script giảng dạy Buổi 2
│   └── SCRIPT_GiangDay_Buoi3.md  # Script giảng dạy Buổi 3
├── cheatsheets/                    # Cheat sheets
│   ├── linux-commands.md           # Linux commands
│   ├── docker-commands.md         # Docker commands
│   └── networking-commands.md       # Networking commands
├── demos/                           # Demo code
│   ├── syscall-demo/               # System call demo (C + strace)
│   ├── docker-demo/                # Docker Compose (NestJS + React + Nginx + PostgreSQL)
│   └── jwt-demo/                  # JWT demo (Node.js)
└── summary/
    └── mental-model.md            # Mind map tổng hợp
```

---

## Quick Start

### Xem Slides

```bash
cd slides
npm install
npm run dev          # Development server
npm run export       # Export PDF
```

### Nội dung mỗi buổi

| Buổi | Chủ đề | Thời lượng | Tài liệu |
|-------|---------|------------|----------|
| 1 | Hệ thống & Mạng | 3 tiếng | `docs/Buoi1_OS_Network.md` |
| 2 | Hạ tầng & Container | 3 tiếng | `docs/Buoi2_Infra_Containers.md` |
| 3 | Kiến trúc & Bảo mật | 3 tiếng | `docs/Buoi3_API_Security.md` |

---

## Nội dung chi tiết

### Buổi 1: Nền tảng Hệ thống & Mạng

**Phần 1: Operating System & Kernel (45 phút)**
- OS là gì và tại sao cần thiết
- User Space vs Kernel Space - ranh giới bảo mật
- System Calls - cầu nối giữa 2 thế giới
- Demo: strace - nhìn thấy mọi syscall

**Phần 2: Linux & Terminal (60 phút)**
- File System Hierarchy chi tiết
- Processes & Threads - đơn vị thực thi
- Permissions & Ownership - ACL
- Demo: Quản lý processes

**Phần 3: Networking Fundamentals (75 phút)**
- OSI vs TCP/IP Model
- TCP vs UDP - chi tiết handshake
- IP, Port, DNS - địa chỉ trên internet
- Demo: Trace HTTP Request

### Buổi 2: Hạ tầng & Triển khai

**Phần 1: Servers, Virtualization & Cloud (45 phút)**
- Physical Server vs Virtual Machine
- Hypervisor - Type 1 vs Type 2
- Cloud Computing - IaaS, PaaS, SaaS

**Phần 2: Containerization & Docker (45 phút)**
- Vấn đề "It works on my machine"
- Container vs VM - chi tiết Namespaces & Cgroups
- Docker Architecture - Image vs Container
- Dockerfile - Multi-stage build
- Docker Compose - Multi-container orchestration

**Phần 3: Web Servers & Demo tổng hợp (75 phút)**
- Forward Proxy vs Reverse Proxy
- Nginx - Event-driven architecture
- Nginx Configuration - upstream, location, proxy settings
- Load Balancing Strategies
- Demo: Deploy NestJS + React + Nginx + PostgreSQL

### Buổi 3: Kiến trúc Ứng dụng & Bảo mật

**Phần 1: Web Architecture & APIs (60 phút)**
- Evolution: Monolith → Client-Server → Microservices
- HTTP Protocol - Methods, Status Codes, Headers
- RESTful API Design - Best practices
- REST vs GraphQL vs gRPC

**Phần 2: Database Fundamentals (30 phút)**
- SQL vs NoSQL - khi nào dùng cái nào
- ACID Properties - đảm bảo tính nhất quán
- ORM vs Raw SQL - trade-offs

**Phần 3: Web Security (75 phút)**
- Authentication vs Authorization
- Session vs JWT - chi tiết flow
- CORS - Cross-Origin Resource Sharing
- OWASP Top 10 - SQL Injection, XSS, CSRF
- Security Headers - Defense in depth
- Demo: JWT Inspect & Tamper

---

## Hướng dẫn sử dụng

### Cho người giảng

1. **Đọc script giảng dạy:** Mở `docs/SCRIPT_GiangDay_Buoi*.md` để có nội dung giảng chi tiết từng slide
2. **Mở slides:** `npm run dev` trong thư mục `slides/`
3. **Chuẩn bị demo:** Chạy trước các demos để đảm bảo hoạt động
4. **Cheat sheets:** In ra cho sinh viên tham khảo

### Cho sinh viên

1. **Đọc tài liệu chi tiết:** Mở `docs/Buoi*.md` để học sâu hơn
2. **Thực hành với demos:** Chạy code trong `demos/`
3. **Tham khảo commands:** Xem cheat sheets khi cần

---

## Yêu cầu hệ thống

- Node.js 18+
- Docker & Docker Compose
- Linux terminal (hoặc WSL trên Windows)
- Trình duyệt web hiện đại

---

## Mental Model Tổng hợp

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  Browser ──HTTPS──▶ Nginx ──HTTP──▶ Container ──Syscall──▶     │
│  (Client)      (RP)    (LoadBal)  (Docker)     (NestJS)        │
│                                               │                 │
│                                               ▼                 │
│                                    ┌───────────────────┐       │
│                                    │   Kernel Space    │       │
│                                    │  Process Mgmt     │       │
│                                    │  Memory Mgmt      │       │
│                                    │  File System      │       │
│                                    │  Network Stack    │       │
│                                    └───────────────────┘       │
│                                              │                   │
│  ◀── TCP/IP Network ────────────────────────┘                   │
│                                              ▼                   │
│                                    ┌───────────────────┐       │
│                                    │   PostgreSQL      │       │
│                                    └───────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Credits

CLB TCC Hoc Thuat - Software Engineering Fundamentals Training
