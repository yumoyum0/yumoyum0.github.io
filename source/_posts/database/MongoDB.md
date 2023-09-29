---
title: MongoDB基础
date: 2022-06-27 16:51:33
tags:
- 后端
- MongoDB
- Database
categories:
- Database
---

# MongoDB

# 安装

```shell
docker run  \
--name mongodb_server \
-p 27017:27017  \
-v /mongodb/single/conf/:/single/conf/ \
-v /mongodb/single/data/db/:/single/data/db/ \
-v /mongodb/single/data/log/:/single/data/log/ \
-d mongo --auth

```



# **基本常用命令**

###  **数据库操作**

#### **选择和创建数据库**

**选择和创建数据库的语法格式**：

```javascript
use 数据库名称
```

如果数据库不存在则自动创建，例如，以下语句创建 spitdb 数据库：

```
use articledb
```

**查看有权限查看的所有的数据库命令**

```
show dbs
或
show databases
```

**注意** **:** 在 MongoDB 中，集合只有在内容插入后才会创建! 就是说，创建集合(数据表)后要再插入一个文档(记录)，集合才会真正创建。

**查看当前正在使用的数据库命令**

```
db
```

MongoDB 中默认的数据库为 test，如果你没有选择数据库，集合将存放在 test 数据库中。

另外：

数据库名可以是满足以下条件的任意UTF-8字符串。

- 不能是空字符串（"")。
- 不得含有' '（空格)、.、$、/、\和\0 (空字符)。
- 应全部小写。
- 最多64字节。

有一些数据库名是保留的，可以直接访问这些有特殊作用的数据库。

- **admin**： 从权限的角度来看，这是"root"数据库。要是将一个用户添加到这个数据库，这个用户自动继承所有数据库的权限。一些特定的服务器端命令也只能从这个数据库运行，比如列出所有的数据库或者关闭服务器。
- **local:** 这个数据永远不会被复制，可以用来存储限于本地单台服务器的任意集合
- **config**: 当Mongo用于分片设置时，confifig数据库在内部使用，用于保存分片的相关信息。

#### **数据库的删除**

MongoDB 删除数据库的语法格式如下：

```
db.dropDatabase()
```

提示：主要用来删除已经持久化的数据库

### **集合操作**

集合，类似关系型数据库中的表。

可以显示的创建，也可以隐式的创建。

#### **集合的显式创建（了解）**

基本语法格式：

```
db.createCollection(name)
```

参数说明：

- name: 要创建的集合名称

例如：创建一个名为 mycollection 的普通集合。

```
db.createCollection("mycollection")
```

查看当前库中的表：show tables命令

```
show collections
或
show tables
```

集合的命名规范：

- 集合名不能是空字符串""。
- 集合名不能含有\0字符（空字符)，这个字符表示集合名的结尾。
- 集合名不能以"system."开头，这是为系统集合保留的前缀。
- 用户创建的集合名字不能含有保留字符。有些驱动程序的确支持在集合名里面包含，这是因为某些系统生成的集合中包含该字符。除非你要访问这种系统创建的集合，否则千万不要在名字里出现$。

#### **集合的隐式创建**

当向一个集合中插入一个文档的时候，如果集合不存在，则会自动创建集合。

详见 `文档的插入` 章节。

提示：通常我们使用隐式创建文档即可。

####  **集合的删除**

集合删除语法格式如下：

```
db.collection.drop()
或
db.集合.drop()
```

**返回值**

如果成功删除选定集合，则 drop() 方法返回 true，否则返回 false。

例如：要删除mycollection集合

```
db.mycollection.drop()
```

### 文档基本CRUD

文档（document）的数据结构和 JSON 基本一样。

所有存储在集合中的数据都是 BSON 格式。

#### **文档的插入**

（1）单个文档插入

使用insert() 或 save() 方法向集合中插入文档，语法如下：

```json
db.collection.insert( 
	<document or array of documents>, 
		{ 
		  writeConcern: <document>,
          ordered: <boolean> 
        } 
)
```

参数：

| **Parameter** | **Type**          | **Description**                                              |
| ------------- | ----------------- | ------------------------------------------------------------ |
| document      | document or array | 要插入到集合中的文档或文档数组。（(json格式）                |
| writeConcern  | document          | Optional. A document expressing the write concern. Omit to use the default write concern. |
| ordered       | boolean           | See Write Concern.Do not explicitly set the write concern for the operation if run in a可选。如果为真，则按顺序插入数组中的文档，如果其中一个文档出现错误，MongoDB将返回而 |

【示例】

要向comment的集合(表)中插入一条测试数据：

```json
db.comment.insert(
	{
		"articleid":"100000",
		"content":"今天天气真好，阳光明媚",
		"userid":"1001",
		"nickname":"Rose",
		"createdatetime":new Date(),
		"likenum":NumberInt(10),
		"state":null
	}
)
```

提示：

1. comment集合如果不存在，则会隐式创建
2. mongo中的数字，默认情况下是double类型，如果要存整型，必须使用函数NumberInt(整型数字)，否则取出来就有问题了。
3. 插入当前日期使用 new Date() 
4. 插入的数据没有指定 _id ，会自动生成主键值
5. 如果某字段没值，可以赋值为null，或不写该字段。

执行后，如下，说明插入一个数据成功了。

```
WriteResult({ "nInserted" : 1 })
```

注意：

1. 文档中的键/值对是有序的。
2. 文档中的值不仅可以是在双引号里面的字符串，还可以是其他几种数据类型（甚至可以是整个嵌入的文档)。 
3. MongoDB区分类型和大小写。
4. MongoDB的文档不能有重复的键。
5. 文档的键是字符串。除了少数例外情况，键可以使用任意UTF-8字符。

文档键命名规范：

- 键不能含有\0 (空字符)。这个字符用来表示键的结尾。
- .和$有特别的意义，只有在特定环境下才能使用。
- 以下划线"_"开头的键是保留的(不是严格要求的)。 

（2）批量插入

