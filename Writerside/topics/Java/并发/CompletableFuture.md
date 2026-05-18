---
title: CompletableFuture基本使用
date: 2023-02-18 16:51:33
tags: 
- Java
- 并发
- JUC
categories:
- Java
---


## Future和Callable接口

- Future接口**(FutureTask实现类)**定义了操作**异步任务执行一些方法**，如获取异步任务的执行结果、取消任务的执行、判断任务是否被取消、判断任务执行是否完毕等。（异步：可以被叫停，可以被取消）

- 一句话：Future接口可以为主线程开一个分支任务，专门为主线程处理耗时和费力的复杂业务。

  ![image-20230212130044863](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230212130044863.png)

- eg.比如主线程让一个子线程去执行任务，子线程可能比较耗时，启动子线程开始执行任务后，主线程就去做其他事情了，过了一会才去获取子任务的执行结果。老师在上课，但是口渴，于是让班长这个线程去买水，自己可以继续上课，实现了异步任务。

- 有个目的：异步多线程任务执行且有返回结果，三个特点：多线程/有返回/异步任务（班长作为老师去买水作为新启动的异步多线程任务且买到水有结果返回）

### FutureTask实现类

- FutureTak(实现了x接口，x接口又继承了a和v接口)
  - 在源码可以看到，他既继承了`RunnableFuture`接口，也在构造方法中实现了`Callable`接口（有返回值、可抛出异常）和`Runnable`接口

(`ctrl`+`alt`+`u`)

![image-20230212130550464](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230212130550464.png)

![image-20230212130606124](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230212130606124.png)

![image-20230212130653888](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230212130653888.png)

```java
public class FutureTaskDemo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        FutureTask<String> futureTask = new FutureTask<>(new MyThread());
        Thread t1 = new Thread(futureTask, "t1");
        t1.start();
        System.out.println(futureTask.get());
    }
}
class MyThread implements Callable<String>{
    @Override
    public String call() throws Exception {
        System.out.println("-----come in call() ");
        return "hello Callable";
    }
}
```

## Future到CompletableFuture

### Future优点

- **future**+**线程池**异步多线程任务配合，能显著提高程序的执行效率。
- 方案一，3个任务1个main线程处理，大概**1130ms**

![image-20230212133406018](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230212133406018.png)

- 方案二，3个任务3个线程，利用线程池（假如每次new一个Thread，太浪费资源，会有GC这些工作），大概**500毫秒**。

  ![image-20230212134240573](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230212134240573.png)



### Future缺点

- get()阻塞

  - 一旦调用get()方法，不管是否计算完成，都会导致阻塞（所以一般get方法放到最后）

  

- isDone()轮询

  - 利用if(futureTask.isDone())的方式使得他在结束之后才get(),但是也会消耗cpu

![image-20230212141718045](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230212141718045.png)



### Future应用现状

- 对于简单的业务场景使用Future完全OK

  - 回调通知

    - 前面的isDone()方法耗费cpu资源，一般应该还是利用回调函数，在Future结束时自动调用该回调函数。应对Future的完成时间，完成了可以告诉我，也就是我们的回调通知
  - 创建异步任务
    - Future+线程池配合
  - 多个任务前后依赖可以组合处理（水煮鱼）
    - 想将多个异步任务的计算结果组合起来，后一个异步任务的计算结果需要前一个异步任务的值，将两个或多个异步计算合成一个异步计算，这几个异步计算相互独立，同时后面这个又依赖前一个处理的结果

    - 比如买鱼-加料-烹饪

  - 对计算速度选最快完成的（并返回结果）

    - 当Future集合中某个任务最快结束时，返回结果，返回第一名处理结果。

## CompletableFuture基本介绍

- 阻塞的方式和异步编程的设计理念相违背，而轮询的方式会消耗无畏的CPU资源。因此，JDK8设计出CompletableFuture

### CompletableFuture

```java
public class CompletableFuture<T> implements Future<T>, CompletionStage<T> {
```

![image-20230212142944124](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20230212142944124.png)

- 在Java 8中， Complet able Future提供了非常强大的Future的扩展功能， 可以帮助我们简化异步编程的复杂性， 并且提供了函数式编程的能力， 可以通过回调的方式处理计算结果， 也提供了转换和组合Complet able Future的方法。
- 它可能代表一个明确完成的Future， 也有可能代表一个完成阶段(Completion Stage) ， 它支持在计算完成以后触发一些函数或执行某些动作。

- 它实现了**Future**和**Completion Stage**接口

### CompletionStage

