---
title: AQS原理
date: 2023-03-11 16:51:33
tags: 
- Java
- 并发
- JUC
categories:
- Java
---

# AQS

## 导图

![image-20230224182536690](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224182536690.png)

## 概念

**AbstractQueuedSynchronizer**（抽象的队列同步器，简称**AQS**）

![image-20230224180615349](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224180615349.png)

是用来实现锁或者其它同步器组件的公共基础部分的抽象实现，

**是重量级基础框架及整个JUC体系的基石，主要用于解决锁分配给"谁"的问题**

**文档解释**

![image-20230224181810058](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224181810058.png)

- 为实现阻塞锁和相关的同步器提供一个框架，它是依赖于一个先进先出的等待队列
- 依靠单个原子int值表示状态，通过占用和释放方法，改变状态值

整体就是一个抽象的FIFO**队列**来完成资源获取线程的排队工作，并通过一个**int类变量**表示持有锁的状态

![image-20230224182214727](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224182214727.png)

CLH:Craig、Landin and Hagersten队列，是一个单向链表，AQS中的队列是**CLH变体的虚拟双向队列FIFO**

## JUC的基石 - AQS

![image-20230224182707225](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224182707225.png)

- **`ReentrantLock`**：ReentrantLock 是一次只允许一个线程访问某个资源

  ![image-20230224183335797](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224183335797.png)

- **`CountDownLatch（做加法）`**：CountDownLatch 是一个同步工具类，用来协调多个线程之间的同步。这个工具通常用来控制线程等待，它可以让每一个线程`countDown()`，直到所有线程全部执行结束`await()`，再开始执行。 

  ![image-20230224183355548](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224183355548.png)

- **`CyclicBarrier(循环栅栏|做减法)`**：CyclicBarrier 和 CountDownLatch 非常类似，它也可以实现线程间的技术等待，但是它的功能比 CountDownLatch 更加复杂和强大。主要应用场景和 CountDownLatch 类似。CyclicBarrier 的字面意思是可循环使用（Cyclic）的屏障（Barrier）。它要做的事情是，让一组线程到达一个屏障（也可以叫同步点）时被阻塞，直到最后一个线程到达屏障时，屏障才会开门，所有被屏障拦截的线程才会继续干活。CyclicBarrier 默认的构造方法是 `CyclicBarrier(int parties)`，其参数表示屏障拦截的线程数量，每个线程调用 `await()` 方法告诉 CyclicBarrier 我已经到达了屏障，然后当前线程被阻塞。 

  ![image-20230224183409450](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224183409450.png)

- **`Semaphore(信号量|规定停车位|做限流)`**-**允许多个线程同时访问，因为信号量的数量往往大于1**：synchronized 和 ReentrantLock 都是一次只允许一个线程访问某个资源，Semaphore(信号量)可以指定多个线程同时访问某个资源。

### 锁和同步器的关系

- 锁，面向锁的使用者

- 同步器，面向锁的实现者

  DougLee 提出统一规范并简化了锁的实现，将其**抽象出来**，屏蔽了同步状态管理、同步队列的管理和维护、阻塞线程排队和通知、唤醒机制等，是一切锁和同步组件实现的**公共基础部分**

### 作用

**加锁会导致阻塞**，有阻塞就需要排队，实现排队必然需要队列。

抢到资源的线程直接使用处理业务，抢不到资源的必然涉及一种**排队等候机制**。

抢占资源失败的线程继续去等待（类似银行业务办理窗口都满了，暂时没有受理窗口的顾客只能去候客区排队等候)，但等候线程仍然保留获取锁的可能且获取锁流程仍在继续（候客区的顾客也在等着叫号，轮到了再去受理窗口办理业务)。

既然说到了**排队等候机制**，那么就一定会有某种队列形成，这样的队列是什么数据结构呢？

如果共享资源被占用，**就需要一定的阻塞等待唤醒机制来保证锁分配**。这个机制主要用的是**CLH**队列的变体实现的，将暂时获取不到锁的线程加入到队列中，这个队列就是**AQS**同步队列的抽象表现。它将要请求共享资源的线程及自身的等待状态封装成队列的结点对象(**Node**)，通过**CAS**、自旋以及**LockSupport.park()**的方式，维护**state**变量的状态，使并发达到同步的效果，

