---
title: JVM垃圾回收
date: 2022-11-24 16:51:33
tags: 
- Java
- JVM
categories:
- Java
---

# 垃圾回收概述

![image-20221120140044206](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120140044206.png)

- Java 和 C++语言的区别，就在于垃圾收集技术和内存动态分配上，C++语言没有垃圾收集技术，需要程序员手动的收集。
- 垃圾收集，不是Java语言的伴生产物。早在1960年，第一门开始使用内存动态分配和垃圾收集技术的Lisp语言诞生。
- 关于垃圾收集有三个经典问题：
  - 哪些内存需要回收？
  - 什么时候回收？
  - 如何回收？
- 垃圾收集机制是Java的招牌能力，极大地提高了开发效率。如今，垃圾收集几乎成为现代语言的标配，即使经过如此长时间的发展，Java的垃圾收集机制仍然在不断的演进中，不同大小的设备、不同特征的应用场景，对垃圾收集提出了新的挑战，这当然也是面试的热点。

## 面试题

- 如何判断对象是否死亡（两种方法）。
- 简单的介绍一下强引用、软引用、弱引用、虚引用（虚引用与软引用和弱引用的区别、使用软引用能带来的好处）。
- 如何判断一个常量是废弃常量
- 如何判断一个类是无用的类
- 垃圾收集有哪些算法，各自的特点？
- HotSpot 为什么要分为新生代和老年代？
- 常见的垃圾回收器有哪些？
- 介绍一下 CMS,G1 收集器。
- Minor Gc 和 Full GC 有什么不同呢？



**蚂蚁金服**

- 你知道哪几种垃圾回收器，各自的优缺点，重点讲一下CMS和G1？
- JVM GC算法有哪些，目前的JDK版本采用什么回收算法？
- G1回收器讲下回收过程GC是什么？为什么要有GC？
- GC的两种判定方法？CMS收集器与G1收集器的特点

**百度**

- 说一下GC算法，分代回收说下
- 垃圾收集策略和算法

**天猫**

- JVM GC原理，JVM怎么回收内存
- CMS特点，垃圾回收算法有哪些？各自的优缺点，他们共同的缺点是什么？

**滴滴**

- Java的垃圾回收器都有哪些，说下G1的应用场景，平时你是如何搭配使用垃圾回收器的

**京东**

- 你知道哪几种垃圾收集器，各自的优缺点，重点讲下CMS和G1，
- 包括原理，流程，优缺点。垃圾回收算法的实现原理

**阿里**

- 讲一讲垃圾回收算法。
- 什么情况下触发垃圾回收？
- 如何选择合适的垃圾收集算法？
- JVM有哪三种垃圾回收器？

**字节跳动**

- 常见的垃圾回收器算法有哪些，各有什么优劣？
- System.gc()和Runtime.gc()会做什么事情？
- Java GC机制？GC Roots有哪些？
- Java对象的回收方式，回收算法。
- CMS和G1了解么，CMS解决什么问题，说一下回收的过程。
- CMS回收停顿了几次，为什么要停顿两次?

## 什么是垃圾？

1. 垃圾是指**在运行程序中没有任何指针指向的对象**，这个对象就是需要被回收的垃圾。
2. 外文：An object is considered garbage when it can no longer be reached from any pointer in the running program.
3. 如果不及时对内存中的垃圾进行清理，那么，这些垃圾对象所占的内存空间会一直保留到应用程序结束，被保留的空间无法被其他对象使用。甚至可能导致内存溢出。

**十几年前磁盘碎片整理的日子**

![image-20221120141108878](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120141108878.png)

## 为什么需要GC？

**想要学习GC，首先需要理解为什么需要GC？**

1. 对于高级语言来说，一个基本认知是如果不进行垃圾回收，**内存迟早都会被消耗完**，因为不断地分配内存空间而不进行回收，就好像不停地生产生活垃圾而从来不打扫一样。
2. 除了释放没用的对象，垃圾回收也可以清除内存里的记录碎片。碎片整理将所占用的堆内存移到堆的一端，**以便JVM将整理出的内存分配给新的对象**。
3. 随着应用程序所应付的业务越来越庞大、复杂，用户越来越多，**没有GC就不能保证应用程序的正常进行**。而经常造成STW的GC又跟不上实际的需求，所以才会不断地尝试对GC进行优化。

## 早期垃圾回收

1. 在早期的C/C++时代，垃圾回收基本上是手工进行的。开发人员可以使用new关键字进行内存申请，并使用delete关键字进行内存释放。比如以下代码：

```
  MibBridge *pBridge= new cmBaseGroupBridge（）；
  //如果注册失败，使用Delete释放该对象所占内存区域
  if（pBridge->Register（kDestroy）！=NO ERROR）
  	delete pBridge；
```

1. 这种方式可以灵活控制内存释放的时间，但是会给开发人员带来**频繁申请和释放内存的管理负担**。倘若有一处内存区间由于程序员编码的问题忘记被回收，那么就会产生**内存泄漏**，垃圾对象永远无法被清除，随着系统运行时间的不断增长，垃圾对象所耗内存可能持续上升，直到出现内存溢出并造成**应用程序崩溃**。
2. 有了垃圾回收机制后，上述代码极有可能变成这样

```
  MibBridge *pBridge=new cmBaseGroupBridge(); 
  pBridge->Register(kDestroy);
```

1. 现在，除了Java以外，C#、Python、Ruby等语言都使用了自动垃圾回收的思想，也是未来发展趋势，可以说这种自动化的内存分配和来及回收方式已经成为了现代开发语言必备的标准。

## Java 垃圾回收机制

### 自动内存管理

> **官网介绍**：https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/toc.html

**自动内存管理的优点**

- 自动内存管理，无需开发人员手动参与内存的分配与回收，这样**降低内存泄漏和内存溢出的风险**
  - 没有垃圾回收器，java也会和cpp一样，各种悬垂指针，野指针，泄露问题让你头疼不已。
- 自动内存管理机制，将程序员从繁重的内存管理中释放出来，可以**更专心地专注于业务开发**

**关于自动内存管理的担忧**

- 对于Java开发人员而言，自动内存管理就像是一个黑匣子，如果过度依赖于“自动”，那么这将会是一场灾难，最严重的就会**弱化Java开发人员在程序出现内存溢出时定位问题和解决问题的能力**。
- 此时，了解JVM的自动内存分配和内存回收原理就显得非常重要，只有在真正了解JVM是如何管理内存后，我们才能够在遇见OutofMemoryError时，快速地根据错误异常日志定位问题和解决问题。
- 当需要排查各种内存溢出、内存泄漏问题时，当垃圾收集成为系统达到更高并发量的瓶颈时，我们就必须对这些“自动化”的技术**实施必要的监控和调节**。

### 应该关心哪些区域的回收？

![image-20221120142256784](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120142256784.png)

- 垃圾收集器可以对年轻代回收，也可以对老年代回收，甚至是全栈和方法区的回收，
- 其中，**Java堆是垃圾收集器的工作重点**
- 从次数上讲：
  - 频繁收集Young区
  - 较少收集Old区
  - 基本不收集Perm区（元空间）

------

# 垃圾回收相关算法

## 标记阶段：引用计数算法

### 标记阶段的目的

**垃圾标记阶段：主要是为了判断对象是否存活**

1. 在堆里存放着几乎所有的Java对象实例，在GC执行垃圾回收之前，首先**需要区分出内存中哪些是存活对象，哪些是已经死亡的对象。**只有被标记为己经死亡的对象，GC才会在执行垃圾回收时，释放掉其所占用的内存空间，因此这个过程我们可以称为**垃圾标记阶段**。
2. 那么在JVM中究竟是如何标记一个死亡对象呢？简单来说，当一个对象已经不再被任何的存活对象继续引用时，就可以宣判为已经死亡。
3. 判断对象存活一般有两种方式：**引用计数算法**和**可达性分析算法**。

### 引用计数算法

1. 引用计数算法（Reference Counting）比较简单，对每个对象保存一个整型的**引用计数器属性**。**用于记录对象被引用的情况**。
2. 对于一个对象A，只要有任何一个对象引用了A，则A的引用计数器就加1；当引用失效时，引用计数器就减1。只要对象A的引用计数器的值为0，即表示对象A不可能再被使用，可进行回收。
3. 优点：**实现简单，垃圾对象便于辨识；判定效率高，回收没有延迟性**。
4. 缺点：
   1. 它需要单独的字段存储计数器，这样的做法增加了**存储空间的开销**。
   2. 每次赋值都需要更新计数器，伴随着加法和减法操作，这增加了**时间开销**。
   3. 引用计数器有一个严重的问题，即**无法处理循环引用**的情况。这是一条致命缺陷，导致在Java的垃圾回收器中没有使用这类算法。

### 循环引用

![image-20221120144155492](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120144155492.png)

当p的指针断开的时候，内部的引用形成一个循环，计数器都还算1，无法被回收，这就是循环引用，从而造成内存泄漏

### 证明：java使用的不是引用计数算法

```java
/**
 * -XX:+PrintGCDetails
 * 证明：java使用的不是引用计数算法
 */
public class RefCountGC {
    //这个成员属性唯一的作用就是占用一点内存
    private byte[] bigSize = new byte[5 * 1024 * 1024];//5MB

    Object reference = null;

    public static void main(String[] args) {
        RefCountGC obj1 = new RefCountGC();
        RefCountGC obj2 = new RefCountGC();

        obj1.reference = obj2;
        obj2.reference = obj1;

        obj1 = null;
        obj2 = null;
        //显式的执行垃圾回收行为
        //这里发生GC，obj1和obj2能否被回收？
        System.gc();

    }
}
```

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120144342112.png" alt="image-20221120144342112" style="zoom:67%;" />

- 如果不小心直接把`obj1.reference`和`obj2.reference`置为null。则在Java堆中的两块内存依然保持着互相引用，无法被回收

**没有进行GC时**

把下面的几行代码注释掉，让它来不及

```
Heap
 PSYoungGen      total 76288K, used 15491K [0x000000076b200000, 0x0000000770700000, 0x00000007c0000000)
  eden space 65536K, 23% used [0x000000076b200000,0x000000076c120d50,0x000000076f200000)
  from space 10752K, 0% used [0x000000076fc80000,0x000000076fc80000,0x0000000770700000)
  to   space 10752K, 0% used [0x000000076f200000,0x000000076f200000,0x000000076fc80000)
 ParOldGen       total 175104K, used 0K [0x00000006c1600000, 0x00000006cc100000, 0x000000076b200000)
  object space 175104K, 0% used [0x00000006c1600000,0x00000006c1600000,0x00000006cc100000)
 Metaspace       used 3341K, capacity 4496K, committed 4864K, reserved 1056768K
  class space    used 358K, capacity 388K, committed 512K, reserved 1048576K
```

**进行GC**

打开那行代码的注释

```
[GC (System.gc()) [PSYoungGen: 14180K->936K(76288K)] 14180K->944K(251392K), 0.0007476 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
[Full GC (System.gc()) [PSYoungGen: 936K->0K(76288K)] [ParOldGen: 8K->772K(175104K)] 944K->772K(251392K), [Metaspace: 3334K->3334K(1056768K)], 0.0037355 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
Heap
 PSYoungGen      total 76288K, used 1966K [0x000000076b200000, 0x0000000770700000, 0x00000007c0000000)
  eden space 65536K, 3% used [0x000000076b200000,0x000000076b3eb9e0,0x000000076f200000)
  from space 10752K, 0% used [0x000000076f200000,0x000000076f200000,0x000000076fc80000)
  to   space 10752K, 0% used [0x000000076fc80000,0x000000076fc80000,0x0000000770700000)
 ParOldGen       total 175104K, used 772K [0x00000006c1600000, 0x00000006cc100000, 0x000000076b200000)
  object space 175104K, 0% used [0x00000006c1600000,0x00000006c16c1140,0x00000006cc100000)
 Metaspace       used 3343K, capacity 4496K, committed 4864K, reserved 1056768K
  class space    used 358K, capacity 388K, committed 512K, reserved 1048576K
```

1、从打印日志就可以明显看出来，已经进行了GC

2、如果使用引用计数算法，那么这两个对象将会无法回收。而现在两个对象被回收了，说明Java使用的不是引用计数算法来进行标记的。

### 小结

- 引用计数算法，是很多语言的资源回收选择，例如因人工智能而更加火热的Python，它更是同时支持引用计数和垃圾收集机制。
- 具体哪种最优是要看场景的，业界有大规模实践中仅保留引用计数机制，以提高吞吐量的尝试。
- Java并没有选择引用计数，是因为其存在一个基本的难题，也就是很难处理循环引用关系。
- Python如何解决循环引用？
  - 手动解除：很好理解，就是在合适的时机，解除引用关系。
  - 使用弱引用weakref，weakref是Python提供的标准库，旨在解决循环引用。

## 标记阶段：可达性分析算法

**可达性分析算法：也可以称为根搜索算法、追踪性垃圾收集**

- 相对于引用计数算法而言，可达性分析算法不仅同样具备实现简单和执行高效等特点，更重要的是该算法可以有效地**解决在引用计数算法中循环引用的问题，防止内存泄漏的发生**。
- 相较于引用计数算法，这里的可达性分析就是Java、C#选择的。这种类型的垃圾收集通常也叫作**追踪性垃圾收集**（Tracing Garbage Collection）

### 可达性分析实现思路

- 所谓"GC Roots”根集合就是一组必须活跃的引用
- 其基本思路如下：
  - 可达性分析算法是以**根对象集合（GC Roots）**为起始点，按照从上至下的方式**搜索被根对象集合所连接的目标对象是否可达。**
  - 使用可达性分析算法后，内存中的存活对象都会被根对象集合直接或间接连接着，搜索所走过的路径称为**引用链（Reference Chain）**
  - 如果目标对象没有任何引用链相连，则是**不可达**的，就意味着该对象己经**死亡**，可以标记为**垃圾对象**。
  - 在可达性分析算法中，**只有能够被根对象集合直接或者间接连接的对象才是存活对象**。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120145630434.png" alt="image-20221120145630434" style="zoom:67%;" />

### GC Roots可以是哪些元素？

- **虚拟机栈中引用的对象**
  - 比如：各个线程被调用的方法中使用到的**参数**、**局部变量**等。
- **本地方法栈**内JNI（通常说的本地方法）引用的对象
- **方法区**中类**静态**属性引用的对象
  - 比如：Java类的引用类型静态变量
- **方法区**中**常量**引用的对象
  - 比如：字符串常量池（StringTable）里的引用
- 所有被**同步锁**synchronized持有的对象
- Java虚拟机内部的引用。
  - **基本数据类型对应的Class对象**，一些**常驻的异常对象**（如：NullPointerException、OutofMemoryError），**系统类加载器**。
- 反映java虚拟机内部情况的JMXBean、JVMTI中注册的回调、本地代码缓存等。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120150043060.png" alt="image-20221120150043060" style="zoom:50%;" />

- 总结
  - **虚拟机栈**(栈帧中的本地变量表)中引用的对象
  - **本地方法栈**(Native 方法)中引用的对象
  - **方法区**中**类静态属性**引用的对象
  - **方法区**中**常量**引用的对象
  - 所有被**同步锁**持有的对象
- 除了这些固定的GC Roots集合以外，根据用户所选用的垃圾收集器以及当前回收的内存区域不同，还可以有其他对象“临时性”地加入，共同构成完整GC Roots集合。比如：**分代收集**和**局部回收（PartialGC）**。
  - 如果只针对Java堆中的某一块区域进行垃圾回收（比如：典型的只针对新生代），必须考虑到内存区域是虚拟机自己的实现细节，更不是孤立封闭的，这个区域的对象完全有可能被其他区域的对象所引用，这时候就需要一并将关联的区域对象也加入GC Roots集合中去考虑，才能保证可达性分析的准确性。

**小技巧**

由于Root采用栈方式存放变量和指针，所以如果一个指针，它保存了堆内存里面的对象，但是自己又不存放在堆内存里面，那它就是一个Root。

### 注意

- 如果要使用可达性分析算法来判断内存是否可回收，那么分析工作必须在一个能保障一致性的快照中进行。这点不满足的话分析结果的准确性就无法保证。
- 这点也是导致GC进行时必须“Stop The World”的一个重要原因。
  - 即使是号称（几乎）不会发生停顿的CMS收集器中，**枚举根节点时也是必须要停顿的**。

## 对象的 finalization 机制

### finalize() 方法机制

**对象销毁前的回调函数：finalize()**

- Java语言提供了对象终止（finalization）机制来允许开发人员提供**对象被销毁之前的自定义处理逻辑**。
- 当垃圾回收器发现没有引用指向一个对象，即：垃圾回收此对象之前，总会先调用这个对象的**`finalize()`**方法。
- **`finalize()`** 方法允许在子类中被重写，**用于在对象被回收时进行资源释放**。通常在这个方法中进行一些资源释放和清理的工作，比如关闭文件、套接字和数据库连接等。

Object 类中 finalize() 源码

```
// 等待被重写
protected void finalize() throws Throwable { }
```

- **永远不要主动调用某个对象的finalize()方法**，应该交给垃圾回收机制调用。理由包括下面三点：
  - 在finalize()时可能会导致对象复活。
  - finalize()方法的执行时间是没有保障的，它完全由GC线程决定，极端情况下，若不发生GC，则finalize()方法将没有执行机会。
  - 一个糟糕的finalize()会严重影响GC的性能。比如finalize是个死循环
- 从功能上来说，finalize()方法与C++中的析构函数比较相似，但是Java采用的是基于垃圾回收器的自动内存管理机制，所以finalize()方法在**本质上不同于C++中的析构函数**。
- finalize()方法对应了一个finalize线程，因为优先级比较低，即使主动调用该方法，也不会因此就直接进行回收

### 生存还是死亡？

由于finalize()方法的存在，**虚拟机中的对象一般处于三种可能的状态。**

- 如果从所有的根节点都无法访问到某个对象，说明对象己经不再使用了。一般来说，此对象需要被回收。但事实上，也并非是“非死不可”的，这时候它们暂时处于“缓刑”阶段。

  **一个无法触及的对象有可能在某一个条件下“复活”自己**，如果这样，那么对它立即进行回收就是不合理的。为此，定义虚拟机中的对象可能的三种状态。如下：

  - **可触及的**：从根节点开始，可以到达这个对象。
  - **可复活的**：对象的所有引用都被释放，但是对象有可能在finalize()中复活。
  - **不可触及的**：对象的finalize()被调用，并且没有复活，那么就会进入不可触及状态。不可触及的对象不可能被复活，**因为finalize()只会被调用一次**。

- 以上3种状态中，是由于finalize()方法的存在，进行的区分。只有在对象不可触及时才可以被回收。

### 具体过程

判定一个对象objA是否可回收，至少要经历两次标记过程：

