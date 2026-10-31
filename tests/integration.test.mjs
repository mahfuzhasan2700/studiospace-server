import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_API_URL || 'https://studiospace-server-theta.vercel.app';

console.log('========================================================');
console.log('🚀 STUDIOSPACE AUTOMATED BACKEND INTEGRATION TEST SUITE');
console.log(`Target API: ${BASE_URL}`);
console.log('========================================================\n');

let passCount = 0;
let failCount = 0;

async function runTest(testName, fn) {
  process.stdout.write(`• Testing: ${testName.padEnd(48)} ... `);
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    console.log(`✅ PASS (${duration}ms)`);
    passCount++;
  } catch (err) {
    const duration = Date.now() - start;
    console.log(`❌ FAIL (${duration}ms)`);
    console.error(`  Error: ${err.message}`);
    failCount++;
  }
}

async function runSuite() {
  // Test 1: Health Endpoint
  await runTest('GET /api/health returns HTTP 200 and ok', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.status, 'ok');
  });

  // Test 2: Public Studio List
  let sampleStudio = null;
  await runTest('GET /api/studios returns paginated studio list', async () => {
    const res = await fetch(`${BASE_URL}/api/studios?limit=10`);
    assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert.ok(Array.isArray(json.data), 'Expected json.data to be an array');
    assert.ok(json.data.length > 0, 'Expected at least 1 studio');
    assert.ok(json.meta, 'Expected pagination meta');
    assert.equal(typeof json.meta.total, 'number');
    sampleStudio = json.data[0];
  });

  // Test 3: Featured Studios
  await runTest('GET /api/studios/featured returns max 6 studios', async () => {
    const res = await fetch(`${BASE_URL}/api/studios/featured`);
    assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert.ok(Array.isArray(json.data));
    assert.ok(json.data.length <= 6);
  });

  // Test 4: Single Studio Detail
  await runTest('GET /api/studios/:id returns detailed studio specs', async () => {
    assert.ok(sampleStudio, 'Sample studio must exist from prior test');
    const res = await fetch(`${BASE_URL}/api/studios/${sampleStudio.id}`);
    assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert.equal(json.data.id, sampleStudio.id);
    assert.ok(json.data.overview, 'Expected studio overview');
    assert.ok(json.data.host, 'Expected host metadata');
  });

  // Test 5: Category Filtering
  await runTest('GET /api/studios?category=photo-studio filters results', async () => {
    const res = await fetch(`${BASE_URL}/api/studios?category=photo-studio`);
    assert.equal(res.status, 200);
    const json = await res.json();
    for (const item of json.data) {
      assert.equal(item.category, 'photo-studio');
    }
  });

  // Test 6: BetterAuth Sign-In
  let authCookie = null;
  await runTest('POST /api/auth/sign-in/email returns HTTPOnly cookie', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://studiospace-client-eight.vercel.app'
      },
      body: JSON.stringify({
        email: 'creator@studiospace.io',
        password: 'Creator1234!'
      })
    });
    assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie, 'Expected Set-Cookie header');
    assert.match(setCookie.toLowerCase(), /httponly/, 'Expected HttpOnly flag');
    authCookie = setCookie.split(';')[0];
  });

  // Test 7: Double-Booking Conflict Prevention (Challenge 2)
  await runTest('Challenge 2: Reject unauthenticated booking request', async () => {
    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studioId: sampleStudio.id,
        date: '2026-11-20',
        startTime: '10:00',
        endTime: '12:00'
      })
    });
    // Must be rejected with 401 Unauthorized or 403 Forbidden
    assert.ok(res.status === 401 || res.status === 403, `Expected 401/403, got ${res.status}`);
  });

  console.log('\n========================================================');
  console.log(`TEST SUITE RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('========================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runSuite();
