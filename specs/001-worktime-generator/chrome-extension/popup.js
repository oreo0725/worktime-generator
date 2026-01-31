import { generateRows } from './lib/generator.js';
// popup.js - main logic for Worktime Generator
'use strict';

const ROWS_INPUT_ID = 'rows';
const OFFSET_INPUT_ID = 'offset';
const OFFSET_DECR_ID = 'offset-decr';
const OFFSET_INCR_ID = 'offset-incr';
const GENERATE_ID = 'generate';
const COPY_ID = 'copy';
const STATUS_ID = 'status';
const OUTPUT_ID = 'output';

const HOLIDAY_API = 'https://api.pin-yi.me/taiwan-calendar/{year}/';
const HOLIDAY_CACHE_KEY = (y) => `taiwan_holidays_${y}`;

const MIN_MINUTE = 8 * 60 + 30;   // 08:30
const MAX_MINUTE = 16 * 60 + 30;  // 16:30

document.addEventListener('DOMContentLoaded', () => {
  const rowsInput = document.getElementById(ROWS_INPUT_ID);
  const offsetInput = document.getElementById(OFFSET_INPUT_ID);
  const offsetDisplay = document.getElementById('offset-display');
  const offsetDecr = document.getElementById(OFFSET_DECR_ID);
  const offsetIncr = document.getElementById(OFFSET_INCR_ID);
  const generateBtn = document.getElementById(GENERATE_ID);
  const copyBtn = document.getElementById(COPY_ID);

  // Restore rows count from last session
  try {
    const savedRows = parseInt(localStorage.getItem('wt_rows') || '', 10);
    if (Number.isInteger(savedRows) && savedRows > 0) {
      rowsInput.value = String(savedRows);
    }
  } catch (e) {}

  // Persist rows on change
  rowsInput.addEventListener('change', () => {
    const v = Math.max(1, parseInt(rowsInput.value || '1', 10));
    rowsInput.value = String(v);
    try { localStorage.setItem('wt_rows', String(v)); } catch (e) {}
  });

  function updateOffsetDisplay() {
    const offset = parseInt(offsetInput.value || '0', 10);
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const label = `${target.getFullYear()}年${String(target.getMonth() + 1).padStart(2,'0')}月`;
    if (offsetDisplay) offsetDisplay.textContent = label;
  }

  offsetDecr.addEventListener('click', () => {
    offsetInput.value = (parseInt(offsetInput.value || '0', 10) - 1).toString();
    updateOffsetDisplay();
  });
  offsetIncr.addEventListener('click', () => {
    offsetInput.value = (parseInt(offsetInput.value || '0', 10) + 1).toString();
    updateOffsetDisplay();
  });

  generateBtn.addEventListener('click', () => runGenerate());
  copyBtn.addEventListener('click', () => copyOutput());

  // Initialize offset display then generate
  updateOffsetDisplay();
  runGenerate();
});

async function runGenerate() {
  try {
    setStatus('Preparing...');
    disableButtons(true);

    const rows = Math.max(1, parseInt(document.getElementById(ROWS_INPUT_ID).value || '1', 10));
    const offset = parseInt(document.getElementById(OFFSET_INPUT_ID).value || '-1', 10);

    const result = await generateRows(rows, offset);

    if (!result || !result.rows || result.rows.length === 0) {
      renderOutput([]);
      setStatus(result && result.warning ? result.warning : 'No available worktime slots in selected month.');
      disableButtons(false);
      return;
    }

    if (result.warning) setStatus(result.warning);

    const rowsPayload = result.rows.map(r => r.display);
    renderOutput(rowsPayload);
    setStatus('Generated ' + rowsPayload.length + ' row(s).');
  } catch (err) {
    console.error(err);
    setStatus('Error: ' + (err && err.message ? err.message : String(err)));
    renderOutput([]); // Clear output on error
  } finally {
    disableButtons(false);
  }
}

