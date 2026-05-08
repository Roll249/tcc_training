# Buổi 1: Nền tảng Hệ thống & Mạng

> **Mục tiêu:** Phá vỡ "hộp đen" của máy tính. Hiểu phần mềm thực sự chạy trên cái gì và cách máy tính nói chuyện với nhau.
>
> **Thời lượng:** 3 tiếng (180 phút)
>
> **Ghi nhớ quan trọng:** "Từ khi bạn gõ một phím đến khi kết quả hiển thị trên màn hình, có hàng trăm layer phần mềm và phần cứng tham gia. Khóa học này giúp bạn nhìn thấy những layer đó."

---

## Phần 1: Operating System & Kernel (45 phút)

### 1.1. OS là gì? - Nhìn từ góc độ thực tế

Khi bạn mở một ứng dụng, điều gì thực sự xảy ra?

```
Bước 1: Bạn double-click icon Chrome trên desktop
    │
    ▼
Bước 2: Desktop Environment (GNOME/KDE) nhận event
    │   Gửi message đến process "Chrome"
    │
    ▼
Bước 3: Kernel kiểm tra: "Chrome được phép chạy không?"
    │   User có quyền? Đủ RAM không? File executable không corrupt?
    │
    ▼
Bước 4: Kernel tải Chrome binary từ disk vào RAM
    │   Cấp phát virtual memory cho Chrome
    │   Thiết lập các namespaces (PID, network, mount...)
    │
    ▼
Bước 5: Chrome bắt đầu chạy trong User Space
    │   Tạo renderer processes, GPU process, network process
    │
    ▼
Bước 6: Chrome muốn vẽ cửa sổ → gọi syscall
    │   syscall ioctl() hoặc write() → Kernel vẽ lên framebuffer
    │
    ▼
Bước 7: GPU nhận lệnh vẽ từ Kernel
    │
    ▼
Bước 8: Tín hiệu điện tử → Pixel trên màn hình
```

**OS làm gì thực sự?** OS là người quản gia của ngôi nhà "máy tính":

| Chức năng | Chi tiết |
|-----------|----------|
| **Process Management** | Tạo, lên lịch, dừng process. Quyết định process nào chạy khi nào (scheduler) |
| **Memory Management** | Cấp phát RAM cho từng process. Dùng virtual memory để mỗi app nghĩ nó có RAM riêng |
| **File System** | Tổ chức dữ liệu trên đĩa thành cây thư mục. Đọc/ghi file an toàn |
| **Device Management** | Giao tiếp với phần cứng (keyboard, mouse, network card, GPU) qua drivers |
| **Security & Permissions** | Ai được làm gì? root vs user. File permissions (rwx) |
| **Networking** | TCP/IP stack. Gửi packet ra internet, nhận packet về |
| **Inter-Process Communication (IPC)** | Processes giao tiếp với nhau qua pipes, sockets, shared memory |

### 1.2. User Space vs Kernel Space - Biên giới bảo mật

Đây là ranh giới quan trọng nhất trong hệ thống. Vi phạm ranh giới này = kernel panic (màn hình xanh chết) hoặc crash toàn hệ thống.

**Tại sao cần chia 2 vùng?**

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER SPACE                                 │
│                                                                   │
│  Process A (Chrome)     Process B (VS Code)    Process C (Spotify) │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │ Virtual addr │     │ Virtual addr │     │ Virtual addr │    │
│  │ 0x00400000  │     │ 0x00400000  │     │ 0x00400000  │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│         │                   │                   │                 │
│         └───────────────────┴───────────────────┘                 │
│                             │                                     │
│                   System Call Interface                           │
│                   (printf → write syscall)                       │
├─────────────────────────────┼─────────────────────────────────────┤
│                        KERNEL SPACE                              │
│                             │                                     │
│         ┌───────────────────┴───────────────────┐                │
│         │         System Call Table             │                │
│         │  sys_read, sys_write, sys_open, ... │                │
│         └───────────────────┬───────────────────┘                │
│                             │                                     │
│  ┌──────────┬──────────┬───┴───┬──────────┬──────────┐         │
│  │ Process  │ Memory   │ File  │ Network  │ Device  │         │
│  │ Scheduler│ Manager  │System │  Stack   │ Drivers │         │
│  └──────────┴──────────┴───────┴──────────┴──────────┘         │
│                             │                                     │
│         ┌───────────────────┴───────────────────┐                │
│         │         Hardware Abstraction         │                │
│         │    (Device drivers cho từng thiết bị) │                │
│         └───────────────────┬───────────────────┘                │
│                             │                                     │
│  ┌──────────────────────────┴──────────────────────────┐          │
│  │                  PHẦN CỨNG                           │          │
│  │   CPU    RAM    DISK    NETWORK CARD    GPU         │          │
│  └───────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

**Điều gì xảy ra khi code gọi printf("Hello")?**

```
User Space                          Kernel Space
    │                                    │
    │                                    │
printf("Hello")                          │
    │                                    │
    ▼                                    │
libc (printf)                            │
    │                                    │
    ▼                                    │
Thực hiện syscall write()                │
    │                                    │
    ├───────────────────────────────────▶│
    │                                    │
    │   syscall number = 1 (Linux x86_64) │
    │   registers:                        │
    │   - rax = 1 (sys_write)            │
    │   - rdi = 1 (fd = stdout)         │
    │   - rsi = address_of_string         │
    │   - rdx = 5 (length = 5)          │
    │                                    │
    ▼                                    │
    │                              Kernel xử lý:
    │                                    │ - Kiểm tra fd có hợp lệ?
    │                                    │ - Kiểm tra quyền truy cập?
    │                                    │ - Copy string từ user space
    │                                    │ - Gửi đến terminal driver
    │                                    │ - Đánh thức terminal (interrupt)
    │                                    │
    │◀───────────────────────────────────┤
    │                                    │
    │   return value: số bytes đã ghi   │
    │                                    │
    ▼                                    │
Kết quả: "Hello" xuất hiện trên màn hình
```