- Completion Stage代表异步计算过程中的某一个阶段， 一个阶段完成以后可能会触发另外一个阶段

- 一个阶段的计算执行可以是一个Function， Consumer或者Runnable

  比如：`stage.then Apply(x->square(x) ) .then Accept(x->System.out.print(x) ) .then Run() ->System.out.print In() )`

  一个阶段的执行可能是被单个阶段的完成触发，也可能是由多个阶段一起触发。

### 核心的四个静态方法（分为两组）

- 利用核心的四个静态方法创建一个异步操作 | 不建议用new
- 关键就是 |有没有返回值|是否用了线程池|

- 参数说明：

  - 没有指定Executor的方法，直接使用默认的ForkJoinPool.commPool()作为它的线程池执行异步代码。

  - 如果指定线程池，则使用我们定义的或者特别指定的线程池执行异步代码。


#### runAsync无返回值

##### runAsync

```java
public static CompletableFuture<Void> runAsync(Runnable runnable)
```

```java
public class CompletableFutureBuildDemo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        CompletableFuture<Void> voidCompletableFuture = CompletableFuture.runAsync(() -> {
            System.out.println(Thread.currentThread().getName());
            //停顿几秒线程
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        });
        System.out.println(voidCompletableFuture.get());
    }
}
//ForkJoinPool.commonPool-worker-9 //默认的线程池
//null --- 没有返回值
```

##### runAsync+线程池

```java
public static CompletableFuture<Void> runAsync(Runnable runnable,Executor executor)
```

```java
public class CompletableFutureBuildDemo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {

        ExecutorService executorService = Executors.newFixedThreadPool(3);//加入线程池

        CompletableFuture<Void> voidCompletableFuture = CompletableFuture.runAsync(() -> {

            System.out.println(Thread.currentThread().getName());
            //停顿几秒线程
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        },executorService);
        System.out.println(voidCompletableFuture.get());
    }
}
//pool-1-thread-1   ----指定的线程池
//null ----没有返回值
```

#### supplyAsync有返回值

##### supplyAsync

```java
public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier) 
```

```java
public class CompletableFutureBuildDemo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {

        ExecutorService executorService = Executors.newFixedThreadPool(3);//加入线程池

        CompletableFuture<String> objectCompletableFuture = CompletableFuture.supplyAsync(()->{
            System.out.println(Thread.currentThread().getName());
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "helllo supplyasync";
        });
        System.out.println(objectCompletableFuture.get());
    }
}
//ForkJoinPool.commonPool-worker-9---------默认的线程池
//helllo supplyasync-------------supplyasync有返回值了
```

##### supplyAsync+线程池

```java
public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier,Executor executor)
```

```java
public class CompletableFutureBuildDemo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {

        ExecutorService executorService = Executors.newFixedThreadPool(3);//加入线程池

        CompletableFuture<String> objectCompletableFuture = CompletableFuture.supplyAsync(()->{
            System.out.println(Thread.currentThread().getName());
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "helllo supplyasync";
        },executorService);
        System.out.println(objectCompletableFuture.get());
    }
}
//ForkJoinPool.commonPool-worker-9---------默认的线程池
//helllo supplyasync-------------supplyasync有返回值了
```

### CompletableFuture使用演示（日常使用）

#### 基本功能

- `CompletableFuture`可以完成`Future`的功能

```java
public class CompletableFutureUseDemo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        CompletableFuture<Object> objectCompletableFuture = CompletableFuture.supplyAsync(()->{
            System.out.println(Thread.currentThread().getName()+"----副线程come in");
            int result = ThreadLocalRandom.current().nextInt(10);//产生一个随机数
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("1秒钟后出结果"+result);
            return result;
        });

        System.out.println(Thread.currentThread().getName()+"线程先去忙其他任务");
        System.out.println(objectCompletableFuture.get());
    }
}
//main线程先去忙其他任务
//ForkJoinPool.commonPool-worker-9----副线程come in
//1秒钟后出结果6
//6
```

#### 减少阻塞和轮询whenComplete

- `CompletableFuture`通过`whenComplete`来**减少阻塞和轮询**（自动回调）

