---
title: SpringMVC手撕源码
date: 2022-04-25 16:51:33
tags:
- 后端
- Spring
- SpringMVC
- Java
categories:
- 后端
---

## SpringMVC常用组件

- DispatcherServlet：**前端控制器**，不需要工程师开发，由框架提供

作用：统一处理请求和响应，整个流程控制的中心，由它调用其它组件处理用户的请求

- HandlerMapping：**处理器映射器**，不需要工程师开发，由框架提供

作用：根据请求的url、method等信息查找对应的Handler，即控制器方法。

具体体现为@RequestMapping。

- Handler：**处理器**，也就是**控制器**Controller，需要工程师开发

作用：在DispatcherServlet的控制下Handler对具体的用户请求进行处理

- HandlerAdapter：**处理器适配器**，不需要工程师开发，由框架提供

作用：通过HandlerAdapter对处理器（控制器方法）进行执行，会进行参数解析，返回值内容协商。

- ViewResolver：**视图解析器**，不需要工程师开发，由框架提供

作用：进行视图解析，得到相应的视图，例如：ThymeleafView、InternalResourceView、RedirectView。根据不同的视图名称，使用不同的视图解析器进行页面渲染。

- View：**视图**

作用：将模型数据通过页面展示给用户

## DispatcherServlet初始化过程

DispatcherServlet 本质上是一个 Servlet，所以天然的遵循 Servlet 的生命周期。所以宏观上是 Servlet 生命周期来进行调度。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/dbcd3ac4636cbd10c7dbb0b851818ecf.png)

### 1、Servlet

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425191613351.png)

Servlet接口为Web的核心，其中规定了Servlet的生命周期，即init（初始化）、Service（服务）、destroy（销毁）。这里的init方法将交给Servlet接口的实现类去实现。

### 2、GenericServlet

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425192034126.png)

GenericServlet作为Servlet接口的实现类，封装并实现了部分功能，其中对init、service、destroy三大核心方法采取由子类实现的办法。特别的是，GenericServlet对init方法进行了二次封装，引入了ServletConfig，以便在初始化servlet时进行相关的配置。

### 3、HttpServlet

到底如何进行init方法？

让HttpServlet来告诉你吧：

HttpServlet：不知道喵

啊这，它说它不知道

因为在HttpServlet中并没有重写init方法，所以具体的实现又交给其子类去实现了。

### 4、HttpServletBean

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425193356839.png)

正所谓正官摆烂，副官实干。init方法便是由HttpServlet类的子类HttpServletBean来具体实现的。

在这里init方法主要进行了两个步骤：

#### 1、设置bean properties

获取初始化参数（init parameters）和初始化配置（ServletConfig）并封装到PropertyValues对象中。

若该PropertyValues对象不为空，则进行一系列操作将bean properties设置到servlet中。

#### 2、调用initServletBean

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425194307644.png)

可以看到在HttpServletBean类中，该方法并没有给出具体实现，而是将其交给子类。

子类可以重写该方法来进行初始化，所有的该servlet的bean properties属性都将在这个方法被调用之前设置好。

那么现在就应该在追查是谁来实现了initServletBean方法

### 5、FrameworkServlet

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425195232462.png)

Framework意为框架，在该类中实现类大量框架所需的方法，其中便包含initServletBean方法

在该方法中最主要的一步，便是创建servlet的**WebApplicationContext**。

#### 初始化WebApplicationContext

