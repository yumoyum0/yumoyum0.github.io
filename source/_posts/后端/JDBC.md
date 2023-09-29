---
title: JDBC
date: 2022-04-03 16:51:33
tags:
- 后端
- Java
- Database
categories:
- 后端
---

# JDBC

## 1、JDBC介绍

根据**Oracle**的声明，**JDBC**是一个注册了商标的术语，而并非 **Java DataBase Connectivity** 的首字母缩写。对它的命名体现了对**ODBC**的致敬，后者是微软开创的标准数据库API，为**C语言**访问数据库提供了一套编程接口，并因此并入了**SQL**标准中。JDBC和ODBC都基于同一个思想：

​	**根据API编写的程序都可以与驱动管理器进行通信，而驱动管理器则通过驱动程序与实际的数据库进行通信。**

### 1.1、JDBC驱动程序类型

JDBC规范将驱动程序归结为以下几类：

- *第1类驱动程序*将JDBC翻译成ODBC，然后用ODBC驱动程序与数据库进行通信。较早版本的Java包包含了这样一个驱动程序：**JDBC/ODBC桥**，不过在使用这个桥接器之前需要对ODBC进行相应的部署和正确的设置。在JDBC面世之初，桥接器可以方便地用于测试，却不太适用于产品的开发。现在有更好的驱动程序可以使用，所以JDK已经不再提供JDBC/ODBC桥了
- *第2类驱动程序*是**由部分Java程序和部分本地代码**组成的，用于**与数据库的客户端API进行通信**。在使用这个驱动程序之前，客户端不仅需要安装Java类库，还需要安装一些与平台相关的代码
- *第3类驱动程序*是**纯Java客户端类库**，它使用一种**与具体数据库无关的协议**将**数据库请求**发送给**服务器构建**，然后该构建再将数**据库请求翻译成数据库相关的协议**。这简化了部署，因为平台相关的代码只位于服务器端。
- *第4类驱动程序*是**纯Java类库**，它将**JDBC请求**直接**翻译**成**数据库相关的协议**。

大部分数据库供应商都为他们的产品提供第3或第4类驱动程序。总之，JDBC最终是为了实现以下目标：

- 通过使用标准的SQL语句，甚至是专门的SQL扩展，程序员就可以利用Java语言开发访问数据库的应用，同时还依旧遵守Java语言的相关协定。
- 数据库供应商和数据库工具开发商可以提供底层的驱动程序。因此，他们可以优化各自数据库产品的驱动程序。

### 1.2、JDBC的典型用法

在传统的**客户端/服务器模型**中，通常是在服务器端部署数据库，而在客户端安装富GUI程序。在此模型中，**JDBC驱动程序应该部署在客户端**。如下图所示：

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/屏幕截图-2022-04-03-143240.png)

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/屏幕截图-2022-04-03-154850.png)

但是如今**三层模型**更加常见。在三层应用模型中，客户端不直接调用数据库，而是调用**服务器**上的**中间件层**，由中间件完成数据库查询操作。这种三层模型有以下优点：它将***可视化表示***（位于客户端）从***业务逻辑***（位于中间层）和***原始数据***（位于数据库）中分离出来。因此我们可以从不同的客户端，如Java桌面应用、浏览器或者移动APP，来访问相同的数据和相同的业务规则。

客户端和中间层之间的通信在典型情况下是通过**HTTP**来实现的。JDBC管理着**中间层**和**后台数据库**之间的**通信**，下图展示了这种通信模型的基本架构。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/屏幕截图-2022-04-03-142937.png)

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/屏幕截图-2022-04-03-155125_magic.png)

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/屏幕截图-2022-04-03-155309_magic.png)

### 1.3、结构化查询语言

SQL是对所有现代关系型数据库都至关重要的命令行语言，JDBC则使得我们可以通过SQL与数据库进行通信。桌面数据库通常都有一个图形化用户界面：通过这种界面，用户可以直接操作数据。但是，基于服务器的数据库只能使用SQL进行访问。

我们可以将JDBC包看作一个用于将SQL语句传递给数据库的应用编程接口（API）

## 2、JDBC配置

本文章使用的是mysql8.0.28

### 驱动程序JAR文件

**mysql-connector-java的jar包：**

maven添加jar包依赖：

```xml
<!-- https://mvnrepository.com/artifact/mysql/mysql-connector-java -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.28</version>
        </dependency>
```

### 配置：

#### 1、开启Mysql服务

以管理员身份运行命令提示符，输入 `net start mysql80` **开启mysql服务** ，mysql80是安装的时候，设置的服务名。
输入 `net stop mysql80` **关闭mysql服务** 。

开启mysql服务后就可以关闭cmd框，然后开始写代码了。

#### 2、JDBC链接

通常情况下连接url设置成这样即可：
	协议名://IP地址:端口号/数据库名?参数1&参数2&...

​	jdbc:*subprotocol*:*other stuff*

其中*subprotocol*用于选择连接到数据库的基本驱动程序，*other stuff*参数的格式随使用的*subprotocol*不同而不同。

例如：
	jdbc:mysql://localhost:3306/databaseName?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8

详解：

| **参数**                | **说明**                                                     |
| ----------------------- | ------------------------------------------------------------ |
| jdbc:mysql              | 协议                                                         |
| localhost:3306          | localhost是本机地址127.0.0.1 ， 3306 端口名，是mysql开启的服务，如果上述的mysql服务未开启，会报 `com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure `的异常 |
| databaseName            | 数据库的名字，如果没有此数据库会报`SQLSyntaxErrorException: Unknown database 'xxx'`，的异常 |
| useSSL=false            | 在web领域要用到，指是否开启ssl安全连接，但MySQL 8.0 以上版本不需要建立 SSL 连接，需要关闭。 |
| serverTimezone=UTC      | 设置时区                                                     |
| characterEncoding=UTF-8 | 设置编码格式，不设置很可能造成乱码。                         |

## 3、JDBC程序编写步骤

1、注册驱动-加载Driver类

2、获取连接-得到Connection

3、执行增删改查-发送SQL给mysql执行

4、释放资源-关闭相关连接

#### 示例程序

