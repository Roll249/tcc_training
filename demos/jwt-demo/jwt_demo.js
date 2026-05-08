/**
 * Demo: JWT Inspect & Tamper
 * ===========================
 * File: jwt_demo.js
 *
 * Chạy: node jwt_demo.js
 *
 * Demo này minh họa:
 * 1. Cách decode JWT mà không cần secret
 * 2. Cách verify JWT với secret
 * 3. Tại sao chỉ sửa payload là không đủ
 * 4. Cách server verify token
 */

const jwt = require('jsonwebtoken')

// ============================================================
// PHẦN 1: Decode JWT (không cần secret)
// ============================================================

console.log("=".repeat(60))
console.log("PHẦN 1: Decode JWT - Không cần secret!")
console.log("=".repeat(60))

// Token mẫu (payload: { sub: 'user_1', role: 'user' })
const token = jwt.sign(
    { sub: 'user_1', role: 'user', iat: Math.floor(Date.now() / 1000) },
    'my-super-secret-key',
    { expiresIn: '1h' }
)

console.log("\n1. Token gốc:")
console.log(token)

console.log("\n2. Decode token (không verify):")
const decoded = jwt.decode(token)
console.log(JSON.stringify(decoded, null, 2))
// Output: { sub: 'user_1', role: 'user', iat: 1234567890, exp: 1234571490 }

console.log("\n3. Decode từng phần (base64 decode):")
const parts = token.split('.')
console.log(`   Header:    ${parts[0]}`)
console.log(`   Payload:   ${parts[1]}`)
console.log(`   Signature: ${parts[2]}`)

console.log("\n4. Decode header (base64):")
const header = JSON.parse(Buffer.from(parts[0], 'base64').toString())
console.log(JSON.stringify(header, null, 2))
// Output: { alg: 'HS256', typ: 'JWT' }

console.log("\n5. Decode payload (base64):")
const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
console.log(JSON.stringify(payload, null, 2))
// Output: { sub: 'user_1', role: 'user', ... }

// ============================================================
// PHẦN 2: Verify JWT với secret
// ============================================================

console.log("\n" + "=".repeat(60))
console.log("PHẦN 2: Verify JWT - Cần secret!")
console.log("=".repeat(60))

console.log("\n1. Verify với secret ĐÚNG:")
try {
    const verified = jwt.verify(token, 'my-super-secret-key')
    console.log("   ✓ Token hợp lệ!")
    console.log(JSON.stringify(verified, null, 2))
} catch (err) {
    console.log("   ✗ Token không hợp lệ:", err.message)
}

console.log("\n2. Verify với secret SAI:")
try {
    const fakeToken = jwt.sign(
        { sub: 'user_1', role: 'admin' },  // Attacker muốn làm admin
        'attacker-secret-key'
    )
    const verified = jwt.verify(fakeToken, 'my-super-secret-key')
    console.log("   ✓ Token hợp lệ!")
} catch (err) {
    console.log("   ✗ Token không hợp lệ!")
    console.log(`   Error: ${err.name} - ${err.message}`)
}

// ============================================================
// PHẦN 3: Tamper payload - Tại sao không hoạt động?
// ============================================================

console.log("\n" + "=".repeat(60))
console.log("PHẦN 3: Tamper Payload - Demo tại sao KHÔNG hoạt động")
console.log("=".repeat(60))

console.log("\n1. Tạo header.payload giả mạo:")
const tamperedHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
const tamperedPayload = Buffer.from(JSON.stringify({
    sub: 'user_1',
    role: 'admin',      // ← Attacker muốn thành admin!
    exp: Math.floor(Date.now() / 1000) + 3600
})).toString('base64url')

console.log(`   Header giả:    ${tamperedHeader}`)
console.log(`   Payload giả:   ${tamperedPayload}`)

console.log("\n2. Tạo token với payload giả:")
// ⚠️ Dùng secret khác để sign!
const tamperedToken = `${tamperedHeader}.${tamperedPayload}.fake-signature`
console.log(`   Token: ${tamperedToken}`)

console.log("\n3. Server verify token giả:")
try {
    const verified = jwt.verify(tamperedToken, 'my-super-secret-key')
    console.log("   ✓ Token hợp lệ!")
} catch (err) {
    console.log("   ✗ Token không hợp lệ!")
    console.log(`   Error: ${err.name}`)
    console.log("   Lý do: Signature không khớp với secret của server!")
}