```java
protected WebApplicationContext initWebApplicationContext() {
    WebApplicationContext rootContext =
        WebApplicationContextUtils.getWebApplicationContext(getServletContext());
    WebApplicationContext wac = null;

    if (this.webApplicationContext != null) {
        // A context instance was injected at construction time -> use it
        wac = this.webApplicationContext;
        if (wac instanceof ConfigurableWebApplicationContext) {
            ConfigurableWebApplicationContext cwac = (ConfigurableWebApplicationContext) wac;
            if (!cwac.isActive()) {
                // The context has not yet been refreshed -> provide services such as
                // setting the parent context, setting the application context id, etc
                if (cwac.getParent() == null) {
                    // The context instance was injected without an explicit parent -> set
                    // the root application context (if any; may be null) as the parent
                    cwac.setParent(rootContext);
                }
                configureAndRefreshWebApplicationContext(cwac);
            }
        }
    }
    if (wac == null) {
        // No context instance was injected at construction time -> see if one
        // has been registered in the servlet context. If one exists, it is assumed
        // that the parent context (if any) has already been set and that the
        // user has performed any initialization such as setting the context id
        wac = findWebApplicationContext();
    }
    if (wac == null) {
        // No context instance is defined for this servlet -> create a local one
        // 创建WebApplicationContext
        wac = createWebApplicationContext(rootContext);
    }

    if (!this.refreshEventReceived) {
        // Either the context is not a ConfigurableApplicationContext with refresh
        // support or the context injected at construction time had already been
        // refreshed -> trigger initial onRefresh manually here.
        synchronized (this.onRefreshMonitor) {
            // 刷新WebApplicationContext
            onRefresh(wac);
        }
    }

    if (this.publishContext) {
        // Publish the context as a servlet context attribute.
        // 将IOC容器在应用域共享
        String attrName = getServletContextAttributeName();
        getServletContext().setAttribute(attrName, wac);
    }

    return wac;
}
```

针对该方法各部分功能分解如下：

##### 检查已有

若WebApplicationContext**已存在**，则将rootContext设置为其的父容器。在这里，**父容器**rootContext就是**Spring**的IOC容器，而**子容器**WebApplicationContext就是**SpringMVC**的IOC容器。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425200417739.png)

若WebApplicationContext**不存在**，则调用**`findWebApplicationContext`**方法寻找到底有没有WebApplicationContext。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425201609943.png)



##### 创建

然后调用**`createWebApplicationContext`**方法创建一个新的WebApplicationContext

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425201130435.png)

在该方法中，首先通过反射创建IOC容器对象，接着设置该WebApplicationContext的环境及其父容器。

最后调用**`configureAndRefreshWebApplicationContext`**方法刷新其配置

#### 刷新

调用**`onRefresh`**方法，手动触发初始化刷新。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425201856862.png)

在该类中的onRefresh方法为模板方法，需要其子类去具体实现

### 6、DispatcherServlet

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425202330125.png)

在DispatcherServlet类的onRefresh方法中可见，它将具体的实现交给**`initStrategies`**初始化策略方法。

#### 初始化策略

初始化策略，即初始化DispatcherServlet的各个组件

MultipartResolver文件上传解析器

LocaleResolver本地解析器

ThemeResolver主题解析器

HandlerMappings处理器映射器

HandlerAdapters处理器适配器

HandlerExceptionResolvers处理器异常解析器

RequestToViewNameTranslator请求到视图名转换器

ViewResolvers视图解析器

FlashMapManager转发及重定向管理器



至此，核心前端控制器DispatcherServlet的初始化完成。

## DispatcherServlet调用组件处理请求

上面的DispatcherServlet初始化过程本质就是其最顶端Servlet接口的**init**方法的层层封装及调用。

而这里的DispatcherServlet调用组件处理请求过程则是Servlet接口的**service**方法的层层调用



### 1、Servlet

回到最开始的Servlet接口，并持续向下跟踪

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425203412701.png)

### 2、GenericServlet

该类中的service方法依然没有具体实现，则交给其子类处理

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425203706592.png)

### 3、HttpServlet

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425203957137.png)

首先该方法接收参数ServletRequest req, ServletResponse res

并将它们转换成对应的HttpServletRequest和HttpServletResponse

最后**转发**给该类的另一个专门处理http请求和响应的service方法进行处理

```java
protected void service(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException
    {
        String method = req.getMethod();

        if (method.equals(METHOD_GET)) {
            long lastModified = getLastModified(req);
            if (lastModified == -1) {
                // servlet doesn't support if-modified-since, no reason
                // to go through further expensive logic
                doGet(req, resp);
            } else {
                long ifModifiedSince = req.getDateHeader(HEADER_IFMODSINCE);
                if (ifModifiedSince < lastModified) {
                    // If the servlet mod time is later, call doGet()
                    // Round down to the nearest second for a proper compare
                    // A ifModifiedSince of -1 will always be less
                    maybeSetLastModified(resp, lastModified);
                    doGet(req, resp);
                } else {
                    resp.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
                }
            }

        } else if (method.equals(METHOD_HEAD)) {
            long lastModified = getLastModified(req);
            maybeSetLastModified(resp, lastModified);
            doHead(req, resp);

        } else if (method.equals(METHOD_POST)) {
            doPost(req, resp);
            
        } else if (method.equals(METHOD_PUT)) {
            doPut(req, resp);
            
        } else if (method.equals(METHOD_DELETE)) {
            doDelete(req, resp);
            
        } else if (method.equals(METHOD_OPTIONS)) {
            doOptions(req,resp);
            
        } else if (method.equals(METHOD_TRACE)) {
            doTrace(req,resp);
            
        } else {
            //
            // Note that this means NO servlet supports whatever
            // method was requested, anywhere on this server.
            //

            String errMsg = lStrings.getString("http.method_not_implemented");
            Object[] errArgs = new Object[1];
            errArgs[0] = method;
            errMsg = MessageFormat.format(errMsg, errArgs);
            
            resp.sendError(HttpServletResponse.SC_NOT_IMPLEMENTED, errMsg);
        }
    }
```