```java
package javabase.jdbc;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;
import com.mysql.cj.jdbc.Driver;
public class JDBC01 {
    public static void main(String[] args) throws SQLException {

        //1.注册驱动
        Driver driver = new Driver();
        //2.得到连接
        //(1) jdbc:mysql://  规定好表示协议，通过jdbc的方式连接mysql
        //(2) localhost  主机，可以是IP地址
        //(3) 3306  表示mysql监听的端口
        //(4) crashcourse 连接到mysql dbms的哪个数据库
        //(5) mysql的连接本质就是 socket 连接

        String url="jdbc:mysql://localhost:3306/crashcourse?serverTimezone=GMT";
        //将用户名和密码放入到Properties对象
        Properties properties = new Properties();
        //说明user 和 password 是规定好，后面的值根据实际情况写
        properties.setProperty("user","root");
        properties.setProperty("password","168178");
        Connection connect = driver.connect(url, properties);
        //3.执行sql
        String sql="INSERT INTO actor VALUES (null ,'刘德华','男','1970-11-11','110')";
        //statement 用于执行静态SQL语句并返回其生成的结果的对象
        Statement statement = connect.createStatement();
        int rows = statement.executeUpdate(sql);// 返回影响的行数

        System.out.println(rows>0?"成功":"失败");
        //4.关闭连接资源
        statement.close();
        connect.close();
    }
}
```

### 创建connection

```java
package javabase.jdbc;

import com.mysql.cj.jdbc.Driver;
import org.junit.Test;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public class JDBCConn {

    /**
     *直接使用com.mysql.cj.jdbc.Driver(),属于静态加载，灵活性差，依赖强
    */
    @Test
    public void connect01()throws SQLException
    {
        //直接使用com.mysql.cj.jdbc.Driver(),属于静态加载，灵活性差，依赖强
        Driver driver = new Driver();
        String url="jdbc:mysql://localhost:3306/crashcourse?serverTimezone=GMT";
        //将用户名和密码放入到Properties对象
        Properties properties = new Properties();
        //说明user 和 password 是规定好，后面的值根据实际情况写
        properties.setProperty("user","root");
        properties.setProperty("password","168178");
        Connection connect = driver.connect(url, properties);
        System.out.println(connect);
    }

    /**
     * 使用反射加载Driver类
     */
    @Test
    public void connect02() throws NoSuchMethodException, ClassNotFoundException, InvocationTargetException, InstantiationException, IllegalAccessException, SQLException {
        //使用反射加载Driver类，动态加载，减少依赖性
        Class<?> aClass = Class.forName("com.mysql.cj.jdbc.Driver");
        Driver driver=(Driver) aClass.getDeclaredConstructor().newInstance();

        String url="jdbc:mysql://localhost:3306/crashcourse?serverTimezone=GMT";
        //将用户名和密码放入到Properties对象
        Properties properties = new Properties();
        //说明user 和 password 是规定好，后面的值根据实际情况写
        properties.setProperty("user","root");
        properties.setProperty("password","168178");

        Connection connect = driver.connect(url, properties);
        System.out.println(connect);
    }

    /**
     *方式3：使用反射加载Driver类，使用DriverManager进行统一管理
     */
    @Test
    public void connect03() throws SQLException, ClassNotFoundException, NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException {
        //使用反射加载Driver类，动态加载，减少依赖性
        Class<?> aClass = Class.forName("com.mysql.cj.jdbc.Driver");
        Driver driver=(Driver) aClass.getDeclaredConstructor().newInstance();

        //创建 url 和 user 和 password
        String url="jdbc:mysql://localhost:3306/crashcourse?serverTimezone=GMT";
        String user="root";
        String password="168178";

        //使用DriverManager进行统一管理
        //注册Driver驱动
        DriverManager.registerDriver(driver);

        Connection connection = DriverManager.getConnection(url, user, password);
        System.out.println(connection);
    }

    /**
     *方式4：使用Class.forName 自动完成注册驱动，简化代码
     * 这种方式获取连接推荐使用
     */
    @Test
    public void connect() throws ClassNotFoundException, SQLException {

        //使用反射加载Driver类，动态加载，减少依赖性
        //在加载 Driver类时，自动完成注册
        /**
         * 源码：1、静态代码快。在类加载时，会执行一次
         * 2、java.sql.DriverManager.registerDriver(new Driver());
         * 3、因此注册driver的工作语句完成
         * static {
         *         try {
         *             java.sql.DriverManager.registerDriver(new Driver());
         *         } catch (SQLException E) {
         *             throw new RuntimeException("Can't register driver!");
         *         }
         *     }
         * mysqL驱动5.1.6可以无需CLass . forName("com.mysql.jdbc.Driver");
         * 从jdk1.5以后使用了jdbc4,不再需要显示调用class.forName()注册驱动而是自动调用驱动jar包下META-INF\servicesVjava .sqI.Driver文本中的类名称去注册
         * 建议还是写上类。ForName(“com.mysql.jdbc.Driver”)，更加明确
         */
        Class.forName("com.mysql.cj.jdbc.Driver");

        //创建 url 和 user 和 password
        String url="jdbc:mysql://localhost:3306/crashcourse?serverTimezone=GMT";
        String user="root";
        String password="168178";

        Connection connection = DriverManager.getConnection(url, user, password);
        System.out.println(connection);
    }

    /**
     * 方式5，在方式4的基础上改进，增加配置文件，让连接mysql更加灵活
     */
    @Test
    public void connect05() throws IOException, ClassNotFoundException, SQLException {
        //通过Properties对象获取配置文件的信息
        Properties properties = new Properties();
        properties.load(new FileInputStream("src/javabase/jdbc/database.properties"));
        //获取相关的值
        String user = properties.getProperty("jdbc.user");
        String password = properties.getProperty("jdbc.password");
        String driver = properties.getProperty("jdbc.driver");
        String url = properties.getProperty("jdbc.url");

        Class.forName("com.mysql.cj.jdbc.Driver");

        Connection connection = DriverManager.getConnection(url, user, password);
        System.out.println(connection);
    }
}
```



### ResultSet结果集

表示数据库结果集的数据表，通常通过执行查询数据库的语句生成.

ResultSet对象保持一个光标指向其当前的数据行。最初，光标位于第一行之前。next方法将光标移动到下一行，并且由于在ResultSet对象中没有更多行时返回false。因此可以在while循环中使用循环来遍历结果集。

> **警告**：ResultSet接口的迭代协议与java.util.Iterator接口稍有不同。对于ResultSet接口，迭代器初始化时被设定在第一行之前的位置，必须调用next方法将它移动到第一行。另外，它没有hasNext方法，我们需要不断地调用next，直至该方法返回false。

### Statement和SQL注入

Statement对象用于执行**静态SQL语**句并返回其生成的结果的对象。

在连接建立后，需要对数据库进行访问，执行命名或是SQL语句，可以通过：

- **Statement**[存在SQL注入 ]
- **PreparedStatement**[预处理]
- **CallableStatement**[存储过程]

Statement对象执行SQL语句，存在**SQL注入**风险。

