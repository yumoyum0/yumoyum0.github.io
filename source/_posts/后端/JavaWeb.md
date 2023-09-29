---
title: JavaWeb
date: 2022-04-17 16:51:33
tags:
- 后端
- Web
- Java
categories:
- 后端
---

## CS和BS

**CS:客户端服务器架构模式**

- 优点∶充分利用客户端机器的资源，减轻服务器的负荷(一部分安全要求不高的计算任务存储任务放在客户端执行，不需要把所有的计算和存储都在服务器端执行，从而能够减轻服务器的压力，也能够减轻网络负荷)
- 缺点∶需要安装﹔升级维护成本较高

- 

**BS∶浏览器服务器架构模式**

- 优点︰客户端不需要安装;维护成本较低
- 缺点∶所有的计算和存储任务都是放在服务器端的，服务器的负荷较重∶在服务端计算完成之后把结果再传输给客户端，因此客户端和服务器端会进行非常频繁的数据通信，从而网络负荷较重

## Tomcat

版本对应关系

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220413183653206.png)



Tomcat集成maven进行数据库操作时的500错误

记录一个折磨我6小时之久的异常。在IDEA中tomcat集成maven，相关依赖明明都已经导入，且这些包下的类也能正常使用，但部署到tomcat后却显示找不到这些包的类

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220414112738037.png)

解决办法：在WEB-INF下lib中引入maven中依赖的包（？为什么用了maven还是需要导包）

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220414112836420.png)

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220414112943904.png)

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220414113006813.png)

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220414130437595.png)

## Servlet

### 什么是Servlet

   Servlet（Server Applet），全称Java Servlet，未有中文译文。是用Java编写的服务器端程序。其主要功能在于交互式地浏览和修改数据，生成动态Web内容。狭义的Servlet是指Java语言实现的一个接口，广义的Servlet是指任何实现了这个Servlet接口的类，一般情况下，人们将Servlet理解为后者。

Servlet运行于支持Java的应用服务器中。从实现上讲，Servlet可以响应任何类型的请求，但绝大多数情况下Servlet只用来扩展基于HTTP协议的Web服务器。

### Servlet的工作模式

- 客户端发送请求至服务器
- 服务器启动并调用Servlet，Servlet根据客户端请求生成响应内容并将其传给服务器
- 服务器将响应返回客户端

**Servlet 的使用方法**

Servlet技术的核心是Servlet，**它是所有Servlet类必须直接或者间接实现的一个接口**。在编写实现Servlet的Servlet类时，直接实现它。在扩展实现这个这个接口的类时，间接实现它。

### 工作原理

Servlet接口定义了Servlet与servlet容器之间的契约。这个契约是：Servlet容器将Servlet类载入内存，并产生Servlet实例和调用它具体的方法。但是要注意的是，在一个应用程序中，每种Servlet类型只能有一个实例。

用户请求致使Servlet容器调用Servlet的Service（）方法，并传入一个ServletRequest对象和一个ServletResponse对象。ServletRequest对象和ServletResponse对象都是由Servlet容器（例如TomCat）封装好的，并不需要程序员去实现，程序员可以直接使用这两个对象。

ServletRequest中封装了当前的Http请求，因此，开发人员不必解析和操作原始的Http数据。ServletResponse表示当前用户的Http响应，程序员只需直接操作ServletResponse对象就能把响应轻松的发回给用户。

对于每一个应用程序，Servlet容器还会创建一个ServletContext对象。这个对象中封装了上下文（应用程序）的环境详情。每个应用程序只有一个ServletContext。每个Servlet对象也都有一个封装Servlet配置的ServletConfig对象。

### 获取参数并发送给数据库

调用req.getParameter方法。

 Servlet容器对于接受到的每一个Http请求，都会创建一个ServletRequest对象，并把这个对象传递给Servlet的Sevice( )方法。其中，ServletRequest对象内封装了关于这个请求的许多详细信息。

部分接口

public interface ServletRequest {


```java
int getContentLength();//返回请求主体的字节数
 
String getContentType();//返回主体的MIME类型
 
String getParameter(String var1);//返回请求参数的值
```

#### 示例程序

AddServlet.java

```java
package com.yumo.servlets;

import com.yumo.fruit.dao.FruitDAO;
import com.yumo.fruit.dao.Impl.FruitDAOImpl;
import com.yumo.fruit.pojo.Fruit;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class AddServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

       

        req.setCharacterEncoding("UTF-8");
        String fname = req.getParameter("fname");
        String priceStr = req.getParameter("price");
        Integer price = Integer.parseInt(priceStr);
        String fcountStr = req.getParameter("fcount");
        Integer fcount=Integer.parseInt(fcountStr);
        String remark = req.getParameter("remark");

        System.out.println(fname);
        FruitDAO fruitDAO = new FruitDAOImpl();
        boolean flag = fruitDAO.addFruit(new Fruit(10, fname, price, fcount, remark));

        System.out.println(flag?"添加成功":"添加失败");

    }
}
```

Fruit.java

```java
package com.yumo.fruit.pojo;

import lombok.Data;

@Data
public class Fruit {
    private Integer fid;
    private String fname;
    private Integer price;
    private Integer fcount;
    private String remark;

    public Fruit(Integer fid, String fname, Integer price, Integer fcount, String remark) {
        this.fid = fid;
        this.fname = fname;
        this.price = price;
        this.fcount = fcount;
        this.remark = remark;
    }

    public Fruit() {
    }
}
```



FruitDAO.java

```java
package com.yumo.fruit.dao;

import com.yumo.fruit.pojo.Fruit;

public interface FruitDAO {
    boolean addFruit(Fruit fruit);
}
```



FruitDAOImpl.java

```java
package com.yumo.fruit.dao.Impl;

import com.yumo.fruit.dao.FruitDAO;
import com.yumo.fruit.pojo.Fruit;
import com.yumo.fruit.utils.JDBCUtilByDruid;
import org.apache.commons.dbutils.QueryRunner;


import java.sql.Connection;
import java.sql.SQLException;

public class FruitDAOImpl implements FruitDAO {
    private QueryRunner qr=new QueryRunner();
    @Override
    public boolean addFruit(Fruit fruit) {
        Connection connection=null;

        Integer fid = fruit.getFid();
        String fname = fruit.getFname();
        Integer price = fruit.getPrice();
        Integer fcount = fruit.getFcount();
        String remark = fruit.getRemark();
        try {
            String sql="INSERT INTO fruit VALUES(?,?,?,?,?)";
            connection= JDBCUtilByDruid.getConnection();
            int update = qr.update(connection, sql,fid,fname,price,fcount,remark);
            return update != 0;
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }finally {
            JDBCUtilByDruid.close(null,null,connection);
        }
    }

    public void test()
    {
        Connection connection=null;

        Integer fid = 4;
        String fname = "abc";
        Integer price =2;
        Integer fcount = 30;
        String remark = "OK";
        try {
            String sql="INSERT INTO fruit VALUES(?,?,?,?,?)";
            connection= JDBCUtilByDruid.getConnection();
            int update = qr.update(connection, sql,fid,fname,price,fcount,remark);
            System.out.println(update>0?"成功":"失败");
        } catch (SQLException e) {
            //将编译异常->运行异常，方便使用者抛出或捕获
            throw new RuntimeException(e);
        }finally {
            JDBCUtilByDruid.close(null,null,connection);
        }
    }
}
```

JDBCUtilByDruid.java

```java
package com.yumo.fruit.utils;

import com.alibaba.druid.pool.DruidDataSourceFactory;

import javax.sql.DataSource;
import java.io.FileInputStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

public class JDBCUtilByDruid {
    private static DataSource ds;

    static {
        Properties properties = new Properties();
        try {
            properties.load(new FileInputStream("E:\\WebJava\\src\\druid.properties"));
            ds= DruidDataSourceFactory.createDataSource(properties);
        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }
    public static Connection getConnection()throws SQLException
    {
        return ds.getConnection();
    }
    public static void close(ResultSet resultSet, Statement statement,Connection connection)
    {
        try {
            if(resultSet!=null){
                resultSet.close();
            }
            if (statement!=null){
                statement.close();
            }
            if (connection!=null){
                connection.close();
            }
        }catch (SQLException e)
        {
            throw new RuntimeException(e);
        }
    }
}
```

### 设置编码

调用req.setCharacterEncoding方法。

tomcat8之前设置编码

- * get请求方式

    get方式目前不需要设置编码(基于tomcat8)

    如果是get请求发送的中文数据，转码方式如下(tomcat8之前)

    * String fname = req.getParameter("fname");
    * 1.将字符串打散成字节数组
    * byte[] bytes = fname.getBytes("ISO-8859-1");
    * 2.将字节数组按照设定得编码重新组装成字符串
    * fname=new String(bytes,"UTF-8");

  * post请求方式

    * req.setCharacterEncoding("UTF-8");

 * tomcat8之后设置编码，只需要针对post方式
   * req.setCharacterEncoding("UTF-8");

### Servlet的继承关系

HttpServlet -> GenericServlet -> Servlet

![image-20220414173454770](C:\Users\yumo\AppData\Roaming\Typora\typora-user-images\image-20220414173454770.png)

核心方法：

- void init(ServletConfig var1)  初始化
- void **service**(ServletRequest var1, ServletResponse var2)  服务
- void destroy()                  销毁

基本流程：

1. 当有请求过来时，service方法会自动响应(tomcat容器调用)

2. 在HttpServlet中去分析请求的方式是get、post、head还是delete等等，然后决定调用哪个do开头的方法

