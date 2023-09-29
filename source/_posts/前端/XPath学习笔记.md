---
title: XPath学习笔记
date: 2022-03-29 16:51:33
tags: 
- XPath
- xml
categories:
- xml
---

## XPath简介

**XPath 是一门在 XML 文档中查找信息的语言。XPath 用于在 XML 文档中通过元素和属性进行导航**

### 什么是 XPath?

- XPath 使用**路径表达式**在 XML 文档中进行导航
- XPath 包含一个**标准函数库**
- XPath 是 **XSLT** 中的主要元素
- XPath 是一个 **W3C 标准**

**XPath 路径表达式**

XPath 使用路径表达式来选取 XML 文档中的节点或者节点集。这些路径表达式和我们在常规的电脑文件系统中看到的表达式非常相似。

**XPath 标准函数**

XPath 含有超过 100 个内建的函数。这些函数用于字符串值、数值、日期和时间比较、节点和 QName 处理、序列处理、逻辑值等等。

**XPath 在 XSLT 中使用**

XPath 是 XSLT 标准中的主要元素。如果没有 XPath 方面的知识，您就无法创建 XSLT 文档。

**XPath 是 W3C 标准**

XPath 于 1999 年 11 月 16 日 成为 W3C 标准。

XPath 被设计为供 XSLT、XPointer 以及其他 XML 解析软件使用。

## XPath节点

### XPath 术语

#### 节点（Node）

在 XPath 中，有七种类型的节点：元素、属性、文本、命名空间、处理指令、注释以及文档（根）节点。XML 文档是被作为节点树来对待的。树的根被称为**文档节点**或者**根节点**。

请看下面这个 XML 文档：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>

<bookstore>

<book>
  <title lang="en">Harry Potter</title>
  <author>J K. Rowling</author> 
  <year>2005</year>
  <price>29.99</price>
</book>

</bookstore>
```

上面的XML文档中的节点例子：

```xml
<bookstore> （文档节点）
<author>J K. Rowling</author> （元素节点）
lang="en" （属性节点） 
```

#### 基本值（原子值，Atomic value）

基本值是无父或无子的节点。

基本值的例子：

```
J K. Rowling
"en"
```

#### **项目（Item）**

项目是基本值或者节点。

### 节点关系

#### 父（Parent）

每个元素以及属性都有一个父。

在下面的例子中，book 元素是 title、author、year 以及 price 元素的父：

```xml
<book>
  <title>Harry Potter</title>
  <author>J K. Rowling</author>
  <year>2005</year>
  <price>29.99</price>
</book>
```

#### 子（Children）

元素节点可有零个、一个或多个子。

在下面的例子中，title、author、year 以及 price 元素都是 book 元素的子：

```xml
<book>
  <title>Harry Potter</title>
  <author>J K. Rowling</author>
  <year>2005</year>
  <price>29.99</price>
</book>
```

#### 同胞（Sibling）

拥有相同的父的节点

在下面的例子中，title、author、year 以及 price 元素都是同胞：

```xml
<book>
  <title>Harry Potter</title>
  <author>J K. Rowling</author>
  <year>2005</year>
  <price>29.99</price>
</book>
```

#### 先辈（Ancestor）

某节点的父、父的父，等等。

在下面的例子中，title 元素的先辈是 book 元素和 bookstore 元素：

```xml
<bookstore>

<book>
  <title>Harry Potter</title>
  <author>J K. Rowling</author>
  <year>2005</year>
  <price>29.99</price>
</book>

</bookstore>
```

#### 后代（Descendant）

某个节点的子，子的子，等等。

在下面的例子中，bookstore 的后代是 book、title、author、year 以及 price 元素：

```xml
<bookstore>

<book>
  <title>Harry Potter</title>
  <author>J K. Rowling</author>
  <year>2005</year>
  <price>29.99</price>
</book>

</bookstore>
```

## XPath 语法

XPath 使用**路径表达式**来选取 XML 文档中的**节点**或**节点集**。节点是通过沿着**路径** (path) 或者**步** (steps) 来选取的。

我们将在下面的例子中使用这个 XML 文档。

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>

<bookstore>

<book>
  <title lang="eng">Harry Potter</title>
  <price>29.99</price>
</book>

<book>
  <title lang="eng">Learning XML</title>
  <price>39.95</price>
</book>

</bookstore>
```

