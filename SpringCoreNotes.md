# Spring Core

## IoC container

IoC的概念不多做介绍。
比较重要的有两个类，分别是：
`org.springframework.beans.factory.BeanFactory`和`org.springframework.context.ApplicationContext`。
BeanFactory简单地提供`getBean()`方法来提供获取Bean（provides the configuration framework and basic functionality）。而[ApplicationContext](./Spring-ApplicationContext.md)提供了一些额外的功能比如整合AOP，事件发布（Event publication）等（adds more enterprise-specific functionality），ApplicationContext is a sub-interface of BeanFactory。

### Configuration Metadata 配置元数据

Configuration Metadata是描述如何初始化、配置和组装对象的数据。
（tell the Spring container to instantiate, configure, and assemble the objects in your application）

有三种方式配置元数据：

1. XML-based 传统的直接之用xml文件进行配置
2. Annotaions-based 使用annotation在Bean上直接配置
3. Java-based 使用Java代码配置

#### [XML-based](./XML-based-Config.md)

使用传统的xml文件进行配置，好处是不需要重新编译代码。

#### Annotaions-based

Annotaions-based需要直接到对应bean上

@Required
@Autowired
Autowired除了Constructor Injection和Setter Injection还有Field Injection
@Qualifier
@Primary
@Resource
@PostConstruct and @PreDestroy

### DI style

#### Constructor-based or setter-based

必须的用Constructor，可选的用setter。Spring官方是建议多使用Constructor，这样可以保证返回的时候始终是一个完整初始化的对象（constructor-injected components are always returned to the client (calling) code in a fully initialized state）。

### Bean作用域 Beans Scopes

基础两个是singleton和prototype，分别是单例和多例。
剩下有request、session、application和websocket，分别对应http模式下单个request、session、servlet和websocket中只有一个实例。

```xml
<bean id="accountService" class="com.something.DefaultAccountService" scope="singleton"/>

<bean id="accountService" class="com.something.DefaultAccountService" scope="prototype"/>
```

#### \<aop:scoped-proxy/\>

　　如果一个singleton的bean中引用了一个prototype的bean，结果会怎样呢？在默认情况下，单例会永远持有一开始构造所赋给它的值。这就使比如session生命周期的bean被另一个singleton bean引用，在session关闭之后，这个session bean仍然不会回收。

> https://www.cnblogs.com/qbzf-Blog/p/6538564.html
> 首先看一下Spring文档上的两个例子对比：

```xml
<bean id="userPreferences" class="com.foo.UserPreferences" scope="session"/>

<bean id="userManager" class="com.foo.UserManager">
    <property name="userPreferences" ref="userPreferences"/>
</bean>
```

> 另外一个例子：

```xml
<bean id="userPreferences" class="com.foo.UserPreferences" scope="session">
    <aop:scoped-proxy/>
</bean>

<bean id="userManager" class="com.foo.UserManager">
    <property name="userPreferences" ref="userPreferences"/>
</bean>
```

> 如果只考虑容器对bean的实例化，scoped-proxy确实没什么意义，scoped-proxy的意义在关联bean之间的依赖时才能体现。
> 前一个例子没有使用`<aop:scoped-proxy/>`，那么在这里userManager的作用域是singleton，容器中仅初始化一次，其作为属性userPreferences也仅被注入一次。当session失效后，容器中userManager的实例仍然存在，其属性userPreferences也随着存在，换句话说，userManager以后使用的userPreferences永远都是同一个。
> 但后一个例子则不一样，userManager的属性userPreferences指向的是com.foo.UserPreferences实例的代理，当session过期后，userManager的属性userPreferences自然也不能再使用，也就是userManager的作为属性时的生命周期是按照自身声明的。
> 那么proxy，它代理的工作就是——暴露这个bean令其符合其自身作用域。

### 自定义Bean的性质 Customizing the Nature of a Bean

三个方面：

