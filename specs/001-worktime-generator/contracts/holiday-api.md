# Contract: Taiwan Holiday API (usage for Worktime Generator)

Purpose: Define the contract for obtaining Taiwan public-holiday flags used by the extension to
exclude holidays from generated worktimes.

Source
- GET https://api.pin-yi.me/taiwan-calendar/{year}/
  - {year}: four-digit year (e.g., 2025)
  - No authentication required

Request
- Method: GET
- URL pattern: https://api.pin-yi.me/taiwan-calendar/{year}/
- Example: GET https://api.pin-yi.me/taiwan-calendar/2025/

Response (success)
- Content-Type: application/json
- Body: JSON array of objects, each with at least the following fields:
  - date: string (YYYYMMDD, e.g., "20250101")
  - date_format: string (YYYY/MM/DD)
  - year: string (e.g., "2025")
  - month: string (2-digit, e.g., "01")
  - day: string (2-digit, e.g., "01")
  - week: string (weekday English, e.g., "Wednesday")
  - isHoliday: boolean (true if public holiday)
  - caption: string (holiday name or empty)
- Example element:
  ```json
  {
    "date": "20250101",
    "date_format": "2025/01/01",
    "year": "2025",
    "month": "01",
    "day": "01",
    "week": "Wednesday",
    "isHoliday": true,
    "caption": "開國紀念日"
  }
  ```

Error responses
- 4xx / 5xx responses may occur. Clients MUST handle network errors and non-200 HTTP statuses.
- If API returns non-200 or fails to parse, extension MUST surface a user-facing error and
  fall back to cached data if available.

Client-side caching contract
- Cache key: `taiwan_holidays_{year}` (e.g., `taiwan_holidays_2025`)
- Cached value: JSON string of an object mapping `YYYYMMDD` → boolean (true if holiday).
  - Example: `{ "20250101": true, "20250102": false, ... }`
- Cache policy:
  - If key present, use cache and avoid network call for that year.
  - If missing, call API and store parsed map under the key.
  - Optionally store a `fetched_at` timestamp alongside the data to support future refresh policies.

Usage semantics for generator
- Holiday lookup function contract:
  - Input: date string (YYYYMMDD) or Date object
  - Output: boolean (true if date is holiday)
  - Behavior: If date year is not cached, trigger fetch; if fetch fails, throw or return a sentinel
    error that the UI can surface.
- Timezone: API uses calendar dates; the extension MUST evaluate dates using the user's local
  date (e.g., Asia/Taipei). Date → YYYYMMDD conversion MUST be performed using local timezone.

Performance and reliability
- API has no auth; assume reasonable rate limits. The extension MUST cache results to avoid
  repeated calls and to tolerate offline usage.
- On fetch failure with no cache, the extension MUST disable generation and prompt the user to retry.

Security & privacy
- No sensitive data is sent to the API. Only the year is requested.
- Treat the API as untrusted input: validate expected fields and types before use.

Notes
- This contract is intentionally minimal: the extension relies on `isHoliday` boolean only.
- If API schema changes upstream, the extension MUST handle missing fields gracefully and
  surface an error asking the maintainer to update the contract.

<!-- End of holiday API contract -->