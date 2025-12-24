import admin from 'firebase-admin';

import { prisma } from '@/configs/db';

interface SendNotificationData {
  title: string;
  message: string;
  type: string;
  data?: Record<string, unknown>;
}

interface PaginatedNotifications {
  notifications: {
    id: string;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: Date;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function registerDeviceToken(userId: string, fcmToken: string, platform: string) {
  const existingToken = await prisma.deviceToken.findFirst({
    where: { fcmToken },
  });

  const now = new Date();

  if (existingToken) {
    if (existingToken.userId !== userId) {
      const error = new Error('Token is already registered to a different user');
      (error as Error & { status?: number }).status = 400;
      throw error;
    }

    const updatedToken = await prisma.deviceToken.update({
      where: { id: existingToken.id },
      data: {
        platform,
        isActive: true,
        lastSeen: now,
      },
    });

    return updatedToken;
  }

  const newToken = await prisma.deviceToken.create({
    data: {
      userId,
      fcmToken,
      platform,
      isActive: true,
      lastSeen: now,
    },
  });

  return newToken;
}

export async function unregisterDeviceToken(fcmToken: string) {
  const deleted = await prisma.deviceToken.deleteMany({
    where: { fcmToken },
  });

  return { deletedCount: deleted.count };
}

export async function sendToUser(userId: string, data: SendNotificationData): Promise<void> {
  await createNotificationRecord(userId, data.title, data.message, data.type);

  const tokens = await fetchActiveTokens(userId);

  if (tokens.length === 0) {
    return;
  }

  const payload = buildFcmPayload(data);

  await sendMulticast(tokens, payload);
}

export async function sendToUsers(userIds: string[], data: SendNotificationData): Promise<void> {
  const payload = buildFcmPayload(data);

  for (const userId of userIds) {
    await createNotificationRecord(userId, data.title, data.message, data.type);
  }

  const allTokens = await prisma.deviceToken.findMany({
    where: {
      userId: { in: userIds },
      isActive: true,
    },
    select: { fcmToken: true },
  });

  const tokens = allTokens.map((t) => t.fcmToken);

  if (tokens.length === 0) {
    return;
  }

  await sendMulticast(tokens, payload);
}

async function fetchActiveTokens(userId: string): Promise<string[]> {
  const tokens = await prisma.deviceToken.findMany({
    where: { userId, isActive: true },
    select: { fcmToken: true },
  });

  return tokens.map((t) => t.fcmToken);
}

function buildFcmPayload(
  data: SendNotificationData
): Omit<admin.messaging.MulticastMessage, 'tokens'> {
  const androidConfig: admin.messaging.AndroidConfig = {
    priority: data.type === 'booking' || data.type === 'order' ? 'high' : 'normal',
    notification: {
      channelId: 'default',
      sound: 'default',
    },
  };

  const apnsConfig: admin.messaging.ApnsConfig = {
    payload: {
      aps: {
        badge: 1,
        sound: 'default',
        category: data.type.toUpperCase(),
      },
    },
  };

  return {
    notification: {
      title: data.title,
      body: data.message,
    },
    data: {
      type: data.type,
      ...data.data,
    },
    android: androidConfig,
    apns: apnsConfig,
  };
}

async function sendMulticast(
  tokens: string[],
  payload: Omit<admin.messaging.MulticastMessage, 'tokens'>
): Promise<void> {
  const chunks = chunkArray(tokens, 500);

  for (const chunk of chunks) {
    const message: admin.messaging.MulticastMessage = {
      ...payload,
      tokens: chunk,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    await handleInvalidTokens(response, chunk);
  }
}

async function handleInvalidTokens(
  response: admin.messaging.BatchResponse,
  tokens: string[]
): Promise<void> {
  if (response.failureCount > 0) {
    const invalidTokens: string[] = [];

    response.responses.forEach((resp, idx) => {
      if (
        !resp.success &&
        (resp.error?.code === 'messaging/registration-token-not-registered' ||
          resp.error?.code === 'messaging/invalid-registration-token')
      ) {
        invalidTokens.push(tokens[idx]);
      }
    });

    if (invalidTokens.length > 0) {
      await prisma.deviceToken.updateMany({
        where: { fcmToken: { in: invalidTokens } },
        data: { isActive: false },
      });
    }
  }
}

async function createNotificationRecord(
  userId: string,
  title: string,
  message: string,
  type: string
) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
    },
  });
}

export async function getUserNotifications(
  userId: string,
  page: number,
  limit: number,
  unreadOnly?: boolean
): Promise<PaginatedNotifications> {
  const skip = (page - 1) * limit;

  const where: {
    userId: string;
    isRead?: boolean;
  } = { userId };

  if (unreadOnly) {
    where.isRead = false;
  }

  const total = await prisma.notification.count({ where });

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      isRead: true,
      createdAt: true,
    },
  });

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function markAsRead(userId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    const error = new Error('Notification not found');
    (error as Error & { status?: number }).status = 404;
    throw error;
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return updated;
}

export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  return { updatedCount: result.count };
}

export async function deleteNotification(userId: string, notificationId: string) {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });

  if (!notification) {
    const error = new Error('Notification not found');
    (error as Error & { status?: number }).status = 404;
    throw error;
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  return { message: 'Notification deleted successfully' };
}

export async function cleanupInvalidTokens() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await prisma.deviceToken.deleteMany({
    where: {
      isActive: false,
      lastSeen: { lt: thirtyDaysAgo },
    },
  });

  return { deletedCount: result.count };
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}
