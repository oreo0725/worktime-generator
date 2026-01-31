import { buildCandidateSlots } from './candidates.js';
import { shuffle } from './selector.js';
import { getHolidayMap, ensureHolidayDataForYears } from './holiday.js';

function pad(n) {
  return String(n).padStart(2, '0');
}

function toMMDDHHMM(datetimeStr) {
  const [datePart, timePart] = datetimeStr.split(' ');
  const [, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');
  return `'${month}${day}${hour}${minute}`;
}

function formatRowDisplay(items) {
  return items.join('\t');
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

  // Group candidates by date to enforce distinct dates per row
  const slotsByDay = {};
  for (const slot of candidates) {
    const date = slot.split(' ')[0];
    if (!slotsByDay[date]) slotsByDay[date] = [];
    slotsByDay[date].push(slot);
  }

  const rows = [];
  let producedCount = 0;

  for (let i = 0; i < numberOfRows; i++) {
    // Find days that still have slots available
    const availableDays = Object.keys(slotsByDay).filter(d => slotsByDay[d].length > 0);
    
    if (availableDays.length < 3) {
      break; // Cannot form a complete row with distinct dates
    }

    // Pick 3 distinct days randomly
    const selectedDays = shuffle(availableDays).slice(0, 3);
    const rowItems = [];

    for (const day of selectedDays) {
      const daySlots = slotsByDay[day];
      // Pick one slot randomly from this day
      const picked = shuffle(daySlots)[0];
      
      // Remove picked slot from pool
      const idx = daySlots.indexOf(picked);
      if (idx > -1) daySlots.splice(idx, 1);
      
      rowItems.push(picked);
    }

    // Ensure the three timestamps are in chronological order
    rowItems.sort((a, b) => {
      const da = new Date(a.replace(' ', 'T'));
      const db = new Date(b.replace(' ', 'T'));
      return da - db;
    });

    const formattedItems = rowItems.map(toMMDDHHMM);
    rows.push({
      id: String(i + 1),
      worktimes: formattedItems,
      display: formatRowDisplay(formattedItems)
    });
    producedCount += 3;
  }

  let warning = null;
  if (producedCount < required) {
    warning = `Warning: only ${producedCount} timestamps generated; requested ${required}. Not enough distinct days available.`;
  }
  return { rows, warning, requested: required, produced: producedCount };
}