   在HttpServlet中这些do方法默认都是405的风格-要我们子类去实现方法，否则报405错误

3. 因此，我们在新建Servlet时才回去考虑请求方法，从而决定重写哪个do方法

#### 源码分析



可见最顶层的Servlet接口定义了如下的方法

```java
public interface Servlet {
    void init(ServletConfig var1) throws ServletException;

    ServletConfig getServletConfig();

    void service(ServletRequest var1, ServletResponse var2) throws ServletException, IOException;

    String getServletInfo();

    void destroy();
}
```

并由其子类GenericServlet继承了其方法

```java
public abstract class GenericServlet implements Servlet, ServletConfig, Serializable {
......
	public void destroy() {
    }
    public void init(ServletConfig config) throws ServletException {
        this.config = config;
        this.init();
    }

    public void init() throws ServletException {
    }
    
     public abstract void service(ServletRequest var1, ServletResponse var2) throws ServletException, IOException;

}
```



其子类HttpServlet具体实现了service方法，并定义了一系列do方法

```java
public abstract class HttpServlet extends GenericServlet {
	 protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String method = req.getMethod();
        long lastModified;
        if (method.equals("GET")) {
            lastModified = this.getLastModified(req);
            if (lastModified == -1L) {
                this.doGet(req, resp);
            } else {
                long ifModifiedSince;
                try {
                    ifModifiedSince = req.getDateHeader("If-Modified-Since");
                } catch (IllegalArgumentException var9) {
                    ifModifiedSince = -1L;
                }

                if (ifModifiedSince < lastModified / 1000L * 1000L) {
                    this.maybeSetLastModified(resp, lastModified);
                    this.doGet(req, resp);
                } else {
                    resp.setStatus(304);
                }
            }
        } else if (method.equals("HEAD")) {
            lastModified = this.getLastModified(req);
            this.maybeSetLastModified(resp, lastModified);
            this.doHead(req, resp);
        } else if (method.equals("POST")) {
            this.doPost(req, resp);
        } else if (method.equals("PUT")) {
            this.doPut(req, resp);
        } else if (method.equals("DELETE")) {
            this.doDelete(req, resp);
        } else if (method.equals("OPTIONS")) {
            this.doOptions(req, resp);
        } else if (method.equals("TRACE")) {
            this.doTrace(req, resp);
        } else {
            String errMsg = lStrings.getString("http.method_not_implemented");
            Object[] errArgs = new Object[]{method};
            errMsg = MessageFormat.format(errMsg, errArgs);
            resp.sendError(501, errMsg);
        }

    }
}
```

该方法String method = req.getMethod();获取请求方法，接下来进行判断并执行其对应的do方法

例如doGet

```java
protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    String msg = lStrings.getString("http.method_get_not_supported");
    this.sendMethodNotAllowed(req, resp, msg);
}
```

可见其方法默认报405错误，因此需要其子类去重写do方法。

### Servlet的生命周期

#### **生命周期**

从从出生到死亡的过程。在这里即是实例化初始化，然后服务，最终销毁的过程

默认情况下，第一次接收请求时，这个servlet会实例化(tomcat底层通过反射调用)和初始化，然后再服务。

好处：提高系统的启动速度

缺点：第一次请求时耗时较长

因此：如果要提高系统的启动速度，就选择当前默认的情况。若要提高系统的响应速度，应该设置servlet的初始化时机。

由下面的示例程序可见，servlet是**单例**的。

#### 设置servlet的初始化时机

在web.xml中的对应< servlet >标签下，通过< load-on-startuo >来设置servlet启动的先后顺序，数字越小，启动越靠前，最小值为0.

#### Servlet是线程不安全的

因为Servlet是线程不安全的，所有尽量不要再servlet中定义成员变量。若不得不定义，则不要通过成员变量来进行逻辑判断。

#### 注解

Servlet在3.0后支持注解：

从而可以把如下代码

```xml
<servlet>
    <servlet-name>IndexServlet</servlet-name>
    <servlet-class>com.yumo.servlets.IndexServlet</servlet-class>
</servlet>

<servlet-mapping>
    <servlet-name>IndexServlet</servlet-name>
    <url-pattern>/index</url-pattern>
</servlet-mapping>
```

改为在IndexServlet类上添加注解

```java
@WebServlet("/index")
public class IndexServlet extends ViewBaseServlet {......}
```

#### 示例程序

```java
package com.yumo.servlets;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class ServletDemo02 extends HttpServlet {

    public ServletDemo02() {
        System.out.println("实例化...");
    }

    @Override
    public void init() throws ServletException {
        System.out.println("初始化...");
    }

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        System.out.println("服务...");
    }

    @Override
    public void destroy() {
        System.out.println("销毁");
    }
}
```

### Http协议

Http称之为**超文本传输协议**。

Http是**无状态**的。

Http请求响应包含两个部分：请求和响应

- **请求**

  包含三部分：

  - **请求行**  

    包含三个部分

    - 请求的方式
    - 请求的URL
    - 请求的协议（一般是HTTP1.1）

  - **请求消息头**   包含了很多客户端需要告诉服务器的信息。如浏览器型号、版本、能接受的媒体类型、能发送的媒体类型。

  - **请求主体**  

    三种情况

    - get方式      无请求体，但是有一个queryString
    - post方式    有请求体，form data
    - json方式     有请求体，request payload

- **响应**

  包含三部分

  - **响应行**

    包含三部分

    - 协议
    - 响应状态码
    - 响应状态

  - **响应头**  包含了服务器的信息，服务器发送给浏览器的信息（内容的媒体类型，编码，内容长度等）

  - **响应体**    响应的实际内容



### 会话

Http是无状态的：服务器无法判断这两次请求是同一个客户端发过来的，还是不同的客户端发过来的。

无状态带来的现实问题：第一次请求是添加商品到购物车，第二次请求是结账；如果这两次请求服务器无法区分是同一个用户的，那么就会导致混乱

可以通过会话跟踪技术来解决无状态问题

#### 会话跟踪技术

客户端第一次发请求给服务器，服务器会获取session，如过获取不到，则创建新的，然后响应给客户端。

下次客户端给服务器发请求时，会把sessionId带给服务器，服务器从而获取到session，那么服务器就判断这一次请求和上次某次是同一个客户端，从而进行区分

##### 常用API

`request.getSession()  `                            获取当前的会话，没有则创建一个新的会话

`request.getSession(true) `                     效果和不带参数相同

`request.getSession(false)  `                   获取当前会话，没有则返回null，不会创建新的

`session.getId() `                                        获取sessionId

`session.isNew()  `                                          判断当前session是否是最新的

`session.getCreationTime() `                     获取session的创建时间
`session.getLastAccessedTime() `              获取session的最后一次激活时间

`session.getMaxInactiveInterval()`         获取session的非激活间隔时长，默认1800秒

`session.setMaxInactiveInterval() `        设置session的非激活间隔时长

`session.invalidate()   `                                  强制让会话立即失效

#### session保存作用域

session保存作用域适合具体的某一个session对应的

##### 常用API

void session,setAttribute(k,v)

Object session.getAttribute(k)

void removeAttribute

#### 服务器内部转发和客户端重定向

**服务器内部转发**：`req.getRequestDispatcher("......").forward(req,resp);`

一次请求响应的过程，对于客户端而言，内部经过了多少次转发，客户端不知道。

浏览器上显示的URL不发生变化

![image-20220414201506944](C:\Users\yumo\AppData\Roaming\Typora\typora-user-images\image-20220414201506944.png)



**客户端重定向**：`resp.sendRedirect("......");`

两次请求响应的过程，客户端知道请求URL发生变化。

浏览器上显示的URL发生变化。

![image-20220414201859792](C:\Users\yumo\AppData\Roaming\Typora\typora-user-images\image-20220414201859792.png)

### Thymeleaf

thymeleaf是一种视图模板技术

#### 使用步骤

1、添加thymeleaf相关jar包依赖

2、新建一个Servlet类ViewBaseServlet

```java
package com.yumo.servlets;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.WebContext;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ServletContextTemplateResolver;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class ViewBaseServlet extends HttpServlet {

    private TemplateEngine templateEngine;

    @Override
    public void init() throws ServletException {

        // 1.获取ServletContext对象
        ServletContext servletContext = this.getServletContext();

        // 2.创建Thymeleaf解析器对象
        ServletContextTemplateResolver templateResolver = new ServletContextTemplateResolver(servletContext);

        // 3.给解析器对象设置参数
        // ①HTML是默认模式，明确设置是为了代码更容易理解
        templateResolver.setTemplateMode(TemplateMode.HTML);

        // ②设置前缀
        String viewPrefix = servletContext.getInitParameter("view-prefix");

        templateResolver.setPrefix(viewPrefix);

        // ③设置后缀
        String viewSuffix = servletContext.getInitParameter("view-suffix");

        templateResolver.setSuffix(viewSuffix);

        // ④设置缓存过期时间（毫秒）
        templateResolver.setCacheTTLMs(60000L);

        // ⑤设置是否缓存
        templateResolver.setCacheable(true);

        // ⑥设置服务器端编码方式
        templateResolver.setCharacterEncoding("utf-8");

        // 4.创建模板引擎对象
        templateEngine = new TemplateEngine();

        // 5.给模板引擎对象设置模板解析器
        templateEngine.setTemplateResolver(templateResolver);

    }

    protected void processTemplate(String templateName, HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 1.设置响应体内容类型和字符集
        resp.setContentType("text/html;charset=UTF-8");

        // 2.创建WebContext对象
        WebContext webContext = new WebContext(req, resp, getServletContext());

        // 3.处理模板数据
        templateEngine.process(templateName, webContext, resp.getWriter());
    }
}
```

3、在web.xml中添加配置

- 配置前缀 view-prefix
- 配置后缀 view-suffix

```xml
<context-param>
    <param-name>view-prefix</param-name>
    <param-value>/</param-value>
</context-param>
<context-param>
    <param-name>view-suffix</param-name>
    <param-value>.html</param-value>
</context-param>
```

4、使IndexServlet继承ViewBaseServlet

```java
package com.yumo.servlets;

import com.yumo.fruit.dao.FruitDAO;
import com.yumo.fruit.dao.Impl.FruitDAOImpl;
import com.yumo.fruit.pojo.Fruit;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;


@WebServlet("/index")
public class IndexServlet extends ViewBaseServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        FruitDAO fruitDAO=new FruitDAOImpl();
        List<Fruit> fruitList = fruitDAO.getFruitList();

        //保存到session作用域
        HttpSession session = req.getSession();
        session.setAttribute("fruitList",fruitList);
        session.setAttribute("uusername","root");
        /**
         * 此处的视图名称是 index
         * 那么thymeleaf会将这个 逻辑视图名称 对应到 物理视图名称 上去
         * 逻辑视图名称：         index
         * 物理视图名称：        view-preffix + 逻辑视图名称 + view-suffix
         * 真实视图名称：          /index.html
         */
        super.processTemplate("index",req,resp);


    }
}
```

5、根据逻辑视图名称得到物理视图名称

此处的视图名称是 index

那么thymeleaf会将这个 逻辑视图名称 对应到 物理视图名称 上去

逻辑视图名称：         index

物理视图名称：        view-preffix + 逻辑视图名称 + view-suffix

真实视图名称：          /index.html

super.processTemplate("index",req,resp);

常用标签：< th:if >  < th:unless >  < th:each >    <th:text >

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="css/index.css"></head>
<body>

<div id="div_container">
    <div id="div_fruit_list">
        <p class="center f30">欢迎使用水果库存后台管理系统</p>
        <table id="tbl_fruit">
            <tr >
                <th class="w20">名称</th>
                <th class="w20">单价</th>
                <th class="w20">库存</th>
                <th class="w20">操作</th>
            </tr>
            <tr th:if="${#lists.isEmpty(session.fruitList)}">

