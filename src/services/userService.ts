import bcrypt from 'bcryptjs';

import { prisma } from '@/configs/db';
import { sendEmailChangeOtpEmail, sendEmailChangeSuccessEmail } from '@/services/emailService';

export const getUserWithCommerce = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bookings: true,
      orders: {
        include: {
          orderItems: true,
          payments: true,
        },
      },
      cart: {
        include: {
          cartItems: {
            include: {
              product: true,
            },
          },
        },
      },
      addresses: true,
    },
  });

  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: {
    name?: string;
    phone?: string;
  }
) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  });

  return updatedUser;
};

export const initiateEmailChange = async (userId: string, newEmail: string) => {
  const existing = await prisma.user.findUnique({
    where: { email: newEmail },
    select: { id: true },
  });

  if (existing) {
    const error = new Error('Email already in use');
    (error as Error & { status?: number }).status = 409;
    throw error;
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      otp: hashedOtp,
      otpExpiresAt,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  await sendEmailChangeOtpEmail(newEmail, user.name, otp);

  return user;
};

export const confirmEmailChange = async (userId: string, newEmail: string, otp: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.otp || !user.otpExpiresAt) {
    const error = new Error('OTP expired or invalid');
    (error as Error & { status?: number }).status = 400;
    throw error;
  }

  if (new Date() > user.otpExpiresAt) {
    const error = new Error('OTP expired or invalid');
    (error as Error & { status?: number }).status = 400;
    throw error;
  }

  const isValid = await bcrypt.compare(otp, user.otp);
  if (!isValid) {
    const error = new Error('Invalid OTP');
    (error as Error & { status?: number }).status = 400;
    throw error;
  }

  const existing = await prisma.user.findUnique({
    where: { email: newEmail },
    select: { id: true },
  });

  if (existing && existing.id !== userId) {
    const error = new Error('Email already in use');
    (error as Error & { status?: number }).status = 409;
    throw error;
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    const result = await tx.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        otp: null,
        otpExpiresAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    return result;
  });

  await sendEmailChangeSuccessEmail(updatedUser.email, updatedUser.name);

  return updatedUser;
};
