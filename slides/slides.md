---
theme: default
background: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920
---

# Software Engineering Fundamentals

## Xây dựng Mental Model chuẩn xác

**CLB TCC Hoc Thuat**

*3 buổi x 3 tiếng = 9 tiếng bứt phá*

---

# Lộ trình 3 buổi

## Chúng ta sẽ đi từ đầu đến cuối một request

```
Trinh duyet -> Network -> Server -> Container -> OS/Kernel -> Tra loi
```

| Buổi | Chủ đề | Thời lượng |
|-------|--------|------------|
| 1 | Hệ thống & Mạng | 3 tiếng |
| 2 | Hạ tầng & Container | 3 tiếng |
| 3 | Kiến trúc & Bảo mật | 3 tiếng |

---

# Nội dung Buổi 1

## Phá vỡ "hộp đen" của máy tính

**Phần 1 (45 phút):** Operating System & Kernel

**Phần 2 (60 phút):** Đi sâu vào Linux & Terminal

**Nghỉ giải lao (15 phút)**

**Phần 3 (75 phút):** Networking Fundamentals

---

# Mục tiêu Buổi 1

## Sau buổi này, bạn sẽ hiểu:

- Software chạy TRÊN cái gì
- Kernel Space vs User Space khác nhau thế nào
- System Call là gì và hoạt động ra sao
- Linux terminal và các lệnh cơ bản
- Máy tính nói chuyện với nhau qua mạng như thế nào

---

# Operating System là gì?

## Tại sao phần mềm không thể nói chuyện trực tiếp với phần cứng?

**Vấn đề:** CPU có thể đọc/ghi bất kỳ vùng nhớ nào

**Nếu app của bạn có bug** → xóa toàn bộ ổ cứng? → **Toàn bộ hệ thống sập**

**Giải pháp:** OS đứng giữa, kiểm soát mọi thao tác với phần cứng

> "OS là người gác cổng duy nhất được phép nói chuyện với phần cứng"

---

# OS làm gì thực sự?

## 7 chức năng cốt lõi của Kernel

| Chức năng | Chi tiết | Ví dụ |
|-----------|----------|-------|
| **Process Management** | Tạo, lên lịch, dừng process | Scheduler quyết định process nào chạy khi nào |
| **Memory Management** | Cấp phát RAM cho từng process | Virtual memory - mỗi app nghĩ nó có RAM riêng |
| **File System** | Tổ chức dữ liệu trên đĩa | Đọc/ghi file an toàn |
| **Device Management** | Giao tiếp với phần cứng | Drivers cho keyboard, GPU, network card |
| **Security & Permissions** | Ai được làm gì? | File permissions (rwx), user/group |
| **Networking** | TCP/IP stack | Gửi packet ra internet |
| **IPC** | Processes giao tiếp với nhau | Pipes, sockets, shared memory |

---

# Khi bạn mở Chrome, điều gì xảy ra?

## Từ click đến hiển thị - 8 bước chi tiết

```
1. Click icon Chrome
   │
2. Desktop Environment (GNOME/KDE) nhận event
   │   Gửi message đến process "Chrome"
   │
3. Kernel kiểm tra: "Chrome được phép chạy không?"
   │   User có quyền? Đủ RAM không? File executable?
   │
4. Kernel tải Chrome binary từ disk vào RAM
   │   Cấp phát virtual memory
   │   Thiết lập namespaces (PID, network, mount...)
   │
5. Chrome bắt đầu chạy trong User Space
   │   Tạo renderer processes, GPU process
   │
6. Chrome muốn vẽ cửa sổ → gọi syscall
   │   syscall ioctl() → Kernel vẽ lên framebuffer
   │
7. GPU nhận lệnh vẽ từ Kernel
   │
8. Pixel trên màn hình!
```

---

# User Space vs Kernel Space

## Hai vùng lãnh thổ của hệ thống

```
┌────────────────────────────────────────────────────────────┐
│                      USER SPACE                             │
│     (Lập trình viên làm việc ở đây)                      │
│                                                            │
│  [App 1]     [App 2]     [App 3]      [App 4]         │
│  (Chrome)    (VS Code)   (Spotify)     (Terminal)       │
│                                                            │
│         libc (printf, malloc, socket, open...)            │
│                                                            │
│                    ▲                                        │
│                    │ syscall                                │
│                    ▼                                        │
├────────────────────────────────────────────────────────────┤
│                    KERNEL SPACE                            │
│          (root - quản lý toàn hệ thống)                  │
│                                                            │
│  [Process]  [Memory]  [File]  [Network]  [Device]       │
│  Scheduler   Manager   System   Stack       Drivers       │
│                                                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │             PHẦN CỨNG MÁY TÍNH                    │  │
│  │         CPU | RAM | Disk | Network | GPU           │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**Quan trọng:** Vi phạm ranh giới này = kernel panic hoặc crash toàn hệ thống!

---

# Khi gọi printf("Hello") - Chi tiết

## Luồng syscall hoàn chỉnh

```
┌────────────────┐                    ┌────────────────┐
│   USER SPACE   │                    │  KERNEL SPACE  │
└───────┬────────┘                    └───────┬────────┘
        │                                    │
        │  printf("Hello")                  │
        │  │                                │
        ▼  ▼                                │
   ┌─────────────┐                          │
   │  libc       │                          │
   │ (printf)    │                          │
   └──────┬──────┘                          │
          │                                  │
          │ syscall number = 1 (x86_64)       │
          │ registers:                       │
          │  rax = 1 (sys_write)            │
          │  rdi = 1 (stdout fd)            │
          │  rsi = addr_of_string            │
          │  rdx = 5 (length)               │
          │                                  │
          ├─────────────────────────────────▶│
          │                                  │
          │      Kernel xử lý:               │
          │      1. Kiểm tra fd hợp lệ?     │
          │      2. Kiểm tra quyền truy cập?  │
          │      3. Copy string từ user space │
          │      4. Gửi đến terminal driver   │
          │      5. Đánh thức terminal        │
          │         (interrupt)               │
          │                                  │
          ├◀────────────────────────────────┤
          │      Return: số bytes đã ghi    │
          │                                  │
          ▼                                  │
    "Hello" xuất hiện trên màn hình!
```

---

# System Calls - Cầu nối giữa 2 thế giới

## Những syscall quan trọng nhất cần nhớ

| Syscall | Số (x86_64) | Chức năng | Giải thích |
|---------|-------------|-----------|------------|
| `read` | 0 | Đọc từ fd | fd có thể là file, stdin, socket |
| `write` | 1 | Ghi ra fd | Ghi ra terminal, file, network |
| `open` | 2 | Mở file | Trả về file descriptor |
| `close` | 3 | Đóng fd | Giải phóng file descriptor |
| `fork` | 57 | Tạo process mới | Copy process cha |
| `execve` | 59 | Chạy chương trình khác | Thay thế process image |
| `mmap` | 9 | Ánh xạ bộ nhớ | Cấp phát RAM hoặc map file |
| `socket` | 41 | Tạo socket | Tạo endpoint mạng |
| `bind` | 49 | Bind socket | Gắn socket vào port |
| `connect` | 42 | Kết nối | Kết nối đến server |

---

# File Descriptor - Mỗi process có bảng riêng

## fd = số nguyên đại diện cho "file" đang mở

```
Process "bash" - PID 1234
├── fd 0: stdin  ──▶ /dev/pts/0 (terminal input)
├── fd 1: stdout ──▶ /dev/pts/0 (terminal output)
├── fd 2: stderr ──▶ /dev/pts/0 (error output)
├── fd 3: /etc/passwd ──▶ opened by login
├── fd 4: ~/.bashrc ────▶ opened by bash
├── fd 5: /tmp/socket ──▶ IPC socket
└── fd 6: /var/log/syslog ▶ opened by logger

"Tất cả đều là file" - thiết bị, process, socket đều là fd!
```

---

# Demo: System Calls với `strace`

## Nhìn thấy "hơi thở" của chương trình

```bash
# Theo dõi tất cả syscalls
strace ls -la /tmp

# Output thực tế:
# execve("/usr/bin/ls", ["ls", "-la", "/tmp"], 0x7ffd...) = 0
# brk(NULL)                              = 0x55a3b2c00000
# access("/etc/ld.so.preload", R_OK)     = -1 (ENOENT)
# openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY) = 3
# newfstatat(AT_FDCWD, "/tmp", {...}, 0) = 0
# getdents64(3, [...], 1024)             = 48
# write(1, "total 8\ndrwxrwxrwt  2 ...", 41) = 41
# +++ exited with 0 +++

# Count syscalls - thống kê
strace -c ls -la /tmp

# Filter chỉ syscalls cụ thể
strace -e trace=open,read,write cat /etc/hostname

# Trace child processes (fork + exec)
strace -f npm run dev

# Ghi vào file
strace -o trace.log -f ./my_program

# Attach vào process đang chạy
strace -p 12345 -f
```

---

# Demo: strace - Phân tích output

## Mỗi dòng = một syscall được gọi

```
execve("/usr/bin/ls", ["ls", "-la", "/tmp"], 0x7ffd...) = 0
│    │                        │               │
│    │    Command + args    Environment vars   Return value = 0 (success)

openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
│     │                      │                              │
│     │   Directory fd    Path to file              │      │
│     │   (AT_FDCWD = current dir)                  │      │
│     │                                             Return value = 3
│     │                                             (fd = 3)

write(1, "total 8\ndrwxr-xr-x  2 root root ...", 48) = 48
│      │ │                                           │       │
│      │ │ File descriptor (1 = stdout)             │       │
│      │ │                                         Bytes written
│      │ Data written
│      │
│      Return: số bytes thực sự ghi được

