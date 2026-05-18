---
title: Linux入门到实践
date: 2022-04-12 16:51:33
tags: 
- Linux
categories:
- Linux
---

## Linux入门

### Linux的应用领域

1. 个人桌面领域的应用

2. **服务器领域**：

   linux在服务器领域的应用是最强的。linux免费、稳定、高效等特点在这里得到了很好的体现，尤其在一些高端领域尤为广泛（c/c++/php/java/python/go）。

3. 嵌入式领域：

   linux运行稳定、对网络的良好支持性、低成本，且可以根据需要进行软件裁剪，内核最小可以达到几百KB等特点，使其近些年来在嵌入式领域的应用得到非常大的提高。

### 概述

linux是一个开源、免费的**操作系统**，其稳定性、安全性、处理多并发已经得到业界的认可，目前很多企业级的项目都会部署到Linux/Unix系统上。

Linux之父：Linus Torvalds  Git创作者、世界著名黑客

Linux主要的**发行版**：Ubuntu（乌班图）、RedHat（红帽）、CentOS、Debain（蝶变）、Fedora、SuSE、OpenSUSE。

### Linux与Unix

Unix来源

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220406104729963.png)

Linux来源

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220406104804599.png)

Linux与Unix的关系

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220406104859580.png)

### 安装VM和CenOS

安装VMware

