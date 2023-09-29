---
title: CSAPP笔记
date: 2023-01-01 16:51:33
tags: 
- 操作系统
- CSAPP
categories:
- 计算机基础
---


# 1、计算机系统漫游

## 信息就是位+上下文

整个计算机系统中的所有信息都可以用一串比特串的形式表示，区分不同的数据对象的唯一方法就是我们读到的这些对象时的上下文（context）

## 程序被其他程序翻译成不同的格式

一个高级语言写的程序（这里以C语言为例），从源代码到最终的机器中的可执行文件会经过一下几个阶段：

1. 预处理阶段，处理源码的中的预处理语句（比如说#include）
2. 编译阶段，将c语言编译成汇编语言
3. 汇编阶段，把汇编语言翻译成机器指令
4. 链接阶段，把在程序中调用的库函数的相关文件引入

## 了解编译系统如何工作室大有益处的

促使程序员要知道编译系统是如何工作的原因：

1. 优化程序性能，我们需要对汇编语言以及编译器如何将不同的C语句转化为汇编语言有基本的了解
2. 理解链接时出现的错误
3. 避免安全漏洞，其中一个比较典型的是缓冲区溢出错误

## 处理器读并解释存储在存储器中的指令

一个计算机系统的硬件主要由以下几个部分组成：

1. 总线，负责携带信息字节并在各个部件之间进行传输
2. I/O设备，负责系统和外界的联系
3. 主存，运行程序时存放程序以及程序中含有的数据
4. 处理器，解释（或执行）存储在主存中的指令

执行一个hello程序的过程有一下几部：

- shell程序执行其指令，等待我们输入命令
- 我们输入完命令以后，shell执行一系列指令，将hello程序的代码以及其数据加载到主存中
- 处理器开始执行hello程序中的机器指令，将“hello world”输出到屏幕上

## 高速缓存

我们使用的存储设备通常是较大的存储设备比较小的存储设备运行地要慢，所以就使用一个较小的速度较快的存储设备作为CPU和Main Memory交换数据的桥梁，这个设备就是高速缓存（cache memories）

## 形成层次结构的存储结构

