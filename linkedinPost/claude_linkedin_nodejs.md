Got a Node.js interview lined up?

Try answering these before you walk in:

- Node is single-threaded. So how does it actually handle 100 concurrent fs.readFile calls?
- setTimeout(0) vs Promise.resolve().then() — which one fires first, and why?
- Why does cluster scale your HTTP server but worker_threads doesn't?
- fs.readFile vs fs.createReadStream for a 2 GB file — what breaks in prod?
- Why doesn't try/catch catch the error thrown inside a setTimeout callback?
- Why is __dirname undefined in your ES module?
- You attached 50 listeners with .on('data') and never removed them. What happens?
- Why is process.nextTick dangerous if you call it recursively?

If you had to pause on any of these, you're not alone. These are the ones that separate "I write Node" from "I understand Node" — and interviewers know it.

Full guide with 25 sections (event loop, microtasks, streams, cluster vs worker_threads, ESM vs CJS, memory leaks, security) — link in the comments.

More deep-dives on my Design & Development page (https://lnkd.in/gYBPJVTS)

#NodeJS #JavaScript #InterviewPrep #Backend #EventLoop
