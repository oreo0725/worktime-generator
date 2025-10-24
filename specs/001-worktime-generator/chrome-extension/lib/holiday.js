const HOLIDAY_API = year => `https://api.pin-yi.me/taiwan-calendar/${year}/`;
const STORAGE_KEY = year => `taiwan_holidays_${year}`;

async function fetchHolidayYear(year) {
  const res = await fetch(HOLIDAY_API(year), { cache: "no-store" });
  if (!res.ok) throw new Error(`Holiday API error ${res.status}`);
  const json = await res.json();
  const holidays = {};
  if (Array.isArray(json)) {
    json.forEach(entry => {
      if (entry && entry.date) {
        const d = entry.date.replace(/-/g, "");
        // Preserve actual isHoliday flag from API; avoid marking every date as holiday
        holidays[d] = !!entry.isHoliday;
      }
    });
  }
  const payload = { year, fetchedAt: new Date().toISOString(), holidays, source: HOLIDAY_API(year) };
  try {
    localStorage.setItem(STORAGE_KEY(year), JSON.stringify(payload));
  } catch (e) {
    // ignore storage failures
  }
  return holidays;
}

function readCachedHolidayYear(year) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(year));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.holidays) return null;
    return parsed.holidays;
  } catch (e) {
    return null;
  }
}

export async function ensureHolidayDataForYears(years = []) {
  const missing = [];
  for (const y of years) {
    const cached = readCachedHolidayYear(y);
    if (!cached) missing.push(y);
  }
  for (const y of missing) {
    try {
      await fetchHolidayYear(y);
    } catch (e) {
      // propagate so caller can handle UI fallback
      throw e;
    }
  }
  return years.reduce((acc, y) => {
    acc[y] = readCachedHolidayYear(y) || {};
    return acc;
  }, {});
}

export function isHoliday(dateLike) {
  if (!dateLike) return false;
  const d = dateLike.replace(/-/g, "");
  const year = d.slice(0, 4);
  const cached = readCachedHolidayYear(year);
  if (!cached) return false;
  return !!cached[d];
}

export function getHolidayMap(year) {
  return readCachedHolidayYear(year) || {};
}