**SQL注入**是利用某些系统没有对用户输入的数据进行充分的检查，而在用户输入数据中注入非法的SQL语句段或命令，恶意攻击数据库。

要防范SQL注入，只要用**PreparedStatement**取代Statement就可以了。

演示：

```sql
CREATE TABLE admin (
	name VARCHAR(32) NOT NULL UNIQUE,
	pwd VARCHAR(32) NOT NULL DEFAULT ''
)CHARACTER SET utf8; 

INSERT INTO admin VALUES("tom","123");
```

```sql
SELECT *
		FROM admin
		WHERE NAME='tom' AND pwd ='123';
```

正常情况下该select语句将会成功返回对应的数据。

若使  用户名为  **1' or** 

​          密码为    **or '1' =1'**

```sql
SELECT *
		FROM admin
		WHERE NAME='1' or' AND pwd ='or '1'='1';
```

这种情况也会返回数据

#### 示例程序

```java


import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.*;
import java.util.Properties;
import java.util.Scanner;

/**
 * 演示Statement的SQL注入问题
 * name = 1' or
 * psw = or '1'='1    万能密码
 */
public class Statement_ {
    public static void main(String[] args) throws IOException, ClassNotFoundException, SQLException {


        Scanner scanner = new Scanner(System.in);


        //让用户输入管理员名和密码
        System.out.print("请输入管理员的名字: ");
        String admin_name=scanner.nextLine();//next 不读取空格
        System.out.print("请输入管理员的密码: ");
        String admin_pwd=scanner.nextLine();
        //通过Properties对象获取配置文件的信息
        Properties properties = new Properties();
        properties.load(new FileInputStream("src/javabase/jdbc/database.properties"));
        //获取相关的值
        String user = properties.getProperty("jdbc.user");
        String password = properties.getProperty("jdbc.password");
        String driver = properties.getProperty("jdbc.driver");
        String url = properties.getProperty("jdbc.url");

        //1、注册驱动
        Class.forName("com.mysql.cj.jdbc.Driver");

        //2、得到连接
        Connection connection = DriverManager.getConnection(url, user, password);

        //3、得到statement
        Statement statement = connection.createStatement();

        //4.组织SQL
        String sql="SELECT name,pwd FROM admin WHERE name='"
                +admin_name+"' and pwd='"+admin_pwd+"'";
        ResultSet resultSet=statement.executeQuery(sql);
        if (resultSet.next())
        {
            System.out.println("登录成功");
        }else System.out.println("登陆失败");

        resultSet.close();
        statement.close();
        connection.close();

    }
}
```

### PreparedStatement

1、PreparedStatement执行的SQL语句中的参数用**问号(?)**来表示，调用PreparedStatement对象的**setXxx()**方法来设置这些参数,setXxx()方法有两个参数，第一个参数是要设置的SQL语句中参数的**索引（从1开始）**，第二个是设置的SQL语句中的**参数的值**

2、调用executeQuery()，返回ResultSet对象

3、调用executeUpdate()，执行更新

预处理好处：

1、不再使用+拼接SQL语句，减少语法错误

2、有效的解决了SQL注入问题

3、大大减少了编译次数，效率较高

#### 示例程序

```java
package javabase.jdbc;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.sql.*;
import java.util.Properties;
import java.util.Scanner;

/**
 * 演示PreparedStatement
 * name = 1' or
 * psw = or '1'='1    万能密码
 */
@SuppressWarnings("all")
public class PreparedStatement_ {
    public static void main(String[] args) throws SQLException, ClassNotFoundException, IOException {

        Scanner scanner = new Scanner(System.in);


        //让用户输入管理员名和密码
        System.out.print("请输入管理员的名字: ");
        String admin_name=scanner.nextLine();//next 不读取空格
        System.out.print("请输入管理员的密码: ");
        String admin_pwd=scanner.nextLine();
        //通过Properties对象获取配置文件的信息
        Properties properties = new Properties();
        properties.load(new FileInputStream("src/javabase/jdbc/database.properties"));
        //获取相关的值
        String user = properties.getProperty("jdbc.user");
        String password = properties.getProperty("jdbc.password");
        String driver = properties.getProperty("jdbc.driver");
        String url = properties.getProperty("jdbc.url");

        //1、注册驱动
        Class.forName("com.mysql.cj.jdbc.Driver");

        //2、得到连接
        Connection connection = DriverManager.getConnection(url, user, password);

        //4.组织SQL,   ?  相当于占位符
        String sql="SELECT name,pwd FROM admin WHERE name=? and pwd=?";
       
       
        //3、preparedStatement对象实现了PreparedStatement接口的实现类的镀锡
        PreparedStatement preparedStatement = connection.prepareStatement(sql);
        //给 ? 赋值
        preparedStatement.setString(1,admin_name);
        preparedStatement.setString(2,admin_pwd);


        //这里执行查询时不写sql
        ResultSet resultSet=preparedStatement.executeQuery();
        if (resultSet.next())
        {
            System.out.println("登录成功");
        }else System.out.println("登陆失败");

        resultSet.close();
        preparedStatement.close();
        connection.close();

    }
}
```

### JDBC API

1、Driver  DriverManager

registerDriver(Driver driver):在DriverManager中注册jdbc驱动器。（一般不使用） 因为在DriverManager类中已经有了一个静态代码块已经调用了所以我们在工作中一般使用

Class.forName(“com.mysql.jdbc.Driver”)

deregister(Driver driver):在DriverManager中注销jdbc驱动器。

setLoginTimeOut(int seconds): 设定等待建立数据库连接的超时时间。

setLoginWriter(PrintWriter out) : 设定输出JDBC日志的PrintWriter对象。

getConnection(url,user,pwd)建立一个到指定数据库的连接，并返回一个Connection对象

2、Connection

​	createStatement()创建Statement对象

​	prepareStatement(String  sql)生成预处理对象

​	close() 立即关闭当前的连接，并释放由它所创建的JDBC资源

3、Statement

​	executeQuery(String sql)执行查询，返回ResultSet对象

​	executeUpdate(String sql)执行DML语句，返回受影响的行数

​	executeLargeUpdate(String sql)执行DML语句，返回受影响的行数

​	execute(String sql)执行任意sql，结果为结果集则返回true,否则返回false

​	getResultSet()返回前一条查询语句的结果集，若前一条未产生结果集则返回null。对于每一条被执行过的语句，该方法只能被调用一次

​	getUpdateCount()返回前一条更新语句影响的行数，若前一条未更新数据库，则返回-1。对于每一条被执行过的语句，该方法只能被调用一次