[下载 VMware Workstation Pro](https://www.vmware.com/products/workstation-pro/workstation-pro-evaluation.html)

许可证密钥：

ZF3R0-FHED2-M80TY-8QYGC-NPKYF
YF390-0HF8P-M81RQ-2DXQE-M2UT6
ZF71R-DMX85-08DQY-8YMNC-PPHV8

前面的如果已经失效，用下面的

FA1M0-89YE3-081TQ-AFNX9-NKUC0

CentOS7.6下载[Index of /7.6.1810/isos/x86_64 (centos.org)](https://vault.centos.org/7.6.1810/isos/x86_64/)

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220406161548896.png)

#### 网络连接的三种方式

1. 桥接模式：在本机的环境中占用一个ip地址，如果本机的环境有多个设备，可能会造成ip不够用的情况
2. NAT模式：网络地址转换模式。借用本机的ip与外界发生联系，虚拟系统可以与外部系统通讯，不造成IP冲突。就是把主机当场虚拟机对外的路由，只不过虚拟机只能当客户机对外发起请求，不能作为服务器接受外面的请求，因为外面不知道虚拟机的ip。
3. 主机模式：不与外界发生联系，为一个独立的系统

#### 虚拟机克隆

用来构建多个虚拟机以实现集群

- 1、直接拷贝一份安装好的虚拟机文件
- 2、使用vmware的克隆操作

注意：克隆时需要先关闭Linux系统。

#### 虚拟机快照

如果你在使用虚拟机系统的时候（Linux），你想回到原先的某一个状态，也就是说你担心可能有些误操作造成系统异常，需要回到原先某个正常运行的状态，vmware也提供了这样的功能，就叫快照管理。

#### 虚拟机迁移和删除

虚拟系统安装好了，它的本质就是文件（放在文件夹的），因此虚拟系统的迁移很方便，你可以把安装好的虚拟系统这个文件夹整体**拷贝或者剪切**到另外位置使用。删除也很简单，用vmware进行移除，再点击菜单->从磁盘删除即可，或者直接手动删除虚拟系统对应的文件夹即可。

### vmtools

介绍：

1. vmtools安装后，可以让我们在windows下更好的管理vm虚拟机。
2. 可以设置windows和centos的共享文件夹

安装步骤：

1. 进入cenos

2. 点击vm菜单的->**install vmware tools**

3. centos会出现一个vm的安装包，xx.tar.gz

4. 拷贝到/opt

5. 使用解压命令tar，得到一个安装文件，cd/opt（进入到opt目录）

   **tar -zxvf xx.tar.gz**

6. 进入该vm解压的目录，/opt目录下 **cd vmware......**

7. 安装  **./vmware-instal.pl**

8. 全部使用默认设置即可，就可以安装成功

9. 注意：安装vmtools需要有**gcc**，使用gcc -v查看

#### 设置共享文件夹

具体步骤：

菜单->vm->setting，设置选项为always enable，这样就可以读写了

共享文件夹在centos的 **/mnt/hgfs/** 下

注意：在实际开发中，文件的上传下载是需要使用远程方式完成的。

## 目录结构

### 基本介绍

1. linux的文件系统是采用级层式的树状目录结构，在此结构中的最上层是根目录"/"，然后在此目录下再创建其他的目录。
2. **在Linux世界里，一切皆文件**（Linux系统会把硬件也映射为文件）

### 具体的目录结构

- **/bin** [常用] （/user/bin、/user/local/bin）

  是Binary的缩写，这个目录存放着最经常使用的命令

- /sbin（/user/sbin、/user/local/sbin）

  s就是Super User的意思，这里存放的是系统管理员使用的系统管理程序。

- **/home**[常用]

  存放普通用户的主目录，在Linux中每个用户都有一个自己的目录，一半该用户名是以用户的账号命名

- **/root**[常用]

  该目录为系统管理员，也称作超级权限者的用户主目录

- /lib

  系统开机所需要的最基本的动态连接共享库，其作用类似与Windows里的DLL文件。几乎所有的应用程序都需要用到这些共享库

- /lost+found

  这个目录一般情况下是空的，当系统非法关机后，这里就存放了一些文件

- **/etc**[常用]

  所有的系统管理所需要的配置文件和子目录，比如安装mysql数据库  my.conf

- **/usr**[常用]

  这是一个非常重要的目录，用户的很多应用程序和文件都放在这个目录下，类似于Windows下的program files目录

- **/boot**[常用]

  存放的是启动Linux时使用的一些核心文件，包括一些连接文件和镜像文件

- /proc[不能动]

  这个目录是一个虚拟的目录，它时系统内存的映射，访问这个目录来获取系统信息

- /srv[不能动]

  service缩写，该目录一些服务启动之后需要提取的数据

- /sys[不能动]

  这是linux2.6内核的一个很大的变化。该目录下安装了2.6内核中新出现的一个文件系统sysfs

- /tmp

  这个目录是用来存放一些临时文件的

- /dev

  类似于windows的设备管理器，把所有的硬件用文件的形式存储

- **/mnt**[常用]

  系统提供该目录是为了让用户临时挂载别的文件系统的，我们可以将外部的存储挂在在/mnt/上，然后进入该目录就可以查看里面的内容了。

- /opt 

  这是给主机额外安装软件所存放的目录。如安装Oracle数据库就可放在该目录下。默认为空

- **/user/local**[常用]

  这是给另一个主机额外安装软件所安装的目录。一般是通过编译源码方式安装的程序

- **/var**[常用]

  这个目录中存放着在不断扩充着的东西，习惯将经常被修改的目录放在这个目录下。包括各种日志文件。

- /selinux[security-enhanced linux]

  SELinux是一种安全子系统，它能控制程序只能访问特定文件，有三种工作模式，可以自行设置。

  

# Linux实操

## 远程登录到Linux服务器

为什么需要远程登录Linux

1. linux服务器是开发小组共享
2. 正式上线的项目是运行在公网
3. 因此程序员需要远程登录到Linux进行项目管理或者开发

远程登录客户端有Xshell，Xftp，我们学习使用Xshell和Xftp

下载：[家庭/学校免费 - NetSarang Website (xshell.com)](https://www.xshell.com/zh/free-for-home-school/)

远程登录Linux-Xshell

- 介绍

Xshell是目前最好的远程登录到Linux操作的软件，流畅的速度并且完美解决了中文乱码的问题，是目前程序员首选的软件。

Xshell是一个强大的安全终端莫你软件，它支持SSH1，SSH2，以及Microsoft Windows平台的TELNET协议。

Xshell可以在Windows界面下用来访问远端不同系统下的服务器，从而比较好的达到远程控制终端的目的







查看Linux公网IP

指令： ifconfig

找到ens33(网卡)对应的inet

测试远程机器和linux主机玩过是否通畅

windows下cmd指令：ping Linux主机公网IP

### 远程文件传输

远程上传文件下载-Xftp

- 介绍

是一个基于windows平台的功能强大的SFTP、FTP文件传输协议。使用了Xftp以后，windows用户能安全地在UNIX/Linux和Windows PC之间传输文件

若连接后出现中文乱码，设置连接属性中的编码为UTF-8

## Vi和Vim编辑器

### 基本介绍

Linux系统会内置 vi 文本编辑器

Vim具有程序编辑的能力，可以看做是Vi的增强版本，可以主动的以字体颜色辨别语法的正确性，方便程序设计。代码补完、编译及错误跳转等方便编程的功能特别丰富，在程序员中被广泛使用。

### vi和vim常用的三种模式

- 正常模式

  以vim打开一个档案就直接进入一般模式了（这是默认的模式）。在这个模式中，你可以使用[上下左右]按键来移动光标，你可以使用[删除字符]或[删除整行]来处理档案内容，也可以使用[赋值、粘贴]来处理你的文件数据。

- 插入模式

  按下i、I、o、O、a、A、r、R等任何一个字母后才会进入编辑模式，一般来说按i即可

- 命令行模式

  输入esc，再输入 :  。在这个模式1当中，可以提供你相关指令，完成读取、粗闹闹、替换、离开vim、显示行号等的动作则是在此模式中达成的。

各种模式的切换

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220406205033038.png)

Vim常用快捷键：

- 拷贝当前行【yy】，拷贝当前行向下的5行【5yy】，粘贴【p】
- 删除当前行【dd】，删除当前行向下的5行【5dd】
- a在文件中查找某个单词（命令行下）【/关键字】+[回车]查找，输入【n】查找下一个
- 设置文件的行号（命令行下）【:set nu】，取消文件的行号【:set nonu】
- 编辑 /etc/profile文件，（一般模式下）使用快捷键到该文档的最末行【G】和最首行【gg】
- 撤销动作（一般模式下）【u】
- 将光标移动到20行（一般模式下）【20】+ [shift+g]

![](https://img-blog.csdnimg.cn/20191219104939654.jpg?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3d3d19oZWxsb3dvcmxkX2NvbQ==,size_16,color_FFFFFF,t_70)

## 关机、重启和用户登录注销

### 关机&重启命令

- **shutdown -h now**     ("h"->"halt   停止")立刻进行关机
- **shutdown -h    1**         "hello,1 分钟后会关机了"
- **shutdown**                   默认一分钟后关机
- **shutdown -r now**       ("r"->"reboot 重启")现在重新启动计算机
- **halt**                               关机，作用和上面一样
- **reboot**                          现在重新启动计算机
- **sync**                              ("synchronize   同步")把内存的数据同步到磁盘

注意

1. 不管是重启系统还是关闭系统，首先要运行sync命令，把内存中的数据写到磁盘中。
2. 目前的 shutdown/reboot/halt 等命令均已经在关机前进行了sync，但小心驶得万年船。

### 用户登录和注销

基本介绍

1. 登录时尽量少用root账号登录，因为它是系统管理员，最大的权限，避免操作失误，可以利用普通账户登录，登录后再用“ **su - 用户名**”命令来切换成系统管理员身份
2. 在提示符下输入**logout**即可注销用户

注意：logout注销指令在图形运行级别无效，在运行级别3下有效。

## 用户管理

### 基本介绍

Linux系统是一个多用户多任务的操作系统，任何一个要使用系统资源的用户，都必须首先向系统管理员申请一个账户，然后以这个账户的身份进入系统。

### 用户

#### 添加用户

- **useradd 用户名**     添加一个用户(例如：tom) ，默认该用户的家目录在/home/tom
- **useradd -d 用户名**  （"d"->"directory"）给新创建的用户指定家目录

当用户创建成功后，会自动的创建和用户同名的家目录（默认）。

#### 指定/修改密码

- **password 用户名**   给指定的用户设置密码
- **pwd**                         （print word directory）显示当前用户所在的目录

#### 删除用户

- **userdel 用户名**    删除该用户，但是保留对应的家目录（home）
- **userdel -r 用户名** 删除用户以及用户主目录（删除其对应的家目录）

一般情况下建议保留家目录。

#### 查询用户信息指令         

- **id 用户名 **                 返回uid（userid）、gid（groupid）、组

当用户不存在时，返回 无此用户。

#### 切换用户

介绍

在操作Linux中，如果当前用户的权限不够，可以通过 su - 指令，切换到高权限用户，比如root。

- **su - 切换用户名**    （swich user）

1. 从权限高的用户切换到权限低的用户，不需要输入密码，反之需要。
2. 当需要返回到原来用户时，使用 **exit** / **logout** 指令

查看当前用户/登录用户

- **who am i**            查看最开始登录到Linux主机的用户
- **whoami**              查看当前用户

### 用户组

介绍

类似于角色，系统可以对有共性的多个用户进行同一的管理。

#### 新增组

- **groupadd 组名**     					 新增组

#### 删除组

- **groupdel 组名**                           删除组

#### 修改组

- **useradd -g 用户组 用户名**        （"g"->"group"）增加用户时直接放入指定的组
- **usermod -g 用户组 用户名**         把指定的用户的组改为指定的组

### 用户和组相关文件

- **/etc/passwd**    		用户（user）的配置文件，记录用户的各种信息。
  - 每行的含义：**用户名:口令:用户标识号(uid):组标识号(gid):注释性描述:主目录(家目录)**
- **/etc/shadow**                口令的配置文件
  - 每行的含义：**登录名:加密口令:最后一次修改时间:最小时间间隔:最大时间间隔:警告时间:不活动时间:失效时间:标志**
- **/etc/group**                    组(group)的配置文件，记录Linux包含的组的信息
  - 每行的含义：**组名:口令:组标识号:组内用户列表**

## 实用指令

### 运行级别

运行级别说明：

0：关机

1：单用户（找回丢失密码）

2：多用户状态没有网络服务

**3：多用户状态有网络服务**

4：系统未使用保留给用户

**5：图形界面**

6：系统重启

- **init 级别**       切换不同的运行级别[0123456]

在CentOS7以前，/etc/inittab文件中

之后进行了简化，如下：

**multi-user.target**：analogous to runlevel 3

**graphical.target**：analogous to level 5

#To view current default target,run

- **systemctl get-default**                                  查看当前系统默认级别

#To set a default target,run

- **systemctl set-default TARGET.target**       设置系统默认级别为指定的级别

### 找回root密码

1. 启动系统，进入开机界面，在界面中迅速按下"e"进入编辑界面
2. 进入编辑界面，使用键盘上的上下键把光标网下移动，找到以"**Linux16**"开头内容所在的行数，在行的最后面输入 **init=/bin/sh**
3. 接着，输入完成后，直接按快捷键：**Ctrl+x** 进入**单用户模式**
4. 接着，在光标闪烁的位置中输入： **mount -o remount,rw /**   (注意：各个单词键有空格)，完成后按家农安的回车键(Enter)
5. 在新的一行最后面输入： **passwd**  ，完成后按键盘的回车键(Enter)，输入密码，然后再次确认密码即可。密码修改完成后，会显示 passwd......的样式，说明密码修改成功
6. 接着，在鼠标闪烁的位置中（最后一行中）输入：**touch /.autorelabel**  ，（注意：touch与/之间有一个空格），完成后按键盘的回车键（Enter）
7. 继续在光标闪烁的位置中，输入：**exex /sbin/init**  ，（注意：exec与/之间有一个空格），完成后按键盘的回车键(Enter)，等待系统自动修改密码，完成后系统会自动重启，新的密码生效了  

### 帮助指令

man  获得帮助信息

- man [命令或配置文件]          获得帮助信息

例如：查看ls命令的帮助信息     man ls

在linux下，隐藏文件是以  **.** 开头，选项可以组合使用，比如 ls -al，ls -al /root

help指令

- help [命令]                获得shell内置命令的帮助信息

例如：查看cd命令的帮助信息： help cd

直接百度

### 文件目录类

##### pwd

- **pwd**                （print work directory） 显示当前工作目录的绝对路径

##### ls

- **ls [选项] [目录或是文件]**                 （list）

  常用选项

  - **-a** ：显示当前目录所有的文件和目录，包括隐藏的
  - **-l** ：以列表的方式显示信息
  - **-h**：（human）按照适合人阅读的方式显示

##### cd

- **cd [参数]**          切换到指定目录（可定位**绝对路径**或**相对路径**）
  - **cd ~**            回到自己的家目录
  - **cd ..**             回到当前目录的上一级目录

##### mkdir

- **mkdir [选项] 要创建的目录**               （make directory）创建目录
  - **-p** ：创建多级目录

##### rmdir

- **rmdir [选项] 要删除的空目录**               (remove directory)删除空目录

  - **rm -rf**  要删除的目录                      （recurse force）强制删除非空目录        

    

##### touch       

- **touch 文件名称**                                      创建空文件

##### cp

- **cp [选项]  source dest**

  - **-r** ：递归复制整个文件夹

    例子：1、将/home/hello.txt拷贝到/home/bbb目录下：

    ​			cp hello.txt /home/bbb

    ​			2、递归复制整个文件夹，将/home/bbb整个目录，拷贝到/opt

    ​			cp -r /home/bbb /opt

  - 强制覆盖不提示的方法：\cp -r  /home/bbb /opt

##### rm

- **rm [选项] 要删除的文件或目录**           （remove）移除文件或目录

  - **-r** ：递归删除整个文件夹

  - **-f** ：强制删除不提示

    例子：1、将/home/hello.txt删除

    ​			rm /home/hello.txt

    ​			2、递归删除整个文件夹.home/bbb

    ​			**rm -rf** /home/bbb（删除整个文件夹，不提示）

##### mv

- **mv [old] [new]**                        移动文件与目录或重命名

  - mv oldFileName newFileName    			                          （要求在同一文件夹下）重命名

  - mv /temp/movefile /targetFolder                                         移动文件

  - mv /temp/movefile /targetFolder/newFileName                移动文件并重命名

    例子：1、将/home/cat.txt文件重命名为pig.txt                     mv cat.txt pig.txt

    ​			2、将/home/pig.txt文件移动到/root目录下			   mv /home/pig.txt /root

    ​			3、移动整个目录，比如将/opt/bbb移动到/home下  mv /opt/bbb /home/

##### cat

- **cat [选项] 要查看的文件**             查看文件内容（只读）

  - **-n**     显示行号

    例： cat -n /etc/profile

  - cat只能浏览文件，而不能修改文件，为了浏览方便，一般会带上**管道命令** **| more**

  - cat -n /etc/profile | more [进行交互]

##### more

- **more 要查看的文件**
  - more指令是一个基于VI编辑器的文本过滤器，它以全屏幕的方式按页显示文本文件的内容。more指令中内置了若干快捷键（交互的指令）：
    - **空白键（space）**               向下翻一页
    - **Enter**                                   向下翻一行
    - **q**                                           立刻离开more，不再显示该文件内容
    - **Ctrl + F**                                 向下滚动一屏
    - **Ctrl + B**                                 返回上一屏
    - **=**                                            输出当前行的行号
    - **:f**                                            输出文件名和当前行的行号 

##### less

- **less 要查看的文件**                              分屏查看文件内容
  - less指令用来分屏查看文件内容，它的功能与more指令类似，但是比more指令更加强大，支持各种显示终端。less指令在显示文件内容是，并不是一次将整个文件加载之后蔡先生，而是根据显示需要加载内容（懒汉式），对于显示大型文件具有较高的效率。less内置了若干快捷键：
    - **空白键**                                   向下翻动一页
    - **[pagedown]**                         向下翻动一页
    - **[pageup]**                               向上翻动一页
    - **/字串**                                      向下搜寻[字串]的功能；n：向下查找；N：向上查找
    - **?字串**                                      向上搜寻[字串]的功能；n：向上查找；N：向下查找
    - **q**                                             离开less这个程序

##### echo

- **echo [选项] [输出内容]**                       输出内容到控制台

  - 例子：1、使用echo指令输出环境变量：    echo $HOSTNAME

    ​            2、使用echo指令输出hello world    echo "hello world"

##### head

- **head [选项] 文件**              显示文件的开头部分，默认情况下显示文件的前10行

  - head 文件   								  查看文件头10行内容

  - head -n 5 文件                             查看文件的前5行内容，5可以是任意行数

    例子：查看/etc/profile的前5行代码：       head -n 5 /etc/profile

##### tail

- **tail [选项] 文件**                   输出文件中尾部的内容，默认情况下tail指令显示文件尾10内容

  - tail 文件                        查看文件为10行内容

  - tail -n 5 文件                查看文件尾5行内容，5可以是任意行数

  - tail -f 文件                    实时追踪该文档的所有更新

    例子：1、查看/etc/profile的尾5行代码：        tail -n 5 /etc/profile

    ​			2、实时监控 mydate.txt：  tail -f /home/mydate.txt   

##### .> >>

- **输出重定向>和>>追加**
  - ls -l > 文件                     将列表的内容写入文件（覆盖）
  - ls -al >> 文件                 将列表的内容追加到文件的末尾
  - cat 文件1 > 文件2          将文件1的内容覆盖到文件2
  - echo "内容" >> 文件       将内容追加到文件末尾

##### ln

- **ln -s [原文件或目录] [软链接名]**                 给原文件创建一个软链接

  例子：1、在/home目录下创建一个软连接myroot，连接到/root目录： ln -s /root /home/myroot

  ​            2、删除软连接myroot：      rm /home/myroot

  - 当我们使用pwd指令查看目录时，仍然看到的时软链接所在目录

##### history

- **history**                        查看已经指向过的历史命令，也可以执行历史指令

  例子：1、显示所有的历史命令：                     history

  ​            2、显示最近使用过的10个指令：         history 10

  ​			3、执行历史编号为5的指令：               !5

### 时间日期类

##### date

- **date指令**  显示当前日期

  - **date**														显示当前时间

  - **date +%Y**                                                显示当前年份

  - **date +%m**                                              显示当前月份

  - **date +%d**                                                显示当前是哪一天

  - **date "+%Y-%m-%d %H:%M:%S"**          显示年月日时分秒

    例子：1、显示当前时间信息：			   date

    ​            2、显示当前时间年月日：           date "+%Y-%m-%d"

    ​            3、显示当前时间年月日时分秒：date "+%Y-%m-%d %H:%M:%S"  

- date指令  设置日期

  - **date -s 字符串时间**

    例子：设置系统当前时间为2020-11-03 20:00:00：date =s "2020-11-03 20:00:00"

##### cal

- cal指令      查看日期

  - cal [选项] [[[日] 月] 年]          不加选项，显示本月日历

    例子：1、显示当前日历：cal

    ​			2、显示2022年日历：cal 2022

### 搜索查找类

##### find

- **find [搜索范围] [选项]**                从指定的目录向下递归地遍历其各个子目录，将满足条件的文件或者目录显示在终端

  - **-name [查询方式]**：按照指定的文件名查找模式查找文件

  - **-user [用户名]**：查找属于指定用户名所有文件

  - **-size [文件大小]**：按照指定的文件大小查找文件

    - **+n** 大于

    - **-n** 小于

    - **n** 等于

      单位：**k  M  G**

    例子：1、按文件名查找/home目录下的hello.txt文件：find /home -name hello.txt

    ​			2、按拥有者查找/opt目录下，用户名为root的文件：find /opt -user root

    ​			3、查找整个linux系统下大于200M的文件：find / -size +200M

##### locate

- **locate [搜索文件]**          定位文件路径

  - locate指令可以快速定位文件路径，locate指令利用事先建立的系统中所有文件名称及路径的locate数据库实现快速定位给定的文件。locate指令无需遍历整个文件系统，查询速度比较快。为了保证查询结果的准确度，管理员必须定期更新locate时刻。

  - 由于locate指令基于数据库进行查询，所以第一次运行前，必须使用**updatedb**指令创建locate数据库。

    例子：使用locate指令快速定位hello.txt文件所在目录

##### which

- **which [指令]**                    查看某个指令的路径

##### grep |

- **grep指令和管道符号 |**

  - grep过滤查找；管道符 "|" 表示将前一个命令的处理结果输出传递给后面的命令处理。

  - **grep [选项] 查找内容 原文件**

    - **-n**：显示匹配行及行号
    - **-i**：忽略字母大小写

    例子：在hello.txt文件中查找"yes"所在行，并显示行号

    1、cat /home/hello.txt | grep -n "yes"

    2、grep -n "yes" /home/hello.txt

### 压缩和解压

##### gzip

- **gzip 文件**                  压缩文件，只能将文件压缩为*.gz文件

##### gunzip

- **gunzip 文件.gz**         解压缩文件

  例子：1、将/home下的hello.txt文件进行压缩：           gzip /home/hello.txt

  ​			2、将/home下的hello.txt.gz文件进行解压缩：  gunzip /home/hello/txt/gz

##### zip

- **zip [选项] XXX.zip  将要压缩的内容**                             压缩文件和目录的命令
  - **-r**：递归压缩，即压缩目录

##### unzip

- **unzip [选项] XXX.zip**                                                     解压缩文件

  - **-d< 目录 >**：指定解压缩后文件的存放目录

  例子：1、将/home下的所有文件/文件夹进行压缩成myhome.zip：zip -r myhome.zip /home/

  ​			2、将myhome.zip解压到/opt/tmp目录下：unzip -d /opt/tmp /home/myhome.zip 

##### tar

- **tar [选项] XXX.tar.gz 打包的内容**                       打包目录，压缩后的文件格式为.tar.gz

  - **-c**：产生.tar打包文件

  - **-v**：显示详细信息

  - **-f**：指定压缩后的文件名

  - **-z**：打包同时压缩

  - **-x**：解包.tar文件

    例子：1、压缩多个文件，将/home/pig.txt和/home/cat.txt压缩成pc.tar.gz:

    ​					tar -zcvf pc.tar.gz /home/pig.txt /home/cat.txt

    ​			2、将/home的文件夹压缩成myhome.tar.gz：

    ​					tar -zcvf myhome.tar.gz /home/

    ​			3、将pc.tar.gz解压到当前目录：

    ​					tar -zxvf pc.tar.gz

    ​			4、将myhome.tar.gz解压到/opt/tmp2目录下：

    ​					tar -zxvf /home/myhome.tar.gz -C /opt/tmp2

## 组管理和权限管理

基本介绍

在linux中的每个用户必须属于一个组，不能独立于组外。在linux中每个文件有所有者、所在组、其他组的概念。

### 文件/目录所有者

#### 修改文件/目录所有者

- `ls -ahl `					    查看文件的所有者和所在组

- `chown 用户名 文件/目录名`     （**ch**ange **own**er）修改文件/目录所有者
- `chown 用户名:组名 文件/目录`      修改文件/目录的所有者和所在组
- `chown -R 用户名 目录`                 修改该目录下所有文件和目录的所有者

### 文件/目录所在组

当某个用户创建了一个文件后，这个文件的所在组默认就是该用户所在的组。

#### 改变用户所在组

- `useradd -g 组名 用户名`  添加一个用户并将其所在组设置为给定的组
- `chgrp 组名 文件/目录名`                                 (**ch**ange **gr**ou**p**)修改文件/目录所在组
- `chgrp -R 组名 目录名`                                 修改目录下所有文件和组的所在组

### 其它组

除文件的所有者和所在组的用户外，系统的其他用户都是文件的其他组。



- `usermod -g 新组名 用户名`          
- `usermod -d 目录名 用户名`              改变该用户登录的初始目录。（用户需要有进入到新目录的权限）

### 权限管理

0-9位说明：

1. `0` 确定文件类型
   - `l`      链接，相当于windows的快捷方式
   - `d`     目录，相当于windows的文件夹
   - `c`      字符设备文件，鼠标，键盘
   - `b`      块设备，如硬盘
   - `-`     普通文件
2. `1-3`确定所有者(该文件的所有者)拥有该文件的权限      ---User
3. `4-6`确定所属组(同用户组的用户)拥有该文件的权限       ---Group
4. `7-9`确定其他用户拥有该文件的权限                                 ---Other

rwx权限

- rwx作用到文件
  - r代表可读：可读取，查看
  - w代表可写：可修改，但不代表可删除(删除文件意味着修改目录，所以必须要有对该文件所在目录有写权限)
  - x代表可执行：可以被执行
- rwx作用到目录
  - r代表可读：可以读取，ls查看目录内容
  - w代表可写：可以修改，对目录内创建+删除+重命名目录
  - x代表可执行：可以进入该目录

案例：

drwxr-xr-x. 18 root root 4.0K 4月   9 23:53 .config

数字表示权限：r=4,w=2,x=1，即rwx=7

- 18   文件：硬链接数   目录：子目录数
- root         用户
- root          组
- 4.0K         文件大小（字节），若是文件夹，显示4096字节（4.0K）
-  4月   9 23:53  最后修改日期
- .config        文件名或目录名

#### 修改权限

通过chmod指令，可以修改文件或者目录的权限

1. +、-、=变更权限

   `u`:所有者、`g`:所在组、`o`:其他人、`a`:所有人（ugo）

   `+`:增加权限、`-`除去权限、`=`设置权限

   - `chmod u=rwx,g=rx,o=x` 文件/目录名
   - `chmod o+w` 文件目录名
   - `chmod a-x `文件目录名

2. 通过数字变更权限

   r=4、w=2、x=1        rwx=7

   - `chmod u=rwx,g=rx,o=x` 文件/目录名   相当于

     `chmod 751 `文件/目录名

## 定时任务调度

### crond任务调度

#### 概述

任务调度：是指系统在某个时间执行的特定的命令或程序

 任务调度分类：

1. 系统工作：有些重要的工作必须周而复始地执行，如病毒扫描
2. 个别用户工作：个别用户可能希望执行某些程序，比如对mysql数据库的备份

#### 基本语法 

- crontab [选项]

  常用选项

  - -e         编辑crontab定时任务
  - -l          查询crontab任务
  - -r          删除当前用户所有的crontab任务

例子：设置任务调度文件 /etc/crontab

设置个人任务调度。执行crontab -e命令。接着输入任务到调度文件

如：* /1 * * * * ls -l /etc/ > /tmp/to.txt

意思是每小时的每分钟执行 ls -l /etc/ > /tmp/to.txt 命令                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        

#### 参数细节说明

`*`

- 第一个*        一小时当中的第几分钟   0-59

- 第二个*        一天当中的第几小时      0-24
- 第三个*        一个月当中的第几天       1-31
- 第四个*         一年当中的第几个月     1-12
- 第五个*        一周当中的星期几           0-7（0和7都表示星期日）   

`,`

- 代表不连续的时间。比如"0 8,12,16 * * * "代表每天的8:00、12:00、16:00都执行一次命令

`-`

- 代表连续的时间范围。比如"0 5 * * 1-6"代表周一到周六的5:00执行命令

`*/n`

- 代表每个多久执行一次。比如"*/10 * * * *"代表每隔10分钟执行一次命令

应用实例：

1. 每隔一分钟，就将当前的日期信息追加到/tmp/mydate中

   crontab -e

   *\1 * * * * date >> /tmp/mydate

2. 每隔一分钟，将当前日期和日历都追加到/home/mycal文件中

​		vim /home/my.sh写书内容date >> /home/mycal 和cal >> /home/mycal

​		给my.sh增加执行权限：chmod u+x /home/my.sh

​		contab -e增加*\1 * * * * /home/my.sh

   3.每天凌晨2:00将mysql数据库testdb备份到文件中。

​		crontab -e

​		0 2 * * * mysqldump -u root -p password testdb > /home/db.bak

#### 相关指令

- `crontab -r` 终止任务调度
- `crontab -l` 列出当前有哪些任务调度
- `service crond restart` 重启任务调度

### at定时任务

#### 基本介绍

at命令是**一次性**定时计划任务，at的守护进程atd会以后台模式运行，检查作业队列来运行。

默认情况下，atd守护进程每60秒检查作业队列，有作业时，会检查作业运行时间，如果时间与当前时间匹配，则运行此作业。

at命令是一次性定时计划任务，执行完一个任务后不在执行此任务了。

在使用at命令时，**一定要保证atd进程的启动**，可以使用相关指令来查看：

​	`ps -ef | grep atd`检测atd是否运行

#### at命令格式

- `at [选项] [时间]`         Ctrl+D结束at命令的输入

  ##### 选项：

  - `-m`               (mail)当指定的任务被完成后，将给用户发送邮件，即使没有标准输出。
  - `-I`                   atq的别名
  - `-d`                   atrm的别名
  - `-v`                   显示任务将被执行的时间
  - `-c`                   打印任务的内容到标准输出
  - `-V`                    显示版本信息
  - `-q <队列>`       使用指定的队列
  - `-f <文件>`        从指定文件读入任务而不是从标准输入读入
  - `-t <时间参数>`  以时间参数的形式提交要运行的任务

  ##### 时间定义：

  - 接受在当天的hh:mm(小时:分钟)式的时间指定。假如该时间已过去，那么在第二天执行。例如:04:00
  - 使用midnight、noon、teatime等比较模糊的词语
  - 采用12小时计时制，即在时间后面加上AM或PM来说明是上午还是下午。例如:12pm
  - 指定命令执行的具体日期，格式为month day(月 日)或mm/dd/yy（月/日/年）或dd.mm.yy(日.月.年)，指定的日期必须跟在指定时间的后面。例如：04:00 2021-03-1.
  - 使用相对计时法。格式为now + count time-units
    - now 当前时间。
    - count 时间的数量。
    - time-units 时间单位，如minutes、hours、days、weeks。
    - today、tomorrow

- `atq `           查看系统中没有执行的工作任务

- `atrm 编号`            删除以及设置对的任务

## 磁盘分区和挂载

### Linux分区

#### 原理介绍

1. Linux无论有几个分区，分给哪一目录使用，它归根结底就只有一个根目录，一个独立且唯一的文件结构，Linux中每个分区都是用来组成整个文件系统的一部分。
2. Linux采用了一种叫**载入**的处理方法，它的整个文件系统中包含了一整套的文件目录，且将一个分区和一个目录联系起来。这时要载入的一个分区将使它的存储空间在一个目录下获得。

#### 硬盘说明

Linux硬盘分IDE硬盘和SCSI硬盘，目前基本上是SCSI硬盘。

1. 对于IDE硬盘，驱动器标识符为`hdx~`,其中`hd`表明分区所在设备的类型，这里是指IDE硬盘。`x`为盘号(a为基本盘、b为基本从属盘、c为辅助主盘、d为辅助从属盘)，`~`代表分区，前四个分区用数字1到4表示，它们是主分区或扩展分区，从5开始就是逻辑分区。例如：hda3表示第一个IDE硬盘上的第三个主分区或扩展分区。
2. 对于SCSI硬盘则表示为`sdx~`，SCSI硬盘是用sd来表示分区所在设备的类型，其余则和IDE硬盘的表示方法一样。

#### 查看所有设备挂载情况

- `lsblk`
- `lsblk -f`

#### 虚拟机增加磁盘步骤

1. 在虚拟机菜单选择设置，**添加硬盘**，中间只在选择磁盘大小的地方需要修改，完成后**重启系统**。

2. **分区**命令:`fdisk /dev/sdb`

   - `m`      显示命令列表

   - `p `      显示磁盘分区，同fdisk -l

   - `n `      新增分区

   - `d   `      删除分区

   - `w`      写入并退出

   - `q    `      退出

     开始分区后输入n新增分区，然后p，分区类型为主分区两次回车默认剩余全部空间。

3. **格式化磁盘**：`mkfs -t ext4 /dev/sdb1`       ext4是文件类型

4. **挂载**：`mount 设备名称 挂载目录`     将一个分区与一个目录联系起来

   **卸载**：`umount 设备名称/挂载目录` 

   ​	注意：用命令行挂载重启后会失效

5. **永久挂载**：通过修改/etc/fstab实现挂载。添加完成后，执行`mount -a`即刻生效

#### 磁盘情况查询

##### 查询系统整体磁盘使用情况

- `df -h`

##### 查询指定目录的磁盘占用情况

- `du -h 目录名` 查询指定目录的磁盘占用情况，默认为当前目录

  选项

  - `-s` 指定目录占用大小汇总
  - `-h` 带计量单位
  - `-a` 含文件
  - `--max-depth=1 `子目录深度
  - `-c` 列出明细的同时，增加汇总值

#### 磁盘情况实用指令

- 统计文件夹下文件的个数

  `ls -l 目录名 | grep "^-" | wc -l`

- 统计文件夹下目录的个数

  `ls -l 目录名 | grep "^d" | wc -l`

- 统计文件夹下文件的个数,包括子文件夹

  `ls -lR 目录名 | grep "^-" | wc -l`

- 统计文件夹下目录的个数,包括子文件夹

  `ls -lR 目录名 | grep "^d" | wc -l`

- 以树状形式显示目录结构tree（若没有tree，则使用`yum install tree` 安装）

  `tree 目录名`

## 网络配置

### Linux网络配置原理

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220411184427338.png)

### 查看网络IP和网关

#### 查看网关

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220411185151773.png)

