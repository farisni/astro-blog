---
title: "ArchLinux扩展：Hyprland"
description: "在 /.config/hypr/hyprland.conf 中添加："
publishDate: "2026-03-15"
updatedDate: "2026-03-23"
tags:
  - "linux"
  - "arch"
  - "系统配置"
  - "wayland"
  - "桌面环境"
draft: false
pinned: false
---

<!-- 由 scripts/sync-obsidian.mjs 自动生成，请勿直接编辑。 -->

> [!abstract] 概述
> **Hyprland** 是一个动态平铺 Wayland 合成器，提供现代化的桌面体验。
> - 🎯 **适合**：喜欢键盘驱动、高效工作流的用户
> - ⚡ **特点**：流畅动画、实时配置、强大自定义

### 安装Hyprland核心组件

```shell
sudo pacman -S hyprland kitty waybar rofi hyprpaper xdg-desktop-portal-hyprland
```

| 组件                   | 类型  | 功能说明                                    |
| :------------------- | :-: | :-------------------------------------- |
| `hyprland`           | 🖥️ | **Wayland 合成器** — 核心桌面环境，窗口管理/平铺布局/动画效果 |
| `kitty`              | 💻  | **终端模拟器** — GPU 加速，支持 ligatures、分屏      |
| `waybar`             | 📊  | **状态栏** — 显示时间、电池、网络、工作区                |
| `rofi`               | 🚀  | **应用启动器** — 类似 Spotlight 的应用搜索          |
| `hyprpaper`          | 🖼️ | **壁纸管理** — 支持多显示器不同壁纸                   |
| `xdg-desktop-portal` | 🔐  | **桌面门户** — 截图/录屏/文件选择的标准化接口             |

> [!note] 为什么需要 xdg-desktop-portal？
> Wayland 出于安全考虑，应用不能随意访问屏幕内容。`xdg-desktop-portal` 提供安全中间层，让 Firefox、Chrome 等应用可以请求截图、共享屏幕。

### 字体

```shell
sudo pacman -S noto-fonts noto-fonts-cjk noto-fonts-emoji
```

### 常用工具

```shell
sudo pacman -S network-manager-applet grim slurp wl-clipboard polkit-kde-agent
```

| 工具                 | 功能        |
| :----------------- | :-------- |
| `nm-applet`        | 🌐 网络管理托盘 |
| `grim`             | 📷 全屏截图   |
| `slurp`            | 🎯 选择截图区域 |
| `wl-clipboard`     | 📋 剪贴板管理  |
| `polkit-kde-agent` | 🔑 权限认证弹窗 |

---

## 🔑 登录管理器

推荐使用 **SDDM**：

```shell
sudo pacman -S sddm
sudo systemctl enable sddm
sudo pacman -S qt6-wayland  # Wayland 支持
```

---

## 🚀 启动 Hyprland

| 方式 | 操作 |
| :--- | :--- |
| 图形登录 | 重启后在 SDDM 选择 `Hyprland` 会话 |
| 命令行 | 在 TTY 直接执行 `Hyprland` |

> [!tip] 首次启动
> 系统会自动生成默认配置文件 `~/.config/hypr/hyprland.conf`

---

## 🖥️ 窗口边框配置

```ini
# ~/.config/hypr/hyprland.conf
gaps_in = 3
gaps_out = 6
```

---

## 📊 Waybar 状态栏

### 安装配置

```shell
# 1. 创建目录
mkdir -p ~/.config/waybar

# 2. 复制默认配置文件
cp /etc/xdg/waybar/config.jsonc ~/.config/waybar/config.jsonc 2>/dev/null
cp /etc/xdg/waybar/style.css ~/.config/waybar/style.css 2>/dev/null

# 3. 检查是否成功
ls -l ~/.config/waybar/
```

### 依赖安装

```shell
# 音量控制
sudo pacman -S pavucontrol

# 音频服务
sudo pacman -S pipewire-pulse wireplumber
systemctl --user daemon-reload
systemctl --user enable --now pipewire-pulse wireplumber
systemctl --user restart pipewire
```

