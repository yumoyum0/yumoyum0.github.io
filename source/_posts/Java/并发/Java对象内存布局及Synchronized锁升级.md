---
title: Java对象内存布局及Synchronized锁升级
date: 2023-02-19 16:51:33
tags: 
- Java
- 并发
- JUC
categories:
- Java
---

# Java对象内存布局和对象头

## 面试题

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/6dec6853a18f461190651864183c58f2.png)

## Object object = new Object()

谈谈你对这句话的理解？一般而言JDK8按照默认情况下，new一个对象占多少内存空间

### 位置所在

在JVM堆里的新生区的伊甸园区（这些都是之前的基础知识了）

### 构成布局

## 对象在堆内存中布局

### 权威定义

在HotSpot虚拟机里，对象在堆内存中的存储布局可以划分为三个部分：

- **对象头**
- **实例数据**
- **对齐填充**

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/e671f63f33fa4f2a819e476760923933.png)

### 对象在堆内存中的存储布局

下面分别是 **java对象** 和**数组**（数组对象会多一个length），原理其实类似

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/a545ca804b27471abda1f3754f39a4c4.png)

#### 1.对象头

- **对象头**分为**对象标记（markOpp）**和 **类元信息 (klassOop)**
- **类元信息**存储的是指向该对象类元数据（klass）的首地址。

> 先提出几个问题来引出下面的概念

```
public class Demo01 {
    public static void main(String[] args) {
        Object o = new Object();//?new 一个对象，内存占多少，记录在哪里？

        System.out.println(o.hashCode());//356573597，这个hashCode又是记录在哪里的

        synchronized (o){//加锁信息又是记录在哪里的

        }
        System.gc();//手动垃圾收集中，15次可以从新生代到养老区，那这个次数又是记录在哪里的
    }
}

```

> 先回复一下问题

- 刚刚几个问题都保存在**对象标记**里

  ![image-20230219124237933](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219124237933.png)

**对象标记Mark Word**

![image-20230219124347191](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219124347191.png)

- 在64位系统中，MarkWord占了8个字节，类型指针占了8个字节，一共是16个字节

  ![image-20230219124640165](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219124640165.png)

默认存储对象的HashCode、分代年龄和锁标志位等信息。这些信息都是与对象自身定这无关的数据，所以MarkWord被设计成一个非固定的数据结构以便在极小的空间内存存储尽量多的数据。它会根据对象的状态复用自己的存储空间，也就是说在运行期间MarkWord上存储的数据会随着锁标志位的变化而变化。

**类元信息（又叫类型指针）Class Pointer**

> 所谓的类元信息（类型指针）其实就可以说是**模板**

![image-20230219125828682](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219125828682.png)

- 对象指向它的类元数据的指针，虚拟机通过这个指针来确定这个对象是哪个类的示例。

**对象头多大**

- 在64位系统中，MarkWord占了8个字节，类型指针占了8个字节，一共是16个字节

#### 2.实例数据

**实例数据**：存放类的属性（Field）信息，包括父类的属性信息

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/76d636f2fea440f884bee3efbb5ece73.png)



#### 3.对齐填充

用来保证8字节的倍数

**对齐填充**：虚拟机要求对象起始地址必须是8字节的整数倍。填充数据不是必须存在的，仅仅是为了字节对齐这部分内存按8字节补充对齐。

有个案例，对象头16+实例数据5+对齐填充3=24字节

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/53df3f60fea84bb38e621b8ae53d3df3.png)



### 官网理论

- Hotspot术语表官网

![image-20230219130623109](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219130623109.png)

- 底层源码理论证明

  `http://hg.openjdk.java.netjidlk8u/jdk8u/hotspot/file/89fb452b3688/src/share/vm/oops/oop.hpp`

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/f3ab347de6754c06a3f9b04b0b498099.png)

  *mark字段是mark word，* metadata是类指针klass pointer，
  对象头（object header）即是由这两个字段组成，这些术语可以参考Hotspot术语表，

  ![image-20230219130807960](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219130807960.png)



## 再说对象头的MarkWord

### 32位（看一下即可，以64位为准）

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/9ecd513abf624152959f547796f5daac.png)

### 64位重要

![image-20230219131110213](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219131110213.png)

![image-20230219131008783](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219131008783.png)

- 看看C中的源码

- oop.hpp

  ![image-20230219131245343](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219131245343.png)

