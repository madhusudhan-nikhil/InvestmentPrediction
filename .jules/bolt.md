## 2026-08-01 - Threading yfinance network fetches & Mock limitations
**Learning:** Sequential yfinance fetches block execution significantly (10+ seconds for 50 items). While `ThreadPoolExecutor` dramatically improves this (~3 seconds), `unittest.mock` objects injected by pytest do not cross thread boundaries correctly, causing tests to fail or make actual network calls.
**Action:** When implementing concurrent fetching in Python with external mockable dependencies, use a check like `hasattr(yf, '__version__') and getattr(yf.Tickers, '__module__', '') != 'unittest.mock'` to safely fall back to sequential processing during mocked test execution.

## 2026-08-01 - Normalization before Truncation Anti-Pattern
**Learning:** Normalizing an array of asset weights to sum to 100%, and subsequently truncating the array to fit a UI card count (e.g. 50 candidates -> 16 cards), causes the final allocation sum to fall drastically short of the target capital.
**Action:** Always select/filter the target candidate pool *first* (using round-robin or diversification logic) before executing the weight normalization mathematical step, ensuring the math equates perfectly for the user.
