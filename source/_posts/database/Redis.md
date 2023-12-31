---
title: Redis基础&高可用
date: 2022-05-06 16:51:33
tags:
- 后端
- Redis
- Database
- 中间件
- 缓存
categories:
- Database
---

# NoSQL

## 概述

**NoSQL（Not Only SQL）**，意为“不仅仅是SQL”，泛指**非关系形的数据库**。

NoSQL不依赖业务逻辑方式存储，而以简单的**key-value**模式存储，因此大大的增加了数据库的扩展能力

- 不遵循SQL标准
- 不支持ACID（原子性、一致性、隔离性、持久性）
- 远超于SQL的性能

### 适用场景

- 对数据高并发的读写
- 海量数据的读写
- 对数据高可扩展性的读写

### 不适用场景

- 需要事务支持
- 基于sql的结构化查询存储，处理复杂的关系，需要即席查询
- 用不着sql的和用了sql也不行的情况，考虑用NoSQL

# Redis概述与安装

## 概述

- Redis是一个**开源**的**key-value**存储系统
- 和Memcached类似，它支持存储的value类型相对更多，包括**string**、**list**、**set**、**zset**和**hash**
- 这些数据类型都支持**push/pop**、**add/remove**及取交集并集和差集及更丰富的操作，而且这些操作都是**原子性**的
- 在此基础上，Redis支持各种不同方式的**排序**
- 与memcache一样，为了保证效率，数据都是**缓存在内存**中
- 区别是Redis会**周期性**的把更新的**数据写入磁盘**或者把修改操作写入追加的记录文件
- 并且在此基础上实现了**master-slave（主从）**同步

### 介绍

- 端口为6379
- 默认16个数据库，类似数组下标从0开始，初始默认使用0号库
- 使用命令`select <dbid>`来切换数据库。如：`select 8`
- 统一密码管理，所有库相同密码
- dbsize查看当前数据库的key的数量
- flushdb清空当前库
- flushall通杀所有库

Redis是**单线程**+**多路IO复用**技术

多路复用：是指使用一个线程来检查多个文件描述符（Socket）的就绪状态，比如调用select和poll函数，传入多个文件描述符，如果有一个文件描述符就绪，则返回；否则阻塞直到超时。得到就绪状态后进行真正的操作可以在同一个线程里执行，也可以启动线程执行（比如使用线程池）

**串行**  VS  **多线程+锁**（memcache）  VS   **单线程+多路IO复用**（Redis）

与Memcache的不同：

- 支持多数据类型
- 支持持久化
- 单线程+多路IO复用

### 应用场景

**配合关系型数据库做高速缓存**

- 高频次，热门访问的数据，降低数据量IO
- 分布式架构，做session共享

**多样的数据结构存储持久化数据**

- 最新N个数据			                           通过list实现按自然时间排序的数据
- 排行榜，Top N                                   通过zset（有序集合）
- 时效性的数据，比如手机验证码       Expire 过期
- 计数器，秒杀                                     原子性，自增方法INCR、DECR
- 去除大量数据中的重复数据              利用set集合
- 构建队列                                             利用list集合
- 发布订阅消息系统                              pub/sub 模式

## 安装

centos7下输入以下命令一键安装docker

官方安装指南

[Docker安装]: https://docs.docker.com/get-docker/

```shell
$ curl -fsSL get.docker.com -o get-docker.sh
$ sudo sh get-docker.sh --mirror Aliyun
```

使用以下命令在Docker Hub中搜索redis仓库

```shell
$ docker search redis
```

并拉取镜像

```shell
$ docker pull redis
```

完成后在根目录`/`下创建配置文件

```shell
$ mkdir conf
$ cd conf
$ vim redis.conf
```

修改redis.conf

```
protected-mode no
requirepass 你的redis密码
```

运行redis容器

```shell
$ docker pull redis

docker run -p 6379:6379 --name redis -v $PWD/conf/redis.conf:/etc/redis/redis.conf -v $PWD/data:/redis/data -d redis redis-server /etc/redis/redis.conf

#参数说明
-p 6379:6379：将容器的 6379 端口映射到主机的 6379 端口(第一个物理机端口，第二个容器端口)。
-v $PWD/conf/redis.conf:/etc/redis/redis.conf：映射配置文件。
-v $PWD/data:/redis/data：映射数据文件。
--requirepass "sast_forever"：redis连接密码。
-d: 后台运行容器，并返回容器ID
redis-server /etc/redis/redis.conf：使用指定的配置文件启动redis
```

# 常用五大数据类型

## 键（key）

### 常用命令

下表给出了与 Redis 键相关的基本命令：

