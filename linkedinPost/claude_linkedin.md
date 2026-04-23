# How to Design an OTP Validation System for Your Product

OTP (One-Time Password) is the backbone of modern authentication. Every serious product needs it — for login, payments, password resets, sensitive account changes.

But most OTP implementations I've reviewed have the same flaw:

**They store OTPs in plain text.**

A simple Redis entry like this:

```
Key: otp:9876543210
Value: 123456
TTL: 300 seconds
```

Looks harmless. Actually disastrous.

If that Redis instance leaks — through a misconfigured firewall, a compromised credential, or an insider threat — every active OTP across your entire user base is readable in seconds. Attackers can take over accounts in real-time.

This guide walks through how to design an OTP system that's actually secure, scalable, and production-ready.

---

## The Core Requirements

Before any design work, an OTP system must:

- Generate a random 4-6 digit code
- Send it via SMS, email, or authenticator app
- Store it temporarily with expiration
- Verify user-submitted OTP against the stored value
- Prevent brute force attacks
- Handle rate limiting at multiple layers
- Auto-cleanup expired codes

Each of these has security traps. Let's walk through them.

---

## Why You Should NEVER Store OTPs in Plain Text

This is the most common mistake in OTP systems. Here's why it matters.

### 1. Database Breaches

If Redis, PostgreSQL, or MongoDB is compromised, attackers get DIRECT access to every active OTP. No cracking required. They can:

- Take over accounts in real-time
- Intercept payment authorizations
- Bypass 2FA systems
- Drain user balances

### 2. Insider Threats

Any engineer with database access can:

- Read any user's current OTP
- Authenticate as that user
- Leave minimal audit trail

### 3. Log Leaks

Plain-text OTPs often end up in unexpected places:

- Application logs
- Debug outputs
- Error tracking tools (Sentry, Datadog)
- Backup files
- Analytics platforms

It only takes one developer accidentally logging a request body.

### 4. Compliance Violations

- **PCI-DSS** (payments) prohibits plain-text storage of authentication data
- **GDPR** requires "appropriate technical measures" for personal data
- **HIPAA** mandates encryption for authentication credentials
- **RBI guidelines** (India) require secure storage of authentication factors

Plain text OTPs fail compliance audits and trigger regulatory fines.

### 5. Memory Dumps

If attackers capture a memory dump of the application server, plain-text OTPs are immediately visible.

---

## The Right Way: Hash Your OTPs

Instead of storing the OTP itself, store a cryptographic hash of it.

**When generating:**
1. Generate random OTP (e.g., 847231)
2. Hash it with bcrypt or Argon2
3. Store the HASH
4. Send the plain OTP to user via SMS/email

**When verifying:**
1. User submits OTP
2. Hash the submitted value
3. Compare hashes (not plain text)
4. If match, authenticate

**The security property:** Even if your database leaks, attackers get hashes. They can't reverse-engineer the OTP within the 5-minute TTL window.

---

## The Complete Secure Flow

### Step 1 — Generation

Use cryptographically random functions:

- Use `crypto.randomInt()` in Node.js
- Use `secrets.randbelow()` in Python
- Use `SecureRandom` in Java

**Never use `Math.random()`.** It's deterministic and predictable. Attackers with the same seed can replicate the sequence.

### Step 2 — Hash Before Storing

Hash with a slow, secure algorithm:

- **bcrypt** (work factor 10-12)
- **Argon2** (modern, recommended)
- **scrypt** (memory-hard)

**Never use:** MD5, SHA-1, or plain SHA-256. They're too fast — attackers can brute force them.

### Step 3 — Set Short TTLs

- Login OTP: 5 minutes
- Password reset: 10 minutes
- Payment confirmation: 2 minutes
- Account changes: 3 minutes

Shorter TTL = smaller attack window.

### Step 4 — Rate Limit Generation

Prevent SMS bombing:

- Max 3 OTP generations per user per 15 minutes
- Max 10 OTP generations per IP per hour
- Exponential backoff on repeated requests

### Step 5 — Rate Limit Verification

Prevent brute force:

- Max 5 verification attempts per OTP
- Lock account for 30 minutes after failures
- Track failures per OTP, per user, per IP

### Step 6 — Single-Use Enforcement