```java
public class CompletableFutureUseDemo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        CompletableFuture.supplyAsync(()->{
            System.out.println(Thread.currentThread().getName()+"--------副线程come in");
            int result = ThreadLocalRandom.current().nextInt(10);//产生随机数
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return result;
        }).whenComplete((v,e) -> {//没有异常,v是值，e是异常
            if(e == null){
                System.out.println("------------------计算完成，更新系统updataValue"+v);
            }
        }).exceptionally(e->{//有异常的情况
            e.printStackTrace();
            System.out.println("异常情况"+e.getCause()+"\t"+e.getMessage());
            return null;
        });

        //线程不要立刻结束，否则CompletableFuture默认使用的线程池会立刻关闭：暂停3秒钟线程
        System.out.println(Thread.currentThread().getName()+"线程先去忙其他任务");
        try {
            TimeUnit.SECONDS.sleep(3);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
//ForkJoinPool.commonPool-worker-9--------副线程come in（这里用的是默认的ForkJoinPool）
//main线程先去忙其他任务
//------------------计算完成，更新系统updataValue3
```

- 假如换用自定义线程池

```java
public class CompletableFutureUseDemo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ExecutorService threadPool = Executors.newFixedThreadPool(3);
        CompletableFuture.supplyAsync(()->{
            System.out.println(Thread.currentThread().getName()+"--------副线程come in");
            int result = ThreadLocalRandom.current().nextInt(10);//产生随机数
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return result;
        },threadPool).whenComplete((v,e) -> {//没有异常,v是值，e是异常
            if(e == null){
                System.out.println("------------------计算完成，更新系统updataValue"+v);
            }
        }).exceptionally(e->{//有异常的情况
            e.printStackTrace();
            System.out.println("异常情况"+e.getCause()+"\t"+e.getMessage());
            return null;
        });

        //线程不要立刻结束，否则CompletableFuture默认使用的线程池会立刻关闭：暂停3秒钟线程
        System.out.println(Thread.currentThread().getName()+"线程先去忙其他任务");
        try {
            TimeUnit.SECONDS.sleep(3);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
//pool-1-thread-1--------副线程come in
//main线程先去忙其他任务
//------------------计算完成，更新系统updataValue6

```

- 异常情况的展示，设置一个异常 `int i = 10 / 0 ;`

```java
public class CompletableFutureUseDemo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ExecutorService threadPool = Executors.newFixedThreadPool(3);
        CompletableFuture.supplyAsync(()->{
            System.out.println(Thread.currentThread().getName()+"--------副线程come in");
            int result = ThreadLocalRandom.current().nextInt(10);//产生随机数
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            System.out.println("-----结果---异常判断值---"+result);
            //---------------------异常情况的演示--------------------------------------
            if(result > 2){
                int i  = 10 / 0 ;//我们主动的给一个异常情况
            }
            //------------------------------------------------------------------
            return result;
        },threadPool).whenComplete((v,e) -> {//没有异常,v是值，e是异常
            if(e == null){
                System.out.println("------------------计算完成，更新系统updataValue"+v);
            }
        }).exceptionally(e->{//有异常的情况
            e.printStackTrace();
            System.out.println("异常情况"+e.getCause()+"\t"+e.getMessage());
            return null;
        });

        //线程不要立刻结束，否则CompletableFuture默认使用的线程池会立刻关闭：暂停3秒钟线程
        System.out.println(Thread.currentThread().getName()+"线程先去忙其他任务");
        try {
            TimeUnit.SECONDS.sleep(3);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
//pool-1-thread-1--------副线程come in
//main线程先去忙其他任务
//-----结果---异常判断值---4                (这里 4 >2了，直接抛出异常)
//异常情况java.lang.ArithmeticException: / by zero  java.lang.ArithmeticException: / by zero
//java.util.concurrent.CompletionException: java.lang.ArithmeticException: / by zero
//  at java.util.concurrent.CompletableFuture.encodeThrowable(CompletableFuture.java:273)
//  at java.util.concurrent.CompletableFuture.completeThrowable(CompletableFuture.java:280)
//  at java.util.concurrent.CompletableFuture$AsyncSupply.run(CompletableFuture.java:1592)
//  at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
//  at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
//  at java.lang.Thread.run(Thread.java:748)
//Caused by: java.lang.ArithmeticException: / by zero
//  at com.zhang.admin.controller.CompletableFutureUseDemo.lambda$main$0(CompletableFutureUseDemo.java:19)
//  at java.util.concurrent.CompletableFuture$AsyncSupply.run(CompletableFuture.java:1590)
//  ... 3 more
```

### CompletableFuture优点总结

- 异步任务结束时，会**自动回调**某个对象的方法；
- 主线程设置好毁掉后，不再关心异步任务的执行，异步任务之间可以顺序执行
- 异步任务出错时，会自动回调某个对象的方法。

------

## CompletableFuture案例

### 准备

#### 函数式接口

- **函数式接口**的定义：
  - 任何**接口**，如果只包含**唯一一个**抽象方法，那么它就是一个**函数式接口**。对于函数式接口，我们可以通过**lambda表达式**来创建该接口的对象。

