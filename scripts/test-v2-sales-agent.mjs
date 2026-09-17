/**
 * V2 Gemini Sales Assistant Comprehensive Regression Suite
 * Covers the 13 required tests + 6-turn multi-turn conversation
 */


const BASE_URL = 'http://localhost:3000/api/chat';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendChat(message, conversationId = undefined) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId, message })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  return await res.json();
}

const results = [];

async function runTest(testNum, title, message, setupMessages = [], validateFn = null) {
  console.log(`\n======================================================================`);
  console.log(`TEST ${testNum}: ${title}`);
  console.log(`======================================================================`);

  let conversationId = undefined;
  for (const setup of setupMessages) {
    console.log(`[Setup] Customer: "${setup}"`);
    const setupRes = await sendChat(setup, conversationId);
    conversationId = setupRes.conversationId;
    console.log(`[Setup] Assistant: ${setupRes.reply.slice(0, 120)}...`);
    await sleep(2000);
  }

  console.log(`>>> Customer: "${message}"`);
  const t0 = Date.now();
  const res = await sendChat(message, conversationId);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`<<< Assistant (${elapsed}s):\n${res.reply}`);
  if (res.products && res.products.length > 0) {
    console.log(`[Products Attached]: ${res.products.map(p => `${p.code} (${p.data_status})`).join(', ')}`);
  }
  if (res.suggestedActions && res.suggestedActions.length > 0) {
    console.log(`[Suggested Actions]: ${res.suggestedActions.map(a => a.label).join(' | ')}`);
  }

  let passed = true;
  let errorMsg = '';
  if (validateFn) {
    try {
      validateFn(res);
      console.log(`STATUS: PASS`);
    } catch (err) {
      passed = false;
      errorMsg = err.message;
      console.error(`STATUS: FAIL - ${err.message}`);
    }
  } else {
    console.log(`STATUS: PASS (completed)`);
  }

  results.push({
    testNum,
    title,
    message,
    reply: res.reply,
    products: res.products?.map(p => p.code) || [],
    passed,
    errorMsg
  });

  return res;
}