- markOop.hpp

  ![image-20230219131551590](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219131551590.png)

  - hash：保存对象的哈希码
  - age： 保存对象的分代年龄
  - biased_lock： 偏向锁标识位
  - lock： 锁状态标识位
  - JavaThread ：保存持有偏向锁的线程ID
  - epoch： 保存偏向时间戳



### markword(64位)分布图

对象布局、GC回收和后面的锁升级就是对象标记MarkWord里面标志位的变化

![image-20230219131800207](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219131800207.png)

## 聊聊Object obj = new Object()【用代码演示】

### JOL证明

JOL工具（Java Object Layout工具）-可以帮助分析对象在Java虚拟机中的大小和布局

`http://openjdk.java.net/projects/code-tools/joll`(网站已经失效了)

但我们可以直接用**依赖**来实现这个功能

```
<dependency>
    <groupId>org.openjdk.jol</groupId>
    <artifactId>jol-core</artifactId>
    <version>0.9</version>
</dependency>
```

```java
//简单测试
public static void main(String[] args) {
    //Vm的细节详细情况
    System.out.println(VM.current().details());
    //# WARNING: Unable to attach Serviceability Agent. You can try again with escalated privileges. Two options: a) use -Djol.tryWithSudo=true to try with sudo; b) echo 0 | sudo tee /proc/sys/kernel/yama/ptrace_scope
    //# Running 64-bit HotSpot VM.
    //# Using compressed oop with 3-bit shift.
    //# Using compressed klass with 3-bit shift.
    //# WARNING | Compressed references base/shifts are guessed by the experiment!
    //# WARNING | Therefore, computed addresses are just guesses, and ARE NOT RELIABLE.
    //# WARNING | Make sure to attach Serviceability Agent to get the reliable addresses.
    //# Objects are 8 bytes aligned.
    //# Field sizes by type: 4, 1, 1, 2, 2, 4, 4, 8, 8 [bytes]
    //# Array element sizes: 4, 1, 1, 2, 2, 4, 4, 8, 8 [bytes]

    //所有的对象分配的字节都是8的整数倍
    System.out.println(VM.current().objectAlignment());
    //8
}
```



### 代码

#### 演示一 | 用自带的类

```java
//第一个演示，16bytes演示
public class Demo01 {
    public static void main(String[] args) {
        Object o = new Object();//----------新建一个Object对象就是  16bytes
        System.out.println(ClassLayout.parseInstance(o).toPrintable());
//java.lang.Object object internals:
// OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
//      0     4        (object header)                           01 00 00 00 (00000001 00000000 00000000 00000000) (1)
//      4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
//      8     4        (object header)                           e5 01 00 f8 (11100101 00000001 00000000 11111000) (-134217243)
//     12     4        (loss due to the next object alignment)
//Instance size: 16 bytes
//Space losses: 0 bytes internal + 4 bytes external = 4 bytes total
    }
}
```

![image-20230219133457484](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219133457484.png)

> 这里丢下一个疑问，为什么类型指针是4字节？之前不都是说是8字节的吗？（因为压缩指针默认开启了，后面有讲）

#### 演示二 | 用自己的类

```java
//只有对象头，没有实例数据,依然是16byte
public class Demo01 {
    public static void main(String[] args) {
        Customer c1 = new Customer();
        System.out.println(ClassLayout.parseInstance(c1).toPrintable());
        //com.zhang.java.Customer object internals:
        // OFFSET  SIZE   TYPE DESCRIPTION                               VALUE
        //      0     4        (object header)                           01 00 00 00 (00000001 00000000 00000000 00000000) (1)
        //      4     4        (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
        //      8     4        (object header)                           43 c1 00 f8 (01000011 11000001 00000000 11111000) (-134168253)
        //     12     4        (loss due to the next object alignment)
        //Instance size: 16 bytes
        //Space losses: 0 bytes internal + 4 bytes external = 4 bytes total
    }


}
class Customer{

}
```

```java
//有了对象头，且有实例数据(int+boolean)，它进行了对齐填充，到了24byte
public class Demo01 {
    public static void main(String[] args) {
        Customer c1 = new Customer();
        System.out.println(ClassLayout.parseInstance(c1).toPrintable());
//com.zhang.java.Customer object internals:
// OFFSET  SIZE      TYPE DESCRIPTION                               VALUE
//      0     4           (object header)                           01 00 00 00 (00000001 00000000 00000000 00000000) (1)
//      4     4           (object header)                           00 00 00 00 (00000000 00000000 00000000 00000000) (0)
//      8     4           (object header)                           43 c1 00 f8 (01000011 11000001 00000000 11111000) (-134168253)
//     12     4       int Customer.id                               0
//     16     1   boolean Customer.flag                             false
//     17     7           (loss due to the next object alignment)
//Instance size: 24 bytes
//Space losses: 0 bytes internal + 7 bytes external = 7 bytes total
    }


}
class Customer{
    int id;
    boolean flag = false;
}

```

