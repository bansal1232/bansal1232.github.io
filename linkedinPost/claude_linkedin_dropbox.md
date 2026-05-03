# Dropbox / Google Drive — HLD Design

## Short version (LinkedIn caption)

📦 Sarah's editing a 4GB PowerPoint for tomorrow's review. She's on her laptop.

She fixes one typo on slide 47. Hits save. Shuts the laptop.

Picks up her phone, opens the same deck on the Dropbox app — the typo is already fixed.

The change made the round trip to Dropbox's cloud and back to her phone in seconds.

That shouldn't be possible. A 4GB upload over normal home internet takes minutes. Even on fiber, it's tens of seconds.

But Dropbox didn't upload 4GB. It uploaded 4MB.

Because to Dropbox, your file isn't a file. It's a stack of 4MB chunks. Change one typo, only the chunk containing that typo changes. Every other chunk Dropbox already has — and quietly refuses to upload it again.

The same trick is why, if 10 million people upload the same Friends episode tonight, Dropbox stores it on disk exactly ONCE. The chunk's hash is its identity. Two identical chunks ARE the same chunk.

This sounds boring. It's also why Dropbox can charge you $10 a month without going broke.

Once that single idea clicks, every other Dropbox feature — resumable uploads, version history, instant sharing, working offline — falls out for free.

This same problem shows up in interviews under three names: "design Dropbox", "design Google Drive", "design a file sync system." Three questions you'll actually get asked:

❓ "Your upload drops at byte 47 of a 50GB video. What happens next?"
✅ The chunks already on the server stay. Only the missing ones re-send. That's resumable upload — and you got it for free.

❓ "How does Sarah's edit reach her phone in 8 seconds when the file is 4GB?"
✅ Dropbox doesn't move the file. It moves a tiny metadata record. The bytes catch up via the chunk diff — only the changed 4MB crosses the internet.

❓ "10 million users upload the same MP4 tonight. What's your storage cost?"
✅ The cost of one file. Same hash → same chunk → stored once. Forever.

All three answers fall out of the same idea. Get chunking on the whiteboard in the first 90 seconds and the rest of the interview writes itself.

🔗 Full breakdown — diagrams, the naive design that breaks, and a step-by-step trace through Sarah's edit — in the comments.

📌 More deep-dives like this on my Design & Development page — system design, payments, OTP, Docker, browser storage, distributed IDs (https://shubhambansal.info/design-development.html)


#SystemDesign #DistributedSystems #Dropbox #SoftwareEngineering #Backend #InterviewPrep #ScalableArchitecture
