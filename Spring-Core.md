# Spring Core

本文档基于Spring 5.2.3.RELEASE

# Spring IoC Container

IoC指Inversion of Control。或者称为Dependency Injection。顾名思义，DI即是把形如：

```java

public class ToolUsing {
    // Tool为接口
    private Tool tool = new MyToolImpl();
}
```

类`ToolUsing`直接依赖于`MyToolImpl`实现类的这种约束转化为由一个第三方容器管理，使得`ToolUsing`从容器中获取具体的`Tool`的实现，从而使代码解耦。（试想一下，当我们需要使用新的`AnotherToolImpl`作为实现的时候，需要将所有代码里引用了`MyToolImpl`的地方全部替换，这严重违反了开闭原则。）

Spring IoC Container相当于一个管理了所有Java类的工厂（工厂模式），而这些被管理的类统称为Bean。同时Spring IoC Container提供了非常多的能力让我们使用除了获取对象之外的能力，比如指定不同Bean之间的初始化顺序（depends-on），提供Bean生命流程的hooks。

`org.springframework.beans` 和 `org.springframework.context` 是Spring Framework‘s IoC container的基础包。其中有两个重要的接口：

```java
public interface BeanFactory {
    Object getBean(String name) throws BeansException;
    ...
}
```

```java
public interface ApplicationContext extends EnvironmentCapable, ListableBeanFactory, HierarchicalBeanFactory, MessageSource, ApplicationEventPublisher, ResourcePatternResolver {
    @Nullable
    String getId();
    String getApplicationName();
    String getDisplayName();
    long getStartupDate();
    @Nullable
    ApplicationContext getParent();
    AutowireCapableBeanFactory getAutowireCapableBeanFactory() throws IllegalStateException;
}
```

其中 `ApplicationContext` 是 `BeanFactory` 的子接口，BeanFactory简单地提供`getBean()`方法来提供获取Bean（provides the configuration framework and basic functionality）。而[ApplicationContext](./Spring-ApplicationContext.md)提供了一些额外的功能比如整合AOP，事件发布（Event publication）等（adds more enterprise-specific functionality）。

## ApplicationContext

### 工作流程概要

首先无论何种 `ApplicationContext` 的实现，都是先通过一个元数据模型获取所有Bean的定义(Configuration Metadata)。通过这些元数据模型生产Bean Defintions，然后通过这些Bean Defintions生成Bean。**绝大多数的单例Bean都是随着容器的创建而创建**。

### 实例化

通常在Java项目中，会采用通过C lassPathXmlApplicationContext 类来实例化容器的方式。
而在Web项目中，实例化会交由Web服务器实现，会通过Web.xml使用ContextLoaderListener实现。

## Bean Definition

如何定义这些类的元数据模型呢？Spring提供了3种方法：`xml` `annotation` `java config`。先不论在不同三种方法中如何定义，我们先看Spring能让我们定义什么。

1. Bean对应的Class；
2. Bean在容器中的名称；
3. Bean的作用域（常见的如 `singleton` 单例和 `prototype` 多例）；
4. 设定Bean的构造函数的参数的注入来源；
5. 设定Bean的属性的注入来源；
6. 是否自动装配（Autowiring Collaborators）及方式（byName byType）；
7. 是否懒加载；
8. Initialization method；
9. Destruction method。

定义一个Bean，它所对应的Class Name及Id 都是直接明了所必须的属性，无需多讲。注意事项有同一个spring配置文件中，bean的 id、name是不能够重复的，否则spring容器启动时会报错。多个配置文件中是允许有同名bean的，并且后面加载的配置文件的中的bean定义会覆盖前面加载的同名bean。

我们先从 `Bean Scope` 讲起。

### `Bean Scope` Bean的作用域

如果不是使用在Web的ApplicationContext，只有两种作用域，分别是 `singleton` 单例和 `prototype` 多例。