// ============================================================
// PHẦN 4: Server-side authentication flow
// ============================================================

console.log("\n" + "=".repeat(60))
console.log("PHẦN 4: Server-side Authentication Flow")
console.log("=".repeat(60))

console.log("\n1. Đăng nhập -> Server tạo JWT:")

function login(username, password) {
    // Verify credentials (giả định)
    if (username === 'khang' && password === 'secret123') {
        const token = jwt.sign(
            {
                sub: 'user_123',
                username: 'khang',
                role: 'user',      // ← Không phải admin!
                exp: Math.floor(Date.now() / 1000) + 3600
            },
            process.env.JWT_SECRET || 'my-super-secret-key',
            { expiresIn: '1h' }
        )
        return { success: true, token }
    }
    return { success: false, error: 'Invalid credentials' }
}

const loginResult = login('khang', 'secret123')
console.log("   Login result:", loginResult)

console.log("\n2. Gửi request với token:")
const requestHeaders = {
    'Authorization': `Bearer ${loginResult.token}`,
    'Content-Type': 'application/json'
}
console.log("   Headers:", JSON.stringify(requestHeaders, null, 2))

console.log("\n3. Middleware verify token:")
function verifyToken(token) {
    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'my-super-secret-key'
        )
        return { valid: true, user: decoded }
    } catch (err) {
        return { valid: false, error: err.message }
    }
}

const verifyResult = verifyToken(loginResult.token)
console.log("   Verify result:", verifyResult)

console.log("\n4. Kiểm tra quyền (Authorization):")
function checkPermission(user, action) {
    const permissions = {
        user: ['read', 'write:own'],
        admin: ['read', 'write', 'delete']
    }
    const userPerms = permissions[user.role] || []
    return userPerms.includes(action) || userPerms.includes('write:own')
}

const canDelete = checkPermission(verifyResult.user, 'delete')
console.log(`   User có quyền delete? ${canDelete ? '✓ Có' : '✗ Không'}`)
console.log("   (Role 'user' không có quyền delete)")

// ============================================================
// PHẦN 5: JWT Expiration & Refresh
// ============================================================

console.log("\n" + "=".repeat(60))
console.log("PHẦN 5: JWT Expiration & Refresh Token")
console.log("=".repeat(60))

console.log("\n1. Tạo access token ngắn hạn:")
const accessToken = jwt.sign(
    { sub: 'user_1', type: 'access' },
    'my-super-secret-key',
    { expiresIn: '15m' }  // ← 15 phút
)
console.log(`   Access token: ${accessToken.substring(0, 50)}...`)

console.log("\n2. Tạo refresh token dài hạn:")
const refreshToken = jwt.sign(
    { sub: 'user_1', type: 'refresh' },
    'my-super-secret-key',
    { expiresIn: '7d' }  // ← 7 ngày
)
console.log(`   Refresh token: ${refreshToken.substring(0, 50)}...`)

console.log("\n3. Access token hết hạn:")
const expiredToken = jwt.sign(
    { sub: 'user_1' },
    'my-super-secret-key',
    { expiresIn: '-1s' }  // ← Đã hết hạn!
)

try {
    jwt.verify(expiredToken, 'my-super-secret-key')
} catch (err) {
    console.log(`   ✗ Token expired!`)
    console.log(`   Error: ${err.name}`)
    console.log("   → Client cần dùng refresh token để lấy access token mới")
}

// ============================================================
// TÓM TẮT
// ============================================================

console.log("\n" + "=".repeat(60))
console.log("TÓM TẮT: JWT Security")
console.log("=".repeat(60))
console.log(`
1. Payload có thể decode dễ dàng (base64)
   → KHÔNG BAO GIỜ lưu thông tin nhạy cảm trong payload!

2. Signature chống lại việc sửa payload
   → Nếu sửa payload, signature không khớp → REJECTED

3. Secret key phải được giữ bí mật
   → Server giữ secret, client chỉ nhận token

4. JWT dễ bị đánh cắp
   → Nếu token bị leak, kẻ tấn công dùng được đến khi hết hạn
   → Giải pháp: Short expiry + Refresh token + Blacklist

5. Các best practice:
   - Dùng thuật toán mạnh (HS256, RS256)
   - Không lưu secret trong code (dùng environment variables)
   - Kiểm tra expiration (exp)
   - Verify issuer (iss) và audience (aud) khi cần
   - Dùng HTTPOnly cookie thay vì localStorage để tránh XSS
`)