### 图标乱码修复

```shell
sudo pacman -S ttf-jetbrains-mono-nerd ttf-font-awesome
yay -S otf-font-awesome
fc-cache -fv
```

### 自动启动

在 `~/.config/hypr/hyprland.conf` 中添加：

```ini
exec-once = waybar
```

### 重启 Waybar

```shell
killall waybar
waybar &
```

### 工作区图标配置

```json
{
  "modules-left": [
    "hyprland/workspaces",
    "hyprland/mode",
    "hyprland/scratchpad",
    "custom/media"
  ],
  "hyprland/workspaces": {
    "format": "{icon}",
    "all-outputs": true,
    "format-icons": {
      "1": "",
      "2": "",
      "3": "",
      "4": "",
      "5": "",
      "6": "",
      "7": "",
      "8": "",
      "9": "",
      "10": "",
      "urgent": "",
      "focused": "",
      "default": ""
    },
    "on-scroll-up": "hyprctl dispatch workspace -1",
    "on-scroll-down": "hyprctl dispatch workspace +1"
  }
}
```

> [!link] 参考资源
> [Waybar GitHub](https://github.com/Alexays/Waybar) - 其他 Waybar 样式参考

---

## 🔊 声音配置

### 安装音频服务

```shell
# 基础音频服务
sudo pacman -S pipewire pipewire-pulse pipewire-alsa pipewire-jack wireplumber bluez bluez-utils pavucontrol

# 启用服务
systemctl --user enable --now pipewire.socket pipewire-pulse.socket wireplumber.service
sudo systemctl restart bluetooth
```

### 不同设备配置

| 设备            | 配置命令                                                                                 |
| :------------ | :----------------------------------------------------------------------------------- |
| ThinkBook 14+ | `sudo pacman -S pipewire pipewire-pulse pipewire-alsa wireplumber bluez bluez-utils` |
| ThinkBook 2   | 同上                                                                                   |

### Type-C 显示器音频输出

```shell
# 设置默认音频输出（Type-C 显示器）
pactl set-default-sink alsa_output.pci-0000_c6_00.1.HiFi__HDMI1__sink
```

> [!note] 待确认
> 上述 `pactl` 命令是否永久生效需要验证。

---

## 📦 显卡安装

x230 集成显卡

sudo nano /etc/pacman.conf

#[multilib] 2#Include = /etc/pacman.d/mirrorlist

sudo pacman -Syy 2sudo pacman -S mesa lib32-mesa

---

## ⌨️ 快捷键配置

### 默认快捷键

默认修饰键：**<kbd>SUPER</kbd>**（Win 键）

> [!tip] Mac 用户
> 如果使用 Mac 键盘连接，可以将修饰键改成 **ALT**，修改后执行 `hyprctl reload` 重载配置。

| 快捷键 | 功能 | 备注 |
| :--- | :--- | :--- |
| <kbd>SUPER</kbd> + <kbd>Q</kbd> | 关闭窗口 | Code + Q → Akko 键盘 |
| <kbd>SUPER</kbd> + <kbd>M</kbd> | 退出 Hyprland | |
| <kbd>SUPER</kbd> + <kbd>D</kbd> | 应用启动器 | |
| <kbd>SUPER</kbd> + <kbd>Enter</kbd> | 打开终端 | |
| <kbd>SUPER</kbd> + <kbd>1-9</kbd> | 切换工作区 | |

### 自定义快捷键

在 `~/.config/hypr/hyprland.conf` 中添加：

```ini
# 使用 Win + Enter 打开终端
bind = $mainMod, RETURN, exec, $terminal

# 关闭窗口
bind = $mainMod, Q, killactive

# 浮动窗口切换
bind = $mainMod, F, togglefloating

# 锁屏（需先安装 hyprlock）
bind = $mainMod, L, exec, hyprlock

# Alt + Space 打开应用启动器
bind = ALT, SPACE, exec, wofi --show drun --show-run
```

---

## 🧩 输入法配置

### 1. 更换国内镜像（可选）

```shell
# 备份原镜像
sudo cp /etc/pacman.d/mirrorlist /etc/pacman.d/mirrorlist.bak

# 使用国内镜像
sudo tee /etc/pacman.d/mirrorlist << 'EOF'
Server = https://mirrors.aliyun.com/archlinux/$repo/os/$arch
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch
EOF

# 更新镜像源
sudo pacman -Sy
```

### 2. 安装 Fcitx5

```shell
sudo pacman -S fcitx5 fcitx5-chinese-addons fcitx5-configtool fcitx5-gtk fcitx5-qt
```

### 3. 配置 Hyprland
设置环境变量

sudo nano /etc/environment

```
GTK_IM_MODULE=fcitx 
QT_IM_MODULE=fcitx 
XMODIFIERS=@im=fcitx 
SDL_IM_MODULE=fcitx
```

或者
在 `~/.config/hypr/hyprland.conf` 头部添加环境变量：

```ini
# 输入法环境变量
env = GTK_IM_MODULE,fcitx
env = QT_IM_MODULE,fcitx
env = XMODIFIERS,@im=fcitx
env = SDL_IM_MODULE,fcitx
env = GLFW_IM_MODULE,ibus

```

hyprconf

启动时自动运行 Fcitx5
exec-once = fcitx5 -d -r
### 4. 配置输入法

> [!warning] 重要提示
> `fcitx5-config-qt` 需要在 **物理机 Arch Linux** 上运行才能弹出配置界面，**不要在 SSH 中配置**。

**配置步骤：**

1. 运行配置工具：
   ```shell
   fcitx5-config-qt
   ```
2. 在界面中选择 **Pinyin 输入法** → 点击 **Apply**
3. 或者使用命令行配置工具：
   ```shell
   fcitx5-configtool
   ```
4. 重启电脑使配置生效

### 5. Caps Lock 切换输入法

使用 **keyd** 将 Caps Lock 映射为 F13：

```shell
# 安装 keyd
yay -S keyd

# 编辑配置
sudo nano /etc/keyd/default.conf

# 启用服务
sudo systemctl enable keyd
sudo systemctl start keyd

# 重载并监控
sudo keyd reload
sudo keyd monitor
```

**配置文件 (`/etc/keyd/default.conf`)：**

```ini
[ids]
*

[main]
capslock = f13
```

> [!note] 注意
> 1. 这里是小写的 `f13`
> 2. 然后在 Fcitx5 中设置 **F13** 为输入法切换快捷键
> 3. 设置切换输入法的 capslock 会变成 tool 是正常的

---

## 🐚 Zsh 配置

### 安装 Zsh

```shell
sudo pacman -S zsh
chsh -s $(which zsh)
```

> [!note] 生效步骤
> 执行 `chsh` 后需要 **注销并重新登录** 才会生效。

### Oh My Zsh

```shell
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

yay -S autojump

```

### 插件安装

```shell
# 1. 安装 autosuggestions
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

# 2. 安装 syntax-highlighting
git clone https://github.com/zsh-users/zsh-syntax-highlighting ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

### Powerlevel10k 主题

```shell
# 安装主题
yay -S zsh-theme-powerlevel10k

# 创建软链接
ln -s /usr/share/zsh-theme-powerlevel10k/powerlevel10k.zsh-theme ~/.oh-my-zsh/custom/themes/powerlevel10k.zsh-theme

# 安装字体
yay -S ttf-jetbrains-mono-nerd
```

### 配置 `.zshrc`

```bash
# 主题
ZSH_THEME="powerlevel10k"

# 插件
plugins=(git zsh-autosuggestions zsh-syntax-highlighting)

# Wayland 变量修复
if [ -z "$WAYLAND_DISPLAY" ] && [ -n "$XDG_RUNTIME_DIR" ]; then
    export WAYLAND_DISPLAY=$(ls "$XDG_RUNTIME_DIR" | grep wayland | head -n 1)
fi

# Autojump
[ -s /etc/profile.d/autojump.sh ] && source /etc/profile.d/autojump.sh
```

---

## 🪟 Kitty 终端配置

### 背景模糊效果

**1. 配置 Hyprland**

在 `~/.config/hypr/hyprland.conf` 末尾添加：

```ini
windowrulev3 = addtag, blur, oncreated:^kitty$
```

**2. 配置 Kitty**

	在 `~/.config/kitty/kitty.conf` 中添加：

```conf
background_opacity 0.75
blur_radius 20
blur_passes 3
hide_window_decorations yes
dynamic_background_opacity yes
```

---

### P10k 配置

```shell
# 运行配置向导
p10k configure
```

> [!tip] 配置建议
> Instant Prompt 选择 **Off**

应用配置：

```shell
source ~/.zshrc
```

---

## 🛠️ 终端工具

### Fastfetch

```shell
sudo pacman -S fastfetch
```

在 `~/.zshrc` 末尾添加：

```bash
fastfetch
```

### Btop 系统监控

```shell
sudo pacman -S btop
```

### Yazi 文件管理器

#### 安装

```shell
sudo pacman -S yazi ffmpegthumbnailer poppler jq chafa fontpreview ripgrep fd
```

| 依赖包 | 作用 |
| :--- | :--- |
| `ffmpegthumbnailer` | 视频缩略图 |
| `poppler` | PDF 预览 |
| `jq` | JSON 处理 |
| `chafa` | 图片渲染 |
| `fontpreview` | 字体预览 |
| `ripgrep` + `fd` | 搜索功能 |

#### 基本操作

Yazi 遵循 **Vim** 的操作逻辑：

| 按键 | 功能 |
| :--- | :--- |
| <kbd>h</kbd> / <kbd>j</kbd> / <kbd>k</kbd> / <kbd>l</kbd> | 导航 |
| <kbd>y</kbd> | 复制 |
| <kbd>p</kbd> | 粘贴 |
| <kbd>d</kbd> | 删除 |
| <kbd>Enter</kbd> | 打开/进入目录 |
| <kbd>q</kbd> | 退出 |

> [!tip] 提示
> Yazi 是现代终端文件管理器，支持预览、批量操作、Vim 键位。

---

## 🌐 网络与代理

### V2Ray 配置

```shell
sudo pacman -S v2ray
yay -S aur/v2raya
```

如果卡在阿里云
yay -S v2raya --rebuild --editmenu
把builde函数的export aliyun 删除

> [!info] V2RayA
> - 监听地址：`localhost:2017`
> - 支持：Tproxy 透明代理模式

### 代理共享

局域网内共享 Clash 代理：

```shell
export https_proxy=http://192.168.2.1:7897 http_proxy=http://192.168.2.1:7897 all_proxy=socks5://192.168.2.1:7897
```

验证代理 IP：

```shell
curl ip.sb
```

### Go 国内代理设置

```shell
export GOPROXY=https://goproxy.cn,direct
makepkg -si
```

### 静态 IP 配置

```shell
# 查看连接
nmcli connection show

# 设置静态 IP
sudo nmcli connection modify "Wired connection 1" \
  ipv4.method manual \
  ipv4.addresses 192.168.100.3/24 \
  ipv4.ignore-auto-dns yes \
  ipv4.never-default yes

# 启用
sudo nmcli connection up "Wired connection 1"
```

---

## 🔗 GitHub 配置

使用github cli 登陆github授权

### 1. 生成 SSH 密钥

```shell
ssh-keygen -t ed25519 -C "535704264@qq.com"
```

> [!note] 提示
> 一路回车即可，无需设置密码。

### 2. 添加密钥到 SSH Agent

```shell
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### 3. 复制公钥

```shell
cat ~/.ssh/id_ed25519.pub
```

👉 **GitHub 操作**：复制输出内容（以 `ssh-ed25519` 开头），在 GitHub 网页：
**Settings** → **SSH and GPG keys** → **New SSH key** → 粘贴保存

### 4. 测试连接

```shell
ssh -T git@github.com
```

看到 `Hi farisni! You've successfully authenticated` 即表示成功。

### 5. HTTPS 改 SSH

注意有时候push不行，关闭下代理试试即使你没动地方，**网络运营商 (ISP)** 可能在夜间进行了策略更新，或者你所在区域的出口网关临时开启了更严格的审查（深度包检测 DPI），识别出你是 SSH 流量并直接切断。

将现有仓库从 HTTPS 改为 SSH：

```shell
git remote set-url origin git@github.com:farisni/obsidian.git
```

---

## 📓 Obsidian

### 安装

```shell
yay -S obsidian
```

### 数据同步

```shell
mkdir -p ~/Note
cd ~/Note
git clone git@github.com:farisni/obsidian.git
```

### Claude Skills 安装

```shell
cd ~/Downloads
git clone git@github.com:kepano/obsidian-skills.git
cd obsidian-skills
cp -r skills ~/.claude
```

注意配置 claude cli 路径在插件
比如windows node安装的
```
C:\nvm4w\nodejs\node_modules\@anthropic-ai\claude-code\cli.js
```

> [!note] 插件配置
> 注意配置 **Claude Code** 插件的目录设置，安装 Claude 和 Claudian 的 skills。

---

## 🖼️ 壁纸设置

```shell
mkdir -p ~/.config/hypr
nano ~/.config/hypr/hyprpaper.conf
```

**配置文件 (`hyprpaper.conf`)：**

```ini
preload = ~/Pictures/wallpaper.jpg
wallpaper = ,~/Pictures/wallpaper.jpg
```

**启动服务：**

```shell
hyprpaper
```

---

## 🔧 其他配置

### Claude Code (NVM)

```shell
# 安装 NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

**配置环境变量：**

```bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

```

千问：apikey
[大模型服务平台百炼控制台](https://bailian.console.aliyun.com/cn-beijing?spm=a2c4g.11186623.0.0.4eb04c4duPO46m&tab=coding-plan#/efm/coding-plan-detail)

> [!link] 参考文档
> [阿里云 Claude Code 指南](https://help.aliyun.com/zh/model-studio/claude-code-coding-plan)

### 2K 显示器缩放

```shell
# 查看显示器信息
hyprctl monitors

# 编辑配置
vim ~/.config/hypr/hyprland.conf
```

**添加显示器配置：**

```ini
# 针对 24 寸 2K 屏幕的最佳缩放设置 (1.25 或 1.33 倍)
monitor=HDMI-A-2, 2560x1440@100, 0x0, 1.25
```

---

## 🔒 锁屏配置

### 安装 Hyprlock

```shell
sudo pacman -S hyprlock
```

### 配置快捷键

在 `~/.config/hypr/hyprland.conf` 中添加：

```ini
bind = SUPER, L, exec, hyprlock
```

### 创建配置文件

```shell
# 1. 确保目录存在
mkdir -p ~/.config/hypr

# 2. 创建配置文件
cat <<EOF > ~/.config/hypr/hyprlock.conf
background {
    path = screenshot
    blur_passes = 3
}
input-field {
    size = 200, 50
    position = 0, -20
    halign = center
    valign = center
}
EOF
```

---

## 📷 截图工具

### 安装依赖

```shell
sudo pacman -S grim slurp swappy wl-clipboard cliphist feh
```

| 工具 | 功能 |
| :--- | :--- |
| `grim` | 全屏截图 |
| `slurp` | 选择截图区域 |
| `swappy` | 截图编辑 |
| `wl-clipboard` | 剪贴板管理 |
| `cliphist` | 剪贴板历史 |
| `feh` | 图片查看 |

---

## 💾 U 盘挂载

### 自动挂载

```shell
# 安装自动挂载工具
sudo pacman -S udiskie
```

### 手动访问

```shell
# U 盘挂载点
/run/media/faris/

# 使用 Yazi 打开
yazi /run/media/faris/
```

---

## 🗂️ Yazi 配置优化

### 完整依赖安装

```shell
sudo pacman -S yazi ffmpegthumbnailer p7zip jq poppler fd ripgrep fzf zoxide imagemagick vim
```

### 设置默认编辑器

在 `~/.zshrc` 中添加：

```bash
export EDITOR="nvim"
```

## git 配置备份

```shell
# 1. 确保别名已生效 (如果当前终端没生效，重新源一下配置文件)
alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'

# 2. 添加远程仓库 (注意是用 config 命令，不是 git)
config remote add origin git@github.com:farisni/dotfiles.git

# 3. 添加文件 (现在它能找到 .zshrc 了，因为工作区被指定为 $HOME)
config add .zshrc .config/nvim .config/waybar .config/hypr

# 4. 提交
config commit -m "Initial backup of my dotfiles"

# 5. 推送
config push -u origin master
```

在任意位置 都可以用能够 conifg 其实等于 git 只不过它关联的是config

以后恢复包安装

```
sudo pacman -Syu --needed - < ~/.config/pkglist.txt
```
yay -S --needed - < ~/.config/aur_pkglist.txt
```

---

## 🐬 Dolphin 文件管理器

### 安装

```shell
sudo pacman -S --needed dolphin kio-extras kde-cli-tools polkit-kde-agent breeze-icons qt5ct qt6ct
```

### Qt 环境配置

在 `~/.config/hypr/hyprland.conf` 中添加：

```ini
# 强制 Qt 应用使用 Wayland 后端
env = QT_QPA_PLATFORM,wayland
# 强制使用 Breeze 风格
env = QT_STYLE_OVERRIDE,Breeze
# Qt 主题配置
env = QT_QPA_PLATFORMTHEME,qt5ct

# Polkit 认证代理
exec-once = /usr/lib/polkit-kde-authentication-agent-1
```

> [!tip] 启动 Dolphin
> 终端输入 `dolphin` 或通过 wofi 搜索 "Dolphin" 启动。

---

## 💾 U 盘自动挂载

```shell
sudo pacman -S udisks2 gvfs gvfs-mtp gvfs-nfs gvfs-smb polkit-kde-agent
sudo pacman -S udiskie python-pyqt6
```

在 `~/.config/hypr/hyprland.conf` 中添加：

```ini
# 后台挂载并显示在系统托盘
exec-once = udiskie -t
```

手动访问：

```shell
yazi /run/media/faris/
```

---

## 📋 剪贴板历史

```shell
sudo pacman -S wl-clipboard cliphist
```

在 `~/.config/hypr/hyprland.conf` 中添加：

```ini
# 自动记录文本历史
exec-once = wl-paste --type text --watch cliphist store

# 自动记录图片历史
exec-once = wl-paste --type image --watch cliphist store

# Win + V: 呼出剪贴板历史
bind = SUPER, V, exec, cliphist list | wofi --dmenu | cliphist decode | wl-copy
```

---

## 📷 截图工具

```shell
sudo pacman -S grim slurp swappy wl-clipboard jq
yay -S hyprshot
```

在 `~/.config/hypr/hyprland.conf` 中添加：

```ini
# 区域截图
bind = SUPER_SHIFT, S, exec, hyprshot -m region
```

---

## ⚙️ dotfiles 备份

```shell
# 配置别名
alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'

# 添加远程仓库
config remote add origin git@github.com:farisni/dotfiles.git

# 添加配置文件
config add .zshrc .config/nvim .config/waybar .config/hypr

# 提交推送
config commit -m "Update configs"
config push -u origin master
```

### 系统恢复

```shell
sudo pacman -Syu --needed - < ~/.config/pkglist.txt
yay -S --needed - < ~/.config/aur_pkglist.txt
```

---

## 💡 IntelliJ IDEA 缩放

编辑 `~/.config/JetBrains/IntelliJIdea2025.3/idea64.vmoptions`：

```properties
-Didea.ui.scale=2
```

---

## 🔧 GitHub CLI

```shell
sudo pacman -S github-cli
gh auth login
```

---

## 📦 国内镜像源

```shell
sudo tee /etc/pacman.d/mirrorlist > /dev/null << 'EOF'
# 清华大学 (Tuna)
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch

# 中科大 (USTC)
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch

# 上海交通大学 (SJTUG)
Server = https://mirrors.sjtug.sjtu.edu.cn/archlinux/$repo/os/$arch

# 腾讯云
Server = https://mirrors.cloud.tencent.com/archlinux/$repo/os/$arch
EOF
```

> [!tip] 更新镜像源
> 配置完成后执行 `sudo pacman -Sy` 更新系统包索引。

---

## ❓ 待解决问题

> [!warning] 待解决
> - Yazi 右键操作问题
> - 剪贴板图片粘贴问题

---

# 📦 常用软件安装

## 基础软件

> [!note] 安装提示
> Edge 需要先安装 [Yay](#安装-yay-aur-助手) 才能安装。

```bash
# 安装 Edge 浏览器 (AUR)
yay -S microsoft-edge-stable

# 安装 Firefox 浏览器
sudo pacman -S firefox
```

**安装进度：**

- [ ] Firefox 浏览器
- [ ] Neovim 编辑器
- [ ] 开发工具链

## 安装 Timeshift 系统备份（可选）

```bash
# 安装 Timeshift
sudo pacman -S timeshift

# 创建首个系统快照
sudo timeshift --create --comments "Initial system backup"

# 图形化操作
timeshift-gtk

# 查看所有备份
sudo timeshift --list
```

> [!tip] Timeshift
> Timeshift 是 Linux 系统快照工具，可以定期备份系统，方便出问题时恢复。建议在系统配置完成后立即创建首个快照。

## Neovim 配置

### 安装依赖

```bash
# 安装基础开发工具和依赖
sudo pacman -S neovim

# 安装 LazyVim 插件管理器
git clone https://github.com/LazyVim/starter ~/.config/nvim
```

> [!tip] 网络连接
> 下载插件前请确保网络连接正常，必要时可配置代理。

### 创建配置文件

```bash
mkdir -p ~/.config/nvim
nano ~/.config/nvim/init.lua
```

### Neovim 配置文件 (init.lua)

```lua fold
vim.g.maplocalleader = " "

-- 安装 lazy.nvim 的自动引导代码
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable",
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- 🚀 这里定义你的插件列表
require("lazy").setup({
  -- 1. 颜色主题
  "folke/tokyonight.nvim",

  -- 2. 文件树
  "nvim-tree/nvim-tree.lua",
  "nvim-tree/nvim-web-devicons", -- 文件图标

  -- 3. 语法高亮 (Treesitter)
  {
    "nvim-treesitter/nvim-treesitter",
    build = ":TSUpdate",
    config = function()
      require("nvim-treesitter").setup({
        ensure_installed = { "lua", "python", "bash" },
        highlight = { enable = true },
        indent = { enable = true },
      })
    end,
  },

  -- 4. 自动补全 (LSP + CMP)
  "neovim/nvim-lspconfig",
  "hrsh7th/cmp-nvim-lsp",
  "hrsh7th/cmp-buffer",
  "hrsh7th/cmp-path",
  "hrsh7th/cmp-cmdline",
  "L3MON4D3/LuaSnip",
  "saadparwaiz1/cmp_luasnip",
  "hrsh7th/nvim-cmp",

  -- 5. Mason (管理语言服务器)
  "williamboman/mason.nvim",
  "williamboman/mason-lspconfig.nvim",

  -- 6. 状态栏
  "nvim-lualine/lualine.nvim",

  -- 7. 快捷键提示
  "folke/which-key.nvim",

  -- 8. Better Escape (快速退出插入模式)
  {
    "max397574/better-escape.nvim",
    event = "InsertEnter",
    config = function()
      require("better_escape").setup({
        timeout = vim.o.timeoutlen,
        default_mappings = false,
        mappings = {
          i = {
            j = {
              k = "<Esc>",
              j = "<Esc>",
            },
          },
          c = {
            j = {
              k = "<C-c>",
              j = "<C-c>",
            },
          },
          t = {
            j = {
              k = "<C-\\><C-n>",
              j = "<C-\\><C-n>",
            },
          },
        },
      })
    end,
  },
}, {
  install = { colorscheme = { "tokyonight" } },
  checker = { enabled = true },
  change_detection = { notify = false },
})

-- 🎨 应用主题
vim.cmd.colorscheme("tokyonight")

-- ⚙️ 插件初始化
require("nvim-tree").setup()
require("lualine").setup()
require("which-key").setup()

-- LSP 自动补全配置 (基础版)
local capabilities = require('cmp_nvim_lsp').default_capabilities()
local lspconfig = require('lspconfig')
-- 示例：启用 Python 和 Lua 的语言服务器 (需要先通过 :Mason 安装)
-- lspconfig.pyright.setup({ capabilities = capabilities })
-- lspconfig.lua_ls.setup({ capabilities = capabilities })
```

### 安装 Tree-sitter、Lazy（重新同步插件）

```bash
sudo pacman -S tree-sitter-cli

git clone --filter=blob:none https://github.com/folke/lazy.nvim.git \
  --branch=stable ~/.local/share/nvim/lazy/lazy.nvim
```

### 故障排除

如果插件有问题，清理缓存后重新安装：

```bash
# 删除缓存
rm -rf ~/.local/state/nvim/lazy
rm -rf ~/.cache/nvim

# 重新同步插件
nvim --headless "+Lazy! sync" +qa

# 打开项目
cd /path/to/project
nvim .
```

## Vim 快捷键参考

### 基础移动

| 快捷键 | 方向 | 说明 |
| ------ | ---- | ---- |
| `H` | ← | 向左移动 |
| `J` | ↓ | 向下移动 |
| `K` | ↑ | 向上移动 |
| `L` | → | 向右移动 |

### 单词跳转

| 快捷键 | 说明 | 助记 |
| ------ | ---- | ---- |
| `w` | 跳到下一个单词首 | **W**ord |
| `b` | 跳回上一个单词首 | **B**ack |
| `e` | 跳到下一个单词尾 | **E**nd |

### Vim 操作哲学

Vim 采用 **"动词 + 名词"** 的组合方式：

| 动词 | 说明 | 名词 | 说明 |
| ---- | ---- | ---- | ---- |
| `d` | 删除 (Delete) | `w` | 单词 (Word) |
| `c` | 修改 (Change) | `$` | 行尾 |
| `y` | 复制 (Yank) | `0` | 行首 |
| | | `G` | 文件末尾 |

**常用组合示例**：

| 命令 | 分解 | 说明 |
| ---- | ---- | ---- |
| `dw` | d + w | 删除一个单词 |
| `dd` | d + 行 | 删除整行 |
| `d$` | d + $ | 删除到行尾 |
| `cw` | c + w | 修改一个单词（删除并进入插入模式） |
| `cc` | c + 行 | 修改整行 |
| `yw` | y + w | 复制一个单词 |
| `yy` | y + 行 | 复制整行 |
| `y$` | y + $ | 复制到行尾 |

**粘贴**：

| 命令 | 说明 |
| ---- | ---- |
| `p` | 在光标后粘贴 |
| `P` | 在光标前粘贴 |

### 页面翻滚

| 操作 | 快捷键 | 助记 | 说明 |
| ---- | ------ | ---- | ---- |
| 向下翻半页 | `Ctrl` + `d` | **D**own | 屏幕向下移动半屏，光标随之下移 |
| 向上翻半页 | `Ctrl` + `u` | **U**p | 屏幕向上移动半屏，光标随之上移 |

### 保存与退出

| 命令 | 说明 |
| ---- | ---- |
| `:wq` | 保存并退出 |
| `ZZ` | 保存并退出（大写 ZZ，最快方式） |

### 搜索

| 命令 | 说明 |
| ---- | ---- |
| `/关键词` | 向下搜索，按回车后 `n` 下一个，`N` 上一个 |
| `?关键词` | 向上搜索，按回车后 `n` 下一个，`N` 上一个 |

---

---

# 参考资料

- Arch Linux 安装指南
- GRUB 双系统配置

---

---
