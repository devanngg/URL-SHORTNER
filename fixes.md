# URL Shortener — Detailed Roadmap & Fixes

Stack: Fastify (Backend) + React/Vite (Frontend) + Nginx

---

## 🏗️ INFRASTRUCTURE & BACKEND (PENDING)

### 1. Nginx Routing
The `nginx/nginx.conf` needs a `location /` block to serve the React production build (`dist/`) and handle client-side routing.
```nginx
location / {
    root   /usr/share/nginx/html;
    index  index.html;
    try_files $uri $uri/ /index.html;
}
```

### 2. Container Health Checks
Update `docker-compose.yml` to ensure the API doesn't start before MongoDB/Redis are healthy.
- **MongoDB**: `test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]`
- **Redis**: `test: ["CMD", "redis-cli", "ping"]`

---

## 🌐 CLIENT (FRONTEND) — INTEGRATION PHASE

### Phase 1: Data Contracts & Services (The "Glue")
- [ ] **Define API Types**: Create `client/src/features/url-shortener/types/urlTypes.ts`.
    - `UrlShortenRequest` (originalUrl)
    - `UrlShortenResponse` (shortUrl, code)
    - `UrlStats` (clickCount, createdAt, etc.)
- [ ] **Axios Service**: Implement `postUrl` and `fetchStats` in `client/src/features/url-shortener/services/urlService.ts`.

### Phase 2: State Management (Redux/Local)
- [ ] **URL Slice**: Create a Redux slice in `client/src/features/url-shortener/store/urlSlice.ts` to manage:
    - Current shortened URL result.
    - Loading states (for the "Shorten" button).
    - Error messages (invalid URL, server down).
- [ ] **Hook Up Store**: Register the slice in `client/src/app/store.ts`.

### Phase 3: Component Logic (Making it Interactive)
- [ ] **UrlShortnerForm**: 
    - Link `InputBox` to local state/Redux.
    - Implement `onSubmit` to trigger the API call.
    - Add validation (check if input is a valid URL).
- [ ] **ResultCard (New Component)**: 
    - Create a card that appears only after a successful shortening.
    - Display the new URL (e.g., `http://localhost:3000/api/urls/xyz123`).
    - Add a "Copy to Clipboard" button with visual feedback.
    - Integrate `qrcode.react` for a scannable code.

### Phase 4: Analytics & Navigation
- [ ] **Stats Page**: Build a dedicated route `/stats/:code` to display `UrlStats`.
- [ ] **Redirect Handling**: Ensure the frontend handles 404/410 (Expired) gracefully if a user visits a dead link.

---

## 🚀 PRIORITY EXECUTION ORDER

| Step | Task | Category | Status |
|:---:|:---|:---:|:---:|
| 1 | **Types & API Service** (Define how we talk to backend) | Integration | ⏳ NEXT |
| 2 | **Redux/State Setup** (Storage for API results) | Integration | ⏳ |
| 3 | **Form Logic & Loading States** (Make button work) | Logic | ⏳ |
| 4 | **ResultCard Component** (Show the shortened link) | UI/Logic | ⏳ |
| 5 | **Stats Page & QR Code** (Analytics feature) | Feature | ⏳ |
| 6 | **Docker & Nginx Config** (Production readiness) | DevOps | ⏳ |

---
*Last Updated: March 19, 2026*