-1 (ENOENT) = lỗi: file không tồn tại
-1 (EACCES) = lỗi: permission denied
```

---

# Linux: Vì sao Software Engineer phải biết?

## 96.3% server trên thế giới chạy Linux

```
┌──────────────────────────────────────────────────────────────┐
│                    THỰC TẾ NGÀNH 2026                          │
│                                                              │
│  💻 Server Market Share                                       │
│  ├── Linux: 96.3%                                            │
│  ├── Windows Server: 3.2%                                     │
│  └── Others: 0.5%                                             │
│                                                              │
│  ☁️ Cloud Providers (tất cả đều Linux)                       │
│  ├── AWS EC2: Linux AMIs chiếm ~80%                          │
│  ├── GCP Compute Engine: 75%+ Linux                            │
│  └── Azure VMs: 60%+ Linux                                    │
│                                                              │
│  🐳 Container Ecosystem                                        │
│  ├── Docker: Linux-based                                       │
│  ├── Kubernetes: Linux nodes                                   │
│  └── Serverless (Lambda): Linux runtime                        │
│                                                              │
│  💼 Job Market                                                │
│  ├── Backend jobs: Linux là yêu cầu gần như bắt buộc        │
│  ├── DevOps/SRE: Linux + bash scripting = cơ bản             │
│  └── Cloud roles: AWS/GCP/Azure CLI đều Linux-friendly       │
└──────────────────────────────────────────────────────────────┘
```

---

# File System Hierarchy

## "Everything is a file" - Mọi thứ đều là file

```
/ (root - thư mục gốc của mọi thứ)
│
├── bin/     (essential binaries - ls, cp, mv, rm, cat)
├── sbin/    (system binaries - chỉ root chạy - fdisk, mkfs)
├── etc/     (configuration - passwd, shadow, nginx/, systemd/)
│   ├── passwd    → danh sách users
│   ├── shadow    → hashed passwords (root only!)
│   └── nginx/nginx.conf
│
├── home/    (user home directories)
│   └── khang/
│       ├── Documents/
│       └── Projects/
│
├── var/     (variable data - log, cache, web)
│   ├── log/
│   │   ├── syslog     (system log)
│   │   ├── auth.log   (login attempts)
│   │   └── nginx/
│   │       ├── access.log
│   │       └── error.log
│   ├── www/html/      (web root)
│   └── lib/docker/    (Docker data)
│
├── usr/     (user programs)
│   ├── bin/  (node, python3, git, docker)
│   └── local/ (locally installed software)
│
├── tmp/     (temporary - XÓA KHI BOOT!)
├── dev/     (device files)
│   ├── null   (black hole - ghi vào đây = mất)
│   └── sda/  (disks - sda1, sda2...)
├── proc/    (process info - filesystem ẢO)
│   └── 1/   (thông tin process PID 1)
└── sys/     (system info - kernel data)
```

---

# Giải thích chi tiết từng thư mục

## Tại sao /proc không tồn tại trên đĩa?

```
# Kiểm tra: proc mount point
df -h | grep proc
# proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)

# /proc là filesystem ẢO - không có trên disk!
# Kernel expose thông tin qua filesystem này

# Xem thông tin process
cat /proc/1/cmdline     # Command line đã chạy
cat /proc/1/environ     # Environment variables
ls -la /proc/1/fd/      # File descriptors đang mở

# CPU info
cat /proc/cpuinfo

# Memory info
cat /proc/meminfo

# Mỗi số trong /proc/ tương ứng với 1 process đang chạy!
```

---

# Processes & Threads

## Hai đơn vị thực thi trong hệ thống

```
Process "Chrome" (PID 1234)
│
├── Thread: "Main" (TID 1234)
│   ├── Stack: 8MB (function calls, local vars)
│   ├── Registers: RIP=0x401000, RSP=0x7fff...
│   └── Shared: Heap, Code, Global vars, FDs
│
├── Thread: "Renderer" (TID 1235)
│   ├── Stack: 8MB
│   └── Shared: Heap, Code, Global vars, FDs
│
├── Thread: "GPU" (TID 1236)
│   └── Shared: Heap, Code, Global vars, FDs
│
└── Shared Resources
    ├── Heap: malloc'd memory (tất cả threads dùng chung)
    ├── Code: .text segment
    ├── Global vars: .data segment
    └── Open files: FD table
```

| Đặc điểm | Process | Thread |
|-----------|---------|--------|
| Memory | Riêng biệt | Chia sẻ với process |
| Communication | Khó (pipes, sockets) | Dễ (shared memory) |
| Creation | Chậm (copy memory) | Nhanh (không copy) |
| Crash isolation | Có | Không (crash process) |

---

# Process Lifecycle

## Từ fork() đến exit()

```
                    fork()
    ┌───────────────()───────────────┐
    │                                  │
    │    Parent (bash)                │    Child (bash -c "ls")
    │    PID=1000                    │    PID=1001, PPID=1000
    │                                  │
    │                                  │    execve("/bin/ls")
    │                                  │    PID=1001, PPID=1000
    │                                  │
    │                                  │    write() ← output
    │                                  │
    │                                  │    exit(0)
    │                                  │
    │    waitpid(1001)               │
    │    (nhận exit code = 0)        │
    │                                  │
    ▼                                  ▼
 Parent tiếp tục                    Process kết thúc
 (shell prompt trở lại)
```

---

# Demo: Quản lý Processes

## Các lệnh cần nhớ

```bash
# Xem processes đang chạy
ps aux | head -20           # BSD style
ps -ef                     # System V style

# Tìm process cụ thể
ps aux | grep nginx

# Process tree
pstree                    # Tree view
pstree -p               # Với PIDs

# Realtime monitoring
top                      # Phím: M=Memory, P=CPU, k=kill, r=renice
htop                     # Giao diện đẹp hơn (cần cài)

# Kill process
kill PID                 # SIGTERM (graceful shutdown)
kill -9 PID             # SIGKILL (buộc dừng ngay)
kill -15 PID            # SIGTERM (tương đương kill thường)
kill -STOP PID          # Pause process
kill -CONT PID          # Resume process

# Kill bằng tên
pkill nginx             # Kill tất cả nginx
killall -9 chrome       # Kill tất cả chrome

# Background jobs
./script.sh &           # Chạy nền
jobs                    # Xem background jobs
fg %1                   # Đưa job #1 ra foreground
nohup ./script.sh &    # Chạy tiếp khi terminal đóng
```

---

# Process Memory Layout

## Mỗi process có không gian địa chỉ ảo riêng

```
0xFFFFFFFFFFFFFFFF  ┌─────────────────────┐  ← Kernel space (không truy cập)
                    │                     │
0xFFFF800000000000  ├─────────────────────┤  ← Kernel virtual address
                    │                     │
                    │                     │
                    ├─────────────────────┤  ← Stack (giảm xuống)
                    │   argc, argv       │
                    │   env variables     │
                    │   local variables    │
                    │   return addresses   │
                    ├─────────────────────┤
                    │   (gap/mapped)      │
                    ├─────────────────────┤  ← Heap (tăng lên)
                    │   malloc'd memory   │
0x0000000000400000  ├─────────────────────┤  ← BSS (global=0)
                    │   global vars = 0    │
                    ├─────────────────────┤  ← Data (initialized)
                    │   global vars       │
                    ├─────────────────────┤  ← Text (code)
                    │   machine code      │
0x0000000000001000  ├─────────────────────┤
0x0000000000000000  └─────────────────────┘  ← Null guard
```

---

# Permissions & Ownership

## Ai được làm gì với file nào?

```bash
# Xem quyền: rwxr-xr--
# r = read (4), w = write (2), x = execute (1)
#       Owner    Group    Others

ls -la myfile.txt
# -rw-r--r--  1 khang  staff  4096  May  8 14:00  myfile.txt
# └──┘└─┬─┘└─┬─┘
#     │    │   └── Others (r-- = read only)
#     │    └── Group (r-- = read only)
#     └── Owner (rw- = read + write)

# Chmod numeric - mỗi số = tổng r(4)+w(2)+x(1)
chmod 755 script.sh     # rwxr-xr-x (7=owner, 5=group, 5=others)
chmod 644 file.txt      # rw-r--r-- (6=owner, 4=group, 4=others)
chmod 600 secret.key    # rw------- (6=owner, 0=group, 0=others)
chmod 4711 binary       # rws--x--x (setuid bit!)

# Chmod symbolic
chmod u+x file.sh       # Thêm execute cho owner
chmod g-w file.txt      # Bỏ write cho group
chmod a+x script.sh     # Thêm execute cho all
chmod u=rw,go=r file    # Set owner=rw, others=readonly

# Special permissions
chmod u+s /usr/bin/passwd   # Setuid - chạy với quyền owner
chmod +t /tmp/               # Sticky bit - chỉ owner xóa file
```

---

# ACL - Access Control Lists

## Chi tiết hơn rwx - kiểm soát theo user cụ thể

```bash
# Xem ACL
getfacl file.txt

# Thêm user cụ thể
setfacl -m u:khang:rw file          # khang có read+write
setfacl -m u:bob:r file             # bob chỉ có read
setfacl -m g:staff:rx dir/          # group staff có read+execute

# Xóa ACL
setfacl -x u:khang file              # Xóa ACL entry của khang

# Set mask (giới hạn max permissions)
setfacl -m m::rx file               # Max permissions = r-x

# Default ACL (tự động áp dụng cho file mới trong directory)
setfacl -m d:u:visitor:r dir/       # File mới trong dir: visitor đọc được
```

---

# Networking: OSI vs TCP/IP

## Hai mô hình tham chiếu - Đừng học thuộc, hãy hiểu!

```
┌──────────────────────────────────────────────────────────┐
│                      MÔ HÌNH OSI (7 TẦNG)                │
├────────┬─────────────────────────────────────────────────┤
│ Tầng 7 │ Application  │ HTTP, FTP, SMTP, DNS           │
│ Tầng 6 │ Presentation │ SSL/TLS, JSON, ASCII            │
│ Tầng 5 │ Session      │ NetBIOS, RPC                    │
│ Tầng 4 │ Transport    │ TCP (tin cậy), UDP (nhanh)     │
│ Tầng 3 │ Network      │ IP (định tuyến)                │
│ Tầng 2 │ Data Link    │ Ethernet, WiFi (MAC addresses) │
│ Tầng 1 │ Physical     │ Cáp mạng, tín hiệu điện       │
├────────┴─────────────────────────────────────────────────┤
│                      TCP/IP (4 TẦNG)                     │
├────────┬─────────────────────────────────────────────────┤
│ Tầng 4 │ Application │ HTTP, DNS, SSH, FTP              │
│ Tầng 3 │ Transport  │ TCP, UDP                         │
│ Tầng 2 │ Internet   │ IP, ICMP, ARP                    │
│ Tầng 1 │ Link       │ Ethernet, WiFi                    │
└────────┴─────────────────────────────────────────────────┘

