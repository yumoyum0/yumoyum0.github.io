---
title: Docker部署Springboot项目(jdk19)
date: 2022-10-27 16:51:33
tags: 
- Linux
- Java
- SpringBoot
categories:
- Linux
---

因为docker上的jdk没有19的，其他的野镜像不敢用，所以我决定自己构建个jdk19镜像，然后以此镜像来部署springboot项目

## 自定义jdk19镜像

### 下载jdk19

- 先预先在官网上下载后再用xftp或rz传到当前目录
  - 官网链接：[Java Downloads | Oracle](https://www.oracle.com/java/technologies/downloads/#java19)
- 直接用curl下载
  - `curl -O https://download.oracle.com/java/19/latest/jdk-19_linux-x64_bin.tar.gz` 

### 创建Dockerfile

在当前目录下创建Dockerfile

- `vim Dockerfile`
- 粘贴以下内容

```dockerfile
FROM ubuntu:20.04
#指明该镜像的作者和其电子邮件
MAINTAINER yumo "yumo1304960237@gmail.com"
COPY jdk-19_linux-x64_bin.tar.gz /usr/local/
RUN tar -zxvf /usr/local/jdk-19_linux-x64_bin.tar.gz -C /usr/local/
#配置环境变量
ENV JAVA_HOME /usr/local/jdk-19.0.1/
ENV PATH $JAVA_HOME/bin:$PATH
#容器启动时需要执行的命令
CMD ["java","-version"]
```

### 构建jdk:19镜像

- `docker build -t yumoyumoyumo/jdk:19 .`

  - `.`：代表在当前目录下找Dockerfile文件，可根据Dockerfile文件的路径而修改

    <img src="https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221027203421940.png" alt="image-20221027203421940"  />

    ![image-20221027203515573](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221027203515573.png)

    

### 测试jdk:19镜像

- `docker run yumoyumoyumo/jdk:19 `  

  - 若输出`java -version`则镜像构建成功

  ![image-20221027194445333](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221027194445333.png)



## 构建SpringBoot项目镜像

在这里我以部署qqbot项目为例：

- 首先在当前目录下创建工作目录
  - `mkdir ~/qqbot`

### 创建Dockerfile

然后在qqbot目录下创建Dockerfile

- `vim Dockerfile`
- 粘贴以下内容

```dockerfile
FROM yumoyumoyumo/jdk:19

MAINTAINER yumo "yumo1304960237@gmail.com"
# 设置时区
ENV TZ="Asia/Shanghai"
# VOLUME 指定临时文件目录为 /tmp
VOLUME /tmp
# 将 jar 放入容器内
COPY QQBot-1.0.jar /
#以下COPY为qqbot项目所需的认证信息和缓存信息，其他项目可删除
COPY device.json /
COPY cache/account.secrets /cache/
COPY cache/servers.json /cache/
COPY cache/session.bin /cache/
# 启动服务，nohup 意思是不挂断运行命令,当账户退出或终端关闭时,程序仍然运行
ENTRYPOINT ["nohup","java","--enable-preview","-jar","/QQBot-1.0.jar","&"]
# 暴露端口，看你项目暴露的端口是什么
EXPOSE 8088
```

### 上传jar包

- xftp
- rz

### 构建qqbot:1.0镜像

```
docker build -t yumoyumoyumo/qqbot:1.0 .
```

![](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221027203658097.png)

### 启动容器

```
docker run -d -p 8088:8088 --name qqbot yumoyumoyumo/qqbot:1.0 
```

![image-20221027203737696](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221027203737696.png)

### 查看容器日志

```
docker logs [你上面创建的容器id]
```

出现以下字样代表启动成功！

![image-20221027195633372](https://yumoimgbed.oss-cn-shenzhen.aliyuncs.com/img/image-20221027195633372.png)

## 更新项目后的部署

若修改了项目代码，重新部署需要以下步骤

1. 将项目打成jar包并传到服务器上
2. 停止之前启动的容器并删除
   - `docker stop [容器id]`
   - `docker container rm [容器id]`
3. 删除上面创建的SpringBoot镜像
   - `docker image rm [镜像id]`
4. 再次构建SpringBoot镜像
   - `docker build -t yumoyumoyumo/qqbot:1.0 .`
5. 启动容器
   - `docker run -d -p 8088:8088 --name qqbot yumoyumoyumo/qqbot:1.0` 

