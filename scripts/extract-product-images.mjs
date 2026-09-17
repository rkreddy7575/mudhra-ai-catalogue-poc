/**
 * Extract Product Images from Catalogue Page JPGs
 * 
 * Uses pre-rendered page JPGs from scratch_pages/ and image_region metadata
 * from products_enriched_v2.csv to crop individual product images.
 * 
 * Output: public/images/products/{code}.jpg
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sharp = require('sharp');

const PAGES_DIR = path.resolve('scratch_pages');
const OUTPUT_DIR = path.resolve('public/images/products');
const CSV_PATH = path.resolve('data/products_enriched_v2.csv');
const CROP_SIZE = 400; // Target output size in pixels

// Supabase client
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://fxeagojjsxmnyxmbicmp.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// ============================================================
// Parse image_region from CSV (handles multi-line fields)
// ============================================================
function parseImageRegions() {
  const text = fs.readFileSync(CSV_PATH, 'utf8');
  const regions = {};
  
  // Match: code at line start, then find image_region value
  // CSV columns: code,category,name,description,material,capacity,colors,price_inr,source_page,source_code,image_region,...
  const validRegions = new Set([
    'top-left', 'top-right',
    'middle-left', 'middle-right', 
    'bottom-left', 'bottom-right',
    'top', 'middle', 'bottom',
    'left', 'right', 'center', 'full'
  ]);

  // Simple approach: find product codes and their image_region
  const lines = text.split('\n');
  let currentCode = null;
  
  for (const line of lines) {
    // Check if line starts with a product code
    const codeMatch = line.match(/^(XG-[A-Z]+-\d+),/);
    if (codeMatch) {
      currentCode = codeMatch[1];
      // Try to find image_region in this line
      for (const region of validRegions) {
        if (line.includes(region)) {
          regions[currentCode] = region;
          break;
        }
      }
    }
  }
  
  return regions;
}

// ============================================================
// Grid crop coordinates for 2x3 catalogue layout
// ============================================================
function getCropRegion(region, pageWidth, pageHeight) {
  // Catalogue pages use roughly:
  // - Top ~8% is header/banner
  // - Bottom ~5% is footer
  // - Content area is divided into 2 columns x 3 rows
  
  const headerFrac = 0.06;   // Skip top header
  const footerFrac = 0.04;   // Skip bottom footer
  const colPadding = 0.02;   // Padding between columns
  
  const contentTop = Math.floor(pageHeight * headerFrac);
  const contentBottom = Math.floor(pageHeight * (1 - footerFrac));
  const contentHeight = contentBottom - contentTop;
  
  const halfW = Math.floor(pageWidth / 2);
  const rowH = Math.floor(contentHeight / 3);
  
  const gridMap = {
    'top-left':      { left: 0,     top: contentTop,              width: halfW, height: rowH },
    'top-right':     { left: halfW, top: contentTop,              width: halfW, height: rowH },
    'middle-left':   { left: 0,     top: contentTop + rowH,       width: halfW, height: rowH },
    'middle-right':  { left: halfW, top: contentTop + rowH,       width: halfW, height: rowH },
    'bottom-left':   { left: 0,     top: contentTop + 2 * rowH,   width: halfW, height: rowH },
    'bottom-right':  { left: halfW, top: contentTop + 2 * rowH,   width: halfW, height: rowH },
    // Fallback positions for non-standard regions
    'top':           { left: 0,     top: contentTop,              width: pageWidth, height: rowH },
    'middle':        { left: 0,     top: contentTop + rowH,       width: pageWidth, height: rowH },
    'bottom':        { left: 0,     top: contentTop + 2 * rowH,   width: pageWidth, height: rowH },
    'left':          { left: 0,     top: contentTop,              width: halfW, height: contentHeight },
    'right':         { left: halfW, top: contentTop,              width: halfW, height: contentHeight },
    'center':        { left: Math.floor(pageWidth * 0.15), top: contentTop + Math.floor(rowH * 0.5), 
                       width: Math.floor(pageWidth * 0.7), height: rowH },
    'full':          { left: 0,     top: contentTop,              width: pageWidth, height: contentHeight },
  };
  
  return gridMap[region] || null;
}

// ============================================================
// Main extraction
// ============================================================
async function main() {
  console.log('=== Product Image Extraction ===\n');
  
  // 1. Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }
  
  // 2. Get all products from Supabase
  const { data: products, error } = await supabase
    .from('products')
    .select('code, source_page, category')
    .eq('active', true)
    .order('source_page')
    .order('code');
  
  if (error) {
    console.error('Failed to fetch products:', error);
    process.exit(1);
  }
  
  console.log(`Products to process: ${products.length}`);
  
  // 3. Parse image regions from CSV
  const regions = parseImageRegions();
  console.log(`Image regions parsed: ${Object.keys(regions).length}`);
  
  // 4. Process each product
  let extracted = 0;
  let noRegion = 0;
  let noPage = 0;
  let errors = 0;
  const results = [];
  
  // Cache page metadata to avoid repeated reads
  const pageMetaCache = {};
  
  for (const product of products) {
    const { code, source_page } = product;
    const region = regions[code];
    const pageFile = path.join(PAGES_DIR, `page_${source_page}.jpg`);
    
    if (!fs.existsSync(pageFile)) {
      console.log(`  SKIP ${code}: page_${source_page}.jpg not found`);
      noPage++;
      results.push({ code, source_page, status: 'no_page_file' });
      continue;
    }
    
    try {
      // Get page dimensions (cached)
      if (!pageMetaCache[source_page]) {
        const meta = await sharp(pageFile).metadata();
        pageMetaCache[source_page] = { width: meta.width, height: meta.height };
      }
      const { width: pw, height: ph } = pageMetaCache[source_page];
      
      let cropRect;
      if (region) {
        cropRect = getCropRegion(region, pw, ph);
      }
      
      if (!cropRect) {
        // No region data — use full page as fallback (center crop)
        noRegion++;
        // For products without region, use the full content area
        cropRect = getCropRegion('full', pw, ph);
      }
      
      // Clamp crop coordinates to image bounds
      cropRect.left = Math.max(0, Math.min(cropRect.left, pw - 1));
      cropRect.top = Math.max(0, Math.min(cropRect.top, ph - 1));
      cropRect.width = Math.min(cropRect.width, pw - cropRect.left);
      cropRect.height = Math.min(cropRect.height, ph - cropRect.top);
      
      // Extract and resize
      const outputPath = path.join(OUTPUT_DIR, `${code}.jpg`);
      await sharp(pageFile)
        .extract(cropRect)
        .resize(CROP_SIZE, CROP_SIZE, {
          fit: 'cover',
          position: 'centre'
        })
        .jpeg({ quality: 82, progressive: true })
        .toFile(outputPath);
      
      extracted++;
      results.push({ code, source_page, region: region || 'full-page-fallback', status: 'ok' });
      
      if (extracted % 50 === 0) {
        console.log(`  Extracted ${extracted} images...`);
      }
    } catch (err) {
      console.error(`  ERROR ${code}: ${err.message}`);
      errors++;
      results.push({ code, source_page, region, status: 'error', error: err.message });
    }
  }
  
  // 5. Summary
  console.log('\n=== EXTRACTION SUMMARY ===');
  console.log(`Total products:       ${products.length}`);
  console.log(`Images extracted:     ${extracted}`);
  console.log(`No region (fallback): ${noRegion}`);
  console.log(`No page file:         ${noPage}`);
  console.log(`Errors:               ${errors}`);
  
  // Check output directory
  const outputFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.jpg'));
  console.log(`\nFiles in output dir:  ${outputFiles.length}`);
  
  // Calculate total size
  let totalBytes = 0;
  for (const f of outputFiles) {
    totalBytes += fs.statSync(path.join(OUTPUT_DIR, f)).size;
  }
  console.log(`Total size:           ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Avg per image:        ${outputFiles.length > 0 ? (totalBytes / outputFiles.length / 1024).toFixed(1) : 0} KB`);
  
  // Save results log
  const logPath = path.resolve('data/image_extraction_log.json');
  fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
  console.log(`\nExtraction log saved: ${logPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
