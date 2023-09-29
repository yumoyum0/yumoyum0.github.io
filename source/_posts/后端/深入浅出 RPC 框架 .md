---
title: 深入浅出 RPC 框架
date: 2022-05-27 16:51:33
tags: 
- 后端
- RPC
categories:
- 后端
---

## RPC 的基本概念

### 什么是RPC

**RPC**（Remote Procedure Call Protocol）**远程过程调用协议**。一个通俗的描述是：客户端在不知道调用细节的情况下，调用存在于远程计算机上的某个对象，就像调用本地应用程序中的对象一样。

比较正式的描述是：一种通过网络从远程计算机程序上请求服务，而不需要了解底层网络技术的协议。

那么我们至少从这样的描述中挖掘出几个要点：

- RPC是**协议**：既然是协议就只是一套规范，那么就需要有人遵循这套规范来进行实现。目前典型的RPC实现包括：Dubbo、Thrift、GRPC、Hetty等。
- **网络协议**和**网络IO模型**对其**透明**：既然RPC的客户端认为自己是在调用本地对象。那么传输层使用的是TCP/UDP还是HTTP协议，又或者是一些其他的网络协议它就不需要关心了。
- **信息格式**对其**透明**：我们知道在本地应用程序中，对于某个对象的调用需要传递一些参数，并且会返回一个调用结果。至于被调用的对象内部是如何使用这些参数，并计算出处理结果的，调用方是不需要关心的。那么对于远程调用来说，这些参数会以某种信息格式传递给网络上的另外一台计算机，这个信息格式是怎样构成的，调用方是不需要关心的。
- 应该有**跨语言**能力：为什么这样说呢？因为调用方实际上也不清楚远程服务器的应用程序是使用什么语言运行的。那么对于调用方来说，无论服务器方使用的是什么语言，本次调用都应该成功，并且返回值也应该按照调用方程序语言所能理解的形式进行描述。

### 为什么要用RPC

其实这是应用开发到一定的阶段的强烈需求驱动的。如果我们开发简单的单一应用，逻辑简单、用户不多、流量不大，那我们用不着。当我们的**系统访问量增大、业务增多**时，我们会发现一台**单机**运行此系统已经无法承受。此时，我们可以**将业务拆分成几个互不关联的应用**，**分别部署在各自机器上**，以划清逻辑并减小压力。此时，我们也可以不需要RPC，因为应用之间是互不关联的。

当我们的业务越来越多、应用也越来越多时，自然的，我们会发现有些功能已经不能简单划分开来或者划分不出来。此时，可以将**公共业务逻辑**抽离出来，将之组成独立的服务Service应用 。而原有的、新增的应用都可以与那些独立的Service应用 交互，以此来完成完整的业务功能。

所以此时，我们急需一种高效的应用程序之间的通讯手段来完成这种需求。

其实描述的场景也是服务化 、微服务和分布式系统架构的基础场景。即RPC框架就是实现以上结构的有力方式。

### 常用的RPC框架

- **Thrift**：thrift是一个软件框架，用来进行可扩展且跨语言的服务的开发。它结合了功能强大的软件堆栈和代码生成引擎，以构建在 C++, Java, Python, PHP, Ruby, Erlang, Perl, Haskell, C#, Cocoa, JavaScript, Node.js, Smalltalk, and OCaml 这些编程语言间无缝结合的、高效的服务。
- **gRPC**：一开始由 google 开发，是一款语言中立、平台中立、开源的远程过程调用(RPC)系统。
- **Dubbo**：Dubbo是一个分布式服务框架，以及SOA治理方案。其功能主要包括：高性能NIO通讯及多协议集成，服务动态寻址与路由，软负载均衡与容错，依赖分析与降级等。Dubbo是阿里巴巴内部的SOA服务化治理方案的核心框架，Dubbo自2011年开源后，已被许多非阿里系公司使用。
- **Spring Cloud**：Spring Cloud由众多子项目组成，如Spring Cloud Config、Spring Cloud Netflix、Spring Cloud Consul 等，提供了搭建分布式系统及微服务常用的工具，如配置管理、服务发现、断路器、智能路由、微代理、控制总线、一次性token、全局锁、选主、分布式会话和集群状态等，满足了构建微服务所需的所有解决方案。Spring Cloud基于Spring Boot, 使得开发部署极其简单。