​	close()关闭该语句对象及其对应的结果集

​	isClosed()如果该语句被关闭则返回true

​	closeOnCompletion()一旦该语句的所有结果集都被关闭，则关闭该语句

4、PreparedStatement

​	setXxx(int n,Xxx x)设置第n个参数值为x

​	clearParameters()清楚预备语句的所有当前参数

​	executeQuery()执行预备sql查询，并返回一个ResultSet对象

​	executeUpdate()执行dml语句，返回受影响的记录总数。若执行数据定义语言(DDL)如CREATE TABLE，则返回0

5、ResultSet

​	next()向下移动一行，若没有下一行则返回false

​	previous()向上移动一行，若没有上一行则返回false

​	getXxx(int columnNumber)

​	getXxx(String columnLabel)

​	getObject(int columnNumber,Class< T > type )

​	getObject(String columnLabel，Class< T > type )

​	用给定的列序号或列名返回该列的值，并将值转换成指定的类型

​	findColumn(String columnName)根据给定的列名返回该列的序号

​	close()立即关闭当前的结果集

​	isClosed()若该语句被关闭则返回true

### 编写JDBCUtils类

```java
package javabase.jdbc.utils;


import java.io.FileInputStream;
import java.io.IOException;
import java.sql.*;
import java.util.Properties;

/**
 * @author yumo
 * 这是一个工具类，完成mysql的连接和关闭资源
 */
public class JDBCUtils {

    //定义相关的属性
    private static String user;
    private static String password;
    private static String url;
    private static String driver;

    //在static代码块去初始化
    static {
        Properties properties = new Properties();
        try {
            properties.load(new FileInputStream("src/javabase/jdbc/database.properties"));
            //获取相关的值
             user = properties.getProperty("jdbc.user");
             password = properties.getProperty("jdbc.password");
             driver = properties.getProperty("jdbc.driver");
             url = properties.getProperty("jdbc.url");
        } catch (IOException e) {
            //在实际开发中
            //1、将编译异常转成运行异常
            //2、调用者可以选择捕获该异常，也可以选择默认处理该异常，比较方便
            throw new RuntimeException(e);
        }
    }
    public static Connection getConnection(){
        try {
            return DriverManager.getConnection(url,user,password);
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    public static void close(ResultSet set, Statement statement,Connection connection)
    {
        //判断是否为null
       try {
            if (set != null) {
                set.close();
            }
            if (statement != null) {
                statement.close();
            }
            if (connection != null) {
                connection.close();
            }
       }catch (SQLException e)
       {
           throw new RuntimeException(e);
       }
    }
}
```

#### 测试代码

```java
package javabase.jdbc.utils;

import org.junit.Test;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class JDBCUtils_Use {

    @Test
    public void testDML()
    {
        //得到连接
        Connection connection = null;

        //组织一个sql
        String sql="update actor set name =? where  id =?";
        PreparedStatement preparedStatement=null;
        //创建PreparedStatement对象
        try{
            connection = JDBCUtils.getConnection();
            preparedStatement=connection.prepareStatement(sql);
            preparedStatement.setString(1,"周星驰");
            preparedStatement.setInt(2,1);

            preparedStatement.executeUpdate();
        } catch (SQLException e)
        {
            e.printStackTrace();
        } finally {
            JDBCUtils.close(null,preparedStatement,connection);
        }
    }
    @Test
    public void testSelect()
    {
        //得到连接
        Connection connection = null;

        //组织一个sql
        String sql="select * from actor";
        PreparedStatement preparedStatement=null;
        ResultSet resultSet =null;
        //创建PreparedStatement对象
        try{
            connection = JDBCUtils.getConnection();
            preparedStatement=connection.prepareStatement(sql);

           resultSet = preparedStatement.executeQuery();
            while (resultSet.next())
            {
                System.out.println(resultSet.getString("name"));
            }
        } catch (SQLException e)
        {
            e.printStackTrace();
        } finally {
            JDBCUtils.close(resultSet,preparedStatement,connection);
        }
    }
}
```

## 4、事务

基本介绍：

事务
基本介绍
1、JDBC程序中当一个Connection对象创建时，默认情况下是自动提交事务:每次执行一个SQL语句时，如果执行成功，就会向数据库自动提交，而不能回滚.

2、JDBC程序中为了让多个SQL语句作为一个整体执行，需要使用事务

3、调用Connection的 setAutoCommit(false)可以取消自动提交事务

4、在所有的SQL语句都成功执行后，调用Connection的commit();方法提交事务

5、在其中某个操作失败或出现异常时，调用Connection 的rollback();方法回滚事务

### 示例程序

```java
package javabase.jdbc;

import javabase.jdbc.utils.JDBCUtils;
import org.junit.Test;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class Transaction_ {

    @Test
    public void noTransaction()
    {
        //得到连接
        Connection connection = null;

        //组织一个sql
        String sql="update acc set balance =balance-100 where  id =1";
        String sql2="update acc set balance =balance+100 where  id =2";

        PreparedStatement preparedStatement=null;
        //创建PreparedStatement对象
        try{
            connection = JDBCUtils.getConnection();//在默认情况下，connection默认提交
            preparedStatement=connection.prepareStatement(sql);
            preparedStatement.executeUpdate();

            int i=1/0;//抛出异常

            preparedStatement=connection.prepareStatement(sql2);
            preparedStatement.executeUpdate();

        } catch (SQLException e)
        {
            e.printStackTrace();
        } finally {
            JDBCUtils.close(null,preparedStatement,connection);
        }
    }

    @Test
    public void useTransaction(){
        //得到连接
        Connection connection = null;

        //组织一个sql
        String sql="update acc set balance =balance-100 where  id =1";
        String sql2="update acc set balance =balance+100 where  id =2";

        PreparedStatement preparedStatement=null;
        //创建PreparedStatement对象
        try{
            connection = JDBCUtils.getConnection();//在默认情况下，connection默认提交
            //将connection设置为不自动提交
            connection.setAutoCommit(false);//开启了事务
            preparedStatement=connection.prepareStatement(sql);
            preparedStatement.executeUpdate();

            int i=1/0;//抛出异常

            preparedStatement=connection.prepareStatement(sql2);
            preparedStatement.executeUpdate();

            //这里提交事务
            connection.commit();
        } catch (SQLException e)
        {
            //这里进行回滚，即撤销执行的sql
            //默认回滚到事务开始的状态
            System.out.println("执行发生了异常，撤销执行的sql");
            try {
                connection.rollback();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
            e.printStackTrace();
        } finally {
            JDBCUtils.close(null,preparedStatement,connection);
        }
    }
}
```