在计算机系统的存储设备被组织成了一个金字塔形的存储层次模型，其中从上到下，设备速度越来越慢，空间越来越大，每字节的造价越来越便宜。

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_24_1516786032387.jpg)](https://data2.liuin.cn/story-writer/2018_1_24_1516786032387.jpg)

## 操作系统管理硬件

操作系统可以看成是一个应用程序和硬件之间的一个软件，其有两个基本功能： 防止硬件被失控的程序滥用； 为应用程序提供控制硬件的简单一致的方法

### 进程

- **进程**是操作系统对正在运行的程序的一种抽象，在一个系统中可以运行多个进程，这些进程对外表现好像是独占硬件。

  而**并发**运行，则是说一个进程的指令和另一个进程的指令是交错执行的。

  一个CPU看上去都像是在并发地执行多个进程，这是通过处理器在进程间切换来实现的。操作系统实现这种交错执行的机制称为**上下文切换（context switch）**。

- **上下文**：操作系统保持跟踪进程运行所需的所有**状态**信息。这种状态，也就是**上下文**。

  在任何一个时刻，单处理器系统都只能执行一个进程的代码。当操作系统决定要把控制权从当前进程转移到某个新进程时，就会进行**上下文切换**，即保存当前进程的上下文、恢复新进程的上下文，然后将控制权传递到新进程。新进程就会从它上次停止的地方开始。

- **内核（kernel）**：从一个进程到另一个进程的转换是由操作系统**内核**管理的。内核是操作系统代码常驻主存的部分。

  当应用程序需要操作系统的某些操作时，它就执行一条特殊的**系统调用（system call）**指令，将控制权传递给内核。然后内核执行被请求的操作并返回应用程序。

  注意：内核不是一个独立的进程。相反，它是系统管理全部进程所用代码和数据结构的集合。

  ![image-20230101124914726](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230101124914726.png)

### 线程

一个进程实际上可以由多个称为**线程**的执行单元组成，每个线程都运行在进程的上下文环境中，并共享同样的代码和全局数据。

因为线程一般来说都比进程更高效。当有多处理器可用的时候，多线程也是一种使得程序可以运行得更快的方法。

### 虚拟存储器

给进程提供的一个好像自己独占主存的假象，对于进程的所使用的虚拟存储器可以分成一下几个部分：

- 程序代码和数据
- 堆，可以动态扩展或者收缩，供像malloc和free这样的C语言中的库进行调用
- 共享库
- 栈，可以动态扩展或者收缩，用于编译器的函数调用
- 内核虚拟存储器

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_24_1516786535550.jpg)](https://data2.liuin.cn/story-writer/2018_1_24_1516786535550.jpg)

### 文件

文件可以看成字节序列，每一个I/O设备从本质上来看都可以看成是文件

------

## 并发和并行

- **并发（concurrency）**：是一个通用的概念，指一个同时具有多个活动的系统
- **并行（parallelism）**：用并发来使一个系统运行得更快。

### 线程级并发

- 构建在进程这个抽象之上，我们能够设计出同时有多个程序执行的系统，这就导致了并发。

  传统意义上，这种并发执行只是**模拟**出来的，是通过使一台计算机在它正在执行的进程间**快速切换**来实现的。

  这种并发形式允许多个用户同时与系统交互。

  在以前，即使处理器必须在多个任务间切换，大多数实际的计算也都是由一个处理器来完成的。这种配置称为**单处理器系统**。

- 当构建一个由单操作系统内核控制的多处理器组成的系统时，就得到了一个**多处理器系统**。

  随着**多核**处理器和**超线程（hyperthreading）**的出现，这种系统才变得常见。

  ![image-20230101130430660](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230101130430660.png)

  - **多核**处理器：是将多个CPU（称为"核"）集成到一个集成电路芯片上

    ![image-20230101130605206](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230101130605206.png)

  - **超线程**：也称为同时多线程（simultaneous multi-threading），是一项允许一个CPU执行多个控制流的技术。

    常规的处理器需要大约20000个时钟周期做不同线程间的转换，而超线程的处理器可以在单个周期的基础上决定要执行哪一个线程。这使得CPU能够更好地利用它的处理资源。例如Intel Core i7处理器可以让每个核执行两个线程，所有一个4核的系统实际上可以并行地执行8个线程。

  多处理器的使用可以从两方面提高系统性能：

  - 它减少了在执行多个任务时模拟并发的需要
  - 它可以使应用程序运行得更快

### 指令级并行

在较低的抽象层次上，现代处理器可以同时执行多条指令的属性称为**指令级并行**。

在**流水线（pipelining）**中，将执行一条指令所需要的活动划分成不同的步骤，将处理器的硬件组织成一系列的阶段，每个阶段执行一个步骤。这些阶段可以并行地操作，用来处理不同指令的不同部分。

如果处理器可以达到比一个周期一条指令更快的执行速率，就称之为**超标量（super-scalar）**处理器

### 单指令、多数据并行

许多现代处理器拥有特殊的硬件，运行一条指令产生多个可以并行执行的操作，这种方式称为**单指令、多数据**，即SIMD并行。

# 2、信息的表示和处理

## 信息存储

大部分计算机使用8位的块（或者字节）来作为最小的可寻址的存储器单元。机器级程序将存储器视为一个非常大的字节数组，称之为虚拟存储器。存储器中的每一个字节由唯一的一个地址（address）来标识，所有可能地址的集合称之为虚拟地址空间（virtual address space）

![image-20221217094632961](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217094632961.png)

**位模式**

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217094744479.png" alt="image-20221217094744479" style="zoom: 50%;" />

### 十六进制表示法

一个字节有8位，用二进制表示就是 \00000000(2)-11111111(2) ，用十进制表示是0(10)-256(10)，用十六进制表示是00(16)-FF(16)

![image-20221217094854365](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217094854365.png)

![image-20221217095119709](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217095119709.png)

#### 十六进制和二进制之间的转换

![image-20221217095225364](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217095225364.png)

![image-20221217095453439](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217095453439.png)

#### 十六进制和十进制之间的转换

![image-20221217095718981](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217095718981.png)

### 字

每台计算机都有一个字长（word size），指明整数和指针数据的标称大小（nominal size），字长决定系统中最重要的参数就是虚拟地址空间的最大大小

![image-20221217102219953](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217102219953.png)

![image-20221217102236656](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217102236656.png)

### 数据大小

计算机和编译器使用不同的方式来编码数字，比如说不同长度的整数和浮点数，从而支持多种数据格式
[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_24_1516797063776.jpg)](https://data2.liuin.cn/story-writer/2018_1_24_1516797063776.jpg)

程序员应该力图使他们的程序在不同的计算机和编译器上可移植，可移植的其中一个方面就是**使程序对不同的数据类型的确切大小不那么敏感**

### 寻址和字节顺序

对于跨多个字节的程序对象，我们必须建立两个规则：这个对象的地址是什么；我们怎样在存储器中对这些字节进行排序

> 小端法
> 从低有效字节到高有效字节的顺序存储对象

> 大端法
> 从高有效字节到低有效字节的顺序存储对象

对于一个十六进制的数0x01234567：
![image-20221217102625757](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217102625757.png)

几种机器所使用的字节顺序会成为问题的情况：

- 在不同类型的机器之间通过网络传送二进制数据。
- 当阅读表示整数数据的字节序列时，字节顺序也很重要。
- 当编写规避正常的类型的系统时。

下面这段代码打印程序对象的字节表示

**show-bytes.c**

```c
#include "stdio.h"

typedef unsigned char *byte_pointer;

void show_bytes(byte_pointer start, size_t len) {
    size_t i;
    for (i = 0; i < len; ++i)
        printf(" %.2x", start[i]);
    printf("\n");
}

void show_int(int x) {
    show_bytes((byte_pointer) &x, sizeof(int));
}

void show_float(float x) {
    show_bytes((byte_pointer) &x, sizeof(float));
}

void show_pointer(void *x) {
    show_bytes((byte_pointer) &x, sizeof(void *));
}

void test_show_bytes(int val) {
    int ival = val;
    float fval = (float) val;
    int *pval = &val;
    show_int(ival);
    show_float(fval);
    show_pointer(pval);
}
int main(){
    test_show_bytes(12345);
}
```



### 表示字符串

C中的字符串被编码为一个以null（其值为0）字符结尾的字符数组、

![image-20221217104604149](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217104604149.png)

### 表示代码

不同的机器类型使用的是不同的并且不兼容的指令和编码方式，所以最后的二进制代码是有很强的平台依赖性的，其很少能够在不同的操作系统和机器之间进行移植

![](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217104815460.png)

### C中的位级运算

包括按位与、按位或、异或运算，位运算的一个常见应用就是实现掩码运算（从一个字中选出一个组位）

![image-20221217105017832](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217105017832.png)

### C中的逻辑运算

包括逻辑或、逻辑与、逻辑非
逻辑运算表达式中，第一个参数能够确定表达式的结果的时候，逻辑运算表达式就不会计算第二个参数的值

![image-20221217105121887](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217105121887.png)

### C中的移位运算

向左移位运算右端补0
向右移位运算包含两种形式：逻辑移位（左端补0）和算数移位（左端补最高有效位）

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217105232699.png" alt="image-20221217105232699" style="zoom:50%;" />

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217105303578.png" alt="image-20221217105303578" style="zoom:50%;" />

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217105800347.png" alt="image-20221217105800347" style="zoom:50%;" />

------

## 整数表示

### 整型数据类型

![image-20221217115756654](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217115756654.png)

------

### 无符号和有符号数（补码数值）

#### 无符号数

假设一共有 w 位，每个介于 0 ~ 2^w -1 之间的数都有**唯一**一个 w 位的值编码，即这个函数映射是一个**双射**。

![image-20221217120149109](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217120149109.png)

![image-20221217120019310](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217120019310.png)

**无符号数最大值**

![image-20221217120823054](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217120823054.png)

#### 有符号数

最常见的有符号数的计算机表示方法就是补码形式。补码表示的是字的最高有效位解释为负权(negative weight)。

![image-20221217120504969](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217120504969.png)

![image-20221217120655399](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217120655399.png)

**有符号数最大值**

![image-20221217120842075](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217120842075.png)

**有符号数最小值**

![image-20221217120855176](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217120855176.png)

**特别地，-1的二进制表示全为1**

![image-20221217121051885](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217121051885.png)

------

### 有符号数和无符号数之间的转换

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_24_1516799175770.jpg)](https://data2.liuin.cn/story-writer/2018_1_24_1516799175770.jpg)

### C中的有符号数和无符号数

C 语言允许无符号数和有符号数之间的转换。转换的原则是底层的位表示保持不变。

![image-20221217125433606](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217125433606.png)

当执行一个运算时，如果它的一个运算数时有符号的而另一个是无符号的，那么C语言会隐式地将有符号参数强制类型转换为无符号数，并假设这两个数都是非负的，来执行这个运算。

例如：

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217130121541.png" alt="image-20221217130121541" style="zoom:50%;" />

------

#### 扩展一个数字的位表示



**较小数据类型转较大数据类型**

**零扩展**： 将一个无符号数转换为一个更大的数据类型，在开头加0

![](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217130257902.png)

**符号扩展**： 将一个有符号数转化为一个更大的数据类型，在开头加最高有效位

![image-20221217130403449](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217130403449.png)

------

#### **截断数字**

**较大数据类型转较小数据类型**

截断一个数字可能会改变它的值——溢出的一种形式

**无符号数截断**

![image-20221217131138107](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217131138107.png)

**有符号数截断**

![image-20221217131335981](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221217131335981.png)

### 有关有符号数和无符号数的建议

有符号数到无符号数的隐式强制类型转换导致了某些非直观的行为。而这些非直观的特性经常导致程序错误，并且这种包含隐式强制类型转换细微差别的错误很难被发现。因为这种强制类型转换是在代码中没有明确指示的情况下发生的，程序员经常忽视了它的影响。

避免这类错误的一种方法就是绝**不使用无符号数**。实际上，除了 C 以外，很少有语言支持无符号整数。

------

## 整数运算

### 无符号加法

**溢出**

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218101347542.png" style="zoom: 33%;" />



<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218101443684.png" alt="image-20221218101443684" style="zoom:33%;" />每个数都能表示为 w 位无符号数字。如果计算它们的和，表示这个和可能需要 w + 1位。无符号运算可以被视为一种模运算形式。
[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_24_1516800136471.jpg)](https://data2.liuin.cn/story-writer/2018_1_24_1516800136471.jpg)

**无符号逆元**

![image-20221218102550708](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218102550708.png)

### 补码加法

必须确定当结果太大(为正)或者太小(为负)时，应该做些什么。
[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_24_1516800211055.jpg)]()

