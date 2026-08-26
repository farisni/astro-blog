---
title: "Rust实现微内核：实现进程交替打印"
description: "可以。先把目标定义清楚："
publishDate: "2026-08-26"
tags:
  - "汇编"
draft: false
pinned: false
---

<!-- 由 scripts/sync-obsidian.mjs 自动生成，请勿直接编辑。 -->

可以。先把目标定义清楚：

> 做一个 Rust 版的 Linux 0.00：启动后建立内核，创建两个 Ring 3 用户任务，由时钟中断和调度器切换，任务通过系统调用输出数字。

先不考虑文件系统、程序加载、独立地址空间等扩展。

> 环境准备
> rustc 1.97.1 (2026-07-14) ✓ cargo 1.97.1 ✓ rustup 1.29.0 ✓ qemu-system-x86_64 8.2.2 ✓ git 2.43.0
> 安装用于编写裸机内核的 Rust Nightly 工具链。
> Stable Rust 1.97.1 用于普通Rust程序 Nightly Rust 用于编译操作系统内核

## 一、系统总体框架

你列出的结构还缺少一个必要部分：**最小分页和用户内存权限**。

因为 x86_64 的 Ring 3 任务不能执行只允许 Ring 0 访问的内存页。

```text
Mini Rust OS
│
├─ Boot
│  ├─ 初始化基本环境
│  ├─ 进入 x86_64 Long Mode
│  ├─ 建立初始页表
│  ├─ 加载 Kernel
│  └─ 跳转到 kernel_start
│
└─ Kernel
   │
   ├─ 输出系统
   │  └─ VGA Console
   │
   ├─ CPU保护机制
   │  ├─ GDT
   │  ├─ Ring 0代码段/数据段
   │  ├─ Ring 3代码段/数据段
   │  └─ TSS与内核栈
   │
   ├─ 内存权限
   │  ├─ 内核页：Ring 0可访问
   │  ├─ 用户代码页：Ring 3可执行
   │  └─ 用户栈页：Ring 3可读写
   │
   ├─ 中断系统
   │  ├─ IDT
   │  ├─ CPU异常
   │  ├─ PIC
   │  ├─ PIT时钟
   │  └─ 系统调用中断
   │
   ├─ 任务系统
   │  ├─ Task A
   │  ├─ Task B
   │  ├─ Task Context
   │  ├─ Round-Robin Scheduler
   │  └─ Context Switch
   │
   └─ 系统调用
      ├─ print
      └─ yield
```

## 二、系统启动主流程

```text
Bootloader加载内核
        ↓
进入kernel_start
        ↓
关闭中断
        ↓
初始化VGA输出
        ↓
初始化页表和内存权限
        ↓
初始化GDT
        ↓
初始化TSS和Ring 0内核栈
        ↓
初始化IDT
        ↓
初始化PIC
        ↓
初始化PIT时钟
        ↓
创建Task A和Task B
        ↓
打开中断
        ↓
进入第一个Ring 3任务
```

伪代码：

```text
kernel_start():

    disable_interrupts()

    console.init()

    memory.init()
    memory.map_kernel_pages()
    memory.map_user_code_pages()
    memory.map_user_stack_pages()

    gdt.init()
    tss.init()

    idt.init()
    pic.init()
    pit.init()

    scheduler.create_task(task_A)
    scheduler.create_task(task_B)

    enable_interrupts()

    scheduler.enter_first_task()
```

进入第一个任务之后，`kernel_start()` 不再像普通函数一样返回。

## 三、任务是什么

每个任务至少包含四部分：

```text
Task
├─ 用户程序入口
├─ 用户栈
├─ 内核栈
└─ CPU上下文
```

伪结构：

```text
Task:

    id
    state

    user_entry
    user_stack

    kernel_stack

    saved_context
```

状态：

```text
TaskState:

    Ready
    Running
    Blocked
    Finished
```

这个实验里实际上只需要：

```text
Ready
Running
```

## 四、CPU上下文是什么

CPU运行一个任务时，现场包含：

```text
通用寄存器
RAX RBX RCX RDX
RSI RDI RBP
R8 ～ R15

程序位置
RIP

栈位置
RSP

状态
RFLAGS

权限信息
CS
SS
```