```java
public interface Runnable{
  public abstract void run();
}
```

- 常见的函数式接口

  - Runnable

    ```java
    @FunctionalInterface
    public interface Runnable {
        public abstract void run();
    }
    ```

  - Function

    ```java
    @FunctionalInterface
    public interface Function<T, R> {
        R apply(T t);
    }
    ```

  - Consumer

    ```java
    @FunctionalInterface
    public interface Consumer<T> {
        void accept(T t);
    }
    ```

  - Supplier

    ```java
    @FunctionalInterface
    public interface Supplier<T> {
    
        /**
         * Gets a result.
         *
         * @return a result
         */
        T get();
    }
    ```

  - Biconsumer(Bi代表两个的意思，我们要传入两个参数，在上面的案例中是v和e)

    ```java
    @FunctionalInterface
    public interface BiConsumer<T, U> {
        void accept(T t, U u);
    
    }
    ```

  | 函数式接口名称 | 方法名称 | 参数     | 返回值   |
  | -------------- | -------- | -------- | -------- |
  | Runnable       | run      | 无参数   | 无返回值 |
  | Function       | apply    | 1个参数  | 有返回值 |
  | Consume        | accept   | 1个参数  | 无返回值 |
  | Supplier       | get      | 没有参数 | 有返回值 |
  | Biconsumer     | accept   | 2个参数  | 无返回值 |

#### 链式调用|链式编程|链式写法

```java
public class Chain {
    public static void main(String[] args) {
        //-------------------老式写法------------
//        Student student = new Student();
//        student.setId(1);
//        student.setMajor("cs");
//        student.setName("小卡");
        new Student().setId(1).setName("大卡").setMajor("cs");
    }
    
}

@NoArgsConstructor
@AllArgsConstructor
@Data
@Accessors(chain = true)//开启链式编程
class Student{
    private int id;
    private String name;
    private String major;
}
```

#### join和get对比

- 功能几乎一样，区别在于编码时是否需要抛出异常
  - get()方法需要抛出异常
  - join()方法不需要抛出异常

```java
public class Chain {
    public static void main(String[] args) throws ExecutionException, InterruptedException {//抛出异常
        CompletableFuture<String> completableFuture = CompletableFuture.supplyAsync(() -> {
            return "hello 12345";
        });
        System.out.println(completableFuture.get());
    }

}

public class Chain {
    public static void main(String[] args)  {//抛出异常
        CompletableFuture<String> completableFuture = CompletableFuture.supplyAsync(() -> {
            return "hello 12345";
        });
        System.out.println(completableFuture.join());
    }
}
```

### 实战精讲-比价网站case

#### 需求

- 需求说明
  - 同一款产品，同时搜索出同款产品在各大电商平台的售价；
  - 同一款产品，同时搜索出本产品在同一个电商平台下，各个入驻卖家售价是多少
- 输出返回：
  出来结果希望是同款产品的在不同地方的价格清单列表， 返回一个List<String>
  《mysql》in jd price is 88.05
  《mysql》in dang dang price is 86.11
  《mysql》in tao bao price is 90.43
- 解决方案，比对同一个商品在各个平台上的价格，要求获得一个清单列表
  - stepbystep   ， 按部就班， 查完京东查淘宝， 查完淘宝查天猫......
  - all in       ，万箭齐发，一口气多线程异步任务同时查询。。。

#### 基本框架搭建

- 相当于是一个一个按部就班

```java
public class Case {
    static List<NetMall> list = Arrays.asList(
      new NetMall("jd"),
      new NetMall("dangdang"),
        new NetMall("taobao")
    );

    public static List<String> getPrice(List<NetMall> list,String productName){
        return list
                .stream() //----流式计算做了映射（利用map），希望出来的是有格式的字符串（利用String.format）,%是占位符
                .map(netMall -> String.format(productName + " in %s price is %.2f",
                                netMall.getNetMallName(),//第一个%
                                netMall.calcPrice(productName))).collect(Collectors.toList());//第二个%
    }

    public static void main(String[] args) {
        long startTime = System.currentTimeMillis();
        List<String> list1 = getPrice(list, "mysql");
        for(String element:list1){
            System.out.println(element);
        }
        long endTime = System.currentTimeMillis();
        System.out.println("---当前操作花费时间----costTime:"+(endTime-startTime)+"毫秒");
    }
}

class NetMall{
    @Getter
    private String netMallName;

    public NetMall(String netMallName){
        this.netMallName = netMallName;
    }

    public double calcPrice(String productName){
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return ThreadLocalRandom.current().nextDouble() * 2 + productName.charAt(0);//用这句话来模拟价格
    }
}

//mysql in jd price is 110.48
//mysql in dangdang price is 109.06
//mysql in taobao price is 110.96
//---当前操作花费时间----costTime:3098毫秒
```

