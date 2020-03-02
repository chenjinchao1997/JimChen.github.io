# ApplicationContext

## super interfaces

```java
public interface ApplicationContext extends EnvironmentCapable, ListableBeanFactory, HierarchicalBeanFactory,
MessageSource, ApplicationEventPublisher, ResourcePatternResolver {...}
```

### EnvironmentCapable

就是具有getEnvironment()方法返回一个Environment。[Environment](./Empty.md)主要包含了ApplicationContext里的profiles和properties。（Models two key aspects of the application environment: profiles and properties）
关于profile和properties：

> A profile is a named, logical group of bean definitions to be registered with the container only if the given profile is active. Beans may be assigned to a profile whether defined in XML or via annotations; see the spring-beans 3.1 schema or the @Profile annotation for syntax details. The role of the Environment object with relation to profiles is in determining which profiles (if any) are currently active, and which profiles (if any) should be active by default.
> Properties play an important role in almost all applications, and may originate from a variety of sources: properties files, JVM system properties, system environment variables, JNDI, servlet context parameters, ad-hoc Properties objects, Maps, and so on. The role of the environment object with relation to properties is to provide the user with a convenient service interface for configuring property sources and resolving properties from them.

EnvironmentCapable原文：

> Interface indicating a component that contains and exposes an Environment reference.
> All Spring application contexts are EnvironmentCapable, and the interface is used primarily for performing instanceof checks in framework methods that accept BeanFactory instances that may or may not actually be ApplicationContext instances in order to interact with the environment if indeed it is available.
> As mentioned, ApplicationContext extends EnvironmentCapable, and thus exposes a getEnvironment() method; however, ConfigurableApplicationContext redefines getEnvironment() and narrows the signature to return a ConfigurableEnvironment. The effect is that an Environment object is 'read-only' until it is being accessed from a ConfigurableApplicationContext, at which point it too may be configured.

### ListableBeanFactory

sub-interface of BeanFactory。顾名思义有getBeanDefinitionNames()获取所有BeanDefinition的名字，还有直接获得Beans的`getBeansOfType(@Nullable Class<T> type)`，获得名称的`getBeanNamesForType(@Nullable Class<?> type)`。注意只返回当前BeanFactory注册的Bean。

### HierarchicalBeanFactory

sub-interface of BeanFactory。提供一个`getParentBeanFactory()`的方法。

### MessageSource

### ApplicationEventPublisher

### ResourcePatternResolver
