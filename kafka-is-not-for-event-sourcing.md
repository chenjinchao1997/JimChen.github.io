# 翻译：为什么 Kafka 不适合做 Event Sourcing

> 原文地址：<https://medium.com/serialized-io/apache-kafka-is-not-for-event-sourcing-81735c3cf5c>
> 作者：Jesper Hammarbäck
> 在学习 Event Sourcing 相关知识的时候，发现 Kafka 对消息持久化的方式特别适合 Event Sourcing，在查阅资料过程中发现早有前人讨论了这个设想。
> 非英语专业，文章偏向意译，不准确的地方请多包涵。

Kafka 作为一个消息中间件是一个非常好的工具，同时对 topic 持久化的能力让你可以永久————如果你希望的话————将 messages 保存下来。(the optional topic durability allows you to store your messages permanently)

因此，如果你的 messages 是 event 的话，你可以使用 kafka 来做 _event store_ 或者 _event log_，但是它真的不是一个做 _event sourcing_ 的好工具。

下面将讲述理由。

## 加载实体当前状态(Loading current state)

当一个服务接受一个 command，要求改变一个使用了具有事件溯源的实体(event sourced entity)，我们首先要重建这个实体的当前状态。我们通过从 event store 中加载特定实体 ID 的所有事件并重新应用我们的实体(的初始状态)，得到了实体的当前状态。

(但是)获取某个特定实体的所有 event 并非一件易事，Topic 通常以各种实体类型(如 “Orders”、“Payments”、“Notifications”)集中并分区(centered around and partitioned)，因此我们必须要遍历所有“Orders”的所有 event，去获得某个特定的实体的当前状态。尽管这是**可行的**，却不实际。

一个代替方案是一个实体拥有一个 topic，但是这样我们就将面临成千上万的 topic，并且更困难的是，下游的订阅服务(译者：消费者)需要自动发现承载一个 entity 的最新的 topic。同样的，不实际。

## 写入一致性 (Consistent writes)

当我们的实体重建了，这时候该执行刚刚接受的 command 所包含的业务逻辑了。如果业务逻辑失败，我们会向客户端返回一个 error，如果成功，将会提交一个新的 event。这样，我们就必须保证不能有同一个实体的别的 event 同时保存到我们的 event store 中去，否则我们将承担破坏我们领域对象的一致性。

### 用 OCC 进行补救 (OCC to the rescue)

一个保证写入一致性的方法是运用 event store 的 _optimistic concurrency control_。一个像样的 event store 应当让用户做出 “保存这个 event 当且仅当这个实体的版本仍然是 x” 这种控制。[Kafka 并不支持这个](https://issues.apache.org/jira/browse/KAFKA-2260)(<这里的引用是KAFKA-2260，在18年的时候有个大哥写了个comment说[这里](https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging)已经解决这个问题>)，该领域专家建议的解决方法似乎是在之前放置一个“数据库”以提供一个一致性点。尽管此建议在某些情况下可能是可行的解决方案，但从长远来看，选择更适合特定问题的工具可能更明智。

### 单一写入 (Single-writer)

另一个保证一致性的方法就是保证顺序写入，比如使用 _single-writer principle_，意思就是，我们保证所有某个 id 的实体的写入都会在同一个线程发生。我们可以通过保证生产者(producer)同时是自己的消费者(consumer)，从而有效地阻塞该 event，直到该 event 提交并在 Kafka 的另一端可用。这种设计会对性能产生严重影响，尤其是考虑到上面谈到有限的加载实体的功能。

## 究竟合不合适 (Does it fit at all?)

所以，一个 event sourcing 的系统设计中能容下 Kafka 吗？也许。可能。作为将事件传输到下游查询服务或读取模型的一种方式，它可能是对事件存储的一个很好的补充。

但是，在向我们的系统中添加大型而复杂的基础架构时，我们应始终谨慎————一切都是有代价的，因此请确保它足以应付当前的问题！

如果您想开始做 event sourcing，而且你重视 HTTP 的简单性并欣赏 hosted service，请看一下我们在 [Serialized](https://serialized.io/)(译者：稍微看了一下，貌似是一个 Event Store)所做的工作。

<!-- ## 译者的思考

正如这篇文章所说，主要的核心矛盾点在于，**加载实体当前状态**这一块确实是不好做。我曾考虑锅利用哈希桶，配合时间戳，平衡 topic 和实体的对应关系，及一个 topic 对应一类实体中，hash 值开头某 n 位相同的若干实体。同时使用 Single-writer ，像文章给出的建议那样，生产者同时是对应的消费者。问题是在于 topic 和实体的对应数量关系是否真的存在一个解使得性能和资源得以平衡（如果这个对应关系是动态的那就更加复杂了）。通过 hash 将实体分配到不同的 topic 下的时候，如果单个 topic 对应的实体数量量级不大，是有可能出现不同 topic 直接拥有的实体数量差距很大的情况。而且一般来说每个实体的生命周期在生产环境上是有规律的，比如某种实体的变动只会持续一段时间，便会很长时间内都不会再有下一次变动，那么就会有相当大量的 topic 根本不会接受到任何的事件，从而造成资源的浪费。 -->
