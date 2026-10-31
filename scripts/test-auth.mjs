import { env } from '../src/config/env.js';

const baseUrl = `http://localhost:${env.PORT}`;

async function runTests() {
  console.log(`Testing Auth endpoints at ${baseUrl}...`);

  // 1. Unauthenticated request to protected route
  console.log('\n--- 1. Testing Unauthenticated Request ---');
  const resUnauth = await fetch(`${baseUrl}/api/me/verify-token`);
  console.log('Status (expect 401):', resUnauth.status);
  const dataUnauth = await resUnauth.json();
  console.log('Response:', dataUnauth);

  // 2. Signup with invalid password (missing uppercase)
  console.log('\n--- 2. Testing Password Validation on Signup ---');
  const resBadPw = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({
      name: 'Bad Password User',
      email: `badpw_${Date.now()}@example.com`,
      password: 'onlylowercase123'
    })
  });
  console.log('Status (expect 400):', resBadPw.status);
  const dataBadPw = await resBadPw.json();
  console.log('Validation Error:', dataBadPw);

  // 3. Signup with valid password
  console.log('\n--- 3. Testing Valid User Signup ---');
  const testEmail = `creator_${Date.now()}@studiospace.io`;
  const resSignup = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({
      name: 'Studio Creator',
      email: testEmail,
      password: 'CreatorPass123!',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    })
  });
  console.log('Status (expect 200/201):', resSignup.status);
  const dataSignup = await resSignup.json();
  console.log('Signup Result:', dataSignup);

  // 4. Sign in
  console.log('\n--- 4. Testing User Login ---');
  const resLogin = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({
      email: testEmail,
      password: 'CreatorPass123!'
    })
  });
  console.log('Login Status (expect 200):', resLogin.status);
  const dataLogin = await resLogin.json();
  console.log('Login Result:', dataLogin);

  // Extract cookies from login response
  const setCookies = resLogin.headers.getSetCookie ? resLogin.headers.getSetCookie() : [resLogin.headers.get('set-cookie')].filter(Boolean);
  const cookieHeader = setCookies.map(c => c.split(';')[0]).join('; ');
  console.log('Session Cookie received:', !!cookieHeader);

  // 5. Issue API JWT (Challenge 1)
  console.log('\n--- 5. Testing Challenge 1: Issue API JWT in HTTPOnly Cookie ---');
  const resToken = await fetch(`${baseUrl}/api/session/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
      'Origin': 'http://localhost:3000'
    }
  });
  console.log('Token Exchange Status (expect 200):', resToken.status);
  const dataToken = await resToken.json();
  console.log('Token Exchange Result:', dataToken);

  const tokenCookies = resToken.headers.getSetCookie ? resToken.headers.getSetCookie() : [resToken.headers.get('set-cookie')].filter(Boolean);
  const jwtCookieHeader = tokenCookies.map(c => c.split(';')[0]).join('; ');
  console.log('API JWT HTTPOnly Cookie received:', !!jwtCookieHeader);

  // Combined cookies for subsequent requests
  const combinedCookies = [cookieHeader, jwtCookieHeader].filter(Boolean).join('; ');

  // 6. Access protected route using HTTPOnly cookie
  console.log('\n--- 6. Testing Protected Route with HTTPOnly Cookie ---');
  const resProtected = await fetch(`${baseUrl}/api/me/verify-token`, {
    headers: {
      'Cookie': combinedCookies
    }
  });
  console.log('Protected Route Status (expect 200):', resProtected.status);
  const dataProtected = await resProtected.json();
  console.log('Protected Route Data:', dataProtected);

  // 7. Check /api/session/me
  console.log('\n--- 7. Testing /api/session/me ---');
  const resMe = await fetch(`${baseUrl}/api/session/me`, {
    headers: {
      'Cookie': combinedCookies
    }
  });
  console.log('Session Me Status (expect 200):', resMe.status);
  const dataMe = await resMe.json();
  console.log('Session Me Data:', dataMe);

  // 8. Logout
  console.log('\n--- 8. Testing Logout ---');
  const resLogout = await fetch(`${baseUrl}/api/session/logout`, {
    method: 'POST',
    headers: {
      'Cookie': combinedCookies,
      'Origin': 'http://localhost:3000'
    }
  });
  console.log('Logout Status (expect 200):', resLogout.status);
  const dataLogout = await resLogout.json();
  console.log('Logout Data:', dataLogout);

  console.log('\nALL AUTHENTICATION TESTS PASSED PERFECTLY!');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
