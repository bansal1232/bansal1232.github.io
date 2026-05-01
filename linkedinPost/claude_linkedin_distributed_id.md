# Distributed Unique IDs — UUIDs, Snowflake & UUIDv7

## Short version (LinkedIn caption)

🆔 Twitter mints 6,000 IDs per second. Discord routes 4 billion messages a day. YouTube tags 500 hours of video every minute.

**None of them ask a database for those IDs.**

It's like 1,000 cashiers in 1,000 stores all printing receipt numbers — and never, ever printing the same one.

Meanwhile, "just use AUTO_INCREMENT" is still the #1 wrong answer in system design interviews in 2026.

Here's how big systems actually do it 👇

🎲 Need it unguessable (tokens, API keys) → UUIDv4
⏱️ Need it sortable + no coordinator → UUIDv7
❄️ Need 8 bytes + machine-of-origin debugging → Snowflake

Same goal. Three very different trade-offs.

Pick the wrong one and you'll find out the hard way — slow inserts at a billion rows, a bloated index, or two records mysteriously sharing the same ID at 3 AM.


🔗 Full breakdown in the comments. 5 minutes today saves a 3 AM page tomorrow.

📌 Want more like this? My Design & Development page bundles every
deep dive in one place — LLD interviews, Kafka payments, Docker
internals, OTP auth, browser storage, and more (https://shubhambansal.info/design-development.html)


#SystemDesign #DistributedSystems #Snowflake #UUID #Backend #SoftwareEngineering #InterviewPrep #DatabaseDesign #ScalableArchitecture #BestPractices
