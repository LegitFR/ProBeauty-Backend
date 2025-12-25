import { z } from 'zod';

export const registerTokenSchema = z.object({
  token: z.string().min(1, 'FCM token is required'),
  platform: z.enum(['ios', 'android', 'web'], {
    errorMap: () => ({ message: 'Platform must be one of: ios, android, web' }),
  }),
});

export const sendNotificationSchema = z.object({
  userIds: z.array(z.string()).min(1, 'At least one user ID is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(500, 'Message must be less than 500 characters'),
  type: z.string().min(1, 'Type is required'),
  data: z.record(z.any()).optional(),
});

export const markAsReadSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID is required'),
});

export const deleteNotificationSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID is required'),
});

export const getNotificationsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  unreadOnly: z.coerce.boolean().optional(),
});
