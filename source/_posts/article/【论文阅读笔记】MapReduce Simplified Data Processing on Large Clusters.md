---
title: 【论文阅读笔记】MapReduce：Simplified Data Processing on Large Clusters
date: 2022-08-02 16:51:33
tags: 
- 分布式
- 论文笔记
categories:
- 论文笔记
---

## 0 摘要

`MapReduce` 是一个用于处理和生成大型数据集的编程模型和相关实现。

- 用户指定一个 `map` 函数 处理一个key/value对来生成一组中间 key/value对 （把大规模的问题分解为子问题）
- 以及一个 `reduce` 函数 来合并与同一个中间键相关的所有中间值（把子问题的解汇总）

许多现实世界的任务都可以用这个模型来表达，正如本文所示。

以这种函数式风格编写的程序会**自动并行化**，并在大型商用机器集群上执行。**运行时系统**负责对输入数据进行**分区**、在一组机器上**调度**程序执行、处理机器故障以及管理所需的**机器间通信**等细节。这使得没有任何并行和分布式系统经验的程序员可以轻松地利用大型分布式系统的资源。

我们的 `MapReduce` 实现运行在一个大型商用机器集群上，具有**高度的可伸缩性**:一个典型的 `MapReduce` 计算在数千台机器上处理许多tb级别的数据。

## 1 介绍

在过去的几年里，作者和谷歌的许多其他人已经实现了数百个处理**大量原始数据**的专用计算，如爬行文档、web请求日志等，来计算各种**派生数据**，如倒排索引、web文档图结构的各种表示、每个主机爬行页面数的摘要、给定一天中最频繁查询的集合等。

大多数这样的计算在概念上都很简单。然而，输入数据通常很大，为了在合理的时间内完成计算，必须将计算**分布**在数百或数千台机器上。如何并行计算、分发数据和处理故障的问题，使原始的简单计算与处理这些问题的大量复杂代码一起变得晦涩难懂。

为了解决上述复杂的问题，我们设计一个新的抽象模型，使用这个抽象模型，我们只要表述我们想要执行 的简单运算即可，而不必关心并行计算、容错、数据分布、负载均衡等复杂的细节，这些问题都被封装在了一个库里面。

我们意识到，我们的大多数计算都涉及到如下两个步骤：

- 对**输入中的每个逻辑“记录”**应用一个`map `操作，以便计算一组中间 key/value 对。
- 然后对**共享相同键的所有值**应用一个`reduce` 操作，以便适当地**组合**派生数据。

我们可以从解决大规模数据广义衍生为解决大规模问题：

- 把大规模的问题**分解**为子问题
- 把子问题的解**汇总**

使用 `MapReduce` 模型，再结合用户实现的 `Map` 和 `Reduce` 函数，我们就可以非常容易的实现大规模并行化计算；通过 `MapReduce` 模型自带的“再次执行”（re-execution）功能，也提供了初级的容灾实现方案。

这项工作（实现一个` MapReduce `框架模型）的主要贡献是通过一个简单而强大的**接口**，来实现自动的并行化和大规模的分布式计算，结合该接口的实现，可以在大型商用pc集群上实现**高性能**。

## 2 编程模型

计算过程接受一组输入key/value对，并生成一组输出key/value对。`MapReduce`库的用户将计算表达为两个函数: `Map `和 `Reduce `。

由用户编写的 `Map `接受一个输入对，并生成一组中间key/value对。`MapReduce `库将所有与同一中间键 I  相关联的中间值分组在一起，并将它们传递给 `Reduce `函数。

同样由用户编写的 `Reduce `函数接受一个中间键 I 和该键的一组值。它将这些值合并在一起，形成一个可能更小的值集。通常，每次 `Reduce `调用只产生0或1个输出值。中间值通过迭代器提供给用户的 `reduce `函数。这允许我们处理过大而无法放入内存的值列表。

### 2.1 简单例子

考虑计算每个单词在大型文档集合中出现的次数的问题。用户会编写类似以下伪代码的代码:

```c++
map(String key, String value):
    // key: document name 
    // value: document contents
    for each word w in value:
    	EmitIntermediate(w, "1");	
    	
reduce(String key, Iterator values):
    // key: a word 
    // values: a list of counts 
    int result = 0; 
    for each v in values:
    	result += ParseInt(v);
    Emit(AsString(result));
```

`map `函数输出每个单词以及相关的出现次数(在这个简单的例子中只有“1”)。`reduce `函数将对特定单词输出的所有计数求和。

此外，用户编写代码以使用输入和输出文件的名称以及可选的调整参数来填充 `mapreduce` 规范对象。然后用户调用 `MapReduce` 函数，将规范对象传递给它。用户的代码与 `MapReduce` 库（用 C++ 实现）链接在一起。附录 A 包含此示例的完整程序文本。

### 2.2 类型

尽管前面的伪代码是根据字符串输入和输出编写的，但从概念上讲，用户提供的 map 和 reduce 函数具有关联的类型：

```
map (k1,v1) → list(k2,v2)

reduce (k2,list(v2)) → list(v2)
```

即，输入键和值来自与输出键和值不同的域。此外，中间键和值与输出键和值来自同一域。

- k1和v1是原始的输入key和value；
- list(k2, v2)是`map`把k1和v1分布式计算后的中间结果集合；
- reduce(k2, list(v2))是`reduce`函数根据k2的值来合并v2；
- 最终我们想要得到的结果是list(v2)。

### 2.3 更多应用场景

下面是一些有趣的程序的简单示例，可以很容易地表示为 MapReduce 计算。

- **分布式 Grep（Distributed Grep）**：

  - 如果匹配提供的模式，`map` 函数会输出一行。
  - `reduce` 函数是一个恒等函数，它只是将提供的中间数据复制到输出。
  - 得到匹配的文本行。

- **URL访问频率计数（Count of URL Access Frequency）**：

  - `map ` 函数处理网页请求和输出的日志`〈URL，1〉`。 
  - `reduce` 函数将同一 URL 的所有值相加并输出` <URL, total count> `对。
  - 得到总访问数 total count。

- **倒转 Web 链接图（Reverse Web-Link Graph）**：

  - `map` 函数为每个指向名为 source 的页面中找到的 target URL 的链接输出`<target, source> `对。
  - `reduce` 函数组合与给定 target  URL关联的所有source URL为list，并输出`<target, list(source)>`对
  - 得到与 target 页面相链接的所有 source集合

- **每个Host的检索词向量(Term-Vector)**：

  -  `map` 函数为每个输入文档输出一个 `<hostname, term vector>` 对（其中主机名是从文档的 URL 中提取的）。
  -  `reduce` 函数传递给定主机的所有每个文档的Term-Vector。它将这些 Term-Vector 加在一起，丢弃不常见的项，然后输出最终的`〈hostname, term vector〉`对。

  > **Term-Vector** : Term-Vector 将文档或一组文档中出现的最重要的词总结为 `<word, frequency> `对的list
  >
  > - word：一个或一组文档中的某一个单词
  > - frequency：该 word 出现的频率

- **倒排索引（Inverted Index）**：
  - `map` 函数解析每个文档，并输出一系列 `<word, document ID>` 对。
  - `reduce` 函数接受给定单词的所有对，对相应的文档 ID 进行排序并输出 `<word, list(document ID)>` 对。
  - 所有输出对的集合形成一个简单的倒排索引。很容易增加这种计算来跟踪单词的位置。
- **分布式排序（Distributed Sort）**：
  - `map `函数从每条记录中提取键，并输出` <key, record> `对。
  - `reduce `函数不变地输出所有对。
  - 此计算取决于第 4.1 节中描述的**分区工具**和第 4.2 节中描述的**排序属性**。

## 3 实现

