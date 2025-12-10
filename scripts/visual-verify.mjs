
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const screenshotsDir = path.join(rootDir, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
}

const extensionPath = path.join(rootDir, 'apps/extension/build/chrome-mv3-prod');

console.log('Starting Web App Server...');
const webServer = spawn('pnpm', ['--filter', 'web', 'dev', '--port', '3000'], {
    cwd: rootDir,
    stdio: 'pipe',
    shell: true
});

webServer.stdout.on('data', (data) => {
    // console.log(`[Web]: ${data}`);
});

webServer.stderr.on('data', (data) => {
    console.error(`[Web Error]: ${data}`);
});

async function waitForServer(url) {
    let retries = 30;
    while (retries > 0) {
        try {
            const res = await fetch(url);
            if (res.ok) return;
        } catch (e) {
            // ignore
        }
        await new Promise(r => setTimeout(r, 1000));
        retries--;
        process.stdout.write('.');
    }
    throw new Error('Server not ready');
}

async function run() {
    try {
        console.log('Waiting for localhost:3000...');
        await waitForServer('http://localhost:3000');
        console.log('\nServer is ready!');

        console.log('Launching Puppeteer with Extension...');
        const browser = await puppeteer.launch({
            headless: false, // Must be false for extensions usually, or use 'new'
            args: [
                `--disable-extensions-except=${extensionPath}`,
                `--load-extension=${extensionPath}`,
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        console.log('Navigating to Landing Page...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
        
        console.log('Taking Landing Page Screenshot...');
        await page.screenshot({ path: path.join(screenshotsDir, '1-landing-page-hero.png') });

        console.log('Scrolling to Themes...');
        await page.evaluate(() => {
            const themes = document.getElementById('themes');
            if(themes) themes.scrollIntoView();
        });
        await new Promise(r => setTimeout(r, 1000)); // Wait for scroll/animation
        await page.screenshot({ path: path.join(screenshotsDir, '2-landing-page-themes.png') });
        
        console.log('Finding Extension ID via chrome://extensions...');
        // Since there is no background worker, we must visit chrome://extensions to get the ID.
        const extPage = await browser.newPage();
        await extPage.goto('chrome://extensions', { waitUntil: 'networkidle0' });
        
        // Evaluate to find the ID. The structure inside chrome://extensions is complex (Shadow DOM).
        // But we can try to use chrome.management if we are in a component, OR just rely on the fact that
        // usually the first extension loaded is ours.
        // Actually, Puppeteer might allow us to see targets differently. 
        // Let's try to query the extensions-manager element.
        
        const extensionId = await extPage.evaluate(async () => {
            const manager = document.querySelector('extensions-manager');
            if (!manager) return null;
            // Access shadow root
            const list = manager.shadowRoot.querySelector('extensions-item-list');
            if (!list) return null;
            const items = list.shadowRoot.querySelectorAll('extensions-item');
            
            for (const item of items) {
                if (item.shadowRoot.textContent.includes('ThemeGPT')) {
                    return item.id;
                }
            }
            return null;
        });

        if (extensionId) {
            console.log(`Found Extension ID: ${extensionId}`);
            
            const popupPage = await browser.newPage();
            // Popup size matches what's usually defined or standard
            await popupPage.setViewport({ width: 380, height: 600 });
            await popupPage.goto(`chrome-extension://${extensionId}/popup.html`, { waitUntil: 'networkidle0' });
            
            // Wait a bit for React to render
            await new Promise(r => setTimeout(r, 1000));
            
            console.log('Taking Extension Popup Screenshot...');
            await popupPage.screenshot({ path: path.join(screenshotsDir, '3-extension-popup.png') });
        } else {
            console.log('Could not find ThemeGPT extension in chrome://extensions. Taking screenshot of extensions page for debug.');
            await extPage.screenshot({ path: path.join(screenshotsDir, 'debug-extensions-page.png') });
        }
        await extPage.close();

        await browser.close();
        console.log('Verification Complete. Screenshots saved.');

    } catch (error) {
        console.error('Verification Failed:', error);
    } finally {
        webServer.kill();
        process.exit(0);
    }
}

run();