#### 查看window环境下的VMnet8网络配置

`ipconfig`

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220411185719206.png)

或者

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220411185633522.png)

#### 查看linux的配置

`ifconfig`

ens33为设备名

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220411185751325.png)

### ping 测试主机之间的网络连通性

`ping 目的主机`      测试当前服务器是否可以连接目的主机

如 `ping www.baidu.com`

### Linux网络环境配置

#### 自动获取

登陆后，通过界面的来设置自动获取IP

特点：linux启动后会自动获取IP

缺点：每次自动获取的ip地址可能不一样

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220411190212430.png)

#### 指定IP

直接修改配置文件来指定IP，并可以连接到外网。

编辑 vim /etc/sysconfig/network-scripts/ifcfg-ens33

要求：将IP地址配置为静态的，比如：ip地址为192.168.135.135

文件内容如下：

TYPE="Ethernet"
PROXY_METHOD="none"
BROWSER_ONLY="no"
**BOOTPROTO="dhcp"**                                                       #dhcp代表自动分配
DEFROUTE="yes"
IPV4_FAILURE_FATAL="no"
IPV6INIT="yes"
IPV6_AUTOCONF="yes"
IPV6_DEFROUTE="yes"
IPV6_FAILURE_FATAL="no"
IPV6_ADDR_GEN_MODE="stable-privacy"
NAME="**ens33**"
UUID="132f1f71-be6d-4720-a298-3a345244d67a"
DEVICE="ens33"
**ONBOOT="yes"**                                                                  #yes代表自动分配
ZONE=