RPC的概念模型：User、User-Stub、RPC-Runtime、Server-Stub、Server

- 来自论文《[Implementing Remote Procedure Calls](https://link.juejin.cn?target=https%3A%2F%2Fweb.eecs.umich.edu%2F~mosharaf%2FReadings%2FRPC.pdf)》

- **IDL**(Interface Definition Language) 文件
  - Thrift
  - Protobuf

- 生成代码

- **编解码**（序列化/反序列化）

- **通信协议**
  - 应用层协议

- **网络通信**
  - IO 网络模型
    - blocking IO
    - unblocking IO
    - IO multiplexing
    - signal driven IO
    - asynchronous IO
  - 传输层协议
    - TCP
    - UDP

### **RPC调用流程**

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527173906556.png)



要让网络通信细节对使用者透明，我们需要对通信细节进行封装，我们先看下一个RPC调用的流程涉及到哪些通信细节：![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527203214620.png)

1. 服务消费方（client）调用以本地调用方式调用服务；
2. client stub接收到调用后负责将方法、参数等组装成能够进行网络传输的消息体；
3. client stub找到服务地址，并将消息发送到服务端；
4. server stub收到消息后进行解码；
5. server stub根据解码结果调用本地的服务；
6. 本地服务执行并将结果返回给server stub；
7. server stub将返回结果打包成消息并发送至消费方；
8. client stub接收到消息，并进行解码；
9. 服务消费方得到最终结果。

RPC的目标就是要2~8这些步骤都封装起来，让用户对这些细节透明。

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527203233845.png)

### **RPC的好处**

<img src="https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527174449514.png" style="zoom:50%;" />

- 单一职责，有利于分工协作和运维开发
- 可扩展性强，资源使用率更优
- 故障隔离，服务的整体可靠性更高

相比本地函数调用，RPC调用需要解决的问题

- 函数映射
- 数据转换成字节流
- 网络传输

RPC 带来的问题将由 RPC 框架来解决

- 服务宕机如何感知？
- 遇到网络异常应该如何应对？
- 请求量暴增怎么处理？

## RPC 框架分层设计

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6d12fff7fde5429b814f15c64fc4a261~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp" alt="img" style="zoom:50%;" />

### 编解码层

#### 确定消息数据结构

- 数据格式：

  - 语言特定格式 ：例如 java.io.Serializable
  - 文本格式 ：例如 JSON、XML、CSV 等
  - 二进制编码
    - TLV 编码：Thrift 使用 TLV 编码
    - Varint 编码：Protobuf 使用 Varint 编码

- 选项：

  - 兼容性：支持自动增加新的字段，而不影响老的服务，这将提高系统的灵活度
  - 通用型：支持跨平台、跨语言
  - 性能：从空间和时间两个维度来考虑，也就是编码后数据大小和编码耗费时长

  ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7ffa6428b4214c6590a3b8a6fc106390~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)

#### 序列化

一旦确定了消息的数据结构后，下一步就是要考虑序列化与反序列化了。

什么是序列化？序列化就是将数据结构或对象转换成二进制串的过程，也就是编码的过程。

什么是反序列化？将在序列化过程中所生成的二进制串转换成数据结构或者对象的过程。

为什么需要序列化？转换为二进制串后才好进行网络传输嘛！

为什么需要反序列化？将二进制转换为对象才好进行后续处理！

现如今序列化的方案越来越多，每种序列化方案都有优点和缺点，它们在设计之初有自己独特的应用场景，那到底选择哪种呢？从RPC的角度上看，主要看三点：