                <td colspan="4" >对不起，库存为空！</td>
            </tr>
            <tr th:unless="${#lists.isEmpty(session.fruitList)}"  th:each="fruit : ${session.fruitList}">
                <td th:text="${fruit.fname}">西瓜</td>
                <td th:text="${fruit.price}">3</td>
                <td th:text="${fruit.fcount}">20</td>
                <td><img src="imgs/img.png" class="delImg">
            </tr>

        </table>
    </div>
</div>
</body>
</html>
```

#### 异常处理

记录一次异常处理的问题分析过程

情景：tomcat集成thymeleaf的水果仓库项目，但是在页面上总是获取不到session的值

可能原因：

1、数据库连接出错或druid连接池jar包与mysql版本不兼容

通过查看Maven的依赖关系排除版本兼容问题。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220415103859078.png)

检查了druid连接池的properties文件，然后通过debug发现可以从数据库中取出数据，因此排除。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220415103957951.png)



2、session跨域时的sessionid发生改变

通过Edge浏览器的网络检查得到请求的sessionid，然后再在所有途经的servlet类中打印当前请求的sessionid，发现一致，因此排除。



3、网页请求URL错误

通过配置比较，IndexSevlet在web.xml中注册的url-patter与tomcat启动时的URL一致

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220415104544521.png)

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220415104618188.png)

因此排除

4、thymeleaf本身代码出错

经过检查发现，表达式本身没有问题，但仍然取不到session里的值，于是我试着修改了一下命名空间，从thy改成了th。

居然就成功了

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="css/index.css"></head>
<body>

<div id="div_container">
    <div id="div_fruit_list">
        <p class="center f30">欢迎使用水果库存后台管理系统</p>
        <table id="tbl_fruit">
            <tr >
                <th class="w20">名称</th>
                <th class="w20">单价</th>
                <th class="w20">库存</th>
                <th class="w20">操作</th>
            </tr>
            <tr th:if="${#lists.isEmpty(session.fruitList)}">

                <td colspan="4" >对不起，库存为空！</td>
            </tr>
            <tr th:unless="${#lists.isEmpty(session.fruitList)}"  th:each="fruit : ${session.fruitList}">
                <td th:text="${fruit.fname}">西瓜</td>
                <td th:text="${fruit.price}">3</td>
                <td th:text="${fruit.fcount}">20</td>
                <td><img src="imgs/img.png" class="delImg">
            </tr>

        </table>
    </div>
</div>
</body>
</html>
```

经过网上搜索发现，thymeleaf的命名空间是固定的。

```html
<html lang="en" xmlns:th="http://www.thymeleaf.org" 
				xmlns:sec="http://www.thymeleaf.org/extras/spring-security"
				xmlns:shiro="http://www.pollix.at/thymeleaf/shiro">

```

其中对应关系如下

1、thymeleaf约束
xmlns:th=“http://www.thymeleaf.org”
2、security约束
xmlns:sec=“http://www.thymeleaf.org/extras/spring-security”
3、shiro约束
xmlns:shiro=“http://www.pollix.at/thymeleaf/shiro”

从此得出结论：这个困扰我半天的session获取不到值的异常是因为thymeleaf命名空间是固定的，不能乱写。

### 保存作用域

原始情况下，保存作用域我们可以认为有四个：

- page                    页面级别（现在几乎不用）

- request               一次请求响应范围

  服务器内部转发（一次请求），第二个Servlet组件可以获取在第一个组件中设置的值

  ![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220415143421060.png)

  客户端重定向（两次请求），第二个Servlet组件不能获取在第一个组件中设置的值

  ![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220415144450483.png)

- session                一次会话范围

  session1范围内的组件二可以获取session1范围内组件以设置的值。

  session2范围内的组件二无法获取session1范围内组件一设置的值，即在session1范围内设置的值只对客户端1可见。

  

- application         整个应用程序范围

  客户端二可通过组件二访问客户端一在组件一设置的值

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220415145710285.png)

### 路径问题

假设当前有如下路径

![image-20220415151001325](C:\Users\yumo\AppData\Roaming\Typora\typora-user-images\image-20220415151001325.png)

如果当前在login.html想访问login.css

- 相对路径     ../css/login.css

```html
<link rel="stylesheet" href=" ../css/login.css"></head>
```

- 绝对路径    http://localhost:8080/WebJava/css/login.css

```html
<link rel="stylesheet" href=" http://localhost:8080/WebJava/css/login.css "></head>
```

- base标签   当前页面上所有的路径都以此为基础

  ```html
  <base href="http://localhost:8080/WebJava/"/>
  
  <link rel="stylesheet" href="css/index.css"></head>
  ```

## 水果库存管理系统项目1.0

### 项目结构

一个请求对应一个servlet，缺点是servlet太多。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220416142153872.png)

### DAO

#### BaseDAO抽象类

```java
package com.yumo.fruit.dao.base;


import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.BeanHandler;
import org.apache.commons.dbutils.handlers.BeanListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import com.yumo.myssm.util.JDBCUtilByDruid;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public abstract class BaseDAO<T> {
    private QueryRunner qr=new QueryRunner();

    //开发通用的dml,针对任意的表
    protected int update(String sql,Object... parameters)
    {
        Connection connection=null;

        try {
            connection= JDBCUtilByDruid.getConnection();
            int update = qr.update(connection, sql, parameters);
            return update;
        } catch (SQLException e) {
            //将编译异常->运行异常，方便使用者抛出或捕获
            throw new RuntimeException(e);
        }finally {
            JDBCUtilByDruid.close(null,null,connection);
        }



    }

    //返回多个对象（即查询的结果是多行），针对任意表

    /**
     *
     * @param sql sql 语句，可以有 ?
     * @param clazz 传入一个类的Class对象，比如Actor.class
     * @param parameters 传入 ? 的具体的值，可以有多个
     * @return 根据 Actor.class返回对应的ArrayList集合
     */
    protected List<T> queryMulti(String sql, Class<T> clazz, Object... parameters)
    {
        Connection connection=null;

        try {
            connection=JDBCUtilByDruid.getConnection();
            return qr.query(connection,sql,new BeanListHandler<T>(clazz),parameters);
        } catch (SQLException e) {
            //将编译异常->运行异常，方便使用者抛出或捕获
            throw new RuntimeException(e);
        }finally {
            JDBCUtilByDruid.close(null,null,connection);
        }
    }

    //查询单行结果的通用方法
    protected T querySingle(String sql,Class<T> clazz,Object... parameters)
    {
        Connection connection=null;

        try {
            connection=JDBCUtilByDruid.getConnection();
            return qr.query(connection,sql,new BeanHandler<T>(clazz),parameters);
        } catch (SQLException e) {
            //将编译异常->运行异常，方便使用者抛出或捕获
            throw new RuntimeException(e);
        }finally {
            JDBCUtilByDruid.close(null,null,connection);
        }
    }

    //查询单行单列的方法，即返回单值的方法
    protected Object queryScalar(String sql,Object... parameters)
    {
        Connection connection=null;

        try {
            connection=JDBCUtilByDruid.getConnection();
            return qr.query(connection,sql,new ScalarHandler<>(),parameters);
        } catch (SQLException e) {
            //将编译异常->运行异常，方便使用者抛出或捕获
            throw new RuntimeException(e);
        }finally {
            JDBCUtilByDruid.close(null,null,connection);
        }
    }
}
```

#### pojo对象

```java
package com.yumo.fruit.pojo;

import lombok.Data;

@Data
public class Fruit {
    private Integer fid;
    private String fname;
    private Integer price;
    private Integer fcount;
    private String remark;

    public Fruit(Integer fid, String fname, Integer price, Integer fcount, String remark) {
        this.fid = fid;
        this.fname = fname;
        this.price = price;
        this.fcount = fcount;
        this.remark = remark;
    }

    public Fruit() {
    }

}
```

#### FruitDAO接口

```java
package com.yumo.fruit.dao;

import com.yumo.fruit.pojo.Fruit;

import java.util.List;

public interface FruitDAO {
    boolean addFruit(Fruit fruit);

    List<Fruit> getFruitList(String keyword,Integer pageNum);

    Fruit getFruitByFid(Integer fid);

    boolean updateFruit(Fruit fruit);

    boolean deleteFruit(Integer fid);

    int getFruitCount(String keyword);
}
```

#### FruitDAOImpl实现类

```java
package com.yumo.fruit.dao.Impl;

import com.yumo.fruit.dao.FruitDAO;
import com.yumo.fruit.dao.base.BaseDAO;
import com.yumo.fruit.pojo.Fruit;
import org.apache.commons.dbutils.QueryRunner;


import java.util.List;

public class FruitDAOImpl extends BaseDAO<Fruit> implements FruitDAO {
    private QueryRunner qr=new QueryRunner();
    @Override
    public boolean addFruit(Fruit fruit) {
        String sql="INSERT INTO fruit VALUES(null,?,?,?,?)";
        return super.update(sql  ,fruit.getFname(),  fruit.getPrice(), fruit.getFcount(), fruit.getRemark()) > 0;
    }

    @Override
    public List<Fruit> getFruitList(String keyword,Integer pageNum) {
        String sql = "SELECT * FROM fruit WHERE fname LIKE ? OR remark LIKE ? LIMIT ? , 5";
        List<Fruit> fruitList = super.queryMulti(sql, Fruit.class,"%"+keyword+"%" ,"%"+keyword+"%" ,(pageNum-1)*5);
        return fruitList;
    }

    @Override
    public Fruit getFruitByFid(Integer fid) {
        String sql="SELECT * FROM fruit WHERE fid = ?";
        return  super.querySingle(sql,Fruit.class,fid);
    }

    @Override
    public boolean updateFruit(Fruit fruit) {
        String sql="UPDATE fruit SET fname = ? , price = ? , fcount = ? , remark = ? WHERE fid = ?";
        return  super.update(sql,fruit.getFname(),fruit.getPrice(),fruit.getFcount(),fruit.getRemark(),fruit.getFid())>0;
    }

    @Override
    public boolean deleteFruit(Integer fid) {
        String sql="DELETE FROM fruit WHERE fid = ?";
        return super.update(sql,fid)>0;
    }

    @Override
    public int getFruitCount(String keyword) {
        String sql="SELECT * FROM fruit WHERE fname LIKE ? OR remark LIKE ?";
        return super.queryMulti(sql,Fruit.class,"%"+keyword+"%" ,"%"+keyword+"%").size();
    }

}
```

Util工具类

```java
package com.yumo.myssm.util;

import com.alibaba.druid.pool.DruidDataSourceFactory;

import javax.sql.DataSource;
import java.io.FileInputStream;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

public class JDBCUtilByDruid {
    private static DataSource ds;

    static {
        Properties properties = new Properties();
        try {
            properties.load(new FileInputStream("E:\\WebJava\\src\\druid.properties"));
            ds= DruidDataSourceFactory.createDataSource(properties);
        }catch (Exception e)
        {
            e.printStackTrace();
        }
    }
    public static Connection getConnection()throws SQLException
    {
        return ds.getConnection();
    }
    public static void close(ResultSet resultSet, Statement statement,Connection connection)
    {
        try {
            if(resultSet!=null){
                resultSet.close();
            }
            if (statement!=null){
                statement.close();
            }
            if (connection!=null){
                connection.close();
            }
        }catch (SQLException e)
        {
            throw new RuntimeException(e);
        }
    }
}
```

