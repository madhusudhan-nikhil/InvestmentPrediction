## 2024-03-05 - yfinance mock threading quirk
**Learning:** `yfinance` mock objects in the backend's pytest suite do not cross thread boundaries correctly, but hacking production code to satisfy testing frameworks by doing a `__module__` check is a severe anti-pattern.
**Action:** When implementing concurrent `yfinance` fetches (e.g., using `ThreadPoolExecutor`), you should not embed test environment checks into the production codebase. Instead, the test suite itself must be updated to properly mock the `yf.Ticker` object.
## 2026-08-02 - yfinance live data testing quirk
**Learning:** Backend tests for recommendations can fail randomly due to a reliance on live `yfinance` data (e.g., delisted tickers causing exact count assertions to fail).
**Action:** Prefer using flexible boundary assertions (e.g., `<= 30` instead of `== 30`) or ensure robust mocking to prevent test flakiness.
## 2024-05-19 - FastAPI Event Loop Blocking
**Learning:** In the FastAPI backend, using synchronous data processing functions like `pandas.read_csv` and `pandas.read_excel` within an `async def` endpoint directly blocks the main asyncio event loop, causing severe latency degradation under load for all concurrent API requests.
**Action:** Always offload synchronous blocking operations inside `async def` endpoints using `await asyncio.to_thread(func, *args)`.
## 2025-02-20 - React Array Re-renders
**Learning:** In the frontend, repeatedly running expensive array operations (e.g. `filter`, `reduce`) directly in the render path of components with large data inputs (like `RecommendationPanel` receiving hundreds of recommendations) can block the main thread and degrade rendering performance.
**Action:** Always wrap heavy computations and derived state that iterate over large arrays in `React.useMemo()` so they are only recalculated when their specific dependencies change.
## 2026-08-15 - React useMemo dependency breaking memoization
**Learning:** In React, passing derived arrays/objects directly into `useMemo` dependency arrays defeats memoization if the derived value is recreated on every render (e.g. `const arr = data || []`). This causes the `useMemo` hook to unnecessarily re-evaluate and can cause performance drops, especially for large arrays of data.
**Action:** Memoize intermediate variables or directly use `useMemo` on the derived evaluation (e.g. `const arr = useMemo(() => data || [], [data])`) so the reference remains stable across renders.
## 2024-08-14 - React Array Re-renders (TickerManager Filtering)
**Learning:** In the frontend, iterating through large arrays (up to 600 tickers in the universe) multiple times on every render for filtering inside `TickerManager` can cause noticeable UI latency during text input (search).
**Action:** Wrapped the `filteredTickers` array calculation with `React.useMemo()` and hoisted the `search.toLowerCase()` call to prevent redundant string allocations.
