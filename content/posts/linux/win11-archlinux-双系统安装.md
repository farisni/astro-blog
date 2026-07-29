---
title: "MacMini2014 多系统安装"
description: "使用 Rufus 制作 U 盘启动盘。"
publishDate: "2026-03-15"
tags:
  - "mac"
  - "linux"
  - "windows"
  - "多系统"
  - "archlinux"
draft: false
pinned: false
---

<!-- 由 scripts/sync-obsidian.mjs 自动生成，请勿直接编辑。 -->

> [!info] 系统环境
> - 设备：MacMini 2014
> - 安装系统：Windows 11 + Arch Linux

---

# 🧭 目录

1. [🪟 安装 Windows 11](#安装-windows-11)
2. [🐧 安装 Arch Linux](#安装-arch-linux)
3. [⚙️ 首次启动配置](#首次启动配置)
   - [安装 Yay (AUR 助手)](#安装-yay-aur-助手)
4. [📦 常用软件安装](#常用软件安装)
5. [🔧 常见问题修复](#常见问题修复)

---

# 🪟 安装 Windows 11

## 制作启动盘

使用 **Rufus** 制作 U 盘启动盘。

## 启动安装

1. 开机按住 `Alt` 键
2. 选择 **EFI boot**
3. 进入安装界面后按 `Shift + F10` 打开命令提示符

## 磁盘分区

在命令提示符中输入：

```bash
diskpart
select disk 0
clean
convert gpt
```

> [!warning] 注意事项
> Windows 默认只创建 100M EFI 分区，建议手动创建 500M 以方便多系统引导。

继续执行以下命令：

```bash
# 创建 500MB EFI 分区
create partition efi size=500
format quick fs=fat32 label=System

# 创建 16MB MSR 分区（Windows 必需）
create partition msr size=16

# 退出 diskpart
exit
exit
```

## 继续安装

1. 回到安装界面的分区选择页，点击 **刷新** (Refresh)
2. 确认看到以下分区：
   - 分区 1: 500MB (系统/EFI)
   - 分区 2: 16MB (MSR)
   - 未分配的空间 (剩余的全部容量)
3. 选中 **未分配的空间**，点击 **新建**
4. 输入想分给 Windows 的大小（如 `102400 MB` = 100GB），点应用
5. 选中这个新创建的 NTFS 分区，点击 **下一步** 开始安装

---

# 🐧 安装 Arch Linux

## 联网 (Live 环境)

> [!tip] 网络连接方式
> - 共享网络：两台电脑用网线相连，或连接手机热点
> - 假设 Arch Linux 的 IP 是 `192.168.2.2`，共享网络的电脑就是 `192.168.2.1`
> - wifi连接：**iwctl**

```bash
iwctl
device list  # 查看网卡
station wlan0 scan
station wlan0 connect Your_WiFi_Name
```

测试网络：

```bash
ping baidu.com
```

## 查看磁盘分区

```bash
lsblk
```

## 创建 Arch 分区

```bash
cfdisk /dev/sda
```

操作步骤：

1. 用方向键移动到最下方的 **Free Space**
2. 选择 **New**，输入大小（如 `100G` 或直接回车填满剩余空间）
3. 选中这个新分区，选择 **Type**，确保是 `Linux filesystem`
4. 选择 **Write**，输入 `yes`
5. 选择 **Quit** 退出

## 挂载分区

```bash
# 格式化并挂载主分区（假设是 /dev/sda4）
mkfs.ext4 /dev/sda4
mount /dev/sda4 /mnt

# 挂载 EFI 分区（与 Win11 共享，假设是 /dev/sda1）
mount --mkdir /dev/sda1 /mnt/boot
```

> [!note] EFI 分区
> Arch Linux 与 Windows 11 共享同一个 EFI 分区，不会互相影响。

## 配置镜像源

```bash
# 配置中国区镜像源
reflector --country China --protocol https --sort rate --save /etc/pacman.d/mirrorlist

# 查看镜像列表
cat /etc/pacman.d/mirrorlist

# 如果有 alibaba 就删掉，因为很多软件找不到，不如院校的镜像

# 备份原镜像列表
sudo cp /etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist.bak
```

**手动配置镜像源（备用）**

```bash
sudo bash -c 'cat > /etc/pacman.d/mirrorlist << "EOF"
# 上海交通大学 (SJTU) - 推荐首选
Server = https://mirror.sjtu.edu.cn/archlinux/$repo/os/$arch

# 腾讯云 (Tencent) - 备用高速源
Server = https://mirrors.tencent.com/archlinux/$repo/os/$arch

# 中科大 (USTC) - 备用
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch

# 清华大学 (TUNA) - 如果上面都失败，尝试这个
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch
EOF'

# 更新软件包列表
sudo pacman -Syy
```

## ⬇️ 安装系统基础包

```bash
pacstrap -K /mnt base linux linux-firmware base-devel networkmanager ntfs-3g grub efibootmgr os-prober vim nano git
```

> [!info] 安装包说明
> - `ntfs-3g`: 读写 Windows NTFS 分区
> - `os-prober`: 检测其他操作系统，用于双系统引导
> - `grub efibootmgr`: EFI 引导加载程序
> - `vim nano`: 文本编辑器

## 生成配置与系统设置

pacstrap 安装完后，接着设置：

```bash
# 生成 fstab
genfstab -U /mnt >> /mnt/etc/fstab

# 进入 chroot 环境
arch-chroot /mnt

# 设置时区
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
hwclock --systohc
```

## 本地化 (Locale)

让系统支持中文或特定的字符显示：

```bash
# 编辑 locale.gen 文件，取消注释需要的语言
sudo vim /etc/locale.gen
# 找到以下内容，删掉前面的 # 号：
# en_US.UTF-8 UTF-8
# zh_CN.UTF-8 UTF-8
# 保存退出：Ctrl+O, Enter, Ctrl+X

# 生成 locale
locale-gen

# 设置默认语言
echo "LANG=en_US.UTF-8" > /etc/locale.conf
```

## ⚠️  grub 引导设置（双系统的"命门"）

> [!warning] 关键步骤
> 这是你最关心的，确保能看到 Windows。

```bash
# 安装微码（针对 Intel CPU）
pacman -S intel-ucode

# 安装并配置 GRUB
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=ARCH

# 启用 os-prober 检测 Windows
vim /etc/default/grub

# 找到这一行，删掉前面的 # 号：
GRUB_DISABLE_OS_PROBER=false

# 生成 GRUB 配置（os-prober 会自动检测 Windows）
grub-mkconfig -o /boot/grub/grub.cfg
```

> [!tip]+ 确保 os-prober 检测到 Windows
> 如果 GRUB 启动菜单没有显示 Windows，需要手动编辑 `/etc/default/grub`，添加：
> ```
> GRUB_DISABLE_OS_PROBER=false
> ```
> 然后重新运行 `grub-mkconfig -o /boot/grub/grub.cfg`

## 设置 root 密码并创建用户

```bash
# 设置 root 密码
passwd

# 创建普通用户 faris
useradd -m -G wheel faris
passwd faris

# 配置 sudo
EDITOR=nano visudo
# 找到 %wheel ALL=(ALL:ALL) ALL，删掉前面的 #
```

## 完成安装

```bash
# 退出 chroot
exit

# 卸载分区
umount -R /mnt

# 重启
reboot
```

> [!success] 安装成功
> 重启后按住 `Alt` 键，应该可以看到 **ArchLinux** 和 **Windows Boot Manager** 两个选项。

---

# ⚙️ Arch首次启动配置：SSH、更新pacman

## 登录后的基础配置

重启后用 `faris` 用户登录，进行以下配置：

```bash
# 启动并启用网络管理
systemctl enable --now NetworkManager

# 查看网络连接情况
nmcli device

# 连接Wi-Fi
nmtui

# 更新软件包列表
sudo pacman -Syy

# 查看 IP 地址
ip a
```

> [!tip] 网络共享说明
> 如果是共享网络，假设 Arch Linux 的 IP 是 `192.168.2.2`，那么共享网络的电脑就是 `192.168.2.1`

## 设置主机名

```bash
# 编辑 hosts 文件
sudo vim /etc/hosts

# 添加以下内容：
# 127.0.0.1  archmac.localdomain  archmac

# 设置主机名
sudo hostnamectl set-hostname archmac
```

## 配置 SSH 远程访问

```bash
# 安装 OpenSSH
sudo pacman -S openssh

# 启动并启用 SSH 服务
sudo systemctl enable --now sshd
```

从其他电脑连接：

```bash
ssh faris@192.168.2.2
```

# 🛠️ 安装 Yay (AUR 助手)：第三方软件安装工具

> [!tip] Yay 简介
> Yay 是 Arch Linux 的 AUR 包管理器，可以安装社区维护的aur软件包。

```bash
sudo pacman -S git
# 克隆仓库
git clone https://aur.archlinux.org/yay.git
cd yay

# 设置 Go 代理（国内加速）
export GOPROXY=https://goproxy.cn,direct

# 编译安装
makepkg -si

# 验证安装
yay --version
```

---

# 📶 WiFi 无线连接

### nmtui：图形化管理

```bash
# 打开网络管理 TUI 界面（推荐）
nmtui
```

在界面中选择：
1. **Edit a connection** → 选择你的 WiFi → 输入密码
2. 或 **Activate a connection** → 选择 WiFi 并激活

验证无线网卡：

```bash
# 查看无线网卡状态（网卡名可能是 wlp2s0）
ip addr show wlp2s0
```

### MacMini 2014 - Broadcom 无线网卡

```bash
# 安装 Broadcom 无线网卡驱动
sudo pacman -S --needed base-devel dkms linux-headers

# 移除冲突模块
sudo rmmod b43 b43legacy bcm43xx bcma brcm80211 brcmfmac brcmsmac ssb wl

# 加载 wl 模块（没有输出就是成功）
sudo modprobe wl

# 检查网卡
ip link show
```

### ThinkBook - RTL8852BE 无线网卡

```bash
# 查看网卡型号
lspci -nn | grep -i network
# 输出：05:00.0 Network controller [0280]: Realtek Semiconductor Co., Ltd. RTL8852BE PCIe 802.11ax Wireless Network Controller [10ec:b852]
```

# 📡 蓝牙

```bash
# 安装蓝牙相关包
sudo pacman -S bluez bluez-utils

# 启动并启用蓝牙服务
sudo systemctl enable --now bluetooth
```

> [!note] 蓝牙工具
> - `bluetoothctl`: 命令行蓝牙管理工具
> - `blueman`: 图形界面蓝牙管理器（可选）

```bash
# 使用 bluetoothctl 连接设备
bluetoothctl
# 进入交互界面后执行：
# power on
# agent on
# default-agent
# scan on
# pair XX:XX:XX:XX:XX:XX
# connect XX:XX:XX:XX:XX:XX
# trust XX:XX:XX:XX:XX:XX
```

> [!example] 蓝牙设备
> **蓝牙音箱**: SBC-XQ

---

# 🔧 常见问题修复：EFI 丢失

## 修复 EFI 引导丢失

如果 Arch Linux 启动项丢失，可以重新修复：

```bash
mount /dev/sda4 /mnt
mount /dev/sda1 /mnt/boot  # EFI 分区，之前安装已有

arch-chroot /mnt
```

继续配置引导：

```bash
# 安装微码（针对 Intel CPU）
pacman -S intel-ucode

# 安装并配置 GRUB
grub-install --target=x86_64-efi --efi-directory=/boot --bootloader-id=ARCH

# 启用 os-prober 检测 Windows
vim /etc/default/grub
# 找到这一行，删掉前面的 # 号：
# GRUB_DISABLE_OS_PROBER=false

# 生成 GRUB 配置（os-prober 会自动检测 Windows）
grub-mkconfig -o /boot/grub/grub.cfg
```
