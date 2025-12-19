/**
 * WebP Image Conversion Script
 * Converts PNG and JPEG images to WebP format for better compression
 * Maintains original files for browser fallback support
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Quality settings (0-100)
  quality: {
    photos: 82,      // For photographs (JPEG sources)
    graphics: 90,    // For UI elements and graphics (PNG sources)
  },
  // Directories to process
  directories: [
    {
      path: './client/public/images',
      type: 'mixed',  // Contains both photos and graphics
    },
    {
      path: './client/src/assets/aoc',
      type: 'graphics',
      recursive: true,
    },
  ],
  // File extensions to convert
  extensions: ['.png', '.jpeg', '.jpg'],
  // Skip files smaller than this (bytes) - very small files may not benefit
  minFileSize: 5000,
};

// Statistics tracking
const stats = {
  processed: 0,
  skipped: 0,
  totalOriginalSize: 0,
  totalWebpSize: 0,
  errors: [],
};

/**
 * Get quality setting based on file type
 */
function getQuality(filePath, dirType) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') {
    return CONFIG.quality.photos;
  }
  return dirType === 'photos' ? CONFIG.quality.photos : CONFIG.quality.graphics;
}

/**
 * Convert a single image to WebP
 */
async function convertToWebp(inputPath, dirType) {
  const ext = path.extname(inputPath).toLowerCase();
  const webpPath = inputPath.replace(/\.(png|jpe?g)$/i, '.webp');

  // Skip if not a target extension
  if (!CONFIG.extensions.includes(ext)) {
    return null;
  }

  // Skip if WebP already exists and is newer
  if (fs.existsSync(webpPath)) {
    const inputStat = fs.statSync(inputPath);
    const webpStat = fs.statSync(webpPath);
    if (webpStat.mtime >= inputStat.mtime) {
      stats.skipped++;
      return null;
    }
  }

  // Get original file size
  const inputStat = fs.statSync(inputPath);
  const originalSize = inputStat.size;

  // Skip very small files
  if (originalSize < CONFIG.minFileSize) {
    stats.skipped++;
    return null;
  }

  const quality = getQuality(inputPath, dirType);

  try {
    await sharp(inputPath)
      .webp({
        quality,
        effort: 4,  // Balanced between speed and compression (0-6)
      })
      .toFile(webpPath);

    const webpStat = fs.statSync(webpPath);
    const webpSize = webpStat.size;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);

    stats.processed++;
    stats.totalOriginalSize += originalSize;
    stats.totalWebpSize += webpSize;

    return {
      input: inputPath,
      output: webpPath,
      originalSize,
      webpSize,
      savings: `${savings}%`,
    };
  } catch (error) {
    stats.errors.push({ file: inputPath, error: error.message });
    return null;
  }
}

/**
 * Get all image files in a directory
 */
function getImageFiles(dir, recursive = false) {
  const files = [];

  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && recursive) {
      files.push(...getImageFiles(fullPath, recursive));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (CONFIG.extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Main conversion function
 */
async function main() {
  console.log('WebP Image Conversion');
  console.log('=====================\n');

  const results = [];

  for (const dir of CONFIG.directories) {
    console.log(`Processing: ${dir.path}`);
    const files = getImageFiles(dir.path, dir.recursive || false);
    console.log(`  Found ${files.length} image files\n`);

    for (const file of files) {
      const result = await convertToWebp(file, dir.type);
      if (result) {
        results.push(result);
        console.log(`  Converted: ${path.basename(file)}`);
        console.log(`    ${formatBytes(result.originalSize)} -> ${formatBytes(result.webpSize)} (${result.savings} smaller)`);
      }
    }
    console.log('');
  }

  // Print summary
  console.log('\n==================');
  console.log('Conversion Summary');
  console.log('==================');
  console.log(`Files converted: ${stats.processed}`);
  console.log(`Files skipped: ${stats.skipped}`);

  if (stats.processed > 0) {
    const totalSavings = ((stats.totalOriginalSize - stats.totalWebpSize) / stats.totalOriginalSize * 100).toFixed(1);
    console.log(`\nTotal original size: ${formatBytes(stats.totalOriginalSize)}`);
    console.log(`Total WebP size: ${formatBytes(stats.totalWebpSize)}`);
    console.log(`Total savings: ${formatBytes(stats.totalOriginalSize - stats.totalWebpSize)} (${totalSavings}%)`);
  }

  if (stats.errors.length > 0) {
    console.log('\nErrors:');
    for (const err of stats.errors) {
      console.log(`  ${err.file}: ${err.error}`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