语法：

```json
db.collection.insertMany(
	[ <document 1> , <document 2>, ... ],
	{ 
		writeConcern: <document>, 
		ordered: <boolean> 
	}
)
```

参数：

| **Parameter** | **Type** | **Description**                                              |
| ------------- | -------- | ------------------------------------------------------------ |
| document      | document | 要插入到集合中的文档或文档数组。（(json格式）                |
| writeConcern  | document | Optional. A document expressing the write concern. Omit to use the default write concern.Do not explicitly set the write concern for the operation if run in a transaction. To |
| ordered       | boolean  | 可选。一个布尔值，指定Mongod实例应执行有序插入还是无序插入。默认为true。 |

【示例】

批量插入多条文章评论：

```json
db.comment.insertMany([ 
    {
        "_id":"1",
        "articleid":"100001",
        "content":"我们不应该把清晨浪费在手机上，健康很重要，一杯温水幸福你我他。",
        "userid":"1002",
        "nickname":"相忘于江湖",
        "createdatetime":new Date("2019-08- 05T22:08:15.522Z"),
        "likenum":NumberInt(1000),
        "state":"1"
    }, 
    {
        "_id":"2",
        "articleid":"100001",
        "content":"我夏天空腹喝凉开水，冬天喝温开水",
        "userid":"1005",
        "nickname":"伊人憔悴",
        "createdatetime":new Date("2019-08-05T23:58:51.485Z"),
        "likenum":NumberInt(888),
        "state":"1"
    }, 
    {
        "_id":"3",
        "articleid":"100001",
        "content":"我一直喝凉开水，冬天夏天都喝。",
        "userid":"1004",
        "nickname":"杰克船长",
        "createdatetime":new Date("2019-08-06T01:05:06.321Z"),
        "likenum":NumberInt(666),
        "state":"1"
    }, 
    {
        "_id":"4",
        "articleid":"100001",
        "content":"专家说不能空腹吃饭，影响健康。",
        "userid":"1003",
        "nickname":"凯撒",
        "createdatetime":new Date("2019-08-06T08:18:35.288Z"),
        "likenum":NumberInt(2000),
        "state":"1"
    }, 
    {
        "_id":"5",
        "articleid":"100001",
        "content":"研究表明，刚烧开的水千万不能喝，因为烫嘴。",
        "userid":"1003",
        "nickname":"凯撒",
        "createdatetime":new Date("2019-08- 06T11:01:02.521Z"),
        "likenum":NumberInt(3000),
        "state":"1"
    } 
])
```

提示：

插入时指定了 _id ，则主键就是该值。

如果某条数据插入失败，将会终止插入，但已经插入成功的数据不会回滚掉。

因为批量插入由于数据较多容易出现失败，因此，可以使用try catch进行异常捕捉处理，测试的时候可以不处理。如（了解）：

```json
try {
    db.comment.insertMany([
    {
   		"_id":"1",
    	"articleid":"100001",
    	"content":"我们不应该把清晨浪费在手机上，健康很重要，一杯温水幸福你我 他。",
    	"userid":"1002",
    	"nickname":"相忘于江湖",
    	"createdatetime":new Date("2019-08- 05T22:08:15.522Z"),
		"likenum":NumberInt(1000),
		"state":"1"
	}, 
	{
        "_id":"2",
	    "articleid":"100001",
	    "content":"我夏天空腹喝凉开水，冬天喝温开水",
 	    "userid":"1005",
	    "nickname":"伊人憔悴",
 	    "createdatetime":new Date("2019-08-05T23:58:51.485Z"),
 	    "likenum":NumberInt(888),
 	    "state":"1"
    },
	{
        "_id":"3",
        "articleid":"100001",
        "content":"我一直喝凉开水，冬天夏天都喝。",
        "userid":"1004",
        "nickname":"杰克船长",
        "createdatetime":new Date("2019-08-06T01:05:06.321Z"),
        "likenum":NumberInt(666),
        "state":"1"
    }, 
	{
        "_id":"4",
        "articleid":"100001",
        "content":"专家说不能空腹吃饭，影响健康。",
        "userid":"1003",
        "nickname":"凯撒",
        "createdatetime":new Date("2019-08-06T08:18:35.288Z"),
        "likenum":NumberInt(2000),
        "state":"1"
    }, 
	{
        "_id":"5",
        "articleid":"100001"
        "content":"研究表明，刚烧开的水千万不能喝，因为烫嘴。",
        "userid":"1003",
        "nickname":"凯撒",
        "createdatetime":new Date("2019-08- 06T11:01:02.521Z"),
        "likenum":NumberInt(3000),
        "state":"1"
    } 
]); 
} catch (e)
{ 
    print (e);
}
```

####  **文档的基本查询**

查询数据的语法格式如下：

```
db.collection.find(<query>, [projection])
```

参数：

| **Parameter** | **Type** | **Description**                                              |
| ------------- | -------- | ------------------------------------------------------------ |
| `query`       | document | 可选。使用查询运算符指定选择筛选器。若要返回集合中的所有文档，请省略此参数或传递空文档`( {} )`。 |
| `projection`  | document | 可选。指定要在与查询筛选器匹配的文档中返回的字段（投影）。若要返回匹配文档中的所有字段，请省略此参数。 |

【示例】

（1）**查询所有**

如果我们要查询spit集合的所有文档，我们输入以下命令

```
db.comment.find()
或
db.comment.find({})
```

这里你会发现每条文档会有一个叫_id的字段，这个相当于我们原来关系数据库中表的主键，当你在插入文档记录时没有指定该字段，

MongoDB会自动创建，其类型是ObjectID类型。

如果我们在插入文档记录时指定该字段也可以，其类型可以是ObjectID类型，也可以是MongoDB支持的任意类型。

如果我想按一定条件来查询，比如我想查询userid为1003的记录，怎么办？很简单！只 要在fifind()中添加参数即可，参数也是json格式，如下：

```
db.comment.find({userid:'1003'})
```

如果你只需要返回符合条件的第一条数据，我们可以使用`findOne`命令来实现，语法和`find`一样。

如：查询用户编号是1003的记录，但只最多返回符合条件的第一条记录：

```
db.comment.findOne({userid:'1003'})
```

（2）**投影查询**（Projection Query）：

如果要查询结果返回部分字段，则需要使用投影查询（不显示所有字段，只显示指定的字段）。

如：查询结果只显示` _id、userid、nickname` :

```
db.comment.find({userid:"1003"},{userid:1,nickname:1}) 
{ "_id" : "4", "userid" : "1003", "nickname" : "凯撒" } 
{ "_id" : "5", "userid" : "1003", "nickname" : "凯撒" }
```

默认 `_id `会显示。

如：查询结果只显示 `、userid、nickname `，不显示` _id` ：

```
db.comment.find({userid:"1003"},{userid:1,nickname:1,_id:0})
{ "userid" : "1003", "nickname" : "凯撒" }
{ "userid" : "1003", "nickname" : "凯撒" }
```

再例如：查询所有数据，但只显示` _id、userid、nickname` :

```
>db.comment.find({},{userid:1,nickname:1})
```

#### **文档的更新**

更新文档的语法：

```json
db.collection.update(query, update, options) 
//或 
db.collection.update( 
    <query>, 
    <update>, 
    {
    	upsert: <boolean>, 
    	multi: <boolean>,
    	writeConcern: <document>,
    	collation: <document>, 
    	arrayFilters: [ <filterdocument1>, ... ], 
	hint: <document|string> // Available starting in MongoDB 4.2 
	} 
)
```

参数：

| **arameter** | **Type**             | **Description**                                              |
| ------------ | -------------------- | ------------------------------------------------------------ |
| `query`      | document             | 更新的选择条件。可以使用与fifind（）方法中相同的查询选择器，类似sql update查询内where后面的。。在3.0版中进行了更改：当使用upsert:true执行update（）时，如果查询使用点表示法在_id字段上指定条件，则MongoDB将拒绝插入新文档。 |
| `update`     | document or pipeline | 要应用的修改。该值可以是：包含更新运算符表达式的文档，或仅包含：对的替换文档，或在MongoDB 4.2中启动聚合管道。管道可以由以下阶段组成： |
| `upsert`     | boolean              | 可选。如果设置为true，则在没有与查询条件匹配的文档时创建新文档。默认值为false，如果找不到匹配项，则不会插入新文档。 |
| `multi`      | boolean              | 可选。如果设置为true，则更新符合查询条件的多个文档。如果设置为false，则更新一个文档。默认值为false。 |
| writeConcern | document             | 可选。表示写问题的文档。抛出异常的级别。                     |
| collation    | document             | 可选。指定要用于操作的校对规则。校对规则允许用户为字符串比较指定特定于语言的规则，例如字母大小写和重音标记的规则。 |
| arrayFilters | array                | 可选。一个筛选文档数组，用于确定要为数组字段上的更新操作修改哪些数组元素。 |
| hint         | Document or string   | 可选。指定用于支持查询谓词的索引的文档或字符串。该选项可以采用索引规范文档或索引名称字符串。如果指定的索引不存在，则说明操作错误。例如，请参阅版本4中的“为更新操作指定提示。 |

提示：

主要关注前四个参数即可。

【示例】

（1）**覆盖修改**

如果我们想修改_id为1的记录，点赞量为1001，输入以下语句：

```
db.comment.update({_id:"1"},{likenum:NumberInt(1001)})
```

执行后，我们会发现，这条文档除了likenum字段其它字段都不见了，

（2）**局部修改**

为了解决这个问题，我们需要使用修改器`$set`来实现，命令如下：

我们想修改_id为2的记录，浏览量为889，输入以下语句：

```
db.comment.update({_id:"2"},{$set:{likenum:NumberInt(889)}})
```

这样就OK啦。

（3）**批量修改**

更新所有用户为 1003 的用户的昵称为 凯撒大帝 。

```json
//默认只修改第一条数据
db.comment.update({userid:"1003"},{$set:{nickname:"凯撒2"}}) 
//修改所有符合条件的数据
db.comment.update({userid:"1003"},{$set:{nickname:"凯撒大帝"}},{multi:true})
```

提示：如果不加后面的参数，则只更新符合条件的第一条记录

（3）列值增长的修改

如果我们想实现对某列值在原有值的基础上进行增加或减少，可以使用 $inc 运算符来实现。

需求：对3号数据的点赞数，每次递增1

```json
db.comment.update({_id:"3"},{$inc:{likenum:NumberInt(1)}})
```

#### **删除文档**

删除文档的语法结构：

```
db.集合名称.remove(条件)
```

以下语句可以将数据全部删除，请慎用

```
db.comment.remove({})
```

如果删除_id=1的记录，输入以下语句

```
db.comment.remove({_id:"1"})
```

### **文档的分页查询**

#### **统计查询**

统计查询使用count()方法，语法如下：

```
db.collection.count(query, options)
```

参数：

| **Parameter** | **Type** | **Description**                |
| ------------- | -------- | ------------------------------ |
| `query`       | document | 查询选择条件。                 |
| `options`     | document | 可选。用于修改计数的额外选项。 |

提示：

可选项暂时不使用。

【示例】

（1）统计所有记录数：

统计comment集合的所有的记录数：

```
db.comment.count()
```

（2）按条件统计记录数：

例如：统计userid为1003的记录条数

```
db.comment.count({userid:"1003"})
```

提示：

默认情况下 count() 方法返回符合条件的全部记录条数。

#### **分页列表查询**

可以使用limit()方法来读取指定数量的数据，使用skip()方法来跳过指定数量的数据。

基本语法如下所示：

```
db.COLLECTION_NAME.find().limit(NUMBER).skip(NUMBER)
```

如果你想返回指定条数的记录，可以在fifind方法后调用limit来返回结果(TopN)，默认值20，例如：

```
db.comment.find().limit(3)
```

skip方法同样接受一个数字参数作为跳过的记录条数。（前N个不要）,默认值是0

```
db.comment.find().skip(3)
```

分页查询：需求：每页2个，第二页开始：跳过前两条数据，接着值显示3和4条数据

```
//第一页 db.comment.find().skip(0).limit(2) 
//第二页 db.comment.find().skip(2).limit(2) 
//第三页 db.comment.find().skip(4).limit(2)
```

#### **排序查询**

sort() 方法对数据进行排序，sort() 方法可以通过参数指定排序的字段，并使用 1 和 -1 来指定排序的方式，其中 1 为升序排列，而 -1 是用于降序排列。

语法如下所示：

```
db.COLLECTION_NAME.find().sort({KEY:1}) 
或
db.集合名称.find().sort(排序方式)
```

例如：

对userid降序排列，并对访问量进行升序排列

```
db.comment.find().sort({userid:-1,likenum:1})
```

提示：

skip(), limilt(), sort()三个放在一起执行的时候，执行的顺序是先 sort(), 然后是 skip()，最后是显示的 limit()，和命令编写顺序无关。

### **文档的更多查询**

#### **正则的复杂条件查询**

MongoDB的模糊查询是通过**正则表达式**的方式实现的。格式为：

```
db.collection.find({field:/正则表达式/})
或
db.集合.find({字段:/正则表达式/})
```

提示：正则表达式是js的语法，直接量的写法。

例如，我要查询评论内容包含“开水”的所有文档，代码如下：

```
db.comment.find({content:/开水/})
```

如果要查询评论的内容中以“专家”开头的，代码如下：

```
db.comment.find({content:/^专家/})
```

#### **比较查询**

<, <=, >, >= 这个操作符也是很常用的，格式如下:

```
db.集合名称.find({ "field" : { $gt: value }}) // 大于: field > value 
db.集合名称.find({ "field" : { $lt: value }}) // 小于: field < value 
db.集合名称.find({ "field" : { $gte: value }}) // 大于等于: field >= value 
db.集合名称.find({ "field" : { $lte: value }}) // 小于等于: field <= value 
db.集合名称.find({ "field" : { $ne: value }}) // 不等于: field != value
```

示例：查询评论点赞数量大于700的记录

```
db.comment.find({likenum:{$gt:NumberInt(700)}})
```

#### **包含查询**

包含使用$in操作符。 示例：查询评论的集合中userid字段包含1003或1004的文档

```
db.comment.find({userid:{$in:["1003","1004"]}})
```

不包含使用$nin操作符。 示例：查询评论集合中userid字段不包含1003和1004的文档

```bash
db.comment.find({userid:{$nin:["1003","1004"]}})
```

#### **条件连接查询**

 我们如果需要查询同时满足两个以上条件，需要使用$and操作符将条件进行关联。（相 当于SQL的and） 格式为：

```
$and:[ { },{ },{ } ]
```

示例：查询评论集合中likenum大于等于700 并且小于2000的文档：

```
db.comment.find({$and:[{likenum:{$gte:NumberInt(700)}},{likenum:{$lt:NumberInt(2000)}}]})
```

如果两个以上条件之间是或者的关系，我们使用 操作符进行关联，与前面 and的使用方式相同 格式为：

```
$or:[ { },{ },{ } ]
```

示例：查询评论集合中userid为1003，或者点赞数小于1000的文档记录

```
db.comment.find({$or:[ {userid:"1003"} ,{likenum:{$lt:1000} }]})
```

### **常用命令小结**

- 选择切换数据库：`use articledb `
- 插入数据：`db.comment.insert({bson数据}) `
- 查询所有数据：`db.comment.find(); `
- 条件查询数据：`db.comment.find({条件}) `
- 查询符合条件的第一条记录：`db.comment.findOne({条件}) `
- 查询符合条件的前几条记录：`db.comment.find({条件}).limit(条数) `
- 查询符合条件的跳过的记录：`db.comment.find({条件}).skip(条数) `
- 修改数据：`db.comment.update({条件},{修改后的数据}) 或db.comment.update({条件},{$set:{要修改部分的字段:数据}) `
- 修改数据并自增某字段值：`db.comment.update({条件},{$inc:{自增的字段:步进值}}) `
- 删除数据：`db.comment.remove({条件}) `
- 统计查询：`db.comment.count({条件}) `
- 模糊查询：`db.comment.find({字段名:/正则表达式/}) `
- 条件比较运算：`db.comment.find({字段名:{$gt:值}}) `
- 包含查询：`db.comment.find({字段名:{$in:[值1，值2]}})`或`db.comment.find({字段名:{$nin:[值1，值2]}}) `
- 条件连接查询：`db.comment.find({$and:[{条件1},{条件2}]})`或`db.comment.find({$or:[{条件1},{条件2}]})`

------

# **索引** **-Index**

### **概述**

索引支持在MongoDB中高效地执行查询。如果没有索引，MongoDB必须执行全集合扫描，即扫描集合中的每个文档，以选择与查询语句

匹配的文档。这种扫描全集合的查询效率是非常低的，特别在处理大量的数据时，查询可以要花费几十秒甚至几分钟，这对网站的性能是非

常致命的。

如果查询存在适当的索引，MongoDB可以使用该索引限制必须检查的文档数。

索引是特殊的数据结构，它以易于遍历的形式存储集合数据集的一小部分。索引存储特定字段或一组字段的值，按字段值排序。索引项的排

序支持有效的相等匹配和基于范围的查询操作。此外，MongoDB还可以使用索引中的排序返回排序结果。

官网文档：https://docs.mongodb.com/manual/indexes/

了解：

MongoDB索引使用B树数据结构（确切的说是B-Tree，MySQL是B+Tree）

### **索引的类型**

#### **单字段索引**

MongoDB支持在文档的单个字段上创建用户定义的升序/降序索引，称为**单字段索引**（Single Field Index）。

对于单个字段索引和排序操作，索引键的排序顺序（即升序或降序）并不重要，因为MongoDB可以在任何方向上遍历索引。

![image-20220623160557651](C:\Users\yumo\AppData\Roaming\Typora\typora-user-images\image-20220623160557651.png)

#### **复合索引**

MongoDB还支持多个字段的用户定义索引，即**复合索引**（Compound Index）。

复合索引中列出的字段顺序具有重要意义。例如，如果复合索引由 { userid: 1, score: -1 } 组成，则索引首先按userid正序排序，然后

在每个userid的值内，再在按score倒序排序。

![image-20220623160616296](C:\Users\yumo\AppData\Roaming\Typora\typora-user-images\image-20220623160616296.png)

#### **其他索引**

地理空间索引（Geospatial Index）、文本索引（Text Indexes）、哈希索引（Hashed Indexes）。

- **地理空间索引**（Geospatial Index）

为了支持对地理空间坐标数据的有效查询，MongoDB提供了两种特殊的索引：返回结果时使用平面几何的二维索引和返回结果时使用球面

几何的二维球面索引。

- **文本索引**（Text Indexes）

MongoDB提供了一种文本索引类型，支持在集合中搜索字符串内容。这些文本索引不存储特定于语言的停止词（例如“the”、“a”、“or”），

而将集合中的词作为词干，只存储根词。

- **哈希索引**（Hashed Indexes）

为了支持基于散列的分片，MongoDB提供了散列索引类型，它对字段值的散列进行索引。这些索引在其范围内的值分布更加随机，但只支

持相等匹配，不支持基于范围的查询。

### **索引的管理操作**

#### **索引的查看**

说明：

返回一个集合中的所有索引的数组。

语法：

```
db.collection.getIndexes()
```

提示：该语法命令运行要求是MongoDB 3.0+

【示例】

查看comment集合中所有的索引情况

```json
> db.comment.getIndexes() 
[ 
    { 
        "v" : 2, 
        "key" : {
            "_id" : 1 
        },
        "name" : "_id_", 
        "ns" : "articledb.comment" 
    } 
]
```

结果中显示的是默认 _id 索引。

默认_id索引：

MongoDB在创建集合的过程中，在 _id 字段上创建一个唯一的索引，默认名字为 _id_ ，该索引可防止客户端插入两个具有相同值的文

档，您不能在_id字段上删除此索引。

注意：该索引是唯一索引，因此值不能重复，即 _id 值不能重复的。在分片集群中，通常使用 _id 作为片键。

#### **索引的创建**

说明：

在集合上创建索引。

语法：

```
db.collection.createIndex(keys, options)
```

参数：

| **Parameter** | **Type** | **Description**                                              |
| ------------- | -------- | ------------------------------------------------------------ |
| `keys`        | document | 包含字段和值对的文档，其中字段是索引键，值描述该字段的索引类型。对于字段上的升序索引，请 |
| `options`     | document | 指定值1；对于降序索引，请指定值-1。比如： {字段:1或-1} ，其中1 为指定按升序创建索引，如果你可选。包含一组控制索引创建的选项的文档。有关详细信息，请参见选项详情列表。 |

options（更多选项）列表：

| Parameter          | Type               | Description                                                  |
| ------------------ | ------------------ | ------------------------------------------------------------ |
| background         | Boolean            | 建索引过程会阻塞其它数据库操作，background可指定以后台方式创建索引，即增加"background" 可选参数。 "background" 默认值为**false**。 |
| unique             | Boolean            | 建立的索引是否唯一。指定为true创建唯一索引。默认值为**false** |
| name               | string             | 索引的名称。如果未指定，MongoDB的通过连接索引的字段名和排序顺序生成一个索引名称。 |
| dropDups           | Boolean            | **3.0+**版本已废弃。在建立唯一索引时是否删除重复记录,指定 true 创建唯一索引。默认值为**false** |
| sparse             | Boolean            | 对文档中不存在的字段数据不启用索引；这个参数需要特别注意，如果设置为true的话，在索引字段中不会查询出不包含对应字段的文档.。默认值为 **false**. |
| expireAfterSeconds | integer            | 指定一个以秒为单位的数值，完成 TTL设定，设定集合的生存时间。 |
| v                  | index<br />version | 索引的版本号。默认的索引版本取决于mongod创建索引时运行的版本。 |
| weights            | document           | 索引权重值，数值在 1 到 99,999 之间，表示该索引相对于其他索引字段的得分权重。 |
| default_language   | string             | 对于文本索引，该参数决定了停用词及词干和词器的规则的列表。 默认为英语 |
| language_override  | string             | 对于文本索引，该参数指定了包含在文档中的字段名，语言覆盖默认的language，默认值为language |

提示：

注意在 3.0.0 版本前创建索引方法为 db.collection.ensureIndex() ，之后的版本使用了 db.collection.createIndex() 方法，

ensureIndex() 还能用，但只是 createIndex() 的别名。

【示例】

（1）单字段索引示例：对 userid 字段建立索引：

```json
> db.comment.createIndex({userid:1}) 
{ 
    "createdCollectionAutomatically" : false,
    "numIndexesBefore" : 1,
    "numIndexesAfter" : 2, 
    "ok" : 1 
}
```

参数1：按升序创建索引

可以查看一下：

```json
> db.comment.getIndexes() [
    {
        "v" : 2, 
        "key" : {"_id" : 1 },
        "name" : "_id_", 
        "ns" : "articledb.comment" 
    },
    {
        "v" : 2, 
     	"key" : {"userid" : 1 },
     	"name" : "userid_1", 
     	"ns" : "articledb.comment" 
    } 
]
```

索引名字为`userid_1`

（2）复合索引：对` userid`和` nickname` 同时建立复合（Compound）索引：

```json
> db.comment.createIndex({userid:1,nickname:-1}) 
{ 
    "createdCollectionAutomatically" : false,
    "numIndexesBefore" : 2, 
    "numIndexesAfter" : 3, 
    "ok" : 1 
}
```

查看一下索引：

```json
> db.comment.getIndexes() 
[ 
    {
        "v" : 2, 
        "key" : {"_id" : 1 },
        "name" : "_id_",
        "ns" : "articledb.comment" 
    },
    {
        "v" : 2, 
        "key" : {"userid" : 1 },
        "name" : "userid_1",
        "ns" : "articledb.comment" 	 },
    {
        "v" : 2, 
        "key" : {"userid" : 1, "nickname" : -1 },
        "name" : "userid_1_nickname_-1",
        "ns" : "articledb.comment" 
    } 
]
```

#### **索引的移除**

说明：可以移除指定的索引，或移除所有索引

一、指定索引的移除

语法：

```
db.collection.dropIndex(index)
```

参数：

| **Parameter** | **Type**           | **Description**                                              |
| ------------- | ------------------ | ------------------------------------------------------------ |
| `index`       | string or document | 指定要删除的索引。可以通过索引名称或索引规范文档指定索引。若要删除文本索引，请指定索引名称。 |

【示例】

删除 comment 集合中 userid 字段上的升序索引：

```json
> db.comment.dropIndex({userid:1}) 
{ 
    "nIndexesWas" : 3,
    "ok" : 1 
}
```

查看已经删除了。

二、所有索引的移除

语法：

```
db.collection.dropIndexes()
```

【示例】

删除 spit 集合中所有索引。

```json
> db.comment.dropIndexes()
{ 
    "nIndexesWas" : 2,
    "msg" : "non-_id indexes dropped for collection",
    "ok" : 1
}
```

提示： _id 的字段的索引是无法删除的，只能删除非 _id 字段的索引。

### **索引的使用**

#### **执行计划**

分析查询性能（Analyze Query Performance）通常使用执行计划（解释计划、Explain Plan）来查看查询的情况，如查询耗费的时间、是

否基于索引查询等。

那么，通常，我们想知道，建立的索引是否有效，效果如何，都需要通过执行计划查看。

语法：

```
db.collection.find(query,options).explain(options)
```

【示例】

查看根据userid查询数据的情况：

```json
> db.comment.find({userid:"1003"}).explain() 
{ 
    "queryPlanner" : { 
        "plannerVersion" : 1,
        "namespace" : "articledb.comment", 
        "indexFilterSet" : false,
        "parsedQuery" : {
            "userid" : { 
                "$eq" : "1003" 
            } 
        },
        "winningPlan" : { 
            "stage" : "COLLSCAN", 
            "filter" : { 
                "userid" : { 
                    "$eq" : "1003" 
                } 
            },
            "direction" : "forward" 
        },
        "rejectedPlans" : [ ] 
    },
    "serverInfo" : { 
        "host" : "9ef3740277ad", 
        "port" : 27017, 
        "version" : "4.0.10",
        "gitVersion" : "c389e7f69f637f7a1ac3cc9fae843b635f20b766"
    },
    "ok" : 1 
}
```

关键点看：` "stage" : "COLLSCAN"`, 表示全集合扫描

下面对userid建立索引

```json
> db.comment.createIndex({userid:1}) 
{ 
    "createdCollectionAutomatically" : false,
    "numIndexesBefore" : 1,
    "numIndexesAfter" : 2, 
    "ok" : 1 
}
```

再次查看执行计划：

```json
> db.comment.find({userid:"1013"}).explain() 
{ 
    "queryPlanner" : { 
        "plannerVersion" : 1, 
        "namespace" : "articledb.comment",
        "indexFilterSet" : false, 
        "parsedQuery" : { 
            "userid" : { 
                "$eq" : "1013" 
            } 
        },
        "winningPlan" : {
            "stage" : "FETCH", 
            "inputStage" : { 
                "stage" : "IXSCAN", 
                "keyPattern" : {
                    "userid" : 1 
                },
                "indexName" : "userid_1",
                "isMultiKey" : false,
                "multiKeyPaths" : {
                    "userid" : [ ] 
                },
                "isUnique" : false,
                "isSparse" : false, 
                "isPartial" : false,
                "indexVersion" : 2,
                "direction" : "forward",
                "indexBounds" : {
                    "userid" : [
                        "[\"1013\", \"1013\"]" 
                    ]
                }
            } 
        },
        "rejectedPlans" : [ ] 
    },
    "serverInfo" : {
        "host" : "9ef3740277ad",
        "port" : 27017, 
        "version" : "4.0.10", 
        "gitVersion" : "c389e7f69f637f7a1ac3cc9fae843b635f20b766" },
    "ok" : 1 
}
```

关键点看：` "stage" : "IXSCAN" `,基于索引的扫描

#### **涵盖的查询**

![image-20220623162355573](C:\Users\yumo\AppData\Roaming\Typora\typora-user-images\image-20220623162355573.png)

【示例】

```json
> db.comment.find({userid:"1003"},{userid:1,_id:0}) 
{ "userid" : "1003" } 
{ "userid" : "1003" }
```

```json
> db.comment.find({userid:"1003"},{userid:1,_id:0}).explain()
{ 
    "queryPlanner" : {
        "plannerVersion" : 1,
        "namespace" : "articledb.comment",
        "indexFilterSet" : false, 
        "parsedQuery" : {
            "userid" : { 
                "$eq" : "1003"
            } 
        },
        "winningPlan" : {
            "stage" : "PROJECTION", 
            "transformBy" : {
                "userid" : 1, 
                "_id" : 0
            },
            "inputStage" : { 
                "stage" : "IXSCAN",
                "keyPattern" : {
                    "userid" : 1 
                },
                "indexName" : "userid_1", 
                "isMultiKey" : false,
                "multiKeyPaths" : {
                    "userid" : [ ] 
                },
                "isUnique" : false,
                "isSparse" : false,
                "isPartial" : false,
                "indexVersion" : 2,
                "direction" : "forward", 
                "indexBounds" : { 
                    "userid" : [
                        "[\"1003\", \"1003\"]" 
                    ]
                } 
            }
        },
        "rejectedPlans" : [ ] 
    },
    "serverInfo" : {
        "host" : "bobohost.localdomain",
        "port" : 27017,
        "version" : "4.0.10", 
        "gitVersion" : "c389e7f69f637f7a1ac3cc9fae843b635f20b766" },
    "ok" : 1
}
```

# **文章评论**

### **需求分析**

某头条的文章评论业务如下：

![image-20220623162800601](C:\Users\yumo\AppData\Roaming\Typora\typora-user-images\image-20220623162800601.png)

文章示例参考：早晨空腹喝水，是对还是错？https://www.toutiao.com/a6721476546088927748/

需要实现以下功能：

1. 基本增删改查API
2. 根据文章id查询评论
3. 评论点赞

### **表结构分析**

数据库：articledb

| **专栏文章评论** | **comment**    |                  |                           |
| ---------------- | -------------- | ---------------- | ------------------------- |
| 字段名称         | 字段含义       | 字段类型         | 备注                      |
| _id              | ID             | ObjectId或String | Mongo的主键的字段         |
| articleid        | 文章ID         | String           |                           |
| content          | 评论内容       | String           |                           |
| userid           | 评论人ID       | String           |                           |
| nickname         | 评论人昵称     | String           |                           |
| createdatetime   | 评论的日期时间 | Date             |                           |
| likenum          | 点赞数         | Int32            |                           |
| replynum         | 回复数         | Int32            |                           |
| state            | 状态           | String           | 0：不可见；1：可见；      |
| parentid         | 上级ID         | String           | 如果为0表示文章的顶级评论 |

### **技术选型**

#### **mongodb-driver** **（了解）**

mongodb-driver是mongo官方推出的java连接mongoDB的驱动包，相当于JDBC驱动。

官方驱动说明和下载：http://mongodb.github.io/mongo-java-driver/

官方驱动示例文档：http://mongodb.github.io/mongo-java-driver/3.8/driver/getting-started/quick-start/

####  **SpringDataMongoDB**

SpringData家族成员之一，用于操作MongoDB的持久层框架，封装了底层的mongodb-driver。

官网主页： https://projects.spring.io/spring-data-mongodb/

### **文章微服务模块搭建**

（1）搭建项目工程article，pom.xml引入依赖：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>article</artifactId>
    <version>1.0-SNAPSHOT</version>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.6.7</version>
    </parent>
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-mongodb</artifactId>
        </dependency>
    </dependencies>
</project>
```

（2）创建application.yml

```yml
spring:
  #数据源配置
  data:
    mongodb:
      # 主机地址
      host: 192.168.40.134
      # 数据库
      database: articledb
      # 默认端口是27017
      port: 27017
      #也可以使用uri连接
      #uri: mongodb://192.168.40.134:27017/articledb
```

（3）创建启动类

cn.itcast.article.ArticleApplication

```java
package com.yumo.article;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * @Author: yumo
 * @Description: TODO
 * @DateTime: 2022/6/23 16:49
 **/
@SpringBootApplication
public class ArticleApplication {
    public static void main(String[] args) {
        SpringApplication.run(ArticleApplication.class,args);
    }
}
```

（4）启动项目，看是否能正常启动，控制台没有错误。

### **文章评论实体类的编写**

创建实体类 创建包cn.itcast.article，包下建包po用于存放实体类，创建实体类

cn.itcast.article.po.Comment

```java
package com.yumo.article.pojo;

import lombok.Data;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * @Author: yumo
 * @Description: 文章评论实体类
 * @DateTime: 2022/6/23 16:52
 * 把一个java类声明为mongodb的文档，可以通过collection参数指定这个类对应的文档。
 * @Document(collection="mongodb 对应 collection 名")
 * 若未加 @Document ，该 bean save 到 mongo 的 comment collection
 * 若添加 @Document ，则 save 到 comment collection
 * @CompoundIndex( def = "{'userid': 1, 'nickname': -1}") 复合索引
 **/
@Data
@ToString
@Document(collection="comment")//可以省略，如果省略，则默认使用类名小写映射集合
//@CompoundIndex( def = "{'userid': 1, 'nickname': -1}")
public class Comment implements Serializable {
    /**
     * @Id 主键标识，该属性的值会自动对应mongodb的主键字段"_id"，如果该属性名就叫“id”,则该注解可以省略，否则必须写
     */
    @Id
    private String id;//主键
    /**
     * @Field("content") 该属性对应mongodb的字段的名字，如果一致，则无需该注解
     */
    @Field("content")
    private String content;//吐槽内容

    private Date publishtime;//发布日期
    /**
     * @Indexed  添加了一个单字段的索引
     */
    @Indexed
    private String userid;//发布人ID
    private String nickname;//昵称
    private LocalDateTime createdatetime;//评论的日期时间
    private Integer likenum;//点赞数
    private Integer replynum;//回复数
    private String state;//状态
    private String parentid;//上级ID
    private String articleid;
}
```

说明：

索引可以大大提升查询效率，一般在查询字段上添加索引，索引的添加可以通过Mongo的命令来添加，也可以在Java的实体类中通过注解添加。

1）单字段索引注解@Indexed

org.springframework.data.mongodb.core.index.Indexed.class

声明该字段需要索引，建索引可以大大的提高查询效率。

Mongo命令参考：

```
db.comment.createIndex({"userid":1})
```

2）复合索引注解@CompoundIndex

org.springframework.data.mongodb.core.index.CompoundIndex.class

复合索引的声明，建复合索引可以有效地提高多字段的查询效率。

Mongo命令参考：

```
db.comment.createIndex({"userid":1,"nickname":-1})
```

### **文章评论的基本增删改查**

（1）创建数据访问接口 cn.itcast.article包下创建dao包，包下创建接口

cn.itcast.article.dao.CommentRepository

```java
package com.yumo.article.dao;

import com.yumo.article.pojo.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * @Author: yumo
 * @Description: 评论 的持久层接口
 * @DateTime: 2022/6/23 17:34
 **/
public interface CommentRepository extends MongoRepository<Comment,String> {
}
```

（2）创建业务逻辑类 cn.itcast.article包下创建service包，包下创建类

cn.itcast.article.service.CommentService

```java
package com.yumo.article.service;

import com.yumo.article.dao.CommentRepository;
import com.yumo.article.pojo.Comment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @Author: yumo
 * @Description: TODO
 * @DateTime: 2022/6/23 17:35
 **/
@Service
public class CommentService {
    /**
     * 注入dao
     */
    @Autowired
    private CommentRepository commentRepository;

    /**
     * 保存一个评论
     * @param comment
     */
    public void saveComment(Comment comment){
        //如果需要自定义主键，可以在这里指定主键；如果不指定主键，MongoDB会自动生成主键
        //设置一些默认初始值。。。
        //调用dao
        commentRepository.save(comment);
    }
    /**
     * 更新评论
     * @param comment
     */
    public void updateComment(Comment comment){
        //调用dao
        commentRepository.save(comment);
    }
    /**
     * 根据id删除评论
     * @param id
     */
    public void deleteCommentById(String id){
        //调用dao
        commentRepository.deleteById(id);
    }
    /**
     * 查询所有评论
     * @return
     */
    public List<Comment> findCommentList(){
        //调用dao
        return commentRepository.findAll();
    }
    /**
     * 根据id查询评论
     * @param id
     * @return
     */
    public Comment findCommentById(String id){
        //调用dao
        return commentRepository.findById(id).get();
    }

}
```

（3）新建Junit测试类，测试保存和查询所有：

cn.itcast.article.service.CommentServiceTest

```java
package com.yumo.article.service;

import com.yumo.article.ArticleApplication;
import com.yumo.article.pojo.Comment;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDateTime;
import java.util.List;

/**
 * @Author: yumo
 * @Description: TODO
 * @DateTime: 2022/6/23 17:40
 **/
//SpringBoot的Junit集成测试
@RunWith(SpringRunner.class)
//SpringBoot的测试环境初始化，参数：启动类
@SpringBootTest(classes = ArticleApplication.class)
public class CommentServiceTest {

    //注入Service
    @Autowired
    private CommentService commentService;

    /**
     * 保存一个评论
     */
    @Test
    public void testSaveComment(){
        Comment comment = new Comment();
        comment.setArticleid("100000");
        comment.setContent("测试添加的数据");
        comment.setCreatedatetime(LocalDateTime.now());
        comment.setUserid("1003");
        comment.setNickname("凯撒大帝");
        comment.setState("1");
        comment.setLikenum(0);
        comment.setReplynum(0);

        commentService.saveComment(comment);
    }
    /**
     * 查询所有数据
     */
    @Test
    public void testFindAll(){
        List<Comment> commentList = commentService.findCommentList();
        System.out.println(commentList);
    }

    /**
     * 测试根据id查询
     */
    @Test
    public void testFindCommentById(){
        Comment comment = commentService.findCommentById("62b437d573b9462b041ef12b");
        System.out.println(comment);
    }

}
```

添加结果：

### **根据上级** **ID** **查询文章评论的分页列表**

（1）CommentRepository新增方法定义

```java
Page<Comment> findByParentid(String parentid, Pageable pageable);
```

（2）CommentService新增方法

```java
 /**
     * 根据父id查询分页列表
     * @param parentid
     * @param page
     * @param size
     * @return
     */
    public Page<Comment> findCommentListByParentId(String parentid,int page,int size){
        return commentRepository.findByParentid(parentid, PageRequest.of(page-1, size));
    }
```

（3）junit测试用例：

cn.itcast.article.service.CommentServiceTest

```java
@Test
public void testFindCommentListByParentId(){
    Page<Comment> commentListByParentId = commentService.findCommentListByParentId("3", 1, 2);
    System.out.println(commentListByParentId.getTotalElements());
    System.out.println(commentListByParentId.getContent());
}
```

（4）测试

使用compass快速插入一条测试数据，数据的内容是对3号评论内容进行评论。

**![image-20220623180902236](C:\Users\yumo\AppData\Roaming\Typora\typora-user-images\image-20220623180902236.png)**

执行测试，结果：

```
----总记录数：1 ----当前页数据：[Comment{id='33', content='你年轻，火力大', publishtime=null, userid='1003', nickname='凯撒大帝', createdatetime=null, likenum=null, replynum=null, state='null', parentid='3', articleid='100001'}]
```

### **MongoTemplate** **实现评论点赞**

我们看一下以下点赞的临时示例代码： CommentService 新增updateThumbup方法

```java
/**
* 点赞-效率低 
* @param id 
*/ 
public void updateCommentThumbupToIncrementingOld(String id){ 
    Comment comment = CommentRepository.findById(id).get();
    comment.setLikenum(comment.getLikenum()+1);
    CommentRepository.save(comment); 
}
```

以上方法虽然实现起来比较简单，但是执行效率并不高，因为我只需要将点赞数加1就可以了，没必要查询出所有字段修改后再更新所有字

段。(蝴蝶效应)

我们可以使用MongoTemplate类来实现对某列的操作。 （1）修改CommentService

```java
/**
* 点赞数+1
* @param id
*/
public void updateCommentLikeNum(String id){
    //查询对象
    Query query = Query.query(Criteria.where("_id").is(id));
    //更新对象
    Update update = new Update();
    //局部更新，相当于$set
    //        update.set(key,value);
    update.inc("likenum");
    /**
    * 参数1：查询对象
    * 参数2：更新对象
    * 参数3：集合的名字或实体类的类型 Comment.class
    */
    mongoTemplate.updateFirst(query,update,"comment");
}
```

（2）测试用例：

cn.itcast.article.service.CommentServiceTest

```java
@Test
public void testUpdateCommentLikenum(){
    // 对3号文档的点赞数+1
    commentService.updateCommentLikeNum("3");
}
```

执行测试用例后，发现点赞数+1了：