| 序号 | 命令及描述                                                   |
| :--- | :----------------------------------------------------------- |
| 1    | [DEL key](https://www.runoob.com/redis/keys-del.html) 该命令用于在 key 存在时删除 key。 |
| 2    | [DUMP key](https://www.runoob.com/redis/keys-dump.html) 序列化给定 key ，并返回被序列化的值。 |
| 3    | [EXISTS key](https://www.runoob.com/redis/keys-exists.html) 检查给定 key 是否存在。 |
| 4    | [EXPIRE key](https://www.runoob.com/redis/keys-expire.html) seconds 为给定 key 设置过期时间，以秒计。 |
| 5    | [EXPIREAT key timestamp](https://www.runoob.com/redis/keys-expireat.html) EXPIREAT 的作用和 EXPIRE 类似，都用于为 key 设置过期时间。 不同在于 EXPIREAT 命令接受的时间参数是 UNIX 时间戳(unix timestamp)。 |
| 6    | [PEXPIRE key milliseconds](https://www.runoob.com/redis/keys-pexpire.html) 设置 key 的过期时间以毫秒计。 |
| 7    | [PEXPIREAT key milliseconds-timestamp](https://www.runoob.com/redis/keys-pexpireat.html) 设置 key 过期时间的时间戳(unix timestamp) 以毫秒计 |
| 8    | [KEYS pattern](https://www.runoob.com/redis/keys-keys.html) 查找所有符合给定模式( pattern)的 key 。 |
| 9    | [MOVE key db](https://www.runoob.com/redis/keys-move.html) 将当前数据库的 key 移动到给定的数据库 db 当中。 |
| 10   | [PERSIST key](https://www.runoob.com/redis/keys-persist.html) 移除 key 的过期时间，key 将持久保持。 |
| 11   | [PTTL key](https://www.runoob.com/redis/keys-pttl.html) 以毫秒为单位返回 key 的剩余的过期时间。 |
| 12   | [TTL key](https://www.runoob.com/redis/keys-ttl.html) 以秒为单位，返回给定 key 的剩余生存时间(TTL, time to live)。 |
| 13   | [RANDOMKEY](https://www.runoob.com/redis/keys-randomkey.html) 从当前数据库中随机返回一个 key 。 |
| 14   | [RENAME key newkey](https://www.runoob.com/redis/keys-rename.html) 修改 key 的名称 |
| 15   | [RENAMENX key newkey](https://www.runoob.com/redis/keys-renamenx.html) 仅当 newkey 不存在时，将 key 改名为 newkey 。 |
| 16   | [SCAN cursor [MATCH pattern\] [COUNT count]](https://www.runoob.com/redis/keys-scan.html) 迭代数据库中的数据库键。 |
| 17   | [TYPE key](https://www.runoob.com/redis/keys-type.html) 返回 key 所储存的值的类型。 |

## 字符串（String）

### 简介

String是Redis最基本的类型，一个key对应一个value。一个Redis中字符串value最多可以是512M。

String类型是二进制安全的。意味着Redis的String中可以包含任何数据，比如jpg图片或者序列化的对象。

### 常用命令

**原子操作**：不会被线程调度机制打断的操作

这种操作一旦开始。就一直运行到结束，中间不会由任何 context switch（切换到另一个线程）

- 在单线程中，能在单条指令中完成的操作都可以认为是原子操作，因为中断只能发生于指令之间
- 在多线程中，不能被其他进程（线程）打断的操作就叫原子操作

下表列出了常用的 redis 字符串命令：

| 序号 | 命令及描述                                                   |
| :--- | :----------------------------------------------------------- |
| 1    | [SET key value](https://www.runoob.com/redis/strings-set.html) 设置指定 key 的值。 |
| 2    | [GET key](https://www.runoob.com/redis/strings-get.html) 获取指定 key 的值。 |
| 3    | [GETRANGE key start end](https://www.runoob.com/redis/strings-getrange.html) 返回 key 中字符串值的子字符 |
| 4    | [GETSET key value](https://www.runoob.com/redis/strings-getset.html) 将给定 key 的值设为 value ，并返回 key 的旧值(old value)。 |
| 5    | [GETBIT key offset](https://www.runoob.com/redis/strings-getbit.html) 对 key 所储存的字符串值，获取指定偏移量上的位(bit)。 |
| 6    | [MGET key1 key2..\]](https://www.runoob.com/redis/strings-mget.html) 获取所有(一个或多个)给定 key 的值。 |
| 7    | [SETBIT key offset value](https://www.runoob.com/redis/strings-setbit.html) 对 key 所储存的字符串值，设置或清除指定偏移量上的位(bit)。 |
| 8    | [SETEX key seconds value](https://www.runoob.com/redis/strings-setex.html) 将值 value 关联到 key ，并将 key 的过期时间设为 seconds (以秒为单位)。 |
| 9    | [SETNX key value](https://www.runoob.com/redis/strings-setnx.html) 只有在 key 不存在时设置 key 的值。 |
| 10   | [SETRANGE key offset value](https://www.runoob.com/redis/strings-setrange.html) 用 value 参数覆写给定 key 所储存的字符串值，从偏移量 offset 开始。 |
| 11   | [STRLEN key](https://www.runoob.com/redis/strings-strlen.html) 返回 key 所储存的字符串值的长度。 |
| 12   | [MSET key value key value ...\]](https://www.runoob.com/redis/strings-mset.html) 同时设置一个或多个 key-value 对。 |
| 13   | [MSETNX key value key value ...\]](https://www.runoob.com/redis/strings-msetnx.html) 同时设置一个或多个 key-value 对，当且仅当所有给定 key 都不存在。 |
| 14   | [PSETEX key milliseconds value](https://www.runoob.com/redis/strings-psetex.html) 这个命令和 SETEX 命令相似，但它以毫秒为单位设置 key 的生存时间，而不是像 SETEX 命令那样，以秒为单位。 |
| 15   | [INCR key](https://www.runoob.com/redis/strings-incr.html) 将 key 中储存的数字值增一。 |
| 16   | [INCRBY key increment](https://www.runoob.com/redis/strings-incrby.html) 将 key 所储存的值加上给定的增量值（increment） 。 |
| 17   | [INCRBYFLOAT key increment](https://www.runoob.com/redis/strings-incrbyfloat.html) 将 key 所储存的值加上给定的浮点增量值（increment） 。 |
| 18   | [DECR key](https://www.runoob.com/redis/strings-decr.html) 将 key 中储存的数字值减一。 |
| 19   | [DECRBY key decrement](https://www.runoob.com/redis/strings-decrby.html) key 所储存的值减去给定的减量值（decrement） 。 |
| 20   | [APPEND key value](https://www.runoob.com/redis/strings-append.html) 如果 key 已经存在并且是一个字符串， APPEND 命令将指定的 value 追加到该 key 原来值（value）的末尾。 |

### 数据结构

String的数据结构为**简单动态字符串（Simple Dynamic String，SDS）**。是可以修改的字符串，内部结构上类似于Java的ArrayList，采用**预分配冗余空间**的方式来减少内存的频繁分配。

当前字符串实际分配的空间capacity一般要高于实际字符串长度len。若超出则**扩容**

- len<1M：加倍现有空间
- len>1M：多扩1M空间

字符串最大长度为512M。  

## 列表（List）

### 简介

单键多值。

Redis列表是简单的字符串列表，按照插入顺序排序。可以添加一个元素到列表的头部或尾部。

其底层是个**双向列表**，对两端的操作性能很高，通过索引下标的操作中间的节点性能较差。

### 常用命令

下表列出了列表相关的基本命令：

| 序号 | 命令及描述                                                   |
| :--- | :----------------------------------------------------------- |
| 1    | [BLPOP key1 key2 \] timeout](https://www.runoob.com/redis/lists-blpop.html) 移出并获取列表的第一个元素， 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。 |
| 2    | [BRPOP key1 key2 \] timeout](https://www.runoob.com/redis/lists-brpop.html) 移出并获取列表的最后一个元素， 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。 |
| 3    | [BRPOPLPUSH source destination timeout](https://www.runoob.com/redis/lists-brpoplpush.html) 从列表中弹出一个值，将弹出的元素插入到另外一个列表中并返回它； 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。 |
| 4    | [LINDEX key index](https://www.runoob.com/redis/lists-lindex.html) 通过索引获取列表中的元素 |
| 5    | [LINSERT key BEFORE\|AFTER pivot value](https://www.runoob.com/redis/lists-linsert.html) 在列表的元素前或者后插入元素 |
| 6    | [LLEN key](https://www.runoob.com/redis/lists-llen.html) 获取列表长度 |
| 7    | [LPOP key](https://www.runoob.com/redis/lists-lpop.html) 移出并获取列表的第一个元素 |
| 8    | [LPUSH key value1 value2\]](https://www.runoob.com/redis/lists-lpush.html) 将一个或多个值插入到列表头部 |
| 9    | [LPUSHX key value](https://www.runoob.com/redis/lists-lpushx.html) 将一个值插入到已存在的列表头部 |
| 10   | [LRANGE key start stop](https://www.runoob.com/redis/lists-lrange.html) 获取列表指定范围内的元素 |
| 11   | [LREM key count value](https://www.runoob.com/redis/lists-lrem.html) 移除列表元素 |
| 12   | [LSET key index value](https://www.runoob.com/redis/lists-lset.html) 通过索引设置列表元素的值 |
| 13   | [LTRIM key start stop](https://www.runoob.com/redis/lists-ltrim.html) 对一个列表进行修剪(trim)，就是说，让列表只保留指定区间内的元素，不在指定区间之内的元素都将被删除。 |
| 14   | [RPOP key](https://www.runoob.com/redis/lists-rpop.html) 移除列表的最后一个元素，返回值为移除的元素。 |
| 15   | [RPOPLPUSH source destination](https://www.runoob.com/redis/lists-rpoplpush.html) 移除列表的最后一个元素，并将该元素添加到另一个列表并返回 |
| 16   | [RPUSH key value1 value2\]](https://www.runoob.com/redis/lists-rpush.html) 在列表中添加一个或多个值 |
| 17   | [RPUSHX key value](https://www.runoob.com/redis/lists-rpushx.html) 为已存在的列表添加值 |

### 数据结构

List的数据结构为**快速链表quickList**

首先在列表元素较少的情况下会使用一块连续的内存存储，这个结构是**ziplist**，即**压缩列表**。

它将所有的元素紧挨着一起存储，分配的是一块连续的内存。

当数据量比较多时才会改成quicklist。

因为普通的链表需要的附加指针空间太大，会比较浪费空间。Redis将链表和ziplist结合起来组成了quicklist，也就是将多个ziplist使用双向指针串起来使用。这样既满足了快速的插入删除性能，又不会出现太大的空间冗余。

## 集合（Set）

### 简介

Redis set对外提供的功能是与list类似的一个列表的功能，特殊之处在于set是可以自动排重的，当你需要存储一个列表数据，又不希望出现重复数据时，set是一个很好的选择，并且set提供了判断某个成员是否在一个set集合内的重要接口，这也是list所不能提供的。

Redis的set是string类型的无序集合。它底层其实是一个value为null的hash表，所以添加，删除，查找的复杂度都是O(1)，即数据增加，其查找数据的时间不变。

### 常用命令

下表列出了 Redis 集合基本命令：

| 序号 | 命令及描述                                                   |
| :--- | :----------------------------------------------------------- |
| 1    | [SADD key member1 member2\]](https://www.runoob.com/redis/sets-sadd.html) 向集合添加一个或多个成员 |
| 2    | [SCARD key](https://www.runoob.com/redis/sets-scard.html) 获取集合的成员数 |
| 3    | [SDIFF key1 key2\]](https://www.runoob.com/redis/sets-sdiff.html) 返回第一个集合与其他集合之间的差异。 |
| 4    | [SDIFFSTORE destination key1 key2\]](https://www.runoob.com/redis/sets-sdiffstore.html) 返回给定所有集合的差集并存储在 destination 中 |
| 5    | [SINTER key1 key2\]](https://www.runoob.com/redis/sets-sinter.html) 返回给定所有集合的交集 |
| 6    | [SINTERSTORE destination key1 key2\]](https://www.runoob.com/redis/sets-sinterstore.html) 返回给定所有集合的交集并存储在 destination 中 |
| 7    | [SISMEMBER key member](https://www.runoob.com/redis/sets-sismember.html) 判断 member 元素是否是集合 key 的成员 |
| 8    | [SMEMBERS key](https://www.runoob.com/redis/sets-smembers.html) 返回集合中的所有成员 |
| 9    | [SMOVE source destination member](https://www.runoob.com/redis/sets-smove.html) 将 member 元素从 source 集合移动到 destination 集合 |
| 10   | [SPOP key](https://www.runoob.com/redis/sets-spop.html) 移除并返回集合中的一个随机元素 |
| 11   | [SRANDMEMBER key count\]](https://www.runoob.com/redis/sets-srandmember.html) 返回集合中一个或多个随机数 |
| 12   | [SREM key member1 member2\]](https://www.runoob.com/redis/sets-srem.html) 移除集合中一个或多个成员 |
| 13   | [SUNION key1 key2\]](https://www.runoob.com/redis/sets-sunion.html) 返回所有给定集合的并集 |
| 14   | [SUNIONSTORE destination key1 key2\]](https://www.runoob.com/redis/sets-sunionstore.html) 所有给定集合的并集存储在 destination 集合中 |
| 15   | [SSCAN key cursor [MATCH pattern\] [COUNT count]](https://www.runoob.com/redis/sets-sscan.html) 迭代集合中的元素 |

### 数据结构

Set数据结构是dict字典，字典是使用哈希表实现的。

Java中的HashSet的内部实现使用的是HashMap，只不过所有的value都指向同一个对象。Redis的set内u也使用hash结构，所有的value也都指向同一个内部值

## 哈希（Hash）

### 简介

Redis hash是一个**键值对集合**

Redis hash是一个string类型的**field**和**value**的映射表，hash特别适合用于存储对象，类似Java中的Map<String,Object>

### 常用命令

下表列出了 redis hash 基本的相关命令：

| 序号 | 命令及描述                                                   |
| :--- | :----------------------------------------------------------- |
| 1    | [HDEL key field1 field2\]](https://www.runoob.com/redis/hashes-hdel.html) 删除一个或多个哈希表字段 |
| 2    | [HEXISTS key field](https://www.runoob.com/redis/hashes-hexists.html) 查看哈希表 key 中，指定的字段是否存在。 |
| 3    | [HGET key field](https://www.runoob.com/redis/hashes-hget.html) 获取存储在哈希表中指定字段的值。 |
| 4    | [HGETALL key](https://www.runoob.com/redis/hashes-hgetall.html) 获取在哈希表中指定 key 的所有字段和值 |
| 5    | [HINCRBY key field increment](https://www.runoob.com/redis/hashes-hincrby.html) 为哈希表 key 中的指定字段的整数值加上增量 increment 。 |
| 6    | [HINCRBYFLOAT key field increment](https://www.runoob.com/redis/hashes-hincrbyfloat.html) 为哈希表 key 中的指定字段的浮点数值加上增量 increment 。 |
| 7    | [HKEYS key](https://www.runoob.com/redis/hashes-hkeys.html) 获取所有哈希表中的字段 |
| 8    | [HLEN key](https://www.runoob.com/redis/hashes-hlen.html) 获取哈希表中字段的数量 |
| 9    | [HMGET key field1 field2\]](https://www.runoob.com/redis/hashes-hmget.html) 获取所有给定字段的值 |
| 10   | [HMSET key field1 value1 field2 value2 \]](https://www.runoob.com/redis/hashes-hmset.html) 同时将多个 field-value (域-值)对设置到哈希表 key 中。 |
| 11   | [HSET key field value](https://www.runoob.com/redis/hashes-hset.html) 将哈希表 key 中的字段 field 的值设为 value 。 |
| 12   | [HSETNX key field value](https://www.runoob.com/redis/hashes-hsetnx.html) 只有在字段 field 不存在时，设置哈希表字段的值。 |
| 13   | [HVALS key](https://www.runoob.com/redis/hashes-hvals.html) 获取哈希表中所有值。 |
| 14   | [HSCAN key cursor [MATCH pattern\] [COUNT count]](https://www.runoob.com/redis/hashes-hscan.html) 迭代哈希表中的键值对。 |

### 数据结构

Hash类型对应的数据结构是两种:

- ziplist（压缩列表）             当field-value长度较短且个数较少时使用
- hashtable（哈希表）          否则

## 有序集合（Zset）

### 简介

Redis有序集合zset与普通集合set非常相似，是一个没有重复元素的字符串集合。

不同之处时有序集合的每个成员都关联了一个评分（score），这个评分被用来从最低分到最高分的方式排序集合中的成员。集合的成员是唯一的，但是评分可以重复。

因为元素是有序的，所以可以很快的根据评分（score）或者次序（position）来获取一个范围的元素。

访问有序集合的中间元素也是非常快的，因此能够使用有序集合作为一个没有重复成员的智能列表。

### 常用命令

下表列出了 redis 有序集合的基本命令:

| 序号 | 命令及描述                                                   |
| :--- | :----------------------------------------------------------- |
| 1    | [ZADD key score1 member1 score2 member2\]](https://www.runoob.com/redis/sorted-sets-zadd.html) 向有序集合添加一个或多个成员，或者更新已存在成员的分数 |
| 2    | [ZCARD key](https://www.runoob.com/redis/sorted-sets-zcard.html) 获取有序集合的成员数 |
| 3    | [ZCOUNT key min max](https://www.runoob.com/redis/sorted-sets-zcount.html) 计算在有序集合中指定区间分数的成员数 |
| 4    | [ZINCRBY key increment member](https://www.runoob.com/redis/sorted-sets-zincrby.html) 有序集合中对指定成员的分数加上增量 increment |
| 5    | [ZINTERSTORE destination numkeys key key ...\]](https://www.runoob.com/redis/sorted-sets-zinterstore.html) 计算给定的一个或多个有序集的交集并将结果集存储在新的有序集合 destination 中 |
| 6    | [ZLEXCOUNT key min max](https://www.runoob.com/redis/sorted-sets-zlexcount.html) 在有序集合中计算指定字典区间内成员数量 |
| 7    | [ZRANGE key start stop WITHSCORES\]](https://www.runoob.com/redis/sorted-sets-zrange.html) 通过索引区间返回有序集合指定区间内的成员 |
| 8    | [ZRANGEBYLEX key min max LIMIT offset count\]](https://www.runoob.com/redis/sorted-sets-zrangebylex.html) 通过字典区间返回有序集合的成员 |
| 9    | [ZRANGEBYSCORE key min max [WITHSCORES\] [LIMIT]](https://www.runoob.com/redis/sorted-sets-zrangebyscore.html) 通过分数返回有序集合指定区间内的成员 |
| 10   | [ZRANK key member](https://www.runoob.com/redis/sorted-sets-zrank.html) 返回有序集合中指定成员的索引 |
| 11   | [ZREM key member member ...\]](https://www.runoob.com/redis/sorted-sets-zrem.html) 移除有序集合中的一个或多个成员 |
| 12   | [ZREMRANGEBYLEX key min max](https://www.runoob.com/redis/sorted-sets-zremrangebylex.html) 移除有序集合中给定的字典区间的所有成员 |
| 13   | [ZREMRANGEBYRANK key start stop](https://www.runoob.com/redis/sorted-sets-zremrangebyrank.html) 移除有序集合中给定的排名区间的所有成员 |
| 14   | [ZREMRANGEBYSCORE key min max](https://www.runoob.com/redis/sorted-sets-zremrangebyscore.html) 移除有序集合中给定的分数区间的所有成员 |
| 15   | [ZREVRANGE key start stop WITHSCORES\]](https://www.runoob.com/redis/sorted-sets-zrevrange.html) 返回有序集中指定区间内的成员，通过索引，分数从高到低 |
| 16   | [ZREVRANGEBYSCORE key max min WITHSCORES\]](https://www.runoob.com/redis/sorted-sets-zrevrangebyscore.html) 返回有序集中指定分数区间内的成员，分数从高到低排序 |
| 17   | [ZREVRANK key member](https://www.runoob.com/redis/sorted-sets-zrevrank.html) 返回有序集合中指定成员的排名，有序集成员按分数值递减(从大到小)排序 |
| 18   | [ZSCORE key member](https://www.runoob.com/redis/sorted-sets-zscore.html) 返回有序集中，成员的分数值 |
| 19   | [ZUNIONSTORE destination numkeys key key ...\]](https://www.runoob.com/redis/sorted-sets-zunionstore.html) 计算给定的一个或多个有序集的并集，并存储在新的 key 中 |
| 20   | [ZSCAN key cursor [MATCH pattern\] [COUNT count]](https://www.runoob.com/redis/sorted-sets-zscan.html) 迭代有序集合中的元素（包括元素成员和元素分值） |

### 数据结构

**SortedSet(zset)**是Redis提供的一个非常特别的数据结构，一方面它等价于Java的数据结构Map<String,Double>，可以给每一个元素value赋予一个权重score，另一方面它又类似于TreeSet，内部的元素会按照权重score进行排序，可以得到每个元素的名次，还可以通过score的范围来获取元素的列表。

zset底层使用了两个数据结构：

- **hash**：关联元素value和权重score，保障元素value的唯一性，可以通过元素value找到相应的score值
- **跳跃表**：给元素value排序，根据score的范围获取元素列表

![](https://img-blog.csdnimg.cn/20210501223733890.png)



# 新数据类型

## BitMaps

### 简介

现代计算机用二进制（位） 作为信息的基础单位， 1个字节等于8位， 例如“abc”字符串是由3个字节组成， 但实际在计算机存储时将其用二进制表示， “abc”分别对应的ASCII码分别是97、 98、 99， 对应的二进制分别是01100001、 01100010和01100011，

合理地使用操作位能够有效地提高内存使用率和开发效率。
Redis提供了Bitmaps这个“数据类型”可以实现对位的操作：
（1） Bitmaps本身不是一种数据类型， 实际上它就是字符串（key-value） ， 但是它可以对字符串的位进行操作。
（2） Bitmaps单独提供了一套命令， 所以在Redis中使用Bitmaps和使用字符串的方法不太相同。 可以把Bitmaps想象成一个以位为单位的数组， 数组的每个单元只能存储0和1， 数组的下标在Bitmaps中叫做偏移量。
![](https://img-blog.csdnimg.cn/488ef6c9541d4f87a642e9fb73695a3c.png)

### 命令

**setbit**

`setbit <key> <offset> <value>`设置Bitmaps中某个偏移量的值（0或1）
offset:偏移量从0开始

**实例**
每个独立用户是否访问过网站存放在Bitmaps中， 将访问的用户记做1， 没有访问的用户记做0， 用偏移量作为用户的id。

**getbit**

`getbit <key> <offset>`获取Bitmaps中某个偏移量的值
获取键的第offset位的值（从0开始算）

**实例**
获取id=8的用户是否在2020-11-06这天访问过， 返回0说明没有访问过

**bitcount**
统计字符串被设置为1的bit数。一般情况下，给定的整个字符串都会被进行计数，通过指定额外的 start 或 end 参数，可以让计数只在特定的位上进行。start 和 end 参数的设置，都可以使用负数值：比如 -1 表示最后一个位，而 -2 表示倒数第二个位，start、end 是指bit组的字节的下标数，二者皆包含。

`bitcount <key> [start end]` 统计字符串从start字节到end字节比特值为1的数量

### Bitmaps与set对比

假设网站有1亿用户， 每天独立访问的用户有5千万， 如果每天用集合类型和Bitmaps分别存储活跃用户可以得到表
set和Bitmaps存储一天活跃用户对比

集合类型 64位 50000000 64位*50000000 = 400MB

Bitmaps 1位 100000000 1位*100000000 = 12.5MB

很明显， 这种情况下使用Bitmaps能节省很多的内存空间， 尤其是随着时间推移节省的内存还是非常可观的
set和Bitmaps存储独立用户空间对比 一天 一个月 一年

集合类型 400MB 12GB 144GB
Bitmaps 12.5MB 375MB 4.5GB

但Bitmaps并不是万金油， 假如该网站每天的独立访问用户很少， 例如只有10万（大量的僵尸用户） ， 那么两者的对比如下表所示， 很显然， 这时候使用Bitmaps就不太合适了， 因为基本上大部分位都是0。
set和Bitmaps存储一天活跃用户对比（独立用户比较少）

数据类型 每个userid占用空间 需要存储的用户量 全部内存量
集合类型 64位 100000 64位100000 = 800KB
Bitmaps 1位 100000000 1位100000000 = 12.5MB



## HyperLogLog

### 简介

在工作当中，我们经常会遇到与统计相关的功能需求，比如统计网站 PV（PageView 页面访问量），可以使用 Redis 的 incr、incrby 轻松实现。但像 UV（UniqueVisitor 独立访客）、独立 IP 数、搜索记录数等需要去重和计数的问题如何解决？这种求集合中不重复元素个数的问题称为基数问题。

解决基数问题有很多种方案：

数据存储在 MySQL 表中，使用 distinct count 计算不重复个数。

使用 Redis 提供的 hash、set、bitmaps 等数据结构来处理。

以上的方案结果精确，但随着数据不断增加，导致占用空间越来越大，对于非常大的数据集是不切实际的。能否能够降低一定的精度来平衡存储空间？Redis 推出了 HyperLogLog。

Redis HyperLogLog 是用来做基数统计的算法，HyperLogLog 的优点是：在输入元素的数量或者体积非常非常大时，计算基数所需的空间总是固定的、并且是很小的。

在 Redis 里面，每个 HyperLogLog 键只需要花费 12 KB 内存，就可以计算接近 2^64 个不同元素的基数。这和计算基数时，元素越多耗费内存就越多的集合形成鲜明对比。

但是，因为 HyperLogLog 只会根据输入元素来计算基数，而不会储存输入元素本身，所以 HyperLogLog 不能像集合那样，返回输入的各个元素。

什么是基数？

比如数据集 {1, 3, 5, 7, 5, 7, 8}，那么这个数据集的基数集为 {1, 3, 5 ,7, 8}，基数 (不重复元素) 为 5。 基数估计就是在误差可接受的范围内，快速计算基数。

### 命令

- `pfadd <key> <element> [element...]`                         添加指定元素到HyperLogLog中。若执行后HLL估计的近似基数变化，返回1，否则返回0
- `pfcount <key> [key...]`                                                  计算HLL的近似基数
- `pfmerge <destkey> <sourcekey> [sourcekey...]`    将一个或多个HLL合并后的结果存储在另一个HLL中。比如每月活跃用户可以使用每天的活跃用户来合并计算可得

## **Geospatial**

### 简介

Redis 3.2 中增加了对 GEO 类型的支持。GEO，Geographic，地理信息的缩写。该类型，就是元素的 2 维坐标，在地图上就是经纬度。redis 基于该类型，提供了经纬度设置，查询，范围查询，距离查询，经纬度 Hash 等常见操作。

### 命令

- `geoadd <key> <longitude> <latitude> <member> [longitude latitude member...]`添加地理位置（经度、纬度、名称）
- `geopos <key> <member> [member...]`  获取指定地区的坐标值
- `geodist <key> <member1> <member2> [m|km|ft|mi]`获取两个位置之间的直线距离
- `georadius <key> <longitude> <latitude> radius m|km|ft|mi`以给定的经纬度为中心，找出某一半径

# 发布和订阅

## 介绍

Redis发布订阅（pub / sub）是一种消息通信模式：发送者（pub）发送消息，订阅者（sub）接受消息。

Redis客户端可以订阅任意数量的频道。

## 发布和订阅

下图展示了频道 channel1 ， 以及订阅这个频道的三个客户端 —— client2 、 client5 和 client1 之间的关系：

![img](https://www.runoob.com/wp-content/uploads/2014/11/pubsub1.png)

当有新消息通过 PUBLISH 命令发送给频道 channel1 时， 这个消息就会被发送给订阅它的三个客户端：

![img](https://www.runoob.com/wp-content/uploads/2014/11/pubsub2.png)

## 实例

以下实例演示了发布订阅是如何工作的，需要开启两个 redis-cli 客户端。

在我们实例中我们创建了订阅频道名为 **runoobChat**:

### 第一个 redis-cli 客户端

redis 127.0.0.1:6379**>** SUBSCRIBE runoobChat

Reading messages... **(**press Ctrl-C to quit**)**
1**)** "subscribe"
2**)** "runoobChat"
3**)**  **(**integer**)** 1

现在，我们先重新开启个 redis 客户端，然后在同一个频道 runoobChat 发布两次消息，订阅者就能接收到消息。

### 第二个 redis-cli 客户端

redis 127.0.0.1:6379> PUBLISH runoobChat "Redis PUBLISH test"

(integer) 1

redis 127.0.0.1:6379> PUBLISH runoobChat "Learn redis by runoob.com"

(integer) 1

\# 订阅者的客户端会显示如下消息
 \1) "message"
\2) "runoobChat"
\3) "Redis PUBLISH test"
 \1) "message"
\2) "runoobChat"
\3) "Learn redis by runoob.com"

gif 演示如下：

- 开启本地 Redis 服务，开启两个 redis-cli 客户端。
- 在**第一个 redis-cli 客户端**输入 **SUBSCRIBE runoobChat**，意思是订阅 `runoobChat` 频道。
- 在**第二个 redis-cli 客户端**输入 **PUBLISH runoobChat "Redis PUBLISH test"** 往 runoobChat 频道发送消息，这个时候在第一个 redis-cli 客户端就会看到由第二个 redis-cli 客户端发送的测试消息。

![img](https://www.runoob.com/wp-content/uploads/2014/11/redis-pub-sub.gif)

------

## Redis 发布订阅命令

下表列出了 redis 发布订阅常用命令：

| 序号 | 命令及描述                                                   |
| :--- | :----------------------------------------------------------- |
| 1    | [PSUBSCRIBE pattern pattern ...\]](https://www.runoob.com/redis/pub-sub-psubscribe.html) 订阅一个或多个符合给定模式的频道。 |
| 2    | [PUBSUB subcommand [argument [argument ...\]]](https://www.runoob.com/redis/pub-sub-pubsub.html) 查看订阅与发布系统状态。 |
| 3    | [PUBLISH channel message](https://www.runoob.com/redis/pub-sub-publish.html) 将信息发送到指定的频道。 |
| 4    | [PUNSUBSCRIBE [pattern [pattern ...\]]](https://www.runoob.com/redis/pub-sub-punsubscribe.html) 退订所有给定模式的频道。 |
| 5    | [SUBSCRIBE channel channel ...\]](https://www.runoob.com/redis/pub-sub-subscribe.html) 订阅给定的一个或多个频道的信息。 |
| 6    | [UNSUBSCRIBE [channel [channel ...\]]](https://www.runoob.com/redis/pub-sub-unsubscribe.html) 指退订给定的频道。 |

# 事务

## 事务定义

Redis事务是一个单独的隔离操作：事务中的所有命令都会序列化、按顺序地执行。事务在执行的过程中，不会被其他客户端发送来的命令请求所打断。

Redis事务的主要作用就是**串联多个命令**防止别的命令插队

## multi、exec、discard

从输入multi命令开始，输入的命令都会依次进入命令队列中，但不会执行，直到输入exec后，Redis会将之前的命令队列中的命令依次执行。

组队的过程中可以通过discard来放弃组队。

## 事务中的错误处理

**组队**阶段中某个命令出现了报告错误，执行时整个的所有队列都会被取消。类比Java的**编译**时异常

如果**执行**阶段某个命令报出了错误，则只有报错的命令不会被执行，而其他的命令都会执行。类比Java的**运行**时异常

## 事务冲突

### 例子

假设银行卡内有10000元，现在三个人同时对其进行扣款，分别为8000、5000、2000元。解决方案如下

### 悲观锁

**悲观锁（Pessimistic Lock）**，顾名思义，就是很悲观，每次去拿数据的时候都认为别人会修改，所以每次在拿数据的时候都会上锁，这样别人想拿这个数据就会阻塞（block），直到它拿到锁。传统的**关系型数据库**里就用到了很多这种锁机制，比如**行锁**、**表锁**，**读锁**、**写锁**等，都是在做操作之前先上锁。

### 乐观锁

**乐观锁（Optimistic Lock）**，顾名思义，就是很乐观，每次去拿数据的时候都认为别人不会修改，所以不会上锁。但是在更新的时候会判断以下在此期间别人有没有去更新这个数据，可以使用版本号等机制。**乐观锁适用于多读的应用类型，这样可以提高吞吐量。Redis就是利用这种check-and-set机制实现事务的。**

### watch key [key...]

在执行multi之前，先执行watch key1 [key2...]，可以监视一个或多个key，如果在事务执行之前这个（或这些）key被其他命令改动，那么事务将被打断。

### unwatch

取消watch命令对所有key的监视。

如果在执行watch命令之后，exec命令或discard命令先被执行了的话，那么就不需要再执行unwatch了。

## Redis事务特性

- 单独的隔离操作
  - 事务中的所有命令都会序列化、按顺序地执行、事务在执行的过程中，不会被其他客户端发送来的命令请求所打断。
- 没有隔离级别的概念
  - 队列中的命令没有提交之前都不会实际被执行，因为事务提交前任何指令都不会被实际执行。
- 不保证原子性
  - 事务中如果有一条命令执行失败，其后的命令仍然被执行，没有回滚。



# Redis高可用概述

在web服务器中，高可用是指服务器可以正常访问的时间，衡量的标准是在多长时间内可以提供正常服务（99.9%、99.99%、99.999% 等等）。但是在Redis语境中，高可用的含义似乎要宽泛一些，除了保证提供正常服务(如主从分离、快速容灾技术)，还需要考虑数据容量的扩展、数据安全不会丢失等。
1、**持久化**：持久化是最简单的高可用方法(有时甚至不被归为高可用的手段)，主要作用是数据备份，即将数据存储在硬盘，保证数据不会因进程退出而丢失。

2、**复制**：复制是高可用Redis的基础，哨兵和集群都是在复制基础上实现高可用的。复制主要实现了数据的多机备份，以及对于读操作的负载均衡和简单的故障恢复。缺陷：故障恢复无法自动化；写操作无法负载均衡；存储能力受到单机的限制。
3、**哨兵**：在复制的基础上，哨兵实现了自动化的故障恢复。缺陷：写操作无法负载均衡；存储能力受到单机的限制。
4、**集群**：通过集群，Redis解决了写操作无法负载均衡，以及存储能力受到单机限制的问题，实现了较为完善的高可用方案。

# Redis持久化

持久化的功能：Redis是内存数据库，数据都是存储在内存中，为了避免进程退出导致数据的永久丢失，需要定期将Redis中的数据以某种形式(数据或命令)从内存保存到硬盘；当下次Redis重启时，利用持久化文件实现数据恢复。除此之外，为了进行灾难备份，可以将持久化文件拷贝到一个远程位置。

Redis持久化分为RDB持久化和AOF持久化：**前者将当前数据保存到硬盘，后者则是将每次执行的写命令保存到硬盘**（类似于MySQL的binlog）；由于AOF持久化的实时性更好，即当进程意外退出时丢失的数据更少，因此AOF是目前主流的持久化方式，不过RDB持久化仍然有其用武之地。

## RDB持久化

RDB持久化是将当前进程中的数据生成**快照**保存到硬盘(因此也称作快照持久化)，保存的文件后缀是rdb；当Redis重新启动时，可以读取快照文件恢复数据。

Redis会单独创建（**fork**）一个子进程来进行持久化，会先将数据写入到一个**临时文件**中，待持久化过程都结束了，再用这个临时文件**替换**上次持久化好的文件（**写时复制技术**）。整个过程中，主进程是不进行任何IO操作的，这就确保了极高的性能，如果需要进行大规模数据的恢复，且对于数据恢复的完整性不是非常敏感，那么RDB方式要比AOF方式更加高效。

RDB的**缺点**是**最后一次持久化后的数据可能丢失**。

### 触发条件

RDB持久化的触发分为手动触发和自动触发两种。

#### 手动触发

save命令和bgsave命令都可以生成RDB文件。
save命令会阻塞Redis服务器进程，直到RDB文件创建完毕为止，在Redis服务器阻塞期间，服务器不能处理任何命令请求。

```
save
```

而bgsave命令会创建一个子进程，由子进程来负责创建RDB文件，父进程(即Redis主进程)则继续处理请求。

```
bgsave
```

bgsave命令执行过程中，只有fork子进程时会阻塞服务器，而对于save命令，整个过程都会阻塞服务器，因此save已基本被废弃，线上环境要杜绝save的使用；后文中也将只介绍bgsave命令。此外，在自动触发RDB持久化时，Redis也会选择bgsave而不是save来进行持久化；下面介绍自动触发RDB持久化的条件。

#### 自动触发

save m n
自动触发最常见的情况是在配置文件中通过save m n，指定当m秒内发生n次变化时，会触发bgsave。
例如，查看redis的默认配置文件(Linux下为redis根目录下的redis.conf)，可以看到如下配置信息：
![这里写图片描述](https://img-blog.csdn.net/20180829191922295?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

其中save 900 1的含义是：当时间到900秒时，如果redis数据发生了至少1次变化，则执行bgsave；save 300 10和save 60 10000同理。当三个save条件满足任意一个时，都会引起bgsave的调用。

### save m n的实现原理

Redis的save m n，是通过serverCron函数、dirty计数器、和lastsave时间戳来实现的。
serverCron是Redis服务器的周期性操作函数，默认每隔100ms执行一次；该函数对服务器的状态进行维护，其中一项工作就是检查 save m n 配置的条件是否满足，如果满足就执行bgsave。

dirty计数器是Redis服务器维持的一个状态，记录了上一次执行bgsave/save命令后，服务器状态进行了多少次修改(包括增删改)；而当save/bgsave执行完成后，会将dirty重新置为0。

例如，如果Redis执行了set mykey helloworld，则dirty值会+1；如果执行了sadd myset v1 v2 v3，则dirty值会+3；注意dirty记录的是服务器进行了多少次修改，而不是客户端执行了多少修改数据的命令。

astsave时间戳也是Redis服务器维持的一个状态，记录的是上一次成功执行save/bgsave的时间。
save m n的原理如下：每隔100ms，执行serverCron函数；在serverCron函数中，遍历save m n配置的保存条件，只要有一个条件满足，就进行bgsave。对于每一个save m n条件，只有下面两条同时满足时才算满足：
（1）当前时间-lastsave > m
（2）dirty >= n
save m n 执行日志
下图是save m n触发bgsave执行时，服务器打印日志的情况：

![这里写图片描述](https://img-blog.csdn.net/20180829192935976?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
其他自动触发机制
除了save m n 以外，还有一些其他情况会触发bgsave：
在主从复制场景下，如果从节点执行全量复制操作，则主节点会执行bgsave命令，并将rdb文件发送给从节点
执行shutdown命令时，自动执行rdb持久化，如下图所示：

![这里写图片描述](https://img-blog.csdn.net/20180829192956302?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

### 执行流程

前面介绍了触发bgsave的条件，下面将说明bgsave命令的执行流程

![这里写图片描述](https://img-blog.csdn.net/20180829193117245?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

图片中的5个步骤所进行的操作如下：

1) Redis父进程首先判断：当前是否在执行save，或bgsave/bgrewriteaof（后面会详细介绍该命令）的子进程，如果在执行则bgsave命令直接返回。bgsave/bgrewriteaof 的子进程不能同时执行，主要是基于性能方面的考虑：两个并发的子进程同时执行大量的磁盘写操作，可能引起严重的性能问题。
2) 父进程执行fork操作创建子进程，这个过程中父进程是阻塞的，Redis不能执行来自客户端的任何命令
3) 父进程fork后，bgsave命令返回”Background saving started”信息并不再阻塞父进程，并可以响应其他命令
4) 子进程创建RDB文件，根据父进程内存快照生成临时快照文件，完成后对原有文件进行原子替换
5) 子进程发送信号给父进程表示完成，父进程更新统计信息

###  RDB文件

RDB文件是经过压缩的二进制文件，下面介绍关于RDB文件的一些细节。
存储路径
RDB文件的存储路径既可以在启动前配置，也可以通过命令动态设定。
配置：dir配置指定目录，dbfilename指定文件名。默认是Redis根目录下的dump.rdb文件。
动态设定：Redis启动后也可以动态修改RDB存储路径，在磁盘损害或空间不足时非常有用；执行命令为config set dir {newdir}和config set dbfilename {newFileName}
![这里写图片描述](https://img-blog.csdn.net/2018082919384321?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

1) REDIS：常量，保存着”REDIS”5个字符。
2) db_version：RDB文件的版本号，注意不是Redis的版本号。
3) SELECTDB 0 pairs：表示一个完整的数据库(0号数据库)，同理SELECTDB 3 pairs表示完整的3号数据库；只有当数据库中有键值对时，RDB文件中才会有该数据库的信息(上图所示的Redis中只有0号和3号数据库有键值对)；如果Redis中所有的数据库都没有键值对，则这一部分直接省略。其中：SELECTDB是一个常量，代表后面跟着的是数据库号码；0和3是数据库号码；pairs则存储了具体的键值对信息，包括key、value值，及其数据类型、内部编码、过期时间、压缩信息等等。
4) EOF：常量，标志RDB文件正文内容结束。
5) check_sum：前面所有内容的校验和；Redis在载入RBD文件时，会计算前面的校验和并与check_sum值比较，判断文件是否损坏。
   Redis默认采用LZF算法对RDB文件进行压缩。虽然压缩耗时，但是可以大大减小RDB文件的体积，因此压缩默认开启；可以通过命令关闭：

```
config set rdbcompression no
```

需要注意的是，RDB文件的压缩并不是针对整个文件进行的，而是对数据库中的字符串进行的，且只有在字符串达到一定长度(20字节)时才会进行。

### 启动时加载

RDB文件的载入工作是在服务器启动时自动执行的，并没有专门的命令。但是由于AOF的优先级更高，因此当AOF开启时，Redis会优先载入AOF文件来恢复数据；只有当AOF关闭时，才会在Redis服务器启动时检测RDB文件，并自动载入。服务器载入RDB文件期间处于阻塞状态，直到载入完成为止。
Redis载入RDB文件时，会对RDB文件进行校验，如果文件损坏，则日志中会打印错误，Redis启动失败。

### 停止RDB

动态停止RDB：

```
config set save ""
```

禁用保存策略

### RDB常用配置总结

下面是RDB常用的配置项，以及默认值；前面介绍过的这里不再详细介绍。
save m n：bgsave自动触发的条件；如果没有save m n配置，相当于自动的RDB持久化关闭，不过此时仍可以通过其他方式触发

stop-writes-on-bgsave-error yes：当bgsave出现错误时，Redis是否停止执行写命令；设置为yes，则当硬盘出现问题时，可以及时发现，避免数据的大量丢失；设置为no，则Redis无视bgsave的错误继续执行写命令，当对Redis服务器的系统(尤其是硬盘)使用了监控时，该选项考虑设置为no

rdbcompression yes：是否开启RDB文件压缩

rdbchecksum yes：是否开启RDB文件的校验，在写入文件和读取文件时都起作用；关闭checksum在写入文件和启动文件时大约能带来10%的性能提升，但是数据损坏时无法发现

dbfilename dump.rdb：RDB文件名

dir ./：RDB文件和AOF文件所在目录

### 总结

优势：

- 适合大规模的数据恢复
- 对数据完整性和一致性要求不高时更适合使用
- 节省磁盘空间
- 恢复速度快

劣势：

- Fork的时候，内存中的数据被克隆了一份，大致2倍的膨胀性需要考虑
- 虽然Redis在fork时使用了写时拷贝技术，但是如果数据庞大时还是比较消耗性能
- 在备份周期在一定间隔时间做一次备份，所以如果Redis意外down掉的话，就会丢失最后一次快照后的所有修改

## AOF持久化

RDB持久化是将进程数据写入文件，而AOF持久化(即Append Only File持久化)，则是将Redis执行的每次**写**命令记录到单独的日志文件中（有点像MySQL的binlog）；当Redis重启时再次执行AOF文件中的命令来恢复数据。

与RDB相比，AOF的实时性更好，因此已成为主流的持久化方案。

### 开启AOF

Redis服务器默认开启RDB，关闭AOF；要开启AOF，需要在配置文件中配置：

```
appendonly yes
```

### 执行流程

由于需要记录Redis的每条写命令，因此AOF不需要触发，下面介绍AOF的执行流程。
AOF的执行流程包括：

1. 命令追加(append)：将Redis的写命令追加到缓冲区aof_buf；
2. 文件写入(write)和文件同步(sync)：根据不同的同步策略将aof_buf中的内容同步到硬盘；
3. 文件重写(rewrite)：定期重写AOF文件，达到压缩的目的。

#### 命令追加(append)

Redis先将写命令追加到缓冲区，而不是直接写入文件，主要是为了避免每次有写命令都直接写入硬盘，导致硬盘IO成为Redis负载的瓶颈。
命令追加的格式是Redis命令请求的协议格式，它是一种纯文本格式，具有兼容性好、可读性强、容易处理、操作简单避免二次开销等优点；具体格式略。在AOF文件中，除了用于指定数据库的select命令（如select 0 为选中0号数据库）是由Redis添加的，其他都是客户端发送来的写命令。

#### 文件写入(write)和文件同步(sync)

Redis提供了多种AOF缓存区的同步文件策略，策略涉及到操作系统的write函数和fsync函数，说明如下：
为了提高文件写入效率，在现代操作系统中，当用户调用write函数将数据写入文件时，操作系统通常会将数据暂存到一个内存缓冲区里，当缓冲区被填满或超过了指定时限后，才真正将缓冲区的数据写入到硬盘里。这样的操作虽然提高了效率，但也带来了安全问题：如果计算机停机，内存缓冲区中的数据会丢失；因此系统同时提供了fsync、fdatasync等同步函数，可以强制操作系统立刻将缓冲区中的数据写入到硬盘里，从而确保数据的安全性。

AOF缓存区的同步文件策略由参数**`appendfsync`**控制，各个值的含义如下：

- `always`：命令写入aof_buf后立即调用系统fsync操作同步到AOF文件，fsync完成后线程返回。这种情况下，每次有写命令都要同步到AOF文件，**数据完整性较好**，硬盘IO成为性能瓶颈，Redis只能支持大约几百TPS写入，**严重降低了Redis的性能**；即便是使用固态硬盘（SSD），每秒大约也只能处理几万个命令，而且会大大降低SSD的寿命。
- `no`：命令写入aof_buf后调用系统write操作，不对AOF文件做fsync同步；**同步由操作系统负责**，通常同步周期为30秒。这种情况下，文件同步的时间不可控，且缓冲区中堆积的数据会很多，**数据安全性无法保证**。
- `everysec`：命令写入aof_buf后调用系统write操作，write完成后线程返回；fsync同步文件操作由专门的线程**每秒调用一次**。everysec是前述两种策略的折中，是**性能和数据安全性的平衡**，因此是Redis的默认配置，也是我们推荐的配置。

#### 文件重写(rewrite)

随着时间流逝，Redis服务器执行的写命令越来越多，AOF文件也会越来越大；过大的AOF文件不仅会影响服务器的正常运行，也会导致数据恢复需要的时间过长。

文件重写是指定期重写AOF文件，只保留可以恢复数据的最小指令集，减小AOF文件的体积。**需要注意的是，AOF重写是把Redis进程内的数据转化为写命令，同步到新的AOF文件；不会对旧的AOF文件进行任何读取、写入操作!**

关于文件重写需要注意的另一点是：对于AOF持久化来说，文件重写虽然是强烈推荐的，但并不是必须的；即使没有文件重写，数据也可以被持久化并在Redis启动的时候导入；因此在一些实现中，会关闭自动的文件重写，然后通过定时任务在每天的某一时刻定时执行。

文件重写之所以能够压缩AOF文件，原因在于：

- **过期**的数据不再写入文件
- **无效**的命令不再写入文件：如有些数据被重复设值(set mykey v1, set mykey v2)、有些数据被删除了(sadd myset v1, del myset)等等
- 多条命令可以**合并**为一个：如sadd myset v1, sadd myset v2, sadd myset v3可以合并为sadd myset v1 v2 v3。不过为了防止单条命令过大造成客户端缓冲区溢出，对于list、set、hash、zset类型的key，并不一定只使用一条命令；而是以某个常量为界将命令拆分为多条。这个常量在redis.h/REDIS_AOF_REWRITE_ITEMS_PER_CMD中定义，不可更改，3.0版本中值是64。

#### 文件重写的触发

文件重写的触发，分为手动触发和自动触发：

- 手动触发：直接调用**bgrewriteaof**命令，该命令的执行与bgsave有些类似：都是**fork子进程**进行具体的工作，且都只有在fork时阻塞。

- 自动触发：根据**auto-aof-rewrite-min-size**和**auto-aof-rewrite-percentage**参数，以及**aof_current_size**和**aof_base_size**状态确定触发时机。

**auto-aof-rewrite-min-size**：执行AOF重写时，文件的最小体积，默认值为**64MB**。

**auto-aof-rewrite-percentage**：执行AOF重写时，当前AOF大小(即aof_current_size)和上一次重写时AOF大小(aof_base_size)的比值。
其中，参数可以通过config get命令查看：
![这里写图片描述](https://img-blog.csdn.net/20180830010618605?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
状态可以通过**info persistence**查看：
![这里写图片描述](https://img-blog.csdn.net/20180830010647321?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

只有当auto-aof-rewrite-min-size和auto-aof-rewrite-percentage两个参数同时满足时，才会自动触发AOF重写，即bgrewriteaof操作。

**条件**

- AOF当前大小>=auto-aof-rewrite-min-size + auto-aof-rewrite-min-size * auto-aof-rewrite-percentage
- 当前大小>=auto-aof-rewrite-min-size

![这里写图片描述](https://img-blog.csdn.net/20180830010839244?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

关于文件重写的流程，有两点需要特别注意：

- 重写由父进程fork子进程进行；
- 重写期间Redis执行的写命令，需要追加到新的AOF文件中，为此Redis引入了aof_rewrite_buf缓存。

#### 文件重写的流程

对照上图，文件重写的流程如下：

1) Redis父进程首先判断当前是否存在正在执行 bgsave/bgrewriteaof的子进程，如果存在则bgrewriteaof命令直接返回，如果存在bgsave命令则等bgsave执行完成后再执行。前面曾介绍过，这个主要是基于性能方面的考虑。
2) 父进程执行fork操作创建子进程，这个过程中父进程是阻塞的。
3)  
   1. 父进程fork后，bgrewriteaof命令返回”Background append only file rewrite started”信息并不再阻塞父进程，并可以响应其他命令。Redis的所有写命令依然写入AOF缓冲区，并根据appendfsync策略同步到硬盘，保证原有AOF机制的正确。
   2. 由于fork操作使用写时复制技术，子进程只能共享fork操作时的内存数据。由于父进程依然在响应命令，因此Redis使用AOF重写缓冲区(图中的aof_rewrite_buf)保存这部分数据，防止新AOF文件生成期间丢失这部分数据。也就是说，bgrewriteaof执行期间，Redis的写命令同时追加到aof_buf和aof_rewirte_buf两个缓冲区。
4) 子进程根据内存快照，按照命令合并规则写入到新的AOF文件。
5) 
   1. 子进程写完新的AOF文件后，向父进程发信号，父进程更新统计信息，具体可以通过info persistence查看。
   2. 父进程把AOF重写缓冲区的数据写入到新的AOF文件，这样就保证了新AOF文件所保存的数据库状态和服务器当前状态一致。
   3. 使用新的AOF文件替换老文件，完成AOF重写。

### 启动时加载

前面提到过，当AOF开启时，Redis启动时会优先载入AOF文件来恢复数据；只有当AOF关闭时，才会载入RDB文件恢复数据。
当AOF开启，且AOF文件存在时，Redis启动日志：

![这里写图片描述](https://img-blog.csdn.net/20180830011453607?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

当AOF开启，但AOF文件不存在时，即使RDB文件存在也不会加载(更早的一些版本可能会加载，但3.0不会)，Redis启动日志如下：

### 文件校验及恢复

与载入RDB文件类似，Redis载入AOF文件时，会对AOF文件进行校验，如果文件损坏，则日志中会打印错误，Redis启动失败。但如果是AOF文件结尾不完整(机器突然宕机等容易导致文件尾部不完整)，且aof-load-truncated参数开启，则日志中会输出警告，Redis忽略掉AOF文件的尾部，启动成功。aof-load-truncated参数默认是开启的。

如遇到AOF文件损坏，通过/usr/local/bin/**redis-check-aof**恢复：

`redis-check-aof --fix appendonly.aof`

### 伪客户端

因为Redis的命令只能在客户端上下文中执行，而载入AOF文件时命令是直接从文件中读取的，并不是由客户端发送；因此Redis服务器在载入AOF文件之前，会创建一个没有网络连接的客户端，之后用它来执行AOF文件中的命令，命令执行的效果与带网络连接的客户端完全一样。

### AOF常用配置

下面是AOF常用的配置项，以及默认值；前面介绍过的这里不再详细介绍。

- `appendonly no`：是否开启AOF
- `appendfilename “appendonly.aof”`：AOF文件名
- `dir ./`：RDB文件和AOF文件所在目录
- `appendfsync everysec`：fsync持久化策略
- `no-appendfsync-on-rewrite no`：AOF重写期间是否禁止fsync；如果开启该选项，可以减轻文件重写时CPU和硬盘的负载（尤其是硬盘），但是可能会丢失AOF重写期间的数据；需要在负载和安全性之间进行平衡
-  `auto-aof-rewrite-percentage 100`：文件重写触发条件之一
- `auto-aof-rewrite-min-size 64mb`：文件重写触发提交之一
- `aof-load-truncated yes`：如果AOF文件结尾损坏，Redis启动时是否仍载入AOF文件

### 总结

**优点**

- 备份机制更稳健，丢失数据概率更低
- 可读的日志文件，通过操作AOF文件，可以处理误操作

**缺点**

- 比起RDB占用更多的磁盘空间
- 恢复备份速度更慢
- 每次读写都同步的话，有一定的性能压力
- 存在个别Bug，造成恢复不能

## 方案选择与常见问题（重点）

在介绍持久化策略之前，首先要明白无论是RDB还是AOF，持久化的开启都是要付出性能方面代价的：对于RDB持久化，一方面是bgsave在进行fork操作时Redis主进程会阻塞，另一方面，子进程向硬盘写数据也会带来IO压力；对于AOF持久化，向硬盘写数据的频率大大提高(everysec策略下为秒级)，IO压力更大，甚至可能造成AOF追加阻塞问题（后面会详细介绍这种阻塞），此外，AOF文件的重写与RDB的bgsave类似，会有fork时的阻塞和子进程的IO压力问题。相对来说，由于AOF向硬盘中写数据的频率更高，因此对Redis主进程性能的影响会更大。

实际生产环境中，根据数据量、应用对数据的安全要求、预算限制等不同情况，会有各种各样的持久化策略；如完全不使用任何持久化、使用RDB或AOF的一种，或同时开启RDB和AOF持久化等。此外，持久化的选择必须与Redis的主从策略一起考虑，因为主从复制与持久化同样具有数据备份的功能，而且主机master和从机slave可以独立的选择持久化方案。

下面分场景来讨论持久化策略的选择，下面的讨论也只是作为参考，实际方案可能更复杂更具多样性。

- 如果Redis中的数据完全丢弃也没有关系（如Redis完全用作DB层数据的cache），那么无论是单机，还是主从架构，都可以不进行任何持久化。
- 在单机环境下（对于个人开发者，这种情况可能比较常见），如果可以接受十几分钟或更多的数据丢失，选择RDB对Redis的性能更加有利；如果只能接受秒级别的数据丢失，应该选择AOF。
- 但在多数情况下，我们都会配置主从环境，slave的存在既可以实现数据的热备，也可以进行读写分离分担Redis读请求，以及在master宕掉后继续提供服务。

在这种情况下，一种可行的做法是：

- master：完全关闭持久化（包括RDB和AOF），这样可以让master的性能达到最好
- slave：关闭RDB，开启AOF（如果对数据安全要求不高，开启RDB关闭AOF也可以），并定时对持久化文件进行备份（如备份到其他文件夹，并标记好备份的时间）；然后关闭AOF的自动重写，然后添加定时任务，在每天Redis闲时（如凌晨12点）调用bgrewriteaof。

这里需要解释一下，为什么**开启了主从复制，可以实现数据的热备份，还需要设置持久化**呢？因为在一些特殊情况下，主从复制仍然不足以保证数据的安全，例如：

- master和slave进程**同时停止**：考虑这样一种场景，如果master和slave在同一栋大楼或同一个机房，则一次停电事故就可能导致master和slave机器同时关机，Redis进程停止；如果没有持久化，则面临的是数据的完全丢失。
- master**误重启**：考虑这样一种场景，master服务因为故障宕掉了，如果系统中有自动拉起机制（即检测到服务停止后重启该服务）将master自动重启，由于没有持久化文件，那么master重启后数据是空的，slave同步数据也变成了空的；如果master和slave都没有持久化，同样会面临数据的完全丢失。需要注意的是，即便是使用了哨兵(关于哨兵后面会有文章介绍)进行自动的主从切换，也有可能在哨兵轮询到master之前，便被自动拉起机制重启了。因此，**应尽量避免“自动拉起机制”和“不做持久化”同时出现**。

**异地灾备**：上述讨论的几种持久化策略，针对的都是一般的系统故障，如进程异常退出、宕机、断电等，这些故障不会损坏硬盘。但是对于一些可能导致硬盘损坏的灾难情况，如火灾地震，就需要进行异地灾备。例如对于单机的情形，可以定时将RDB文件或重写后的AOF文件，通过scp拷贝到远程机器，如阿里云、AWS等；对于主从的情形，可以定时在master上执行bgsave，然后将RDB文件拷贝到远程机器，或者在slave上执行bgrewriteaof重写AOF文件后，将AOF文件拷贝到远程机器上。一般来说，由于RDB文件文件小、恢复快，因此灾难恢复常用RDB文件；异地备份的频率根据数据安全性的需要及其他条件来确定，但最好不要低于一天一次。

### fork阻塞：CPU的阻塞

在Redis的实践中，众多因素限制了Redis单机的内存不能过大，例如：

当面对请求的暴增，需要从库扩容时，Redis内存过大会导致扩容时间太长；

当主机宕机时，切换主机后需要挂载从库，Redis内存过大导致挂载速度过慢；

以及持久化过程中的fork操作，下面详细说明。

首先说明一下fork操作：
父进程通过fork操作可以创建子进程；子进程创建后，父子进程共享代码段，不共享进程的数据空间，但是子进程会获得父进程的数据空间的副本。在操作系统fork的实际实现中，基本都采用了写时复制技术，即在父/子进程试图修改数据空间之前，父子进程实际上共享数据空间；但是当父/子进程的任何一个试图修改数据空间时，操作系统会为修改的那一部分(内存的一页)制作一个副本。
虽然fork时，子进程不会复制父进程的数据空间，但是会复制内存页表（页表相当于内存的索引、目录）；父进程的数据空间越大，内存页表越大，fork时复制耗时也会越多。

**在Redis中，无论是RDB持久化的bgsave，还是AOF重写的bgrewriteaof，都需要fork出子进程来进行操作。如果Redis内存过大，会导致fork操作时复制内存页表耗时过多；**而Redis主进程在进行fork时，是**完全阻塞**的，也就意味着无法响应客户端的请求，会造成请求延迟过大。
对于不同的硬件、不同的操作系统，fork操作的耗时会有所差别，一般来说，如果Redis单机内存达到了10GB，fork时耗时可能会达到百毫秒级别（如果使用Xen虚拟机，这个耗时可能达到秒级别）。因此，一般来说Redis单机内存一般要限制在10GB以内；不过这个数据并不是绝对的，可以通过观察线上环境fork的耗时来进行调整。观察的方法如下：执行命令info stats，查看latest_fork_usec的值，单位为微秒。
**为了减轻fork操作带来的阻塞问题，除了控制Redis单机内存的大小以外，还可以适度放宽AOF重写的触发条件、选用物理机或高效支持fork操作的虚拟化技术等，例如使用Vmware或KVM虚拟机，不要使用Xen虚拟机。**

### AOF追加阻塞：硬盘的阻塞

前面提到过，在AOF中，如果AOF缓冲区的文件同步策略为everysec，则：在主线程中，命令写入aof_buf后调用系统write操作，write完成后主线程返回；fsync同步文件操作由专门的文件同步线程每秒调用一次。
这种做法的问题在于，如果硬盘负载过高，那么fsync操作可能会超过1s；如果Redis主线程持续高速向aof_buf写入命令，硬盘的负载可能会越来越大，IO资源消耗更快；如果此时Redis进程异常退出，丢失的数据也会越来越多，可能远超过1s。
为此，Redis的处理策略是这样的：主线程每次进行AOF会对比上次fsync成功的时间；如果距上次不到2s，主线程直接返回；如果超过2s，则主线程阻塞直到fsync同步完成。因此，如果系统硬盘负载过大导致fsync速度太慢，会导致Redis主线程的阻塞；此外，使用everysec配置，AOF最多可能丢失2s的数据，而不是1s。

AOF追加阻塞问题定位的方法：
（1）监控info Persistence中的aof_delayed_fsync：当AOF追加阻塞发生时（即主线程等待fsync而阻塞），该指标累加。
（2）AOF阻塞时的Redis日志：
Asynchronous AOF fsync is taking too long (disk is busy?). Writing the AOF buffer without waiting for fsync to complete, this may slow down Redis.
（3）如果AOF追加阻塞频繁发生，说明系统的硬盘负载太大；可以考虑更换IO速度更快的硬盘，或者通过IO监控分析工具对系统的IO负载进行分析，如iostat（系统级io）、iotop（io版的top）、pidstat等。

### 总结

- RDB持久化方式能够在指定的时间间隔对数据进行快照存储
- AOF持久化方式记录每次对服务器写的操作，当服务器重启的时候会重新执行这些命令来恢复原始的数据，AOF命令以redis协议追加保存每次写的操作到文件末尾
- Redis还能对AOF文件进行后台重写，使得AOF文件的体积不至于过大
- 只做缓存：如果你只希望你的数据在服务器运行的时候存在，你也可以不使用任何持久化方式
- 同时开启两种持久化方式：在这种情况下，当redis重启的时候会优先载入AOF文件来恢复原始的数据，因为在通常情况下AOF文件保存的数据集要比RDB文件保存的数据集要完整

# 主从复制

## 主从复制概述

主从复制，是指将一台Redis服务器的数据，复制到其他的Redis服务器。前者称为主节点(master)，后者称为从节点(slave)；**数据的复制是单向的，只能由主节点到从节点。**master以写为主，slave以读为主。
默认情况下，每台Redis服务器都是主节点；且一个主节点可以有多个从节点(或没有从节点)，但一个从节点只能有一个主节点。

## 主从复制的作用

- **数据冗余**：主从复制实现了数据的热备份，是持久化之外的一种数据[冗余](https://so.csdn.net/so/search?q=冗余&spm=1001.2101.3001.7020)方式。
- **故障恢复**：当主节点出现问题时，可以由从节点提供服务，实现快速的故障恢复；实际上是一种服务的冗余。
- **负载均衡**：在主从复制的基础上，配合读写分离，可以由主节点提供写服务，由从节点提供读服务（即写Redis数据时应用连接主节点，读Redis数据时应用连接从节点），分担服务器负载；尤其是在写少读多的场景下，通过多个从节点分担读负载，可以大大提高Redis服务器的并发量。
- **高可用基石**：除了上述作用以外，主从复制还是哨兵和集群能够实施的基础，因此说主从复制是Redis高可用的基础。

简单来说，大致可分为两个作用

- 读写分离，性能扩展
- 容灾快速恢复

## 如何使用主从复制

为了更直观的理解主从复制，在介绍其内部原理之前，先说明我们需要如何操作才能开启主从复制。

###  建立复制

需要注意，主从复制的开启，完全是在从节点发起的；不需要我们在主节点做任何事情。
从节点开启主从复制，有3种方式：
（1）配置文件
在从服务器的配置文件中加入：`slaveof <masterip> <masterport>`
（2）启动命令
redis-server启动命令后加入 ：`slaveof <masterip> <masterport>`
（3）客户端命令

```
Redis服务器启动后，直接通过客户端执行命令：
slaveof <masterip> <masterport>，则该Redis实例成为从节点。12
```

上述3种方式是等效的，下面以客户端命令的方式为例，看一下当执行了slaveof后，Redis主节点和从节点的变化。

### 实例

准备工作：启动两个节点

方便起见，实验所使用的主从节点是在一台机器上的不同Redis实例，其中主节点监听6379端口，从节点监听6380端口；从节点监听的端口号可以在配置文件中修改：
![这里写图片描述](https://img-blog.csdn.net/20180830090641689?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
启动后可以看到：
![这里写图片描述](https://img-blog.csdn.net/20180830090711635?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
两个Redis节点启动后（分别称为6379节点和6380节点），默认都是主节点。

建立复制
此时在6380节点执行slaveof命令，使之变为从节点：

![这里写图片描述](https://img-blog.csdn.net/20180830090906209?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

观察效果
1、下面验证一下，在主从复制建立后，主节点的数据会复制到从节点中。
（1）首先在从节点查询一个不存在的key
![这里写图片描述](https://img-blog.csdn.net/20180830091019288?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
（2）然后在主节点中增加这个key：
![这里写图片描述](https://img-blog.csdn.net/20180830091050264?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
（3）此时在从节点中再次查询这个key，会发现主节点的操作已经同步至从节点：
![这里写图片描述](https://img-blog.csdn.net/20180830091145257?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
（4）然后在主节点删除这个key：
![这里写图片描述](https://img-blog.csdn.net/20180830091224565?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
（5）此时在从节点中再次查询这个key，会发现主节点的操作已经同步至从节点：
![这里写图片描述](https://img-blog.csdn.net/201808300913177?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

### 断开复制

通过**slaveof 命令建立主从复制关系以后**，可以通过**slaveof no one断开**。需要注意的是，**从节点断开复制后，不会删除已有的数据，只是不再接受主节点新的数据变化。**
从节点执行slaveof no one后，打印日志如下所示；可以看出断开复制后，从节点又变回为主节点。
![这里写图片描述](https://img-blog.csdn.net/20180830091524777?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzM1NDMzNzE2/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

## 主从复制的实现原理

主从复制过程大体可以分为3个阶段：连接建立阶段（即准备阶段）、数据同步阶段、命令传播阶段；下面分别进行介绍。

### 连接建立阶段

该阶段的主要作用是在主从节点之间建立连接，为数据同步做好准备。
步骤1：保存主节点信息

从节点服务器内部维护了两个字段，即masterhost和masterport字段，用于存储主节点的ip和port信息。

需要注意的是，slaveof是**异步**命令，从节点完成主节点ip和port的保存后，向发送slaveof命令的客户端直接返回OK，实际的复制操作在这之后才开始进行。

#### 建立socket连接

从节点每秒1次调用复制定时函数replicationCron()，如果发现了有主节点可以连接，便会根据主节点的ip和port，创建socket连接。如果连接成功，则：
从节点：为该socket建立一个专门处理复制工作的文件事件处理器，负责后续的复制工作，如接收RDB文件、接收命令传播等。
主节点：接收到从节点的socket连接后（即accept之后），为该socket创建相应的客户端状态，并将从节点看做是连接到主节点的一个客户端，后面的步骤会以从节点向主节点发送命令请求的形式来进行。

#### 发送ping命令

从节点成为主节点的客户端之后，发送ping命令进行首次请求，目的是：检查socket连接是否可用，以及主节点当前是否能够处理请求。
从节点发送ping命令后，可能出现3种情况：
（1）返回pong：说明socket连接正常，且主节点当前可以处理请求，复制过程继续。
（2）超时：一定时间后从节点仍未收到主节点的回复，说明socket连接不可用，则从节点断开socket连接，并重连。
（3）返回pong以外的结果：如果主节点返回其他结果，如正在处理超时运行的脚本，说明主节点当前无法处理命令，则从节点断开socket连接，并重连。

#### 身份验证

如果从节点中设置了masterauth选项，则从节点需要向主节点进行身份验证；没有设置该选项，则不需要验证。从节点进行身份验证是通过向主节点发送auth命令进行的，auth命令的参数即为配置文件中的masterauth的值。
如果主节点设置密码的状态，与从节点masterauth的状态一致（一致是指都存在，且密码相同，或者都不存在），则身份验证通过，复制过程继续；如果不一致，则从节点断开socket连接，并重连。

#### 发送从节点端口信息

身份验证之后，从节点会向主节点发送其监听的端口号（前述例子中为6380），主节点将该信息保存到该从节点对应的客户端的slave_listening_port字段中；该端口信息除了在主节点中执行info Replication时显示以外，没有其他作用。

### 数据同步阶段

主从节点之间的连接建立以后，便可以开始进行数据同步，该阶段可以理解为从节点数据的初始化。具体执行的方式是：从节点向主节点发送psync命令（Redis2.8以前是sync命令），开始同步。
数据同步阶段是主从复制最核心的阶段，根据主从节点当前状态的不同，可以分为**全量复制**和**增量复制**。
需要注意的是，在数据同步阶段之前，从节点是主节点的客户端，主节点不是从节点的客户端；而到了这一阶段及以后，**主从节点互为客户端**。原因在于：在此之前，主节点只需要响应从节点的请求即可，不需要主动发请求，而在数据同步阶段和后面的命令传播阶段，主节点需要主动向从节点发送请求（如推送缓冲区中的写命令），才能完成复制。



master接到命令后启动后台的存盘进程，同时收集所有接收到的用于修改数据集命令，在后台进程执行完毕之后，master将传送整个数据文件到slave，以完成一次**完全同步（全量复制）**。

- **全量复制**：slave服务在接收到数据库文件数据后，将其存入磁盘并加载到内存中。

### 命令传播阶段

数据同步阶段完成后，主从节点进入命令传播阶段；在这个阶段**主节点将自己执行的写命令发送给从节点，从节点接收命令并执行，从而保证主从节点数据的一致性**。

- **增量复制**：master继续将新的所有收集到的修改命令一次传给slave，完成同步.

但是只要是重新连接master，一次完全同步（全量复制）将被自动执行。

在命令传播阶段，除了发送写命令，主从节点还维持着心跳机制：PING和REPLCONF ACK

### 延迟与不一致

需要注意的是，命令传播是异步的过程，即主节点发送写命令后并不会等待从节点的回复；因此实际上主从节点之间很难保持实时的一致性，延迟在所难免。数据不一致的程度，与主从节点之间的网络状况、主节点写命令的执行频率、以及主节点中的repl-disable-tcp-nodelay配置等有关。
repl-disable-tcp-nodelay no：该配置作用于命令传播阶段，控制主节点是否禁止与从节点的TCP_NODELAY；默认no，即不禁止TCP_NODELAY。当设置为yes时，TCP会对包进行合并从而减少带宽，但是发送的频率会降低，从节点数据延迟增加，一致性变差；具体发送频率与Linux内核的配置有关，默认配置为40ms。当设置为no时，TCP会立马将主节点的数据发送给从节点，带宽增加但延迟变小。
一般来说，只有当应用对Redis数据不一致的容忍度较高，且主从节点之间网络状况不好时，才会设置为yes；多数情况使用默认值no。

## 基于Docker配置Redis的主从复制

#### 1. 拉取docker镜像：

```shell
docker pull redis
```

#### 2. 挂载外部配置：

在/root目录下创建目录和配置文件redis.conf
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200830153338265.PNG#pic_center)
其中主redis的redis.conf：

```
bind 0.0.0.0
protected-mode no
```

两个从redis的redis.conf：

```
bind 0.0.0.0
protected-mode no
replicaof 172.17.0.2 6379
```

#### 3. 启动3个redis容器服务，分别使用到6379、6380、6381端口：

```shell
docker run --name redis-6379 -v /root/docker-redis2/conf/redis.conf:/etc/redis/redis.conf -v /root/docker-redis2/data:/redis/data -p 6379:6379 -d redis redis-server /etc/redis/redis.conf

docker run --name redis-6380 -v /root/docker-redis2/conf/redis.conf:/etc/redis/redis.conf -v /root/docker-redis2/data:/redis/data -p 6380:6379 -d redis redis-server /etc/redis/redis.conf

docker run --name redis-6381 -v /root/docker-redis2/conf/redis.conf:/etc/redis/redis.conf -v /root/docker-redis2/data:/redis/data -p 6381:6379 -d redis redis-server /etc/redis/redis.conf
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200830084711166.PNG#pic_center)

#### 4. 开始redis集群配置

（如果前面没有在redis.conf中配置replicaof则需要这一步）：

（1）查看容器内网ip地址：

命令：

- `docker inspect 容器ID`

```shell
docker inspect 2023cfc62233
```

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220505163502037.png)

3个redis容器的内网ip地址为：

```
redis-6379：172.17.0.2:6379
redis-6380：172.17.0.3:6379
redis-6381：172.17.0.4:6379
```

（2）进入容器内部，查看当前redis的角色（主还是从）：

命令：

- `docker exec -it 容器ID /bin/bash`      注意不要带上-d参数，在后台运行的bash终端在这里无法进行交互
- `info replication`                  打印主从复制的相关信息

```shell
docker exec -it 3a58ee9e1d40  /bin/bash

redis-cli

info replication
可以看出，目前三个redis都是master。
（3）使用redis-cli命令后修改redis-6380、redis-6381的主机为redis-6379（172.17.0.2:6379)：
```

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220505163603366.png)

命令：

- `slaveof <ip> <port>`

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220505163724961.png)

此时从机会自动同步主机的数据。

（4）查看redis-6379是否已经拥有2个从机：

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220505164528650.png)

### 一主多仆

在一主多仆的主从搭建方式中，有以下几种情况：

- 从服务器挂掉，当该服务器重连时，有以下两种情况：

  - 在该从服务器的配置文件中配置了从属关系 `replicaof 172.17.0.2 6379`，则重连后仍然保持原本的从属关系
  - 在配置文件中未配置，则重连后重置为无从者的master

  若在该从者挂掉期间，master写入了数据，则在重连后将当前master中的所有数据重新复制到该从服务器中

- 主服务器挂掉，其从者仍然保持与其的从属关系。

**遵从召唤而来，你就是我的master吗？**

### 薪火相传

上一个slave可以是下一个slave的master，slave同样可以接收其他slaves的连接和同步请求，那么该slave作为了链条中下一个的master，可以有效减轻master的写压力，去中心化降低风险。

用`slave <ip> <port>`

- 中途变更转向：该从服务器会清除之前保存在其中的数据，重新拷贝最新的

风险是一旦某个slave宕机，后面的slave都没法备份，因为此时的主机没有对这些从机建立直属的从属关系。

而如果主机宕机，从机依旧是从机，无法进行写数据

### 反客为主

当一个master宕机后，后面的slave可以立刻升为master，其后面的slave不用做任何就该。

用`slave no one `将当前从机变为主机。

限制：该方法为手动执行。而解决其问题的便是**哨兵模式**。

# 哨兵模式

### 简介

**哨兵模式（sentinel）**，是反客为主的自动版，能够后台监控主机是否故障，如果故障了根据投票数自动将从库slave转换为主库master。

### 基于docker配置哨兵模式

#### 配置文件

创建	sentinel.conf   文件，在其中填写以下内容：

- `sentinel monitor <alias> <host> <port> <minnum>`

  参数解释

  - alias                               为监控对象起的服务器名称（别名）
  - host                               要监控的服务器主机地址
  - port                               要监控的服务器的端口号
  - minnum                        至少有多少个哨兵同意迁移的数量

配置Sentinel哨兵

进入3台redis容器内部进行配置，在容器根目录里面创建sentinel.conf文件,在其中填写以下内容：

- `sentinel monitor <alias> <host> <port> <minnum>`

  参数解释

  - alias                               为监控对象起的服务器名称（别名）
  - host                               要监控的服务器主机地址
  - port                               要监控的服务器的端口号
  - minnum                        至少有多少个哨兵同意迁移的数量

在这里文件内容为：`sentinel monitor mymaster 172.17.0.2 6379 1`
![在这里插入图片描述](https://img-blog.csdnimg.cn/20190612141306448.png)
出现bash: vim: command not found

解决：1、`apt-get update` 2、`apt-get install vim`

或者 `echo "sentinel monitor mymaster 172.17.0.2 6379 1" > /sentinel.conf`

#### 启动哨兵

最后，启动Redis哨兵：
![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220505192224954.png)

#### 主机选举

测试

6.1打开多个窗口（便于观察）
![在这里插入图片描述](https://img-blog.csdnimg.cn/20190612141349404.png)
6.2关闭主配置（Master)
`docker stop 872a7feaa6fd`

查看其他两个是否选举成功
![在这里插入图片描述](https://img-blog.csdnimg.cn/20190612141637638.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20190612141643165.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjIzNjE2NQ==,size_16,color_FFFFFF,t_70)

完成。

选举根据优先级别：`slave-priority`

原主机重启后会变成从机

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220505192908654.png)

#### 复制延时

由于所有的写操作都是先在Master上操作，然后同步到Slave上，所以从Master同步到Slave机器有一定的延迟，当系统很繁忙的时候，延迟问题会更加严重，Slave机器数量的增加也会使这个问题更加严重。

### 故障恢复

- 新主登基

  从下线的主服务的所有从服务里面挑选一个从服务，将其转换为主服务，选择条件依次为：

  - **优先级**靠前
    - 优先级在redis.conf中默认：`replica-priority 100`，值越小优先级越高。
  - **偏移量**最大
    - 偏移量是指跟原主机数据同步率。
  - **runid**最小
    - 每个redis实例启动后都会随机生成一个40位的runid

- 群仆俯首

  挑选出新的主服务之后，sentinel向原主服务的从服务发送slaveof新主服务的命令，复制新master的数据

- 旧主俯首

  当已下线的服务重新上线时，sentinel会向其发送slaveof命令，让其成为新主的从

  

# 集群

## 问题

容量不够，redis如何进行扩容？

并发写操作，redis如何分摊？

另外，主从模式，薪火相传模式，主机宕机，导致ip地址发生拜年话，应用程序中配置需要修改对应的主机地址、端口等信息。

之前通过代理主机来解决，但是在redis3.0中提供了解决方案，就是**无中心化集群配置**。

## 简介

哨兵（sentinel）模式基本可以满足一般生产的需求，具备高可用性。但是当数据量过大到一台服务器存放不下的情况时，主从模式或哨兵模式就不能满足需求了，这个时候需要对存储的数据进行分片，将数据存储到多个Redis实例中。**cluster（集群）模式**的出现就是为了解决单机Redis容量有限的问题，将Redis的数据根据一定的规则分配到多台机器。

cluster可以说是sentinel和主从模式的结合体，通过cluster可以实现主从和master重选功能，所以如果配置两个副本三个分片的话，就需要六个Redis实例。因为Redis的数据是根据一定规则分配到cluster的不同机器的，当数据量过大时，可以新增机器进行扩容。

Redis集群实现了队Redis的水平扩容，即启动N个redis节点，将整个数据库分布存储在这N个节点中，每个节点存储总数居的1/N。

Redis集群通过分区（partition）来提供一定程度的可用性（available）：即使集群中有一部分节点失效或者无法进行通讯，集群也可以继续处理命令请求。

## 基于Docker搭建集群

### 自定义网络

先为redis集群创建一个自定义网络，可以实现容器与容器之前互通（仅限redis的容器互通）

`docker network create --driver=bridge --subnet=172.38.0.0/16 redis`

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220506160803294.png)

### 创建配置文件

**创建shell脚本文件script.sh**

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220506150815639.png)

脚本文件内容如下

```shell
for port in $(seq 1 6); \
do \
mkdir -p ~/redis/node-${port}/conf
touch ~/redis/node-${port}/conf/redis.conf
cat << EOF > ~/redis/node-${port}/conf/redis.conf
port 6379
bind 0.0.0.0
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
cluster-announce-ip 172.38.0.1${port}
cluster-announce-port 6379
cluster-announce-bus-port 16379
appendonly yes
EOF
done
```

**执行脚本文件**

`bash script.sh`

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220506161431585.png)

### 运行容器

```shell
# 容器1
docker run -p 6371:6379 -p 16371:16379 --name redis-node-1 \
-v ~/redis/node-1/data:/data \
-v ~/redis/node-1/conf/redis.conf:/etc/redis/redis.conf \
-d --net redis --ip 172.38.0.11 redis redis-server /etc/redis/redis.conf

# 容器2
docker run -p 6372:6379 -p 16372:16379 --name redis-node-2 \
-v ~/redis/node-2/data:/data \
-v ~/redis/node-2/conf/redis.conf:/etc/redis/redis.conf \
-d --net redis --ip 172.38.0.12 redis redis-server /etc/redis/redis.conf

# 容器3
docker run -p 6373:6379 -p 16373:16379 --name redis-node-3 \
-v ~/redis/node-3/data:/data \
-v ~/redis/node-3/conf/redis.conf:/etc/redis/redis.conf \
-d --net redis --ip 172.38.0.13 redis redis-server /etc/redis/redis.conf

# 容器4
docker run -p 6374:6379 -p 16374:16379 --name redis-node-4 \
-v ~/redis/node-4/data:/data \
-v ~/redis/node-4/conf/redis.conf:/etc/redis/redis.conf \
-d --net redis --ip 172.38.0.14 redis redis-server /etc/redis/redis.conf

# 容器5
docker run -p 6375:6379 -p 16375:16379 --name redis-node-5 \
-v ~/redis/node-5/data:/data \
-v ~/redis/node-5/conf/redis.conf:/etc/redis/redis.conf \
-d --net redis --ip 172.38.0.15 redis redis-server /etc/redis/redis.conf

# 容器6
docker run -p 6376:6379 -p 16376:16379 --name redis-node-6 \
-v ~/redis/node-6/data:/data \
-v ~/redis/node-6/conf/redis.conf:/etc/redis/redis.conf \
-d --net redis --ip 172.38.0.16 redis redis-server /etc/redis/redis.conf
```

结果如下

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220506161319720.png)

**检查配置是否成功**

<img src="https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220506161349455.png"  />

### 创建集群

**进入容器**

`docker exec -it redis-node-1 /bin/bash`

这里进入的容器可以是前面所运行的六个容器其中任意一个。因为集群是**无中心**化的，任何一个都可以作为集群的入口。

**进入容器后，在容器中创建集群**

在将六个节点组合成一个集群之前，请确保所有容器处于启动状态，且对应节点的配置文件（即每一个docker容器下的redis.conf）都生成正常。

```shell
redis-cli --cluster create 172.38.0.11:6379 172.38.0.12:6379 172.38.0.13:6379 172.38.0.14:6379 172.38.0.15:6379 172.38.0.16:6379 --cluster-replicas 1
```

- `--cluster-replicas 1`   一台主机需要从机的个数。表示以最简单的方式配置集群，即三主三从，分为三组

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220506162900997.png)

**启动redis集群客户端**

`redis-cli -c`

- -c 表示以集群启动redis

**查看集群信息**

`cluster info`

 集群创建好之后，11，12，13为主节点，其余为从节点 

` cluster nodes`

![](https://www.yumoyumo.top/wp-content/uploads/2022/05/image-20220506162735659.png)

## slots插槽

一个Redis集群包含**16384个插槽（hash slot）**，数据库中的每个键都属于这16384个插槽的其中一个。

集群使用公式  **` CRC16(key) % 16384`** 来计算键key属于哪个槽，其中`CRC16(key)`语句计算键key的CRC16校验和。

- **CRC16：循环冗余校验**

集群中的每个节点负责处理一部分插槽。例如上图中的主节点中，一个有0-16383号插槽，平均分摊到3个主节点中：

节点A负责处理：0-5460号插槽

节点B负责处理：5461-10922号插槽

节点C负责处理：10923-16383号插槽

## 读写操作

### 在集群中录入值

在redis-cli每次录入、查询键值，redis都会计算出该key一个送往的插槽，如果不是该客户端对应服务器的插槽，redis会报错，并告知应该前往的redis实例地址和端口。

redis-cli客户端提供了` -c `参数实现**自动重定向**

如redis-cli -c登入后，再录入、查询键值对可以自动重定向



- 不在一个slot下的键值，不能使用mget、mset等多键操作。
  - `mset k1 v1 k2 v2`         错误！！！
- 可以通过{}来定义组的概念，从而使key中{}内相同内容的键值对放到一个slot中。
  - `mset k1{user} v1 k2{user} v2` 

### 查询集群中的值

- `cluster keyslot <key>` 计算对应key指定的插槽
- `cluster countkeysinslot <slot>`计算对应插槽中key的数目
- `cluster getkeysinslot <slot> <count>`返回count个slot槽中的value值

## 故障恢复

- 主节点挂掉，其对应的从节点自动升为主节点。注：十五秒超时
- 主节点恢复后，该节点变为其 原从节点（现主节点）的从节点
- 某一段插槽的主、从节点都挂掉，根据配置文件中 `cluster-require-full-coverage`的属性值决定
  - `cluster-require-full-coverage`的值为yes，则整个集群挂掉
  - `cluster-require-full-coverage`的值为no，则只有该插槽段的数据全部不能使用和存储

## 总结

**好处**

- 实现扩容
- 分摊压力
- 无中心配置相对简单

**不足**

- 不支持多键操作
- 不支持多键的Redis事务
- 不支持lua脚本

由于Redis的集群方案出现较晚，很多公司已经采用了其他的集群方案，而代理或者客户端分片的方案想要迁移至redis cluster，需要整体迁移而不是逐步过渡，复杂度较大

# 应用问题解决

## 缓存穿透

### 问题描述

key所对应的数据在数据源并不存在，每次针对此key的请求从缓存获取不到，请求都会压到数据源，从而可能压垮数据源。比如用一个不存在的用户id获取用户信息，不论缓存还是数据库都没用，若黑客利用此漏洞进行攻击可能压垮数据库。

![img](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9xcWFkYXB0LnFwaWMuY24vdHhkb2NwaWMvMC81ZWQzMTk3MDYzMjVjOTgyN2M0NDU5MDZmOWQ4YzIyOS8w?x-oss-process=image/format,png)

缓存穿透问题可能会使后端存储负载加大，由于很多后端持久层不具备高并发性，甚至可能造成后端存储宕机。通常可以在程序中统计总调用数、缓存层命中数、如果同一个Key的缓存命中率很低，可能就是出现了缓存穿透问题。

​    造成缓存穿透的基本原因有两个。第一，自身业务代码或者数据出现问题（例如：set 和 get 的key不一致），第二，一些恶意攻击、爬虫等造成大量空命中（爬取线上商城商品数据，超大循环递增商品的ID）

**特点**

- 大量的无效访问

- 缓存中没有，而数据库中有要访问的数据

### 解决方案

一个一定不存在于缓存及在数据源中查询不到的数据，由于缓存是不命中时被动写的，并且出于容错考虑，如果从存储层查不到数据则不写入缓存，这将导致这个不存在的数据每次请求都要到存储层去查询，失去了缓存的意义。

解决方案：

- 对空值缓存：

  如果一个查询返回的数据为空（不管数据是否不存在），我们仍然把这个空结果（null）进行缓存，设置空结果的过期时间会很短，最长不超过五分钟。

- 设置可访问的名单（白名单）：

  使用bitmaps类型定义一个可以访问的名单，名单id作为bitmaps的偏移量，每次访问和bitmap里面的id进行比较，如果访问id不在bitmaps中，则进行拦截，不允许访问。

- 进行实时监控：

  当发现Redis的缓存命中率开始急速降低，需要排查访问对象和访问的数据，和运维人员配合，可以设置黑名单限制服务。

- 采用**布隆过滤器**：

  布隆过滤器（Bloom Filter）是1970年由布隆提出的。它实际上是一个很长的二进制向量（位图）和一系列随机映射函数（哈希函数）。

  布隆过滤器可以用于检索一个元素是否在一个集合中。它的优点是空间效率和查询时间都远远超过一般的算法，缺点是有一定的误识别率和删除困难，

  将所有可能存在的数据哈希到一个足够大的bitmaps中，一个一定不存在的数据会被这个bitmaps给拦截掉，从而避免了对底层存储系统的查询压力。

**算法描述：**

- 初始状态时，BloomFilter是一个长度为m的位数组，每一位都置为0。
- 添加元素x时，x使用k个hash函数得到k个hash值，对m取余，对应的bit位设置为1。
- 判断y是否属于这个集合，对y使用k个哈希函数得到k个哈希值，对m取余，所有对应的位置都是1，则认为y属于该集合（哈希冲突，可能存在误判），否则就认为y不属于该集合。可以通过增加哈希函数和增加二进制位数组的长度来降低错报率。

![img](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9xcWFkYXB0LnFwaWMuY24vdHhkb2NwaWMvMC9mNmE0NTZiYTAzNWZkOThjYzc2MDk5MGQ1NmYyNGE2My8w?x-oss-process=image/format,png)

**错报原因：**

​     一个key映射数组上多位，一位会被多个key使用，也就是多对多的关系。如果一个key映射的所有位值为1，就判断为存在。但是可能会出现key1 和  key2 同时映射到下标为100的位，key1不存在，key2存在，这种情况下会发生错误率

## 缓存击穿

### 问题描述

系统中存在以下两个问题时需要引起注意：

- 当前key是一个热点key（例如一个秒杀活动），并发量非常大。
- 重建缓存不能在短时间完成，可能是一个复杂计算，例如复杂的SQL、多次IO、多个依赖等。

在缓存失效的瞬间，有大量线程来重建缓存，造成后端负载加大，甚至可能会让数据库崩溃。

**特点**

- 热点key过期
- 缓存和数据库中都没有要访问的数据

### 解决方案

key可能会在某些时间点被超高并发地访问，是一种非常“热点”的数据。这个时候需要考虑缓存被“击穿”的问题

解决方案：

- 预先设置热门数据：在redis被高峰访问之前，把一些热门数据提前存入到redis里面，加大这些热门数据key的时长

- 实时调整：线程监控哪些数据热门，实时调整key的过期时长

- **使用互斥排他锁**：

  只允许一个线程重建缓存，其他线程等待重建缓存的线程执行完，重新从缓存获取数据即可

  - 在缓存失效的时候（判断拿出来的值为空），不是立即去load db（重建缓存）
  - 先使用缓存工具的某些带成功操作返回值的操作（如Redis的SETNX）
  - 当操作返回成功时，再进行load db的操作，并回设缓存，最后删除mutex key
  - 当操作范围失败，证明有线程在load db，当前线程睡眠一段时间再重试整个get缓存的方法

  <img src="https://imgconvert.csdnimg.cn/aHR0cHM6Ly9xcWFkYXB0LnFwaWMuY24vdHhkb2NwaWMvMC83NzgyMDQ4ZGUzNWQ5NDBmYjczOTdkMDc0OGU2YjExZC8w?x-oss-process=image/format,png" alt="img" style="zoom: 67%;" />

## 缓存雪崩

### 问题描述



**特点**

- 在极少时间段，查询的大量key集中过期

### 解决方案

缓存失效时的雪崩效应队底层系统的冲击非常可怕

解决方案：

- 构建多级缓存架构：nginx缓存+redis缓存+其他缓存（ehcache等）

- 使用锁或队列：

  用加锁或者队列的方式保证不会有大量的数据队数据库一次性进行读写，从而避免失效时的大量的并发请求落到底层存储系统上。不适用于高并发情况

- 设置过期标志更新缓存：

  记录缓存数据是否过期（设置提前量），如果过期会触发通知另外的线程去后台更新实际key的缓存

- 将缓存失效时间分散开：

  可以在原有的失效时间的基础上增加一个随机值，比如1-5分钟随机，这样每一个缓存的过期时间的重复率就会降低，很难引发集体失效的事件

-  使用缓存集群，保证缓存高可用：

  如果缓存层设计成高可用的，即使个别节点、个别机器、甚至是机房宕掉，依然可以提供服务，例如前面介绍过的 Redis Sentinel 和 Redis Cluster 都实现了高可用。 

## 分布式锁

### 问题描述

随着业务发展的需要，原单体单机部署的系统被演化成分布式集群系统后，由于分布式系统多线程、多进程并且分布在不同机器上，这将使得原单机部署情况下的并发控制锁策略失效，单纯的JavaAPI并不能提供分布式锁的能力。为了解决这个问题，就需要一种跨JVM的互斥机制来控制共享资源的访问。

分布式锁的主流实现方案：

- 基于数据库实现分布式锁
- 基于缓存（Redis等）
- 基于Zookeeper

每一种分布式锁解决方案都有各自的优缺点：

- 性能：redis最高
- 可靠性：Zookeeper最高

下面介绍基于redis实现分布式锁

### 基于redis实现分布式锁



- 使用setnx上锁，del释放锁
  - `setnx k1 v1`
  - `del k1`
- 锁一直没有释放，则设置key过期时间（非原子操作），自动释放
  - `setnx k1 v1`
  - `expire k1 10`
- 上锁后突然出现异常，导致无法设置过期时间，则**在上锁的同时设置过期时间**
  - `set k1 v1 nx ex 10`

此为**独占锁**。

- EX second：设置键的过期时间为second秒。

  `set key value ex second`效果等同于`setex key second value`

- PX millisecond：设置键的过期时间为millisecond毫秒。

  `set key value px millisecond`效果等同于`setpx key millisecond value`

- NX：只在键不存在时，才对键进行设置操作。

  `set key value nx`效果等同于`setnx key value` 

- XX：只在键已经存在时，才对键进行设置操作。

### 总结

为了确保分布式锁可用，至少要确保锁的实现同时满足以下四个条件：

- 互斥性。在任意时刻，只有一个客户端能持有锁。

  解决方案：`NX`

- 不会发生死锁。即使有一个客户端在持有锁的期间崩溃而没有主动解锁，也能保证后续其他客户端能加锁。

  解决方案：设置过期时间，`EX second`

- 解铃还须系铃人。对同一个锁的加锁和解锁必须是同一个客户端，客户端自己不能把别人加的锁给解了。

  解决方案：设置**UUID**防止误删

- 加锁和解锁必须具有原子性。

  解决方案：使用**lua脚本**保证删除的原子性

#### Java代码实现

```java
/**
 * @Author: yumo
 **/
@RestController
public class LockTest {


    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @GetMapping("testLock")
    public void testLock(@RequestParam("skuId") String skuId){

        String uuid= UUID.randomUUID().toString();

        //每个商品都有一把锁
        String lockKey="lock:"+skuId;
        //1、获取锁,setnx lock 111
        Boolean lock = redisTemplate.opsForValue().setIfAbsent(skuId, uuid,10, TimeUnit.SECONDS);
        //2、获取锁成功，查询num的值
        if(lock){
            Object value = redisTemplate.opsForValue().get("num");
            //2.1、判断num键对应的值value为空，则return
            if(StringUtils.isEmpty(value)){
                return;
            }
            //2.2、有值就转换为int
            int num = Integer.parseInt(value + "");
            //2.3、把redis的num加1
            redisTemplate.opsForValue().set("num",++num);

            //使用lua脚本来释放锁
            //定义lua脚本
            String script="if redis.call('get',KEY[1]) == ARGV[1] then return redis.call('del',KEY[1]) else return 0 end";
            //使用redis执行lua
            DefaultRedis Script<Long> redisScript = new DefaultRedisScript<>();
            redisScript.setScriptText(script);
            //设置返回类型为Long
            //因为删除判断的时候返回的0会被封装为Long数据类型，若不封装则默认返回String类型
            //那么返回的字符串与0会发生错误
            redisScript.setResultType(Long.class);
            //第一个是script脚本，第二个是需要判断的key，第三个是key所对应的值
            redisTemplate.execute(redisScript, Arrays.asList(lockKey),uuid);
        }else {
            //3、获取锁失败，每隔0.1秒重试
            try {
                Thread.sleep(100);
                testLock(skuId);
            }catch (InterruptedException e){
                e.printStackTrace();
            }
        }
    }
}
```

