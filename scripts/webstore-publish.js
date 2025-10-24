#!/usr/bin/env node
// javascript
// scripts/webstore-publish.js
//
// Usage (CI): set env vars CW_CLIENT_ID, CW_CLIENT_SECRET, CW_REFRESH_TOKEN, CW_EXTENSION_ID
// Optional: ZIP_PATH (defaults to dist/worktime-generator.zip), CW_PUBLISH_TARGET ('default' or 'trustedTesters')
//
// This script uses the `chrome-webstore-upload` package to upload and publish a Chrome extension.
// Install locally for development: npm install --save-dev chrome-webstore-upload
// CI should provide the OAuth credentials via secure secrets.

const fs = require('fs');
const path = require('path');
const ChromeWebstore = require('chrome-webstore-upload');

const ZIP_PATH = path.resolve(process.env.ZIP_PATH || 'dist/worktime-generator.zip');
const EXTENSION_ID = process.env.CW_EXTENSION_ID;
const CLIENT_ID = process.env.CW_CLIENT_ID;
const CLIENT_SECRET = process.env.CW_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.CW_REFRESH_TOKEN;
const PUBLISH_TARGET = process.env.CW_PUBLISH_TARGET || 'default';

if (!EXTENSION_ID || !CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('Missing required env vars. Set CW_EXTENSION_ID, CW_CLIENT_ID, CW_CLIENT_SECRET, CW_REFRESH_TOKEN.');
  process.exit(2);
}

if (!fs.existsSync(ZIP_PATH)) {
  console.error(`Zip not found at ${ZIP_PATH}. Create it first (see quickstart).`);
  process.exit(2);
}

const webstore = new ChromeWebstore({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  refreshToken: REFRESH_TOKEN,
});

(async () => {
  try {
    console.log('Uploading', ZIP_PATH, 'to extension', EXTENSION_ID);
    const zipStream = fs.createReadStream(ZIP_PATH);
    const uploadResult = await webstore.uploadExisting(EXTENSION_ID, zipStream);
    console.log('Upload result:', uploadResult);

    console.log('Publishing to target:', PUBLISH_TARGET);
    const publishResult = await webstore.publish(EXTENSION_ID, PUBLISH_TARGET);
    console.log('Publish result:', publishResult);

    console.log('Publish completed.');
    process.exit(0);
  } catch (err) {
    console.error('Publish failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();