- 通用性：比如是否能支持Map等复杂的数据结构；
- 性能：包括时间复杂度和空间复杂度，由于RPC框架将会被公司几乎所有服务使用，如果序列化上能节约一点时间，对整个公司的收益都将非常可观，同理如果序列化上能节约一点内存，网络带宽也能省下不少；
- 可扩展性：对互联网公司而言，业务变化飞快，如果序列化协议具有良好的可扩展性，支持自动增加新的业务字段，而不影响老的服务，这将大大提供系统的灵活度。

目前互联网公司广泛使用Protobuf、Thrift、Avro等成熟的序列化解决方案来搭建RPC框架，这些都是久经考验的解决方案。

#### 如何发布自己的服务

Java常用zookeeper，Go常用ETCD，服务端进行注册和心跳，客户端获取机器列表，比如zookeeper：

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527203414575.png)

### 传输协议层

- 消息切分

  - 特殊结束符
  - 变长协议：length+body

- 协议构造

  - 以 Thrift 的 [THeader](https://link.juejin.cn?target=https%3A%2F%2Fgithub.com%2Fapache%2Fthrift%2Fblob%2Fmaster%2Fdoc%2Fspecs%2FHeaderFormat.md) 协议为例

    <img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/228aa11d265240c3aad35736194de94f~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp" alt="img" style="zoom:50%;" />

    - `LENGTH `字段 32bits，包括数据包剩余部分的字节大小，不包含 LENGTH 自身长度
    - `HEADER MAGIC` 字段16bits，值为：0x1000，用于标识 协议版本信息，协议解析的时候可以快速校验
    - `FLAGS` 字段 16bits，为预留字段，暂未使用，默认值为 0x0000
    - `SEQUENCE NUMBER `字段 32bits，表示数据包的 seqId，可用于多路复用，最好确保单个连接内递增
    - `HEADER SIZE 字段` 16bits，等于头部长度字节数/4，头部长度计算从第14个字节开始计算，一直到 PAYLOAD 前（备注：header 的最大长度为 64K）
    - `PROTOCOL ID `字段 uint8 编码，取值有： - ProtocolIDBinary = 0 - ProtocolIDCompact = 2
    - `NUM TRANSFORMS` 字段 uint8 编码，表示 TRANSFORM 个数
    - `TRANSFORM ID` 字段 uint8 编码，表示压缩方式 zlib or snappy
    - `INFO ID `字段 uint8 编码，具体取值参考下文，用于传递一些定制的 meta 信息
    - `PAYLOAD` 消息内容

  - 协议解析

    ![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae3b22f299dc4e4a8df34793263055cb~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)

### 网络通信层

![img](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c4e3c7f3fb234b6f9f1102fca16818dd~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp)

- 网络库

  - 提供易用API

    封装底层 Socket API 连接管理和事件分发功能

  - 协议支持

    tcp、udp 和uds等优雅退出、异常处理等

  - 性能

    应用层 buffer 减少copy高性能定时器、对象池等

- 核心指标

  - 吞吐高
  - 延迟低

  <img src="https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527194916753.png" style="zoom:80%;" />

- 阻塞 IO 下，耗费一个线程去阻塞在 read(fd) 去等待用足够多的数据可读并返回。

- 非阻塞 IO 下，不停对所有 fds 轮询 read(fd) ，如果读取到 n <= 0 则下一个循环继续轮询。

第一种方式浪费线程（会占用内存和上下文切换开销），第二种方式浪费 CPU 做大量无效工作。而基于 IO 多路复用系统调用实现的 Poll 的意义在于将可读/可写状态通知和实际文件操作分开，并支持多个文件描述符通过一个系统调用监听以提升性能。

网络库的核心功能就是去同时监听大量的文件描述符的状态变化(通过操作系统调用)，并对于不同状态变更，高效，安全地进行对应的文件操作。



### **小结**

- RPC 框架主要核心有三层:编解码层、协议层和网络通信层
- 二进制编解码的实现原理和选型要点
- 协议的一般构造，以及框架协议解析的基本流程
- 网络库的基本架构，以及选型时要考察的核心指标

## RPC 框架的核心指标

### 稳定性

- 保障策略
  - **熔断**：保护调用方，防止被调用的服务出现问题而影响到整个链路
  - **限流**：保护被调用方.防止大流量把服务压垮
  - **超时**控制：避免浪费资源在不可用节点上

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a181793ced1e476bac5d648e8fac3717~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp" alt="img" style="zoom:50%;" />

从某种程度上讲超时、限流和熔断也是一种服务**降级**的手段 。

- 请求成功率

  - 负载均衡

    <img src="https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527195633985.png" style="zoom: 67%;" />

  - 重试

    <img src="https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527195657847.png" style="zoom:50%;" />

- 长尾请求

  <img src="https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527195927006.png" style="zoom:50%;" />

  - BackupRequest 备份请求

  <img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a8e6ff914d84384b79f6e8ad13afd75~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp" alt="img" style="zoom:50%;" />

### 易用性

<img src="https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527200205065.png" style="zoom: 50%;" />

- 开箱即用
  - 合理的默认参数选项、丰富的文档
- 周边工具
  - 生成代码工具、脚手架工具

### 扩展性

- Middleware：middleware 会被构造成一个有序调用链逐个执行，比如服务发现、路由、负载均衡、超时控制等
- Option：作为初始化参数
- 核心层是支持扩展的：编解码、协议、网络传输层
- 代码生成工具也支持插件扩展

Middleware中间件执行流程

<img src="https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527200424334.png" style="zoom:50%;" />

### 观测性

- Log 日志
- Metric 监控
- Tracing 链式跟踪
- 内置观测性服务
  - 当前环境变量
  - 配置参数
  - 缓存信息
  - 内置 pprof 服务用于排查问题

<img src="https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527200805100.png" style="zoom:50%;" />

### 高性能

- 目标

  - 高吞吐
  - 低延迟

- 场景

  - 单机多机
  - 单连接多连接
  - 单/多client单/多server
  - 不同大小的请求包
  - 不同请求类型:例如 pingpong、streaming等

- 手段

  - 连接池和多路复用：复用连接，减少频繁建联带来的开销

  - 高性能编解码协议：Thrift、Protobuf、Flatbuffer 和 Cap'n Proto 等

  - 高性能网络库：Netpoll 和 Netty 等



### **小结**

- 框架通过中间件来注入各种服务治理策略，保障服务的稳定性
- 通过提供合理的默认配置和方便的命令行工具可以提升框架的易用性
- 框架应当提供丰富的扩展点，例如核心的传输层和协议层
- 观测性除了传统的Log、Metric和 Tracing之外，内置状态暴露服务也很有必要
- 性能可以从多个层面去优化，例如选择高性能的编解码协议和网络库





# gRPC & Thrift

## gRPC

### gRPC 简介

gRPC是一个高性能、通用的开源RPC框架，其由Google 2015年主要面向移动应用开发并基于HTTP/2协议标准而设计，基于ProtoBuf序列化协议开发，且支持众多开发语言。

由于是开源框架，通信的双方可以进行二次开发，所以客户端和服务器端之间的通信会更加专注于业务层面的内容，减少了对由gRPC框架实现的底层通信的关注。

如下图，DATA部分即业务层面内容，下面所有的信息都由gRPC进行封装。

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527203815869.png)

