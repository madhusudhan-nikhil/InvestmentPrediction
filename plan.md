1.  **Understand the Goal**: The user wants a *single, small performance improvement (< 50 lines)* that makes the application measurably faster or more efficient, implemented as "Bolt" ⚡. The memory gives a specific frontend React convention: "Avoid using inline fallback values (e.g., `data || []` or `data || {}`) outside of `useMemo` when they are used as dependencies, as they recreate references on every render and trigger unnecessary downstream re-evaluations. Instead, wrap the fallback assignment directly in `useMemo`".
2.  **Identify the Problem**:
    - In `frontend/src/components/BrokerExecutionModal.jsx`, there is:
      `const recs = recommendationsData.recommendations || [];`
      `const orders = recs.filter(r => (r.suggested_quantity > 0) || (r.action_type === 'SELL'));`
    - In `frontend/src/components/RecommendationPanel.jsx`, there is:
      `const recs = recommendationsData?.recommendations || [];`
      This `recs` is then used as a dependency in multiple `useMemo` hooks: `equityCount`, `mfEtfCount`, `filteredRecs`, `totalAllocatedInr`, `totalSuggestedUnits`, `weightedExpReturnPct`.
      Since `recommendationsData?.recommendations` might be undefined initially or between updates, `recs` gets a new `[]` reference on every render, invalidating all those `useMemo` caches!
    - In `frontend/src/components/SimplePortfolioPlanner.jsx`, there is:
      `const recsList = recommendations?.recommendations || [];`
      Used in `actionCounts` and `filteredRecs` `useMemo` dependencies.
3.  **Formulate the Fix**:
    - Wrap the `|| []` assignment in a `useMemo` where used as dependency.
    - `RecommendationPanel.jsx`:
      ```javascript
      const recs = useMemo(() => recommendationsData?.recommendations || [], [recommendationsData?.recommendations]);
      ```
    - `SimplePortfolioPlanner.jsx`:
      ```javascript
      const recsList = useMemo(() => recommendations?.recommendations || [], [recommendations?.recommendations]);
      ```
    - `BrokerExecutionModal.jsx`:
      ```javascript
      const recs = useMemo(() => recommendationsData.recommendations || [], [recommendationsData.recommendations]);
      const orders = useMemo(() => recs.filter(r => (r.suggested_quantity > 0) || (r.action_type === 'SELL')), [recs]);
      ```
      (Wait, does `BrokerExecutionModal` use `orders` as a dependency? It uses it in a `reduce` just below. Let's look closer:
      `const totalValue = recs.reduce(...)` - this is computed on every render anyway. Not a dependency of another hook. But we can memoize `recs`, `orders`, and `totalValue` to avoid re-running them.) Let's focus on `RecommendationPanel.jsx` and `SimplePortfolioPlanner.jsx` as they explicitly pass these to `useMemo`.

    Let's check `RecommendationPanel.jsx`:
    ```javascript
    const recs = useMemo(() => recommendationsData?.recommendations || [], [recommendationsData?.recommendations]);
    ```
    Actually, doing this in `RecommendationPanel.jsx` is perfect. It prevents 6 different `useMemo` hooks from re-running unnecessarily on every render when `recommendationsData` is empty/undefined.

    Wait, in `RecommendationPanel.jsx`:
    ```javascript
    const recs = recommendationsData?.recommendations || [];
    ```
    If `recommendationsData?.recommendations` is an array from the API, it has a stable reference (until new data comes). But if `recommendationsData` is empty, `recs` gets a new `[]` every render.

    Let's change:
    ```javascript
    const recs = useMemo(() => recommendationsData?.recommendations || [], [recommendationsData?.recommendations]);
    ```
    Same for `actionCounts`:
    ```javascript
    const actionCounts = useMemo(() => recommendationsData?.action_counts || {}, [recommendationsData?.action_counts]);
    ```
    And in `SimplePortfolioPlanner.jsx`:
    ```javascript
    const recsList = useMemo(() => recommendations?.recommendations || [], [recommendations?.recommendations]);
    ```
4.  **Implement the Fix**:
    Use `replace_with_git_merge_diff` on both files.
5.  **Verify**:
    Run `npm run lint --prefix frontend`. Build it maybe.
6.  **Update Journal**:
    Append to `.jules/bolt.md`:
    ```
    ## YYYY-MM-DD - [Title]
    **Learning:** In React, inline fallback values like `data || []` passed into `useMemo` dependencies cause the memoized value to be recomputed on every render when the data is null/undefined, because `[]` creates a new array reference each time.
    **Action:** Wrap the fallback assignment itself in `useMemo` (e.g., `const arr = useMemo(() => data || [], [data])`) to preserve referential equality and prevent cascading re-renders.
    ```
7.  **Pre-commit steps & Submit**.
