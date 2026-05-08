# Cheat Sheet: Các lệnh Linux thường dùng

> Dành cho sinh viên CLB TCC Hoc Thuat - Software Engineering Fundamentals

## Navigation & File System

```bash
# Di chuyển trong filesystem
pwd                 # In ra thư mục hiện tại
cd /path            # Đi đến thư mục (tuyệt đối)
cd ~/Documents       # Đi đến thư mục (tương đối, ~ = home)
cd ..               # Lên thư mục cha
cd -                # Quay lại thư mục trước đó

# Liệt kê file
ls -la              # Liệt kê chi tiết (bao gồm hidden files)
ls -lh              # Liệt kê với kích thước human-readable
ls -lt              # Sắp xếp theo thời gian sửa đổi
ls -S               # Sắp xếp theo kích thước
tree                # Hiển thị cây thư mục

# Tạo / Xóa thư mục
mkdir -p dir/subdir # Tạo thư mục lồng nhau
rmdir dirname       # Xóa thư mục rỗng
rm -rf dirname      # Xóa thư mục và toàn bộ nội dung (CẨN THẬN!)

# Tạo / Xóa file
touch filename.txt  # Tạo file rỗng hoặc cập nhật timestamp
rm filename         # Xóa file
rm -i filename      # Xóa với confirmation

# Copy / Move
cp src dst           # Copy file
cp -r src/ dst/     # Copy thư mục (recursive)
mv src dst          # Di chuyển hoặc đổi tên
```

## Xem nội dung file

```bash
cat file             # In toàn bộ file ra terminal
head -n 20 file     # 20 dòng đầu
tail -n 20 file     # 20 dòng cuối
tail -f file        # Theo dõi file log (real-time)
less file           # Xem file có thể scroll lên xuống
grep "pattern" file # Tìm kiếm trong file
grep -r "pattern" /path  # Tìm kiếm đệ quy trong thư mục
grep -n "pattern" file    # Hiển thị số dòng
grep -i "pattern" file    # Tìm kiếm không phân biệt hoa thường
wc -l file          # Đếm số dòng trong file
```

## Permissions & Ownership

```bash
# Xem quyền
ls -l filename      # -rw-r--r-- : owner/group/others permissions
stat filename       # Thông tin chi tiết bao gồm permissions

# chmod - Thay đổi quyền
# Cú pháp: chmod [who][+/-][what] file
# who: u=owner, g=group, o=others, a=all
# what: r=read, w=write, x=execute
chmod u+x script.sh      # Thêm execute cho owner
chmod g-w file.txt       # Bỏ write của group
chmod a+rw file.txt      # Thêm read+write cho all
chmod 755 file           # rwxr-xr-x (numeric: 7=rwx,5=r-x)
chmod 644 file           # rw-r--r--
chmod 700 dir            # rwx------ (chỉ owner)
chmod +x script.sh       # Thêm execute cho all

# chown - Thay đổi chủ sở hữu
chown user:group file    # Thay đổi owner và group
chown user file          # Chỉ thay đổi owner
chown -R user:group dir/ # Đổi recursive cho thư mục
```

## Processes

```bash
# Xem processes
ps aux               # Tất cả processes (BSD style)
ps -ef              # Tất cả processes (System V style)
ps aux | grep node  # Tìm process liên quan đến node
pstree              # Hiển thị tree của processes
top                 # Monitor real-time (text mode)
htop                # Monitor tương tác (cần cài đặt)

# Kill process
kill PID            # Gửi SIGTERM (graceful shutdown)
kill -9 PID         # Gửi SIGKILL (buộc dừng ngay)
kill -15 PID        # Tương tự kill thường
pkill -f "name"     # Kill process theo tên

# Background / Foreground
./script.sh &       # Chạy script ở background
jobs                # Xem danh sách jobs
fg %1               # Đưa job #1 ra foreground
bg %1               # Đưa job #1 ra background
nohup ./script.sh & # Chạy tiếp cả khi đóng terminal

# Process info
lsof -i :3000       # Xem process đang dùng port 3000
cat /proc/PID/status # Thông tin chi tiết process
```

## System Info

```bash
# Thông tin hệ thống
uname -a            # Kernel version, hostname, architecture
hostname            # Tên máy
uptime              # Thời gian hoạt động
whoami              # User hiện tại
id                  # UID, GID, groups của user

# CPU / Memory / Disk
free -h             # RAM usage (human-readable)
df -h               # Disk usage
du -sh /path        # Kích thước thư mục
du -h --max-depth=1 # Kích thước subdirectories

# User Management
useradd username    # Tạo user mới
passwd username     # Đổi password
usermod -aG group user  # Thêm user vào group
groups username     # Xem groups của user
sudo command        # Chạy với quyền root
su - username       # Chuyển sang user khác
```

## Networking

```bash
# Kiểm tra kết nối
ping -c 4 host      # Ping 4 lần
traceroute host    # Xem đường đi packet
mtr host            # Ping + Traceroute real-time

# Port scanning
netstat -tulpn      # Tất cả ports đang listening
ss -tulpn           # Tương tự netstat (mới hơn)
netstat -i          # Network interfaces

# HTTP / Web
curl url            # GET request đơn giản
curl -v url         # Verbose mode (xem headers)
curl -X POST -d "data" url  # POST request
curl -H "Header: value" url  # Custom header
curl -I url         # Chỉ lấy headers
curl -o output.html url  # Download file
wget url            # Download file
wget -r url         # Download recursive

# SSH
ssh user@host       # Kết nối SSH
ssh -p 2222 user@host  # SSH port khác 22
ssh -i key.pem user@host  # SSH với private key
scp file user@host:/path  # Copy file qua SSH
rsync -avz src/ user@host:/path  # Sync thư mục
```