1. 如果对象objA到GC Roots没有引用链，则进行第一次标记。
2. 进行筛选，判断此对象是否有必要执行finalize()方法
   1. 如果对象objA**没有重写finalize()方法**，或者**finalize()方法已经被虚拟机调用过**，则虚拟机视为“没有必要执行”，objA被判定为**不可触及的**。
   2. 如果对象objA**重写了finalize()方法**，且**还未执行过**，那么objA会被插入到F-Queue队列中，由一个虚拟机自动创建的、低优先级的Finalizer线程触发其finalize()方法执行。
   3. **finalize()方法是对象逃脱死亡的最后机会**，稍后GC会对F-Queue队列中的对象进行第二次标记。**如果objA在finalize()方法中与引用链上的任何一个对象建立了联系，那么在第二次标记时，objA会被移出“即将回收”集合**。之后，对象会再次出现没有引用存在的情况。在这个情况下，finalize()方法不会被再次调用，对象会直接变成不可触及的状态，也就是说，一个对象的finalize()方法只会被调用一次。

**通过 JVisual VM 查看 Finalizer 线程**

![image-20221120152431812](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120152431812.png)

### 代码演示 finalize() 方法可复活对象

我们重写 CanReliveObj 类的 finalize()方法，在调用其 finalize()方法时，将 obj 指向当前类对象 this

```java
/**
 * 测试Object类中finalize()方法，即对象的finalization机制。
 *
 */
public class CanReliveObj {
    public static CanReliveObj obj;//类变量，属于 GC Root


    //此方法只能被调用一次
    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        System.out.println("调用当前类重写的finalize()方法");
        obj = this;//当前待回收的对象在finalize()方法中与引用链上的一个对象obj建立了联系
    }


    public static void main(String[] args) {
        try {
            obj = new CanReliveObj();
            // 对象第一次成功拯救自己
            obj = null;
            System.gc();//调用垃圾回收器
            System.out.println("第1次 gc");
            // 因为Finalizer线程优先级很低，暂停2秒，以等待它
            Thread.sleep(2000);
            if (obj == null) {
                System.out.println("obj is dead");
            } else {
                System.out.println("obj is still alive");
            }
            System.out.println("第2次 gc");
            // 下面这段代码与上面的完全相同，但是这次自救却失败了
            obj = null;
            System.gc();
            // 因为Finalizer线程优先级很低，暂停2秒，以等待它
            Thread.sleep(2000);
            if (obj == null) {
                System.out.println("obj is dead");
            } else {
                System.out.println("obj is still alive");
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

**如果注释掉finalize()方法**

```java
 //此方法只能被调用一次
    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        System.out.println("调用当前类重写的finalize()方法");
        obj = this;//当前待回收的对象在finalize()方法中与引用链上的一个对象obj建立了联系
    }
```

输出结果：

```
第1次 gc
obj is dead
第2次 gc
obj is dead
```

**放开finalize()方法**

输出结果：

```
第1次 gc
调用当前类重写的finalize()方法
obj is still alive
第2次 gc
obj is dead
```

第一次自救成功，但由于 finalize() 方法只会执行一次，所以第二次自救失败

> `Object` 类中的 `finalize` 方法一直被认为是一个糟糕的设计，成为了 Java 语言的负担，影响了 Java 语言的安全和 GC 的性能。JDK9 版本及后续版本中各个类中的 `finalize` 方法会被逐渐弃用移除。忘掉它的存在吧！
>
> 参考：
>
> - [JEP 421: Deprecate Finalization for Removalopen in new window](https://openjdk.java.net/jeps/421)
> - [是时候忘掉 finalize 方法了](https://mp.weixin.qq.com/s/LW-paZAMD08DP_3-XCUxmg)

------

## MAT与JProfiler的GC Roots溯源

### MAT 介绍

1. MAT是Memory Analyzer的简称，它是一款功能强大的Java堆内存分析器。用于查找内存泄漏以及查看内存消耗情况。
2. MAT是基于Eclipse开发的，是一款免费的性能分析工具。
3. 大家可以在http://www.eclipse.org/mat/下载并使用MAT

> 1、虽然Jvisualvm很强大，但是在内存分析方面，还是MAT更好用一些
>
> 2、此小节主要是为了实时分析GC Roots是哪些东西，中间需要用到一个dump的文件

### 获取 dump 文件方式

**方式一：命令行使用 jmap**

![image-20221120153939599](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120153939599.png)

**方式二：使用JVisualVM**

1. 捕获的heap dump文件是一个临时文件，关闭JVisualVM后自动删除，若要保留，需要将其另存为文件。可通过以下方法捕获heap dump：
2. 操作步骤下面演示

### 捕捉 dump 示例

#### 使用JVisualVM捕捉 heap dump

代码：

- numList 和 birth 在第一次捕捉内存快照的时候，为 GC Roots
- 之后 numList 和 birth 置为 null ，对应的引用对象被回收，在第二次捕捉内存快照的时候，就不再是 GC Roots

```java
public class GCRootsTest {
    public static void main(String[] args) {
        List<Object> numList = new ArrayList<>();
        Date birth = new Date();

        for (int i = 0; i < 100; i++) {
            numList.add(String.valueOf(i));
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.println("数据添加完毕，请操作：");
        new Scanner(System.in).next();
        numList = null;
        birth = null;

        System.out.println("numList、birth已置空，请操作：");
        new Scanner(System.in).next();

        System.out.println("结束");
    }
}
```

**如何捕捉堆内存快照**

1、先执行第一步，然后停下来，去生成此步骤dump文件

![image-20221120154824063](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120154824063.png)

2、 点击【堆 Dump】

![image-20221120154857149](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120154857149.png)

3、右键 --> 另存为即可

![image-20221120154915370](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120154915370.png)

4、输入命令，继续执行程序

5、我们接着捕获第二张堆内存快照

#### 使用 MAT 查看堆内存快照

1、打开 MAT ，选择File --> Open File，打开刚刚的两个dump文件，**我们先打开第一个dump文件**

> 点击Open Heap Dump也行

![image-20221120154943977](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120154943977.png)

2、选择Java Basics --> GC Roots

![image-20221120154959229](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120154959229.png)

3、第一次捕捉堆内存快照时，GC Roots 中包含我们定义的两个局部变量，类型分别为 ArrayList 和 Date，Total:21

![image-20221120155032064](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120155032064.png)

4、打开第二个dump文件，第二次捕获内存快照时，由于两个局部变量引用的对象被释放，所以这两个局部变量不再作为 GC Roots ，从 Total Entries = 19 也可以看出（少了两个 GC Roots）

- 在实际开发中，我们很少会查看所有的GC Roots。一般都是查看某一个或几个对象的GC Root是哪个，这个过程叫**GC Roots 溯源**
- 下面我们使用使用 JProfiler 进行 GC Roots 溯源演示

#### JProfiler 进行 GC Roots 溯源

依然用下面这个代码

```java
public class GCRootsTest {
    public static void main(String[] args) {
        List<Object> numList = new ArrayList<>();
        Date birth = new Date();

        for (int i = 0; i < 100; i++) {
            numList.add(String.valueOf(i));
            try {
                Thread.sleep(10);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.println("数据添加完毕，请操作：");
        new Scanner(System.in).next();
        numList = null;
        birth = null;

        System.out.println("numList、birth已置空，请操作：");
        new Scanner(System.in).next();

        System.out.println("结束");
    }
}
```

1、

![image-20221120164144865](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120164144865.png)

2、

![image-20221120164228258](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120164228258.png)

![image-20221120164250661](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120164250661.png)

可以发现颜色变绿了，可以动态的看变化

3、右击对象，选择 Show Selection In Heap Walker，单独的查看某个对象

![image-20221120164325900](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120164325900.png)

![image-20221120164354098](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120164354098.png)

4、选择Incoming References，表示追寻 GC Roots 的源头

点击Show Paths To GC Roots，在弹出界面中选择默认设置即可

![image-20221120164053309](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120164053309.png)

![image-20221120163957205](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120163957205.png)

![image-20221120163924220](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120163924220.png)

### JProfiler 分析 OOM

> 这里是简单的讲一下，后面篇章会详解

```java
/**
 * -Xms8m -Xmx8m 
 * -XX:+HeapDumpOnOutOfMemoryError  这个参数的意思是当程序出现OOM的时候就会在当前工程目录生成一个dump文件
 */
public class HeapOOM {
    byte[] buffer = new byte[1 * 1024 * 1024];//1MB

    public static void main(String[] args) {
        ArrayList<HeapOOM> list = new ArrayList<>();

        int count = 0;
        try{
            while(true){
                list.add(new HeapOOM());
                count++;
            }
        }catch (Throwable e){
            System.out.println("count = " + count);
            e.printStackTrace();
        }
    }
}
```

程序输出日志

```
java.lang.OutOfMemoryError: Java heap space
Dumping heap to java_pid41340.hprof ...
Heap dump file created [7931805 bytes in 0.008 secs]
count = 6
java.lang.OutOfMemoryError: Java heap space
	at HeapOOM.<init>(HeapOOM.java:8)
	at HeapOOM.main(HeapOOM.java:16)
Picked up JAVA_TOOL_OPTIONS: -Dfile.encoding=UTF-8
```

打开这个dump文件

1、看这个超大对象

![image-20221120164857071](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120164857071.png)

2、揪出 main() 线程中出问题的代码

![image-20221120164948277](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120164948277.png)

## 清除阶段：标记-清除算法

**垃圾清除阶段**

- 当成功区分出内存中存活对象和死亡对象后，GC接下来的任务就是执行垃圾回收，释放掉无用对象所占用的内存空间，以便有足够的可用内存空间为新对象分配内存。目前在JVM中比较常见的三种垃圾收集算法是
  - 标记-清除算法（Mark-Sweep）
  - 复制算法（Copying）
  - 标记-压缩算法（Mark-Compact）

**背景**

标记-清除算法（Mark-Sweep）是一种非常基础和常见的垃圾收集算法，该算法被J.McCarthy等人在1960年提出并并应用于Lisp语言。

**执行过程**

当堆中的有效内存空间（available memory）被耗尽的时候，就会停止整个程序（也被称为stop the world），然后进行两项工作，第一项则是标记，第二项则是清除

- 标记：Collector从**引用根节点**开始遍历，**标记所有被引用的对象**。一般是在对象的Header中记录为**可达对象**。
  - 注意：标记的是被引用的对象，也就是可达对象，并非标记的是即将被清除的垃圾对象
- 清除：Collector对堆内存**从头到尾进行线性**的遍历，如果发现某个对象在其Header中没有标记为可达对象，则将其回收

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120173504974.png" alt="image-20221120173504974" style="zoom:67%;" />

**标记-清除算法的缺点**

- 标记清除算法的效率不算高
- 在进行GC的时候，需要停止整个应用程序，用户体验较差
- 这种方式清理出来的空闲内存是不连续的，产生内存碎片，需要维护一个空闲列表

**注意：何为清除？**

这里所谓的清除并不是真的置空，而是把需要清除的对象地址保存在空闲的地址列表里。下次有新对象需要加载时，判断垃圾的位置空间是否够，如果够，就存放（也就是**覆盖**原有的地址）。

关于空闲列表是在为对象分配内存的时候提过：

- 如果内存规整
  - 采用指针碰撞的方式进行内存分配
- 如果内存不规整
  - 虚拟机需要维护一个空闲列表
  - 采用空闲列表分配内存

## 清除阶段：标记-复制算法

**背景**

为了解决标记-清除算法在垃圾收集效率方面的缺陷，M.L.Minsky于1963年发表了著名的论文，“使用双存储区的Lisp语言垃圾收集器CA LISP Garbage Collector Algorithm Using Serial Secondary Storage）”。M.L.Minsky在该论文中描述的算法被人们称为复制（Copying）算法，它也被M.L.Minsky本人成功地引入到了Lisp语言的一个实现版本中。

**核心思想**

将活着的内存空间分为两块，每次只使用其中一块，在垃圾回收时将正在使用的内存中的存活对象复制到未被使用的内存块中，之后清除正在使用的内存块中的所有对象，交换两个内存的角色，最后完成垃圾回收

![image-20221120214726547](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120214726547.png)

新生代里面就用到了复制算法，Eden区和S0区存活对象整体复制到S1区

**复制算法的优缺点**

**优点**

- 没有标记和清除过程，实现简单，**运行高效**
- 复制过去以后保证**空间的连续性**，不会出现“碎片”问题。

**缺点**

- 此算法的缺点也是很明显的，就是需要两倍的内存空间。
- 对于G1这种分拆成为大量region的GC，复制而不是移动，意味着GC需要维护region之间对象引用关系，不管是内存占用或者时间开销也不小

**复制算法的应用场景**

- 如果系统中的垃圾对象很多，复制算法需要复制的存活对象数量并不会太大，效率较高
- 老年代大量的对象存活，那么复制的对象将会有很多，效率会很低
- 在新生代，对常规应用的垃圾回收，一次通常可以回收70% - 99% 的内存空间。回收性价比很高。所以现在的商业虚拟机都是用这种收集算法回收新生代。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120215938676.png" alt="image-20221120215938676" style="zoom:67%;" />

## 清除阶段：标记-压缩算法

**标记-压缩（或标记-整理、Mark - Compact）算法**

**背景**

1. 复制算法的高效性是建立在**存活对象少、垃圾对象多**的前提下的。这种情况在新生代经常发生，但是在老年代，更常见的情况是大部分对象都是存活对象。如果依然使用复制算法，由于存活对象较多，复制的成本也将很高。因此，**基于老年代垃圾回收的特性，需要使用其他的算法。**
2. 标记-清除算法的确可以应用在老年代中，但是该算法不仅执行效率低下，而且在执行完内存回收后还会产生内存碎片，所以JVM的设计者需要在此基础之上进行改进。标记-压缩（Mark-Compact）算法由此诞生。
3. 1970年前后，G.L.Steele、C.J.Chene和D.s.Wise等研究者发布标记-压缩算法。在许多现代的垃圾收集器中，人们都使用了标记-压缩算法或其改进版本。

**执行过程**

1. 第一阶段和标记清除算法一样，从根节点开始标记所有被引用对象
2. 第二阶段将所有的存活对象压缩到内存的一端，按顺序排放。之后，清理边界外所有的空间。

![image-20221120220549895](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221120220549895.png)

**标记-压缩算法与标记-清除算法的比较**

- 标记-压缩算法的最终效果等同于标记-清除算法执行完成后，再进行一次内存碎片整理，因此，也可以把它称为**标记-清除-压缩（Mark-Sweep-Compact）算法**。
- 二者的本质差异在于标记-清除算法是一种**非移动式的回收算法**，标记-压缩是**移动式的**。是否移动回收后的存活对象是一项优缺点并存的风险决策。
- 可以看到，标记的存活对象将会被整理，按照内存地址依次排列，而未被标记的内存会被清理掉。如此一来，当我们需要给新对象分配内存时，JVM只需要持有一个内存的起始地址即可，这比维护一个空闲列表显然少了许多开销。

**标记-压缩算法的优缺点**

**优点**

- 消除了标记-清除算法当中，内存区域分散的缺点，我们需要给新对象分配内存时，JVM只需要持有一个内存的起始地址即可。
- 消除了复制算法当中，内存减半的高额代价。

**缺点**

- 从效率上来说，标记-整理算法要低于复制算法。
- 移动对象的同时，如果对象被其他对象引用，则还需要调整引用的地址（因为HotSpot虚拟机采用的不是句柄池的方式，而是直接指针）
- 移动过程中，需要全程暂停用户应用程序。即：STW

## 垃圾回收算法小结

> **对比三种清除阶段的算法**

1. 效率上来说，复制算法是当之无愧的老大，但是却浪费了太多内存。
2. 而为了尽量兼顾上面提到的三个指标，标记-整理算法相对来说更平滑一些，但是效率上不尽如人意，它比复制算法多了一个标记的阶段，比标记-清除多了一个整理内存的阶段。

|              | 标记清除           | 标记整理         | 复制                                  |
| ------------ | ------------------ | ---------------- | ------------------------------------- |
| **速率**     | 中等               | 最慢             | 最快                                  |
| **空间开销** | 少（但会堆积碎片） | 少（不堆积碎片） | 通常需要活对象的2倍空间（不堆积碎片） |
| **移动对象** | 否                 | 是               | 是                                    |

## 分代收集算法

Q：难道就没有一种最优的算法吗？

A：无，没有最好的算法，只有最合适的算法

**为什么要使用分代收集算法**

- 前面所有这些算法中，并没有一种算法可以完全替代其他算法，它们都具有自己独特的优势和特点。分代收集算法应运而生。
- 分代收集算法，是基于这样一个事实：**不同的对象的生命周期是不一样的。因此，不同生命周期的对象可以采取不同的收集方式，以便提高回收效率。**一般是把Java堆分为新生代和老年代，这样就可以根据各个年代的特点使用不同的回收算法，以提高垃圾回收的效率。
- 在Java程序运行的过程中，会产生大量的对象，其中有些对象是与业务信息相关:
  - 比如Http请求中的Session对象、线程、Socket连接，这类对象跟业务直接挂钩，因此生命周期比较长。
  - 但是还有一些对象，主要是程序运行过程中生成的临时变量，这些对象生命周期会比较短，比如：String对象，由于其不变类的特性，系统会产生大量的这些对象，有些对象甚至只用一次即可回收。

**目前几乎所有的GC都采用分代收集算法执行垃圾回收的**

在HotSpot中，基于分代的概念，GC所使用的内存回收算法必须结合年轻代和老年代各自的特点。

- **年轻代（Young Gen）**
  - 年轻代特点：区域相对老年代较小，对象生命周期短、存活率低，回收频繁。
  - 这种情况复制算法的回收整理，速度是最快的。复制算法的效率只和当前存活对象大小有关，因此很适用于年轻代的回收。而复制算法内存利用率不高的问题，通过hotspot中的两个survivor的设计得到缓解。
- **老年代（Tenured Gen）**
  - 老年代特点：区域较大，对象生命周期长、存活率高，回收不及年轻代频繁。
  - 这种情况存在大量存活率高的对象，复制算法明显变得不合适。一般是由标记-清除或者是标记-清除与标记-整理的混合实现。
    - Mark阶段的开销与存活对象的数量成正比。
    - Sweep阶段的开销与所管理区域的大小成正相关。
    - Compact阶段的开销与存活对象的数据成正比。
- 以HotSpot中的CMS回收器为例，CMS是基于Mark-Sweep实现的，对于对象的回收效率很高。对于碎片问题，CMS采用基于Mark-Compact算法的Serial Old回收器作为补偿措施：当内存回收不佳（碎片导致的Concurrent Mode Failure时），将采用Serial Old执行Full GC以达到对老年代内存的整理。
- 分代的思想被现有的虚拟机广泛使用。几乎所有的垃圾回收器都区分新生代和老年代

## 增量收集算法和分区算法

### 增量收集算法

上述现有的算法，在垃圾回收过程中，应用软件将处于一种Stop the World的状态。在**Stop the World**状态下，应用程序所有的线程都会挂起，暂停一切正常的工作，等待垃圾回收的完成。如果垃圾回收时间过长，应用程序会被挂起很久，**将严重影响用户体验或者系统的稳定性**。为了解决这个问题，即对实时垃圾收集算法的研究直接导致了增量收集（Incremental Collecting）算法的诞生。

**增量收集算法基本思想**

- 如果一次性将所有的垃圾进行处理，需要造成系统长时间的停顿，那么就可以让垃圾收集线程和应用程序线程交替执行。**每次，垃圾收集线程只收集一小片区域的内存空间，接着切换到应用程序线程。依次反复，直到垃圾收集完成。**
- 总的来说，增量收集算法的基础仍是传统的标记-清除和复制算法。增量收集算法通过**对线程间冲突的妥善处理，允许垃圾收集线程以分阶段的方式完成标记、清理或复制工作**

**增量收集算法的缺点**

使用这种方式，由于在垃圾回收过程中，间断性地还执行了应用程序代码，所以能减少系统的停顿时间。但是，因为线程切换和上下文转换的消耗，会使得垃圾回收的总体成本上升，**造成系统吞吐量的下降**。

### 分区算法

> 主要针对G1收集器来说的

- 一般来说，在相同条件下，堆空间越大，一次GC时所需要的时间就越长，有关GC产生的停顿也越长。为了更好地控制GC产生的停顿时间，将一块大的内存区域分割成多个小块，根据目标的停顿时间，每次合理地回收若干个小区间，而不是整个堆空间，从而减少一次GC所产生的停顿。
- 分代算法将按照对象的生命周期长短划分成两个部分，分区算法将整个堆空间划分成连续的不同小区间。每一个小区间都独立使用，独立回收。这种算法的好处是可以控制一次回收多少个小区间。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121141503168.png" alt="image-20221121141503168" style="zoom:67%;" />

## 写在最后

注意，这些只是基本的算法思路，实际GC实现过程要复杂的多，目前还在发展中的前沿GC都是**复合**算法，并且并行和并发兼备。

------

# 垃圾回收相关概念

## System.gc() 的理解

1. 在默认情况下，通过System.gc()者Runtime.getRuntime().gc() 的调用，**会显式触发Full GC**，同时对老年代和新生代进行回收，尝试释放被丢弃对象占用的内存。
2. 然而System.gc()调用附带一个免责声明，无法保证对垃圾收集器的调用(不能确保立即生效)
3. JVM实现者可以通过System.gc() 调用来决定JVM的GC行为。而一般情况下，垃圾回收应该是自动进行的，**无须手动触发，否则就太过于麻烦了。**在一些特殊情况下，如我们正在编写一个性能基准，我们可以在运行之间调用System.gc()

**代码示例：手动执行 GC 操作**

```java
public class SystemGCTest {
    public static void main(String[] args) {
        new SystemGCTest();
        System.gc();//提醒jvm的垃圾回收器执行gc,但是不确定是否马上执行gc
        //与Runtime.getRuntime().gc();的作用一样。

//        System.runFinalization();//强制调用使用引用的对象的finalize()方法
    }
    //如果发生了GC，这个finalize()一定会被调用
    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        System.out.println("SystemGCTest 重写了finalize()");
    }
}
```

输出结果会调用 finalize() 方法

```
SystemGCTest 重写了finalize()
```

### 手动 GC 理解不可达对象的回收行为

```java
//加上参数：  -XX:+PrintGCDetails
public class LocalVarGC {
    public void localvarGC1() {
        byte[] buffer = new byte[10 * 1024 * 1024];//10MB
        System.gc();
    }