## 5、批处理

### 基本介绍

1、当需要成批插入或者更新记录时。可以采用Java的批量更新机制，这一机制荀彧多条语句一次性提交给数据库批量处理。通常情况下比单独提交处理更有效率。

2、JDBC的批量处理语句包括以下方法：
	addBatch()：添加需要批量处理的SQL语句或参数

​	executeBatch()：执行批量处理语句

​	clearBatch：清空批处理包的语句

3、JDBC连接mysql时，如果要使用批处理功能，请在url中加参数  

?**rewriteBatchedStatements=true**

4、批处理往往和PreparedStatement一起搭配使用，可以既减少编译次数，有减少运行次数，效率大大提高。

### 示例程序

```java
package javabase.jdbc;

import javabase.jdbc.utils.JDBCUtils;
import org.junit.Test;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class Batch_ {


    /**
     * 添加5000条记录
     * 不使用批处理的传统方式
     */
    @Test
    public void noBatch() throws SQLException {
        Connection connection = JDBCUtils.getConnection();
        String sql="insert into admin2 values (null,?,?)";
        PreparedStatement preparedStatement = connection.prepareStatement(sql);

        System.out.println("开始执行");
        long start = System.currentTimeMillis();
        for(int i=0;i<5000;i++)
        {
            preparedStatement.setString(1,"jack"+i);
            preparedStatement.setString(2,"666");
            preparedStatement.executeUpdate();
        }
        long end = System.currentTimeMillis();
        System.out.println("传统的方式 耗时："+(end-start));//传统的方式 耗时：7892
        JDBCUtils.close(null,preparedStatement,connection);
    }


    /**
     * 添加5000条记录
     * 使用批处理的传统方式
     */
    @Test
    public void useBatch() throws SQLException {
        Connection connection = JDBCUtils.getConnection();
        String sql="insert into admin2 values (null,?,?)";
        PreparedStatement preparedStatement = connection.prepareStatement(sql);

        System.out.println("开始执行");
        long start = System.currentTimeMillis();
        for(int i=0;i<5000;i++)
        {
            preparedStatement.setString(1,"jack"+i);
            preparedStatement.setString(2,"666");
            //将sql语句加入到批处理包
            preparedStatement.addBatch();
            //当有1000条记录时，再批量执行
            if ((i+1)%1000==0) {
                preparedStatement.executeBatch();
                preparedStatement.clearBatch();
            }
        }

        long end = System.currentTimeMillis();
        System.out.println("批处理的方式 耗时："+(end-start));//批处理的方式 耗时：134
        JDBCUtils.close(null,preparedStatement,connection);

    }
}
```

### addBatch源码解读

1、进入addBatch方法

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220404194306951.png)

2、来到CilentPreparedStatement类的addBatch

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220404194408869.png)

3、来到AbstractQuery类的addBatch方法，判断batchArgs是否为空，当进行第一次循环时，可以看到下方Watches里的batchedArgs为null，那么创建一个ArrayList

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220404194638729.png)

可以看到此刻batchedArgs已经创建好，但还未添加元素，所以size=0

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220404194916147.png)

4、来到ArrayList类添加元素后，可以看到elementData多出了一个元素，点进去看它的bindValuew有两个，分别对应每一条sql语句要添加的两个参数username和password。此时注意到elementData的最大容量为10

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220404195046149.png)

5、来到第十一次循环，即i=10的时候，进入ArrayList类的add方法，可以看到会判断当前elementData的元素个数是否与最大容量相等，若相等则调用grow()方法扩容



![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220404195555654.png)

可以看到此时elementData的最大容量已经被扩充到了15

## 6、连接池

### 传统获取Connection弊端分析

1、传统的JDBC数据库连接使用**DriverManager**来获取，每次向数据库建立连接的时候都要将Connection加载到内存中，再验证**IP地址，用户名和密码**（0.05s~1s）（取决于并发量和网络）。需要数据库连接的时候，就向数据库要求一个，频繁的进行数据库连接操作将占用很多的系统资源，容易造成服务器崩溃。

2、每一次数据库连接，使用完后都得断开，如果程序出现异常而未能关闭，将导致数据库**内存泄漏**，最终将导致重启数据库。

3、传统获取连接的方式，**不能控制创建的连接数量**，如果连接过多，也可能导致内存泄漏，MySQL崩溃。

4、解决传统开发中的数据库连接问题，可以采用**数据库连接池技术（connection pool）**。这意味着数据库连接在物理上并未被关闭，而是保留在一个队列中被反复重用。

连接池是一种非常重要的服务，JDBC规范为实现者提供了用以实现连接池服务的手段。不过JDK本身并未实现这项服务，数据库供应商提供的JDBC驱动程序中通常也不包含这项服务。相反，Web容器和应用服务器的开发商通常会提供连接池服务的实现。

### 数据库连接池

#### 基本介绍

1、预先在缓冲池中放入一定数量的连接，当需要建立数据库连接是，只需从“缓冲池”中取出一个，使用完毕之后再放回去。

2、数据库连接池负责分配、管理和释放数据库连接，它允许应用程序**重复使用**一个先有个数据库连接，而不是重新建立一个。

3、当应用程序向连接池请求的连接数超过最大连接数量是，这些请求将被加入到**等待队列**中。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/屏幕截图-2022-04-04-210506.png)

#### 数据库连接池种类

1、JDBC的数据库连接池使用**javax.sql.DataSourse**来表示，DataSourse只是一个接口，该接口通常由第三方提供实现。

2、**C3P0**数据库连接池，速度相对较慢，稳定性不错（hibernate,spring）。

3、DBCP数据库连接池，速度相对C3P0较快，但不稳定。

4、Proxool数据库连接池，由监控连接池状态的功能，稳定性较C3P0差一点。

5、BoneCP数据库连接池，速度快。

6、**Druid(德鲁伊)**是阿里提供的数据库连接池，集DBCP、C3P0、Proxool优点与一身的数据库连接池。

### 德鲁伊连接池

#### 示例程序

```java
package javabase.jdbc;

import com.alibaba.druid.pool.DruidDataSourceFactory;
import org.junit.Test;

import javax.sql.DataSource;
import java.io.FileInputStream;
import java.sql.Connection;
import java.util.Properties;

public class Druid_ {
    @Test
    public void testDruid() throws Exception {
        Properties properties = new Properties();
        properties.load(new FileInputStream("src/druid.properties"));

        //创建一个指定参数的数据库连接池
        DataSource dataSource = DruidDataSourceFactory.createDataSource(properties);

        long start = System.currentTimeMillis();

        for (int i=0;i<500000;i++)
        {
            Connection connection = dataSource.getConnection();
            connection.close();
        }
        long end = System.currentTimeMillis();
        System.out.println("耗时"+(end-start));
    }
}
```