1. 生命周期回调 Lifecycle Callbacks
2. ApplicationContextAware and BeanNameAware
3. Other Aware Interfaces

#### Lifecycle Callbacks

有几种方法：

1. 实现Spring Framework里的接口
2. 在xml中定义init-method和destory-method
3. 使用@PostConstruct @PreDestroy注解

##### Spring Framework里的接口

InitializingBean DisposableBean

```java
public interface InitializingBean {
    void afterPropertiesSet() throws Exception;
}

public interface DisposableBean {
    void destroy() throws Exception;
}
```

然而这种方法是不被推荐的，因为这种方法耦合了Spring的代码。（We recommend that you do not use the InitializingBean interface, because it unnecessarily couples the code to Spring. ）

##### xml中定义

```xml
<bean id="exampleInitBean" class="examples.ExampleBean" init-method="init"/>
```

##### 注解

@PostConstruct @PreDestroy

##### 注意事项

如果同时使用上述多个方法，这几个方法对启动顺序是：

1. Methods annotated with @PostConstruct
2. afterPropertiesSet() as defined by the InitializingBean callback interface
3. A custom configured init() method

destory

1. Methods annotated with @PreDestroy
2. destroy() as defined by the DisposableBean callback interface
3. A custom configured destroy() method

#### Lifecycle 接口

通常用来做守护进程一样的对象（such as starting and stopping some background process）

Spring可以帮助我们管理一些具有生命周期的对象。当ApplicationContext接收到start或者stop的信号，会级联通知下面所有LifeCycle对象进行对应操作。这个操作是委托给LifecycleProcessor（有一个DefaultLifecycleProcessor实现）。

其中SmartLifecycle是一个Lifecycle的子接口，特点就是多加了个getPhase()函数，用来设定这个对象的启动先后等级。

所有这些Lifecycle对象将在bean创建和初始化完之后创建。

关于这些对象是怎么管理的看DefaultLifecycleProcessor源码。

#### `ApplicationContextAware` and `BeanNameAware`

ApplicationContextAware就是一个接口：

```java
void setApplicationContext(ApplicationContext applicationContext)
```

这样就可以拿到ApplicationContext，但是不建议使用，还是耦合过重的问题。同时如果可以使用@Autowired就不建议使用这种方式获取Bean。

于此相似比较有用的就是BeanNameAware。除此之外还有很多Aware，可以参阅Spring Core官方文档。

### Bean Definition Inheritance

Bean对应的BeanDefinition也可以有相应的继承关系。

```xml
<bean id="inheritedTestBean" abstract="true">
    <property name="name" value="parent"/>
    <property name="age" value="1"/>
</bean>

<bean id="inheritsWithDifferentClass"
        class="org.springframework.beans.DerivedTestBean"
        parent="inheritedTestBean" init-method="initialize">  
    <property name="name" value="override"/>
    <!-- the age property value of 1 will be inherited from parent -->
</bean>
```

### Container Extension Points 容器的扩展点

#### BeanPostProcessor

```java
public interface BeanPostProcessor {
    //bean初始化方法调用前被调用
    Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException;
    //bean初始化方法调用后被调用
    Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException;

}
```