```java
package com.yumo.myssm.util;

public class StringUtil {
    public static boolean isEmpty(String str)
    {
        return str==null||"".equals(str);
    }
    public static boolean isNotEmpty(String str)
    {
        return !isEmpty(str);
    }
}
```

### 核心Servlet

#### thymeleaf渲染

```java
package com.yumo.fruit.servlets;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.WebContext;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ServletContextTemplateResolver;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class ViewBaseServlet extends HttpServlet {

    private TemplateEngine templateEngine;

    @Override
    public void init() throws ServletException {

        // 1.获取ServletContext对象
        ServletContext servletContext = this.getServletContext();

        // 2.创建Thymeleaf解析器对象
        ServletContextTemplateResolver templateResolver = new ServletContextTemplateResolver(servletContext);

        // 3.给解析器对象设置参数
        // ①HTML是默认模式，明确设置是为了代码更容易理解
        templateResolver.setTemplateMode(TemplateMode.HTML);

        // ②设置前缀
        String viewPrefix = servletContext.getInitParameter("view-prefix");

        templateResolver.setPrefix(viewPrefix);

        // ③设置后缀
        String viewSuffix = servletContext.getInitParameter("view-suffix");

        templateResolver.setSuffix(viewSuffix);

        // ④设置缓存过期时间（毫秒）
        templateResolver.setCacheTTLMs(60000L);

        // ⑤设置是否缓存
        templateResolver.setCacheable(true);

        // ⑥设置服务器端编码方式
        templateResolver.setCharacterEncoding("utf-8");

        // 4.创建模板引擎对象
        templateEngine = new TemplateEngine();

        // 5.给模板引擎对象设置模板解析器
        templateEngine.setTemplateResolver(templateResolver);

    }

    protected void processTemplate(String templateName, HttpServletRequest req, HttpServletResponse resp) throws IOException {
        // 1.设置响应体内容类型和字符集
        resp.setContentType("text/html;charset=UTF-8");

        // 2.创建WebContext对象
        WebContext webContext = new WebContext(req, resp, getServletContext());

        // 3.处理模板数据
        templateEngine.process(templateName, webContext, resp.getWriter());
    }
}
```

#### Index主页

```java
package com.yumo.servlets;

import com.yumo.fruit.dao.FruitDAO;
import com.yumo.fruit.dao.Impl.FruitDAOImpl;
import com.yumo.fruit.pojo.Fruit;
import com.yumo.myssm.util.StringUtil;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;


@WebServlet("/index")
public class IndexServlet extends ViewBaseServlet {
    private FruitDAO fruitDAO=new FruitDAOImpl();
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        doGet(req,resp);
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        req.setCharacterEncoding("UTF-8");
        HttpSession session = req.getSession();

        Integer pageNum=1;

        String keyword=null;
        String oper = req.getParameter("oper");
        //如果oper!=null 说明是通过表单的查询按钮点击过来的
        //如果oper为空   说明不是通过表单的查询按钮点击过来的
        if (StringUtil.isNotEmpty(oper) && "search".equals(oper)) {
            //说明是点击表单查询发送过来的请求
            //此时，pageNum应还原为1，keyword应从请求参数中获取
            pageNum=1;
            keyword=req.getParameter("keyword");
            if(StringUtil.isEmpty(keyword)){
                keyword="";
            }
            session.setAttribute("keyword",keyword);
        }else {
            //说明此处不是点击表单查询发送过来的请求(比如点击下面的上一页或下一页或直接在地址栏输入网址)
            //此时keyword应该通过session作用域获取
            String pageNumStr = req.getParameter("pageNum");
            if (StringUtil.isNotEmpty(pageNumStr)) {
                pageNum=Integer.parseInt(pageNumStr);
            }
            Object keywordObj = session.getAttribute("keyword");
            if(keywordObj!=null){
                keyword=(String) keywordObj;
            }else {
                keyword="";
            }
        }


        session.setAttribute("pageNum",pageNum);
        List<Fruit> fruitList = fruitDAO.getFruitList(keyword,pageNum);

        ServletContext application = req.getServletContext();
        //保存到session作用域

        session.setAttribute("fruitList",fruitList);

        //总记录条数
        int fruitCount = fruitDAO.getFruitCount(keyword);
        //总页数
        int pageCount=(fruitCount+5-1)/5;

        session.setAttribute("pageCount",pageCount);


        /**
         * 此处的视图名称是 index
         * 那么thymeleaf会将这个 逻辑视图名称 对应到 物理视图名称 上去
         * 逻辑视图名称：         index
         * 物理视图名称：        view-preffix + 逻辑视图名称 + view-suffix
         * 真实视图名称：          /index.html
         */
        super.processTemplate("index",req,resp);

    }
}
```

#### 增加记录及其界面渲染

```java
package com.yumo.fruit.servlets;

import com.yumo.fruit.dao.FruitDAO;
import com.yumo.fruit.dao.Impl.FruitDAOImpl;
import com.yumo.fruit.pojo.Fruit;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/add.do")
public class AddServlet extends ViewBaseServlet {

    FruitDAO fruitDAO=new FruitDAOImpl();
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
       //如果是通过index页面上跳转过来的，则需要用thymeleaf对add.html进行渲染
        super.processTemplate("add",req,resp);
    }
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        //1、设置编码
        req.setCharacterEncoding("UTF-8");

        //2、获取参数
        String fname = req.getParameter("fname");
        String priceStr = req.getParameter("price");
        Integer price = Integer.parseInt(priceStr);
        String fcountStr = req.getParameter("fcount");
        Integer fcount=Integer.parseInt(fcountStr);
        String remark = req.getParameter("remark");

        //3、执行更新
        fruitDAO.addFruit(new Fruit(0,fname,price,fcount,remark));

        //4、资源跳转
//        super.processTemplate("index",req,resp);
        //此处需要重定向，目的是重新给IndexServlet发请求，重新获取fruitList,然后覆盖到session中，这样index.html页面上显示的session中的数据才是最新的
        resp.sendRedirect("index");
    }
}

```

#### 删除记录

```java
package com.yumo.servlets;

import com.yumo.fruit.dao.FruitDAO;
import com.yumo.fruit.dao.Impl.FruitDAOImpl;
import com.yumo.myssm.util.StringUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/del.do")
public class DeleteServlet extends ViewBaseServlet{

    private FruitDAO fruitDAO=new FruitDAOImpl();
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String fidStr = req.getParameter("fid");
        if (StringUtil.isNotEmpty(fidStr))
        {
            Integer fid = Integer.parseInt(fidStr);
            fruitDAO.deleteFruit(fid);

            resp.sendRedirect("index");
        }
    }
}
```

#### 编辑界面渲染

```java
package com.yumo.servlets;

import com.yumo.fruit.dao.FruitDAO;
import com.yumo.fruit.dao.Impl.FruitDAOImpl;
import com.yumo.fruit.pojo.Fruit;
import com.yumo.myssm.util.StringUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/edit.do")
public class EditServlet extends ViewBaseServlet {
    private FruitDAO fruitDAO=new FruitDAOImpl();
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String fidStr = req.getParameter("fid");
        if (StringUtil.isNotEmpty(fidStr))
        {
            int fid = Integer.parseInt(fidStr);
            Fruit fruit = fruitDAO.getFruitByFid(fid);
            req.setAttribute("fruit",fruit);
            super.processTemplate("edit",req,resp);
        }
    }


}
```

#### 修改记录

```java
package com.yumo.fruit.servlets;


import com.yumo.fruit.dao.FruitDAO;
import com.yumo.fruit.dao.Impl.FruitDAOImpl;
import com.yumo.fruit.pojo.Fruit;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/update.do")
public class UpdateServlet extends ViewBaseServlet{

    FruitDAO fruitDAO=new FruitDAOImpl();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        //1、设置编码
        req.setCharacterEncoding("UTF-8");

        //2、获取参数
        String fidStr = req.getParameter("fid");
        Integer fid = Integer.parseInt(fidStr);
        String fname = req.getParameter("fname");
        String priceStr = req.getParameter("price");
        Integer price = Integer.parseInt(priceStr);
        String fcountStr = req.getParameter("fcount");
        Integer fcount=Integer.parseInt(fcountStr);
        String remark = req.getParameter("remark");

        //3、执行更新
        fruitDAO.updateFruit(new Fruit(fid,fname,price,fcount,remark));

        //4、资源跳转
//        super.processTemplate("index",req,resp);
        //此处需要重定向，目的是重新给IndexServlet发请求，重新获取fruitList,然后覆盖到session中，这样index.html页面上显示的session中的数据才是最新的
        resp.sendRedirect("index");
    }
}
```

## MVC Servlet优化

### 水果库存管理系统项目1.1

#### 项目结构

把一系列的请求都对应一个servlet，通过一个operate的值来决定调用FruitServlet中的哪一个方法，使用switch-case.

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220416141924489-1.png)

FruitServlet