该service首先得到具体的请求方法，并通过判断来调用与之对应的doXxx方法。

### 4、FrameworkServlet

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425205003723.png)

FrameworkServlet类**重写**了HttpServlet的service方法以及doXxx方法。

在FrameworkServlet类中的service方法调用父类的service方法，而父类的service方法又会根据请求方法来调用子类FrameworkServlet重写的doXXX方法。

而在FrameworkServlet类中的doXxx方法中，基本都调用了该类的**`processRequest`**方法

#### processRequest

```java
protected final void processRequest(HttpServletRequest request, HttpServletResponse response)
    throws ServletException, IOException {

    long startTime = System.currentTimeMillis();
    Throwable failureCause = null;

    LocaleContext previousLocaleContext = LocaleContextHolder.getLocaleContext();
    LocaleContext localeContext = buildLocaleContext(request);

    RequestAttributes previousAttributes = RequestContextHolder.getRequestAttributes();
    ServletRequestAttributes requestAttributes = buildRequestAttributes(request, response, previousAttributes);

    WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);
    asyncManager.registerCallableInterceptor(FrameworkServlet.class.getName(), new RequestBindingInterceptor());

    initContextHolders(request, localeContext, requestAttributes);

    try {
		// 执行服务，doService()是一个抽象方法，在DispatcherServlet中进行了重写
        doService(request, response);
    }
    catch (ServletException | IOException ex) {
        failureCause = ex;
        throw ex;
    }
    catch (Throwable ex) {
        failureCause = ex;
        throw new NestedServletException("Request processing failed", ex);
    }

    finally {
        resetContextHolders(request, previousLocaleContext, previousAttributes);
        if (requestAttributes != null) {
            requestAttributes.requestCompleted();
        }
        logResult(request, response, failureCause, asyncManager);
        publishRequestHandledEvent(request, response, startTime, failureCause);
    }
}
```

processRequest方法处理此请求并发布事件，而不管结果如何。

实际的事件处理由抽象的**`doService`**模板方法执行。

#### doservice

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425205822009.png)

doService方法为模板方法，子类必须实现这个方法来处理请求，接收GET、POST、PUT和DELETE的集中回调。
该回调基本上与HttpServlet中通常被重写的doGet或doPost方法的回调相同。
这个类**拦截**调用，以确保进行**异常处理**和**事件发布**。

### 5、DispatcherServlet

#### doservice