    public void localvarGC2() {
        byte[] buffer = new byte[10 * 1024 * 1024];
        buffer = null;
        System.gc();
    }

    public void localvarGC3() {
        {
            byte[] buffer = new byte[10 * 1024 * 1024];
        }
        System.gc();
    }

    public void localvarGC4() {
        {
            byte[] buffer = new byte[10 * 1024 * 1024];
        }
        int value = 10;
        System.gc();
    }

    public void localvarGC5() {
        localvarGC1();
        System.gc();
    }

    public static void main(String[] args) {
        LocalVarGC local = new LocalVarGC();
        //通过在main方法调用这几个方法进行测试
        local.localvarGC1();
    }
}
```

JVM参数：

```
-Xms256m -Xmx256m -XX:+PrintGCDetails
```

**1、调用 localvarGC1() 方法**

执行 System.gc() 仅仅是将年轻代的 buffer 数组对象放到了老年代，buffer对象仍然没有回收

```
[GC (System.gc()) [PSYoungGen: 14180K->10728K(76288K)] 14180K->11088K(251392K), 0.0055618 secs] [Times: user=0.02 sys=0.00, real=0.00 secs] 
[Full GC (System.gc()) [PSYoungGen: 10728K->0K(76288K)] [ParOldGen: 360K->10988K(175104K)] 11088K->10988K(251392K), [Metaspace: 3320K->3320K(1056768K)], 0.0044569 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
Heap
 PSYoungGen      total 76288K, used 3277K [0x000000076b200000, 0x0000000770700000, 0x00000007c0000000)
  eden space 65536K, 5% used [0x000000076b200000,0x000000076b5334d8,0x000000076f200000)
  from space 10752K, 0% used [0x000000076f200000,0x000000076f200000,0x000000076fc80000)
  to   space 10752K, 0% used [0x000000076fc80000,0x000000076fc80000,0x0000000770700000)
 ParOldGen       total 175104K, used 10988K [0x00000006c1600000, 0x00000006cc100000, 0x000000076b200000)
  object space 175104K, 6% used [0x00000006c1600000,0x00000006c20bb398,0x00000006cc100000)
 Metaspace       used 3338K, capacity 4496K, committed 4864K, reserved 1056768K
  class space    used 357K, capacity 388K, committed 512K, reserved 1048576K
```

**2、调用 localvarGC2() 方法**

由于 buffer 数组对象没有引用指向它，执行 System.gc() 将被回收

```
[GC (System.gc()) [PSYoungGen: 14180K->992K(76288K)] 14180K->1000K(251392K), 0.0007639 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
[Full GC (System.gc()) [PSYoungGen: 992K->0K(76288K)] [ParOldGen: 8K->773K(175104K)] 1000K->773K(251392K), [Metaspace: 3334K->3334K(1056768K)], 0.0033230 secs] [Times: user=0.02 sys=0.00, real=0.00 secs] 
Heap
 PSYoungGen      total 76288K, used 1966K [0x000000076b200000, 0x0000000770700000, 0x00000007c0000000)
  eden space 65536K, 3% used [0x000000076b200000,0x000000076b3eb9e0,0x000000076f200000)
  from space 10752K, 0% used [0x000000076f200000,0x000000076f200000,0x000000076fc80000)
  to   space 10752K, 0% used [0x000000076fc80000,0x000000076fc80000,0x0000000770700000)
 ParOldGen       total 175104K, used 773K [0x00000006c1600000, 0x00000006cc100000, 0x000000076b200000)
  object space 175104K, 0% used [0x00000006c1600000,0x00000006c16c14a8,0x00000006cc100000)
 Metaspace       used 3344K, capacity 4496K, committed 4864K, reserved 1056768K
  class space    used 358K, capacity 388K, committed 512K, reserved 1048576K
```

**3、调用 localvarGC3() 方法**

虽然出了代码块的作用域，但是 buffer 数组对象并没有被回收

```
[GC (System.gc()) [PSYoungGen: 14180K->10736K(76288K)] 14180K->11124K(251392K), 0.0061057 secs] [Times: user=0.02 sys=0.02, real=0.01 secs] 
[Full GC (System.gc()) [PSYoungGen: 10736K->0K(76288K)] [ParOldGen: 388K->10988K(175104K)] 11124K->10988K(251392K), [Metaspace: 3320K->3320K(1056768K)], 0.0045386 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
Heap
 PSYoungGen      total 76288K, used 3277K [0x000000076b200000, 0x0000000770700000, 0x00000007c0000000)
  eden space 65536K, 5% used [0x000000076b200000,0x000000076b5334d8,0x000000076f200000)
  from space 10752K, 0% used [0x000000076f200000,0x000000076f200000,0x000000076fc80000)
  to   space 10752K, 0% used [0x000000076fc80000,0x000000076fc80000,0x0000000770700000)
 ParOldGen       total 175104K, used 10988K [0x00000006c1600000, 0x00000006cc100000, 0x000000076b200000)
  object space 175104K, 6% used [0x00000006c1600000,0x00000006c20bb398,0x00000006cc100000)
 Metaspace       used 3343K, capacity 4496K, committed 4864K, reserved 1056768K
  class space    used 358K, capacity 388K, committed 512K, reserved 1048576K
```

**原因：**

1、来看看字节码：实例方法局部变量表第一个变量肯定是 this

![image-20221121144208829](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121144208829.png)

2、你有没有看到，局部变量表的大小是 2。但是局部变量表里只有一个索引为0的啊？那索引为1的是哪个局部变量呢？实际上索引为1的位置是buffer在占用着，执行 System.gc() 时，栈中还有 buffer 变量指向堆中的字节数组，所以没有进行GC

![image-20221121144233093](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121144233093.png)

3、那么这种代码块的情况，什么时候会被GC呢？我们来看第四个方法

**4、调用 localvarGC4() 方法**

```
[GC (System.gc()) [PSYoungGen: 14180K->992K(76288K)] 14180K->1000K(251392K), 0.0008343 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
[Full GC (System.gc()) [PSYoungGen: 992K->0K(76288K)] [ParOldGen: 8K->748K(175104K)] 1000K->748K(251392K), [Metaspace: 3323K->3323K(1056768K)], 0.0038989 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
Heap
 PSYoungGen      total 76288K, used 3277K [0x000000076b200000, 0x0000000770700000, 0x00000007c0000000)
  eden space 65536K, 5% used [0x000000076b200000,0x000000076b5334d8,0x000000076f200000)
  from space 10752K, 0% used [0x000000076f200000,0x000000076f200000,0x000000076fc80000)
  to   space 10752K, 0% used [0x000000076fc80000,0x000000076fc80000,0x0000000770700000)
 ParOldGen       total 175104K, used 748K [0x00000006c1600000, 0x00000006cc100000, 0x000000076b200000)
  object space 175104K, 0% used [0x00000006c1600000,0x00000006c16bb288,0x00000006cc100000)
 Metaspace       used 3344K, capacity 4496K, committed 4864K, reserved 1056768K
  class space    used 358K, capacity 388K, committed 512K, reserved 1048576K
```

Q：就多定义了一个局部变量 value ，就可以把字节数组回收了呢？

A：局部变量表长度为 2 ，这说明了出了代码块时，buffer 就出了其作用域范围，此时没有为 value 开启新的槽，value 变量直接占据了 buffer 变量的槽（Slot），导致堆中的字节数组没有引用再指向它，执行 System.gc() 时被回收。看，value 位于局部变量表中索引为 1 的位置。value这个局部变量把原本属于buffer的slot给占用了，这样栈上就没有buffer变量指向`new byte[10 * 1024 * 1024]`实例了。

> 这点看不懂的可以看我前面的文章：虚拟机栈 --> Slot的重复利用

![image-20221121144308124](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121144308124.png)

![image-20221121144325127](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121144325127.png)

**调用 localvarGC5() 方法**

局部变量除了方法范围就是失效了，堆中的字节数组铁定被回收

> Hotspot虚拟机并没有采用栈上分配

```
[GC (System.gc()) [PSYoungGen: 14180K->10728K(76288K)] 14180K->11088K(251392K), 0.0052583 secs] [Times: user=0.02 sys=0.00, real=0.00 secs] 
[Full GC (System.gc()) [PSYoungGen: 10728K->0K(76288K)] [ParOldGen: 360K->11014K(175104K)] 11088K->11014K(251392K), [Metaspace: 3335K->3335K(1056768K)], 0.0058493 secs] [Times: user=0.00 sys=0.00, real=0.01 secs] 
[GC (System.gc()) [PSYoungGen: 0K->0K(76288K)] 11014K->11014K(251392K), 0.0016498 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
[Full GC (System.gc()) [PSYoungGen: 0K->0K(76288K)] [ParOldGen: 11014K->774K(175104K)] 11014K->774K(251392K), [Metaspace: 3335K->3335K(1056768K)], 0.0043727 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
Heap
 PSYoungGen      total 76288K, used 1966K [0x000000076b200000, 0x0000000770700000, 0x00000007c0000000)
  eden space 65536K, 3% used [0x000000076b200000,0x000000076b3eb9e0,0x000000076f200000)
  from space 10752K, 0% used [0x000000076fc80000,0x000000076fc80000,0x0000000770700000)
  to   space 10752K, 0% used [0x000000076f200000,0x000000076f200000,0x000000076fc80000)
 ParOldGen       total 175104K, used 774K [0x00000006c1600000, 0x00000006cc100000, 0x000000076b200000)
  object space 175104K, 0% used [0x00000006c1600000,0x00000006c16c1870,0x00000006cc100000)
 Metaspace       used 3344K, capacity 4496K, committed 4864K, reserved 1056768K
  class space    used 358K, capacity 388K, committed 512K, reserved 1048576K
```

## 内存溢出与内存泄漏

### 内存溢出

- 内存溢出相对于内存泄漏来说，尽管更容易被理解，但是同样的，内存溢出也是引发程序崩溃的罪魁祸首之一。
- 由于GC一直在发展，所有一般情况下，除非应用程序占用的内存增长速度非常快，造成垃圾回收已经跟不上内存消耗的速度，否则不太容易出现OOM的情况。
- 大多数情况下，GC会进行各种年龄段的垃圾回收，实在不行了就放大招，来一次独占式的Full GC操作，这时候会回收大量的内存，供应用程序继续使用。
- Javadoc中对OutofMemoryError的解释是，**没有空闲内存，并且垃圾收集器也无法提供更多内存**。

**内存溢出（OOM）原因分析**

首先说没有空闲内存的情况：说明Java虚拟机的堆内存不够。原因有二：

- Java虚拟机的堆内存设置不够
  - 比如：可能存在内存泄漏问题；也很有可能就是堆的大小不合理，比如我们要处理比较可观的数据量，但是没有显式指定JVM堆大小或者指定数值偏小。我们可以通过参数-Xms 、-Xmx来调整。
- 代码中创建了大量大对象，并且长时间不能被垃圾收集器收集（存在被引用）
  - 对于老版本的Oracle JDK，因为永久代的大小是有限的，并且JVM对永久代垃圾回收（如，常量池回收、卸载不再需要的类型）非常不积极，所以当我们不断添加新类型的时候，永久代出现OutOfMemoryError也非常多见。尤其是在运行时存在大量动态类型生成的场合；类似intern字符串缓存占用太多空间，也会导致OOM问题。对应的异常信息，会标记出来和永久代相关：“java.lang.OutOfMemoryError:PermGen space"。
  - 随着元数据区的引入，方法区内存已经不再那么窘迫，所以相应的OOM有所改观，出现OOM，异常信息则变成了：“java.lang.OutofMemoryError:Metaspace"。直接内存不足，也会导致OOM。
- 这里面隐含着一层意思是，在抛出OutofMemoryError之前，通常垃圾收集器会被触发，尽其所能去清理出空间。
  - 例如：在引用机制分析中，涉及到JVM会去尝试**回收软引用指向的对象**等
  - 在java.nio.Bits.reserveMemory()方法中，我们能清楚的看到，System.gc()会被调用，以清理空间。
- 当然，也不是在任何情况下垃圾收集器都会被触发的
  - 比如，我们去分配一个超大对象，类似一个超大数组超过堆的最大值，JVM可以判断出垃圾收集并不能解决这个问题，所以直接抛出OutofMemoryError。

### 内存泄漏

- 也称作“存储渗漏”。严格来说，**只有对象不会再被程序用到了，但是GC又不能回收他们的情况，才叫内存泄漏。**
- 但实际情况很多时候一些不太好的实践（或疏忽）会导致对象的生命周期变得很长甚至导致OOM，也可以叫做宽泛意义上的“内存泄漏”。
- 尽管内存泄漏并不会立刻引起程序崩溃，但是一旦发生内存泄漏，程序中的可用内存就会被逐步蚕食，直至耗尽所有内存，最终出现OutofMemory异常，导致程序崩溃。
- 注意，这里的存储空间并不是指物理内存，而是指虚拟内存大小，这个虚拟内存大小取决于磁盘交换区设定的大小。

**内存泄露官方例子**

左边的图：Java使用可达性分析算法，最上面的数据不可达，就是需要被回收的对象。

右边的图：后期有一些对象不用了，按道理应该断开引用，但是存在一些链没有断开（图示中的Forgotten Reference Memory Leak），从而导致没有办法被回收。

![image-20221121145713426](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121145713426.png)

**常见例子**

1. 单例模式
   - 单例的生命周期和应用程序是一样长的，所以在单例程序中，如果持有对外部对象的引用的话，那么这个外部对象是不能被回收的，则会导致内存泄漏的产生。
2. 一些提供close()的资源未关闭导致内存泄漏
   - 数据库连接 dataSourse.getConnection()，网络连接socket和io连接必须手动close，否则是不能被回收的。

## Stop the World

- Stop-the-World，简称STW，指的是GC事件发生过程中，会产生应用程序的停顿。**停顿产生时整个应用程序线程都会被暂停，没有任何响应**，有点像卡死的感觉，这个停顿称为STW。
- 可达性分析算法中枚举根节点（GC Roots）会导致所有Java执行线程停顿，为什么需要停顿所有 Java 执行线程呢？
  - 分析工作必须在一个能确保一致性的快照中进行
  - 一致性指整个分析期间整个执行系统看起来像被冻结在某个时间点上
  - **如果出现分析过程中对象引用关系还在不断变化，则分析结果的准确性无法保证**
- 被STW中断的应用程序线程会在完成GC之后恢复，频繁中断会让用户感觉像是网速不快造成电影卡带一样，所以我们需要减少STW的发生。
- STW事件和采用哪款GC无关，所有的GC都有这个事件。
- 哪怕是G1也不能完全避免Stop-the-world情况发生，只能说垃圾回收器越来越优秀，回收效率越来越高，尽可能地缩短了暂停时间。
- STW是JVM在**后台自动发起和自动完成**的。在用户不可见的情况下，把用户正常的工作线程全部停掉。
- 开发中不要用System.gc() ，这会导致Stop-the-World的发生。

### 代码感受 Stop the World

```java
public class StopTheWorldDemo {
    public static class WorkThread extends Thread {
        List<byte[]> list = new ArrayList<byte[]>();

        public void run() {
            try {
                while (true) {
                    for(int i = 0;i < 1000;i++){
                        byte[] buffer = new byte[1024];
                        list.add(buffer);
                    }

                    if(list.size() > 10000){
                        list.clear();
                        System.gc();//会触发full gc，进而会出现STW事件
                     
                    }
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
    }

    public static class PrintThread extends Thread {
        public final long startTime = System.currentTimeMillis();

        public void run() {
            try {
                while (true) {
                    // 每秒打印时间信息
                    long t = System.currentTimeMillis() - startTime;
                    System.out.println(t / 1000 + "." + t % 1000);
                    Thread.sleep(1000);
                }
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
    }

    public static void main(String[] args) {
        WorkThread w = new WorkThread();
        PrintThread p = new PrintThread();
        w.start();
        p.start();
    }
}
```

关闭工作线程 w ，观察输出：当前时间间隔与上次时间间隔**基本**是每隔1秒打印一次

```
0.1
1.1
2.2
3.2
4.3
5.3
6.3
7.3

Process finished with exit code -1
```

开启工作线程 w ，观察打印输出：当前时间间隔与上次时间间隔相差 1.3s ，可以明显感受到 Stop the World 的存在

```
0.1
1.4
2.7
3.8
4.12
5.13

Process finished with exit code -1
```

## 垃圾回收的并行与并发

### 并发的概念

- 在操作系统中，是指**一个时间段**中有几个程序都处于已启动运行到运行完毕之间，且这几个程序都是在同一个处理器上运行
- 并发不是真正意义上的“同时进行”，只是CPU把一个时间段划分成几个时间片段（时间区间），然后在这几个时间区间之间来回切换。由于CPU处理的速度非常快，只要时间间隔处理得当，即可让用户感觉是多个应用程序同时在进行

![image-20221121155528657](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121155528657.png)

### 并行的概念

- 当系统有一个以上CPU时，当一个CPU执行一个进程时，另一个CPU可以执行另一个进程，两个进程互不抢占CPU资源，可以**同时**进行，我们称之为并行（Parallel）
- 其实决定并行的因素不是CPU的数量，而是CPU的核心数量，比如一个CPU多个核也可以并行
- 适合科学计算，后台处理等弱交互场景

![image-20221121155835302](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121155835302.png)

> **并发与并行的对比**

- 并发，指的是多个事情，在**同一时间段**内同时发生了。
- 并行，指的是多个事情，在**同一时间点**上（或者说同一时刻）同时发生了。
- 并发的多个任务之间是互相抢占资源的。并行的多个任务之间是不互相抢占资源的。
- 只有在多CPU或者一个CPU多核的情况中，才会发生并行。否则，看似同时发生的事情，其实都是并发执行的。

### 垃圾回收的并发与并行

- 并行（Parallel）：指多条垃圾收集线程并行工作，但此时用户线程仍处于等待状态。
  - 如ParNew、Parallel Scavenge、Parallel Old
- 串行（Serial）
  - 相较于并行的概念，单线程执行。
  - 如果内存不够，则程序暂停，启动JVM垃圾回收器进行垃圾回收（单线程）

![image-20221121170855816](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121170855816.png)

并发和并行，在谈论垃圾收集器的上下文语境中，它们可以解释如下：

- 并发（Concurrent）：指**用户线程与垃圾收集线程同时执行**（但不一定是并行的，可能会交替执行），垃圾回收线程在执行时不会停顿用户程序的运行。
  - 比如用户程序在继续运行，而垃圾收集程序线程运行于另一个CPU上；
- 典型垃圾回收器：CMS、G1

![image-20221121171155128](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121171155128.png)

## HotSpot的算法实现细节

### 根节点枚举

- 固定可作为GC Roots的节点主要在**全局性的引用**（例如常量或类静态属性）与**执行上下文**（例如栈帧中的本地变量表）中，尽管目标明确，但查找过程要做到高效并非一件容易的事情，现在Java应用越做越庞大，光是方法区的大小就常有数百上千兆，里面的类、常量等更是恒河沙数，若要逐个检查以这里为起源的引用肯定得消耗不少时间。

- 迄今为止，**所有收集器在根节点枚举这一步骤时都是必须暂停用户线程的**，因此毫无疑问根节点枚举与之前提及的整理内存碎片一样会面临相似的“Stop The World”的困扰。

  现在可达性分析算法耗时最长的查找引用链的过程已经可以做到与用户线程一起并发，**但根节点枚举始终还是必须在一个能保障一致性的快照中才得以进行**——这里**“一致性”**的意思是整个枚举期间执行子系统看起来就像被冻结在某个时间点上，不会出现分析过程中，根节点集合的对象引用关系还在不断变化的情况，若这点不能满足的话，分析结果准确性也就无法保证。

  这是导致垃圾收集过程必须停顿所有用户线程的其中一个重要原因，即使是号称停顿时间可控，或者（几乎）不会发生停顿的CMS、G1、 ZGC等收集器，枚举根节点时也是必须要停顿的。

- 由于目前主流Java虚拟机使用的都是**准确式垃圾收集**，所以当用户线程停顿下来之后，其实并不需要一个不漏地检查完所有执行上下文和全局的引用位置，虚拟机应当是有办法直接得到哪些地方存放着对象引用的。

  在HotSpot 的解决方案里，是使用一组称为**OopMap的数据结构**来达到这个目的。一旦类加载动作完成的时候， HotSpot就会把对象内什么偏移量上是什么类型的数据计算出来，在即时编译过程中，也会在特定的位置记录下栈里和寄存器里哪些位置是引用。这样收集器在扫描时就可以直接得知这些信息了，**并不需要真正一个不漏地从方法区等GC Roots开始查找**。

- Exact VM因它使用**准确式内存管理**（Exact Memory Management，也可以叫Non-Con- servative/Accurate Memory Management）而得名。

  准确式内存管理是指**虚拟机可以知道内存中某个位置的数据具体是什么类型**。譬如内存中有一个32bit的整数123456，虚拟机将有能力分辨出它到底是一 个指向了123456的内存地址的引用类型还是一个数值为123456的整数，准确分辨出哪些内存是引用类 型，这也是在垃圾收集时准确判断堆上的数据是否还可能被使用的前提。【**这个不是特别重要，了解一下即可**】

> 常考面试：**在OopMap的协助下，HotSpot可以快速准确地完成GC Roots枚举**

------

### 安全点与安全区域

**安全点（Safepoint）**

- 程序执行时并非在所有地方都能停顿下来开始GC，只有在特定的位置才能停顿下来开始GC，这些位置称为**“安全点（Safepoint）”**。
- Safe Point的选择很重要，**如果太少可能导致GC等待的时间太长，如果太频繁可能导致运行时的性能问题**。大部分指令的执行时间都非常短暂，通常会根据“**是否具有让程序长时间执行的特征**”为标准。比如：选择一些执行时间较长的指令作为Safe Point，**如方法调用、循环跳转和异常跳转等**。

**如何在GC发生时，检查所有线程都跑到最近的安全点停顿下来呢？**

- **抢先式中断**：（目前没有虚拟机采用了）首先中断所有线程。如果还有线程不在安全点，就恢复线程，让线程跑到安全点。
- **主动式中断**：设置一个中断标志，各个线程运行到Safe Point的时候**主动轮询**这个标志，如果中断标志为真，则将自己进行中断挂起。

**安全区域（Safe Region）**

- Safepoint 机制保证了程序执行时，在不太长的时间内就会遇到可进入GC的 Safepoint。但是，程序“不执行”的时候呢？
- 例如线程处于Sleep状态或Blocked 状态，这时候线程无法响应JVM的中断请求，“走”到安全点去中断挂起，JVM也不太可能等待线程被唤醒。对于这种情况，就需要安全区域（Safe Region）来解决。
- **安全区域是指在一段代码片段中，对象的引用关系不会发生变化，在这个区域中的任何位置开始GC都是安全的**。我们也可以把Safe Region看做是被扩展了的Safepoint。

**安全区域的执行流程**

- 当线程运行到Safe Region的代码时，首先标识已经进入了Safe Region，如果这段时间内发生GC，JVM会忽略标识为Safe Region状态的线程
- 当线程即将离开Safe Region时，会检查JVM是否已经完成根节点枚举（即GC Roots的枚举），如果完成了，则继续运行，否则线程必须等待直到收到可以安全离开Safe Region的信号为止；

------

### 记忆集与卡表

#### 什么是跨代引用？

- 一般的垃圾回收算法至少会划分出两个年代，年轻代和老年代。但是单纯的分代理论在垃圾回收的时候存在一个巨大的缺陷：为了找到年轻代中的存活对象，却不得不遍历整个老年代，反过来也是一样的。

![image-20221121172819010](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121172819010.png)

- 如果我们从年轻代开始遍历，那么可以断定N, S, P, Q都是存活对象。但是，V却不会被认为是存活对象，其占据的内存会被回收了。这就是一个惊天的大漏洞！因为U本身是老年代对象，而且有外部引用指向它，也就是说U是存活对象，而U指向了V，也就是说V也应该是存活对象才是！而这都是因为我们只遍历年轻代对象！

- 所以，为了解决这种跨代引用的问题，最笨的办法就是遍历老年代的对象，找出这些跨代引用来。这种方案存在极大的性能浪费。因为从两个分代假说里面，其实隐含了一个推论：**跨代引用是极少的**。也就是为了找出那么一点点跨代引用，我们却得遍历整个老年代！从上图来说，很显然的是，我们根本不必遍历R。

- 因此，为了避免这种遍历老年代的性能开销，通常的分代垃圾回收器会引入一种称为**记忆集**的技术。**简单来说，记忆集就是用来记录跨代引用的表。**

#### 记忆集与卡表

- 为解决对象跨代引用所带来的问题，垃圾收集器在**新生代**中建立了名为**记忆集（Remembered Set）的数据结构**，**用以避免把整个老年代加进GC Roots扫描范围**。

  事实上并不只是新生代、老年代之间才有跨代引用的问题，所有涉及部分区域收集（Partial GC）行为的垃圾收集器，典型的如G1、ZGC和Shenandoah收集器，都会面临相同的问题，因此我们有必要进一步 理清记忆集的原理和实现方式，以便在后续章节里介绍几款最新的收集器相关知识时能更好地理解。

- 记忆集是一种用于记录**从非收集区域指向收集区域的指针集合的抽象数据结构**。如果我们不考虑效率和成本的话，最简单的实现可以用非收集区域中所有含跨代引用的对象数组来实现这个数据结构。

> 比如说我们有**老年代（非收集区域）**和**年轻代（收集区域）**的对象之间有一条引用链

- 这种记录全部含跨代引用对象的实现方案，无论是空间占用还是维护成本都相当高昂。而在垃圾收集的场景中，收集器只需要通过记忆集判断出某一块非收集区域是否存在有指向了收集区域的指针就可以了，并不需要了解这些跨代指针的全部细节。

  那设计者在实现记忆集的时候，便可以选择更为粗犷的记录粒度来节省记忆集的存储和维护成本，下面列举了一些可供选择（当然也可以选择这个范围以外的）的记录精度：

  - **字长精度**：每个记录精确到一个**机器字长**（就是处理器的寻址位数，如常见的32位或64位，这个 精度决定了机器访问物理内存地址的指针长度），该字包含跨代指针。

  - **对象精度**：每个记录精确到一个**对象**，该对象里有字段含有跨代指针。

  - **卡精度**：每个记录精确到一块**内存区域**，该区域内有对象含有跨代指针。

- 其中，第三种**“卡精度”**所指的是用一种称为**“卡表”（Card Table）**的方式去实现记忆集，这也是 目前最常用的一种记忆集实现形式，一些资料中甚至直接把它和记忆集混为一谈。前面定义中提到记忆集其实是一种“抽象”的数据结构，抽象的意思是只定义了记忆集的行为意图，并没有定义其行为的具体实现。卡表就是记忆集的一种具体实现，**它定义了记忆集的记录精度、与堆内存的映射关系等**。 

  关于卡表与记忆集的关系，读者不妨按照Java语言中HashMap与Map的关系来类比理解。 卡表最简单的形式可以只是一个字节数组，而HotSpot虚拟机确实也是这样做的

> 读者只需要知道有这个东西，面试的时候能说出来，再细致一点的就需要看周志明老师的第三版书了

## 引用类型总结

- 我们希望能描述这样一类对象：当内存空间还足够时，则能保留在内存中；如果内存空间在进行垃圾收集后还是很紧张，则可以抛弃这些对象。
- 既**偏门**又非常**高频**的面试题：强引用、软引用、弱引用、虚引用有什么区别？具体使用场景是什么？
- 在JDK1.2版之后，Java对引用的概念进行了扩充，将引用分为：
  - **强引用（Strong Reference）**
  - **软引用（Soft Reference）**
  - **弱引用（Weak Reference）**
  - **虚引用（Phantom Reference）**
- 这4种引用强度依次逐渐减弱。除强引用外，其他3种引用均可以在java.lang.ref包中找到它们的身影。如下图，显示了这3种引用类型对应的类，开发人员可以在应用程序中直接使用它们。

![image-20221121173856098](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121173856098.png)

Reference子类中只有终结器引用是包内可见的，其他3种引用类型均为public，可以在应用程序中直接使用

**1．强引用（StrongReference）**

以前我们使用的大部分引用实际上都是强引用，这是使用最普遍的引用。如果一个对象具有强引用，那就类似于**必不可少的生活用品**，垃圾回收器绝不会回收它。当内存空间不足，Java 虚拟机宁愿抛出 OutOfMemoryError 错误，使程序异常终止，也不会靠随意回收具有强引用的对象来解决内存不足问题。

**2．软引用（SoftReference）**

如果一个对象只具有软引用，那就类似于**可有可无的生活用品**。如果内存空间足够，垃圾回收器就不会回收它，如果内存空间不足了，就会回收这些对象的内存。只要垃圾回收器没有回收它，该对象就可以被程序使用。软引用可用来实现内存敏感的高速缓存。

软引用可以和一个**引用队列（ReferenceQueue）**联合使用，如果软引用所引用的对象被垃圾回收，JAVA 虚拟机就会把这个软引用加入到与之关联的引用队列中。

**3．弱引用（WeakReference）**

如果一个对象只具有弱引用，那就类似于**可有可无的生活用品**。弱引用与软引用的区别在于：**只具有弱引用的对象拥有更短暂的生命周期**。在垃圾回收器线程扫描它所管辖的内存区域的过程中，**一旦发现了只具有弱引用的对象，不管当前内存空间足够与否，都会回收它的内存**。不过，由于垃圾回收器是一个优先级很低的线程， 因此不一定会很快发现那些只具有弱引用的对象。

弱引用可以和一个**引用队列（ReferenceQueue）**联合使用，如果弱引用所引用的对象被垃圾回收，Java 虚拟机就会把这个弱引用加入到与之关联的引用队列中。

**4．虚引用（PhantomReference）**

"虚引用"顾名思义，就是形同虚设，与其他几种引用都不同，虚引用并不会决定对象的生命周期。如果一个对象仅持有虚引用，那么它就和没有任何引用一样，在任何时候都可能被垃圾回收。

**虚引用主要用来跟踪对象被垃圾回收的活动**。

**虚引用与软引用和弱引用的一个区别在于：** 虚引用**必须**和**引用队列（ReferenceQueue）**联合使用。当垃圾回收器准备回收一个对象时，如果发现它还有虚引用，就会在回收对象的内存之前，把这个虚引用加入到与之关联的引用队列中。**程序可以通过判断引用队列中是否已经加入了虚引用，来了解被引用的对象是否将要被垃圾回收**。程序如果发现某个虚引用已经被加入到引用队列，那么就可以在所引用的对象的内存被回收之前采取必要的行动

------

### 强引用

- 在Java程序中，最常见的引用类型是强引用（普通系统99%以上都是强引用），也就是我们最常见的普通对象引用，**也是默认的引用类型**。
- 当在Java语言中使用new操作符创建一个新的对象，并将其赋值给一个变量的时候，这个变量就成为指向该对象的一个强引用。
- **只要强引用的对象是可触及的，垃圾收集器就永远不会回收掉被引用的对象。**只要强引用的对象是可达的，jvm宁可报OOM，也不会回收强引用。
- 对于一个普通的对象，如果没有其他的引用关系，只要超过了引用的作用域或者显式地将相应（强）引用赋值为null，就是可以当做垃圾被收集了，当然具体回收时机还是要看垃圾收集策略。
- 相对的，软引用、弱引用和虚引用的对象是软可触及、弱可触及和虚可触及的，在一定条件下，都是可以被回收的。所以，强引用是造成Java内存泄漏的主要原因之一。

**强引用代码举例**

```java
public class StrongReferenceTest {
    public static void main(String[] args) {
        StringBuffer str = new StringBuffer ("Hello,尚硅谷");
        StringBuffer str1 = str;

        str = null;
        System.gc();

        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println(str1);
    }
}
```

输出

```
Hello,尚硅谷
```

局部变量str指向stringBuffer实例所在堆空间，通过str可以操作该实例，那么str就是stringBuffer实例的强引用对应内存结构：

```
StringBuffer str = new StringBuffer("hello,尚硅谷");
```

![image-20221121180637954](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121180637954.png)

**总结**

本例中的两个引用，都是强引用，强引用具备以下特点：

- 强引用可以直接访问目标对象。
- 强引用所指向的对象在任何时候都不会被系统回收，虚拟机宁愿抛出OOM异常，也不会回收强引用所指向对象。
- 强引用可能导致**内存泄漏**。

### 软引用

**软引用（Soft Reference）：内存不足即回收**

- 软引用是用来描述一些还有用，但非必需的对象。**只被软引用关联着的对象，在系统将要发生内存溢出异常前，会把这些对象列进回收范围之中进行第二次回收**，如果这次回收还没有足够的内存，才会抛出内存溢出异常。注意，这里的第一次回收是不可达的对象
- 软引用通常用来实现内存敏感的缓存。比如：高速缓存就有用到软引用。如果还有空闲内存，就可以暂时保留缓存，当内存不足时清理掉，这样就保证了使用缓存的同时，不会耗尽内存。
- 垃圾回收器在某个时刻决定回收软可达的对象的时候，会清理软引用，并可选地把引用存放到一个引用队列（Reference Queue）。
- 类似弱引用，只不过Java虚拟机会尽量让软引用的存活时间长一些，迫不得已才清理。
- 一句话概括：当内存足够时，不会回收软引用可达的对象。内存不够时，会回收软引用的可达对象

在JDK1.2版之后提供了SoftReference类来实现软引用

```java
Object obj = new Object();// 声明强引用
SoftReference<Object> sf = new SoftReference<>(obj);
obj = null; //销毁强引用
```

**软引用代码举例**

代码

```java
public class SoftReferenceTest {
    public static class User {
        public User(int id, String name) {
            this.id = id;
            this.name = name;
        }

        public int id;
        public String name;

        @Override
        public String toString() {
            return "[id=" + id + ", name=" + name + "] ";
        }
    }

    public static void main(String[] args) {
        //创建对象，建立软引用
//        SoftReference<User> userSoftRef = new SoftReference<User>(new User(1, "songhk"));
        //上面的一行代码，等价于如下的三行代码
        User u1 = new User(1,"songhk");
        SoftReference<User> userSoftRef = new SoftReference<User>(u1);
        u1 = null;//取消强引用


        //从软引用中重新获得强引用对象
        System.out.println(userSoftRef.get());

        System.out.println("---目前内存还不紧张---");
        System.gc();
        System.out.println("After GC:");
//        //垃圾回收之后获得软引用中的对象
        System.out.println(userSoftRef.get());//由于堆空间内存足够，所有不会回收软引用的可达对象。
        System.out.println("---下面开始内存紧张了---");
        try {
            //让系统认为内存资源紧张、不够
//            byte[] b = new byte[1024 * 1024 * 7];
            byte[] b = new byte[1024 * 7168 - 635 * 1024];
        } catch (Throwable e) {
            e.printStackTrace();
        } finally {
            //再次从软引用中获取数据
            System.out.println(userSoftRef.get());//在报OOM之前，垃圾回收器会回收软引用的可达对象。
        }
    }
}
```

JVM参数

```
-Xms10m -Xmx10m
```

在 JVM 内存不足时，会清理软引用对象

输出结果：

```
[id=1, name=songhk] 
---目前内存还不紧张---
After GC:
[id=1, name=songhk] 
---下面开始内存紧张了---
null
java.lang.OutOfMemoryError: Java heap space
	at com.atguigu.java1.SoftReferenceTest.main(SoftReferenceTest.java:48)

Process finished with exit code 0
```

### 弱引用

**弱引用（Weak Reference）发现即回收**

- 弱引用也是用来描述那些非必需对象，**只被弱引用关联的对象只能生存到下一次垃圾收集发生为止。在系统GC时，只要发现弱引用，不管系统堆空间使用是否充足，都会回收掉只被弱引用关联的对象**。
- 但是，由于垃圾回收器的线程通常优先级很低，因此，并不一定能很快地发现持有弱引用的对象。在这种情况下，弱引用对象可以存在较长的时间。
- 弱引用和软引用一样，在构造弱引用时，也可以指定一个引用队列，当弱引用对象被回收时，就会加入指定的引用队列，通过这个队列可以跟踪对象的回收情况。
- **软引用、弱引用都非常适合来保存那些可有可无的缓存数据**。如果这么做，当系统内存不足时，这些缓存数据会被回收，不会导致内存溢出。而当内存资源充足时，这些缓存数据又可以存在相当长的时间，从而起到加速系统的作用。

在JDK1.2版之后提供了WeakReference类来实现弱引用

```
// 声明强引用
Object obj = new Object();
WeakReference<Object> sf = new WeakReference<>(obj);
obj = null; //销毁强引用
```

弱引用对象与软引用对象的最大不同就在于，当GC在进行回收时，需要通过算法检查是否回收软引用对象，而对于弱引用对象，GC总是进行回收。弱引用对象更容易、更快被GC回收。

**面试题：你开发中使用过WeakHashMap吗？**

**弱引用代码举例**

```java
public class WeakReferenceTest {
    public static class User {
        public User(int id, String name) {
            this.id = id;
            this.name = name;
        }

        public int id;
        public String name;

        @Override
        public String toString() {
            return "[id=" + id + ", name=" + name + "] ";
        }
    }

    public static void main(String[] args) {
        //构造了弱引用
        WeakReference<User> userWeakRef = new WeakReference<User>(new User(1, "songhk"));
        //从弱引用中重新获取对象
        System.out.println(userWeakRef.get());

        System.gc();
        // 不管当前内存空间足够与否，都会回收它的内存
        System.out.println("After GC:");
        //重新尝试从弱引用中获取对象
        System.out.println(userWeakRef.get());
    }
}
```

执行垃圾回收后，软引用对象必定被清除

```
[id=1, name=songhk] 
After GC:
null

Process finished with exit code 0
```

### 虚引用

**虚引用（Phantom Reference）：对象回收跟踪**

- 也称为“幽灵引用”或者“幻影引用”，是所有引用类型中最弱的一个
- 一个对象是否有虚引用的存在，完全不会决定对象的生命周期。如果一个对象仅持有虚引用，那么它和没有引用几乎是一样的，随时都可能被垃圾回收器回收。
- 它不能单独使用，也无法通过虚引用来获取被引用的对象。当试图通过虚引用的get()方法取得对象时，总是null 。**即通过虚引用无法获取到我们的数据**
- **为一个对象设置虚引用关联的唯一目的在于跟踪垃圾回收过程。比如：能在这个对象被收集器回收时收到一个系统通知。**
- 虚引用必须和引用队列一起使用。虚引用在创建时必须提供一个引用队列作为参数。当垃圾回收器准备回收一个对象时，如果发现它还有虚引用，就会在回收对象后，将这个虚引用加入引用队列，以通知应用程序对象的回收情况。
- 由于虚引用可以跟踪对象的回收时间，因此，也可以将一些资源释放操作放置在虚引用中执行和记录。

在JDK1.2版之后提供了PhantomReference类来实现虚引用。

```
// 声明强引用
Object obj = new Object();
// 声明引用队列
ReferenceQueue phantomQueue = new ReferenceQueue();
// 声明虚引用（还需要传入引用队列）
PhantomReference<Object> sf = new PhantomReference<>(obj, phantomQueue);
obj = null; 
```

**虚引用代码示例**

```java
public class PhantomReferenceTest {
    public static PhantomReferenceTest obj;//当前类对象的声明
    static ReferenceQueue<PhantomReferenceTest> phantomQueue = null;//引用队列

    public static class CheckRefQueue extends Thread {
        @Override
        public void run() {
            while (true) {
                if (phantomQueue != null) {
                    PhantomReference<PhantomReferenceTest> objt = null;
                    try {
                        objt = (PhantomReference<PhantomReferenceTest>) phantomQueue.remove();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    if (objt != null) {
                        System.out.println("追踪垃圾回收过程：PhantomReferenceTest实例被GC了");
                    }
                }
            }
        }
    }

    @Override
    protected void finalize() throws Throwable { //finalize()方法只能被调用一次！
        super.finalize();
        System.out.println("调用当前类的finalize()方法");
        obj = this;
    }

    public static void main(String[] args) {
        Thread t = new CheckRefQueue();
        t.setDaemon(true);//设置为守护线程：当程序中没有非守护线程时，守护线程也就执行结束。
        t.start();

        phantomQueue = new ReferenceQueue<PhantomReferenceTest>();
        obj = new PhantomReferenceTest();
        //构造了 PhantomReferenceTest 对象的虚引用，并指定了引用队列
        PhantomReference<PhantomReferenceTest> phantomRef = new PhantomReference<PhantomReferenceTest>(obj, phantomQueue);

        try {
            //不可获取虚引用中的对象
            System.out.println(phantomRef.get());
			System.out.println("第 1 次 gc");
            //将强引用去除
            obj = null;
            //第一次进行GC,由于对象可复活，GC无法回收该对象
            System.gc();
            Thread.sleep(1000);
            if (obj == null) {
                System.out.println("obj 是 null");
            } else {
                System.out.println("obj 可用");
            }
            System.out.println("第 2 次 gc");
            obj = null;
            System.gc(); //一旦将obj对象回收，就会将此虚引用存放到引用队列中。
            Thread.sleep(1000);
            if (obj == null) {
                System.out.println("obj 是 null");
            } else {
                System.out.println("obj 可用");
            }
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

1、第一次尝试获取虚引用的值，发现无法获取的，这是因为虚引用是无法直接获取对象的值，然后进行第一次GC，因为会调用finalize方法，将对象复活了，所以对象没有被回收

2、但是调用第二次GC操作的时候，因为finalize方法只能执行一次，所以就触发了GC操作，将对象回收了，同时将会触发第二个操作就是将待回收的对象存入到引用队列中。

输出结果：

```
null
第 1 次 gc
调用当前类的finalize()方法
obj 可用
第 2 次 gc
追踪垃圾回收过程：PhantomReferenceTest实例被GC了
obj 是 null

Process finished with exit code 0
```

### 终结器引用（了解）

- 它用于实现对象的finalize() 方法，也可以称为终结器引用
- 无需手动编码，其内部配合引用队列使用
- 在GC时，终结器引用入队。由Finalizer线程通过终结器引用找到被引用对象调用它的finalize()方法，第二次GC时才回收被引用的对象

特别注意，在程序设计中一般很少使用弱引用与虚引用，使用软引用的情况较多，这是因为**软引用可以加速 JVM 对垃圾内存的回收速度，可以维护系统的运行安全，防止内存溢出（OutOfMemory）等问题的产生**。

------

## 如何判断一个常量是废弃常量？

运行时常量池主要回收的是废弃的常量。那么，我们如何判断一个常量是废弃常量呢？

> **🐛 （参见：[issue747open in new window](https://github.com/Snailclimb/JavaGuide/issues/747)，[referenceopen in new window](https://blog.csdn.net/q5706503/article/details/84640762)）** ：
>
> 1. **JDK1.7 之前运行时常量池逻辑包含字符串常量池存放在方法区, 此时 hotspot 虚拟机对方法区的实现为永久代**
> 2. **JDK1.7 字符串常量池被从方法区拿到了堆中, 这里没有提到运行时常量池,也就是说字符串常量池被单独拿到堆,运行时常量池剩下的东西还在方法区, 也就是 hotspot 中的永久代** 。
> 3. **JDK1.8 hotspot 移除了永久代用元空间(Metaspace)取而代之, 这时候字符串常量池还在堆, 运行时常量池还在方法区, 只不过方法区的实现从永久代变成了元空间(Metaspace)**

假如在字符串常量池中存在字符串 "abc"，如果当前没有任何 String 对象引用该字符串常量的话，就说明常量 "abc" 就是废弃常量，如果这时发生内存回收的话而且有必要的话，"abc" 就会被系统清理出常量池了。

## 如何判断一个类是无用的类

方法区主要回收的是无用的类，那么如何判断一个类是无用的类的呢？

判定一个常量是否是“废弃常量”比较简单，而要判定一个类是否是“无用的类”的条件则相对苛刻许多。类需要同时满足下面 3 个条件才能算是 **“无用的类”** ：

- 该类所有的实例都已经被回收，也就是 Java 堆中不存在该类的任何实例。
- 加载该类的 `ClassLoader` 已经被回收。
- 该类对应的 `java.lang.Class` 对象没有在任何地方被引用，无法在任何地方通过反射访问该类的方法。

虚拟机可以对满足上述 3 个条件的无用类进行回收，这里说的仅仅是“可以”，而并不是和对象一样不使用了就会必然被回收。

------

# 垃圾回收器

## GC 分类与性能指标

### 垃圾回收器概述

- 垃圾收集器没有在规范中进行过多的规定，可以由不同的厂商、不同版本的JVM来实现。
- 由于JDK的版本处于高速迭代过程中，因此Java发展至今已经衍生了众多的GC版本。
- 从不同角度分析垃圾收集器，可以将GC分为不同的类型。

**Java不同版本新特性**

- 语法层面：Lambda表达式、switch、自动拆箱装箱、enum、泛型
- API层面：Stream API、新的日期时间、Optional、String、集合框架
- 底层优化：JVM优化、GC的变化、元空间、静态域、字符串常量池等

### 垃圾回收器分类

**按线程数分（垃圾回收线程数），可以分为串行垃圾回收器和并行垃圾回收器。**

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121191104659.png" alt="image-20221121191104659" style="zoom:67%;" />

- 串行回收指的是在同一时间段内只允许有一个CPU用于执行垃圾回收操作，此时工作线程被暂停，直至垃圾收集工作结束。
  - 在诸如单CPU处理器或者较小的应用内存等硬件平台不是特别优越的场合，串行回收器的性能表现可以超过并行回收器和并发回收器。所以，串行回收默认被应用在客户端的Client模式下的JVM中
  - 在并发能力比较强的CPU上，并行回收器产生的停顿时间要短于串行回收器
- 和串行回收相反，并行收集可以运用多个CPU同时执行垃圾回收，因此提升了应用的吞吐量，不过并行回收仍然与串行回收一样，采用独占式，使用了“Stop-the-World”机制。

**按照工作模式分，可以分为并发式垃圾回收器和独占式垃圾回收器。**

- 并发式垃圾回收器与应用程序线程交替工作，以尽可能减少应用程序的停顿时间。
- 独占式垃圾回收器（Stop the World）一旦运行，就停止应用程序中的所有用户线程，直到垃圾回收过程完全结束。

[![img](https://camo.githubusercontent.com/0ccdab3e74941666224ed27c2e7061fe0d8538914b513849b7fd475ef9b66423/68747470733a2f2f6e706d2e656c656d6563646e2e636f6d2f796f7574686c716c40312e302e382f4a564d2f636861707465725f3031322f303030322e706e67)](https://camo.githubusercontent.com/0ccdab3e74941666224ed27c2e7061fe0d8538914b513849b7fd475ef9b66423/68747470733a2f2f6e706d2e656c656d6563646e2e636f6d2f796f7574686c716c40312e302e382f4a564d2f636861707465725f3031322f303030322e706e67)

**按碎片处理方式分，可分为压缩式垃圾回收器和非压缩式垃圾回收器。**

- 压缩式垃圾回收器会在回收完成后，对存活对象进行压缩整理，消除回收后的碎片。再分配对象空间使用指针碰撞
- 非压缩式的垃圾回收器不进行这步操作，分配对象空间使用空闲列表

**按工作的内存区间分，又可分为年轻代垃圾回收器和老年代垃圾回收器。**

### 评估 GC 的性能指标

**指标**

- **吞吐量**：运行用户代码的时间占总运行时间的比例（总运行时间 = 程序的运行时间 + 内存回收的时间）
- 垃圾收集开销：吞吐量的补数，垃圾收集所用时间与总运行时间的比例。
- **暂停时间**：执行垃圾收集时，程序的工作线程被暂停的时间。
- 收集频率：相对于应用程序的执行，收集操作发生的频率。
- **内存占用**：Java堆区所占的内存大小。
- 快速：一个对象从诞生到被回收所经历的时间。



- **吞吐量、暂停时间、内存占用**这三者共同构成一个“不可能三角”。三者总体的表现会随着技术进步而越来越好。一款优秀的收集器通常最多同时满足其中的两项。
- 这三项里，暂停时间的重要性日益凸显。因为随着硬件发展，内存占用多些越来越能容忍，硬件性能的提升也有助于降低收集器运行时对应用程序的影响，即提高了吞吐量。而内存的扩大，对延迟反而带来负面效果。
- 简单来说，主要抓住两点：
  - 吞吐量
  - 暂停时间

------

**吞吐量（throughput）**

- 吞吐量就是CPU用于运行用户代码的时间与CPU总消耗时间的比值，即吞吐量=运行用户代码时间 /（运行用户代码时间+垃圾收集时间）
  - 比如：虚拟机总共运行了100分钟，其中垃圾收集花掉1分钟，那吞吐量就是99%。
- 这种情况下，应用程序能容忍较高的暂停时间，因此，高吞吐量的应用程序有更长的时间基准，快速响应是不必考虑的
- 吞吐量优先，意味着在单位时间内，STW的时间最短：0.2+0.2=0.4

![image-20221121204432041](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121204432041.png)

**暂停时间（pause time）**

- “暂停时间”是指一个时间段内应用程序线程暂停，让GC线程执行的状态。
  - 例如，GC期间100毫秒的暂停时间意味着在这100毫秒期间内没有应用程序线程是活动的
- 暂停时间优先，意味着尽可能让单次STW的时间最短：0.1+0.1 + 0.1+ 0.1+ 0.1=0.5，但是总的GC时间可能会长

![image-20221121204451637](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121204451637.png)

**吞吐量 vs 暂停时间**

- **高吞吐量较好**因为这会让应用程序的最终用户感觉只有应用程序线程在做“生产性”工作。直觉上，吞吐量越高程序运行越快。
- 低暂停时间（低延迟）较好，是从最终用户的角度来看，不管是GC还是其他原因导致一个应用被挂起始终是不好的。这取决于应用程序的类型，有时候甚至短暂的200毫秒暂停都可能打断终端用户体验。因此，具有较低的暂停时间是非常重要的，特别是对于一个交互式应用程序（就是和用户交互比较多的场景）。
- 不幸的是”高吞吐量”和”低暂停时间”是一对相互竞争的目标（矛盾）。
  - 因为如果选择以吞吐量优先，那么**必然需要降低内存回收的执行频率**，但是这样会导致GC需要更长的暂停时间来执行内存回收。
  - 相反的，如果选择以低延迟优先为原则，那么为了降低每次执行内存回收时的暂停时间，也只能频繁地执行内存回收，但这又引起了年轻代内存的缩减和导致程序吞吐量的下降。
- 在设计（或使用）GC算法时，我们必须确定我们的目标：一个GC算法只可能针对两个目标之一（即只专注于较大吞吐量或最小暂停时间），或尝试找到一个二者的折衷。
- 现在标准：**在最大吞吐量优先的情况下，降低停顿时间**

## 不同的垃圾回收器概述

- 垃圾收集机制是Java的招牌能力，极大地提高了开发效率。这当然也是面试的热点。
- 那么，Java常见的垃圾收集器有哪些？

### 垃圾收集器发展史

有了虚拟机，就一定需要收集垃圾的机制，这就是Garbage Collection，对应的产品我们称为Garbage Collector。

- 1999年随JDK1.3.1一起来的是串行方式的Serial GC，它是第一款GC。ParNew垃圾收集器是Serial收集器的多线程版本
- 2002年2月26日，Parallel GC和Concurrent Mark Sweep GC跟随JDK1.4.2一起发布·
- Parallel GC在JDK6之后成为HotSpot默认GC。
- 2012年，在JDK1.7u4版本中，G1可用。
- 2017年，JDK9中G1变成默认的垃圾收集器，以替代CMS。
- 2018年3月，JDK10中G1垃圾回收器的并行完整垃圾回收，实现并行性来改善最坏情况下的延迟。
- 2018年9月，JDK11发布。引入Epsilon 垃圾回收器，又被称为 "No-Op(无操作)“ 回收器。同时，引入ZGC：可伸缩的低延迟垃圾回收器（Experimental）
- 2019年3月，JDK12发布。增强G1，自动返回未用堆内存给操作系统。同时，引入Shenandoah GC：低停顿时间的GC（Experimental）。
- 2019年9月，JDK13发布。增强ZGC，自动返回未用堆内存给操作系统。
- 2020年3月，JDK14发布。删除CMS垃圾回收器。扩展ZGC在macOS和Windows上的应用

### 7款经典的垃圾收集器

- 串行回收器：Serial、Serial old
- 并行回收器：ParNew、Parallel Scavenge、Parallel old
- 并发回收器：CMS、G1

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121213146300.png" alt="image-20221121213146300" style="zoom:67%;" />

**官方文档**

![image-20221121213324915](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121213324915.png)

**7款经典回收器与垃圾分代之间的关系**

![image-20221121213738481](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121213738481.png)

- 新生代收集器：Serial、ParNew、Parallel Scavenge
- 老年代收集器：Serial old、Parallel old、CMS
- 整堆收集器：G1

### 垃圾收集器的组合关系

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221121214201530.png" alt="image-20221121214201530" style="zoom:67%;" />

- 两个收集器间有连线，表明它们可以搭配使用：
  - Serial/Serial old
  - Serial/CMS （JDK9废弃）
  - ParNew/Serial Old （JDK9废弃）
  - ParNew/CMS
  - Parallel Scavenge/Serial Old （预计废弃）
  - Parallel Scavenge/Parallel Old
  - G1
- 其中Serial Old作为CMS出现"Concurrent Mode Failure"失败的后备预案。
- （红色虚线）由于维护和兼容性测试的成本，在JDK 8时将Serial+CMS、ParNew+Serial Old这两个组合声明为废弃（JEP173），并在JDK9中完全取消了这些组合的支持（JEP214），即：移除。
- （绿色虚线）JDK14中：弃用Parallel Scavenge和Serial Old GC组合（JEP366）
- （青色虚线）JDK14中：删除CMS垃圾回收器（JEP363）
- 为什么要有很多收集器，一个不够吗？因为Java的使用场景很多，移动端，服务器等。所以就需要针对不同的场景，提供不同的垃圾收集器，提高垃圾收集的性能。
- 虽然我们会对各个收集器进行比较，但并非为了挑选一个最好的收集器出来。没有一种放之四海皆准、任何场景下都适用的完美收集器存在，更加没有万能的收集器。所以**我们选择的只是对具体应用最合适的收集器**。

### 查看默认垃圾收集器

1. -XX:+PrintCommandLineFlags：查看命令行相关参数（包含使用的垃圾收集器）
2. 使用命令行指令：jinfo -flag 相关垃圾回收器参数 进程ID

#### JDK8

**在 JDK 8 下，设置 JVM 参数**

-XX:+PrintCommandLineFlags

程序打印输出：-XX:+UseParallelGC 表示使用使用 ParallelGC ，ParallelGC 默认和 Parallel Old 绑定使用

```
-XX:InitialHeapSize=266620736 -XX:MaxHeapSize=4265931776 -XX:+PrintCommandLineFlags -XX:+UseCompressedClassPointers -XX:+UseCompressedOops -XX:-UseLargePagesIndividualAllocation -XX:+UseParallelGC 
```

**通过命令行指令查看**

命令行命令

```
jps
jinfo -flag UseParallelGC 进程id
jinfo -flag UseParallelOldGC 进程id
```

JDK 8 中默认使用 ParallelGC 和 ParallelOldGC 的组合

```java
-XX:InitialHeapSize=9437184 -XX:MaxHeapSize=9437184 -XX:+PrintCommandLineFlags -XX:+UseCompressedClassPointers -XX:+UseCompressedOops -XX:-UseLargePagesIndividualAllocation -XX:+UseParallelGC 
```

#### JDK9

```
-XX:+UseG1GC
```

------

## Serial 回收器：串行回收

**Serial 回收器：串行回收**

- Serial收集器是最基本、历史最悠久的垃圾收集器了。JDK1.3之前回收新生代唯一的选择。
- Serial收集器作为HotSpot中Client模式下的默认新生代垃圾收集器。
- Serial收集器采用**复制算法**、**串行回收**和"**Stop-the-World"机制**的方式执行内存回收。
- 除了年轻代之外，Serial收集器还提供用于执行老年代垃圾收集的Serial Old收集器。**Serial old收集器同样也采用了串行回收和"Stop the World"机制**，只不过内存回收算法使用的是**标记-压缩算法**。
  - Serial Old是运行在Client模式下默认的老年代的垃圾回收器
  - Serial Old在Server模式下主要有两个用途：
    - 与新生代的Parallel Scavenge配合使用
    - 作为老年代CMS收集器的后备垃圾收集方案

这个收集器是一个单线程的收集器，“单线程”的意义：它**只会使用一个CPU（串行）或一条收集线程去完成垃圾收集工作**。更重要的是在它进行垃圾收集时，**必须暂停其他所有的工作线程**，直到它收集结束（Stop The World）

![image-20221122183511764](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221122183511764.png)

**Serial 回收器的优势**

- 优势：**简单而高效**（与其他收集器的单线程比），对于限定单个CPU的环境来说，Serial收集器由于没有线程交互的开销，专心做垃圾收集自然可以获得最高的单线程收集效率。
  - 运行在Client模式下的虚拟机是个不错的选择。
- 在用户的桌面应用场景中，可用内存一般不大（几十MB至一两百MB），可以在较短时间内完成垃圾收集（几十ms至一百多ms），只要不频繁发生，使用串行回收器是可以接受的。
- 在HotSpot虚拟机中，使用`-XX:+UseSerialGC`参数可以指定年轻代和老年代都使用串行收集器。
  - 等价于新生代用Serial GC，且老年代用Serial Old GC

**总结**

- 这种垃圾收集器大家了解，现在已经不用串行的了。而且在限定单核CPU才可以用。现在都不是单核的了。
- 对于交互较强的应用而言，这种垃圾收集器是不能接受的。一般在Java Web应用程序中是不会采用串行垃圾收集器的。

## ParNew 回收器：并行回收

- 如果说Serial GC是年轻代中的单线程垃圾收集器，那么ParNew收集器则是Serial收集器的多线程版本。
  - Par是Parallel的缩写，New：只能处理新生代
- ParNew 收集器除了采用**并行回收**的方式执行内存回收外，两款垃圾收集器之间几乎没有任何区别。ParNew收集器在年轻代中同样也是采用**复制算法**、**"Stop-the-World"机制**。
- ParNew 是很多JVM运行在Server模式下新生代的默认垃圾收集器。

![image-20221122213636117](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221122213636117.png)

- 对于新生代，回收次数频繁，使用并行方式高效。
- 对于老年代，回收次数少，使用串行方式节省资源。（CPU并行需要切换线程，串行可以省去切换线程的资源）

**ParNew 回收器与 Serial 回收器比较**

Q：由于ParNew收集器基于并行回收，那么是否可以断定ParNew收集器的回收效率在任何场景下都会比Serial收集器更高效？

A：**不能**

- ParNew收集器运行在多CPU的环境下，由于可以充分利用多CPU、多核心等物理硬件资源优势，可以更快速地完成垃圾收集，提升程序的吞吐量。
- 但是在单个CPU的环境下，ParNew收集器不比Serial收集器更高效。虽然Serial收集器是基于串行回收，但是由于CPU不需要频繁地做任务切换，因此可以有效避免多线程交互过程中产生的一些额外开销。
- 除Serial外，目前只有ParNew GC能与CMS收集器配合工作

**设置 ParNew 垃圾回收器**

- 在程序中，开发人员可以通过选项"`-XX:+UseParNewGC`"手动指定使用ParNew收集器执行内存回收任务。它表示年轻代使用并行收集器，不影响老年代。
- `-XX:ParallelGCThreads`限制线程数量，默认开启和CPU数据相同的线程数。

## Parallel 回收器：吞吐量优先

**Parallel Scavenge 回收器：吞吐量优先**

- HotSpot的年轻代中除了拥有ParNew收集器是基于并行回收的以外，Parallel Scavenge收集器同样也采用了**复制算法**、并行回收和**"Stop the World"机制**。
- 那么Parallel收集器的出现是否多此一举？
  - 和ParNew收集器不同，Parallel Scavenge收集器的目标则是达到一个**可控制的吞吐量**（Throughput），它也被称为吞吐量优先的垃圾收集器。
  - 自适应调节策略也是Parallel Scavenge与ParNew一个重要区别。（动态调整内存分配情况，以达到一个最优的吞吐量或低延迟）
- 高吞吐量则可以高效率地利用CPU时间，尽快完成程序的运算任务，**主要适合在后台运算而不需要太多交互的任务**。因此，常见在服务器环境中使用。例如，那些执行批量处理、订单处理、工资支付、科学计算的应用程序。
- Parallel收集器在JDK1.6时提供了用于执行老年代垃圾收集的Parallel Old收集器，用来代替老年代的Serial Old收集器。
- Parallel Old收集器采用了**标记-压缩算法**，但同样也是基于并行回收和**"Stop-the-World"机制**。

![image-20221122220106161](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221122220106161.png)

- 在程序吞吐量优先的应用场景中，Parallel收集器和Parallel Old收集器的组合，在server模式下的内存回收性能很不错。
- **在Java8中，默认是此垃圾收集器。**

**Parallel Scavenge 回收器参数设置**

- `-XX:+UseParallelGC` 手动指定年轻代使用Parallel并行收集器执行内存回收任务。
- `-XX:+UseParallelOldGC`：手动指定老年代都是使用并行回收收集器。
  - 分别适用于新生代和老年代
  - 上面两个参数分别适用于新生代和老年代。默认jdk8是开启的。默认开启一个，另一个也会被开启。（互相激活）
- `-XX:ParallelGCThreads`：设置年轻代并行收集器的线程数。一般地，最好与CPU数量相等，以避免过多的线程数影响垃圾收集性能。
  - 在默认情况下，当CPU数量小于8个，ParallelGCThreads的值等于CPU数量。
  - 当CPU数量大于8个，ParallelGCThreads的值等于3+[5*CPU_Count]/8]
- `-XX:MaxGCPauseMillis` 设置垃圾收集器最大停顿时间（即STW的时间）。单位是毫秒。
  - 为了尽可能地把停顿时间控制在XX:MaxGCPauseMillis 以内，收集器在工作时会调整Java堆大小或者其他一些参数。
  - 对于用户来讲，停顿时间越短体验越好。但是在服务器端，我们注重高并发，整体的吞吐量。所以服务器端适合Parallel，进行控制。
  - 该参数使用需谨慎。
- `-XX:GCTimeRatio`垃圾收集时间占总时间的比例，即等于 1 / (N+1) ，用于衡量吞吐量的大小。
  - 取值范围(0, 100)。默认值99，也就是垃圾回收时间占比不超过1。
  - 与前一个-XX:MaxGCPauseMillis参数有一定矛盾性，STW暂停时间越长，Radio参数就容易超过设定的比例。
- `-XX:+UseAdaptiveSizePolicy` 设置Parallel Scavenge收集器具有**自适应调节策略**
  - 在这种模式下，年轻代的大小、Eden和Survivor的比例、晋升老年代的对象年龄等参数会被自动调整，已达到在堆大小、吞吐量和停顿时间之间的平衡点。
  - 在手动调优比较困难的场合，可以直接使用这种自适应的方式，仅指定虚拟机的最大堆、目标的吞吐量（GCTimeRatio）和停顿时间（MaxGCPauseMillis），让虚拟机自己完成调优工作。

## CMS 回收器：低延迟

### CMS 回收器

- 在JDK1.5时期，Hotspot推出了一款在**强交互应用中（就是和用户打交道的引用）**几乎可认为有划时代意义的垃圾收集器：CMS（Concurrent-Mark-Sweep）收集器，**这款收集器是HotSpot虚拟机中第一款真正意义上的并发收集器，它第一次实现了让垃圾收集线程与用户线程同时工作。**
- CMS收集器的关注点是尽可能缩短垃圾收集时用户线程的停顿时间。停顿时间越短（低延迟）就越适合与用户交互的程序，良好的响应速度能提升用户体验。
  - 目前很大一部分的Java应用集中在互联网站或者B/S系统的服务端上，这类应用尤其重视服务的响应速度，希望系统停顿时间最短，以给用户带来较好的体验。CMS收集器就非常符合这类应用的需求。
- CMS的垃圾收集算法采用**标记-清除**算法，并且也会**"Stop-the-World"**
- 不幸的是，CMS作为老年代的收集器，却无法与JDK1.4.0中已经存在的新生代收集器Parallel Scavenge配合工作（因为实现的框架不一样，没办法兼容使用），所以在JDK1.5中使用CMS来收集老年代的时候，新生代只能选择ParNew或者Serial收集器中的一个。
- 在G1出现之前，CMS使用还是非常广泛的。一直到今天，仍然有很多系统使用CMS GC。

### CMS 工作原理（过程）

![image-20221123132204833](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123132204833.png)

CMS整个过程比之前的收集器要复杂，整个过程分为4个主要阶段，即初始标记阶段、并发标记阶段、重新标记阶段和并发清除阶段。(涉及STW的阶段主要是：初始标记 和 重新标记)

- **初始标记（Initial-Mark）阶段**：在这个阶段中，程序中所有的工作线程都将会因为“Stop-the-World”机制而出现短暂的暂停，**这个阶段的主要任务仅仅只是标记出GC Roots能直接关联到的对象**。一旦标记完成之后就会恢复之前被暂停的所有应用线程。由于直接关联对象比较小，所以这里的**速度非常快**。

- **并发标记（Concurrent-Mark）阶段**：从GC Roots的直接关联对象开始遍历整个对象图的过程，这个过程耗时较长但是**不需要停顿用户线程**，**可以与垃圾收集线程一起并发运行**。

  同时开启 GC 和用户线程，用一个闭包结构去记录可达对象。但在这个阶段结束，这个闭包结构并不能保证包含当前所有的可达对象。因为用户线程可能会不断的更新引用域，所以 GC 线程无法保证可达性分析的实时性。所以这个算法里会跟踪记录这些发生引用更新的地方。

- **重新标记（Remark）阶段**：由于在并发标记阶段中，程序的工作线程会和垃圾收集线程同时运行或者交叉运行，**因此为了修正并发标记期间，因用户程序继续运作而导致标记产生变动的那一部分对象的标记记录，**这个阶段的停顿时间通常会比初始标记阶段稍长一些，并且也会导致“Stop-the-World”的发生，但也远比并发标记阶段的时间短。

- **并发清除（Concurrent-Sweep）阶段**：此阶段清理删除掉标记阶段判断的已经死亡的对象，释放内存空间。**由于不需要移动存活对象，所以这个阶段也是可以与用户线程同时并发的**

### CMS分析

- 尽管CMS收集器采用的是并发回收（非独占式），**但是在其初始化标记和再次标记这两个阶段中仍然需要执行“Stop-the-World”机制**暂停程序中的工作线程，不过暂停时间并不会太长，因此可以说明目前所有的垃圾收集器都做不到完全不需要“Stop-the-World”，只是尽可能地缩短暂停时间。
- **由于最耗费时间的并发标记与并发清除阶段都不需要暂停工作，所以整体的回收是低停顿的**。
- 另外，由于在垃圾收集阶段用户线程没有中断，所以在CMS回收过程中，还应该确保应用程序用户线程有足够的内存可用。因此，CMS收集器不能像其他收集器那样等到老年代几乎完全被填满了再进行收集，**而是当堆内存使用率达到某一阈值时，便开始进行回收**，以确保应用程序在CMS工作过程中依然有足够的空间支持应用程序运行。要是CMS运行期间预留的内存无法满足程序需要，就会出现一次**“Concurrent Mode Failure”** 失败，这时虚拟机将启动后备预案：临时启用Serial old收集器来重新进行老年代的垃圾收集，这样停顿时间就很长了。
- CMS收集器的垃圾收集算法采用的是**标记清除算法**，这意味着每次执行完内存回收后，由于被执行内存回收的无用对象所占用的内存空间极有可能是不连续的一些内存块，**不可避免地将会产生一些内存碎片**。那么CMS在为新对象分配内存空间时，将无法使用指针碰撞（Bump the Pointer）技术，而只能够选择空闲列表（Free List）执行内存分配。

![image-20221123133507332](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123133507332.png)

**为什么 CMS 不采用标记-压缩算法呢？**

答案其实很简答，因为当并发清除的时候，用Compact整理内存的话，原来的用户线程使用的内存还怎么用呢？要保证用户线程能继续执行，前提的它运行的资源不受影响嘛。Mark Compact更适合“stop the world”这种场景下使用

### CMS 的优点与弊端

**优点**

- 并发收集
- 低延迟

**弊端**

- **会产生内存碎片**，导致并发清除后，用户线程可用的空间不足。在无法分配大对象的情况下，不得不提前触发Full GC。
- **CMS收集器对CPU资源非常敏感**。在并发阶段，它虽然不会导致用户停顿，但是会因为占用了一部分线程而导致应用程序变慢，总吞吐量会降低。
- **CMS收集器无法处理浮动垃圾**。可能出现“Concurrent Mode Failure"失败而导致另一次Full GC的产生。在并发标记阶段由于程序的工作线程和垃圾收集线程是同时运行或者交叉运行的，**那么在并发标记阶段如果产生新的垃圾对象，CMS将无法对这些垃圾对象进行标记，最终会导致这些新产生的垃圾对象没有被及时回收，**从而只能在下一次执行GC时释放这些之前未被回收的内存空间。

### CMS 参数配置

- `-XX:+UseConcMarkSweepGC`：手动指定使用CMS收集器执行内存回收任务。

  开启该参数后会自动将-XX:+UseParNewGC打开。即：ParNew（Young区）+CMS（Old区）+Serial Old（Old区备选方案）的组合。

- `-XX:CMSInitiatingOccupanyFraction`：设置堆内存使用率的阈值，一旦达到该阈值，便开始进行回收。

  - JDK5及以前版本的默认值为68，即当老年代的空间使用率达到68%时，会执行一次CMS回收。JDK6及以上版本默认值为92%

  - 如果内存增长缓慢，则可以设置一个稍大的值，大的阀值可以有效降低CMS的触发频率，减少老年代回收的次数可以较为明显地改善应用程序性能。反之，如果应用程序内存使用率增长很快，则应该降低这个阈值，以避免频繁触发老年代串行收集器。因此通过该选项便可以有效降低Full GC的执行次数。

- `-XX:+UseCMSCompactAtFullCollection`：用于指定在执行完Full GC后对内存空间进行压缩整理，以此避免内存碎片的产生。不过由于内存压缩整理过程无法并发执行，所带来的问题就是停顿时间变得更长了。
- `-XX:CMSFullGCsBeforeCompaction`：设置在执行多少次Full GC后对内存空间进行压缩整理。
- `-XX:ParallelCMSThreads`：设置CMS的线程数量。
  - CMS默认启动的线程数是 (ParallelGCThreads + 3) / 4，ParallelGCThreads是年轻代并行收集器的线程数，可以当做是 CPU 最大支持的线程数。当CPU资源比较紧张时，受到CMS收集器线程的影响，应用程序的性能在垃圾回收阶段可能会非常糟糕。

### 小结

HotSpot有这么多的垃圾回收器，那么如果有人问，Serial GC、Parallel GC、Concurrent Mark Sweep GC这三个GC有什么不同呢？

- 如果你想要最小化地使用**内存**和并行开销，请选Serial GC；
- 如果你想要最大化应用程序的**吞吐量**，请选Parallel GC；
- 如果你想要最小化GC的**中断或停顿时间**，请选CMS GC。

### JDK 后续版本中 CMS 的变化

- JDK9新特性：CMS被标记为Deprecate了（JEP291）
  - 如果对JDK9及以上版本的HotSpot虚拟机使用参数-XX:+UseConcMarkSweepGC来开启CMS收集器的话，用户会收到一个警告信息，提示CMS未来将会被废弃。
- JDK14新特性：删除CMS垃圾回收器（JEP363）移除了CMS垃圾收集器，
  - 如果在JDK14中使用XX:+UseConcMarkSweepGC的话，JVM不会报错，只是给出一个warning信息，但是不会exit。JVM会自动回退以默认GC方式启动JVM

## G1 回收器：区域化分代式

### 为什么还需要G1

**既然我们已经有了前面几个强大的 GC ，为什么还要发布 Garbage First（G1）GC？**

- 原因就在于应用程序所应对的业务越来越庞大、复杂，用户越来越多，没有GC就不能保证应用程序正常进行，而经常造成STW的GC又跟不上实际的需求，所以才会不断地尝试对GC进行优化。
- G1（Garbage-First）垃圾回收器是在Java7 update4之后引入的一个新的垃圾回收器，是当今收集器技术发展的最前沿成果之一。
- 与此同时，**为了适应现在不断扩大的内存和不断增加的处理器数量**，进一步降低暂停时间（pause time），同时兼顾良好的吞吐量。
- 官方给G1设定的目标是在延迟可控的情况下获得尽可能高的吞吐量，所以才担当起“全功能收集器”的重任与期望。

### 为什么名字叫Garbage First(G1)呢？

- 因为G1是一个并行回收器，它把堆内存分割为很多不相关的区域（Region）（物理上不连续的）。使用不同的Region来表示Eden、幸存者0区，幸存者1区，老年代等。
- G1 GC有计划地避免在整个Java堆中进行全区域的垃圾收集。G1跟踪各个Region里面的垃圾堆积的价值大小（回收所获得的空间大小以及回收所需时间的经验值），在后台维护一个优先列表，**每次根据允许的收集时间，优先回收价值最大的Region。**
- 由于这种方式的侧重点在于回收垃圾最大量的区间（Region），所以我们给G1一个名字：垃圾优先（Garbage First）。
- G1（Garbage-First）是一款面向服务端应用的垃圾收集器，**主要针对配备多核CPU及大容量内存的机器**，以极高概率满足GC停顿时间的同时，还兼具高吞吐量的性能特征。
- 在JDK1.7版本正式启用，移除了Experimental的标识，**是JDK9以后的默认垃圾回收器**，取代了CMS回收器以及Parallel+Parallel Old组合。被Oracle官方称为**“全功能的垃圾收集器”**。
- 与此同时，CMS已经在JDK9中被标记为废弃（deprecated）。**G1在JDK8中还不是默认的垃圾回收器**，需要使用-XX:+UseG1GC来启用。

### G1 回收器的优势

与其他GC收集器相比，G1使用了全新的分区算法，其特点如下所示：

- **并行与并发兼备**
  - 并行性：G1在回收期间，可以有多个GC线程同时工作，有效利用多核计算能力。此时用户线程STW
  - 并发性：G1拥有与应用程序交替执行的能力，部分工作可以和应用程序同时执行，因此，一般来说，不会在整个回收阶段发生完全阻塞应用程序的情况
- **分代收集**
  - 从分代上看，**G1依然属于分代型垃圾回收器**，它会区分年轻代和老年代，年轻代依然有Eden区和Survivor区。但从堆的结构上看，它不要求整个Eden区、年轻代或者老年代都是连续的，也不再坚持固定大小和固定数量。
  - 将堆空间分为若干个区**域（Region）**，这些区域中包含了**逻辑上的年轻代和老年代**。
  - 和之前的各类回收器不同，**它同时兼顾年轻代和老年代。对比其他回收器，或者工作在年轻代，或者工作在老年代**

G1的分代，已经不是下面这样的了

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123143523018.png" alt="image-20221123143523018" style="zoom:67%;" />

G1的分区是这样的一个区域![image-20221123143452118](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123143452118.png)

**空间整合**

- CMS：**“标记-清除”**算法、内存碎片、若干次GC后进行一次碎片整理
- G1将内存划分为一个个的region。内存的回收是以region作为基本单位的。**Region之间是复制算法，但整体上实际可看作是标记-压缩（Mark-Compact）算法**，两种算法都可以避免内存碎片。这种特性有利于程序长时间运行，分配大对象时不会因为无法找到连续内存空间而提前触发下一次GC。尤其是当Java堆非常大的时候，G1的优势更加明显。

**可预测的停顿时间模型（即：软实时soft real-time）**

这是G1相对于CMS的另一大优势，G1除了追求低停顿外，还能建立可预测的停顿时间模型，能让使用者明确指定在一个长度为M毫秒的时间片段内，消耗在垃圾收集上的时间不得超过N毫秒。

- 由于分区的原因，G1可以只选取部分区域进行内存回收，这样缩小了回收的范围，因此对于全局停顿情况的发生也能得到较好的控制。
- G1跟踪各个Region里面的垃圾堆积的价值大小（回收所获得的空间大小以及回收所需时间的经验值），在后台维护一个优先列表，**每次根据允许的收集时间，优先回收价值最大的Region**。保证了G1收集器在有限的时间内可以获取尽可能高的收集效率。
- 相比于CMS GC，G1未必能做到CMS在最好情况下的延时停顿，但是最差情况要好很多。

### G1 回收器的缺点

- 相较于CMS，G1还不具备全方位、压倒性优势。比如在用户程序运行过程中，G1无论是为了垃圾收集产生的内存占用（Footprint）还是程序运行时的额外执行负载（overload）都要比CMS要高。
- 从经验上来说，在小内存应用上CMS的表现大概率会优于G1，而G1在大内存应用上则发挥其优势。平衡点在6-8GB之间。

### G1 参数设置

- `-XX:+UseG1GC`：手动指定使用G1垃圾收集器执行内存回收任务
- `-XX:G1HeapRegionSize`：设置每个Region的大小。值是2的幂，范围是1MB到32MB之间，目标是根据最小的Java堆大小划分出约2048个区域。默认是堆内存的1/2000。
- `-XX:MaxGCPauseMillis`：设置期望达到的最大GC停顿时间指标，JVM会尽力实现，但不保证达到。默认值是200ms
- `-XX:+ParallelGCThread`：设置STW工作线程数的值。最多设置为8
- `-XX:ConcGCThreads`：设置并发标记的线程数。将n设置为并行垃圾回收线程数（ParallelGcThreads）的1/4左右。
- `-XX:InitiatingHeapOccupancyPercent`：设置触发并发GC周期的Java堆占用率阈值。超过此值，就触发GC。默认值是45。

### G1 收集器的常见操作步骤

G1的设计原则就是简化JVM性能调优，开发人员只需要简单的三步即可完成调优：

1. 第一步：开启G1垃圾收集器
2. 第二步：设置堆的最大内存
3. 第三步：设置最大的停顿时间

G1中提供了三种垃圾回收模式：YoungGC、Mixed GC和Full GC，在不同的条件下被触发。

### G1 的适用场景

- 面向服务端应用，针对具有大内存、多处理器的机器。（在普通大小的堆里表现并不惊喜）
- 最主要的应用是需要低GC延迟，并具有大堆的应用程序提供解决方案；
- 如：在堆大小约6GB或更大时，可预测的暂停时间可以低于0.5秒；（G1通过每次只清理一部分而不是全部的Region的增量式清理来保证每次GC停顿时间不会过长）。
- 用来替换掉JDK1.5中的CMS收集器；在下面的情况时，使用G1可能比CMS好：
  - 超过50%的Java堆被活动数据占用；
  - 对象分配频率或年代提升频率变化很大；
  - GC停顿时间过长（长于0.5至1秒）
- HotSpot垃圾收集器里，除了G1以外，其他的垃圾收集器均使用内置的JVM线程执行GC的多线程操作，而G1 GC可以采用应用线程承担后台运行的GC工作，即当JVM的GC线程处理速度慢时，系统会调用应用程序线程帮助加速垃圾回收过程。

### 分区 Region

**分区 Region：化整为零**

- 使用G1收集器时，它将整个Java堆划分成约2048个大小相同的独立Region块，每个Region块大小根据堆空间的实际大小而定，整体被控制在1MB到32MB之间，且为2的N次幂，即1MB，2MB，4MB，8MB，16MB，32MB。可以通过
- XX:G1HeapRegionSize设定。**所有的Region大小相同，且在JVM生命周期内不会被改变。**
- 虽然还保留有新生代和老年代的概念，但新生代和老年代不再是物理隔离的了，它们都是一部分Region（不需要连续）的集合。通过Region的动态分配方式实现逻辑上的连续。
- 一个Region有可能属于Eden，Survivor或者Old/Tenured内存区域。但是一个Region只可能属于一个角色。图中的E表示该Region属于Eden内存区域，S表示属于Survivor内存区域，O表示属于Old内存区域。图中空白的表示未使用的内存空间。
- G1垃圾收集器还增加了一种新的内存区域，叫做Humongous内存区域，如图中的H块。主要用于存储大对象，如果超过0.5个Region，就放到H。

> 根据[官方文档](https://www.oracle.com/technetwork/tutorials/tutorials-1876574.html): **The G1 Garbage Collector Step by Step**
>
> As shown regions can be allocated into Eden, survivor, and old generation regions. In addition, there is a fourth type of object known as Humongous regions. These regions are designed to hold objects that are 50% the size of a standard region or larger. They are stored as a set of contiguous regions. Finally the last type of regions would be the unused areas of the heap.
>
> 翻译：
>
> 如图所示，可以将区域分配到Eden，幸存者和旧时代区域。 此外，还有第四种类型的物体被称为巨大区域。 这些区域旨在容纳标准区域大小的50％或更大的对象。 它们存储为一组连续区域。 最后，最后一种区域类型是堆的未使用区域。

![image-20221123150035924](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123150035924.png)

**设置 H 的原因**

对于堆中的大对象，默认直接会被分配到老年代，但是如果**它是一个短期存在的大对象**就会对垃圾收集器造成负面影响。为了解决这个问题，G1划分了一个Humongous区，它用来专门存放大对象。如**果一个H区装不下一个大对象，那么G1会寻找连续的H区来存储**。为了能找到连续的H区，有时候不得不启动Full GC。G1的大多数行为都把H区作为老年代的一部分来看待。

**Regio的细节**

![image-20221123150232057](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123150232057.png)

- 每个Region都是通过指针碰撞来分配空间
- G1为每一个Region设 计了两个名为TAMS（Top at Mark Start）的指针，把Region中的一部分空间划分出来用于并发回收过程中的新对象分配，并发回收时新分配的对象地址都必须要在这两个指针位置以上。
- TLAB还是用来保证并发性

### G1 垃圾回收流程

G1 GC的垃圾回收过程主要包括如下三个环节：

- 年轻代GC（Young GC）
- 老年代并发标记过程（Concurrent Marking）
- 混合回收（Mixed GC）
- （如果需要，单线程、独占式、高强度的Full GC还是继续存在的。它针对GC的评估失败提供了一种失败保护机制，即强力回收。）

![image-20221123150701067](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123150701067.png)

顺时针，Young GC --> Young GC+Concurrent Marking --> Mixed GC顺序，进行垃圾回收

**回收流程**

- 应用程序分配内存，当年轻代的Eden区用尽时开始年轻代回收过程；G1的年轻代收集阶段是一个**并行**的**独占**式收集器。在年轻代回收期，G1 GC暂停所有应用程序线程，启动多线程执行年轻代回收。然后从年轻代区间移动存活对象到Survivor区间或者老年区间，也有可能是两个区间都会涉及。
- 当堆内存使用达到一定值（默认45%）时，开始老年代并发标记过程。
- 标记完成马上开始混合回收过程。对于一个混合回收期，G1 GC从老年区间移动存活对象到空闲区间，这些空闲区间也就成为了老年代的一部分。和年轻代不同，老年代的G1回收器和其他GC不同，**G1的老年代回收器不需要整个老年代被回收，一次只需要扫描/回收一小部分老年代的Region就可以了**。同时，这个老年代Region是和年轻代一起被回收的。
- 举个例子：一个Web服务器，Java进程最大堆内存为4G，每分钟响应1500个请求，每45秒钟会新分配大约2G的内存。G1会每45秒钟进行一次年轻代回收，每31个小时整个堆的使用率会达到45%，会开始老年代并发标记过程，标记完成后开始四到五次的混合回收。

### Remembered Set（记忆集）

> 之前讲过

- 一个对象被不同区域引用的问题
- 一个Region不可能是孤立的，一个Region中的对象可能被其他任意Region中对象引用，判断对象存活时，是否需要扫描整个Java堆才能保证准确？
- 在其他的分代收集器，也存在这样的问题（而G1更突出，因为G1主要针对大堆）
- 回收新生代也不得不同时扫描老年代？这样的话会降低Minor GC的效率

**解决方法：**

- 无论G1还是其他分代收集器，JVM都是使用Remembered Set来避免全堆扫描；
- **每个Region都有一个对应的Remembered Set**
- 每次Reference类型数据写操作时，都会产生一个**Write Barrier**暂时中断操作；
- 然后检查将要写入的引用指向的对象是否和该Reference类型数据在不同的Region（其他收集器：检查老年代对象是否引用了新生代对象）；
- 如果不同，通过CardTable把相关引用信息记录到引用指向对象的所在Region对应的Remembered Set中；
- 当进行垃圾收集时，在GC根节点的枚举范围加入Remembered Set；就可以保证不进行全局扫描，也不会有遗漏。

![image-20221123154131991](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123154131991.png)

- 在回收 Region 时，为了不进行全堆的扫描，引入了 Remembered Set
- Remembered Set 记录了当前 Region 中的对象被哪个对象引用了
- 这样在进行 Region 复制时，就不要扫描整个堆，只需要去 Remembered Set 里面找到引用了当前 Region 的对象
- Region 复制完毕后，修改 Remembered Set 中对象的引用即可

------

### 回收过程

在介绍ZGC之前，首先回顾一下CMS和G1的GC过程以及停顿时间的瓶颈。CMS新生代的Young GC、G1和ZGC都基于标记-复制算法，但算法具体实现的不同就导致了巨大的性能差异。

标记-复制算法应用在CMS新生代（ParNew是CMS默认的新生代垃圾回收器）和G1垃圾回收器中。标记-复制算法可以分为三个阶段：

- 标记阶段，即从GC Roots集合开始，标记活跃对象；
- 转移阶段，即把活跃对象复制到新的内存地址上；
- 重定位阶段，因为转移导致对象的地址发生了变化，在重定位阶段，所有指向对象旧地址的指针都要调整到对象新的地址上。

下面以G1为例，通过G1中标记-复制算法过程（G1的Young GC和Mixed GC均采用该算法），分析G1停顿耗时的主要瓶颈。G1垃圾回收周期如下图所示：

![image-20221124133215454](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221124133215454.png)

#### G1回收过程一：年轻代 GC

- JVM启动时，G1先准备好Eden区，程序在运行过程中不断创建对象到Eden区，当Eden空间耗尽时，G1会启动一次年轻代垃圾回收过程。
- **年轻代回收只回收Eden区和Survivor区**
- YGC时，首先G1停止应用程序的执行（**Stop-The-World**），G1创建**回收集（Collection Set）**，回收集是指需要被回收的内存分段的集合，年轻代回收过程的回收集包含年轻代Eden区和Survivor区所有的内存分段。

![image-20221123154444385](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123154444385.png)

图的大致意思就是：

1、回收完E和S区，剩余存活的对象会复制到新的S区

2、S区达到一定的阈值可以晋升为O区

**细致过程：**

**然后开始如下回收过程：**

1. 第一阶段，**扫描根**

   根是指**GC Roots**，根引用连同RSet记录的外部引用作为扫描存活对象的入口。

2. 第二阶段，**更新RSet**

   处理**dirty card queue**中的card，更新RSet。此阶段完成后，**RSet可以准确的反映老年代对所在的内存分段中对象的引用**。

   > - 对于应用程序的引用赋值语句 `oldObject.field（这个是老年代）=object（这个是新生代）`，JVM会在之前和之后执行特殊的操作以在**dirty card queue**中入队一个保存了对象引用信息的card。在年轻代回收的时候，G1会对**Dirty Card Queue**中所有的card进行处理，以更新RSet，保证RSet实时准确的反映引用关系。
   > - 那为什么不在引用赋值语句处直接更新RSet呢？这是为了性能的需要，**RSet的处理需要线程同步，开销会很大，使用队列性能会好很多**。

3. 第三阶段，**处理RSet**

   识别被老年代对象指向的Eden中的对象，这些被指向的Eden中的对象被认为是存活的对象。

4. 第四阶段，**复制对象**

   - 此阶段，对象树被遍历，Eden区内存段中存活的对象会被复制到Survivor区中空的内存分段，Survivor区内存段中存活的对象
   - 如果年龄未达阈值，年龄会加1，达到阀值会被会被复制到Old区中空的内存分段。
   - 如果Survivor空间不够，Eden空间的部分数据会直接晋升到老年代空间。

5. 第五阶段，**处理引用**

   处理Soft，Weak，Phantom，Final，JNI Weak 等引用。最终Eden空间的数据为空，GC停止工作，而目标内存中的对象都是连续存储的，没有碎片，所以复制过程可以达到内存整理的效果，减少碎片。

#### G1回收过程二：并发标记过程

1. **初始标记阶段**

   标记从根节点直接可达的对象。这个阶段是STW的，并且会触发一次年轻代GC。

   正是由于该阶段时**STW**的，所以我们只扫描根节点可达的对象，以节省时间。

2. **根区域扫描（Root Region Scanning）**

   G1 GC扫描Survivor区直接可达的老年代区域对象，并标记被引用的对象。

   这一过程必须在Young GC之前完成，因为Young GC会使用复制算法对Survivor区进行GC。

3. **并发标记（Concurrent Marking）**

   1. 在整个堆中进行并发标记（和应用程序并发执行），此过程可能被Young GC中断。
   2. **在并发标记阶段，若发现区域对象中的所有对象都是垃圾，那这个区域会被立即回收。**
   3. 同时，并发标记过程中，会计算每个区域的对象活性（区域中存活对象的比例）。

4. **再次标记（Remark）**

   由于应用程序持续进行，需要修正上一次的标记结果。是**STW**的。

   G1中采用了比CMS更快的原始快照算法：**Snapshot-At-The-Beginning（SATB）**。

5. **独占清理（cleanup，STW）**

   计算各个区域的存活对象和GC回收比例，并进行排序，识别可以混合回收的区域。为下阶段做铺垫。是**STW**的。

   这个阶段并不会实际上去做垃圾的收集

6. **并发清理阶段**

   识别并清理完全空闲的区域。

#### G1回收过程三：混合回收过程

当越来越多的对象晋升到老年代Old Region时，为了避免堆内存被耗尽，虚拟机会触发一个混合的垃圾收集器，即Mixed GC，该算法并不是一个Old GC，除了回收整个Young Region，还会回收一部分的Old Region。

这里需要注意：**是一部分老年代，而不是全部老年代**。可以选择哪些Old Region进行收集，从而可以对垃圾回收的耗时时间进行控制。也要注意的是Mixed GC并不是Full GC。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123155918325.png" alt="image-20221123155918325" style="zoom:67%;" />

**混合回收的细节**

- 并发标记结束以后，老年代中百分百为垃圾的内存分段被回收了，部分为垃圾的内存分段被计算了出来。

  默认情况下，这些**老年代的内存分段**会分**8**次（可以通过`-XX:G1MixedGCCountTarget`设置）被回收。【意思就是一个Region会被分为8个内存段】

- 混合回收的**回收集（Collection Set）**包括**八分之一的老年代内存分段**，**Eden区内存分段**，**Survivor区内存分段**。

  混合回收的算法和年轻代回收的算法完全一样，只是回收集多了老年代的内存分段。具体过程请参考上面的年轻代回收过程。

- 由于老年代中的内存分段默认分8次回收，G1会优先回收垃圾多的内存分段。**垃圾占内存分段比例越高的，越会被先回收**。

  并且有一个阈值会决定内存分段是否被回收。`-XX:G1MixedGCLiveThresholdPercent`，默认为65%，意思是垃圾占内存分段比例要达到65%才会被回收。如果垃圾占比太低，意味着存活的对象占比高，在复制的时候会花费更多的时间。

- 混合回收并不一定要进行8次。有一个阈值**-XX:G1HeapWastePercent**，默认值为10%，意思是允许整个堆内存中有10%的空间被浪费，意味着如果发现可以回收的垃圾占堆内存的比例低于10%，则不再进行混合回收。因为GC会花费很多的时间但是回收到的内存却很少。

- Mixed GC也是**STW**的，它在用户指定的停顿时间目标范围内完成GC回收

#### G1 回收可选的过程四：Full GC

- G1的初衷就是要避免Full GC的出现。但是如果上述方式不能正常工作，G1会**停止应用程序的执行（Stop-The-World）**，使用**单线程**的内存回收算法进行垃圾回收，性能会非常差，应用程序停顿时间会很长。
- 要避免Full GC的发生，一旦发生Full GC，需要对JVM参数进行调整。什么时候会发生Ful1GC呢？比如**堆内存太小**，当G1在复制存活对象的时候没有空的内存分段可用，则会回退到Full GC，这种情况可以通过增大内存解决。

导致G1 Full GC的原因可能有两个：

- Evacuation（回收阶段）的时候没有足够的to-space来存放晋升的对象；
- 并发处理过程完成之前空间耗尽。

### G1补充

从Oracle官方透露出来的信息可获知，回收阶段（Evacuation）其实本也有想过设计成与用户程序一起并发执行，但这件事情做起来比较复杂，考虑到G1只是回一部分Region，停顿时间是用户可控制的，所以并不迫切去实现，**而选择把这个特性放到了G1之后出现的低延迟垃圾收集器（即ZGC）中。**另外，还考虑到G1不是仅仅面向低延迟，停顿用户线程能够最大幅度提高垃圾收集效率，为了保证吞吐量所以才选择了完全暂停用户线程的实现方案。

**G1 回收器的优化建议**

- 年轻代大小
  - 避免使用`-Xmn`或`-XX:NewRatio`等相关选项显式设置年轻代大小，因为固定年轻代的大小会覆盖可预测的暂停时间目标。我们让G1自己去调整
- 暂停时间目标不要太过严苛
  - G1 GC的吞吐量目标是90%的应用程序时间和10%的垃圾回收时间
  - 评估G1 GC的吞吐量时，暂停时间目标不要太严苛。目标太过严苛表示你愿意承受更多的垃圾回收开销，而这些会直接影响到吞吐量。

## 垃圾回收器总结

### 7 种垃圾回收器的比较

截止JDK1.8，一共有7款不同的垃圾收集器。每一款的垃圾收集器都有不同的特点，在具体使用的时候，需要根据具体的情况选用不同的垃圾收集器。

![image-20221123165646969](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123165646969.png)

![image-20221123165952693](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123165952693.png)

### 怎么选择垃圾回收器

Java垃圾收集器的配置对于JVM优化来说是一个很重要的选择，选择合适的垃圾收集器可以让JVM的性能有一个很大的提升。怎么选择垃圾收集器？

- 优先调整堆的大小让JVM自适应完成。
- 如果内存小于100M，使用串行收集器
- 如果是单核、单机程序，并且没有停顿时间的要求，串行收集器
- 如果是多CPU、需要高吞吐量、允许停顿时间超过1秒，选择并行或者JVM自己选择
- 如果是多CPU、追求低停顿时间，需快速响应（比如延迟不能超过1秒，如互联网应用），使用并发收集器
- 官方推荐G1，性能高。现在互联网的项目，基本都是使用G1。

最后需要明确一个观点：

- 没有最好的收集器，更没有万能的收集算法
- 调优永远是针对特定场景、特定需求，不存在一劳永逸的收集器

**面试**

- 对于垃圾收集，面试官可以循序渐进从理论、实践各种角度深入，也未必是要求面试者什么都懂。但如果你懂得原理，一定会成为面试中的加分项。
- 这里较通用、基础性的部分如下：
  - 垃圾收集的算法有哪些？如何判断一个对象是否可以回收？
  - 垃圾收集器工作的基本流程。
- 另外，大家需要多关注垃圾回收器这一章的各种常用的参数

## GC 日志分析

### 常用参数配置

> **GC 日志参数设置**

**通过阅读GC日志，我们可以了解Java虚拟机内存分配与回收策略。**

内存分配与垃圾回收的参数列表

- `-XX:+PrintGC` ：输出GC日志。类似：-verbose:gc
- `-XX:+PrintGCDetails` ：输出GC的详细日志
- `-XX:+PrintGCTimestamps` ：输出GC的时间戳（以基准时间的形式）
- `-XX:+PrintGCDatestamps` ：输出GC的时间戳（以日期的形式，如2013-05-04T21: 53: 59.234 +0800）
- `-XX:+PrintHeapAtGC` ：在进行GC的前后打印出堆的信息
- `-Xloggc:…/logs/gc.log` ：日志文件的输出路径

> **verbose:gc**

1、JVM 参数

```
-verbose:gc
```

2、这个只会显示总的GC堆的变化，如下：

![image-20221123171130702](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123171130702.png)

3、参数解析

- GC、Full GC: GC的类型，GC只在新生代上进行，Full GC包括永生代，新生代，老年代。
- Allocation Failure: GC发生的原因。
- 80832K->19298K: 堆在GC前的大小和GC后的大小。
- 228840k: 现在的堆大小。
- 0.0084018 secs: GC持续的时间。

> **PrintGCDetails**

1、JVM 参数

```
-XX:+PrintGCDetails
```

2、输入信息如下

![image-20221123171507334](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123171507334.png)

3、参数解析

- GC,Full FC: 同样是GC的类型
- Allocation Failure: GC原因
- PSYoungGen: 使用了Parallel Scavenge并行垃圾收集器的新生代GC前后大小的变化
- ParoldGen:使用了Parallel old并行垃圾收集器的老年代GC前后大小的变化
- Metaspace:元数据区GC前后大小的变化，JDK1.8中引入了元数据区以替代永久代
- xxx secs: 指GC花费的时间
- Times :
  - user: 指的是垃圾收集器花费的所有CPU时同，
  - sys: 花费在等待系统调用或系统事件的时间
  - real: GC从开始到结束的时间，包括其他进程占用时间片的实际时间。

> **PrintGCTimestamps 和 PrintGCDatestamps**

1、JVM 参数

```
-XX:+PrintGCTimeStamps -XX:+PrintGCDateStamps
```

2、输出信息如下

![image-20221123172304131](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123172304131.png)

3、说明：日志带上了日期和时间

### GC 日志补充说明

- “[GC"和”[Full GC"说明了这次垃圾收集的停顿类型，如果有"Full"则说明GC发生了"Stop The World"
- 使用**Serial**收集器在新生代的名字是Default New Generation，因此显示的是"[DefNew"
- 使用**ParNew**收集器在新生代的名字会变成"**[ParNew**"，意思是"Parallel New Generation"
- 使用**Parallel scavenge**收集器在新生代的名字是”**[PSYoungGen**"
- 老年代的收集和新生代道理一样，名字也是收集器决定的
- 使用**G1**收集器的话，会显示为"**garbage-first heap**"
- **Allocation Failure**表明本次引起GC的原因是因为在年轻代中没有足够的空间能够存储新的数据了。
- [ PSYoungGen: 5986K->696K(8704K) ] 5986K->704K (9216K)
  - 中括号内：GC回收前年轻代大小，回收后大小，（年轻代总大小）
  - 括号外：GC回收前年轻代和老年代大小，回收后大小，（年轻代和老年代总大小）
- user代表用户态回收耗时，sys内核态回收耗时，real实际耗时。由于多核线程切换的原因，时间总和可能会超过real时间

#### Young GC

![image-20221123172643603](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123172643603.png)

#### Full GC

![image-20221123175148653](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123175148653.png)

#### 举例

```
/**
 * 在jdk7 和 jdk8中分别执行
 * -verbose:gc -Xms20M -Xmx20M -Xmn10M -XX:+PrintGCDetails -XX:SurvivorRatio=8 -XX:+UseSerialGC
 */
public class GCLogTest1 {
    private static final int _1MB = 1024 * 1024;

    public static void testAllocation() {
        byte[] allocation1, allocation2, allocation3, allocation4;
        allocation1 = new byte[2 * _1MB];
        allocation2 = new byte[2 * _1MB];
        allocation3 = new byte[2 * _1MB];
        allocation4 = new byte[4 * _1MB];
    }

    public static void main(String[] agrs) {
        testAllocation();
    }
}
```

**JDK7 中的情况**

1、首先我们会将3个2M的数组存放到Eden区，然后后面4M的数组来了后，将无法存储，因为Eden区只剩下2M的剩余空间了，那么将会进行一次Young GC操作，将原来Eden区的内容，存放到Survivor区，但是Survivor区也存放不下，那么就会直接晋级存入Old 区

![image-20221123175622510](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123175622510.png)

2、然后我们将4M对象存入到Eden区中

[![img](https://camo.githubusercontent.com/c290f0d2b1b4d6c8633a37c0dbea320edb37474e8cc445b963c1fa131307478a/68747470733a2f2f6e706d2e656c656d6563646e2e636f6d2f796f7574686c716c40312e302e382f4a564d2f636861707465725f3031322f303033332e706e67)](https://camo.githubusercontent.com/c290f0d2b1b4d6c8633a37c0dbea320edb37474e8cc445b963c1fa131307478a/68747470733a2f2f6e706d2e656c656d6563646e2e636f6d2f796f7574686c716c40312e302e382f4a564d2f636861707465725f3031322f303033332e706e67)

老年代图画的有问题，free应该是4M

**JDK8 中的情况**

```
com.atguigu.java.GCLogTest1
[GC (Allocation Failure) [DefNew: 6322K->668K(9216K), 0.0034812 secs] 6322K->4764K(19456K), 0.0035169 secs] [Times: user=0.00 sys=0.00, real=0.00 secs] 
Heap
 def new generation   total 9216K, used 7050K [0x00000000fec00000, 0x00000000ff600000, 0x00000000ff600000)
  eden space 8192K,  77% used [0x00000000fec00000, 0x00000000ff23b668, 0x00000000ff400000)
  from space 1024K,  65% used [0x00000000ff500000, 0x00000000ff5a71d8, 0x00000000ff600000)
  to   space 1024K,   0% used [0x00000000ff400000, 0x00000000ff400000, 0x00000000ff500000)
 tenured generation   total 10240K, used 4096K [0x00000000ff600000, 0x0000000100000000, 0x0000000100000000)
   the space 10240K,  40% used [0x00000000ff600000, 0x00000000ffa00020, 0x00000000ffa00200, 0x0000000100000000)
 Metaspace       used 3469K, capacity 4496K, committed 4864K, reserved 1056768K
  class space    used 381K, capacity 388K, committed 512K, reserved 1048576K

Process finished with exit code 0
```

![image-20221123215003239](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123215003239.png)

与 JDK7 不同的是，JDK8 直接判定 4M 的数组为大对象，直接怼到老年区去了

### 常用日志分析工具

**保存日志文件**

**JVM参数**：`-XLoggc:./logs/gc.log`， ./ 表示当前目录，在 IDEA中程序运行的当前目录是工程的根目录，而不是模块的根目录

可以用一些工具去分析这些GC日志，常用的日志分析工具有：

GCViewer、GCEasy、GCHisto、GCLogViewer、Hpjmeter、garbagecat等

**推荐：GCeasy**

在线分析网址：gceasy.io



![image-20221123220658355](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123220658355.png)

![image-20221123220715801](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221123220715801.png)

## 垃圾回收器的新发展

### 垃圾回收器的发展过程

- GC仍然处于飞速发展之中，目前的默认选项G1 GC在不断的进行改进，很多我们原来认为的缺点，例如串行的Full GC、Card Table扫描的低效等，都已经被大幅改进，例如，JDK10以后，Fu11GC已经是并行运行，在很多场景下，其表现还略优于ParallelGC的并行Ful1GC实现。
- 即使是SerialGC，虽然比较古老，但是简单的设计和实现未必就是过时的，它本身的开销，不管是GC相关数据结构的开销，还是线程的开销，都是非常小的，所以随着云计算的兴起，在serverless等新的应用场景下，Serial Gc找到了新的舞台。
- 比较不幸的是CMSGC，因为其算法的理论缺陷等原因，虽然现在还有非常大的用户群体，但在JDK9中已经被标记为废弃，并在JDK14版本中移除
- 现在G1回收器已成为默认回收器好几年了。我们还看到了引入了两个新的收集器：ZGC（JDK11出现）和Shenandoah（Open JDK12），其特点：主打低停顿时间

### Shenandoah GC

**Open JDK12的Shenandoash GC：低停顿时间的GC（实验性）**

- Shenandoah无疑是众多GC中最孤独的一个。是第一款不由Oracle公司团队领导开发的Hotspot垃圾收集器。不可避免的受到官方的排挤。比如号称openJDK和OracleJDK没有区别的Oracle公司仍拒绝在OracleJDK12中支持Shenandoah。
- Shenandoah垃圾回收器最初由RedHat进行的一项垃圾收集器研究项目Pauseless GC的实现，**旨在针对JVM上的内存回收实现低停顿的需求**。在2014年贡献给OpenJDK。
- Red Hat研发Shenandoah团队对外宣称，**Shenandoah垃圾回收器的暂停时间与堆大小无关，这意味着无论将堆设置为200MB还是200GB，99.9%的目标都可以把垃圾收集的停顿时间限制在十毫秒以内**。不过实际使用性能将取决于实际工作堆的大小和工作负载。

这是RedHat在2016年发表的论文数据，测试内容是使用ES对200GB的维基百科数据进行索引。从结果看：

- 停顿时间比其他几款收集器确实有了质的飞跃，但也未实现最大停顿时间控制在十毫秒以内的目标。
- 而吞吐量方面出现了明显的下降，总运行时间是所有测试收集器里最长的。

![image-20221124121408851](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221124121408851.png)

总结

- Shenandoah GC的弱项：高运行负担下的吞吐量下降。
- Shenandoah GC的强项：低延迟时间。

### ZGC

- 官方文档：https://docs.oracle.com/en/java/javase/12/gctuning/
- ZGC与Shenandoah目标高度相似，**在尽可能对吞吐量影响不大的前提下，实现在任意堆内存大小下都可以把垃圾收集的停颇时间限制在十毫秒以内的低延迟**。
- 《深入理解Java虚拟机》一书中这样定义ZGC：ZGC收集器是一款基于Region内存布局的，（暂时）不设分代的，使用了读屏障、染色指针和内存多重映射等技术来实现**可并发的标记-压缩算法**的，**以低延迟为首要目标**的一款垃圾收集器。
- ZGC的工作过程可以分为4个阶段：**并发标记 - 并发预备重分配 - 并发重分配 - 并发重映射** 等。
- ZGC几乎在所有地方并发执行的，除了初始标记的是STW的。所以停顿时间几乎就耗费在初始标记上，这部分的实际时间是非常少的。

**吞吐量**

![image-20221124122253202](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221124122253202.png)

max-JOPS：以低延迟为首要前提下的数据

critical-JOPS：不考虑低延迟下的数据 

**低延迟**

![image-20221124124038347](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221124124038347.png)

在ZGC的强项停顿时间测试上，它毫不留情的将Parallel、G1拉开了两个数量级的差距。无论平均停顿、95%停顿、998停顿、99. 98停顿，还是最大停顿时间，ZGC都能毫不费劲控制在10毫秒以内。

虽然ZGC还在试验状态，没有完成所有特性，但此时性能已经相当亮眼，用“令人震惊、革命性”来形容，不为过。未来将在服务端、大内存、低延迟应用的首选垃圾收集器。

![image-20221124124146737](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221124124146737.png)

- JDK14之前，ZGC仅Linux才支持。

- 尽管许多使用ZGC的用户都使用类Linux的环境，但在Windows和macOS上，人们也需要ZGC进行开发部署和测试。许多桌面应用也可以从ZGC中受益。因此，ZGC特性被移植到了Windows和macOS上。

- 现在mac或Windows上也能使用ZGC了，示例如下：

  `+UseZGC`

#### 全并发的ZGC

与CMS中的ParNew和G1类似，ZGC也采用标记-复制算法，不过ZGC对该算法做了重大改进：ZGC在标记、转移和重定位阶段几乎都是并发的，这是ZGC实现停顿时间小于10ms目标的最关键原因。

ZGC垃圾回收周期如下图所示：

![image-20221124133609775](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221124133609775.png)

ZGC只有三个STW阶段：**初始标记**，**再标记**，**初始转移**。其中，初始标记和初始转移分别都只需要扫描所有GC Roots，其处理时间和GC Roots的数量成正比，一般情况耗时非常短；再标记阶段STW时间很短，最多1ms，超过1ms则再次进入并发标记阶段。即，ZGC几乎所有暂停都只依赖于GC Roots集合大小，停顿时间不会随着堆的大小或者活跃对象的大小而增加。与ZGC对比，G1的转移阶段完全STW的，且停顿时间随存活对象的大小增加而增加。

#### ZGC关键技术

ZGC通过着色指针和读屏障技术，解决了转移过程中准确访问对象的问题，实现了并发转移。大致原理描述如下：并发转移中“并发”意味着GC线程在转移对象的过程中，应用线程也在不停地访问对象。假设对象发生转移，但对象地址未及时更新，那么应用线程可能访问到旧地址，从而造成错误。而在ZGC中，应用线程访问对象将触发“读屏障”，如果发现对象被移动了，那么“读屏障”会把读出来的指针更新到对象的新地址上，这样应用线程始终访问的都是对象的新地址。那么，JVM是如何判断对象被移动过呢？就是利用对象引用的地址，即着色指针。下面介绍着色指针和读屏障技术细节。

##### **着色指针**

> 着色指针是一种将信息存储在指针中的技术。

ZGC仅支持64位系统，它把64位虚拟地址空间划分为多个子空间，如下图所示：

![image-20221124133645049](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221124133645049.png)

其中，[0~4TB) 对应Java堆，[4TB ~ 8TB) 称为M0地址空间，[8TB ~ 12TB) 称为M1地址空间，[12TB ~ 16TB) 预留未使用，[16TB ~ 20TB) 称为Remapped空间。

当应用程序创建对象时，首先在堆空间申请一个虚拟地址，但该虚拟地址并不会映射到真正的物理地址。ZGC同时会为该对象在M0、M1和Remapped地址空间分别申请一个虚拟地址，且这三个虚拟地址对应同一个物理地址，但这三个空间在同一时间有且只有一个空间有效。ZGC之所以设置三个虚拟地址空间，是因为它使用“空间换时间”思想，去降低GC停顿时间。“空间换时间”中的空间是虚拟空间，而不是真正的物理空间。后续章节将详细介绍这三个空间的切换过程。

与上述地址空间划分相对应，ZGC实际仅使用64位地址空间的第0~41位，而第42~45位存储元数据，第47~63位固定为0。

![image-20221124133656603](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221124133656603.png)

ZGC将对象存活信息存储在42~45位中，这与传统的垃圾回收并将对象存活信息放在对象头中完全不同。

##### **读屏障**

> 读屏障是JVM向应用代码插入一小段代码的技术。当应用线程从堆中读取对象引用时，就会执行这段代码。需要注意的是，仅“从堆中读取对象引用”才会触发这段代码。

读屏障示例：

```Java
Object o = obj.FieldA   // 从堆中读取引用，需要加入屏障
<Load barrier>
Object p = o  // 无需加入屏障，因为不是从堆中读取引用
o.dosomething() // 无需加入屏障，因为不是从堆中读取引用
int i =  obj.FieldB  //无需加入屏障，因为不是对象引用
```

ZGC中读屏障的代码作用：在对象标记和转移过程中，用于确定对象的引用地址是否满足条件，并作出相应动作。

------

### 面向大堆的 AliGC

AliGC是阿里巴巴JVM团队基于G1算法，面向大堆（LargeHeap）应用场景。指定场景下的对比：

![image-20221124125329709](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221124125329709.png)