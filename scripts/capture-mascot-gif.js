#!/usr/bin/env node
/**
 * Capture AnimatedMascot component as a centered GIF with correct 4-second timing
 * Creates both regular and transparent versions
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const FRAMES_DIR = path.join(__dirname, '../asset/GIFs/frames');
const FRAMES_TRANSPARENT_DIR = path.join(__dirname, '../asset/GIFs/frames-transparent');
const DURATION_MS = 4000;
const FPS = 15;
const TOTAL_FRAMES = Math.floor((DURATION_MS / 1000) * FPS);

async function captureFrames() {
  console.log('Starting AnimatedMascot capture (centered)...');
  console.log(`Duration: ${DURATION_MS}ms, FPS: ${FPS}, Total frames: ${TOTAL_FRAMES}`);

  // Create frames directories
  for (const dir of [FRAMES_DIR, FRAMES_TRANSPARENT_DIR]) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
    fs.mkdirSync(dir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // High resolution for crisp output
  const scaleFactor = 8;
  await page.setViewport({ width: 800, height: 600, deviceScaleFactor: scaleFactor });

  console.log('Navigating to localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  // Find the mascot element directly
  const mascotBox = await page.evaluate(() => {
    const mascot = document.querySelector('nav a[href="/"] > div');
    if (!mascot) return null;
    const rect = mascot.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      centerX: rect.x + rect.width / 2,
      centerY: rect.y + rect.height / 2
    };
  });

  if (!mascotBox) {
    console.error('Could not find mascot element');
    await browser.close();
    return;
  }

  console.log('Found mascot at:', mascotBox);

  // Capture area size (in viewport pixels)
  const captureSize = 70;

  // Calculate clip to center the mascot
  const clip = {
    x: mascotBox.centerX - captureSize / 2,
    y: mascotBox.centerY - captureSize / 2,
    width: captureSize,
    height: captureSize
  };

  console.log('Capture clip (centered):', clip);

  // === CAPTURE WITH BACKGROUND (for regular GIF) ===
  console.log(`\nCapturing ${TOTAL_FRAMES} frames WITH background...`);
  const frameDelay = DURATION_MS / TOTAL_FRAMES;

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const framePath = path.join(FRAMES_DIR, `frame-${String(i).padStart(4, '0')}.png`);
    await page.screenshot({ path: framePath, clip: clip, omitBackground: false });
    if (i % 10 === 0) console.log(`  Frame ${i + 1}/${TOTAL_FRAMES}`);
    await new Promise(r => setTimeout(r, frameDelay));
  }

  // === CAPTURE WITH TRANSPARENT BACKGROUND ===
  console.log(`\nCapturing ${TOTAL_FRAMES} frames with TRANSPARENT background...`);

  // Remove page background for transparency
  await page.evaluate(() => {
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
    // Also remove nav background if any
    const nav = document.querySelector('nav');
    if (nav) nav.style.background = 'transparent';
    // Remove any other backgrounds in the capture area
    const header = document.querySelector('header');
    if (header) header.style.background = 'transparent';
  });

  // Wait for style changes to apply
  await new Promise(r => setTimeout(r, 100));

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const framePath = path.join(FRAMES_TRANSPARENT_DIR, `frame-${String(i).padStart(4, '0')}.png`);
    await page.screenshot({ path: framePath, clip: clip, omitBackground: true });
    if (i % 10 === 0) console.log(`  Frame ${i + 1}/${TOTAL_FRAMES}`);
    await new Promise(r => setTimeout(r, frameDelay));
  }

  console.log('\nCapture complete!');
  console.log(`Regular frames: ${FRAMES_DIR}`);
  console.log(`Transparent frames: ${FRAMES_TRANSPARENT_DIR}`);
  console.log('\nTo create GIFs, run:');
  console.log('  # Regular version');
  console.log(`  cd "${FRAMES_DIR}" && gifski -o ../animated-mascot-400.gif --fps=15 --width=400 frame-*.png`);
  console.log('  # Transparent version');
  console.log(`  cd "${FRAMES_TRANSPARENT_DIR}" && gifski -o ../animated-mascot-400-transparent.gif --fps=15 --width=400 frame-*.png`);

  await browser.close();
}

captureFrames().catch(console.error);
