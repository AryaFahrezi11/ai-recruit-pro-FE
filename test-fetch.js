const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/applications/123/analyze', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer fake-token'
      }
    });
    console.log("Status:", res.status);
    console.log("Body:", await res.text());
  } catch (e) {
    console.error("Fetch Error:", e.message);
  }
}
test();