### 1.3. System Calls - Cầu nối giữa 2 thế giới

System Call là **một trong những khái niệm quan trọng nhất** trong lập trình hệ thống. Mỗi lần bạn đọc file, gửi network request, hay thậm chí tạo thread, bạn đều gọi syscall.

**Danh sách quan trọng nhất cần nhớ:**

| Syscall | Số (x86_64) | Chức năng | Giải thích chi tiết |
|---------|-------------|-----------|---------------------|
| `read` | 0 | Đọc từ fd | fd có thể là file (0=stdin, 1=stdout, 2=stderr) hoặc socket |
| `write` | 1 | Ghi ra fd | Ghi ra terminal, file, hoặc network |
| `open` | 2 | Mở file | Trả về file descriptor (số nguyên dương) |
| `close` | 3 | Đóng fd | Giải phóng file descriptor |
| `fork` | 57 | Tạo process mới | Process mới là bản copy y hệt process cha |
| `execve` | 59 | Chạy chương trình khác | Thay thế image của process hiện tại |
| `exit` | 60 | Kết thúc process | Trả về exit code |
| `mmap` | 9 | Ánh xạ bộ nhớ | Cấp phát RAM hoặc map file vào memory |
| `brk` | 12 | Thay đổi heap size | Tăng/giảm heap (malloc dùng syscall này) |
| `socket` | 41 | Tạo socket | Tạo endpoint cho network communication |
| `bind` | 49 | Bind socket | Gắn socket vào port (server dùng) |
| `connect` | 42 | Kết nối | Kết nối đến server (client dùng) |
| `pipe` | 22 | Tạo pipe | Giao tiếp giữa processes |

**File Descriptor là gì?**

File Descriptor (fd) là một số nguyên đại diện cho một "file" đang mở. Mỗi process có bảng fd riêng:

```
Process "bash"
├── fd 0: stdin (terminal input)      → /dev/pts/0
├── fd 1: stdout (terminal output)   → /dev/pts/0
├── fd 2: stderr (error output)      → /dev/pts/0
├── fd 3: /etc/passwd               → opened by login
└── fd 4: ~/.bashrc                 → opened by bash
```

### 1.4. Demo: strace - Nhìn thấy hơi thở của chương trình

`strace` là công cụ debug mạnh nhất trên Linux. Nó in ra mọi syscall mà process gọi.

```bash
# 1. strace đơn giản - theo dõi tất cả syscalls
strace ls -la /tmp

# Output mẫu (đã format cho dễ đọc):
# execve("/usr/bin/ls", ["ls", "-la", "/tmp"], 0x7ffd...) = 0
# brk(NULL)                               = 0x55a3b2c00000
# access("/etc/ld.so.preload", R_OK)      = -1 (ENOENT)
# openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
# newfstatat(AT_FDCWD, "/tmp", {st_mode=S_IFDIR|0777, st_size=4096, ...}, 0) = 0
# openat(AT_FDCWD, "/tmp", O_RDONLY|O_NONBLOCK|O_CLOEXEC|O_DIRECTORY) = 3
# getdents64(3, [{d_name=".", d_type=DT_DIR, ...}, {d_name="..", ...}], 1024) = 48
# write(1, "total 8\ndrwxrwxrwt  2 root root 4096 May  8 14:00 .\n", 41) = 41
# close(3)                                = 0
# close(1)                                = 0
# close(2)                                = 0
# exit_group(0)                           = ?
# +++ exited with 0 +++

# 2. Filter chỉ syscalls cụ thể
strace -e trace=open,read,write cat /etc/hostname

# 3. Count syscalls - thống kê
strace -c ls -la /tmp
# % time     seconds  usecs/call     calls    errors syscall
# ------ ----------- ----------- --------- --------- -------
# 28.57    0.000002           2         1           write
# 14.29    0.000001           1         1           openat
# 14.29    0.000001           1         1           getdents64
#  0.00    0.000000           0         1           execve
#  0.00    0.000000           0         5           newfstatat
# ------ ----------- ----------- --------- --------- -------
# 100.00    0.000007                     9           total

# 4. Trace child processes (fork + exec)
strace -f npm run dev
# 14000 clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID|...) = 14001
# 14001 execve("/usr/bin/node", ["node", "server.js"], ...) = 0

# 5. Ghi vào file để phân tích sau
strace -o trace.log -f -e trace=network ./my_server

# 6. Attach vào process đang chạy
strace -p 12345 -f
# Attach vào process có PID 12345
```

---

## Phần 2: Linux & Terminal (60 phút)

### 2.1. Tại sao Software Engineer phải biết Linux?

Đây không phải câu hỏi "nên học không?" mà là "bắt buộc phải học". Lý do cực kỳ thực tế:

