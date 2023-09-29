---
title: Spring
date: 2022-04-19 16:51:33
tags:
- 后端
- Spring
- Java
categories:
- 后端
---

## 概念

Spring是轻量级的开源的JavaEE框架。

Spring可以解决企业应用开发的复杂性。

Spring有两个核心部分：IOC、AOP

- IOC：控制反转，把创建对象的过程交给Spring进行管理。
- AOP：面向切面，不修改源代码进行功能增强。

Spring特点：

- 方便解耦，简化开发。
- AOP编程支持
- 方便程序测试
- 方便与其他框架进行整合
- 方便进行事务操作
- 降低API开发难度

Spring 框架是一个分层架构，由 7 个定义良好的模块组成。Spring 模块构建在核心容器之上，核心容器定义了创建、配置和管理 bean 的方式 

组成 Spring 框架的每个模块（或组件）都可以单独存在，或者与其他一个或多个模块联合实现。每个模块的功能如下：

- **Spring Core**：核心容器提供 Spring 框架的基本功能。核心容器的主要组件是 BeanFactory，它是工厂模式的实现。BeanFactory 使用*控制反转*（IOC） 模式将应用程序的配置和依赖性规范与实际的应用程序代码分开。
- **Spring Context**：Spring 上下文是一个配置文件，向 Spring 框架提供上下文信息。Spring 上下文包括企业服务，例如 JNDI、EJB、电子邮件、国际化、校验和调度功能。
- **Spring AOP**：通过配置管理特性，Spring AOP 模块直接将面向切面的编程功能 , 集成到了 Spring 框架中。所以，可以很容易地使 Spring 框架管理任何支持 AOP的对象。Spring AOP 模块为基于 Spring 的应用程序中的对象提供了事务管理服务。通过使用 Spring AOP，不用依赖组件，就可以将声明性事务管理集成到应用程序中。
- **Spring DAO**：JDBC DAO 抽象层提供了有意义的异常层次结构，可用该结构来管理异常处理和不同数据库供应商抛出的错误消息。异常层次结构简化了错误处理，并且极大地降低了需要编写的异常代码数量（例如打开和关闭连接）。Spring DAO 的面向 JDBC 的异常遵从通用的 DAO 异常层次结构。
- **Spring ORM**：Spring 框架插入了若干个 ORM 框架，从而提供了 ORM 的对象关系工具，其中包括 JDO、Hibernate 和 iBatis SQL Map。所有这些都遵从 Spring 的通用事务和 DAO 异常层次结构。
- **Spring Web 模块**：Web 上下文模块建立在应用程序上下文模块之上，为基于 Web 的应用程序提供了上下文。所以，Spring 框架支持与 Jakarta Struts 的集成。Web 模块还简化了处理多部分请求以及将请求参数绑定到域对象的工作。
- **Spring MVC 框架**：MVC 框架是一个全功能的构建 Web 应用程序的 MVC 实现。通过策略接口，MVC 框架变成为高度可配置的，MVC 容纳了大量视图技术，其中包括 JSP、Velocity、Tiles、iText 和 POI。

## IOC容器

### 概念

什么是IOC：

- 控制反转，把对象创建和对象之间的调用过程（即对象之间的依赖关系）交给Spring进行管理。
- 目的：降低耦合度

本质：

**控制反转(Inversion of Control，IOC)**，是一种设计思想，**DI(依赖注入)**是实现IOC的一种方法，也有人认为DI只是IOC的另一种说法。没有IOC的程序中 , 我们使用面向对象编程 , 对象的创建与对象间的依赖关系完全硬编码在程序中，对象的创建由程序自己控制，控制反转后将对象的创建转移给第三方。

总结：

原本类与类之间的依赖关系是由我们程序员手动绑定的，即在类中手动去new一个其他类的对象。

而现在spring的BeanFactory中有一个beanMap存放着所有的bean实例，通过XML配置文件或注解指定类与类之间的依赖关系，从而将一个bean实例赋值到另一个bean实例的其中一个字段中。

BeanFactory中的beanMap称之为**IOC容器**，而通过配置实现bean之间的依赖关系则称之为**依赖注入（Dependency Injection，DI）**

因此，我们转移（改变）了这些类它们的生命周期。控制权从程序员转移到BeanFactory。这个现象我们称之为**控制反转**。

### 底层原理

第一步：XML配置文件，配置创建的对象

```xml
<bean id="user" class="com.example.demo.User" p:bname="abc"/>
```

第二步，创建工厂类

```java
class Userfactory{
    public static UserDAO getDAO()
    {
        String className=class属性值;    //xml解析
        Class clazz = Class.forName(className);  //通过反射创建对象
        return (UserDAO)clazz.newInstance();       //创建对应的实例
	}
}
```

#### 接口

IOC思想基于IOC容器完成，IOC容器底层就是对象工厂。

Spring提供IOC容器的两种实现方式（两个接口）：

- BeanFactory：IOC肉搏国企基本实现，是Spring内部的使用接口，不提供开发人员使用

  加载配置文件时不会创建对象，在获取对象（使用）时才去创建。

- ApplicationContext：BeanFactory接口的子接口，提供更多更强大的功能，一般由开发人员进行使用。

  加载配置文件时就会把配置文件中的对象进行创建，即在服务器启动时就创建好对应的Bean对象。

常用实现类

ClassPathXmlApplicationContext

构造方法传递配置文件名，需提供类路径。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220419131821467.png)

FileSystemXmlApplicationContext

构造方法传递配置文件名，需提供全路径。

![image-20220419132125402](C:\Users\yumo\AppData\Roaming\Typora\typora-user-images\image-20220419132125402.png)

### Bean管理

所谓Bean管理，即管理Bean对象从创建到销毁的整个生命周期。 在Spring之前是由程序员来手动管理这一过程，而现在交给Spring进行操作。