### 选取节点

XPath 使用路径表达式在 XML 文档中选取节点。节点是通过沿着路径或者 step 来选取的。

#### 路径表达式

| 表达式   | 描述                                                       |
| :------- | :--------------------------------------------------------- |
| nodename | 选取此节点的所有子节点。                                   |
| /        | 从根节点选取。                                             |
| //       | 从匹配选择的当前节点选择文档中的节点，而不考虑它们的位置。 |
| .        | 选取当前节点。                                             |
| ..       | 选取当前节点的父节点。                                     |
| @        | 选取属性。                                                 |

##### 实例

在下面的表格中，我们已列出了一些路径表达式以及表达式的结果：

| 路径表达式      | 结果                                                         |
| :-------------- | :----------------------------------------------------------- |
| bookstore       | 选取 bookstore 元素的所有子节点。                            |
| /bookstore      | 选取根元素 bookstore。注释：假如路径起始于正斜杠( / )，则此路径始终代表到某元素的**绝对路径**！ |
| bookstore/book  | 选取属于 bookstore 的子元素的**所有 book 元素**。            |
| //book          | 选取所有 book 子元素，而不管它们在文档中的位置。             |
| bookstore//book | 选择属于 bookstore 元素的后代的所有 book 元素，而不管它们位于 bookstore 之下的什么位置。 |
| //@lang         | 选取名为 lang 的**所有属性**。                               |

#### 谓语（Predicates）

谓语用来查找某个特定的节点或者包含某个指定的值的节点。

谓语被嵌在**方括号**中。

##### 实例

在下面的表格中，我们列出了带有谓语的一些路径表达式，以及表达式的结果：

| 路径表达式                         | 结果                                                         |
| :--------------------------------- | :----------------------------------------------------------- |
| /bookstore/book[1]                 | 选取属于 bookstore 子元素的第一个 book 元素。                |
| /bookstore/book[last()]            | 选取属于 bookstore 子元素的最后一个 book 元素。              |
| /bookstore/book[last()-1]          | 选取属于 bookstore 子元素的倒数第二个 book 元素。            |
| /bookstore/book[position()<3]      | 选取最前面的两个属于 bookstore 元素的子元素的 book 元素。    |
| //title[@lang]                     | 选取所有拥有名为 lang 的属性的 title 元素。                  |
| //title[@lang='eng']               | 选取所有 title 元素，且这些元素拥有值为 eng 的 lang 属性。   |
| /bookstore/book[price>35.00]       | 选取 bookstore 元素的所有 book 元素，且其中的 price 元素的值须大于 35.00。 |
| /bookstore/book[price>35.00]/title | 选取 bookstore 元素中的 book 元素的所有 title 元素，且其中的 price 元素的值须大于 35.00。 |

#### 选取未知节点

XPath 通配符可用来选取未知的 XML 元素。

| 通配符 | 描述                     |
| :----- | :----------------------- |
| *      | 匹配任何**元素**节点。   |
| @*     | 匹配任何**属性**节点。   |
| node() | 匹配**任何类型**的节点。 |

##### 实例

在下面的表格中，我们列出了一些路径表达式，以及这些表达式的结果：

