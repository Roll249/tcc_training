/*
 * Demo: System Calls với strace
 * =============================
 * File: syscall_demo.c
 *
 * Compile:
 *   gcc -o syscall_demo syscall_demo.c
 *
 * Chạy thường:
 *   ./syscall_demo
 *
 * Theo dõi system calls:
 *   strace -e trace=read,write,open,close ./syscall_demo
 *   strace -c ./syscall_demo          # Đếm số lần gọi mỗi syscall
 *   strace -o trace.log ./syscall_demo  # Ghi vào file
 */

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

int main(void)
{
    /* 1. WRITE syscall - in ra stdout */
    const char *msg = "=== Syscall Demo ===\n";
    write(STDOUT_FILENO, msg, 26);
    /* Tương đương với printf, nhưng gọi trực tiếp syscall write().
     * STDOUT_FILENO = 1
     */

    /* 2. OPEN syscall - mở file */
    int fd = open("demo_output.txt", O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd == -1) {
        perror("open");
        return EXIT_FAILURE;
    }

    /* 3. WRITE syscall - ghi vào file */
    const char *content = "Day la noi dung duoc ghi qua system call!\n";
    write(fd, content, 42);
    /* Tương đương với fprintf(fp, ...) */

    /* 4. CLOSE syscall - đóng file */
    close(fd);

    /* 5. GETPID syscall - lấy PID của process */
    pid_t pid = getpid();
    printf("Process ID: %d\n", pid);

    /* 6. READ syscall - đọc từ stdin */
    char buffer[256];
    printf("Nhap mot dong text: ");

    /* Đọc 1 dòng từ stdin (sử dụng read syscall) */
    int n = read(STDIN_FILENO, buffer, sizeof(buffer) - 1);
    if (n > 0) {
        buffer[n] = '\0';
        /* Remove trailing newline */
        if (buffer[n-1] == '\n') buffer[n-1] = '\0';
        printf("Ban da nhap: %s\n", buffer);
    }

    /* 7. Malloc (memory allocation) - internally gọi brk/sbrk/mmap syscall */
    printf("\nCap phat bo nho...\n");
    int *arr = (int *)malloc(1000 * sizeof(int));
    for (int i = 0; i < 1000; i++) {
        arr[i] = i * i;
    }
    printf("arr[500] = %d\n", arr[500]);
    free(arr);

    /* 8. GETPID syscall lần 2 - demo fork sẽ tạo process mới */
    printf("Fork syscall demo:\n");
    pid_t child_pid = fork();

    if (child_pid == -1) {
        perror("fork");
    } else if (child_pid == 0) {
        /* Child process */
        printf("  [Child] PID = %d, Parent PID = %d\n", getpid(), getppid());
        return EXIT_SUCCESS;
    } else {
        /* Parent process */
        printf("  [Parent] PID = %d, Child PID = %d\n", getpid(), child_pid);
    }

    printf("\n=== Demo hoan tat! ===\n");
    return EXIT_SUCCESS;
}
