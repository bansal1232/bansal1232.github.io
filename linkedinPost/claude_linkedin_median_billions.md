# Median of 10 Billion Integers — Bucket Counting

## Short version (LinkedIn caption)

Google interview question: You're handed 50 files. Together they hold 10 billion 32-bit integers, about 40 GB on disk. Your laptop has 16 GB of RAM. Find the median.

The first answer most people give is "just sort it and pick the middle one." 40 GB doesn't fit in 16 GB. It dies before it loads.

The next answer is usually "external merge sort, split, sort the chunks, merge them back." That works, but it costs roughly 180 GB of disk I/O to produce a fully sorted 40 GB file you only read one number out of. You answered a much harder question than the one asked.

The third is "load it into a database and query it." The database has to do the same impossible work under the hood. SQL just hides the problem.

So the real question is this. How do you find the median of a dataset bigger than your RAM, in a few minutes, without sorting any of it?

If you can answer that on a whiteboard, you've already passed the bar at most senior interviews. If you can't, the same idea quietly powers P99 latency over petabytes of logs, k-th smallest from a distributed dataset, and top-N queries that "feel impossible" at scale.


Full deep dive in the comments.

More like this on my Design and Development page (https://shubhambansal.info/design-development.html)


#SystemDesign #Algorithms #GoogleInterview #InterviewPrep #SoftwareEngineering #Backend #BigData #ScalableArchitecture #CodingInterview #FAANG
