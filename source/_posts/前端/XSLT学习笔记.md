---
title: XSLT学习笔记
date: 2022-03-30 16:51:33
tags: 
- XSLT
- xml
categories:
- xml
---

# XSLT学习笔记

## XSLT语言

**起始于 XSL**

XSL 指扩展样式表语言（*E*Xtensible *S*tylesheet *L*anguage）。

万维网联盟 (W3C) 开始发展 XSL 的原因是：存在着对于基于 XML 的样式表语言的需求。

**CSS = HTML 样式表**

HTML 使用预先定义的标签，标签的意义*很容易被理解*。

HTML 元素中的 <table> 元素定义表格 - 并且浏览器清楚*如何显示它*。

向 HTML 元素添加样式是很容易的。通过 CSS，很容易告知浏览器用特定的字体或颜色显示一个元素。

**XSL = XML 样式表**

XML 不使用预先定义的标签（我们可以使用任何喜欢的标签名），并且这些标签的意义*并不都那么容易被理解*。

<table> 元素意味着一个 HTML 表格，一件家具，或是别的什么东西 - 浏览器不清楚如何显示它。

XSL 可*描述*如何来显示 XML 文档！

**XSLT 是一种用于将 XML 文档转换为 XHTML 文档或其他 XML 文档的语言。**

### 什么是 XSLT？

- XSLT 指 XSL 转换（XSL Transformations）。
- XSLT 是 XSL 中最重要的部分。
- XSLT 可将一种 XML 文档转换为另外一种 XML 文档。
- XSLT 使用 XPath 在 XML 文档中进行导航。
- XPath 是一个 W3C 标准。

### XSLT = XSL 转换

XSLT 是 XSL 中最重要的部分。

XSLT 用于将一种 XML 文档转换为另外一种 XML 文档，或者可被浏览器识别的其他类型的文档，比如 HTML 和 XHTML。通常，XSLT 是通过把每个 XML 元素转换为 (X)HTML 元素来完成这项工作的。

通过 XSLT，您可以向或者从输出文件添加或移除元素和属性。您也可重新排列元素，执行测试并决定隐藏或显示哪个元素，等等。

描述转化过程的一种通常的说法是，*XSLT 把 **XML 源树**转换为 **XML 结果树***。

### XSLT 使用 XPath

XSLT 使用 XPath 在 XML 文档中查找信息。XPath 被用来通过元素和属性在 XML 文档中进行导航。

### 它如何工作？

在转换过程中，XSLT 使用 XPath 来定义源文档中可匹配一个或多个预定义模板的部分。一旦匹配被找到，XSLT 就会把源文档的匹配部分转换为结果文档。

### XSLT 是 W3C 标准

XSLT 在 1999 年 11 月 16 日被确立为 W3C 标准。

## XSLT 浏览器

**几乎所有主要的浏览器均支持 XML 和 XSLT。**

**Mozilla** **Firefox**

从 1.0.2 版本开始，Firefox 就已开始支持 XML 和 XSLT（以及 CSS）。

**Mozilla**

Mozilla 含有用于 XML 解析的 Expat，并支持 XML + CSS。Mozilla 同样支持命名空间。

Mozilla 可执行 XSLT。

**Netscape**

从版本 8 开始，Netscape 就开始使用 Mozilla 引擎，所以它对 XML / XSLT 的支持与Mozilla是相同的。

**Opera**

从版本 9 开始，Opera 已开始支持 XML 和 XSLT（以及 CSS）。版本 8 仅支持 XML + CSS。

**Internet Explorer**

从版本 6 开始，Internet Explorer 已开始 XML、命名空间、CSS、XSLT 以及 XPath。

版本 5 *不兼容*官方的 W3C XSL 标准。

## XSLT 转换

**实例研究：如何使用 XSLT 将 XML 转换为 XHTML。**

### 正确的样式表声明

把文档声明为 XSL 样式表的根元素是 **< xsl:stylesheet >** 或 **< xsl:transform >**。

**注释：** < xsl:stylesheet > 和 < xsl:transform > 是完全同义的，均可被使用！

根据 W3C 的 XSLT 标准，声明 XSL 样式表的正确方法是：

```xml
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
```

或者：

```xml
<xsl:transform version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
```

如需访问 XSLT 的元素、属性以及特性，我们必须在文档顶端声明 XSLT 命名空间。

xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 指向了官方的 W3C XSLT 命名空间。如果使用此命名空间，就必须包含属性 version="1.0"。

### 从一个原始的 XML 文档开始

我们现在要把下面这个 XML 文档（"cdcatalog.xml"）转换为 XHTML：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<catalog>
  <cd>
    <title>Empire Burlesque</title>
    <artist>Bob Dylan</artist>
    <country>USA</country>
    <company>Columbia</company>
    <price>10.90</price>
    <year>1985</year>
  </cd>
.
.
.
</catalog>
```

**在 Internet Explorer 和 Firefox 中查看 XML 文件：**

打开 XML 文件（通常通过点击某个链接） - XML 文档会以颜色化的代码方式来显示根元素及子元素。点击元素左侧的加号或减号可展开或收缩元素的结构。如需查看原始的XML源文件（不带有加号和减号），请在浏览器菜单中选择“查看页面源代码”。

### 创建 XSL 样式表

然后创建一个带有转换模板的 XSL 样式表（"cdcatalog.xsl"）：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <body>
    <h2>My CD Collection</h2>
    <table border="1">
    <tr bgcolor="#9acd32">
      <th align="left">Title</th>
      <th align="left">Artist</th>
    </tr>
    <xsl:for-each select="catalog/cd">
    <tr>
      <td><xsl:value-of select="title"/></td>
      <td><xsl:value-of select="artist"/></td>
    </tr>
    </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>

</xsl:stylesheet>
```

### 把 XSL 样式表链接到 XML 文档

向 XML 文档（"cdcatalog.xml"）添加 XSL 样式表引用：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<?xml-stylesheet type="text/xsl" href="cdcatalog.xsl"?>
<catalog>
  <cd>
    <title>Empire Burlesque</title>
    <artist>Bob Dylan</artist>
    <country>USA</country>
    <company>Columbia</company>
    <price>10.90</price>
    <year>1985</year>
  </cd>
.
.
.
</catalog>
```

如果使用的浏览器兼容 XSLT，它会很顺利地把 XML *转换为* XHTML。

![image-20220330205611376](C:\Users\yumo\AppData\Roaming\Typora\typora-user-images\image-20220330205611376.png)

## XSLT元素

### < xsl:template > 元素

**XSL 样式表由一个或多套被称为模板（template）的规则组成。**

**每个模板含有当某个指定的节点被匹配时所应用的规则。**

< xsl:template > 元素用于**构建模板**。

*match* 属性用于**关联 XML 元素和模板**。match 属性也可用来**为整个文档定义模板**。match 属性的值是 **XPath 表达式**（举例，match="/" 定义整个文档）。

**语法**

```xml
<xsl:template
name="name"
match="pattern"
mode="mode"
priority="number">

  <!-- Content:(<xsl:param>*,template) -->

