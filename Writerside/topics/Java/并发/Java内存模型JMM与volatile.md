---
title: Java内存模型JMM与volatile
date: 2023-02-18 16:51:33
tags: 
- Java
- 并发
- JUC
categories:
- Java
---


# Java内存模型之JMM

## 大厂面试题

- 你知道什么是Java内存模型JMM吗？
- JMM与volatile它们两个之间的关系？（下一章详细讲解）
- JMM有哪些特性or它的三大特性是什么？
- 为什么要有JMM，它为什么出现？作用和功能是什么？
- happens-before先行发生原则你有了解过吗？

## 计算机硬件存储体系

计算机存储结构，从本地磁盘到主存到CPU缓存，也就是从硬盘到内存，到CPU。
一般对应的程序的操作就是从数据库查数据到内存然后到CPU进行计算

![image-20230216135411110](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216135411110.png)

因为有这么多级的缓存(cpu和物理主内存的速度不一致的)，
CPU的运行**并不是直接操作内存而是先把内存里边的数据读到缓存**，而内存的读和写操作的时候就会造成不一致的问题

![](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216135351842.png)

Java虚拟机规范中试图定义一种**Java内存模型（java Memory Model，简称JMM)** 来**屏蔽掉各种硬件和操作系统的内存访问差异**，
以实现让Java程序在各种平台下都能达到一致的**内存访问效果**。推导出我们需要知道JMM

## Java内存模型Java Memory Model

- JMM

  JMM(Java内存模型Java Memory Model，简称JMM)本身是一种**抽象的**概念**并不真实存在**它**仅仅描述的是一组约定或规范**，通过这组规范定义了程序中(尤其是多线程)各个变量的读写访问方式并决定一个线程对共享变量的写入何时以及如何变成对另一个线程可见，关键技术点都是围绕多线程的**原子性**、**可见性**和**有序性**展开的。

- 原则：
  JMM的关键技术点都是围绕多线程的**原子性**、**可见性**和**有序性**展开的

- 能干嘛？

  - 通过JMM来实现**线程和主内存之间的抽象关系**。
  - 屏蔽各个**硬件平台**和**操作系统**的内存访问差异以实现让Java程序在各种平台下都能达到一致的内存访问效果。

## JMM规范下，三大特性

### **原子性**

- 指一个操作是不可中断的，即多线程环境下，操作不能被其他线程干扰

### **可见性**

- **可见性**

  - **是指当一个线程修改了某一个共享变量的值，其他线程是否能够立即知道该变更** ，JMM规定了所有的变量都存储在**主内存**中。

  ![image-20230216140749127](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216140749127.png)

- Java中普通的共享变量不保证**可见性**，因为**共享变量**数据修改被写入内存的时机是不确定的，**多线程并发下很可能出现"脏读"**

  所以每个线程都有自己的**工作内存**，线程自己的工作内存中保存了该线程使用到的变量的**主内存副本拷贝**，线程对变量的所有操作（读取，赋值等 ）都必需在线程自己的工作内存中进行，而不能够直接读写主内存中的变量。

  不同线程之间也无法直接访问对方工作内存中的变量，**线程间变量值的传递均需要通过主内存来完成**

![image-20230216141647206](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216141647206.png)

- JMM在可见性前提下线程对主内存的读取共享变量的**流程**

  1. 读取主内存中的共享变量
  2. 读到自己线程的本地内存中形成共享变量的副本
  3. 自己修改完后再**写回**到主内存

  这个线程修改完后能让其他线程立刻知道该变更的性质就叫可见性

- 如果没有保证**可见性**

  - 导致**线程脏读**
  - 例子

    - 主内存中有变量 x，初始值为 0
    - 线程 A 要将 x 加 1，先将 x=0 拷贝到自己的私有内存中，然后更新 x 的值
    - 线程 A 将更新后的 x 值回刷到主内存的时间是不固定的
    - 刚好在线程 A 没有回刷 x 到主内存时，线程 B 同样从主内存中读取 x，此时为 0，和线程 A 一样的操作，最后期盼的 x=2 就会变成 x=1

### **有序性**

- **有序性**牵扯到指令
- 这里给一个案例

```java
public void mySort()
{
    int x = 11; //语句1
    int y = 12; //语句2
    x = x + 5;  //语句3
    y = x * x;  //语句4
}
 
  1234
  2134
  1324
 
问题：请问语句4可以重排后变成第一个条吗？
```

