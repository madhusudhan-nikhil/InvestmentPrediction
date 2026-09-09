## 2024-05-15 - [Overly Permissive CORS Configuration and Error Leakage]
**Vulnerability:** The application was using an overly permissive CORS (Cross-Origin Resource Sharing) configuration in `backend/main.py`. The `allow_origins=["*"]` allows any website to make requests to this backend when `allow_credentials=True` is also set. Additionally, HTTP 500 error responses were returning stringified internal exception details, which leaks sensitive information.
**Learning:** It's important to set specific origins for CORS when credentials are allowed, and to mask sensitive stack traces and internal errors in production APIs.
**Prevention:** Always use specific origins for CORS instead of the wildcard character (*), especially when allowing credentials. Always fail securely with generic error messages.
## 2026-08-02 - [Error Leakage from Exception stringification]
**Vulnerability:** HTTP 400 error responses were returning stringified internal exception details during file parsing and JSON loading in `backend/main.py`. This exposes internal execution flow, and specific errors to the client.
**Learning:** Returning `str(e)` in an API error response exposes details that malicious users can exploit.
**Prevention:** Mask specific errors behind a generic user-friendly string error message for failed validations.
## 2024-05-16 - [Missing Security Headers for Defense in Depth]
**Vulnerability:** The application was missing essential security HTTP headers (such as `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, and `Strict-Transport-Security`), leaving it potentially exposed to clickjacking, MIME-sniffing, and cross-site scripting (XSS) attacks.
**Learning:** Security headers are a fundamental defense-in-depth measure that should be applied to all FastAPI endpoints to reduce the attack surface.
**Prevention:** Implement a global security middleware (`@app.middleware("http")`) that injects standard security headers into all outgoing API responses.
## 2024-10-27 - [Missing Authentication on Admin API Endpoints]
**Vulnerability:** The `/api/tickers` and `/api/tickers/sync` endpoints modified global application state (the backend JSON ticker database) but lacked any authentication or authorization checks. This allowed any unauthenticated user to overwrite the primary ticker dataset used for macro recommendations.
**Learning:** Endpoints that modify application state or configuration (admin endpoints) must always be protected with authentication to prevent unauthorized tampering.
**Prevention:** Implement mandatory token-based authentication (like an `X-Admin-Token` header validated against a secure environment variable) on all endpoints that modify global datasets or configurations. Use `hmac.compare_digest` to prevent timing attacks.
## 2024-11-20 - [Missing rate limiting on sensitive endpoints]
**Vulnerability:** The FastAPI application lacked global rate limiting on its endpoints. Because it exposes computationally expensive endpoints (like portfolio parsing and quantitative calculations), the application was highly vulnerable to Denial of Service (DoS) attacks and brute-forcing.
**Learning:** It is crucial to limit the number of requests clients can make to sensitive endpoints to ensure service availability. An in-memory rate limiter requires an active cache bounds check and eviction policy (like O(1) FIFO) to ensure a high volume of unique spoofed IP requests cannot exhaust the memory. The middleware must also securely determine the real client IP (e.g., using `X-Forwarded-For`) if behind a reverse proxy, and it must be registered *before* `CORSMiddleware` so the 429 response retains necessary CORS headers.
**Prevention:** Implement a global bounded rate-limiting middleware that limits requests by IP and prevents unbounded memory growth by aggressively evicting stale or overflow IP mappings.