```
┌─────────────────────────────────────────────────────────────────┐
│                    THỰC TẾ NGÀNH 2026                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  💻 Server Market Share                                         │
│  ├── Linux: 96.3%                                               │
│  ├── Windows Server: 3.2%                                        │
│  └── Others: 0.5%                                                │
│                                                                  │
│  ☁️ Cloud Providers (tất cả đều Linux)                          │
│  ├── AWS EC2: Linux AMIs chiếm ~80%                             │
│  ├── GCP Compute Engine: 75%+ Linux                             │
│  └── Azure VMs: 60%+ Linux                                      │
│                                                                  │
│  🐳 Container Ecosystem                                          │
│  ├── Docker: Linux-based                                        │
│  ├── Kubernetes: Linux nodes                                     │
│  └── Serverless (Lambda): Linux runtime                         │
│                                                                  │
│  💼 Job Market                                                  │
│  ├── Backend jobs: Linux là yêu cầu gần như bắt buộc          │
│  ├── DevOps/SRE: Linux + bash scripting = cơ bản              │
│  └── Cloud roles: AWS/GCP/Azure CLI đều Linux-friendly         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2. File System Hierarchy - "Everything is a file"

Unix philosophy: "Mọi thứ đều là file." Thiết bị, process, network socket, thậm chí kernel data structure đều được expose như file.

**Giải thích chi tiết từng thư mục:**

```
/ (root - thư mục gốc của mọi thư mục)
│
├── bin/ (essential user binaries - /bin chứa các lệnh cơ bản nhất)
│   ├── ls        → list files
│   ├── cp        → copy
│   ├── mv        → move
│   ├── rm        → remove
│   ├── cat       → concatenate & print
│   └── sh        → shell (bash)
│
├── sbin/ (system binaries - chỉ root mới chạy được)
│   ├── fdisk     → partition disk
│   ├── mkfs      → format disk
│   ├── ifconfig  → configure network interface
│   └── reboot    → restart system
│
├── etc/ (configuration - tất cả config files của hệ thống)
│   ├── passwd    → danh sách users
│   ├── shadow    → hashed passwords (root only)
│   ├── group     → groups
│   ├── sudoers   → sudo permissions
│   ├── fstab     → mount points khi boot
│   ├── hosts     → static DNS lookups
│   ├── nginx/
│   │   └── nginx.conf
│   └── systemd/
│       └── system/
│           └── myservice.service
│
├── home/ (user home directories - mỗi user có thư mục riêng)
│   └── khang/
│       ├── Documents/
│       ├── Downloads/
│       ├── Projects/
│       │   └── my-app/
│       │       ├── src/
│       │       └── package.json
│       └── .config/      (hidden config files)
│
├── root/ (home của root user - KHÔNG dùng /home/root)
│
├── var/ (variable data - dữ liệu thay đổi thường xuyên)
│   ├── log/            (system logs)
│   │   ├── syslog     → system log
│   │   ├── auth.log   → authentication attempts
│   │   ├── nginx/
│   │   │   ├── access.log
│   │   │   └── error.log
│   │   └── docker/
│   │       └── daemon.log
│   ├── cache/          (cached data - có thể xóa)
│   ├── tmp/            (temporary - có thể xóa)
│   ├── www/            (web root - thường dùng)
│   │   └── html/
│   │       └── index.html
│   └── lib/            (persistent app data)
│       └── docker/
│           └── volumes/
│
├── usr/ (user programs - ứng dụng người dùng cài đặt)
│   ├── bin/            (non-essential user binaries)
│   │   ├── node        → Node.js runtime
│   │   ├── python3     → Python
│   │   ├── git         → Git VCS
│   │   └── docker      → Docker CLI
│   ├── sbin/          (non-essential system binaries)
│   ├── lib/            (shared libraries)
│   │   └── x86_64-linux-gnu/
│   │       ├── libcrypto.so  (OpenSSL)
│   │       └── libssl.so
│   └── local/          (locally installed software)
│       ├── bin/
│       ├── lib/
│       └── etc/
│
├── tmp/ (temporary - XÓA KHI BOOT trên nhiều hệ thống!)
│   ├── session-xxx.socket
│   └── tracker-xxx/
│
├── dev/ (device files - thiết bị được expose như files)
│   ├── null           → black hole - ghi vào đây = mất
│   ├── zero           → infinite zeros
│   ├── random         → random data
│   ├── tty            → current terminal
│   ├── sda/           → first SCSI/SATA disk
│   │   ├── sda1       → first partition
│   │   └── sda2       → second partition
│   └── pts/
│       └── 0          → pseudo terminal
│
├── proc/ (process info - filesystem ẢO, không có thật trên disk)
│   ├── 1/             → thông tin process PID 1 (systemd/init)
│   │   ├── cmdline    → command line đã chạy process
│   │   ├── environ    → environment variables
│   │   ├── fd/        → file descriptors
│   │   │   ├── 0      → stdin
│   │   │   ├── 1      → stdout
│   │   │   └── 2      → stderr
│   │   ├── maps       → memory mappings
│   │   ├── status     → process status
│   │   └── statm      → memory usage
│   ├── self/          → symlink đến current process
│   ├── cpuinfo        → CPU info
│   ├── meminfo        → memory info
│   └── uptime         → system uptime
│
├── sys/ (system info - tương tự proc, cho kernel)
│   ├── kernel/
│   │   └── version
│   └── block/
│       └── sda/
│           └── size
│
└── boot/ (kernel + boot files)
    ├── vmlinuz-6.5.0   → Linux kernel
    ├── initrd.img-6.5.0 → initial ramdisk
    └── grub/            → bootloader config
