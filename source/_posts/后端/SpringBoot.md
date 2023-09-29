---
title: SpringBoot自动配置底层源码分析
date: 2022-04-28 16:51:33
tags:
- 后端
- Spring
- SpringBoot
- Java
categories:
- 后端
---

# 自动配置原理

## 依赖管理

- 父项目做依赖管理
  - 依赖管理 

```xml

<parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.6.7</version>
</parent>
```

他的父项目几乎声明了所有开发中常用的依赖的版本号,自动版本仲裁机制

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-dependencies</artifactId>
    <version>2.6.7</version>
</parent>
```

- 开发导入starter场景启动器

1、见到很多 spring-boot-starter-* ： *就某种场景
2、只要引入starter，这个场景的所有常规需要的依赖我们都自动引入
3、SpringBoot所有支持的场景
https://docs.spring.io/spring-boot/docs/current/reference/html/using.html#using.build-systems.starters
4、见到的  *-spring-boot-starter： 第三方为我们提供的简化开发的场景启动器。
5、所有场景启动器最底层的依赖

```xml
<dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter</artifactId>
      <version>2.6.7</version>
      <scope>compile</scope>
</dependency>
```

- 无需关注版本号，自动版本仲裁

  - 引入依赖默认都可以不写版本

  - 引入非版本仲裁的jar，要写版本号。

- 可以修改默认版本号

  - 1、查看spring-boot-dependencies里面规定当前依赖的版本 用的 key。

  - 2、在当前项目里面重写配置

```xml
<properties>
    <mysql.version>5.1.43</mysql.version>
</properties>
```

## 自动配置

- 自动配好Tomcat

- - 引入Tomcat依赖。
  - 配置Tomcat

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-tomcat</artifactId>
    <version>2.6.7</version>
    <scope>compile</scope>
</dependency>
```

- 自动配好SpringMVC

- - 引入SpringMVC全套组件
  - 自动配好SpringMVC常用组件（功能）

- 自动配好Web常见功能，如：字符编码问题

- - SpringBoot帮我们配置好了所有web开发的常见场景

- ```xml
  <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-web</artifactId>
      <version>5.3.19</version>
      <scope>compile</scope>
  </dependency>
  <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-webmvc</artifactId>
      <version>5.3.19</version>
      <scope>compile</scope>
  </dependency>
  ```

- 

- 默认的包结构

- - 主程序所在包及其下面的所有子包里面的组件都会被默认扫描进来

- ```
  com
   +- example
       +- myapplication
           +- MyApplication.java
           |
           +- customer
           |   +- Customer.java
           |   +- CustomerController.java
           |   +- CustomerService.java
           |   +- CustomerRepository.java
           |
           +- order
               +- Order.java
               +- OrderController.java
               +- OrderService.java
               +- OrderRepository.java
  ```

- 

- - 无需以前的包扫描配置
    - 想要改变扫描路径，@SpringBootApplication(scanBasePackages=**"com.yumo"**)

- - - 或者@ComponentScan 指定扫描路径

```java
@SpringBootApplication
等同于
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan("com.yumo.boot")
```



- 各种配置拥有默认值

- - 默认配置最终都是映射到某个类上，如：MultipartProperties
  - 配置文件的值最终会绑定每个类上，这个类会在容器中创建对象

- **按需加载**所有自动配置项

- - 非常多的starter
  - 引入了哪些场景这个场景的自动配置才会开启
  - SpringBoot所有的自动配置功能都在 spring-boot-autoconfigure 包里面
  - 

- ......

# 容器功能

## 组件添加

### @Configuration

- 基本使用
- **Full模式与Lite模式**

- - 示例
  - 最佳实战

- - - 配置 类组件之间无依赖关系用Lite模式加速容器启动过程，减少判断
    - 配置类组件之间有依赖关系，方法会被调用得到之前单实例组件，用Full模式