`MapReduce` 模型可以有多种不同的实现方式。如何正确选择取决于具体的环境。例如，一种实现方式适用于小型的共享内存方式的机器，另外一种实现方式则适用于大型NUMA架构的多处理器的主机，而有的 实现方式更适合大型的网络连接集群。

本章节描述一个适用于Google内部广泛使用的运算环境的实现：用以太网交换机连接、由普通PC机组成 的大型集群。在我们的环境里包括：

1. x86架构、运行Linux操作系统、双处理器、2-4GB内存的机器。 
2. 普通的网络硬件设备，每个机器的带宽为百兆或者千兆，但是远小于网络的平均带宽的一半。 
3. 集群中包含成百上千的机器，因此，机器故障是常态。 
4. 存储为廉价的内置IDE硬盘。一个内部分布式文件系统用来管理存储在这些磁盘上的数据。文件系统通过数据复制来在不可靠的硬件上保证数据的可靠性和有效性。 
5. 用户提交工作（job）给调度系统。每个工作（job）都包含一系列的任务（task），调度系统将这些任务调度到集群中多台可用的机器上。

### 3.1 执行概述

通过将 `map` 调用的输入数据自动**分割**为 **M** 个数据片段的集合，`map` 调用被分布到多台机器上执行。输入的数据片段能够在不同的机器上**并行**处理。使用**分区函数**将 `map` 调用产生的中间key值分成 **R** 个不同分区（例如，`hash(key) mod R`），`reduce` 调用也被分布到多台机器上执行。分区数量（**R**）和**分区函数**由用户来指定。

![image-20220801230840256](C:\Users\yumo\AppData\Roaming\Typora\typora-user-images\image-20220801230840256.png)

​                             						                                   （图 1）

图 1 展示了我们的 `MapReduce` 实现中操作的全部流程。当用户调用 `MapReduce` 函数时，将发生下面的一系列动作（图 1 中的编号标签对应于下面的编号）：

1. 用户程序首先调用的 `MapReduce` 库将输入文件分成 **M** 个数据片度，每个数据片段的大小一般从 16MB 到64MB (可以通过可选的参数来控制每个数据片段的大小) 。然后用户程序在机群中创建大量的程序副本。  
2. 这些程序副本中的有一个特殊的程序 – `master`。副本中其它的程序都是 `worker` 程序，由 `master` 分配任务。有 **M** 个 `map` 任务和 **R** 个 `reduce` 任务将被分配。`master` 挑选空闲的 `worker`，并为每一个 `worker` 分配一个 `map` 任务或一个 `reduce` 任务
3. 被分配了 `map` 任务的 `worker`程序读取相关的输入数据片段，从输入的数据片段中解析出 key/value pair，然后把 key/value pair传递给用户自定义的 `map` 函数，由 `map` 函数生成并输出的中间 key/value pair，并缓存在内存中。 
4. 缓存中的 key/value pair通过分区函数分成R个区域，之后周期性的写入到本地磁盘。缓存的 key/value pair在本地磁盘上的存储位置将被回传给 `master`，由 `master`负责把这些存储位置再传送给 `Reduce worker`。 
5. 当 `Reduce worker` 程序接收到 `master` 程序发来的数据存储位置信息后，使用 **RPC（ remote procedure calls）** 从 `Map worker` 所在主机的磁盘上读取这些缓存数据。当 `Reduce worker` 读取了所有的中间数据后，通过对 key 进行排序后使得具有相同 key 值的数据聚合在一起。由于通常许多不同的 key 值会映射到相同的 `reduce` 任务上，因此必须进行排序。如果中间数据太大无法在内存中完成排序，那么就要在外部进行排序。 
6. `Reduce worker` 程序遍历排序后的中间数据，对于每一个唯一的中间 key 值，`Reduce worker` 程序将这个 key 值和它相关的中间 value 值的集合传递给用户自定义的 `reduce` 函数。`reduce` 函数的输出被追加到所属分区的最终输出文件。
7. 当所有的 `map` 和 `reduce` 任务都完成之后，`master` 唤醒用户程序。在这个时候，在用户程序里的对  `MapReduce` 调用才返回到用户程序本身。

