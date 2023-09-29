---
title: Java高并发革命！JDK19新特性——虚拟线程（Virtual Threads）
date: 2022-09-24 16:51:33
tags: 
- Java
- 并发
- 虚拟线程
categories:
- Java
---


## 介绍

虚拟线程具有和 Go 语言的 goroutines 和 Erlang 语言的进程类似的实现方式，它们是**用户模式（*user-mode*）线程**的一种形式。

在过去 Java 中常常使用线程池来进行**平台线程的共享**以提高对计算机硬件的使用率，但在这种异步风格中，请求的每个阶段可能在不同的线程上执行，每个线程以交错的方式运行属于不同请求的阶段，与 Java 平台的设计不协调从而导致：

- 堆栈跟踪不提供可用的上下文
- 调试器不能单步执行请求处理逻辑
- 分析器不能将操作的成本与其调用方关联。

而虚拟线程既保持与平台的设计兼容，同时又能最佳地利用硬件从而不影响可伸缩性。**虚拟线程是由 JDK 而非操作系统提供的线程的轻量级实现**：

- **虚拟线程**是没有绑定到**特定操作系统线程**的线程。
- **平台线程**是以传统方式实现的线程，作为**围绕操作系统线程的简单包装**。

### 摘要

向 Java 平台引入**虚拟线程**。虚拟线程是轻量级线程，它可以大大减少编写、维护和观察高吞吐量并发应用程序的工作量。

### 目标

- 允许以简单的每个请求一个线程的方式编写的服务器应用程序以接近最佳的硬件利用率进行扩展。
- 允许使用 java.lang.ThreadAPI 的现有代码采用虚拟线程，并且只做最小的更改。
- 使用现有的 JDK 工具可以方便地对虚拟线程进行故障排除、调试和分析。

### 非目标

- 移除线程的传统实现或迁移现有应用程序以使用虚拟线程并不是目标。
- 改变 Java 的基本并发模型。
- 我们的目标不是在 Java 语言或 Java 库中提供新的资料平行结构。StreamAPI 仍然是并行处理大型数据集的首选方法。

### 动机

近30年来，Java 开发人员一直依赖线程作为并发服务器应用程序的构件。每个方法中的每个语句都在一个线程中执行，而且由于 Java 是多线程的，因此执行的多个线程同时发生。

线程是 Java 的并发单元: 一段顺序代码，与其他这样的单元并发运行，并且在很大程度上独立于这些单元。

每个线程都提供一个堆栈来存储本地变量和协调方法调用，以及出错时的上下文: 异常被同一个线程中的方法抛出和捕获，因此开发人员可以使用线程的堆栈跟踪来查找发生了什么。

线程也是工具的一个核心概念: 调试器遍历线程方法中的语句，分析器可视化多个线程的行为，以帮助理解它们的性能。

#### 两种并发 style

#### **thread-per-request  style **

- 服务器应用程序通常处理**彼此独立的并发用户请求**，因此应用程序通过在整个请求持续期间为该请求分配一个线程来处理请求是有意义的。这种按请求执行线程的 style 易于理解、易于编程、易于调试和配置，因为它使用**平台的并发单元**来表示**应用程序的并发单元**。

- 服务器应用程序的可伸缩性受到**利特尔定律（[Little's Law](https://en.wikipedia.org/wiki/Little's_law)**）的支配，该定律关系到**延迟**、**并发性**和**吞吐量**: 对于给定的**请求处理持续时间(延迟)** ，**应用程序同时处理的请求数(并发性)**必须与**到达速率(吞吐量)**成正比增长。

  例如，假设一个平均延迟为 50ms 的应用程序通过并发处理 10 个请求实现每秒 200 个请求的吞吐量。为了使该应用程序的吞吐量达到每秒 2000 个请求，它将需要同时处理 100 个请求。如果在请求持续期间每个请求都在一个线程中处理，那么为了让应用程序跟上，**线程的数量必须随着吞吐量的增长而增长**。

- 不幸的是，可用线程的数量是有限的，因为 **JDK 将线程实现为操作系统(OS)线程的包装器**。操作系统线程代价高昂，因此我们不能拥有太多线程，这使得实现不适合每个请求一个线程的 style 。

- 如果每个请求在其持续时间内消耗一个线程，从而消耗一个 OS 线程，那么线程的数量通常会在其他资源(如 CPU 或网络连接)耗尽之前很久成为限制因素。JDK 当前的线程实现将**应用程序的吞吐量**限制在**远低于硬件所能支持的水平**。即使在线程池中也会发生这种情况，**因为池有助于避免启动新线程的高成本，但不会增加线程的总数**。

#### **asynchronous  style **