因此：

```text
Context:

    general_registers
    instruction_pointer
    stack_pointer
    flags
    code_segment
    stack_segment
```

所谓上下文切换，本质就是：

```text
保存Task A的这些数据
            ↓
加载Task B的这些数据
```

不是复制整个程序，也不是移动整个进程内存。

## 五、两个栈为什么都需要

每个用户任务需要：

```text
用户栈：Ring 3运行普通程序时使用
内核栈：进入Ring 0处理中断和系统调用时使用
```

正常运行：

```text
Task A运行于Ring 3
       ↓
使用Task A用户栈
```

时钟中断发生：

```text
Task A运行于Ring 3
       ↓
CPU查找TSS
       ↓
获得Task A的Ring 0内核栈
       ↓
切换到内核栈
       ↓
保存Task A上下文
       ↓
执行时钟中断处理程序
```

这里 TSS 的核心作用不是直接完成任务调度，而是告诉 CPU：

> 当前 Ring 3 任务进入 Ring 0 时，应该使用哪一个内核栈。

## 六、两个任务的初始状态

任务第一次运行时，并不存在“上次保存的现场”。

因此内核需要人为伪造一个上下文，让它看起来像任务之前被中断过：

```text
Task A初始上下文:

    RIP = task_A入口地址
    RSP = Task A用户栈顶
    CS  = Ring 3代码段
    SS  = Ring 3数据段
    RFLAGS = 允许中断
```

Task B 同理：

```text
Task B初始上下文:

    RIP = task_B入口地址
    RSP = Task B用户栈顶
    CS  = Ring 3代码段
    SS  = Ring 3数据段
    RFLAGS = 允许中断
```

之后恢复这个上下文并执行 `iretq`，CPU 就会：

```text
Ring 0内核
    ↓ iretq
Ring 3任务入口
```

## 七、两个用户任务

最简单的任务伪代码：

```text
task_A():

    number = 0

    forever:

        syscall(PRINT, "A", number)

        number = number + 1

        syscall(YIELD)
```

```text
task_B():

    number = 0

    forever:

        syscall(PRINT, "B", number)

        number = number + 1

        syscall(YIELD)
```

输出：

```text
A:0
B:0
A:1
B:1
A:2
B:2
```

这里用户任务不能直接调用 VGA 驱动：

```text
Task A → VGA内存       不允许
```

必须经过：

```text
Task A
  ↓ syscall
Kernel
  ↓
VGA驱动
```

这才体现 Ring 3 和 Ring 0 的分工。

## 八、系统调用框架

可以使用一个专门的软件中断，例如：

```text
int 0x80
```

系统调用接口：

```text
系统调用号：

0 = PRINT
1 = YIELD
```

用户任务调用：

```text
syscall_number → 某个寄存器
参数1         → 某个寄存器
参数2         → 某个寄存器

触发int 0x80
```

CPU执行过程：

```text
Ring 3任务
   ↓ int 0x80
CPU检查IDT中的权限
   ↓
切换到TSS指定的Ring 0栈
   ↓
保存用户任务现场
   ↓
进入系统调用处理程序
```

系统调用处理伪代码：

```text
syscall_handler(context):

    syscall_number = context.syscall_register

    if syscall_number == PRINT:
        console.print(context.argument1,
                      context.argument2)

    if syscall_number == YIELD:
        scheduler.schedule(context)

    return_to_user()
```

## 九、Round-Robin 调度器

两个任务时非常简单：

```text
当前是Task A → 选择Task B
当前是Task B → 选择Task A
```

伪代码：

```text
schedule(current_context):

    current_task.saved_context = current_context

    if current_task == Task A:
        next_task = Task B
    else:
        next_task = Task A

    current_task.state = Ready
    next_task.state = Running

    current_task = next_task

    tss.ring0_stack = next_task.kernel_stack_top

    return next_task.saved_context
```

本质就是：

```text
保存当前任务
    ↓
换current指针
    ↓
恢复下一个任务
```

## 十、上下文切换完整过程

时钟中断到来：

