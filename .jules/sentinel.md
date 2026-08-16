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
