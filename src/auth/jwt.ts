import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { env } from '../config/env.js';

const secretKey = new TextEncoder().encode(env.BETTER_AUTH_SECRET);

export interface ApiJwtPayload extends JWTPayload {
  userId: string;
  email: string;
  name: string;
  image?: string | null;
}

export async function signApiJwt(user: { id: string; email: string; name: string; image?: string | null }): Promise<string> {
  const payload: ApiJwtPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    image: user.image || null
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifyApiJwt(token: string): Promise<ApiJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256']
    });
    return payload as ApiJwtPayload;
  } catch (error) {
    return null;
  }
}

