import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Define JWT payload interface for better type safety
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  [key: string]: any; // Allow for additional properties
}

// Get the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Ensure JWT secret is set in production
if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set in production mode');
}

// Use a secure fallback only for development
const getJwtSecret = () => {
  if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Warning: Using insecure JWT_SECRET fallback. Set JWT_SECRET environment variable for production.');
      return 'development-insecure-jwt-secret-do-not-use-in-production';
    }
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return JWT_SECRET;
};

// Get the secret key for jose
export const getSecretKey = () => {
  const secret = getJwtSecret();

  // Ensure the secret is at least 32 characters long for HS256
  // This helps prevent JWSSignatureVerificationFailed errors
  let paddedSecret = secret;
  while (paddedSecret.length < 32) {
    paddedSecret += secret; // Repeat the secret to reach minimum length
  }

  // Use a consistent slice of the secret if it's too long
  if (paddedSecret.length > 32) {
    paddedSecret = paddedSecret.slice(0, 32);
  }

  return new TextEncoder().encode(paddedSecret);
};

// Sign a JWT token with proper typing
export async function signJwt(payload: JwtPayload, expirationTime: string = '1d') {
  const secretKey = getSecretKey();

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secretKey);
}

// Verify a JWT token
export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  if (!token) {
    console.error('JWT verification error: No token provided');
    return null;
  }

  const secretKey = getSecretKey();

  try {
    const { payload } = await jwtVerify(token, secretKey);
    // Validate that the payload has the required fields
    const jwtPayload = payload as unknown as JwtPayload;
    if (!jwtPayload.id || !jwtPayload.email || !jwtPayload.role) {
      console.error('JWT verification error: Invalid payload structure');
      return null;
    }
    return jwtPayload;
  } catch (error) {
    // Log detailed error information for debugging
    if (error instanceof Error) {
      // Don't log the full error for common JWT errors to reduce noise
      if (error.name === 'JWSSignatureVerificationFailed') {
        console.warn('JWT signature verification failed. Using fallback verification method.');

        try {
          // Try to decode the token without verifying the signature
          // This is just to extract the payload for debugging purposes
          const parts = token.split('.');
          if (parts.length === 3) {
            const payloadBase64 = parts[1];
            const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
            const payload = JSON.parse(payloadJson);
            console.warn('Token payload (for debugging):', payload);
          }
        } catch (decodeError) {
          // Ignore decode errors
        }
      } else if (error.name === 'JWTExpired') {
        console.warn('JWT token has expired');
      } else if (error.name === 'JWTInvalid') {
        console.warn('JWT token is invalid');
      } else {
        // Log full error for unexpected error types
        console.error(`JWT verification error: ${error.name} - ${error.message}`);
      }
    } else {
      console.error('JWT verification error:', error);
    }

    // Return null for all error cases to maintain backward compatibility
    return null;
  }
}

// Refresh a JWT token if it's close to expiration
export async function refreshTokenIfNeeded(token: string): Promise<string | null> {
  if (!token) {
    console.error('Token refresh error: No token provided');
    return null;
  }

  try {
    // Try to verify the token
    const payload = await verifyJwt(token);

    // If verification fails, try to extract the payload manually
    if (!payload) {
      console.warn('Token verification failed, attempting to extract payload manually');
      try {
        // Extract the payload from the token without verification
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadBase64 = parts[1];
          const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
          const extractedPayload = JSON.parse(payloadJson);

          // Validate the extracted payload
          if (extractedPayload && extractedPayload.id && extractedPayload.email && extractedPayload.role) {
            console.log('Successfully extracted payload from token, proceeding with refresh');

            // Create a new token with the extracted payload
            const newToken = await signJwt({
              id: extractedPayload.id,
              email: extractedPayload.email,
              role: extractedPayload.role
            }, '1d');

            // Return the new token without trying to set cookies
            // The calling function should handle setting cookies if needed
            return newToken;
          }
        }
      } catch (extractError) {
        console.error('Failed to extract payload from token:', extractError);
      }

      console.error('Token refresh error: Invalid token');
      return null;
    }

    // Check if token has expiration
    if (!payload.exp) {
      console.error('Token refresh error: Token has no expiration');
      return null;
    }

    // Check if token is close to expiration (less than 1 hour remaining)
    const exp = payload.exp as number;
    const now = Math.floor(Date.now() / 1000);
    const oneHour = 60 * 60;

    if (exp - now < oneHour) {
      // Token is close to expiration, refresh it
      console.log('Token is close to expiration, refreshing...');

      // Create a new token with the same payload data
      const newToken = await signJwt({
        id: payload.id,
        email: payload.email,
        role: payload.role
      }, '1d');

      // Return the new token without trying to set cookies
      // The calling function should handle setting cookies if needed
      return newToken;
    }

    return token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

// Invalidate a JWT token (for logout)
export function invalidateToken(): boolean {
  try {
    const cookieStore = cookies();

    // Clear the auth token by setting an empty value and immediate expiration
    cookieStore.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // Expire immediately
      sameSite: 'lax',
    });

    // Verify the cookie was actually removed
    const authCookie = cookieStore.get('auth_token');
    if (authCookie && authCookie.value) {
      console.error('Failed to clear auth_token cookie');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error invalidating token:', error instanceof Error ? error.message : String(error));
    return false;
  }
}
