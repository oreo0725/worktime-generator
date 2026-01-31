// tests/unit/test_distinct_dates.mjs

// Mock browser APIs
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
};
global.fetch = async () => ({
  ok: true,
  json: async () => [], // No holidays
});
// Node.js v19+ has native crypto support
if (!global.crypto) {
  global.crypto = {
    getRandomValues: (arr) => {
      for(let i=0; i<arr.length; i++) arr[i] = Math.floor(Math.random() * 4294967296);
      return arr;
    }
  };
}

import { generateRows } from '../../specs/001-worktime-generator/chrome-extension/lib/generator.js';

async function testDistinctDates() {
  console.log('Running testDistinctDates...');
  // Generate 10 rows. With random selection from ~20 working days, 
  // probability of collision in at least one row is high if not enforced.
  const result = await generateRows(10, -1); 
  
  if (!result.rows || result.rows.length === 0) {
    console.error('FAIL: No rows generated');
    process.exit(1);
  }

  let failures = 0;
  result.rows.forEach((row, idx) => {
    const dates = new Set();
    row.worktimes.forEach(wt => {
      // wt is "YYYY-MM-DD HH:MM"
      const datePart = wt.split(' ')[0];
      dates.add(datePart);
    });
    
    if (dates.size !== 3) {
      console.error(`FAIL: Row ${idx+1} has duplicate dates: ${row.worktimes.join(', ')}`);
      failures++;
    }
  });

  if (failures > 0) {
    console.error(`FAIL: ${failures} rows have duplicate dates.`);
    process.exit(1);
  }
  
  console.log('PASS: All rows have distinct dates.');
  process.exit(0);
}

testDistinctDates();