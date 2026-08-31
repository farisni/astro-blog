---
title: "OrangeS一个操作系统的实现"
description: "它也是\"动手写操作系统\"，但相比《操作系统真象还原》，它更短、更偏代码推进，并且带有明显的 MINIX / 微内核设计思路。"
publishDate: "2026-08-31"
tags:
  - "汇编"
draft: false
pinned: false
---

<!-- 由 scripts/sync-obsidian.mjs 自动生成，请勿直接编辑。 -->

> 从20多行启动代码开始，逐步写出一个具有进程、驱动、进程通信、文件系统和内存管理的小型32位x86操作系统——Orange'S。

它也是"动手写操作系统"，但相比《操作系统真象还原》，它更短、更偏代码推进，并且带有明显的 MINIX / 微内核设计思路。

# 🗺️ 全书主线

```text
启动扇区
   ↓
Loader 加载器
   ↓
进入32位保护模式
   ↓
建立内核
   ↓
中断与进程调度
   ↓
键盘、TTY 等驱动
   ↓
进程间消息通信
   ↓
硬盘与文件系统
   ↓
进程内存管理
   ↓
运行用户程序
```

全书共11章，分为上下两篇。[目录及随书代码结构](https://github.com/whirlys/ORANGE_OS)

![[images/01-orangeos-overview.png]]

# 🚀 第一阶段：先写一个最小程序

第1～2章：

- 编写约20行启动扇区程序
- 生成512字节引导扇区
- 写入软盘镜像
- 使用 Bochs 启动

## 🛠️ 开发环境

| 工具 | 作用 | 安装（macOS / Linux） |
|---|---|---|
| NASM | 汇编编译器：`.asm` → `.bin` / `.o` | `brew install nasm` / `sudo apt install nasm` |
| GCC | C 编译器：`.c` → `.o`（32位需 `-m32`） | `brew install gcc` / `sudo apt install gcc-multilib` |
| ld | 链接器：多个 `.o` → `kernel.elf` | 随 binutils 自带 |
| Make | 自动化构建：`make` / `make run` | `brew install make` / `sudo apt install make` |
| Bochs | x86 模拟器：启动、调试系统镜像 | `brew install bochs` / `sudo apt install bochs` |
| dd | 把 `boot.bin` 写入磁盘第0扇区 | 系统自带 |

最开始的"操作系统"实际上只是：

```text
BIOS
  ↓
读取启动扇区
  ↓
执行我们的代码
  ↓
屏幕显示文字
```

![[images/09-boot-asm-to-cpu.png]]

它还不是完整操作系统，只是让 CPU 执行自己的代码。

# 🛡️ 第二阶段：进入32位保护模式

第3～4章。

> **先抓住最重要的一点：** 从实模式切换到保护模式，真正必需的只有：准备 GDT → 设置 CR0.PE → 远跳转。LDT、TSS、分页、IDT、8259A 并不是"切换动作本身"，而是进入保护模式后，逐步给操作系统补上的能力。

保护模式的核心目的**就是让CPU开始保护内存和系统权限**。

## 🔀 整体过程

```text
CPU通电
  ↓
实模式：运行BIOS和Loader
  ↓
打开A20地址线
  ↓
建立并加载GDT
  ↓
设置CR0.PE = 1
  ↓
远跳转，更新CS（代码段）
══════════════════════
到这里：正式进入保护模式
══════════════════════
  ↓
加载数据段、建立32位栈
  ↓
建立IDT和中断处理程序
  ↓
配置8259A
  ↓
开启分页
  ↓
建立Ring 0内核、Ring 3用户进程
  ↓
使用TSS支持特权级切换
```

![[images/14-protected-mode-switch-spine.png|707]]

![[images/15-protected-mode-capabilities.png|693]]

注意：真正的8086只有实模式。这里实际使用的是80386以上CPU，通电时先进入"兼容8086的实模式"。

## 🏁 第一阶段：实模式启动

CPU通电后：

```text
CS:IP → BIOS
```

BIOS加载启动扇区到 `0x7C00`，然后Loader继续运行。

实模式地址计算：

```
物理地址 = 段寄存器 × 16 + 偏移
```

例如：

```text
CS = 0x1000
IP = 0x0200

物理地址 = 0x1000 × 16 + 0x0200
         = 0x10200
```

此时的特点：

- 默认使用16位指令
- 段寄存器保存真实段地址
- 最大寻址空间约1MB
- 没有内存权限保护
- 可以调用BIOS中断

Loader需要在这个阶段完成切换准备。你现在学的8086分段、段寄存器、1MB内存，就是理解这里的基础。

## 🔓 第二阶段：打开A20地址线

8086只有20根地址线，地址超过 `0xFFFFF` 会回绕：

```text
0x100000 → 0x00000
```

保护模式需要访问1MB以上内存，所以必须打开A20：

```text
关闭A20：0x100000 → 回绕到0
打开A20：0x100000 → 真正访问1MB位置
```

这一步只是解除地址限制，还没有进入保护模式。

## 📋 第三阶段：建立GDT

保护模式不再把段寄存器直接当成段基址。

**实模式：**

```text
CS = 0x1000
段基址 = 0x1000 × 16
```

**保护模式：**

```text
CS = 选择子
      ↓
查找GDT
      ↓
找到段描述符
      ↓
获得段基址、大小和权限
```

GDT中通常先建立三个描述符：

```text
GDT
├── 0号：空描述符
├── 1号：32位内核代码段
└── 2号：32位内核数据段
```

段描述符记录：

```text
段基址
段大小
代码段还是数据段
可读、可写、可执行
特权级
16位还是32位
```

然后告诉CPU，GDT在哪里：

```asm
lgdt [gdt_ptr]
```

`GDTR`寄存器便保存：

```text
GDT起始地址
GDT长度
```

![[images/02-real-to-protected-mode.png|714]]

![[images/10-gdt-selector-descriptor.png|721]]

## ⚡ 第四阶段：设置CR0.PE

`CR0`是CPU控制寄存器。

最低位PE表示是否启用保护模式：

```text
CR0.PE = 0：实模式
CR0.PE = 1：保护模式
```

典型代码：

```asm
mov eax, cr0
or  eax, 1
mov cr0, eax
```

执行之后，CPU开启保护模式规则。

但这时还没有彻底完成，因为 `CS` 里仍然残留旧的实模式值。

## 🦘 第五阶段：执行远跳转

接下来执行：

```asm
jmp CODE_SELECTOR:protected_entry
```

例如：

```asm
jmp 0x08:protected_entry
```

其中 `0x08` 是GDT代码段选择子。

CPU执行远跳转时：

```text
CS = 0x08
     ↓
查找GDT第1号描述符
     ↓
获得32位代码段信息

IP/EIP = protected_entry
```

远跳转同时会：

- 给CS加载新的选择子
- 读取GDT代码段描述符
- 更新CS内部的描述符缓存
- 清理旧流水线
- 从32位入口重新取指令

从这里开始，CPU正式按照32位保护模式运行。

## 📚 第六阶段：建立32位栈

进入保护模式后，要重新设置数据段和栈：

```asm
mov ax, DATA_SELECTOR

mov ds, ax
mov es, ax
mov fs, ax
mov gs, ax
mov ss, ax

mov esp, stack_top
```

现在寄存器变成：

```text
EAX、EBX、ECX、EDX：32位
ESP：32位栈顶
EIP：32位指令地址
```

此时已经拥有一个最基础的32位内核执行环境。

## ✅ 到这里，保护模式切换已经完成

真正的切换主线只有：

```text
打开A20
   ↓
创建GDT
   ↓
lgdt
   ↓
CR0.PE = 1
   ↓
远跳转更新CS
   ↓
重新加载DS、SS，建立ESP
```

后面的内容是在保护模式上继续搭建操作系统。

---

## 🧭 IDT：建立中断入口表

保护模式不能继续直接使用实模式的中断向量表，需要建立IDT。

**CPU必须知道：每种事件发生后，应该跳到哪个处理函数？**

因此建立IDT：

```text
中断编号 → 中断处理程序地址
```

例如：

```text
IDT
├── 0号  → 除零异常处理程序
├── 13号 → 通用保护异常
├── 14号 → 缺页异常
├── 32号 → 时钟中断处理程序
└── 33号 → 键盘中断处理程序
```

使用：

```asm
lidt [idt_ptr]
```

告诉CPU：

```text
IDT在哪里
IDT有多大
```

发生中断后，CPU根据中断号查找IDT，然后跳到相应处理程序。

## ⚡ 异常与硬件中断的区别

**异常**来自CPU内部：

```text
除以0
访问非法内存
执行非法指令
缺页
```

流程：

```text
CPU发现异常
   ↓
产生异常编号
   ↓
查找IDT
   ↓
执行异常处理程序
```

**硬件中断**来自外部设备：

```text
时钟
键盘
硬盘
网卡
```

它们通常需要经过8259A。

## 🔌 8259A：管理外部硬件中断

多个硬件设备都想中断CPU，8259A负责集中管理：

```text
时钟 ─┐
键盘 ─┤
硬盘 ─┼→ 8259A → CPU → IDT → 中断处理程序
网卡 ─┘
```

它负责：

- 接收设备中断
- 判断优先级
- 屏蔽某些中断
- 向CPU发出中断请求
- 提供中断编号

配置好8259A和IDT后，执行：

```asm
sti
```

![[images/13-interrupts-8259a-idt.png|739]]

CPU才开始响应可屏蔽硬件中断。

> **8259A负责把多个外部设备的中断，整理后交给CPU；IDT负责找到对应处理代码。**

## 🎖️ 特权级：区分内核和用户程序

保护模式提供4个Ring：

```text
Ring 0：最高权限，内核
Ring 1
Ring 2
Ring 3：最低权限，用户程序
```

一般操作系统主要使用：

```text
Ring 0：操作系统内核
Ring 3：普通应用程序
```

**Ring 0 可以：**

- 操作页表
- 访问硬件端口
- 修改中断状态
- 访问全部内核内存
- 执行特权指令

**Ring 3 只能：**

- 执行普通计算
- 访问自己的用户内存
- 通过系统调用请求内核服务

**CPU 如何知道当前权限？主要看四个地方：**

```text
1. CPL（Current Privilege Level）
   CS 寄存器的最低两位 → 决定 CPU 当前处于哪个 Ring

2. DPL（Descriptor Privilege Level）
   段描述符或门描述符中的字段 → 规定这个段/门属于哪个权限级

3. RPL（Requested Privilege Level）
   选择子的最低两位 → 由程序设置，参与本次访问检查
   （避免低权限程序"借用"高权限选择子）
```

这三个值综合决定段级访问是否允许。

最后还有一层：

```text
4. 页表 U/S 位（User/Supervisor）
   每个页表项中有一位标记 → 真正保护具体内存页面
   用户态只能访问 U/S=User 的页面
```

访问发生时，CPU 同时检查段级和页级：

```text
代码跳转：CPL  vs  目标代码段的 DPL
数据访问：CPL  vs  目标数据段的 DPL（结合 RPL）
内存访问：CPL  vs  页表项的 U/S 位
```

> **段级保护（CPL/DPL/RPL）管"能不能碰这段"，页级保护（U/S）管"能不能碰这一页"。两层都通过，访问才允许。**

## 🔄 TSS：切换特权级时找到内核栈

假设Ring 3用户程序发生时钟中断：

```text
用户程序正在运行
使用用户栈
   ↓ 中断
CPU进入Ring 0内核
```

CPU不能继续使用用户提供的栈，否则不安全。

TSS保存了Ring 0栈的位置：

```text
TSS
├── SS0：内核栈段
└── ESP0：内核栈顶
```

切换过程：

```text
Ring 3用户程序
   ↓ 中断或系统调用
CPU读取TSS中的SS0:ESP0
   ↓
切换到内核栈
   ↓
保存用户程序现场
   ↓
执行Ring 0中断处理程序
```

现代操作系统通常主要使用TSS提供内核栈，不依赖它完成完整的硬件任务切换。

![[images/11-privilege-tss.png|744]]

## 📦 LDT：给进程提供自己的段描述符

GDT是全局的：所有程序共同使用。LDT是局部的：某个进程自己的段描述符表。

选择子中有一个TI位：

```text
TI = 0：查询GDT
TI = 1：查询LDT
```

Orange'S中可以为不同进程建立不同LDT：

```text
进程A → LDT A
进程B → LDT B
```

不过现代操作系统一般采用平坦内存模型和分页，LDT的重要性已经降低。

## 🧩 分页：真正隔离进程内存

> **把程序看到的地址与真实物理内存分开，并隔离不同进程。**

保护模式的地址首先经过分段：

```text
选择子 → 描述符 → 段基址 + 偏移
                    ↓
                  线性地址
```

不开分页时：**线性地址 = 物理地址**。

开启分页后：

```text
线性地址
   ↓ 页目录
   ↓ 页表
物理地址
```

开启过程：

```text
建立页目录和页表
   ↓
把页目录地址写入CR3
   ↓
设置CR0.PG = 1
   ↓
开启分页
```

最终地址转换：

```text
程序使用的地址
   ↓ 分段
线性地址
   ↓ 分页
物理地址
   ↓
真实内存
```

![[images/12-paging-linear-address.png|747]]

分页让两个进程都可以认为自己使用相同地址：

```text
进程A的0x400000 → 物理页A
进程B的0x400000 → 物理页B
```

从而实现进程隔离和虚拟内存。

## 🧩 所有概念最后拼起来

```text
GDT/LDT
负责：这是什么内存段，基址、大小、权限是什么
        ↓
特权级
负责：谁有权访问
        ↓
分页
负责：线性地址最终映射到哪块物理内存
        ↓
IDT
负责：中断发生后去执行哪段代码
        ↓
8259A
负责：多个外部设备的中断如何送给CPU
        ↓
TSS
负责：进入内核时切换到哪个内核栈
```

> **一句话总结：** CPU先在实模式运行Loader；Loader建立GDT并打开CR0.PE，通过远跳转进入32位保护模式；然后操作系统再用IDT和8259A管理中断，用分页管理内存，用特权级和TSS隔离用户程序与内核。

## ❓ Q&A：程序能随便越权吗？

程序可以随便"尝试越权"，但 CPU 不会随便让它成功。

关键区别：

> 程序可以写任何指令，但指令能不能成功执行，由 CPU 根据 **CPL 和权限表**决定。

### 尝试直接跳入内核代码段

假设用户程序当前：

```text
CPL = 3
```

它尝试直接跳到内核代码段：

```asm
jmp 0x08:kernel_code
```

CPU 检查：

```text
当前CPL = 3
目标代码段DPL = 0
       ↓
权限不允许
       ↓
产生 #GP 通用保护异常
```

它不会进入 Ring 0。

### 修改选择子也没用

程序可能故意构造：

```text
RPL = 0
```

但 CPU 检查数据访问时使用：

```text
实际权限 = max(CPL, RPL)
```

于是：

```text
CPL = 3
RPL = 0

max(3, 0) = 3
```

程序仍然被视为 Ring 3。

所以：

> RPL 只能主动降低自己的权限，不能把 CPL 3 提升成 CPL 0。

### 直接修改 CS 也不行

CPL 来自 CS 的最低两位，但用户程序不能普通地执行：

```asm
mov cs, 0x08
```

x86 根本不允许直接修改 CS。

只能通过以下方式间接修改 CS，而且 CPU 每次都会检查权限：

- 远跳转
- 中断
- 异常
- 系统调用
- `iret`

### 访问内核内存也会被拦截

用户程序尝试：

```asm
mov eax, [kernel_address]
```

CPU 查询页表：

```text
当前CPL = 3
内核页面 U/S = 0
       ↓
禁止用户访问
       ↓
产生 #PF 缺页异常
```

### 执行特权指令也会被拦截

用户程序即使写下：

```asm
cli                 ; 关闭中断
mov cr0, eax        ; 修改CPU工作模式
mov cr3, eax        ; 修改页表
out 0x60, al        ; 操作硬件端口
```

CPU 也会检查：

```text
当前CPL = 3
该指令要求 Ring 0
       ↓
拒绝执行
       ↓
产生保护异常
```

### 用户程序如何合法进入内核

必须走操作系统预先设置的入口：

```text
Ring 3 用户程序
    ↓ 系统调用
CPU 查询系统调用入口
    ↓ 权限检查
从 TSS 取得内核栈
    ↓
进入指定的 Ring 0 处理程序
    ↓
内核完成服务
    ↓ iret / sysret
回到 Ring 3
```

重点是：用户程序只能进入内核规定好的入口。

```text
不允许：
Ring 3 → 随便选择一个内核地址

允许：
Ring 3 → 系统调用入口 → 内核检查参数 → 执行服务
```

> **程序可以随便发起越权指令，但 CPL 不能由程序随意修改。CPU 会利用 DPL、页表权限和特权指令规则阻止越权；只有内核设置的系统调用、中断等受控入口才能从 Ring 3 进入 Ring 0。**

当然，如果操作系统把 GDT、页表或系统调用入口配置错了，确实可能形成提权漏洞。

### 谁决定程序运行在哪个 Ring？

**操作系统决定哪个程序运行在 Ring 0、哪个运行在 Ring 3；CPU 负责执行和检查这个决定。**

不是 CPU 扫描程序内容后判断，也不是程序自己声明。

```text
操作系统：分配权限
CPU：强制执行权限
```

#### 内核为什么是 Ring 0

进入保护模式时，Loader 主动跳到 GDT 中的内核代码段：

```asm
jmp 0x08:kernel_entry
```

假设选择子 `0x08` 指向：

```text
内核代码段
DPL = 0
RPL = 0
```

CPU 加载它以后：

```text
CS 最低两位 = 00
CPL = 0
```

于是内核从 Ring 0 开始运行。

#### 用户程序为什么是 Ring 3

创建用户进程时，内核会：

1. 把程序代码加载到用户内存
2. 给页面设置用户可访问权限
3. 建立用户栈
4. 准备 Ring 3 代码段和数据段选择子
5. 使用 `iret` 进入用户程序

内核准备的现场大概是：

```text
SS  = 用户数据段选择子 | 3
ESP = 用户栈顶
CS  = 用户代码段选择子 | 3
EIP = 用户程序入口
```

然后执行：

```asm
iret
```

CPU 恢复 CS 时看到最低两位是 `11`：

```text
CS 最低两位 = 11
CPL = 3
```

于是用户程序在 Ring 3 运行。

#### 程序本身不知道自己属于哪个 Ring

同一个机器码程序，理论上可以被内核安排在不同权限运行。

决定权限的**不是**：

- 文件名
- C 语言还是汇编语言
- ELF 文件本身
- 程序自己声称的权限

决定权限的**是**：

```text
操作系统给它加载了哪个 CS 选择子
        ↓
CS 最低两位决定 CPL
        ↓
CPU 按照 CPL 执行权限检查
```

#### 实际系统通常这样分

```text
Ring 0
├── 操作系统内核
├── 内存管理
├── 进程调度
└── 大部分驱动程序

Ring 3
├── 浏览器
├── Shell
├── 编辑器
└── 普通用户程序
```

Ring 1 和 Ring 2 在现代主流操作系统中通常很少使用。

> **一句话总结：操作系统创建进程时，通过给它安排 Ring 0 或 Ring 3 的 CS 选择子来分配权限；CPU 从 CS 得到 CPL，并阻止程序越权。**

# ⚙️ 第三阶段：形成内核

第5章。

这一阶段说白了是在完成一次关键交接：

> 从"只能显示字符的启动程序"，升级成"能够加载并运行 C 语言内核的操作系统"。

核心链路：

```text
BIOS
  ↓
Boot 启动扇区
  ↓
Loader 加载器
  ↓
Kernel 内核
```

Boot、Loader、Kernel 是三个不同程序。

| 程序 | 作用 |
|---|---|
| Boot | 只有512字节，负责找到并加载 Loader |
| Loader | 准备运行环境、读取并解析内核 |
| Kernel | 真正长期运行的操作系统核心 |

整个过程分为两个时刻：

```text
开机前：编译和制作系统镜像
开机后：Boot → Loader → Kernel
```

## 🏗️ 一、开机前：制作操作系统

源代码大致分为：

```text
project/
├── boot/
│   ├── boot.asm
│   └── loader.asm
├── kernel/
│   ├── kernel.asm
│   ├── main.c
│   └── interrupt.c
├── include/
└── Makefile
```

### 1. 编译 Boot

```text
boot.asm
   ↓ NASM
boot.bin
```

`boot.bin` 正好512字节，被写入磁盘第0扇区。

它只能放很少的代码，所以主要任务是：

```text
找到 Loader
   ↓
把 Loader 读进内存
   ↓
跳转到 Loader
```

### 2. 编译 Loader

```text
loader.asm
   ↓ NASM
loader.bin
```

Loader 不受512字节限制，可以完成更复杂的任务：

- 检测内存
- 打开 A20
- 建立 GDT
- 进入保护模式
- **从磁盘读取内核**
- **解析 ELF**
- **跳转到内核入口**

Loader 是 Boot 和 Kernel 之间的桥。

### 3. 编译内核

**内核由汇编和 C 共同编写**：

```text
kernel.asm ──NASM──→ kernel.o
main.c ─────GCC────→ main.o
interrupt.c ─GCC───→ interrupt.o
```

然后使用链接器：

```text
kernel.o
main.o
interrupt.o
    ↓ ld
kernel.elf
```

### 最终磁盘镜像

```text
a.img
├── 第0扇区：boot.bin
├── 文件：loader.bin
└── 文件：kernel.elf
```

## 🔌 二、开机后：逐级加载

### 第一步：BIOS 加载 Boot

```text
BIOS
  ↓
读取磁盘第0扇区
  ↓
放到内存 0x7C00
  ↓
跳转到 0x7C00
```

CPU 开始执行 `boot.bin`。

### 第二步：Boot 加载 Loader

Boot 程序在磁盘中寻找 `loader.bin`：

```text
读取 loader.bin
     ↓
放入约定的内存位置
     ↓
跳转到 Loader 入口
```

现在 CPU 不再执行 Boot，开始执行 Loader。

**为什么不让 Boot 直接加载内核？** 因为 Boot 只有512字节：

```text
Boot：空间小，只负责接力
Loader：空间大，负责复杂准备
```

## 📦 三、Loader 加载内核

> **Loader是Boot和Kernel之间的桥。**

Loader 需要在磁盘中找到 `kernel.elf`，然后把它读取到内存。

```text
磁盘中的 kernel.elf
        ↓ Loader 读取
内存中的 kernel.elf
```

但此时还不能简单地跳过去执行，因为 ELF 不只包含机器指令，还包含文件结构信息。

## 🔍 四、解析和加载 ELF

ELF 是 Linux 及类 Unix 系统常见的可执行文件格式。

可以把它理解为：

```text
kernel.elf
├── ELF 头：这是什么文件、入口地址在哪里
├── 程序头表：各部分应该放到哪里
├── 代码段：机器指令
├── 数据段：全局变量
└── 其他信息
```

ELF 头告诉 Loader：

```text
内核入口地址在哪里
有几个需要加载的段
每个段在文件中的位置
每个段应该复制到哪个内存地址
每个段有多大
```

Loader 解析 ELF 程序头：

```text
读取 ELF 头
   ↓
读取程序头表
   ↓
找到可加载段
   ↓
把代码段复制到指定内存
   ↓
把数据段复制到指定内存
   ↓
取得内核入口地址
```

例如：

```text
kernel.elf 文件

文件偏移 0x1000 的代码
        ↓
复制到内存 0x30400

文件偏移 0x5000 的数据
        ↓
复制到内存 0x40000
```

所以 ELF 不是简单的一整块代码：

> Loader 需要按照 ELF 提供的说明，把内核的不同部分摆放到正确内存位置。

## 🤝 五、汇编与 C 混合编程

CPU 不能直接从一个普通 C 函数开始运行，因为刚进入内核时还需要处理一些底层工作：

- 设置栈
- 设置段寄存器
- 保存启动参数
- 建立可供 C 使用的运行环境

因此内核入口通常先用汇编：

```asm
kernel_entry:
    mov esp, kernel_stack
    call kernel_main
```

然后进入 C 语言：

```c
void kernel_main(void) {
    init_interrupt();
    init_process();
    while (1) {
    }
}
```

关系：

```text
Loader
  ↓ 跳转
汇编入口 kernel_entry
  ↓ 准备栈和寄存器
C 函数 kernel_main
  ↓
开始初始化内核
```

为什么混合使用？

```text
汇编：处理寄存器、栈、中断入口、CPU 模式
C语言：实现调度、驱动、文件系统等复杂逻辑
```

## 🚪 六、建立内核入口

>Loader（内核加载器）**把 CPU 的 `RIP`（下一条指令地址寄存器）改成 ELF 头中记录的入口地址，然后 CPU 从那里继续取机器指令执行。**
如果是RustOS本质上就是：**把 CPU 的下一条指令地址改成 Rust 函数对应的机器码地址，然后从那里继续执行。**

链接内核时会指定入口符号，例如 `_start` 或 `kernel_entry`。

ELF 头保存这个入口地址：

```text
e_entry = 内核入口地址
```

Loader 完成 ELF 加载后：

```text
读取 ELF 入口地址
      ↓
jmp kernel_entry
```

这一次跳转是重要交接：

```text
Loader 的工作结束
       ↓
CPU 开始执行 Kernel
```

从此以后，控制计算机的是内核。

### ❓ Q&A：Loader 是怎么"跳"进内核的？Linux和RustOS

在进入内核的上，**Linux0.0.1和Rust Blos本质完全一样**。

> Loader（内核加载器）把 CPU 的 `RIP`（下一条指令地址寄存器）改成 ELF 头中记录的入口地址，然后 CPU 从那里继续取机器指令执行。

#### 动态过程

假设 ELF（内核可执行文件格式）头记录：

```text
e_entry = 0x10000001f40
```

Loader 先完成：

```text
读取 ELF
    ↓
把代码段加载到内存
    ↓
建立虚拟地址映射
    ↓
准备内核栈
    ↓
准备 BootInfo 参数
```

然后执行类似：

```asm
jmp 0x10000001f40
```

CPU 内部就是（**RIP，64位指令地址寄存器**）：

```text
RIP = 0x10000001f40
```

接下来：

```text
CPU从0x10000001f40读取机器指令
        ↓
执行一条
        ↓
RIP自动指向下一条
        ↓
继续执行
```

#### CPU 不认识 Rust 和 Kernel

CPU 不知道：

```text
这是 Rust 函数
这是 Kernel
Loader 已经结束
```

CPU 只看到：

```text
把 RIP 改成一个新地址
        ↓
从新地址读取机器码
```

"Loader 交接给 Kernel" 是我们从软件结构上对这次跳转的解释。

对 CPU 来说只是：

```text
之前执行地址A附近的指令
        ↓
遇到 jmp
        ↓
接下来执行地址B附近的指令
```

#### `e_entry` 不一定直接是源码中的 `kernel_main`

你的代码写了：

```rust
entry_point!(kernel_main);
```

这个宏会生成一个符合 Bootloader 要求的入口包装函数。

所以真实关系更可能是：

```text
ELF.e_entry
    ↓
entry_point! 生成的入口机器码
    ↓
整理 BootInfo 参数
    ↓
调用 kernel_main(boot_info)
```

因此 `e_entry` 指向的是编译后的正式程序入口，不一定直接指向你肉眼看到的 `kernel_main` 第一行。

#### 为什么不能随便跳到某个 Rust 函数？

跳转之前必须保证：

```text
函数代码已经加载到对应地址
页表允许执行这个地址
CPU已经进入正确模式
栈指针 RSP 已经设置
参数放在约定的寄存器中
内存映射符合函数预期
```

否则即使地址正确，也可能立即异常。

所以 Loader 的本质任务是：

```text
把 Kernel 需要的运行环境准备好
              ↓
最后设置 RIP 为 Kernel 入口
```

你的运行日志正好体现了这个过程：

```text
Entry point at: 0x10000001f40
        ↓
Create bootinfo
        ↓
Jumping to kernel entry point
        ↓
Hello from Rust kernel!
```

> **一句话总结：ELF 的 `e_entry` 保存内核入口机器码的地址；Loader 准备好环境后，把 CPU 的 `RIP` 改成这个地址，从而让 CPU 开始执行内核。**

## ⚡ 七、建立中断处理框架

内核运行以后，要为各种中断准备入口：

```text
IDT
├── 除零异常入口
├── 保护异常入口
├── 时钟中断入口
├── 键盘中断入口
└── 系统调用入口
```

中断入口通常也需要汇编和 C 配合：

```text
中断发生
   ↓
汇编入口
   ↓ 保存寄存器
调用 C 处理函数
   ↓
处理时钟、键盘等事件
   ↓
汇编恢复寄存器
   ↓
iret 返回
```

例如：

```asm
clock_interrupt:
    pushad
    call clock_handler
    popad
    iretd
```

C 代码：

```c
void clock_handler(void) {
    ticks++;
}
```

分工：

```text
汇编：保存和恢复 CPU 现场
C语言：处理中断的实际逻辑
```

## 📁 八、整理内核源代码结构

最初可能只有一个 `boot.asm`。随着功能增加，必须拆分：

```text
kernel/
├── start.asm       内核入口
├── interrupt.asm   中断汇编入口
├── main.c          内核主函数
├── interrupt.c     中断处理
├── process.c       进程管理
└── console.c       屏幕输出
```

这一步不是 CPU 运行过程，而是工程管理：

> 把不同职责的代码拆开，使系统能够继续扩展。

## 🔧 九、Makefile 自动构建

如果手动编译，需要执行很多命令：

```bash
nasm boot.asm -o boot.bin
nasm -f elf32 kernel.asm -o kernel.o
gcc -m32 -c main.c -o main.o
gcc -m32 -c interrupt.c -o interrupt.o
ld -m elf_i386 kernel.o main.o interrupt.o -o kernel.elf
dd if=boot.bin of=a.img ...
```

Makefile 把这些关系记录下来：

```text
源代码改变
   ↓
只重新编译受影响的文件
   ↓
重新链接 kernel.elf
   ↓
更新磁盘镜像
```

于是只需要：

```bash
make
```

甚至可以：

```bash
make run
```

自动完成：

```text
编译 → 链接 → 写入镜像 → 启动 Bochs
```

## 🎬 最终完整流程

### 开机前

```text
boot.asm ───────────→ boot.bin
loader.asm ─────────→ loader.bin
汇编+C 内核源码 ────→ kernel.elf
                         ↓
                全部写入 a.img
```

### 开机后

```text
CPU 通电
  ↓
BIOS 加载 Boot
  ↓
Boot 加载 Loader
  ↓
Loader 进入保护模式
  ↓
Loader 读取并解析 kernel.elf
  ↓
把内核代码、数据放到正确内存
  ↓
跳转到内核汇编入口
  ↓
汇编准备栈和寄存器
  ↓
调用 C 语言 kernel_main
  ↓
内核开始运行
```

![[images/03-boot-loader-kernel.png|746]]

> **一句话总结：这一阶段就是构建"三级接力"——BIOS 加载 Boot，Boot 加载 Loader，Loader 解析 ELF 并加载 Kernel，最后从汇编入口进入 C 语言内核。**

# 🔄 第四阶段：进程与调度

第6章：

- 进程表
- 进程状态
- PCB 思想
- 保存和恢复寄存器
- **时钟中断**
- 进程切换
- 调度
- **用户态和内核态**
- 系统调用
- 多个进程轮流运行

核心过程：

```text
进程A运行
   ↓ 时钟中断
保存A的寄存器
   ↓
调度器选择B
   ↓
恢复B的寄存器
   ↓
进程B继续运行
```

这里会让你真正理解：

> 所谓"同时运行多个程序"，本质上是 CPU 快速地保存、切换和恢复程序状态。

![[images/04-process-scheduling.png|760]]

# ⌨️ 第五阶段：输入输出系统

第7章：

- 时钟驱动
- 键盘驱动
- 扫描码
- TTY
- Console
- 屏幕输出
- 多控制台切换
- 输入输出系统的分层设计

结构类似：

```text
键盘硬件
   ↓ 中断
键盘驱动
   ↓
TTY
   ↓
Console
   ↓
用户进程
```

![[images/05-io-layers.png|779]]

它开始把"硬件操作"和"用户程序"隔离开。

# 💬 第六阶段：进程间通信

第8章是这本书非常有特点的一部分：

- 消息结构
- `send`
- `receive`
- `sendrec`
- 进程阻塞和唤醒
- 消息队列
- 死锁检测
- 系统任务
- 驱动、文件系统和进程之间传递消息

例如用户进程读取文件：

```text
用户进程
  ↓ 发送消息
文件系统进程
  ↓ 发送消息
硬盘驱动进程
  ↓
操作硬盘
  ↓ 返回消息
文件系统
  ↓ 返回数据
用户进程
```

这是一种微内核式思想：

> 各个系统模块不一定直接调用彼此，而是像独立进程一样通过消息合作。

![[images/06-ipc-messages.png|773]]

# 📁 第七阶段：文件系统

第9章：

- 硬盘驱动
- 分区表
- 文件系统格式化
- 超级块
- inode
- 文件描述符
- 目录项
- 文件创建、打开、读取、写入和删除
- 文件系统任务
- 用户程序通过消息访问文件

大体结构：

```text
文件名
  ↓
目录项
  ↓
inode
  ↓
磁盘数据块
  ↓
硬盘扇区
```

这部分解释了：

> 文件名本身不是文件内容，而是找到 inode 和磁盘数据的入口。

![[images/07-filesystem-path.png|725]]

# 🧬 第八阶段：内存与进程生命周期

第10～11章：

- 进程地址空间
- 内存分配
- `fork`
- `exec`
- `exit`
- `wait`
- 父子进程
- 用户程序
- 简单 Shell
- 完善 Orange'S 整体结构

最终系统已经具备基本操作系统形态：

```text
Orange'S
├── 启动程序
├── 内核
├── 进程调度
├── 中断系统
├── 系统调用
├── 键盘与 TTY
├── 进程间通信
├── 硬盘驱动
├── 文件系统
└── 用户程序
```

![[images/08-process-lifecycle.png|744]]

# ⚖️ 与《操作系统真象还原》的关键区别

| 对比 | Orange'S | 操作系统真象还原 |
|---|---|---|
| 篇幅 | 约450页 | 约760页 |
| 风格 | 快速推进、边写边成型 | 大量解释、刨根问底 |
| 启动介质 | 主要从软盘镜像起步 | 主要从硬盘 MBR 起步 |
| 架构思想 | 偏 MINIX、消息通信 | 偏传统一体式内核 |
| IPC | 核心内容，模块间大量传消息 | 锁、信号量、管道更突出 |
| 硬件解释 | 相对紧凑 | 非常详细 |
| 代码阅读感 | 简洁，但跳跃稍大 | 代码更多，铺垫更充分 |
| 适合目标 | 快速看见完整 OS 轮廓 | 系统理解每个细节 |

最本质的区别：

```text
《操作系统真象还原》
强调：每个机制为什么这样工作

《Orange'S》
强调：把这些机制组织起来，尽快形成一个 OS
```

# 🎯 对你更合适的使用方式

不要把两本书从第一页开始重复啃。

建议：

1. 用 Orange'S 建立"完整操作系统的骨架"。
2. 遇到保护模式、分页、中断等不理解的地方，去《操作系统真象还原》查详细原理。
3. 完成小型系统后，再进入 Linux 0.11/0.12 源码。

形成：

```text
Orange'S：看全貌
      ↓
真象还原：补原理
      ↓
Linux 0.11：看真实内核
```

你 Drive 中的文件：[OrangeS一个操作系统的实现（于渊）](https://drive.google.com/file/d/1XXHIuPZCGn_F9O8oNdc9AdwhjDTUmqdB)

# 📌 附录：什么是 RIP？

哈哈，不是"睡觉"的 **RIP（Rest in Peace）**。

这里的 **RIP（64位指令地址寄存器）** 是 CPU 内部的一个寄存器，用来记录：

> CPU 接下来应该去哪个内存地址取指令。

## CPU 执行过程

假设内存中：

```text
地址 0x1000：打印A
地址 0x1003：数字加1
地址 0x1006：跳回 0x1000
```

执行时：

```text
RIP = 0x1000
      ↓
CPU 读取并执行"打印A"
      ↓
RIP = 0x1003
      ↓
CPU 执行"数字加1"
      ↓
RIP = 0x1006
      ↓
CPU 执行"跳回 0x1000"
      ↓
RIP = 0x1000
```

所以 CPU 能不断运行，就是因为 RIP 一直告诉它下一条指令在哪里。

## 和你之前学的 IP 是一回事

```text
8086：
CS:IP
   └─ IP 是16位指令地址寄存器

80386：
CS:EIP
   └─ EIP 是32位指令地址寄存器

x86_64：
CS:RIP
   └─ RIP 是64位指令地址寄存器
```

关系是：

```text
RIP：64位
└─ EIP：低32位
   └─ IP：低16位
```

和下面很像：

```text
RAX
└─ EAX
   └─ AX
```

## `jmp` 做了什么？

普通情况下，CPU 执行完指令后：

```text
RIP 自动增加
```

遇到跳转：

```asm
jmp 0x2000
```

CPU 就不再顺序执行，而是：

```text
RIP = 0x2000
```

下一条指令从 `0x2000` 读取。

所以：

```text
Loader 跳转到 Kernel
```

在 CPU 层面的本质就是：

```text
RIP = Kernel 入口地址
```

然后 CPU 从内核入口继续执行。
