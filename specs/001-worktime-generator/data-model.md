# Data Model: Worktime Generator

## Entities

### Worktime
Represents a single allowed timestamp.

- id: string (derived, e.g., "2024-05-15T09:30")  
- date: string (YYYY-MM-DD)  
- time: string (HH:MM)  
- timestamp: string ("YYYY-MM-DD HH:MM") — canonical representation used in UI and clipboard  
- isHoliday: boolean (lookup from HolidayCalendar)  
- isWeekend: boolean (computed)  
- isValidWorktime: boolean (computed; true iff weekday && within time window && not holiday)

Validation rules:
- date MUST be a valid calendar date.
- time MUST be within 08:30–16:30 inclusive and minute precision.
- timestamp MUST be unique within a single generation run.

### Row
A single output line containing three Worktimes.

- id: string (UUID or index based)
- worktimes: array[Worktime] (length == 3)
- display: string (format: "YYYY-MM-DD HH:MM, YYYY-MM-DD HH:MM, YYYY-MM-DD HH:MM")

Validation rules:
- worktimes.length MUST equal 3.
- All worktimes in the row MUST be distinct timestamps.
- display is derived by joining worktimes.timestamp with ", " separator.

### GeneratorSettings
User-configurable settings for a generation run.

- numberOfRows: integer (>=1)
- monthOffset: integer (e.g., -1 default for previous month)
- timezone: string (IANA timezone, default: user's local timezone)
- yearRange: derived from monthOffset (used to fetch holiday data)
- maxAttempts: integer (safety bound when trying to assemble unique timestamps)

Validation rules:
- numberOfRows MUST be integer ≥ 1.
- monthOffset MAY be negative, zero, or positive integer.
- timezone SHOULD default to browser locale if unspecified.

### HolidayCalendar
Cached map of holiday flags for a year.

- year: integer (e.g., 2025)
- fetchedAt: ISO timestamp when fetched
- holidays: map[string => boolean] keyed by "YYYYMMDD", true if holiday
- source: string (e.g., "https://api.pin-yi.me/taiwan-calendar/{year}/")

Validation rules:
- holidays MUST contain entries for every day of the year when stored.
- Access to holidays MUST be O(1) via map lookup.

## Derived concepts

- CandidateSlot
  - representation: string "YYYY-MM-DD HH:MM"
  - derived from iterating valid dates × valid minutes
  - used as the pool for random selection (no duplicates allowed in final output)

- RequiredCount
  - computed as numberOfRows × 3

## Constraints & Limits

- Candidate pool size is bounded by (workdays_in_month × minutes_in_window).
- If RequiredCount > candidatePool.length, generator MUST return maximal unique set and surface an explicit warning to the user.

## Storage design

- Persistence: only HolidayCalendar cached in localStorage as JSON string under key `taiwan_holidays_{year}` with a `fetchedAt` timestamp.
- No storage of generated Worktimes between runs is required.

## Test cases (data-model focused)

- Validate parsing of holiday API into HolidayCalendar.holidays keys.
- Validate candidate pool generation for months with different day counts and leap-year February.
- Validate uniqueness guarantees when RequiredCount ≤ candidatePool.length.
- Validate graceful degradation when RequiredCount > candidatePool.length.

<!-- End of data-model -->