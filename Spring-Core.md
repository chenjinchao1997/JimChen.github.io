# Spring Core

本文档基于 Spring 5.2.3.RELEASE

# Spring IoC Container

IoC 指 Inversion of Control。或者称为 Dependency Injection。顾名思义，DI 即是把形如：

```java

public class ToolUsing {
    // Tool为接口
    private Tool tool = new MyToolImpl();
}
```

类`ToolUsing`直接依赖于`MyToolImpl`实现类的这种约束转化为由一个第三方容器管理，使得`ToolUsing`从容器中获取具体的`Tool`的实现，从而使代码解耦。（试想一下，当我们需要使用新的`AnotherToolImpl`作为实现的时候，需要将所有代码里引用了`MyToolImpl`的地方全部替换，这严重违反了开闭原则。）

Spring IoC Container 相当于一个管理了所有 Java 类的工厂（工厂模式），而这些被管理的类统称为 Bean。同时 Spring IoC Container 提供了非常多的能力让我们使用除了获取对象之外的能力，比如指定不同 Bean 之间的初始化顺序（depends-on），提供 Bean 生命流程的 hooks。

`org.springframework.beans` 和 `org.springframework.context` 是 Spring Framework‘s IoC container 的基础包。其中有两个重要的接口：

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

其中 `ApplicationContext` 是 `BeanFactory` 的子接口，BeanFactory 简单地提供`getBean()`方法来提供获取 Bean（provides the configuration framework and basic functionality）。而[ApplicationContext](./Spring-ApplicationContext.md)提供了一些额外的功能比如整合 AOP，事件发布（Event publication）等（adds more enterprise-specific functionality）。

## ApplicationContext

### 工作流程概要

首先无论何种 `ApplicationContext` 的实现，都是先通过一个元数据模型获取所有 Bean 的定义(Configuration Metadata)。通过这些元数据模型生产 Bean Defintions，然后通过这些 Bean Defintions 生成 Bean。**绝大多数的单例 Bean 都是随着容器的创建而创建**。

### 实例化

通常在 Java 项目中，会采用通过 C lassPathXmlApplicationContext 类来实例化容器的方式。
而在 Web 项目中，实例化会交由 Web 服务器实现，会通过 Web.xml 使用 ContextLoaderListener 实现。

## Bean Definition

如何定义这些类的元数据模型呢？Spring 提供了 3 种方法：`xml` `annotation` `java config`。先不论在不同三种方法中如何定义，我们先看 Spring 能让我们定义什么。

1. Bean 对应的 Class；
2. Bean 在容器中的名称；
3. Bean 的作用域（常见的如 `singleton` 单例和 `prototype` 多例）；
4. 设定 Bean 的构造函数的参数的注入来源；
5. 设定 Bean 的属性的注入来源；
6. 是否自动装配（Autowiring Collaborators）及方式（byName byType）；
7. 是否懒加载；
8. Initialization method；
9. Destruction method。

定义一个 Bean，它所对应的 Class Name 及 Id 都是直接明了所必须的属性，无需多讲。注意事项有同一个 spring 配置文件中，bean 的 id、name 是不能够重复的，否则 spring 容器启动时会报错。多个配置文件中是允许有同名 bean 的，并且后面加载的配置文件的中的 bean 定义会覆盖前面加载的同名 bean。

我们先从 `Bean Scope` 讲起。

### `Bean Scope` Bean 的作用域

如果不是使用在 Web 的 ApplicationContext，只有两种作用域，分别是 `singleton` 单例和 `prototype` 多例。

`singleton` 单例代表整个 ApplicationContext 中只会有一个对应类的实例，所有其他对象引用到同一个实现类时所通过 Spring 容器获取到的对象都是该对象。

