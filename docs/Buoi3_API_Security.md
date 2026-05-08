# Buổi 3: Kiến trúc Ứng dụng & Bảo mật

> **Mục tiêu:** Hiểu cách xây dựng phần mềm tương tác với nhau (API) và cách bảo vệ hệ thống.
>
> **Thời lượng:** 3 tiếng (180 phút)
>
> **Ghi nhớ quan trọng:** "Một backend developer không biết HTTP headers, SQL injection, hay XSS là như một bác sĩ không biết vệ sinh. Security không phải add-on, mà phải được thiết kế từ đầu."

---

## Phần 1: Web Architecture & APIs (60 phút)

### 1.1. Modern Client-Server Architecture - Từ monolith đến distributed

**Evolution của kiến trúc web:**

```
┌────────────────────────────────────────────────────────────────────────┐
│                   KỶ NGUYÊN 1: Monolith (2000-2010)                    │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    Browser                                                          │
│        │                                                         │
│        │ HTTP                                                      │
│        ▼                                                          │
│  ┌─────────────────────────────────────────────────────┐           │
│  │           Single Server (All-in-one)                  │           │
│  │                                                       │           │
│  │   ┌─────────┐ ┌─────────┐ ┌─────────┐             │           │
│  │   │  HTML   │ │ Business │ │Database │             │           │
│  │   │ Template│ │  Logic   │ │  Layer  │             │           │
│  │   └─────────┘ └─────────┘ └─────────┘             │           │
│  └─────────────────────────────────────────────────────┘           │
│                                                                          │
│  ├── Scale: Vertical (mạnh hơn server)                                │
│  ├── Deploy: Toàn bộ app cùng lúc                                    │
│  └── Problem: Một thay đổi → deploy toàn bộ                       │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│              KỶ NGUYÊN 2: Client-Server (2010-2020)                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    Browser                                                         │
│        │                                                         │
│    ┌──┴──┐                                                      │
│    │       │                                                      │
│    ▼       ▼                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐                                    │
│  │  SPA │ │ REST │ │ Database│                                    │
│  │React │ │ API  │ │  SQL   │                                    │
│  │ +CSS │ │JSON  │ │        │                                    │
│  └──────┘ └──────┘ └──────┘                                    │
│                                                                          │
│  ├── Scale: Horizontal (thêm instances)                               │
│  ├── Deploy: Frontend và Backend độc lập                              │
│  └── Problem: Frontend + Backend + DB trong một codebase               │
└────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────┐
│              KỶ NGUYÊN 3: Microservices (2020+)                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    Browser                                                         │
│        │                                                         │
│    ┌──┴──┐                                                      │
│    ▼       ▼                                                      │
│  ┌──────┐ ┌──────┐                                              │
│  │  SPA │ │  API  │                                              │
│  │ React│ │Gateway│                                              │
│  └──────┘ └──┬───┘                                              │
│               │                                                    │
│         ┌─────┼─────┬──────────┐                              │
│         │     │     │          │                              │
│         ▼     ▼     ▼          ▼                              │
│     ┌────┐ ┌────┐ ┌────┐ ┌────────┐                      │
│     │Auth│ │Users│ │Orders│ │Products│                      │
│     │Svc │ │ Svc │ │ Svc  │ │  Svc   │                      │
│     └────┘ └────┘ └────┘ └────────┘                      │
│         │     │     │          │                              │
│         ▼     ▼     ▼          ▼                              │
│     ┌─────────────────────────────┐                      │
│     │       Message Queue        │                      │
│     │    (Kafka, RabbitMQ)      │                      │
│     └─────────────────────────────┘                      │
│                                                                          │
│  ├── Scale: Mỗi service scale độc lập                                    │
│  ├── Deploy: Independent deployment                                       │
│  └── Problem: Phức tạp về operations                                  │
└────────────────────────────────────────────────────────────────────────┘
```