- Delete OTP immediately after successful verification
- Invalidate on 5 failed attempts
- Never reuse the same code

### Step 7 — Audit Logging

Log every OTP event, but NEVER log the OTP value:

- Generation timestamp
- Verification attempts
- Success/failure status
- IP address and user agent

---

## Database Schema

Recommended structure for audit/persistent storage:

```
Table: otp_records

- otp_id              (UUID, PK)
- user_id             (FK)
- phone_or_email      (indexed)
- otp_hash            (bcrypt hash — NEVER the OTP itself)
- purpose             (LOGIN | RESET | PAYMENT | UPDATE)
- created_at          (timestamp)
- expires_at          (timestamp, indexed)
- attempts_left       (default 5)
- is_used             (boolean, default false)
- ip_address          (for audit)
- user_agent          (for audit)
```

**For production systems:** Use Redis as the primary store (speed + TTL), PostgreSQL for audit logs.

---

## Redis Storage Structure

Redis is ideal for OTP storage:

- Auto-expiry via TTL (no cleanup jobs)
- In-memory speed (sub-millisecond verification)
- Atomic operations (DECR for attempt counting)

**Key format:**

```
Key: otp:{user_id}:{purpose}

Value (JSON):
{
  "hash": "$2b$12$abc...",
  "attempts_left": 5,
  "created_at": 1735128000,
  "metadata": { "ip": "1.2.3.4" }
}

TTL: 300 seconds (auto-deletes)
```

Now, even if Redis is breached, attackers get hashes — not actual OTPs.

---

## Use Case 1 — Login OTP (2FA)

User enters phone number, receives OTP, authenticates.

**Flow:**
1. User submits phone number
2. Check rate limit (3 OTPs per 15 min)
3. Generate 6-digit OTP
4. Hash with bcrypt
5. Store hash in Redis with 5-min TTL
6. Send plain OTP via SMS
7. User enters OTP
8. Hash submitted value
9. Compare with stored hash (constant-time)
10. If match: delete OTP, issue JWT

---

## Use Case 2 — Password Reset

User forgets password, requests reset.

**Flow:**
1. User submits email
2. Generate OTP + reset token (UUID)
3. Hash both, store in DB
4. Email plain OTP and reset link
5. User clicks link, enters OTP
6. Verify both token AND OTP
7. Allow password reset
8. Invalidate all other active sessions

**Extra security:** Send confirmation email to the user's OLD email when password changes.

---

## Use Case 3 — Payment Authorization

User confirms a transaction via OTP.

**Flow:**
1. Payment initiated
2. Generate OTP tied to transaction_id
3. Hash OTP, store with 2-min TTL
4. Send OTP via SMS
5. User enters OTP on payment page
6. Verify OTP AND transaction_id match
7. If valid, authorize payment
8. Lock OTP against replay

**Why shorter TTL?** Payments need faster confirmation and a smaller window for MITM attacks.

---

## Use Case 4 — Sensitive Account Changes

User wants to update email, phone, or security settings.

**Flow:**
1. User requests change
2. OTP sent to OLD contact (email/phone)
3. User confirms OTP
4. Only then allow the update
5. Notify old contact that a change was made

**Why OTP to old contact?** If an attacker has already compromised the account, they can't intercept the OTP sent to the original email/phone.

---

## Brute Force Defense — 5 Layers

A 6-digit OTP has only 1 million combinations. Without rate limiting, an attacker cracks it in minutes.

### Layer 1 — Per-OTP Attempts
Max 5 wrong attempts → invalidate the OTP immediately.

### Layer 2 — Per-User Rate Limit
Max 10 OTP verifications per hour per user_id → temporary account lock.

### Layer 3 — Per-IP Rate Limit
Max 20 OTP verifications per hour per IP → block IP range.

### Layer 4 — Exponential Backoff
- 1st failure: immediate retry
- 2nd failure: 5 sec wait
- 3rd failure: 30 sec wait
- 4th failure: 2 min wait
- 5th failure: OTP invalidated

### Layer 5 — CAPTCHA
Require CAPTCHA after 3 failed attempts to block bots.

---

## Constant-Time Comparison (Critical)

Hashing alone isn't enough. Comparing hashes incorrectly leaks timing data.

