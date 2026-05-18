---
title: Redis线程模型详解
date: 2023-03-27 16:51:33
tags:
- 后端
- Redis
- Database
- 线程
- 中间件
categories:
- Database
---

# 问题

- 什么是Redis线程模型？
- Redis4.0前的单线程模型是什么？
- 为什么Redis之前一直选择单线程？
- Redis4.0后为什么又加入了多线程异步执行？
- Redis6.0后引入的多线程模型是什么？

通读完本篇文章后，你应该对上面这几个问题能说出自己的答案。

# 前言

在阅读本文之前建议了解的前置知识：IO模型，可以看看本人的另一篇博客[羽墨的个人博客 (yumoyumo.top)](https://www.yumoyumo.top/1005.html)

在目前的技术选型中，Redis 俨然已经成为了系统高性能缓存方案的事实标准，因此现在 Redis 也成为了后端开发的基本技能树之一，Redis 的底层原理也顺理成章地成为了必须学习的知识。

Redis 从本质上来讲是一个网络服务器，而对于一个网络服务器来说，网络模型是它的精华，搞懂了一个网络服务器的网络模型，你也就搞懂了它的本质。

Redis 作为广为人知的内存数据库，在玩具项目和复杂的工业级别项目中都看到它的身影，然而 Redis 却是使用单线程模型进行设计的，这与很多人固有的观念有所冲突，为什么单线程的程序能够抗住每秒几百万的请求量呢？这也是我们今天要讨论的问题之一。

除此之外，Redis 4.0 之后的版本却抛弃了单线程模型这一设计，原本使用单线程运行的 Redis 也开始选择性使用多线程模型，这一看似有些矛盾的设计决策是今天需要讨论的另一个问题。

![image-20230327105556873](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327105556873.png)

本文通过层层递进的方式，介绍了 Redis 网络模型的版本变更历程，剖析了其从单线程进化到多线程的工作原理，此外，还一并分析并解答了 Redis 的网络模型的很多抉择背后的思考，帮助读者能更深刻地理解 Redis 网络模型的设计。



# Redis 有多快？

根据官方的 benchmark，通常来说，在一台普通硬件配置的 Linux 机器上跑单个 Redis 实例，处理简单命令（时间复杂度 O(N) 或者 O(log(N))），QPS 可以达到 8w+，而如果使用 pipeline 批处理功能，则 QPS 至高能达到 100w。

仅从性能层面进行评判，Redis 完全可以被称之为高性能缓存方案。

# Redis 为什么快？

Redis 的高性能得益于以下几个基础：

![image-20230327105130068](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327105130068.png)

- **C 语言实现**，虽然 C 对 Redis 的性能有助力，但语言并不是最核心因素。
- **纯内存 I/O**，相较于其他基于磁盘的 DB，Redis 的纯内存操作有着天然的性能优势。
- **I/O 多路复用**，基于 epoll/select/kqueue 等 I/O 多路复用技术，实现高吞吐的网络 I/O。
- **单线程模型**，单线程无法利用多核，但是从另一个层面来说则避免了多线程频繁上下文切换，以及同步机制如锁带来的开销。



# Redis 为何选择单线程？

## 概述

Redis 的核心网络模型选择用单线程来实现，这在一开始就引起了很多人的不解，Redis 官方的对于此的回答是：

![image-20230327105238560](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327105238560.png)

核心意思就是，对于一个 DB 来说，CPU 通常不会是瓶颈，因为大多数请求不会是 CPU 密集型的，而是 I/O 密集型。具体到 Redis 的话，如果不考虑 RDB/AOF 等持久化方案，Redis 是完全的纯内存操作，执行速度是非常快的，因此这部分操作通常不会是性能瓶颈，Redis 真正的性能瓶颈在于网络 I/O，也就是客户端和服务端之间的网络传输延迟，因此 Redis 选择了单线程的 I/O 多路复用来实现它的核心网络模型。

其中最重要的几个原因如下：

1. 使用单线程模型能带来更好的可维护性，方便开发和调试；
2. 使用单线程模型也能并发的处理客户端的请求；
3. Redis 服务中运行的绝大多数操作的性能瓶颈都不是 CPU；

上述三个原因中的最后一个是最终使用单线程模型的决定性因素，其他的两个原因都是使用单线程模型额外带来的好处

## 可维护性

可维护性对于一个项目来说非常重要，如果代码难以调试和测试，问题也经常难以复现，这对于任何一个项目来说都会严重地影响项目的可维护性。多线程模型虽然在某些方面表现优异，但是它却引入了程序执行顺序的不确定性，代码的执行过程不再是串行的，多个线程同时访问的变量如果没有谨慎处理就会带来诡异的问题。

![multi-threading](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/multi-threading.png)

在网络上有一个调侃多线程模型的段子，就很好地展示了多线程模型带来的潜在问题：[竞争条件 (race condition)](https://en.wikipedia.org/wiki/Race_condition) —— 如果计算机中的两个进程（线程同理）同时尝试修改一个共享内存的内容，在没有并发控制的情况下，最终的结果依赖于两个进程的执行顺序和时机，如果发生了并发访问冲突，最后的结果就会是不正确的。

> Some people, when confronted with a problem, think, “I know, I’ll use threads,” and then two they hav erpoblesms.

你期望的多线程编程 **VS** 实际上的多线程编程：

![image-20230327110535858](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327110535858.png)

### 避免过多的上下文切换开销

多线程调度过程中必然需要在 CPU 之间切换线程上下文 context，而上下文的切换又涉及程序计数器、堆栈指针和程序状态字等一系列的寄存器置换、程序堆栈重置甚至是 CPU 高速缓存、TLB 快表的汰换，如果是进程内的多线程切换还好一些，因为单一进程内多线程共享进程地址空间，因此线程上下文比之进程上下文要小得多，如果是跨进程调度，则需要切换掉整个进程地址空间。

如果是单线程则可以规避进程内频繁的线程切换开销，因为程序始终运行在进程中单个线程内，没有多线程切换的场景。

------

### 避免同步机制的开销

引入了多线程，我们就必须要同时引入并发控制来保证在多个线程同时访问数据时程序行为的正确性，这就需要工程师额外维护并发控制的相关代码，例如，我们会需要在可能被并发读写的变量上增加互斥锁：

在访问这些变量或者内存之前也需要先对获取互斥锁，一旦忘记获取锁或者忘记释放锁就可能会导致各种诡异的问题，管理相关的并发控制机制也需要付出额外的研发成本和负担。

------

### 简单可维护

Redis 的作者 Salvatore Sanfilippo (别称 antirez) 对 Redis 的设计和代码有着近乎偏执的简洁性理念，你可以在阅读 Redis 的源码或者给 Redis 提交 PR 的之时感受到这份偏执。因此代码的简单可维护性必然是 Redis 早期的核心准则之一，而引入多线程必然会导致代码的复杂度上升和可维护性下降。

前面我们提到引入多线程必须的同步机制，如果 Redis 使用多线程模式，那么所有的底层数据结构都必须实现成线程安全的，这无疑又使得 Redis 的实现变得更加复杂。

------

## 并发处理

使用单线程模型也并不意味着程序不能并发的处理任务，Redis 虽然使用单线程模型处理用户的请求，但是它却使用 **I/O 多路复用**机制**并发**处理来自客户端的多个连接，同时等待多个连接发送的请求。

在 I/O 多路复用模型中，最重要的函数调用就是 `select` 以及类似函数，该方法的能够同时监控多个文件描述符（也就是客户端的连接）的可读可写情况，当其中的某些文件描述符可读或者可写时，`select` 方法就会返回可读以及可写的文件描述符个数。

使用 I/O 多路复用技术能够极大地减少系统的开销，系统不再需要额外创建和维护进程和线程来监听来自客户端的大量连接，减少了服务器的开发成本和维护成本。

## 性能瓶颈

最后要介绍的其实就是 Redis 选择单线程模型的决定性原因 —— 多线程技术能够帮助我们充分利用 CPU 的计算资源来并发的执行不同的任务，但是 CPU 资源往往都不是 Redis 服务器的性能瓶颈。哪怕我们在一个普通的 Linux 服务器上启动 Redis 服务，它也能在 1s 的时间内处理 1,000,000 个用户请求。

> It’s not very frequent that CPU becomes your bottleneck with Redis, as usually Redis is either memory or network bound. For instance, using pipelining Redis running on an average Linux system can deliver even 1 million requests per second, so if your application mainly uses O(N) or O(log(N)) commands, it is hardly going to use too much CPU.

如果这种吞吐量不能满足我们的需求，更推荐的做法是使用**分片**的方式将不同的请求交给不同的 Redis 服务器（同一台机器上的多个Redis实例/进程/服务，即**单机集群**）来处理，而不是在同一个 Redis 服务中引入大量的多线程操作。

Redis是网络**IO密集型**的服务，CPU不是它的性能瓶颈，如果不开启 AOF 备份，所有 Redis 的操作都会在内存中完成不会涉及任何的 I/O 操作，这些数据的读写由于只发生在内存中，所以处理速度是非常快的。对于CPU计算使用多线程处理也仅仅是提高了计算部分的性能和CPU的利用率。

> AOF 是 Redis 的一种持久化机制，它会在每次收到来自客户端的写请求时，将其记录到日志中，每次 Redis 服务器启动时都会重放 AOF 日志构建原始的数据集，保证数据的持久性。

然而整个Redis服务的瓶颈在于网络传输带来的延迟和等待客户端的数据传输，也就是**网络 I/O**。你CPU计算本来就得等网络IO，使用多线程提高CPU利用率之后更得等网络IO更久，要显著提高性能也得对网络IO多线程处理，这即是Redis6.0后的多线程模型。

## 小结

为什么Redis4.0前一直选择单线程模型？

- 单线程编程容易并且更容易维护；多线程就会存在死锁、线程上下文切换等问题，甚至会影响性能
- 单线程也能使用IO多路复用处理并发用户请求
- Redis 的性能瓶颈不在 CPU ，主要在内存和网络IO

总而言之，Redis 选择单线程可以说是多方博弈之后的一种权衡：在保证足够的性能表现之下，使用单线程保持代码的简单和可维护性。

# Reactor设计模式

Redis采用的是IO多路复用模式，所以我们重点来了解下多路复用这种模式，如何在更好的落地到我们系统中，不可避免的我们要聊下Reactor模式。

首先我们做下相关的名词解释；

> **Reactor**：类似Selector，负责I/O事件的派发；
>
> **Acceptor**：接收到事件后，处理连接的那个分支逻辑；
>
> **Handler**：消息读写处理等操作类。

## 单Reactor单线程模型

![image-20230327124003656](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327124003656.png)

**处理流程**

- Reactor监听连接事件、Socket事件，当有连接事件过来时交给Acceptor处理，当有Socket事件过来时交个对应的Handler处理。

**优点**

- 模型比较简单，所有的处理过程都在一个连接里；
- 实现上比较容易，模块功能也比较解耦，Reactor负责多路复用和事件分发处理，Acceptor负责连接事件处理，Handler负责Scoket读写事件处理。

**缺点**

- 只有一个线程，连接处理和业务处理共用一个线程，无法充分利用CPU多核的优势。
- 在流量不是特别大、业务处理比较快的时候系统可以有很好的表现，当流量比较大、读写事件比较耗时情况下，容易导致系统出现性能瓶颈。

怎么去解决上述问题呢？既然业务处理逻辑可能会影响系统瓶颈，那我们是不是可以把业务处理逻辑单拎出来，交给线程池来处理，一方面减小对主线程的影响，另一方面利用CPU多核的优势。

## 单Reactor多线程模型

![image-20230327124052822](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327124052822.png)

这种模型相对单Reactor单线程模型，只是将业务逻辑的处理逻辑交给了一个线程池来处理。

**处理流程**

- Reactor监听连接事件、Socket事件，当有连接事件过来时交给Acceptor处理，当有Socket事件过来时交个对应的Handler处理。
- Handler完成读事件后，包装成一个任务对象，交给线程池来处理，把业务处理逻辑交给其他线程来处理。

**优点**

- 让主线程专注于通用事件的处理（连接、读、写），从设计上进一步解耦；
- 利用CPU多核的优势。

**缺点**

- 貌似这种模型已经很完美了，我们再思考下，如果客户端很多、流量特别大的时候，通用事件的处理（读、写）也可能会成为主线程的瓶颈，因为每次读、写操作都涉及系统调用。

有没有什么好的办法来解决上述问题呢？通过以上的分析，大家有没有发现一个现象，当某一个点成为系统瓶颈点时，想办法把他拿出来，交个其他线程来处理，那这种场景是否适用呢？

## 多Reactor多线程模型

![image-20230327124357289](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327124357289.png)

这种模型相对单Reactor多线程模型，只是将Scoket的读写处理从mainReactor中拎出来，交给subReactor线程来处理。

**处理流程**

- mainReactor主线程负责连接事件的监听和处理，当Acceptor处理完连接过程后，主线程将连接分配给subReactor；
- subReactor负责mainReactor分配过来的Socket的监听和处理，当有Socket事件过来时交个对应的Handler处理；

Handler完成读事件后，包装成一个任务对象，交给线程池来处理，把业务处理逻辑交给其他线程来处理。

**优点**

- 让主线程专注于连接事件的处理，子线程专注于读写事件，从设计上进一步解耦；
- 利用CPU多核的优势。

**缺点**

- 实现上会比较复杂，在极度追求单机性能的场景中可以考虑使用。

# Redis4.0前 单线程模型 - Event Loop

在讨论这个之前，我们要先明确『**单线程**』这个概念的边界：它的覆盖范围是核心网络模型，抑或是整个 Redis？如果是前者，那么答案是肯定的，在 Redis 的 v6.0 版本正式引入多线程之前，其网络模型一直是单线程模式的；如果是后者，那么答案则是否定的，Redis 早在 v4.0 就已经引入了多线程。

因此，当我们讨论 Redis 的多线程之时，有必要对 Redis 的版本划出两个重要的节点：

1. Redis v4.0（引入多线程处理异步任务）
2. Redis v6.0（正式在网络模型中实现 I/O 多线程）

------

先看看Redis服务的线程模型简图

![Redis服务的线程模型图](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327133313215.png)

IO多路复用负责各事件的监听（连接、读、写等），当有事件发生时，将对应事件放入队列中，由事件分发器根据事件类型来进行分发；

如果是连接事件，则分发至连接应答处理器；GET、SET等redis命令分发至命令请求处理器。

命令处理完后产生命令回复事件，再由事件队列，到事件分发器，到命令回复处理器，回复客户端响应。

------

再来剖析一下 Redis 的核心网络模型，从 Redis 的 v1.0 到 v6.0 版本之前，Redis 的核心网络模型一直是一个典型的**单 Reactor** 模型：利用 epoll/select/kqueue 等多路复用技术，在**单线程**的事件循环中不断去处理事件（客户端请求），最后回写响应数据到客户端：

![image-20230327131158588](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327131158588.png)

这里有几个核心的概念：

- **`client`**：**客户端对象**，Redis 是典型的 CS 架构（Client <---> Server），客户端通过 **socket** 与服务端建立网络通道然后发送请求命令，服务端执行请求的命令并回复。

  **Redis** 使用结构体 **client** 存储客户端的所有相关信息，包括但不限于`封装的套接字连接 -- *conn`，`当前选择的数据库指针 -- *db`，`读入缓冲区 -- querybuf`，`写出缓冲区 -- buf`，`写出数据链表 -- reply`等。

- **`aeApiPoll`**：**I/O 多路复用 API**，是基于 epoll_wait/select/kevent 等系统调用的封装，监听等待读/写事件触发，然后处理，它是**事件循环（Event Loop）**中的核心函数，是事件驱动得以运行的基础。

- **`acceptTcpHandler`**：**连接应答处理器**，底层使用系统调用 `accept` 接受来自客户端的新连接，并为新连接注册**绑定**命令读取处理器，以备后续处理新的客户端 TCP 连接；除了这个处理器，还有对应的 `acceptUnixHandler` 负责处理 Unix Domain Socket 以及 `acceptTLSHandler` 负责处理 TLS 加密连接。

- **`readQueryFromClient`**：**命令读取处理器**，解析并执行客户端的请求命令。

- **`beforeSleep`**：事件循环中进入 aeApiPoll 等待事件到来之前会执行的函数，其中包含一些日常的任务，比如把 `client->buf` 或者 `client->reply` （后面会解释为什么这里需要两个缓冲区）中的响应写回到客户端，持久化 AOF 缓冲区的数据到磁盘等，相对应的还有一个 afterSleep 函数，在 aeApiPoll 之后执行。

- **`sendReplyToClient`**：命令回复处理器，当一次事件循环之后写出缓冲区中还有数据残留，则这个处理器会被注册绑定到相应的连接上，等连接触发写就绪事件时，它会将写出缓冲区剩余的数据回写到客户端。

Redis 内部实现了一个高性能的事件库 --- AE，基于 epoll/select/kqueue/evport 四种事件驱动技术，实现 Linux/MacOS/FreeBSD/Solaris 多平台的高性能事件循环模型。Redis 的核心网络模型正式构筑在 AE 之上，包括 I/O 多路复用、各类处理器的注册绑定，都是基于此才得以运行。

------

## Redis 发起请求命令的工作原理

至此，我们可以描绘出客户端向 Redis 发起请求命令的工作原理：

1. Redis 服务器启动，开启主线程**事件循环（Event Loop）**，注册 `acceptTcpHandler` 连接应答处理器到用户配置的监听端口对应的文件描述符，等待新连接到来；
2. 客户端和服务端建立网络连接；
3. `acceptTcpHandler` 被调用，主线程使用 AE 的 API 将 `readQueryFromClient` 命令读取处理器**绑定**到新连接对应的文件描述符上，并初始化一个 `client` 绑定这个客户端连接；
4. 客户端发送请求命令，触发**读就绪事件**，主线程调用 `readQueryFromClient` 通过 socket 读取客户端发送过来的命令存入 `client->querybuf` 读入缓冲区；
5. 接着调用 `processInputBuffer`，在其中使用 `processInlineBuffer` 或者 `processMultibulkBuffer` 根据 Redis 协议解析命令，最后调用 `processCommand` 执行命令；
6. 根据请求命令的类型（SET, GET, DEL, EXEC 等），分配相应的命令执行器去执行，最后调用 `addReply` 函数族的一系列函数将响应数据写入到对应 `client` 的**写出缓冲区**：`client->buf` 或者 `client->reply` ，`client->buf` 是首选的写出缓冲区，固定大小 16KB，一般来说可以缓冲足够多的响应数据，但是如果客户端在时间窗口内需要响应的数据非常大，那么则会自动切换到 `client->reply` 链表上去，使用链表理论上能够保存无限大的数据（受限于机器的物理内存），最后把 `client` 添加进一个 LIFO 队列 `clients_pending_write`；
7. 在**事件循环（Event Loop）**中，主线程执行 `beforeSleep` --> `handleClientsWithPendingWrites`，遍历 `clients_pending_write` 队列，调用 `writeToClient` **把 `client` 的写出缓冲区里的数据回写到客户端**，如果写出缓冲区还有数据遗留，则注册 `sendReplyToClient` 命令回复处理器到该连接的写就绪事件，等待客户端可写时在事件循环中再继续回写残余的响应数据。

对于那些想利用多核优势提升性能的用户来说，Redis 官方给出的解决方案也非常简单粗暴：在同一个机器上多跑几个 Redis 实例。事实上，为了保证高可用，线上业务一般不太可能会是单机模式，更加常见的是利用 Redis 分布式集群多节点和数据分片负载均衡来提升性能和保证高可用。

------

## 事件机制

Redis 采用事件驱动机制来处理大量的网络IO。它并没有使用 libevent 或者 libev 这样的成熟开源方案，而是自己实现一个非常简洁的事件驱动库 ae_event。

Redis中的事件驱动库只关注网络IO，以及定时器。该事件库处理下面两类事件：

- **文件事件(file event)**：用于处理 Redis 服务器和客户端之间的网络IO。
- **时间事件(time eveat)**：Redis 服务器中的一些操作（比如serverCron函数）需要在给定的时间点执行，而时间事件就是处理这类定时操作的。

事件驱动库的代码主要是在`src/ae.c`中实现的，其示意图如下所示。

![image-20230327140034017](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327140034017.png)

`aeEventLoop`是整个事件驱动的核心，它管理着文件事件表和时间事件列表，不断地循环处理着就绪的文件事件和到期的时间事件。下面我们就先分别介绍文件事件和时间事件。

### 文件事件

Redis基于Reactor模式开发了自己的网络事件处理器，也就是文件事件处理器。文件事件处理器使用IO多路复用技术，同时监听多个套接字，并为套接字关联不同的事件处理函数。当套接字的可读或者可写事件触发时，就会调用相应的事件处理函数。

Redis 使用的IO多路复用技术主要有：`select`、`epoll`、`evport`和`kqueue`等。每个IO多路复用函数库在 Redis 源码中都对应一个单独的文件，比如ae_select.c，ae_epoll.c， ae_kqueue.c等。Redis 会根据不同的操作系统，按照不同的优先级选择多路复用技术。事件响应框架一般都采用该架构，比如 netty 和 libevent。

![image-20230327140131354](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327140131354.png)

如下图所示，文件事件处理器有四个组成部分，它们分别是套接字、I/O多路复用程序、文件事件分派器以及事件处理器。

![image-20230327140148763](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327140148763.png)

文件事件是对套接字操作的抽象，每当一个套接字准备好执行 accept、read、write和 close 等操作时，就会产生一个文件事件。因为 Redis 通常会连接多个套接字，所以多个文件事件有可能并发的出现。

I/O多路复用程序负责监听多个套接字，并向文件事件派发器传递那些产生了事件的套接字。

尽管多个文件事件可能会并发地出现，但I/O多路复用程序总是会将所有产生的套接字都放到同一个队列(也就是后文中描述的`aeEventLoop`的`fired`就绪事件表)里边，然后文件事件处理器会以有序、同步、单个套接字的方式处理该队列中的套接字，也就是处理就绪的文件事件。

------

#### 一次客户端和服务端的交互流程

![image-20230327140214144](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327140214144.png)

所以，一次 Redis 客户端与服务器进行连接并且发送命令的过程如上图所示。

可以细分为连接流程和命令执行流程如下：

------

**连接流程**

![image-20230327140352344](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327140352344.png)

1. **绑定`连接应答处理器`**：Redis服务端主线程监听固定端口，并将连接事件绑定连接应答处理器。
2. **触发`连接应答处理器`**：客户端发起连接后，连接事件被触发，IO多路复用程序将连接事件包装好后丢入事件队列，然后由事件分发处理器分发给连接应答处理器。
3. **应答客户端连接请求**：连接应答处理器创建client对象以及Socket对象，以及客户端状态，并将Socket对象的**AE_READABLE 事件**和**命令请求处理器**关联，标识后续该Socket对可读事件感兴趣，也就是开始接收客户端的命令操作。

当前过程都是由一个主线程负责处理。

------

**命令执行流程**

![image-20230327140404907](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327140404907.png)

1. **客户端发送命令**：客户端建立连接后，向服务器发送命令，客户端Socket产生（ **AE_WRITEABLE** 写事件），IO多路复用程序监听到该事件后，将数据包装成事件丢到事件队列中（读事件在上个流程中绑定了命令请求处理器）。
2. **`事件分发处理器`分发事件 -> `命令请求处理器` **：事件分发处理器根据事件类型，将事件分发给对应的**命令请求处理器**。
3. **触发`命令请求处理器`执行**：Socket将产生 **AE_READABLE 事件**，触发**命令请求处理器**执行，处理器读取客户端命令，然后传递给相关程序去执行。
4. **绑定`命令回复处理器`**：执行命令获得相应的命令回复，为了将命令回复传递给客户端，服务器将Socket的 **AE_WRITEABLE 事件**与**命令回复处理器**关联。
5. **`事件分发处理器`分发事件 -> `命令回复处理器` **：当客户端试图读取命令回复时，客户端Socket产生（ **AE_WRITEABLE** 写事件），IO多路复用程序监听到该事件后，将数据包装成事件丢到事件队列中，事件分发处理器根据事件类型分发至命令回复处理器；
6. **触发`命令回复处理器`执行**：命令回复处理器，将数据写入Socket中返回给客户端。

------

### 时间事件

Redis 的时间事件分为以下两类：

- 定时事件：让一段程序在指定的时间之后执行一次。
- 周期性事件：让一段程序每隔指定时间就执行一次。

Redis 的时间事件的具体定义结构如下所示。

```clike
typedef struct aeTimeEvent {
    /* 全局唯一ID */
    long long id; /* time event identifier. */
    /* 秒精确的UNIX时间戳，记录时间事件到达的时间*/
    long when_sec; /* seconds */
    /* 毫秒精确的UNIX时间戳，记录时间事件到达的时间*/
    long when_ms; /* milliseconds */
    /* 时间处理器 */
    aeTimeProc *timeProc;
    /* 事件结束回调函数，析构一些资源*/
    aeEventFinalizerProc *finalizerProc;
    /* 私有数据 */
    void *clientData;
    /* 前驱节点 */
    struct aeTimeEvent *prev;
    /* 后继节点 */
    struct aeTimeEvent *next;
} aeTimeEvent;
```

一个时间事件是定时事件还是周期性事件取决于时间处理器的返回值：

- 如果返回值是 AE_NOMORE，那么这个事件是一个定时事件，该事件在达到后删除，之后不会再重复。
- 如果返回值是非 AE_NOMORE 的值，那么这个事件为周期性事件，当一个时间事件到达后，服务器会根据时间处理器的返回值，对时间事件的 `when` 属性进行更新，让这个事件在一段时间后再次达到。

Redis 将所有时间事件都放在一个无序链表中，每次 Redis 会遍历整个链表，查找所有已经到达的时间事件，并且调用相应的事件处理器。

## 模型优缺点

以上流程分析我们可以看出Redis采用的是**单Reactor单线程模型**，我们也分析了这种模式的优缺点，那Redis为什么还要采用这种模式呢？

**Redis本身的特性**

命令执行基于内存操作，业务处理逻辑比较快，所以命令处理这一块单线程来做也能维持一个很高的性能。

**优点**

- Reactor单线程模型的优点，即模型简单、实现容易、功能解耦

**缺点**

- Reactor单线程模型的缺点也同样在Redis中来体现，唯一不同的地方就在于业务逻辑处理（命令执行）这块不是系统瓶颈点。
- 随着流量的上涨，IO操作的的耗时会越来越明显（read操作，内核中读数据到应用程序。write操作，应用程序中的数据到内核），当达到一定阀值时系统的瓶颈就体现出来了。

**Redis又是如何去解的呢？**

是将耗时的操作拿出来进行多线程处理吗？

------

# Redis4.0后 多线程异步任务

以上便是 Redis 的核心网络模型，这个单线程网络模型一直到 Redis v6.0 才改造成多线程模式，但这并不意味着整个 Redis 一直都只是单线程。

Redis 在 v4.0 版本的时候就已经引入了的多线程来做一些异步操作，此举主要针对的是那些非常耗时的命令，通过将这些命令的执行进行异步化，避免阻塞单线程的事件循环。

我们知道 Redis 的 `DEL` 命令是用来删除掉一个或多个 key 储存的值，它是一个阻塞的命令，大多数情况下你要删除的 key 里存的值不会特别多，最多也就几十上百个对象，所以可以很快执行完，但是如果你要删的是一个超大的键值对，里面有几百万个对象，那么这条命令可能会阻塞至少好几秒，又因为事件循环是单线程的，所以会阻塞后面的其他事件，导致吞吐量下降。

Redis 的作者 antirez 为了解决这个问题进行了很多思考，一开始他想的办法是一种渐进式的方案：利用定时器和数据游标，每次只删除一小部分的数据，比如 1000 个对象，最终清除掉所有的数据，但是这种方案有个致命的缺陷，如果同时还有其他客户端往某个正在被渐进式删除的 key 里继续写入数据，而且删除的速度跟不上写入的数据，那么将会无止境地消耗内存，虽然后来通过一个巧妙的办法解决了，但是这种实现使 Redis 变得更加复杂，而多线程看起来似乎是一个水到渠成的解决方案：简单、易理解。于是，最终 antirez 选择引入多线程来实现这一类非阻塞的命令。更多 antirez 在这方面的思考可以阅读一下他发表的博客：[Lazy Redis is better Redis](https://link.segmentfault.com/?enc=O13bk%2FRSE72ii9%2BgFAgYzw%3D%3D.DhhK4iH%2FAxvxd3gSx8P9kuPlBL6FdFjD%2BAiJnk3Rmwg%3D)。

于是，在 Redis v4.0 之后增加了一些的非阻塞命令如 `UNLINK`、`FLUSHALL ASYNC`、`FLUSHDB ASYNC`。

![image-20230327143804771](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327143804771.png)

`UNLINK` 命令其实就是 `DEL` 的异步版本，它不会同步删除数据，而只是把 key 从 keyspace 中暂时移除掉，然后将任务添加到一个异步队列，最后由后台线程去删除，不过这里需要考虑一种情况是如果用 `UNLINK` 去删除一个很小的 key，用异步的方式去做反而开销更大，所以它会先计算一个开销的阀值，只有当这个值大于 64 才会使用异步的方式去删除 key，对于基本的数据类型如 List、Set、Hash 这些，阀值就是其中存储的对象数量。

------

# Redis6.0后 多线程网络模型

前面提到 Redis 最初选择单线程网络模型的理由是：CPU 通常不会成为性能瓶颈，瓶颈往往是**内存**和**网络**，因此单线程足够了。那么为什么现在 Redis 又要引入多线程呢？很简单，就是 Redis 的网络 I/O 瓶颈已经越来越明显了。

随着互联网的飞速发展，互联网业务系统所要处理的线上流量越来越大，Redis 的单线程模式会导致系统消耗很多 CPU 时间在网络 I/O 上从而降低吞吐量，要提升 Redis 的性能有两个方向：

- 优化网络 I/O 模块
- 提高机器内存读写的速度

后者依赖于硬件的发展，暂时无解。所以只能从前者下手，网络 I/O 的优化又可以分为两个方向：

- 零拷贝技术或者 DPDK 技术
- 利用多核优势

零拷贝技术有其局限性，无法完全适配 Redis 这一类复杂的网络 I/O 场景。而 DPDK 技术通过旁路网卡 I/O 绕过内核协议栈的方式又太过于复杂以及需要内核甚至是硬件的支持。

因此，利用多核优势成为了优化网络 I/O 性价比最高的方案。

------

## Multi-Reactors

6.0 版本之后，Redis 正式在核心网络模型中引入了多线程，也就是所谓的 *I/O threading*，至此 Redis 真正拥有了多线程模型。前一小节，我们了解了 Redis 在 6.0 版本之前的单线程事件循环模型，实际上就是一个非常经典的 **单Reactor单线程 模型**：

![image-20230327143955017](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327143955017.png)

目前 Linux 平台上主流的高性能网络库/框架中，大都采用 Reactor 模式，比如 netty、libevent、libuv、POE(Perl)、Twisted(Python)等。

Reactor 模式本质上指的是使用 `I/O 多路复用(I/O multiplexing) + 非阻塞 I/O(non-blocking I/O)` 的模式。

Redis 的核心网络模型在 6.0 版本之前，一直是单 Reactor 模式：所有事件的处理都在单个线程内完成，虽然在 4.0 版本中引入了多线程，但是那个更像是针对特定场景（删除超大 key 值等）而打的补丁，并不能被视作核心网络模型的多线程。

通常来说，单 Reactor 模式，引入多线程之后会进化为 **Multi-Reactors 模式（多Reactor）**，基本工作模式如下：

![image-20230327144110673](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327144110673.png)

区别于单 Reactor 模式，这种模式不再是单线程的事件循环，而是有多个线程（Sub Reactors）各自维护一个独立的事件循环，由 Main Reactor 负责接收新连接并分发给 Sub Reactors 去独立处理，最后 Sub Reactors 回写响应给客户端。

Multiple Reactors 模式通常也可以等同于 Master-Workers 模式，比如 Nginx 和 Memcached 等就是采用这种多线程模型，虽然不同的项目实现细节略有区别，但总体来说模式是一致的。

------

## 模型设计

Redis的多线程模型跟”多Reactor多线程模型“、“单Reactor多线程模型”有点区别，不是标准的 Multi-Reactors/Master-Workers 模式，但同时用了两种Reactor模型的思想，具体如下；

> Redis的多线程模型是将IO操作多线程化，本身逻辑处理过程（命令执行过程）依旧是单线程，借助了单Reactor思想，实现上又有所区分。
>
> 将IO操作多线程化，又跟单Reactor衍生出多Reactor的思想一致，都是将IO操作从主线程中拎出来。

现在我们先看一下 Redis 多线程网络模型的总体设计：

![image-20230327144231159](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327144231159.png)

1. Redis 服务器启动，开启主线程事件循环（Event Loop），注册 `acceptTcpHandler` 连接应答处理器到用户配置的监听端口对应的文件描述符，等待新连接到来；
2. 客户端和服务端建立网络连接；
3. `acceptTcpHandler` 被调用，主线程使用 AE 的 API 将 `readQueryFromClient` 命令读取处理器绑定到新连接对应的文件描述符上，并初始化一个 `client` 绑定这个客户端连接；
4. 客户端发送请求命令，触发读就绪事件，服务端主线程不会通过 socket 去读取客户端的请求命令，而是先将 `client` 放入一个 LIFO 队列 `clients_pending_read`；
5. 在事件循环（Event Loop）中，主线程执行 `beforeSleep` -->`handleClientsWithPendingReadsUsingThreads`，利用 Round-Robin 轮询负载均衡策略，把 `clients_pending_read`队列中的连接均匀地分配给 I/O 线程各自的本地 FIFO 任务队列 `io_threads_list[id]` 和主线程自己，I/O 线程通过 socket 读取客户端的请求命令，存入 `client->querybuf` 并解析第一个命令，**但不执行命令**，主线程忙轮询，等待所有 I/O 线程完成读取任务；
6. 主线程和所有 I/O 线程都完成了读取任务，主线程结束忙轮询，遍历 `clients_pending_read` 队列，**执行所有客户端连接的请求命令**，先调用 `processCommandAndResetClient` 执行第一条已经解析好的命令，然后调用 `processInputBuffer` 解析并执行客户端连接的所有命令，在其中使用 `processInlineBuffer` 或者 `processMultibulkBuffer` 根据 Redis 协议解析命令，最后调用 `processCommand` 执行命令；
7. 根据请求命令的类型（SET, GET, DEL, EXEC 等），分配相应的命令执行器去执行，最后调用 `addReply` 函数族的一系列函数将响应数据写入到对应 `client` 的写出缓冲区：`client->buf` 或者 `client->reply` ，`client->buf` 是首选的写出缓冲区，固定大小 16KB，一般来说可以缓冲足够多的响应数据，但是如果客户端在时间窗口内需要响应的数据非常大，那么则会自动切换到 `client->reply` 链表上去，使用链表理论上能够保存无限大的数据（受限于机器的物理内存），最后把 `client` 添加进一个 LIFO 队列 `clients_pending_write`；
8. 在事件循环（Event Loop）中，主线程执行 `beforeSleep` --> `handleClientsWithPendingWritesUsingThreads`，利用 Round-Robin 轮询负载均衡策略，把 `clients_pending_write` 队列中的连接均匀地分配给 I/O 线程各自的本地 FIFO 任务队列 `io_threads_list[id]` 和主线程自己，I/O 线程通过调用 `writeToClient` 把 `client` 的写出缓冲区里的数据回写到客户端，主线程忙轮询，等待所有 I/O 线程完成写出任务；
9. 主线程和所有 I/O 线程都完成了写出任务， 主线程结束忙轮询，遍历 `clients_pending_write` 队列，如果 `client` 的写出缓冲区还有数据遗留，则注册 `sendReplyToClient` 到该连接的写就绪事件，等待客户端可写时在事件循环中再继续回写残余的响应数据。

这里大部分逻辑和之前的单线程模型是一致的，变动的地方仅仅是把读取客户端请求命令和回写响应数据的逻辑异步化了，交给 I/O 线程去完成，这里需要特别注意的一点是：**I/O 线程仅仅是读取和解析客户端命令而不会真正去执行命令，客户端命令的执行最终还是要在主线程上完成**。

具体的源码分析这里就不展开了，感兴趣的可以看看下面参考链接的[Redis 多线程网络模型全面揭秘 - 编程札记 - SegmentFault 思否](https://segmentfault.com/a/1190000039223696#item-7)

------

## 实现机制和流程

![image-20230327145011428](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327145011428.png)

**流程简述如下：**

1、主线程负责接收建立连接请求，获取 socket 放入全局等待读处理队列

2、主线程处理完读事件之后，通过 RR(Round Robin) 将这些连接分配给这些 IO 线程

3、主线程阻塞等待 IO 线程读取 socket 完毕

4、主线程通过单线程的方式执行请求命令，请求数据读取并解析完成，但并不执行

5、主线程阻塞等待 IO 线程将数据回写 socket 完毕

6、解除绑定，清空等待队列

![image-20230327145027058](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327145027058.png)

**该设计有如下特点：**

1、IO 线程要么同时在读 socket，要么同时在写，不会同时读或写

2、IO 线程只负责读写 socket 解析命令，不负责命令处理

------

## 性能提升

Redis 将核心网络模型改造成多线程模式追求的当然是最终性能上的提升，所以最终还是要以 benchmark 数据见真章：

![image-20230327144534208](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327144534208.png)

测试数据表明，Redis 在使用多线程模式之后性能大幅提升，达到了一倍。更详细的性能压测数据可以参阅这篇文章：[Benchmarking the experimental Redis Multi-Threaded I/O](https://link.segmentfault.com/?enc=HGCHd4bDhzVMhcjReH7VlQ%3D%3D.iY2c8Ky6h9A7f38hPQJKOImeN4f38%2BDJs5wwbpK6wRg6s%2BHQyjKMWVl7ixSkboFHysU3eLi0glhd1vVLkYo4f6a6DbrdbSR6oUbFjCsCzsZLW0%2BybIoP5zZFqoR19UPc)。

以下是美图技术团队实测的新旧 Redis 版本性能对比图，仅供参考：

![image-20230327144604218](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327144604218.png)

![image-20230327144612346](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230327144612346.png)

------

## 模型缺陷

首先第一个就是前面提到过的，Redis 的多线程网络模型实际上并不是一个标准的 Multi-Reactors/Master-Workers 模型，和其他主流的开源网络服务器的模式有所区别，最大的不同就是在标准的 Multi-Reactors/Master-Workers 模式下，Sub Reactors/Workers 会完成 `网络读 -> 数据解析 -> 命令执行 -> 网络写` 整套流程，Main Reactor/Master 只负责分派任务，而在 Redis 的多线程方案中，I/O 线程任务仅仅是通过 socket 读取客户端请求命令并解析，却没有真正去执行命令，所有客户端命令最后还需要回到主线程去执行，因此对多核的利用率并不算高，而且每次主线程都必须在分配完任务之后忙轮询等待所有 I/O 线程完成任务之后才能继续执行其他逻辑。

Redis 之所以如此设计它的多线程网络模型，我认为主要的原因是为了**保持兼容性**，因为以前 Redis 是单线程的，所有的客户端命令都是在单线程的事件循环里执行的，也因此 Redis 里所有的数据结构都是非线程安全的，现在引入多线程，如果按照标准的 Multi-Reactors/Master-Workers 模式来实现，则所有内置的数据结构都必须重构成线程安全的，这个工作量无疑是巨大且麻烦的。

所以，Redis 目前的多线程方案更像是一个**折中**的选择：**既保持了原系统的兼容性，又能利用多核提升 I/O 性能**。

其次，目前 Redis 的多线程模型中，主线程和 I/O 线程的通信过于简单粗暴：忙轮询和锁，因为通过自旋忙轮询进行等待，导致 Redis 在启动的时候以及运行期间偶尔会有短暂的 CPU 空转引起的高占用率，而且这个通信机制的最终实现看起来非常不直观和不简洁。

------

## 小结

回顾一下 Redis 多线程网络模型的设计方案：

- 使用 I/O 线程实现网络 I/O 多线程化，I/O 线程只负责网络 I/O 和命令解析，不执行客户端命令。
- 利用原子操作+交错访问实现无锁的多线程模型。
- 通过设置 CPU 亲和性，隔离主进程和其他子进程，让多线程网络模型能发挥最大的性能。

------

# 总结

Redis 作为缓存系统的事实标准，它的底层原理值得开发者去深入学习，Redis 自 2009 年发布第一版之后，其单线程网络模型的选择在社区中从未停止过讨论，多年来一直有呼声希望 Redis 能引入多线程从而利用多核优势，但是作者 antirez 是一个追求大道至简的开发者，对 Redis 加入任何新功能都异常谨慎，所以在 Redis 初版发布的十年后才最终将 Redis 的核心网络模型改造成多线程模式，这期间甚至诞生了一些 Redis 多线程的替代项目。虽然 antirez 一直在推迟多线程的方案，但却从未停止思考多线程的可行性，Redis 多线程网络模型的改造不是一朝一夕的事情，这其中牵扯到项目的方方面面，所以我们可以看到 Redis 的最终方案也并不完美，没有采用主流的多线程模式设计。

通读本文之后，相信读者们应该能够回答出文章开头的几个问题，并且了解到一个优秀的网络系统的实现所涉及到的计算机领域的各种技术：设计模式、网络 I/O、并发编程、操作系统底层，甚至是计算机硬件。另外还需要对项目迭代和重构的谨慎，对技术方案的深入思考，绝不仅仅是写好代码这一个难点。

# **参考**

>[linux五种IO模型 - 掘金 (juejin.cn)](https://juejin.cn/post/6844903782094995470#heading-14)
>
>[Redis 事件机制详解 | 程序员历小冰 (remcarpediem.net)](http://remcarpediem.net/article/1aa2da89/)
>
>[数据库 - Redis线程模型的前世今生 - vivo 互联网技术 - SegmentFault 思否](https://segmentfault.com/a/1190000041037612?utm_source=sf-similar-article#item-2-2)
>
>[Redis 多线程网络模型全面揭秘 - 编程札记 - SegmentFault 思否](https://segmentfault.com/a/1190000039223696#item-7)
>
>[Redis 6.0 新特性-多线程连环13问！ (qq.com)](https://mp.weixin.qq.com/s/FZu3acwK6zrCBZQ_3HoUgw)