#### 编写工具类

```java
package javabase.jdbc.utils;

import com.alibaba.druid.pool.DruidDataSourceFactory;

import javax.sql.DataSource;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

/**
 * @author yumo
 * @version 1.0
 * 基于druid数据库连接池的工具类
 */
public class JDBCUtlByDruid {

    private static DataSource ds;

    static {
        Properties properties = new Properties();
        try {
            properties.load(new FileInputStream("src/druid.properties"));
            ds= DruidDataSourceFactory.createDataSource(properties);
        } catch (IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static Connection getConnection() throws SQLException {
        return ds.getConnection();
    }

    /**
     * 在数据库连接池技术中，close 不是真的断掉连接
     * 而是把使用的Connection对象放回连接池(断掉引用)
     */
    public static void close(ResultSet resultSet, Statement statement,Connection connection)
    {
        try {
            if (resultSet != null) {
                resultSet.close();
            }
            if (statement != null) {
                statement.close();
            }
            if (connection != null) {
                connection.close();
            }
        }catch (SQLException e)
        {
            throw new RuntimeException(e);
        }
    }
}
```

#### 测试代码

```java
package javabase.jdbc;



import javabase.jdbc.utils.JDBCUtlByDruid;
import org.junit.Test;

import java.sql.*;

public class JDBCUtilsByDruid_Use {

    @Test
    public void testSelect()
    {
        System.out.println("使用druid工具类");
        //得到连接
        Connection connection = null;

        //组织一个sql
        String sql="select * from actor";
        PreparedStatement preparedStatement=null;
        ResultSet resultSet =null;
        //创建PreparedStatement对象
        try{
            connection = JDBCUtlByDruid.getConnection();
            System.out.println(connection.getClass());
            preparedStatement=connection.prepareStatement(sql);

            resultSet = preparedStatement.executeQuery();
            while (resultSet.next())
            {
                int id = resultSet.getInt("id");
                String name = resultSet.getString("name");
                String sex = resultSet.getString("sex");
                Date borndate = resultSet.getDate("borndate");
                String phone = resultSet.getString("phone");
                System.out.println(id+"\t"+name+"\t"+sex+"\t"+borndate+"\t"+phone);
            }
        } catch (SQLException e)
        {
            e.printStackTrace();
        } finally {
            JDBCUtlByDruid.close(resultSet,preparedStatement,connection);
        }
    }
}
```

### Apache-DBUtils

#### 问题分析

1、结果集和connection是关联的，即如果关闭连接，就不能使用结果集。

2、结果集不利于数据管理（只能用一次）

3、使用返回信息页不方便

解决办法：将数据库表中的每一条记录都封装为一个类，并将每一个该类对象放入到ArrayList集合。例如：

将actor表的每一条记录映射为一个Actor对象

class Actor{

​	属性：id,name,sex,borndate,phone

}，一个Actor对象对应一条actor记录

然后封装到ArrayList< Actor >

#### 传统封装

##### 示例程序

```java
/**
 * 土方法封装
 */
@Test
public void testSelectToArrayList()
{
    System.out.println("使用druid工具类");
    //得到连接
    Connection connection = null;

    //组织一个sql
    String sql="select * from actor";
    PreparedStatement preparedStatement=null;
    ResultSet resultSet =null;
    ArrayList<Actor> list=new ArrayList<Actor>();
    //创建PreparedStatement对象
    try{
        connection = JDBCUtlByDruid.getConnection();
        System.out.println(connection.getClass());
        preparedStatement=connection.prepareStatement(sql);

        resultSet = preparedStatement.executeQuery();
        while (resultSet.next())
        {
            int id = resultSet.getInt("id");
            String name = resultSet.getString("name");
            String sex = resultSet.getString("sex");
            Date borndate = resultSet.getDate("borndate");
            String phone = resultSet.getString("phone");
            //把得到的resultSet 的记录封装到Actor对象，放入list集合
            list.add(new Actor(id,name,sex,borndate,phone));
        }
        System.out.println("list集合数据："+list);
        for(Actor actor:list)
        {
            System.out.println("id="+actor.getId()+"\t"+actor.getName());
        }
    } catch (SQLException e)
    {
        e.printStackTrace();
    } finally {
        JDBCUtlByDruid.close(resultSet,preparedStatement,connection);
    }
   
}
```

```java
package javabase.jdbc;

import java.util.Date;

/**
 * Actor对象与actor表的记录对应
 * => JavaBean,pojo,Domain,entity
 */
public class Actor {
    private Integer id;
    private String name;
    private String sex;
    private Date borndate;
    private String phone;

    public Actor() {
        //反射需要
    }

    @Override
    public String toString() {
        return "\nActor{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", sex='" + sex + '\'' +
                ", borndate=" + borndate +
                ", phone='" + phone + '\'' +
                '}';
    }

    public Actor(Integer id, String name, String sex, Date borndate, String phone) {
        this.id = id;
        this.name = name;
        this.sex = sex;
        this.borndate = borndate;
        this.phone = phone;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public void setBorndate(Date borndate) {
        this.borndate = borndate;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSex() {
        return sex;
    }

    public Date getBorndate() {
        return borndate;
    }

    public String getPhone() {
        return phone;
    }
}
```

### Apache-DBUtils介绍

1、commons-dbuutils是Apache组织提供的一个开源JDBC工具类库，它是对JDBC的封装，使用dbutils能极大简化jdbc编码的工作量。

- DbUtils类

  1、QueryRunner类：该类封装了SQL的执行，是线程安全的。可以实现增删改查和批处理。

  2、使用QueryRunner类实现查询

  3、ResultSetHandler接口：该接口用于处理java.sql.ResultSet，将数据按要求转换为另一种形式。

  - ArrayHandler：把结果集中的第一行数据转成对象数组。
  - ArrayListHandler：把结果集中的每一行数据都转成一个数组，再存放到List中。
  - BeanHandler：将结果集中的第一行数据封装到一个对应的JavaBean实例中。
  - BeanListHandler：将结果集中的每一行数据都封装到一个对应的JavaBean实例中，存放到List里。
  - ColumnListHandler：将结果集中某一列的数据存放到List中。
  - KeyedHandler(name)：将结果集中的每行数据都封装到Map里，再把这些map存到一个map里，其key为指定的key。
  - MapHandler：将结果集中的第一行数据封装到一个Map里，key是列名，value是对应的值。
  - MapListHandler：将结果集中的每一行数据都封装到一个Map里，然后再存放到List。

