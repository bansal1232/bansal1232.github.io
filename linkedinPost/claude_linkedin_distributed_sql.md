One of the biggest misconceptions in system design is:

Need SQL, then use Postgres.
Need scale, then move to NoSQL.

Well in 2026, you dont' need this!

A modern category of databases as "Distributed SQL" combines relational database features with horizontal scalability.

Yes you read it right, we can also scale SQL horizontally.

Solutions like CockroachDB, YugabyteDB, and TiDB provide the familiar relational database model while scaling horizontally across multiple nodes.

You still get:
✅ SQL queries
✅ ACID transactions
✅ Strong consistency
✅ Joins and indexes

And additionally:
✅ Automatic sharding
✅ Built-in replication
✅ Multi-region deployments
✅ Automatic failover

The tradeoff is higher write latency because every write must be coordinated across replicas. That's the price paid for fault tolerance and distributed scale.

In system design discussions, the interesting question is no longer:

"Can Postgres scale?

It's:

At what point does a single-node database become the bottleneck, and what tradeoffs are acceptable to remove that bottleneck?

For many workloads, Postgres remains the best choice.

But when you need to scale across multiple regions and servers while still keeping SQL and ACID transactions, distributed SQL databases are a great option.

Have written a long b