MẸO NHỚ: "A-P-S-N-T-N-L" → Application → Physical
Hoặc: "Please Do Not Throw Sausage Pizza Away"
(P)hysical-(D)ata-(N)etwork-(T)ransport-(S)ession-(P)resentation-(A)pplication
```

---

# TCP vs UDP

## Hai giao thức Transport - "Anh em sinh đôi khác tính"

| Đặc điểm | TCP | UDP |
|-----------|-----|-----|
| Độ tin cậy | Đảm bảo đến đúng | Không đảm bảo |
| Thứ tự packet | Giữ đúng thứ tự | Không đảm bảo |
| Tốc độ | Chậm hơn (overhead) | Nhanh hơn |
| Connection | 3-way handshake | Connectionless |
| Header | 20-60 bytes | 8 bytes (60% nhẹ hơn) |
| Flow control | Có (sliding window) | Không |
| Congestion control | Có | Không |

**Use cases:**
- **TCP:** Web (HTTP), SSH, Email, File Transfer, Database
- **UDP:** DNS, VoIP, Video streaming, Gaming, DHCP

---

# TCP 3-Way Handshake

## Chi tiết từng bước

```
Client                                                              Server
  │                                                                    │
  │  1. SYN ──────────────────────────────────────────────────────────▶│
  │       Seq=x                                                              │
  │       Flags: SYN=1, ACK=0                                              │
  │                                                                    │
  │  TCP Client State: SYN_SENT                                           │
  │                                                                    │
  │  2. ◀─── SYN-ACK ─────────────────────────────────────────────────│
  │       Seq=y, Ack=x+1                                                  │
  │       Flags: SYN=1, ACK=1                                            │
  │                                                                    │
  │  TCP Server State: SYN_RECEIVED                                       │
  │                                                                    │
  │  3. ACK ──────────────────────────────────────────────────────────▶│
  │       Seq=x+1, Ack=y+1                                               │
  │       Flags: SYN=0, ACK=1                                            │
  │                                                                    │
  │  4. (Data transfer begins)                                          │
  │       ◀──── HTTP Request ────▶                                       │
  │                                                                    │
  │  ─────────────── Connection Lifetime ─────────────────               │
  │                                                                    │
  │  FIN ───────────────────────────────────────────────────────────▶│
  │  ◀─── ACK ─────────────────────────────────────────────────────│
  │  ◀─── FIN ─────────────────────────────────────────────────────│
  │  ─────────────────────────────────────────────────────────────▶ACK
```

**Tại sao 3 bước?** Mỗi bên cần xác nhận: "Tôi nhận được SYN của bạn và sẵn sàng nhận data"

---

# UDP Header vs TCP Header

## So sánh kích thước và cấu trúc

```
UDP Header (8 bytes - tối thiểu):
┌────────────────┬────────────────┬────────────────┬────────────────┐
│  Source Port   │  Dest Port    │  Length       │  Checksum     │
│     16 bits     │   16 bits      │   16 bits      │   16 bits      │
└────────────────┴────────────────┴────────────────┴────────────────┘

TCP Header (20-60 bytes):
┌────────────────┬────────────────┬────────────────┬────────────────┐
│  Source Port   │  Dest Port    │                              │
│     16 bits     │   16 bits      │                              │
├────────────────┴────────────────┴────────────────┴────────────────┤
│                       Sequence Number                              │
│                          32 bits                                    │
├────────────────┬────────────────┬────────────────┬────────────────┤
│                  Acknowledgment Number                             │
│                          32 bits                                    │
├────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┤
│Offset │ Resv  │ Flags  │        │        │        │        │        │
│ 4bit  │ 6bit  │ 6bit   │   Window Size    │  Checksum │  Urgent │
│        │       │ URG/ACK│    16 bits      │  16bits  │ 16bits  │
│        │       │ PSH/RST│                                      │  │
│        │       │ SYN/FIN│                                      │  │
├────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┤
│                      Options (0-40 bytes)                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

# IP Address

## Địa chỉ nhà của máy tính trên mạng

```
IPv4: 4 bytes = 32 bits = 4.29 tỷ địa chỉ (ĐÃ HẾT!)

  192.168.1.100
  │     │    │    │
  │     │    │    └── Byte 4 (0-255)
  │     │    └────── Byte 3 (0-255)
  │     └────────── Byte 2 (0-255)
  └──────────────── Byte 1 (0-255)

  11000000.10101000.00000001.01100100
  └───┬───┘└───┬───┘└───┬───┘└───┬───┘
      192      168        1      100

IPv6: 16 bytes = 128 bits = 340 undecillion địa chỉ

  2001:0db8:85a3:0000:0000:8a2e:0370:7334
  (viết gọn: 2001:db8:85a3::8a2e:370:7334)

Loại IPv4:
├── Public: visible từ internet (1.1.1.1, 8.8.8.8)
├── Private: chỉ trong mạng local
│   ├── 10.0.0.0/8      (10.x.x.x)
│   ├── 172.16.0.0/12  (172.16.x.x - 172.31.x.x)
│   └── 192.168.0.0/16 (192.168.x.x)
└── Loopback: 127.0.0.1 (localhost)
```

---

# Port - Số phòng trên máy tính

## Xác định ứng dụng cụ thể

```
Port 16 bits (0-65535)

┌─────────────────────────────────────────────────────────────┐
│  Well-known Ports (0-1023)     → Chỉ root mới bind được   │
│  ├── 22    SSH                 (Secure Shell)             │
│  ├── 25    SMTP               (Email sending)              │
│  ├── 53    DNS                (Domain Name System)         │
│  ├── 80    HTTP               (Web server)                 │
│  ├── 443   HTTPS              (Secure Web)                │
│  ├── 3306  MySQL                                             │
│  └── 5432  PostgreSQL                                        │
├─────────────────────────────────────────────────────────────┤
│  Registered Ports (1024-49151) → Dùng cho ứng dụng       │
│  ├── 3000    Node.js dev server                            │
│  ├── 5173    Vite dev server                               │
│  ├── 8000    Django dev server                             │
│  └── 8080    HTTP alternate / Tomcat                       │
├─────────────────────────────────────────────────────────────┤
│  Dynamic/Private (49152-65535) → OS tự chọn khi connect() │
└─────────────────────────────────────────────────────────────┘

Ví dụ: Server A có IP 203.0.113.10
├── Port 80: Web server (nginx)
├── Port 443: Secure Web
├── Port 22: SSH
└── Port 5432: PostgreSQL

Client kết nối: 203.0.113.10:443 = SSH đến web server secure
```

---

# DNS - Danh bạ của internet

## Tên miền → IP Address

```
┌─────────────────────────────────────────────────────────────────┐
│               DNS Resolution Flow - 3 bước                      │
└─────────────────────────────────────────────────────────────────┘

1. Client → "example.com là gì?"
   │
2. Recursive Resolver (8.8.8.8 hoặc DNS của ISP)
   │
   ├── Bước 1: Hỏi Root Nameserver
   │   "ai quản lý .com?"
   │   → Root NS trả lời: "Hỏi .com TLD NS này"
   │
   ├── Bước 2: Hỏi .com TLD Nameserver
   │   "ai quản lý example.com?"
   │   → TLD NS trả lời: "Hỏi Authoritative NS này"
   │
   └── Bước 3: Hỏi Authoritative Nameserver
       "IP của example.com là gì?"
       → Authoritative NS: "93.184.216.34"

3. Client nhận: example.com → 93.184.216.34
   (Cache kết quả - TTL thường 300-86400 giây)
```

---

# Các loại DNS Record

## Bảng tra cứu nhanh

| Record | Mô tả | Ví dụ |
|--------|--------|-------|
| **A** | IPv4 address | `example.com → 93.184.216.34` |
| **AAAA** | IPv6 address | `example.com → 2606:2800:220:1::` |
| **CNAME** | Canonical name (alias) | `www.example.com → example.com` |
| **MX** | Mail exchange | `example.com → mail.example.com` |
| **TXT** | Text data | SPF, DKIM, domain verification |
| **NS** | Nameserver | `example.com → ns1.example.com` |
| **PTR** | Reverse DNS | `1.2.3.4 → hostname.in-addr.arpa` |

```bash
# Demo DNS queries
dig example.com A            # A record lookup
dig example.com AAAA         # IPv6 lookup
dig -x 93.184.216.34        # Reverse lookup
dig example.com MX           # Mail servers
dig example.com TXT          # SPF, DKIM records
nslookup example.com         # Đơn giản hơn
```

---

# Demo: Trace một HTTP Request

## Từ trình duyệt đến server - 5 bước

```bash
# 1. DNS Resolution
nslookup example.com
# Server: 8.8.8.8
# Address: 93.184.216.34

# 2. Ping - kiểm tra kết nối
ping -c 4 example.com

# 3. Traceroute - xem đường đi packet
traceroute example.com
# 1. 192.168.1.1     1.2ms   (gateway)
# 2. 10.0.0.1        5.3ms   (ISP)
# 3. 72.14.215.85   10.2ms   (backbone)
# 4. 93.184.216.34   11.5ms  (destination)

# 4. HTTP Request chi tiết
curl -v https://example.com

# * Host example.com:443 was resolved.
# * Connected to example.com (93.184.216.34) port 443
# * TLS handshake
# > GET / HTTP/2
# > Host: example.com
# > User-Agent: curl/8.4.0
# > Accept: */*
# >
# < HTTP/2 200
# < content-type: text/html; charset=UTF-8
# < etag: "3147526947"
# < cache-control: max-age=604800
```

---

# HTTP Request - Cấu trúc chi tiết

## Mỗi request đều có format nhất định

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

│
├── Request Line: METHOD + PATH + VERSION
├── Headers: Metadata về request
│   ├── Host: Server target
│   ├── Accept: Loại response mong muốn
│   ├── Authorization: Credentials
│   └── Cookie: Session data
├── Blank Line: Phân cách headers và body
└── Body: Data (cho POST/PUT/PATCH)
```

---

# HTTP Response - Cấu trúc chi tiết

## Server trả về gì?

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

│
├── Status Line: VERSION + STATUS_CODE + REASON
├── Headers: Metadata về response
│   ├── Date: Thời gian server
│   ├── Content-Type: MIME type
│   ├── Content-Length: Kích thước body
│   ├── ETag: Version identifier (cho caching)
│   └── Strict-Transport-Security: Force HTTPS
├── Blank Line: Phân cách headers và body
└── Body: Response data (JSON, HTML, image...)
```

---

# Tóm tắt Buổi 1

## Những điểm cần nhớ (vĩnh viễn)

