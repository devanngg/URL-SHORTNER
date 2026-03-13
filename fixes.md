# URL Shortener — Backend Audit & Missing Pieces

Stack: Fastify + MongoDB + Redis + Zookeeper (TypeScript)
Reference design: client/image.png

---

## CRITICAL BUGS
// DONE 
### 1. Routes are completely broken — all mapped to `GET "/"`
`server/src/routes/urls.ts:9-13`
```
router.get("/", getUrls)                 // line 9  — correct
router.get("/", getUrl)                  // line 11 — DUPLICATE PATH, never hit
router.post("/:shortenUrlKey", postUrl)  // line 13 — wrong path and wrong method
```
Fix:
```ts
router.get("/", getUrls)                   // GET  /api/urls/
router.get("/:shortenUrlKey", getUrl)      // GET  /api/urls/:shortenUrlKey
router.post("/", postUrl)                  // POST /api/urls/
```

---

// DONE
### 2. Field name mismatch — `shortenUrlKey` vs `shorternUrlKey`
The Mongoose model defines `shorternUrlKey` (extra "r"), but `ICreateParams` in the repo uses `shortenUrlKey` and `urlService.ts` queries with `{ shortenUrlKey }` — a field that doesn't exist in the schema. Every key lookup returns `null`.

Affected files: `Url.ts`, `urlRepository.ts`, `urlService.ts`
Fix: Standardize to one name everywhere (e.g. `shortCode`).

---

// DONE
### 3. `findOne` uses wrong field name for original URL lookup
`server/src/services/urlService.ts:43`
```ts
const savedUrl = await findOne({ originalUrlKey: originalUrl });
//                               ^^^^^^^^^^^^^ not in schema — field is `originalUrl`
```
This query always returns `null`, so duplicate URLs are never detected.

---
// DONE
### 4. Mongoose default dates evaluated once at module load — not per-document
`server/src/models/Url.ts:23-27`
```ts
createdAt: { default: new Date() }                           // same for every doc
expiresAt: { default: new Date(new Date().setMinutes(...)) } // same for every doc
```
Fix — use function references:
```ts
createdAt: { default: Date.now }
expiresAt: { default: () => new Date(Date.now() + 10 * 60 * 1000) }
```

---
//Done

### 5. `generateBase64Token` — both `/` and `=` replaced with `-`
`server/src/utils/index.ts:8-10`
```ts
.replace(/\//g, '-')   // / → -
.replace(/=+$/g, '-')  // = → - (same character, overloaded)
```
Replace `=` with `_` or strip it instead of using `-`.

---
// Done
// DONE
### 6. URL validation regex missing dot before TLD
`server/src/utils/index.ts:16-24` — The domain character class runs directly into the TLD block without a `\\.` separator. `https://examplecom` would pass validation. Add `\\.` between the domain and TLD portions.

---

## MISSING FEATURES (vs. image design)

### 7. No redirect endpoint — the core feature is absent
The design (Data Flow step 4) requires:
```
GET /:code  →  302 Found  →  original URL
```
The current `getUrl` controller returns `reply.code(200).send(originalUrl)` (JSON). The browser is never redirected. This endpoint should:
1. Look up `shortCode` in Redis cache, then MongoDB.
2. Check `expiresAt` — return `410 Gone` if expired.
3. Increment `clickCount` and set `lastAccessedAt`.
4. Return `reply.redirect(302, originalUrl)`.

This route lives at the top level (e.g. `GET /:code`), not under `/api/urls/`, so Nginx needs a second `location` block for it.

---

### 8. No stats endpoint + missing model fields
The design (Variants & Extensions table) lists:
```
GET /stats/{code}  →  { clicks, createdAt, lastAccessedAt }
```
The `Url` model is missing required fields:
```ts
clickCount:     { type: Number, default: 0 }
lastAccessedAt: { type: Date }
```
A new controller + route is also needed:
```
GET /api/urls/stats/:shortCode  →  { originalUrl, shortCode, clickCount, createdAt, lastAccessedAt }
```

---

### 9. Expiry stored but never enforced
`expiresAt` is saved to MongoDB but nothing checks it on redirect or lookup. Expired links stay active forever.

Fix — add this check in the redirect handler:
```ts
if (savedUrl.expiresAt && savedUrl.expiresAt < new Date()) {
    return reply.code(410).send("Link has expired");
}
```

---

### 10. No input length validation
The design (Data Flow step 2) says: "validates input (https?://, length ≤ 2048)".
`isValidUrl` only checks format. Add:
```ts
if (originalUrl.length > 2048) return null;
```

---

### 11. No rate limiting
The design shows a WAF in front of the API. For the self-hosted Fastify stack this means:
- Install `@fastify/rate-limit`
- Apply to `POST /api/urls/` to prevent abuse

---

### 12. Nginx config does not serve the static frontend
`nginx/nginx.conf` only proxies `/api/`. The design shows a static UI served by Nginx. Add a `location /` block:
```nginx
location / {
    root   /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}
```

---

### 13. `docker-compose.yml` is outside the project folder
A `docker-compose.yml` exists at `../docker-compose.yml` (parent directory). It should live inside `url-shortener-demo-app/` so the project is self-contained.