```

### 2.3. Processes & Threads - Đơn vị thực thi

**Process** là một chương trình đang chạy. Nó có:
- Virtual address space riêng
- PID (Process ID) duy nhất
- Parent PID (PPID)
- File descriptors (mở file, sockets...)
- Signal handlers
- Current working directory

**Thread** là đơn vị nhỏ hơn trong process:
- Chia sẻ virtual address space với các threads khác trong cùng process
- Chia sẻ heap, code, global variables
- Mỗi thread có stack riêng

```
Process "Chrome" (PID 1234)
│
├── Thread: "Main" (TID 1234)
│   ├── Stack: 8MB
│   ├── Registers: RIP=0x401000, RSP=0x7fff...
│   └── Shared: Heap, Code, Global vars, FDs
│
├── Thread: "Renderer" (TID 1235)
│   ├── Stack: 8MB
│   ├── Registers: RIP=0x402000, RSP=0x7ffe...
│   └── Shared: Heap, Code, Global vars, FDs
│
├── Thread: "GPU" (TID 1236)
│   ├── Stack: 8MB
│   └── Shared: Heap, Code, Global vars, FDs
│
└── Shared Resources
    ├── Heap: malloc'd memory (tất cả threads dùng chung)
    ├── Code: .text segment (tất cả threads dùng chung)
    ├── Global vars: .data segment
    └── Open files: FD table (tất cả threads dùng chung)
```

**Process Lifecycle:**

```
                    fork()
    ┌───────────────()───────────────┐
    │                                  │
    │    Parent (bash)                 │    Child (bash -c "ls")
    │    PID=1000                     │    PID=1001, PPID=1000
    │                                  │
    │                                  │    execve("/bin/ls")
    │                                  │    PID=1001, PPID=1000
    │                                  │
    │                                  │    write() ← output
    │                                  │
    │                                  │    exit(0)
    │                                  │
    │    waitpid(1001)                │
    │    (nhận exit code = 0)        │
    │                                  │
    ▼                                  ▼
 Parent tiếp tục                    Process kết thúc
```

**Memory Layout của một Process:**

```
0xFFFFFFFFFFFFFFFF  ┌─────────────────────┐  ← Kernel space (không user code truy cập được)
                    │                     │
                    │   (not accessible)  │
                    │                     │
0xFFFF800000000000  ├─────────────────────┤  ← Kernel virtual address
                    │                     │
                    │                     │
                    │                     │
                    ├─────────────────────┤  ← Stack (giảm xuống)
                    │   argc, argv       │
                    │   env variables     │
                    │   local vars        │
                    │   function calls    │
                    │   return addresses │
                    │                    │
                    ├─────────────────────┤
                    │                    │
                    │   (gap/mapped)     │
                    │                    │
                    ├─────────────────────┤  ← Heap (tăng lên)
                    │   malloc'd memory   │
                    │   (dynamic alloc)  │
                    │                    │
0x0000000000400000  ├─────────────────────┤  ← BSS (uninitialized data)
                    │   global vars=0     │
                    ├─────────────────────┤  ← Data (initialized data)
                    │   global vars       │
                    ├─────────────────────┤  ← Text (code)
                    │   machine code      │
                    │   instructions      │
0x0000000000001000  ├─────────────────────┤
                    │   (reserved)        │
0x0000000000000000  └─────────────────────┘  ← Null pointer guard
```

### 2.4. Permissions & Ownership - Ai được làm gì?

Linux dùng 3 groups của permissions: Owner (u), Group (g), Others (o).

```bash
# Xem permissions
ls -la /etc/passwd
# -rw-r--r--  1 root  root  4096  May  8 14:00  /etc/passwd
# └──┘└─┬─┘└─┬─┘
#     │    │   └── Others (r-- = read only)
#     │    └── Group (r-- = read only)
#     └── Owner (rw- = read + write, không execute)

# Chmod numeric - mỗi số = tổng của r(4)+w(2)+x(1)
chmod 755 file.sh    # rwxr-xr-x (7=owner, 5=group, 5=others)
chmod 644 file.txt   # rw-r--r-- (6=owner, 4=group, 4=others)
chmod 600 secret.key # rw------- (6=owner, 0=group, 0=others)
chmod 4711 binary    # rws--x--x (setuid - chạy với quyền owner)

# Chmod symbolic
chmod u+x file.sh          # Thêm execute cho owner
chmod g-w file.txt         # Bỏ write cho group
chmod o+rwx dir/           # Thêm tất cả cho others
chmod a+x script.sh        # Thêm execute cho all (a = all)
chmod u=rw,go=r file       # Set owner=rw, others=readonly

# Special permissions
chmod u+s /usr/bin/passwd  # Setuid - chạy với quyền owner (passwd cần root để write /etc/shadow)
chmod g+s /shared/         # Setgid - files mới có group của parent dir
chmod +t /tmp/             # Sticky bit - chỉ owner mới xóa được file trong dir

# Chown và Chgrp
chown user:group file.txt   # Đổi cả owner và group
chown :group file.txt       # Chỉ đổi group
chown user file.txt         # Chỉ đổi owner
chown -R user:group dir/   # Recursive

# ACL - Access Control Lists (chi tiết hơn rwx)
getfacl file.txt           # Xem ACL
setfacl -m u:khang:rw file  # Thêm user khang với quyền read+write
setfacl -m g:staff:rx dir/  # Thêm group staff với read+execute
setfacl -x u:khang file     # Xóa ACL entry
setfacl -m m::rx file       # Set mask (giới hạn max permissions)
```

### 2.5. Demo: Quản lý Processes trong thực tế

```bash
# 1. Xem tất cả processes
ps aux                    # BSD style (a=all users, u=user format, x=including no tty)
ps -ef                   # System V style (-e=all, -f=full)