#### 示例程序

```java
package javabase.jdbc.utilstest;



import javabase.jdbc.Actor;
import javabase.jdbc.utils.JDBCUtlByDruid;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.BeanHandler;
import org.apache.commons.dbutils.handlers.BeanListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;
import org.junit.Test;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DBUtils_Use {

  //使用apache-DBUtils 工具类 + druid 完成对表的crud操作
    @Test
    public void testQuery() throws SQLException {
        //1、得到连接
        Connection connection = JDBCUtlByDruid.getConnection();
        //2、使用DBUtils类和接口,引入相关的依赖
        //3、创建QueryRunner
        QueryRunner queryRunner = new QueryRunner();
        //4、就可以执行相关的方法，返回ArrayList结果集
        String sql="select * from actor where id >=?";
        //（1）query方法就是执行sql语句，并返回resultSet封装到ArrayList结婚中
        //（2）集合
        //（3）connection：连接
        //（4）sql：执行的sql语句
        //（5）new BeanListHandler<>(Actor.class)：在将resultSet->Actor对象封装到ArrayList
        //底层使用反射机制取获取Actor类的属性，然后进行封装
        //（6）1 就是给sql语句中的 ? 赋值，可以有多个值，因为是可变参数 Object... params
        //（7）底层得到的resultSet会在query关闭，关闭PreparedStatement
        List<Actor> list = queryRunner.query(connection, sql, new BeanListHandler<>(Actor.class), 1);
        System.out.println("输出集合的信息");
        for (Actor actor:list)
        {
            System.out.println(actor);
        }
        //释放资源
        JDBCUtlByDruid.close(null,null,connection);
    }

    //演示apache-dbutils + druid完成返回的结果是单行记录（单个Actor对象）
    @Test
    public void testQuerySingle() throws SQLException {

        Connection connection = JDBCUtlByDruid.getConnection();
        QueryRunner queryRunner = new QueryRunner();
        //返回单个Actor对象
        String sql="select *from actor where id=?";

        Actor actor = queryRunner.query(connection, sql, new BeanHandler<>(Actor.class), 1);
        System.out.println(actor);

        JDBCUtlByDruid.close(null,null,connection);
    }
    //演示apache-dbutils + druid 完成查询结果是单行单列-返回的就是Object
    @Test
    public void testScalar() throws SQLException {
        Connection connection = JDBCUtlByDruid.getConnection();

        QueryRunner queryRunner = new QueryRunner();
        //返回单行单列
        String sql="select name from actor where id=?";
        //返回一个Object对象，使用ScalarHandler
        Object query = queryRunner.query(connection, sql, new ScalarHandler<>(), 1);
        System.out.println(query);
        JDBCUtlByDruid.close(null,null,connection);
    }

    //演示apache-dbutils + druid 完成dml（update，insert，delete）
    @Test
    public void testDML() throws SQLException {
        Connection connection = JDBCUtlByDruid.getConnection();

        QueryRunner queryRunner = new QueryRunner();
        //完成update,insert,delete
//        String sql="update actor set name = ? where id = ?";
//        String sql="insert into actor values (null,?,?,?,?)";
        String sql="delete from actor where id = ?";
        //（1）执行dml操作时queryRunner.update()
        //（2）返回的值是受影响的行数
        int affectedRow = queryRunner.update(connection, sql, 2);
        System.out.println(affectedRow>0?"执行成功":"执行没有影响到表");

        JDBCUtlByDruid.close(null,null,connection);

    }

}

```

##### 源码分析

```java
private <T> T query(Connection conn, boolean closeConn, String sql, ResultSetHandler<T> rsh, Object... params) throws SQLException {
    if (conn == null) {
        throw new SQLException("Null connection");
    } else if (sql == null) {
        if (closeConn) {
            this.close(conn);
        }

        throw new SQLException("Null SQL statement");
    } else if (rsh == null) {
        if (closeConn) {
            this.close(conn);
        }

        throw new SQLException("Null ResultSetHandler");
    } else {
        PreparedStatement stmt = null;
        ResultSet rs = null;
        Object result = null;

        try {
            stmt = this.prepareStatement(conn, sql);
            this.fillStatement(stmt, params);
            rs = this.wrap(stmt.executeQuery());
            result = rsh.handle(rs);
        } catch (SQLException var33) {
            this.rethrow(var33, sql, params);
        } finally {
            try {
                this.close(rs);
            } finally {
                this.close(stmt);
                if (closeConn) {
                    this.close(conn);
                }

            }
        }

        return result;
    }
}
```

创建PreparedStatement

​	stmt = this.prepareStatement(conn, sql);

对sql进行 ? 赋值

 	this.fillStatement(stmt, params);

执行sql，返回resultSet

​	 rs = this.wrap(stmt.executeQuery());

返回的resultSet ---> ArrayList< result >

​	result = rsh.handle(rs);

#### 异常处理

java.sql.SQLException: Cannot set borndate: incompatible types, cannot convert java.time.LocalDateTime to java.util.Date Query: select *from actor where id=? Parameters: [1]

执行以上代码时发现异常

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/屏幕截图-2022-04-05-183425.png)

原因：mysql-connector-java8.0.28中，**apache-dbutils**对mysql数据库中的**datetime**类型数据**映射**为**LocalDateTime**类型，以前版本会转换成**java.util.Date**类型；同时ResultSet的getDate方法返回的是java.util.Date方法。

解决办法：将Actor类中的Date类对象改为LocalDateTime

同时对其他地方的代码例如：

```java
Date borndate = resultSet.getDate("borndate");
```

改为

```java
LocalDateTime borndate = resultSet.getDate("borndate").toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
```

> **注意**：int，double等在Java中都用包装类，因为mysql中的所有类型都有可能是NULL，而Java只有引用数据类型才有NULL值

发散：mysql中的其他时间类数据类型在Java中会被映射成什么，同上操作，可得以下结果：

date-java.sql.Date

time-java.sql.Time

year-java.sql.Date

timestamp-java.sql.TimeStamp

### BasicDao

问题分析

apache-dbutils+druid简化了JDBC开发，但还有不足：

1. SQL语句是固定的，不能通过参数传入，通用性不好，需要进行改进，更方便增删改查。
2. 对于select操作，如果有返回值，其返回类型不能固定，需要使用泛型。
3. 将来的表很多，业务需求复杂，不可能只由一个Java类完成。

#### 基本说明

