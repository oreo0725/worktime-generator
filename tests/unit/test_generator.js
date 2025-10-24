#!/usr/bin/env node
// Simple smoke test for generator module (run with `node tests/unit/test_generator.js`)

const fs = require('fs');
const path = require('path');

const genPath = path.resolve('specs/001-worktime-generator/chrome-extension/lib/generator.js');
if (!fs.existsSync(genPath)) {
  console.error('FAIL: generator.js not found at', genPath);
  process.exit(2);
}

console.log('PASS: generator module exists at', genPath);
process.exit(0);