```
┌─────────────────────────────────────────────────────────────────┐
│                   MENTAL MODEL - BUỔI 1                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. USER SPACE ←→ KERNEL SPACE                                │
│     Syscall = cầu nối duy nhất                                 │
│     strace = công cụ nhìn thấy syscall                         │
│                                                                  │
│  2. LINUX = CHUẨN NGÀNH                                       │
│     96% server, 100% container, Cloud = Linux                  │
│     /bin, /etc, /var/log, /home, /proc                        │
│                                                                  │
│  3. PROCESS = instance chương trình                           │
│     Thread = đơn vị nhỏ hơn, chia sẻ memory                  │
│     PID = định danh duy nhất                                   │
│                                                                  │
│  4. TCP = TIN CẬY, UDP = NHANH                                │
│     TCP: 3-way handshake, ack, retransmit, ordered             │
│     UDP: gửi rồi quên, không guarantee                        │
│                                                                  │
│  5. IP + PORT = TÌM ĐÚNG MÁY + ĐÚNG ỨNG DỤNG                 │
│     DNS: tên miền → IP                                         │
│     Port: 80(HTTP), 443(HTTPS), 22(SSH)...                   │
│                                                                  │
│  6. EVERYTHING IS A FILE                                       │
│     Thiết bị, process, socket = file descriptor                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# Câu hỏi ôn tập

## Kiểm tra hiểu bài

1. Khi gọi `printf("hello")` trong C, có những layer nào tham gia?

2. Sự khác nhau giữa `fork()` và `execve()`? Tại sao shell dùng cả hai?

3. Tại sao server web cần bind vào port 80/443, không phải port khác?

4. Làm thế nào để debug xem một chương trình gọi những syscall nào?

5. TCP handshake gồm những bước nào? Tại sao cần 3 bước?

6. Trình bày flow đầy đủ khi browser truy cập "https://google.com"

---

# Buổi 2: Hạ tầng & Triển khai

## Đưa ứng dụng lên production

**Phần 1 (45 phút):** Servers, Virtualization & Cloud

**Phần 2 (45 phút):** Containerization & Docker

**Nghỉ giải lao (15 phút)**

**Phần 3 (75 phút):** Web Servers & Demo tổng hợp

---

# Physical Server vs Virtual Machine

## Từ phần cứng thuần đến ảo hóa

```
┌─────────────────────────────────────────────────────────────────┐
│               PHYSICAL SERVER (Bare-metal)                       │
├─────────────────────────────────────────────────────────────────┤
│  Hardware (Server)                                              │
│  ┌─────────┐  ┌───────┐  ┌──────────┐  ┌──────────┐         │
│  │  CPU    │  │  RAM  │  │   SSD    │  │ Network  │         │
│  │ 64 core│  │ 256GB │  │   1TB    │  │  10Gbps  │         │
│  └─────────┘  └───────┘  └──────────┘  └──────────┘         │
│          │                                                    │
│      OS installed directly                                      │
│      (CentOS, Ubuntu Server)                                  │
│          │                                                    │
│      ┌───┴──────────┐                                         │
│      │ Application  │                                          │
│      │  (your app) │                                          │
│      └──────────────┘                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                VIRTUAL MACHINE                                    │
├─────────────────────────────────────────────────────────────────┤
│  Hardware                                                        │
│  ┌─────────┐  ┌───────┐  ┌──────────┐                         │
│  │  CPU    │  │  RAM  │  │   SSD    │                         │
│  └─────────┘  └───────┘  └──────────┘                         │
│          │                                                    │
│  ┌───────┴───────────────────────────────────────────┐        │
│  │               Hypervisor                             │        │
│  │          (VMware ESXi / KVM / Xen)                │        │
│  └───┬─────────────────┬─────────────────┬────────────┘        │
│      │                 │                 │                      │
│  ┌───▼───┐         ┌───▼───┐       ┌───▼───┐               │
│  │  VM1  │         │  VM2  │       │  VM3  │               │
│  │Ubuntu │         │CentOS │       │Windows│               │
│  │ 16GB  │         │ 8GB   │       │  4GB  │               │
│  └───────┘         └───────┘       └───────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

# Hypervisor

## Phần mềm tạo máy ảo

**Type 1: Bare-metal (chạy trực tiếp trên hardware)**
```
Hardware → Hypervisor (VMware ESXi / KVM / Xen) → VMs
→ Hiệu suất cao, dùng trong datacenter
→ Ví dụ: VMware vSphere, Microsoft Hyper-V, KVM
```

**Type 2: Hosted (chạy trên OS thông thường)**
```
OS (macOS/Windows) → Hypervisor (VirtualBox/VMware) → VMs
→ Dùng cho development/testing
→ Ví dụ: Oracle VirtualBox, VMware Workstation
```

| Khía cạnh | Type 1 | Type 2 |
|-----------|--------|--------|
| Performance | Cao | Trung bình |
| Use case | Datacenter/Production | Development |
| Boot | Boot trực tiếp | Boot qua host OS |

---

# Cloud Computing

## Thuê tài nguyên thay vì mua

```
┌──────────────────────────────────────────────────────────────────┐
│   ON-PREMISES              CLOUD (IaaS)         SERVERLESS     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐        ┌─────────────┐       ┌─────────────┐  │
│  │  Bạn mua   │        │  Bạn thuê  │       │  Bạn chỉ   │  │
│  │  Hardware  │        │  VMs        │       │  viết code  │  │
│  └──────┬──────┘        └──────┬──────┘       └──────┬─────┘  │
│         │                       │                       │        │
│         ▼                       ▼                       ▼        │
│  ┌────────────┐        ┌────────────┐        ┌────────────┐   │
│  │ Buy Server │        │ Rent VMs   │        │ Pay/call   │   │
│  │ Install OS │        │ SSH/Deploy │        │ Auto-scale │   │
│  │ Configure  │        │            │        │ No servers │   │
│  │ Maintain   │        │            │        │ to manage  │   │
│  └────────────┘        └────────────┘        └────────────┘   │
│                                                                  │
│  Control: ████████████  Control: ████████░░░  Control: ██░░░ │
│  Complexity: ██████████  Complexity: ████████░░  Complexity: ██ │
└──────────────────────────────────────────────────────────────────┘
```

**IaaS:** AWS EC2, GCP Compute, Azure VMs
**PaaS:** Heroku, Railway, Google App Engine
**SaaS:** Gmail, Slack, Notion, Figma

---

# Vấn đề: "It works on my machine"

## Nỗi đau của mọi developer

```
Năm 2010-2013: TRƯỚC DOCKER
═══════════════════════════════════════════════════════════════

Developer (macOS, Node 14)                    Production (Ubuntu 18.04, Node 18)
│                                              │
│  $ node --version                           │  $ node --version
│  v14.2.0                                    │  v18.16.0
│  $ npm --version                            │  $ npm --version
│  6.14.4                                    │  9.5.1
│  $ python --version                         │  $ python --version
│  3.8.2                                     │  2.7.17
│                                              │
│  Bug: "Database connection timeout"          │  ← Đêm khuya debug
│  Reason: mysql client version không tương    │     production!

Năm 2013: DOCKER = GIẢI PHÁP HOÀN HẢO
═══════════════════════════════════════════════════════════════

Developer                        Production
│                                  │
│  $ docker build -t myapp .     │  $ docker pull myapp
│  $ docker run myapp            │  $ docker run myapp
│                                  │
│  Cùng environment!              │  Cùng environment!
```

---

# Container vs Virtual Machine

## Container không phải là VM!

```
┌────────────────────────────────────────────────────────────────┐
│                      VIRTUAL MACHINE                            │
│  Mỗi VM có HOÀN TOÀN guest OS riêng                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  App A        App B        App C                               │
│    │           │           │                                    │
│  ┌─┴─┐       ┌─┴─┐      ┌─┴─┐                                │
│  │Lib A│       │Lib B│      │Lib C│                                │
│  └─┬─┘       └─┬─┘      └─┬─┘                                │
│  ┌─┴─┐       ┌─┴─┐      ┌─┴─┐                                │
│  │Guest│       │Guest│      │Guest│ (Mỗi VM tải ~500MB-10GB)  │
│  │ OS  │       │ OS  │      │ OS  │                                │
│  └──┬──┘       └──┬──┘      └──┬──┘                                │
│     │              │             │                                │
│  ┌──▼─────────────────────────────────────▼──┐               │
│  │           Hypervisor                         │               │
│  └─────────────────────────────────────────────┘               │
│                    │                                           │
│            ┌───────▼────────┐                                 │
│            │  Host OS Kernel │                                 │
│            └────────────────┘                                 │
│                                                                 │
│  Boot: ~30-60 giây  |  Size: ~500MB-10GB  |  Overhead: ~20%  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                        CONTAINER                                 │
│  Container share Host Kernel, chỉ có User Space riêng           │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  App A        App B        App C                               │
│    │           │           │                                    │
│  ┌─┴─┐       ┌─┴─┐      ┌─┴─┐                                │
│  │Lib A│       │Lib B│      │Lib C│    ← Chỉ libraries       │
│  └─┬─┘       └─┬─┘      └─┬─┘                                │
│  ┌─┴─┐       ┌─┴─┐      ┌─┴─┐                                │
│  │User│       │User│      │User│        ← Namespace isolation  │
│  │Space│      │Space│     │Space│                              │
│  └──┬──┘       └──┬──┘      └──┬──┘                              │
│     │              │             │                                │
│  ┌──▼──────────────▼───────────▼──┐                            │
│  │         Docker Daemon            │                            │
│  └──────────────┬───────────────────┘                            │
│                 │                                                │
│  ┌──────────────▼───────────────────┐                           │
│  │        Host OS Kernel            │   ← CHIA SẺ kernel!      │
│  │   (namespaces, cgroups)          │                           │
│  └───────────────────────────────────┘                           │
│                                                                 │
│  Boot: ~100-500ms  |  Size: ~5MB-500MB  |  Overhead: ~1-5%    │
└────────────────────────────────────────────────────────────────┘
```

---

# Linux Namespaces

## Công nghệ đằng sau Container

| Namespace | Viết tắt | Cô lập gì | Ví dụ |
|-----------|-----------|-----------|--------|
| PID | PID | Process IDs | Container thấy PID 1 là process của nó |
| Network | NET | Interfaces, ports | Container có IP riêng |
| Mount | MNT | Filesystem mount | Container có root filesystem riêng |
| User | USER | User/Group IDs | UID 0 (root) trong container ≠ host root |
| UTS | UTS | Hostname | Container có hostname riêng |
| IPC | IPC | Shared memory | Container không thấy SHM của container khác |
| Cgroup | CGROUP | Resource limits | Giới hạn CPU, RAM, I/O |

---

# Cgroups - Giới hạn tài nguyên

## Container không thể dùng hết server resources