这里有一个很好的[例子](https://www.jianshu.com/p/1417eefd2ab1)。这个例子主要是，目前存在两个版本的代码，在一次AB测试中需要进行切换，如果使用简单的if-else语句去处理就会非常冗长。这个例子使用了两个注解，在方法上进行代理。

通常使用一个BeanPostProcessor的方式是，在一个interface上加上自定义注解，然后通过拦截到注入过程来自定规则修改注入的bean。

#### BeanFactoryPostProcessor

与上面的`BeanPostProcessor`相似，这个是用来改Bean Definition的。

### Annotation-based Container Configuration

这部分解释怎么使用Annotation进行容器的配置。

首先是配置文件的xml可以使用java文件进行代替：

```java
@Configuration
@ComponentScan(basePackages = "com.demo.beans")
@ImportResource("classpath:applicationContext-configuration.xml")
@PropertySource("classpath:application.properties") // 用于获取properties
@Import(AnotherConfiguration.class)
public class MyConfiguration {
    public MyConfiguration() {
        System.out.println("MyConfiguration容器启动初始化...";
    }

    @Bean(name="testBean", initMethod="start", destroyMethod="destroy")
    @Primary // 首先会注入这个
    @Scope("prototype")
    public TestBean testBean() {
        return new TestBean();
    }

    @Bean
    public TestBean testBean2() {
        return new TestBean2();
    }
}

public class Test {

    @Autowired
    @Qualifier("testBean2") // 按名称注入第二个
    MyBean bean;

    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(MyConfiguration.class);
    }
}
```

@Autowired是Spring自己的注解，而在java新规范里有一个@Resource注解，这个注解与@Autowired的区别就是@Autowired是优先根据类型，而@Resource是优先根据名称来找。

@Value是用来注入外部properties。在Config上标注@PropertySource()。

```java
// 可以通过下面的方式提供默认值
@Value("${catalog.name:defaultCatalog}") String catalog
```

如果要控制不存在的值，需要声明一个PropertySourcesPlaceholderConfigurer bean。(If you want to maintain strict control over nonexistent values, you should declare a PropertySourcesPlaceholderConfigurer bean, as the following example shows:)

```java
@Configuration
public class AppConfig {

     @Bean
     // must be static
     public static PropertySourcesPlaceholderConfigurer propertyPlaceholderConfigurer() {
           return new PropertySourcesPlaceholderConfigurer();
     }
}
```

除此之外还提供SpEL：

```java
public MovieRecommender(@Value("#{systemProperties['user.catalog'] + 'Catalog' }") String catalog) {
    this.catalog = catalog;
}

public MovieRecommender(@Value("#{${user.catalog} + 'Catalog' }") String catalog) {
    this.catalog = catalog;
}

public MovieRecommender(
        @Value("#{{'Thriller': 100, 'Comedy': 300}}") Map<String, Integer> countOfMoviesPerCatalog) {
    this.countOfMoviesPerCatalog = countOfMoviesPerCatalog;
}
```

@PostConstruct和@PreDestroy分别直接对应Bean生命周期初始化和回收前。

@Repository @Service @Controller @Component是一套用于Spring直接扫描包生成Bean Definition的注解。@Repository @Service @Controller是@Component的特化，除了@Repository有自动封装抛出异常的功能外其他几个目前只是名字的不同。

在Component的Scanning上能使用@Filter注解对扫描进行过滤：

```java
@Configuration
@ComponentScan(basePackages = "org.example",
        includeFilters = @Filter(type = FilterType.REGEX, pattern = ".*Stub.*Repository"),
        excludeFilters = @Filter(Repository.class))
public class AppConfig {
}
```

在@Component注释的类下仍然能使用@Configuration下的@Bean注释：

```java
@Component
public class FactoryMethodComponent {

    private static int i;

    @Bean
    @Qualifier("public")
    public TestBean publicInstance() {
        return new TestBean("publicInstance");
    }

    // use of a custom qualifier and autowiring of method parameters
    @Bean
    protected TestBean protectedInstance(
            @Qualifier("public") TestBean spouse,
            @Value("#{privateInstance.age}") String country) {
        TestBean tb = new TestBean("protectedInstance", 1);
        tb.setSpouse(spouse);
        tb.setCountry(country);
        return tb;
    }

    @Bean
    private TestBean privateInstance() {
        return new TestBean("privateInstance", i++);
    }

    @Bean
    @RequestScope
    public TestBean requestScopedInstance() {
        return new TestBean("requestScopedInstance", 3);
    }
}
```

@Configuration中的@Bean和@Component的@Bean区别在于@Configuration使用来CGLIB而@Component没有。

```java
@Component
@Qualifier("Action")
public class ActionMovieCatalog implements MovieCatalog {
    // ...
}
```

Annotation-based 和 Java-based 的设置区别在于，Annotation-based是使用@Component，而Java-based是@Configuration下@Bean。
（The official Spring documentation refers to configuring your beans using a Java class annotated with @Configuration and containing @Bean methods as 'Java Configuration'. This allows you to be absolutely free of all XML in your application (at least as far as Spring goes). This support was added in Spring 3.0, and has gotten more powerful.）
（Starting from Spring 2.5 it became possible to configure the dependency injection using annotations. So instead of using XML to describe a bean wiring, you can move the bean configuration into the component class itself by using annotations on the relevant class, method, or field declaration.）

Spring原文中有论述在@Configuration下的@Bean和@Component下的@Bean的区别，但是本人才学疏浅没太看懂。。

> When @Bean methods are declared within classes that are not annotated with @Configuration, they are referred to as being processed in a “lite” mode. Bean methods declared in a @Component or even in a plain old class are considered to be “lite”, with a different primary purpose of the containing class and a @Bean method being a sort of bonus there. For example, service components may expose management views to the container through an additional @Bean method on each applicable component class. In such scenarios, @Bean methods are a general-purpose factory method mechanism.
> Unlike full @Configuration, lite @Bean methods cannot declare inter-bean dependencies. Instead, they operate on their containing component’s internal state and, optionally, on arguments that they may declare. Such a @Bean method should therefore not invoke other @Bean methods. Each such method is literally only a factory method for a particular bean reference, without any special runtime semantics. The positive side-effect here is that no CGLIB subclassing has to be applied at runtime, so there are no limitations in terms of class design (that is, the containing class may be final and so forth).
> In common scenarios, @Bean methods are to be declared within @Configuration classes, ensuring that “full” mode is always used and that cross-method references therefore get redirected to the container’s lifecycle management. This prevents the same @Bean method from accidentally being invoked through a regular Java call, which helps to reduce subtle bugs that can be hard to track down when operating in “lite” mode.

JSR-330里面有标准的注解。@Inject相当于@Autowired，@Named\@ManagedBean相当于@Component，@Named相当于@Qualifier。

Lookup Method Injection

一个单例里持有一个prototype的Bean怎么办：

```java
public abstract class CommandManager {
    public Object process(Object commandState) {
        // grab a new instance of the appropriate Command interface
        Command command = createCommand();
        // set the state on the (hopefully brand new) Command instance
        command.setState(commandState);
        return command.execute();
    }

    // okay... but where is the implementation of this method?
    protected abstract Command createCommand();
}

@Bean
@Scope("prototype")
public AsyncCommand asyncCommand() {
    AsyncCommand command = new AsyncCommand();
    // inject dependencies here as required
    return command;
}

@Bean
public CommandManager commandManager() {
    // return new anonymous implementation of CommandManager with createCommand()
    // overridden to return a new prototype Command object
    return new CommandManager() {
        protected Command createCommand() {
            return asyncCommand();
        }
    }
}
```

等同

```java
public abstract class CommandManager {
    public Object process(Object commandState) {
        Command command = createCommand();
        command.setState(commandState);
        return command.execute();
    }

     @Lookup("myCommand")
     // @Lookup // Or, more idiomatically, you can rely on the target bean getting resolved against the declared return type of the lookup method
     protected abstract Command createCommand();
}

@Bean
@Scope("prototype")
public AsyncCommand asyncCommand() {
    AsyncCommand command = new AsyncCommand();
    // inject dependencies here as required
    return command;
}
```

### Environment

@Profile就是用来标注这个环境是属于哪个环境，我们经常会有生产、开发以及测试QA三种环境，同时具有三个数据源。而测试的时候使用数据源就会进行切换：

```java
@Bean
@Profile("dev")
public DataSource dev() {}

@Bean
@Profile("deployment")
public DataSource deployment() {}
```

测试中可以使用

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = Config.class)
@ActiveProfiles("dev")
public class SpringTest {
}
```

生产环境中

```java
AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
ctx.getEnvironment().setActiveProfiles("deployment");
```

或在启动中加入参数`-Dspring.profiles.active="dev,dev2"`

还能使用默认Profile

```java
@Configuration
@Profile("default")
public class DefaultDataConfig {