- **有序性**是什么？

  对于一个线程的执行代码而言，我们总是习惯性认为代码的执行总是从上到下，有序执行。但为了提供性能，编译器和处理器通常会对指令序列进行重新排序。Java规范规定JVM线程内部维持**顺序化语义**，即只要程序的最终结果与它顺序化执行的结果**相等**，那么指令的执行顺序可以与代码顺序**不一致**，此过程叫指令的**重排序**。

- 优缺点

  JVM能根据处理器特性（CPU多级缓存系统、多核处理器等）适当的机器对指令进行重排序，使得机器指令能更符合CPU的执行特性，最大限度的发挥机器性能。

  但是，指令重排**可以保证串行语义一致**，但**没有义务保证多线程间的语义也一致**（即可能产生“**脏读**”），简单说，两行以上不相干的代码在执行的时候有可能先执行的不是第一条，不见得是从上到下顺序执行，执行顺序会被优化。

- 指令重排的三种表现（层面）

  - 编译器优化的重排
  - 指令并行的重排
  - 内存系统的重排

![image-20230216145649644](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216145649644.png)

- 小总结

  - **单线程**环境里面确保程序最终执行结果和代码顺序执行的**结果一致**。

    处理器在进行重排序时必须要考虑指令之间的**数据依赖性**

  - **多线程**环境中线程交替执行,由于编译器优化重排的存在，两个线程中使用的变量能否保证一致性是**无法确定的,结果无法预测**

## JMM规范下，多线程对变量的读写过程

- 读取过程

  - 由于JVM运行程序的实体是线程，而每个线程创建时JVM都会为其创建一个**工作内存**(有些地方称为**栈空间**，具体可看JVM虚拟机栈)，工作内存是每个线程的私有数据区域，而Java内存模型中规定**所有变量都存储在主内存**，主内存是共享内存区域，所有线程都可以访问

  - 但线程对变量的操作(读取赋值等)必须在工作内存中进行

    - 首先要将变量从主内存拷贝到的线程自己的工作内存空间
    - 然后对变量进行操作
    - 操作完成后再将变量写回主内存，不能直接操作主内存中的变量

  - 各个线程中的工作内存中存储着主内存中的**变量副本拷贝**，因此不同的线程间无法访问对方的工作内存，线程间的通信(传值)必须通过主内存来完成，其简要访问过程如下图

    ![image-20230216150731276](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216150731276.png)

- **JMM定义了线程和主内存之间的抽象关系**
  - 线程之间的共享变量存储在**主内存**中(从硬件角度来说就是内存条)
  - 每个线程都有一个私有的本地工作内存，本地**工作内存**中存储了该线程用来读/写共享变量的副本(从硬件角度来说就是CPU的缓存，比如寄存器、L1、L2、L3缓存等)
- 小总结

  - 我们定义的所有共享变量都存储在**物理主内存**中
  - 每个线程都有自己独立的工作内存，里面保存该线程使用到的变量的副本（主内存中该变量的一份拷贝）
  - 线程对共享变量所有的操作都必须先在线程自己的工作内存中进行后写回主内存，不能直接从主内存中读写（不能越级）
  - 不同线程之间也无法直接访问其他线程的工作内存中的变量，线程间变量值的传递需要通过主内存来进行（同级不能相互访问）

## JMM规范下，多线程先行发生原则之happens-before

### 引入happens-before

- 本章最晦涩难懂的知识
- **happens-before**先行发生原则
  - 在JMM中，如果一个操作执行的结果需要对另一个操作**可见性**或者代码重新排序，那么这两个操作之间必须存在happens-before（先行发生）原则。逻辑上的**先后关系**。
- x,y案例说明
  - x=5;线程A执行
  - y=x;线程B执行
  - 问：y一定等于5吗？
  - 答：不一定

    - 如果线程A的操作（x= 5）happens-before(先行发生)线程B的操作（y = x）,那么可以确定线程B执行后y = 5 一定成立;
    - 如果他们不存在happens-before原则，那么y = 5 不一定成立。
    - 是happens-before原则的威力。-------------------》包含**可见性**和**有序性**的约束
- 先行发生原则(**happens-before**)被定义在了JMM之中

  - 如果Java内存模型中所有的**有序性**都仅靠volatile和synchronized来完成，那么有很多操作都将会变得非常啰嗦，
  - 但是我们在编写Java并发代码的时候并没有察觉到这一点。
  - 我们没有**时时、处处、次次**，添加**volatile**和**synchronized**来完成程序，这是因为Java语言中JMM原则下
  - 有一个**“先行发生”(Happens-Before)的原则限制和规矩**
  - 这个原则非常重要：
  - 它是判断数据是否存在竞争，线程是否安全的非常有用的手段。依赖这个原则，我们可以通过几条简单规则一揽子**解决并发环境下两个操作之间是否可能存在冲突的所有问题**，而不需要陷入Java内存模型苦涩难懂的底层编译原理之中。
    
    