```
Cgroup hierarchy cho container
│
├── memory
│   └── /docker/abc123
│       memory.limit_in_bytes = 512MB       (max RAM)
│       memory.swappiness = 0              (không swap)
│
├── cpu
│   └── /docker/abc123
│       cpu.cfs_period_us = 100000         (100ms period)
│       cpu.cfs_quota_us = 50000           (50ms được dùng = 50% CPU)
│
├── blkio
│   └── /docker/abc123
│       blkio.throttle.read_bps_device     (max read speed)
│       blkio.throttle.write_iops_device    (max write IOPS)
│
└── pids
    └── /docker/abc123
        pids.max = 1024                    (max 1024 processes)
```

---

# Docker: Image vs Container

## Hai khái niệm cốt lõi

```
┌─────────────────────────────────────────────────────────────┐
│                      DOCKER IMAGE                            │
│  Template read-only để tạo container                       │
│                                                              │
│  Layers (read-only):                                        │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Layer 5: my-app (read-write khi container chạy)  │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  Layer 4: /app/node_modules                       │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  Layer 3: /app/src                               │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  Layer 2: npm install                            │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  Layer 1: package.json                          │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  Layer 0: node:20-alpine (base image)          │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                              │
│  Giống như "class" trong OOP                              │
└─────────────────────────────────────────────────────────────┘
                            │ docker run
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DOCKER CONTAINER                         │
│  Instance đang chạy của image                             │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Container Layer (read-write)                       │  │
│  │  + Files được tạo/sửa bởi app                    │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │  Image Layers (read-only) - giống hệt image       │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                              │
│  Giống như "object" trong OOP                             │
└─────────────────────────────────────────────────────────────┘
```

---

# Dockerfile

## Build image từ Dockerfile - Multi-stage build

```dockerfile
# ============================================================
# Stage 1: Builder (build production artifacts)
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ============================================================
# Stage 2: Production (runtime nhẹ)
# ============================================================
FROM node:20-alpine AS production

# Tạo non-root user cho bảo mật
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built artifacts từ stage builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider \
    http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]

# ============================================================
# TẠI SAO MULTI-STAGE BUILD?
# Single-stage: ~1.2GB (node + npm + source + devDeps)
# Multi-stage: ~150MB (node + artifacts only)
# Tiết kiệm ~85% disk space!
# ============================================================
```

---

# Dockerfile Instructions

## Từng lệnh và công dụng

| Instruction | Mô tả | Tips |
|------------|--------|------|
| `FROM` | Base image | Luôn dùng version cụ thể: `node:20-alpine` |
| `COPY` | Copy file | `COPY package*.json ./` → cache layer |
| `RUN` | Chạy command | Gộp commands: `apt-get update && apt-get install` |
| `WORKDIR` | Set working directory | Tự tạo dir nếu chưa có |
| `ENV` | Environment variable | `ENV NODE_ENV=production` |
| `EXPOSE` | Khai báo port | Chỉ documentation |
| `USER` | Set user | **Dùng non-root user cho bảo mật!** |
| `ENTRYPOINT` | Command khi container start | Exec form: `["node", "server.js"]` |
| `CMD` | Default command | Bị override bởi `docker run <args>` |
| `HEALTHCHECK` | Container health check | Docker tự kiểm tra |
| `LABEL` | Metadata | `LABEL maintainer="email"` |

---

# Docker Commands - Lifecycle

## Build → Run → Manage

```bash
# Build và chạy
docker build -t myapp:1.0 .                     # Build image
docker build -t myapp:1.0 -f Dockerfile.prod    # Dockerfile khác
docker build --no-cache -t myapp .             # Không dùng cache

docker run -d -p 3000:3000 --name my-app myapp:1.0  # Chạy container
docker run -d -e NODE_ENV=production myapp              # Với env vars
docker run -d -v /host/path:/container/path myapp       # Với volume

# Xem layers của image
docker history myapp:1.0

# Lifecycle
docker ps                         # Containers đang chạy
docker ps -a                      # Tất cả containers
docker start/stop my-container    # Start/stop
docker restart my-container       # Restart

# Truy cập container
docker exec -it my-container bash    # Bash shell
docker exec my-container ls /app      # Chạy command

# Logs
docker logs -f my-container           # Follow logs
docker logs --tail 100 my-container   # 100 dòng cuối

# Cleanup
docker rm my-container                # Xóa container
docker rm -f my-container             # Force remove
docker image prune                    # Xóa unused images
docker system prune -a               # Xóa tất cả unused
```

---

# Docker Network

## Container nói chuyện với nhau như thế nào?

```
┌──────────────────────────────────────────────────────────────┐
│                    bridge (default)                          │
│  docker0: 172.17.0.1                                        │
│                                                              │
│  Container A ─── eth0 (172.17.0.2) ──┐                      │
│  Container B ─── eth0 (172.17.0.3) ──┼── docker0 bridge     │
│  Container C ─── eth0 (172.17.0.4) ──┘           │          │
│                                            veth ─── host eth0 │
│                                                              │
│  Containers thấy nhau qua tên (Docker DNS)                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    host                                        │
│  Container dùng trực tiếp host network                     │
│  Port 3000 trên container = port 3000 trên host            │
│  → Phù hợp cho performance-critical apps                   │
│  → Mất isolation (không chạy 2 containers cùng port)        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    overlay (Docker Swarm)                     │
│  Nhiều Docker hosts giao tiếp như một network             │
│  Host A ─── VXLAN tunnel ─── Host B                         │
│     │                              │                         │
│  Container1                     Container2                   │
└──────────────────────────────────────────────────────────────┘
```

---

# Docker Compose

## Quản lý multi-container app

```yaml
version: "3.8"

services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app-net
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    networks:
      - app-net

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: ${DB_USER:-admin}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-secret}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-admin}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --maxmemory 256mb
    volumes:
      - redis-data:/data
    networks:
      - app-net

volumes:
  postgres-data:
  redis-data:

networks:
  app-net:
    driver: bridge
```

---

# Forward Proxy vs Reverse Proxy

## Hai loại proxy, hai mục đích

**Forward Proxy (Proxy thuận):**

```
User (192.168.1.100)
    │
    │ Tôi muốn truy cập blocked-site.com qua proxy
    ▼
┌─────────────────┐
│  Forward Proxy   │  (VPN/Proxy)
│  203.0.113.50   │
└────────┬────────┘
         │
         │ Request từ 203.0.113.50 → blocked-site.com
         ▼
    blocked-site.com
    thấy: 203.0.113.50
    không thấy: 192.168.1.100
```

**Reverse Proxy (Proxy ngược):**

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
    │◀────────────────────────│                           │
    │  (không biết bao nhiêu  │                          │
    │   backend servers)       │                          │
```

---

# Nginx: Reverse Proxy phổ biến nhất

## Đứng trước ứng dụng, hứng traffic

```
┌────────────────────────────────────────────────────────────────┐
│                    NGINX PROCESSES                              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Master Process (PID 1)                                   │  │
│  │ ├── Đọc config                                         │  │
│  │ ├── Quản lý worker processes                           │  │
│  │ └── Signal handling (reload, stop)                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Worker 1 │  │ Worker 2 │  │ Worker 3 │  │ Worker N │     │
│  │(event    │  │(event    │  │(event    │  │(event    │     │
│  │ loop)    │  │ loop)    │  │ loop)    │  │ loop)    │     │
│  │ ~10K conn│  │ ~10K conn│  │ ~10K conn│  │ ~10K conn│     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
│                                                                 │
│  Non-blocking I/O + Event-driven = Handle 100,000+ connections! │
└────────────────────────────────────────────────────────────────┘
```

**Tại sao cần Nginx?**
1. **Load Balancing:** Phân phối request vào nhiều servers
2. **SSL Termination:** Mã hóa HTTPS một nơi
3. **Cache Static Files:** Giảm tải cho backend
4. **Security:** Ẩn backend servers khỏi internet

---

# Nginx Configuration

## Chi tiết upstream, location, và proxy settings

```nginx
# upstream{} - Backend servers
upstream api_backend {
    least_conn;                    # ít connections nhất

    server 172.17.0.2:3000;     # Container 1
    server 172.17.0.3:3000;     # Container 2
    server 172.17.0.4:3000;     # Container 3 down → loại bỏ tạm

    keepalive 32;                 # Keep 32 idle connections
}

# rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

