import type { Request, Response, NextFunction } from 'express';

import * as notificationService from '@/services/notificationService';

export const registerDeviceToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { token, platform } = req.body as { token: string; platform: string };

    const deviceToken = await notificationService.registerDeviceToken(req.user.id, token, platform);

    res.status(200).json({
      message: 'Device token registered successfully',
      deviceToken,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await notificationService.getUserNotifications(
      req.user.id,
      page,
      limit,
      unreadOnly
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { notificationId } = req.params;

    const notification = await notificationService.markAsRead(req.user.id, notificationId);

    res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const result = await notificationService.markAllAsRead(req.user.id);

    res.status(200).json({
      message: 'All notifications marked as read',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { notificationId } = req.params;

    const result = await notificationService.deleteNotification(req.user.id, notificationId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