```java
@Override
protected void doService(HttpServletRequest request, HttpServletResponse response) throws Exception {
    logRequest(request);

    // Keep a snapshot of the request attributes in case of an include,
    // to be able to restore the original attributes after the include.
    Map<String, Object> attributesSnapshot = null;
    if (WebUtils.isIncludeRequest(request)) {
        attributesSnapshot = new HashMap<>();
        Enumeration<?> attrNames = request.getAttributeNames();
        while (attrNames.hasMoreElements()) {
            String attrName = (String) attrNames.nextElement();
            if (this.cleanupAfterInclude || attrName.startsWith(DEFAULT_STRATEGIES_PREFIX)) {
                attributesSnapshot.put(attrName, request.getAttribute(attrName));
            }
        }
    }

    // Make framework objects available to handlers and view objects.
    request.setAttribute(WEB_APPLICATION_CONTEXT_ATTRIBUTE, getWebApplicationContext());
    request.setAttribute(LOCALE_RESOLVER_ATTRIBUTE, this.localeResolver);
    request.setAttribute(THEME_RESOLVER_ATTRIBUTE, this.themeResolver);
    request.setAttribute(THEME_SOURCE_ATTRIBUTE, getThemeSource());

    if (this.flashMapManager != null) {
        FlashMap inputFlashMap = this.flashMapManager.retrieveAndUpdate(request, response);
        if (inputFlashMap != null) {
            request.setAttribute(INPUT_FLASH_MAP_ATTRIBUTE, Collections.unmodifiableMap(inputFlashMap));
        }
        request.setAttribute(OUTPUT_FLASH_MAP_ATTRIBUTE, new FlashMap());
        request.setAttribute(FLASH_MAP_MANAGER_ATTRIBUTE, this.flashMapManager);
    }

    RequestPath requestPath = null;
    if (this.parseRequestPath && !ServletRequestPathUtils.hasParsedRequestPath(request)) {
        requestPath = ServletRequestPathUtils.parseAndCache(request);
    }

    try {
        // 处理请求和响应
        doDispatch(request, response);
    }
    finally {
        if (!WebAsyncUtils.getAsyncManager(request).isConcurrentHandlingStarted()) {
            // Restore the original attribute snapshot, in case of an include.
            if (attributesSnapshot != null) {
                restoreAttributesAfterInclude(request, attributesSnapshot);
            }
        }
        if (requestPath != null) {
            ServletRequestPathUtils.clearParsedRequestPath(request);
        }
    }
}
```

##### 保留快照

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425211140603.png)

这部分代码创建一个Map映射，将当前请求的属性名及其对应的值保存在这个Map映射中。这个Map映射就被称为是当前请求的一个快照。

保留这个快照，可以以防包含，可以在包含后恢复原始的请求属性数据。

##### 设置请求属性

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425211648823.png)

通过将执行器和视图对象放入请求域中，使得框架对象能用于处理它们。

##### 跳转管理

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425212004036.png)

将跳转映射和跳转映射管理器放入request域以便共享使用

##### 解析请求路径

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425212146508.png)

判断若需要解析请求路径，并且当前请求还未被解析路径，则进行解析

##### 委托doDispatch调度

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425212312342.png)

将DispatcherServlet特定的请求属性和委托公开给doDispatch以进行实际调度。



#### doDispatch

处理实际分派给执行器的任务。
处理程序将通过按顺序应用servlet的handler映射来获得。**执行器适配器**将通过查询servlet安装的**执行器适配器**来获得，以找到第一个支持handler类的HandlerAdapter。
所有HTTP方法都由该方法处理。由**执行器适配器**或**执行器**自己决定哪些方法是可以接受的。

```java
protected void doDispatch(HttpServletRequest request, HttpServletResponse response) throws Exception {
    HttpServletRequest processedRequest = request;
    HandlerExecutionChain mappedHandler = null;
    boolean multipartRequestParsed = false;

    WebAsyncManager asyncManager = WebAsyncUtils.getAsyncManager(request);

    try {
        ModelAndView mv = null;
        Exception dispatchException = null;

        try {
            processedRequest = checkMultipart(request);
            multipartRequestParsed = (processedRequest != request);

            // Determine handler for the current request.
            /*
            	mappedHandler：调用链
                包含handler、interceptorList、interceptorIndex
            	handler：浏览器发送的请求所匹配的控制器方法
            	interceptorList：处理控制器方法的所有拦截器集合
            	interceptorIndex：拦截器索引，控制拦截器afterCompletion()的执行
            */
            mappedHandler = getHandler(processedRequest);
            if (mappedHandler == null) {
                noHandlerFound(processedRequest, response);
                return;
            }

            // Determine handler adapter for the current request.
           	// 通过控制器方法创建相应的处理器适配器，调用所对应的控制器方法
            HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());

            // Process last-modified header, if supported by the handler.
            String method = request.getMethod();
            boolean isGet = "GET".equals(method);
            if (isGet || "HEAD".equals(method)) {
                long lastModified = ha.getLastModified(request, mappedHandler.getHandler());
                if (new ServletWebRequest(request, response).checkNotModified(lastModified) && isGet) {
                    return;
                }
            }
			
            // 调用拦截器的preHandle()
            if (!mappedHandler.applyPreHandle(processedRequest, response)) {
                return;
            }

            // Actually invoke the handler.
            // 由处理器适配器调用具体的控制器方法，最终获得ModelAndView对象
            mv = ha.handle(processedRequest, response, mappedHandler.getHandler());

            if (asyncManager.isConcurrentHandlingStarted()) {
                return;
            }

            applyDefaultViewName(processedRequest, mv);
            // 调用拦截器的postHandle()
            mappedHandler.applyPostHandle(processedRequest, response, mv);
        }
        catch (Exception ex) {
            dispatchException = ex;
        }
        catch (Throwable err) {
            // As of 4.3, we're processing Errors thrown from handler methods as well,
            // making them available for @ExceptionHandler methods and other scenarios.
            dispatchException = new NestedServletException("Handler dispatch failed", err);
        }
        // 后续处理：处理模型数据和渲染视图
        processDispatchResult(processedRequest, response, mappedHandler, mv, dispatchException);
    }
    catch (Exception ex) {
        triggerAfterCompletion(processedRequest, response, mappedHandler, ex);
    }
    catch (Throwable err) {
        triggerAfterCompletion(processedRequest, response, mappedHandler,
                               new NestedServletException("Handler processing failed", err));
    }
    finally {
        if (asyncManager.isConcurrentHandlingStarted()) {
            // Instead of postHandle and afterCompletion
            if (mappedHandler != null) {
                mappedHandler.applyAfterConcurrentHandlingStarted(processedRequest, response);
            }
        }
        else {
            // Clean up any resources used by a multipart request.
            if (multipartRequestParsed) {
                cleanupMultipart(processedRequest);
            }
        }
    }
}
```