```java
#############################Configuration使用示例######################################################
package com.yumo.config;

import com.yumo.pojo.Pet;
import com.yumo.pojo.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @Author: yumo
 * @Description: TODO
 * @DateTime: 2022/4/28 13:47
 * 告诉SpringBoot这是一个配置类
 * 配置类里面使用@Bean标注在方法上给容器注册组件，默认也是单实例的
 * 属性proxyBeanMethods:代理bean的方法
 *      全模式Full (proxyBeanMethods=false)
 *      轻量级模式Lite (proxyBeanMethods=ture)
 *      组建依赖
 **/
@Configuration(proxyBeanMethods=true)
public class MyConfig {

    /**
     * 给容器中添加组件，以方法名为组件的id
     * @return 返回类型就是组件类型，返回的值就是组件在容器中的实例
     * 注：外部无论对配置类中的这个组件注册方法调用多少次，获取的都是之前注册容器中的单实例对象
     */
    @Bean
    public User user01(){
        User user = new User("张三", 18);
        //User组件依赖了Pet组件
        user.setPet(tomcatPet());
        return user;
    }

    @Bean("tom")
    public Pet tomcatPet(){
        return new Pet("tomcat");
    }
}



################################@Configuration测试代码如下########################################
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.Arrays;

/**
 * @Author: yumo
 * @Description: TODO
 * @DateTime: 2022/4/27 21:00
 **/

@SpringBootApplication
public class MainApplication {
    public static void main(String[] args) {
        //1、返回IOC容器
        ConfigurableApplicationContext run = SpringApplication.run(MainApplication.class, args);
        //2、查看容器里面的组件
        String[] names = run.getBeanDefinitionNames();
        Arrays.asList(names).forEach(System.out::println);

        //从容器中获取组件


        /**@Configuration(proxyBeanMethods=true):
         * com.yumo.config.MyConfig$$EnhancerBySpringCGLIB$$d5be9e0d@12e0f1cb
         *
         * @Configuration(proxyBeanMethods=false):
         * com.yumo.config.MyConfig@54d8c20d
        */
        MyConfig bean = run.getBean(MyConfig.class);
        System.out.println("bean = " + bean);

        Pet tom01 = run.getBean("tom", Pet.class);

        Pet tom02 = run.getBean("tom", Pet.class);

        System.out.println("tom01 = " + tom01);
        System.out.println("tom02 = " + tom02);


        User user1 = bean.user01();
        User user2 = bean.user01();

        /**@Configuration(proxyBeanMethods=true):
         * true
         *
         * @Configuration(proxyBeanMethods=false):
         * false
         */
        System.out.println(user1==user2);

        User user01 = run.getBean("user01", User.class);
        Pet tom = run.getBean("tom", Pet.class);
        System.out.println("用户的宠物："+(user01.getPet()==tom));
    }
}
```

### @Bean、@Component、@Controller、@Service、@Repository



### @ComponentScan、@Import

```java
 * 4、@Import({User.class, DBHelper.class})
 *      给容器中自动创建出这两个类型的组件、默认组件的名字就是全类名
 *
 *
 *
 */

@Import({User.class, DBHelper.class})
@Configuration(proxyBeanMethods = false) //告诉SpringBoot这是一个配置类 == 配置文件
public class MyConfig {
}
```

@Import 高级用法： https://www.bilibili.com/video/BV1gW411W7wy?p=8

### @Conditional

条件装配：满足Conditional指定的条件，则进行组件注入

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220428182317754.png)

```java
=====================测试条件装配==========================
@Import({User.class,Pet.class})
@Configuration(proxyBeanMethods=true)
//@ConditionalOnBean(name = "tom")
@ConditionalOnMissingBean(name = "tom")
public class MyConfig {

    /**
     * 给容器中添加组件，以方法名为组件的id
     * @return 返回类型就是组件类型，返回的值就是组件在容器中的实例
     * 注：外部无论对配置类中的这个组件注册方法调用多少次，获取的都是之前注册容器中的单实例对象
     */
    @Bean
    public User user01(){
        User user = new User("张三", 18);
        //User组件依赖了Pet组件
        user.setPet(tomcatPet());
        return user;
    }

    @Bean("tom22")
    public Pet tomcatPet(){
        return new Pet("tomcat");
    }
}

public static void main(String[] args) {
        //1、返回我们IOC容器
        ConfigurableApplicationContext run = SpringApplication.run(MainApplication.class, args);

        //2、查看容器里面的组件
        String[] names = run.getBeanDefinitionNames();
        for (String name : names) {
            System.out.println(name);
        }

        boolean tom = run.containsBean("tom");
        System.out.println("容器中Tom组件："+tom);

        boolean user01 = run.containsBean("user01");
        System.out.println("容器中user01组件："+user01);

        boolean tom22 = run.containsBean("tom22");
        System.out.println("容器中tom22组件："+tom22);


    }
```

## 原生配置文件引入

### @ImportResource

```xml
======================beans.xml=========================
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://www.springframework.org/schema/context https://www.springframework.org/schema/context/spring-context.xsd">

    <bean id="haha" class="com.atguigu.boot.bean.User">
        <property name="name" value="zhangsan"></property>
        <property name="age" value="18"></property>
    </bean>

    <bean id="hehe" class="com.atguigu.boot.bean.Pet">
        <property name="name" value="tomcat"></property>
    </bean>
</beans>
```

