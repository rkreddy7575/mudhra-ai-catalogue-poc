async function check() {
  const r = await fetch('http://localhost:3000/');
  console.log('Homepage status:', r.status);
  const html = await r.text();
  const regex = /\/_next\/static\/css\/[^"']+/g;
  const matches = html.match(regex);
  console.log('CSS matches:', matches);
  if (matches) {
    for (const m of matches) {
      const cssR = await fetch('http://localhost:3000' + m);
      const text = await cssR.text();
      console.log('CSS URL:', m, 'Status:', cssR.status, 'Bytes:', text.length);
      console.log('First 200 chars of CSS:\n', text.substring(0, 200));
    }
  }
}
check().catch(console.error);