### GC年龄

GC年龄采用4位bit存储，最大位15，例如MaxTenuringThreshold参数默认值就是15

- 对象分代年龄最大就是15

  ![image-20230219134147428](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219134147428.png)

#### 如果想证明一下

- 我们假如想直接把分代最大年龄修改为16会直接报错。

  `-XX:MaxTenurningThreshold=16`

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/4690e91ab23643f198b4a1dab7d6d032.png)

### 尾巴参数说明（压缩指针相关）

**压缩指针相关的命令**（压缩指针是否开启对我们new一个对象是不是16字节的影响）

#### 查看当前JVM运行参数的指令

`java -XX:+PrintCommandLineFlags -version`

#### 压缩指针默认是开启的

(这也就解释了为什么前面的类型指针是4个字节，节约了内存空间）

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/d9530c0b596540678d6cc97710129ebc.png)

#### 假如不压缩的情况？我们手动关闭压缩指针看看？

＋是开启，-就是关闭，所以指令是`-XX:-UseCompressedClassPointers`

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/401ded1f99fd4e07bec8b8acfacabadd.png)

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/fb4f7da2392a4c4cb6bd235cbd363eee.png)

> 也要注意，不管是否开启压缩指针，创建一个对象就是16字节的。（开启压缩指针后缺失的会由对齐填充补充）

### 换成其他对象试试

- 同样的道理

  ![](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/e9542129d6e840e989d7a9dfbc488371.png)



------

# Synchronized与锁升级

## 面试题

- 谈谈你对Synchronized的理解

- 请你聊聊Synchronized的锁升级

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/a06a04184bba439ebdab392288c75051.png)

  

## 本章路线总纲

### 说明

- 阿里巴巴规范：加锁的代码块工作量尽可能小，不要一竹竿打死

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/3dd2e69b76d44992a69af41e533e1892.png)

- synchronized锁优化的背景

  用锁能够实现数据的安全性，但是会带来性能下降。

  无锁能够基于现成并行提升程序性能，但是会带来安全性下降

  那么如何**求平衡**？

- 锁的升级过程

  **无锁-偏向锁-轻量级锁-重量级锁**

### synchronized锁

由对象头中的Mark Word根据锁标志位的不同而被复用及锁升级策略

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/ace499e78fb24a13a9547e44529d509b.png)

## Synchronized的性能变化

### java5以前

java5以前，只有Synchronized，这个是**操作系统级别**的**重量级**操作

**重量级锁**，假如锁的竞争比较激烈的话，性能下降

#### Java5之前，用户态和内核态之间的切换

![image-20230219144044579](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219144044579.png)

(我们写一个new Thread().start()的话是调用了底层的native方法的）

- java的线程是映射到操作系统原生线程之上的，如果要阻塞或唤醒一个线程就**需要操作系统介入**，需要在用户态与内核态之间切换，这种切换会消耗大量的系统资源，因为用户态与内核态都有各自专用的内存空间，专用的寄存器等，用户态切换至内核态需要传递给许多变量、参数给内核，内核也需要保护好用户态在切换时的一些寄存器值、变量等，以便内核态调用结束后切换回用户态继续工作。
- 在Java早期版本中，**synchronized属于重量级锁，效率低下，因为监视器锁（monitor）是依赖于底层的操作系统的Mutex Lock（系统互斥量）来实现的**，挂起线程和恢复线程都需要转入内核态去完成，阻塞或唤醒一个Java线程需要操作系统切换CPU状态来完成，这种状态切换需要耗费处理器时间，如果同步代码块中内容过于简单，**这种切换的时间可能比用户代码执行的时间还长**，时间成本相对较高，这也是为什么早期的synchronized效率低的原因
- Java 6之后，为了减少获得锁和释放锁所带来的性能消耗，**引入了轻量级锁和偏向锁**

（**一句话就是尽量减少用户态和内核态的切换**）

### 为什么每一个对象都可以成为一个锁-复习之前的知识

#### markOop.hpp

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/3cda3093bd464bd2aab95eb765cc23ac.png)