| 路径表达式   | 结果                              |
| :----------- | :-------------------------------- |
| /bookstore/* | 选取 bookstore 元素的所有子元素。 |
| //*          | 选取文档中的所有元素。            |
| //title[@*]  | 选取所有带有属性的 title 元素。   |

#### 选取若干路径

通过在路径表达式中使用“|”运算符，您可以选取若干个路径。

##### 实例

在下面的表格中，我们列出了一些路径表达式，以及这些表达式的结果：

| 路径表达式                       | 结果                                                         |
| :------------------------------- | :----------------------------------------------------------- |
| //book/title \| //book/price     | 选取 book 元素的所有 title 和 price 元素。                   |
| //title \| //price               | 选取文档中的所有 title 和 price 元素。                       |
| /bookstore/book/title \| //price | 选取属于 bookstore 元素的 book 元素的所有 title 元素，以及文档中所有的 price 元素。 |

## XPath Axes（轴）

我们将在下面的例子中使用此 XML 文档：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>

<bookstore>

<book>
  <title lang="eng">Harry Potter</title>
  <price>29.99</price>
</book>

<book>
  <title lang="eng">Learning XML</title>
  <price>39.95</price>
</book>

</bookstore>
```

### XPath 轴

轴可定义相对于当前节点的**节点集**。

| 轴名称             | 结果                                                         |
| :----------------- | :----------------------------------------------------------- |
| ancestor           | 选取当前节点的**所有先辈**（父、祖父等）。                   |
| ancestor-or-self   | 选取当前节点的所有先辈（父、祖父等）以及当前节点**本身**。   |
| attribute          | 选取当前节点的**所有属性**。                                 |
| child              | 选取当前节点的**所有子元素**。                               |
| descendant         | 选取当前节点的**所有后代元素**（子、孙等）。                 |
| descendant-or-self | 选取当前节点的**所有后代元素**（子、孙等）以及当前节点**本身**。 |
| following          | 选取文档中当前节点的**结束标签之后**的所有节点。             |
| namespace          | 选取当前节点的所有**命名空间**节点。                         |
| parent             | 选取当前节点的**父**节点。                                   |
| preceding          | 选取文档中当前节点的**开始标签之前**的所有节点。             |
| preceding-sibling  | 选取当前节点之前的所有**同级**节点。                         |
| self               | 选取**当前**节点。                                           |

### 位置路径表达式

位置路径可以是绝对的，也可以是相对的。

绝对路径**起始于正斜杠( / )**，而相对路径不会这样。在两种情况中，位置路径均包括一个或多个步，每个步均被斜杠分割：

**绝对位置路径**

```
/step/step/...
```

**相对位置路径**

```
step/step/...
```

每个步均根据当前节点集之中的节点来进行计算。

### 步（step）

**步（step）包括：**

- 轴（axis）

  定义所选节点与**当前节点**之间的**树关系**

- 节点测试（node-test）

  **识别**某个轴内部的节点

- 零个或者更多谓语（predicate）

  更深入地提炼所选的节点集

#### 步的语法：

```
轴名称::节点测试[谓语]
```

##### 实例

| 例子                   | 结果                                                         |
| :--------------------- | :----------------------------------------------------------- |
| child::book            | 选取所有属于当前节点的子元素的 book 节点。                   |
| attribute::lang        | 选取当前节点的 lang 属性。                                   |
| child::*               | 选取当前节点的所有子元素。                                   |
| attribute::*           | 选取当前节点的所有属性。                                     |
| child::text()          | 选取当前节点的所有文本子节点。                               |
| child::node()          | 选取当前节点的所有子节点。                                   |
| descendant::book       | 选取当前节点的所有 book 后代。                               |
| ancestor::book         | 选择当前节点的所有 book 先辈。                               |
| ancestor-or-self::book | 选取当前节点的所有 book 先辈以及当前节点（如果此节点是 book 节点） |
| child::*/child::price  | 选取当前节点的所有 price 孙节点。                            |

## XPath 运算符

**XPath 表达式可返回节点集、字符串、逻辑值以及数字。**

下面列出了可用在 XPath 表达式中的运算符：

| 运算符 | 描述           | 实例                      | 返回值                                                       |
| :----- | :------------- | :------------------------ | :----------------------------------------------------------- |
| \|     | 计算两个节点集 | //book \| //cd            | 返回所有拥有 book 和 cd 元素的节点集                         |
| +      | 加法           | 6 + 4                     | 10                                                           |
| -      | 减法           | 6 - 4                     | 2                                                            |
| *      | 乘法           | 6 * 4                     | 24                                                           |
| div    | 除法           | 8 div 4                   | 2                                                            |
| =      | 等于           | price=9.80                | 如果 price 是 9.80，则返回 true。如果 price 是 9.90，则返回 false。 |
| !=     | 不等于         | price!=9.80               | 如果 price 是 9.90，则返回 true。如果 price 是 9.80，则返回 false。 |
| <      | 小于           | price<9.80                | 如果 price 是 9.00，则返回 true。如果 price 是 9.90，则返回 false。 |
| <=     | 小于或等于     | price<=9.80               | 如果 price 是 9.00，则返回 true。如果 price 是 9.90，则返回 false。 |
| >      | 大于           | price>9.80                | 如果 price 是 9.90，则返回 true。如果 price 是 9.80，则返回 false。 |
| >=     | 大于或等于     | price>=9.80               | 如果 price 是 9.90，则返回 true。如果 price 是 9.70，则返回 false。 |
| or     | 或             | price=9.80 or price=9.70  | 如果 price 是 9.80，则返回 true。如果 price 是 9.50，则返回 false。 |
| and    | 与             | price>9.00 and price<9.90 | 如果 price 是 9.80，则返回 true。如果 price 是 8.50，则返回 false。 |
| mod    | 计算除法的余数 | 5 mod 2                   | 1                                                            |