### happens-before总原则

- **happens-before**总原则
  - 如果一个操作**happens-before**另一个操作，那么第一个操作的执行结果将对第二个操作**可见**，而且第一个操作的执行顺序排在第二个操作之前。
  - 两个操作之间存在**happens-before**关系，并不一定要按照happens-before原则制定的顺序来执行。如果重排序之后的执行结果与按照happens-before关系来执行的**结果一致**，那么这种重排序**并不非法**。

### happens-before8条

> JMM存在的**天然存在**的`happens-before` 关系，8条

`happens-before`8条

1. **次序规则**：**一个线程内**，按照代码顺序，写在前面的操作先行发生于写在后面的操作。

2. **锁定规则**：锁的获取的先后顺序

   - 一个`unLock`操作先行发生于后面（这里的后面是指时间上的先后）对同一个锁的`lock`操作（一个线程想要lock,肯定要等前面的锁`unLock`释放这个资源）

     ```java
     public class HappenBeforeDemo
     {
         static Object objectLock = new Object();
     
         public static void main(String[] args) throws InterruptedException
         {
             //对于同一把锁objectLock，threadA一定先unlock同一把锁后B才能获得该锁，   A 先行发生于B
             synchronized (objectLock)
             {
     
             }
         }
     }
     ```

3. **volatile变量规则**

   对一个volatile变量的读写操作先行发生于后面对这个变量的读操作，**前面的写对后面的读是可见的**，这里的后面同样是指时间上的先后。

4. **传递规则**

   如果操作A先行发生于操作B，而操作B又先行发生于操作C，则可以得出操作A先行发生于操作C

5. **线程启动规则**(Thread Start Rule)

   Thread对象的**`start()`**方法先行发生于此线程的每一个动作

   ```java
   Thread t1 = new Thread(()->{
    System.out.println("----hello thread")//后执行
   },"t1");
   t1.start();//-------------------先执行
   ```

6. **线程中断规则**(Thread Interruption Rule)

   对线程interrupt()方法的调用先行发生于被中断线程的代码检测到中断事件的发生；可以通过Thread.interrupted()检测到是否发生中断。

   也就是说你要先调用了**`interrupt()`**方法设置过中断标志位，我才能检测到中断发送。

7. **线程终止规则**(Thread Termination Rule)

   线程中的所有操作都先行发生于对此线程的终止检测，我们可以通过**`isAlive()`**等手段检测线程是否已经终止执行。

8. **对象终结规则**(Finalizer Rule)

   一个对象的初始化完成（构造函数执行结束）先行发生于它的finalize()方法的开始

   finalize的通常目的是在对象被不可撤销的丢弃之前执行**清理操作**。

### happens-before案例说明

- 案例

  ```java
  public class TestDemo
  {
    private int value = 0;
    public int getValue(){
        return value; 
    }
    public  int setValue(){
        return ++value;
    }
  }
  ```

- 问：假设存在线程A和B，线程A先（时间上的先后）调用了setValue()，然后线程B调用了同一个对象的getValue()，那么线程B收到的返回值是什么？是0还是1？

- 答：不一定

  我们就这段简单的代码一次分析happens-before的规则（规则5、6、7、8 可以忽略，因为他们和这段代码毫无关系）：

  由于两个方法是由不同的线程调用，不在同一个线程中，所以肯定不满足程序次序规则；

  两个方法都没有使用锁，所以不满足锁定规则；

  变量不是用volatile修饰的，所以volatile变量规则不满足；

  传递规则肯定不满足；

- 所以我们无法通过happens-before原则推导出线程A happens-before线程B，虽然可以确认在时间上线程A优先于线程B指定，
  但就是无法确认线程B获得的结果是什么，所以这段代码不是线程安全的。那么怎么修复这段代码呢？

- **修复**

  ```java
  //1
  public class TestDemo
  {
    private int value = 0;
    public synchronized int getValue(){
        return value; 
    }
    public synchronized int setValue(){
        return ++value;
    }
  }
  //synchronized太猛了，降低太多的效率
  ```

  ```java
  //2
  public class TestDemo
  {
    private int value = 0;
    public synchronized int getValue(){
        return value; 
    }
    public synchronized int setValue(){
        return ++value;
    }
  }
  //把value定义为volatile变量，由于setter方法对value的修改不依赖value的值，满足volatile关键字使用场景
  //理由：利用volatile保证读取操作的可见性；利用synchronized保证复合操作的原子性结合使用锁和volatile变量来减少同步的开销。
  ```

  