#### Monitor(监视器锁)

![image-20230219145808513](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219145808513.png)

- **Mutex Lock**

  Monitor是在jvm底层实现的，底层代码是c++。本质是依赖于底层操作系统的Mutex Lock实现，操作系统实现线程之间的切换需要从用户态到内核态的转换，状态转换需要耗费很多的处理器时间成本非常高。**所以synchronized是Java语言中的一个重量级操作**。

- **Monitor与java对象以及线程是如何关联**？

  1. 如果一个java对象被某个线程锁住，则该java对象的Mark Word字段中LockWord指向monitor的起始地址
  2. Monitor的Owner字段会存放拥有相关联对象锁的线程id

- Mutex Lock的切换需要从用户态转换到核心态中，因此状态转换需要耗费很多的处理器时间。

我们说在java中每个对象都可以成为一把锁，因为在JVM中每个对象都一个monitor(监视器锁)。对应到C底层叫做Object Monitor，并用c定义了很多信息。再往下到操作系统中是基于Mutex Lock互斥锁实现，涉及到了用户态和内核态的切换，所以非常耗费资源

#### 结合之前的synchronized和对象头说明

- 主要就是MarkWord中是什么代码表示了他是什么**锁状态**

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2d5b99b129c842ac8c25a3a90ebacc8a.png)

### java6开始，优化Synchronized

- Java6之后，为了减少获得锁和释放锁所带来的性能消耗，引入了轻量级锁和偏向锁
- 需要有个逐步升级的过程，别一开始就捅到重量级锁

## Synchronized锁种类及升级步骤

### 多线程访问情况，3种

- 只有一个线程来访问，有且唯一Only One
- 有多个线程（2个线程A、B来交替访问）
- 竞争激烈，更多个线程来访问

### 升级流程

synchronized用的锁是存在Java对象头里的Mark Word中，锁升级功能主要依赖MarkWord中**锁标志位**和释放**偏向锁标志位**

**64位标记图再看看**

- 重点关注【偏向锁位】和【锁标志位】

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/ee00dd5cf746442e96ff7a1577d5de2a.png)

#### 锁指向

- 偏向锁：MarkWord存储的是**偏向的线程ID**；

- 轻量锁：MarkWord存储的是**指向线程栈中Lock Record的指针**；

- 重量锁：MarkWord存储的是**指向堆中的monitor对象的指针**；

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/6eccd9a620f34370b2f4ca1a3840d4e0.png)

### 无锁

#### C源码的MarkWord标记

- 和上面是对应的

  ![image-20230219150338255](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219150338255.png)

#### Code演示

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/23f67d623e124ae99b08dc6a7ef9ff24.png)

- 注1：整体从右下角往左上角看，但是每8位都是从左往右看

- 注2：这个HashCode调用了才有，不然就是0000…

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2e6f493eaba04be3ba4d194bacba3224.png)

#### 程序不会有锁的竞争

无锁：初始状态，一个对象被实例化后，如果还没有被任何线程竞争锁，那么它就为无锁状态（001)

### 偏锁

#### 是什么

**偏向锁**：**单线程竞争**

当线程A第一次竞争到锁时，通过修改Mark Word中的偏向ID、偏向模式。

如果不存在其他线程竞争，那么持有偏向锁的线程将永远不需要进行同步。

#### 主要作用

- **当一段同步代码一直被同一个线程多次访问，由于只有一个线程访问那么该线程在后续访问时便会自动获得锁**。

  （防止不停的在用户态和内核态之间切换）

- 举个例子，同一个老顾客来访，直接老规矩行方便

- 看看多线程卖票，同一个线程获得体会一下（表面上又三个线程在竞争，但实际上呈现aaaa bbbb cccccc 这样的特性，大部分情况下都是一个线程获得票）

  ![image-20230219152255500](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219152255500.png)

#### 小结论

Hotspot 的作者经过研究发现，大多数情况下：

- 多线程的情况下，锁不仅不存在多线程竞争，还存在锁由**同一个线程多次获得的情况**，
- 偏向锁就是在这种情况下出现的，它的出现是为了解决**只有在一个线程执行同步时提高性能**。

**备注**：

偏向锁会偏向于**第一个访问锁的线程**，如果在接下来的运行过程中，该锁没有被其他的线程访问，则持有偏向锁的线程将永远不需要触发同步。也即偏向锁在资源没有竞争情况下消除了同步语句，懒的连CAS操作都不做了，直接提高程序性能