![image-20230224185457286](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224185457286.png)

![](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224191040218.png)

![image-20230224190300698](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224190300698.png)

## AQS内部体系架构

![image-20230224191511067](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224191511067.png)

### AQS自身

#### 同步状态State成员变量

![image-20230224191728175](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224191728175.png)

类似于银行处理业务的受理窗口状态：

- 0 即无人，自由状态可办理
- 大于等于1，有人占用窗口，进入等候区

#### CLH队列

为一个双向队列

类似于银行等候区的等待顾客

![image-20230224192144654](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224192144654.png)

### Node内部类

#### 属性说明

```java
static final class Node {

    /** Marker to indicate a node is waiting in shared mode */

    static final Node SHARED = new Node();

    /** Marker to indicate a node is waiting in exclusive mode */

    static final Node EXCLUSIVE = null;

    /** waitStatus value to indicate thread has cancelled */

    /** 线程被取消了 */

    static final int CANCELLED = 1;

    /** waitStatus value to indicate successor's thread needs unparking */

    /** 后续线程需要唤醒 */

    static final int SIGNAL = -1;

    /** waitStatus value to indicate thread is waiting on condition */

    /** 等待condition唤醒 */

    static final int CONDITION = -2;

    /** waitStatus value to indicate the next acquireShared should unconditionally propagate */

    /** 共享式同步状态获取将会无条件的传播下去 */

    static final int PROPAGATE = -3;

    //初始为0，状态就是以上几种

    volatile int waitStatus;

    volatile Node prev;

    volatile Node next;

    /** The thread that enqueued this node. Initialized on construction and nulled out after use. */

    volatile Thread thread;

    /**

* Link to next node waiting on condition, or the special

* value SHARED. Because condition queues are accessed only

* when holding in exclusive mode, we just need a simple

* linked queue to hold nodes while they are waiting on

* conditions. They are then transferred to the queue to

* re-acquire. And because conditions can only be exclusive,

* we save a field by using special value to indicate shared

* mode.

*/

    Node nextWaiter;

    /**

* Returns true if node is waiting in shared mode.

*/

    final boolean isShared() {

        return nextWaiter == SHARED;

    }

    /**

* Returns previous node, or throws NullPointerException if null.

* Use when predecessor cannot be null. The null check could

* be elided, but is present to help the VM.

*

* @return the predecessor of this node

*/

    final Node predecessor() throws NullPointerException {

        Node p = prev;

        if (p == null)

            throw new NullPointerException();

        else

            return p;

    }

    Node() { // Used to establish initial head or SHARED marker

    }

    Node(Thread thread, Node mode) { // Used by addWaiter

        this.nextWaiter = mode;

        this.thread = thread;

    }

    Node(Thread thread, int waitStatus) { // Used by Condition

        this.waitStatus = waitStatus;

        this.thread = thread;

    }

}
```

![image-20230224192926295](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224192926295.png)

**java17**

![image-20230224193228346](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224193228346.png)

## ReentrantLock底层源码

### 尝试获取锁

Lock接口的实现类，基本都是通过**聚合**了一个**队列同步器**的子类完成线程访问控制的

![image-20230224205722652](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230224205722652.png)

**构造方法**

![image-20230309160330639](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309160330639.png)

#### **lock()**

- **ReentrantLock$lock()**

  ![image-20230309160521697](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309160521697.png)

- **Sync$lock()**

  ![image-20230309160708634](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309160708634.png)

  - **NonfairSync$lock()**

    ![image-20230309160736934](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309160736934.png)

  - **FairSync$lock()**

    ![image-20230309160920892](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309160920892.png)

#### 公平和非公平

![image-20230309161149103](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309161149103.png)

![image-20230309162536480](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309162536480.png)

采用了**模板方法设计模式**

hasQueuedPredecessors()中判断了是否需要排队，导致公平锁和非公平锁的差异如下：