修改处：

**BOOTPROTO="dhcp"**      =>**BOOTPROTO="static"**         #改成静态分配

​	新增：

**IPADDR**=192.168.135.135                                  #IP地址

**GATEWAY**=192.168.135                                   #网关

**DNS1**=192.168.135.2                                            #域名解析器

在虚拟网络编辑器中修改子网IP和网关的网段，使其与Linux服务器的IP地址处于同一个网段

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220411193223824.png)

重启网络服务`service network restart`

或重启系统`reboot`生效

### 设置主机名和hosts映射

#### 设置主机名

为了方便记忆，可以给linux系统设置主机名，也可以根据需要修改主机名

`hostname`   查看主机名

修改文件在 /etc/hostname指定

修改后，重启生效

#### 设置hosts映射

在windows中：

​	在C:\Windows\System32\drivers\etc\hosts 文件指定即可

格式： `目标ip地址  目标主机名`  

例如     `192.168.135.135 yumoyumo`

在linux中：

​	在/etc/hosts文件指定

格式： `目标ip地址  目标主机名`  

例如	`192.168.135.1 LAPTOP-NFK7B01H`

之前的`ping ip地址`便可以替换成`ping 主机名`

#### 主机名解析过程（Hosts、DNS）

##### Hosts

一个文本文件，用来记录IP和Hostname(主机名)的映射关系