在成功完成任务之后，`MapReduce` 的输出存放在 **R** 个输出文件中（对应每个 `reduce` 任务产生一个输出文件，文件名由用户指定）。一般情况下，用户不需要将这 **R** 个输出文件合并成一个文件 – 他们经常把这些文件作为另外一个 `MapReduce` 的输入，或者在另外一个可以处理多个分割文件的分布式应用中使用。

### 3.2 Master 数据结构

`master` 持有一些数据结构，它存储每一个 `map` 和 `reduce` 任务的状态（空闲、工作中或已完成)，以及 `worker` 机器(非空闲任务的机器)的标识。

`master` 就像一个数据管道，中间文件存储区域的位置信息通过这个管道从 `map` 传递到 `reduce`。因此，对于每个已经完成的 `map` 任务，`master` 存储了 `map` 任务产生的 **R** 个中间文件存储区域的大小和位置。当 `map` 任务完成时，`master` 接收到位置和大小的更新信息，这些信息被逐步地推送给那些正在工作的 `reduce` 任务.

### 3.3 容错

因为 `MapReduce` 库的设计初衷是使用由成百上千的机器组成的集群来处理超大规模的数据，所以，这个库必须要能很好的处理机器故障。

#### **worker故障** 

`master` 周期性的 pin g每个 `worker`。如果在一个约定的时间范围内没有收到 `worker` 返回的信息，`master` 将把这个 `worker` 标记为**失效**。所有由这个失效的 `worker` 完成的 `map` 任务被重设为初始的**空闲**状态，之后 这些任务就可以被安排给其他的 `worker`。同样的，`worker` 失效时**正在运行**的 `map` 或 `reduce` 任务也将被重新置为**空闲**状态，等待重新调度。

当 `worker` 故障时，由于已经完成的 `map` 任务的输出存储在这台机器上，`map` 任务的输出已不可访问了，因此必须重新执行。而已经完成的 `reduce` 任务的输出存储在全局文件系统上，因此不需要再次执行。

当一个 `map` 任务首先被 `worker A `执行，之后由于 `worker A` 失效了又被调度到 `worker B` 执行，这个“重新 执行”的动作会被通知给所有执行 `reduce` 任务的 `worker`。任何还没有从`worker A`读取数据的 `reduce` 任务将从 `worker B` 读取数据。

`MapReduce` 可以处理大规模 `worker` 失效的情况。比如，在一个 `MapReduce` 操作执行期间，在正在运行 的集群上进行网络维护引起80台机器在几分钟内不可访问了，`MapReduce master `只需要简单的再次执 行那些不可访问的 `worker` 完成的工作，之后继续执行未完成的任务，直到最终完成这个 `MapReduce` 操 作。

#### **master失败** 

一个简单的解决办法是让 `master` 周期性的将上面描述的数据结构写入磁盘，即**检查点（checkpoint）**。如果这个 `master` 任务失效了，可以从最后一个检查点（checkpoint）开始启动**新一个master进程**。然而，由于只有一个 `master` 进程，`master` 失效后再恢复是比较麻烦的.

因此我们现在的实现是如果 `master` 失效，就**中止** `MapReduce` 运算。客户端可以检查到这个状况，并且可以根据需要**重新执行** `MapReduce` 操作。

#### **在失效方面的处理机制**

**强语义**：当用户提供的 `map` 和 `reduce` 操作是输入**确定性函数**（即相同的输入产生相同的输出）时，我们的分布式实现在任何情况下的输出，都和整个程序（无错且顺序执行）所产生的输出是一样的。这个**特性**称为**强语义**。

我们依赖对 `map` 和 `reduce` 任务的输出是**原子**提交的来完成这个特性。

1. 每个工作中的任务把它的输出写到私有的临时文件中。每个 `reduce` 任务生成一个这样的文件，而每个 `map` 任务则生成 **R** 个这样的文件（一个  `reduce` 任务对应一个文件）。