```java
package com.yumo.fruit.servlets;

import com.yumo.fruit.dao.FruitDAO;
import com.yumo.fruit.dao.Impl.FruitDAOImpl;
import com.yumo.fruit.pojo.Fruit;
import com.yumo.myssm.util.StringUtil;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;

@WebServlet("/fruit.do")
public class FruitServlet extends ViewBaseServlet{

    FruitDAO fruitDAO=new FruitDAOImpl();
    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        String operate = request.getParameter("operate");
        if (StringUtil.isEmpty(operate)){
            operate="index";
        }

        switch (operate)
        {
            case "index":
                index(request,response);
                break;
            case "add":
                add(request,response);
                break;
            case "delete":
                delete(request,response);
                break;
            case "edit":
                edit(request,response);
                break;
            case "update":
                update(request,response);
                break;
            default:
                throw new RuntimeException("operate值非法！");
        }
    }


    private void index(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        req.setCharacterEncoding("UTF-8");
        HttpSession session = req.getSession();

        Integer pageNum=1;

        String keyword=null;
        String oper = req.getParameter("oper");
        //如果oper!=null 说明是通过表单的查询按钮点击过来的
        //如果oper为空   说明不是通过表单的查询按钮点击过来的
        if (StringUtil.isNotEmpty(oper) && "search".equals(oper)) {
            //说明是点击表单查询发送过来的请求
            //此时，pageNum应还原为1，keyword应从请求参数中获取
            pageNum=1;
            keyword=req.getParameter("keyword");
            if(StringUtil.isEmpty(keyword)){
                keyword="";
            }
            session.setAttribute("keyword",keyword);
        }else {
            //说明此处不是点击表单查询发送过来的请求(比如点击下面的上一页或下一页或直接在地址栏输入网址)
            //此时keyword应该通过session作用域获取
            String pageNumStr = req.getParameter("pageNum");
            if (StringUtil.isNotEmpty(pageNumStr)) {
                //若从请求中读取到pageNum，则类型转换；如果通过地址栏访问,pageNum获取不到，则默认为1
                pageNum=Integer.parseInt(pageNumStr);
            }
            //如果不是点击的查询按钮，那么查询是基于session中保存的现有的keyword进行查询
            Object keywordObj = session.getAttribute("keyword");
            if(keywordObj!=null){
                keyword=(String) keywordObj;
            }else {
                //第一次通过输入网址
                keyword="";
            }
        }


        //重新更新当前页的值
        session.setAttribute("pageNum",pageNum);
        List<Fruit> fruitList = fruitDAO.getFruitList(keyword,pageNum);
        //保存到session作用域
        session.setAttribute("fruitList",fruitList);

        ServletContext application = req.getServletContext();


        //总记录条数
        int fruitCount = fruitDAO.getFruitCount(keyword);
        //总页数
        int pageCount=(fruitCount+5-1)/5;

        session.setAttribute("pageCount",pageCount);


        /**
         * 此处的视图名称是 index
         * 那么thymeleaf会将这个 逻辑视图名称 对应到 物理视图名称 上去
         * 逻辑视图名称：         index
         * 物理视图名称：        view-preffix + 逻辑视图名称 + view-suffix
         * 真实视图名称：          /index.html
         */
        super.processTemplate("index",req,resp);
    }

    private void add(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String method = req.getMethod();
        if ("POST".equals(method)) {
          //1、设置编码
          req.setCharacterEncoding("UTF-8");

          //2、获取参数
          String fname = req.getParameter("fname");
          String priceStr = req.getParameter("price");
          Integer price = Integer.parseInt(priceStr);
          String fcountStr = req.getParameter("fcount");
          Integer fcount = Integer.parseInt(fcountStr);
          String remark = req.getParameter("remark");

          //3、执行更新
          fruitDAO.addFruit(new Fruit(0, fname, price, fcount, remark));

          //4、资源跳转
//        super.processTemplate("index",req,resp);
          //此处需要重定向，目的是重新给IndexServlet发请求，重新获取fruitList,然后覆盖到session中，这样index.html页面上显示的session中的数据才是最新的
          resp.sendRedirect("fruit.do");
      }else {
          super.processTemplate("add",req,resp);
      }
    }

    private void delete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String fidStr = req.getParameter("fid");
        if (StringUtil.isNotEmpty(fidStr))
        {
            Integer fid = Integer.parseInt(fidStr);
            fruitDAO.deleteFruit(fid);

            resp.sendRedirect("fruit.do");
        }
    }

    private void edit(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String fidStr = req.getParameter("fid");
        if (StringUtil.isNotEmpty(fidStr))
        {
            int fid = Integer.parseInt(fidStr);
            Fruit fruit = fruitDAO.getFruitByFid(fid);
            req.setAttribute("fruit",fruit);
            super.processTemplate("edit",req,resp);
        }
    }

    private void update(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

        //1、设置编码
        req.setCharacterEncoding("UTF-8");

        //2、获取参数
        String fidStr = req.getParameter("fid");
        Integer fid = Integer.parseInt(fidStr);
        String fname = req.getParameter("fname");
        String priceStr = req.getParameter("price");
        Integer price = Integer.parseInt(priceStr);
        String fcountStr = req.getParameter("fcount");
        Integer fcount=Integer.parseInt(fcountStr);
        String remark = req.getParameter("remark");

        //3、执行更新
        fruitDAO.updateFruit(new Fruit(fid,fname,price,fcount,remark));

        //4、资源跳转
//        super.processTemplate("index",req,resp);
        //此处需要重定向，目的是重新给IndexServlet发请求，重新获取fruitList,然后覆盖到session中，这样index.html页面上显示的session中的数据才是最新的
        resp.sendRedirect("fruit.do");
    }
}
```

#### 优化switch-case->reflect

在上面的代码中，Servlet中充斥着大量的switch-case，随着项目的业务规模扩大，那么会有很多的Servlet，从而造成代码冗余

因此，在Servlet中使用反射技术。规定operate的值和方法名一致，那么接收到operate的值是什么就表明需要调用对应的方法进行响应。若找不到对应的方法，则抛出异常。

```java
try{
    Method method =getClass().getDeclaredMethod(operate,HttpServletRequest request,HttpServletResponse response);
    if(method!=null){
		method.invoke(this,request,response);
        return;
    }
}catch (Exception e){
	e.printStackTrace();
}
throw new RuntimeException("没有找到"+operate+"的方法");
```

#### 向上提取

上面的代码使用了反射技术，但仍然存在问题：

每一个servlet中都有类似的反射技术的代码。因此继续抽取，设计了中央控制器类：DispatcherServlet。

该类的工作分为两部分：

1、根据url定位到能够处理这个请求的controller组件：

​	(1)从url中提取servletPath :   /fruit.do -> fruit

```java
//假设url是  http://localhost:8080/WebJava_war_exploded/hello.do
//那么servletPath是： /hello.do
//第一步： /hello.do -> hello
String servletPath = request.getServletPath();
servletPath=servletPath.substring(1,servletPath.lastIndexOf(".do"));
Object controllerBeanObj = beanMap.get(servletPath);
```

​    (2)根据fruit找到对应的组件：FruitController：

```java
 //根据fruit找到对应的组件：FruitController：
Object controllerBeanObj = beanMap.get(servletPath);
```

这个对应的依据存储在applicationContext.xml：

```xml
<?xml version="1.0" encoding="UTF-8" ?>

<!--一个JavaBean称为一个Java对象-->
<beans>
    <!-- 这个bean标签的作用是  将来servletPath中涉及的名字对应的是fruit，那么就要FruitController这个类来处理-->
    <bean id="fruit" class="com.yumo.fruit.controllers.FruitController"/>
</beans>
```

通过DOM技术去解析XML文件，在中央控制器形成一个beanMap容器，用来存放所有的Controller组件

```java
try {
    //通过DOM技术去解析XML文件，在中央控制器形成一个beanMap容器，用来存放所有的Controller组件
    InputStream inputStream = getClass().getClassLoader().getResourceAsStream("applicationContext.xml");
    //1、创建DocumentBuilderFactory对象
    DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
    //2、创建DocumentBuilder对象
    DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();
    //3、创建Document对象
    Document document = documentBuilder.parse(inputStream);
    //获取所有的bean节点
    NodeList beanNodeList = document.getElementsByTagName("bean");
    for(int i=0;i<beanNodeList.getLength();i++)
    {
        Node beanNode = beanNodeList.item(i);
        if (beanNode.getNodeType()==Node.ELEMENT_NODE){
            Element beanElement = (Element) beanNode;
            String beanId = beanElement.getAttribute("id");
            String className = beanElement.getAttribute("class");
            Object beanObj = null;
            Constructor<?> declaredConstructor = Class.forName(className).getDeclaredConstructor();
            declaredConstructor.setAccessible(true);
            beanObj =declaredConstructor.newInstance();
            beanMap.put(beanId,beanObj);
        }
    }
} catch (ParserConfigurationException | IOException | SAXException | ClassNotFoundException | InstantiationException | IllegalAccessException | NoSuchMethodException | InvocationTargetException e) {
    e.printStackTrace();
}
```

(3)根据获取到的operate的值定位到FruitController中需要调用的方法

```java
//根据获取到的operate的值定位到FruitController中需要调用的方法
String operate = request.getParameter("operate");
if (StringUtil.isEmpty(operate)) {
    operate = "index";
}
```



2、调用Controller组件中的方法

​	(1)获取参数

​		获取即将要调用的方法的参数签名信息：Parameter[] parameters = method.getParameters();

​		通过parameter.getNmae()获取参数的名称；

·		准备了Object[] parameterValues = new Object[parameters.length];这个数组来存放对应参数的参数值

​		另外还需要考虑参数的类型问题，需要做类型转化的工作。通过parameter.getType()获取参数的类型。

```java
//需要在Java compiler 的 addition command parameters中设置 -parameters
for (int i=0;i<parameters.length;i++){
    Parameter parameter=parameters[i];
    String parameterName = parameter.getName();

    //如果参数是request、response、session，则不通过请求获取值
    if ("request".equals(parameterName)){
        parameterValues[i]=request;
    }else if("response".equals(parameterName)){
        parameterValues[i]=response;
    }else if("session".equals(parameterName)){
        parameterValues[i]=request.getSession();
    }else {
        //从请求中获取参数值
        String parameterValue = request.getParameter(parameterName);
        String typeName = parameter.getType().getName();

        //因为parameterValue为String类型，所以可能会出现参数类型不匹配
        Object parameterObj=parameterValue;
        if (parameterObj!=null){
            if ("java.lang.Integer".equals(typeName)) {
                parameterObj = Integer.parseInt(parameterValue);
            }
        }
        parameterValues[i]=parameterObj;
    }
}
```

​	(2)执行方法

```java
method.setAccessible(true);
Object returnObj = method.invoke(controllerBeanObj,parameterValues);
```

​	(3)视图处理

```java
//2.3、视图处理
String methodReturnStr = (String) returnObj;
if (methodReturnStr.startsWith("redirect:")) {      //如   redirect:fruit.do
    String redirectStr = methodReturnStr.substring("redirect:".length());
    response.sendRedirect(redirectStr);
} else {
    super.processTemplate(methodReturnStr, request, response);          //比如 edit
}
```

### 水果库存管理系统项目1.2

#### 项目结构

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220417111212837.png)

#### 中央处理器Servlet