**64位标记图**

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/c9a0bfebceba4a2a9b0ba3b987155f0f.png)

#### 偏向锁的持有

##### 说明

理论落地：

- 在实际应用运行过程中发现，“锁总是同一个线程持有，很少发生竞争”，也就是说**锁总是被第一个占用他的线程拥有，这个线程就是锁的偏向线程**。

- 那么只需要在锁第一次被拥有的时候，记录下偏向线程ID。这样偏向线程就一直持有着锁。

  后续这个线程进入和退出这段加了同步锁的代码块时，**不需要再次加锁和释放锁**。而是直接会去检查锁的MarkWord里面是不是放的自己的线程ID。

  - **如果相等**，表示偏向锁是偏向于当前线程的，就不需要再尝试获得锁了，直到竞争发生才释放锁。

    以后每次同步，检查锁的偏向线程ID与当前线程ID是否一致，如果一致直接进入同步。无需每次加锁解锁都去CAS更新对象头。

    **如果自始至终使用锁的线程只有一个**，很明显偏向锁几乎没有额外开销，性能极高。

  - **如果不等**，表示发生了竞争，锁己经不是总是偏向于同一个线程了，这个时候会尝试使用CAS来替换MarkWord里面的线程ID为新线程的ID，

    - **竞争成功**，表示之前的线程不存在了，MarkWord里面的线程ID为新线程的ID，锁不会升级，仍然为偏向锁；
    - **竞争失败**，这时候可能需要升级变为**轻量级锁**，才能保证线程间公平竞争锁。

- **注意，偏向锁只有遇到其他线程尝试竞争偏向锁时，持有偏向锁的线程才会释放锁，线程是不会主动释放偏向锁的**。

技术实现：

- 一个synchronized方法被一个线程抢到了锁时，那这个方法所在的对象就会在其所在的Mark Word中将偏向锁修改状态位，同时还会占用前54位来存储县城指针作为标识。若该线程再次访问同一个synchronized方法时，该线程只需要去对象头的Mark Word中去判断一下是否有偏向锁指向本身的ID，无需再进入Monitor去竞争对象了

  ![image-20230219153736496](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219153736496.png)

##### 细化Account对象举例说明

**结论**：JVM不用和操作系统协商设置Mutex（争取内核），它只需要记录下线程ID就标识自己获得了当前锁，不用操作系统接入。
![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/5137e71643794d519bf889a8ea47f99c.png)

#### 偏向锁JVM命令

**`java -XX:+PrintFlagsInitial |grep BiasedLock`**

- 偏向锁存在且默认开启（图片里最后一行的false），并且有4s延迟（图片里的4000）

  ![image-20230219155540086](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219155540086.png)

> jdk17中默认不开启偏向锁，启动延迟为0。因为从java15开始逐步废弃偏向锁
>
> ![](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219155156106.png)



##### 重要参数说明

- 关于如何开启偏向锁（延迟设置为0即可）和关闭偏向锁

  ```
  实际上偏向锁在JDK1.6之后是款认开启的，但是启动时间有延迟，
  所以需要添加参数-XX:BiasedLockingStartupDelay=0，让其在程序启动时立刻启动。
  
  开启偏向锁：
  -XX:+UseBiasedLocking -XX:BiasedLockingStartupDelay=0
  
  关闭偏向锁：关闭之后程序默认会直接进入 ----------------------->>>>>>> 轻量级锁状态
  -XX:-UseBiasedLocking
  ```

#### Code演示-通过将延迟改为0来开启偏向锁

**一切默认**

- 演示无效果，偏向锁本应该是101，000是轻量级锁（无效是因为有4s延迟，程序直接变成了轻量级锁）

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/9aefeb4614e7432d8d35984497e70702.png)

**因为参数系统默认开启**

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/7586e480966c4265add78ac347e19a12.png)

**关闭延迟参数，启用该功能**.

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/2326cc673efb4bf99f890cff224763ab.png)

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/df67dda673c94056a69e40acd864a21a.png)

#### Code演示2-主动迎合这4秒的延迟

##### 主动迎合4秒的延迟

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/b1db9b39ebd54afe9433436c4cc19d72.png)

##### 第一种情况-没用synchronized

- 确实开启了偏向锁101，但是o对象未采用synchronized加锁，所以线程id是空的

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/36a288923c7a4016ab489c72f2afd6e8.png)