------

# volatile与Java内存模型

## 被volatile修改的变量有2大特点

### 特点

可以保证

- **可见性**
- **有序性**

还是那张图，volatile只能保证可见性和有序性

![image-20230216183417754](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216183417754.png)

- 那为什么volatile可以实现这些功能呢？

底层就是**内存屏障**（面试必问）

### volatile的内存语义

当写一个volatile变量时，JMM会把该线程对应的本地内存中的共享变量**立即刷新回到主内存**中。

当读一个volatile变量时，JMM会把该线程对应的工作内存设置为无效，直接从主内存中读取共享变量。

所以volatile的写内存语义是直接刷新到主内存中，读的内存语义是直接从主内存中读取。

> 一句话，volatile修饰的变量在某个工作内存修改后立刻会刷新回主内存，并把其他工作内存的该变量设置为无效



## 内存屏障（面试重点）

### 生活case

没有管控，顺序难保

设定规则，禁止乱序

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/5f494a104f504523887be205ac4f3d14.png)

- 回忆一下volatile两大特性

- 可见性

  立即刷新回主内存+失效处理。

- 有序性

  禁止指令重排：存在**数据依赖关系**的禁止重排。



### 是什么

**内存屏障**（也称内存栅栏，内存栅障，屏障指令等，是一类同步屏障指令，是CPU或编译器在对内存随机访问的操作中的一个同步点，使得此点之前的所有读写操作都执行后才可以开始执行此点之后的操作），避免代码重排序。内存屏障其实就是一种JVM指令，Java内存模型的重排规则会**要求Java编译器在生成JVM指令时插入特定的内存屏障指令** ，通过这些内存屏障指令，volatile实现了Java内存模型中的可见性和有序性，**但volatile无法保证原子性** 。

- **内存屏障之前**的所有**写操作**都要**回写到主内存**，
- **内存屏障之后**的所有**读操作**都能获得内存屏障之前的所有写操作的最新结果(实现了可见性)。
- **写屏障(Store Memory Barrier)** ：告诉处理器在写屏障之前将所有存储在缓存(store buffer es) 中的数据同步到主内存。也就是说当看到Store屏障指令， 就必须把该指令之前所有写入指令执行完毕才能继续往下执行。
- **读屏障(Load Memory Barrier)** ：处理器在读屏障之后的读操作， 都在读屏障之后执行。也就是说在Load屏障指令之后就能够保证后面的读取数据指令一定能够读取到最新的数据。
  ![image-20230216184237056](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216184237056.png)

因此重排序时，不允许把内存屏障之后的指令重排序到内存屏障之前。
一句话：对一个 volatile 域的写, happens-before于任意后续对这个 volatile 域的读，也叫**写后读**。

### 内存屏障分类

#### 一句话

- 上一章讲解过happens-before先行发生原则，类似接口规范，落地？

落地靠什么？你凭什么可以保证？你管用吗？

#### 粗分两种

- 写屏障

  在写指令之后插入写屏障，强制把写缓冲区的数据刷回到主内存中

- 读屏障

  在读指令之前插入读屏障，让工作内存或CPU高速缓存当中的缓存数据失效，重新回到主内存中获取最新数据。

#### 细分4种

源码分析

Unsafe.class

![image-20230216195112334](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216195112334.png)

```c++
//unsafe.cpp

UNSAFE_ENTRY(void, Unsafe_LoadFence(JNIEnv* env, jobject unsafe))//读屏障
  UnsafeWrapper("Unsafe_LoadFence");
  OrderAccess::acquire();
UNSAFE_END

UNSAFE_ENTRY(void, Unsafe_StoreFence(JNIEnv* env, jobject unsafe))//写屏障
  UnsafeWrapper("Unsafe_StoreFence");
  OrderAccess::release();
UNSAFE_END

UNSAFE_ENTRY(void, Unsafe_FullFence(JNIEnv* env, jobject unsafe))
  UnsafeWrapper("Unsafe_FullFence");
  OrderAccess::fence();
UNSAFE_END
```

```c++
//OrderAccess.hpp
class OrderAccess : AllStatic {
 public:
  static void     loadload();//读读
  static void     storestore();//写写
  static void     loadstore();//读写
  static void     storeload();//写读

  static void     acquire();
  static void     release();
  static void     fence();
```