**Modern Web Architecture - Chi tiết:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client)                                  │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  React / Vue / Angular / Svelte                                   │ │
│  │      │                                                         │ │
│  │      ▼                                                         │ │
│  │  State Management (Redux, Zustand, Pinia)                          │ │
│  │      │                                                         │ │
│  │      ▼                                                         │ │
│  │  HTTP Client (fetch, axios)                                       │ │
│  │      │                                                         │ │
│  │      │  GET /api/users                                           │ │
│  │      │  POST /api/orders                                         │ │
│  │      │  Authorization: Bearer eyJhbGci...                          │ │
│  └──────┼───────────────────────────────────────────────────────────┘ │
│         │                                                               │
└─────────┼───────────────────────────────────────────────────────────────┘
          │ HTTPS
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE / CDN (Edge)                              │
│                                                                          │
│  ├── DDoS Protection                                                  │
│  ├── Cache Static Assets (CDN)                                          │
│  ├── SSL Termination                                                  │
│  └── Web Application Firewall (WAF)                                    │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LOAD BALANCER                                      │
│                                                                          │
│  ├── Round Robin / Least Connections                                    │
│  ├── Health Checks                                                   │
│  └── SSL Termination                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                       │
│                                                                          │
│  ├── Routing (path-based, header-based)                                 │
│  ├── Authentication / Authorization                                     │
│  ├── Rate Limiting                                                   │
│  ├── Request/Response Transformation                                    │
│  └── Logging, Metrics                                                 │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  /api/auth/*          → Auth Service                              │ │
│  │  /api/users/*         → User Service                              │ │
│  │  /api/orders/*        → Order Service                             │ │
│  │  /api/products/*      → Product Service                           │ │
│  │  /api/payments/*      → Payment Service                          │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
          │
    ┌─────┼─────┬──────────┐
    │     │     │          │
    ▼     ▼     ▼          ▼
┌────┐ ┌────┐ ┌────┐ ┌────────┐
│Auth│ │User│ │Order│ │Product│
│ Svc│ │Svc │ │ Svc │ │  Svc │
└──┬─┘ └──┬─┘ └──┬─┘ └──┬────┘
   │      │     │      │
   │      │     │      ▼
   │      │     │   ┌────────┐
   │      │     │   │ Cache  │
   │      │     │   │ Redis  │
   │      │     │   └────────┘
   │      │     │
   │      │     ▼
   │      │   ┌────────┐
   │      │   │ Search │
   │      │   │Elastic │
   │      │   │Search  │
   │      │   └────────┘
   │      │
   │      ▼
   │   ┌────────┐
   │   │  File   │
   │   │ Storage │
   │   │   S3    │
   │   └────────┘
   │
   ▼
┌────────┐
│Postgres│
│   DB   │
└────────┘
```

### 1.2. HTTP Protocol - Chi tiết từng phần

HTTP là nền tảng của web. Hiểu sâu HTTP = hiểu cách web hoạt động.

**HTTP Request - Chi tiết:**

```
GET /api/users?page=1&limit=10 HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
Content-Type: application/json
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.9
Cookie: session_id=abc123; theme=dark
Cache-Control: no-cache

{
  "name": "Khang",
  "email": "khang@example.com"
}
```

**HTTP Response - Chi tiết:**

```
HTTP/1.1 200 OK
Date: Fri, 08 May 2026 10:30:00 GMT
Server: nginx/1.24.0
Content-Type: application/json; charset=utf-8
Content-Length: 512
Connection: keep-alive
X-Request-ID: abc-123-def
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
Cache-Control: max-age=300, public
ETag: "abc123"
Strict-Transport-Security: max-age=31536000

{
  "data": [
    {
      "id": 1,
      "name": "Khang",
      "email": "khang@example.com"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

**Các HTTP Headers quan trọng:**

| Header | Loại | Mô tả | Ví dụ |
|--------|------|--------|---------|
| `Host` | Request | Domain của server | `Host: api.example.com` |
| `Content-Type` | Both | MIME type của body | `application/json` |
| `Content-Length` | Both | Kích thước body (bytes) | `512` |
| `Authorization` | Request | Credentials | `Bearer eyJhbGci...` |
| `Accept` | Request | MIME types chấp nhận | `application/json` |
| `User-Agent` | Request | Client info | `Mozilla/5.0...` |
| `Cache-Control` | Both | Cache directives | `no-cache`, `max-age=3600` |
| `ETag` | Response | Version identifier | `"abc123"` |
| `Set-Cookie` | Response | Cookie để set | `session=xyz; HttpOnly` |
| `Location` | Response | Redirect URL | `https://...` |
| `X-Request-ID` | Response | Request tracing ID | `abc-123` |
| `Strict-Transport-Security` | Response | Force HTTPS | `max-age=31536000` |

### 1.3. HTTP Methods - CRUD Operations

| Method | CRUD | Mô tả | Idempotent | Safe | Body |
|--------|------|--------|-----------|------|------|
| `GET` | Read | Lấy resource | Có | Có | Không |
| `POST` | Create | Tạo resource mới | Không | Không | Có |
| `PUT` | Replace | Thay thế toàn bộ resource | Có | Không | Có |
| `PATCH` | Update | Cập nhật một phần resource | Không | Không | Có |
| `DELETE` | Delete | Xóa resource | Có | Không | Có |
| `HEAD` | - | Như GET nhưng chỉ headers | Có | Có | Không |
| `OPTIONS` | - | Các methods được hỗ trợ | Có | Có | Không |

**Ví dụ thực tế:**

```
GET    /api/users              → Lấy danh sách users
GET    /api/users/123         → Lấy user có id=123
POST   /api/users             → Tạo user mới
PUT    /api/users/123         → Thay thế toàn bộ user 123
PATCH  /api/users/123         → Cập nhật email của user 123
DELETE /api/users/123         → Xóa user 123
GET    /api/users/123/posts   → Lấy posts của user 123
```

### 1.4. HTTP Status Codes - Chi tiết

```
┌──────────────────────────────────────────────────────────────────────┐
│                     1xx: INFORMATIONAL                                │
│   Request nhận được, tiếp tục xử lý                               │
├──────────────────────────────────────────────────────────────────────┤
│   100 Continue        → Client gửi tiếp body (Upload large file)  │
│   101 Switching       → Upgrade protocol (HTTP → WebSocket)        │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     2xx: SUCCESS                                    │
│   Request được nhận, hiểu, và xử lý thành công                     │
├──────────────────────────────────────────────────────────────────────┤
│   200 OK              → Thành công thông thường                  │
│   201 Created         → Resource mới được tạo (POST thành công) │
│   202 Accepted        → Request được chấp nhận, xử lý async     │
│   204 No Content      → Thành công, không có body trả về        │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     3xx: REDIRECTION                                │
│   Phải thực hiện thêm action để hoàn thành request               │
├──────────────────────────────────────────────────────────────────────┤
│   300 Multiple        → Nhiều lựa chọn                           │
│   301 Moved          → Chuyển vĩnh viễn (cache permanent)     │
│   302 Found          → Chuyển tạm thời (cache không đáng tin)  │
│   304 Not Modified   → Dùng bản cache (ETag/Last-Modified)     │
│   307 Temporary      → Chuyển tạm thời (giữ method)            │
│   308 Permanent      → Chuyển vĩnh viễn (giữ method)          │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     4xx: CLIENT ERROR                                │
│   Lỗi từ phía client (request sai)                               │
├──────────────────────────────────────────────────────────────────────┤
│   400 Bad Request    → Request sai cú pháp, không parse được       │
│   401 Unauthorized   → Chưa authenticate (chưa login)            │
│   403 Forbidden     → Đã authenticate nhưng không có quyền     │
│   404 Not Found    → Resource không tồn tại                    │
│   405 Method Not   → Method không được hỗ trợ cho resource này │
│   408 Timeout      → Request quá lâu, server đóng connection   │
│   409 Conflict     → Conflict với state hiện tại của resource  │
│   410 Gone         → Resource đã bị xóa vĩnh viễn            │
│   422 Unprocessable → Request đúng syntax nhưng sai semantics    │
│   429 Too Many     → Rate limited (quá nhiều requests)        │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     5xx: SERVER ERROR                              │
│   Lỗi từ phía server (không phải lỗi client)                   │
├──────────────────────────────────────────────────────────────────────┤
│   500 Internal       → Lỗi server không xác định được             │
│   501 Not Impl.     → Server không hỗ trợ functionality        │
│   502 Bad Gateway   → Proxy/Gateway nhận invalid response        │
│   503 Unavailable  → Server quá tải hoặc đang bảo trì        │
│   504 Gateway      → Proxy chờ upstream quá lâu (timeout)       │
│   507 Insufficient  → Không đủ storage                         │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.5. RESTful API Design - Best Practices chi tiết

REST không chỉ là "dùng GET/POST/PUT/DELETE". Có 6 ràng buộc:

**1. Uniform Interface:**

```
TỐT:
GET    /users
GET    /users/123
GET    /users/123/orders
POST   /users
PUT    /users/123
DELETE /users/123

XẤU:
GET    /getUsers
GET    /getUserById?id=123
POST   /createNewUser
POST   /updateUser
GET    /deleteUser?id=123
```

**2. Client-Server Separation:**

```
Client                    Server
  │                        │
  │ Không quan tâm        │ Không quan tâm
  │ Server lưu data gì    │ Client hiển thị ra sao
  │ Server có bao nhiêu  │ Client có UI gì
  │ databases             │
  │                        │
  ▼                        ▼
Independent evolution    Independent evolution
```

**3. Stateless:**

```
MỖI REQUEST phải chứa TẤT CẢ thông tin cần thiết:
├── Authentication token
├── User context
├── Pagination params
└── Headers cần thiết

XẤU: (Stateful - server lưu session)
GET /api/cart          → Server đọc session từ Redis → "Giỏ hàng của user X"
     │
     ▼
     Server phải có session store, scaling khó

TỐT: (Stateless)
GET /api/cart?user_id=123&session_token=xyz
     │
     ▼
     Token self-contained, server không cần lưu state
```

**4. Cacheable:**

```
Response nên có cache headers để client/proxy cache được:

TỐT:
Cache-Control: public, max-age=300
ETag: "v1.2.3"

XẤU:
Cache-Control: no-store  (cho mọi response, kể cả static)
```

**5. RESTful API Design Patterns:**

```
┌─────────────────────────────────────────────────────────────┐
│                   API ENDPOINT DESIGN                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  COLLECTION ENDPOINTS                                        │
│  GET    /users           → List users (paginated)           │
│  POST   /users           → Create user                       │
│                                                              │
│  RESOURCE ENDPOINTS                                        │
│  GET    /users/:id       → Get user by ID                  │
│  PUT    /users/:id       → Replace user                    │
│  PATCH  /users/:id       → Update user (partial)           │
│  DELETE /users/:id       → Delete user                      │
│                                                              │
│  SUB-RESOURCE ENDPOINTS                                    │
│  GET    /users/:id/posts  → Get user's posts                │
│  GET    /users/:id/orders → Get user's orders            │
│  POST   /users/:id/follow → Follow user                    │
│                                                              │
│  ACTIONS (when CRUD không đủ)                              │
│  POST   /users/:id/activate   → Activate user              │
│  POST   /users/:id/deactivate → Deactivate user          │
│  POST   /auth/login          → Login                      │
│  POST   /auth/logout         → Logout                     │
│  POST   /payments/:id/refund → Refund payment            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**6. API Response Format:**

```json
// SUCCESS RESPONSE
{
  "data": {
    "id": 1,
    "name": "Khang",
    "email": "khang@example.com"
  },
  "meta": {
    "timestamp": "2026-05-08T10:30:00Z"
  }
}

// PAGINATED RESPONSE
{
  "data": [
    { "id": 1, "name": "User 1" },
    { "id": 2, "name": "User 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}

// ERROR RESPONSE
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "must not be empty" }
    ]
  },
  "meta": {
    "requestId": "req-123",
    "timestamp": "2026-05-08T10:30:00Z"
  }
}
```

### 1.6. REST vs GraphQL vs gRPC - Khi nào dùng cái nào?

```
┌──────────────────────────────────────────────────────────────────────┐
│                        REST vs GraphQL vs gRPC                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  REST                                                               │
│  ├── HTTP/JSON, resource-based URLs                                 │
│  ├── Dễ cache (URL = resource)                                     │
│  ├── Dễ debug (curl/wget)                                          │
│  ├── Over-fetching: Client nhận data thừa                          │
│  └── Under-fetching: Client cần nhiều requests                    │
│                                                                      │
│  GraphQL                                                            │
│  ├── Single endpoint, flexible queries                             │
│  ├── Client chọn chính xác fields cần                             │
│  ├── Dễ dùng cho mobile (bandwidth)                              │
│  ├── Caching phức tạp (không có URL)                            │
│  ├── N+1 query problem (cần DataLoader)                          │
│  └── Overkill cho simple APIs                                      │
│                                                                      │
│  gRPC                                                               │
│  ├── Protocol Buffers (binary, type-safe)                          │
│  ├── Streaming (client/server/bidirectional)                       │
│  ├── Performance cao (10-100x faster than JSON)                   │
│  ├── Code generation từ .proto files                             │
│  ├── Không browser-native (cần proxy/gRPC-web)                    │
│  └── Setup phức tạp hơn REST                                     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

KHI NÀO DÙNG:
├── REST: Public APIs, simple CRUD, standard web apps
├── GraphQL: Complex data requirements, mobile apps, BFF (Backend for Frontend)
└── gRPC: Microservices internal communication, streaming, high-performance
```

---

## Phần 2: Database Fundamentals (30 phút)

### 2.1. SQL vs NoSQL - Deep comparison

**Relational Database (SQL):**

```
┌─────────────────────────────────────────────────────────────────┐
│                 POSTGRESQL / MYSQL / SQL SERVER                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  users ────────┐                                                  │
│  ┌─────────┐  │                                                  │
│  │ id (PK) │  │                                                  │
│  │ name    │──┼───────┐                                          │
│  │ email   │  │       │                                          │
│  │ created │  │       ▼                                          │
│  └─────────┘  │  ┌──────────────────────┐                     │
│                │  │ posts                │                     │
│                └──│ id (PK)              │                     │
│                   │ user_id (FK) ──────┘                     │
│                   │ title               │                     │
│                   │ content             │                     │
│                   │ created             │                     │
│                   └──────────────────────┘                     │
│                                                                  │
│  CHARACTERISTICS:                                                │
│  ├── Schema cố định (CREATE TABLE)                              │
│  ├── ACID transactions                                         │
│  ├── Complex queries (JOINs)                                    │
│  ├── Horizontal scaling KHÓ (sharding phức tạp)                 │
│  └── Relationships (FK, many-to-many qua junction tables)       │
└─────────────────────────────────────────────────────────────────┘
```

**NoSQL Databases:**

```
┌─────────────────────────────────────────────────────────────────┐
│              MONGODB (Document)                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  {                                                              │
│    "_id": "ObjectId(...)",                                     │
│    "name": "Khang",                                            │
│    "email": "khang@example.com",                                │
│    "posts": [                                                   │
│      {                                                           │
│        "title": "My First Post",                                 │
│        "content": "..."                                        │
│      },                                                          │
│      {                                                           │
│        "title": "My Second Post",                               │
│        "content": "..."                                        │
│      }                                                           │
│    ],                                                           │
│    "settings": {                                                │
│      "theme": "dark",                                          │
│      "notifications": true                                       │
│    }                                                            │
│  }                                                              │
│                                                                  │
│  CHARACTERISTICS:                                               │
│  ├── Schema linh hoạt (flexible documents)                      │
│  ├── No JOINs (embed documents)                                 │
│  ├── Horizontal scaling DỄ (sharding built-in)                 │
│  └── Denormalized data (read optimized)                         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. ACID Properties - Chi tiết từng thuộc tính

ACID là 4 tính chất đảm bảo data consistency trong transactions:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ACID - THE 4 PILLARS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  A - ATOMICITY (Tính nguyên tử)                               │
│  ────────────────────────────────────────────────────────────────  │
│  Transaction = TẤT CẢ hoặc KHÔNG GÌ                          │
│                                                                  │
│  Ví dụ: Chuyển 500k từ tài khoản A → tài khoản B             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ BEGIN TRANSACTION                                     │   │
│  │   UPDATE accounts SET balance = balance - 500       │   │
│  │   WHERE user_id = 'A';                             │   │
│  │   UPDATE accounts SET balance = balance + 500       │   │
│  │   WHERE user_id = 'B';                             │   │
│  │   IF error THEN ROLLBACK;                          │   │
│  │   ELSE COMMIT;                                     │   │
│  │ END TRANSACTION;                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  C - CONSISTENCY (Tính nhất quán)                             │
│  ────────────────────────────────────────────────────────────────  │
│  Database luôn ở trạng thái VALID sau transaction              │
│                                                                  │
│  Ràng buộc phải được enforce:                                 │
│  ├── PRIMARY KEY: id không null, unique                         │
│  ├── FOREIGN KEY: user_id phải tồn tại trong bảng users      │
│  ├── UNIQUE: email không trùng                                 │
│  └── CHECK: balance >= 0                                       │
│                                                                  │
│  Nếu transaction vi phạm ràng buộc → ROLLBACK               │
│                                                                  │
│  I - ISOLATION (Tính cô lập)                                 │
│  ────────────────────────────────────────────────────────────────  │
│  Các transactions chạy đồng thời không ảnh hưởng nhau         │
│                                                                  │
│  Isolation Levels:                                              │
│  ├── READ UNCOMMITTED: Dirty reads (đọc uncommitted data)     │
│  ├── READ COMMITTED: Đọc committed data (Oracle/PG default)  │
│  ├── REPEATABLE READ: Cùng SELECT trong transaction → cùng kq│
│  └── SERIALIZABLE: Như chạy tuần tự (đắt nhất)             │
│                                                                  │
│  D - DURABILITY (Tính bền vững)                              │
│  ────────────────────────────────────────────────────────────────  │
│  Commit thành công = Data tồn tại vĩnh viễn                   │
│                                                                  │
│  Cơ chế:                                                      │
│  ├── Write-Ahead Log (WAL) - ghi log trước khi write data   │
│  ├── Replication - replicate sang nodes khác                   │
│  └── Periodic checkpoint - flush memory → disk                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3. ORM vs Raw SQL - Trade-offs

```typescript
// ═══════════════════════════════════════════════════════════════
// ORM với Prisma (Type-safe, modern)
// ═══════════════════════════════════════════════════════════════

// Query đơn giản
const user = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    name: true,
    email: true,
    posts: {
      where: { published: true },
      select: { id: true, title: true }
    }
  }
})

// Query phức tạp (Prisma translates thành SQL)
const users = await prisma.user.findMany({
  where: {
    AND: [
      { email: { endsWith: '@company.com' } },
      { posts: { some: { published: true } } },
      { createdAt: { gte: new Date('2024-01-01') } }
    ]
  },
  orderBy: { name: 'asc' },
  take: 10,
  skip: 0,
  include: { _count: { select: { posts: true } } }
})

// Tạo với relations
const user = await prisma.user.create({
  data: {
    name: 'Khang',
    email: 'khang@example.com',
    posts: {
      create: [
        { title: 'Post 1', content: '...' },
        { title: 'Post 2', content: '...' }
      ]
    }
  },
  include: { posts: true }
})

// ═══════════════════════════════════════════════════════════════
// Raw SQL (khi cần optimize hoặc ORM không hỗ trợ)
// ═══════════════════════════════════════════════════════════════

// Raw query với Prisma
const users = await prisma.$queryRaw`
  SELECT u.id, u.name, COUNT(p.id) as post_count
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  WHERE u.email LIKE ${'%@company.com'}
  GROUP BY u.id, u.name
  ORDER BY post_count DESC
  LIMIT 10
`

// Connection pool (khi không dùng ORM)
import { Pool } from 'pg'
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
)
pool.end()
```

**Trade-offs:**

| Khía cạnh | ORM | Raw SQL |
|-----------|-----|---------|
| Development speed | Nhanh hơn | Chậm hơn |
| Type safety | Có (Prisma) | Không |
| Security | Tự động escape (chống injection) | Phải tự làm |
| Performance | OK (với query tối ưu) | Tốt hơn (control tối đa) |
| Readability | Tốt hơn | Kém hơn (với complex queries) |
| Complex queries | Hạn chế | Không giới hạn |

---

## Phần 3: Web Security (75 phút)

### 3.1. Authentication vs Authorization - Hai khái niệm dễ nhầm lẫn

```
┌─────────────────────────────────────────────────────────────────┐
│         AUTHENTICATION vs AUTHORIZATION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AUTHENTICATION (Xác thực) - "BẠN LÀ AI?"                     │
│  ────────────────────────────────────────────────────────────────  │
│  Xác minh identity của user                                    │
│                                                                  │
│  Methods:                                                       │
│  ├── Password + Username                                       │
│  ├── OAuth 2.0 (Google, GitHub login)                          │
│  ├── SSO (Single Sign-On)                                       │
│  ├── Biometric (fingerprint, face)                            │
│  ├── Magic link / Passwordless email                          │
│  └── Multi-factor (2FA: SMS, TOTP, Hardware key)              │
│                                                                  │
│  Result: Đăng nhập thành công → nhận token/session          │
│                                                                  │
│  ────────────────────────────────────────────────────────────────  │
│  AUTHORIZATION (Phân quyền) - "BẠN ĐƯỢC LÀM GÌ?"          │
│  ────────────────────────────────────────────────────────────────  │
│  Kiểm tra quyền hạn của user đã authenticate                │
│                                                                  │
│  Models:                                                        │
│  ├── RBAC (Role-Based Access Control)                          │
│  │   ├── admin: full access                                  │
│  │   ├── editor: read + write                               │
│  │   └── viewer: read only                                  │
│  ├── ABAC (Attribute-Based Access Control)                    │
│  │   ├── user.department == 'engineering'                   │
│  │   └── resource.owner == user.id                            │
│  └── PBAC (Permission-Based Access Control)                   │
│      └── permissions: ['users:read', 'users:write']          │
│                                                                  │
│  Result: Được phép HOẶC bị từ chối thực hiện action       │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2. Session-based vs JWT Authentication

**Session-based Authentication:**

```
┌─────────────────────────────────────────────────────────────────┐
│              SESSION-BASED AUTHENTICATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. LOGIN                                                        │
│  Client                         Server                            │
│    │                               │                               │
│    │──── POST /login ─────────────▶│                                │
│    │       username + password     │                                │
│    │                               │                                │
│    │                          ┌────▼─────┐                       │
│    │                          │ Verify   │                       │
│    │                          │ password │                       │
│    │                          └────┬─────┘                       │
│    │                               │                                │
│    │                          ┌────▼─────┐                       │
│    │                          │ Create   │                       │
│    │                          │ session  │                       │
│    │                          │ in Redis  │                       │
│    │                          │(or DB)   │                       │
│    │                          └────┬─────┘                       │
│    │                               │                                │
│    │◀─── Set-Cookie: session_id=xyz ───│                          │
│    │       (HttpOnly, Secure, SameSite=Lax)                       │
│    │                               │                                │
│  2. SUBSEQUENT REQUESTS                                         │
│    │──── GET /api/data ───────────▶│                                │
│    │       Cookie: session_id=xyz  │                                │
│    │                               │                                │
│    │                          ┌────▼─────┐                       │
│    │                          │ Lookup   │                       │
│    │                          │ session  │                       │
│    │                          │ in Redis │                       │
│    │                          └────┬─────┘                       │
│    │                               │                                │
│    │◀─── Response ─────────────────│                                │
│    │                               │                                │
│  3. LOGOUT                                                      │
│    │──── POST /logout ───────────▶│                                │
│    │                               │                                │
│    │                          ┌────▼─────┐                       │
│    │                          │ Delete   │                       │
│    │                          │ session  │                       │
│    │                          │ from     │                       │
│    │                          │ Redis    │                       │
│    │                          └────┬─────┘                       │
│    │                               │                                │
│    │◀─── Set-Cookie: session_id=; ─│                              │
│    │       Max-Age=0 (xóa cookie)  │                               │
│    │                               │                                │
└─────────────────────────────────────────────────────────────────┘

Ưu điểm:
✓ Dễ revoke (xóa session trong Redis → token immediately invalid)
✓ Token nhỏ (session ID ~32 bytes)
✓ Secret server-side, client không thể forge
✓ Built-in logout (xóa session = logout instant)

Nhược điểm:
✗ Server cần session store (Redis/DB)
✗ Session lookup tốn thêm latency
✗ Scaling khó hơn (cần shared session store)
```

**JWT Authentication:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  JWT AUTHENTICATION                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  JWT STRUCTURE:                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9              │       │
│  │         │                                                │       │
│  │    Base64Url(Header)                                  │       │
│  └─────────────────────────────────────────────────────┘       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │  .eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNzQ2...       │       │
│  │         │                                                │       │
│  │    Base64Url(Payload)                                 │       │
│  └─────────────────────────────────────────────────────┘       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │  .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c       │       │
│  │         │                                                │       │
│  │    HMAC-SHA256(Header.Payload, Secret)                 │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                  │
│  PAYLOAD EXAMPLE:                                              │
│  {                                                            │
│    "sub": "user_123",          // Subject (user ID)           │
│    "name": "Khang",             // Tên user                   │
│    "role": "admin",             // QUYỀN Ở ĐÂY!               │
│    "iat": 1715164800,           // Issued at (Unix timestamp)  │
│    "exp": 1715251200            // Expiration (1 day)         │
│  }                                                            │
│                                                                  │
│  1. LOGIN (tương tự session, nhưng trả về JWT)             │
│  Client                         Server                            │
│    │──── POST /login ─────────────▶│                                │
│    │                               │                                │
│    │                          ┌────▼─────┐                       │
│    │                          │ Verify   │                       │
│    │                          │ password │                       │
│    │                          └────┬─────┘                       │
│    │                               │                                │
│    │                               │ Create JWT                    │
│    │                               │ (Server-side secret)          │
│    │                               │                                │
│    │◀─── { token: "eyJ..." } ───│                               │
│    │                               │                                │
│  2. SUBSEQUENT REQUESTS                                         │
│    │──── GET /api/data ───────────▶│                                │
│    │       Authorization:          │                                │
│    │       Bearer eyJ...           │                                │
│    │                               │                                │
│    │                          ┌────▼─────┐                       │
│    │                          │ Verify   │                       │
│    │                          │ JWT sig  │                       │
│    │                          │ + exp    │                       │
│    │                          │ (NO DB!) │                       │
│    │                          └────┬─────┘                       │
│    │                               │                                │
│    │◀─── Response ─────────────────│                                │
│    │                               │                                │
│  3. REVOKE? (Khó khăn)                                       │
│    │ Không có central store → khó revoke ngay lập tức          │
│    │ Solutions:                                                │
│    │ ├── Blacklist (store revoked tokens in Redis)            │
│    │ ├── Short expiry (access: 15 phút)                      │
│    │ └── Refresh token (lưu trong DB)                         │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3. CORS - Cross-Origin Resource Sharing

CORS là cơ chế bảo mật của browser. Browser chặn requests từ một origin đến origin khác trừ khi server cho phép.

```
┌─────────────────────────────────────────────────────────────────┐
│                      SAME-ORIGIN POLICY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Origin = Protocol + Domain + Port                               │
│                                                                  │
│  http://example.com:3000                                        │
│       │         │           │                                      │
│       ▼         ▼           ▼                                      │
│  protocol   domain     port                                     │
│                                                                  │
│  Same Origin:                                                  │
│  ✓ http://example.com:3000 → http://example.com:3000          │
│  ✓ http://example.com → http://example.com:443 (default)      │
│                                                                  │
│  Different Origin:                                             │
│  ✗ http://localhost:3000 → http://localhost:5173             │
│  ✗ http://example.com → http://api.example.com                │
│  ✗ http://example.com → https://example.com                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     CORS WORKFLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. SIMPLE REQUEST (không preflight)                           │
│  Browser                        Server                            │
│    │──── GET /api/data ───────────▶│                                │
│    │    Origin: localhost:5173    │                                │
│    │                               │                                │
│    │◀─── 200 OK ──────────────────│                                │
│    │    Access-Control-Allow-      │                                │
│    │    Origin: *                │                                │
│    │                               │                                │
│    │ Nếu header không có → Browser chặn response!              │
│                                                                  │
│  2. PREFLIGHTED REQUEST (complex request)                     │
│  Browser                        Server                            │
│    │──── OPTIONS /api/data ───────▶│                                │
│    │    Origin: localhost:5173    │                                │
│    │    Access-Control-Request-   │                                │
│    │    Method: POST             │                                │
│    │    Access-Control-Request-   │                                │
│    │    Headers: Content-Type    │                                │
│    │                               │                                │
│    │◀─── 204 No Content ─────────│                                │
│    │    Access-Control-Allow-      │                                │
│    │    Origin: http://localhost:5173│                              │
│    │    Access-Control-Allow-      │                                │
│    │    Methods: GET, POST, PUT   │                                │
│    │    Access-Control-Allow-      │                                │
│    │    Headers: Content-Type     │                                │
│    │    Access-Control-Max-Age: 86400│                              │
│    │                               │                                │
│    │ (Cache preflight 24 giờ)    │                                │
│    │                               │                                │
│    │──── POST /api/data ───────────▶│ (Actual request)            │
│    │    Origin: localhost:5173    │                                │
│    │                               │                                │
│    │◀─── 201 Created ─────────────│                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4. OWASP Top 10 - Chi tiết từng lỗ hổng

**1. SQL Injection:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  SQL INJECTION                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  VÍ DỤ THƯỜNG GẶP:                                            │
│                                                                  │
│  BAD (concatenation):                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ const query = `SELECT * FROM users                    │   │
│  │ WHERE username = '${username}'                          │   │
│  │ AND password = '${password}'`;                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ATTACK: username = "admin' --"                               │
│  → Query trở thành:                                           │
│  SELECT * FROM users WHERE username = 'admin' --' AND password = ''│
│  → '--' comment out phần còn lại → bypass login!               │
│                                                                  │
│  ATTACK: username = "'; DROP TABLE users; --"                 │
│  → Query trở thành:                                           │
│  SELECT * FROM users WHERE username = '';                        │
│  DROP TABLE users; --' AND password = ''                       │
│  → Table users bị XÓA!                                        │
│                                                                  │
│  ATTACK: password = "' OR '1'='1"                             │
│  → Query trở thành:                                           │
│  SELECT * FROM users WHERE username = 'user' AND password = ''  │
│  OR '1'='1'                                                  │
│  → Luôn trả về ít nhất 1 row → bypass!                       │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  GOOD (parameterized query / ORM):                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ const user = await prisma.user.findFirst({           │   │
│  │   where: { username, password: hash(password) }     │   │
│  │ });                                                  │   │
│  │ // Prisma tự escape tất cả inputs                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  GOOD (raw parameterized):                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ const user = await pool.query(                        │   │
│  │   'SELECT * FROM users WHERE username = $1 AND       │   │
│  │    password = $2',                                    │   │
│  │   [username, hashedPassword]                         │   │
│  │ );                                                   │   │
│  │ // $1, $2 = parameterized → không thể inject       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**2. XSS (Cross-Site Scripting):**

```
┌─────────────────────────────────────────────────────────────────┐
│                        XSS TYPES                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. STORED XSS (Nguy hiểm nhất)                              │
│  ────────────────────────────────────────────────────────────────  │
│  Malicious script được LƯƯ vào database                        │
│                                                                  │
│  Attack flow:                                                 │
│  1. Attacker post comment:                                     │
│     "Bài viết hay!" + <script>stealCookies()</script>          │
│  2. Comment được lưu vào DB (chưa sanitize)                 │
│  3. User A đọc comment                                       │
│  4. Browser execute script → cookies bị đánh cắp              │
│                                                                  │
│  2. REFLECTED XSS                                            │
│  ────────────────────────────────────────────────────────────────  │
│  Script nằm trong URL, được "phản chiếu" trong response     │
│                                                                  │
│  URL: https://search.com?q=<script>alert(1)</script>         │
│  Response: "Kết quả tìm kiếm cho: <script>alert(1)</script>" │
│  Browser execute script!                                        │
│                                                                  │
│  3. DOM-BASED XSS                                             │
│  ────────────────────────────────────────────────────────────────  │
│  Script được execute bởi JavaScript phía client                │
│                                                                  │
│  URL: http://app.com#<img src=x onerror=alert(1)>            │
│  JS: document.write(location.hash)                            │
│  → DOM parser thấy <img> và execute onerror                   │
│                                                                  │
│  ────────────────────────────────────────────────────────────────  │
│  PHÒNG CHỐNG:                                                │
│  ├── 1. HTML Sanitization: loại bỏ <script>, event handlers │
│  │    → DOMPurify, sanitize-html                             │
│  ├── 2. Content Security Policy (CSP):                        │
│  │    → Content-Security-Policy: script-src 'self'          │
│  ├── 3. HTTPOnly Cookie: JS không đọc được cookie              │
│  │    → Set-Cookie: session=xyz; HttpOnly                    │
│  ├── 4. Output Encoding: encode HTML entities                 │
│  │    → &lt;script&gt; thay vì <script>                   │
│  └── 5. React/Vue auto-escape: template engines tự encode     │
└─────────────────────────────────────────────────────────────────┘
```

**3. CSRF (Cross-Site Request Forgery):**

```
┌─────────────────────────────────────────────────────────────────┐
│                    CSRF ATTACK                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Browser tự động gửi cookies với mọi request đến origin      │
│  đó, kể cả cross-site requests!                               │
│                                                                  │
│  ATTACK SCENARIO:                                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. User đã login ngân hàng.com (session valid)         │   │
│  │                                                        │   │
│  │ 2. User mở email từ attacker                         │   │
│  │                                                        │   │
│  │ 3. Email chứa:                                        │   │
│  │    <img src="https://nganhang.com/transfer?           │   │
│  │         to=attacker&amount=10000000" width="0" height="0">│   │
│  │    hoặc:                                              │   │
│  │    <form action="https://nganhang.com/transfer"       │   │
│  │         method="POST">                                 │   │
│  │      <input name="to" value="attacker"/>               │   │
│  │      <input name="amount" value="10000000"/>          │   │
│  │    </form>                                            │   │
│  │    <script>document.forms[0].submit()</script>        │   │
│  │                                                        │   │
│  │ 4. Browser tự động gửi:                              │   │
│  │    → GET/POST request đến nganhang.com                │   │
│  │    → Kèm cookie session của user                     │   │
│  │    → Server không phân biệt được đây là request      │   │
│  │      từ user thật hay từ attacker                   │   │
│  │                                                        │   │
│  │ 5. Transfer thành công! 10 triệu đi đâu?           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ────────────────────────────────────────────────────────────────  │
│  PHÒNG CHỐNG:                                                │
│                                                                  │
│  1. CSRF TOKEN:                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Server tạo random token cho mỗi form:                │   │
│  │ <form>                                                │   │
│  │   <input type="hidden" name="csrf_token"               │   │
│  │          value="abc123xyz">                           │   │
│  │   ...                                                 │   │
│  │ </form>                                              │   │
│  │                                                        │   │
│  │ Server verify: token phải match với session           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  2. SameSite Cookie:                                         │
│  │ Set-Cookie: session=xyz; SameSite=Strict                 │
│  │   → Browser KHÔNG gửi cookie với cross-site requests  │
│  │                                                        │   │
│  │ SameSite=Lax: gửi cookie với top-level navigation    │
│  │ (GET request, redirect) nhưng không gửi với POST     │
│                                                                  │
│  3. Origin/Referer Header Check:                             │
│  │ Server kiểm tra Origin hoặc Referer header            │
│  │ Origin phải match với server domain                    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5. Security Headers - Defense in Depth

```typescript
// ═══════════════════════════════════════════════════════════════
// Security Headers - Middleware cho Express
// ═══════════════════════════════════════════════════════════════

import helmet from 'helmet'

app.use(helmet())

// Chi tiết từng header:

// 1. Content-Security-Policy (CSP)
// Ngăn chặn XSS bằng cách chỉ cho phép scripts từ đâu
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",                    // Mặc định chỉ từ origin
    "script-src 'self' 'nonce-{SERVER_GENERATED}'", // Scripts từ origin + nonce
    "style-src 'self' 'unsafe-inline'",     // Styles (unsafe-inline cho CSS-in-JS)
    "img-src 'self' data: https:",          // Images từ origin + data URLs + https
    "font-src 'self' https://fonts.gstatic.com", // Google Fonts
    "connect-src 'self' https://api.example.com", // API calls
    "frame-ancestors 'none'",              // Không cho embed trong iframe
    "form-action 'self'",                   // Forms chỉ submit đến origin
  ].join('; '))
  next()
})

// 2. X-Frame-Options
// Ngăn clickjacking (embed trong iframe)
res.setHeader('X-Frame-Options', 'DENY')
// 'SAMEORIGIN' cho phép cùng origin

// 3. X-Content-Type-Options
// Ngăn MIME type sniffing
res.setHeader('X-Content-Type-Options', 'nosniff')

// 4. X-XSS-Protection (legacy, browser đã deprecated)
// Nên dùng CSP thay vì
res.setHeader('X-XSS-Protection', '1; mode=block')

// 5. Strict-Transport-Security (HSTS)
// Force HTTPS
res.setHeader('Strict-Transport-Security',
  'max-age=31536000; includeSubDomains; preload')
// max-age: 1 năm
// includeSubDomains: áp dụng cho subdomains
// preload: include trong browser preload list

// 6. Referrer-Policy
// Kiểm soát referrer header
res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

// 7. Permissions-Policy
// Kiểm soát browser features
res.setHeader('Permissions-Policy',
  'camera=(), microphone=(), geolocation=(), payment=()')

// 8. Cache-Control (cho sensitive pages)
res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
res.setHeader('Pragma', 'no-cache')
res.setHeader('Expires', '0')
```

---

## Tóm tắt Buổi 3

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MENTAL MODEL - BUỔI 3                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. HTTP = NỀN TẢNG WEB                                            │
│     Methods (GET/POST/PUT/DELETE) + Status Codes + Headers         │
│     REST: Uniform Interface, Stateless, Cacheable                   │
│                                                                      │
│  2. AUTHENTICATION vs AUTHORIZATION                                 │
│     Authn: Bạn là ai? (login)                                     │
│     Authz: Bạn được làm gì? (permissions)                         │
│                                                                      │
│  3. SESSION vs JWT                                                │
│     Session: Server lưu, dễ revoke, cần store                     │
│     JWT: Self-contained, stateless, khó revoke                      │
│                                                                      │
│  4. CORS                                                          │
│     Browser policy: Origin khác nhau → chặn request               │
│     Server phải trả Access-Control-Allow-Origin                    │
│                                                                      │
│  5. SQL INJECTION                                                 │
│     Input thành SQL → DROP TABLE / bypass login                    │
│     Phòng: Parameterized query / ORM                                │
│                                                                      │
│  6. XSS                                                          │
│     Inject script vào trang web                                    │
│     Phòng: Sanitize, CSP, HTTPOnly cookie                         │
│                                                                      │
│  7. CSRF                                                          │
│     Lừa browser gửi request kèm cookie                          │
│     Phòng: CSRF token, SameSite cookie                            │
│                                                                      │
│  8. SECURITY HEADERS                                              │
│     CSP, HSTS, X-Frame-Options, X-Content-Type-Options           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Bài tập về nhà

1. Viết REST API với Express.js, bao gồm authentication middleware
2. Inspect JWT token bằng jwt.io, thử thay đổi payload
3. Cấu hình security headers cho một web app
4. Tìm hiểu: OAuth2 flow (Authorization Code, PKCE)
5. Thực hành: Sử dụng Prisma thay vì raw SQL

---

## Tài liệu tham khảo

- `demos/jwt-demo/` - JWT demo code
- `summary/mental-model.md` - Mind map tổng hợp
- https://jwt.io/ - Decode và verify JWT
- https://owasp.org/www-project-top-ten/ - OWASP Top 10
- https://developer.mozilla.org/en-US/docs/Web/HTTP - HTTP Documentation
