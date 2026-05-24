"Design the search service for a Ticket Booking system."

The moment you hear that line, your mind jumps to Elasticsearch.

Mine did too on the first draft. Then I stopped and asked one question:

What are users actually searching for?

Turns out, almost nothing in this system is real "search".

It's filtering.

"Movies in Bangalore tonight."
"Shows of Avengers at PVR Forum."
"Available shows this weekend in Koramangala."

These are not free-text queries. There is no ranking, no typo tolerance, nexplain ticket booking HLD flow end to end
o relevance scoring. The user picks a city from a dropdown, a date from a calendar, and a cinema from a list. The backend just needs to answer:

WHERE city = ? AND date = ?

That is a structured lookup, not a search problem.

So in my design I dropped Elasticsearch and used Cassandra + Redis instead. Here is why that combination works so well:

• Partition key ((city, date), show_time) turns every browse query into a single partition read.
• Catalog is just a few hundred MB. Redis in front absorbs the 50K req/s spike at a 99%+ hit rate.
• A 1-2 second old seat map is fine on browse. Cassandra's tunable consistency handles it natively.

Now, when does Elasticsearch genuinely earn its place?

The moment your requirements include any of these, add it without hesitation:

• Free-text search across movie descriptions, actors, or directors
• Typo-tolerant autocomplete, where "avngrs" should still find "Avengers"
• Faceted filters like "IMAX + 3D + after 7pm + within 5km"
• Geo search with ranking by distance and popularity

Those are exactly the workloads inverted indexes were built for.

Reaching for Elasticsearch just to sound impressive in a design round is textbook over-engineering, and a good interviewer will catch it.


Full HLD breakdown of the Ticket Booking System (seat locking, 5-minute reservation timer, fairness queue, SERIALIZABLE isolation, and more) in the comments.

#SystemDesign #Backend #Elasticsearch #Cassandra #Redis #SoftwareEngineering #InterviewPrep