## XPath 实例

### XML实例文档

我们将在下面的例子中使用这个 XML 文档：

**"books.xml" :**

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>

<bookstore>

<book category="COOKING">
  <title lang="en">Everyday Italian</title>
  <author>Giada De Laurentiis</author>
  <year>2005</year>
  <price>30.00</price>
</book>

<book category="CHILDREN">
  <title lang="en">Harry Potter</title>
  <author>J K. Rowling</author>
  <year>2005</year>
  <price>29.99</price>
</book>

<book category="WEB">
  <title lang="en">XQuery Kick Start</title>
  <author>James McGovern</author>
  <author>Per Bothner</author>
  <author>Kurt Cagle</author>
  <author>James Linn</author>
  <author>Vaidyanathan Nagarajan</author>
  <year>2003</year>
  <price>49.99</price>
</book>

<book category="WEB">
  <title lang="en">Learning XML</title>
  <author>Erik T. Ray</author>
  <year>2003</year>
  <price>39.95</price>
</book>

</bookstore>
```

### 加载 XML 文档

所有现代浏览器都支持使用 XMLHttpRequest 来加载 XML 文档的方法。

针对大多数现代浏览器的代码：

```xml
var xmlhttp=new XMLHttpRequest()
```

针对古老的微软浏览器（IE 5 和 6）的代码：

```xml
var xmlhttp=new ActiveXObject("Microsoft.XMLHTTP")
```

### 选取节点

不幸的是，Internet Explorer 和其他处理 XPath 的方式不同。

在我们的例子中，包含适用于大多数主流浏览器的代码。

Internet Explorer 使用 selectNodes() 方法从 XML 文档中的选取节点：

```xml
xmlDoc.selectNodes(xpath);
```

Firefox、Chrome、Opera 以及 Safari 使用 evaluate() 方法从 XML 文档中选取节点：

```xml
xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.ANY_TYPE,null);
```

**选取所有 title**

下面的例子选取所有 title 节点：

```xml
/bookstore/book/title
```

**选取第一个 book 的 title**

下面的例子选取 bookstore 元素下面的第一个 book 节点的 title：

```xml
/bookstore/book[1]/title
```

这里有一个问题。上面的例子在 IE 和其他浏览器中输出不同的结果。

IE5 以及更高版本将 [0] 视为第一个节点，而根据 W3C 的标准，应该是 [1]。

为了解决 IE5+ 中 [0] 和 [1] 的问题，可以为 XPath 设置语言选择（SelectionLanguage）。

下面的例子选取 bookstore 元素下面的第一个 book 节点的 title：

```xml
xml.setProperty("SelectionLanguage","XPath");
xml.selectNodes("/bookstore/book[1]/title");
```

**选取所有价格**

下面的例子选取 price 节点中的所有文本：

```xml
/bookstore/book/price/text()
```

**选取价格高于 35 的 price 节点**

下面的例子选取价格高于 35 的所有 price 节点：

```xml
/bookstore/book[price>35]/price
```

## 测试代码

下面的代码用于加载一个XML文件，先输入xml文件名获取对应的文档节点(根节点)，然后循环输入XPath表达式(输入为空时退出)，输出XPath表达式的计算结果

```java

import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

import javax.xml.catalog.CatalogFeatures;
import javax.xml.catalog.CatalogManager;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.*;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.Scanner;