- Spring创建对象
- Spring注入属性

#### 基于XML

##### 创建对象

通过bean标签创建对象，标签内添加对应property标签实现属性注入。

标签属性：

- id:唯一标识
- class:包类路径

创建对象时，默认执行无参构造方法完成对象创建。

##### 属性注入

DI依赖注入，就是注入属性



**使用set方法进行注入**

具体类

```java
package com.example.demo;

public class Book {
    private String bname;
    private String bauthor;
    private String address;
    public void setBname(String bname) {
        this.bname = bname;
    }
    public void setBauthor(String bauthor) {
        this.bauthor = bauthor;
    }
    public void setAddress(String address) {
        this.address = address;
    }
  
}
```

xml配置文件

标签属性：

- name:类里面属性名
- value:注入属性的值

```xml
<!--set方法注入属性-->
<bean id="book" class="com.example.demo.Book">
    <property name="bname" value="易筋经"/>
    <property name="bauthor" value="达摩"/>
    <!--null值-->
    <!--不管address-->
    <!--把带特殊符号内容放到CDATA-->
    <property name="address">
        <value> <![CDATA[<<南京>>]]> </value>
    </property>
</bean>
```



**使用有参构造进行注入**

创建具体类

```java
package com.example.demo;

public class Orders {
    private String oname;
    private String address;

    public Orders(String oname,String address) {
        this.oname = oname;
        this.address=address;
    }
    public void ordersTest()
    {
        System.out.println(oname+"::"+address);
    }
}
```

XML配置文件

标签属性：

- name：参数名
- value：要注入参数的值
- index：参数索引（从0开始）

```xml
<bean id="orders" class="com.example.demo.Orders">
    <constructor-arg name="oname" value="电脑"/>
    <constructor-arg name="address" value="China"/>
</bean>
```



**p名称空间注入**

简化了set属性注入

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:p="http://www.springframework.org/schema/p"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

<!--p名称空间注入-->
<bean id="user" class="com.example.demo.User" p:bname="abc"/>
```



注入空值

```xml
<property name="address">
    <null/>
</property>
```

注入特殊符号

1.使用实体引用进行转移

2.把带特殊符号内容放到**< ![CDATA[      ]] >**，将其中内容作为属性值，而不是标签符号

```xml
<!--把带特殊符号内容放到CDATA-->
<property name="address">
    <value> <![CDATA[<<南京>>]]> </value>
</property>
```

###### 外部bean

标签属性：

- name属性：类里面属性名称

- ref属性：创建userDao对象bean标签id值

service类

```java
package com.example.demo.service;

import com.example.demo.dao.UserDao;
import org.springframework.stereotype.Service;


@Service
public class UserService {


    private UserDao userDao;
    public void setUserDao(UserDao userDao) {
         this.userDao = userDao;
    }

    public void add()
    {
        System.out.println("add........");
    }
}
```

XML配置文件

```xml
<bean id="userDao" class="com.example.demo.dao.UserDaoImpl"></bean>
<!--外部bean-->
<bean id="userService" class="com.example.demo.service.UserService">
    <!--注入userDao对象
    name属性:类里面属性名称
    ref属性:创建userDao对象bean标签id值
    -->
    <property name="userDao" ref="userDao"></property>
</bean>
```

###### 内部bean

```xml
<!--内部bean-->
<bean id="emp" class="com.example.demo.bean.Emp">
    <!--设置两个普通属性-->
    <property name="ename" value="lucy"></property>
    <property name="gender" value="girl"></property>

    <!--设置对象类型属性-->
    <property name="dept">
        <bean id="demp" class="com.example.demo.bean.Dept">
            <property name="dname" value="安保部"></property>
        </bean>
    </property>
</bean>
```

###### 级联赋值

内部级联赋值

```xml
<!--内部bean-->
<bean id="emp" class="com.example.demo.bean.Emp">
    <!--设置两个普通属性-->
    <property name="ename" value="lucy"></property>
    <property name="gender" value="girl"></property>
    <!--内部级联赋值-->
    <property name="dept" ref="dept"></property>
    <!--需要在类中设置该对象类型属性的get方法-->
    <property name="dept.dname" value="财务部"></property>
</bean>
<bean id="dept" class="com.example.demo.bean.Dept"></bean>
```

外部级联赋值

```xml
<bean id="emp" class="com.example.demo.bean.Emp">
    <!--设置两个普通属性-->
    <property name="ename" value="lucy"></property>
    <property name="gender" value="girl"></property>
    <!--外部级联赋值-->
    <property name="dept" ref="dept"></property>

</bean>
<bean id="dept" class="com.example.demo.bean.Dept">
    <property name="dname" value="开发部"></property>
</bean>
```

###### 注入集合属性

创建具体类

```java
package com.example.demo.bean;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Stu {
    private String[] sname;
    private List<String> lists;
    private Map<String,String> maps;
    private Set<String> sets;
    private List<Course> courseList;

    public void setCourseList(List<Course> courseList) {
        this.courseList = courseList;
    }

    public void setSname(String[] sname) {
        this.sname = sname;
    }

    public void setLists(List<String> lists) {
        this.lists = lists;
    }

    public void setMaps(Map<String, String> maps) {
        this.maps = maps;
    }

    public void setSets(Set<String> sets) {
        this.sets = sets;
    }

    @Override
    public String toString() {
        return "Stu{" +
                "sname=" + Arrays.toString(sname) +
                ", lists=" + lists +
                ", maps=" + maps +
                ", sets=" + sets +
                ", courseList=" + courseList +
                '}';
    }
}
```

XML配置文件

```xml
<!--集合类型属性注入-->
<bean id="stu" class="com.example.demo.bean.Stu">
    <!--数组类型属性注入-->
    <property name="sname">
        <array>
            <value>lucy</value>
            <value>sam</value>
        </array>
    </property>
    <!--List类型属性注入-->
    <property name="lists">
        <list>
            <value>1</value>
            <value>2</value>
        </list>
    </property>
    <!--Map类型属性注入-->
    <property name="maps">
        <map>
            <entry key="JAVA" value="java"></entry>
            <entry key="PHP" value="php"></entry>
        </map>
    </property>
    <!--Set类型属性注入-->
    <property name="sets">
        <set>
            <value>mysql</value>
            <value>redis</value>
        </set>
    </property>
    <!--List类型对象属性注入-->
    <property name="courseList">
        <list>
            <ref bean="course1"></ref>
            <ref bean="course2"></ref>
        </list> 
    </property>