### gRPC 特点

- 语言中立，支持多种语言；
- 基于 IDL 文件定义服务，通过 proto3 工具生成指定语言的数据结构、服务端接口以及客户端 Stub；
- 通信协议基于标准的 HTTP/2 设计，支持双向流、消息头压缩、单 TCP 的多路复用、服务端推送等特性，这些特性使得 gRPC 在移动端设备上更加省电和节省网络流量；
- 序列化支持 PB（Protocol Buffer）和 JSON，PB 是一种语言无关的高性能序列化框架，基于 HTTP/2 + PB, 保障了 RPC 调用的高性能。

### gRPC 交互过程

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527203839036.png)

- 交换机在开启gRPC功能后充当gRPC客户端的角色，采集服务器充当gRPC服务器角色；
- 交换机会根据订阅的事件构建对应数据的格式（GPB/JSON），通过Protocol Buffers进行编写proto文件，交换机与服务器建立gRPC通道，通过gRPC协议向服务器发送请求消息；
- 服务器收到请求消息后，服务器会通过Protocol Buffers解译proto文件，还原出最先定义好格式的数据结构，进行业务处理；
- 数据处理完后，服务器需要使用Protocol Buffers重编译应答数据，通过gRPC协议向交换机发送应答消息；
- 交换机收到应答消息后，结束本次的gRPC交互。