# 2. Tìm process cụ thể
ps aux | grep nginx      # Tìm nginx
ps aux | grep -E '(nginx|node)'  # Tìm nginx hoặc node

# 3. Process tree (xem parent-child)
pstree                    # Tree view
pstree -p                # Với PIDs
pstree khang             # Tree bắt đầu từ user khang

# 4. Realtime monitoring
top                       # Monitor tương tác
# Các phím trong top:
# M = sort by Memory
# P = sort by CPU
# N = sort by PID
# T = sort by Time
# k = kill process
# r = renice (thay đổi priority)
# 1 = toggle CPU cores

htop                      # Giao diện tốt hơn top (cần cài đặt)

# 5. Continuous monitoring
watch -n 1 'ps aux | grep node'   # Chạy command mỗi 1 giây

# 6. Kill process
kill PID                   # SIGTERM (15) - graceful shutdown
kill -9 PID               # SIGKILL (9) - buộc dừng ngay
kill -15 PID              # SIGTERM - tương đương kill thường
kill -2 PID               # SIGINT - như Ctrl+C
kill -STOP PID            # Pause process
kill -CONT PID            # Resume process

# Kill bằng tên
pkill nginx               # Kill tất cả nginx
killall -9 chrome        # Kill tất cả chrome

# 7. Priority và Niceness
nice -n 10 ./heavy_script.sh    # Chạy với nice value 10 (lower priority)
renice -n -5 -p PID             # Thay đổi nice của process đang chạy
renice -n 10 -u khang           # Thay đổi priority của tất cả user khang

# 8. Background jobs
./script.sh &              # Chạy nền
jobs                       # Xem background jobs
fg %1                     # Đưa job #1 ra foreground
bg %1                     # Đưa job #1 ra background
nohup ./script.sh &       # Chạy tiếp khi terminal đóng

# 9. Xem đường dẫn process
ls -la /proc/PID/fd/     # Xem file descriptors của process
cat /proc/PID/cmdline     # Command line
cat /proc/PID/environ     # Environment variables
cat /proc/PID/maps        # Memory mappings

# 10. System resource limits
ulimit -a                 # Xem tất cả limits
ulimit -n                 # Xem max open files
ulimit -n 65536          # Tăng max open files (tạm thời)
```

---

## Phần 3: Networking Fundamentals (75 phút)

### 3.1. Mô hình OSI vs TCP/IP - Bản đồ của networking

OSI (Open Systems Interconnection) là mô hình tham chiếu 7 tầng. TCP/IP là implementation thực tế 4 tầng.

**So sánh chi tiết:**

```
┌───────────────────────────────────────────────────────────────────────┐
│                         MÔ HÌNH OSI (7 TẦNG)                          │
├───────────┬─────────────────────────────────────────────────────────┤
│   Tầng    │  Chức năng                          │  Ví dụ            │
├───────────┼─────────────────────────────────────────────────────────┤
│ 7. App    │  Giao diện người dùng              │  HTTP, FTP, SMTP  │
│ 6. Presen │  Mã hóa/giải mã, nén, format       │  SSL/TLS, JSON    │
│ 5. Session │  Quản lý phiên, auth, sync         │  NetBIOS, RPC     │
│ 4. Trans  │  Truyền dữ liệu tin cậy             │  TCP, UDP         │
│ 3. Network │  Định tuyến, logical addressing     │  IP, ICMP, BGP   │
│ 2. Data   │  Frame, MAC address, switch          │  Ethernet, WiFi   │
│ 1. Physi  │  Bits trên medium vật lý           │  Cáp, tín hiệu   │
├───────────┴─────────────────────────────────────────────────────────┤
│                       TCP/IP (4 TẦNG)                                │
├───────────┬─────────────────────────────────────────────────────────┤
│ 4. App    │  HTTP, DNS, SSH, SMTP, FTP, SNMP                      │
│ 3. Trans  │  TCP (tin cậy), UDP (nhanh)                            │
│ 2. Internet│  IP (IPv4/IPv6), ICMP, ARP, BGP                       │
│ 1. Link    │  Ethernet, WiFi, PPP, Switch                          │
└───────────┴─────────────────────────────────────────────────────────┘