##### 文件解析

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425213139284.png)

通过调用checkMultiPart方法，来查看当前request请求是否需要进行文件处理解析（包括文件上传和文件下载）



##### 获取处理器执行链

在doDispatch方法最开始定义了HandlerExecutionChain处理器执行链

```java
HandlerExecutionChain mappedHandler = null;
```

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425213258648.png)

调用getHandler方法根据请求的url、method等信息查找对应的Handler，并将它们赋给**映射处理器mappedHandler**。

这里的handler即是程序员在**controller层**中由**@RequestMapping**标注的**controller控制器方法**。



##### 获取处理器适配器

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425213716357.png)

具体方法如下

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425213930476.png)

判断当前的处理器适配器集合handlerAdapters是否为空，若不为空，则循环遍历。

supports方法判断该适配器HandlerAdapter是否支持该处理器handler，HandlerAdapter通常只支持一种handler类型。

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425214221487.png)

该handlerAdapters中有三个handlerAdapter：

- HttpRequestHandler
- SimpleControllerHandlerAdapter        
- RequestMappingHandlerAdapter   

getHandlerAdapter方法会返回合适的HandlerAdapter

##### 处理最后修改的请求头

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425214937219.png)

##### 拦截器preHandle

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425215040174-1.png)

**正序遍历**拦截器集合interceptorList，若拦截出错，则调用triggerAfterCompletion方法：在映射的HandlerInterceptor上触发完成后回调。将只为其预处理调用已成功完成并返回true的所有拦截器调用**afterCompletion**。返回false后，doDispatch方法结束。

将正常执行preHandle方法的拦截器总数赋值给**interceptorIndex**

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425215057847.png)

##### 调用处理器

```java
ModelAndView mv = null;
HandlerAdapter ha = getHandlerAdapter(mappedHandler.getHandler());
```

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425215530433.png)

HandlerAdapter处理器适配器通过调用**`handle`**方法来执行控制器方法（mappedHandler.getHandler()）

##### 拦截器postHandle

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425215818720.png)

应用默认视图名称，处理器执行链（mappedHandler），即controller层中与对应请求映射的控制器方法，调用拦截器的postHandle

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425220111732.png)

**反序遍历**拦截器集合，调用其对应的postHandle方法。

##### 处理调度结果

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425220321763.png)

捕获前面的代码出现的异常并赋给dispatchException

调用processDispatchResult处理调度结果

#### processDispatchResult