2. 当一个 `map` 任务完成时，`worker` 发送一个包含 **R** 个临时文件名的完成消息给 `master`。

3. 如果 `master` 从一个已经完成的 `map` 任务再次接收到到一个完成消息，`master` 将忽略这个消息；否则，`master` 将这 **R** 个文件的名字记录在数据结构里。

4. 当 `reduce` 任务完成时，`Reduce worker` 进程以**原子**的方式把临时文件重命名为最终的输出文件。

   如果同一个 `reduce` 任务在多台机器上执行，针对同一个最终输出文件将有多个重命名调用执行。我们依赖**底层文件系统**提供的**重命名操作的原子性**来保证最终的文件系统状态仅仅包含一个 `reduce` 任务产生的数据。



使用 `MapReduce` 模型的程序员可以很容易的理解他们程序的行为，因为我们绝大多数的 `map` 和 `reduce` 操作是**确定性**的，而且存在这样的一个事实：我们的失效处理机制等价于一个顺序的执行的操作。



**弱失效处理**：当 `map` 或 / 和`reduce` 操作是**不确定性**的时候，我们提供虽然**较弱但是依然合理**的处理机制：

- 当使用**非确定操作**的时候，一个 `reduce` 任务 **R1** 的输出等价于一个**非确定性程序顺序执行**产生时的输出。
- 但是，另一个 `reduce` 任务 **R2** 的输出也许符合一个不同的非确定顺序程序执行产生的 **R2** 的输出。

考虑 `map` 任务 **M** 和 `reduce` 任务 **R1**、**R2** 的情况。我们设定 **e(Ri)** 是 **Ri** 已经提交的执行过程（有且仅有一个这样的执行过程）。当 **e(R1**) 读取了由 **M** 一次执行产生的输出，而 **e(R2)** 读取了由 M 的另一次执行产生的输出，导致了较弱的失效处理。

### 3.4 存储位置

在我们的计算运行环境中，网络带宽是一个相当匮乏的资源。

我们通过尽量把输入数据（由GFS管理）存储在集群中机器的本地磁盘上来节省网络带宽。GFS把每个文件按64MB一个 Block 分隔，并在不同的机器上存储每个 Block 的多个副本(通常是3个副本)。

`MapReduce` 的` master `在调度 `Map` 任务时会考虑输入文件的位置信息，尽量将一个 `Map` 任务调度在包含相关输入数据拷贝的机器上执行；

如果上述努力失败了，`master` 将尝试在保存有输入数据拷贝的机器附近的机器上执行` Map `任务(例如，分配到一个和包含输入数据的机器在一个 switch 里的 `worker` 机器上执行)。

当在一个足够大的 cluster 集群上运行大型 `MapReduce`操作的时候，大部分的输入数据都能从本地机器读取，因此消耗非常少的网络带宽。

### 3.5 任务粒度

如前所述，我们把 ` Map` 拆分成了 M 个片段、把 ` Reduce `拆分成 R 个片段执行。

理想情况下，M 和 R 应当比集群中 `worker `的机器数量要多得多。在每台 ` worker` 机器都执行大量的不同任务能够提高集群的**动态负载均衡**能力，并且能够**加快故障恢复**的速度：失效机器上执行的许多 `Map ` 任务都可以分布到所有其他的 `worker ` 机器上去执行。

但是实际上，在我们的具体实现中对 M 和 R 的取值都有一定的**客观限制**，因为 `master` 必须执行 O(M + R) 次调度决策，并且在内存中保存 O(M * R) 个状态（对影响内存使用的因素还是比较小的：O(M * R) 块状态，大概每对 `Map `任务/ `Reduce` 任务1个字节就可以了）。

此外，R 值通常是由**用户指定**的，因为每个 ` Reduce` 任务最终都会生成一个独立的输出文件。实际使用时我们也倾向于选择合适的 M 值，以使得每一个独立任务都是处理大约 16M 到 64M 的输入数据（这样，上面描写的输入数据本地存储优化策略才最有效），另外，我们把 R 值设置为我们想使用的 `worker` 机器数量的小的倍数。'

