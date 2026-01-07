#!/usr/bin/env node

/**
 * Theme Image Optimization Script
 *
 * Processes theme preview images for optimal web display:
 * - Crops to 16:10 aspect ratio (center crop)
 * - Resizes to consistent dimensions
 * - Converts to WebP with quality 85
 * - Generates multiple size variants for responsive loading
 */

import sharp from "sharp";
import { readdir, mkdir, stat, rm } from "fs/promises";
import { join, basename, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_DIR = join(__dirname, "..", "asset", "images");
const OUTPUT_DIR = join(__dirname, "..", "apps", "web", "public", "themes");

const TARGET_ASPECT_RATIO = 16 / 10; // 1.6
const TARGET_WIDTH = 2560;
const TARGET_HEIGHT = 1600;

const SIZE_VARIANTS = [
  { suffix: "", width: 640, height: 400 }, // Default/mobile
  { suffix: "-md", width: 1280, height: 800 }, // Tablet
  { suffix: "-lg", width: 2560, height: 1600 }, // Desktop/retina
];

const WEBP_QUALITY = 85;
const PNG_QUALITY = 90;

async function getFileSizeKB(filePath) {
  try {
    const stats = await stat(filePath);
    return Math.round(stats.size / 1024);
  } catch {
    return 0;
  }
}

async function processImage(inputPath, outputBasename) {
  const results = [];
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  const { width: srcWidth, height: srcHeight } = metadata;
  const srcAspect = srcWidth / srcHeight;

  // Calculate crop dimensions for 16:10 aspect ratio
  let cropWidth, cropHeight, cropLeft, cropTop;

  if (srcAspect > TARGET_ASPECT_RATIO) {
    // Source is wider - crop sides
    cropHeight = srcHeight;
    cropWidth = Math.round(srcHeight * TARGET_ASPECT_RATIO);
    cropLeft = Math.round((srcWidth - cropWidth) / 2);
    cropTop = 0;
  } else {
    // Source is taller - crop top/bottom
    cropWidth = srcWidth;
    cropHeight = Math.round(srcWidth / TARGET_ASPECT_RATIO);
    cropLeft = 0;
    cropTop = Math.round((srcHeight - cropHeight) / 2);
  }

  // Process each size variant
  for (const variant of SIZE_VARIANTS) {
    const webpFilename = `${outputBasename}${variant.suffix}.webp`;
    const webpPath = join(OUTPUT_DIR, webpFilename);

    await sharp(inputPath)
      .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
      .resize(variant.width, variant.height, {
        fit: "fill",
        kernel: sharp.kernel.lanczos3,
      })
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toFile(webpPath);

    const sizeKB = await getFileSizeKB(webpPath);
    results.push({ file: webpFilename, size: sizeKB });
  }

  // Generate PNG fallback (medium size only)
  const pngFilename = `${outputBasename}.png`;
  const pngPath = join(OUTPUT_DIR, pngFilename);

  await sharp(inputPath)
    .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
    .resize(1280, 800, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .png({ quality: PNG_QUALITY, compressionLevel: 9 })
    .toFile(pngPath);

  const pngSizeKB = await getFileSizeKB(pngPath);
  results.push({ file: pngFilename, size: pngSizeKB });

  return results;
}

async function main() {
  console.log("Theme Image Optimization Script");
  console.log("================================\n");

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Get all PNG files from source directory
  const files = await readdir(SOURCE_DIR);
  const pngFiles = files.filter((f) => extname(f).toLowerCase() === ".png");

  if (pngFiles.length === 0) {
    console.error("No PNG files found in", SOURCE_DIR);
    process.exit(1);
  }

  console.log(`Found ${pngFiles.length} PNG files to process\n`);

  let totalInputSize = 0;
  let totalOutputSize = 0;
  const processedFiles = [];

  for (const file of pngFiles) {
    const inputPath = join(SOURCE_DIR, file);
    const outputBasename = basename(file, ".png");

    const inputSizeKB = await getFileSizeKB(inputPath);
    totalInputSize += inputSizeKB;

    console.log(`Processing: ${file} (${inputSizeKB} KB)`);

    try {
      const results = await processImage(inputPath, outputBasename);
      const outputTotal = results.reduce((sum, r) => sum + r.size, 0);
      totalOutputSize += outputTotal;

      processedFiles.push({
        input: file,
        inputSize: inputSizeKB,
        outputs: results,
        outputTotal,
      });

      console.log(`  -> Generated ${results.length} files (${outputTotal} KB total)`);
    } catch (error) {
      console.error(`  -> ERROR: ${error.message}`);
    }
  }

  // Summary
  console.log("\n================================");
  console.log("Summary");
  console.log("================================\n");

  console.log(`Files processed: ${processedFiles.length}`);
  console.log(`Total input size: ${(totalInputSize / 1024).toFixed(1)} MB`);
  console.log(`Total output size: ${(totalOutputSize / 1024).toFixed(1)} MB`);
  console.log(`Size reduction: ${Math.round((1 - totalOutputSize / totalInputSize) * 100)}%`);

  console.log("\nOutput files per theme:");
  for (const pf of processedFiles.slice(0, 3)) {
    console.log(`  ${pf.input}:`);
    for (const o of pf.outputs) {
      console.log(`    - ${o.file}: ${o.size} KB`);
    }
  }
  console.log("  ...");

  console.log("\nDone!");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
