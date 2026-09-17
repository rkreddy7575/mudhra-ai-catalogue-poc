/**
 * Update product image_path in Supabase
 * 
 * Scans public/images/products/ for extracted images and updates
 * the image_path column for matching product codes.
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fxeagojjsxmnyxmbicmp.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const IMAGES_DIR = path.resolve('public/images/products');
const BACKUP_PATH = path.resolve('data/products_backup_before_images.json');

async function main() {
  console.log('=== Update Product Image Paths ===\n');

  // 1. Backup current products
  console.log('Step 1: Creating backup...');
  const { data: allProducts, error: fetchErr } = await supabase
    .from('products')
    .select('*')
    .order('code');

  if (fetchErr) {
    console.error('Failed to fetch products:', fetchErr);
    process.exit(1);
  }

  fs.writeFileSync(BACKUP_PATH, JSON.stringify(allProducts, null, 2));
  console.log(`  Backup saved: ${BACKUP_PATH} (${allProducts.length} products)`);

  // 2. Scan available image files
  console.log('\nStep 2: Scanning image files...');
  const imageFiles = fs.readdirSync(IMAGES_DIR)
    .filter(f => f.endsWith('.jpg'))
    .map(f => f.replace('.jpg', ''));

  console.log(`  Found ${imageFiles.length} image files`);

  // 3. Build update map: code -> image_path
  const imageSet = new Set(imageFiles);
  let withImage = 0;
  let withoutImage = 0;
  let updated = 0;
  let errors = 0;

  console.log('\nStep 3: Updating image_path in Supabase...');

  for (const product of allProducts) {
    const imagePath = imageSet.has(product.code)
      ? `/images/products/${product.code}.jpg`
      : null;

    if (imagePath) {
      withImage++;
    } else {
      withoutImage++;
      continue; // Skip products without images
    }

    // Only update if image_path is changing
    if (product.image_path !== imagePath) {
      const { error: updateErr } = await supabase
        .from('products')
        .update({ image_path: imagePath })
        .eq('code', product.code);

      if (updateErr) {
        console.error(`  ERROR updating ${product.code}: ${updateErr.message}`);
        errors++;
      } else {
        updated++;
      }
    }
  }

  // 4. Verification
  console.log('\nStep 4: Verifying...');
  const { data: postProducts, error: postErr } = await supabase
    .from('products')
    .select('code, image_path, data_status');

  if (postErr) {
    console.error('Verification fetch failed:', postErr);
  } else {
    const totalCount = postProducts.length;
    const withImageCount = postProducts.filter(p => p.image_path).length;
    const withoutImageCount = postProducts.filter(p => !p.image_path).length;

    // Check enquiries are intact
    const { count: enquiryCount } = await supabase
      .from('enquiries')
      .select('*', { count: 'exact', head: true });

    console.log(`  Total products:     ${totalCount}`);
    console.log(`  With image_path:    ${withImageCount}`);
    console.log(`  Without image_path: ${withoutImageCount}`);
    console.log(`  Enquiries intact:   ${enquiryCount ?? 'N/A'}`);

    // Status breakdown
    const statusCounts = {};
    postProducts.forEach(p => {
      statusCounts[p.data_status] = (statusCounts[p.data_status] || 0) + 1;
    });
    console.log(`  Status breakdown:   ${JSON.stringify(statusCounts)}`);

    // Check test products
    const testCodes = ['XG-BT-001', 'XG-BT-082', 'XG-MG-004', 'XG-EL-013', 'XG-GS-059', 'XG-ID-033'];
    console.log('\n  Test product image_paths:');
    for (const code of testCodes) {
      const p = postProducts.find(x => x.code === code);
      console.log(`    ${code}: ${p?.image_path || 'NULL'} (${p?.data_status})`);
    }
  }

  // 5. Summary
  console.log('\n=== UPDATE SUMMARY ===');
  console.log(`Products with images:    ${withImage}`);
  console.log(`Products without images: ${withoutImage}`);
  console.log(`Database rows updated:   ${updated}`);
  console.log(`Errors:                  ${errors}`);
  console.log(`Backup file:             ${BACKUP_PATH}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