我们通常会用这样的比例来执行 `MapReduce` ：M=200000，R=5000，使用2000台 `worker` 机器。

### 3.6 备用任务

影响一个 `MapReduce` 的总执行时间最通常的因素是“**落伍者**”：在运算过程中，如果有一台机器花了很长的时间才完成最后几个 `Map` 或 `Reduce` 任务，导致 `MapReduce` 操作总的执行时间超过预期。

出现“落伍者” 的原因非常多。比如：

- 如果一个机器的硬盘出了问题，在读取的时候要经常的进行读取纠错操作，导致读取数据的速度从 30M/s 降低到 1M/s。
- 如果 cluster 的调度系统在这台机器上又调度了其他的任务，由于 CPU、内存、本地硬盘和网络带宽等竞争因素的存在，导致执行 MapReduce 代码的执行效率更加缓慢。 

我们有一个通用的**机制**来减少“落伍者”出现的情况：

- 当一个 `MapReduce` 操作接近完成的时候，`master` 调度备用（backup）任务进程来执行剩下的、处于处理中状态（in-progress）的任务。
- 无论是最初的执行进程、还是备用（backup）任务进程完成了任务，我们都把这个任务标记成为已经完成。

我们调优了这个机制，通常只会占用比正常操作多几个百分点的计算资源。我们发现采用这样的机制对于减少大规模 `MapReduce` 操作的总处理时间效果显著。



## 4 调优技巧

虽然简单的 Map 和 Reduce 函数提供的基本功能已经能够满足大部分的计算需要，我们还是发掘出了一些有价值的扩展功能。本节将描述这些扩展功能。

### 4.1 分区函数

MapReduce 的使用者通常会指定 Reduce 任务和 Reduce 任务输出文件的数量（R）。我们在中间 key 上使用分区函数来对数据进行分区，之后再输入到后续任务执行进程。

一个缺省的分区函数是使用hash方法 (比如，`hash(key) mod R`)进行分区。hash方法能产生非常平衡的分区。

然而，有的时候，其它的一些分区函数对 key 值进行的分区将非常有用。比如，输出的key值是URLs，我们希望每个主机的所有条目保持在同一个输出文件中。为了支持类似的情况，MapReduce 库的用户需要提供专门的分区函数。例如， 使用`hash(Hostname(urlkey)) mod R`作为分区函数就可以把所有来自同一个主机的URLs保存在同一 个输出文件中。

### 4.2 顺序保证

我们确保在给定的分区中，中间 key/value pair 数据的处理顺序是按照 key 值增量顺序处理的。这样的顺序保证对每个分区生成一个有序的输出文件，这对于需要对输出文件按 key 值随机存取的应用非常有意义，对在排序输出的数据集也很有帮助。

### 4.3 Combiner函数

在某些情况下，`Map` 函数产生的中间 key 值的重复数据会占很大的比重，并且，用户自定义的 `Reduce` 函数满足结合律和交换律。

在2.1节的词数统计程序是个很好的例子。由于词频率倾向于一个 zipf 分布(齐夫分布)，每个 `Map` 任务将产生成千上万个这样的记录。所有的这些记录将通过网络被发送到一个单独的 `Reduce` 任务，然后由这个 `Reduce` 任务把所有这些记录累加起来产生一个数字。

我们允许用户指定一个可选的 `combiner` 函数， `combiner` 函数首先在**本地**将这些记录进行一次合并，然后将合并的结果再通过**网络**发送出去。如此便大量降低了数据传输占用的带宽。

`Combiner` 函数在每台执行 `Map` 任务的机器上都会被执行一次。一般情况下，`Combiner` 和 `Reduce` 函数是 一样的。

`Combiner` 函数和 `Reduce` 函数之间唯一的**区别**是 `MapReduce` 库怎样控制函数的输出：