    @Bean
    public DataSource dataSource() {
    }
}
```

application.properties就是用来做`${}`String类型值注入的。

### LoadTimeWeaver 代码织入

LoadTimeWeaver 是AOP支持。是装载入JVM中的。

```java
@Configuration
@EnableLoadTimeWeaving // 起用LoadTimeWeaver
public class AppConfig {
}
```

### MessageSource i18n

MessageSource的功能就是用Java标准库的ResourceBundle实现的。

首先看看ResourceBundle是如何实现的。假设有三个properties文件。

```properties
#i18n_en_US.properties
say=Hallo world!

#i18n_zh_CN.properties
say=\u5927\u5BB6\u597D\uFF01

#i18n_web_BASE64.properties
say=+-+-+-ABC
```

```java
public class I18nApp {

    public static void main(String[] args) {
        //使用当前操作系统的语言环境
        ResourceBundle rb = ResourceBundle.getBundle("i18n", Locale.getDefault());
        System.out.println(rb.getString("say"));

        //指定简体中文环境
        rb = ResourceBundle.getBundle("i18n", new Locale("zh", "CN"));
        System.out.println(rb.getString("say"));
        //通过预设指定简体英文环境
        rb = ResourceBundle.getBundle("i18n", Locale.SIMPLIFIED_CHINESE);
        System.out.println(rb.getString("say"));

        //指定美国英语
        rb = ResourceBundle.getBundle("i18n", Locale.US);
        System.out.println(rb.getString("say"));

        //使用自定义的语言环境
        Locale locale = new Locale("web", "BASE64");
        rb = ResourceBundle.getBundle("i18n", locale);
        System.out.println(rb.getString("say"));
    }
}
```

按照开发文档的要求，使用ResourceBundle加载的资源文件都必须放置在根目录，并且必须按照\${name}\_\${language}\_\${region}的方式来命名。这个命名方式正好能对应ResourceBundle::getBundle方法中的参数，例如ResourceBundle.getBundle("i18n", new Locale("zh", "CN"))。"i18n"对应\${name}，"zh"定位\${language}，而“CN”对应\${region}。

Spring中需要使用一个Bean注册：

```java
@Configuration
public class I18nApp {
    @Bean("messageSource") // 必须
    ResourceBundleMessageSource resourceBundleMessageSource() {
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        messageSource.setBasenames(new String[] { "i18n", "other" });//添加资源名称
        return messageSource;
    }

    public static void main(String[] args) {
        ApplicationContext context = new AnnotationConfigApplicationContext(I18nApp.class);
        System.out.println("Spring Default 1:" + context.getMessage("say", null, Locale.getDefault()));
        System.out.println("Spring Default 2:" + context.getMessage("say", null, null));
        System.out.println("Spring Chinese:" + context.getMessage("say", null, Locale.SIMPLIFIED_CHINESE));
        System.out.println("Spring Us English:" + context.getMessage("say", null, Locale.US));
        System.out.println("Spring Custom:" + context.getMessage("say", null, new Locale("web", "BASE64")));
        // 替换占位符 {0}
        System.out.println("Spring Argument:" + context.getMessage("info", new String[] {"chkui"},null));
        System.out.println("Spring Info:" + context.getMessage("say", null, null));
    }
}
```

使用MessageSourceAware或@Autowired

```java
//从容器直接注入
public class ExtendBean {
    @Autowired
    private MessageSource autowiredMs;
}

//MessageSourceAware（ApplicationContextAware）接口
public class ExtendBean implements MessageSourceAware {
    @Override
    public void setMessageSource(MessageSource messageSource) {
        this.setterMs = messageSource;
    }
}
```