```java
package com.yumo.myssm.myspringmvc;

import com.yumo.myssm.util.StringUtil;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.*;
import java.util.HashMap;
import java.util.Map;

@WebServlet("*.do")
public class DispacherServlet extends ViewBaseServlet {

    private Map<String,Object> beanMap= new HashMap<>();



    @Override
    public void init() throws ServletException {
        super.init();
        try {
            //通过DOM技术去解析XML文件，在中央控制器形成一个beanMap容器，用来存放所有的Controller组件
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream("applicationContext.xml");
            //1）、创建DocumentBuilderFactory对象
            DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
            //2）、创建DocumentBuilder对象
            DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();
            //3）、创建Document对象
            Document document = documentBuilder.parse(inputStream);
            //获取所有的bean节点
            NodeList beanNodeList = document.getElementsByTagName("bean");
            for(int i=0;i<beanNodeList.getLength();i++)
            {
                Node beanNode = beanNodeList.item(i);
                if (beanNode.getNodeType()==Node.ELEMENT_NODE){
                    Element beanElement = (Element) beanNode;
                    String beanId = beanElement.getAttribute("id");
                    String className = beanElement.getAttribute("class");
                    Object beanObj = null;
                    Constructor<?> declaredConstructor = Class.forName(className).getDeclaredConstructor();
                    declaredConstructor.setAccessible(true);
                    beanObj =declaredConstructor.newInstance();
                    beanMap.put(beanId,beanObj);
                }
            }
        } catch (ParserConfigurationException | IOException | SAXException | ClassNotFoundException | InstantiationException | IllegalAccessException | NoSuchMethodException | InvocationTargetException e) {
            e.printStackTrace();
        }
    }

    /**
     * 在构造方法中解析配置文件
     */



    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //设置编码
        request.setCharacterEncoding("UTF-8");

        //1、 根据url定位到能够处理这个请求的controller组件：
        //假设url是  http://localhost:8080/WebJava_war_exploded/hello.do
        //那么servletPath是： /hello.do
        //1.1、url中提取servletPath   /hello.do -> hello
        String servletPath = request.getServletPath();
        servletPath=servletPath.substring(1,servletPath.lastIndexOf(".do"));
        //1.2、根据fruit找到对应的组件：FruitController：
        Object controllerBeanObj = beanMap.get(servletPath);

        //1.3、根据获取到的operate的值定位到FruitController中需要调用的方法
        String operate = request.getParameter("operate");
        if (StringUtil.isEmpty(operate)) {
            operate = "index";
        }


        //2、调用Controller组件中的方法
        try {
            for (Method method : controllerBeanObj.getClass().getDeclaredMethods()) {
                if (operate.equals(method.getName())) {
                    //2.1、统一获取请求参数
                    Parameter[] parameters = method.getParameters();

                    Object[] parameterValues = new Object[parameters.length];
                    //需要在Java compiler 的 addition command parameters中设置 -parameters
                    for (int i=0;i<parameters.length;i++){
                        Parameter parameter=parameters[i];
                        String parameterName = parameter.getName();

                        //如果参数是request、response、session，则不通过请求获取值
                        if ("request".equals(parameterName)){
                            parameterValues[i]=request;
                        }else if("response".equals(parameterName)){
                            parameterValues[i]=response;
                        }else if("session".equals(parameterName)){
                            parameterValues[i]=request.getSession();
                        }else {
                            //从请求中获取参数值
                            String parameterValue = request.getParameter(parameterName);
                            String typeName = parameter.getType().getName();

                            //因为parameterValue为String类型，所以可能会出现参数类型不匹配
                            Object parameterObj=parameterValue;
                            if (parameterObj!=null){
                                if ("java.lang.Integer".equals(typeName)) {
                                    parameterObj = Integer.parseInt(parameterValue);
                                }
                            }
                            parameterValues[i]=parameterObj;
                        }
                    }

                    //2.2、controller组件中的方法调用
                    //找到和operate同名的方法，通过反射技术调用它
                    method.setAccessible(true);
                    Object returnObj = method.invoke(controllerBeanObj,parameterValues);


                    //2.3、视图处理
                    String methodReturnStr = (String) returnObj;
                    if (methodReturnStr.startsWith("redirect:")) {      //如   redirect:fruit.do
                        String redirectStr = methodReturnStr.substring("redirect:".length());
                        response.sendRedirect(redirectStr);
                    } else {
                        super.processTemplate(methodReturnStr, request, response);          //比如 edit
                    }
                }
            }
        } catch (InvocationTargetException | IllegalAccessException e) {
            e.printStackTrace();
        }


    }
}
```

#### Controller层

```java
package com.yumo.fruit.controllers;

import com.yumo.fruit.dao.FruitDAO;
import com.yumo.fruit.dao.Impl.FruitDAOImpl;
import com.yumo.fruit.pojo.Fruit;
import com.yumo.myssm.myspringmvc.ViewBaseServlet;
import com.yumo.myssm.util.StringUtil;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;


public class FruitController {


    FruitDAO fruitDAO=new FruitDAOImpl();

    public FruitController() {
    }


    private String index(HttpServletRequest request,String oper,String keyword,Integer pageNum) throws IOException{

        HttpSession session = request.getSession();

        if (pageNum==null){
            pageNum=1;
        }
        //如果oper!=null 说明是通过表单的查询按钮点击过来的
        //如果oper为空   说明不是通过表单的查询按钮点击过来的
        if (StringUtil.isNotEmpty(oper) && "search".equals(oper)) {
            //说明是点击表单查询发送过来的请求
            //此时，pageNum应还原为1，keyword应从请求参数中获取
            pageNum=1;
            if(StringUtil.isEmpty(keyword)){
                keyword="";
            }
            session.setAttribute("keyword",keyword);
        }else {
            //说明此处不是点击表单查询发送过来的请求(比如点击下面的上一页或下一页或直接在地址栏输入网址)
            //此时keyword应该通过session作用域获取

            //如果不是点击的查询按钮，那么查询是基于session中保存的现有的keyword进行查询
            Object keywordObj = session.getAttribute("keyword");
            if(keywordObj!=null){
                keyword=(String) keywordObj;
            }else {
                //第一次通过输入网址
                keyword="";
            }
        }


        //重新更新当前页的值
        session.setAttribute("pageNum",pageNum);
        List<Fruit> fruitList = fruitDAO.getFruitList(keyword,pageNum);
        //保存到session作用域
        session.setAttribute("fruitList",fruitList);

        ServletContext application = request.getServletContext();


        //总记录条数
        int fruitCount = fruitDAO.getFruitCount(keyword);
        //总页数
        int pageCount=(fruitCount+5-1)/5;

        session.setAttribute("pageCount",pageCount);


        /**
         * 此处的视图名称是 index
         * 那么thymeleaf会将这个 逻辑视图名称 对应到 物理视图名称 上去
         * 逻辑视图名称：         index
         * 物理视图名称：        view-preffix + 逻辑视图名称 + view-suffix
         * 真实视图名称：          /index.html
         */
        return "index";
    }

    private String add(HttpServletRequest request,Integer fid,String fname,Integer price,Integer fcount,String remark) throws IOException {
        String method = request.getMethod();
        if ("POST".equals(method)) {
          //2、获取参数

          //3、执行更新
          fruitDAO.addFruit(new Fruit(0, fname, price, fcount, remark));

          //4、资源跳转
//        super.processTemplate("index",req,resp);
          //此处需要重定向，目的是重新给IndexServlet发请求，重新获取fruitList,然后覆盖到session中，这样index.html页面上显示的session中的数据才是最新的
          return "redirect:fruit.do";
          }else if ("GET".equals(method)){
              return "add";
          }else {
              return "error";
        }
    }

    private String delete(Integer fid) throws  IOException {
        if (fid!=null)
        {
            fruitDAO.deleteFruit(fid);

           return "redirect:fruit.do";
        }else {
            return "error";
        }
    }

    private String edit(HttpServletRequest request,Integer fid) throws IOException {
        if (fid!=null)
        {
            Fruit fruit = fruitDAO.getFruitByFid(fid);
            request.setAttribute("fruit",fruit);
//            super.processTemplate("edit",req,resp);
            return "edit";
        }
        return "error";
    }

    private String update(Integer fid,String fname,Integer price,Integer fcount,String remark) throws  IOException {
        //2、获取参数

        //3、执行更新
        fruitDAO.updateFruit(new Fruit(fid,fname,price,fcount,remark));

        //4、资源跳转
//        super.processTemplate("index",req,resp);
        //此处需要重定向，目的是重新给IndexServlet发请求，重新获取fruitList,然后覆盖到session中，这样index.html页面上显示的session中的数据才是最新的
//        resp.sendRedirect("fruit.do");
        return "redirect:fruit.do";
    }
}
```

### ServletAPI

#### 初始化

```java
public void init(ServletConfig config) throws ServletException {
    this.config = config;
    this.init();
}

public void init() throws ServletException {
}
```

如果想要在Servlet初始化时做一些准备工作，那么可以重写init()方法。

##### ServletConfig

可以通过如下步骤去获取初始化设置的数据：

1. 获取config对象：

   ```java
   ServletConfig config = getServletConfig();
   ```

2. 获取初始化参数值：

   ```java
   config.getInitParameter(key);
   ```

   

配置初始化参数：

1、通过XML文件的< init-param >标签配置

```xml
<servlet>
    <servlet-name>DispacherServlet</servlet-name>
    <servlet-class>com.yumo.myssm.myspringmvc.DispacherServlet</servlet-class>
    <init-param>
        <param-name>key</param-name>
        <param-value>value</param-value>
    </init-param>
</servlet>
    <servlet-mapping>
        <servlet-name>DispacherServlet</servlet-name>
        <url-pattern>*.do</url-pattern>
    </servlet-mapping>
```

2、通过注解配置

```java
@WebServlet(urlPatterns = {"*.do"},
        initParams = {
            @WebInitParam(name = "key1",value = "value2"),
            @WebInitParam(name = "key2",value = "value2")
        }
)
```

##### ServletContext

  ServletContext对象表示**Servlet应用程序**。每个Web应用程序都只有一个ServletContext对象。在将一个应用程序同时部署到多个容器的分布式环境中，每台Java虚拟机上的Web应用都会有一个ServletContext对象。

通过在ServletConfig中调用getServletContext方法，也可以获得ServletContext对象。

那么为什么要存在一个ServletContext对象呢？存在肯定是有它的道理，因为有了ServletContext对象，就可以共享从应用程序中的所有资料处访问到的信息，并且可以动态注册Web对象。前者将对象保存在ServletContext中的一个内部Map中。保存在ServletContext中的对象被称作属性。

1、获取servletContext对象

- 在初始化方法中（ init() ）：

```java
ServletContext servletContext = getServletContext();
```

- 在服务方法中（ service() ）:可以通过request对象获取，也可以通过session对象获取

```java
ServletContext requestServletContext = request.getServletContext();
ServletContext servletContext = session.getServletContext();
```

2、获取context参数

```java
servletContext.getInitParameter("key")
```



```xml
<context-param>
    <param-name>key</param-name>
    <param-value>value</param-value>
</context-param>
```

### 业务层

#### MVC

**MVC**：**Model**（模型）、**View**（视图）、**Controller**（控制器）

- **视图层**：用于做数据展示以及和用户交互的一个界面。
- **控制层**：能够接受客户端的请求，具体的业务功能需要借助模型组件来完成。
- **模型层**：模型分为很多种，有比较简单的pojo/vo(value object)、业务模型组件、数据访问层对象
  - **pojo/vo**：值对象
  - **DAO**：数据访问对象
  - **BO**：业务对象

