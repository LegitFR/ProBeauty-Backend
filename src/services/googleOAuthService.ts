import { OAuth2Client } from 'google-auth-library';

import { prisma } from '@/configs/db';
import { envConfig } from '@/configs/env';
import admin from '@/configs/firebase';

const GOOGLE_CLIENT_IDS = [
  envConfig.GOOGLE_WEB_CLIENT_ID,
  envConfig.GOOGLE_ANDROID_CLIENT_ID,
  envConfig.GOOGLE_IOS_CLIENT_ID,
].filter(Boolean);

const googleOauthClient = new OAuth2Client();

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

function getJwtIssuer(idToken: string): string | null {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as {
      iss?: unknown;
    };
    return typeof payload.iss === 'string' ? payload.iss : null;
  } catch {
    return null;
  }
}

async function verifyFirebaseGoogleIdToken(idToken: string): Promise<GoogleUserInfo> {
  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Firebase token verification failed: ${message}`);
  }

  if (decoded.firebase?.sign_in_provider !== 'google.com') {
    throw new Error('Google sign-in required');
  }

  const googleSubRaw = decoded.firebase.identities?.['google.com'];
  const googleSub = Array.isArray(googleSubRaw) ? googleSubRaw[0] : undefined;
  if (!googleSub || typeof googleSub !== 'string') {
    throw new Error('Google identity missing from token');
  }

  if (!decoded.email) {
    throw new Error('Email not found in token');
  }

  if (!decoded.email_verified) {
    throw new Error('Email not verified');
  }

  return {
    sub: googleSub,
    email: decoded.email,
    email_verified: Boolean(decoded.email_verified),
    name: decoded.name || decoded.email.split('@')[0],
    picture: decoded.picture,
  };
}

async function verifyNativeGoogleIdToken(idToken: string): Promise<GoogleUserInfo> {
  try {
    const ticket = await googleOauthClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_IDS,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid token payload');
    }

    if (!payload.email_verified) {
      throw new Error('Email not verified by Google');
    }

    if (!payload.email) {
      throw new Error('Email not found in Google token');
    }

    if (!payload.sub) {
      throw new Error('Subject missing from Google token');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Google token verification failed: ${error.message}`);
    }
    throw new Error('Google token verification failed');
  }
}

/**
 * Supports:
 * - Firebase Auth ID tokens (web: signInWithPopup + Google) — issuer securetoken.google.com
 * - Native Google ID tokens (mobile: Google Sign-In SDK) — issuer accounts.google.com
 */
export const verifyGoogleToken = async (idToken: string): Promise<GoogleUserInfo> => {
  const issuer = getJwtIssuer(idToken);
  if (!issuer) {
    throw new Error('Invalid token');
  }

  if (issuer.startsWith('https://securetoken.google.com/')) {
    return verifyFirebaseGoogleIdToken(idToken);
  }

  if (issuer === 'https://accounts.google.com' || issuer === 'accounts.google.com') {
    return verifyNativeGoogleIdToken(idToken);
  }

  throw new Error('Unsupported authentication token');
};

export const findOrCreateGoogleUser = async (googleProfile: GoogleUserInfo) => {
  try {
    // Check if user exists by Google ID
    let user = await prisma.user.findUnique({
      where: { googleId: googleProfile.sub },
    });

    if (user) {
      // Update last login
      user = await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
      return user;
    }

    // Check if user exists by email (for account linking)
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: googleProfile.email },
    });

    if (existingUserByEmail) {
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { id: existingUserByEmail.id },
        data: {
          googleId: googleProfile.sub,
          authProvider: existingUserByEmail.password ? 'both' : 'google',
          lastLogin: new Date(),
          // Activate account if it was previously inactive
          isActive: true,
          otpVerified: true,
        },
      });
      return user;
    }

    // Create new user with Google OAuth
    user = await prisma.user.create({
      data: {
        name: googleProfile.name,
        email: googleProfile.email,
        googleId: googleProfile.sub,
        password: null,
        authProvider: 'google',
        role: 'customer',
        isActive: true,
        otpVerified: true,
        lastLogin: new Date(),
      },
    });

    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to find or create user: ${error.message}`);
    }
    throw new Error('Failed to find or create user');
  }
};