function computeMonthRange(offset) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = target.getFullYear();
  const month = target.getMonth();
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // last day of month

  // Determine all years covered (usually one)
  const years = new Set();
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    years.add(d.getFullYear());
  }

  return { startDate, endDate, years: Array.from(years) };
}

async function ensureHolidayDataForYears(years) {
  for (const y of years) {
    const key = HOLIDAY_CACHE_KEY(y);
    const cached = localStorage.getItem(key);
    if (cached) continue;
    await fetchAndCacheHolidayYear(y);
  }
}

async function fetchAndCacheHolidayYear(year) {
  const url = HOLIDAY_API.replace('{year}', String(year));
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Holiday API returned ' + res.status);
    const arr = await res.json();
    const map = {};
    for (const it of arr) {
      if (!it.date) continue;
      // API date is like "20250101"
      map[it.date] = !!it.isHoliday;
    }
    localStorage.setItem(HOLIDAY_CACHE_KEY(year), JSON.stringify({ fetched_at: new Date().toISOString(), holidays: map }));
  } catch (err) {
    console.warn('Holiday fetch failed for', year, err);
    // rethrow so caller can handle UI fallback if needed
    throw new Error('Failed to fetch holiday data for ' + year);
  }
}

function buildHolidayMapForRange(years) {
  const combined = {};
  for (const y of years) {
    const key = HOLIDAY_CACHE_KEY(y);
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const holidays = parsed.holidays || {};
      Object.assign(combined, holidays);
    } catch (err) {
      console.warn('Invalid holiday cache for', y);
    }
  }
  return combined; // map YYYYMMDD -> true/false
}

function buildCandidateSlots(startDate, endDate, holidayMap) {
  const candidates = [];
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const day = d.getDay(); // 0 Sun .. 6 Sat
    if (day === 0 || day === 6) continue; // skip weekends

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const key = `${y}${m}${dd}`;

    if (holidayMap[key]) continue;

    for (let minute = MIN_MINUTE; minute <= MAX_MINUTE; minute++) {
      const hh = Math.floor(minute / 60);
      const mm = minute % 60;
      const ts = `${y}-${m}-${dd} ${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
      candidates.push(ts);
    }
  }
  return candidates;
}

function shuffle(array) {
  // Fisher-Yates using crypto where available
  const n = array.length;
  if (window.crypto && window.crypto.getRandomValues) {
    const rand = new Uint32Array(n);
    window.crypto.getRandomValues(rand);
    for (let i = n - 1; i > 0; i--) {
      const j = rand[i] % (i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
  } else {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  return array;
}

function groupIntoRows(items, per) {
  const rows = [];
  for (let i = 0; i < items.length; i += per) {
    const chunk = items.slice(i, i + per);
    if (chunk.length < per) break;
    rows.push(chunk.join(', '));
  }
  return rows;
}

function renderOutput(rowsPayload) {
  const out = document.getElementById(OUTPUT_ID);
  out.textContent = rowsPayload.join('\n');
  out.focus();
}

async function copyOutput() {
  const out = document.getElementById(OUTPUT_ID).textContent || '';
  if (!out) {
    setStatus('Nothing to copy.');
    return;
  }
  try {
    await navigator.clipboard.writeText(out);
    setStatus('Copied to clipboard.');
  } catch (err) {
    console.error('Copy failed', err);
    setStatus('Copy failed: ' + (err && err.message ? err.message : String(err)));
  }
}

function setStatus(msg) {
  const s = document.getElementById(STATUS_ID);
  if (s) {
    s.textContent = msg;
    // Auto-clear status after 5 seconds if it's a success message
    if (msg.startsWith('Generated') || msg.startsWith('Copied')) {
      setTimeout(() => {
        if (s.textContent === msg) s.textContent = '';
      }, 5000);
    }
  }
}

function disableButtons(disabled) {
  const gen = document.getElementById(GENERATE_ID);
  const copy = document.getElementById(COPY_ID);
  if (gen) gen.disabled = disabled;
  if (copy) copy.disabled = disabled;
}