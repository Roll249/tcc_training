# JWT Demo - Inspect & Tamper

## Giới thiệu

Demo này minh họa cách JWT hoạt động, cách decode payload, và tại sao chỉ sửa payload mà không có secret thì không thể bypass được authentication.

## Cài đặt

```bash
cd demos/jwt-demo
npm install
node jwt_demo.js
```

## Các phần trong demo

### Phần 1: Decode JWT (không cần secret)

```javascript
// Decode payload dễ dàng bằng base64
const parts = token.split('.')
const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
console.log(payload)
```

**Kết quả:**

```json
{
  "sub": "user_1",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Phần 2: Verify JWT (cần secret)

```javascript
// Verify thành công
jwt.verify(token, 'my-super-secret-key')  // ✓ OK

// Verify với sai secret
jwt.verify(token, 'wrong-key')  // ✗ JsonWebTokenError
```

### Phần 3: Tại sao tamper payload không hoạt động

```
1. Attacker decode token, đổi role: "user" -> "admin"
2. Tạo header.payload mới với payload đã sửa
3. Tạo signature giả với secret của attacker
4. Gửi token đến server

Server:
5. Nhận token, decode payload: role = "admin" ✓
6. Verify signature với SERVER SECRET
7. Signature KHÔNG khớp ✗
8. → REJECTED! Request bị từ chối.
```

### Phần 4: Server-side authentication flow

```javascript
// 1. Login → Server tạo JWT
const token = jwt.sign({ sub: 'user_1', role: 'user' }, secret, { expiresIn: '1h' })

// 2. Client gửi request kèm token
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

// 3. Middleware verify
jwt.verify(token, secret)  // throws if invalid

// 4. Check permissions
if (user.role !== 'admin') return 403
```

### Phần 5: Access token vs Refresh token

```
Access Token (15 phút):
- Dùng để gọi API
- Hết hạn nhanh để giảm thiểu rủi ro

Refresh Token (7 ngày):
- Dùng để lấy access token mới
- Lưu trữ cẩn thận hơn (HttpOnly cookie)

Flow:
1. Login → Server trả access_token + refresh_token
2. Gọi API với access_token
3. Access hết hạn → Dùng refresh_token lấy access mới
4. Refresh hết hạn → Phải login lại
```

## JWT Structure

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9                     │
│   └─ Header (base64url)                                     │
│       {"alg":"HS256","typ":"JWT"}                           │
│                                                             │
│   .                                                         │
│   eyJzdWIiOiJ1c2VyXzEiLCJyb2xlIjoidXNlciIsImV4cCI6MTYz    │
│   └─ Payload (base64url)                                     │
│       {"sub":"user_1","role":"user","exp":163...}            │
│       ├── Registered claims: iss, sub, exp, iat, aud         │
│       ├── Public claims: tên tùy ý (role, name...)           │
│       └── Private claims: thỏa thuận giữa 2 bên             │
│                                                             │
│   .                                                         │
│   SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c             │
│   └─ Signature (HMACSHA256)                                 │
│       HMACSHA256(header.payload, secret_key)                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Security Best Practices

### NÊN

- [ ] Lưu JWT trong HttpOnly cookie (không phải localStorage - tránh XSS)
- [ ] Dùng short expiry (15-60 phút)
- [ ] Dùng refresh token để extend session
- [ ] Verify signature với thuật toán cụ thể (HS256, RS256)
- [ ] Kiểm tra expiration (`exp`) và issued at (`iat`)
- [ ] Dùng HTTPS luôn luôn
- [ ] Revoke token khi user logout (blacklist)

### KHÔNG NÊN

- [ ] Lưu thông tin nhạy cảm (password, credit card) trong payload
- [ ] Dùng secret quá đơn giản
- [ ] Dùng algorithm "none" (không có signature!)
- [ ] Không verify signature
- [ ] Để token trong URL (sẽ bị ghi vào server logs)

## Bài tập thực hành

1. **Decode token thủ công:** Lấy một JWT từ internet, decode từng phần bằng base64
2. **Thử tamper:** Tạo token với payload `{ admin: true }`, verify với secret sai → xem lỗi gì
3. **Implement blacklist:** Tạo Map để lưu token đã revoke
4. **So sánh với session:** Implement cả 2 cách để thấy sự khác biệt