##### DNS

DNS，即 Domain Name System的缩写，翻译过来就是域名系统

是互联网上作为域名和IP地址相互映射的一个分布式数据库，有一组服务器。

DNS的作用是把网络地址（域名，以一个字符串的形式）对应到真实的计算机能够识别的网络地址（IP地址），以便计算机能够进一步通信，传递网址和内容等。

应用实例：用户在浏览器输入了www.baidu.com

1. 浏览器先检查**浏览器缓存**中有没有该域名解析IP地址，若有则先调用这个IP完成解析；若没有，就检查**DNS解析器缓存**。若有则返回IP完成解析。这两个缓存可以理解为**本地解析器缓存**。
2. 一般来说，当电脑第一次成功访问某一网站后，在一定时间内，**浏览器**或**操作系统**会缓存他的IP地址（DNS解析记录），如在cmd窗口中输入
   - `ipconfig /displydns`             **DNS域名解析缓存**
   - `ipconfig /flushdns`               手动清理dns缓存
3. 如果本地解析器缓存没有找到对应映射，则检查系统中**hosts文件**中有没有配置对应的域名IP映射，若有，则完成解析并返回。
4. 如果**本地DNS解析器缓存**和**hosts文件**中均没有找到对应的IP，则到**域名服务DNS**进行解析域。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220411202858790.png)