ĐỪNG HỌC THUỘC - HÃY HIỂU:
Khi bạn gõ "example.com" vào trình duyệt:
1. App:    HTTP request được tạo
2. Trans:  TCP segment封装 HTTP, đánh số thứ tự
3. Net:    IP packet封装 TCP segment, thêm IP nguồn/đích
4. Link:   Ethernet frame封装 IP packet, thêm MAC address
5. Physical: Chuyển thành tín hiệu điện/quang/radio
```

### 3.2. TCP vs UDP - Hai personality khác nhau

**TCP: "The Reliable Friend"**
- Luôn đảm bảo data đến đúng, đủ, đúng thứ tự
- Nếu packet mất, gửi lại
- Giống như gửi thư bảo đảm có xác nhận

**UDP: "The Fast & Furious"**
- Gửi rồi quên, không quan tâm có đến không
- Tốc độ cao, overhead thấp
- Giống như gửi postcard, có thể mất, không thể gửi lại

**TCP 3-way Handshake (chi tiết):**

```
Client                                                              Server
  │                                                                    │
  │  1. SYN ──────────────────────────────────────────────────────────▶│
  │       Seq=x                                                            │
  │       Flags: SYN=1, ACK=0                                           │
  │                                                                    │
  │  TCP Client State: SYN_SENT                                         │
  │                                                                    │
  │  2. ◀── SYN-ACK ─────────────────────────────────────────────────│
  │       Seq=y, Ack=x+1                                                │
  │       Flags: SYN=1, ACK=1                                          │
  │                                                                    │
  │  TCP Server State: SYN_RECEIVED                                     │
  │                                                                    │
  │  3. ACK ──────────────────────────────────────────────────────────▶│
  │       Seq=x+1, Ack=y+1                                             │
  │       Flags: SYN=0, ACK=1                                          │
  │                                                                    │
  │  TCP Client State: ESTABLISHED                                     │
  │                                                                    │
  │  4. (Data transfer begins)                                         │
  │       ◀─── HTTP Request ───▶                                        │
  │                                                                    │
  │  TCP Server State: ESTABLISHED                                     │
  │                                                                    │
  │  ────────────── Connection Lifetime ──────────────                     │
  │                                                                    │
  │  5. FIN ─────────────────────────────────────────────────────────▶│
  │       Seq=x+100, Ack=y+50                                          │
  │                                                                    │
  │  6. ◀── ACK ─────────────────────────────────────────────────────│
  │       Seq=y+50, Ack=x+101                                          │
  │                                                                    │
  │  7. ◀── FIN ─────────────────────────────────────────────────────│
  │       Seq=y+50, Ack=x+101                                          │
  │                                                                    │
  │  8. ACK ─────────────────────────────────────────────────────────▶│
  │       Seq=x+101, Ack=y+51                                          │
  │                                                                    │
  │  CLOSED ──────────────────────────── CLOSED                        │
```

**UDP Header (8 bytes - tối thiểu):**

```
┌────────────────┬────────────────┬────────────────┬────────────────┐
│  Source Port   │  Dest Port     │  Length        │  Checksum      │
│     16 bits     │   16 bits      │   16 bits      │   16 bits      │
└────────────────┴────────────────┴────────────────┴────────────────┘

TCP Header (20-60 bytes):
┌────────────────┬────────────────┬────────────────┬────────────────┐
│  Source Port   │  Dest Port     │                              │
│     16 bits     │   16 bits      │                              │
├────────────────┴────────────────┴────────────────┴────────────────┤
│                       Sequence Number                             │
│                          32 bits                                   │
├────────────────┬────────────────┬────────────────┬────────────────┤
│                  Acknowledgment Number                           │
│                          32 bits                                   │
├────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┤
│ Offset │ Resv  │ Flags  │        │        │        │        │        │
│  4bit  │ 6bit  │ 6bit   │   Window Size    │  Checksum │  Urgent │
│        │       │        │    16 bits      │  16bits  │ 16bits  │
├────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┤
│                      Options (0-40 bytes)                        │
└─────────────────────────────────────────────────────────────────────┘
```

**So sánh sâu hơn:**

| Khía cạnh | TCP | UDP |
|-----------|-----|-----|
| **Reliability** | Đảm bảo đến đúng | Không đảm bảo |
| **Ordering** | Đúng thứ tự (reassemble) | Không đảm bảo thứ tự |
| **Speed** | Overhead cao vì ack, retransmit | Rất nhanh |
| **Header** | 20-60 bytes | 8 bytes (nhẹ hơn 60%) |
| **Connection** | Connection-oriented (handshake) | Connectionless |
| **Flow Control** | Sliding window, congệtion control | Không có |
| **Use Cases** | HTTP, SSH, Email, File Transfer, Database | DNS, VoIP, Video, Gaming, DHCP |

### 3.3. IP, Port, DNS - Địa chỉ trên internet

**IP Address:**

```
IPv4: 4 bytes = 32 bits = 4.29 tỷ địa chỉ (đã hết!)
Ví dụ: 192.168.1.100
        │    │    │    │
        └───┴────┴────┘
             32 bits
        11000000.10101000.00000001.01100100

IPv6: 16 bytes = 128 bits = 340 undecillion (3.4×10^38)
Ví dụ: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
        (viết gọn: 2001:db8:85a3::8a2e:370:7334)

Loại IPv4:
├── Public: visible từ internet (1.1.1.1, 8.8.8.8)
├── Private: chỉ trong mạng local
│   ├── 10.0.0.0/8      (10.0.0.0 - 10.255.255.255)
│   ├── 172.16.0.0/12  (172.16.0.0 - 172.31.255.255)
│   └── 192.168.0.0/16 (192.168.0.0 - 192.168.255.255)
└── Loopback: 127.0.0.1 (localhost), ::1 (IPv6)
```

**Port - Số phòng:**

```
Port 16 bits (0-65535)

┌─────────────────────────────────────────────────────────────────┐
│  Well-known Ports (0-1023)     → Chỉ root mới bind được       │
│  ├── 22    SSH                                                │
│  ├── 25    SMTP (email sending)                               │
│  ├── 53    DNS                                                │
│  ├── 80    HTTP                                              │
│  ├── 443   HTTPS                                             │
│  └── 3306  MySQL                                             │
├─────────────────────────────────────────────────────────────────┤
│  Registered Ports (1024-49151) → Có thể register với IANA   │
│  ├── 3000    Node.js dev server                               │
│  ├── 3306    MySQL/MariaDB                                   │
│  ├── 5432    PostgreSQL                                      │
│  ├── 6379    Redis                                            │
│  ├── 8000    Django dev server                               │
│  ├── 8080    HTTP alt / Tomcat                               │
│  └── 27017   MongoDB                                          │
├─────────────────────────────────────────────────────────────────┤
│  Dynamic/Private Ports (49152-65535) → Client side only       │
│  → OS tự động chọn khi connect()                             │
└─────────────────────────────────────────────────────────────────┘