> 简单地说，gRPC就是在客户端和服务器端开启gRPC功能后建立连接，将设备上配置的订阅数据推送给服务器端。我们可以看到整个过程是需要用到Protocol Buffers将所需要处理数据的结构化数据在proto文件中进行定义。

### 什么是Protocol Buffers?

你可以理解ProtoBuf是一种更加灵活、高效的数据格式，与XML、JSON类似，在一些高性能且对响应速度有要求的数据传输场景非常适用。ProtoBuf在gRPC的框架中主要有三个作用：

- 定义数据结构
- 定义服务接口
- 通过序列化和反序列化，提升传输效率

为什么ProtoBuf会提高传输效率呢？

我们知道使用XML、JSON进行数据编译时，数据文本格式更容易阅读，但进行数据交换时，设备就需要耗费大量的CPU在I/O动作上，自然会影响整个传输速率。Protocol Buffers不像前者，它会将字符串进行序列化后再进行传输，即二进制数据。

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527203906795.png)

可以看到其实两者内容相差不大，并且内容非常直观，但是Protocol Buffers编码的内容只是提供给操作者阅读的，实际上传输的并不会以这种文本形式，而是序列化后的二进制数据。字节数会比JSON、XML的字节数少很多，速率更快。

如何支撑跨平台，多语言呢？

Protocol Buffers自带一个编译器也是一个优势点。前面提到的proto文件就是通过编译器进行编译的，proto文件需要编译生成一个类似库文件，基于库文件才能真正开发数据应用。具体用什么编程语言编译生成这个库文件呢？由于现网中负责网络设备和服务器设备的运维人员往往不是同一组人，运维人员可能会习惯使用不同的编程语言进行运维开发，那么Protocol Buffers其中一个优势就能发挥出来——跨语言。

从上面的介绍，我们得出在编码方面Protocol Buffers对比JSON、XML的优点：

- 简单，体积小，数据描述文件大小只有1/10至1/3；
- 传输和解析的速率快，相比XML等，解析速度提升20倍甚至更高；
- 可编译性强。

### 基于HTTP 2.0标准设计

除了Protocol Buffers之外，从交互图中和分层框架可以看到， gRPC还有另外一个优势——它是基于HTTP 2.0协议的。

由于gRPC基于HTTP 2.0标准设计，带来了更多强大功能，如多路复用、二进制帧、头部压缩、推送机制。这些功能给设备带来重大益处，如节省带宽、降低TCP连接次数、节省CPU使用等。gRPC既能够在客户端应用，也能够在服务器端应用，从而以透明的方式实现两端的通信和简化通信系统的构建。

HTTP 版本分为HTTP 1.X、 HTTP 2.0，其中HTTP 1.X是当前使用最广泛的HTTP协议，HTTP 2.0称为超文本传输协议第二代。HTTP 1.X定义了四种与服务器交互的方式，分别为：GET、POST、PUT、DELETE，这些在HTTP 2.0中均保留。HTTP 2.0的新特性：

- 双向流、多路复用
- 二进制帧
- 头部压缩

## Thrift