</bean>
<bean id="course1" class="com.example.demo.bean.Course">
    <property name="cname" value="Java课程"></property>
</bean>
<bean id="course2" class="com.example.demo.bean.Course">
    <property name="cname" value="Spring课程"></property>
</bean>
```

提取集合类型属性

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:util="http://www.springframework.org/schema/util"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
                           http://www.springframework.org/schema/util http://www.springframework.org/schema/util/spring-util.xsd">

    <util:list id="bookList">
        <value>金刚经</value>
        <value>阴符经</value>
        <value>易筋经</value>
    </util:list>

    <bean name="books" class="com.example.demo.bean.Book2">
         <property name="books" ref="bookList"></property>
    </bean>

</beans>
```

###### FactoryBean

Spring有两种类型Bean：

- 普通Bean：在配置文件中定义的bean类型就是返回类型
- 工厂Bean：在配置文件中定义的bean类型可以和返回类型不一样

1. 创建类，让这个类作为工厂bean，实现接口FactoryBean
2. 实现接口里面的方法，在实现的方法中定义返回的bean类型

```java
package com.example.demo.bean;

import org.springframework.beans.factory.FactoryBean;

public class Mybean implements FactoryBean<Course> {
    @Override
    public boolean isSingleton() {
        return FactoryBean.super.isSingleton();
    }

    @Override
    public Course getObject() throws Exception {
        Course course=new Course();
        course.setCname("Java");
        return course;
    }

    @Override
    public Class<?> getObjectType() {
        return null;
    }
}
```

XML配置文件

```xml
<bean name="mybean" class="com.example.demo.bean.Mybean">
</bean>
```

##### bean作用域

在spring里面，可以设置创建bean实例是单实例还是多实例。默认为单实例。

标签属性值：

- scope：生命周期
  - singleton     单实例，加载Spring配置文件时就会创建单实例对象（饿汉式）
  - prototype    多实例，在调用getBean方法时创建多实例对象（饿汉式）
  - request        把创建的对象放入请求作用域
  - session         把创建的对象放入session作用域

```xml
<!--singleton 单实例 饿汉式
    prototype 多实例 懒汉式-->
<bean name="books" class="com.example.demo.bean.Book2" scope="prototype">
     <property name="books" ref="bookList"></property>
</bean>
```

##### bean生命周期

从bean对象创建到销毁的过程称为bean生命周期。

1. 通过构造器创建bean实例（无参构造）
2. 为bean对象的属性设置值和对其他bean的引用（调用set方法）
3. 把bean实例传递给bean后置处理器的方法
4. 调用bean的初始化方法（需要进行配置）
5. 把bean实例传递给bean后置处理器的方法
6. bean可以使用了（对象获取到了）
7. 当容器关闭时，调用bean的销毁的方法（需要进行配置）

具体类

```java
package com.example.demo.bean;

public class Life {
    private String lname;
//无参构造
    public Life() {
        System.out.println("第一步，执行无参构造创建bean实例");
    }
    public void setLname(String lname) {
        this.lname = lname;
        System.out.println("第二步，调用set方法设置属性值");
    }

//创建执行的初始化的方法
    public void initMethod()
    {
        System.out.println("第三步，执行初始化的方法");
    }
//创建执行的销毁的方法
    public void destroyMethod()
    {
        System.out.println("第五步，执行销毁的方法");
    }

}
```

后置处理器实现类

```java
package com.example.demo.bean;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;

public class MybeanPost implements BeanPostProcessor {
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("在初始化之前执行的方法");
        return bean;
    }

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("在初始化之后执行的方法");
        return bean;
    }
}
```

测试方法

```java
@Test
public void testLife()
{
    ClassPathXmlApplicationContext context=new ClassPathXmlApplicationContext("bean9.xml");
    Life life=context.getBean("life",Life.class);
    System.out.println("第四步，获取创建bean实例对象");
    System.out.println(life);
    //手动让bean实例销毁
    context.close();
}
```

XML配置文件

标签属性：

- init-method          该bean对象初始化时执行的方法
- destroy-method  该bean对象销毁时执行的方法

```xml
<bean name="life" class="com.example.demo.bean.Life" init-method="initMethod" destroy-method="destroyMethod">
    <property name="lname" value="lucy"></property>
</bean>

<!--配置后置处理器-->
<bean id="mybeanPost" class="com.example.demo.bean.MybeanPost"></bean>
```

##### XML自动装配

根据指定装配规则（属性名称或属性类型），Spring自动将匹配的属性值进行注入



标签属性：

- autowire
  - byName 根据属性名称注入，注入值bean的id值和类属性名称一样
  - byType   根据属性类型注入

```xml
<bean id="emp" class="com.example.demo.autowire.Emp" autowire="byName"/>

<bean id="dept" class="com.example.demo.autowire.Dept"/>
```

##### 外部属性文件

德鲁伊连接池配置



直接配置

```xml
<!--    直接配置德鲁伊连接池-->
    <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource">
        <property name="driverClassName" value="com.mysql.cj.jdbc.Driver"></property>
        <property name="url" value="jdbc:mysql://localhost:3306/userdb"></property>
        <property name="username" value="root"></property>
        <property name="password" value="root"></property>
    </bean>
```



