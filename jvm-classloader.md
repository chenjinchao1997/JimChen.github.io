# java ClassLoader

## 双亲委派模型

所有的ClassLoader需要有一个父ClassLoader（不是继承而是组合），当加载一个类的时候，首选会将其委派给父ClassLoader，从而实现同一个类将由同一个ClassLoader生成。

双亲委派模型解决了类错乱加载的问题，也设计得非常精妙。但它也不是万能的，在有些场景也会遇到它解决不了的问题。哪些场景呢？我们举一个例子来看看。

在Java核心类里面有SPI（Service Provider Interface），它由Sun编写规范，第三方来负责实现。SPI需要用到第三方实现类。如果使用双亲委派模型，那么第三方实现类也需要放在Java核心类里面才可以，不然的话第三方实现类将不能被加载使用。但是这显然是不合理的！怎么办呢？ContextClassLoader（上下文类加载器）就来解围了。

在java.lang.Thread里面有两个方法，get/set上下文类加载器

```java
public void setContextClassLoader(ClassLoader cl)
public ClassLoader getContextClassLoader()
```

我们可以通过在SPI类里面调用getContextClassLoader来获取第三方实现类的类加载器。由第三方实现类通过调用setContextClassLoader来传入自己实现的类加载器。这样就变相地解决了双亲委派模式遇到的问题。但是很显然，这种机制破坏了双亲委派模式。

> 作者：juconcurrent
> 链接：<https://www.jianshu.com/p/51b2c50c58eb>
> 来源：简书
> 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