Ví dụ thực tế:
┌──────────────────┬─────────┬────────────────────────────────┐
│ Máy tính         │ Port    │ Ứng dụng                       │
├──────────────────┼─────────┼────────────────────────────────┤
│ Server A         │ 80, 443 │ Web server (nginx)             │
│ Server A         │ 22      │ SSH                            │
│ Server B         │ 5432    │ PostgreSQL                      │
│ Server B         │ 6379    │ Redis cache                     │
│ Your Laptop      │ 52341   │ Browser → kết nối đến server A │
│ Your Laptop      │ 51223   │ SSH → kết nối đến server B     │
└──────────────────┴─────────┴────────────────────────────────┘
```

**DNS (Domain Name System) - "Danh bạ của internet":**

DNS hoạt động như một hệ thống phân cấp distributed database:

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        DNS Resolution Flow                                 │
└────────────────────────────────────────────────────────────────────────────┘

1. Client (Browser) → /etc/resolv.conf nameserver (thường là 8.8.8.8)
   │
   │ "example.com"
   ▼
2. Recursive Resolver (DNS Server của ISP/Google 8.8.8.8)
   │
   │ Step 1: Hỏi Root Nameserver
   │ Tìm: "ai ai quản lý .com?"
   │ Root Nameserver trả lời: "Hỏi .com TLD Nameserver này"
   │
   ▼
3. .com TLD Nameserver
   │
   │ Step 2: Hỏi .com TLD
   │ Tìm: "ai quản lý example.com?"
   │ TLD Nameserver trả lời: "Hỏi authoritative nameserver này"
   │
   ▼
4. Authoritative Nameserver (của example.com)
   │
   │ Step 3: Hỏi Authoritative NS
   │ Tìm: "IP của example.com là gì?"
   │ Authoritative NS trả lời: "93.184.216.34"
   │
   ▼
5. Recursive Resolver → Client: "93.184.216.34"
   │
   │ Cache kết quả (TTL thường 300s-86400s)
   ▼
6. Client → TCP connect(93.184.216.34:443)
```

**Các loại DNS Record:**

| Record | Mô tả | Ví dụ |
|--------|--------|--------|
| A | IPv4 address | `example.com → 93.184.216.34` |
| AAAA | IPv6 address | `example.com → 2606:2800:220:1::` |
| CNAME | Canonical name (alias) | `www.example.com → example.com` |
| MX | Mail exchange | `example.com → mail.example.com` |
| TXT | Text data (SPF, DKIM, verification) | `v=spf1 include:_spf...` |
| NS | Nameserver | `example.com → ns1.example.com` |
| SOA | Start of Authority | Thông tin primary NS |
| PTR | Reverse DNS (IP → hostname) | `1.2.3.4.in-addr.arpa → hostname` |

### 3.4. Demo: Trace một HTTP Request - Từ A đến Z

Đây là phần **quan trọng nhất** của networking - hiểu cách một request thực sự đi qua network:

```bash
# 1. DNS Resolution - Tên miền thành IP
# Kiểm tra DNS cache local
systemd-resolve --flush-caches     # Xóa cache
nslookup example.com               # DNS lookup (cũ)
dig example.com                    # DNS lookup chi tiết
dig +short example.com             # Chỉ lấy IP
dig example.com AAAA              # IPv6 lookup
dig -x 93.184.216.34              # Reverse lookup (IP → hostname)

# Output mẫu dig:
# ; <<>> DiG 9.18.18 <<>> example.com A
# ;; ANSWER SECTION:
# example.com.          86400   IN      A       93.184.216.34

# 2. Kiểm tra kết nối - Ping
ping -c 4 example.com            # Ping 4 lần
ping -c 4 93.184.216.34         # Ping IP trực tiếp
ping -i 0.5 example.com         # Ping mỗi 0.5 giây
ping -s 1000 example.com        # Ping với packet 1000 bytes

# 3. Trace đường đi của packet
traceroute example.com           # Linux (dùng UDP hoặc ICMP)
traceroute -I example.com       # Dùng ICMP thay vì UDP
traceroute -T example.com      # Dùng TCP SYN
traceroute -n example.com       # Không resolve hostname

# mtr - kết hợp ping + traceroute
mtr example.com                  # Realtime
mtr -r -c 10 example.com        # Báo cáo 10 rounds rồi dừng

# Output mẫu traceroute:
#  1. 192.168.1.1        1.2ms   1.1ms   1.0ms   (gateway)
#  2. 10.0.0.1           5.3ms   5.2ms   5.1ms   (ISP)
#  3. 72.14.215.85       10.2ms  10.1ms  10.0ms  (backbone)
#  4. 93.184.216.34      11.5ms  11.4ms  11.3ms  (destination)

# 4. Xem chi tiết HTTP Request/Response
curl -v https://example.com      # Verbose - xem headers
curl -i https://example.com     # Include response headers
curl -I https://example.com     # Chỉ headers (HEAD request)

# Output mẫu curl -v:
# * Host example.com:443 was resolved.
# * IPv6: (none)
# * IPv4: 93.184.216.34
# * Connected to example.com (93.184.216.34) port 443 (#0)
# * TLS handshake
# * Certificate verification success
# > GET / HTTP/2
# > Host: example.com
# > User-Agent: curl/8.4.0
# > Accept: */*
# >
# < HTTP/2 200
# < content-type: text/html; charset=UTF-8
# < etag: "3147526947"
# < cache-control: max-age=604800
# < last-modified: Thu, 17 Oct 2019 07:18:26 GMT
# <
# <html>...
# * Connection #0 to host example.com left intact

# 5. Capture packets với tcpdump
sudo tcpdump -i any host example.com -c 10   # Capture 10 packets
sudo tcpdump -i eth0 port 80 -c 5            # Capture port 80
sudo tcpdump -i any -n tcp -c 10           # Chỉ TCP packets

# Save để xem bằng Wireshark
sudo tcpdump -i any -w capture.pcap host example.com
# Đọc file đã capture
tcpdump -r capture.pcap

# 6. Xem socket connections đang active
ss -tulpn                           # TCP/UDP listening ports
ss -tunp | grep ESTAB              # Connections đang established
netstat -tulpn                     # Tương tự (cũ hơn)
lsof -i :3000                      # Process đang dùng port 3000

# 7. HTTP Headers chi tiết
curl -H "Accept: application/json" \
     -H "Authorization: Bearer TOKEN" \
     -H "X-Custom-Header: value" \
     https://api.example.com/users

# POST request
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"name":"Khang","email":"khang@example.com"}' \
     https://api.example.com/users

# 8. Kiểm tra SSL/TLS certificate
openssl s_client -connect example.com:443 -showcerts
echo | openssl s_client -connect example.com:443 2>/dev/null | \
    openssl x509 -noout -dates -issuer -subject

# Check certificate expiry
curl -v https://expired.example.com 2>&1 | grep -i "ssl\|certificate\|expired"
```