#### 从功能到性能：利用CompletableFuture

- 这里是利用异步线程
- 此处用了两步**流式编程**。
- 性能差距巨大

```java
public class Case {
    static List<NetMall> list = Arrays.asList(
      new NetMall("jd"),
      new NetMall("dangdang"),
        new NetMall("taobao")
    );

    public static List<String> getPrice(List<NetMall> list,String productName){
        return list
                .stream() //----流式计算做了映射（利用map），希望出来的是有格式的字符串（利用String.format）,%是占位符
                .map(netMall -> String.format(productName + " in %s price is %.2f",
                                netMall.getNetMallName(),//第一个%
                                netMall.calcPrice(productName))).collect(Collectors.toList());//第二个%
    }

    //从功能到性能
    public static List<String> getPricesByCompletableFuture(List<NetMall> list,String productName){
        return list.stream().map(netMall ->
                        CompletableFuture.supplyAsync(() -> String.format(productName + " in %s price is %.2f",
                                netMall.getNetMallName(),
                                netMall.calcPrice(productName))))//Stream<CompletableFuture<String>>
                                .collect(Collectors.toList())//List<CompletablFuture<String>>
                                .stream()//Stream<CompletableFuture<String>
                                .map(s->s.join())//Stream<String>
                                .collect(Collectors.toList());
    }

    public static void main(String[] args) {
        long startTime = System.currentTimeMillis();
        List<String> list1 = getPrice(list, "mysql");
        for(String element:list1){
            System.out.println(element);
        }
        long endTime = System.currentTimeMillis();
        System.out.println("--普通版----当前操作花费时间----costTime:"+(endTime-startTime)+"毫秒");
        System.out.println("------------------------------分割----------------------");
        startTime = System.currentTimeMillis();
        List<String> list2 = getPricesByCompletableFuture(list, "mysql");
        for(String element:list2){
            System.out.println(element);
        }
        endTime = System.currentTimeMillis();
        System.out.println("--性能版-当前操作花费时间----costTime:"+(endTime-startTime)+"毫秒");
    }
}

class NetMall{
    @Getter
    private String netMallName;

    public NetMall(String netMallName){
        this.netMallName = netMallName;
    }

    public double calcPrice(String productName){
        try {
            TimeUnit.SECONDS.sleep(1);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return ThreadLocalRandom.current().nextDouble() * 2 + productName.charAt(0);//用这句话来模拟价格
    }
}
//mysql in jd price is 109.49
//mysql in dangdang price is 110.85
//mysql in taobao price is 110.32
//--普通版----当前操作花费时间----costTime:3124毫秒
//------------------------------分割----------------------
//mysql in jd price is 109.34
//mysql in dangdang price is 109.02
//mysql in taobao price is 110.37
//--性能版-当前操作花费时间----costTime:1000毫秒
```

------

## CompletableFuture常用API

- getNow调用的时候如果计算完了，就拿取这个计算完的值；否则就拿**备胎值**

### 获得结果和触发计算

- 获取结果

  - public T get() 不见不散，容易阻塞


  - public T get(long timeout,TimeUnit unit) 过时不候，超过时间会爆异常


  - public T join() 类似于get()，区别在于是否需要抛出异常


  - public T getNow(T valueIfAbsent)

    - 没有计算完成的情况下，给一个替代结果


    - 立即获取结果不阻塞
    
      - 计算完，返回计算完成后的结果


      - 没算完，返回设定的valueAbsent(直接返回了备胎值xxx)


- 主动触发计算

  - public boolean complete(T value) 是否立即打断get()方法返回括号值

    - (执行要2s，等待只有1s，所以还没执行完就被打断了。返回true表示打断了获取这个过程，直接返回了备胎值complete；如果没打断，返回false 和原来的abc)

```java
public class CompletableFutureAPIDemo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        CompletableFuture<String> uCompletableFuture = CompletableFuture.supplyAsync(() -> {
            try {
                TimeUnit.SECONDS.sleep(2);//执行需要2秒
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "abc";
        });

        try {
            TimeUnit.SECONDS.sleep(1);//等待需要1秒
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
       // System.out.println(uCompletableFuture.getNow("xxx"));//执2-等1 返回xxx
        System.out.println(uCompletableFuture.complete("completeValue")+"\t"+uCompletableFuture.get());//执2-等1 返回true+备胎值completeValue
    }
}
```