`singleton` 单例代表整个ApplicationContext中只会有一个对应类的实例，所有其他对象引用到同一个实现类时所通过Spring容器获取到的对象都是该对象。

`prototype` 多例代表每次其他beans引用的时候都会产生一个新的bean。（every time a request for that specific bean is made）
值得注意的是这里在Spring生成Bean过程中，对于每一个Bean中的属性注入scope = prototype的Bean的时候，都会产生且仅产生一个新的Bean，而不是每次调用的时候产生一个新的Bean，如果希望在每次调用的时候获取到一个新的Bean应改为使用Method Injection。而希望该Bean在web-aware的ApplicationContext下暴露其本身的作用域，（If you want to inject (for example) an HTTP request-scoped bean into another bean of a longer-lived scope, you may choose to inject an AOP proxy in place of the scoped bean.）应该使用 [scoped proxy](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#beans-factory-scopes-other-injection)。）

剩下有四种作用域适用于web-aware的ApplicationContext。分别是：

| Scope | 生存于一个 |
| ------ | ------ |
| request | HTTP request |
| session | HTTP session |
| application | ServletContext |
| websocket | WebSocket |

实际上也可以[自定义Scope](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#beans-factory-scopes-custom-using)。

### Dependency Injection 依赖注入

> 4. 设定Bean的构造函数的参数的注入来源；
> 5. 设定Bean的属性的注入来源；

在初始化一个即将提供出去的Bean时，通过Java语法，注入其中的属性有两种方法，通过构造函数注入或者通过Setter注入。

```java
public class Thing {

    private X x;

    public setX(X x) {
        this.x = x;
    }

    public setY(Y y) {
        this.y = y;
    }

    public Thing(X x, Y y) {
        // ...
    }
}
```

对于这两种方法，其中的区别是这样的：
使用构造函数注入能保证在缺少某些属性准备好的情况下，无法生成一个未准备好的Bean，以防在程序运行过程中获取到了一个未完成预想中初始化过程的Bean。但是会出现无法解决的循环依赖问题（A B相互依赖，由于使用构造函数初始化的特性，在A创建前B无法创建，而Setter注入可以解决这个困境）。由此，理论上最好的方法是在会相互循环依赖的属性以及非必须的属性上使用Setter注入的方法，而在必须的属性上使用构造函数注入。

### depends-on

在上面 `Bean Definition` 中没有提及的是Bean之间的 `depends-on` 关系，有时候Bean A并不持有Bean B，但是有些操作需要Bean B初始化完成后Bean A才可以进行初始化，这使用就要设定 `depends-on`。

### Lazy-initialize 懒加载

在前面提到，所有的单例Bean会在Application容器初始化的时候会进行其中所有单例Bean的初始化。由于大量的Bean初始化会造成初始化的过程缓慢，可以设定一些非必须资源为懒加载。

### Method Injection

在之前提到，虽然一个Bean（B）被注入到另一个Bean（A）的时候，即使scope为prototype，对于被注入的A来说，它只拥有一个固定单例A，如果B想要在自己的方法中多次获取不同的A，就需要用到Method Inject：

```java
public abstract class CommandManager {

    public Object process(Object commandState) {
        Command command = createCommand();
        command.setState(commandState);
        return command.execute();
    }

    protected abstract Command createCommand();
}
```

在上面的这个抽象类中，通过Method Injection，Spring可以通过实现createCommand方法，实例一个继承了该类的实例类，每次调用该方法的时候，将会获取一个新的Command类对象。

不仅如此，Spring还可以通过 [MethodReplacer](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#beans-factory-arbitrary-method-replacement) 进行方法的替换。

### Customizing the Nature of a Bean 自定义Bean的特性

首先是Bean有两个基础的LifeCycle Callback，分别是初始化方法和销毁方法。有3种方法对其进行设定，通过xml、注解和接口继承。其中官方明确说明不建议使用接口继承的方式进行初始化方法和销毁方法的设定，原因是引入了不必要的耦合。（We recommend that you do not use the InitializingBean interface, because it unnecessarily couples the code to Spring. ）

如果同时使用上述多个方法，这几个方法对启动顺序是：

1. 注解
2. 接口方法
3. 自定义init或destroy方法

### `*Aware`

Bean创建之后，有可能需要获取各种容器的信息，通过接口的方式Spring容器会将Bean需要的东西提供。如：

```java
public interface ApplicationContextAware {
    void setApplicationContext(ApplicationContext applicationContext) throws BeansException;
}
```

一共有以下这些 `*Aware`

| 名称 | 注入的依赖 | 详细 |
| --- | --------- | --- |
| ApplicationContextAware | ApplicationContext | [ApplicationContextAware and BeanNameAware](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#beans-factory-aware)|
| BeanNameAware | Bean的名称 | [ApplicationContextAware and BeanNameAware](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#beans-factory-aware)|
| BeanFactoryAware | 创建该Bean的BeanFactory | [ApplicationContextAware and BeanNameAware](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#beans-factory-aware)|
| ApplicationEventPublisherAware | 事件发布者 | [Additional Capabilities of the ApplicationContext](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#context-introduction) |
| BeanClassLoaderAware | ClassLoader | java.lang.ClassLoader |
| LoadTimeWeaverAware | LoadTimeWeaver | [Load-time Weaving with AspectJ in the Spring Framework](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#aop-aj-ltw) |
| MessageSourceAware | MessageSource | [Additional Capabilities of the ApplicationContext](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#context-introduction) |
| ResourceLoaderAware | Configured loader for low-level access to resources. | [Resources](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#resources) |
| ServletConfigAware | ServletConfig | [Spring MVC](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/web.html#mvc) |
| ServletContextAware | ServletContext | [Spring MVC](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/web.html#mvc) |

### Bean Definition Inheritance Bean定义继承

`Bean Definition` 既然在Java中是以 `BeanDefinition` 类组织的，那么 `BeanDefinition` 直接也可以有继承关系。Bean定义可以包含许多配置信息，子bean定义从父定义继承配置数据。子定义可以覆盖某些值或根据需要添加其他值。

## Container Extension Points 容器扩展点

### BeanPostProcessor

在Bean初始化方法前后的扩展点，在真正返回Bean前可以对Bean进行自定义扩展。常见的套路是在这时候处理自己定义的注解，进行检查或者代理。

```java
public interface BeanPostProcessor {
    // bean初始化方法调用前被调用
    Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException;
    // bean初始化方法调用后被调用
    Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException;
}
```

Spring中给出的是 `RequiredAnnotationBeanPostProcessor` 作为例子。但是这个类中其实并没有直接实现BeanPostProcessor中的方法而是实现了继承自 `InstantiationAwareBeanPostProcessor` 的 `postProcessPropertyValues` 接口。不过实际上逻辑相似，就是检查该Bean上有@Required注解的属性是否有值，如果没有就报错。

### BeanFactoryPostProcessor

BeanFactoryPostProcessor是在spring容器加载了bean的定义文件之后，在bean实例化之前执行的。接口方法的入参是ConfigurrableListableBeanFactory。

```java
public interface BeanFactoryPostProcessor {
    void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException;
}
```

Spring 文档中给出的例子是 `PropertySourcesPlaceholderConfigurer` ，将xml中如jdbc的url password等信息再抽取到别的文件，通过 `BeanFactoryPostProcessor` 进行处理再把jdbc信息提取到bean definitions中。另一个例子是 `PropertyOverrideConfigurer` ，可以通过外部文件再对bean的基本类型的属性进行重写。

### FactoryBean

如果你有复杂的初始化代码，可以实现 `FactoryBean` 。通过 `ApplicationContext` 的 getBean(& + factorybeanID) 获得 FactoryBean 本身，如果使用 getBean(factorybeanID) 将会获取 FactoryBean 的产品。

## Environment

`Environment` 是概括应用的两个方面： `profile` （概要文件）和 `properties` （属性）。在Spring Core文档中有对这两个不同概念的解释，此处附上原文。
> A profile is a named, logical group of bean definitions to be registered with the container only if the given profile is active. Beans may be assigned to a profile whether defined in XML or with annotations. The role of the Environment object with relation to profiles is in determining which profiles (if any) are currently active, and which profiles (if any) should be active by default.
> Properties play an important role in almost all applications and may originate from a variety of sources: properties files, JVM system properties, system environment variables, JNDI, servlet context parameters, ad-hoc Properties objects, Map objects, and so on. The role of the Environment object with relation to properties is to provide the user with a convenient service interface for configuring property sources and resolving properties from them.

### Profile

Profile 最常见作用于将生产环境和开发环境隔离。比如使用 `@Profile` 的注解（如使用 @Profile('dev') 和 @Profile('prod')）标注在不同的Bean上，运行时根据参数将会选择使用有 @Profile('*name*') 注解的类。

同时 Profile 支持使用运算符 `!` `&` `|` 来决定是否注册对应的实体。

激活Profile，可以通过 `AnnotationConfigApplicationContext` 中的 `Environment` 的 `setActiveProfiles()` ； `@ActiveProfiles` 注解（在 spring-test 中）；属性文件中配置 `spring.profiles.active` ；JVM参数等方法声明激活的profile。（注意，可以同时激活多个profile）

如果不设定活动的profile是哪个，名称为 `default` 的profile将会被激活。或者，也可以选择设定默认的profile是哪个，如使用 `spring.profiles.default`。

### PropertySource

Spring Boot 中`application.properties` 就是 PropertySource 的使用。使用 `${properties_name}` 的方式获取值，如 `@Value("${properties_name}")`。

## Additional Capabilities

ApplicationContext 实现了一些额外的接口。有支持 `i18n` 的 `MessageSource` ；获取外部资源，如URL和文件的 `ResourceLoader`；通过使用 `ApplicationEventPublisher` 接口，将事件发布到实现 `ApplicationListener` 接口的bean；加载多个（分层）上下文，使每个上下文通过 `HierarchicalBeanFactory` 接口集中在一个特定层上，例如应用程序的Web层；通过 `ResourcePatternResolver` （是 `ResourceLoader` 的子接口）获取资源。

### MessageSource

MessageSource 是使用Java对国际化对基本实现ResourceBundle来实现的。使用ResourceBundle加载的资源文件都必须放置在根目录，并且必须按照`${name}_${language}_${region}`的方式来命名。然后通过`ResourceBundle.getBundle("name", new Locale("language", "region"))`。

MessageSource同样的可以通过 `xml` 或者 `JavaConfig` `*.properties`等方式进行配置源。

通过实现MessageSourceAware的接口可以获取MessageSource，或者使用@Autowired。

通过方法 `String getMessage(String code, Object[] args, String default, Locale loc)` 从注册在系统的消息源（PropertySource）的消息。第二个参数可以动态加入变量。

## Web Application: ContextLoaderListener and ContextLoader

在web应用程序中，并不是主动生成ApplicationContext，而是通过web.xml生成的 `ContextLoaderListener` （继承`ContextLoader`，然后单纯将初始化工作委托给 `ContextLoader`）生成ApplicationContext。它实现了 `ServletContextListener` 这个接口，在 `web.xml` 配置这个监听器，启动容器时，就会默认执行它实现的方法。常见的是通过默认读取 `/WEB-INF/applicationContext.xml` 或者通过通配符 `/WEB-INF/*Context.xml` 获取多个xml文件，用以初始化容器。

### Event 事件发布

事件发布是标准的订阅者模式的实现。

事件发布涉及好几个接口，首先是ApplicationContext实现的 `ApplicationEventPublisher` 接口，实现了一个 `publishEvent` 的方法，参数为 `ApplicationEvent` 或者 `Object`（Spring在4.2版本之后允许直接接收Object参数自动封装为Event）。 Bean可以通过实现 `ApplicationEventPublisherAware` 获取ApplicationEventPublisher进行事件的发布。

通过实现 `ApplicationListener<YourEvent>` 接口，接收其他Bean进行的YourEvent发布。接口方法为 `onApplicationEvent`。

注意默认状态下，所有listener接收event是同步的。（by default, event listeners receive events synchronously. This means that the publishEvent() method blocks until all listeners have finished processing the event. ）同步的好处是可以使用事务来对错误进行回滚。（One advantage of this synchronous and single-threaded approach is that, when a listener receives an event, it operates inside the transaction context of the publisher if a transaction context is available.）

<!-- 如果需要异步的方法来分发Event到listeners，需要通过显式配置修改默认publisher的行为，如加上 `@Async` 注解到接口方法 `onApplicationEvent` 上，配置ApplicationContext的task excutor。参阅 `ApplicationEventMulticaster` 接口及其实现 `SimpleApplicationEventMulticaster` ，并且此处不详细展开。 -->

4.2版本之后，可以直接对方法使用 `@EventListener` 注解来注册事件监听器。通过注解参数可以同时监听多个事件，如 `@EventListener({ContextStartedEvent.class, ContextRefreshedEvent.class})` ，同时可以支持使用condition参数接收SpEL语句进行筛选。

这里有一个有意思的特性，如果这个EventListener函数动作是发布另一个（或多个）事件，可以将函数返回置为想要发布对Event或Event的Collation。但是该特性不支持异步。

使用 `@Async` 将会使EventListener变为异步。异步方法的使用需要注意的是，抛出的错误无法被调用方截获。

使用 `@Order(number)` 来规定监听顺序。

可以使用范型事件。但是由于类型擦除，如果不是指定了范型参数，建议事件实现 `ResolvableTypeProvider`。

## ResourceLoader

建议先参考[Resource](#resource)

ApplicationContext实现了 `ResourcePatternResolver` 接口（是 `ResourceLoader` 的子接口），`Resource` 本质上是JDK `Java.net.URL` 的增强版，同样Bean通过 `ResourceLoaderAware` 获取ResourceLoader。

> `ResourcePatternResolver` 接口是 `ResourceLoader` 的子接口，区别在于支持通配符解析返回多个Resources

# Resource

`Resource` 扩展自 `InputStreamSource` ，除此之外定义了 isExist() isOpen() getDescription() 等方法。虽然用Resource接口是一个强耦合了框架等行为，但是文档认为还是相当值得使用的。

## Built-in Resource Implementations 预置Resource实现

### UrlResource

封装了 `java.net.URL` 解析，识别解析 `file:` `http:` `ftp:` 之类的资源。

### ClassPathResource



# AOP

在Java 语言中，从织入切面的方式上来看，存在三种织入方式：编译期织入、类加载期织入和运行期织入。编译期织入是指在Java编译期，采用特殊的编译器，将切面织入到Java类中；而类加载期织入则指通过特殊的类加载器，在类字节码加载到JVM时，织入切面；运行期织入则是采用CGLib工具或JDK动态代理进行切面的织入。

AspectJ采用编译期织入和类加载期织入的方式织入切面，是语言级的AOP实现，提供了完备的AOP支持。它用AspectJ语言定义切面，在编译期或类加载期将切面织入到Java类中。

AspectJ提供了两种切面织入方式，第一种通过特殊编译器，在编译期，将AspectJ语言编写的切面类织入到Java类中，可以通过一个Ant或Maven任务来完成这个操作；第二种方式是类加载期织入，也简称为LTW（Load Time Weaving）。
[引用](https://zhuanlan.zhihu.com/p/48147296)