```java
@ImportResource("classpath:beans.xml")
public class MyConfig {}

======================测试=================
boolean haha = run.containsBean("haha");
boolean hehe = run.containsBean("hehe");
System.out.println("haha："+haha);//true
System.out.println("hehe："+hehe);//true
```



## 配置绑定 

如何使用Java读取到properties文件中的内容，并且把它封装到JavaBean中，以供随时使用；

```java
public class getProperties {
     public static void main(String[] args) throws FileNotFoundException, IOException {
         Properties pps = new Properties();
         pps.load(new FileInputStream("a.properties"));
         Enumeration enum1 = pps.propertyNames();//得到配置文件的名字
         while(enum1.hasMoreElements()) {
             String strKey = (String) enum1.nextElement();
             String strValue = pps.getProperty(strKey);
             System.out.println(strKey + "=" + strValue);
             //封装到JavaBean。
         }
     }
 }
```



### @EnableConfigurationProperties + @ConfigurationProperties

```java
/**
 * @Author: yumo
 * @Description: TODO
 * @DateTime: 2022/4/28 13:47
 * 告诉SpringBoot这是一个配置类
 * 配置类里面使用@Bean标注在方法上给容器注册组件，默认也是单实例的
 * 属性proxyBeanMethods:代理bean的方法
 *      全模式Full (proxyBeanMethods=false)
 *      轻量级模式Lite (proxyBeanMethods=ture)
 *      组建依赖
 *
 * 注解 @Import({User.class,Pet.class})
 *      给容器中自动创建出这两个类型的组件,默认组件的名字就是全类名
 *
 *
 * 注解 @EnableConfigurationProperties(Car.class)
 *      开启Car配置绑定功能
 *      把Car这个组件自动注册到容器中，而无需在Car类上添加@Component
 **/
@Import({User.class,Pet.class})
@Configuration(proxyBeanMethods=true)
//@ConditionalOnBean(name = "tom")
@ConditionalOnMissingBean(name = "tom")
@ImportResource("classpath:beans.xml")
@EnableConfigurationProperties(Car.class)
public class MyConfig {
```



```java
/**
 * @Author: yumo
 * @Description: TODO
 * @DateTime: 2022/4/28 14:41
 *
 * 只有在容器中的组件，才能享受到SpringBoot的强大功能
 **/
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
//@Component
@ConfigurationProperties(prefix = "mycar")
public class Car {

    private String brand;
    private String price;
}
```

### @Component + @ConfigurationProperties

```java
/**
 * @Author: yumo
 * @Description: TODO
 * @DateTime: 2022/4/28 14:41
 *
 * 只有在容器中的组件，才能享受到SpringBoot的强大功能
 **/
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Component
@ConfigurationProperties(prefix = "mycar")
public class Car {

    private String brand;
    private String price;
}
```

# 自动配置原理

