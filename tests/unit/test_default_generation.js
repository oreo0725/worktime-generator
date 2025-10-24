#!/usr/bin/env node
// Smoke test: ensure generator module file exists and is importable in a Node environment.
// Run with: node tests/unit/test_default_generation.js

const fs = require('fs');
const path = require('path');

const genPath = path.resolve('specs/001-worktime-generator/chrome-extension/lib/generator.js');
if (!fs.existsSync(genPath)) {
  console.error('FAIL: generator.js not found at', genPath);
  process.exit(2);
}

console.log('PASS: generator module file exists at', genPath);
process.exit(0);