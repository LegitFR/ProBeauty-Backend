import jwt from 'jsonwebtoken';

import { envConfig } from '@/configs/env';

const { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } = envConfig;
export interface AccessTokenPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET_KEY, { expiresIn: '3h' });
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, REFRESH_SECRET_KEY, { expiresIn: '15d' });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    // jwt.verify() automatically throws TokenExpiredError if token is expired
    return jwt.verify(token, ACCESS_SECRET_KEY) as AccessTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token has expired');
    }
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    // jwt.verify() automatically throws TokenExpiredError if token is expired
    return jwt.verify(token, REFRESH_SECRET_KEY) as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired');
    }
    throw new Error('Invalid refresh token');
  }
};