#### DNS域名劫持

DNS（域名系统）劫持又叫域名劫持，指攻击者利用其他攻击手段（如修改hosts映射关系），篡改了某个域名的解析结果，使得指向该域名的IP变成了另一个IP，导致对相应网址的访问被劫持到另一个不可达的或者假冒的网址，从而实现非法窃取用户信息或者破坏正常网络服务的目的。。

由于域名劫持往往只能在特定的被劫持的网络范围内进行，所以在此范围外的域名服务器（DNS）能够返回正常的IP地址，高级用户可以在网络设置把DNS指向这些正常的域名服务器以实现对网址的正常访问。所以域名劫持通常相伴的措施——封锁正常DNS的IP。如果知道该域名的真实IP地址，则可以直接用此IP代替域名后进行访问。比如访问百度域名，可以把访问改为202.108.22.5，从而绕开域名劫持 。

## 进程管理

### 基本介绍

在Linux中，每个执行的程序都称为一个进程。每一个进程都分配一个ID号（pid，进程号）。

每个进程都可能以两种方式存在的，即前台和后台。前台进程就是用户目前的屏幕上可以进行操作的。后台进程则是实际在操作，但在屏幕上无法看到的进程，通常使用后台方式执行。

一般系统的服务都是以后台进程的方式存在，而且都会常驻在系统中，直到关机才结束。