---

## SECURITY ISSUES

### 14. `.env` with DB credentials committed to git
No `.gitignore` exists. MongoDB password, Redis host, Zookeeper host are all in the repo.
Add to `.gitignore`:
```
node_modules/
dist/
.env
*.log
```

### 15. No `.dockerignore`
`server/Dockerfile` has `COPY . .` which copies `node_modules/` into the image — bloated and slow.
Add `.dockerignore`:
```
node_modules/
dist/
.env
```

### 16. CORS allows all origins
`fastify.register(fastifyCors)` with no options = wildcard. Restrict to the frontend domain in production.

---

## LOGIC / ARCHITECTURE ISSUES

// DONE
### 17. Redis `maxRetriesPerRequest` key is wrong
`server/src/config/redis.ts:19` — The key is silently ignored because of the casing. Correct ioredis option is `maxRetriesPerRequest`.

// DONE
### 18. ZooKeeper `mkdirp` callback falls through on error
`server/src/config/zookeeper.ts:71-79` — `reject(error)` is called without `return`, so `resolve()` runs afterward too. Add `return reject(error)`.

// DONE
### 19. ZooKeeper collision-retry logic is commented out
`server/src/config/zookeeper.ts:111-132` — The proper `pathExists` check is commented out. The current code only detects collisions when ZooKeeper throws `ZNODEEXISTS`. Functionally acceptable but the dead code should be removed.

---

## CODE QUALITY / TYPOS

| File | Issue |
|------|-------|
| `server/src/index.ts:9` | `instanee` → `instance` |
| `server/src/index.ts:36` | `serve please ttry` → `server, please try` |
| `server/src/config/redis.ts:13` | `GETIING THE REDDIS` → `Getting the Redis` |
| `server/src/config/redis.ts:56` | `retrived` → `retrieved` |
| `server/src/config/zookeeper.ts:88` | `coliision` → `collision` |
| `server/src/repositiories/urlRepository.ts:27` | Log says `"Failed all URLS"` → `"Finding all URLs"` |
| `server/src/config/moongose.ts` | Filename typo: `moongose` → `mongoose` |
| `server/src/repositiories/` | Folder typo: `repositiories` → `repositories` |

---

## PRIORITY ORDER

| # | Fix | Impact |
|---|-----|--------|
| 1 | Fix routes (methods + paths) | App completely non-functional |
| 2 | Add redirect endpoint with `302` response | Core feature missing |
| 3 | Standardize field name (`shortCode`) everywhere | All DB lookups broken |
| 4 | Fix `findOne` original URL field name | Duplicate detection broken |
| 5 | Fix Mongoose default dates | Wrong timestamps on every document |
| 6 | Add `expiresAt` enforcement in redirect handler | Expired links never expire |
| 7 | Add `clickCount` + `lastAccessedAt` + stats endpoint | Listed in design |
| 8 | Add `.gitignore` + `.dockerignore` | Security / infra hygiene |
| 9 | Add rate limiting (`@fastify/rate-limit`) | Abuse prevention |
| 10 | Add URL length validation (≤ 2048) | Input safety |
| 11 | Add Nginx static file serving block | Frontend delivery |
| 12 | Fix `POST /shorten` response — return `{ shortUrl, code }` | Client can't build the short URL |
| 13 | Make click-count update fire-and-forget | Redirect latency bloated by DB write |
| 14 | Handle Mongoose duplicate key error (11000) with retry | Unhandled crash on race condition |
| 15 | Add allow-listed domains check | Mentioned in design data flow step 2 |
| 16 | Add MongoDB backup/recovery strategy (PITR equivalent) | No recovery from accidental data loss |

---

---

## ADDITIONAL ISSUES (from completed image.md review)

### 20. `POST /shorten` response shape is wrong
The design (Data Flow step 4) specifies the response must be:
```json
{ "shortUrl": "https://<domain>/<code>", "code": "<code>" }
```
The current `postUrl` controller returns just the raw `shortCode` string (`reply.code(201).send(shortenUrlKey)`). The full short URL is never constructed — the client has no way to display or copy it without knowing the domain.