```text
Task A正在Ring 3运行
        ↓
PIT产生IRQ 0
        ↓
PIC通知CPU
        ↓
CPU查找IDT
        ↓
CPU切到Task A内核栈
        ↓
CPU自动保存部分现场
        ↓
中断入口保存其余寄存器
        ↓
调用scheduler
        ↓
保存Task A内核栈位置
        ↓
选择Task B
        ↓
更新TSS中的内核栈
        ↓
切换到Task B保存的内核栈
        ↓
恢复Task B寄存器
        ↓
iretq
        ↓
Task B从上次位置继续运行
```

对应伪代码：

```text
timer_interrupt_entry():

    push_all_registers()

    old_context = current_stack_pointer

    send_end_of_interrupt_to_pic()

    new_context = scheduler.schedule(old_context)

    current_stack_pointer = new_context

    pop_all_registers()

    iretq
```

这一小段中断入口和栈切换通常需要少量汇编。

Rust负责：

```text
任务结构
调度算法
状态管理
VGA输出
系统调用分发
初始化逻辑
```

汇编负责：

```text
准确保存寄存器
切换RSP
准确恢复寄存器
iretq返回
```

## 十一、PIT和调度器的关系

PIT 负责定期发出信号：

```text
PIT
 ↓ 每隔一段时间
IRQ 0
 ↓
Timer Handler
 ↓
Scheduler
```

PIT 不知道什么是进程，也不负责选择任务。

```text
PIT：时间到了
调度器：下一步运行谁
上下文切换器：真正切过去
```

这是三个不同职责。

## 十二、严格交替与抢占式切换的区别

如果任务主动执行：

```text
print
yield
```

输出可以设计成：

```text
A0 B0 A1 B1 A2 B2
```

这是协作式切换。

如果只依靠时钟强制切换，结果更可能是：

```text
A0 A1 A2 A3
B0 B1 B2
A4 A5 A6
```

这是抢占式切换，更接近 Linux 0.00 的：

```text
AAAAAAAABBBBBBBBAAAAAAAABBBBBBBB
```

所以建议先实现：

```text
print + yield → 验证调度逻辑
```

再实现：

```text
timer interrupt → 强制抢占
```

## 十三、最合理的实现顺序

不要按照模块列表一次性全部编写，而要按照依赖关系逐层验证。

### 阶段一：最小内核

```text
Boot → Kernel → VGA
```

验收：

```text
屏幕显示：Kernel started
```

### 阶段二：中断系统

```text
GDT → IDT → CPU异常
```

验收：

```text
主动触发断点异常
内核能够显示异常信息
系统不重启
```

### 阶段三：硬件时钟

```text
PIC → PIT → Timer Handler
```

验收：

```text
Tick: 1
Tick: 2
Tick: 3
```

此时还不切换任务。

### 阶段四：进入 Ring 3

```text
GDT用户段
+ TSS
+ 用户代码页
+ 用户栈
+ iretq
```

验收：

```text
一个Ring 3任务成功运行
```

它暂时不能输出。

### 阶段五：系统调用

```text
Ring 3 → int 0x80 → Ring 0 → VGA
```

验收：

```text
Ring 3任务通过syscall打印：
User task started
```

### 阶段六：两个任务主动切换

```text
Task A → print → yield
Task B → print → yield
```

验收：

```text
A0 B0 A1 B1 A2 B2
```

### 阶段七：时钟抢占

```text
PIT → Scheduler → Context Switch
```

删除任务对 `yield` 的依赖。

验收：

```text
两个任务即使不主动让出CPU
也都会获得运行机会
```

## 十四、第一版不需要做什么

第一版两个任务可以：

```text
共享同一套页表
共享用户代码区域
拥有不同用户栈
拥有不同内核栈
```

它们有 Ring 0/Ring 3 权限区分，但还没有完整进程隔离。

等核心框架跑通，再增加：

```text
每个进程独立页表
        ↓
独立虚拟地址空间
        ↓
ELF程序加载
        ↓
fork / exec
        ↓
真正的用户程序
```

所以你的第一版准确来说是：

> 一个支持两个 Ring 3 用户任务、系统调用和抢占式调度的微型内核。

这已经抓住了 Linux 0.00 最核心的结构。