![image-20221218101809154](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218101809154.png)

**正溢出**

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218102002971.png" alt="image-20221218102002971" style="zoom:33%;" />

**负溢出**

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218102051511.png" alt="image-20221218102051511" style="zoom:33%;" />

**补码逆元**

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218102713372.png" alt="image-20221218102713372" style="zoom:33%;" />

### 无符号乘法

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218110610433.png" alt="image-20221218110610433" style="zoom: 50%;" />

### 补码乘法

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218110715744.png" alt="image-20221218110715744" style="zoom:50%;" />

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_24_1516800273052.jpg)](https://data2.liuin.cn/story-writer/2018_1_24_1516800273052.jpg)

### 乘以常数

在大多数机器上，整数乘法指令相当慢，需要 10 个或者更多的时钟周期，然而其他整数运算(例如加法、减法、位级运算和移位)只需要 1 个时钟周期。因此，编译器使用了一项重要的优化，试着用移位和加法运算的组合来代替乘以常数因子的乘法。

**乘以2的幂**

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218111431794.png" alt="image-20221218111431794" style="zoom:50%;" />

![image-20221218111418421](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218111418421.png)

例子：

![image-20221218111726428](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218111726428.png)

------

### 除以2的幂

在大多数机器上，整数除法要比整数乘法更慢——需要 30 个或者更多的周期。除以 2 的幂也可以用移位运算右移来实现，无符号和补码数分别使用逻辑移位和算术移位来达到目的。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218111827294.png" alt="image-20221218111827294" style="zoom:50%;" />

无符号数采用**逻辑右移**，有符号数采用**算数右移**

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218111904413.png" style="zoom:50%;" />

**向0舍入**

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218112202643.png" alt="image-20221218112202643" style="zoom:50%;" />

**无符号除法推导**

- <img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218112530917.png" alt="image-20221218112530917" style="zoom: 33%;" />
- <img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218112601460.png" alt="image-20221218112601460" style="zoom:33%;" />
- <img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218112755561.png" alt="image-20221218112755561" style="zoom:33%;" />
- 得证：`x/2^k == x>>k`

**补码除法**

 ![image-20221218113433430](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218113433430.png)

**偏置**

![image-20221218113528519](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221218113528519.png)

------

## 浮点

### 二进制小数

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_24_1516800421224.jpg)](https://data2.liuin.cn/story-writer/2018_1_24_1516800421224.jpg)

### IEEE浮点表示

用 V = (-1)^s *M* 2^E 的形式来表示一个数：

- 符号(sign) s决定这个数是负数(s=1)还是正数(s=0)，对于数值 0 的符号位解释作为特殊情况处理。
- 尾数(significand) M 是一个二进制小数，它的范围是 1 ~ 2 - ε，或者是 0 ~ 1 - ε。
- 阶码(exponent) E 的作用是对浮点数加权，这个权重是 2 的 E 次幂(可能是负数)

将浮点数的位表示划分为三个字段，分别对这些值进行编码：

- 一个单独的符号位 s 直接编码符号 s。
- k 位的阶码字段 exp = e(k-1)…e(1)e(0) 编码阶码 E。
- n 位小数字段 frac = f(n-1)…f(1)f(0) 编码尾数 M，但是编码出来的值也依赖于阶码字段的值是否等于 0。

![image-20221219102228857](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221219102228857.png)

**浮点类型**

- **Normalized Values（规格化的值）**
- **Denormalized Values（非规格化的值）**
- **Special Values（特殊值）**

![image-20221219102546234](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221219102546234.png)

#### **规格化的值**

阶码域不全为0也不全为1

- 阶码字段

  `E = e - bias     bias = (2<<k-1)-1`

  ![image-20221219102717344](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221219102717344.png)

- 小数字段

  `M = 1 + f`

  ![image-20221219102942611](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221219102942611.png)

8位浮点举例

![image-20221219104250094](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221219104250094.png)

#### 非规格化的值

阶码域全为0

`E = 1 - bias`

`M = f`

![image-20221219103432037](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221219103432037.png)

8位浮点举例

![image-20221219103942144](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221219103942144.png)

#### 特殊值

阶码域全为1

![image-20221219103629475](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221219103629475.png)

![image-20221219104324130](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221219104324130.png)

**int转float**

![image-20221219110932795](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221219110932795.png)

### 舍入

因为表示方法限制类浮点数的范围和精度，浮点运算只能近似地表示实数运算。因此，对于值 x，我们一般想用一种系统的方法，能够找到“最接近的”匹配值，这就是舍入运算的任务。

常见的舍入方式有：**向偶数舍入、向零舍入、向下舍入、向上舍入**
[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_24_1516800599058.jpg)](https://data2.liuin.cn/story-writer/2018_1_24_1516800599058.jpg)

![image-20221219113018146](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221219113018146.png)

### 浮点运算

**浮点加法不具有结合性**。**浮点乘法在加法上不具备分配性**。对于科学计算程序员和编译器编写者来说，这是很严重的问题，即使为了在三维空间中确定两条线是否交叉而写代码这样看上去很简单的任务，也可能成为一个很大的挑战。

### C语言的浮点数

float 和 double。在 int、float 和 double 格式之间进行强制类型转换时，程序改变数值和位模式的原则如下(假设 int 是 32 位的)：

- 从 int 转换成 float，不会溢出，可能被舍入。
- 从 int 或 float 转换成 double，能够保留精确的数值。
- 从 double 转换成 float，可能溢出成为正无穷或负无穷，也可能被舍入。
- 从 float 或者 double 转换成 int，值会向零舍入。例如 1.999 将被转换成 1。或者发生溢出

![image-20221219113445892](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221219113445892.png)

------

# 3、程序的机器级表示

高级语言通过编译变成汇编语言，汇编代码则与特定的机器密切相关。汇编代码中包含了管理存储器（memory）和执行计算的低级指令的一些细节（写高级程序的人员一般不需要考虑的）。编译器基于编程语言的原则、目标机器的指令集和操作系统遵循的规则，经过一系列的阶段产生机器代码。

## 程序编码

正如之前所说的，从源代码到机器可执行代码会经过以下几个过程：预处理-> 编译器-> 汇编器 -> 链接器

### 机器级代码

对于机器级代码来说，有两种抽象非常重要。第一种是机器级程序的格式和行为，定义为**指令集体系结构**(Instruction set architecture, ISA)，它定义了处理器状态、指令的格式，以及每条指令对状态的影响。第二种抽象是，机器级程序使用的存储器地址是虚拟地址，提供的存储器模型看上去是一个非常大的字节数组。

汇编代码和原始的C代码相差比较大，一些通常对C语言程序员隐蔽的处理器状态是可见的：

- 程序计数器(PC，用 %eip 表示)指示将要执行的下一条指令在存储器中的地址。
- 整数寄存器文件包含 8 个命名的位置，分别存储 32 位的值。这些寄存器可以存储地址(对应于 C 语言的指针)或证书数据。有的寄存器被用来记录某些重要的程序状态，而其他的寄存器则用来保存临时数据。
- 条件码(codition code)寄存器保存着最近执行的算术或逻辑指令的状态信息。它们用来实现控制或数据流中的条件变化。
- 一组浮点寄存器存放浮点数据。

C语言中的聚焦数据类型，例如数组和结构，在汇编中是用连续的字节表示的。汇编代码不区分有符号或无符号整数，不区分各种类型的指针，甚至不区分指针和整数。

程序存储器(program memory)包含：程序的可执行机器代码，操作系统需要的一些信息，用来管理过程调用和返回的运行时栈，以及用户分配的存储器块。同时OS负责管理虚拟地址空间，将虚拟地址转换为物理地址。

一条指令只执行一个非常基本的操作。例如，将存放在寄存器中的两个数字相加，在存储器和寄存器之间传送数据，或是条件分支转移到新的指令地址。编译器必须产生这些指令的序列，从而实现(像算术表达式求值、循环或过程调用和返回这样的)程序结构。

### 代码示例

C代码 -> 汇编代码：mstore.c -> mstore.s

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221221092402208.png" alt="image-20221221092402208" style="zoom:50%;" />

C代码 -> 机器代码：mstore.c -> mstore.o



<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221221094609835.png" alt="image-20221221094609835" style="zoom:50%;" />

机器代码 -> 汇编代码 ： 反汇编

`linux> objdump -d mstore.o`

![image-20221221094807189](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221221094807189.png)

### 关于格式的注解

所有以 . 开头的行都是指导汇编器和链接器的命令（对程序的解释），我们通常可以忽略这些行。

### 数据格式

![image-20221221093404449](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221221093404449.png)

Intel 用术语"**字（word）**"表示16位数据类型。因此，称32位数为"**双字（double words）**"，称64位数为"**四字（quad words）**"

浮点数主要有两种形式：

- **单精度（4字节）**值，对应 float
- **双精度（8字节）**值，对应 double

大多数GCC生成的汇编代码指令都有一个字符的后缀，表明操作数的大小。

例如

- movb : Move byte 传送字节
- movw : Move word 传送字
- movl : Move double word 传送双字
- movq : Move quad word 传送四字

------

## 访问信息

一个 x86-64 的中央处理单元（CPU）包含·一组16个存储 64 位值的**通用目的寄存器**。这些寄存器用来存储整数数据和指针。

下图显示了这16个寄存器：它们的名字都以 %r 开头

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221221095717493.png" alt="image-20221221095717493" style="zoom:50%;" />

- 最初的 8086 中有8个16位的寄存器，即 %ax 到 %sp
- 扩展到 IA32 架构时，这些寄存器也扩展成32为寄存器，标号从 %eax 到 %esp
- 扩展到 x86-64 后，原本的8个寄存器扩展成64位，标号从 %rax 到 %rsp
- 除此之外还增加了8个新的寄存器，它们的标号是按照新的命名规则制定的：从 %r8 到 %r15

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221221100921126.png" alt="image-20221221100921126" style="zoom:50%;" />

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221221101212566.png" alt="image-20221221101212566" style="zoom:50%;" />

### 操作数指示符

大多数指令有一个或多个**操作数(operand)**，指示出执行一个操作中要引用的源数据值，以及放置结果的目标位置。操作数可能被分为三种类型：

- **立即数(immediate)**，也就是常数值

  立即数的书写方式是'$'后面跟一个用标准C表示法表示的整数，比如 $-577 或 $0x1F

- **寄存器(register)**，表示某个寄存器的内容，比如 %rax

- **内存(memory)引用**，它会根据计算出来的地址访问某个存储器位置，下图中的 (%rdi) 表示一个内存引用

![image-20221221102524589](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221221102524589.png)

将内存看成一个很大的字节数组。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221221102848159.png" alt="image-20221221102848159" style="zoom:50%;" />

有多种不同的**寻址模式**，允许不同形式的内存引用，表中底部用语法**`Imm( rb , ri , s )`**表示的是最常用的形式。

- 这里 s 必须是1、2、4或者8，char数组为1，int数组为4，doble数组为8
- 基址和变址寄存器都必须是64位寄存器。
- 有效地址被计算为 **`Imm + R[rb] + R[ri] · s`**

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_25_1516883245706.jpg)](https://data2.liuin.cn/story-writer/2018_1_25_1516883245706.jpg)

### 数据传送指令

源操作数指定的值是一个立即数，存储在寄存器中或者内存中。目的操作数指定一个位置，要么是一个寄存器，要么是一个内存地址。

x86-64 加了一条限制，传送指令的两个操作数不能都指向内存地址。

将一个值从一个内存位置复制到另一个内存位置需要两条指令：

1. 将源值加载到寄存器中
2. 将该寄存器值写入目的位置

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221221103841194.png" alt="image-20221221103841194" style="zoom:50%;" />

例子：

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221221104312348.png" alt="image-20221221104312348" style="zoom:50%;" />

常规的 movq 指令只能以表示为 32 位补码数字的立即数作为源操作数，然后把这个值符号扩展得到 64 位的值，放到目的位置。

movabsq 指令能够以任意 64 位立即数值作为源操作数，并且只能以寄存器作为目的。

![image-20221221104635379](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221221104635379.png)

- 源操作数与目的操作数大小一致

  - 当 movl 的目的操作数是寄存器时，它会把该寄存器的高 4 字节设置为 0，即任何位寄存器生成 32 位值的指令都会把该寄存器的高位部分置为0

- 源操作数的数位小于目的操作数

  - 零扩展传送指令，z是zero的缩写

    ![image-20221221105341464](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221221105341464.png)

  - 符号位扩展传送指令，s是sign的缩写

    ![image-20221221105912319](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221221105912319.png)

  可以发现符号扩展比零扩展多一条 4 字节到 8 字节的扩展指令，零扩展中没有，因为这种情况的数据传送可以使用 mvl 指令实现

  cltq 指令效果与上图中这条指令效果一致，只不过编码更紧凑一些

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_25_1516883311416.jpg)