</xsl:template>
```

**属性**

| 属性     | 值      | 描述                                                         |
| :------- | :------ | :----------------------------------------------------------- |
| name     | name    | 可选。为模板定义名称。注释：如果省略该属性，则必须设置 match 属性。 |
| match    | pattern | 可选。模板的匹配模式。注释：如果省略该属性，则必须设置 name 属性。 |
| mode     | mode    | 可选。为模板规定模式。                                       |
| priority | number  | 可选。模板的优先级编号。                                     |

**实例**

**例子** **1**

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <body>
  <h2>My CD Collection</h2> 
  <xsl:apply-templates/> 
  </body>
  </html>
</xsl:template>

<xsl:template match="cd">
  <p>
  <xsl:apply-templates select="title"/> 
  <xsl:apply-templates select="artist"/>
  </p>
</xsl:template>

<xsl:template match="title">
  Title: <span style="color:#ff0000">
  <xsl:value-of select="."/></span>
  <br />
</xsl:template>

<xsl:template match="artist">
  Artist: <span style="color:#00ff00">
  <xsl:value-of select="."/></span>
  <br />
</xsl:template>

</xsl:stylesheet>
```

好了，让我们看一下上一节中的 XSL 文件的简化版本：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
 <html>
 <body>
   <h2>My CD Collection</h2>
   <table border="1">
     <tr bgcolor="#9acd32">
       <th>Title</th>
       <th>Artist</th>
     </tr>
     <tr>
       <td>.</td>
       <td>.</td>
     </tr>
   </table>
 </body>
 </html>
</xsl:template>

</xsl:stylesheet>
```

**代码解释：**

由于 XSL 样式表本身也是一个 XML 文档，因此它总是由 XML 声明起始：

```
<?xml version="1.0" encoding="ISO-8859-1"?>
```

下一个元素，*< xsl:stylesheet >*，定义此文档是一个 XSLT 样式表文档（连同版本号和 XSLT 命名空间属性）。

*< xsl:template >* 元素定义了一个模板。而 *match="/"* 属性则把此模板与 XML 源文档的根相联系。

< xsl:template > 元素内部的内容定义了写到输出结果的 HTML 代码。

最后两行定义了模板的结尾，及样式表的结尾。

**以上转换的结果类似这样**：

![img](https://www.w3school.com.cn/xsl/i/xsl_templates_01.gif)

### < xsl:value-of > 元素

**< xsl:value-of > 元素用于提取某个选定节点的值。**

< xsl:value-of > 元素用于提取某个选定节点的值，并把值添加到转换的输出流中：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
 <html>
 <body>
   <h2>My CD Collection</h2>
   <table border="1">
     <tr bgcolor="#9acd32">
       <th>Title</th>
       <th>Artist</th>
     </tr>
     <tr>
      <td><xsl:value-of select="catalog/cd/title"/></td>
      <td><xsl:value-of select="catalog/cd/artist"/></td>
     </tr>
   </table>
 </body>
 </html>
</xsl:template>

</xsl:stylesheet>
```

**注释：**  **select** 属性的值是一个 XPath 表达式。此表达式的工作方式类似于定位某个文件系统，在其中正斜杠可选择子目录。

上面的转换结果类似这样：