### Thrift 简介

thrift是一种可伸缩的跨语言服务的RPC软件框架。它结合了功能强大的软件堆栈的代码生成引擎，以建设服务，高效、无缝地在多种语言间结合使用。2007年由facebook贡献到apache基金，是apache下的顶级项目，具备如下特点：

- 支持多语言：C、C++ 、C# 、D 、Delphi 、Erlang 、Go 、Haxe 、Haskell 、Java 、JavaScript、node.js 、OCaml 、Perl 、PHP 、Python 、Ruby 、SmallTalk
- 消息定义文件支持注释，数据结构与传输表现的分离，支持多种消息格式
- 包含完整的客户端/服务端堆栈，可快速实现RPC，支持同步和异步通信

### Thrift框架结构

Thrift是一套包含序列化功能和支持服务通信的RPC（远程服务调用）框架，也是一种微服务框架。其主要特点是可以跨语言使用，这也是这个框架最吸引人的地方。

<img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6d12fff7fde5429b814f15c64fc4a261~tplv-k3u1fbpfcp-zoom-in-crop-mark:1304:0:0:0.awebp" alt="img" style="zoom:50%;" />

图中code是用户实现的业务逻辑，接下来的 Service.Client和 write()/read()是thrift根据IDL生成的客户端和服务端的代码，对应于RPC中Client stub和Server stub。TProtocol 用来对数据进行序列化与反序列化，具体方法包括二进制，JSON 或者 Apache Thrift 定义的格式。TTransport 提供数据传输功能，使用 Apache Thrift 可以方便地定义一个服务并选择不同的传输协议。

### Thrift网络栈结构

thirft使用socket进行数据传输，数据以特定的格式发送，接收方进行解析。我们定义好thrift的IDL文件后，就可以使用thrift的编译器来生成双方语言的接口、model，在生成的model以及接口代码中会有解码编码的代码。thrift网络栈结构如下：

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527203930146.png)

#### Transport层

代表Thrift的数据传输方式，Thrift定义了如下几种常用数据传输方式：

- TSocket: 阻塞式socket；
- TFramedTransport: 以frame为单位进行传输，非阻塞式服务中使用；
- TFileTransport: 以文件形式进行传输。

#### TProtocol层

代表thrift客户端和服务端之间传输数据的协议，通俗来讲就是客户端和服务端之间传输数据的格式(例如json等)，thrift定义了如下几种常见的格式：

- TBinaryProtocol: 二进制格式；
- TCompactProtocol: 压缩格式；
- TJSONProtocol: JSON格式；
- TSimpleJSONProtocol: 提供只写的JSON协议。

#### Server模型

- TSimpleServer: 简单的单线程服务模型，常用于测试；
- TThreadPoolServer: 多线程服务模型，使用标准的阻塞式IO；
- TNonBlockingServer: 多线程服务模型，使用非阻塞式IO(需要使用TFramedTransport数据传输方式);
- THsHaServer: THsHa引入了线程池去处理，其模型读写任务放到线程池去处理，Half-sync/Half-async处理模式，Half-async是在处理IO事件上(accept/read/write io)，Half-sync用于handler对rpc的同步处理；

## gRPC VS Thrift

### 功能比较

直接贴上网上的两幅截图：

<img src="https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527203950156.png" style="zoom:67%;" />

<img src="https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527204012686.png" style="zoom:80%;" />

### 性能比较

也是基于网上测试的结果，仅供参考：

- 整体上看，长连接性能优于短连接，性能差距在两倍以上；
- 对比Go语言的两个RPC框架，Thrift性能明显优于gRPC，性能差距也在两倍以上；
- 对比Thrift框架下的的两种语言，长连接下Go 与C++的RPC性能基本在同一个量级，在短连接下，Go性能大概是C++的二倍；
- 对比Thrift&C++下的TSimpleServer与TNonblockingServer，在单进程客户端长连接的场景下，TNonblockingServer因为存在线程管理开销，性能较TSimpleServer差一些；但在短连接时，主要开销在连接建立上，线程池管理开销可忽略；
- 两套RPC框架，以及两大语言运行都非常稳定，5w次请求耗时约是1w次的5倍；