```c++
//orderAccess_linux_x86
inline void OrderAccess::loadload()   { acquire(); }
inline void OrderAccess::storestore() { release(); }
inline void OrderAccess::loadstore()  { acquire(); }
inline void OrderAccess::storeload()  { fence(); }

inline void OrderAccess::acquire() {
  volatile intptr_t local_dummy;
#ifdef AMD64
  __asm__ volatile ("movq 0(%%rsp), %0" : "=r" (local_dummy) : : "memory");
#else__
  asm__ volatile ("movl 0(%%esp),%0" : "=r" (local_dummy) : : "memory");
#endif // AMD64
}
```

#### 4种屏障

![image-20230216193054400](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216193054400.png)

### 需要分2次讲解+复习的内容

#### 什么叫保证有序性

- 禁止指令重排

通过内存屏障禁止重排

1.  重排序有可能影响程序的执行和实现， 因此， 我们有时候希望告诉JVM你别“自作聪明”给我重排序， 我这里不需要排序， 听主人的。

2.  对于编译器的重排序， JMM会根据重排序的规则， 禁止特定类型的编译器重排序。

3.  对于处理器的重排序， Java编译器在生成指令序列的适当位置， **插入内存屏障指令， 来禁止特定类型的处理器排序**。

#### happens-before之volatile变量规则

![image-20230216195153560](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216195153560.png)

- 当第一个操作为volatile读时，不论第二个操作是什么，都不能重排序。这个操作保证了volatile**读之后**的操作不会被重排到volatile读之前。
- 当第二个操作为volatile写时，不论第一个操作是什么，都不能重排序。这个操作保证了volatile**写之前**的操作不会被重排到volatile写之后。
- 当第一个操作为volatile写时，第二个操作为volatile读时，不能重排。

#### JMM就将内存屏障插入策略分为4种规则

##### 读屏障

- 在每个`volatile读`操作的**后面**插入一个`LoadLoad`屏障

- 在每个`volatile读`操作的**后面**插入一个`LoadStore`屏障

  volatile读要在其之后的读写

![image-20230216200347713](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216200347713.png)

##### 写屏障

- 在每个`volatile写`操作的**前面**插入一个`StoreStore`屏障

- 在每个`volatile写`操作的**后面**插入一个`StoreLoad`屏障

  volatile写之前要保证其他的写操作已经完成，并且要在之后的读写操作前完成

![image-20230216201118719](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216201118719.png)

##### 对比图

![image-20230216193054400](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216193054400.png)

## volatile特性

### 保证可见性

#### 说明

保证不同线程对某个变量完成操作后结果及时可见，即该共享变量一旦改变所有线程立即可见。

#### Code

```java
public class VolatileSeeDemo
{
    //static  boolean flag = true;       //不加volatile，没有可见性
    static volatile boolean flag = true;       //加了volatile，保证可见性

    public static void main(String[] args)
    {
        new Thread(() -> {
            System.out.println(Thread.currentThread().getName()+"\t come in");
            while (flag)//默认flag是true,如果未被修改就一直循环，下面那句话也打不出来
            {

            }
            System.out.println(Thread.currentThread().getName()+"\t flag被修改为false,退出.....");
        },"t1").start();

        //暂停几秒
        try { TimeUnit.SECONDS.sleep(2); } catch (InterruptedException e) { e.printStackTrace(); }

        flag = false;

        System.out.println("main线程修改完成");
    }
}
//没有volatile时
//t1   come in
//main线程修改完成
//--------程序一直在跑（在循环里）

//有volatile时
//t1   come in
//main线程修改完成
//t1   flag被修改为false,退出.....
```



#### 上述代码原理解释

线程t1中为何看不到被主线程main修改为false的flag的值？

问题可能:

- 主线程修改了flag之后没有将其刷新到主内存，所以t1线程看不到。
- 主线程将flag刷新到了主内存，但是t1一直读取的是自己工作内存中flag的值，没有去主内存中更新获取flag最新的值。

我们的诉求：

- 线程中修改了工作内存中的副本之后，立即将其刷新到主内存；
- 工作内存中每次读取共享变量时，都去主内存中重新读取，然后拷贝到工作内存。

解决：

使用volatile修饰共享变量，就可以达到上面的效果，被volatile修改的变量有以下特点：

- 线程中读取的时候，每次读取都会去主内存中读取共享变量最新的值 ，然后将其复制到工作内存
- 线程中修改了工作内存中变量的副本，修改之后会立即刷新到主内存

#### volatile变量的读写过

原理一层层剖析：现象—失效/立刻刷新—内存屏障—缓存一致性协议/总线嗅探

![image-20230216204659684](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216204659684.png)

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/f5fef8c6fdb142068eacf958314af972.png)

