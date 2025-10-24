# Research: Worktime Generator (Phase 0)

## Decision
Use the public Taiwan holiday API at `https://api.pin-yi.me/taiwan-calendar/{{year}}/` as the authoritative holiday source. Cache the year's holiday map in browser localStorage under the key `taiwan_holidays_{{year}}`. Generation logic will be implemented in vanilla JavaScript in the extension popup.

## Rationale
- The API returns a full-year JSON with explicit `isHoliday` flags per date, eliminating the need to maintain a holiday list inside the extension.
- localStorage caching avoids repeated network calls on each generation and supports offline use when cache exists.
- A pure client-side implementation (no backend) keeps the extension simple and privacy-friendly.

## Holiday data handling
- Fetch flow:
  1. On popup open, determine the target year(s) needed for the configured month offset(s).
  2. Check localStorage for `taiwan_holidays_{year}`. If present, parse it into a Set/map keyed by `YYYYMMDD` with boolean holiday flag.
  3. If not present, call `GET https://api.pin-yi.me/taiwan-calendar/{year}/`. On success, build the `{ "YYYYMMDD": true/false }` map and store it in localStorage.
  4. If network failure and no cache, surface an error message and disable generation until retry.
- Storage shape example:
  - Key: `taiwan_holidays_2025`
  - Value: JSON stringified object, e.g. `{ "20250101": true, "20250102": false, ... }`
- TTL / refresh policy:
  - Option A (recommended): store a `fetched_at` timestamp and refresh annually or when year changes.
  - Simpler approach: refresh whenever the cache is missing; acceptable because holiday data changes rarely.

## Candidate timestamp generation algorithm
1. Compute target month first day and last day using user's local timezone and month offset.
2. Enumerate each calendar date in the month:
   - Exclude if weekend (Sat/Sun).
   - Exclude if `isHoliday === true` in holiday map.
3. For each remaining valid date, generate minute-resolution time slots between 08:30 and 16:30 inclusive.
   - Represent each slot as ISO-like string `YYYY-MM-DD HH:MM`.
4. Collect the full set of candidate timestamps across the month.
5. Uniqueness & selection:
   - If required_count (rows × 3) <= candidates.length:
     - Shuffle candidates with Fisher–Yates and select the first required_count.
     - Group into rows by taking consecutive 3 elements per row.
   - If required_count > candidates.length:
     - Return as many unique timestamps as possible (candidates.length) and surface a clear UI warning about insufficient unique timestamps.
6. Determinism:
   - Randomization is per-run only. No persistent seed is required. Use crypto-quality randomness where available (`crypto.getRandomValues`) for unbiased shuffle.

## Performance considerations
- Candidate pool size: days_in_month × ~481 minutes (08:30–16:30) gives an upper bound (e.g., 22 workdays × 481 ≈ 10k candidates). Shuffling and selecting 3k items is feasible within the 2s target on modern hardware.
- Use efficient in-memory arrays and a linear-time Fisher–Yates shuffle, then slice. Avoid repeated array allocations inside hot loops.
- Cache holiday lookups to O(1) membership checks.

## Error handling and UX
- If holiday API fetch fails:
  - If cache exists: proceed using cache and show a subtle "Using cached holiday data" notice.
  - If cache missing: show a clear modal/error and a "Retry" action to re-fetch; disable generation.
- When insufficient unique timestamps:
  - Show the partial result, highlight the missing count, and display guidance (reduce rows, expand month range).
- Accessibility:
  - Ensure all controls are keyboard-operable and provide ARIA labels for screen readers.

## Testing notes
- Unit tests for:
  - Holiday parsing and cache read/write logic.
  - Candidate generation for edge months (Feb leap year, months with holidays).
  - Shuffle/select logic ensuring uniqueness and grouping.
  - Error scenarios when API unavailable and when candidates insufficient.
- Integration test ideas:
  - Simulate cached and uncached holiday responses.
  - Validate clipboard payload format when copying.

## Alternatives considered
- Embed a static holiday list in the extension:
  - Pros: No network dependency.
  - Cons: Requires maintenance and increases bundle size.
- Use an external CDN or different API:
  - Other APIs exist, but `api.pin-yi.me` provides a simple full-year JSON with `isHoliday`, which fits our needs.

## Final recommendation
- Implement holiday fetch + localStorage cache per-year.
- Use the enumerated-minute candidate pool + shuffle-without-replacement selection approach.
- Provide clear UX for errors and insufficient-unique-timestamp conditions.