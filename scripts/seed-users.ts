import dotenv from 'dotenv';
dotenv.config();

import { auth } from '../src/auth/auth.js';
import { getDb, connectDb } from '../src/config/db.js';

async function seedExaminerAccounts() {
  console.log('Connecting to database to seed examiner test accounts...');
  await connectDb();
  const db = getDb();

  const accounts = [
    {
      name: 'Studio Space Host',
      email: 'host@studiospace.io',
      password: 'Host1234!'
    },
    {
      name: 'Creative Director',
      email: 'creator@studiospace.io',
      password: 'Creator1234!'
    }
  ];

  for (const acc of accounts) {
    const existing = await db.collection('user').findOne({ email: acc.email });
    if (existing) {
      console.log(`Account ${acc.email} already exists in database.`);
    } else {
      try {
        await auth.api.signUpEmail({
          body: {
            name: acc.name,
            email: acc.email,
            password: acc.password
          }
        });
        console.log(`Successfully created examiner account: ${acc.email}`);
      } catch (err: any) {
        console.warn(`Note for ${acc.email}:`, err?.message || err);
      }
    }
  }

  console.log('Examiner test accounts seeded successfully!');
  process.exit(0);
}

seedExaminerAccounts().catch((err) => {
  console.error('Failed to seed examiner accounts:', err);
  process.exit(1);
});

