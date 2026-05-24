import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from 'express';

import { prisma } from '@/configs/db';
import {
  sendRegistrationOtpEmail,
  sendRegistrationSuccessEmail,
  sendResetPasswordOtpEmail,
  sendResetPasswordSuccessEmail,
} from '@/services/emailService';
import { verifyGoogleToken, findOrCreateGoogleUser } from '@/services/googleOAuthService';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/tokenUtils';

export const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { name, email, phone, password, role } = req.body;

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      res
        .status(409)
        .json({ success: false, message: 'User already exists with provided email or phone' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        otp: hashedOtp,
        otpExpiresAt,
        otpVerified: false,
        isActive: false,
        role: role || 'customer',
      },
    });

    try {
      await sendRegistrationOtpEmail(email, name, otp);
    } catch (emailError) {
      // Rollback — delete the created user so they are not stuck with an
      // unverifiable account. They can re-register once email is working.
      await prisma.user.delete({ where: { id: user.id } });
      console.error(
        'Failed to send registration OTP email, rolling back user creation:',
        emailError
      );
      res.status(503).json({
        success: false,
        message: 'Unable to send OTP email. Please try again later.',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Registration started. Please verify your email with the OTP sent.',
      userId: user.id,
    });
  } catch (error) {
    next(error);
  }
};

export const confirmRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, otp } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'No account found with this email address' });
      return;
    }

    if (user.otpVerified) {
      res.status(400).json({ success: false, message: 'This account is already verified' });
      return;
    }

    if (!user.otp || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      res
        .status(400)
        .json({ success: false, message: 'OTP has expired. Please request a new one' });
      return;
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again' });
      return;
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    await prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpiresAt: null,
        otpVerified: true,
        isActive: true,
        refreshToken,
        lastLogin: new Date(),
      },
    });

    try {
      await sendRegistrationSuccessEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send registration success email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Account verified successfully.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { identifier, password } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
    });

    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid email/phone or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email/phone or password' });
      return;
    }

    if (!user.isActive) {
      res
        .status(401)
        .json({ success: false, message: 'Account is inactive. Please verify your email first' });
      return;
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        lastLogin: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'No account found with this email address' });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        otp: hashedOtp,
        otpExpiresAt,
      },
    });

    await sendResetPasswordOtpEmail(email, user.name, otp);

    res.status(200).json({ success: true, message: 'OTP sent to your email for password reset' });
  } catch (error) {
    next(error);
  }
};

export const verifyForgotPasswordOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(404).json({ success: false, message: 'No account found with this email address' });
    return;
  }

  if (!user.otp || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
    res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one' });
    return;
  }

  const isOtpValid = await bcrypt.compare(otp, user.otp);
  if (!isOtpValid) {
    res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again' });
    return;
  }

  res.status(200).json({ success: true, message: 'OTP verified successfully' });
};

export const resendRegistrationOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'No account found with this email address' });
      return;
    }

    if (user.otpVerified) {
      res.status(400).json({ success: false, message: 'This account is already verified' });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        otp: hashedOtp,
        otpExpiresAt,
      },
    });

    await sendRegistrationOtpEmail(email, user.name, otp);

    res.status(200).json({ success: true, message: 'New OTP sent to your email' });
  } catch (error) {
    next(error);
  }
};

export const resendForgotPasswordOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(404).json({ success: false, message: 'No account found with this email address' });
    return;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      otp: hashedOtp,
      otpExpiresAt,
    },
  });

  await sendResetPasswordOtpEmail(email, user.name, otp);

  res.status(200).json({ success: true, message: 'New OTP sent to your email' });
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, otp, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(404).json({ success: false, message: 'No account found with this email address' });
    return;
  }

  if (!user.otp || !user.otpExpiresAt || new Date() > user.otpExpiresAt) {
    res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one' });
    return;
  }

  const isOtpValid = await bcrypt.compare(otp, user.otp);
  if (!isOtpValid) {
    res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again' });
    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
      otp: null,
      otpExpiresAt: null,
    },
  });

  await sendResetPasswordSuccessEmail(email, user.name);

  res
    .status(200)
    .json({ success: true, message: 'Password reset successfully. You can now log in.' });
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    const errorMessage = (error as Error).message;
    if (errorMessage.includes('expired')) {
      res.status(401).json({
        success: false,
        message: 'Refresh token has expired. Please log in again.',
        code: 'REFRESH_TOKEN_EXPIRED',
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN',
    });
    return;
  }

  const user = await prisma.user.findFirst({
    where: { refreshToken },
  });

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Refresh token has been revoked. Please log in again.',
      code: 'REFRESH_TOKEN_REVOKED',
    });
    return;
  }

  if (decoded.userId !== user.id) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      code: 'TOKEN_USER_MISMATCH',
    });
    return;
  }

  const newAccessToken = generateAccessToken({ userId: user.id, role: user.role });
  const newRefreshToken = generateRefreshToken({ userId: user.id });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  res.status(200).json({
    success: true,
    message: 'Tokens refreshed successfully',
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
};

export const refreshToken = refreshAccessToken;

export const logout = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  const user = await prisma.user.findFirst({
    where: { refreshToken },
  });

  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: null },
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  try {
    const googleProfile = await verifyGoogleToken(idToken);
    const user = await findOrCreateGoogleUser(googleProfile);

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Google authentication failed';
    res.status(401).json({ success: false, message: errorMessage });
  }
};
