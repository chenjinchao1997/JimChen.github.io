# Tomcat

Tomcat 5 为基础。

> 参考来源
> <https://www.cnblogs.com/alimayun/p/10604532.html>
> <https://www.jianshu.com/p/8b7f81bd5e26>
> <https://www.cnblogs.com/kismetv/p/7228274.html>

## 从Socket开始

Socket（嵌套字）是网络链接中的一对断点（一个在服务器，一个在客户端），我们可以从Socket中获取输入输出流，来进行服务器和客户端之间的信息传输。java中使用 `java.net.Socket` 和 `java.net.ServerSocket` 完成这一套操作。 ServerSocket 会（从一个端口）源源不断的生成 与不同客户端 Socket 对应的 Socket。由此，我们获得了两台网络上的机器交互信息的渠道。

## Tomcat结构

<!-- 从设计模式的角度看，Tomcat是责任链，状态机，订阅者 -->

实际上Tomcat的结构在Tomcat的配置文件（server.xml）上体现的非常清晰，**server.xml的每一个元素都对应了Tomcat中的一个组件**。

在解析Tomcat的过程中，我们先从我们刚刚使用Socket所构建的Server开始。

对于我们刚刚所构建的Server，最明显的缺点就是，不能接受不同的网络协议。这时Tomcat将Server分成了两部分， `Connector` 和 `Container` Connector会有多个，分别对应着不同的网络协议，在获取到连接之后再转交给Container，这样我们的服务就支持了多种网络协议。

这时后又出现了一个问题，过多的Connector和一个Container之间会产生过于复杂的映射关系，这个时候Tomcat使用Service代替Server原来的位置，即一个Server包好多个Service，一个Service包含一个Container和多个Connector。

接下来，Tomcat对Container本身进行了几个纬度的切割。首先是将Tomcat自身的功能（Engine）和服务器应用的资源（Context）分开，将容器加载资源、释放资源的动作解耦。

然后从域名的角度进行解耦（一个主机下经常有提供多个域名的服务），将Context再在外部拆出一层Host。**Host是Engine的子容器。Engine组件中可以内嵌1个或多个Host组件，每个Host组件代表Engine中的一个虚拟主机。**同时，一个Context中可以包含多个servlet实例，称为Wrapper。

以请求`http://www.hostname.com:8080/app1/index.html`为例，首先通过协议和端口号（http和8080）选定Service；然后通过主机名（www.hostname.com）选定Host；然后通过uri（/app1/index.html）选定Web应用。

对于刚刚上述所有的类，都采用了状态机的设计模式。Tomcat定义了相关的生命周期方法。

### Tomcat: server.xml

```xml
<Server>
    <Service>
        <Connector Connector port="8080" protocol="HTTP/1.1" connectionTimeout="20000" redirectPort="8443" />
        <Connector Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />
        <Engine name="Catalina" defaultHost="localhost">
            <Host name="localhost" appBase="webapps" unpackWARs="true" autoDeploy="true">
                <Context /><!-- 现在常常使用自动部署，不推荐配置Context元素 -->
            </Host>
        </Engine>
    </Service>
</Server>
```

## 其他组件

<http://tomcat.apache.org/tomcat-8.0-doc/config/cookie-processor.html>
<!-- 
## Spring Boot 的内置Tomcat

Spring Boot中Tomcat是放在ApplicationContext启动过程中的，跟 -->