### 数据传送示例

![image-20221223144344903](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221223144344903.png)

C语言中所谓的"指针"其实就是地址

### 压入和弹出栈数据

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221223145046728.png" alt="image-20221223145046728" style="zoom:50%;" />

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221223145133057.png" alt="image-20221223145133057" style="zoom:50%;" />

![image-20221223145511569](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221223145511569.png)



------

## 算术和逻辑操作

给出的每个指令类都有对字节、字和双字数据进行操作的指令。这些操作被分为四组：加载有效地址、一元操作、二元操作和移位。

### 加载有效地址

加载有效地址(load effective address)指令 leal 实际上是 movl 指令的变形。它的指令形式是从存储器读数据到寄存器，但实际上它根本就没有引用存储器。它的第一个操作数看上去是一个存储器引用，但该指令并不是从指定的位置读入数据，而是将有效地址写入到目的操作数。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224111606664.png" alt="image-20221224111606664" style="zoom:50%;" />

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224111831578.png" alt="image-20221224111831578" style="zoom:50%;" />

比例因子只能为1，2，4，8，因此需要将12分解

![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_25_1516883471796.jpg)

### 一元和二元操作

一元操作：一个操作数既是源又是目的

![image-20221224111937890](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224111937890.png)

二元操作：第二个操作数既是源又是目的。源操作数是第一个，目的操作数是第二个