- `Reduce` 函数的输出被保存在**最终的输出文件**里。
- `Combiner` 函数的输出被写到**中间文件**里，然后被发送给 `Reduce` 任务。

部分的合并中间结果可以显著的提高一些 `MapReduce` 操作的速度。

### 4.4 输入和输出的类型

`MapReduce` 库支持几种不同的格式的输入数据。

- 比如，文本模式的输入数据的每一行被视为是一个 key/value pair。
  - key ：在文件中的偏移量（行数）
  - value ：那一行的内容。
- 另外一种常见的格式是以 key 进行排序来存储的 key/value pair 的序列。

每种输入类型的实现都必须能够把输入数据分割成数据片段，该数据片段能够由单独的 `Map` 任务来进行后续处理(例如，文本模式的范围分割必须确保仅仅在每行的边界进行范围分割)。

程序员可以自定义 Reader 接口来适应不同的输入类型。

Reader 的数据源可能是数据库，可能是文本文件，甚至是内存等。输入 Writer 同样可以自定义。

输出 Writer 同样可以自定义。

### 4.5 副作用

程序员在写 `Map` 和 `Reduce` 操作的时候，可能会处于方便，定义很多额外功能，比如生成辅助文件等。但应当时刻记住，`Map` 和 `Reduce` 操作应当保证**原子性**和**幂等性**。

比如，一个 task 生成了多个输出文件，但是我们没有原子化多段 commit 的操作。这就需要程序员自己保证生成多个输出的任务是**确定性**任务。

### 4.6 跳过损坏的纪录

有时候，用户程序中的 bug 导致 `Map` 或者 `Reduce` 函数在处理某些记录的时候 crash 掉，`MapReduce` 操作无法顺利完成。惯常的做法是修复 bug 后再次执行 `MapReduce` 操作，但是，有时候找出这些 bug 并修复它们不是一件容易的事情：

- 这些 bug 也许是在第三方库里边，而我们手头没有这些库的源代码。
- 而且在很多时候，忽略一些有问题的记录也是可以接受的，比如在一个巨大的数据集上进行统计分析的时候。

我们提供了一种**执行模式**，在这种模式下，为了保证整个处理能继续进行，`MapReduce` 会检测哪些记录导致确定性的 crash，并且跳过这些记录不处理。

- 每个 `worker` 进程都设置了**信号处理函数**捕获**内存段异常（segmentation violation）**和**总线错误（bus error）**。
- 在执行 `Map` 或者 `Reduce` 操作之前，`MapReduce` 库通过**全局变量**保存记录序号。
- 如果用户程序触发了一个系统信号，信号处理函数将用“最后一口气”通过 UDP 包向 `master` 发送处理的**最后一条记录的序号**。
- 当 `master` 看到在处理某条特定记录**不止失败一次**时，`master` 就标志这条记录需要被**跳过**，并且在下次重新执行相关的 `Map` 或者 `Reduce` 任务的时候**跳过**这条记录。

### 4.7 本地执行

调试 `Map` 和 `Reduce` 函数的 bug 是非常困难的，因为实际执行操作时不但是分布在系统中执行的，而且通常是在好几千台计算机上执行，具体的执行位置是由 `master` 进行动态调度的，这又大大增加了调试的难度。

为了简化调试、profile 和小规模测试，我们开发了一套 `MapReduce` 库的本地实现版本，通过使用本地版本的 `MapReduce` 库，`MapReduce` 操作在本地计算机上顺序的执行。

用户可以控制 `MapReduce` 操作 的执行，可以把操作限制到特定的 `Map` 任务上。用户通过设定特别的标志来在本地执行他们的程序，之后就可以很容易的使用本地调试和测试工具（比如 gdb）。

### 4.8 状态信息

`master` 使用嵌入式的 HTTP 服务器（如 Jetty）显示一组**状态信息页面**，用户可以监控各种执行状态。

状态信息页面显示了包括:

- 计算执行的进度
  - 已完成任务数
  - 处理中任务数
  - 输入的字节数
  - 中间数据的字节数
  - 输出的字节数
  - 处理百分比等等
