import { OAuth2Client } from 'google-auth-library';

import { prisma } from '@/configs/db';
import { envConfig } from '@/configs/env';

const GOOGLE_CLIENT_IDS = [
  envConfig.GOOGLE_WEB_CLIENT_ID,
  envConfig.GOOGLE_ANDROID_CLIENT_ID,
].filter(Boolean);

const client = new OAuth2Client();

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

export const verifyGoogleToken = async (idToken: string): Promise<GoogleUserInfo> => {
  try {
    const ticket = await client.verifyIdToken({
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
