import { buildCandidateSlots } from './candidates.js';
import { selectFirstNShuffled } from './selector.js';
import { getHolidayMap, ensureHolidayDataForYears } from './holiday.js';

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatRowDisplay(items) {
  return items.map(s => s).join(', ');
}

export async function generateRows(numberOfRows = 1, monthOffset = -1) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const startDate = new Date(target.getFullYear(), target.getMonth(), 1);
  const endDate = new Date(target.getFullYear(), target.getMonth() + 1, 0);
  const years = new Set([startDate.getFullYear(), endDate.getFullYear()]);
  await ensureHolidayDataForYears(Array.from(years));
  const holidayMap = Object.assign({}, getHolidayMap(startDate.getFullYear()), getHolidayMap(endDate.getFullYear()));
  const candidates = buildCandidateSlots(startDate, endDate, holidayMap);
  const required = numberOfRows * 3;
  // Instrumentation: log diagnostic details when no candidates found
  if (!candidates || candidates.length === 0) {
    try {
      console.warn('generator.js: no candidates', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        years: Array.from(years),
        required,
        holidayKeysSample: Object.keys(holidayMap || {}).slice(0, 10),
        holidayCount: Object.keys(holidayMap || {}).length
      });
    } catch (e) {
      // ignore logging errors
    }
    return { rows: [], warning: 'No available worktime slots in selected month.' };
  }
  const selected = selectFirstNShuffled(candidates, required);
  const rows = [];
  const actualRows = Math.floor(selected.length / 3);
  for (let i = 0; i < actualRows; i++) {
    const rowItems = selected.slice(i * 3, i * 3 + 3);
    // Ensure the three timestamps are in chronological order
    rowItems.sort((a, b) => {
      const da = new Date(a.replace(' ', 'T'));
      const db = new Date(b.replace(' ', 'T'));
      return da - db;
    });
    rows.push({
      id: String(i + 1),
      worktimes: rowItems,
      display: formatRowDisplay(rowItems)
    });
  }
  let warning = null;
  if (selected.length < required) {
    warning = `Warning: only ${selected.length} unique timestamps available; requested ${required}.`;
  }
  return { rows, warning, requested: required, produced: selected.length };
}