1. **DAO**：**data access object 数据访问对象**
2. 这样的通用类，称为BasicDao，是专门和数据库交互的，即完成对数据库（表）的crud操作。
3. 在BasicDao的基础上，实现一张表对应一个Dao，更换的完成功能，比如Customer表---Customer.java类（javabean、pojo、domain）---CustomerDao.java

使用如下层次结构：

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/屏幕截图-2022-04-05-194841.png)

#### 示例程序

BasicDAO.java

```java
package javabase.jdbc.dao_.dao;

import javabase.jdbc.dao_.utils.JDBCUtlByDruid;
import org.apache.commons.dbutils.QueryRunner;
import org.apache.commons.dbutils.handlers.BeanHandler;
import org.apache.commons.dbutils.handlers.BeanListHandler;
import org.apache.commons.dbutils.handlers.ScalarHandler;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

/**
 * @author yumo
 * @version 1.0
 * 开发BasicDAO，是其他DAO的父类
 */
public class BasicDAO<T> {

    private QueryRunner qr=new QueryRunner();

    //开发通用的dml,针对任意的表
    public int update(String sql,Object... parameters)
    {
        Connection connection=null;

        try {
            connection=JDBCUtlByDruid.getConnection();
            int update = qr.update(connection, sql, parameters);
            return update;
        } catch (SQLException e) {
            //将编译异常->运行异常，方便使用者抛出或捕获
            throw new RuntimeException(e);
        }finally {
            JDBCUtlByDruid.close(null,null,connection);
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
    public List<T> queryMulti(String sql,Class<T> clazz,Object... parameters)
    {
        Connection connection=null;

        try {
            connection=JDBCUtlByDruid.getConnection();
            return qr.query(connection,sql,new BeanListHandler<T>(clazz),parameters);
        } catch (SQLException e) {
            //将编译异常->运行异常，方便使用者抛出或捕获
            throw new RuntimeException(e);
        }finally {
            JDBCUtlByDruid.close(null,null,connection);
        }
    }

    //查询单行结果的通用方法
    public T querySingle(String sql,Class<T> clazz,Object... parameters)
    {
        Connection connection=null;

        try {
            connection=JDBCUtlByDruid.getConnection();
            return qr.query(connection,sql,new BeanHandler<T>(clazz),parameters);
        } catch (SQLException e) {
            //将编译异常->运行异常，方便使用者抛出或捕获
            throw new RuntimeException(e);
        }finally {
            JDBCUtlByDruid.close(null,null,connection);
        }
    }

    //查询单行单列的方法，即返回单值的方法
    public Object queryScalar(String sql,Object... parameters)
    {
        Connection connection=null;

        try {
            connection=JDBCUtlByDruid.getConnection();
            return qr.query(connection,sql,new ScalarHandler<>(),parameters);
        } catch (SQLException e) {
            //将编译异常->运行异常，方便使用者抛出或捕获
            throw new RuntimeException(e);
        }finally {
            JDBCUtlByDruid.close(null,null,connection);
        }
    }
}
```

Actor.java

```java
package javabase.jdbc.dao_.domain;

import java.time.LocalDateTime;

/**
 * Actor对象与actor表的记录对应
 * => JavaBean,pojo,Domain,entity
 */
public class Actor {
    private Integer id;
    private String name;
    private String sex;
    private LocalDateTime borndate;
    private String phone;

    public Actor() {
        //反射需要
    }

    @Override
    public String toString() {
        return "\nActor{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", sex='" + sex + '\'' +
                ", borndate=" + borndate +
                ", phone='" + phone + '\'' +
                '}';
    }

    public Actor(Integer id, String name, String sex, LocalDateTime borndate, String phone) {
        this.id = id;
        this.name = name;
        this.sex = sex;
        this.borndate = borndate;
        this.phone = phone;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public void setBorndate(LocalDateTime borndate) {
        this.borndate = borndate;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSex() {
        return sex;
    }

    public LocalDateTime getBorndate() {
        return borndate;
    }

    public String getPhone() {
        return phone;
    }
}
```

ActorDAO.java

```java
package javabase.jdbc.dao_.dao;

import javabase.jdbc.dao_.domain.Actor;

public class ActorDAO extends BasicDAO<Actor>{
    //1、就有BasicDAO的方法
    //2、根据业务需求编写特有的方法
}
```

testDAO.java

```java
package javabase.jdbc.dao_.test;

import javabase.jdbc.dao_.dao.ActorDAO;
import javabase.jdbc.dao_.domain.Actor;
import org.junit.Test;

import java.util.List;

public class TestDAO {

    //测试ActorDAO对Actor表的crud

    @Test
    public void testActorDAO()
    {
        ActorDAO actorDAO = new ActorDAO();
        //1、查询
        List<Actor> actors = actorDAO.queryMulti("select * from actor where id >= ?", Actor.class, 1);
        System.out.println("===查询结果===");
        for (Actor actor:actors)
        {
            System.out.println(actor);
        }


        //2、查询单行记录
        Actor actor = actorDAO.querySingle("select * from actor where id >= ?", Actor.class, 1);
        System.out.println("===查询单行结果===");
        System.out.println(actor);

        //3、查询单行单列
        Object o = actorDAO.queryScalar("select name from actor where id >= ?", 1);
        System.out.println("===查询单行单列值===");
        System.out.println(o);

        //4、dml操作
        int update = actorDAO.update("insert  actor values(null,?,?,?,?)", "张无忌", "男", "2020-11-11", "999");
        System.out.println(update>0?"执行成功":"执行没有影响表");
    }

}
```

JDBCUtilsByDruid.java

```java
package javabase.jdbc.dao_.utils;

import com.alibaba.druid.pool.DruidDataSourceFactory;

import javax.sql.DataSource;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Properties;

/**
 * @author yumo
 * @version 1.0
 * 基于druid数据库连接池的工具类
 */
public class JDBCUtlByDruid {

    private static DataSource ds;

    static {
        Properties properties = new Properties();
        try {
            properties.load(new FileInputStream("src/druid.properties"));
            ds= DruidDataSourceFactory.createDataSource(properties);
        } catch (IOException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static Connection getConnection() throws SQLException {
        return ds.getConnection();
    }

    /**
     * 在数据库连接池技术中，close 不是真的断掉连接
     * 而是把使用的Connection对象放回连接池(断掉引用)
     */
    public static void close(ResultSet resultSet, Statement statement,Connection connection)
    {
        try {
            if (resultSet != null) {
                resultSet.close();
            }
            if (statement != null) {
                statement.close();
            }
            if (connection != null) {
                connection.close();
            }
        }catch (SQLException e)
        {
            throw new RuntimeException(e);
        }
    }
}
```