- 一些希望充分利用硬件的开发人员已经放弃了**每个请求一个线程（thread-per-request）**的 style ，转而采用**线程共享（thread-sharing ）**的 style 。
- 请求处理代码不是从头到尾处理一个线程上的请求，而是在等待 I/O 操作完成时将其线程返回到一个池中，以便该线程能够处理其他请求。这种细粒度的线程共享（其中代码**只在执行计算时保留一个线程**，**而不是在等待 I/O 时保留该线程**）允许大量并发操作，而不需要消耗大量线程。
- 虽然它消除了操作系统线程的稀缺性对吞吐量的限制，但代价很高: 它需要一种所谓的**异步编程 style **，采用一组独立的 I/O 方法，这些方法不等待 I/O 操作完成，而是在以后将其完成信号发送给回调。如果没有专门的线程，开发人员必须将请求处理逻辑分解成小的阶段，通常以 lambda 表达式的形式编写，然后将它们组合成带有 API 的顺序管道(例如，参见 CompletableFuture，或者所谓的“反应性”框架)。因此，它们放弃了语言的基本顺序组合运算符，如循环和 try/catch 块。
- **在异步样式中，请求的每个阶段可能在不同的线程上执行，每个线程以交错的方式运行属于不同请求的阶段**。这对于理解程序行为有着深刻的含义:
  - 堆栈跟踪不提供可用的上下文
  - 调试器不能单步执行请求处理逻辑
  - 分析器不能将操作的成本与其调用方关联。
- 当使用 Java 的流 API 在短管道中处理数据时，组合 lambda 表达式是可管理的，但是当应用程序中的所有请求处理代码都必须以这种方式编写时，就有问题了。这种编程 style 与 Java 平台不一致，**因为应用程序的并发单元（异步管道）不再是平台的并发单元**。

#### 对比

|      | thread-per-request  style                                    | **asynchronous  style **                                     |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 优点 | 与 Java 平台的设计相协调，易于理解、易于编程、易于调试和配置 | 这种细粒度的线程共享允许大量并发操作，而不需要消耗大量线程，提高可伸缩性 |
| 缺点 | 可用线程的数量是有限的，操作系统线程代价高昂，因此我们不能拥有太多线程，这使得实现不适合 thread-per-request style | 这种编程 style 与 Java 平台不一致，**因为应用程序的并发单元（异步管道）不再是平台的并发单元** |



#### 使用虚拟线程保留thread-per-request style 

为了使应用程序能够在与平台保持和谐的同时进行扩展，我们应该通过更有效地实现线程来努力保持每个请求一个线程的 style ，以便它们能够更加丰富。

操作系统无法更有效地实现 OS 线程，因为不同的语言和运行时以不同的方式使用线程堆栈。然而，**Java 运行时实现 Java 线程的方式可以切断它们与操作系统线程之间的一一对应关系**。正如操作系统通过将大量虚拟地址空间映射到有限数量的物理 RAM 而给人一种内存充足的错觉一样，**Java 运行时也可以通过将大量虚拟线程映射到少量操作系统线程而给人一种线程充足的错觉**。

- **虚拟线程**是没有绑定到**特定操作系统线程**的线程。
- **平台线程**是以传统方式实现的线程，作为**围绕操作系统线程的简单包装**。

**thread-per-request 样式**的应用程序代码可以在整个请求期间在虚拟线程中运行，但是虚拟线程**只在 CPU 上执行计算时**使用操作系统线程。其结果是**与异步样式相同的可伸缩性**，除了它是**透明**实现的：

当在虚拟线程中运行的代码调用 `Java.*` API 中的阻塞 I/O 操作时，运行时执行一个非阻塞操作系统调用，并自动挂起虚拟线程，直到稍后可以恢复。

对于 Java 开发人员来说，虚拟线程是**创建成本低廉、数量几乎无限多**的线程。**硬件利用率接近最佳，允许高水平的并发性，从而提高吞吐量**，而应用程序仍然与 Java 平台及其工具的多线程设计保持协调。

#### 虚拟线程的意义

虚拟线程是**廉价**和**丰富**的，因此永远**不应该被共享（即使用线程池）**: 应该为每个应用程序任务创建一个新的虚拟线程。

因此，大多数虚拟线程的**寿命都很短**，并且具有浅层调用堆栈，执行的操作只有单个 HTTP 客户机调用或单个 JDBC 查询那么少。相比之下，**平台线程**是**重量级**和**昂贵**的，因此经常**必须共享**。它们往往是**长期存在**的，具有深度调用堆栈，并且在许多任务之间共享。