- **read**: 作用于**主内存**，将变量的值从主内存传输到工作内存，主内存到工作内存
- **load**: 作用于**工作内存**，将read从主内存传输的变量值放入工作内存变量副本中，即数据加载
- **use**: 作用于**工作内存**，将工作内存变量副本的值传递给执行引擎，每当JVM遇到需要该变量的字节码指令时会执行该操作
- **assign**: 作用于**工作内存**，将从执行引擎接收到的值赋值给工作内存变量，每当JVM遇到一个给变量赋值字节码指令时会执行该操作
- **store**: 作用于**工作内存**，将赋值完毕的工作变量的值写回给主内存
- **write**: 作用于**主内存**，将store传输过来的变量值赋值给主内存中的变量

由于上述6条只能保证单条指令的原子性，针对多条指令的组合性原子保证，没有大面积加锁，所以，JVM提供了另外两个原子指令：

- lock: 作用于**主内存**，将一个变量标记为一个线程独占的状态，只是写时候加锁，就只是锁了写变量的过程。
- unlock: 作用于**主内存**，把一个处于锁定状态的变量释放，然后才能被其他线程占用

### 没有原子性

#### volatile变量的复合操作不具有原子性，比如number++

#### Code

- `synchronized`和`volatile`代码演示

  ```java
  class MyNumber
  {
      //volatile int number = 0;
  
      int number = 0;
      public synchronized void addPlusPlus()//加上synchronized
      {
          number++;
      }
  }
  
  public class VolatileNoAtomicDemo
  {
      public static void main(String[] args) throws InterruptedException
      {
          MyNumber myNumber = new MyNumber();
  
          for (int i = 1; i <=10; i++) {
              new Thread(() -> {
                  for (int j = 1; j <= 1000; j++) {
                      myNumber.addPlusPlus();
                  }
              },String.valueOf(i)).start();
          }
  
          //暂停几秒钟线程
          try { TimeUnit.SECONDS.sleep(3); } catch (InterruptedException e) { e.printStackTrace(); }
          System.out.println(Thread.currentThread().getName() + "\t" + myNumber.number);
      }
  }
  //-------------volatile情况下
  //main  8302
  //-----------synchronized请款下
  //main  10000
  ```

##### 读取赋值一个普通变量的情况

当线程1对主内存对象发起read操作到write操作第一套流程的时间里，线程2随时都有可能对这个主内存对象发起第二套操作

各忙各的

![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/04ba7f8046174584b8ecdef50332484a.png)

##### 不保证原子性

- 从底层来说，i++或者number++（在执行引擎操作时）其实是分了三步的：*数据加载* 、*数据计算* 、*数据赋值* *。而这三步非原子操作* 。

![image-20230216210003733](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216210003733.png)

- 对于volatile变量具备可见性 ，JVM只是保证从主内存加载到线程工作内存的值是最新的，也**仅是数据加载时是最新的**。
- 但是多线程环境下，“数据计算”和“数据赋值”操作可能多次出现，若数据在加载之后，若主内存volatile修饰变量发生修改之后，**线程工作内存中的操作将会作废**去读主内存最新值，操作出现**写丢失**问题。即**各线程私有内存和主内存公共内存中变量不同步** ，进而导致数据不一致。
- 由此可见volatile解决的是变量读取时的可见性问题，但**无法保证原子性，对于多线程修改主内存共享变量的场景必须使用加锁同步**。

> 比如说你在计算的时候，别的线程已经提交了，所以你的计算直接失效了

再分析下

synchronized加了之后保证了串行执行，每次只有一个线程进来。

![image-20230216211135470](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216211135470.png)

但volatile不能保证原子性，大家一起读，一起加一，就看谁提交的快了。提交快的直接让另一个失效。

![image-20230216211222162](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216211222162.png)



##### 从i++的字节码角度说明

![image-20230216211453022](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216211453022.png)

原子性指的是一个操作是**不可中断**的，即使是在多线程环境下，一个操作一旦开始就不会被其他线程影响。

```java
public void add()
{
    i++; //不具备原子性，该操作是先读取值，然后写回一个新值，相当于原来的值加上1，分3步完成
}
```

**如果第二个线程在第一个线程读取旧值和写回新值期间读取i的域值**，那么第二个线程就会与第一个线程一起看到同一个值，

并执行相同值的加1操作，这也就造成了线程安全失败，因此对于add方法必须使用synchronized修饰，以便保证线程安全.

#### 结论

- **volatile不适合参与到依赖当前值的运算**，如i=i+1，i++之类的

那么依靠可见性的特点volatile可以用在哪些地方呢？***通常volatile用作保存某个状态的boolean值或or int值**。* *（一旦布尔值被改变迅速被看到，就可以做其他操作）*