- 指向每个任务的 stderr 和 stdout 文件的链接。

用户根据这些数据预测计算需要执行大约多长时间、是否需要增加额外的计算资源。这些页面也可以用来分析什么时候计算执行的比预期的要慢。 另外，处于最顶层的状态页面显示了哪些 `worker` 失效了，以及他们失效的时候正在运行的 `Map` 和 `Reduce`  任务。这些信息对于调试用户代码中的 bug 很有帮助

这一点HDFS也有类似实现，比如HDFS 在启动完成之后，还会由内部的 Web 服务提供一个查看集群状态的网页：

http://localhost:50070/

**提供可视化监控界面，是提升分布式系统的可维护性的重要手段**。

### 4.9 计数器

`MapReduce` 库使用计数器统计不同事件发生次数。比如，用户可能想统计已经处理了多少个单词、已经索引的多少篇German文档等等。 为了使用这个特性，用户在程序中创建一个命名的计数器对象，在 `Map` 和 `Reduce` 函数中相应的增加计数器的值。例如：

```java
Counter* uppercase;
uppercase = GetCounter(“uppercase”);
map(String name, String contents):
 for each word w in contents:
 if (IsCapitalized(w)):
 uppercase->Increment();
 EmitIntermediate(w, “1″);
```

这些计数器的值周期性的从各个单独的 `worker` 机器上传递给 `master`（附加在ping的应答包中传递）。 `master` 把执行成功的 `Map` 和 `Reduce` 任务的计数器值进行累计，当 `MapReduce` 操作完成之后，返回给用户代码。 

计数器当前的值也会显示在 `master` 的状态页面上，这样用户就可以看到当前计算的进度。当累加计数器的值的时候，` master` 要检查重复运行的 `Map` 或者 `Reduce` 任务，避免重复累加（之前提到的备用任务和失效后重新执行任务这两种情况会导致相同的任务被多次执行）。

有些计数器的值是由 `MapReduce` 库自动维持的，比如已经处理的输入的 key/value pair的数量、输出的 key/value pair的数量等等。

计数器机制对于 `MapReduce` 操作的完整性检查非常有用。比如，在某些 `MapReduce` 操作中，用户需要确保输出的 key value pair 精确的等于输入的 key value pair，或者处理的German文档数量在处理的整个 文档数量中属于合理范围。



## 5 总结

`MapReduce` 编程模型在 Google 内部成功应用于多个领域。我们把这种成功归结为几个方面：

- 由于 `MapReduce` 封装了并行处理、容错处理、数据本地化优化、负载均衡等等技术难点的细节，这使得 `MapReduce` 库易于使用。即便对于完全没有并行或者分布式系统开发经验的程序员而言.
- 大量不同类型的问题都可以通过 `MapReduce` 简单的解决。比如，`MapReduce` 用于生成 Google 的网络搜索服务所需要的数据、用来排序、用来数据挖掘、用于机器学习，以及很多其它的系统.
- 我们实现了一个在数千台计算机组成的大型集群上灵活部署运行的 `MapReduce`。这个实现使得有效利用这些丰富的计算资源变得非常简单，因此也适合用来解决 Google 遇到的其他很多需要大量计算的问题。

我们也从 `MapReduce` 开发过程中学到了不少东西：

- **约束编程模式**使得**并行**和**分布式计算**非常容易，也易于构造**容错**的计算环境.
- **网络带宽是稀有资源**。大量的系统优化是针对减少网络传输量为目的的：本地优化策略使大量的数据从本地磁盘读取，中间文件写入本地磁盘、并且只写一份中间文件也节约了网络带宽.
- 多次执行相同的任务可以减少性能缓慢的机器带来的负面影响（即硬件配置的不平衡），同时解决了由于机器失效导致的数据丢失问题。

------

**参考**

> Jeffrey Dean, & Sanjay Ghemawat (2004). MapReduce: simplified data processing on large clusters Communications of The ACM.