### 对计算结果进行处理

- `thenApply `计算结果存在在依赖关系，使得线程串行化。因为依赖关系，所以一旦有异常，直接叫停。

  ```java
  public class CompletableFutureDemo2
  {
  public static void main(String[] args) throws ExecutionException, InterruptedException
  {
      //当一个线程依赖另一个线程时用 thenApply 方法来把这两个线程串行化,
      CompletableFuture.supplyAsync(() -> {
          //暂停几秒钟线程
          try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
          System.out.println("111");
          return 1024;
      }).thenApply(f -> {
          System.out.println("222");
          return f + 1;
      }).thenApply(f -> {
          //int age = 10/0; // 异常情况：那步出错就停在那步。
          System.out.println("333");
          return f + 1;
      }).whenCompleteAsync((v,e) -> {
          System.out.println("*****v: "+v);
      }).exceptionally(e -> {
          e.printStackTrace();
          return null;
      });
  
      System.out.println("-----主线程结束，END");
  
      // 主线程不要立刻结束，否则CompletableFuture默认使用的线程池会立刻关闭:
      try { TimeUnit.SECONDS.sleep(2); } catch (InterruptedException e) { e.printStackTrace(); }
  }
  }
  //-----正常情况
  //111
  //222
  //333
  //----计算结果： 6
  
  //-----异常情况
  //111
  //异常.....
  ```

- `handle `类似于thenApply，但是有异常的话仍然可以往下走一步。

  ```java
  public class CompletableFutureDemo2
  {
  
      public static void main(String[] args) throws ExecutionException, InterruptedException
      {
          //当一个线程依赖另一个线程时用 handle 方法来把这两个线程串行化,
          // 异常情况：有异常也可以往下一步走，根据带的异常参数可以进一步处理
          CompletableFuture.supplyAsync(() -> {
              //暂停几秒钟线程
              try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
              System.out.println("111");
              return 1024;
          }).handle((f,e) -> {
              int age = 10/0;//异常语句
              System.out.println("222");
              return f + 1;
          }).handle((f,e) -> {
              System.out.println("333");
              return f + 1;
          }).whenCompleteAsync((v,e) -> {
              System.out.println("*****v: "+v);
          }).exceptionally(e -> {
              e.printStackTrace();
              return null;
          });
  
          System.out.println("-----主线程结束，END");
  
          // 主线程不要立刻结束，否则CompletableFuture默认使用的线程池会立刻关闭:
          try { TimeUnit.SECONDS.sleep(2); } catch (InterruptedException e) { e.printStackTrace(); }
      }
  }
  //-----异常情况
  //111
  //333
  //异常，可以看到多走了一步333
  ```

- 一般用thenApply

### 对计算结果进行消费

- 接收任务的处理结果，并**消费处理，无返回结果**|**消费型函数式接口**，之前的是Function

- `thenAccept`

  ```java
  public static void main(String[] args) throws ExecutionException, InterruptedException
  {
      CompletableFuture.supplyAsync(() -> {
          return 1;
      }).thenApply(f -> {
          return f + 2;
      }).thenApply(f -> {
          return f + 3;
      }).thenApply(f -> {
          return f + 4;
      }).thenAccept(r -> System.out.println(r));
  }
  //6
  //消费一下，直接得到6
  ```



- 补充：Code之任务之间的顺序执行

  - thenRun

    - thenRun(Runnable runnable)

    - 任务A执行完执行B，并且B不需要A的结果

  - thenAccept
    - thenAccept(Consumer action)

    - 任务A执行完执行B，B需要A的结果，但是任务B无返回值

  - thenApply

    - thenApply(Function fn)

    - 任务A执行完执行B，B需要A的结果，同时任务B有返回值

  ```java
   
  System.out.println(CompletableFuture.supplyAsync(() -> "resultA").thenRun(() -> {}).join());
  //null 
  
  System.out.println(CompletableFuture.supplyAsync(() -> "resultA").thenAccept(resultA -> {}).join());
  //resultA打印出来的 null因为没有返回值
  
  System.out.println(CompletableFuture.supplyAsync(() -> "resultA").thenApply(resultA -> resultA + " resultB").join());
  //resultAresultB 返回值
  ```

  

### CompleteFuture和线程池说明（非常重要）

- 上面的几个方法都有普通版本和后面加Async的版本

- 以thenRun和thenRunAsync为例，有什么区别？

