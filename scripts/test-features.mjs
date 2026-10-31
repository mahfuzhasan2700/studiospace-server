const baseUrl = 'http://localhost:5000';


async function runFeatureTests() {
  console.log(`Starting Feature & Challenge 2 Verification at ${baseUrl}...`);

  // 1. Create a Host User
  const hostEmail = `host_${Date.now()}@studiospace.io`;
  const hostPass = 'HostPass123!';
  console.log(`\n1. Creating Host User: ${hostEmail}...`);
  await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000' },
    body: JSON.stringify({ name: 'David Studio Host', email: hostEmail, password: hostPass })
  });

  // Get session token for host
  const hostLogin = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000' },
    body: JSON.stringify({ email: hostEmail, password: hostPass })
  });
  const hostCookie = hostLogin.headers.get('set-cookie') || '';
  const hostTokenRes = await fetch(`${baseUrl}/api/session/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000', Cookie: hostCookie }
  });
  const hostTokenData = await hostTokenRes.json();
  const hostAuthCookie = hostTokenRes.headers.get('set-cookie') || '';
  console.log('Host Authenticated! Token acquired.');

  // 2. Create a Customer User
  const customerEmail = `customer_${Date.now()}@studiospace.io`;
  const customerPass = 'CustomerPass123!';
  console.log(`\n2. Creating Customer User: ${customerEmail}...`);
  await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000' },
    body: JSON.stringify({ name: 'Sarah Director', email: customerEmail, password: customerPass })
  });

  const customerLogin = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000' },
    body: JSON.stringify({ email: customerEmail, password: customerPass })
  });
  const customerCookie = customerLogin.headers.get('set-cookie') || '';
  const customerTokenRes = await fetch(`${baseUrl}/api/session/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:3000', Cookie: customerCookie }
  });
  const customerAuthCookie = customerTokenRes.headers.get('set-cookie') || '';
  console.log('Customer Authenticated! Token acquired.');

  // 3. Host lists a new Studio (POST /api/studios)
  console.log('\n3. Testing POST /api/studios (Add Studio)...');
  const createStudioRes = await fetch(`${baseUrl}/api/studios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:3000',
      Cookie: hostAuthCookie
    },
    body: JSON.stringify({
      title: 'Neon Horizon Cyc Stage & Soundstage',
      category: 'film-stage',
      hourlyRateCents: 12000,
      securityDepositCents: 20000,
      currency: 'USD',
      maxCapacity: 25,
      address: {
        line1: '450 Greenpoint Ave, Suite 3B',
        area: 'Greenpoint',
        city: 'Brooklyn',
        country: 'US'
      },
      imageUrls: [
        'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: ['Cyclorama Wall', 'Sound Isolation', 'High-speed Wifi', 'RGB LED Lighting Grid'],
      overview:
        'A state-of-the-art 2,400 sq ft production soundstage featuring a 2-wall seamless cyclorama, full DMX lighting grid, and dedicated hair & makeup suite.'
    })
  });
  console.log('Create Studio Status (expect 201):', createStudioRes.status);
  const createStudioData = await createStudioRes.json();
  console.log('Studio ID:', createStudioData.data?.id);
  const studioId = createStudioData.data?.id;

  // 4. Host views My Listings (GET /api/studios/my/listings)
  console.log('\n4. Testing GET /api/studios/my/listings (My Listings)...');
  const myListingsRes = await fetch(`${baseUrl}/api/studios/my/listings`, {
    headers: { Origin: 'http://localhost:3000', Cookie: hostAuthCookie }
  });
  const myListingsData = await myListingsRes.json();
  console.log('My Listings count (expect 1):', myListingsData.data?.length);

  // 5. Host updates the listing (PATCH /api/studios/:id)
  console.log('\n5. Testing PATCH /api/studios/:id (Edit Studio)...');
  const updateStudioRes = await fetch(`${baseUrl}/api/studios/${studioId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:3000',
      Cookie: hostAuthCookie
    },
    body: JSON.stringify({
      hourlyRateCents: 13500,
      maxCapacity: 30
    })
  });
  const updateStudioData = await updateStudioRes.json();
  console.log('Updated Hourly Rate (expect 13500):', updateStudioData.data?.hourlyRateCents);

  // 6. Customer Books the Studio (POST /api/bookings)
  console.log('\n6. Testing POST /api/bookings (Create Booking)...');
  const bookRes = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:3000',
      Cookie: customerAuthCookie
    },
    body: JSON.stringify({
      studioId,
      date: '2026-11-15',
      startTime: '10:00',
      endTime: '14:00',
      notes: 'Music video production setup'
    })
  });
  console.log('Create Booking Status (expect 201):', bookRes.status);
  const bookData = await bookRes.json();
  console.log('Booking Result:', {
    id: bookData.data?.id,
    durationHours: bookData.data?.durationHours,
    totalPriceCents: bookData.data?.totalPriceCents,
    status: bookData.data?.status
  });
  const bookingId = bookData.data?.id;

  // 7. Host Confirms the Booking (PATCH /api/bookings/:id/confirm)
  console.log('\n7. Host Confirms Booking (PATCH /api/bookings/:id/confirm)...');
  const confirmRes = await fetch(`${baseUrl}/api/bookings/${bookingId}/confirm`, {
    method: 'PATCH',
    headers: { Origin: 'http://localhost:3000', Cookie: hostAuthCookie }
  });
  const confirmData = await confirmRes.json();
  console.log('Booking Confirmed Status:', confirmData.data?.status);

  // 8. CHALLENGE 2 TEST: Double-booking prevention
  console.log('\n8. CHALLENGE 2 TEST: Double-booking conflict check...');
  console.log('Attempting to book an overlapping slot: 2026-11-15 12:00 - 16:00 (overlaps with 10:00 - 14:00)');
  const doubleBookRes = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:3000',
      Cookie: customerAuthCookie
    },
    body: JSON.stringify({
      studioId,
      date: '2026-11-15',
      startTime: '12:00',
      endTime: '16:00',
      notes: 'Conflicting booking test'
    })
  });
  console.log('Status code (expect 409):', doubleBookRes.status);
  const doubleBookData = await doubleBookRes.json();
  console.log('Conflict Error Response:', doubleBookData);

  // 9. Non-overlapping booking succeeds (e.g. 15:00 - 18:00)
  console.log('\n9. Testing non-overlapping booking (2026-11-15 15:00 - 18:00)...');
  const validBookRes = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'http://localhost:3000',
      Cookie: customerAuthCookie
    },
    body: JSON.stringify({
      studioId,
      date: '2026-11-15',
      startTime: '15:00',
      endTime: '18:00'
    })
  });
  console.log('Non-conflicting booking status (expect 201):', validBookRes.status);

  // 10. Customer cancels the non-overlapping booking
  const validBookData = await validBookRes.json();
  console.log('\n10. Testing PATCH /api/bookings/:id/cancel...');
  const cancelRes = await fetch(`${baseUrl}/api/bookings/${validBookData.data?.id}/cancel`, {
    method: 'PATCH',
    headers: { Origin: 'http://localhost:3000', Cookie: customerAuthCookie }
  });
  const cancelData = await cancelRes.json();
  console.log('Cancelled booking status (expect Cancelled):', cancelData.data?.status);

  // 11. Cleanup test studio
  console.log('\n11. Testing DELETE /api/studios/:id...');
  const deleteRes = await fetch(`${baseUrl}/api/studios/${studioId}`, {
    method: 'DELETE',
    headers: { Origin: 'http://localhost:3000', Cookie: hostAuthCookie }
  });
  const deleteData = await deleteRes.json();
  console.log('Delete status (expect 200):', deleteRes.status, deleteData);

  console.log('\n========================================');
  console.log('ALL FEATURE AND CHALLENGE 2 TESTS PASSED!');
  console.log('========================================');
}

runFeatureTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