引入外部属性文件配置

创建外部属性文件，properties格式文件

```properties
prop.driverClass=com.mysql.cj.Driver
prop.url=jdbc:mysql://localhost:3306/userdb
prop.userName=root
prop.password=root
```

XML配置文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
                           http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">

    <context:property-placeholder location="classpath:jdbc.properties"/>

    <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource">
        <property name="driverClassName" value="${prop.driverClass}"/>
        <property name="url" value="${prop.url}"/>
        <property name="username" value="${prop.userName}"/>
        <property name="password" value="${prop.password}"/>
    </bean>
</beans>
```

#### 基于注解

什么是注解：

- 注解是代码特殊标记。格式：`@注解名称(属性名称=属性值,属性名称=属性值...)`
- 注解可以作用在类、方法、属性上
- 目的是简化XML配置

Spring针对Bean管理中创建对象提供注释

1. `@Component`
2. `@Service`
3. `@Controller`
4. `@Repository`

##### 创建对象

###### 开启组件扫描

如果扫描多个包，则使用逗号隔开。或扫描包上层目录。

过滤：

`use-default-filters="false"`表示不使用默认过滤器

- `include-filter`包含哪些内容

- `exclude-filter` 不包含哪些内容

  标签属性：

  - type      类型
  - expression  具体表达式

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
                           http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd">


<!--use-default-filters="false"表示不使用默认过滤器
    默认过滤器会扫描包中所有类-->
<context:component-scan base-package="com.example.demo.aopanno" >
<!--    只扫描以下内容-->
<!--    <context:include-filter type="annotation" expression="org.springframework.stereotype.Component"/>-->
<!--    不扫描以下内容-->
<!--    <context:exclude-filter type="annotation" expression="org.springframework.stereotype.Service"/>-->
</context:component-scan>
</beans>
```

##### 属性注入

针对对象属性：

- @Autowired        根据属性类型进行自动装配
- @Qualifier            根据属性名称进行注入
- @Resource           可以根据类型注入，也可以根据名称注入

针对普通类型属性：

- @Value                   注入普通类型属性

单一个@Resource作用相当于@Autowired。



给@Resource设置name属性值则相当于

@Autowired     

@Qualifier(name)一起用    



```java
package com.example.demo.service;

import com.example.demo.dao.UserDao;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

@Service
public class UserService {

    @Value(value = "lucy")
    private String name;
//    @Autowired
//    @Qualifier(value = "userDaoImpl1")
//    private UserDao userDao;

    //不需要设置set属性
    @Resource(name = "userDaoImpl1")
    private UserDao userDao;


    public void add()
    {
        System.out.println("add........"+name);
       // 创建UserDao对象
        userDao.update(name);
    }
}
```

开启组件扫描环节还可以用注解替代

@Configuration表示该类为配置类，代替XML配置文件

```java
@Configuration
@ComponentScan(basePackages = {"com.example.demo"})
public class UserConfiguration {
}
```

测试类

AnnotationConfigApplicationContext构造方法的参数是配置类的class

```java
@Test
public void testUserService()
{
    ApplicationContext context=new AnnotationConfigApplicationContext(UserConfiguration.class);
    UserService userService=context.getBean("userService",UserService.class);
    System.out.println(userService);
    userService.add();
}
```

## AOP

### 概念

**AOP（Aspect-OrientedProgramming，面向切面编程）**，可以说是OOP（Object-Oriented Programing，面向对象编程）的补充和完善。OOP引入封装、继承和多态性等概念来建立一种对象层次结构，用以模拟公共行为的一个集合。当我们需要为分散的对象引入公共行为的时候，OOP则显得无能为力。也就是说，OOP允许你定义**从上到下**的关系，但并不适合定义**从左到右**的关系。例如日志功能。日志代码往往水平地散布在所有对象层次中，而与它所散布到的对象的核心功能毫无关系。对于其他类型的代码，如安全性、异常处理和透明的持续性也是如此。这种散布在各处的无关的代码被称为横切（cross-cutting）代码，在OOP设计中，它导致了大量代码的重复，而不利于各个模块的重用。

 

而AOP技术则恰恰相反，它利用一种称为“横切”的技术，剖解开封装的对象内部，并将那些影响了多个类的公共行为封装到一个可重用模块，并将其名为“Aspect”，即方面。所谓“方面”，简单地说，就是将那些与业务无关，却为业务模块所共同调用的逻辑或责任封装起来，便于减少系统的重复代码，降低模块间的耦合度，并有利于未来的可操作性和可维护性。AOP代表的是一个横向的关系，如果说“对象”是一个空心的圆柱体，其中封装的是对象的属性和行为；那么面向方面编程的方法，就仿佛一把利刃，将这些空心圆柱体剖开，以获得其内部的消息。而剖开的切面，也就是所谓的“方面”了。然后它又以巧夺天功的妙手将这些剖开的切面复原，不留痕迹。

 

使用“横切”技术，AOP把软件系统分为两个部分：**核心关注点**和**横切关注点**。业务处理的主要流程是核心关注点，与之关系不大的部分是横切关注点。横切关注点的一个特点是，他们经常发生在核心关注点的多处，而各处都基本相似。比如权限认证、日志、事务处理。Aop 的作用在于分离系统中的各种关注点，将核心关注点和横切关注点分离开来。正如Avanade公司的高级方案构架师Adam Magee所说，AOP的核心思想就是“将应用程序中的商业逻辑同对其提供支持的通用服务进行分离。”

 

实现AOP的技术，主要分为两大类：一是采用**动态代理**技术，利用截取消息的方式，对该消息进行装饰，以取代原有对象行为的执行；二是采用**静态织入**的方式，引入特定的语法创建“方面”，从而使得编译器可以在编译期间织入有关“方面”的代码。