##### 第二种情况- 用synchronized

- 使用synchronized锁住o之后，发现这五十四位指向了当前线程指针

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/1f2c384c1b4e459cad7bb5160d43cd9f.png)

#### 不再是一个线程独享

- 开始有第二个线程来竞争了

#### 偏向锁的撤销

- 当有另外线程逐步来竞争所的时候，就不能再使用偏向锁了，要升级为轻量级锁
- 竞争线程尝试CAS更新对象头失败，会等待到**全局安全点**（此时不会执行任何代码）撤销偏向锁

##### 撤销

偏向锁使用一种等到**竞争出现才释放锁的机制**，只有当其他线程竞争锁时，持有偏向锁的原来线程才会被撤销。

撇销需要等待**全局安全点**(该时间点上没有字节码正在执行)，同时检查持有偏向锁的线程是否还在执行：

- 第一个线程`正在执行synchronized方法(处于同步块)`，它还没有执行完，其它线程来抢夺，该偏向锁会被取消掉并出现**锁升级**。此时轻量级锁由原持有偏向锁的线程持有，继续执行其同步代码，而正在竞争的线程会进入自旋等待获得该轻量级锁。
- 第一个线程`执行完成synchronized方法(退出同步块)`，则将对象头**设置成无锁状态并撤销偏向锁，重新偏向**。
  ![image-20230219171749821](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219171749821.png)

#### 总体步骤流程图示

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219172317620.png" alt="image-20230219172317620" style="zoom: 200%;" />

#### java15逐步废弃偏向锁

- 在过去，Java 应用通常使用的都是 HashTable、Vector 等比较老的集合库，这类集合库大量使用了 synchronized 来保证线程安全。
- 如果在单线程的情景下使用这些集合库就会有不必要的加锁操作，从而导致性能下降。
- 而偏向锁可以保证即使是使用了这些老的集合库，也不会产生很大的性能损耗，因为 JVM 知道访问临界区的线程始终是同一个，也就避免了加锁操作。
- 这一切都很美好，但是随着时代的变化，新的 Java 应用基本都已经使用了无锁的集合库，比如 HashMap、ArrayList 等，这些集合库在单线程场景下比老的集合库性能更好。
- 即使是在多线程场景下，Java 也提供了 ConcurrentHashMap、CopyOnWriteArrayList 等性能更好的线程安全的集合库。
- 综上，**对于使用了新类库的 Java 应用来说，偏向锁带来的收益已不如过去那么明显，而且在当下多线程应用越来越普遍的情况下，偏向锁带来的锁升级操作反而会影响应用的性能**。

<img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219173622348.png" alt="image-20230219173622348"  />

在废弃偏向锁的提案 **[JEP374](https://link.zhihu.com/?target=https%3A//openjdk.java.net/jeps/374)** 中还提到了与 HotSpot 相关的一点

> Biased locking introduced a lot of complex code into the synchronization subsystem and is invasive to other HotSpot components as well.

简单翻译就是**偏向锁**为整个「同步子系统」引入了大量的复杂度，并且这些复杂度也入侵到了 HotSpot 的其它组件。

这导致了系统代码难以理解，难以进行大的设计变更，降低了子系统的演进能力，

总结下来其实就是 ROI （投资回报率）太低了，考虑到兼容性，所以决定先废弃该特性，最终的目标是移除它。

### 轻锁

#### 是什么

**轻量级锁**：多线程竞争，但是**任意时刻最多只有一个线程竞争**，即不存在锁竞争太过激烈的情况，也就没有线程阻寨

#### 主要作用

- 有线程来参与锁的竞争，但是获取锁的冲突时间极短
- 本质就是自选锁CAS

**64位标记图再看**

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/31b417d60922451ca5a5a471e3badeb8.png)

#### 轻量级锁的获取

轻量级锁是为了在线程**近乎交替**执行同步块时提高性能。

主要目的：在没有多线程竞争的前提下，**通过CAS减少**重量级锁使用操作系统互斥量产生的性能消耗．说白了**先自旋，不行才升级阻寨**。

升级时机：当关闭偏向锁功能或多线程竞争偏向锁会导致偏向锁升级为轻量级锁

假如线程A己经拿到锁，这时线程B又来抢该对象的锁，由于该对象的锁己经被线程A拿到，当前该锁己是偏向锁了。