![image-20230216211651358](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216211651358.png)

#### 面试回答

对于volatile变量，JVM只是保证从主内存加载到线程工作内存的值是最新的，也只是数据加载时是最新的。如果第二个线程在第一个线程**读取旧值**和**写回新值期**间读取i的阈值，也就造成了线程安全问题。

（中间这个**蓝色框**代表的是在执行引擎操作期间）

![image-20230216213727203](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216213727203.png)

------

### 禁止指令重排

### 说明与案例

**重排序**

重排序是指编译器和处理器为了优化程序性能而对指令序列进行重新排序的一种手段，有时候会改变程序语句的先后顺序

- 不存在数据依赖关系，可以重排序；
- **存在数据依赖关系 ，禁止重排序**

但重排后的指令绝对不能改变原有的串行语义！这点在并发设计中必须要重点考虑！

重排序的分类和执行流程

![image-20230216214004593](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216214004593.png)

- 编译器优化的重排序： 编译器在不改变单线程串行语义的前提下，可以重新调整指令的执行顺序
- 指令级并行的重排序： 处理器使用指令级并行技术来讲多条指令重叠执行，若不存在数据依赖性，处理器可以改变语句对应机器指令的执行顺序
- 内存系统的重排序： 由于处理器使用缓存和读/写缓冲区，这使得加载和存储操作看上去可能是乱序执行

**数据依赖性** ：若两个操作访问同一变量，且这两个操作中有一个为写操作，此时两操作间就存在数据依赖性。

案例

- **不存在**数据依赖关系，可以重排序 ===> 重排序OK 。

  ![image-20230216214246821](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216214246821.png)

- **存在**数据依赖关系，**禁止重排序**===> 重排序发生，会导致程序运行结果不同。

编译器和处理器在重排序时，会遵守数据依赖性，不会改变存在依赖关系的两个操作的执行,但不同处理器和不同线程之间的数据性不会被编译器和处理器考虑，其只会作用于**单处理器**和**单线程**环境，下面三种情况，只要重排序两个操作的执行顺序，程序的执行结果可能就会被改变。
![image-20230216215152934](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216215152934.png)

#### volatile的底层实现是通过内存屏障，2次复习

- volatile有关的禁止指令重排的行为

  - volatile读保证读到的是最新值
  - volatile写保证目前写的是最新值

  ![image-20230216215422091](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216215422091.png)

- 四大屏障的插入情况

  ![image-20230216215548149](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216215548149.png)

- 案例

  ```java
  public class VolatileTest {
      int i = 0;
      volatile boolean flag = false;
      public void write(){
          i = 2;//假如不加volatile，这两句话的顺序就有可能颠倒，影像最终结果
          flag = true;
      }
      public void read(){
          if(flag){
              System.out.println("---i = " + i);
          }
      }
  }
  ```

- volatile写

  ![image-20230216215734400](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216215734400.png)

- volatile读（必须要先确保拿到最新值）

  ![image-20230216215919524](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216215919524.png)

------

## 如何正确使用volatile（实际工作）

### 单一赋值可以，但是含有符合运算赋值不可以（比如i++）

- 下面这两个单一赋值可以的

volatile int a = 10;

volatile boolean flag = false

### 状态标志，判断业务是否结束

```java
//这个前面讲过
public class UseVolatileDemo
{
    private volatile static boolean flag = true;

    public static void main(String[] args)
    {
        new Thread(() -> {
            while(flag) {
                //do something......循环
            }
        },"t1").start();

        //暂停几秒钟线程
        try { TimeUnit.SECONDS.sleep(2L); } catch (InterruptedException e) { e.printStackTrace(); }

        new Thread(() -> {
            flag = false;
        },"t2").start();
    }
}
```

### 开销较低的读，写锁策略

当读远多于写

最土的方法就是加两个synchronized，但是读用volatile，写用synchronized可以提高性能

```java
public class UseVolatileDemo
{
    //
    // 使用：当读远多于写，结合使用内部锁和 volatile 变量来减少同步的开销
    // 理由：利用volatile保证读取操作的可见性；利用synchronized保证复合操作的原子性

    public class Counter
    {
        private volatile int value;

        public int getValue()
        {
            return value;   //利用volatile保证读取操作的可见性
        }
        public synchronized int increment()
        {
            return value++; //利用synchronized保证复合操作的原子性
        }
    }
}
```

### DCL双锁案例