### AOP使用场景

AOP用来封装横切关注点，具体可以在下面的场景中使用:

- Authentication 权限

- Caching 缓存

- Context passing 内容传递

- Error handling 错误处理

- Lazy loading　懒加载

- Debugging　　调试

- logging, tracing, profiling and monitoring　记录跟踪　优化　校准

- Performance optimization　性能优化

- Persistence　　持久化

- Resource pooling　资源池

- Synchronization　同步

- Transactions 事务

### AOP术语

web层级设计中，web层->网关层->服务层->数据层，每一层之间也是一个切面。**编程中，对象与对象之间，方法与方法之间，模块与模块之间都是一个个切面。**

- `切面（Aspect）`：一个关注点的模块化，这个关注点实现可能另外横切多个对象。事务管理是J2EE应用中一个很好的横切关注点例子。方面用Spring的 Advisor或拦截器实现。
- `连接点（Joinpoint）`: 程序执行过程中明确的点，如方法的调用或特定的异常被抛出。
- `通知（Advice）`: 在特定的连接点，AOP框架执行的动作。各种类型的通知包括“around”、“before”和“throws”通知。通知类型将在下面讨论。许多AOP框架包括Spring都是以拦截器做通知模型，维护一个“围绕”连接点的拦截器链。Spring中定义了四个advice: BeforeAdvice, AfterAdvice, ThrowAdvice和DynamicIntroductionAdvice
- `切入点（Pointcut）`: 指定一个通知将被引发的一系列连接点的集合。AOP框架必须允许开发者指定切入点：例如，使用正则表达式。 Spring定义了Pointcut接口，用来组合MethodMatcher和ClassFilter，可以通过名字很清楚的理解， MethodMatcher是用来检查目标类的方法是否可以被应用此通知，而ClassFilter是用来检查Pointcut是否应该应用到目标类上
- `引入（Introduction）`: 添加方法或字段到被通知的类。 Spring允许引入新的接口到任何被通知的对象。例如，你可以使用一个引入使任何对象实现 IsModified接口，来简化缓存。Spring中要使用Introduction, 可有通过DelegatingIntroductionInterceptor来实现通知，通过DefaultIntroductionAdvisor来配置Advice和代理类要实现的接口
- `目标对象（Target Object）`: 包含连接点的对象。也被称作被通知或被代理对象。POJO
- `AOP代理（AOP Proxy）`: AOP框架创建的对象，包含通知。 在Spring中，AOP代理可以是JDK动态代理或者CGLIB代理。
- `织入（Weaving）`: 组装方面来创建一个被通知对象。这可以在编译时完成（例如使用AspectJ编译器），也可以在运行时完成。Spring和其他纯Java AOP框架一样，在运行时完成织入。

根据定义, `Joint point` 是所有可能被织入 `Advice` 的**候选的点**, 在 Spring AOP中, 则可以认为所有方法执行点都是 `Joint point`.即指哪些目标函数可以被拦截。

所有的方法(joint point) 都可以织入 `Advice`, 但是我们并不希望在所有方法上都织入 `Advice`, 而 `Pointcut` 的作用就是提供一组**规则**来匹配joinpoint, 给满足规则的 joinpoint 添加 `Advice`.

`Advice` 是一个动作, 即一段 Java 代码, 这段 Java 代码是作用于 point cut 所限定的那些 `Joint point` 上的.

`Aspect` 是 point cut 与 `Advice` 的组合

 在 Spring AOP 中 `Joint point` 指代的是所有方法的执行点, 而 point cut 是一个描述信息, 它修饰的是 `Joint point`, 通过 point cut, 我们就可以确定哪些 `Joint point` 可以被织入 `Advice`



通俗描述：

- 连接点：类里面哪些方法可以被增强

- 切入点：实际真正增强的方法

- 通知（增强）：实际增强的逻辑部分

  通知有多种类型

  - 前置通知
  - 后置通知
  - 环绕通知
  - 异常通知
  - 最终通知

- 切面：把通知应用到切入点的过程



### 底层原理

AOP底层使用**动态代理**

- 有接口情况，使用**JDK动态代理**
- 无接口情况，使用**CGLIB动态代理**

#### JDK动态代理

使用Proxy类里面的方法创建代理对象

1.调用newProxyInstance(ClassLoader loader,Class<?>[] interfaces,InvocationHandler h)

该方法有三个参数：

1. 类加载器
2. 增强方法所在类，这个类实现的接口。支持多个接口
3. 实现这个接口InvocationHandler ，创建代理对象，写增强的方法。

底层代码实现

```java
package com.example.demo.proxy;

import com.example.demo.dao.UserDao;
import com.example.demo.dao.UserDaoImpl;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.Arrays;

public class JDKProxy {

    public static void main(String[] args) {

        UserDaoImpl userDao=new UserDaoImpl();

        Class[] interfaces={UserDao.class};
        //  创建接口实现类的代理对象
        //  Proxy.newProxyInstance()强转对象必须是接口类，否则报错
        UserDao dao=(UserDao) Proxy.newProxyInstance(JDKProxy.class.getClassLoader(),interfaces,new UserProxyHandler(userDao));
        int result= dao.add(1,2);
        System.out.println("result="+result);
    }
}
class UserProxyHandler implements InvocationHandler
{

    //    创建谁的代理对象，传递谁
    //    有参构造传递
    private Object obj;
    public UserProxyHandler(Object obj) {
        this.obj=obj;
    }
    //  增强的逻辑
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        //   方法之前
        System.out.println("方法之前进行..."+method.getName()+ Arrays.toString(args));
        //   被增强的方法执行
        Object res=method.invoke(obj,args);
        //   方法之后
        System.out.println("方法之后进行..."+obj);
        return res;
    }
}
```

### AOP操作