`prototype` 多例代表每次其他 beans 引用的时候都会产生一个新的 bean。（every time a request for that specific bean is made）
值得注意的是这里在 Spring 生成 Bean 过程中，对于每一个 Bean 中的属性注入 scope = prototype 的 Bean 的时候，都会产生且仅产生一个新的 Bean，而不是每次调用的时候产生一个新的 Bean，如果希望在每次调用的时候获取到一个新的 Bean 应改为使用 Method Injection。而希望该 Bean 在 web-aware 的 ApplicationContext 下暴露其本身的作用域，（If you want to inject (for example) an HTTP request-scoped bean into another bean of a longer-lived scope, you may choose to inject an AOP proxy in place of the scoped bean.）应该使用 [scoped proxy](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#beans-factory-scopes-other-injection)。）

剩下有四种作用域适用于 web-aware 的 ApplicationContext。分别是：

| Scope       | 生存于一个     |
| ----------- | -------------- |
| request     | HTTP request   |
| session     | HTTP session   |
| application | ServletContext |
| websocket   | WebSocket      |

实际上也可以[自定义 Scope](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#beans-factory-scopes-custom-using)。

### Dependency Injection 依赖注入

> 4. 设定 Bean 的构造函数的参数的注入来源；
> 5. 设定 Bean 的属性的注入来源；

在初始化一个即将提供出去的 Bean 时，通过 Java 语法，注入其中的属性有两种方法，通过构造函数注入或者通过 Setter 注入。

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
使用构造函数注入能保证在缺少某些属性准备好的情况下，无法生成一个未准备好的 Bean，以防在程序运行过程中获取到了一个未完成预想中初始化过程的 Bean。但是会出现无法解决的循环依赖问题（A B 相互依赖，由于使用构造函数初始化的特性，在 A 创建前 B 无法创建，而 Setter 注入可以解决这个困境）。由此，理论上最好的方法是在会相互循环依赖的属性以及非必须的属性上使用 Setter 注入的方法，而在必须的属性上使用构造函数注入。

### depends-on

在上面 `Bean Definition` 中没有提及的是 Bean 之间的 `depends-on` 关系，有时候 Bean A 并不持有 Bean B，但是有些操作需要 Bean B 初始化完成后 Bean A 才可以进行初始化，这使用就要设定 `depends-on`。

### Lazy-initialize 懒加载

在前面提到，所有的单例 Bean 会在 Application 容器初始化的时候会进行其中所有单例 Bean 的初始化。由于大量的 Bean 初始化会造成初始化的过程缓慢，可以设定一些非必须资源为懒加载。

### Method Injection

在之前提到，虽然一个 Bean（B）被注入到另一个 Bean（A）的时候，即使 scope 为 prototype，对于被注入的 A 来说，它只拥有一个固定单例 A，如果 B 想要在自己的方法中多次获取不同的 A，就需要用到 Method Inject：

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

在上面的这个抽象类中，通过 Method Injection，Spring 可以通过实现 createCommand 方法，实例一个继承了该类的实例类，每次调用该方法的时候，将会获取一个新的 Command 类对象。

不仅如此，Spring 还可以通过 [MethodReplacer](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#beans-factory-arbitrary-method-replacement) 进行方法的替换。

### Customizing the Nature of a Bean 自定义 Bean 的特性

首先是 Bean 有两个基础的 LifeCycle Callback，分别是初始化方法和销毁方法。有 3 种方法对其进行设定，通过 xml、注解和接口继承。其中官方明确说明不建议使用接口继承的方式进行初始化方法和销毁方法的设定，原因是引入了不必要的耦合。（We recommend that you do not use the InitializingBean interface, because it unnecessarily couples the code to Spring. ）

如果同时使用上述多个方法，这几个方法对启动顺序是：

1. 注解
2. 接口方法
3. 自定义 init 或 destroy 方法

### `*Aware`

Bean 创建之后，有可能需要获取各种容器的信息，通过接口的方式 Spring 容器会将 Bean 需要的东西提供。如：

```java
public interface ApplicationContextAware {
    void setApplicationContext(ApplicationContext applicationContext) throws BeansException;
}
```

一共有以下这些 `*Aware`

| 名称                           | 注入的依赖                                           | 详细                                                                                                                                                            |
| ------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ApplicationContextAware        | ApplicationContext                                   | [ApplicationContextAware and BeanNameAware](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#beans-factory-aware)          |
| BeanNameAware                  | Bean 的名称                                          | [ApplicationContextAware and BeanNameAware](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#beans-factory-aware)          |
| BeanFactoryAware               | 创建该 Bean 的 BeanFactory                           | [ApplicationContextAware and BeanNameAware](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#beans-factory-aware)          |
| ApplicationEventPublisherAware | 事件发布者                                           | [Additional Capabilities of the ApplicationContext](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#context-introduction) |
| BeanClassLoaderAware           | ClassLoader                                          | java.lang.ClassLoader                                                                                                                                           |
| LoadTimeWeaverAware            | LoadTimeWeaver                                       | [Load-time Weaving with AspectJ in the Spring Framework](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#aop-aj-ltw)      |
| MessageSourceAware             | MessageSource                                        | [Additional Capabilities of the ApplicationContext](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#context-introduction) |
| ResourceLoaderAware            | Configured loader for low-level access to resources. | [Resources](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/core.html#resources)                                                    |
| ServletConfigAware             | ServletConfig                                        | [Spring MVC](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/web.html#mvc)                                                          |
| ServletContextAware            | ServletContext                                       | [Spring MVC](https://docs.spring.io/spring/docs/5.2.3.RELEASE/spring-framework-reference/web.html#mvc)                                                          |

### Bean Definition Inheritance Bean 定义继承

`Bean Definition` 既然在 Java 中是以 `BeanDefinition` 类组织的，那么 `BeanDefinition` 直接也可以有继承关系。Bean 定义可以包含许多配置信息，子 bean 定义从父定义继承配置数据。子定义可以覆盖某些值或根据需要添加其他值。

## Container Extension Points 容器扩展点

### BeanPostProcessor

在 Bean 初始化方法前后的扩展点，在真正返回 Bean 前可以对 Bean 进行自定义扩展。常见的套路是在这时候处理自己定义的注解，进行检查或者代理。

```java
public interface BeanPostProcessor {
    // bean初始化方法调用前被调用
    Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException;
    // bean初始化方法调用后被调用
    Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException;
}
```

Spring 中给出的是 `RequiredAnnotationBeanPostProcessor` 作为例子。但是这个类中其实并没有直接实现 BeanPostProcessor 中的方法而是实现了继承自 `InstantiationAwareBeanPostProcessor` 的 `postProcessPropertyValues` 接口。不过实际上逻辑相似，就是检查该 Bean 上有@Required 注解的属性是否有值，如果没有就报错。

### BeanFactoryPostProcessor

BeanFactoryPostProcessor 是在 spring 容器加载了 bean 的定义文件之后，在 bean 实例化之前执行的。接口方法的入参是 ConfigurrableListableBeanFactory。

```java
public interface BeanFactoryPostProcessor {
    void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException;
}
```

Spring 文档中给出的例子是 `PropertySourcesPlaceholderConfigurer` ，将 xml 中如 jdbc 的 url password 等信息再抽取到别的文件，通过 `BeanFactoryPostProcessor` 进行处理再把 jdbc 信息提取到 bean definitions 中。另一个例子是 `PropertyOverrideConfigurer` ，可以通过外部文件再对 bean 的基本类型的属性进行重写。

### FactoryBean

如果你有复杂的初始化代码，可以实现 `FactoryBean` 。通过 `ApplicationContext` 的 getBean(& + factorybeanID) 获得 FactoryBean 本身，如果使用 getBean(factorybeanID) 将会获取 FactoryBean 的产品。

## Environment

`Environment` 是概括应用的两个方面： `profile` （概要文件）和 `properties` （属性）。在 Spring Core 文档中有对这两个不同概念的解释，此处附上原文。

> A profile is a named, logical group of bean definitions to be registered with the container only if the given profile is active. Beans may be assigned to a profile whether defined in XML or with annotations. The role of the Environment object with relation to profiles is in determining which profiles (if any) are currently active, and which profiles (if any) should be active by default.
> Properties play an important role in almost all applications and may originate from a variety of sources: properties files, JVM system properties, system environment variables, JNDI, servlet context parameters, ad-hoc Properties objects, Map objects, and so on. The role of the Environment object with relation to properties is to provide the user with a convenient service interface for configuring property sources and resolving properties from them.

### Profile

Profile 最常见作用于将生产环境和开发环境隔离。比如使用 `@Profile` 的注解（如使用 @Profile('dev') 和 @Profile('prod')）标注在不同的 Bean 上，运行时根据参数将会选择使用有 @Profile('_name_') 注解的类。

同时 Profile 支持使用运算符 `!` `&` `|` 来决定是否注册对应的实体。

激活 Profile，可以通过 `AnnotationConfigApplicationContext` 中的 `Environment` 的 `setActiveProfiles()` ； `@ActiveProfiles` 注解（在 spring-test 中）；属性文件中配置 `spring.profiles.active` ；JVM 参数等方法声明激活的 profile。（注意，可以同时激活多个 profile）

如果不设定活动的 profile 是哪个，名称为 `default` 的 profile 将会被激活。或者，也可以选择设定默认的 profile 是哪个，如使用 `spring.profiles.default`。

### PropertySource

Spring Boot 中`application.properties` 就是 PropertySource 的使用。使用 `${properties_name}` 的方式获取值，如 `@Value("${properties_name}")`。

## Additional Capabilities

ApplicationContext 实现了一些额外的接口。有支持 `i18n` 的 `MessageSource` ；获取外部资源，如 URL 和文件的 `ResourceLoader`；通过使用 `ApplicationEventPublisher` 接口，将事件发布到实现 `ApplicationListener` 接口的 bean；加载多个（分层）上下文，使每个上下文通过 `HierarchicalBeanFactory` 接口集中在一个特定层上，例如应用程序的 Web 层；通过 `ResourcePatternResolver` （是 `ResourceLoader` 的子接口）获取资源。

### MessageSource

MessageSource 是使用 Java 对国际化对基本实现 ResourceBundle 来实现的。使用 ResourceBundle 加载的资源文件都必须放置在根目录，并且必须按照`${name}_${language}_${region}`的方式来命名。然后通过`ResourceBundle.getBundle("name", new Locale("language", "region"))`。

MessageSource 同样的可以通过 `xml` 或者 `JavaConfig` `*.properties`等方式进行配置源。

通过实现 MessageSourceAware 的接口可以获取 MessageSource，或者使用@Autowired。

通过方法 `String getMessage(String code, Object[] args, String default, Locale loc)` 从注册在系统的消息源（PropertySource）的消息。第二个参数可以动态加入变量。

## Web Application: ContextLoaderListener and ContextLoader

在 web 应用程序中，并不是主动生成 ApplicationContext，而是通过 web.xml 生成的 `ContextLoaderListener` （继承`ContextLoader`，然后单纯将初始化工作委托给 `ContextLoader`）生成 ApplicationContext。它实现了 `ServletContextListener` 这个接口，在 `web.xml` 配置这个监听器，启动容器时，就会默认执行它实现的方法。常见的是通过默认读取 `/WEB-INF/applicationContext.xml` 或者通过通配符 `/WEB-INF/*Context.xml` 获取多个 xml 文件，用以初始化容器。

### Event 事件发布

事件发布是标准的订阅者模式的实现。

事件发布涉及好几个接口，首先是 ApplicationContext 实现的 `ApplicationEventPublisher` 接口，实现了一个 `publishEvent` 的方法，参数为 `ApplicationEvent` 或者 `Object`（Spring 在 4.2 版本之后允许直接接收 Object 参数自动封装为 Event）。 Bean 可以通过实现 `ApplicationEventPublisherAware` 获取 ApplicationEventPublisher 进行事件的发布。

通过实现 `ApplicationListener<YourEvent>` 接口，接收其他 Bean 进行的 YourEvent 发布。接口方法为 `onApplicationEvent`。

注意默认状态下，所有 listener 接收 event 是同步的。（by default, event listeners receive events synchronously. This means that the publishEvent() method blocks until all listeners have finished processing the event. ）同步的好处是可以使用事务来对错误进行回滚。（One advantage of this synchronous and single-threaded approach is that, when a listener receives an event, it operates inside the transaction context of the publisher if a transaction context is available.）

<!-- 如果需要异步的方法来分发Event到listeners，需要通过显式配置修改默认publisher的行为，如加上 `@Async` 注解到接口方法 `onApplicationEvent` 上，配置ApplicationContext的task excutor。参阅 `ApplicationEventMulticaster` 接口及其实现 `SimpleApplicationEventMulticaster` ，并且此处不详细展开。 -->

4.2 版本之后，可以直接对方法使用 `@EventListener` 注解来注册事件监听器。通过注解参数可以同时监听多个事件，如 `@EventListener({ContextStartedEvent.class, ContextRefreshedEvent.class})` ，同时可以支持使用 condition 参数接收 SpEL 语句进行筛选。

这里有一个有意思的特性，如果这个 EventListener 函数动作是发布另一个（或多个）事件，可以将函数返回置为想要发布对 Event 或 Event 的 Collation。但是该特性不支持异步。

使用 `@Async` 将会使 EventListener 变为异步。异步方法的使用需要注意的是，抛出的错误无法被调用方截获。

使用 `@Order(number)` 来规定监听顺序。

可以使用范型事件。但是由于类型擦除，如果不是指定了范型参数，建议事件实现 `ResolvableTypeProvider`。

## ResourceLoader

建议先参考[Resource](#resource)

ApplicationContext 实现了 `ResourcePatternResolver` 接口（是 `ResourceLoader` 的子接口），`Resource` 本质上是 JDK `Java.net.URL` 的增强版，同样 Bean 通过 `ResourceLoaderAware` 获取 ResourceLoader。

> `ResourcePatternResolver` 接口是 `ResourceLoader` 的子接口，区别在于支持通配符解析返回多个 Resources

# Resource

`Resource` 扩展自 `InputStreamSource` ，除此之外定义了 isExist() isOpen() getDescription() 等方法。虽然用 Resource 接口是一个强耦合了框架等行为，但是文档认为还是相当值得使用的。

## Built-in Resource Implementations 预置 Resource 实现

### UrlResource

封装了 `java.net.URL` 解析，识别解析 `file:` `http:` `ftp:` 之类的资源。

### ClassPathResource

# AOP

在 Java 语言中，从织入切面的方式上来看，存在三种织入方式：编译期织入、类加载期织入和运行期织入。编译期织入是指在 Java 编译期，采用特殊的编译器，将切面织入到 Java 类中；而类加载期织入则指通过特殊的类加载器，在类字节码加载到 JVM 时，织入切面；运行期织入则是采用 CGLib 工具或 JDK 动态代理进行切面的织入。

AspectJ 采用编译期织入和类加载期织入的方式织入切面，是语言级的 AOP 实现，提供了完备的 AOP 支持。它用 AspectJ 语言定义切面，在编译期或类加载期将切面织入到 Java 类中。

AspectJ 提供了两种切面织入方式，第一种通过特殊编译器，在编译期，将 AspectJ 语言编写的切面类织入到 Java 类中，可以通过一个 Ant 或 Maven 任务来完成这个操作；第二种方式是类加载期织入，也简称为 LTW（Load Time Weaving）。
[引用](https://zhuanlan.zhihu.com/p/48147296)

Spring 支持的 AOP 对比 AspectJ 是阉割的。

使用以下配置启用 AspectJ（@AspectJ support enabled）：

```java
@Configuration
@EnableAspectJAutoProxy
public class AppConfig {

}
```

AOP 关键词有三个， 切面`Aspect` 注入点`Pointcut` 增强`Adivice`。

## 切面

直接在类上加 `@Aspect` 注解。

## 切入点

通过 `@Pointcut` 注解表明该方法将在哪里起作用。以下是在 `@Pointcut` 中可使用的表达式。

1. execution: For matching method execution join points. This is the primary pointcut designator to use when working with Spring AOP. 通用方法，表达式匹配切入的方法。

2. within: Limits matching to join points within certain types (the execution of a method declared within a matching type when using Spring AOP). 只匹配对应类中的方法。

3. this: Limits matching to join points (the execution of methods when using Spring AOP) where the bean reference (Spring AOP proxy) is an instance of the given type. 匹配的是代理对象的类型，例如存在一个接口 B，使用 this（"B"），如果某个类 A 的 JDK 代理对象类型为 B，则 A 实现的接口 B 的方法会作为切点进行织入。例如 A 继承了接口 B，则 within（"B"）不会匹配到 A，但是 within（"B+"）可以匹配到 A。

4. target: Limits matching to join points (the execution of methods when using Spring AOP) where the target object (application object being proxied) is an instance of the given type. 匹配目标对象的类型，即被代理对象的类型，例如 A 继承了 B 接口，则使用 target（"B"），target（"A"）均可以匹配到 A。

5. args: Limits matching to join points (the execution of methods when using Spring AOP) where the arguments are instances of the given types. 该函数接收一个类名，表示目标类方法入参对象是指定类（包含子类）时，切点匹配。比如 args(com.xgj.Waiter) 表示运行时入参是 Waiter 类型的方法，它和 `execution(* *(com.xgj.Waiter))` 的区别在于后者是这对类方法的签名而言的，而前者是针对运行时的入参类型而言。

值得注意的是 args 是在运行时，execution 里面的是判断方法签名。比如 `args(com.xgj.Waiter)` 既匹配 `addWiter（Waiter waiter）` ，又匹配 `addNaiveWaiter(NaiveWaiter waiter)` 。而 `execution(* *(com.xgj.Waiter))`，实际上 `args(com.xgj.Waiter)` 等价于 `execution(* *(com.xgj.Waiter+))`，当然也等价于 `args(com.xgj.Waiter+)`。 Note that the pointcut given in this example is different from `execution(* *(java.io.Serializable))`. The args version matches if the argument passed at runtime is Serializable, and the execution version matches if the method signature declares a single parameter of type Serializable.

参考资料：解释了 this <https://blog.csdn.net/dhaiuda/article/details/82317005>

以上所有表达式可以组合，如下：

```java
@Pointcut("execution(public * (..))")
private void anyPublicOperation() {}

@Pointcut("within(com.xyz.someapp.trading..)")
private void inTrading() {}

@Pointcut("anyPublicOperation() && inTrading()")
private void tradingOperation() {}
```

其他可使用的注解。

1. @target: Limits matching to join points (the execution of methods when using Spring AOP) where the class of the executing object has an annotation of the given type.

2. @args: Limits matching to join points (the execution of methods when using Spring AOP) where the runtime type of the actual arguments passed have annotations of the given types.

3. @within: Limits matching to join points within types that have the given annotation (the execution of methods declared in types with the given annotation when using Spring AOP).

4. @annotation: Limits matching to join points where the subject of the join point (the method being executed in Spring AOP) has the given annotation.

`@target` `@args` `@within` 都是匹配使用了指定注解的类或方法，效果同上。如：

```java
@within(org.springframework.transaction.annotation.Transactional)
```

指定了所有 `@Transactional` 类。

## 增强

以上只是找到注入点，实际上如果需要对入参或者返回进行处理，则需要增强。

```java
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;

@Aspect
public class BeforeExample {

    @Before("execution(* com.xyz.myapp.dao..(..))")
    public void doAccessCheck() {
        // ...
    }
    @Aspect

    @Around("com.xyz.myapp.SystemArchitecture.businessService()")
    public Object doBasicProfiling(ProceedingJoinPoint pjp) throws Throwable {
        // start stopwatch
        Object retVal = pjp.proceed();
        // stop stopwatch
        return retVal;
    }

    @Pointcut("com.xyz.myapp.SystemArchitecture.dataAccessOperation() && args(account,..)")
    private void accountDataAccessOperation(Account account) {}

    @Before("accountDataAccessOperation(account)")
    public void validateAccount(Account account) {
        // ...
    }
}
```

可以使用 `ProceedingJoinPoint` 参数获取如实际传递的参数，代理对象，被代理对象等。
同时，可以使用切入点表达式来匹配及捕获传递参数。

下面是一个匹配范型的例子：

```java
public interface Sample<T> {
    void sampleGenericMethod(T param);
    void sampleGenericCollectionMethod(Collection<T> param);
}

@Before("execution(* ..Sample+.sampleGenericMethod(*)) && args(param)")
public void beforeSampleMethod(MyType param) {
    // Advice implementation
}

@Before("execution(* ..Sample+.sampleGenericCollectionMethod(*)) && args(param)")
public void beforeSampleMethod(Collection<MyType> param) {
    // Advice implementation
}
```

同时如果出现组合参数情况：

```java
@Before(value="com.xyz.lib.Pointcuts.anyPublicMethod() && target(bean) && @annotation(auditable)",
        argNames="bean,auditable")
public void audit(JoinPoint jp, Object bean, Auditable auditable) {
    AuditCode code = auditable.value();
    // ... use code, bean, and jp
}
```
