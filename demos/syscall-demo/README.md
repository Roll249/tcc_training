# Syscall Demo

## Giới thiệu

Demo này minh họa các system calls mà một chương trình C đơn giản thực sự gọi khi chạy.
`strace` (system call trace) cho phép ta nhìn thấy mọi syscall bên dưới.

## Các syscall được demo

| Syscall | Mô tả | Tương đương C thông thường |
|---------|--------|---------------------------|
| `write` | Ghi dữ liệu ra file/stdout | `printf`, `fprintf` |
| `open` | Mở file | `fopen` |
| `close` | Đóng file descriptor | `fclose` |
| `read` | Đọc dữ liệu | `scanf`, `fgets` |
| `getpid` | Lấy Process ID | - |
| `getppid` | Lấy Parent Process ID | - |
| `fork` | Tạo process mới | - |
| `brk/sbrk/mmap` | Cấp phát bộ nhớ | `malloc` |

## Hướng dẫn

### 1. Compile

```bash
gcc -o syscall_demo syscall_demo.c
```

### 2. Chạy bình thường

```bash
./syscall_demo
```

### 3. Theo dõi tất cả syscalls

```bash
# Xem mọi syscall
strace ./syscall_demo 2>&1 | head -50

# Lưu vào file để xem chi tiết
strace -o trace.log ./syscall_demo
cat trace.log
```

### 4. Chỉ theo dõi syscalls cụ thể

```bash
# Chỉ read, write, open, close
strace -e trace=read,write,open,close ./syscall_demo

# Chỉ process-related syscalls
strace -e trace=fork,clone,execve,wait4 ./syscall_demo
```

### 5. Đếm số lần gọi mỗi syscall

```bash
strace -c ./syscall_demo
```

Output mẫu:

```
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 31.25    0.000005           5         1           write
 31.25    0.000005           5         1           getpid
 25.00    0.000004           4         1           open
 12.50    0.000002           2         1           close
------ ----------- ----------- --------- --------- ----------------
100.00    0.000016                     4           total
```

### 6. Follow child processes

```bash
# Theo dõi cả process con được tạo bởi fork()
strace -f ./syscall_demo 2>&1 | grep -E "(fork|clone|execve|getpid)"
```

## Cách đọc output strace

```
open("demo_output.txt", O_WRONLY|O_CREAT|O_TRUNC, 0644) = 3
    │         │                              │         │      │
    │         │                              │         │      └── Return value (fd = 3)
    │         │                              │         └── Permission (rw-r--r--)
    │         │                              └── Flags: write, create, truncate
    │         └── Filename
    └── System call name
```

## Bài tập thực hành

1. Chạy `strace -c ./syscall_demo` và giải thích tại sao `write` chiếm nhiều thời gian nhất?
2. Thêm code để mở và đọc một file text, rồi dùng strace xem syscall `read` được gọi với các tham số nào.
3. Thử chạy `strace -p <PID>` trên một process đang chạy (ví dụ: browser, editor) để xem nó đang làm gì.
