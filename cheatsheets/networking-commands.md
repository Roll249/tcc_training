# Cheat Sheet: Các lệnh Networking thường dùng

> Dành cho sinh viên CLB TCC Hoc Thuat - Software Engineering Fundamentals

## DNS & Name Resolution

```bash
# Tra cứu DNS
dig example.com                              # Thông tin DNS đầy đủ
dig +short example.com                       # Chỉ lấy IP
dig MX example.com                           # Tra record MX (email)
dig NS example.com                           # Tra record NS (nameservers)
dig TXT example.com                          # Tra record TXT
dig -x 93.184.216.34                         # Reverse DNS lookup

# nslookup (cũ hơn, vẫn dùng được)
nslookup example.com                         # Tra cứu DNS
nslookup -type=MX example.com                # Tra MX record

# host
host example.com                             # Tra cứu đơn giản
host -a example.com                          # Tra cứu đầy đủ

# /etc/hosts - Local DNS override
sudo nano /etc/hosts
# Format: IP_ADDRESS    hostname
127.0.0.1    localhost
192.168.1.100    my-app.local
::1            localhost ip6-localhost ip6-loopback

# Flush DNS cache (Arch Linux)
sudo systemd-resolve --flush-caches
# Hoặc:
sudo resolvectl flush-caches
```

## Connectivity Testing

```bash
# Ping - Kiểm tra kết nối cơ bản
ping example.com                              # Ping liên tục
ping -c 4 example.com                         # Ping 4 lần rồi dừng
ping -i 2 example.com                         # Ping mỗi 2 giây
ping -s 100 example.com                       # Ping với packet size 100 bytes

# Traceroute - Xem đường đi packet
traceroute example.com                        # Linux
traceroute -I example.com                    # Dùng ICMP (nhanh hơn)
traceroute -T example.com                    # Dùng TCP
traceroute -m 15 example.com                 # Max 15 hops
traceroute -n example.com                    # Không resolve hostname

# mtr - Kết hợp ping + traceroute
mtr example.com                              # Chạy liên tục
mtr -r -c 10 example.com                     # Báo cáo 10 lần rồi dừng
mtr -rw example.com                          # Wide report (tất cả hops)
```

## HTTP / Web Requests

```bash
# curl - HTTP Client mạnh mẽ nhất
curl https://example.com                      # GET request đơn giản
curl -v https://example.com                  # Verbose (xem headers)
curl -i https://example.com                  # In luôn response headers
curl -I https://example.com                  # Chỉ headers

# Methods
curl -X GET https://example.com/api/users   # Explicit GET
curl -X POST https://example.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Khang","email":"khang@example.com"}'
curl -X PUT https://example.com/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Khang Updated"}'
curl -X DELETE https://example.com/api/users/1

# Headers
curl -H "Authorization: Bearer TOKEN" \
  -H "Accept: application/json" \
  https://api.example.com/data

# Download
curl -O https://example.com/file.zip         # Download file
curl -o custom-name.zip https://example.com/file.zip  # Tên custom
curl -L -O https://example.com/redirect.zip  # Follow redirects

# Advanced
curl -x http://proxy:8080 example.com         # Qua proxy
curl --max-time 10 example.com               # Timeout 10s
curl -u username:password example.com         # Basic auth
curl -k https://example.com                   # Bỏ qua SSL verification
curl -w "%{http_code}" -s -o /dev/null url    # Chỉ lấy status code
```

## Port Scanning & Listening

```bash
# netstat - Kiểm tra ports và connections
netstat -tulpn                               # Listening ports
netstat -tulpn | grep LISTEN                # Chỉ listening
netstat -an                                   # Tất cả connections
netstat -r                                    # Routing table
netstat -i                                    # Network interfaces
netstat -s                                    # Statistics

# ss - Socket Statistics (netstat thế hệ mới)
ss -tulpn                                    # Listening ports (nhanh hơn netstat)
ss -tulpn | grep :3000                      # Kiểm tra port 3000
ss -tunap                                    # Tất cả connections
ss -ltn                                      # Chỉ listening TCP
ss -ltnp                                     # Với process name
ss -s                                        # Summary statistics

# nc (netcat) - TCP/UDP swiss army knife
nc -l 8080                                   # Listen trên port 8080
nc localhost 8080                            # Connect đến port
nc -zv example.com 80                        # Scan port (z=zero-I/O, v=verbose)
nc -zv example.com 20-30                     # Scan range
echo "hello" | nc localhost 8080             # Gửi data qua connection
```

