import fs from 'fs';

const content = fs.readFileSync('mudhra-poc-kit/data/products.csv', 'utf8');
const lines = content.trim().split('\n');
const headers = lines[0].split(',').map(h => h.trim());

const rows = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
  const obj = {};
  headers.forEach((h, idx) => {
    const val = cols[idx];
    obj[h] = val !== undefined && val !== '' ? val : null;
  });
  rows.push(obj);
}

console.log('Total Products Loaded:', rows.length);
console.log('\n--- FIELD STATISTICS (299 PRODUCTS) ---');

const stats = {};
headers.forEach(h => {
  stats[h] = { filled: 0, missing: 0, sampleValues: new Set() };
});

rows.forEach(r => {
  headers.forEach(h => {
    if (r[h] !== null && r[h] !== undefined && r[h] !== '') {
      stats[h].filled++;
      if (stats[h].sampleValues.size < 3) {
        stats[h].sampleValues.add(r[h]);
      }
    } else {
      stats[h].missing++;
    }
  });
});

for (const h of headers) {
  const s = stats[h];
  const pct = ((s.filled / rows.length) * 100).toFixed(1);
  const samples = Array.from(s.sampleValues).join(', ');
  console.log(
    `${h.padEnd(14)}: ${String(s.filled).padStart(3)} / ${rows.length} (${pct.padStart(5)}% present) | Missing: ${String(s.missing).padStart(3)} | Samples: [${samples}]`
  );
}

// Category breakdown
console.log('\n--- CATEGORY BREAKDOWN ---');
const categoryCounts = {};
rows.forEach(r => {
  categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
});
for (const [cat, count] of Object.entries(categoryCounts)) {
  console.log(`${cat.padEnd(20)}: ${count} products`);
}

// Check source page range
const pages = rows.map(r => parseInt(r.source_page, 10)).filter(p => !isNaN(p));
console.log('\n--- SOURCE PAGE RANGE ---');
console.log(`Min Page: ${Math.min(...pages)}, Max Page: ${Math.max(...pages)}`);

// Also check products_review.csv to see what raw text exists
console.log('\n--- INSPECTING products_review.csv FOR OCR EXCERPTS ---');
const reviewContent = fs.readFileSync('mudhra-poc-kit/data/products_review.csv', 'utf8');
const reviewLines = reviewContent.trim().split('\n');
console.log(`Total rows in products_review.csv: ${reviewLines.length - 1}`);

// Sample some review rows with raw_excerpt
const reviewHeaders = reviewLines[0].split(',').map(h => h.trim());
console.log('Headers in review CSV:', reviewHeaders);
