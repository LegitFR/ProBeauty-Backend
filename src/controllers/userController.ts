import type { Request, Response, NextFunction } from 'express';

import {
  confirmEmailChange,
  getUserWithCommerce,
  initiateEmailChange,
  updateUserProfile,
} from '@/services/userService';

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await getUserWithCommerce(req.user.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, phone } = req.body as { name?: string; phone?: string };

    const updatedUser = await updateUserProfile(req.user.id, { name, phone });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const requestEmailChange = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { newEmail } = req.body as { newEmail: string };

    await initiateEmailChange(req.user.id, newEmail);

    res.status(200).json({
      message: 'OTP sent to new email for confirmation',
    });
  } catch (error) {
    next(error);
  }
};

export const confirmEmailChangeController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { newEmail, otp } = req.body as { newEmail: string; otp: string };

    const updatedUser = await confirmEmailChange(req.user.id, newEmail, otp);

    res.status(200).json({
      message: 'Email updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