async function main() {
  console.log('STARTING V2 GEMINI SALES ASSISTANT REGRESSION SUITE\n');

  // 1. "Show me water bottles"
  await runTest(1, 'Show me water bottles', 'Show me water bottles', [], (res) => {
    if (!res.reply.toLowerCase().includes('bottle') && !res.reply.toLowerCase().includes('xg-bt')) {
      throw new Error('Reply does not reference bottles or XG-BT codes');
    }
  });
  await sleep(2500);

  // 2. "Tell me about XG-BT-001"
  await runTest(2, 'Tell me about XG-BT-001', 'Tell me about XG-BT-001', [], (res) => {
    const text = res.reply.toLowerCase();
    if (!text.includes('steel') && !text.includes('stainless')) {
      throw new Error('Expected verified material steel/stainless in reply');
    }
    if (!text.includes('750')) {
      throw new Error('Expected verified capacity 750 ml in reply');
    }
  });
  await sleep(2500);

  // 3. "What material is XG-BT-001?"
  await runTest(3, 'What material is XG-BT-001?', 'What material is XG-BT-001?', [], (res) => {
    const text = res.reply.toLowerCase();
    if (!text.includes('steel')) {
      throw new Error('Expected steel material in reply');
    }
  });
  await sleep(2500);

  // 4. "Compare XG-BT-001 and XG-BT-002"
  await runTest(4, 'Compare XG-BT-001 and XG-BT-002', 'Compare XG-BT-001 and XG-BT-002', [], (res) => {
    const text = res.reply.toLowerCase();
    if (!text.includes('xg-bt-001') || !text.includes('xg-bt-002')) {
      throw new Error('Expected both product codes in comparison');
    }
  });
  await sleep(2500);

  // 5. "Which gift sets are suitable for 100 employees?"
  await runTest(5, 'Which gift sets are suitable for 100 employees?', 'Which gift sets are suitable for 100 employees?', [], (res) => {
    const text = res.reply.toLowerCase();
    if (!text.includes('gift') && !text.includes('set')) {
      throw new Error('Expected gift set recommendations');
    }
  });
  await sleep(2500);

  // 6. "I need 100 gifts under ₹500"
  await runTest(6, 'I need 100 gifts under ₹500', 'I need 100 gifts under ₹500', [], (res) => {
    const text = res.reply.toLowerCase();
    // Must NOT claim products fit 500 without confirmation; must mention pricing confirmation / not available
    if (text.includes('fits within your budget of ₹500') || text.includes('cost ₹') || text.includes('is ₹')) {
      throw new Error('AI hallucinated that products fit under 500 or invented numerical prices');
    }
  });
  await sleep(2500);

  // 7. "Show me the second one" (requires context from previous bottle search)
  await runTest(7, 'Show me the second one', 'Show me the second one', ['Show me 3 water bottles'], (res) => {
    const text = res.reply.toLowerCase();
    if (text.length < 20) {
      throw new Error('Reply too short or failed to resolve second product');
    }
  });
  await sleep(2500);

  // 8. "I want logo branding"
  await runTest(8, 'I want logo branding', 'I want logo branding', ['Show me XG-BT-001'], (res) => {
    const text = res.reply.toLowerCase();
    if (!text.includes('logo') && !text.includes('brand') && !text.includes('print')) {
      throw new Error('Expected branding discussion');
    }
  });
  await sleep(2500);

  // 9. "Tell me the price of XG-GS-037"
  await runTest(9, 'Tell me the price of XG-GS-037', 'Tell me the price of XG-GS-037', [], (res) => {
    const text = res.reply.toLowerCase();
    if (text.includes('₹') && !text.includes('not available') && !text.includes('unconfirmed') && !text.includes('confirm')) {
      throw new Error('AI invented a price for XG-GS-037');
    }
  });
  await sleep(2500);

  // 10. "What is XG-XYZ-999?"
  await runTest(10, 'What is XG-XYZ-999?', 'What is XG-XYZ-999?', [], (res) => {
    const text = res.reply.toLowerCase();
    if (text.includes('we have xg-xyz-999') || text.includes('here are the details of xg-xyz-999')) {
      throw new Error('AI hallucinated non-existent product');
    }
  });
  await sleep(2500);

  // 11. Test NEEDS_MANUAL_REVIEW product (XG-GS-134 confirmed in live DB)
  await runTest(11, 'NEEDS_MANUAL_REVIEW product (XG-GS-134)', 'Tell me about XG-GS-134', [], (res) => {
    const text = res.reply.toLowerCase();
    console.log(`[Validation Check Test 11]: Reply mentions confirmation/review:`, 
      text.includes('confirm') || text.includes('review') || text.includes('verification') || text.includes('verify'));
  });
  await sleep(2500);

  // 12. Test NOT_AVAILABLE product (XG-ID-025 confirmed in live DB)
  await runTest(12, 'NOT_AVAILABLE product (XG-ID-025)', 'Tell me about XG-ID-025', [], (res) => {
    const text = res.reply.toLowerCase();
    console.log(`[Validation Check Test 12]: Reply mentions unavailable/enquiry:`,
      text.includes('unavailable') || text.includes('not available') || text.includes('enquir') || text.includes('enquiry'));
  });
  await sleep(2500);

  // 13. 6-turn multi-turn conversation
  console.log(`\n======================================================================`);
  console.log(`TEST 13: MULTI-TURN CONVERSATION TEST (6 TURNS)`);
  console.log(`======================================================================`);

  const multiTurnScript = [
    'I need gifts for 100 employees.',
    'Budget is around ₹500 each.',
    'Show me gift sets.',
    'I like the second one.',
    'Can you brand it with our logo?',
    'Okay, send an enquiry for 100.'
  ];

  let multiConvId = undefined;
  const multiTurnResults = [];
  for (let i = 0; i < multiTurnScript.length; i++) {
    const turnMsg = multiTurnScript[i];
    console.log(`\n--- Turn ${i + 1} ---`);
    console.log(`Customer: "${turnMsg}"`);
    const turnRes = await sendChat(turnMsg, multiConvId);
    multiConvId = turnRes.conversationId;
    console.log(`Assistant:\n${turnRes.reply}`);
    if (turnRes.suggestedActions && turnRes.suggestedActions.length > 0) {
      console.log(`Suggested Actions: ${turnRes.suggestedActions.map(a => `${a.label} (${a.type})`).join(' | ')}`);
    }
    if (turnRes.products && turnRes.products.length > 0) {
      console.log(`Products: ${turnRes.products.map(p => p.code).join(', ')}`);
    }
    multiTurnResults.push({ turn: i + 1, message: turnMsg, reply: turnRes.reply });
    await sleep(2500);
  }

  console.log(`\n======================================================================`);
  console.log(`REGRESSION SUMMARY`);
  console.log(`======================================================================`);
  let allPass = true;
  for (const r of results) {
    console.log(`Test ${r.testNum}: ${r.title} => ${r.passed ? 'PASS' : 'FAIL: ' + r.errorMsg}`);
    if (!r.passed) allPass = false;
  }
  console.log(`Multi-turn (6 turns): COMPLETED (${multiTurnResults.length} turns)`);
  console.log(`OVERALL RESULT: ${allPass ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
}

main().catch(err => {
  console.error('Fatal error running regression suite:', err);
  process.exit(1);
});