第一个操作数可以是立即数、寄存器或内存地址，第二个操作数可以是寄存器或内存地址

![image-20221224112234523](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224112234523.png)

例子：

![image-20221224114137420](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224114137420.png)

### 移位操作

先给出移位的量，第二项给出的是要移位的数

![image-20221224114231526](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224114231526.png)

对于移位量k，可以是一个立即数，或者是放在寄存器cl中的数

![image-20221224115018885](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224115018885.png)

例子：

![image-20221224115133792](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224115133792.png)

![image-20221224115246239](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224115246239.png)

**特殊的算术操作**

![image-20221224115344432](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224115344432.png)



------

## 控制

![image-20221224121913752](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224121913752.png)

### 条件码

CPU 维护着一组单个 bit 的条件码(condition code) 寄存器，他们描述了最近的算术或逻辑操作的属性

![image-20221224122107553](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224122107553.png)

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_25_1516883691695.jpg)](https://data2.liuin.cn/story-writer/2018_1_25_1516883691695.jpg)

- CF：进位标志。最近的操作使最高位产生了进位。可用来检查无符号操作的溢出

  ![image-20221224122254959](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224122254959.png)

- ZF：零标志。最近的操作得出的结果为0

  ![image-20221224123209859](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224123209859.png)

- SF：符号标志。最近的操作得到的结果为负数

- OF：溢出标志。最近的操作导致一个补码溢出——正溢出或负溢出

![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_25_1516883745587.jpg)

cmp指令和test指令只设置条件码而不改变任何其他寄存器

![image-20221224125434228](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224125434228.png)

### 访问条件码

![image-20221224125907442](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224125907442.png)

![image-20221224130004274](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224130004274.png)

![image-20221224130155430](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224130155430.png)

两种最常见的访问条件码的方法不是直接读取，常用的使用方法有三种：

- 可以根据条件码的某个组合，将一个字节设置为 0 或者 1
- 可以条件跳转到程序的某个其他的部分
- 可以有条件地传送数据

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_25_1516883932824.jpg)](https://data2.liuin.cn/story-writer/2018_1_25_1516883932824.jpg)

### 跳转指令

![image-20221224130505067](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224130505067.png)

![image-20221224130806102](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224130806102.png)

跳转指令会导致执行切换到程序中的一个全新的位置

**jump指令**

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_25_1516884044007.jpg" alt="enter description here"  />

条件传送指令

![image-20221224131141921](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224131141921.png)

### 翻译条件分支

将条件表达式和语句从 C 语言翻译成机器代码，最常用的方式是结合有条件和无条件跳转

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_25_1516884153857.jpg)](https://data2.liuin.cn/story-writer/2018_1_25_1516884153857.jpg)

### 循环

汇编中没有相应的循环指令，将条件测试和跳转组合起来可以实现循环的效果

![image-20221224131505824](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224131505824.png)

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_25_1516884258395.jpg)](https://data2.liuin.cn/story-writer/2018_1_25_1516884258395.jpg)

### switch语句

通过一种称为跳转表（jump table）的数据结构使得实现更加高效，相比使用一组很长的if-else语句，使用跳转表的优点是执行开关语句的时间和开关情况（switch cases）的数量无关。因此在处理多重分支时，与一组很长的 if-else 相比， switch 的执行效率要高

一般在开关情况数量比较多，并且值的范围跨度比较小的时候使用跳转表

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224131711356.png" alt="image-20221224131711356" style="zoom: 67%;" />

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221224131946790.png" alt="image-20221224131946790" style="zoom:67%;" />

------

## 过程

一个过程调用包括将数据和控制从代码的一部分传递到另一部分。另外，它还必须在进入时为过程的局部变量分配空间，并在退出时释放这些空间。大多数机器，包括 IA32，只提供转移控制到过程和从过程转移出控制这种简单的指令。数据传递、局部变量的分配和释放通过操纵程序栈来实现。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225101303132.png" alt="image-20221225101303132" style="zoom:50%;" />

### 栈帧结构

当 x86-64 过程需要的存储空间超出寄存器能够存放的大小时，就会在栈上分配空间。这个部分称为过程的**栈帧（stack frame）**

![image-20221225101233627](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225101233627.png)

当Q在执行时，P以及所有向上追溯到P的调用链中的过程，都是暂时被挂起的

当过程P调用过程Q时，会把返回地址压入栈中，指明当Q返回时，要从P程序的哪个位置继续执行

![image-20221225101728155](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225101728155.png)

[<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_25_1516884747521.jpg" alt="enter description here" style="zoom:200%;" />](https://data2.liuin.cn/story-writer/2018_1_25_1516884747521.jpg)

### 转移控制

将控制从函数 P 转移到函数 Q 只需要简单地把程序计数器设置为 Q 的代码的起始位置。不过，当稍后从 Q 返回的时候，处理器必须记录好它需要继续P的执行的代码位置。

在 x86-64 机器中，这个信息是用指令 `call Q` 调用过程 Q 来记录的

- <img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225103245539.png" alt="image-20221225103245164" style="zoom:50%;" />
- ![image-20221225103211005](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225103211005.png)
- ![image-20221225103314775](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225103314775.png)

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_25_1516884832280.jpg)](https://data2.liuin.cn/story-writer/2018_1_25_1516884832280.jpg)

### 数据传送

如果一个函数有大于6个整型参数，超过6个的部分就要通过栈来传递.

参数 1 - 6 的传递可以使用对应的寄存器：

![image-20221225103822225](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225103822225.png)

参数 7 - n 需要用到栈来传递：

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225103917531.png" alt="image-20221225103917531" style="zoom:33%;" />

通过栈传递参数时，所有的数据大小都向 8 的倍数对齐

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225104125659.png" alt="image-20221225104125659" style="zoom:50%;" />

寄存器的使用是有特殊顺序的，寄存器使用的名字取决于要传递的数据类型的大小

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225104454080.png" alt="image-20221225104454080" style="zoom:50%;" />

### 栈上的局部存储

有些时候，局部数据必须存放在内存中：

- 寄存器不足够存放所有的本地数据
- 对一个局部变量使用地址运算符 '&' ，因此必须能够为它产生一个地址
- 某些局部变量是数组或结构，因此必须能够通过数组或结构引用北被访问到

一般来说，过程通过减小栈指针在栈上分配空间。分配的结果作为栈帧的一部分，标号为"局部变量"

![image-20221225104812063](C:\Users\yumo\AppData\Roaming\Typora\typora-user-images\image-20221225104812063.png)



![image-20221225104755966](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225104755966.png)

### 寄存器中的局部存储空间

程序寄存器组是唯一能够被所有过程共享的资源。虽然在给定时刻只能有一个过程是活动的，但是我们必须保证当一个过程调用另一个过程时，被调用者不会覆盖某个调用者稍后会使用的寄存器的值。

- 寄存器 %rbx、%rbp和%r12~%r15 被划分为**被调用者保存寄存器**（callee save）。

  当过程 P 调用过程 Q 时，Q 必须保存这些寄存器的值，保证它们的值在 Q 返回到 P 时与 Q 被调用时是一样的。

- 所有其他的寄存器，除了栈指针%rsp，都被划分为**调用者保存寄存器**（caller save）。

  这就意味着任何函数都能修改它们：过程 P 在某个此类寄存器中有局部数据，然后调用过程 Q 。因为 Q 可以随意修改这个寄存器，所以在调用之前首先保存好这个数据是 P（调用者）的责任。

![image-20221225110409785](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225110409785.png)

### 递归过程

递归调用一个函数本身与调用其他函数是一样的。栈规则提供了一种机制，每次函数调用都用它自己私有的状态信息（保存的返回位置和被调用者保存寄存器的值）存储空间。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225110529099.png" alt="image-20221225110529099" style="zoom:50%;" />

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225110621803.png" alt="image-20221225110621803" style="zoom:50%;" />

------

## 数组的分配和访问

C 语言一个不同寻常的特点是可以产生指向数组中元素的指针，并对这些指针进行运算。在机器代码中，这些指针会被翻译成地址计算。

优化编译器非常善于简化数组索引所使用的地址计算。不过这使得 C 代码和它机器代码的翻译之间的对应关系有些难以理解。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225111042364.png" alt="image-20221225111042364" style="zoom:50%;" />

### 指针运算

C 语言允许对指针进行运算，而计算出来的值会根据该指针引用的数据类型的大小进行伸缩。也就是说，如果 p 是一个指向类型为 T 的数据的指针，p 的值为 xp，那么表达式 p+i 的值为 xp+L*i，这里 L 是数据类型 T 的大小。

![image-20221225111151232](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225111151232.png)

![image-20221225111322291](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225111322291.png)

### 嵌套数组

![image-20221225111509848](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225111509848.png)

**内存地址的计算**

![](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225111734482.png)

### 定长数组

![image-20221225111906165](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225111906165.png)

![image-20221225112641242](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225112641242.png)

### 变长数组

![image-20221225112952782](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225112952782.png)

------

## 异类的数据结构

### 结构（structure）

将可能不同类型的对象聚合到一个对象中。结构的各个组成部分用名字来引用。类似于数组的实现，结构的所有组成部分都存放在存储器中一段连续的区域内，而指向结构的指针就是结构第一个字节的地址。编译器维护关于每个结构类型的信息，指示每个字段(field)的字节偏移。它以这些偏移作为存储器引用指令中的位移，从而产生对结构元素的引用。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225113747101.png" alt="image-20221225113747101" style="zoom:50%;" />

### 联合（union）

提供了一种方式，能够规避 C 语言的类型系统，允许以多种类型来引用一个对象。联合声明的语法与结构的语法一样，只不过语义相差比较大。它们是用不同的字段来引用相同的存储器块。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225114518454.png" alt="image-20221225114518454" style="zoom:50%;" />

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225114748864.png" alt="image-20221225114748864" style="zoom:50%;" />

这样每个节点只要16个字节，但这样没法确定一个给定的节点到底是叶子节点还是内部节点

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225114908298.png" alt="image-20221225114908298" style="zoom:50%;" />

联合还可以用来访问不同数据类型的位模式

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225115122719.png" alt="image-20221225115122719" style="zoom:50%;" />

### 数据对齐

许多计算机系统对基本数据类型合法地址做出了一些限制，要求某种类型对象的地址必须是某个值 K(通常是 2、4、8)。这种对齐限制简化了形成处理器和存储器系统之间接口的硬件设计

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225114025127.png" alt="image-20221225114025127" style="zoom:50%;" />

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225114051806.png" alt="image-20221225114051806" style="zoom:50%;" />

另外，编译器结构的末尾可能需要一些填充，这样结构数组中的每个元素就会满足它的对齐要求

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225114252224.png" alt="image-20221225114252224" style="zoom:50%;" />

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225114434741.png" alt="image-20221225114434741" style="zoom:50%;" />

## 综合：理解指针

指针是 C 语言的一个重要特征。它们以一种统一方式，对不同数据结构中的元素产生引用。这里介绍一些指针和它们映射到机器代码的关键原则：

- 每个指针都对应一个类型。这个类型表明指针指向哪一类对象。
- 每个指针都有一个值。这个值是某个指定类型对象的地址。特殊的 NULL(0) 值表示该指针没有指向任何地方
- 指针用 & 运算符创建。这个运算符可以应用到任何 lvalue 类的 C 表达式上。
- 操作符用于指针的间接引用。其结果是一个值，它的类型与该指针的类型相关。间接引用是通过存储器引用来实现的，要么是存储到一个指定的地址，要么是从指定的地址读取。
- 数组与指针紧密联系。一个数组的名字可以像一个指针变量一样引用(但是不能修改)。数组引用与指针运算和间接引用有一样的效果。数组引用和指针运算都需要用对象大小对偏移量进行伸缩。
- 将指针从一种类型强制转换成另一种类型，只改变它的类型，而不改变它的值。强制类型转换的一个效果是改变指针运算的伸缩。来看一个例子，如果 p 是一个 char* 类型的指针，那么表达式(int)p+7 计算为 p+28, 而(int)(p+7)计算为 p+7。
- 指针也可以指向函数。这提供了一个很强大的存储和向代码传递引用的功能，这些引用可以被程序的某个其他部分调用。

## 内存越界引用和缓冲区溢出

C 对于数组引用不进行任何边界检查，而局部变量和状态信息，都存放在栈中。这两种情况结合到一起就可能导致严重的程序错误，对越界的数组元素的写操作会破坏存储在栈中的状态信息。当程序使用这个被破坏的状态，试图重新加载寄存器或执行 ret 指令时，就会出现很严重的错误。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225115543942.png" alt="image-20221225115543942" style="zoom:50%;" />

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225115638469.png" alt="image-20221225115638469" style="zoom:50%;" />

缓冲区溢出的一个更加致命的使用就是让程序执行它本来不愿意执行的函数。这是一种最常见的通过计算机网络攻击系统安全的方法。通常，输入和程序一个字符串，这个字符串包含一些可执行代码的字节编码，称为攻击代码(exploit code)，另外还有一些字节会用一个指向攻击代码的指针覆盖返回地址。那么执行 ret 指令的效果就是跳转到攻击代码。

一种攻击形式，攻击代码会使用系统调用启动一个外壳程序，给攻击者提供一组操作系统函数。另一种攻击形式是，攻击代码会执行一些未授权的任务，修复对栈的破坏，然后第二次执行 ret 指令，(表面上)正常返回给调用者。

### 对抗缓冲区溢出攻击

- **栈随机化**

  栈随机化的思想使得栈的位置在程序每次运行时都有变化

  <img src="C:\Users\yumo\AppData\Roaming\Typora\typora-user-images\image-20221225120233228.png" alt="image-20221225120233228" style="zoom:50%;" />

  采用**地址空间布局随机化（Address-Space Layout Randomization，ASLR）**，每次运行时程序的不同部分都会被加载到内存的不同区域

- **栈破坏检测**

  最近的GCC版本在产生的代码中加入了一种栈保护者（stack protector）机制，来检测缓冲区越界。

  其思想是在栈帧中任何局部缓冲区与栈状态之间存储一个特殊的金丝雀（canary）值，也称为哨兵值（guard value），是在程序每次运行时随机产生的。

  在恢复寄存器状态和从函数返回之前，程序检查这个金丝雀值是否被该函数的某个操作或者该函数调用的某个函数的某个操作改变了。如果是的，那么程序异常终止。

  <img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225121020613.png" alt="image-20221225121020613" style="zoom:50%;" />

  <img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225121121036.png" alt="image-20221225121121036" style="zoom:50%;" />

- **限制可执行代码区域**

  消除攻击者向系统中插入可执行代码的能力。一种方法是限制那些内存区域能够存放可执行代码。

  ![](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221225121243278.png)

## 小结

机器级程序和它们的汇编代码表示，与 C 程序的差别很大。在汇编语言程序中，各种数据类型之间的差别很小。程序是以指令序列来表示的，每条指令都完成一个单独的操作。部分程序状态，如寄存器和运行时栈，对程序员来说是直接可见的。

C 语言中缺乏边界检查，使得许多程序容易出现缓冲区溢出。虽然最近的运行时系统提供了安全保护，而且编译器帮助使得程序更加安全，但是这已经使许多系统容易收到入侵者的恶意攻击。

# 4、处理器体系结构

一个处理器支持的指令和指令字节编码称为它的**指令集体系结构 ISA（Instruction-set Architecture）**。这一章主要讲以Y86指令集体系结构为例讲了处理器中指令的执行流程以及流水的原理和实现。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221227110514567.png" alt="image-20221227110514567" style="zoom:50%;" />

## Y86指令集体系结构

定义一个 ISA 包括定义各种状态单元、指令集和它们的编码、一组编程规范和异常事件处理。

**程序员可见的状态** 

Y86 程序中的每条指令都会读取或修改处理器状态的某些部分，这称为程序员（用汇编代码写程序的人或机器级代码的编译器）可见状态：

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_26_1516971186027.jpg)](https://data2.liuin.cn/story-writer/2018_1_26_1516971186027.jpg)

**Y86 指令集**

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_26_1516971281093.jpg)](https://data2.liuin.cn/story-writer/2018_1_26_1516971281093.jpg)

**指令编码**

每条指令的第一个字节表示指令的类型，这个字节分为两个部分，每个部分四位：高四位是代码（code）部分，低四位是功能（function）部分。

![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_26_1516971475052.jpg)

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221227111326331.png" alt="image-20221227111326331" style="zoom: 33%;" />

当需要指明不应访问任何寄存器时，就用ID值 0xF 来表示

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221227111342006.png" alt="image-20221227111342006" style="zoom:50%;" />

**Y86 异常**

状态码

![image-20221227112004723](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221227112004723.png)

CISC vs RISC

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_26_1516971547830.jpg)](https://data2.liuin.cn/story-writer/2018_1_26_1516971547830.jpg)

## 逻辑设计和硬件控制语言HCL

硬件设计中，电子电路是用来计算位的函数（function on bits），以及在各种存储器元素中存储位。实现一个数字系统主要有三个部分：计算位的函数的组合逻辑、存储位的存储元素，以及控制存储元素更新的时钟信号。

### 逻辑门

逻辑门是数字电路的基本计算元素。它们产生的输出，等于它们输入位值的某个布尔函数

### 组合电路和HCL布尔表达式

很多的逻辑门组合成一个网，就能构建计算块(computational block)，称为组合电路(combinational circuits)。构建这些网有几条限制：

- 每个逻辑门的输入必须连接到下述选项之一：
  - 一个系统输入（主输入）
  - 某个存储器单元的输出
  - 某个逻辑门的输出

- 两个或多个逻辑门的输出不能连接在一起。否则它们可能会使线上的信号矛盾，可能会导致一个不合法的电压或电路故障
- 这个网必须是无环的。也就是在网中不能有路径经过一系列的门而形成一个回路，这样的回路会导致该网络计算的函数有歧义。

### 字级的组合电路和HCL整数表达式

字级的组合电路： 对数据字（data word）进行操作的电路，在HCL中，将所有的字级的信号都声明为int，而不指定字的大小

### 集合关系（set membership）

实现将一个信号和众多可能的信号做比较，判断正在处理的某些指令是否属于一类指令代码

### 存储器和时钟控制

为了产生**时序电路**，也就是有状态并且在这个状态上进行计算的系统，必须引入按位存储信息的设备。存储设备都是由同一个**时钟**控制的，时钟是一个周期性信号，决定什么时候要把新值加载到设备中。考虑两种：

- **时钟寄存器（寄存器）**存储单个位或字。时钟信号控制寄存器加载输入值。
- **随机访问存储器（内存）**存储多个字，用地址来选择该读或该写哪个字。

## Y86的顺序（sequential）实现

### 将处理组织成阶段

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230101113805486.png" alt="image-20230101113805486" style="zoom:50%;" />

处理一条指令包含很多操作，我们把其组织成某些特殊的阶段序列，使得即使指令的动作差异很大，但是所有的指令都遵守统一的序列：

- 取指（fetch）：取指阶段，从内存读取指令字节，地址为程序计数器（PC）的值

- 译码（decode）：译码阶段从寄存器中读入最多两个操作数，得到其值

  <img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230101112809526.png" alt="image-20230101112809526" style="zoom:50%;" />

- 执行（execute）：算术逻辑单元（ALU）要么执行指令指明的操作，计算内存引用的有效地址，要么增加或者减少栈指针。

  <img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230101112852115.png" alt="image-20230101112852115" style="zoom:50%;" />

- 访存（memory）：可以将数据写入内存，或者从内存中读出数据

  <img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230101112911506.png" alt="image-20230101112911506" style="zoom:50%;" />

- 写回（write back）：最多可以写两个结果到寄存器文件

  <img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230101112942539.png" alt="image-20230101112942539" style="zoom:50%;" />

- 更新PC（update PC）：将PC设置为下一条指令的地址

**例子**

![image-20230101113307465](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230101113307465.png)

![image-20230101113414072](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230101113414072.png)

![image-20230101113503386](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230101113503386.png)

![image-20230101113644352](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230101113644352.png)

![image-20230101113751656](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230101113751656.png)

## 流水线的通用原理

流水线化的系统有一些通用的属性和原理，在流水线系统中，待执行的任务被划分成若干个相互独立的阶段。

### 计算流水线

由一些执行计算的逻辑以及保存计算结果的寄存器组成。时钟信号控制在每个特定的时间间隔加载寄存器。

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_26_1516973076361.jpg)](https://data2.liuin.cn/story-writer/2018_1_26_1516973076361.jpg)

### 流水线操作的详细说明

三段流水线的时序

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_26_1516973204553.jpg)](https://data2.liuin.cn/story-writer/2018_1_26_1516973204553.jpg)

流水线操作的一个时钟周期

[![enter description here](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2018_1_26_1516973260280.jpg)](https://data2.liuin.cn/story-writer/2018_1_26_1516973260280.jpg)

### 流水线的局限性

- 不一致的划分
- 流水线过深，收益反而下降（由寄存器延迟造成的）

### 带反馈的流水线系统

可能产生的相关：数据相关（data dependency）、顺序相关（sequential dependency）、控制相关（control dependency）

## Y86的流水线实现

### 插入流水线寄存器

在SEQ+的各个阶段之间插入流水线寄存器，并对信号重新做排列

### 对信号做重新排列和标号

在流水线化的设计中，对应正在进过系统的各个指令，对指令中处理的值进行重新排列和标号

### 预测下一个PC

### 流水先冒险（hazard）

数据相关和控制相关导致的流水线产生的计算错误，成为冒险（hazard）。同样，冒险也分为数据冒险和控制冒险两大部分。

### 用暂停（stalling）来避免数据冒险

暂停时，处理器会停止流水线中一条或多条指令，知道冒险不再满足

### 用转发（forwarding）来避免数据冒险

## 小结

指令集体系结构（ISA）在处理器行为（就指令集合以及其编码而言）和如何实现处理器之间提供了一层抽象。

流水线化通过让不同的阶段并行操作，改进系统的吞吐量性能。

处理器设计的几个重要经验：

- 管理复杂性是首要问题
- 我们不需要直接实现ISA
- 硬件设计人员必须谨慎小心，一旦芯片被制造出来，就几乎不可能改正任何错误了。