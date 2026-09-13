import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  await page.goto('http://127.0.0.1:8765');
  
  // wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  // Try to click the google login button if it exists
  try {
    const btn = await page.$('.home-auth-google-wrap');
    if (btn) {
       console.log('Found button');
    }
  } catch (e) {}

  await browser.close();
})();