- 先看结论

  - 没有传入自定义线程池，都用默认线程池ForkJoinPool

  - 传入了一个自定义线程池如果你执行第一个任务的时候，传入了一个自定义线程池

    - 调用thenRun方法执行第二个任务的时候，则第二个任务和第一个任务是用同一个线程池

    - 调用thenRunAsync执行第二个任务的时候，则第一个任务使用的是你自己传入的线程池，第二个任务使用的是ForkJoin线程池

  - 也有可能处理太快，系统优化切换原则，直接使用main线程处理（把sleep去掉）

```java
//2-1
public class CompletableFutureAPIDemo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ExecutorService threadPool = Executors.newFixedThreadPool(5);
        CompletableFuture<Void> completableFuture = CompletableFuture.supplyAsync(()->{
            try {TimeUnit.MILLISECONDS.sleep(20);} catch (InterruptedException e) {e.printStackTrace();}
            System.out.println("1号任务"+"\t"+Thread.currentThread().getName());
            return "abcd";
        },threadPool).thenRun(()->{
            try {TimeUnit.MILLISECONDS.sleep(20);} catch (InterruptedException e) {e.printStackTrace();}
            System.out.println("2号任务"+"\t"+Thread.currentThread().getName());
        }).thenRun(()->{
            try {TimeUnit.MILLISECONDS.sleep(20);} catch (InterruptedException e) {e.printStackTrace();}
            System.out.println("3号任务"+"\t"+Thread.currentThread().getName());
        }).thenRun(()->{
            try {TimeUnit.MILLISECONDS.sleep(20);} catch (InterruptedException e) {e.printStackTrace();}
            System.out.println("4号任务"+"\t"+Thread.currentThread().getName());
        });
    }
}
//1号任务  pool-1-thread-1
//2号任务  pool-1-thread-1
//3号任务  pool-1-thread-1
//4号任务  pool-1-thread-1
```



```java
//2-2
public class CompletableFutureAPIDemo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ExecutorService threadPool = Executors.newFixedThreadPool(5);
        CompletableFuture<Void> completableFuture = CompletableFuture.supplyAsync(()->{
            try {TimeUnit.MILLISECONDS.sleep(20);} catch (InterruptedException e) {e.printStackTrace();}
            System.out.println("1号任务"+"\t"+Thread.currentThread().getName());
            return "abcd";
        },threadPool).thenRunAsync(()->{
            try {TimeUnit.MILLISECONDS.sleep(20);} catch (InterruptedException e) {e.printStackTrace();}
            System.out.println("2号任务"+"\t"+Thread.currentThread().getName());
        }).thenRun(()->{
            try {TimeUnit.MILLISECONDS.sleep(20);} catch (InterruptedException e) {e.printStackTrace();}
            System.out.println("3号任务"+"\t"+Thread.currentThread().getName());
        }).thenRun(()->{
            try {TimeUnit.MILLISECONDS.sleep(20);} catch (InterruptedException e) {e.printStackTrace();}
            System.out.println("4号任务"+"\t"+Thread.currentThread().getName());
        });
    }
}
//1号任务  pool-1-thread-1
//2号任务  ForkJoinPool.commonPool-worker-9---这里另起炉灶重新调用了默认的ForkJoinPool
//3号任务  ForkJoinPool.commonPool-worker-9
//4号任务  ForkJoinPool.commonPool-worker-9
```



```java
public class CompletableFutureAPIDemo {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        ExecutorService threadPool = Executors.newFixedThreadPool(5);
        CompletableFuture<Void> completableFuture = CompletableFuture.supplyAsync(()->{
//            try {TimeUnit.MILLISECONDS.sleep(20);} catch (InterruptedException e) {e.printStackTrace();}
            System.out.println("1号任务"+"\t"+Thread.currentThread().getName());
            return "abcd";
        },threadPool).thenRun(()->{
           // try {TimeUnit.MILLISECONDS.sleep(20);} catch (InterruptedException e) {e.printStackTrace();}
            System.out.println("2号任务"+"\t"+Thread.currentThread().getName());
        }).thenRun(()->{
          //  try {TimeUnit.MILLISECONDS.sleep(20);} catch (InterruptedException e) {e.printStackTrace();}
            System.out.println("3号任务"+"\t"+Thread.currentThread().getName());
        }).thenRun(()->{
            //try {TimeUnit.MILLISECONDS.sleep(20);} catch (InterruptedException e) {e.printStackTrace();}
            System.out.println("4号任务"+"\t"+Thread.currentThread().getName());
        });
    }
}
//1号任务  1号任务  pool-1-thread-1
//2号任务  main
//3号任务  main
//4号任务  main
```