![img](https://www.w3school.com.cn/xsl/i/xsl_value_of_01.gif)

这个例子的结果有一点缺陷：仅有一行数据从 XML 文档被拷贝到输出结果。

**语法**

```xml
<xsl:value-of
select="expression"
disable-output-escaping="yes|no"/>
```

**属性**

| 属性                    | 值         | 描述                                                         |
| :---------------------- | :--------- | :----------------------------------------------------------- |
| select                  | expression | 必需。XPath 表达式，规定了从哪个节点/属性来提取值。          |
| disable-output-escaping | yesno      | 默认值为 "no"。如果值为 "yes"，通过实例化 <xsl:text> 元素生成的文本节点在输出时将不进行任何转义。 比如如果设置为 "yes"，则 "<" 将不进行转换。如果设置为 "no"，则被输出为 "&lt;"。 |

**实例**

**例子 1**

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
 <html>
 <body>
   <h2>My CD Collection</h2>
   <table border="1">
     <tr bgcolor="#9acd32">
       <th>Title</th>
       <th>Artist</th>
     </tr>
     <tr>
      <td><xsl:value-of select="catalog/cd/title"/></td>
      <td><xsl:value-of select="catalog/cd/artist"/></td>
     </tr>
   </table>
 </body>
 </html>
</xsl:template>

</xsl:stylesheet>
```

###  < xsl:for-each > 元素

**< xsl:for-each > 元素允许您在 XSLT 中进行循环。**

< xsl:for-each > 元素可用于选取指定的节点集中的每个 XML 元素。

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <body>
    <h2>My CD Collection</h2>
    <table border="1">
      <tr bgcolor="#9acd32">
        <th>Title</th>
        <th>Artist</th>
      </tr>
      <xsl:for-each select="catalog/cd">
      <tr>
        <td><xsl:value-of select="title"/></td>
        <td><xsl:value-of select="artist"/></td>
      </tr>
      </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>

</xsl:stylesheet>
```

**注释：**   **select** 属性的值是一个 XPath 表达式。此表达式的工作方式类似于定位某个文件系统，在其中正斜杠可选择子目录。

上面的转换结果类似这样：

![img](https://www.w3school.com.cn/xsl/i/xsl_for_each_01.gif)



**结果过滤**

通过在 < xsl:for-each > 元素中添加一个选择属性的判别式，我们也可以过滤从 XML 文件输出的结果。

```xml
<xsl:for-each select="catalog/cd[artist='Bob Dylan']">
```

**合法的过滤运算符**

- = (等于)
- != (不等于)
- &lt; (小于)
- &gt; (大于)

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
 <html>
  <body>
  <h2>My CD Collection</h2>
  <table border="1">
   <tr bgcolor="#9acd32">
      <th>Title</th>
      <th>Artist</th>
   </tr>
   <xsl:for-each select="catalog/cd[artist='Bob Dylan']">
   <tr>
      <td><xsl:value-of select="title"/></td>
      <td><xsl:value-of select="artist"/></td>
   </tr>
   </xsl:for-each>
  </table>
 </body>
 </html>
</xsl:template>

</xsl:stylesheet>
```

上面的转换结果类似这样：

![img](https://www.w3school.com.cn/xsl/i/xsl_for_each_02.gif)

###  < xsl:sort > 元素

**< xsl:sort > 元素用于对结果进行排序。**

**在何处放置排序信息**

如需对结果进行排序，只要简单地在 XSL 文件中的 < xsl:for-each > 元素**内部**添加一个         < xsl:sort > 元素：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <body>
    <h2>My CD Collection</h2>
    <table border="1">
      <tr bgcolor="#9acd32">
        <th>Title</th>
        <th>Artist</th>
      </tr>
      <xsl:for-each select="catalog/cd">
      <xsl:sort select="artist"/>
      <tr>
        <td><xsl:value-of select="title"/></td>
        <td><xsl:value-of select="artist"/></td>
      </tr>
      </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>

</xsl:stylesheet>
```

**注释：**  **select**  属性指示需要排序的 XML 元素。

上面的转换结果类似这样：

![img](https://www.w3school.com.cn/xsl/i/xsl_sort_01.gif)

###  < xsl:if > 元素

**< xsl:if > 元素用于放置针对 XML 文件内容的条件测试。**

如需放置针对 XML 文件内容的条件测试，请向 XSL 文档添加 < xsl:if > 元素。

**语法**

```xml
<xsl:if test="expression">
  ...
  ...如果条件成立则输出...
  ...
</xsl:if>
```

**在何处放置 < xsl:if > 元素**

如需添加有条件的测试，请在 XSL 文件中的 < xsl:for-each > 元素内部添加 < xsl:if > 元素：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">
  <html>
  <body>
    <h2>My CD Collection</h2>
    <table border="1">
      <tr bgcolor="#9acd32">
        <th>Title</th>
        <th>Artist</th>
      </tr>
      <xsl:for-each select="catalog/cd">
      <xsl:if test="price &gt; 10">
        <tr>
          <td><xsl:value-of select="title"/></td>
          <td><xsl:value-of select="artist"/></td>
        </tr>
      </xsl:if>
      </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>
</xsl:stylesheet>
```

**注释：**必选的 *test* 属性的值包含了需要求值的表达式。

上面的代码仅仅会输出价格高于 10 的 CD 的 title 和 artist 元素。

上面的转换结果类似这样：

![img](https://www.w3school.com.cn/xsl/i/xsl_if_01.gif)

###  < xsl:choose > 元素

**XSLT < xsl:choose > 元素用于结合 < xsl:when > 和 < xsl:otherwise > 来表达多重条件测试。**

**语法**

```
<xsl:choose>
  <xsl:when test="expression">
    ... 输出 ...
  </xsl:when>
  <xsl:otherwise>
    ... 输出 ....
  </xsl:otherwise>
</xsl:choose>
```

**在何处放置选择条件**

要插入针对 XML 文件的多重条件测试，请向 XSL 文件添加 < xsl:choose >、< xsl:when > 以及 < xsl:otherwise >：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <body>
    <h2>My CD Collection</h2>
    <table border="1">
      <tr bgcolor="#9acd32">
        <th>Title</th>
        <th>Artist</th>
      </tr>
      <xsl:for-each select="catalog/cd">
      <tr>
        <td><xsl:value-of select="title"/></td>
      	<xsl:choose>
          <xsl:when test="price &gt; 10">
            <td bgcolor="#ff00ff">
            <xsl:value-of select="artist"/></td>
          </xsl:when>
          <xsl:otherwise>
            <td><xsl:value-of select="artist"/></td>
          </xsl:otherwise>
        </xsl:choose>
      </tr>
      </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>

</xsl:stylesheet>
```

上面的代码会在 CD 的价格高于 10 时向 "Artist" 列添加粉色的背景颜色。

上面的转换结果类似这样：

![img](https://www.w3school.com.cn/xsl/i/xsl_choose_01.gif)

**另一个例子**

这是另外一个包含两个 < xsl:when > 元素的例子：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <body>
    <h2>My CD Collection</h2>
    <table border="1">
      <tr bgcolor="#9acd32">
        <th>Title</th>
        <th>Artist</th>
      </tr>
      <xsl:for-each select="catalog/cd">
      <tr>
        <td><xsl:value-of select="title"/></td>
      	<xsl:choose>
          <xsl:when test="price &gt; 10">
            <td bgcolor="#ff00ff">
            <xsl:value-of select="artist"/></td>
          </xsl:when>
          <xsl:when test="price &gt; 9">
            <td bgcolor="#cccccc">
            <xsl:value-of select="artist"/></td>
          </xsl:when>
          <xsl:otherwise>
            <td><xsl:value-of select="artist"/></td>
          </xsl:otherwise>
        </xsl:choose>
      </tr>
      </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>

</xsl:stylesheet>
```

上面的代码会在 CD 的价格高于 10 时向 "Artist" 列添加粉色的背景颜色，并在 CD 的价格高于 9 且低于等于 10 时向 "Artist" 列添加灰色的背景颜色。

上面的转换结果类似这样：

![img](https://www.w3school.com.cn/xsl/i/xsl_choose_02.gif)

### < xsl:apply-templates > 元素

< xsl:apply-templates > 元素可把一个模板应用于当前的元素或者当前元素的子节点。

假如我们向 < xsl:apply-templates > 元素添加一个 select 属性，此元素就会仅仅处理与属性值匹配的子元素。我们可以使用 **select** 属性来规定子节点被处理的顺序。

**语法**

```
<xsl:apply-templates select="expression" mode="name">
  <!-- Content:(xsl:sort|xsl:with-param)* -->
</xsl:apply-templates>
```

**属性**

| 属性   | 值     | 描述                                                         |
| :----- | :----- | :----------------------------------------------------------- |
| select | 表达式 | 可选。规定要处理的节点。星号选取整个节点集。如果省略该属性，则将选取当前节点的所有子节点。 |
| mode   | 名称   | 可选。如果存在为相同元素定义的多个处理方法，那么用 mode 可以区分它们。 |

**实例**

**例子 1**

用 h1 元素包围文档中每个 title 元素：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="title">
  <h1><xsl:apply-templates/></h1>
</xsl:template>

</xsl:stylesheet>
```

**例子 2**

用 h1 元素包围文档中所有属于 message 的子元素的 title 元素：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="message">
  <h1><xsl:apply-templates select="title"/></h1>
</xsl:template>

</xsl:stylesheet>
```

**例子 3**

用 h1 元素包围文档中 mode 属性设置为 "big" 的 message 所有子节点：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="message">
  <h1><xsl:apply-templates select="*" mode="big"/></h1>
</xsl:template>

</xsl:stylesheet>
```

###  < xsl:attribute > 元素

**定义和用法**

< xsl:attribute > 元素用于向元素添加属性。

**注释：**< xsl:attribute > 元素会替换名称相同的已有属性。

语法

```
<xsl:attribute name="attributename" namespace="uri">
  <!-- Content:template -->
</xsl:attribute>
```

**属性**

| 属性      | 值            | 描述                             |
| :-------- | :------------ | :------------------------------- |
| name      | attributename | 必需。规定属性的名称。           |
| namespace | URI           | 可选。为属性定义命名空间的 URI。 |

**实例**

例子 1

向 picture 元素添加 source 属性：

```xml
<picture>
  <xsl:attribute name="source"/>
</picture>
```

例子 2

向 picture 元素添加 source 属性，并使用 "images/name" 中的值为其赋值：

```xml
<picture>
  <xsl:attribute name="source">
    <xsl:value-of select="images/name" />
  </xsl:attribute>
</picture>
```

例子 3

创建能够应用到任何输出元素的属性集：

```xml
<xsl:attribute-set name="font">
  <xsl:attribute name="fname">Arial</xsl:attribute>
  <xsl:attribute name="size">14px</xsl:attribute>
  <xsl:attribute name="color">red</xsl:attribute>
</xsl:attribute-set>
```

###  < xsl:attribute-set > 元素

**定义和用法**

< xsl:attribute-set > 元素可创建命名的属性集。该属性集（attribute-set）可作为整体应用到输出文档。

**注释：**必须是 < xsl:stylesheet > 或 < xsl:transform > 的子节点。

**语法**

```xml
<xsl:attribute-set
name="name" use-attribute-sets="name-list">
  <!-- Content:xsl:attribute* -->
</xsl:attribute-set>
```

**属性**

| 属性               | 值        | 描述                                                   |
| :----------------- | :-------- | :----------------------------------------------------- |
| name               | name      | 必需。规定属性集的名称。                               |
| use-attribute-sets | name-list | 可选。在该属性集中使用的其它属性集的列表，由空格分隔。 |

**实例**

**例子 1**

创建可应用到任何输出元素的属性集（attribute-set ）：

```xml
<xsl:attribute-set name="font">
  <xsl:attribute name="fname">Arial</xsl:attribute>
  <xsl:attribute name="size">14px</xsl:attribute>
  <xsl:attribute name="color">red</xsl:attribute>
</xsl:attribute-set>
```

### < xsl:call-template > 元素

**定义和用法**

< xsl:call-template > 元素可调用一个指定的模板。

**语法**

```xml
<xsl:call-template name="templatename">
  <!-- Content:xsl:with-param* -->
</xsl:call-template>
```

**属性**

| 属性 | 值           | 描述                         |
| :--- | :----------- | :--------------------------- |
| name | templatename | 必需。规定被调用的模板名称。 |

**实例**

**例子 1**

当处理程序找到一个 car 元素时，调用名为 "description" 的模板：

```xml
<xsl:template match="car">
  <xsl:call-template name="description"/>
</xsl:template>
```

### < xsl:comment > 元素

**定义和用法**

< xsl:comment > 元素用于在结果树中创建注释节点。

**语法**

```xml
<xsl:comment>
<!-- Content:template -->
</xsl:comment>
```

**属性**

None

**实例**

**例子 1**

```xml
<xsl:comment>This is a comment!</xsl:comment>
```

### < xsl:element > 元素

**定义和用法**

< xsl:element > 元素用于在输出文档中创建元素节点。

**语法**

```xml
<xsl:element
name="name"
namespace="URI"
use-attribute-sets="namelist">
  <!-- Content:template -->
</xsl:element>
```

**属性**

| 属性               | 值       | 描述                                                         |
| :----------------- | :------- | :----------------------------------------------------------- |
| name               | name     | 必需。规定要创建的元素的名称（可以使用表达式为 name 属性赋值，这个表达式是在运行时进行计算的，比如：<xsl:element name="{$country}" />） |
| namespace          | URI      | 可选。规定元素的命名空间 URI。（可以使用表达式为 namespace 属性赋值，这个表达式是在运行时进行计算的，比如：<xsl:element name="{$country}" namespace="{$someuri}"/>） |
| use-attribute-sets | namelist | 可选。空格分隔的属性集，该属性集包含了需要向元素添加的属性。 |

**实例**

**例子 1**

创建一个名为 "singer" 的元素，该元素包含每个 artist 元素的值：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <xsl:for-each select="catalog/cd">
    <xsl:element name="singer">
      <xsl:value-of select="artist" />
    </xsl:element>
    <br />
  </xsl:for-each>
</xsl:template>

</xsl:stylesheet>
```

### < xsl:copy > 元素

**定义和用法**

< xsl:copy > 元素可创建当前节点的一个副本（拷贝）。

**注释：**当前节点的 Namespace 节点会被自动复制，但是当前节点的子节点和属性不会被自动复制！

**语法**

```xml
<xsl:copy use-attribute-sets="name-list">
  <!-- Content:template -->
</xsl:copy>
```

**属性**

| 属性               | 值        | 描述                                                         |
| :----------------- | :-------- | :----------------------------------------------------------- |
| use-attribute-sets | name-list | 可选。如果该节点是元素，则该属性是应用到输出节点的属性集列表，由空格分隔。 |

**实例**

**例子 1**

把 message 节点拷贝到输出文档：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="message">
  <xsl:copy>
    <xsl:apply-templates/>
  </xsl:copy>
</xsl:template>

</xsl:stylesheet>
```

### < xsl:copy-of > 元素

**定义和用法**

< xsl:copy-of > 元素可创建当前节点的一个副本。

**注释：**当前节点的 Namespace 节点、子节点以及属性都会被自动复制！

**提示：**该元素可用于把相同节点的多个副本插入到输出的不同位置。

**语法**

```xml
<xsl:copy-of select="expression"/>
```

**属性**

| 属性   | 值         | 描述                     |
| :----- | :--------- | :----------------------- |
| select | expression | 必需。规定要拷贝的内容。 |

**实例**

**例子** **1**

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:variable name="header">
  <tr>
  <th>Element</th>
  <th>Description</th>
  </tr>
</xsl:variable>

<xsl:template match="/">
  <html>
  <body>
  <table>
    <xsl:copy-of select="$header" />
    <xsl:for-each select="reference/record">
    <tr>
    <xsl:if test="category='XML'">
      <td><xsl:value-of select="element"/></td>
      <td><xsl:value-of select="description"/></td>
    </xsl:if>
    </tr>
    </xsl:for-each>
  </table>
  <br />
  <table>
    <xsl:copy-of select="$header" />
    <xsl:for-each select="table/record">
    <tr>
    <xsl:if test="category='XSL'">
      <td><xsl:value-of select="element"/></td>
      <td><xsl:value-of select="description"/></td>
    </xsl:if>
    </tr>
    </xsl:for-each>
  </table>
  </body>
  </html>
</xsl:template>

</xsl:stylesheet>
```

###  < xsl:message > 元素

**定义和用法**

< xsl:message > 元素可向输出写一条消息。该元素主要用于报告错误。

该元素能够包含几乎任何其他的 XSL 元素（< xsl:text > 、< xsl:value-of > 等等）。

terminate 属性允许您选择在错误发生时，是否应终止转换。

**语法**

```xml
<xsl:message terminate="yes|no">

  <!-- Content:template -->

</xsl:message>
```

**属性**

| 属性      | 值    | 描述                                                         |
| :-------- | :---- | :----------------------------------------------------------- |
| terminate | yesno | 可选。"yes"：在消息写入输出后，终止处理。"no"：在消息写入输出后，继续进行处理。默认是 "no"。 |

**实例**

**例子** **1**

检测 artist 是否是空字符串。如果是，则退出 XSL 处理器，并显示一条消息：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <body>
  <xsl:for-each select="catalog/cd">
    <p>Title: <xsl:value-of select="title"/><br />
    Artist:
    <xsl:if test="artist=''">
      <xsl:message terminate="yes">
        Error: Artist is an empty string!
      </xsl:message>
    </xsl:if>
    <xsl:value-of select="artist"/>
    </p>
  </xsl:for-each>
  </body>
  </html>
</xsl:template>

</xsl:stylesheet>
```

###  < xsl:param > 元素

**定义和用法**

< xsl:param > 元素用于声明局部或全局参数。

**注释：**如果在模板内声明参数，就是局部参数，如果作为顶层元素来声明，就是全局参数。

**语法**

```xml
<xsl:param
name="name"
select="expression">

<!-- Content:template -->

</xsl:param>
```

**属性**

| 属性   | 值         | 描述                                              |
| :----- | :--------- | :------------------------------------------------ |
| name   | name       | 必需。规定参数的名称。                            |
| select | expression | 可选。规定 XPath 表达式，该表达式是参数的默认值。 |

**实例**

**例子** **1**

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:variable name="xx">
  <html>
  <body>
  <xsl:call-template name="show_title">
    <xsl:with-param name="title" />
  </xsl:call-template>
  </body>
  </html>
</xsl:variable>

<xsl:template name="show_title" match="/">
  <xsl:param name="title" />
  <xsl:for-each select="catalog/cd">
    <p>Title: <xsl:value-of select="$title" /></p>
  </xsl:for-each>
</xsl:template>

</xsl:stylesheet>
```

### < xsl:variable > 元素

**定义和用法**

< xsl:variable > 元素用于声明局部或全局的变量。

**注释：**如果被声明为顶层元素，则该变量是全局的，而如果在模板内声明，则变量是本地的。

**注释：**一旦您设置了变量的值，就无法改变或修改该值！

**提示：**您可以通过 < xsl:variable > 元素的内容或通过 select 属性，向变量添加值！

**语法**

```xml
<xsl:variable
name="name"
select="expression">

  <!-- Content:template -->

</xsl:variable>
```

**属性**

| 属性   | 值         | 描述                   |
| :----- | :--------- | :--------------------- |
| name   | name       | 必需。规定变量的名称。 |
| select | expression | 可选。定义变量的值。   |

**实例**

**例子 1**

如果设置了 **select** 属性，< xsl:variable > 元素就不能包含任何内容。如果 select 属性含有文字字符串，则必须给字符串加**引号**。

下面的两个例子为变量 "color" 赋值 "red"：

```xml
<xsl:variable name="color" select="'red'" />
<xsl:variable name="color" select='"red"' />
```

**例子 2**

如果 < xsl:variable > 元素只包包含 name 属性，且没有内容，则变量的值是**空字符串**：

```xml
<xsl:variable name="j" />
```

**例子 3**

下面的例子通过 < xsl:variable > 元素的内容为变量 "header" 赋值：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:variable name="header">
  <tr>
  <th>Element</th>
  <th>Description</th>
  </tr>
</xsl:variable>

<xsl:template match="/">
  <html>
  <body>
  <table>
    <xsl:copy-of select="$header" />
    <xsl:for-each select="reference/record">
    <tr>
    <xsl:if category="XML">
      <td><xsl:value-of select="element"/></td>
      <td><xsl:value-of select="description"/></td>
    </xsl:if>
    </tr>
    </xsl:for-each>
  </table>
  <br />
  <table>
    <xsl:copy-of select="$header" />
    <xsl:for-each select="table/record">
    <tr>
    <xsl:if category="XSL">
      <td><xsl:value-of select="element"/></td>
      <td><xsl:value-of select="description"/></td>
    </xsl:if>
    </tr>
    </xsl:for-each>
  </table>
  </body>
  </html>
</xsl:template>

</xsl:stylesheet>
```

###  < xsl:output > 元素

**定义和用法**

< xsl:output > 元素定义了输出文档的格式。

**注释：**< xsl:output > 是**顶层元素**（top-level element），必须是 < xsl:stylesheet > 或        < xsl:transform > 的子节点。

**语法**

```xml
<xsl:output
method="xml|html|text|name"
version="string"
encoding="string"
omit-xml-declaration="yes|no"
standalone="yes|no"
doctype-public="string"
doctype-system="string"
cdata-section-elements="namelist"
indent="yes|no"
media-type="string"/>
```

**属性**

| 属性                   | 值              | 描述                                                         |
| :--------------------- | :-------------- | :----------------------------------------------------------- |
| method                 | xmlhtmltextname | 可选。定义输出的格式。默认是 XML。Netscape 6 仅支持 "html" 和 "xml"。 |
| version                | string          | 可选。设置输出格式的 W3C 版本号。（仅在 method="html" or method="xml" 时使用）。 |
| encoding               | string          | 可选。设置输出中编码属性的值。                               |
| omit-xml-declaration   | yesno           | 可选。 "yes" 规定在输出中省略 XML 声明 (<?xml...?>)。 "no" 规定应在输出中包含 XML 声明。默认是 "no"。 |
| standalone             | yesno           | 可选。规定 XSLT 处理器是否应输出独立文档声明；该值必须为 yes 或 no。默认是 "no"。Netscape 6 不支持该属性。 |
| doctype-public         | string          | 可选。规定 DTD 中要使用的公共标识符。即输出中 DOCTYPE 声明的 PUBLIC 属性的值。 |
| doctype-system         | string          | 可选。规定 DTD 中要使用的系统标识符。即输出中 DOCTYPE 声明的 SYSTEM 属性的值。 |
| cdata-section-elements | namelist        | 可选。一个空格分隔的元素列表，这些元素的文本内容应作为 CDATA 部分来输出。 |
| indent                 | yesno           | 可选。在输出结果树时是否要增加空白；该值必须为 yes 或 no。Netscape 6 不支持该属性。 |
| media-type             | string          | 可选。定义输出的 MIME 类型（数据的媒体类型）。默认是 "text/xml"。Netscape 6 不支持该属性。 |

**method 属性**

标识用于输出结果树的总体方法。如果没有前缀，则标识此文档中指定的方法，必须是 "xml"、"html"、"text" 或不是 NCName 的限定名 之一）。如果有前缀，则展开并标识输出方法。

method 属性的默认值的选择如下所示。如果下列任何条件为真，默认的输出方法为“html”：

结果树的根节点包含元素子级。

结果树中根节点的第一个元素子级（即文档元素）的扩展名称包含本地部分“html”（任意大小写组合）和空命名空间 URI。

结果树中根节点的第一个元素子级之前的任何文本节点只包含空白字符。

否则，默认的输出方法为 "xml"。如果没有 < xsl:output > 元素或没有 < xsl:output > 元素指定了 method 属性的值，应使用默认的输出方法。

**实例**

**例子 1**

在本例中，输出是 XML 文档，版本为 1.0。字符编码方式被设置为 "ISO-8859-1"，输出会进行缩进，以增进可读性：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="xml" version="1.0" encoding="iso-8859-1" indent="yes"/>

...

...

</xsl:stylesheet>
```

**例子 2**

在本例中，输出是 HTML 文档，版本是 4.0。字符编码方式被设置为 "ISO-8859-1"，输出会进行缩进，以增进可读性：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="html" version="4.0" encoding="iso-8859-1" indent="yes"/>

...

...

</xsl:stylesheet>
```

###  < xsl:import > 元素

**定义和用法**

< xsl:import > 元素是顶层元素，用于把一个样式表中的内容倒入另一个样式表中。

**注释：**被导入的样式的优先级低于导出的样式表。

**注释：**该元素必须是 < xsl:stylesheet > 或 < xsl:transform > 的第一个子节点。

**注释：**Netscape 6 不支持导入优先规则，因此此元素的表现与 < xsl:include > 相同。

**语法**

```
<xsl:import href="URI"/>
```

**属性**

| 属性 | 值   | 描述                             |
| :--- | :--- | :------------------------------- |
| href | URI  | 必需。规定到导入的样式表的 URI。 |

**实例**

**例子 1**

假设您有一个名为 "cdcatalog_ex3.xsl" 的样式表文件：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
 <html>
 <body>
   <h2>My CD Collection</h2>
   <table border="1">
     <tr bgcolor="#9acd32">
       <th>Title</th>
       <th>Artist</th>
     </tr>
     <tr>
      <td><xsl:value-of select="catalog/cd/title"/></td>
      <td><xsl:value-of select="catalog/cd/artist"/></td>
     </tr>
   </table>
 </body>
 </html>
</xsl:template>

</xsl:stylesheet>
```

第二个名为 "cdcatalog_import.xsl" 的样式表会导入 "cdcatalog_ex3.xsl"：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:import href="cdcatalog_ex3.xsl"/>

<xsl:template match="/">
  <xsl:apply-imports/>
</xsl:template>

</xsl:stylesheet>
```

### < xsl:apply-imports > 元素

**定义和用法**

< xsl:apply-imports > 元素可应用来自导入样式表中的模版规则。

导入样式表中的模版规则的优先级要比主样式表中的模版规则要低。如果您希望使用导入样式表中的某条模版规则，而不是主样式表中的某条等价规则，就会用到 < xsl:apply-imports > 元素。

**语法**

```xml
<xsl:apply-imports/>
```

**属性**

None

**实例**

假设我们有一个名为 "standard.xsl" 的样式表，其中包含用于 message 元素的模版规则：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="message">
  <h2><xsl:apply-templates/></h2>
</xsl:template>

</xsl:stylesheet>
```

另一个样式表能够导入 "standard.xsl"，并修改 message，就像这样：

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:import href="standard.xsl"/>

<xsl:template match="message">
  <div style="border:solid blue">
  <xsl:apply-imports/>
  </div>
</xsl:template>

</xsl:stylesheet>
```

结果是：将把一条消息转换到格状的元素中：

```xml
<div style="border:solid blue"><h2>...</h2></div>
```

###  < xsl:include > 元素

**定义和用法**

< xsl:include > 元素是顶层元素（top-level element），把一个样式表中的样式表内容包含到另一个样式表中。

**注释：**被包含的样式表（included style sheet）拥有与包含的样式表（including style sheet）相同的优先级。

**注释：**该元素必须是 < xsl:stylesheet > 或 < xsl:transform > 的子节点。

**语法**

```xml
<xsl:include href="URI"/>
```



| 属性 | 值   | 描述                             |
| :--- | :--- | :------------------------------- |
| href | URI  | 必需。规定要包含的样式表的 URI。 |

**实例**

**例子 1**

下面的例子包含了名为 xslincludefile.xsl 的样式表：

```xml
<?xml version=1.0'?>
<xsl:stylesheet version="1.0"
      xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:output method="xml" omit-xml-declaration="yes"/>

<xsl:template match="/">
   <xsl:for-each select="COLLECTION/BOOK">
      <xsl:apply-templates select="TITLE"/>
      <xsl:apply-templates select="AUTHOR"/>
      <xsl:apply-templates select="PUBLISHER"/>
      <BR/>  <!-- add this -->
   </xsl:for-each>
</xsl:template>

<xsl:template match="TITLE">
  <DIV STYLE="color:blue">
    Title: <xsl:value-of select="."/>
  </DIV>
</xsl:template>

<xsl:include href="/xsl/xslincludefile.xsl" />

</xsl:stylesheet>
```

## XSLT 函数

**XQuery 1.0、XPath 2.0 以及 XSLT 2.0 共享相同的函数库。**

XSLT 含有超过 100 个内建的函数。这些函数用于字符串值、数值、日期和时间比较、节点和 QName 操作、序列操作、逻辑值，等等等等。

XSLT 函数的命名空间的 URI 是：

```
http://www.w3.org/2005/02/xpath-functions
```

函数命名空间的默认前缀是 fn。

提示：函数在被调用时常带有 fn: 前缀，比如 fn:string()。不过，既然 fn: 是命名空间的默认前缀，那么在被调用时，函数的名称不必使用前缀。

您可以在我们的 XPath 教程中访问所有内建的 XSLT 2.0 函数参考。

此外，在此列出了内建的 XSLT 函数：

| 名称                  | 描述                                                         |
| :-------------------- | :----------------------------------------------------------- |
| current()             | 返回当前节点作为唯一成员的节点集。                           |
| document()            | 用于访问外部 XML 文档中的节点。                              |
| element-available()   | 检测 XSLT 处理器是否支持指定的元素。                         |
| format-number()       | 把数字转换为字符串。                                         |
| function-available()  | 检测 XSLT 处理器是否支持指定的函数。                         |
| generate-id()         | 返回唯一标识指定节点的字符串值。                             |
| key()                 | 检索以前使用 < xsl:key > 语句标记的元素。                    |
| node-set              | 将树转换为节点集。产生的节点集总是包含单个节点并且是树的根节点。 |
| system-property()     | 返回系统属性的值。                                           |
| unparsed-entity-uri() | 返回未解析实体的 URI。                                       |

### current()

**定义和用法**

current() 函数返回**仅包含当前节点的节点集**。通常，当前节点与上下文节点是相同的。

```xml
<xsl:value-of select="current()"/>
```

等于

```xml
<xsl:value-of select="."/>
```

不过，有一点不同。让我们看一下下面的 XPath 表达式："catalog/cd"。表达式选择了当前节点的 <catalog> 子节点，然后选择了 <catalog> 节点的 <cd> 子节点。这意味着，在计算的每一步上，"." 都有不同的意义。

下面这行：

```xml
<xsl:apply-templates select="//cd[@title=current()/@ref]"/>
```

将处理 title 属性的值等于**当前节点**的 ref 属性的值的所有 cd 元素。

与这个不同：

```xml
<xsl:apply-templates select="//cd[@title=./@ref]"/>
```

这个会处理 title 属性和 ref 属性具有相同值的所有 cd 元素。

**语法**

```xml
node-set current()
```

**例子**

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
  <html>
  <body>
  <xsl:for-each select="catalog/cd/artist">
    Current node: <xsl:value-of select="current()"/>
    <br />
  </xsl:for-each>
  </body>
  </html>
</xsl:template>

</xsl:stylesheet>
```

### document() 

**定义和用法**

document() 函数用于访问外部 XML 文档中的节点。外部 XML 文档必须是合法且可解析的。

此函数提供了从 XSLT 样式表中检索由输入流提供的初始数据以外的其他 XML 资源的方法。

使用该函数的一种方式是是在一个外部文档中查找数据。举例来说，我们希望找到与华氏度值相对应的摄氏度值，我们访问了包含预计算值的文档：

```xml
<xsl:value-of select="document('celsius.xml')/celsius/result[@value=$value]"/>
```

**语法**

```
node-set document(object,node-set?)
```

**参数**

| 参数     | 描述                           |
| :------- | :----------------------------- |
| object   | 必需。定义外部 XML 文档的URI。 |
| node-set | 可选。用于解析相对 URI。       |

### element-available() 

**定义和用法**

element-available() 函数返回一个布尔值，该值指示 XSLT 处理器是否支持指定的元素。

该函数只能用来测试位于模板主体的元素。这些元素是：

- xsl:apply-imports
- xsl:apply-templates
- xsl:attributes
- xsl:call-template
- xsl:choose
- xsl:comment
- xsl:copy
- xsl:copy-of
- xsl:element
- xsl:fallback
- xsl:for-each
- xsl:if
- xsl:message
- xsl:number
- xsl:processing instruction
- xsl:text
- xsl:value-of
- xsl:variable

**语法**

```
boolean element-available(string)
```

**参数**

| 参数   | 描述                     |
| :----- | :----------------------- |
| string | 必需。规定要测试的元素。 |

**例子**

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
<html>
<body>
<xsl:choose>
<xsl:when test="element-available('xsl:comment')">
<p>xsl:comment is supported.</p>
</xsl:when>
<xsl:otherwise>
<p>xsl:comment is not supported.</p>
</xsl:otherwise>
</xsl:choose>
<xsl:choose>
<xsl:when test="element-available('xsl:delete')">
<p>xsl:delete is supported.</p>
</xsl:when>
<xsl:otherwise>
<p>xsl:delete is not supported.</p>
</xsl:otherwise>
</xsl:choose>
</body>
</html>
</xsl:template>

</xsl:stylesheet>
```

### format-number()

**定义和用法**

format-number() 函数用于把数字转换为字符串。

**语法**

```xml
string format-number(number,format,[decimalformat])
```

**参数**

| 参数          | 描述                                                         |
| :------------ | :----------------------------------------------------------- |
| number        | 必需。规定要格式化的数字。                                   |
| format        | 必需。规定格式化模式。这是用在格式化模式中的字符：# (表示数字。例如：####)0 (表示“.”字符前面和后面的零。例如：0000.00). (小数点的位置。例如：###.##), (千的组分隔符。例如：###,###.##)% (把数字显示为百分比。例如：##%); (模式分隔符。第一个模式用于正数，第二个模式用于负数。) |
| decimalformat | 可选。十进制格式名称。                                       |

**例子**

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
<html>
<body>
<xsl:value-of select='format-number(500100, "#.00")' />
<br />
<xsl:value-of select='format-number(500100, "#.0")' />
<br />
<xsl:value-of select='format-number(500100, "###,###.00")' />
<br />
<xsl:value-of select='format-number(0.23456, "##%")' />
<br />
<xsl:value-of select='format-number(500100, "#######")' />
</body>
</html>
</xsl:template>

</xsl:stylesheet>
```

### function-available() 

**定义和用法**

function-available() 函数返回一个布尔值，该值指示 XSLT 处理器是否支持指定的函数。

你可以测试 XSLT 函数和被继承的 XPath 函数。

**语法**

```
boolean function-available(string)
```

**参数**

| 参数   | 描述                     |
| :----- | :----------------------- |
| string | 必需。规定要测试的函数。 |

**例子**

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
<html>
<body>
<xsl:choose>
<xsl:when test="function-available('sum')">
<p>sum() is supported.</p>
</xsl:when>
<xsl:otherwise>
<p>sum() is not supported.</p>
</xsl:otherwise>
</xsl:choose>
<xsl:choose>
<xsl:when test="function-available('current')">
<p>current() is supported.</p>
</xsl:when>
<xsl:otherwise>
<p>current() is not supported.</p>
</xsl:otherwise>
</xsl:choose>
</body>
</html>
</xsl:template>

</xsl:stylesheet>
```

### generate-id() 

**定义和用法**

generate-id() 函数返回唯一标识指定节点的字符串值。

如果指定的节点集是空的，则返回空字符串。如果省略了 node-set 参数，则默认设置为当前节点。

**语法**

```
string generate-id(node-set?)
```

**参数**

| 参数     | 描述                                |
| :------- | :---------------------------------- |
| node-set | 可选。规定生成哪个节点集的唯一 id。 |

**例子**

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
<html>
<body>
<h3>Artists:</h3>
<ul>
<xsl:for-each select="catalog/cd">
<li>
<a href="#{generate-id(artist)}">
<xsl:value-of select="artist" /></a>
</li>
</xsl:for-each>
</ul>
<hr />
<xsl:for-each select="catalog/cd">
Artist: <a name="{generate-id(artist)}">
<xsl:value-of select="artist" /></a>
<br />
Title: <xsl:value-of select="title" />
<br />
Price: <xsl:value-of select="price" />
<hr />
</xsl:for-each>
</body>
</html>
</xsl:template>

</xsl:stylesheet>
```

### key() 

**定义和用法**

通过使用由 < xsl:key > 元素规定的索引号，key() 函数从文档中返回节点集。

key() 函数检索与 < xsl:key > 语句中指定的键名和键值相同的节点集（零个或多个节点）。初次处理 XSLT 样式表时，键将存储在内部，以便简化访问。键可以简化对 XML 文档中的节点的访问，但是也许不会比使用 XPath 检索相同的节点速度更快。

参阅 < xsl:key > 元素。

**语法**

```
node-set key(string, object)
```

**参数**

| 参数   | 描述                            |
| :----- | :------------------------------ |
| string | 必需。规定 xsl:key 元素的名称。 |
| object | 必需。要检索的字符串。          |

**例子**

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:key name="cdlist" match="cd" use="title" />

<xsl:template match="/">
<html>
<body>
<xsl:for-each select="key('cdlist', 'Empire Burlesque')">
  <p>
  Title: <xsl:value-of select="title" />
  <br />
  Artist: <xsl:value-of select="artist" />
  <br />
  Price: <xsl:value-of select="price" />
  </p>
</xsl:for-each>
</body>
</html>
</xsl:template>

</xsl:stylesheet>
```

### node-set()

**定义和用法**

使您可以将树转换为节点集。产生的节点集总是包含单个节点并且是树的根节点。

对于早期版本的 Microsoft XML 核心服务 (MSXML)，可以使用 <xsl:for-each select="$var/el"> 等表达式，其中的 var 是绑定到结果树上的 XSLT 变量。但是，此方法不适用于 MSXML 版本 3.0 以及更高版本。要在这些更高版本的 MSXML 中获得相同的结果，请使用 node-set 函数，如以下代码示例中所示。

```xml
<xsl:for-each select="msxsl:node-set($var)/el)">
```

**语法**

```xml
msxsl:node-set(string)
```

### system-property()

**定义和用法**

system-property() 函数返回通过名称标识的系统属性的值。

在 XSLT 命名空间中的系统属性：

| 系统属性       | 说明                                                         |
| :------------- | :----------------------------------------------------------- |
| xsl:version    | 提供处理器所实现的 XSLT 版本的数字；如果 XSLT 处理器实现本文档所指定的 XSLT 版本，该数字为 1。 |
| xsl:vendor     | XSLT 处理器的开发商。                                        |
| xsl:vendor-url | 标识XSLT 处理器的开发商的 URL。                              |
| msxsl:version  | 提供 Microsoft XML 核心服务 (MSXML) 版本的数字。             |

**语法**

```xml
object system-property(string)
```

**参数**

| 参数   | 描述                           |
| :----- | :----------------------------- |
| string | 必需。规定返回其值的系统属性。 |

**例子**

```xml
<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="/">
<html>
<body>
<p>
Version:
<xsl:value-of select="system-property('xsl:version')" />
<br />
Vendor:
<xsl:value-of select="system-property('xsl:vendor')" />
<br />
Vendor URL:
<xsl:value-of select="system-property('xsl:vendor-url')" />
</p>
</body>
</html>
</xsl:template>

</xsl:stylesheet>
```

### unparsed-entity-uri()

**定义和用法**

unparsed-entity-uri() 函数返回未解析实体的 URI。实体名称必须匹配被传递的参数。如果定义了实体，则返回未分析实体的 URI 字符串。否则，返回空字符串。

如果 DTD 含有下面的声明：

```xml-dtd
<!ENTITY pic SYSTEM "http://www.w3school.com.cn/picture.jpg" NDATA JPEG>
```

这个表达式：

```xml
unparsed-entity-uri('pic')
```

将返回文件 "picture.jpg" 的 URI。

**语法**

```xml
string unparsed-entity-uri(string)
```

**参数**

| 参数   | 描述                                                         |
| :----- | :----------------------------------------------------------- |
| string | 必需。规定未解析的实体的名称。必须在与上下文节点相同的文档中定义实体。 |

## 代码测试

被转换的xml文件

employee.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>

<staff>
    <employee>
        <name>Carl Cracker</name>
        <salary>75000</salary>
        <hiredate year="1987" month="12" day="15"/>
    </employee>
    <employee>
        <name>HarryHacker</name>
        <salary>50000</salary>
        <hiredate year="1989" month="10" day="1"/>
    </employee>
    <employee>
        <name>Tony Tester</name>
        <salary>40000</salary>
        <hiredate year="1990" month="3" day="15"/>
    </employee>
</staff>
```



xsl样式表    makehtml.xsl

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    version="1.0">
    <xsl:output method="html"/>
    <xsl:template match="/staff">
        <table border="1"><xsl:apply-templates/></table>
    </xsl:template>

    <xsl:template match="/staff/employee">
        <tr><xsl:apply-templates/></tr>
    </xsl:template>

    <xsl:template match="/staff/employee/name">
        <td><xsl:apply-templates/></td>
    </xsl:template>

    <xsl:template match="/staff/employee/salary">
        <td>$<xsl:apply-templates/></td>
    </xsl:template>

    <xsl:template match="/staff/employee/hiredate">
        <td><xsl:value-of select="@year"/>-<xsl:value-of select="@month"/>-<xsl:value-of select="@day"/></td>
    </xsl:template>
</xsl:stylesheet>
```

```java
import org.xml.sax.*;
import org.xml.sax.helpers.AttributesImpl;

import javax.xml.transform.*;

import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import java.io.*;

import java.util.StringTokenizer;

public class TransformTest {
    public static void main(String[] args){
        try{
            
            StreamSource source=new StreamSource("E:\\helloworld\\src\\javabase\\xml\\employee.xml");
            var styleSource=new StreamSource("E:\\helloworld\\src\\javabase\\xml\\makehtml.xsl");
            Transformer t= TransformerFactory.newDefaultInstance().newTransformer(styleSource);
            
            t.setOutputProperty(OutputKeys.INDENT,"no");
            t.setOutputProperty(OutputKeys.METHOD,"html");
            
            t.transform(source,new StreamResult(new FileOutputStream("E:\helloworld\src\javabase\xml\target2.html")));

        } catch (TransformerException | IOException e) {
            e.printStackTrace();
        }
    }
}
```

输出文件结果如下：

```html
<table border="1">
    <tr>
        <td>Carl Cracker</td>
        <td>$75000</td>
        <td>1987-12-15</td>
    </tr>
    <tr>
        <td>HarryHacker</td>
        <td>$50000</td>
        <td>1989-10-1</td>
    </tr>
    <tr>
        <td>Tony Tester</td>
        <td>$40000</td>
        <td>1990-3-15</td>
    </tr>
</table>
```

### 源码解读



Transformer t= TransformerFactory.newInstance().newTransformer(styleSource);

该行代码调用TransformerFacory类的静态方法创建一个转换器工厂，然后调用newTransformer并传递参数创建一个转换器

参数：source – 用于创建Transformer的 XSLT 文档的Source ，在本例中为makehtml.xsl所转换成的StreamSource对象

```java
public abstract Transformer newTransformer(Source source)
    throws TransformerConfigurationException;
```

t.setOutputProperty(...  ,  "...");

设置一个将对转换生效的输出属性。
将限定属性名称作为两部分字符串传递，命名空间 URI 括在大括号 ({}) 中，后跟本地名称。如果名称的 URL 为空，则字符串仅包含本地名称。应用程序可以通过测试名称的第一个字符是否为“{”字符来安全地检查非空 URI。

```java
public abstract void setOutputProperty(String name, String value)
    throws IllegalArgumentException;
```

OutputKeys类提供可用于设置 Transformer 的输出属性或从 Transformer 或 Templates 对象检索输出属性的字符串常量。其中包含如下常量

| 常量名                 | 字符串内的值及其效果                                         |
| ---------------------- | ------------------------------------------------------------ |
| METHOD                 | "**xml**" "**html**" "**text**" 。method 属性的值标识应该输出的结果树的形式。"xml"输出xml文件,"html"输出html文件,"text"则生成文本文件 |
| VERSION                | 指定输出的结果的版本，例如当METHOD="xml"时,VERSION=“1.1”，则在输出文件头包含<?xml version="4.0" ?> |
| ENCODING               | 指定 Transformer 应该使用的首选字符编码，以将字符序列编码为字节序列。编码属性的值应该不区分大小写 |
| OMIT_XML_DECLARATION   | 指定 XSLT 处理器是否应该输出 XML 声明；该值必须是yes或no 。  |
| STANDALONE             | 指定 Transformer 是否应该输出一个独立的文档声明；该值必须是yes或no 。 |
| DOCTYPE_PUBLIC         | 指定要在文档类型声明中使用的系统标识符。如果指定了 doctype-system 属性，则 xml 输出方法应在第一个元素之前立即输出文档类型声明。 <!DOCTYPE 后面的名称应该是第一个元素的名称。如果还指定了 doctype-public 属性，则 xml 输出方法应输出 PUBLIC，后跟公共标识符，然后是系统标识符；否则，它应该输出 SYSTEM 后跟系统标识符。内部子集应该是空的。除非指定了 doctype-system 属性，否则应该忽略 doctype-public 属性的值。如果指定了 doctype-public 或 doctype-system 属性，则 html 输出方法应在第一个元素之前立即输出文档类型声明。 <!DOCTYPE 后面的名称应该是 HTML 或 html。如果指定了 doctype-public 属性，则输出方法应输出 PUBLIC 后跟指定的公共标识符；如果还指定了 doctype-system 属性，它还应该在公共标识符之后输出指定的系统标识符。如果指定了 doctype-system 属性但未指定 doctype-public 属性，则输出方法应输出 SYSTEM 后跟指定的系统标识符。 |
| DOCTYPE_SYSTEM         | 同上                                                         |
| CDATA_SECTION_ELEMENTS | 指定应使用 CDATA 部分输出其文本节点子项的元素名称的空格分隔列表。请注意，这些名称必须使用javax.xml.transform中的限定名称表示部分中描述的格式。 |
| INDENT                 | 缩进。指定 Transformer 在输出结果树时是否可以添加额外的空格；该值必须是yes或no 。 |
| MEDIA_TYPE             | 指定输出结果树产生的数据的媒体类型（MIME 内容类型）。不应明确指定charset参数；相反，当顶级媒体类型为text时，应根据输出方法实际使用的字符编码添加charset参数。 |

transform(Source xmlSource, Result outputTarget)

```java

/**
 * <p>Transform the XML <code>Source</code> to a <code>Result</code>.
 * Specific transformation behavior is determined by the settings of the
 * <code>TransformerFactory</code> in effect when the
 * <code>Transformer</code> was instantiated and any modifications made to
 * the <code>Transformer</code> instance.</p>
 *
 * <p>An empty <code>Source</code> is represented as an empty document
 * as constructed by {@link javax.xml.parsers.DocumentBuilder#newDocument()}.
 * The result of transforming an empty <code>Source</code> depends on
 * the transformation behavior; it is not always an empty
 * <code>Result</code>.</p>
 *
 * @param xmlSource The XML input to transform.
 * @param outputTarget The <code>Result</code> of transforming the
 *   <code>xmlSource</code>.
 *
 * @throws TransformerException If an unrecoverable error occurs
 *   during the course of the transformation.
 */

public abstract void transform(Source xmlSource, Result outputTarget)
    throws TransformerException;
```

将 XML Source转换为Result 。具体的转换行为由实例化**TransformerFactory**时生效的**Transformer**的设置以及对Transformer实例所做的任何修改决定。
空Source表示为由javax.xml.parsers.DocumentBuilder.newDocument()构造的空文档。转换空Source的结果取决于转换行为；它并不总是一个空的Result 。

该方法的第一个参数可以传递Source接口的实现类的实例，如DOMSource,SAXSource,StAXSource,StreamSource.

第二个参数可以接受Result接口的实现类的实例，如DOMResult,SAXResult,StAXSource,StreamSource