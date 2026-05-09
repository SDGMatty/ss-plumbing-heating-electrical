const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    await page.setViewport({width: 375, height: 812});
    await page.goto('http://localhost:8000/');
    await page.waitForTimeout(1000);
    console.log("Found mobile toggle: ", await page.$('button#mobile-toggle') !== null);
    await page.click('button#mobile-toggle');
    await page.waitForTimeout(500);
    const classes = await page.evaluate(() => document.getElementById('navbar').className);
    console.log("Navbar classes after click: ", classes);
    await page.screenshot({path: 'puppet_test.png'});
    await browser.close();
})();