## Text Editing

```bash
# Nano (beginner-friendly)
nano filename        # Mở file trong nano
# Ctrl+O để save, Ctrl+X để thoát

# Vim / Vi (powerful, steep learning curve)
vim filename         # Mở file trong vim
# Mode: Normal (Esc), Insert (i), Command (:)
# :w = save, :q = quit, :wq = save + quit
# :q! = quit without saving, dd = xóa dòng
```

## Archives & Compression

```bash
# Tar
tar -cvf archive.tar dir/    # Tạo archive
tar -xvf archive.tar         # Giải nén archive
tar -cvzf archive.tar.gz dir/ # Tạo archive + gzip
tar -xvzf archive.tar.gz     # Giải nén .tar.gz
tar -tvf archive.tar         # Xem nội dung không giải nén

# Zip
zip -r archive.zip dir/      # Tạo zip
unzip archive.zip            # Giải nén
unzip -l archive.zip         # Xem nội dung
```

##管道 (Pipes) & Redirection

```bash
# Redirection
command > output.txt     # Ghi output vào file (overwrite)
command >> output.txt    # Ghi output vào file (append)
command < input.txt      # Đọc input từ file
command 2> error.txt     # Chỉ ghi stderr vào file
command &> all.txt       # Ghi cả stdout và stderr

# Pipes
cmd1 | cmd2              # Output của cmd1 là input của cmd2
cmd | grep "pattern"    # Lọc output
cmd | sort              # Sắp xếp output
cmd | uniq              # Loại bỏ dòng trùng lặp
cmd | wc -l             # Đếm dòng
cmd | head -n 20        # Lấy 20 dòng đầu
cmd | tail -n 20        # Lấy 20 dòng cuối
```

## Systemctl (Quản lý service)

```bash
# Systemd (các distro hiện đại)
systemctl status servicename    # Xem trạng thái service
systemctl start servicename     # Start service
systemctl stop servicename      # Stop service
systemctl restart servicename   # Restart service
systemctl enable servicename    # Enable (chạy khi boot)
systemctl disable servicename   # Disable
systemctl is-active servicename # Kiểm tra đang chạy không
systemctl list-units --type=service  # Liệt kê tất cả services
journalctl -u servicename       # Xem logs của service
```

## Environment Variables

```bash
# Xem environment variables
printenv              # Tất cả variables
printenv PATH        # Một variable cụ thể
echo $HOME           # In ra giá trị biến

# Set biến (chỉ có hiệu lực trong session hiện tại)
export VAR_NAME=value    # Set cho terminal hiện tại
VAR_NAME=value command   # Set tạm cho một command
~/.bashrc              # File cấu hình bash (thêm permanent)

# Các biến quan trọng
echo $PATH            # Các đường dẫn tìm command
echo $HOME            # Thư mục home
echo $USER            # User hiện tại
echo $SHELL           # Shell đang dùng
```

## Package Management

```bash
# Arch Linux (pacman)
sudo pacman -S package     # Cài đặt package
sudo pacman -R package     # Xóa package
sudo pacman -Syu           # Update toàn bộ hệ thống
pacman -Ss "keyword"       # Tìm kiếm package
pacman -Q                  # Liệt kê packages đã cài
pacman -Qdtq               # Liệt kê packages không cần thiết

# Debian/Ubuntu (apt)
sudo apt update            # Cập nhật package lists
sudo apt upgrade           # Upgrade packages
sudo apt install package   # Cài package
sudo apt remove package    # Xóa package

# Node.js
npm install               # Cài packages từ package.json
npm install -g package     # Cài global
npm run dev               # Chạy dev script
```

## Systemd Debugging

```bash
# strace - Theo dõi System Calls
strace -e trace=read,write,open,close ./program  # Theo dõi syscalls cụ thể
strace -c ./program            # Đếm số lần gọi mỗi syscall
strace -f ./program           # Theo dõi cả child processes
strace -p PID                 # Theo dõi process đang chạy
strace -o trace.log ./program # Ghi output ra file

# lsof - List open files
lsof                         # Tất cả files đang mở
lsof -p PID                  # Files của một process
lsof /path/to/file          # Process đang dùng file

# strace đọc syscall flow
# Khi ./program gọi printf("Hello"):
# write(1, "Hello\n", 6) = 6
# fd=1 = stdout, 6 = số bytes được ghi
```

## Mẹo Terminal

```bash
# Shortcuts
Ctrl+C          # Hủy command đang chạy
Ctrl+Z          # Tạm dừng, đưa vào background
Ctrl+L          # Clear terminal
Ctrl+U          # Xóa dòng hiện tại
Ctrl+A / Ctrl+E # Di chuyển cursor về đầu / cuối dòng
Ctrl+R          # Tìm kiếm trong command history
!!              # Chạy lại command trước đó
!n              # Chạy command thứ n trong history
Esc+.           # Lấy argument cuối của command trước

# Aliases (thêm vào ~/.bashrc)
alias ll='ls -la'
alias la='ls -A'
alias ..='cd ..'
alias gs='git status'
alias gl='git log --oneline'
```
