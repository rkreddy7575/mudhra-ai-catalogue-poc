async function testMultiTurn() {
  let conversationId = undefined;

  async function send(message) {
    console.log(`\n>>> Customer: "${message}"`);
    const res = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, message })
    });
    const data = await res.json();
    conversationId = data.conversationId;
    console.log(`<<< Assistant:\n${data.reply}`);
    if (data.suggestedActions) {
      console.log('Suggested Actions:', data.suggestedActions.map(a => a.label).join(' | '));
    }
  }

  // Turn 1
  await send('I need gifts for employees.');

  // Turn 2
  await send('I need 100 gift sets under ₹500.');

  // Turn 3
  await send('I like the first one. Send an enquiry for 200.');

  // Turn 4
  await send('Can you compare XG-GS-037 and XG-GS-059?');
}

testMultiTurn().catch(console.error);