### 显示系统执行的进程

#### 基本介绍

ps命令是用来查看目前系统中有哪些进程正在执行，以及它们的执行状况。

##### ps -aux

`ps [选项]`

- `-a `显示当前终端的所有进程信息

- `-u `以用户的格式显示进程信息

- `-x `显示后台进程运行的参数

  `ps -aux`

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220412123115655.png)

详解：

- USER                 用户名称
- PID                    进程号
- %CPU                进程占用CPU的百分比
- %MEM               进程占用物理内存的百分比
- VSZ                     进程占用的虚拟内存大小(单位:KB)
- RSS                     进程占用的物理内存大小(单位:KB)
- TTY                     终端名称，缩写 
- STAT                   进程状态。
  - S-    		 睡眠
  - s-             表示该进程是会话的先导进程
  - N-            表示进程拥有比普通优先级更低的优先级
  - R-             正在运行
  - D-             短期等待
  - Z-             僵死进程
  - T-             被跟踪或被停止等
- STAETED                进程的启动时间
- TIME                       CPU时间，即进程使用CPU的总时间
- COMMAND             启动进程所用的命令和参数，如果过长会被截断显示。

#### 父子进程

##### ps -ef

`ps [选项]`

- `-e    `         显示所有进程

- `-f    `         全格式

  `ps -ef`

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220412124530630.png)

- UID                     用户ID
- PID                      进程ID
- PPID                    父进程ID
- C                          CPU用于计算执行优先级的因子。数值越大，表面进程是CPU密集型运算，执行优先级会降低；数值越小，表明进程是I/O密集型运算，执行优先级会提高。
- STIME                   进程启动的时间
- TTY                        完整的终端名称
- TIME                      CPU时间
- CMD                      启动进程所用的命令和参数

注意：ps -ef和ps- aux为两种不同的显示风格

### 终止进程

介绍：

若是某个进程执行一般需要停止时，或是已经消耗了很大的系统资源时，此时可以考虑停止该进程，使用kill命令来完成此项任务。

##### kill

- `kill [选项]  进程号/名`               通过进程号杀死/终止进程
  - `-9   `    强迫进程立即停止
- `killall  进程名 `                      通过进程名杀死/终止进程，支持通配符，可同时杀死该进程下的所有子进程。

例子：

1. 踢掉某个非法用户

   `ps -ef | grep sshd`        查看远程连接的用户进程id

   `kill 该用户pid`

2. 终止远程登录服务sshd

   `kill sshd对应的进程号`

   重启sshd服务

   `/bin/systemctl start sshd.service`

3. 终止多个gedit 

   `killall gedit`

4. 强制杀死一个终端

   `kill -9 bash对应的进程号`

### 查看进程树

#### pstree

- `pstree [选项]`      查看进程树
  - `-p`            显示进程的PID
  - `-u `            显示进程的所属用户

### 服务管理

#### 介绍

服务(service)本质就是进程，但是是运行在后台的，通常都会监听某个端口，等待其他程序的请求。比如(musqld、sshd、防火墙等)，因此我们有称服务为**守护进程**。

##### service

- `service 服务名 [start|stop|restart|reload|status]`  启动/中止/重启/重载/查看服务

注意：在CentOS7.0后很多服务不再使用service，而是systemctl

查看服务名：

1. `setup`
2. `ls -l /etc/init.d`

例子：使用service指令 查看/关闭/启动 network服务

`service network status/stop/start`

#### 服务的运行级别

Linux系统有七种运行级别，常用的是级别3和5

0：系统停机状态，系统默认运行级别不能设为0，否则不能正常启动。

1：单用户工作状态，root权限，用于系统维护，禁止远程登陆。

2：多用户状态（没有NFS），不支持网络

**3：完全的多用户状态（有NFS），五姐妹，登陆后进入控制台命令行模式**。

4：系统未使用，保留。

**5：X11控制台，登陆后进入图形GUI模式**。

6：系统正常关闭并重启，默认运行级别不能设为6，否则不能正常启动。

- **init 级别**       切换不同的运行级别[0123456]

在CentOS7以前是在/etc/inittab文件中

之后进行了简化，如下：

**multi-user.target**：analogous to runlevel 3

**graphical.target**：analogous to level 5

#To view current default target,run

- **systemctl get-default**                                  查看当前系统默认级别

#To set a default target,run

- **systemctl set-default TARGET.target**       设置系统默认级别为指定的级别

##### chkconfig

介绍

通过chkconfig命令可以给服务的各个运行级别设置自 启动/关闭

chkconfig指令可管理的服务在 /etc/init.d 查看

注意：在CentOS7.0后，很多服务使用systemctl管理。

- `chkconfig --list [| grep xxx]` 查看所有服务
- `chkconfig 服务名 --list [| grep xxx]` 查看某一个服务
- `chkconfig --level 5 服务名 on/off`        设置某一运行级别下的某一服务的自启动/关闭

chkconfig重新设置服务后自启动或关闭，需要重启生效。

##### systemctl

###### 管理指令

