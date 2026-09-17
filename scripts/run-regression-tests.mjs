/**
 * Regression Test Suite for Gemini Sales Assistant
 * Tests 10 specific conversations/questions + 6-turn multi-turn conversation.
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

async function runSingleTest(testNum, title, message, setupMessages = []) {
  console.log(`\n======================================================`);
  console.log(`TEST ${testNum}: ${title}`);
  console.log(`======================================================`);

  let conversationId = undefined;

  // Run any setup messages if context is needed (e.g. for pronouns)
  for (const setup of setupMessages) {
    console.log(`[Setup] Customer: "${setup}"`);
    const setupRes = await sendChat(setup, conversationId);
    conversationId = setupRes.conversationId;
    console.log(`[Setup] Assistant: ${setupRes.reply.slice(0, 100)}...`);
    await sleep(2500);
  }

  console.log(`>>> Customer: "${message}"`);
  const result = await sendChat(message, conversationId);
  console.log(`<<< Assistant:\n${result.reply}`);
  if (result.suggestedActions && result.suggestedActions.length > 0) {
    console.log(`[Suggested Actions]: ${result.suggestedActions.map(a => `${a.label} (${a.type})`).join(' | ')}`);
  }
  if (result.products && result.products.length > 0) {
    console.log(`[Products Attached]: ${result.products.map(p => p.code).join(', ')}`);
  }

  return { conversationId: result.conversationId, reply: result.reply, actions: result.suggestedActions, products: result.products };
}

async function runAllTests() {
  console.log('STARTING GEMINI SALES ASSISTANT REGRESSION SUITE\n');

  // Test 1: Budget inquiry with null prices
  await runSingleTest(1, 'Budget Inquiry Under ₹500', 'I need 100 corporate gift sets under ₹500.');
  await sleep(3000);

  // Test 2: "Premium" water bottles query (guardrail against hallucinating "premium" when unverified)
  await runSingleTest(2, 'Premium Water Bottles Request', 'Show me some premium water bottles.');
  await sleep(3000);

  // Test 3: Product comparison (XG-BT-001 and XG-BT-002)
  await runSingleTest(3, 'Product Comparison', "What's the difference between XG-BT-001 and XG-BT-002?");
  await sleep(3000);

  // Test 4: Specific price check (XG-GS-037)
  await runSingleTest(4, 'Price Check for Specific Code', 'How much is XG-GS-037?');
  await sleep(3000);

  // Test 5: Non-existent product code
  await runSingleTest(5, 'Non-Existent Product Code', 'Do you have XG-XYZ-999?');
  await sleep(3000);

  // Test 6: 250 pieces arrangement
  await runSingleTest(6, 'Quantity Arrangement (250 pieces)', 'I need 250 pieces. Can you arrange that?');
  await sleep(3000);

  // Test 7: Branding enquiry
  await runSingleTest(7, 'Logo Printing / Branding Inquiry', 'Can you print our company logo on them?');
  await sleep(3000);

  // Test 8: Pronoun + Enquiry ("I like this. Send an enquiry for 200 pieces.")
  // We test with prior context showing a product first so "this" has a concrete referent
  await runSingleTest(
    8,
    'Pronoun Resolution & Enquiry Action',
    'I like this. Send an enquiry for 200 pieces.',
    ['Show me water bottle XG-BT-001.']
  );
  await sleep(3000);

  // Test 9: Out of scope request ("Can you book me a hotel?")
  await runSingleTest(9, 'Out of Scope Request', 'Can you book me a hotel?');
  await sleep(3000);

  // Test 10: General opening inquiry ("I need gifts for employees.")
  await runSingleTest(10, 'General Employee Gifting Inquiry', 'I need gifts for employees.');
  await sleep(3000);

  // Multi-Turn Test
  console.log(`\n======================================================`);
  console.log(`MULTI-TURN CONVERSATION TEST (6 TURNS)`);
  console.log(`======================================================`);

  const multiTurnScript = [
    'I need gifts for 100 employees.',
    'Budget is around ₹500 each.',
    'Show me gift sets.',
    'I like the second one.',
    'Can you brand it with our logo?',
    'Okay, send an enquiry for 100.'
  ];

  let multiConvId = undefined;
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
    await sleep(3000);
  }

  console.log('\nALL REGRESSION TESTS COMPLETED SUCCESSFULLY.');
}

runAllTests().catch(err => {
  console.error('\nREGRESSION TEST SUITE ERROR:\n', err);
  process.exit(1);
});