Spring框架一般基于**AspectJ**实现AOP操作

AspectJ不是Spring组成部分，是一个独立的AOP框架，一般把AspectJ和Spring框架一起使用，进行AOP操作。

基于AspectJ实现AOP操作：

- 基于XML配置文件实现
- 基于注解方式实现

#### 切入点表达式

切入点表达式作用：知道对哪个类里面的哪个方法进行增强。

语法结构：

`execution([权限修饰符] [返回类型] [类全路径].[方法名称] ([参数列表]))`

例子1：对com.yumo.dao.BookDao类里面的add方法进行增强：

`execution(* com.yumo.dao.BookDao.add(..))     `

- `*`表示匹配所有
- 返回类型可省略不写
- `..`在参数列表表示方法中的参数

例子2：对com.yumo.dao.BookDao类里面的所有方法进行增强：

`execution(* com.yumo.dao.BookDao.*(..))   `  

例子3：对com.yumo.dao包里面的所有类，类里面的所有方法进行增强：

`execution(* com.yumo.dao.*.*(..))     `

#### 注解方式

1、创建类，在类里面定义方法

```java
package com.example.demo.aopanno;

import org.springframework.stereotype.Component;
//被增强类

@Component(value = "user")
public class User {
    public void add()
    {
        System.out.println("add......");
    }
}
```

2、创建增强类（编写增强逻辑）

在增强类里面创建方法，让不同放啊代表不同通知类型

3、进行通知的配置

1. 在Spring配置文件中，开启注解扫描；或创建配置类使用注解。

```java
@Configuration
@ComponentScan(basePackages = {"com.example.demo"})
public class UserConfiguration {
}
```

1. 使用注解创建User和UserProxy对象 `@Component`
2. 在增强类上面添加注解`@AspectJ`
3. 在Spring配置文件中开启生成代理对象

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:aop="http://www.springframework.org/schema/aop"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
                           http://www.springframework.org/schema/aop http://www.springframework.org/schema/aop/spring-aop.xsd
                           http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd">


<context:component-scan base-package="com.example.demo.aopanno" ></context:component-scan>
    <!--开启Aspect生成代理对象-->
    <aop:aspectj-autoproxy></aop:aspectj-autoproxy>
</beans>
```

或在增强类上使用注解`@EnableAspectJAutoProxy`

4、配置不同类型的通知

在增强类的里面，在作为通知方法上面添加通知类型注解，使用切入点表达式进行配置。

5、相同的切入点抽取`  @Pointcut	`

6、在多个增强类对同一个被增强类的同一切入点进行增强时，设置增强类优先级。

在增强类上面添加`@Order(数字类型值)`，数字类型值越小，优先级越高。

```java
package com.example.demo.aopanno;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.stereotype.Component;

@Component
@Aspect      //生成代理对象
@EnableAspectJAutoProxy
public class UserProxy {
    //    相同的切入点抽取
    @Pointcut("execution(* com.example.demo.aopanno.User.add(..))")
    public void pointcut()
    {

    }
    //    前置通知
    @Before("pointcut()")
    public void before() {
        System.out.println("before....");
    }

    //    最终通知
    @After("pointcut()")
    public void after() {
        System.out.println("after....");
    }

    //    异常通知
    @AfterThrowing("pointcut()")
    public void afterThrowing() {
        System.out.println("afterThrowing....");
    }

    //    环绕通知
    @Around("pointcut()")
    public void around(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        System.out.println("环绕之前");
        proceedingJoinPoint.proceed();
        System.out.println("环绕之后");
    }
    //     后置（返回）通知，有异常不执行
    @AfterReturning("pointcut()")
    public void afterReturning()
    {
        System.out.println("afterReturning....");
    }

}
```

#### 配置文件方式

1、创建两个类，增强类BookProxy和被增强类Book，创建方法

```java
package com.example.demo.aopxml;

public class Book {

    public void buy(){
        System.out.println("buy......");
    }
}
```

```java
package com.example.demo.aopxml;

public class BookProxy {
    public void before()
    {
        System.out.println("before.........");
    }
}
```



2、在spring配置文件中创建两个类对象

```xml
<bean id="book" class="com.example.demo.aopxml.Book"/>
<bean id="bookProxy" class="com.example.demo.aopxml.BookProxy"/>
```



3、在spring配置文件中配置切入点

```xml
<aop:config>
    
    <!--切入点-->
    <aop:pointcut id="p" expression="execution(* com.example.demo.aopxml.Book.buy(..))"/>
    
    <!--配置切面-->
    <aop:aspect ref="bookProxy">
        <!--增强作用在具体的方法上-->
        <aop:before method="before" pointcut-ref="p"/>
    </aop:aspect>
    
