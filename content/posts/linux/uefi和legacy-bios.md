---
title: "UEFI和Legacy BIOS"
description: "本质上，UEFI 和 Legacy BIOS 都负责同一件事："
publishDate: "2026-09-19"
tags:
  - "linux"
draft: false
pinned: false
---

<!-- 由 scripts/sync-obsidian.mjs 自动生成，请勿直接编辑。 -->

本质上，UEFI 和 Legacy BIOS 都负责同一件事：

> 电脑通电后，在硬盘中找到操作系统，并把它启动起来。

区别在于：**寻找和启动操作系统的方法不同。**

## 启动过程对比

### Legacy BIOS：执行硬盘开头的一小段代码

```text
电脑通电
  ↓
BIOS 初始化硬件
  ↓
读取启动硬盘第一个扇区（MBR，512 字节）
  ↓
执行其中的引导代码
  ↓
启动 GRUB 或 Windows Boot Manager
  ↓
启动操作系统
```

BIOS 不认识 Windows、Linux，也不真正理解硬盘里的文件。它只会：

> 找到启动硬盘 → 读取第一个扇区 → 当成代码执行。

---

### UEFI：直接寻找并运行 EFI 程序

```text
电脑通电
  ↓
UEFI 初始化硬件
  ↓
读取主板中的 BootOrder
  ↓
进入硬盘的 EFI 系统分区（ESP）
  ↓
运行某个 .efi 文件
  ↓
启动 GRUB 或 Windows Boot Manager
  ↓
启动操作系统
```

例如你的三系统可能是：

```text
EFI 分区
├── EFI/Microsoft/Boot/bootmgfw.efi  → Windows
├── EFI/ARCH/grubx64.efi             → Arch GRUB
└── EFI/ubuntu/shimx64.efi           → Mint GRUB
```

UEFI 主板里还保存着：

```text
BootOrder:
1. ubuntu
2. ARCH
3. Windows Boot Manager
```

所以它会优先运行 Mint 的 GRUB，然后由 GRUB 显示系统选择菜单。

## 核心区别

|对比项|Legacy BIOS|UEFI|
|---|---|---|
|启动方式|执行硬盘第一个扇区的代码|直接运行 ESP 中的 `.efi` 程序|
|引导位置|MBR|EFI 系统分区|
|常见分区表|MBR|GPT|
|是否理解文件系统|基本不理解|能读取 FAT 格式的 ESP|
|多系统管理|多个引导程序容易争抢 MBR|每个系统拥有自己的 EFI 目录|
|大硬盘支持|MBR 通常限制在约 2TB|GPT 支持更大硬盘|
|主分区限制|MBR 通常最多 4 个主分区|GPT 通常可创建很多分区|
|安全启动|不支持|可支持 Secure Boot|
|图形、鼠标、网络能力|很有限|固件功能更丰富|
|使用年代|老电脑和兼容模式|现代电脑的标准方式|

## 最容易混淆的一点

UEFI、GPT、ESP 是三个不同概念，但经常一起出现：

```text
UEFI：主板采用的启动方式
GPT：硬盘分区表的格式
ESP：GPT 硬盘中存放 .efi 启动文件的分区
```

典型现代组合是：

```text
UEFI + GPT + ESP
```

典型老式组合是：

```text
Legacy BIOS + MBR + 硬盘启动扇区
```

但它们并非绝对绑定。例如 BIOS 经过特殊处理也能启动 GPT 硬盘，只是不常见。

## 用一句话理解

```text
Legacy BIOS：找到硬盘开头，执行那里的一小段代码。
UEFI：进入 EFI 分区，像启动程序一样运行某个 .efi 文件。
```

所以你的 Windows、Arch、Mint 三系统适合使用 **UEFI 模式**：各系统的引导文件可以同时放在同一个 EFI 分区中，互不覆盖；UEFI 的 `BootOrder` 决定首先运行谁。

# 举例多系统启动：Arch和Mint的GRUB

开始是在 Arch 上安装了 GRUB。后来安装 Mint 时，**Mint 通常又安装了一套自己的 GRUB**。

所以现在不是“Arch 的 GRUB 被变成 Mint 的”，而是 EFI 分区里可能同时存在两套：

```text
EFI 系统分区
├── EFI/ARCH/grubx64.efi       ← Arch 安装的 GRUB
├── EFI/ubuntu/shimx64.efi     ← Mint 安装的 GRUB
└── EFI/Microsoft/...          ← Windows 启动程序
```

这里有个奇怪点：

> Linux Mint 基于 Ubuntu，因此它创建的 UEFI 启动项通常也叫 `ubuntu`，不叫 `Mint`。

## 现在开机实际走哪一个？

取决于主板的 `BootOrder`：

```text
BootOrder:
ubuntu
ARCH
Windows Boot Manager
```

如果 `ubuntu` 排第一，启动过程就是：

```text
主板 UEFI
  ↓
运行 EFI/ubuntu/shimx64.efi
  ↓
进入 Mint 安装的 GRUB
  ↓
选择 Mint、Arch 或 Windows
```

如果 `ARCH` 排第一：

```text
主板 UEFI
  ↓
运行 EFI/ARCH/grubx64.efi
  ↓
进入 Arch 安装的 GRUB
  ↓
选择系统
```

## 两个 GRUB 的关系

它们是两套独立的引导程序：

|启动项|谁安装的|配置通常由谁更新|
|---|---|---|
|`ARCH`|Arch|Arch 的 `grub-mkconfig`|
|`ubuntu`|Mint|Mint 的 `update-grub`|

例如你在 Mint 执行：

```bash
sudo update-grub
```

更新的是 **Mint 那套 GRUB 菜单**，不会同步更新 Arch 那套。

## 你可以直接确认

在任意 Linux 中执行：

```bash
sudo efibootmgr -v
```

看 `BootOrder` 和每个启动项对应的 `.efi` 路径。

所以结论是：

> 你最初装的是 Arch GRUB；后来 Mint 大概率又装了一套 GRUB，并把名为 `ubuntu` 的启动项排到了前面。原来的 Arch GRUB 通常还在，只是现在可能没有被优先执行。