```java
public class SafeDoubleCheckSingleton
{
    private static SafeDoubleCheckSingleton singleton; //-----这里没加volatile
    //私有化构造方法
    private SafeDoubleCheckSingleton(){
    }
    //双重锁设计
    public static SafeDoubleCheckSingleton getInstance(){
        if (singleton == null){
            //1.多线程并发创建对象时，会通过加锁保证只有一个线程能创建对象
            synchronized (SafeDoubleCheckSingleton.class){
                if (singleton == null){
                    //隐患：多线程环境下，由于重排序，该对象可能还未完成初始化就被其他线程读取
                    singleton = new SafeDoubleCheckSingleton();
                    //实例化分为三步
                    //1.分配对象的内存空间
                    //2.初始化对象
                    //3.设置对象指向分配的内存地址
                }
            }
        }
        //2.对象创建完毕，执行getInstance()将不需要获取锁，直接返回创建对象
        return singleton;
    }
}
```

#### 单线程情况下

单线程环境下(或者说正常情况下)，在"问题代码处"，会执行如下操作，保证能获取到已完成初始化的实例

```java
//三步
memory = allocate(); //1.分配对象的内存空间
ctorInstance(memory); //2.初始化对象
instance = memory; //3.设置对象指向分配的内存地址
```

#### 多线程情况下（由于指令重排序）

隐患：多线程环境下，在"问题代码处"，会执行如下操作，由于重排序导致2,3乱序，后果就是其他线程得到的是null而不是完成初始化的对象 *。（没初始化完的就是null）*

正常情况

~~~java
//三步
memory = allocate(); //1.分配对象的内存空间
ctorInstance(memory); //2.初始化对象
instance = memory; //3.设置对象指向分配的内存地址
```*

   非正常情况

```java
//三步
memory = allocate(); //1.分配对象的内存空间
instance = memory; //3.设置对象指向分配的内存地址---这里指令重排了，但是对象还没有初始化
ctorInstance(memory); //2.初始化对象
~~~

#### 解决

加volatile修饰

```java
public class SafeDoubleCheckSingleton
{
    //通过volatile声明，实现线程安全的延迟初始化。
    private volatile static SafeDoubleCheckSingleton singleton;
    //私有化构造方法
    private SafeDoubleCheckSingleton(){
    }
    //双重锁设计
    public static SafeDoubleCheckSingleton getInstance(){
        if (singleton == null){
            //1.多线程并发创建对象时，会通过加锁保证只有一个线程能创建对象
            synchronized (SafeDoubleCheckSingleton.class){
                if (singleton == null){
                    //隐患：多线程环境下，由于重排序，该对象可能还未完成初始化就被其他线程读取
                    //原理:利用volatile，禁止 "初始化对象"(2) 和 "设置singleton指向内存空间"(3) 的重排序
                    singleton = new SafeDoubleCheckSingleton();
                }
            }
        }
        //2.对象创建完毕，执行getInstance()将不需要获取锁，直接返回创建对象
        return singleton;
    }
}
```

实例化singleton分多步执行（分配内存空间、初始化对象、将对象指向分配的内存空间），某些编译器为了性能原因，会将第二步和第三步进行重排序（分配内存空间、将对象指向分配的内存空间、初始化对象）。这样，某个线程可能会获得一个未完全初始化的实例。

## 最后的小总结

> 八股文

volatile可见性

![image-20230216221205790](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216221205790.png)

- volatile没有原子性

------



volatile禁重排

- 写指令

  ![在这里插入图片描述](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/cc2f8b5717fe400fb99c17a5a146c904.png)

- 读指令

  ![](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216221508952.png)

------



- 凭什么我们java写了一个volatile关键字系统底层加入内存屏障？两者关系怎么勾搭上的？

  - 字节码层面`javap -c xx.class`

    它其实添加了一个ACC_VOLATILE

    ![image-20230216221644536](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216221644536.png)

------

- 内存屏障是什么？

内存屏障是一种**屏障指令**，它使得CPU或编译器对屏障指令的**前**和**后**所发出的内存操作**执行一个排序的约束**。也叫内存栅栏或栅栏指令

------

内存屏障能干嘛？

- 阻止**屏障两边的**指令重排序
- **写**数据时假如屏障，强制将线程私有工作内存的数据刷回主物理内存
- **读**数据时加入屏障，线程私有工作内存的数据失效，重新到主物理内存中获取最新数据

------

内存屏障的四大指令

![image-20230216221821662](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230216221821662.png)

------

3句话总结

- volatile写之前的的操作，都禁止重排到volatile之后，保证当前写入的值是最新值。
- volatile读之后的操作，都禁止重排到volatile之前，保证当前读取的值是最新值。
- volatile写之后volatile读，禁止重排序

------