总之，虚拟线程保留了可靠的 thread-per-request  style ，这种 style **与 Java 平台的设计相协调**，同时又能**最佳地利用硬件**。使用虚拟线程并不需要学习新的概念，尽管它可能需要为应对当今线程的高成本而养成的忘却习惯。虚拟线程不仅可以帮助应用程序开发人员ーー它们还可以帮助框架设计人员提供易于使用的 API，**这些 API 与平台的设计兼容，同时又不影响可伸缩性**。

## 说明

如今，java.lang 的每一个实例。JDK 中的线程是一个**平台线程**。**平台线程**在**底层操作系统线程**上运行 Java 代码，并在代码的整个生命周期中捕获操作系统线程。**平台线程的数量仅限于操作系统线程的数量**。

虚拟线程是 java.lang 的一个实例。在基础操作系统线程上运行 Java 代码，但在代码的整个生命周期中不捕获该操作系统线程的线程。这意味着**许多虚拟线程可以在同一个 OS 线程上运行它们的 Java 代码**，从而有效地共享它们。平台线程垄断了一个珍贵的操作系统线程，而虚拟线程却没有。虚拟线程的数量可能比操作系统线程的数量大得多。

**虚拟线程是由 JDK 而非操作系统提供的线程的轻量级实现**。它们是**用户模式（*user-mode*）线程**的一种形式，已经在其他多线程语言中取得了成功(例如，Go 中的 goroutines 和 Erlang 的进程)。在 Java 的早期版本中，用户模式线程甚至以所谓的“绿线程”为特色，当时 OS 线程还不成熟和普及。然而，Java 的绿色线程都共享一个 OS 线程(M: 1调度) ，并最终被平台线程超越，实现为 OS 线程的包装器(1:1调度)。虚拟线程采用 M: N 调度，其中大量(M)虚拟线程被调度在较少(N)操作系统线程上运行。

### 虚拟线程 VS 平台线程

#### 简单示例

开发人员可以选择使用虚拟线程还是平台线程。下面是一个创建大量虚拟线程的示例程序。该程序首先获得一个 `ExecutorService`，它将为每个提交的任务创建一个新的虚拟线程。然后，它提交10000项任务，等待所有任务完成:

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        });
    });
}  // executor.close() is called implicitly, and waits
```

本例中的任务是简单的代码(休眠一秒钟) ，现代硬件可以轻松支持10,000个虚拟线程并发运行这些代码。在幕后，JDK 在少数操作系统线程上运行代码，可能只有一个线程。

如果这个程序使用 ExecutorService 为每个任务创建一个新的平台线程，比如 `Executors.newCachedThreadPool ()` ，那么情况就会大不相同。`ExecutorService` 将尝试创建10,000个平台线程，从而创建10,000个 OS 线程，程序可能会崩溃，这取决于计算机和操作系统。

相反，如果程序使用从池中获取平台线程的 `ExecutorService` (例如 `Executors.newFixedThreadPool (200)`) ，情况也不会好到哪里去。`ExecutorService` 将创建200个平台线程，由所有10,000个任务共享，因此许多任务将按顺序运行，而不是并发运行，而且程序将需要很长时间才能完成。对于这个程序，一个有200个平台线程的池只能达到**每秒200个任务**的吞吐量，而虚拟线程达到**每秒10,000个任务**的吞吐量(在充分预热之后)。此外，如果示例程序中的10000被更改为1000000，那么该程序将提交1,000,000个任务，创建1,000,000个并发运行的虚拟线程，并且(在足够的预热之后)实现大约**1,000,000任务/秒**的吞吐量。

如果这个程序中的任务执行一秒钟的计算(例如，对一个巨大的数组进行排序)而不仅仅是休眠，那么增加超出处理器核心数量的线程数量将无济于事，无论它们是虚拟线程还是平台线程。

------

**虚拟线程并不是更快的线程**ーー它们运行代码的速度并不比平台线程快。它们的存在是为了**提供规模(更高的吞吐量)** ，**而不是速度(更低的延迟)**。它们的数量可能比平台线程多得多，因此根据 Little’s Law，它们**能够实现更高吞吐量所需的更高并发性**。

换句话说，虚拟线程可以显著提高应用程序的吞吐量，在如下情况时：

- 并发任务的数量很多(超过几千个) 
- 工作负载不受 CPU 限制，因为在这种情况下，比处理器核心拥有更多的线程并不能提高吞吐量

虚拟线程有助于提高典型服务器应用程序的吞吐量，因为这类应用程序由大量并发任务组成，这些任务花费了大量时间等待。

**虚拟线程可以运行平台线程可以运行的任何代码**。特别是，虚拟线程支持**线程本地变量**和**线程中断**，就像平台线程一样。这意味着处理请求的现有 Java 代码很容易在虚拟线程中运行。许多服务器框架将选择自动执行此操作，为每个传入请求启动一个新的虚拟线程，并在其中运行应用程序的业务逻辑。

------

下面是一个服务器应用程序示例，它**聚合**了另外两个服务的结果。假设的服务器框架(未显示)为每个请求创建一个新的虚拟线程，并在该虚拟线程中运行应用程序的句柄代码。然后，应用程序代码创建两个新的虚拟线程，通过与第一个示例相同的 `ExecutorService` 并发地获取资源:

```java
void handle(Request request, Response response) {
    var url1 = ...
    var url2 = ...
 
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        var future1 = executor.submit(() -> fetchURL(url1));
        var future2 = executor.submit(() -> fetchURL(url2));
        response.send(future1.get() + future2.get());
    } catch (ExecutionException | InterruptedException e) {
        response.fail(e);
    }
}
 