public class XPathTest {
    public static void main(String[] args) throws ParserConfigurationException, IOException, SAXException {
        DocumentBuilderFactory factory=DocumentBuilderFactory.newInstance();
        DocumentBuilder builder=factory.newDocumentBuilder();

        builder.setEntityResolver(CatalogManager.catalogResolver(
                CatalogFeatures.defaults(), Paths.get("xpath/catalog.xml").toAbsolutePath().toUri()));
        //返回用于创建XPath对象的XPathFactory实例
        XPathFactory xPathFactory=XPathFactory.newInstance();
        //构建用于计算XPath表达式的XPath对象
        XPath xPath= xPathFactory.newXPath();
        
        try (var in=new Scanner(System.in)){
            String filename;
            if(args.length==0){
                System.out.println("Input file: ");
                filename=in.nextLine();
            }else {
                filename=args[0];
            }
            //将给定 URI 的内容解析为 XML 文档并返回一个新的 DOM Document对象
            Document doc=builder.parse(filename);
            var done=false;
            while (!done){
                System.out.println("XPath expression (empty line to exit): ");
                String expression=in.nextLine();
                if (expression.trim().isEmpty()) done=true;
                else {
                    try {
                        //从给定的起点计算 XPath 表达式，起点可以是一个节点或节点列表。
                        //这等效于使用XPathEvaluationResult类型调用evaluateExpression(String expression, Object item, Class type);
                        XPathEvaluationResult<?> result=xPath.evaluateExpression(expression,doc);
                        //XPathResultType 表示 XPath 评估的可能返回类型。作为枚举类型提供
                        if(result.type()== XPathEvaluationResult.XPathResultType.NODESET)
                        {
                            //将结果的值作为为类指定的类型<T>返回
                            for (Node n:(XPathNodes)result.value())
                                System.out.println(description(n));
                        }else if(result.type()==XPathEvaluationResult.XPathResultType.NODE)
                            System.out.println((Node)result.value());
                        else
                            System.out.println(result.value());
                    } catch (XPathExpressionException e) {
                        System.out.println(e.getMessage());
                    }
                }
            }
        }catch (Exception e)
        {
            e.printStackTrace();
        }

    }
    public static String description(Node n)
    {
        if(n instanceof Element)return "Element "+n.getNodeName();
        else if (n instanceof Attr) return "Attribute "+n;
        else return n.toString();
    }
}
```

### 代码分解：

```java
 //返回用于创建XPath对象的XPathFactory实例
 XPathFactory xPathFactory=XPathFactory.newInstance();
 
 //构建用于计算XPath表达式的XPath对象
 XPath xPath= xPathFactory.newXPath();

//将给定 URI 的内容解析为 XML 文档并返回一个新的 DOM Document对象
 Document doc=builder.parse(filename);

 //从给定的起点计算 XPath 表达式，起点可以是一个节点或节点列表。
//这等效于使用XPathEvaluationResult类型调用evaluateExpression(String expression, Object item, Class type);
XPathEvaluationResult<?> result=xPath.evaluateExpression(expression,doc);

//XPathResultType 表示 XPath 评估的可能返回类型。作为枚举类型提供
if(result.type()== XPathEvaluationResult.XPathResultType.NODESET)
{
    //将结果的值作为为类指定的类型<T>返回
    for (Node n:(XPathNodes)result.value())
        System.out.println(description(n));
}else if(result.type()==XPathEvaluationResult.XPathResultType.NODE)
    System.out.println((Node)result.value());
else
    System.out.println(result.value());
```

### 源码解读

```java
default XPathEvaluationResult<?> evaluateExpression(String expression, Object item)
        throws XPathExpressionException
    {
        return evaluateExpression(expression, item, XPathEvaluationResult.class);
    }
```

从该方法的源码中可见，xPath.evaluateExpression(expression,doc);等效于

使用XPathEvaluationResult类型调用evaluateExpression(String expression, Object item, Class type);



```java
public static enum XPathResultType {
   
    ANY(new QName("http://www.w3.org/1999/XSL/Transform", "any"), XPathEvaluationResult.class),
  
    BOOLEAN(XPathConstants.BOOLEAN, Boolean.class),
   
    NUMBER(XPathConstants.NUMBER, Number.class),
   
    STRING(XPathConstants.STRING, String.class),
  
    NODESET(XPathConstants.NODESET, XPathNodes.class),
    
    NODE(XPathConstants.NODE, Node.class);
...
}
```

从XPathResultType类中定义的枚举常量可见

| 枚举常量名 | 返回类型   |
| ---------- | ---------- |
| STRING     | String     |
| NODESET    | XPathNodes |
| NODE       | Node       |
| NUMBER     | Number     |
| BOOLEAN    | Boolean    |

