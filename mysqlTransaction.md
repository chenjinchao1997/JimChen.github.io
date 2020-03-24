# InnoDB Read Commited下，一个事务在mysql的流程

涉及到 redolog binlog undolog MVCC

对update he set name='小明' where id=5;

1）事务开始

2）对id=5这条数据上排他锁，并且给5两边的临近范围加gap锁，防止别的事务insert新数据；

3）将需要修改的数据页PIN到innodb_buffer_cache中；

4）记录id=5的数据到undo log.

5）记录修改id=5的信息到redo log.

6）修改id=5的name='小明'.

7）刷新innodb_buffer_cache中脏数据到底层磁盘，这个过程和commit无关；

8）commit，触发page cleaner线程把redo从redo buffer cache中刷新到底层磁盘，并且刷新innodb_buffer_cache中脏数据到底层磁盘也会触发对redo的刷新；

9）记录binlog （记录到binlog_buffer_cache中）

10）事务结束；

<https://www.jianshu.com/p/9b83ea78b380>