**Wrong:**
```
if (submitted_hash === stored_hash) { ... }
```

Standard equality returns false on the first mismatched byte. Attackers measure timing to guess the hash byte-by-byte.

**Right:**
```
crypto.timingSafeEqual(submitted, stored)
```

Takes the same time regardless of mismatch position. Prevents timing attacks.

---

## Common Mistakes to Avoid

### Mistake 1 — Predictable OTPs
Using timestamps, counters, or `Math.random()` as sources of randomness.

### Mistake 2 — Long TTLs
OTPs valid for 1+ hours create massive attack windows. Keep it under 10 minutes.

### Mistake 3 — Same OTP on Resend
When a user clicks "resend OTP", generating the SAME code is insecure. Always regenerate.

### Mistake 4 — Not Invalidating After Failures
If a user enters wrong OTP 100 times, the OTP should be dead. Kill after 5 failures.

### Mistake 5 — Logging OTP Values
Scan your logs — you'll probably find OTPs in:
- Error tracking (Sentry, Bugsnag)
- CloudWatch/Stackdriver logs
- Database slow query logs
- API request/response logs

Rule: never log the actual OTP value. Hash it if you must debug.

### Mistake 6 — Weak Hashing
MD5 and SHA-1 are broken. Use bcrypt, scrypt, or Argon2.

### Mistake 7 — Not Enforcing Single-Use
If an attacker intercepts the OTP and the user uses it, the attacker can still replay it. Delete immediately after first successful use.

---

## System Architecture

**Components:**
- **API Gateway** — rate limits per IP, handles CAPTCHA
- **OTP Service** — generates, hashes, and verifies
- **Redis** — stores hashed OTPs with TTL
- **SMS/Email Providers** — Twilio, AWS SNS, SendGrid
- **PostgreSQL** — audit logs (without OTP values)
- **Monitoring** — alerts on anomalies

**Request flow:**
1. Client → API Gateway (rate limit check)
2. Gateway → OTP Service
3. OTP Service → Redis (store/verify hash)
4. OTP Service → SMS Provider (send plain OTP)
5. OTP Service → PostgreSQL (audit log)
6. OTP Service → Client (response)

---

## Monitoring That Actually Matters

Alerts to configure:

- **Spike in OTP requests** — SMS bombing or abuse
- **High failure rate** — brute force attempt
- **Many OTPs per IP** — bot attack
- **Unusual geography** — account takeover attempt
- **OTP delivery failures** — SMS provider issues

---

## Production Checklist

Before launching any OTP system:

✅ OTPs hashed with bcrypt (work factor 12) or Argon2
✅ TTL of 2-10 minutes depending on use case
✅ Rate limiting across 5 layers
✅ Constant-time hash comparison
✅ Audit logs without OTP values
✅ Single-use enforcement
✅ Exponential backoff on failures
✅ CAPTCHA after 3 failed attempts
✅ Redis encrypted in transit (TLS)
✅ Redis AUTH enabled
✅ Notifications for sensitive changes
✅ No OTP values in application logs
✅ Monitoring + alerts on anomalies

---

## Key Takeaways

1. **NEVER store OTPs in plain text** — always hash with bcrypt or Argon2
2. **Short TTLs (2-10 minutes)** reduce attack windows
3. **Rate limit at 5 layers** — per-OTP, per-user, per-IP, exponential backoff, CAPTCHA
4. **Single-use enforcement** prevents replay attacks
5. **Constant-time comparison** prevents timing attacks
6. **Never log OTP values** — they leak into unexpected places
7. **Use crypto.randomInt()** not Math.random()
8. **Send to OLD contact** for sensitive account changes
9. **Monitor patterns** as early warnings
10. **Audit logs** matter for compliance and incident response

---

Building an OTP system isn't about complexity — it's about discipline. Hash everything. Rate limit everywhere. Keep TTLs short.

The gap between a secure OTP system and a vulnerable one is usually 50 lines of code.

Which side do you want to be on?

♻️ Repost to help engineers build safer systems
💾 Save for your next system design round or security review

#SystemDesign #Security #OTP #Authentication #Backend #Redis #SoftwareEngineering #SecurityEngineering #InterviewPrep #CyberSecurity #BestPractices