而线程B在争抢时发现对象头Mark Ward中的线程ID不是线程B自己的线程1D(而是线程A)，那线程B就会进行CAS操作希望能获得锁。

此吋线程B操作中有两种情况：

- **如果锁获取成功**，直接替换Mark Word中的线程1D为B自己的1D(A—B)．重新偏向于其他线程(即将偏向锁交给其他线程，相当于当前线程"被"释放了锁)，该锁会保持偏向锁状态，A线程Over，B线程上位：
  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/48c603c3b8154a08945e30a2ce2d094e.png)

- **如果锁获取失败**，则偏向锁升级为轻量级锁(设置偏向锁标识为0并设置锁标志位为00)，此时轻量级锁由原持有偏向锁的线程持有，继续执行其同步代码，而正在竞争的线程B会进入自旋等待获得该轻量级锁。

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/cc6e7ab5801e490ca7908056ed8fc907.png)

##### 补充说明

- **轻量级锁的加锁**
  - JVM会为每个线程在当前线程的栈帧中**创建用于存储锁记录的空间**，官方成为`Displaced Mark Word`。若一个线程获得锁时发现是轻量级锁，会把锁的MarkWord复制到自己的Displaced Mark Word里面。然后线程尝试用CAS将锁的MarkWord替换为**指向锁记录的指针**。如果成功，当前线程获得锁，如果失败，表示Mark Word已经被替换成了其他线程的锁记录，说明在与其它线程竞争锁，当前线程就尝试使用自旋来获取锁。
  - 自旋CAS：不断尝试去获取锁，能不升级就不往上捅，尽量不要阻寨
- **轻量级锁的释放**
  - 在释放锁时，当前线程会使用CAS操作将Displaced Mark Word的内容复制回锁的Mark Word里面。如果没有发生竞争，那么这个复制的操作会成功。如果有其他线程因为自旋多次导致轻量级锁升级成了重量级锁，那么CAS操作会失败，此时会释放锁并唤醒被阻寨的线程。
    
    

#### Code演示

##### 如果关闭偏向锁，就可以直接进入轻量级锁

##### -XX:-UseBiasedLocking

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/6a1c95588e55448b9f2e3fd4bd63151f.png)

#### 步骤流程图示

- 轻量级锁状态下，CAS自旋达到一定次数也会**升级为重量级锁**

  <img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219184952642.png" alt="image-20230219184952642" style="zoom: 67%;" />

#### 自旋达到一定次数和程度

##### java6之前

- 了解即可

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/019bb3b645bb406a89f7469cab952f07.png)

##### java6之后

**【自适应自旋锁】**的大致原理

- 线程如果自旋成功了，那下次自旋的最大次数会增加，因为JVM认为既然上次成功了，那么这一次也很大概率会成功。
- 反之如果很少会自旋成功，那么下次会减少自旋的次数甚至不自旋，避免CPU空转。

总之，自适应意味着自选的次数不是固定不变的，而是根据：**同一个锁上一次自旋的时间和拥有锁线程的状态来决定**。



#### 轻量锁和偏向锁的区别和不同

- 争夺轻量级锁失败时，自旋尝试抢占锁
- 轻量级锁每次退出同步块都需要释放锁，而偏向锁是在竞争发生时才释放锁

### 重锁

#### 有大量的线程参与锁的竞争，冲突性很高

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/896a934c809740a68c5e18ec7374f100.png)

#### 锁标志位

#### 重量级锁原理

Java中synchronized的重量级锁，是基于进入和退出Monitor对象实现的。在编译时会将同步块的开始位置插入`monitor enter`指令，在结束位置插入monitor exit指令。

当线程执行到`monitor enter`指令时，会尝试获取对象所对应的Monitor所有权，如果获取到了，即获取到了锁，会在Monitor的owner中存放当前线程的id，这样它将处于锁定状态，除非退出同步块，否则其他线程无法获取到这个Monitor。



### Code演示

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/dd2950cee7514ab1b79927cd8ae8cbd7.png)

### 小总结-面试中的高频考点

#### 锁升级发生后，hashcode去哪了

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/b1f38e7d992149f7b4a99142a172c426.png)

##### 说明

锁升级为轻量级或重量级锁后，Mark Word中保存的分别是**线程栈帧里的锁记录指针**和**重量级锁指针**，己经没有位置再保存哈希码，GC年龄了，那么这些信息被移动到哪里去了呢？

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/274f22fcea7845af9371be3cfb7b2d1a.png)