</aop:config>
```



## 事务管理

### 概念

事务是用户定义的数据库操作的集合，这些操作作为一个完整的有机工作单元，要么全部正确执行，要么全部不执行。
四大特性：

- 原子性（atomicity）。一个事务是一个不可分割的工作单位，事务中包括的操作要么都做，要么都不做。

- 一致性（consistency）。事务必须是使数据库从一个一致性状态变到另一个一致性状态。一致性与原子性是密切相关的。

- 隔离性（isolation）。一个事务的执行不能被其他事务干扰。即一个事务内部的操作及使用的数据对并发的其他事务是隔离的，并发执行的各个事务之间不能互相干扰。

- 持久性（durability）。持续性也称永久性（permanence），指一个事务一旦提交，它对数据库中数据的改变就应该是永久性的。接下来的其他操作或故障不应该对其有任何影响。

#### 作用

以银行转账为例，若业务方法没有事务时,假如在业务方法执行时发生异常,有可能会造成数据库数据不一致。
解决方法是在业务方法中加入事务。***若发生异常，事务回滚（回滚方法由Spring事务自动完成，不需要自定义）。***





### 常用API

1）**`PlatformTransactionManager`**：平台事务管理器
Spring进行事务操作时候，主要使用一个PlatformTransactionManager接口，它表示事务管理器，即真正管理事务的对象。
Spring并不直接管理事务，通过这个接口，Spring为各个平台如JDBC、Hibernate等都提供了对应的事务管理器，也就是将事务管理的职责委托给Hibernate或者JTA等持久化机制所提供的相关平台框架的事务来实现。
Spring针对不同的持久化框架，提供了不同PlatformTransactionManager接口的实现类：

org.springframework.jdbc.datasource.**DataSourceTransactionManager** ：使用 Spring JDBC或MyBatis 进行持久化数据时使用

org.springframework.orm.hibernate3.**HibernateTransactionManager** ：使用 Hibernate版本进行持久化数据时使用

2）Spring的这组接口是如何进行事务管理的
平台事务管理器根据事务定义的信息进行事务的管理，事务管理的过程中产生一些状态，将这些状态记录到TrancactionStatus里面。

### 具体操作

在spring中进行事务管理操作有两种方式：

- 编程式事务管理
- 声明式事务管理
  - 基于注解方式
  - 基于xml配置文件方式

#### 声明式事务管理

##### 基于XML

在Spring的配置文件中进行配置

1、开启组件扫描

```xml
<context:component-scan base-package="com.example"></context:component-scan>
```

2、配置数据库连接池

```xml
<context:component-scan base-package="com.example"></context:component-scan>

<context:property-placeholder location="classpath:jdbc.properties"/>
<bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource" destroy-method="close">
    <property name="driverClassName" value="${prop.driverClassName}"/>
    <property name="url" value="${prop.url}"/>
    <property name="username" value="${prop.username}"/>
    <property name="password" value="${prop.password}"/>
</bean>
```

3、配置JdbcTemplate

```xml
<bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
    <property name="dataSource" ref="dataSource"/>
</bean>
```

4、配置**事务管理器**

```xml
<!--创建事务管理器-->
    <bean id="dataSourceTransactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <!--注入数据源-->
        <property name="dataSource" ref="dataSource"/>
    </bean>
```

5、配置**通知**

```xml
<!--配置通知-->
<tx:advice id="txadvice">
    <tx:attributes>
        <!--指定在哪种规则的方法上添加事务-->
        <tx:method name="actor*" propagation="REQUIRED" isolation="SERIALIZABLE"/>
    </tx:attributes>
</tx:advice>
```

6、配置**切入点**和**切面**

```xml
<!--配置切入点和切面-->
<aop:config>
    <!--配置切入点-->
    <aop:pointcut id="pt" expression="execution(* com.example.demo.service.ActorService.*(..))"/>
    <!--配置切面-->
    <aop:advisor advice-ref="txadvice" pointcut-ref="pt"/>
</aop:config>
```



##### 基于注解

1、开启组件扫描

```xml
<context:component-scan base-package="com.example"></context:component-scan>
```

2、配置数据库连接池

```xml
<context:component-scan base-package="com.example"></context:component-scan>

<context:property-placeholder location="classpath:jdbc.properties"/>
<bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource" destroy-method="close">
    <property name="driverClassName" value="${prop.driverClassName}"/>
    <property name="url" value="${prop.url}"/>
    <property name="username" value="${prop.username}"/>
    <property name="password" value="${prop.password}"/>
</bean>
```

3、配置JdbcTemplate

```xml
<bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
    <property name="dataSource" ref="dataSource"/>
</bean>
```

4、配置事务管理器

```xml
<!--创建事务管理器-->
<bean id="dataSourceTransactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
    <!--注入数据源-->
    <property name="dataSource" ref="dataSource"/>