区分业务对象和数据访问对象：

1. DAO中的方法都是**单精度**（细粒度）方法。即一个方法只考虑一个操作。

2. BO中的方法属于业务方法，实际的业务时比较复杂的，因此业务方法是**粗粒度**方法。

   例子：注册这个功能属于业务功能，也就是说注册这个方法属于业务方法：

   那么这个业务方法中包含了多个DAO方法。也就是说注册这个业务功能需要通过多个DAO方法的组合调用，从而完成注册功能的实现。

   注册：

   1. 检查用户名是否已经被注册 - DAO中的select方法

   2. 向用户表新增一条新用户记录 - DAO中的insert方法

   3. 向系统日志表新增一条记录 - DAO中的insert方法

      . . . . . .

在库存系统中添加业务层

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220417154810813.png)

```java
package com.yumo.fruit.service;

import com.yumo.fruit.pojo.Fruit;

import java.util.List;

public interface FruitService {
    /**
     * 获取指定页面的库存列表信息
     */
    List<Fruit> getFruitList(String keyword, Integer pageNum);

    /**
     * 添加库存记录信息
     */
    boolean addFruit(Fruit fruit);
    /**
     * 根据id查看指定库存记录
     */
    Fruit getFruitByFid(Integer fid);
    /**
     * 修改特定库存记录
     */
    boolean updateFruit(Fruit fruit);
    /**
     * 删除特定库存记录
     */
    boolean deleteFruit(Integer fid);
    /**
     * 获取总页数
     */
    int getPageCount(String keyword);
}
```

```java
package com.yumo.fruit.service.impl;

import com.yumo.fruit.service.FruitService;
import com.yumo.fruit.dao.FruitDAO;
import com.yumo.fruit.dao.Impl.FruitDAOImpl;
import com.yumo.fruit.pojo.Fruit;

import java.util.List;

public class FruitServiceImpl implements FruitService {

    private FruitDAO fruitDAO=new FruitDAOImpl();

    @Override
    public List<Fruit> getFruitList(String keyword, Integer pageNum) {
        return fruitDAO.getFruitList(keyword, pageNum);
    }

    @Override
    public boolean addFruit(Fruit fruit) {
        return fruitDAO.addFruit(fruit);
    }

    @Override
    public Fruit getFruitByFid(Integer fid) {
        return fruitDAO.getFruitByFid(fid);
    }

    @Override
    public boolean updateFruit(Fruit fruit) {
        return fruitDAO.updateFruit(fruit);
    }

    @Override
    public boolean deleteFruit(Integer fid) {
        return fruitDAO.deleteFruit(fid);
    }

    @Override
    public int getPageCount(String keyword) {
        int count = fruitDAO.getFruitCount(keyword);
        int pageCount=(count+5-1)/5;
        return pageCount;
    }
}
```

然后把Controller中的dao对象改成service对象。

#### IOC

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220417154915391.png)

**IOC-控制反转**：

1、之前在controller中，创建service对象，FruitService fruitService=new FruitServiceImpl();

​		这句话如果出现在controller的某个方法内部，那么这个fruitService的作用域（生命周期）应该是这个方法级别；

​		如果这句话出现在controller的类中，也就是说fruitService是一个成员变量，那么这个fruitService的生命周期就是这个controller的类级别。

2、之后再applicationContext.xml中定义了这个fruitService，然后通过解析XML，产生fruitService实例，存放在beanMap中，这个beanMap称之为IOC容器，是存放在BeanFactory类中。

​		因此，我们转移（改变）了之前的service实例、dao实例等等它们的生命周期。控制权从程序员转移到BeanFactory。这个现象我们称之为控制反转。

**DI-依赖注入**：

1、之前在controller层出现代码 FruitService fruitService=new FruitServiceImpl();

​		此依赖关系是我们程序员主动绑定的。那么，controller层就和service层存在**耦合**。

2、之后，将代码改为 FruitService fruitService=null;

​		然后再配置文件中配置

```xml
<bean id="fruit" class="com.yumo.fruit.controllers.FruitController">
    <property name="fruitService" ref="fruitService"/>
</bean>
```

​		现在是通过反射技术，IOC容器寻找到ref属性对应的service实例，并注入到对应的Controller实例中

BeanFactory

```java
package com.yumo.myssm.ioc;

public interface BeanFactory {

    Object getBean(String id);

}
```

BeanFactory的实现类

将DispacherServlet类的init()方法内解析XML文件获取所有的Controller组件，并存放到IOC容器的相关代码提取到BeanFactory的实现类中。各个JavaBean组件（Controller、Service、DAO组件）由BeanFactory进行同一控制和管理。

```java
package com.yumo.myssm.ioc;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.Map;

public class ClassPathXmlApplicationContext implements BeanFactory{

    private Map<String,Object> beanMap= new HashMap<>();

    public ClassPathXmlApplicationContext() {
        try {
            //通过DOM技术去解析XML文件，在中央控制器形成一个beanMap容器，用来存放所有的Controller组件
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream("applicationContext.xml");
            //1）、创建DocumentBuilderFactory对象
            DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
            //2）、创建DocumentBuilder对象
            DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();
            //3）、创建Document对象
            Document document = documentBuilder.parse(inputStream);
            //4）获取所有的bean节点
            NodeList beanNodeList = document.getElementsByTagName("bean");
            for(int i=0;i<beanNodeList.getLength();i++)
            {
                Node beanNode = beanNodeList.item(i);
                if (beanNode.getNodeType()==Node.ELEMENT_NODE){
                    Element beanElement = (Element) beanNode;
                    String beanId = beanElement.getAttribute("id");
                    String className = beanElement.getAttribute("class");
                    Object beanObj = null;
                    Class<?> beanClass = Class.forName(className);
                    //创建bean实例
                    beanObj=beanClass.newInstance();
                    //将bean实例对象保存到map容器
                    beanMap.put(beanId,beanObj);
                    //到目前为止，bean和bean之间的依赖关系还没有设置
                }
            }
            //5）组装bean之间的依赖关系
            for(int i=0;i<beanNodeList.getLength();i++)
            {
                Node beanNode = beanNodeList.item(i);
                if (beanNode.getNodeType()==Node.ELEMENT_NODE){
                    Element beanElement = (Element) beanNode;
                    String beanId = beanElement.getAttribute("id");
                    NodeList beanChildNodeList = beanElement.getChildNodes();
                    for (int j = 0; j < beanChildNodeList.getLength(); j++) {
                        Node beanChildNode = beanChildNodeList.item(j);
                        if(beanChildNode.getNodeType()==Node.ELEMENT_NODE&&"property".equals(beanChildNode.getNodeName())){
                            Element propertyElement = (Element) beanChildNode;
                            String propertyName = propertyElement.getAttribute("name");
                            String propertyRef = propertyElement.getAttribute("ref");
                            //1.找到propertyRef对应的实例
                            Object refObj = beanMap.get(propertyRef);
                            //2.将refObj设置到当前bean对应的实例的property属性上去
                            Object beanObj = beanMap.get(beanId);
                            Class<?> beanClazz = beanObj.getClass();
                            Field propertyField = beanClazz.getDeclaredField(propertyRef);
                            propertyField.setAccessible(true);
                            propertyField.set(beanObj,refObj);
                        }
                    }

                }
            }
        } catch (ParserConfigurationException | IOException | SAXException | ClassNotFoundException | InstantiationException | IllegalAccessException | NoSuchFieldException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Object getBean(String id) {
        return beanMap.get(id);
    }
}
```

然后再在DispacherServlet中定义BeanFactory实例。之前获取组件是直接从beanMap中得到：

beanMap.get();

而现在由BeanFactory进行统一管理：

beanFactory.getBean();

```java
package com.yumo.myssm.myspringmvc;

import com.alibaba.druid.util.StringUtils;
import com.yumo.myssm.ioc.BeanFactory;
import com.yumo.myssm.ioc.ClassPathXmlApplicationContext;
import com.yumo.myssm.util.StringUtil;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebInitParam;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.*;
import java.util.HashMap;
import java.util.Map;

@WebServlet(urlPatterns = {"*.do"})
public class DispacherServlet extends ViewBaseServlet {

    private BeanFactory beanFactory;
    
    @Override
    public void init() throws ServletException {
        super.init();
        beanFactory=new ClassPathXmlApplicationContext();
    }

    /**
     * 在构造方法中解析配置文件
     */



    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //设置编码
        request.setCharacterEncoding("UTF-8");

        //1、 根据url定位到能够处理这个请求的controller组件：
        //假设url是  http://localhost:8080/WebJava_war_exploded/hello.do
        //那么servletPath是： /hello.do
        //1.1、url中提取servletPath   /hello.do -> hello
        String servletPath = request.getServletPath();
        servletPath=servletPath.substring(1,servletPath.lastIndexOf(".do"));
        //1.2、根据fruit找到对应的组件：FruitController：
        Object controllerBeanObj = beanFactory.getBean(servletPath);

        //1.3、根据获取到的operate的值定位到FruitController中需要调用的方法
        String operate = request.getParameter("operate");
        if (StringUtil.isEmpty(operate)) {
            operate = "index";
        }


        //2、调用Controller组件中的方法
        try {
            for (Method method : controllerBeanObj.getClass().getDeclaredMethods()) {
                if (operate.equals(method.getName())) {
                    //2.1、统一获取请求参数
                    Parameter[] parameters = method.getParameters();

                    Object[] parameterValues = new Object[parameters.length];
                    //需要在Java compiler 的 addition command parameters中设置 -parameters
                    for (int i=0;i<parameters.length;i++){
                        Parameter parameter=parameters[i];
                        String parameterName = parameter.getName();

                        //如果参数是request、response、session，则不通过请求获取值
                        if ("request".equals(parameterName)){
                            parameterValues[i]=request;
                        }else if("response".equals(parameterName)){
                            parameterValues[i]=response;
                        }else if("session".equals(parameterName)){
                            parameterValues[i]=request.getSession();
                        }else {
                            //从请求中获取参数值
                            String parameterValue = request.getParameter(parameterName);
                            String typeName = parameter.getType().getName();

                            //因为parameterValue为String类型，所以可能会出现参数类型不匹配
                            Object parameterObj=parameterValue;
                            if (parameterObj!=null){
                                if ("java.lang.Integer".equals(typeName)) {
                                    parameterObj = Integer.parseInt(parameterValue);
                                }
                            }
                            parameterValues[i]=parameterObj;
                        }

                    }

                    //2.2、controller组件中的方法调用
                    //找到和operate同名的方法，通过反射技术调用它
                    method.setAccessible(true);
                    Object returnObj = method.invoke(controllerBeanObj,parameterValues);


                    //2.3、视图处理
                    String methodReturnStr = (String) returnObj;
                    if (methodReturnStr.startsWith("redirect:")) {      //如   redirect:fruit.do
                        String redirectStr = methodReturnStr.substring("redirect:".length());
                        response.sendRedirect(redirectStr);
                    } else {
                        super.processTemplate(methodReturnStr, request, response);          //比如 edit
                    }
                }
            }
        } catch (InvocationTargetException | IllegalAccessException e) {
            e.printStackTrace();
        }


    }
}
```

