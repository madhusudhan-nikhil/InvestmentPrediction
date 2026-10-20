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
## 2024-11-20 - [Missing Rate Limiting on API Endpoints]
**Vulnerability:** The application was missing global rate limiting on its endpoints. Because it performs complex CPU-bound operations (like portfolio optimization and stress testing), this made it vulnerable to Application-Layer Denial of Service (DoS) attacks, where malicious actors could overwhelm the server with repeated heavy requests.
**Learning:** For Python applications using a simple dictionary to track state (like IP addresses for rate limiting), memory exhaustion is a risk if the size isn't capped. It is important to bound in-memory rate limiting state by setting a maximum capacity for tracked IPs and properly implementing a form of LRU eviction (e.g., using `time.monotonic()` for robust timekeeping and `self.requests.pop()` to ensure active IPs are kept).
**Prevention:** Implement global rate limiting middleware at the FastAPI application level. Furthermore, due to the order in which FastAPI evaluates middleware, ensure rate limiting middleware is added before `CORSMiddleware` so early 429 response objects still get appropriate CORS headers applied.