- 用更加通俗的话解释（四种锁的不同情况）
  - **在无锁状态下**，Mark Word中可以存储对象的identity hash code值。当对象的hashCode()方法第一次被调用时，JVM会生成对应的identity hash code值并将该值存储到Mark Word中。
  - **对于偏向锁**，在线程获取偏向锁时，会用Thread |D和epoch值覆盖identity hash code所在的位置。如果一个对象的hashCode()方法己经被调用过一次之后，这个对象**不能**被设置偏向锁。因为如果可以的化，那Mark Word中的identity hash code必然会被偏向线程Id给覆盖，这就会造成同一个对象前后两次调用hashCode()方法得到的结果不一致。
  - **升级为轻量级锁时**，JVM会在当前线程的栈帧中创建一个**锁记录(Lock Record)**空间，用于存储锁对象的Mark Word拷贝，该拷贝中可以包含identity hash code，所以**轻量级锁可以和identity hash code共存**，哈希码和GC年龄自然保存在此，释放锁后会将这些信息写回到对象头。
  - **升级为重量级锁后**，Mark Word保存的重量级锁指针，代表重量级锁的**ObjectMonitor类**里有字段记录非加锁状态下的**Mark Word**，锁释放后也会将信息写回到对象头。

##### code01

- 当一个对象已经计算过identity hash code，它就无法进入偏向锁状态，跳过偏向锁，直接升级轻量级锁3

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/9386f22fc236434a8dd6da6a72f0f20d.png)

##### code02

- 在偏向锁的状态中遇到一致性哈希计算请求，立马**撤销**偏向模式，**膨胀为重量级锁**

  ![image-20230219192110483](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219192110483.png)

#### 各种锁优缺点、synchronized锁升级和实现原理

![image-20230219192714411](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230219192714411.png)

synchronized锁升级过程总结：**一句话，就是先自旋，不行再阻塞**。

- 实际上是把之前的悲观锁（重量级锁）变成在一定条件下使用偏向锁以及使用轻量级（自旋锁CAS）的形式
- synchronized在修饰方法和代码块在字节码上实现方式有很大差异，但是内部实现还是基于对象头的MarkWord来实现的。
  JDK1.6之前synchronized使用的是重量级锁，**JDK1.6之后进行了优化，拥有了无锁->偏向锁->轻量级锁->重量级锁的升级过程**，而不是无论什么情况都使用重量级锁。
- **偏向锁**：适用于单线程适用的情况，在不存在锁竞争的时候进入同步方法/代码块则使用偏向锁。
- **轻量级锁**：适用于竞争较不激烈的情况(这和乐观锁的使用范围类似)，存在竞争时升级为轻量级锁，轻量级锁采用的是自旋锁，如果
  同步方法/代码块执行时间很短的话，采用轻量级锁虽然会占用cpu资源但是相对比使用重量级锁还是更高效。
- **重量级锁**：适用于竞争激烈的情况，如果同步方法/代码块执行时间很长，那么使用轻量级锁自旋带来的性能消耗就比使用重量级锁更严重，这时候就需要升级为重量级锁。

## JIT编译器对锁的优化

### JIT

Just In Time Compiler，一般翻译为即时编译器

### 锁消除

从JIT角度看相当于无视它，synchronized(o)不存在了，

这个锁对象并没有被共用扩散到其它线程使用，

极端的说就是根本没有加这个锁对象的底层机器码，消除了锁的使用

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/f097ef47c0e14ae09b4639ed6fb6679b.png)

锁消除的主要判定依据来源于**逃逸分析**的数据支持。

### 锁粗化

假如方法中首位相接，前后相邻的都是同一个锁对象，那JIT编译器就会把这几个synchronized块合并成一个大块，

加粗加大范围，一次申请使用即可，避免次次都申请和释放锁，提升了性能

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/4d5b2210ae7345f5a1059ecb7d3a6601.png)

# 错误

轻量锁升级重量锁过程中没有自旋，CAS 失败了之后，**并没有什么自旋操作**，如果 CAS 成功就直接获取轻量锁，如果失败直接锁膨胀为重量锁

实际的自旋操作是在重量锁中

即网上流传的这张图中，轻量锁和重量锁的范围为需要调整如下：

![image-20230315124415451](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230315124415451.png)

[别再和面试官说Synchronized轻量级锁自旋了，错了！_牛客网 (nowcoder.com)](https://www.nowcoder.com/discuss/353157586415460352)

