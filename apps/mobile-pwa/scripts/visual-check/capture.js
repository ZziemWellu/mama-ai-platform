// Captures every public page at phone and desktop size from a running build.
// Usage: BASE_URL=http://localhost:3100 CHROME_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" node capture.js <out-dir>
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const base = process.env.BASE_URL || 'http://localhost:3100';
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const out = process.argv[2];
if (!out) { console.error('usage: node capture.js <out-dir>'); process.exit(2); }
const pages = ['/', '/assessment', '/referral', '/waiting-home', '/login', '/register', '/dashboard'];
const sizes = [{ name: 'phone', width: 390, height: 844 }, { name: 'desktop', width: 1280, height: 800 }];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox'] });
  try {
    for (const size of sizes) {
      const page = await browser.newPage();
      await page.setViewport({ width: size.width, height: size.height, deviceScaleFactor: 1 });
      await page.emulateTimezone('Africa/Accra');
      for (const p of pages) {
        const name = `${p === '/' ? 'home' : p.slice(1)}_${size.name}`;
        await page.goto(base + p, { waitUntil: 'load', timeout: 30000 });
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true, animations: 'disabled' });
        console.log('captured', name);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
})();