- `system [start|stop|restart|status] 服务名`  开启/关闭/重启/查看 服务

systemctl指令管理的服务在 **/usr/lib/systemd/system** 查看，`d`代表`damon`**守护进程**

###### 设置服务的自启动状态

- `systemctl list-unit-files [| grep 服务名]` 查看服务开机启动状态
- `systemctl enable 服务名`              设置服务开机启动
- `systemctl disable 服务名`              关闭服务开机启动
- `systemctl is-enable 服务名`              查询某个服务是否是自启动的

例子：查看当前防火墙的状况，关闭防火墙和重启防火墙：

systemctl status firewalld

systemctl stop firewalld

systemctl restart firewalld

查看目前有哪些端口处于监听状态：**`netstat -anp | more`**

注意：

1. 关闭或启用防火墙后立即生效(在cmd使用telnet测试111端口)
2. `system [start|stop|restart|status] 服务名` 只是临时生效，重启后回归原配置
3. 使用`systemctl [enable|disable] 服务名` 设置某个服务自启动或关闭永久生效

#### 打开或关闭指定端口

在真正的生产环境，往往需要将防火墙打开，但如果打开防火墙，外部请求数据包就不能跟服务器监听端口通讯。这时需要打开指定端口。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220412184732403.png)

##### firewall

- `firewall-cmd --permanent --add-port=端口号/协议`                     打开端口
- `firewall-cmd --permanent --remove-port=端口号/协议`               关闭端口
- `firewall-cmd --reload`                                                                       重新载入
- `firewall-cmd --query-port=端口号/协议`                                          查询端口是否开放

**`netstat -anp | more`**查看端口协议

### 动态监控进程

##### top

top与ps命令很相似，它们都用来显示正在执行的进程。top与ps的最大不同之处在于top在执行一段时间内可以更新正在运行的进程（动态更新）。

- `top [选项]`

  选项

  - `-d 秒数`            指定top命令每隔几秒更新，默认3秒。
  - `-i`                     使top不显示任何闲置或僵死进程
  - `-p`                      通过指定监控进程ID来仅仅监控某个进程的状态

  交互操作

  - P        以CPU使用率排序
  - M       以内存的使用率排序
  - N        以PID排序
  - q         退出top
  - u         指定要监控的用户
  - s          改变更新时间间隔(秒)
  - k           输入进程id，结束此进程

  

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220412174655933.png)

解读：

第一行：同uptime命令

- system time:系统当前时间15:29:53
- system uptime:系统运行时间645天2小时25分
- users:当前登入系统的用户数4
- load average:过去的1分钟，5分钟，15分钟系统的负载情况([详情点击](https://bingoex.github.io/2015/07/31/proc-loadavg/))。

##### 第二行：进程相关

- 221: 进程总数。
- 1:运行进程数目。正在运行和等待运行的进程（运行态和就绪态）。
- 220: 阻塞进程数目。（等待IO或者调用sleep函数）
- 0:停止状态进程数目。（收到STOP信号后获得停止状态，收到CONT信号，失去STOP状态；ctrl+z发送STOP信号）。
- 0:僵尸进程数目。（子进程已死，但没有被父进程回收）

##### 第三行：同mpstat命令

- usr:用户空间CPU使用占比
- sys:内核空间CPU使用占比
- nice:低优先级进程使用CPU占比（nice值大于0的进程）
- idle:CPU空闲时间占比
- io wait:CPU等待IO占比
- irq/hi:CPU处理硬中断占比
- soft/si:CPU处理软中断占比
- guest与steal与虚拟机有关。

##### 硬中断和软中断的区别

- 软中断是执行中断指令产生的，而硬中断是由外设引发的。
- 硬中断的中断号是由中断控制器提供的，软中断的中断号由指令直接指出，无需使用中断控制器。
- 硬中断是可屏蔽的，软中断不可屏蔽。
- 硬中断处理程序要确保它能快速地完成任务，这样程序执行时才不会等待较长时间，称为上半部。
- 软中断处理硬中断未完成的工作，是一种推后执行的机制，属于下半部

##### 第四行：同free命令

**进程信息标题**

- PID: 进程标识符
- USER: 进程拥有者
- PR: 进程优先权 [数越小，进程优先级越高]
- NI: NICE Value [PR = PR + NI，因此，NI为负数，PR小，优先级高；NI可以手动调整]
- VIRT: 进程虚拟内存大小 [进程总得寻址空间大小]
- RES: 进程实际占用物理内存大小
- SHR: 共享内存大小
- S: 进程状态(D=不可中断的睡眠状态,R=运行,S=睡眠,T=跟踪/停止,Z=僵尸进程)
- CPU: 进程CPU占用率
- MEM: 进程内存占用率
- TIME+: 进程运行占用的CPU时间
- COMMAND: 启动进程的命令
- DATA: 是进程栈、堆申请的总空间。

RES进程实际占用物理内存大小，与%MEM强相关。

SHR其他进程共享的内存空间。比如，依赖一个C公共库，那么整个库的地址空间被加入VIRT，而被载入内存的公共库函数被算入RES与SHR。

### 监控网络状态

#### 查看系统网络情况

##### netstat

- `netstat [选项]`
  - `-an` 按一定顺序排列输出
  - `-p` 显示哪个进程在调用

#### 检测主机连接

##### ping

- `ping ip地址`    检测远程主机是否正常，或是两部主机间的网线或网卡故障

## RPM与YUM

### rpm

rpm用于互联网下载包的打包及安装工具，它包含在某些Linux分发版中。它生成具有.RPM扩展名的文件。RPM时RedHat Package Manager（RedHat软件包管理工具）的缩写，类似windows的setup.exe，这一文件格式名字虽然打上了RedHat的标志，但理念时通用的。

#### 查询

- `rpm [选项] [RPM包名]`

  选项

  - `-a`                       查询所有安装的包
  - `-f   `                    查询拥有文件< file >的包
  - `-i   `                    展示包信息，包括名字、版本以及描述
  - `-R       `               列出该包所依赖的别的包
  - `-l `                      列出该包的文件
  - `-q     `                查询软件包

#### 卸载

- `rpm -e RPM包名     `                              卸载指定的包
  - `rpm -e --nodeps RPM包名`           无视包依赖关系强制删除

如果其他软件包依赖于要卸载的包，卸载时会产生错误信息。

#### 安装

- `rpm -ivh RPM包全路径名称`
  - `i   `    instal          安装
  - `v  `     verbose     提示
  - `h    `   hash          进度条

### yum

yum是一个Shell前端软件包管理器。基于RPM包管理，能够从指定的服务器自动下载RPM包并安装，可以自动处理依赖性关系，并且一次安装所有依赖的软件包。

- `yum list | grep xxx`           查询yum服务器是否有需要安装的软件
- `yum install xxx  `                          下载安装

例子：使用yum安装firefox

1. rpm -e firefox
2. yum list | grep firefox
3. yum install firefox



