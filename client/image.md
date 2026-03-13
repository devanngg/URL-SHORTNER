# URL Shortener

---

## 1) Overview (TL;DR)

- **Goal:** Global, low-ops API that converts long URLs to short codes and redirects with predictable latency and cost.
- **Use-cases:** Marketing links & campaigns, QR codes, internal tools, temporary redirects, developer utilities.
- **Core Services:** API Gateway (REST, Lambda proxy), Lambda (Python 3.11), DynamoDB (PK= `shortCode`), CloudWatch (logs/metrics/alarms).

---

## 2) Architecture Diagram

### Pro View

```
Custom Domain + SSL (Optional)
        │
        ▼
     Client
        │  HTTP 302 (redirect)
        ▼
       WAF
        │
        ▼
  API Gateway (REST — Lambda Proxy)
  POST /shorten
  GET  /{shortCode}
        │
        ├──────────────────────────────────────────┐
        ▼                                          ▼
 Lambda Shorten                           Lambda Redirect
 Validate + Generate code                 GetItem + 302 Redirect
 + Conditional PutItem                    (Best-effort UpdateItem)
        │                                          │
        └──────────────┬───────────────────────────┘
                       ▼
                   DynamoDB
                (PK= shortCode)
                       │
                       ▼
                  CloudWatch
                (Logs & Alarms)

S3 Static UI  ←  served separately (CloudFront or Nginx)
```

### Beginner View

```
USER  →  API Gateway  →  Lambda (Shorten / Redirect)  →  DynamoDB
```

---

## 3) Data Flow (Step-by-Step)

1. `POST /shorten` → API Gateway proxies to **Lambda Shorten** (raw body in `event.body`).
2. Shorten validates input (`https?://`, length ≤ 2048), optionally checks allow-listed domains.
3. Shorten generates a **6-char URL-safe code** and writes to DynamoDB with `ConditionExpression attribute_not_exists(shortCode)` to prevent collisions.
4. Shorten returns `{ shortUrl, code }` (build `baseUrl` from `event.requestContext.domainName/stage`).

---

## 4) Design Decisions & Trade-offs

| Domain | Decision | Alternatives | Trade-off |
|--------|----------|--------------|-----------|
| Compute | Lambda (VPC-less) | ECS Fargate / EC2 | Scale-to-zero, minimal ops vs cold starts (mitigate with provisioned concurrency on hotspots) |
| API Edge | REST API (proxy) | HTTP API (cheaper), ALB+Lambda | REST features (API keys/usage plans) vs per-req cost at very high TPS |
| Store | DynamoDB (PK= `shortCode`) | Aurora Serverless, S3 | Single-digit ms KV lookups vs no joins/SQL; schema discipline required |
| Capacity | PAY_PER_REQUEST | Provisioned + AutoScaling | Zero tuning, perfect for dev/spikes vs less price control at massive scale |
| Auth | API Key on `POST` | Cognito/JWT, IAM auth | Simple throttling/metering vs no user identity/claims |
| Redirect Code | 302 Found (default) | 301 Moved Permanently | 302 avoids long-lived cache poisoning; 301 improves caching but harder to revoke |

---

## 9) Cost Optimization

**Assumptions for quick math:** 1M redirects / month; 100k shortens / month; Lambda avg 20 ms.

- **API Gateway (REST):** per-req pricing dominates at 1M+ → consider HTTP API (up to ~70% cheaper) when stable.
- **Lambda:** Free-Tier covers a lot; keep memory modest and duration short.
- **DynamoDB:** On-Demand fine at this scale; cost grows linearly with R/W.
- **WAF:** Adds fixed monthly; enable only when public.

| Scale | Approx Monthly | Driver | Lever |
|-------|---------------|--------|-------|
| Dev/Test | Free–$2 | API invocations | Free Tier; short timeouts |
| Small Prod (≤ 1M GET, 100k POST) | $10–$30 | API per-req | Switch to HTTP API; enable gzip; validate inputs |
| High Scale (10M+ GET) | $$$ | API per-req | Consider ALB + Lambda or caching layer for hot codes; regional edge cache |

---

## 11) Variants & Extensions

| Variant | Change | Use When | Trade-off |
|---------|--------|----------|-----------|
| Custom alias | Accept `code` in POST; `ConditionExpression` a-not-exists | Branded/human-readable | Name squatting; conflict mgmt; 409 errors |
| Expirations | Add `expiresAt` (epoch); TTL + read-time reject guard | Promo windows / compliance | TTL deletion is eventual (hours); add read-time guard |
| Stats API | `GET /stats/{code}`: clicks, createdAt, lastAccessed | Lightweight analytics | Extra reads; consider anonymization |
| Custom domain | Route 53 + ACM | Public brand | Small ongoing DNS cost |
| HTTP API | Swap REST → HTTP API | Save cost at scale | Fewer features (no usage plans) |
| ALB + Lambda | Replace API GW | Very high TPS | Operates at L7, different auth/quotas; pricing differs |
| Aurora Serverless | Replace DDB | Complex queries | Ops & cost ↑; latency ↓ vs KV |

---

## 15) Design Journal — Filled Example

- **Problem:** Spiky traffic, minimal ops link shortener; predictable latency and cost.
- **Choice:** REST API (proxy) + 2 Lambdas + DDB (PAY_PER_REQUEST, PITR).
- **Trade-offs:**
  - Lambda cold starts on first invocation — acceptable at this scale; provisioned concurrency available for hotspots if p99 latency matters.
  - DynamoDB requires schema discipline upfront; no ad-hoc queries or joins possible later.
  - REST API costs more per-req than HTTP API at high scale, but needed for API key throttling and usage plans in early phases.
  - PITR (Point-in-Time Recovery) on DDB adds a small cost but protects against accidental bulk deletes.
