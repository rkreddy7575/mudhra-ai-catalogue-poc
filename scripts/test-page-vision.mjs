import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

async function testPage(pageJpg, pageNum) {
  const imgData = fs.readFileSync(pageJpg).toString('base64');

  const prompt = `You are a factual catalogue data extraction assistant. Inspect this catalogue page (Page ${pageNum}).
Extract each product printed on this page.
CRITICAL RULES:
1. Extract ONLY what is visibly printed on the page.
2. If name, material, capacity, or price is NOT visibly printed, return null. Do NOT guess.
3. Return JSON:
[
  {
    "code": "XG-...",
    "name": string or null,
    "material": string or null,
    "capacity": string or null,
    "colors": [string] or null,
    "description": string or null,
    "price_inr": number or null,
    "image_region": string
  }
]`;

  const res = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: imgData } }
        ]
      }
    ]
  });

  console.log(`=== Page ${pageNum} Vision Extraction ===`);
  console.log(res.text);
}

async function run() {
  await testPage('scratch_pages/page_3.jpg', 3);
  await testPage('scratch_pages/page_37.jpg', 37);
}

run().catch(console.error);