### 3.5. Socket - Endpoint cho Network Communication

Socket là abstraction cho network communication. Nó giống như "plug" - plugin vào để kết nối.

**Server Socket Lifecycle:**

```c
// Pseudo-code cho TCP server
socket(AF_INET, SOCK_STREAM, 0)     // Tạo socket
    │
    ▼
bind(socket_fd, port=8080)          // Gắn vào port 8080
    │
    ▼
listen(socket_fd, backlog=128)     // Lắng nghe connections
    │
    ▼
accept(socket_fd)                  // Chấp nhận connection mới
    │                                // Trả về NEW socket cho connection này
    ▼
read/write                          // Giao tiếp với client
    │
    ▼
close(new_socket_fd)              // Đóng connection
close(socket_fd)                   // Server tiếp tục lắng nghe
```

**Client Socket Lifecycle:**

```c
socket(AF_INET, SOCK_STREAM, 0)     // Tạo socket
    │
    ▼
connect(socket_fd, server_ip, port)  // Kết nối đến server
    │                                  // (TCP: 3-way handshake xảy ra ở đây)
    ▼
read/write                           // Giao tiếp với server
    │
    ▼
close(socket_fd)                   // Đóng socket
```

---

## Tóm tắt Buổi 1

### Những điểm cần nhớ (vĩnh viễn)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MENTAL MODEL - BUỔI 1                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. USER SPACE ←→ KERNEL SPACE                                    │
│     Syscall = cầu nối duy nhất                                     │
│     strace = công cụ nhìn thấy syscall                              │
│                                                                      │
│  2. LINUX = CHUẨN NGÀNH                                            │
│     96% server, 100% container, Cloud = Linux                       │
│     /bin, /etc, /var/log, /home, /proc                            │
│                                                                      │
│  3. PROCESS = instance chương trình                                │
│     Thread = đơn vị nhỏ hơn, chia sẻ memory                       │
│     PID = định danh duy nhất                                        │
│                                                                      │
│  4. TCP = TIN CẬY, UDP = NHANH                                    │
│     TCP: 3-way handshake, ack, retransmit, ordered                   │
│     UDP: gửi rồi quên, không guarantee                             │
│                                                                      │
│  5. IP + PORT = TÌM ĐÚNG MÁY + ĐÚNG ỨNG DỤNG                      │
│     DNS: tên miền → IP                                             │
│     Port: 80(HTTP), 443(HTTPS), 22(SSH)...                        │
│                                                                      │
│  6. EVEYRYTHING IS A FILE                                          │
│     Thiết bị, process, socket = file descriptor                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Câu hỏi ôn tập (để nhớ sâu)

1. Khi bạn gõ `./my_program` vào terminal, liệt kê tất cả syscalls được gọi (dùng strace để kiểm tra)

2. Sự khác nhau giữa `fork()` và `execve()`? Tại sao shell dùng cả hai?

3. Tại sao server web cần bind vào port 80/443, không phải port ngẫu nhiên?

4. TCP handshake 3 bước: tại sao không gửi data ngay ở bước 1?

5. Trình bày flow đầy đủ khi browser truy cập "https://google.com" (từ DNS đến HTTP response)

6. Làm thế nào để 2 processes giao tiếp với nhau trên cùng máy? Trên 2 máy khác nhau?

### Bài tập thực hành

1. Chạy `strace -c -f bash -c 'ls -la /tmp'` và phân tích mỗi syscall
2. Trace request đến một API bạn hay dùng, phân tích headers
3. Tìm hiểu: `cat /proc/1/cmdline` để xem init/systemd command
4. Tạo script backup files sử dụng pipes và redirects

---

## Tài liệu tham khảo

- `cheatsheets/linux-commands.md` - Command reference đầy đủ
- `cheatsheets/networking-commands.md` - Networking commands
- `demos/syscall-demo/` - Source code để trace
- man pages: `man 2 read`, `man 2 socket`, `man tcpdump`