```java
private void processDispatchResult(HttpServletRequest request, HttpServletResponse response,
                                   @Nullable HandlerExecutionChain mappedHandler, @Nullable ModelAndView mv,
                                   @Nullable Exception exception) throws Exception {

    boolean errorView = false;

    if (exception != null) {
        if (exception instanceof ModelAndViewDefiningException) {
            logger.debug("ModelAndViewDefiningException encountered", exception);
            mv = ((ModelAndViewDefiningException) exception).getModelAndView();
        }
        else {
            Object handler = (mappedHandler != null ? mappedHandler.getHandler() : null);
            mv = processHandlerException(request, response, handler, exception);
            errorView = (mv != null);
        }
    }

    // Did the handler return a view to render?
    if (mv != null && !mv.wasCleared()) {
        // 处理模型数据和渲染视图
        render(mv, request, response);
        if (errorView) {
            WebUtils.clearErrorRequestAttributes(request);
        }
    }
    else {
        if (logger.isTraceEnabled()) {
            logger.trace("No view rendering, null ModelAndView returned.");
        }
    }

    if (WebAsyncUtils.getAsyncManager(request).isConcurrentHandlingStarted()) {
        // Concurrent handling started during a forward
        return;
    }

    if (mappedHandler != null) {
        // Exception (if any) is already handled..
        // 调用拦截器的afterCompletion()
        mappedHandler.triggerAfterCompletion(request, response, null);
    }
}
```

##### 错误视图

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425220706059.png)

根据前面的dispatchException进行判断：

若有异常：若自定义了错误视图，则将其赋给ModelAndView类型变量mv；否则使用默认的错误视图。

##### 渲染视图

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425220926558.png)

调用**`render`**方法进行视图的渲染



##### 拦截器afterCompletion

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425221023029.png)

![](https://www.yumoyumo.top/wp-content/uploads/2022/04/image-20220425221208198.png)

**反序遍历**拦截器集合interceptorList，根据interceptorIndex，使得所有正常执行的拦截器调用afterCompletion方法



至此，DispatcherServlet调用组件处理请求的全过程完毕。

## SpringMVC的执行流程

对SpringMVC整个的执行流程总结如下：

1. 用户向服务器发送请求，请求被SpringMVC 前端控制器 DispatcherServlet捕获。
2. DispatcherServlet对请求URL进行解析，得到请求资源标识符（URI），判断请求URI对应的映射：

a) 不存在

i. 再判断是否配置了mvc:default-servlet-handler

ii. 如果没配置，则控制台报映射查找不到，客户端展示404错误
![](https://img-blog.csdnimg.cn/img_convert/584a1aa83611354bbd93ea8457459659.png)

![](https://img-blog.csdnimg.cn/img_convert/a37e15c07f070cfac014ab7b44f55876.png)

iii. 如果有配置，则访问目标资源（一般为静态资源，如：JS,CSS,HTML），找不到客户端也会展示404错误

![](https://img-blog.csdnimg.cn/img_convert/9519da76739af3d582c5957713b25c06.png)

b) 存在则执行下面的流程

​	3.根据该URI，调用HandlerMapping获得该Handler配置的所有相关的对象（包括Handler对象以及Handler对象对应的拦截器），最后以HandlerExecutionChain执行链对象的形式返回。

​	4.DispatcherServlet 根据获得的Handler，选择一个合适的HandlerAdapter。

​	5.如果成功获得HandlerAdapter，此时将开始执行拦截器的preHandler(…)方法【正向】

​	6.提取Request中的模型数据，填充Handler入参，开始执行Handler（Controller)方法，处理请求。在填充Handler的入参过程中，根据你的配置，Spring将帮你做一些额外的工作：

a) HttpMessageConveter： 将请求消息（如Json、xml等数据）转换成一个对象，将对象转换为指定的响应信息

b) 数据转换：对请求消息进行数据转换。如String转换成Integer、Double等

c) 数据格式化：对请求消息进行数据格式化。 如将字符串转换成格式化数字或格式化日期等

d) 数据验证： 验证数据的有效性（长度、格式等），验证结果存储到BindingResult或Error中

​	7.Handler执行完成后，向DispatcherServlet 返回一个ModelAndView对象。

​	8.此时将开始执行拦截器的postHandle(…)方法【逆向】。

​	9.根据返回的ModelAndView（此时会判断是否存在异常：如果存在异常，则执行HandlerExceptionResolver进行异常处理）选择一个适合的ViewResolver进行视图解析，根据Model和View，来渲染视图。

​	10.渲染视图完毕执行拦截器的afterCompletion(…)方法【逆向】。

​	11.将渲染结果返回给客户端。