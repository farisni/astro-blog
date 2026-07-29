---
title: "Hyprland：deskflow-hyprland-fix"
description: "在 Hyprland（Wayland）下启动 Deskflow Server 模式时报错："
publishDate: "2026-05-02"
tags:
  - "Hyprland"
  - "Deskflow"
  - "Wayland"
  - "xdg-desktop-portal"
  - "InputCapture"
  - "Linux"
draft: false
pinned: false
---

<!-- 由 scripts/sync-obsidian.mjs 自动生成，请勿直接编辑。 -->

## 问题描述

在 **Hyprland**（Wayland）下启动 Deskflow Server 模式时报错：

```bash
ERROR: failed to initialize input capture session, quitting:
GDBus.Error:org.freedesktop.DBus.Error.UnknownMethod: No such interface
"org.freedesktop.portal.InputCapture" on object at path /org/freedesktop/portal/desktop
```

> **背景**：Deskflow 是 Synergy 的开源 fork，用于在多台电脑之间共享鼠标键盘。

## 原因分析

Deskflow 在 Wayland 下通过 `libei`（Emulated Input）实现输入模拟，但**捕获鼠标/键盘输入**必须依赖 `xdg-desktop-portal` 的 `InputCapture` 接口。这是 Wayland 安全模型的要求 — Wayland 不允许应用直接捕获全局输入，必须经过 portal 中转。

目前只有 **GNOME**（Mutter）和 **KDE**（KWin）实现了 `InputCapture` portal。Hyprland 的 `xdg-desktop-portal-hyprland` **尚未实现该接口**，因此 Deskflow 无法启动。

上游相关 Issue 和 PR：

| 项目 | 链接 | 状态 |
|---|---|---|
| Hyprland portal InputCapture 需求 | [hyprwm/xdg-desktop-portal-hyprland#259](https://github.com/hyprwm/xdg-desktop-portal-hyprland/issues/259) | Open |
| portal InputCapture 实现 | [hyprwm/xdg-desktop-portal-hyprland#268](https://github.com/hyprwm/xdg-desktop-portal-hyprland/pull/268) | Draft |
| Hyprland 底层 Input Capture 协议 | [hyprwm/Hyprland#7919](https://github.com/hyprwm/Hyprland/pull/7919) | Draft |
| Deskflow Wayland 已知问题 | [deskflow/deskflow#7499](https://github.com/deskflow/deskflow/discussions/7499) | 持续更新 |

## 解决方案

编译 3l0w（也是 Deskflow 贡献者）的未合并分支，为 Hyprland 添加 InputCapture 支持。

> ⚠️ **警告**：这会替换系统中的 Hyprland 和 xdg-desktop-portal-hyprland。操作前请备份，且后续系统更新时需注意冲突。该分支为 Draft 状态，可能存在不稳定因素。

### 前置条件

按照 [Hyprland Wiki 手动安装章节](https://wiki.hypr.land/Getting-Started/Installation/#manual) 安装所有编译依赖。

Arch Linux 示例：

```bash
sudo pacman -S cmake gcc meson ninja pkg-config wayland-protocols \
  hyprwayland-scanner libei libportal qt6-base qt6-wayland
```

### 步骤一：编译并安装修改版 Hyprland

```bash
# 克隆仓库并切换到功能分支
git clone https://github.com/3l0w/Hyprland.git
cd Hyprland
git checkout feat/input-capture-impl

# 初始化子模块并编译
git submodule update --init --recursive
make clean
make all && sudo make install
```

如果遇到 `Couldn't load proto` 错误，运行以下命令后重试：

```bash
git submodule update --init --recursive
make clean
make all && sudo make install
```

### 步骤二：编译并安装修改版 xdg-desktop-portal-hyprland

```bash
# 克隆仓库并切换到功能分支
git clone https://github.com/3l0w/xdg-desktop-portal-hyprland.git
cd xdg-desktop-portal-hyprland
git checkout feat/input-capture-impl
git submodule update --init --recursive

# 生成协议文件
mkdir -p protocols
hyprwayland-scanner --client \
  subprojects/hyprland-protocols/protocols/hyprland-input-capture-v1.xml \
  protocols/

# 编译并安装
cmake -DCMAKE_INSTALL_LIBEXECDIR=/usr/lib \
  -DCMAKE_INSTALL_PREFIX=/usr -B build
cmake --build build
sudo cmake --install build
```

### 步骤三：重启并验证

重启电脑使新编译的版本生效，然后启动 Deskflow 即可正常使用。

### 后续更新

当上游有新提交时，进入之前克隆的目录拉取最新代码并重新编译：

```bash
# 更新 Hyprland
cd Hyprland
git pull
git submodule update --init --recursive
make clean
make all && sudo make install

# 更新 portal
cd ../xdg-desktop-portal-hyprland
git pull
git submodule update --init --recursive
cmake --build build
sudo cmake --install build
```

> 💡 **提示**：建议将上述更新命令保存为脚本（如 `update-hyprland.sh`），方便定期执行。

## 其他替代方案

如果不想编译修改版，可以考虑以下方案：

| 方案                    | 优点                      | 缺点                             |
| --------------------- | ----------------------- | ------------------------------ |
| **等待上游合并**            | 最稳定，无风险                 | 需要等待，时间不确定                     |
| **使用 lan-mouse**      | 独立实现，无需编译               | 需要更换软件                         |
| **Hyprland 做 Client** | 不需要 InputCapture portal | 需要 RemoteDesktop portal（同样未实现） |
| **使用 X11 模式**         | 可能兼容                    | Hyprland 纯 Wayland 下不可行        |

### 推荐方案：lan-mouse

[lan-mouse](https://github.com/feschber/lan-mouse) 是一个通过 `wlr_layer_shell_v1` 实现的输入捕获工具，不依赖 InputCapture portal，在 Hyprland 上开箱即用。

```bash
# 安装（Arch Linux）
paru -S lan-mouse  # 或 yay
```

## 参考资料

- [stauersbol 的编译教程 Gist](https://gist.github.com/stauersbol/235884919606ea3584c0db48d9c94129)
- [Deskflow Wayland 支持讨论](https://github.com/deskflow/deskflow/discussions/7499)
- [Hyprland RemoteDesktop 支持 Issue](https://github.com/hyprwm/xdg-desktop-portal-hyprland/issues/252)

---

## 总结

**根本原因**：Hyprland 的 xdg-desktop-portal 未实现 InputCapture 接口

**解决思路**：
- ✅ 编译修改版（当前可行，但风险高）
- ⏳ 等待上游合并（推荐长期方案）
- 🔄 替代软件（如 lan-mouse）

**风险提示**：编译修改版会替换系统包，可能与系统更新冲突。建议：
1. 使用 AUR helper 安装时跳过 Hyprland 和 portal 的自动更新
2. 定期关注上游 PR 进展
3. 考虑使用容器或虚拟机测试