### 如何选型

什么时候应该选择gRPC而不是Thrift：

- 需要良好的文档、示例
- 喜欢、习惯HTTP/2、ProtoBuf
- 对网络传输带宽敏感

什么时候应该选择Thrift而不是gRPC：

- 需要在非常多的语言间进行数据交换
- 对CPU敏感
- 协议层、传输层有多种控制要求
- 需要稳定的版本
- 不需要良好的文档和示例

## 小节

上面详细介绍gRPC和Thrift的特点和区别，小节如下：

- GRPC主要就是搞了个ProtoBuf，然后采用HTTP协议，所以协议部分没有重复造轮子，重点就在ProtoBuf上。
- Thrift的数据格式是用的现成的，没有单独搞一套，但是它在传输层和服务端全部是自己造轮子，所以可以对协议层、传输层有多种控制要求。

# Dubbo & Spring Cloud

## Dubbo

Dubbo 是一个分布式服务框架，致力于提供高性能和透明化的 RPC 远程服务调用方案，以及 SOA 服务治理方案。简单的说，Dubbo 就是个服务框架，说白了就是个远程服务调用的分布式框架。

Dubbo 总体架构：

<img src="https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527204043638.png" style="zoom: 67%;" />

Dubbo特点：

- 远程通讯: 提供对多种基于长连接的 NIO 框架抽象封装（非阻塞 I/O 的通信方式，Mina/Netty/Grizzly），包括多种线程模型，序列化（Hessian2/ProtoBuf），以及“请求-响应”模式的信息交换方式。
- 集群容错: 提供基于接口方法的透明远程过程调用（RPC），包括多协议支持（自定义 RPC 协议），以及软负载均衡（Random/RoundRobin），失败容错（Failover/Failback），地址路由，动态配置等集群支持。
- 自动发现: 基于注册中心目录服务，使服务消费方能动态的查找服务提供方，使地址透明，使服务提供方可以平滑增加或减少机器。

## Spring Cloud

Spring Cloud 基于 Spring Boot，为微服务体系开发中的架构问题，提供了一整套的解决方案——服务注册与发现，服务消费，服务保护与熔断，网关，分布式调用追踪，分布式配置管理等。

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527204144230.png)

<img src="https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527204201845.png" style="zoom: 67%;" />

## Dubbo vs Spring Cloud

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220527204230728.png)

使用 Dubbo 构建的微服务架构就像组装电脑，各环节我们的选择自由度很高，但是最终结果很有可能因为一条内存质量不行就点不亮了，总是让人不怎么放心，但是如果你是一名高手，那这些都不是问题；而 Spring Cloud 就像品牌机，在 Spring Source 的整合下，做了大量的兼容性测试，保证了机器拥有更高的稳定性，但是如果要在使用非原装组件外的东西，就需要对其基础有足够的了解。

关于 Dubbo 和 Spring Cloud 的相关概念和对比，我个人比较倾向于 Spring Cloud，原因就是真正的微服务框架、提供整套的组件支持、使用简单方便、强大的社区支持等等，另外，因为考虑到 .NET/.NET Core 的兼容处理，RPC 并不能很好的实现跨语言（需要借助跨语言库，比如 gRPC、Thrift，但因为 Dubbo 本身就是“gRPC”，在 Dubbo 之上再包一层 gRPC，有点重复封装了），而 HTTP REST 本身就是支持跨语言实现，所以，Spring Cloud 这一点还是非常好的（Dubbox 也支持，但性能相比要差一些）。

但凡事无绝对，每件事物有好的地方也有不好的地方，总的来说，Dubbo 和 Spring Cloud 的主要不同体现在两个方面：服务调用方式不同和专注点不同（生态不同）。