</bean>
```

5、开启事务注解

（1）引入名称空间tx

（2）开启事务注解

```xml
<!--开启事务注解-->
<tx:annotation-driven transaction-manager="dataSourceTransactionManager"></tx:annotation-driven>
```

6、在Service类上面或类里面方法上面添加事务注解**`@Transactional`**

- 如果加在类上，表示这个类里面所有的方法都添加事务
- 如果加在方法上，表示为这个方法添加事务

其底层原理通过AOP实现

该注解可添加的参数如下：

### TransactionDefinition：事务定义信息

事务定义信息有：

- 隔离级别
- **传播行为**
- 超时信息
- 是否只读

#### 事务传播行为

**propagation**              事务传播行为

多**事务方法**直接进行调用，这个过程中事务是如何进行管理的

- 事务方法：对数据库表数据进行变化的操作

**保证在同一个事务中**

- PROPAGATION_**REQUIRED**：required , 必须。支持当前事务，如果不存在，就新建一个(**默认**)

  如果有事务在运行，当前的方法就在这个事务内运行，否则就启动一个新的事务，并在自己的事务内运行。

- PROPAGATION_**SUPPORTS**：supports ，支持。支持当前事务，如果不存在，就不使用事务

  如果有事务在运行，当前的方法就在这个事务内运行，否则它可以不运行在事务中。

- PROPAGATION_**MANDATORY**：mandatory ，强制。支持当前事务，如果不存在，就抛出异常

  当前的方法必须运行在事务内部，若没有正在运行的事务，则抛出异常。



**保证没有在同一个事务中**

- PROPAGATION_**REQUIRES_NEW**：requires_new，必须新的。如果有事务存在，挂起当前事务，创建一个新的事务

  当前的方法必须启动新事务，并在它自己的事务内运行，如果有事务正在运行，应该将它挂起。

- PROPAGATION_**NOT_SUPPORTED**：not_supported ,不支持。以非事务方式运行，如果有事务存在，挂起当前事务

  当前的方法不应该运行在事务中，如果有运行的事务，将它挂起。

- PROPAGATION_**NEVER**：never，从不。以非事务方式运行，如果有事务存在，抛出异常

  当前的方法不应该运行在事务中，如果有运行的事务，则抛出异常。

- PROPAGATION_**NESTED**：nested ，嵌套。如果当前事务存在，则嵌套事务执行

  如果有事务在运行，当前的方法就应该在这个事务的嵌套事务内运行。否则就启动一个新的事务，并在它自己的事务内运行。

#### 隔离级别

**isolation**                     事务隔离级别

隔离级别：定义了一个事务可能受其他并发事务影响的程度。

并发事务引起的问题：典型的应用程序中，多个事务并发运行，经常会操作相同的数据来完成各自的任务。并发虽然是必须的，但可能会导致以下的问题。

**脏读**（Dirty reads）——脏读发生在一个事务读取了另一个事务改写但尚未提交的数据时。如果改写在稍后被回滚了，那么第一个事务获取的数据就是无效的。

**不可重复读**（Nonrepeatable read）——不可重复读发生在一个事务执行相同的查询两次或两次以上，但是每次都得到不同的数据时。这通常是因为另一个并发事务在两次查询期间进行了**更新**。

**幻读**（Phantom read）——幻读与不可重复读类似。它发生在一个事务（T1）读取了几行数据，接着另一个并发事务（T2）**插入**了一些数据时。在随后的查询中，第一个事务（T1）就会发现多了一些原本不存在的记录。

|                                      | 脏读 | 不可重复读 | 幻读 |
| ------------------------------------ | ---- | ---------- | ---- |
| READ UNCOMMITTED<br />（读未提交）   | 有   | 有         | 有   |
| READ COMMITTED<br />（读已提交）     | 无   | 有         | 有   |
| REPEATABLE<br />（可重复读）（默认） | 无   | 无         | 有   |
| SERIALIZABLE<br />（串行化）         | 无   | 无         | 无   |

解决读问题：设置事务的隔离级别

- 未提交读：脏读，不可重复读，虚读都有可能发生
- 已提交读：避免脏读。但是不可重复读和虚读都有可能发生
- 可重复读：避免脏读和不可重复读。但是虚读有可能发生
- 串行化的：避免以上所有读问题



#### 超时时间

**timeout**                       超时时间

为了使应用程序很好地运行，事务不能运行太长的时间。因为事务可能涉及对后端数据库的锁定，所以长时间的事务会不必要的占用数据库资源。事务超时就是事务的一个定时器，在特定时间内事务如果没有执行完毕，那么就会自动回滚，而不是一直等待其结束。

- -1      默认值，不超时
- 以秒为单位的数值     

#### 是否只读

readOnly                     是否只读

读：查询          写：添加修改删除操作

这是事务的第三个特性，是否为只读事务。如果事务只对后端的数据库进行该操作，数据库可以利用事务的只读特性来进行一些特定的优化。通过将事务设置为只读，你就可以给数据库一个机会，让它应用它认为合适的优化措施。

- false        默认值，表示可以增删改查
- true         只能查询



其他参数：

**rollbackFor**                  回滚

设置出现哪些异常进行事务回滚

**noRollbackFor**            不回滚

设置出现哪些异常不进行事务回滚

### 完全注解开发

创建配置类

`@Configuration`   代表是配置类



开启组件扫描

`@ComponentScan(basePackages = "com.example")`



创建数据库连接池

```java
@Bean
public DruidDataSource getDruidDataSource(){
    DruidDataSource druidDataSource = new DruidDataSource();
    druidDataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
    druidDataSource.setUrl("jdbc:mysql://localhost:3306/crashcourse?serverTimezone=GMT&rewriteBatchedStatements=true");
    druidDataSource.setUsername("root");
    druidDataSource.setPassword("123");
    return druidDataSource;
}
```

创建JdbcTemplate对象

```java
//创建JdbcTemplate
@Bean
public JdbcTemplate getJdbcTemplate(DataSource dataSource){

    JdbcTemplate jdbcTemplate = new JdbcTemplate();
    //注入DataSource,到IOC容器中根据类型进行注入
    jdbcTemplate.setDataSource(dataSource);
    return jdbcTemplate;
}
```

创建事务管理器对象

```java
//创建事务管理器对象
@Bean
public DataSourceTransactionManager getDataSourceTransactionManager(DataSource dataSource){
    DataSourceTransactionManager dataSourceTransactionManager = new DataSourceTransactionManager();
    dataSourceTransactionManager.setDataSource(dataSource);
    return dataSourceTransactionManager;
}
```



完整代码如下

```java
package com.example.demo.config;

import com.alibaba.druid.pool.DruidDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

@Configuration  //代表是配置类
@ComponentScan(basePackages = "com.example")
@EnableTransactionManagement //开启事务
public class TxConfig {

    //创建数据库连接池
    @Bean
    public DruidDataSource getDruidDataSource(){
        DruidDataSource druidDataSource = new DruidDataSource();

        druidDataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        druidDataSource.setUrl("jdbc:mysql://localhost:3306/crashcourse?serverTimezone=GMT&rewriteBatchedStatements=true");
        druidDataSource.setUsername("root");
        druidDataSource.setPassword("168178");
        return druidDataSource;
    }

    //创建JdbcTemplate
    @Bean
    public JdbcTemplate getJdbcTemplate(DataSource dataSource){

        JdbcTemplate jdbcTemplate = new JdbcTemplate();
        //注入DataSource,到IOC容器中根据类型进行注入
        jdbcTemplate.setDataSource(dataSource);
        return jdbcTemplate;
    }

    //创建事务管理器对象
    @Bean
    public DataSourceTransactionManager getDataSourceTransactionManager(DataSource dataSource){
        DataSourceTransactionManager dataSourceTransactionManager = new DataSourceTransactionManager();
        dataSourceTransactionManager.setDataSource(dataSource);
        return dataSourceTransactionManager;
    }



}