## Network Interfaces

```bash
# ip - Quản lý network interfaces
ip addr                                       # Xem IP addresses (tương đựng ifconfig)
ip addr show
ip link set eth0 up                          # Up interface
ip link set eth0 down                        # Down interface
ip addr add 192.168.1.100/24 dev eth0        # Add IP tạm
ip route                                     # Xem routing table
ip route show
ip route add default via 192.168.1.1         # Add default gateway

# ifconfig (cũ hơn, vẫn có trên nhiều hệ thống)
ifconfig                                     # Xem tất cả interfaces
ifconfig eth0                                 # Xem interface cụ thể
ifconfig eth0 up                              # Up interface
```

## SSL / TLS Certificate

```bash
# openssl - Làm việc với certificates
openssl s_client -connect example.com:443     # Test SSL connection
openssl s_client -connect example.com:443 -sess_out /tmp/sess.pem
openssl s_client -connect example.com:443 -showcerts
openssl s_client -connect example.com:443 \
  -servername example.com                    # SNI support

# Certificate info
openssl x509 -in certificate.crt -text -noout # Xem certificate details
openssl x509 -in certificate.crt -noout -dates # Xem expiry dates
openssl x509 -in certificate.crt -noout -fingerprint  # Fingerprint

# Verify
openssl verify certificate.crt               # Verify certificate
openssl s_client -connect example.com:443 </dev/null 2>/dev/null | \
  openssl x509 -noout -dates                  # Check SSL expiry

# Generate self-signed certificate (dev)
openssl req -x509 -newkey rsa:4096 \
  -keyout key.pem -out cert.pem \
  -days 365 -nodes \
  -subj "/CN=localhost"
```

## SSH

```bash
# Kết nối SSH
ssh user@hostname                             # Port mặc định (22)
ssh -p 2222 user@hostname                    # Port khác 22
ssh -i ~/.ssh/key.pem user@hostname          # Private key
ssh -L 3000:localhost:3000 user@hostname     # Local port forwarding
ssh -R 8080:localhost:80 user@hostname       # Remote port forwarding
ssh -D 1080 user@hostname                    # SOCKS proxy

# SSH Config (~/.ssh/config)
Host myserver
    HostName example.com
    User khang
    Port 2222
    IdentityFile ~/.ssh/mykey
    ForwardAgent yes

# SSH tunnel
ssh -L 5432:localhost:5432 user@db-server   # Local port forwarding DB
# Giờ kết nối localhost:5432 sẽ đến db-server:5432

# Copy file qua SSH
scp file.txt user@hostname:/path/            # Upload
scp user@hostname:/path/file.txt ./          # Download
scp -r ./folder user@hostname:/path/         # Copy folder
scp -P 2222 file.txt user@hostname:/path/    # Port custom

# rsync qua SSH
rsync -avz -e ssh ./local/ user@hostname:/path/  # Sync folder
rsync -avz --delete ./local/ user@hostname:/path/ # Sync + delete extras
```

## Firewall (iptables / nftables)