XML配置文件

配置各个组件之间的依赖关系，以让BeanFactory进行依赖注入。

```java
<?xml version="1.0" encoding="UTF-8" ?>

<!--一个JavaBean称为一个Java对象-->
<beans>
    <bean id="fruitDAO" class="com.yumo.fruit.dao.Impl.FruitDAOImpl"/>

    <bean id="fruitService" class="com.yumo.fruit.service.impl.FruitServiceImpl">
        <!--property标签用来表示属性：name表示属性名；ref表示引用其他bean的id值-->
        <property name="fruitDAO" ref="fruitDAO"/>
    </bean>
    <!-- 这个bean标签的作用是  将来servletPath中涉及的名字对应的是fruit，那么就要FruitController这个类来处理-->
    <bean id="fruit" class="com.yumo.fruit.controllers.FruitController">
        <property name="fruitService" ref="fruitService"/>
    </bean>
</beans>
```

#### 过滤器Filter

过滤器的三要素：

- **拦截**

  过滤器之所以能够对请求进行预处理，关键是对请求进行拦截，把请求拦截下来才能做后续的操作。而且对于一个具体的过滤器，它必须明确它要拦截的请求，而不是所有请求都拦截。

- **过滤**

  根据业务功能实际的需求，看把请求拦截之后需要做上面检查或操作，写对应的代码。

- **放行**

  过滤器完成自己的任务或者是检测当前请求符合过滤规则，那么可以将请求放行。所谓放行，就是让请求继续去访问它原本要访问的资源。

Filter也属于Servlet规范

开发步骤：

1. 新建类实现Filter接口

2. 实现其中的三个方法：init、doFilter、destroy

3. 配置Filter

   - 通过注解配置：@WebFilter(urlPatterns)，其中urlPatterns与要拦截的请求一致。且可以使用通配符@WebFilter("*.do")表示拦截所有以.do结尾的请求

   - 通过XML配置：

     ```xml
     <filter>
         <filter-name>Filter01</filter-name>
         <filter-class>com.yumo.fruit.filter.Filter01</filter-class>
     </filter>
     <filter-mapping>
         <filter-name>Filter01</filter-name>
         <url-pattern>*.do</url-pattern>
     </filter-mapping>
     ```

过滤器链FilterChain

如果采取注解方式进行配置，那么过滤器链的拦截顺序是按照全类名的先后顺序排序的。

如果采取XML的方式进行配置，那么按照配置的先后顺序进行排序。

##### 示例程序

拦截所有以.do结尾的请求，并设置其字符编码

```java
package com.yumo.myssm.filter;

import com.yumo.myssm.util.StringUtil;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.annotation.WebInitParam;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

@WebFilter(urlPatterns = "*.do",initParams = {@WebInitParam(name = "encoding",value = "UTF-8")})
public class CharacterEncodingFilter implements Filter {
    private String encoding="UTF-8";
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        String encodingStr = filterConfig.getInitParameter("encoding");
        if (StringUtil.isNotEmpty(encodingStr)){
            encoding=encodingStr;
        }
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

        ((HttpServletRequest)servletRequest).setCharacterEncoding("UTF-8");
        filterChain.doFilter(servletRequest,servletResponse);
    }

    @Override
    public void destroy() {
        Filter.super.destroy();
    }
}
```

#### 事务管理

在上面的代码中，Service层包含多个DAO操作。假如在DAO层执行事务处理，则可能出现一个事务成功提交，而另一个事务回滚，从而造成数据异常。

service的操作应该是一个整体，不能部分成功部分失败。

因此：事务管理不能以DAO层的单精度方法为单位，而应该以业务层的方法为单位。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220417191516132.png)

应该从最底层的DAO开始，抛出RuntimeException异常，中间层捕获后继续抛出，直至最上层的Filter捕获后执行事务回滚。

可以定义一个TranscationManager来执行事务管理

```java
package com.yumo.fruit.transcation;

import com.yumo.myssm.util.JDBCUtilByDruid;

import java.sql.SQLException;

public class TranscationManager {

    /**
     * 开启事务
     */
    public static void beginTrans()  {
        try {
            JDBCUtilByDruid.getConnection().setAutoCommit(false);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 提交事务
     */
    public static void commit()  {
        try {
            JDBCUtilByDruid.getConnection().commit();
            JDBCUtilByDruid.close();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 回滚事务
     */
    public static void rollback() {
        try {
            JDBCUtilByDruid.getConnection().rollback();
            JDBCUtilByDruid.close();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
```

在最顶层的Filter中捕获异常并回滚

```java
package com.yumo.myssm.filter;

import com.yumo.fruit.transcation.TranscationManager;
import com.yumo.myssm.util.JDBCUtilByDruid;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import java.io.IOException;

@WebFilter("*.do")
public class OpenSessionInViewFilter implements Filter {
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        try {
            Filter.super.init(filterConfig);
        }catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain)  {

        try {
            TranscationManager.beginTrans();
            System.out.println("开启事务......");
            filterChain.doFilter(servletRequest,servletResponse);
            TranscationManager.commit();
            System.out.println("提交事务......");
        } catch (Exception e) {
            TranscationManager.rollback();
            System.out.println("回滚事务......");
            throw new RuntimeException(e);
        }
    }

    @Override
    public void destroy() {
        try {
            Filter.super.destroy();
        }catch (Exception e){
            throw new RuntimeException(e);
        }
    }
}
```

同时记得逐层修改为捕获后抛出运行时异常。

#### ThreadLocal

ThreadLocal称之为本地线程。可以通过set方法在当前线程上存储数据，通过get方法在当前线程上获取数据。

##### 源码分析

```java
public void set(T value) {
    Thread t = Thread.currentThread();//获取当前的线程
    ThreadLocalMap map = getMap(t);   //每一个线程都维护着各自的一个容器
    if (map != null) {
        map.set(this, value);         //这里的key对应的是当前的ThreadLocal，一个线程可以有多个不同类型的ThreadLocal
    } else {
        createMap(t, value);
    }
}
```

```java
public T get() {
    Thread t = Thread.currentThread();//获取当前的线程
    ThreadLocalMap map = getMap(t);   //获取和这个线程相关的ThreadLocalMap
    if (map != null) {
        ThreadLocalMap.Entry e = map.getEntry(this);////这里的key对应的是当前的ThreadLocal,得到对应的ThreadLocal映射
        if (e != null) {
            @SuppressWarnings("unchecked")
            T result = (T)e.value;     //得到该ThreadLocal的值
            return result;
        }
    }
    return setInitialValue();
}
```

#### 监听器Listener

- ServletContextListener          			   监听ServletContext对象的创建和销毁的过程
- HttpSessionListener                              监听HttpSession对象的创建和销毁的过程
- ServletRequestListener                         监听ServletRequest对象的创建和销毁的过程



- ServletContextAttributeListener          监听ServletContext的保存作用域的改动(add,remove,replace)

- HttpSessionAttributeListener               监听HttpSession的保存作用域的改动(add,remove,replace)
- ServletRequestAttributeListener          监听ServletRequest的保存作用域的改动(add,remove,replace)



- HttpSessionBindingListener                 监听某个对象在session作用域的绑定和移除          
- HttpSessionActivationListener             监听某个对象在session作用域的序列化和反序列化

##### 配置Listener

- 注解      @WebListener

- XML

  ```xml
  <listener>
  	<listener-class>com.yumo.myssm.listener.MyServletContextListener</listener-class>
  </listener>
  ```

##### 优化

在DispatcherServlet类的初始化方法中，我们会实例化BeanFactory对象，从而创建IOC容器。

```java
@WebServlet(urlPatterns = {"*.do"})
public class DispatcherServlet extends ViewBaseServlet {

    private BeanFactory beanFactory;

    @Override
    public void init() throws ServletException {
        super.init();
        beanFactory=new ClassPathXmlApplicationContext();
    }
    ......
}
```

但我们希望在tomcat启动的同时就创建好IOC容器。因此创建一个ServletContextListener的实现类

监听上下文启动，在上下文启动的时候创建IOC容器，然后将其保存到servletContext作用域中

后面中央控制器再从servletContext作用域中去获取IOC容器



先在web.xml创建servletContext的初始化参数以设置IOC容器的配置文件

```xml
<context-param>
    <param-name>contextConfigLocation</param-name>
    <param-value>applicationContext.xml</param-value>
</context-param>
```

```java
package com.yumo.myssm.listener;

import com.yumo.myssm.ioc.BeanFactory;
import com.yumo.myssm.ioc.ClassPathXmlApplicationContext;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

/**
 * 监听上下文启动，在上下文启动的时候创建IOC容器，然后将其保存到servletContext作用域中
 * 后面中央控制器再从servletContext作用域中去获取IOC容器
 */
@WebListener
public class ContextLoaderListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        //1、获取servletContext对象
        ServletContext servletContext = sce.getServletContext();
        //2、获取servletContext的初始化参数
        String path = servletContext.getInitParameter("contextConfigLocation");
        //3、创建IOC容器
        BeanFactory beanFactory = new ClassPathXmlApplicationContext(path);
        //4、将IOC容器保存到servletContext作用域
        servletContext.setAttribute("beanFactory",beanFactory);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        ServletContextListener.super.contextDestroyed(sce);
    }
}
```



中央控制器DispatcherServlet再从servletContext作用域中去获取IOC容器

```java
@WebServlet(urlPatterns = {"*.do"})
public class DispatcherServlet extends ViewBaseServlet {

    private BeanFactory beanFactory=null;

    @Override
    public void init() throws ServletException {
        super.init();
        //之前是在此处主动创建IOC容器的
        //现在优化为从servletContext作用域获取
        //BeanFactory beanFactory = new ClassPathXmlApplicationContext();

        ServletContext servletContext = getServletContext();
        Object beanFactoryObj = servletContext.getAttribute("beanFactory");
        if (beanFactoryObj!=null){
            beanFactory=(BeanFactory) beanFactoryObj;
        }else {
            throw new RuntimeException("IOC容器获取失败");
        }
    }
    ......
}
```

然后再BeanFactory实现类中增加无参构造

```java
public class ClassPathXmlApplicationContext implements BeanFactory{

    private Map<String,Object> beanMap= new HashMap<>();
    private String path="applicationContext.xml";

    public ClassPathXmlApplicationContext() {
        this("applicationContext.xml");
    }
    
    ...
}
```

至此，水果库存管理系统项目已经初步完善并优化。