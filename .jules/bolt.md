## 2024-03-05 - yfinance mock threading quirk
**Learning:** `yfinance` mock objects in the backend's pytest suite do not cross thread boundaries correctly, but hacking production code to satisfy testing frameworks by doing a `__module__` check is a severe anti-pattern.
**Action:** When implementing concurrent `yfinance` fetches (e.g., using `ThreadPoolExecutor`), you should not embed test environment checks into the production codebase. Instead, the test suite itself must be updated to properly mock the `yf.Ticker` object.
## 2026-08-02 - yfinance live data testing quirk
**Learning:** Backend tests for recommendations can fail randomly due to a reliance on live `yfinance` data (e.g., delisted tickers causing exact count assertions to fail).
**Action:** Prefer using flexible boundary assertions (e.g., `<= 30` instead of `== 30`) or ensure robust mocking to prevent test flakiness.