```bash
# iptables - Firewall trên Linux
sudo iptables -L                              # Liệt kê rules
sudo iptables -L -n -v                       # Chi tiết hơn
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT  # Allow SSH
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT  # Allow HTTP
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT # Allow HTTPS
sudo iptables -A INPUT -j DROP               # Drop all others

# UFW - Frontend cho iptables (Ubuntu/Debian)
sudo ufw status                               # Trạng thái
sudo ufw allow ssh                            # Allow SSH
sudo ufw allow 80/tcp                        # Allow HTTP
sudo ufw allow 3000:4000/tcp                 # Allow port range
sudo ufw deny 3306/tcp                       # Block MySQL
sudo ufw enable                               # Bật firewall
sudo ufw disable                              # Tắt firewall
sudo ufw delete allow 80/tcp                  # Xóa rule
sudo ufw reset                                # Reset về mặc định

# nftables - Thế hệ mới (Arch Linux)
sudo nft list ruleset                         # Liệt kê rules
```

## Wireshark / tcpdump

```bash
# tcpdump - Packet analyzer (command line)
sudo tcpdump                                  # Capture packets (cần sudo)
sudo tcpdump -i eth0                         # Capture trên interface cụ thể
sudo tcpdump -i any                          # Tất cả interfaces
sudo tcpdump port 80                         # Chỉ port 80
sudo tcpdump host example.com                # Chỉ traffic với host
sudo tcpdump -w capture.pcap                 # Ghi vào file (để xem bằng Wireshark)
sudo tcpdump -r capture.pcap                 # Đọc file đã capture

# Filter expressions
sudo tcpdump 'tcp port 80 and host example.com'
sudo tcpdump 'tcp[tcpflags] & tcp-syn != 0'   # Chỉ SYN packets
sudo tcpdump -i eth0 'dst port 443'
sudo tcpdump -i eth0 'src 192.168.1.100'

# Advanced
sudo tcpdump -i eth0 -vvv                   # Verbose level 3
sudo tcpdump -i eth0 -c 100                  # Chỉ capture 100 packets
sudo tcpdump -i eth0 -s 0                    # Capture full packets (không truncate)
sudo tcpdump -i eth0 -C 10 -W 5 -w /tmp/capture  # Rotate files
```

## WHOIS & IP Lookup

```bash
# WHOIS
whois example.com                             # WHOIS lookup
whois 93.184.216.34                           # WHOIS IP address

# IP lookup
curl ipinfo.io                                # IP info của bạn
curl ipinfo.io/8.8.8.8                       # IP info cụ thể
curl ifconfig.me                              # Public IP của bạn
```

## HTTP Headers & Security

```bash
# Xem headers
curl -I https://example.com                   # HEAD request
curl -D - https://example.com                # Dump headers ra stdout

# Security headers check
curl -sI https://example.com | grep -i security

# Common security headers
# Strict-Transport-Security (HSTS)
# X-Frame-Options
# X-Content-Type-Options
# Content-Security-Policy
# X-XSS-Protection

# CORS headers
curl -v -H "Origin: http://localhost:3000" \
  https://api.example.com/users 2>&1 | \
  grep -i access-control
```

## DNS over HTTPS (DoH)

```bash
# Curl với DoH
curl --doh-url https://dns.google/dns-query \
  https://example.com

# drill (thay thế dig, có hỗ trợ DoH)
drill -D example.com @https://dns.google/dns-query

# Các DoH providers phổ biến
# https://dns.google/dns-query (Google)
# https://cloudflare-dns.com/dns-query (Cloudflare)
# https://dns.quad9.net/dns-query (Quad9)
```

## Quick Reference - HTTP Status Codes

| Code | Ý nghĩa | Khi nào thấy |
|------|---------|---------------|
| 200 | OK | Request thành công |
| 201 | Created | Tạo resource mới |
| 204 | No Content | Thành công, không có body |
| 301 | Moved Permanently | Chuyển hướng vĩnh viễn |
| 302 | Found | Chuyển hướng tạm thời |
| 304 | Not Modified | Dùng cache |
| 400 | Bad Request | Request sai format |
| 401 | Unauthorized | Chưa authenticate |
| 403 | Forbidden | Không có quyền |
| 404 | Not Found | Resource không tồn tại |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Server Error | Lỗi server |
| 502 | Bad Gateway | Proxy nhận response lỗi |
| 503 | Service Unavailable | Server quá tải |
| 504 | Gateway Timeout | Proxy chờ quá lâu |