String fetchURL(URL url) throws IOException {
    try (var in = url.openStream()) {
        return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    }
}
```

这样的服务器应用程序使用简单的阻塞代码，可以很好地扩展，因为它可以使用大量虚拟线程。

`NewVirtualThreadPerTaskExector ()`并不是创建虚拟线程的唯一方法。新的 [`java.lang.Thread.Builder`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.Builder.html)。可以创建和启动虚拟线程。此外，**结构化并发**提供了一个更强大的 API 来创建和管理虚拟线程，特别是在类似于这个服务器示例的代码中，通过这个 API，平台及其工具可以了解线程之间的关系。

### 虚拟线程是一个预览 API，默认情况下是禁用的

上面的程序使用 `Executors.newVirtualThreadPerTaskExector ()`方法，因此要在 JDK 19上运行它们，必须启用以下预览 API:

- 使用`javac --release 19 --enable-preview Main.java`编译该程序，并使用 `java --enable-preview Main` 运行该程序；或者：
- 在使用源代码启动程序时，使用 `java --source 19 --enable-preview Main.java ` 运行程序； 或者：
- 在使用 jshell 时，使用  `jshell --enable-preview` 启动它。

### 不要共享（pool）虚拟线程

开发人员通常会将应用程序代码从传统的基于线程池的 `ExecutorService` 迁移到每个任务一个虚拟线程的 `ExecutorService`。与所有资源池一样，线程池旨在共享昂贵的资源，但虚拟线程并不昂贵，而且从不需要共享它们。

开发人员有时使用线程池来限制对有限资源的并发访问。例如，如果一个服务不能处理超过20个并发请求，那么通过提交给大小为 20 的池的任务将确保执行对该服务的所有访问。因为平台线程的高成本使得线程池无处不在，所以这个习惯用法也变得无处不在，但是开发人员不应该为了限制并发性而将虚拟线程集中起来。应该使用专门为此目的设计的构造(如信号量semaphores)来保护对有限资源的访问。这比线程池更有效、更方便，也更安全，因为不存在线程本地数据从一个任务意外泄漏到另一个任务的风险。

### 观测

编写清晰的代码并不是故事的全部。对于故障排除、维护和优化来说，清晰地表示正在运行的程序的状态也是必不可少的，JDK 长期以来一直提供调试、概要分析和监视线程的机制。这样的工具对虚拟线程也应该这样做ーー也许要适应它们的大量数据ーー因为它们毕竟是 `java.lang.Thread` 的实例。

Java 调试器可以**单步执行**虚拟线程、**显示调用堆栈**和**检查堆栈帧中的变量**。**JDK Flight Recorder (JFR)**是 JDK 的低开销分析和监视机制，可以将来自应用程序代码的事件(比如对象分配和 I/O 操作)与正确的虚拟线程关联起来。

这些工具不能为以异步样式编写的应用程序做这些事情。在这种风格中，任务与线程无关，因此调试器不能显示或操作任务的状态，分析器也不能告诉任务等待 I/O 所花费的时间。

**线程转储（ thread dump）**是另一种流行的工具，用于以每个请求一个线程的样式编写的应用程序的故障排除。遗憾的是，通过 jstack 或 jcmd 获得的 JDK 传统线程转储提供了一个扁平的线程列表。这适用于数十或数百个平台线程，但不适用于数千或数百万个虚拟线程。因此，我们将不会扩展传统的线程转储以包含虚拟线程，而是在 jcmd 中引入一种新的线程转储，以显示平台线程旁边的虚拟线程，所有这些线程都以一种有意义的方式进行分组。当程序使用结构化并发时，可以显示线程之间更丰富的关系。

因为可视化和分析大量的线程可以从工具中受益，所以 jcmd 除了纯文本之外，还可以发布 JSON 格式的新线程转储:

```shell
$ jcmd <pid> Thread.dump_to_file -format=json <file>
```

新的线程转储格式列出了在网络 I/O 操作中被阻塞的虚拟线程，以及由上面所示的 new-thread-per-task ExecutorService 创建的虚拟线程。它不包括对象地址、锁、 JNI 统计信息、堆统计信息以及传统线程转储中出现的其他信息。此外，由于可能需要列出大量线程，因此生成新的线程转储并不会暂停应用程序。

下面是这样一个线程转储的示例，它取自类似于上面第二个示例的应用程序，在 JSON 查看器中呈现(单击可放大) :

![img](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/threaddump-700.png)

由于虚拟线程是在 JDK 中实现的，并且不绑定到任何特定的操作系统线程，因此它们对操作系统是不可见的，操作系统不知道它们的存在。操作系统级别的监视将观察到，JDK 进程使用的操作系统线程比虚拟线程少。

### 调度

为了完成有用的工作，需要调度一个线程，也就是分配给处理器核心执行。对于作为 OS 线程实现的平台线程，JDK 依赖于 OS 中的调度程序。相比之下，对于虚拟线程，JDK 有自己的调度程序。JDK 的调度程序不直接将虚拟线程分配给处理器，而是**将虚拟线程分配给平台线程(这是前面提到的虚拟线程的 M: N 调度)。然后，操作系统像往常一样调度平台线程**。

JDK 的虚拟线程调度程序是一个在 FIFO 模式下运行的**工作窃取(work-stealing)**的 `ForkJoinPool`。调度程序的并行性是可用于调度虚拟线程的平台线程的数量。默认情况下，它等于可用处理器的数量，但是可以使用系统属性 `jdk.viralThreadScheduler.allelism` 对其进行调优。注意，这个 ForkJoinPool 不同于公共池，例如，公共池用于并行流的实现，公共池以 LIFO 模式运行。

- 虚拟线程无法获得载体（即负责调度虚拟线程的平台线程）的标识。由 `Thread.currentThread ()`返回的值始终是**虚拟线程本身**。
- 载体和虚拟线程的堆栈跟踪是分离的。在虚拟线程中抛出的异常将不包括载体的堆栈帧。线程转储不会显示虚拟线程堆栈中其载体的堆栈帧，反之亦然。
- 虚拟线程不能使用载体的线程本地变量，反之亦然。

此外，从 Java 代码的角度来看，虚拟线程及其载体平台线程临时共享操作系统线程的事实是不存在的。相比之下，从本机代码的角度来看，虚拟线程及其载体都在同一个本机线程上运行。因此，在同一虚拟线程上多次调用的本机代码可能会在每次调用时观察到不同的 OS 线程标识符。

调度程序当前没有实现虚拟线程的时间共享。分时是对消耗了分配的 CPU 时间的线程的强制抢占。虽然在平台线程数量相对较少且 CPU 利用率为100% 的情况下，分时可以有效地减少某些任务的延迟，但是对于一百万个虚拟线程来说，分时是否有效尚不清楚。

### 执行

要利用虚拟线程，不必重写程序。虚拟线程不需要或期望应用程序代码显式地将控制权交还给调度程序; 换句话说，虚拟线程不是可协作的。用户代码不能假设如何或何时将虚拟线程分配给平台线程，就像它不能假设如何或何时将平台线程分配给处理器核心一样。

为了在虚拟线程中运行代码，JDK 的虚拟线程调度程序通过将虚拟线程挂载到平台线程上来分配要在平台线程上执行的虚拟线程。这使得平台线程成为虚拟线程的载体。稍后，在运行一些代码之后，虚拟线程可以从其载体卸载。此时平台线程是空闲的，因此调度程序可以在其上挂载不同的虚拟线程，从而使其再次成为载体。

通常，当虚拟线程阻塞 I/O 或 JDK 中的其他阻塞操作(如 `BlockingQueue.take ()`)时，它将卸载。当阻塞操作准备完成时(例如，在套接字上已经接收到字节) ，它将虚拟线程提交回调度程序，调度程序将在运营商上挂载虚拟线程以恢复执行。

虚拟线程的挂载和卸载频繁且透明，并且不会阻塞任何 OS 线程。例如，前面显示的服务器应用程序包含以下代码行，其中包含对阻塞操作的调用:

```java
response.send(future1.get() + future2.get());
```

这些操作将导致虚拟线程多次挂载和卸载，通常每个 `get ()`调用一次，在 `send (...)`中执行 I/O 过程中可能多次挂载和卸载。

JDK 中的绝大多数阻塞操作将卸载虚拟线程，**从而释放其载体和底层操作系统线程，使其承担新的工作**。但是，JDK 中的一些阻塞操作不会卸载虚拟线程，因此阻塞了其载体和底层 OS 线程。这是由于**操作系统级别**(例如，许多文件系统操作)或 **JDK 级别**(例如，`Object.wait ()`)的限制造成的。这些阻塞操作的实现将**通过暂时扩展调度程序的并行性来补偿对 OS 线程的捕获**。因此，调度程序的 `ForkJoinPool` 中的平台线程的数量可能会暂时超过可用处理器的数量。可以使用系统属性 `jdk.viralThreadScheduler.maxPoolSize` 调优调度程序可用的最大平台线程数。

------

有两种情况下，在阻塞操作期间无法卸载虚拟线程，因为它被固定在其载体上:

- 当它在**同步块或方法**内执行代码时，或
- 当它执行**本机方法或外部函数**时。

固定并不会导致应用程序不正确，但它可能会妨碍应用程序的**可伸缩性**。如果虚拟线程在固定时执行阻塞操作(如 I/O 或 **BlockingQueue.take ()**) ，那么它的载体和底层操作系统线程将在操作期间被阻塞。长时间的频繁固定会通过捕获运营商而损害应用程序的可伸缩性。

调度程序不会通过扩展其并行性来补偿固定。相反，可以通过修改频繁运行的同步块或方法来避免频繁和长时间的固定，并保护潜在的长 I/O 操作来使用 `java.util.concurrent.locks.ReentrantLock`。不需要替换不常使用的同步块和方法(例如，只在启动时执行)或保护内存操作的同步块和方法。一如既往，努力保持锁定策略的简单明了。

------

新的诊断有助于将代码迁移到虚拟线程，以及评估是否应该使用 `java.util.concurrent` lock 替换同步的特定用法:

- 当线程在固定时阻塞时，会发出 JDK JFR事件。
- 当线程在固定时阻塞时，系统属性 `jdk.tracePinnedThreads` 触发堆栈跟踪。使用`-Djdk.tracePinnedThreads = full` 运行会在线程被固定时打印一个完整的堆栈跟踪，并突出显示保存监视器的本机框架和框架。使用`-Djdk.tracePinnedThreads = short` 将输出限制为有问题的帧。

### 内存使用和垃圾回收

**虚拟线程的堆栈**作为**堆栈块对象**存储在 **Java 的垃圾回收堆**中。堆栈随着应用程序的运行而增长和缩小，这既是为了提高内存效率，也是为了容纳任意深度的堆栈(直到 JVM 配置的平台线程堆栈大小)。这种效率支持大量的虚拟线程，因此服务器应用程序中每个请求一个线程的风格可以继续存在。

在上面的第二个例子中，回想一下，一个假设的框架通过创建一个新的虚拟线程并调用 handle 方法来处理每个请求； 即使它在深度调用堆栈的末尾调用 handle (在身份验证、事务处理等之后) ，handle 本身也会产生多个虚拟线程，这些虚拟线程只执行短暂的任务。因此，**对于每个具有深层调用堆栈的虚拟线程，都会有多个具有浅层调用堆栈的虚拟线程，这些虚拟线程消耗的内存很少**。

------

通常，虚拟线程所需的堆空间和垃圾收集器活动的数量很难与异步代码的数量相比较。**一百万个虚拟线程至少需要一百万个对象，但是共享一个平台线程池的一百万个任务也需要一百万个对象**。此外，处理请求的应用程序代码通常跨 I/O 操作维护数据。每个请求一个线程的代码可以将这些数据保存在本地变量中：

- 这些本地变量存储在**堆中的虚拟线程堆栈**中
- 异步代码必须将这些数据保存在从管道的一个阶段传递到下一个阶段的**堆对象**中

一方面，虚拟线程需要的堆栈帧布局比紧凑对象更浪费; 另一方面，虚拟线程可以在许多情况下变异和重用它们的堆栈(取决于低级 GC 交互) ，而异步管道总是需要分配新对象，因此虚拟线程可能需要更少的分配。

总的来说，每个请求线程与异步代码的堆消耗和垃圾收集器活动应该大致相似。随着时间的推移，我们希望使虚拟线程堆栈的内部表示更加紧凑。

与平台线程堆栈不同，虚拟线程堆栈不是 GC 根，所以它们中包含的引用不会被执行并发堆扫描的垃圾收集器(比如 G1)在 stop-the-world 暂停中遍历。这也意味着，**如果一个虚拟线程被阻塞，例如 `BlockingQueue.take ()` ，并且没有其他线程可以获得对虚拟线程或队列的引用，那么线程就可以被垃圾收集**ーー这很好，**因为虚拟线程永远不会被中断或解除阻塞**。当然，如果虚拟线程正在运行，或者它被阻塞并且可能被解除阻塞，那么它将不会被垃圾收集。

当前虚拟线程的一个限制是 G1 GC 不支持大型堆栈块对象。如果虚拟线程的堆栈达到区域大小的一半(可能小到512KB) ，那么可能会抛出 StackOverfloError。

## 具体变化

### java.lang.Thread

- [`Thread.Builder`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.Builder.html), [`Thread.ofVirtual()`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#ofVirtual()), 和 [`Thread.ofPlatform()`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#ofPlatform()) 是创建虚拟线程和平台线程的新 API，例如：

  ```
  Thread thread = Thread.ofVirtual().name("duke").unstarted(runnable);
  ```

  创建一个新的未启动的虚拟线程“ duke”。

- [`Thread.startVirtualThread(Runnable)`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#startVirtualThread(java.lang.Runnable)) 是创建然后启动虚拟线程的一种方便的方法。

- `Thread.Builder`  可以创建线程或 [`ThreadFactory`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/util/concurrent/ThreadFactory.html), 后者可以创建具有相同属性的多个线程。

- [`Thread.isVirtual()`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#isVirtual()) 测试是否一个线程是一个虚拟的线程。

- [`Thread.join`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#join(java.time.Duration)) 和 [`Thread.sleep`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#sleep(java.time.Duration)) 的新重载接受等待和睡眠时间作为[`java.time.Duration`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/time/Duration.html)的实例。

- 新的 final 方法 [`Thread.threadId()`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#threadId()) 返回线程的标识符。现在不推荐使用现有的非 final 方法  [`Thread.getId()`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#getId()) 。

- [`Thread.getAllStackTraces()`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#getAllStackTraces()) 现在返回所有平台线程的映射，而不是所有线程的映射。

`java.lang.Thread` API其他方面没有改变。构造器也无新变化。

虚拟线程和平台线程之间的主要 API 差异是:

- 公共线程构造函数不能创建虚拟线程。
- **虚拟线程始终是守护进程线程**，`Thread.setDaemon (boolean)`方法不能将虚拟线程更改为非守护进程线程。
- 虚拟线程有一个**固定的 [`Thread.NORM_PRIORITY`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#NORM_PRIORITY) 优先级**。[`Thread.setPriority(int)`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#setPriority(int))方法对虚拟线程没有影响。在将来的版本中可能会重新讨论这个限制。
- 虚拟线程不是线程组的活动成员。在虚拟线程上调用时，[`Thread.getThreadGroup()`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#getThreadGroup()) 返回一个名为“ VirtualThreads”的占位符线程组。The `Thread.Builder` API 不定义设置虚拟线程的线程组的方法。
- 使用 SecurityManager 集运行时，虚拟线程没有权限。
- 虚拟线程不支持  [`stop()`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#stop()), [`suspend()`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#suspend()), 或 [`resume()`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#resume())方法。这些方法在虚拟线程上调用时引发异常。

### Thread-local variables

虚拟线程支持线程局部变量([`ThreadLocal`](https://docs.oracle.com/en/java/javase/18/docs/api/java.base/java/lang/ThreadLocal.html))和可继承的线程局部变量([`InheritableThreadLocal`](https://docs.oracle.com/en/java/javase/18/docs/api/java.base/java/lang/InheritableThreadLocal.html)) ，就像平台线程一样，因此它们可以运行使用线程局部变量的现有代码。但是，由于虚拟线程可能非常多，所以应该在仔细考虑之后使用线程局部变量。

特别是，不要使用线程局部变量在线程池中共享同一线程的多个任务之间共享昂贵的资源。虚拟线程永远不应该被共享，因为每个线程在其生存期内只能运行一个任务。我们已经从 java.base 模块中移除了许多线程局部变量的使用，以便为虚拟线程做准备，从而减少在使用数百万个线程运行时的内存占用。

此外:

- The `Thread.Builder` API  定义了一个在创建线程时选择不使用线程局部变量的方法（[a method to opt-out of thread locals when creating a thread](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.Builder.html#allowSetThreadLocals(boolean))）。它还定义了一个方法来选择不继承可继承线程局部变量的初始值（ [a method to opt-out of inheriting the initial value of inheritable thread-locals](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.Builder.html#inheritInheritableThreadLocals(boolean))）。当从不支持线程局部变量的线程调用时， [`ThreadLocal.get()`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/ThreadLocal.html#get())返回初始值，[`ThreadLocal.set(T)`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/ThreadLocal.html#set(T)) 抛出异常。
- 遗留上下文类加载器（ [context class loader](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#getContextClassLoader())）现在被指定为像可继承的线程本地一样工作。如果在不支持线程局部变量的线程上调用  [`Thread.setContextClassLoader(ClassLoader)`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/Thread.html#setContextClassLoader(java.lang.ClassLoader))，那么它将引发异常。

在某些用例中，作用域局部变量（[Scope-local variables](https://openjdk.java.net/jeps/8263012) ）可能是线程局部变量的更好替代方案。

### java.util.concurrent

支持锁定的基本 API, [`java.util.concurrent.LockSupport`](https://docs.oracle.com/en/java/javase/18/docs/api/java.base/java/util/concurrent/locks/LockSupport.html), 现在支持虚拟线程： 停靠虚拟线程将释放底层平台线程来执行其他工作，而取消停靠虚拟线程将安排其继续。对 `LockSupport` 的这种改变使得所有使用它的 API (锁、信号量、阻塞队列等)在虚拟线程中调用时能够优雅地停放。

此外：

- [`Executors.newThreadPerTaskExecutor(ThreadFactory)`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/util/concurrent/Executors.html#newThreadPerTaskExecutor(java.util.concurrent.ThreadFactory))和[`Executors.newVirtualThreadPerTaskExecutor()`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/util/concurrent/Executors.html#newVirtualThreadPerTaskExecutor()) 创建一个 `ExecutorService` 。该Service为每个任务创建一个新线程。这些方法支持与使用线程池和 ExecutorService 的现有代码的迁移和互操作性。
- [`ExecutorService`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/util/concurrent/ExecutorService.html) 现在继承 [`AutoCloseable`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/lang/AutoCloseable.html), 因此允许这个 API 与上面的示例所示的 try-with-resource 结构一起使用。
- [`Future`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/util/concurrent/Future.html) 现在定义了**获取已完成任务的结果或异常**以及**获取任务状态**的方法。结合起来，这些添加使得使用 Future 对象作为流的元素变得很容易，过滤一个 Future 流来查找已完成的任务，然后映射它来获得一个结果流。对于为结构化并发提出的 API 添加，这些方法也很有用。

### Networking

网络 API 在`java.net` 和`java.nio.channels` 包中的实现现在与虚拟线程一起工作: 虚拟线程上的一个操作阻塞，例如，建立网络连接或从套接字读取，释放底层平台线程来做其他工作。

为了允许中断和取消， [`java.net.Socket`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/net/Socket.html)定义的阻塞 I/O 方法、[`ServerSocket`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/net/ServerSocket.html) 和 [`DatagramSocket`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/net/DatagramSocket.html)  现在被指定为在虚拟线程中调用时是**可中断**的： 中断套接字上被阻塞的虚拟线程将释放线程并关闭套接字。

当从 [`InterruptibleChannel`](https://download.java.net/java/early_access/loom/docs/api/java.base/java/nio/channels/InterruptibleChannel.html)  获取时，这些类型套接字上的阻塞 I/O 操作总是可中断的，因此这种更改使这些 API 在创建时的行为与从通道获取时的构造函数的行为保持一致。

#### java.io

The `java.io` 包为字节和字符流提供 API。这些 API 的实现是高度同步的，需要进行更改以避免在虚拟线程中使用被固定。

在底层中，面向字节的输入/输出流没有指定为线程安全的，也没有指定在读或写方法中阻塞线程时调用  `close()` 时的预期行为。在大多数情况下，使用来自多个并发线程的特定输入或输出流是没有意义的。面向字符的读/写器也没有被指定为线程安全的，但是它们确实为子类公开了一个锁对象。除了固定外，这些类中的同步还存在问题和不一致; 例如， `InputStreamReader` 和 `OutputStreamWriter` 使用的流解码器和编码器在流对象而不是锁对象上进行同步。

为了防止固定，现在的实现如下:

- `BufferedInputStream`, `BufferedOutputStream`, `BufferedReader`, `BufferedWriter`, `PrintStream`, 和 `PrintWriter` 现在在直接使用时使用显式锁而不是监视器。当这些类被子类化时，它们与以前一样进行同步。
- `InputStreamReader` 和  `OutputStreamWriter` 使用的流解码器和编码器现在使用与封闭的 `InputStreamReader` 或  `OutputStreamWriter` 相同的锁。

更进一步并消除所有这些常常不必要的锁定超出了本文的范围。

此外，`BufferedOutputStream`、 `BufferedWriter` 和 `OutputStreamWriter` 的流编码器使用的缓冲区的初始大小现在更小了，以便在堆中有许多流或写入器时减少内存使用ーー如果有一百万个虚拟线程，每个线程在套接字连接上都有一个缓冲流，就可能出现这种情况。

## 总结

虚拟线程提供了使用线程池共享平台线程以达到异步之外的另一种更加可调试、可跟踪、可分析的高并发方式。

曾经 Java 开发者们面对GO对高并发的友好支持只能干瞪眼，而现在让我们拥抱属于 Java 的高并发未来。

## 参考文章

[JEP 425: Virtual Threads (Preview) (openjdk.org)](https://openjdk.org/jeps/425)