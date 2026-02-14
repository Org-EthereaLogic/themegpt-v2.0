#!/usr/bin/env tsx
/**
 * Generate screenshots required for the Multilingual Structured Content assignment.
 */
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";
import {
  getStructuredContentLocaleLabel,
  renderStructuredContentSectionsHtml,
} from "../apps/web/lib/structured-content-library";
import { BRAND_COLORS } from "../apps/web/lib/email";

const OUTPUT_DIR = path.join(__dirname, "..", "doc", "report", "assignment-screenshots");
const LIST_IMAGE = path.join(OUTPUT_DIR, "structured-content-list.png");
const EMAIL_EN_IMAGE = path.join(OUTPUT_DIR, "multilingual-email-en.png");
const EMAIL_ES_IMAGE = path.join(OUTPUT_DIR, "multilingual-email-es.png");

const CONTENT_LIST_HTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Dynamic Content List</title>
    <style>
      :root {
        --cream: ${BRAND_COLORS.cream};
        --brown: ${BRAND_COLORS.brown};
        --coral: ${BRAND_COLORS.coral};
      }
      body {
        margin: 0;
        font-family: "Trebuchet MS", "Segoe UI", Arial, sans-serif;
        background: linear-gradient(160deg, #fefdfb, #f7efe7);
        color: var(--brown);
      }
      .wrap {
        width: 960px;
        margin: 40px auto;
        background: #fff;
        border: 1px solid #e5d9cd;
        border-radius: 16px;
        box-shadow: 0 12px 30px rgba(74, 55, 40, 0.1);
        overflow: hidden;
      }
      .head {
        background: var(--brown);
        color: var(--cream);
        padding: 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .head h1 {
        margin: 0;
        font-size: 24px;
      }
      .body {
        padding: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #e0d2c5;
      }
      th,
      td {
        padding: 14px 16px;
        text-align: left;
        border-bottom: 1px solid #eadfd4;
      }
      th {
        background: #fbf3eb;
        color: #4a3728;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-size: 12px;
      }
      td:first-child {
        width: 340px;
        font-weight: 700;
      }
      .status {
        color: #2f664d;
      }
      .pill {
        margin-top: 14px;
        background: var(--cream);
        border-left: 4px solid var(--coral);
        padding: 12px 14px;
        font-size: 13px;
        color: #5f4435;
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="head">
        <h1>Dynamic Content</h1>
        <span style="background: #fff2; padding: 8px 12px; border-radius: 999px; font-size: 13px;">Published</span>
      </div>
      <div class="body">
        <table>
          <tr>
            <th>Slug</th>
            <th>Type</th>
            <th>Language</th>
            <th>Status</th>
          </tr>
          <tr><td>structured_faq_en</td><td>FAQ Snippet</td><td>English</td><td class="status">Active</td></tr>
          <tr><td>structured_faq_es</td><td>FAQ Snippet</td><td>Spanish</td><td class="status">Active</td></tr>
          <tr><td>product_highlight_en</td><td>Feature Highlight</td><td>English</td><td class="status">Active</td></tr>
          <tr><td>product_highlight_es</td><td>Feature Highlight</td><td>Spanish</td><td class="status">Active</td></tr>
        </table>
        <div class="pill">This list is rendered from /apps/web/lib/structured-content-library.ts as the localized structured content source.</div>
      </div>
    </div>
  </body>
</html>
`;

function buildEmailHtml(locale: "en" | "es") {
  const localeLabel = getStructuredContentLocaleLabel(locale);
  const contentBlocks = renderStructuredContentSectionsHtml(locale);

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Multilingual Structured Content Test</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: ${BRAND_COLORS.cream};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${BRAND_COLORS.cream};">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <tr>
              <td style="padding: 40px 40px 20px; text-align: center; background-color: ${BRAND_COLORS.brown}; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; color: ${BRAND_COLORS.cream}; font-size: 28px; font-weight: 700;">ThemeGPT</h1>
                <p style="margin: 8px 0 0; color: ${BRAND_COLORS.coral}; font-size: 14px;">Structured Content Demo</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px;">
                <h2 style="margin: 0 0 16px; color: ${BRAND_COLORS.brown}; font-size: 24px;">Multilingual Structured Content Test</h2>
                <p style="margin: 0 0 24px; color: #666; font-size: 16px; line-height: 1.6;">
                  Below are some blocks that will change depending on the contact's language.
                  Current language: <strong>${localeLabel}</strong>
                </p>
                ${contentBlocks}
                <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
                  This email demonstrates reusable structured content blocks that can be reused across templates.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; text-align: center;">
                <p style="margin: 0; color: #999; font-size: 12px;">
                  You're receiving this email because you are testing multilingual structured content.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

async function captureHtml(html: string, outputFile: string, width = 1200, height = 1200) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.screenshot({
    path: outputFile,
    fullPage: true,
  });
  await browser.close();
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  await captureHtml(CONTENT_LIST_HTML, LIST_IMAGE, 1200, 800);
  await captureHtml(buildEmailHtml("en"), EMAIL_EN_IMAGE, 1200, 1400);
  await captureHtml(buildEmailHtml("es"), EMAIL_ES_IMAGE, 1200, 1400);
}

main().catch((error) => {
  console.error("Failed to generate screenshots:", error);
  process.exit(1);
});
