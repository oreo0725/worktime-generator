// scripts/benchmark.js
// Simple benchmark for generator performance

// Mock browser APIs
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
};
global.fetch = async () => ({
  ok: true,
  json: async () => [], // No holidays
});
if (!global.crypto) {
  global.crypto = {
    getRandomValues: (arr) => {
      for(let i=0; i<arr.length; i++) arr[i] = Math.floor(Math.random() * 4294967296);
      return arr;
    }
  };
}

import { generateRows } from '../specs/001-worktime-generator/chrome-extension/lib/generator.js';

async function runBenchmark() {
  console.log('Running benchmark...');
  const rows = 1000;
  const start = performance.now();
  
  const result = await generateRows(rows, -1);
  
  const end = performance.now();
  const duration = end - start;
  
  console.log(`Generated ${result.rows.length} rows in ${duration.toFixed(2)}ms`);
  
  if (duration > 2000) {
    console.error('FAIL: Generation took longer than 2000ms');
    process.exit(1);
  }
  
  console.log('PASS: Performance within limits');
}

runBenchmark();