1. **Analyze Security Issues**: Based on the project's memory directives, it highlights a custom in-memory rate limiter `RateLimiter` class in `backend/main.py`. However, looking at the code in `backend/main.py`, the rate limiting middleware is missing entirely. This constitutes a CRITICAL/HIGH security vulnerability since it exposes all endpoints (like the heavy endpoints `parse-portfolio`, `stress-test`, `recommend-inr`, etc) to DoS and abuse.
2. **Add Rate Limiter Class in `backend/main.py`**: I will add a `RateLimiter` middleware class before the `CORSMiddleware`.
3. **Register Middleware**: The rate limiting middleware will cap at 10,000 IPs using an O(1) FIFO eviction (`pop(next(iter(...)))`) and limit requests to 120 requests/minute/IP.
4. **Pre-commit Steps**: Ensure the pre commit steps are completed using `pre_commit_instructions`.
5. **Submit Change**: Submit with a PR title `🛡️ Sentinel: [HIGH] Add rate limiting to endpoints`.
