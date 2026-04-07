#!/usr/bin/env node
/**
 * Post-build image optimizer.
 * Converts PNG/JPEG in dist/images to WebP and compresses originals in-place.
 * Run automatically via the "postbuild" npm script.
 */
import { readdir, stat, unlink } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const DIST_IMAGES = 'dist/images';
const AOC_IMAGES = 'dist/aoc';
const MAX_WIDTH = 1920;
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 80;
const PNG_QUALITY_MIN = 65;

async function getImageFiles(dir) {
  const entries = [];
  try {
    const items = await readdir(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        entries.push(...await getImageFiles(fullPath));
      } else if (/\.(png|jpe?g)$/i.test(item.name)) {
        entries.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist, skip
  }
  return entries;
}

async function optimizeImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  const originalStat = await stat(filePath);
  const originalSize = originalStat.size;

  // Skip small images (under 50KB)
  if (originalSize < 50 * 1024) return;

  const image = sharp(filePath);
  const metadata = await image.metadata();

  // Resize if wider than MAX_WIDTH
  const needsResize = metadata.width && metadata.width > MAX_WIDTH;
  const pipeline = needsResize ? image.resize({ width: MAX_WIDTH, withoutEnlargement: true }) : image;

  // Generate WebP version
  const webpPath = filePath.replace(/\.(png|jpe?g)$/i, '.webp');
  await pipeline.clone().webp({ quality: WEBP_QUALITY }).toFile(webpPath);

  // Compress original in-place
  const tempPath = filePath + '.tmp';
  if (ext === '.png') {
    await pipeline.png({ quality: PNG_QUALITY_MIN, compressionLevel: 9, palette: true }).toFile(tempPath);
  } else {
    await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(tempPath);
  }

  // Only replace if we actually saved space
  const newStat = await stat(tempPath);
  if (newStat.size < originalSize) {
    const { rename } = await import('node:fs/promises');
    await rename(tempPath, filePath);
    const saved = ((1 - newStat.size / originalSize) * 100).toFixed(0);
    console.log(`  ${basename(filePath)}: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(newStat.size / 1024 / 1024).toFixed(1)}MB (-${saved}%)`);
  } else {
    await unlink(tempPath);
  }
}

async function main() {
  console.log('Optimizing images...');
  const dirs = [DIST_IMAGES, AOC_IMAGES];
  let total = 0;

  for (const dir of dirs) {
    const files = await getImageFiles(dir);
    total += files.length;
    for (const file of files) {
      try {
        await optimizeImage(file);
      } catch (err) {
        console.warn(`  Warning: Skipped ${basename(file)}: ${err.message}`);
      }
    }
  }

  console.log(`Processed ${total} images`);
}

main().catch(console.error);