- **公平锁**：公平锁讲究先来先到，线程在获取锁时，如果这个锁的等待队列中己经有线程在等待，那么当前线程就会进入等待队列中；
- **非公平锁**：不管是否有等待队列，如果可以获取锁，则立刻占有锁对象。也就是说队列的第一个排队线程苏醒后，不一定就是排头的这个线程获得锁，它还是需要参加竞争锁（存在线程竞争的情况下），后来的线程可能不讲武德插队夺锁了。

#### acquire()

![image-20230309173758734](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309173758734.png)

以非公平锁为例：

![image-20230309173908366](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309173908366.png)

- NonfairSync若state=0，没人占锁，直接CAS修改状态位state，然后当前线程占锁`setExclusiveOwnerThread(Thread.currentThread())`
- 否则，NonfairSync的方法acquire去尝试获得锁，分三步`tryAcquire`|`addWaiter`|`acquireQueued`

#### 

##### tryAcquire

![image-20230309180557277](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309180557277.png)

- 先获取当前同步状态
  - 若为0，则无占用线程，当前线程CAS修改state，成功则设置当前线程为独占线程
  - 若为1，则被占用。判断当前线程是否是该独占线程，若是则添加重入次数并设置state
- 若不是返回false，继续执行addWaiter()方法

##### addWaiter

创建并入队由当前线程和给定模式（这里是排他）组成的结点

![image-20230309182000518](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309182000518.png)

**enq()**

先设置一个虚拟结点（哨兵结点），然后将头尾指针指向它

然后将新结点设置完后返回该结点

双向链表中，**第一个节点为虚节点（也叫哨兵节点）**，其实并不存储任何信息，只是占位。

真正的第一个有数据的节点，是从第二个节点开始的。

![image-20230309184750665](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309184750665.png)

![image-20230309184811415](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309184811415.png)



##### acquireQueued

acquireQueued当中`for (;;) {...}`这是个大的**自旋** 

自旋当中会调用如下方法：`shouldParkAterFailedAcquire`和`parkAndCheckInterrupt`

![image-20230309184353808](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309184353808.png)

###### shouldParkAterFailedAcquire

如果前驱节点的 waitStatus是**SIGNAL**状态，即 `shouldParkAfterFailedAcquire`方法会返回 true程序会继续向下执行`parkAndCheckInterrupt`方法，用于将当前线程挂起

![image-20230309184919921](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309184919921.png)



###### parkAndCheckInterrupt

![image-20230309192218477](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309192218477.png)

![image-20230309185002159](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309185002159.png)

### 唤醒阻塞线程

![image-20230309204626026](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309204626026.png)

#### release

![image-20230309204647554](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309204647554.png)

![image-20230310124612566](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230310124612566.png)

#### tryRelease

![image-20230309204705392](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309204705392.png)

![image-20230309204727333](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309204727333.png)

![](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230310130212836.png)

#### unparkSuccessor

![image-20230309204756293](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230309204756293.png)

这段代码执行完毕后,之前的哨兵节点和B节点的waitStatus从原来的-1变成0

B、C线程获取到Permit

#### acquireQueued

**setHead**

![image-20230310130603998](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230310130603998.png)

③代码执行完毕后,会出现如下图所示

![image-20230310130651593](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230310130651593.png)

原有的傀儡节点离开，有助于GC

线程B真正的执行业务去了，留下了线程B的空壳节点成为新的傀儡节点

### cancelAcquire

![image-20230310130955623](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230310130955623.png)

**初始情况**

![image-20230310131215208](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230310131215208.png)

- 例要删除队尾节点5

  若节点4的`waitStatus != CANCELLED` ，则pre = 节点4，tail = 节点4

  ![image-20230310131916466](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230310131916466.png)

## 总结

整个ReentrantLock的加锁过程，可以分为三个阶段：

1. 尝试加锁，
2. 加锁失败，线程入队列：
3. 线程入队列后，进入阻塞状态。

- **`lock() - > acquire -> tryAcquire -> addWaiter`**

![image-20230310143904559](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230310143904559.png)

- **addWaiter**

  ![image-20230310144010389](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230310144010389.png)

- **acquireQueued**

  ![image-20230310144045718](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230310144045718.png)

  ![image-20230310144107224](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230310144107224.png)

