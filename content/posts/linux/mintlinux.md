---
title: "MintLinux"
description: "Rufus 弹提示时务必选择 \"以 DD 镜像模式写入\"，确保 U 盘引导兼容 Mac。"
publishDate: "2026-07-29"
tags:
  - "linux"
  - "mint"
  - "keyboard"
  - "barrier"
  - "input"
draft: false
pinned: false
---

<!-- 由 scripts/sync-obsidian.mjs 自动生成，请勿直接编辑。 -->

## Rufus 设置参考

| 选项 | 设置 | 说明 |
|------|------|------|
| 引导类型 | `linuxmint-22.3-xfce-64bit.iso` | 镜像文件 |
| 分区类型 | GPT | Mac + Win11 必须用 GPT |
| 目标系统类型 | UEFI (非 CSM) | 现代机器都是 UEFI |
| 文件系统 | FAT32 | UEFI 启动必须用 FAT32 |

## 启动盘制作

Rufus 弹提示时务必选择 **"以 DD 镜像模式写入"**，确保 U 盘引导兼容 Mac。

## 手动分区方案

| 分区 | 大小 | 格式 | 挂载点 | 说明 |
|------|------|------|--------|------|
| EFI 分区 | 512MB | FAT32 | /boot/efi | 和 Win11 共用，已有则跳过 |
| 根分区 | 30GB | ext4 | / | 系统 + 软件 |
| swap | 4GB | swap | — | 8GB 内存下 4GB 足够 |
| /home | 剩余 ~45.5GB | ext4 | /home | 个人文件 + 虚拟机镜像 |

> [!info] 总容量约 80GB

操作顺序：空闲空间 → 创建 `/` → 创建 swap → 创建 `/home`。

## 主题

原始缩放 150%，Mint-Y-Aqua-150，再调 font DPI，字体需重新安装。

## 局域网 IP

| 设备 | IP |
|------|-----|
| MacBook | 192.168.100.1 |
| Win11 | 192.168.100.2 |
| Linux Mint | 192.168.100.3 |
| Mac mini | 192.168.100.4 |

---

# ⌨️ 键盘映射

> [!info] 场景
> 解决 Windows 键盘物理连接 Linux Mint，使用 Mac 的键盘习惯

## 默认按键行为

| 按键 | 默认功能 |
|------|----------|
| **Ctrl** | 复制/粘贴等标准功能 |
| **Win (Super)** | 打开开始菜单 |
| **Alt** | 菜单加速键 / Alt+Tab 切换窗口 |
| **Caps Lock** | 大小写锁定 |

## Win 键 → Ctrl

不用 Karabiner，直接用 `setxkbmap`：

```bash
setxkbmap -option ctrl:win_ctrl
```

效果：Win 键变成 Ctrl，Cmd+C/V 就能用了。

## 查看当前配置

```bash
setxkbmap -query
```

## 还原默认配置

```bash
setxkbmap -option
setxkbmap us
setxkbmap -model pc105 -layout us -variant '' -option ''
```

## 清理自动启动

```bash
ls ~/.config/autostart/ | grep -i keyboard
```

如果存在相关文件，删除：

```bash
rm -f ~/.config/autostart/keyboard-fix.desktop
rm -f ~/.config/autostart/setxkbmap.desktop
```

---

# 🖱️ 鼠标方向

反转滚轮方向（模拟 macOS 自然滚动）：

```bash
xinput set-button-map 4 1 2 3 5 4 7 6
```

---

# 🔗 Barrier（键鼠共享）

## 安装

```bash
apt install barrier
```

## 命令行启动（客户端）

```bash
/usr/bin/barrierc -f --name faris-Macmini --disable-crypto 192.168.100.1
```

## 系统服务（开机自启）

```ini
[Unit]
Description=Barrier Client Service (Pre-Login)
After=network-online.target
Wants=network-online.target

[Service]
User=root
Environment="DISPLAY=:0"
Environment="XAUTHORITY=/run/lightdm/root/:0"
ExecStart=/usr/bin/barrierc -f --name faris-Macmini --disable-crypto 192.168.100.1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Mac ↔ Linux 按键映射

通过 Barrier 转换后的对应关系：

| Mac 键 | Barrier 映射 | Linux 键 | 说明 |
|--------|-------------|----------|------|
| **Option** | → **Alt** | Alt | Option 当 Alt 用（最符合直觉） |
| **Command** | → **Super** | Win | Command 当 Win 键/开始菜单 |
