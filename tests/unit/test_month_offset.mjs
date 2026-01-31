// tests/unit/test_month_offset.mjs

// Mock browser APIs
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = v; },
  clear: () => { for (const k in store) delete store[k]; }
};

const fetchedUrls = [];
global.fetch = async (url) => {
  fetchedUrls.push(url);
  return {
    ok: true,
    json: async () => [], // No holidays
  };
};

// Mock crypto for shuffle
if (!global.crypto) {
  global.crypto = {
    getRandomValues: (arr) => {
      for(let i=0; i<arr.length; i++) arr[i] = Math.floor(Math.random() * 4294967296);
      return arr;
    }
  };
}

import { generateRows } from '../../specs/001-worktime-generator/chrome-extension/lib/generator.js';

async function testMonthOffset() {
  console.log('Running testMonthOffset...');
  
  // Test 1: Offset -1 (Previous month)
  // If today is 2025-10-24, offset -1 is 2025-09. Year 2025.
  // If today is 2025-01-15, offset -1 is 2024-12. Year 2024.
  
  const now = new Date();
  const targetPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const expectedYearPrev = targetPrev.getFullYear();
  
  fetchedUrls.length = 0;
  global.localStorage.clear();
  
  await generateRows(1, -1);
  
  const expectedUrlPrev = `https://api.pin-yi.me/taiwan-calendar/${expectedYearPrev}/`;
  if (!fetchedUrls.includes(expectedUrlPrev)) {
    console.error(`FAIL: Did not fetch holidays for previous month year ${expectedYearPrev}. Fetched: ${fetchedUrls.join(', ')}`);
    process.exit(1);
  }
  console.log(`PASS: Fetched holidays for previous month year ${expectedYearPrev}`);

  // Test 2: Offset +1 (Next month)
  const targetNext = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const expectedYearNext = targetNext.getFullYear();
  
  fetchedUrls.length = 0;
  global.localStorage.clear();
  
  await generateRows(1, 1);
  
  const expectedUrlNext = `https://api.pin-yi.me/taiwan-calendar/${expectedYearNext}/`;
  if (!fetchedUrls.includes(expectedUrlNext)) {
    console.error(`FAIL: Did not fetch holidays for next month year ${expectedYearNext}. Fetched: ${fetchedUrls.join(', ')}`);
    process.exit(1);
  }
  console.log(`PASS: Fetched holidays for next month year ${expectedYearNext}`);

  // Test 3: Verify generated dates fall within the target month
  // Using offset -1
  const result = await generateRows(5, -1);
  if (result.rows.length === 0) {
     // It's possible no slots if it's a full holiday month or something, but unlikely with empty holiday mock
     console.warn('WARN: No rows generated for offset -1 check');
  } else {
    const firstRowDate = result.rows[0].worktimes[0].split(' ')[0]; // YYYY-MM-DD
    const d = new Date(firstRowDate);
    if (d.getMonth() !== targetPrev.getMonth() || d.getFullYear() !== targetPrev.getFullYear()) {
       console.error(`FAIL: Generated date ${firstRowDate} does not match target month ${targetPrev.toISOString()}`);
       process.exit(1);
    }
    console.log(`PASS: Generated dates are within target month (${targetPrev.getFullYear()}-${targetPrev.getMonth()+1})`);
  }

  console.log('PASS: All month offset tests passed.');
  process.exit(0);
}

testMonthOffset();