server {
    listen 80;
    server_name example.com;

    # Redirect HTTP → HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    # SSL
    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    root /usr/share/nginx/html;
    index index.html;

    # Static files - Cache
    location ~* \.(js|css|png|jpg|ico|svg|woff)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API Proxy
    location /api {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://api_backend;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }

    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # WebSocket
    location /ws {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

---

# Load Balancing Strategies

## 4 thuật toán phổ biến

```nginx
# 1. Round Robin (mặc định)
upstream round_robin {
    server 172.17.0.2:3000;
    server 172.17.0.3:3000;
    server 172.17.0.4:3000;
    # Request 1 → server 1, Request 2 → server 2...
}

# 2. Least Connections
upstream least_conn {
    least_conn;
    server 172.17.0.2:3000 weight=3;  # weight = capacity
    server 172.17.0.3:3000 weight=2;
}

# 3. IP Hash (session affinity)
upstream ip_hash {
    ip_hash;
    server 172.17.0.2:3000;
    server 172.17.0.3:3000;
    # user1 (IP A) → luôn server 1
    # user2 (IP B) → luôn server 2
}

# 4. Generic Hash
upstream url_hash {
    hash $request_uri consistent;
    server 172.17.0.2:3000;
    server 172.17.0.3:3000;
}

# Health Check - tự loại bỏ server không healthy
upstream with_health {
    server 172.17.0.2:3000 max_fails=3 fail_timeout=30s;
    server 172.17.0.3:3000 max_fails=3 fail_timeout=30s;
}
```

---

# Demo: Docker Compose + Nginx

## Deploy NestJS + React + Nginx + PostgreSQL

**docker-compose.yml:**

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      api:
        condition: service_healthy
      frontend:
        condition: service_started

  api:
    build: ./backend
    environment:
      - DATABASE_HOST=postgres
      - DATABASE_PORT=5432
      - DATABASE_NAME=myapp
      - DATABASE_USER=admin
      - DATABASE_PASSWORD=secret
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--spider", "http://localhost:3000/health"]
      interval: 30s
      retries: 3

  frontend:
    build: ./frontend

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:

networks:
  default:
    name: app-network
```

---

# Tóm tắt Buổi 2

## Những điểm cần nhớ

```
┌─────────────────────────────────────────────────────────────────┐
│                   MENTAL MODEL - BUỔI 2                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. PHYSICAL → VM → CONTAINER                                 │
│     VM: Chia sẻ hardware qua Hypervisor                        │
│     Container: Chia sẻ Kernel qua Namespaces + Cgroups          │
│                                                                  │
│  2. DOCKER = IMAGE + CONTAINER                                │
│     Image = Template (class) | Container = Instance (object)    │
│     Dockerfile = Công thức nấu ăn | Layer = Mỗi instruction   │
│                                                                  │
│  3. DOCKER COMPOSE = Multi-container orchestration             │
│     Quản lý: build, network, volume, depends_on, healthcheck  │
│                                                                  │
│  4. NGINX = Reverse Proxy + Load Balancer                     │
│     Event-driven architecture → handle 100K+ connections       │
│     upstream{} → load balancing | location{} → routing        │
│                                                                  │
│  5. NAMESPACES + CGROUPS = Container Isolation                │
│     Namespaces: PID, NET, MNT, USER, UTS, IPC                 │
│     Cgroups: CPU, Memory, I/O limits                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# Buổi 3: Kiến trúc Ứng dụng & Bảo mật

## Xây dựng phần mềm tương tác an toàn

**Phần 1 (60 phút):** Web Architecture & APIs

**Phần 2 (30 phút):** Database Fundamentals

**Nghỉ giải lao (15 phút)**

**Phần 3 (75 phút):** Web Security

---

# Evolution của Kiến trúc Web

## Từ Monolith đến Microservices

```
┌──────────────────────────────────────────────────────────────┐
│           KỶ NGUYÊN 1: Monolith (2000-2010)               │
├──────────────────────────────────────────────────────────────┤
│  Browser ──── HTTP ───▶ Single Server (All-in-one)          │
│                            ├── HTML Template                │
│                            ├── Business Logic                │
│                            └── Database                      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│     KỶ NGUYÊN 2: Client-Server (2010-2020)                   │
├──────────────────────────────────────────────────────────────┤
│  Browser                              Server                 │
│  ├── React/Vue                     ├── REST API (JSON)      │
│  └── CSS                            └── Database            │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│           KỶ NGUYÊN 3: Microservices (2020+)                 │
├──────────────────────────────────────────────────────────────┤
│  Browser ──── API Gateway ───┬── Auth Service              │
│                              ├── Users Service              │
│                              ├── Orders Service             │
│                              └── Products Service           │
│                                     │                       │
│                                Message Queue (Kafka)        │
└──────────────────────────────────────────────────────────────┘
```

---

# Modern Web Architecture

## Chi tiết từ Browser đến Database

```
Browser (React/Vue)
    │
    │ HTTPS
    ▼
Cloudflare (Edge)
    ├── DDoS Protection
    ├── CDN (Static Assets)
    ├── SSL Termination
    └── WAF
    │
    │ HTTPS
    ▼
Load Balancer (nginx/HAProxy)
    ├── Health Checks
    └── SSL Termination
    │
    │ HTTPS
    ▼
API Gateway (nginx/Kong)
    ├── Authentication
    ├── Rate Limiting
    └── Routing
    │
    ├── /api/auth/* ────────────▶ Auth Service ────▶ Redis (sessions)
    ├── /api/users/* ──────────▶ Users Service ───▶ PostgreSQL
    ├── /api/orders/* ─────────▶ Orders Service ──▶ PostgreSQL + Redis
    └── /api/products/* ───────▶ Products Service ─▶ PostgreSQL + Redis
                                                              │
                                                              ▼
                                                        S3 (File Storage)
```

---

# HTTP Methods

## CRUD Operations trên resources

| Method | CRUD | Mô tả | Idempotent | Safe |
|--------|------|--------|-----------|------|
| `GET` | Read | Lấy resource | Có | Có |
| `POST` | Create | Tạo resource mới | Không | Không |
| `PUT` | Replace | Thay thế toàn bộ | Có | Không |
| `PATCH` | Update | Cập nhật một phần | Không | Không |
| `DELETE` | Delete | Xóa resource | Có | Không |
| `HEAD` | - | Headers của resource | Có | Có |
| `OPTIONS` | - | Các methods hỗ trợ | Có | Có |

**Ví dụ RESTful:**

```
GET    /users           → Lấy danh sách users (paginated)
GET    /users/123      → Lấy user có id=123
POST   /users          → Tạo user mới
PUT    /users/123      → Thay thế toàn bộ user 123
PATCH  /users/123      → Cập nhật email của user 123
DELETE /users/123      → Xóa user 123
GET    /users/123/posts → Lấy posts của user 123
```

---

# HTTP Status Codes

## Phản hồi từ server nói gì?

```
┌─────────────────────────────────────────────────────────────┐
│  1xx: INFORMATIONAL                                        │
│  100 Continue ── Client gửi tiếp body (Upload large file)  │
│  101 Switching ─ Upgrade protocol (HTTP → WebSocket)       │
├─────────────────────────────────────────────────────────────┤
│  2xx: SUCCESS                                              │
│  200 OK ─────── Thành công thông thường                   │
│  201 Created ── Resource mới được tạo                      │
│  204 No Content ─ Thành công, không có body                │
├─────────────────────────────────────────────────────────────┤
│  3xx: REDIRECTION                                         │
│  301 Moved ───── Chuyển vĩnh viễn (cache permanent)      │
│  302 Found ───── Chuyển tạm thời                         │
│  304 Not Modified ─ Dùng cache (ETag/Last-Modified)       │
├─────────────────────────────────────────────────────────────┤
│  4xx: CLIENT ERROR (request sai - lỗi từ client)         │
│  400 Bad Request ─ Request sai cú pháp                    │
│  401 Unauthorized ─ Chưa authenticate (chưa login)       │
│  403 Forbidden ── Đã authenticate nhưng không có quyền    │
│  404 Not Found ── Resource không tồn tại                  │
│  409 Conflict ─── Conflict với state hiện tại            │
│  422 Unprocessable ─ Request đúng syntax nhưng sai logic │
│  429 Too Many Requests ─ Rate limited                     │
├─────────────────────────────────────────────────────────────┤
│  5xx: SERVER ERROR (lỗi từ server - không phải client)  │
│  500 Internal Server Error ─ Lỗi server không xác định    │
│  502 Bad Gateway ── Proxy/gateway nhận invalid response   │
│  503 Service Unavailable ─ Server quá tải hoặc bảo trì    │
│  504 Gateway Timeout ─ Proxy chờ upstream quá lâu         │
└─────────────────────────────────────────────────────────────┘
```

---

# RESTful API Design

## 4 nguyên tắc cốt lõi

**1. Uniform Interface:**
```
TỐT:                    XẤU:
GET    /users           GET    /getUsers
GET    /users/123       GET    /getUserById?id=123
POST   /users           POST   /createNewUser
DELETE /users/123       GET    /deleteUser?id=123
```

**2. Stateless:**
```
MỖI REQUEST phải chứa TẤT CẢ thông tin cần thiết:
├── Authentication token
├── User context
└── Pagination params

XẤU: Server lưu session → scaling khó
TỐT: Token self-contained → stateless
```

**3. Cacheable:**
```
Cache-Control: public, max-age=300
ETag: "v1.2.3"

Client kiểm tra: If-None-Match: "v1.2.3"
→ 304 Not Modified → Dùng cache
```

**4. Resource-based:**
```
Collections: /users
Single resource: /users/123
Sub-resource: /users/123/posts
Actions: POST /users/123/activate
```

---

# REST vs GraphQL vs gRPC

## Khi nào dùng cái nào?

| Khía cạnh | REST | GraphQL | gRPC |
|-----------|------|---------|------|
| Dữ liệu | JSON/HTTP | JSON/HTTP | Protobuf |
| Real-time | Không | Không | Có (streaming) |
| Query flexibility | Cố định endpoint | Linh hoạt | Cố định |
| Performance | Trung bình | Chậm hơn | Rất nhanh (10-100x) |
| Browser native | Có | Có | Không |
| Caching | Dễ (URL) | Khó | Khó |
| Setup | Dễ | Trung bình | Phức tạp |

**Khi nào dùng:**
- **REST:** Public APIs, simple CRUD, standard web apps
- **GraphQL:** Complex data requirements, mobile apps, BFF
- **gRPC:** Microservices internal communication, streaming

---

# SQL vs NoSQL

## Chọn đúng loại database cho bài toán

**SQL (PostgreSQL, MySQL):**
```
users ─────────────┐
┌─────────┐        │
│ id (PK) │        │
│ name    │───┐    │
│ email   │   │    │
└─────────┘   │    │
              ▼    ▼
┌──────────────────────┐
│ posts               │
│ id (PK)             │
│ user_id (FK) ──────┘
│ title               │
│ content             │
└──────────────────────┘

✓ Schema cố định (ràng buộc chặt chẽ)
✓ ACID transactions (đảm bảo tính nhất quán)
✓ Complex queries với JOINs
✓ Horizontal scaling KHÓ (sharding phức tạp)
```

**NoSQL (MongoDB, Redis, Cassandra):**
```
Document (MongoDB):
{ "_id": "1", "name": "Khang", "posts": [...] }

Key-Value (Redis):
"session:abc123" → { "user_id": 1, "role": "admin" }

Wide-column (Cassandra):
time_series_data: [timestamp, sensor1, sensor2, ...]

✓ Schema linh hoạt (thêm field không cần migrate)
✓ No JOINs (embed documents)
✓ Horizontal scaling DỄ (built-in sharding)
✓ Denormalized data (read optimized)
```

---

# ACID Properties

## Đảm bảo tính nhất quán của database

```
┌────────────────────────────────────────────────────────────┐
│  A - ATOMICITY (Tính nguyên tử)                           │
│  ───────────────────────────────────────────────────────── │
│  Transaction = TẤT CẢ hoặc KHÔNG GÌ                      │
│                                                              │
│  Chuyển 500k từ tài khoản A → tài khoản B                │
│  ┌────────────────────────────────────────────────────┐    │
│  │ BEGIN TRANSACTION                                 │    │
│  │   UPDATE accounts SET balance = balance - 500   │    │
│  │   UPDATE accounts SET balance = balance + 500   │    │
│  │   IF error THEN ROLLBACK                         │    │
│  │   ELSE COMMIT                                    │    │
│  │ END TRANSACTION;                                 │    │
│  └────────────────────────────────────────────────────┘    │
├────────────────────────────────────────────────────────────┤
│  C - CONSISTENCY (Tính nhất quán)                         │
│  ───────────────────────────────────────────────────────── │
│  Database luôn ở trạng thái VALID sau transaction        │
│  PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK constraints     │
├────────────────────────────────────────────────────────────┤
│  I - ISOLATION (Tính cô lập)                             │
│  ───────────────────────────────────────────────────────── │
│  READ UNCOMMITTED < READ COMMITTED < REPEATABLE READ <     │
│  < SERIALIZABLE                                          │
├────────────────────────────────────────────────────────────┤
│  D - DURABILITY (Tính bền vững)                          │
│  ───────────────────────────────────────────────────────── │
│  Commit thành công = Data tồn tại vĩnh viễn              │
│  Write-Ahead Log (WAL) + Replication                     │
└────────────────────────────────────────────────────────────┘
```

---

# ORM vs Raw SQL

## Hai cách tương tác với database

**ORM (Prisma - Type-safe):**

```typescript
// Query đơn giản
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true }
})

// Query phức tạp
const users = await prisma.user.findMany({
  where: {
    AND: [
      { email: { endsWith: '@company.com' } },
      { posts: { some: { published: true } } }
    ]
  },
  orderBy: { name: 'asc' },
  take: 10,
  include: { _count: { select: { posts: true } } }
})
```

**Raw SQL (khi cần optimize):**

```sql
SELECT u.id, u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
WHERE u.email LIKE '%@company.com'
GROUP BY u.id, u.name
ORDER BY post_count DESC
LIMIT 10
```

| Khía cạnh | ORM | Raw SQL |
|-----------|-----|---------|
| Development speed | Nhanh hơn | Chậm hơn |
| Type safety | Có (Prisma) | Không |
| Security | Tự động escape | Phải tự làm |
| Performance | OK | Tốt hơn |

---

# Authentication vs Authorization

## Hai khái niệm dễ nhầm lẫn

```
┌────────────────────────────────────────────────────────────┐
│  AUTHENTICATION (Xác thực) - "BẠN LÀ AI?"                │
│  ───────────────────────────────────────────────────────── │
│  Xác minh identity của user                              │
│                                                              │
│  Methods:                                                  │
│  ├── Password + Username                                   │
│  ├── OAuth 2.0 (Google, GitHub login)                    │
│  ├── SSO (Single Sign-On)                                 │
│  ├── Biometric (fingerprint, face)                        │
│  └── Multi-factor (2FA: SMS, TOTP, Hardware key)        │
│                                                              │
│  Result: Đăng nhập thành công → nhận token/session      │
├────────────────────────────────────────────────────────────┤
│  AUTHORIZATION (Phân quyền) - "BẠN ĐƯỢC LÀM GÌ?"         │
│  ───────────────────────────────────────────────────────── │
│  Kiểm tra quyền hạn của user đã authenticate            │
│                                                              │
│  Models:                                                   │
│  ├── RBAC (Role-Based)                                    │
│  │   ├── admin: full access                              │
│  │   ├── editor: read + write                           │
│  │   └── viewer: read only                              │
│  ├── ABAC (Attribute-Based)                               │
│  │   └── user.department == 'engineering'                │
│  └── PBAC (Permission-Based)                              │
│      └── permissions: ['users:read', 'users:write']      │
│                                                              │
│  Result: Được phép HOẶC bị từ chối thực hiện action    │
└────────────────────────────────────────────────────────────┘
```

---

# Session-based Authentication

## Server lưu trạng thái user

```
┌────────────────────────────────────────────────────────────┐
│  1. LOGIN                                                  │
│  Client                         Server                      │
│    │──── POST /login ──────────────▶│                      │
│    │       username + password       │                      │
│    │                               ├─▶ Verify password      │
│    │                               ├─▶ Create session       │
│    │                               │   in Redis/DB         │
│    │◀─── Set-Cookie: session_id=xyz ───│                  │
│    │       (HttpOnly, Secure, SameSite=Lax)                │
├────────────────────────────────────────────────────────────┤
│  2. SUBSEQUENT REQUESTS                                   │
│  Client                         Server                      │
│    │──── GET /api/data ────────────▶│                      │
│    │       Cookie: session_id=xyz  │                      │
│    │                               ├─▶ Lookup session      │
│    │                               │   in Redis/DB         │
│    │◀─── Response ─────────────────│                      │
├────────────────────────────────────────────────────────────┤
│  3. LOGOUT                                                │
│    │──── POST /logout ────────────▶│                      │
│    │                               ├─▶ Delete session     │
│    │◀─── Set-Cookie: session_id=; ──│ Max-Age=0          │
└────────────────────────────────────────────────────────────┘

Ưu điểm:
✓ Dễ revoke (xóa session trong Redis → immediately invalid)
✓ Token nhỏ (~32 bytes)
✓ Secret server-side

Nhược điểm:
✗ Server cần session store
✗ Session lookup tốn thêm latency
```

---

# JWT (JSON Web Token)

## Token tự chứa thông tin

```
┌────────────────────────────────────────────────────────────┐
│  JWT STRUCTURE:                                          │
│                                                              │
│  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9                   │
│  │         │                                              │
│  │    Base64Url(Header)                                  │
│  │    {"alg":"HS256","typ":"JWT"}                        │
│  │                                                        │
│  │  .eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNzQ2...        │
│  │         │                                              │
│  │    Base64Url(Payload)                                 │
│  │    {"sub":"user_123","role":"admin","exp":...}        │
│  │                                                        │
│  │  .SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c        │
│  │         │                                              │
│  │    HMAC-SHA256(Header.Payload, Secret)                │
└────────────────────────────────────────────────────────────┘

PAYLOAD (Claims):
{
  "sub": "user_123",         // Subject (user ID)
  "name": "Khang",           // Tên user
  "role": "admin",           // QUYỀN Ở ĐÂY!
  "iat": 1715164800,         // Issued at
  "exp": 1715251200          // Expiration (1 day)
}

Ưu điểm:
✓ Stateless (không cần session store)
✓ Scalable (token gửi đi đâu cũng valid)
✓ Cross-domain (dùng cho nhiều services)

Nhược điểm:
✗ Khó revoke ngay lập tức
✗ Token có thể bị leak
```

---

# JWT Flow

## Từ login đến authenticated request

```
┌────────────────────────────────────────────────────────────┐
│  1. LOGIN                                                 │
│  Client                         Server                      │
│    │──── POST /login ──────────────▶│                      │
│    │       username + password       │                      │
│    │                               ├─▶ Verify password      │
│    │                               ├─▶ Create JWT           │
│    │                               │   with server secret   │
│    │◀─── { token: "eyJ..." } ────│                      │
├────────────────────────────────────────────────────────────┤
│  2. SUBSEQUENT REQUESTS                                   │
│  Client                         Server                      │
│    │──── GET /api/data ────────────▶│                      │
│    │       Authorization:            │                      │
│    │       Bearer eyJ...             │                      │
│    │                               ├─▶ Verify JWT signature │
│    │                               │   + check exp          │
│    │                               │   (NO DATABASE!)       │
│    │◀─── Response ─────────────────│                      │
├────────────────────────────────────────────────────────────┤
│  3. REVOKE? (KHÓ KHĂN)                                   │
│  ├── Blacklist in Redis (mất stateless)                  │
│  ├── Short expiry (access token: 15 phút)               │
│  └── Refresh token (lưu trong DB)                        │
└────────────────────────────────────────────────────────────┘
```

---

# JWT Tamper Demo

## Tại sao signature quan trọng?

```javascript
// 1. Decode payload (không cần key)
const payload = atob('eyJzdWIiOiIxMjM0NTY3ODkwIiwiYWRtaW4iOmZhbHNlfQ==')
// {"sub":"1234567890","admin":false}

// 2. Thay đổi admin: false → admin: true
const fakePayload = btoa(JSON.stringify({
  sub: "1234567890",
  admin: true   // ← Thay đổi ở đây!
}))

// 3. Tạo token mới: header.payload.signature
// Signature vẫn dùng secret cũ → KHÔNG HỢP LỆ!

// 4. Server verify signature → REJECTED!
// "JsonWebTokenError: invalid signature"
```

**JWT Tamper = Payload thay đổi được, nhưng KHÔNG tạo được signature hợp lệ**

---

# CORS: Cross-Origin Resource Sharing

## Tại sao trình duyệt chặn request?

```
┌────────────────────────────────────────────────────────────┐
│  SAME-ORIGIN POLICY                                        │
│                                                              │
│  Origin = Protocol + Domain + Port                         │
│                                                              │
│  http://example.com:3000                                    │
│       │         │           │                              │
│       ▼         ▼           ▼                              │
│  protocol   domain     port                                │
│                                                              │
│  Same Origin: ✓ http://example.com → http://example.com  │
│  Different Origin:                                          │
│  ✗ http://localhost:3000 → http://localhost:5173          │
│  ✗ http://example.com → http://api.example.com            │
│  ✗ http://example.com → https://example.com                │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  CORS WORKFLOW                                             │
│                                                              │
│  Browser                        Server                      │
│    │──── GET /api ────────────────▶│ (Simple request)    │
│    │    Origin: localhost:5173      │                      │
│    │◀─── 200 OK + Access-Control-  │                      │
│    │    Allow-Origin: http://       │                      │
│    │    localhost:5173              │                      │
│                                                              │
│  Hoặc PREFLIGHT (OPTIONS) cho complex requests:           │
│    │──── OPTIONS /api ─────────────▶│                      │
│    │◀─── 204 + Allow-Methods ──────│                      │
│    │──── GET /api ────────────────▶│ (Actual request)    │
│    │◀─── 200 OK ──────────────────│                      │
└────────────────────────────────────────────────────────────┘
```

---

# SQL Injection

## Khi input của user trở thành câu lệnh SQL

```
┌────────────────────────────────────────────────────────────┐
│  VÍ DỤ THƯỜNG GẶP                                        │
│                                                              │
│  BAD (concatenation):                                       │
│  const query = `SELECT * FROM users                       │
│  WHERE username = '${username}'                           │
│  AND password = '${password}'`;                          │
│                                                              │
│  ATTACK: username = "admin' --"                           │
│  → Query trở thành:                                       │
│  SELECT * FROM users WHERE username = 'admin' --'         │
│  AND password = ''                                        │
│  → '--' comment out → bypass login!                       │
│                                                              │
│  ATTACK: username = "'; DROP TABLE users; --"             │
│  → Table users bị XÓA!                                    │
├────────────────────────────────────────────────────────────┤
│  PHÒNG CHỐNG                                              │
│                                                              │
│  GOOD (parameterized query):                               │
│  pool.query(                                              │
│    'SELECT * FROM users WHERE username = $1 AND password = $2',
│    [username, hashedPassword]                              │
│  )                                                         │
│  // $1, $2 = parameterized → không thể inject           │
│                                                              │
│  GOOD (ORM - Prisma):                                      │
│  prisma.user.findFirst({                                  │
│    where: { username, password: hash(password) }         │
│  })                                                        │
│  // Prisma tự escape tất cả inputs                       │
└────────────────────────────────────────────────────────────┘
```

---

# XSS: Cross-Site Scripting

## Inject script độc hại vào trang web

```
┌────────────────────────────────────────────────────────────┐
│  3 LOẠI XSS                                               │
│                                                              │
│  1. STORED XSS (Nguy hiểm nhất)                           │
│  ───────────────────────────────────────────────────────── │
│  Malicious script được LƯƯ vào database                   │
│                                                              │
│  1. Attacker post: "Bài viết hay!" + <script>stealCookies()│
│  2. Comment được lưu vào DB                               │
│  3. User đọc comment → Browser execute script → cookie bị │
│     đánh cắp                                              │
│                                                              │
│  2. REFLECTED XSS                                          │
│  ───────────────────────────────────────────────────────── │
│  Script nằm trong URL, được "phản chiếu" trong response │
│                                                              │
│  URL: https://search.com?q=<script>alert(1)</script>    │
│  → Response: "Kết quả cho: <script>alert(1)</script>"   │
│                                                              │
│  3. DOM-BASED XSS                                          │
│  ───────────────────────────────────────────────────────── │
│  Script được execute bởi JavaScript phía client           │
│                                                              │
│  JS: document.write(location.hash)                        │
│  URL: app.com#<img src=x onerror=alert(1)>               │
└────────────────────────────────────────────────────────────┘

PHÒNG CHỐNG:
├── Sanitize HTML input (DOMPurify)
├── Content Security Policy (CSP)
├── HTTPOnly Cookie (JS không đọc được cookie)
└── React/Vue auto-escape template
```

---

# CSRF: Cross-Site Request Forgery

## Lừa user gửi request không biết

```
┌────────────────────────────────────────────────────────────┐
│  ATTACK SCENARIO                                           │
│                                                              │
│  1. User đã login ngân hàng.com (session valid)          │
│                                                              │
│  2. User mở email từ attacker:                           │
│     <img src="https://nganhang.com/transfer?              │
│          to=attacker&amount=10000000">                    │
│                                                              │
│  3. Browser tự động gửi:                                 │
│     → Request đến nganhang.com                            │
│     → Kèm cookie session của user                         │
│     → Server không phân biệt được request hợp lệ        │
│                                                              │
│  4. 10 triệu đi đâu?                                      │
└────────────────────────────────────────────────────────────┘

PHÒNG CHỐNG:
├── CSRF Token (mỗi form cần token unique)
│   <input type="hidden" name="csrf_token" value="abc123">
├── SameSite Cookie
│   Set-Cookie: session=xyz; SameSite=Strict
└── Origin/Referer Header Check
```

---

# Security Headers

## Defense in Depth

```javascript
// Security Headers - Middleware cho Express
import helmet from 'helmet'

app.use(helmet())

// Chi tiết:

// 1. Content-Security-Policy (CSP)
// Ngăn chặn XSS
res.setHeader('Content-Security-Policy',
  "default-src 'self'; " +
  "script-src 'self' 'nonce-{SERVER_GENERATED}'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: https:; " +
  "frame-ancestors 'none'")

// 2. X-Frame-Options
// Ngăn clickjacking (iframe)
res.setHeader('X-Frame-Options', 'DENY')

// 3. X-Content-Type-Options
// Ngăn MIME type sniffing
res.setHeader('X-Content-Type-Options', 'nosniff')

// 4. Strict-Transport-Security (HSTS)
// Force HTTPS
res.setHeader('Strict-Transport-Security',
  'max-age=31536000; includeSubDomains; preload')

// 5. Referrer-Policy
res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

// 6. Permissions-Policy
// Kiểm soát browser features
res.setHeader('Permissions-Policy',
  'camera=(), microphone=(), geolocation=()')
```

---

# Demo: JWT Inspect & Tamper

## Thử thay đổi payload và xem server từ chối

```javascript
const jwt = require('jsonwebtoken')

// Tạo token với secret
const token = jwt.sign(
  { sub: 'user_1', role: 'user' },
  'my-secret-key',
  { expiresIn: '1h' }
)
console.log('Token:', token)

// Verify: thành công
try {
  const decoded = jwt.verify(token, 'my-secret-key')
  console.log('Decoded:', decoded.role) // 'user'
} catch (err) {
  console.log('Error:', err.name)
}

// Verify với sai secret: THẤT BẠI
try {
  jwt.verify(token, 'wrong-key')
} catch (err) {
  console.log('Error:', err.name)    // 'JsonWebTokenError'
  console.log('Message:', err.message) // 'invalid signature'
}

// Decode payload (không verify - đọc thôi)
const payload = jwt.decode(token)
console.log('Payload:', payload) // { sub: 'user_1', role: 'user' }

// Thử tamper: đổi role thành admin
const parts = token.split('.')
const payloadJson = JSON.parse(
  Buffer.from(parts[1], 'base64').toString()
)
payloadJson.role = 'admin'
const tamperedPayload = Buffer.from(
  JSON.stringify(payloadJson)
).toString('base64url')
const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`

// Verify tampered token: THẤT BẠI!
try {
  jwt.verify(tamperedToken, 'my-secret-key')
} catch (err) {
  console.log('Tampered Error:', err.name) // 'JsonWebTokenError'
}
```

---

# Tóm tắt Buổi 3

## Những điểm cần nhớ

```
┌─────────────────────────────────────────────────────────────────┐
│                   MENTAL MODEL - BUỔI 3                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. HTTP = NỀN TẢNG WEB                                       │
│     Methods (GET/POST/PUT/DELETE) + Status Codes + Headers     │
│     REST: Uniform Interface, Stateless, Cacheable              │
│                                                                  │
│  2. AUTHENTICATION vs AUTHORIZATION                             │
│     Authn: Bạn là ai? (login)                                  │
│     Authz: Bạn được làm gì? (permissions)                      │
│                                                                  │
│  3. SESSION vs JWT                                              │
│     Session: Server lưu, dễ revoke, cần store                 │
│     JWT: Self-contained, stateless, khó revoke                  │
│                                                                  │
│  4. CORS                                                        │
│     Browser policy: Origin khác nhau → chặn request            │
│     Server phải trả Access-Control-Allow-Origin                 │
│                                                                  │
│  5. SQL INJECTION                                               │
│     Input thành SQL → DROP TABLE / bypass login                │
│     Phòng: Parameterized query / ORM                            │
│                                                                  │
│  6. XSS                                                         │
│     Inject script vào trang web                                 │
│     Phòng: Sanitize, CSP, HTTPOnly cookie                      │
│                                                                  │
│  7. CSRF                                                        │
│     Lừa browser gửi request kèm cookie                        │
│     Phòng: CSRF token, SameSite cookie                          │
│                                                                  │
│  8. SECURITY HEADERS                                            │
│     CSP, HSTS, X-Frame-Options, X-Content-Type-Options         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# Tổng kết toàn khóa

## Mental Model từ đầu đến cuối

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
│                                    └───────┬───────────┘       │
│                                            │                   │
│  ◀── TCP/IP Network ───◀──◀──◀──◀──◀──┘                       │
│                                                                  │
│                          ◀──────────◀                           │
│                            Database                              │
│                         (PostgreSQL)                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# Lộ trình tự học

## Bước tiếp theo sau khóa học

**Level 1 - Cần thực hành ngay:**
- Viết script bash tự động hóa
- Deploy 1 app lên server (DigitalOcean, Railway)
- Viết API RESTful với Express/NestJS
- Build Dockerfile cho project hiện tại

**Level 2 - Sâu hơn:**
- Kubernetes để orchestrate containers
- CI/CD pipeline (GitHub Actions)
- Monitoring & Logging (Prometheus, Grafana)
- Message Queue (Redis, RabbitMQ)

**Level 3 - Chuyên sâu:**
- Microservices architecture
- Service Mesh (Istio)
- Infrastructure as Code (Terraform)
- Cloud-native security

---

# Cảm ơn các bạn!

## Đặt câu hỏi hoặc liên hệ

**Tài liệu kèm theo:**

- Cheat sheet Linux commands
- Cheat sheet Docker commands
- Cheat sheet Networking commands
- Demo code (syscall, docker, jwt)
- Mind map tổng hợp mental model

**Ghi nhớ:**

> "Công cụ thay đổi theo năm tháng, nhưng nguyên lý tồn tại hàng thập kỷ."

Hãy hiểu **tại sao**, không chỉ **làm thế nào**.

---

# Phụ lục: Các lệnh Linux thường dùng

## Quick reference

```bash
# Navigation
ls -la /path        # Liệt kê file (bao gồm hidden)
cd /path            # Di chuyển
pwd                 # Thư mục hiện tại
mkdir name          # Tạo thư mục

# File operations
cp src dst          # Copy
mv src dst          # Di chuyển/đổi tên
rm -rf name         # Xóa (force, recursive)
cat file            # Xem nội dung
head -n 20 file     # 20 dòng đầu
tail -f file        # Theo dõi log realtime

# Process
ps aux              # Processes đang chạy
kill -9 PID        # Kill process
htop                # Monitor tương tác
strace -c cmd      # Trace syscalls

# Network
curl -v url        # HTTP request chi tiết
ping host          # Test connectivity
netstat -tulpn     # Ports đang listening
ss -tulpn          # Tương tự (mới hơn)
```

---

# Phụ lục: Các lệnh Docker thường dùng

## Quick reference

```bash
# Image
docker build -t name:tag .        # Build image
docker images                      # Liệt kê images
docker rmi name:tag              # Xóa image
docker pull image:tag            # Pull từ registry

# Container
docker run -d -p 3000:3000 name  # Chạy container
docker ps -a                      # Liệt kê containers
docker stop/rm name               # Stop/remove
docker logs -f name              # Xem logs
docker exec -it name bash        # Vào container

# Compose
docker compose up -d             # Start all
docker compose down              # Stop all
docker compose logs -f          # Logs all

# Cleanup
docker system prune -a           # Xóa tất cả unused
docker image prune               # Xóa dangling images
```