- 源码

  ```java
  //CompletableFuture.java 2009行
  public CompletableFuture<Void> thenRun(Runnable action) {//传入值是一样的
      return uniRunStage(null, action);
  }
  
  public CompletableFuture<Void> thenRunAsync(Runnable action) {
      return uniRunStage(asyncPool, action);//但是这里有个异步的线程池asyncPool
  }
  ```

  ```java
  //进入asyncPool
  private static final boolean useCommonPool =
      (ForkJoinPool.getCommonPoolParallelism() > 1);//一般大于1都是成立的
  
  /**
       * Default executor -- ForkJoinPool.commonPool() unless it cannot
       * support parallelism.
       */
  private static final Executor asyncPool = useCommonPool ?
      ForkJoinPool.commonPool() : new ThreadPerTaskExecutor();//所以这里会调用forkJoin线程池
  ```

  

### 对计算速度进行选用

- `applyToEither`方法，快的那个掌权

```java
public class CompletableFutureDemo2 {
    public static void main(String[] args) throws ExecutionException, InterruptedException
    {
        CompletableFuture<String> play1 = CompletableFuture.supplyAsync(() -> {
            System.out.println(Thread.currentThread().getName() + "\t" + "---come in ");
            //暂停几秒钟线程
            try { TimeUnit.SECONDS.sleep(2); } catch (InterruptedException e) { e.printStackTrace(); }
            return "play1 ";
        });

        CompletableFuture<String> play2 = CompletableFuture.supplyAsync(() -> {
            System.out.println(Thread.currentThread().getName() + "\t" + "---come in ");
            try { TimeUnit.SECONDS.sleep(1); } catch (InterruptedException e) { e.printStackTrace(); }
            return "play2";
        });

        CompletableFuture<String> thenCombineResult = play1.applyToEither(play2, f -> {//对计算速度进行选用
            return f + " is winner";
        });

        System.out.println(Thread.currentThread().getName() + "\t" + thenCombineResult.get());
    }
}
//ForkJoinPool.commonPool-worker-9  ---come in 
//ForkJoinPool.commonPool-worker-2  ---come in 
//main  play2 is winner
```



### 对计算结果进行合并

- `thenCombine` 合并

  - 两个CompletionStage任务都完成后，最终能把两个任务的结果一起交给thenCombine来处理
  - 先完成的先等着，等待其它分支任务

  ```java
  public class CompletableFutureDemo2
  {
      public static void main(String[] args) throws ExecutionException, InterruptedException
      {
          CompletableFuture<Integer> completableFuture1 = CompletableFuture.supplyAsync(() -> {
              System.out.println(Thread.currentThread().getName() + "\t" + "---come in ");
              return 10;
          });
  
          CompletableFuture<Integer> completableFuture2 = CompletableFuture.supplyAsync(() -> {
              System.out.println(Thread.currentThread().getName() + "\t" + "---come in ");
              return 20;
          });
  
          CompletableFuture<Integer> thenCombineResult = completableFuture1.thenCombine(completableFuture2, (x, y) -> {
              System.out.println(Thread.currentThread().getName() + "\t" + "---come in ");
              return x + y;
          });
          
          System.out.println(thenCombineResult.get());
      }
  }
  //30
  ```

  - 合并版本

    ```java
    public class CompletableFutureDemo2
    {
        public static void main(String[] args) throws ExecutionException, InterruptedException
        {
            CompletableFuture<Integer> thenCombineResult = CompletableFuture.supplyAsync(() -> {
                System.out.println(Thread.currentThread().getName() + "\t" + "---come in 1");
                return 10;
            }).thenCombine(CompletableFuture.supplyAsync(() -> {
                System.out.println(Thread.currentThread().getName() + "\t" + "---come in 2");
                return 20;
            }), (x,y) -> {
                System.out.println(Thread.currentThread().getName() + "\t" + "---come in 3");
                return x + y;
            }).thenCombine(CompletableFuture.supplyAsync(() -> {
                System.out.println(Thread.currentThread().getName() + "\t" + "---come in 4");
                return 30;
            }),(a,b) -> {
                System.out.println(Thread.currentThread().getName() + "\t" + "---come in 5");
                return a + b;
            });
            System.out.println("-----主线程结束，END");
            System.out.println(thenCombineResult.get());
    
    
            // 主线程不要立刻结束，否则CompletableFuture默认使用的线程池会立刻关闭:
            try { TimeUnit.SECONDS.sleep(10); } catch (InterruptedException e) { e.printStackTrace(); }
        }
    }
    ```


------

# 