## 引导加载自动配置类

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(excludeFilters = { @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
		@Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
public @interface SpringBootApplication {}


======================
    
```

### 1、@SpringBootConfiguration

**`@Configuration`**。代表当前是一个配置类

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Configuration
@Indexed
public @interface SpringBootConfiguration {

	@AliasFor(annotation = Configuration.class)
	boolean proxyBeanMethods() default true;

}
```



### 2、@ComponentScan

指定扫描哪些，Spring注解；

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Documented
@Repeatable(ComponentScans.class)
public @interface ComponentScan {}
```

### 3、@EnableAutoConfiguration

```java
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage
@Import(AutoConfigurationImportSelector.class)
public @interface EnableAutoConfiguration {

	/**
	 * Environment property that can be used to override when auto-configuration is
	 * enabled.
	 */
	String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";

	/**
	 * Exclude specific auto-configuration classes such that they will never be applied.
	 * @return the classes to exclude
	 */
	Class<?>[] exclude() default {};

	/**
	 * Exclude specific auto-configuration class names such that they will never be
	 * applied.
	 * @return the class names to exclude
	 * @since 1.3.0
	 */
	String[] excludeName() default {};

}
```

#### 1、@AutoConfigurationPackage

自动配置包，指定了默认的包规则

```java
@Import(AutoConfigurationPackages.Registrar.class)  
public @interface AutoConfigurationPackage {}

/**
 * Registers packages with {@link AutoConfigurationPackages}. When no {@link #basePackages
 * base packages} or {@link #basePackageClasses base package classes} are specified, the
 * package of the annotated class is registered.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@Import(AutoConfigurationPackages.Registrar.class)//给容器中导入一个组件
public @interface AutoConfigurationPackage {

	/**
	 * Base packages that should be registered with {@link AutoConfigurationPackages}.
	 * <p>
	 * Use {@link #basePackageClasses} for a type-safe alternative to String-based package
	 * names.
	 */
	String[] basePackages() default {};

	/**
	 * Type-safe alternative to {@link #basePackages} for specifying the packages to be
	 * registered with {@link AutoConfigurationPackages}.
	 * <p>
	 * Consider creating a special no-op marker class or interface in each package that
	 * serves no purpose other than being referenced by this attribute.
	 */
	Class<?>[] basePackageClasses() default {};

}
```

##### Registrar.registerBeanDefinitions()

AutoConfigurationPackages类的Registrar静态内部类

利用Registrar给容器中导入一系列组件

```java
/**
 * {@link ImportBeanDefinitionRegistrar} to store the base package from the importing
 * configuration.
 */
static class Registrar implements ImportBeanDefinitionRegistrar, DeterminableImports {

   @Override
   public void registerBeanDefinitions(AnnotationMetadata metadata, BeanDefinitionRegistry registry) {
      register(registry, new PackageImports(metadata).getPackageNames().toArray(new String[0]));
   }

   @Override
   public Set<Object> determineImports(AnnotationMetadata metadata) {
      return Collections.singleton(new PackageImports(metadata));
   }

}
```

该方法调用的**`register`**方法中传递了参数` new PackageImports(metadata).getPackageNames().toArray(new String[0])`

其中`new PackageImports(metadata).getPackageNames()`得到**该注解标识的类所在的包**。

然后将其转换为数组作为形参。



将指定的一个包（**MainApplication** 所在包）下的所有组件导入进来。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220428152116891.png)

##### register()

```java
private static final String BEAN = AutoConfigurationPackages.class.getName();
```

该方法以编程方式注册自动配置包名称。后来的调用会将**给定的包名（packageNames）**添加到**已经被注册的包名**（AutoConfigurationPackages类在**IOC容器**registry中注册的**组件**beanDefinition）。

首先通过if语句判断当前IOC容器registry中是否包含有已被注册的包名所对应的组件：

- 若为ture，则说明当前的注册方法是将参数中给定的包名packageNames添加到已被注册的包名中
- 否则，调用registerBeanDefinition方法，将给定的包名packageNames创建为组件，并作为参数传入

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220428153231267.png)

##### registerBeanDefinition()

```java
/** Map of bean definition objects, keyed by bean name. */
private final Map<String, BeanDefinition> beanDefinitionMap = new ConcurrentHashMap<>(256);
```

###### 验证

调用validate方法验证参数beanName和beanDeficition是否为空

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220428155506784.png)

###### 更新

从当前DefaultListableBeanFactory类的IOC容器beanDefinitionMap中获取与参数beanName对应的组件

- 若该组件存在，则判断是否允许组件重写

  - 若不允许，则抛出BeanDefinitionOverrideException异常
  - 若运行，则进行日志的记录

  最后将beanName所对应的新组件beanDefinition放入IOC容器中。至此完成bean重写

- 若不存在，则调用hasBeanCreationStarted方法判断IOC容器的组件创建解析进程是否已经开始

  - 若已开始，则**同步**进行IOC容器各项属性的更新
  - 否则，仍然强制进行更新

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220428161408746.png)

至此，完成向容器中组件的注册。

#### 2、@Import(AutoConfigurationImportSelector.class)

AutoConfigurationImportSelector类

##### selectImports()

利用`getAutoConfigurationEntry(annotationMetadata);`给容器中批量导入一些组件

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220428165224353.png)

##### getAutoConfigurationEntry

###### 获取注解属性

调用getArrtibute方法获取参数annotationMetadata属性

可以看到参数annotationMetadata中包含了所有注解的类型及其所标识的类，

由arrtibutes可知该注解需要**排除**的组件类型(exclude)及名称(excludeName)

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220428171148919.png)

###### 获取配置类组件

调用`List<String> configurations = getCandidateConfigurations(annotationMetadata, attributes)`获取到所有需要导入到容器中的配置类

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220428165839003.png)

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220428170719853.png)

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220428172120937.png)

利用工厂加载 `Map<String, List<String>> loadSpringFactories(@Nullable ClassLoader classLoader)；`得到所有的组件

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220428172212026.png)

**获取资源**

从META-INF/spring.factories位置来加载一个文件

默认扫描我们当前系统里面所有**META-INF/spring.factories**位置的文件

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220428173218912.png)

 spring-boot-autoconfigure-2.6.7.jar包里面也有**META-INF/spring.factories**

一共**`133`**行

```properties
# Auto Configure
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.admin.SpringApplicationAdminJmxAutoConfiguration,\
org.springframework.boot.autoconfigure.aop.AopAutoConfiguration,\
org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration,\
org.springframework.boot.autoconfigure.batch.BatchAutoConfiguration,\
org.springframework.boot.autoconfigure.cache.CacheAutoConfiguration,\
org.springframework.boot.autoconfigure.cassandra.CassandraAutoConfiguration,\
org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration,\
org.springframework.boot.autoconfigure.context.LifecycleAutoConfiguration,\
org.springframework.boot.autoconfigure.context.MessageSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration,\
org.springframework.boot.autoconfigure.couchbase.CouchbaseAutoConfiguration,\
org.springframework.boot.autoconfigure.dao.PersistenceExceptionTranslationAutoConfiguration,\
org.springframework.boot.autoconfigure.data.cassandra.CassandraDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.cassandra.CassandraReactiveDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.cassandra.CassandraReactiveRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.cassandra.CassandraRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.couchbase.CouchbaseDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.couchbase.CouchbaseReactiveDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.couchbase.CouchbaseReactiveRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.couchbase.CouchbaseRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.elasticsearch.ReactiveElasticsearchRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.elasticsearch.ReactiveElasticsearchRestClientAutoConfiguration,\
org.springframework.boot.autoconfigure.data.jdbc.JdbcRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.ldap.LdapRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.mongo.MongoReactiveDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.mongo.MongoReactiveRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.mongo.MongoRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.neo4j.Neo4jDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.neo4j.Neo4jReactiveDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.neo4j.Neo4jReactiveRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.neo4j.Neo4jRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.r2dbc.R2dbcDataAutoConfiguration,\
org.springframework.boot.autoconfigure.data.r2dbc.R2dbcRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,\
org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration,\
org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration,\
org.springframework.boot.autoconfigure.data.rest.RepositoryRestMvcAutoConfiguration,\
org.springframework.boot.autoconfigure.data.web.SpringDataWebAutoConfiguration,\
org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchRestClientAutoConfiguration,\
org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration,\
org.springframework.boot.autoconfigure.freemarker.FreeMarkerAutoConfiguration,\
org.springframework.boot.autoconfigure.groovy.template.GroovyTemplateAutoConfiguration,\
org.springframework.boot.autoconfigure.gson.GsonAutoConfiguration,\
org.springframework.boot.autoconfigure.h2.H2ConsoleAutoConfiguration,\
org.springframework.boot.autoconfigure.hateoas.HypermediaAutoConfiguration,\
org.springframework.boot.autoconfigure.hazelcast.HazelcastAutoConfiguration,\
org.springframework.boot.autoconfigure.hazelcast.HazelcastJpaDependencyAutoConfiguration,\
org.springframework.boot.autoconfigure.http.HttpMessageConvertersAutoConfiguration,\
org.springframework.boot.autoconfigure.http.codec.CodecsAutoConfiguration,\
org.springframework.boot.autoconfigure.influx.InfluxDbAutoConfiguration,\
org.springframework.boot.autoconfigure.info.ProjectInfoAutoConfiguration,\
org.springframework.boot.autoconfigure.integration.IntegrationAutoConfiguration,\
org.springframework.boot.autoconfigure.jackson.JacksonAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.JdbcTemplateAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.JndiDataSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.XADataSourceAutoConfiguration,\
org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration,\
org.springframework.boot.autoconfigure.jms.JmsAutoConfiguration,\
org.springframework.boot.autoconfigure.jmx.JmxAutoConfiguration,\
org.springframework.boot.autoconfigure.jms.JndiConnectionFactoryAutoConfiguration,\
org.springframework.boot.autoconfigure.jms.activemq.ActiveMQAutoConfiguration,\
org.springframework.boot.autoconfigure.jms.artemis.ArtemisAutoConfiguration,\
org.springframework.boot.autoconfigure.jersey.JerseyAutoConfiguration,\
org.springframework.boot.autoconfigure.jooq.JooqAutoConfiguration,\
org.springframework.boot.autoconfigure.jsonb.JsonbAutoConfiguration,\
org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration,\
org.springframework.boot.autoconfigure.availability.ApplicationAvailabilityAutoConfiguration,\
org.springframework.boot.autoconfigure.ldap.embedded.EmbeddedLdapAutoConfiguration,\
org.springframework.boot.autoconfigure.ldap.LdapAutoConfiguration,\
org.springframework.boot.autoconfigure.liquibase.LiquibaseAutoConfiguration,\
org.springframework.boot.autoconfigure.mail.MailSenderAutoConfiguration,\
org.springframework.boot.autoconfigure.mail.MailSenderValidatorAutoConfiguration,\
org.springframework.boot.autoconfigure.mongo.embedded.EmbeddedMongoAutoConfiguration,\
org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration,\
org.springframework.boot.autoconfigure.mongo.MongoReactiveAutoConfiguration,\
org.springframework.boot.autoconfigure.mustache.MustacheAutoConfiguration,\
org.springframework.boot.autoconfigure.neo4j.Neo4jAutoConfiguration,\
org.springframework.boot.autoconfigure.netty.NettyAutoConfiguration,\
org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,\
org.springframework.boot.autoconfigure.quartz.QuartzAutoConfiguration,\
org.springframework.boot.autoconfigure.r2dbc.R2dbcAutoConfiguration,\
org.springframework.boot.autoconfigure.r2dbc.R2dbcTransactionManagerAutoConfiguration,\
org.springframework.boot.autoconfigure.rsocket.RSocketMessagingAutoConfiguration,\
org.springframework.boot.autoconfigure.rsocket.RSocketRequesterAutoConfiguration,\
org.springframework.boot.autoconfigure.rsocket.RSocketServerAutoConfiguration,\
org.springframework.boot.autoconfigure.rsocket.RSocketStrategiesAutoConfiguration,\
org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration,\
org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration,\
org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration,\
org.springframework.boot.autoconfigure.security.reactive.ReactiveSecurityAutoConfiguration,\
org.springframework.boot.autoconfigure.security.reactive.ReactiveUserDetailsServiceAutoConfiguration,\
org.springframework.boot.autoconfigure.security.rsocket.RSocketSecurityAutoConfiguration,\
org.springframework.boot.autoconfigure.security.saml2.Saml2RelyingPartyAutoConfiguration,\
org.springframework.boot.autoconfigure.sendgrid.SendGridAutoConfiguration,\
org.springframework.boot.autoconfigure.session.SessionAutoConfiguration,\
org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration,\
org.springframework.boot.autoconfigure.security.oauth2.client.reactive.ReactiveOAuth2ClientAutoConfiguration,\
org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration,\
org.springframework.boot.autoconfigure.security.oauth2.resource.reactive.ReactiveOAuth2ResourceServerAutoConfiguration,\
org.springframework.boot.autoconfigure.solr.SolrAutoConfiguration,\
org.springframework.boot.autoconfigure.sql.init.SqlInitializationAutoConfiguration,\
org.springframework.boot.autoconfigure.task.TaskExecutionAutoConfiguration,\
org.springframework.boot.autoconfigure.task.TaskSchedulingAutoConfiguration,\
org.springframework.boot.autoconfigure.thymeleaf.ThymeleafAutoConfiguration,\
org.springframework.boot.autoconfigure.transaction.TransactionAutoConfiguration,\
org.springframework.boot.autoconfigure.transaction.jta.JtaAutoConfiguration,\
org.springframework.boot.autoconfigure.validation.ValidationAutoConfiguration,\
org.springframework.boot.autoconfigure.web.client.RestTemplateAutoConfiguration,\
org.springframework.boot.autoconfigure.web.embedded.EmbeddedWebServerFactoryCustomizerAutoConfiguration,\
org.springframework.boot.autoconfigure.web.reactive.HttpHandlerAutoConfiguration,\
org.springframework.boot.autoconfigure.web.reactive.ReactiveMultipartAutoConfiguration,\
org.springframework.boot.autoconfigure.web.reactive.ReactiveWebServerFactoryAutoConfiguration,\
org.springframework.boot.autoconfigure.web.reactive.WebFluxAutoConfiguration,\
org.springframework.boot.autoconfigure.web.reactive.WebSessionIdResolverAutoConfiguration,\
org.springframework.boot.autoconfigure.web.reactive.error.ErrorWebFluxAutoConfiguration,\
org.springframework.boot.autoconfigure.web.reactive.function.client.ClientHttpConnectorAutoConfiguration,\
org.springframework.boot.autoconfigure.web.reactive.function.client.WebClientAutoConfiguration,\
org.springframework.boot.autoconfigure.web.servlet.DispatcherServletAutoConfiguration,\
org.springframework.boot.autoconfigure.web.servlet.ServletWebServerFactoryAutoConfiguration,\
org.springframework.boot.autoconfigure.web.servlet.error.ErrorMvcAutoConfiguration,\
org.springframework.boot.autoconfigure.web.servlet.HttpEncodingAutoConfiguration,\
org.springframework.boot.autoconfigure.web.servlet.MultipartAutoConfiguration,\
org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration,\
org.springframework.boot.autoconfigure.websocket.reactive.WebSocketReactiveAutoConfiguration,\
org.springframework.boot.autoconfigure.websocket.servlet.WebSocketServletAutoConfiguration,\
org.springframework.boot.autoconfigure.websocket.servlet.WebSocketMessagingAutoConfiguration,\
org.springframework.boot.autoconfigure.webservices.WebServicesAutoConfiguration,\
org.springframework.boot.autoconfigure.webservices.client.WebServiceTemplateAutoConfiguration
```

该文件里面写死了spring-boot一启动就要给容器中加载的所有配置类

从而得到所有的**Configuration自动配置类组件**



 

## 按需开启自动配置项 

虽然133个场景的所有自动配置启动的时候默认全部加载。xxxxAutoConfiguration
按照条件装配规则（**@Conditional**），最终会按需配置。

### DispatcherServletAutoConfiguration

在此以DispatcherServletAutoConfiguration为例：

```java
@AutoConfigureOrder(Ordered.HIGHEST_PRECEDENCE)
@Configuration(proxyBeanMethods = false)
@ConditionalOnWebApplication(type = Type.SERVLET)
@ConditionalOnClass(DispatcherServlet.class)
@AutoConfigureAfter(ServletWebServerFactoryAutoConfiguration.class)
public class DispatcherServletAutoConfiguration {
```

- `@ConditionalOnWebApplication(type = Type.SERVLET)    当该应用是一个web应用时
- `@ConditionalOnClass(DispatcherServlet.class)                  当DispatcherSevlet类存在时
- `@AutoConfigureAfter(ServletWebServerFactoryAutoConfiguration.class)`    要在`ServletWebServerFactoryAutoConfiguration`类配置之后

如果不满足其中任何一个条件，则该配置类不会进行自动配置。



#### DispatcherServletConfiguration

当全部满足后，开始进行自动配置：

静态内部类**`DispatcherServletConfiguration`**：

- `@Configuration(proxyBeanMethods = false)`                                表示该类是配置类，且不使用代理模式
- `@Conditional(DefaultDispatcherServletCondition.class)`     表示条件是DefaultDispatcherServletCondition类存在
- `@ConditionalOnClass(ServletRegistration.class)`                    表示条件是ServletRegistration类存在
- `@EnableConfigurationProperties(WebMvcProperties.class) `   表示WebMvcProperties类开启配置绑定

##### dispatcherServlet

```java
public static final String DEFAULT_DISPATCHER_SERVLET_BEAN_NAME = "dispatcherServlet";

public static final String DEFAULT_DISPATCHER_SERVLET_REGISTRATION_BEAN_NAME = "dispatcherServletRegistration";

@Configuration(proxyBeanMethods = false)
@Conditional(DefaultDispatcherServletCondition.class)
@ConditionalOnClass(ServletRegistration.class)
@EnableConfigurationProperties(WebMvcProperties.class)
protected static class DispatcherServletConfiguration {

   @Bean(name = DEFAULT_DISPATCHER_SERVLET_BEAN_NAME)
   public DispatcherServlet dispatcherServlet(WebMvcProperties webMvcProperties) {
      DispatcherServlet dispatcherServlet = new DispatcherServlet();
      dispatcherServlet.setDispatchOptionsRequest(webMvcProperties.isDispatchOptionsRequest());
      dispatcherServlet.setDispatchTraceRequest(webMvcProperties.isDispatchTraceRequest());
      dispatcherServlet.setThrowExceptionIfNoHandlerFound(webMvcProperties.isThrowExceptionIfNoHandlerFound());
      dispatcherServlet.setPublishEvents(webMvcProperties.isPublishRequestHandledEvents());
      dispatcherServlet.setEnableLoggingRequestDetails(webMvcProperties.isLogRequestDetails());
      return dispatcherServlet;
   }

   @Bean
   @ConditionalOnBean(MultipartResolver.class)
   @ConditionalOnMissingBean(name = DispatcherServlet.MULTIPART_RESOLVER_BEAN_NAME)
   public MultipartResolver multipartResolver(MultipartResolver resolver) {
      // Detect if the user has created a MultipartResolver but named it incorrectly
      return resolver;
   }

}
```

dispatcherServlet方法上的注解**`@Bean(name = DEFAULT_DISPATCHER_SERVLET_BEAN_NAME)`**说明会自动将返回值注册为名字为**`dispatcherServlet`**的组件

在该方法中new了一个DispatcherServlet类对象，在设置完一堆东西后返回这个对象，由此可以看出DispatcherServlet类已经由SpringBoot在底层进行了自动创建。

##### multipartResolver

```java
@Bean
@ConditionalOnBean(MultipartResolver.class) 
@ConditionalOnMissingBean(name = DispatcherServlet.MULTIPART_RESOLVER_BEAN_NAME) 
public MultipartResolver multipartResolver(MultipartResolver resolver) {

    // Detect if the user has created a MultipartResolver but named it incorrectly
    return resolver;
}
```

- `@ConditionalOnBean(MultipartResolver.class) `              容器中有MultipartResolver文件上传解析器类型组件
- `@ConditionalOnMissingBean(name = DispatcherServlet.MULTIPART_RESOLVER_BEAN_NAME) `             容器中没有名为 multipartResolver 的组件

给@Bean标注的方法传入了对象参数，这个参数的值就会从容器中找。

防止用户创建了MultipartResolver类的组件，但名字不符合规范。

因为@Bean的缘故，在返回该对象时会将其注册为一个组件，在其过程中对同类型而不同名的组件进行了**重命名（Override）**。





## 修改默认配置

SpringBoot默认会在底层配好所有的组件。但是如果用户自己配置了以用户的优先

下面以HttpEncodingAutoConfiguration类为例：

### HttpEncodingAutoConfiguration

```java
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(ServerProperties.class)
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnClass(CharacterEncodingFilter.class)
@ConditionalOnProperty(prefix = "server.servlet.encoding", value = "enabled", matchIfMissing = true)
public class HttpEncodingAutoConfiguration {
```

- **`@EnableConfigurationProperties(ServerProperties.class)`**

  开启配置绑定，与ServerProperties类进行绑定

- **`@ConditionalOnClass(CharacterEncodingFilter.class)`**

  条件为CharacterEncodingFilter字符编码类存在

- **`@ConditionalOnProperty(prefix = "server.servlet.encoding", value = "enabled", matchIfMissing = true)`**

  条件为 属性前缀为server.servlet.encoding的值enabled为ture时，默认为true

#### HttpEncodingAutoConfiguration

```java
private final Encoding properties;

public HttpEncodingAutoConfiguration(ServerProperties properties) {
   this.properties = properties.getServlet().getEncoding();
}
```

构造器方法以ServerProperties类对象为参数，调用`properties.getServlet().getEncoding()`赋给this.properties，从而获取到ServerProperties类中关于encoding的属性值

#### characterEncodingFilter

```java
@Bean
@ConditionalOnMissingBean
public CharacterEncodingFilter characterEncodingFilter() {
   CharacterEncodingFilter filter = new OrderedCharacterEncodingFilter();
   filter.setEncoding(this.properties.getCharset().name());
   filter.setForceRequestEncoding(this.properties.shouldForce(Encoding.Type.REQUEST));
   filter.setForceResponseEncoding(this.properties.shouldForce(Encoding.Type.RESPONSE));
   return filter;
}
```

- 创建OrderedCharacterEncodingFilter类对象
- 获取this.properties的charset属性值，并将其设置为该filter对象的encoding
- 强制设置请求和响应的编码
- 返回该对象并注册为组件

**`@ConditionalOnMissingBean`**表示条件为没有创建这个组件时：

- 若用户没有进行CharacterEncodingFilter组件的注册，则进行该方法注册为新的组件
- 否则不进行该方法

加了**`@ConditionalOnMissingBean`**注解的均为spring boot底层默认配置，但如果用户自定义了这些组件，则这些默认配置失效。

此为定制化配置。

## 自动配置流程总结

- SpringBoot先加载所有的自动配置类  xxxxxAutoConfiguration
- 每个自动配置类按照**条件装配规则**进行生效，默认都会绑定配置文件指定的值。xxxxProperties里面拿。xxxProperties和配置文件进行了绑定
- 生效的配置类就会给容器中装配很多组件
- 只要容器中有这些组件，相当于这些功能就有了
- 定制化配置

- - 用户直接自己@Bean替换底层的组件
  - 用户去看这个组件是获取的配置文件什么值就去修改。

**xxxxxAutoConfiguration ---> 组件  --->** **xxxxProperties里面拿值  ----> application.properties**