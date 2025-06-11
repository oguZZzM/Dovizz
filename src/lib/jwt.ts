import { SignJWT, jwtVerify } from 'jose';

// Get the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Ensure JWT secret is set in production
if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set in production mode');
}

// Use a secure fallback only for development
const getJwtSecret = () => {
  if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is not set in production mode');
    }
    console.warn('Warning: Using insecure JWT_SECRET fallback. Set JWT_SECRET environment variable for production.');
    return 'development-insecure-jwt-secret-do-not-use-in-production';
  }
  return JWT_SECRET;
};

// Get the secret key for jose
export const getSecretKey = () => {
  return new TextEncoder().encode(getJwtSecret());
};

// Sign a JWT token
export async function signJwt(payload: any, expirationTime: string = '1d') {
  const secretKey = getSecretKey();
  
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secretKey);
}

// Verify a JWT token
export async function verifyJwt(token: string) {
  const secretKey = getSecretKey();
  
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}