Fix — build `shortUrl` from the request host and return both fields:
```ts
const shortUrl = `${request.protocol}://${request.hostname}/${shortenUrlKey}`;
return reply.code(201).send({ shortUrl, code: shortenUrlKey });
```

---

### 21. Click-count update must be fire-and-forget — do not await it in the redirect path
The design notes the redirect Lambda does a **best-effort UpdateItem** (non-blocking). In the current Node.js flow, if `clickCount` increment and `lastAccessedAt` update are `await`-ed before sending `reply.redirect(302, ...)`, every redirect is delayed by a MongoDB write.

Fix — send the redirect immediately and update in the background:
```ts
reply.redirect(302, originalUrl);          // respond to user first
updateClickStats(shortCode).catch(() => {}); // fire-and-forget
```

---

### 22. No retry on Mongoose duplicate key error (race condition on collision)
ZooKeeper prevents collision at the token-generation level, but `Url.create()` also has a unique index on `shortCode`. If ZooKeeper and Mongoose race (e.g. ZooKeeper node was created but the DB write never completed), `Url.create()` will throw error code `11000`. This is unhandled and crashes the request.

Fix — catch `11000` in the repository and retry with a new token, same as ZooKeeper's retry logic.

---

### 23. Allow-listed domains check is missing
The design (Data Flow step 2) says: "optionally checks allow-listed domains." There is no such check anywhere in the backend. At minimum, a config array of blocked/allowed domains should be checked in `isValidUrl` or `urlService.ts` before generating a short code.

---

### 24. No MongoDB backup / recovery strategy
The design journal explicitly chose **PITR (Point-in-Time Recovery)** on DynamoDB to protect against accidental bulk deletes. There is no equivalent for MongoDB. The `docker-compose.yml` should include a scheduled `mongodump` or a volume snapshot strategy, especially since shortened URLs are the entire value of the service.

---

## CLIENT — Everything is missing

The `client/` folder contains only the design reference (`image.png`, `image.md`). No frontend code exists yet. Below is everything that needs to be built based on the design doc.

---

### Project scaffold needed

Set up a React + Vite project (or plain HTML/CSS/JS if keeping it simple) inside `client/`:

```
client/
  src/
    components/
      UrlForm.tsx          — input + submit
      ResultCard.tsx       — displays short URL + copy button + QR
      StatsCard.tsx        — displays click count, createdAt, lastAccessedAt
    pages/
      Home.tsx             — main shortener page
      Stats.tsx            — stats lookup page
      NotFound.tsx         — 404 / 410 expired link page
    api/
      urlApi.ts            — all fetch calls to the backend
    App.tsx
    main.tsx
  index.html
  vite.config.ts
  package.json
  Dockerfile
  .dockerignore
```

---

### Pages & components to build

#### 1. Home page — URL shortener form
- Text input for the long URL
- Optional "Custom alias" input field (design variant)
- Submit button → `POST /api/urls/` with `{ originalUrl, alias? }`
- Shows a loading state while the request is in flight
- On success: renders `ResultCard` with the short URL
- On error: shows an inline error message (invalid URL, server error)

#### 2. ResultCard — after a URL is shortened
- Displays the full short URL: `https://<domain>/<shortCode>`
- One-click **Copy to clipboard** button
- **QR code** for the short URL (use a library like `qrcode.react`) — the design lists QR codes as a use-case
- Link to view stats for this code

#### 3. Stats page — `GET /api/urls/stats/:shortCode`
- Shows: `shortCode`, `originalUrl`, `clickCount`, `createdAt`, `lastAccessedAt`
- Reachable via `/stats/:shortCode`

#### 4. 404 / 410 page
- Display when a short code is not found (404) or has expired (410)
- The redirect itself happens server-side, but the frontend needs these pages for the SPA router

---

### API integration layer (`src/api/urlApi.ts`)

Three calls need to be wired up:

```ts
// 1. Shorten a URL
POST /api/urls/
body: { originalUrl: string; alias?: string }
response: { shortCode: string }

// 2. Redirect (server-side, not a fetch — browser navigates directly)
GET /<shortCode>   →   302 redirect handled by Nginx/backend

// 3. Stats
GET /api/urls/stats/:shortCode
response: { originalUrl, shortCode, clickCount, createdAt, lastAccessedAt }
```

The base URL must be read from an env variable so it works in both dev and Docker:
```ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
```

---

### Environment config

Add `client/.env.example`:
```
VITE_API_BASE_URL=http://localhost:80
```

Add `client/.env` to `.gitignore`.

---

### Dockerfile for the client

The design serves the frontend via Nginx. Add `client/Dockerfile`:
```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

The built output (`dist/`) is then served by the Nginx container defined in `nginx/nginx.conf`. This is why the Nginx `location /` static block (Issue #12 above) is required.

---

### `docker-compose.yml` — add client service

Once the client Dockerfile exists, add it to the compose file alongside `server`, `mongo`, `redis`, `zookeeper`, `nginx`:
```yaml
client:
  build: ./client
  # no ports needed — Nginx copies its dist output
```
Or build the client image and have Nginx serve from its `dist/` via a shared volume.

---

### Input validation on the frontend

The design (Data Flow step 2) says validate on the server, but the frontend should also guard before sending:
- Must start with `https://` or `http://`
- Max length 2048 characters
- Show inline error immediately — don't wait for a round trip

---

### Priority order for client work

| # | Task |
|---|------|
| 1 | Scaffold Vite/React project in `client/` |
| 2 | Build `UrlForm` + wire `POST /api/urls/` |
| 3 | Build `ResultCard` with copy-to-clipboard |
| 4 | Add `VITE_API_BASE_URL` env var + `.env.example` |
| 5 | Build Stats page + wire `GET /api/urls/stats/:code` |
| 6 | Add QR code component |
| 7 | Add 404/410 pages |
| 8 | Write `client/Dockerfile` |
| 9 | Add client service to `docker-compose.yml` |
| 10 | Update Nginx config to serve `dist/` (Issue #12 already noted) |

---

// DONT CHANGE THIS
https://www.tiney.to/
