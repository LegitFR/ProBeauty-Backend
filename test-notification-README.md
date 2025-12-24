# Push Notification Test Script

This script allows you to test the push notification system by registering an FCM token and sending a test notification to a device.

## Prerequisites

- FCM Token from your mobile/web app
- Valid User ID from the database
- Database connection configured

## Usage

```bash
bun run test:notification <userId> <fcmToken> [platform]
```

### Arguments

| Argument   | Required | Description            | Example                                |
| ---------- | -------- | ---------------------- | -------------------------------------- | ----- | ----- |
| `userId`   | Yes      | User ID (cuid)         | `clx123abc456def`                      |
| `fcmToken` | Yes      | FCM registration token | `"cLhY3kC-4hXq6gJY5fZ6X:APA91bHj7..."` |
| `platform` | No       | Platform: `ios`        | `android`                              | `web` | `ios` |

## Examples

### iOS Device

```bash
bun run test:notification clx123abc456def "cLhY3kC-4hXq6gJY5fZ6X:APA91bHj7..." ios
```

### Android Device

```bash
bun run test:notification clx123abc456def "cLhY3kC-4hXq6gJY5fZ6X:APA91bHj7..." android
```

### Web Browser

```bash
bun run test:notification clx123abc456def "cLhY3kC-4hXq6gJY5fZ6X:APA91bHj7..." web
```

## How to Get FCM Token

### React Native (iOS/Android)

```javascript
import { getMessaging, getToken } from '@react-native-firebase/messaging';

const messaging = getMessaging();
const fcmToken = await getToken(messaging);
console.log('FCM Token:', fcmToken);
```

### React Web

```javascript
import { getMessaging, getToken } from 'firebase/messaging';

const messaging = getMessaging();
const fcmToken = await getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' });
console.log('FCM Token:', fcmToken);
```

### Flutter

```dart
import 'package:firebase_messaging/firebase_messaging.dart';

final fcmToken = await FirebaseMessaging.instance.getToken();
print('FCM Token: $fcmToken');
```

## How to Get User ID

### Option 1: From API Response

```bash
# Login to get user ID
curl -X POST https://api.probeauty.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

### Option 2: From Database

```bash
# Using Prisma Studio
bun run prisma:studio

# Navigate to User table and copy the ID
```

## What the Script Does

1. **Registers Device Token**: Stores the FCM token in the database linked to the user
2. **Verifies User**: Checks that the user exists in the database
3. **Sends Test Notification**: Sends a test notification via Firebase Cloud Messaging
4. **Creates Database Record**: Stores the notification in the `notifications` table
5. **Verifies Delivery**: Checks Firebase delivery response

## Output Example

```
🔔 ProBeauty Push Notification Test
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test Configuration:
  User ID:   clx123abc456def
  FCM Token:  cLhY3kC-4hXq6gJY5fZ6X:APA91bHj7...
  Platform:   ios

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Registering device token...
✅ Device token registered successfully!
   Token ID: clx789ghi012jkl

Step 2: Verifying user...
✅ User verified: John Doe (john@example.com)

Step 3: Sending test notification...
✅ Test notification sent successfully!

Step 4: Verifying notification in database...
✅ Notification found in database:
   ID:        clx456mno789pqr
   Title:     🧪 Test Notification
   Message:   This is a test push notification from ProBeauty backend...
   Type:      promotion
   Created:   2025-12-24T12:00:00.000Z

Step 5: Checking FCM response...
✅ Direct FCM test successful!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Test completed successfully!

Next steps:
  1. Check your device for test notification
  2. Check your device notification history
  3. Verify Firebase console for delivery status
  4. Use GET /notifications API to fetch notifications
```

## Troubleshooting

### Error: User with ID not found

- Verify the user ID is correct
- Check that the user exists in the database

### Error: Token is already registered to a different user

- Each FCM token can only belong to one user
- Unregister the token from the previous user or use a new token

### Error: FCM token is not registered

- The FCM token is invalid or expired
- Generate a new FCM token from your app
- Ensure your app is properly configured with Firebase

### Error: Invalid platform value

- Platform must be one of: `ios`, `android`, `web`

### No notification received on device

1. Check device notification settings are enabled
2. Verify the app is in foreground or background properly
3. Check Firebase console for delivery logs
4. Ensure the app has permission to show notifications
5. Check that the FCM token is current (tokens expire)

## Viewing Sent Notifications

After running the test, you can fetch all notifications via the API:

```bash
curl -X GET https://api.probeauty.com/api/v1/notifications \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Firebase Console

Monitor your notifications in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Cloud Messaging** > **Reports**
4. Check delivery, open, and engagement rates

## Support

For issues with the test script, check:

- Backend logs: Check console output for detailed error messages
- Database: Verify tokens and notifications in the database
- Firebase: Check FCM configuration in Firebase Console

```javascript

import 'dotenv/config';
import admin from 'firebase-admin';

import './src/configs/firebase.js';
import { prisma } from './src/configs/db.js';
import { registerDeviceToken, sendToUser } from './src/services/notificationService.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('\n❌ Error: Missing required arguments\n');
    console.log('Usage:');
    console.log('  bun run test-notification.ts <userId> <fcmToken> [platform]\n');
    console.log('Arguments:');
    console.log('  userId    - User ID (required)');
    console.log('  fcmToken  - FCM registration token (required)');
    console.log('  platform  - Platform: ios | android | web (default: ios)\n');
    console.log('Example:');
    console.log(
      '  bun run test-notification.ts clx123abc456 "cLhY3kC-4hXq6gJY5fZ6X:APA91bHj7..." ios\n'
    );
    process.exit(1);
  }

  const userId = args[0];
  const fcmToken = args[1];
  const platform = args[2] || 'ios';

  console.log('\n🔔 ProBeauty Push Notification Test\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('Test Configuration:');
  console.log(`  User ID:   ${userId}`);
  console.log(`  FCM Token:  ${fcmToken.substring(0, 30)}...`);
  console.log(`  Platform:   ${platform}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const deviceToken = await registerDeviceToken(userId, fcmToken, platform);
    console.log('✅ Device token registered successfully!');
    console.log(`   Token ID: ${deviceToken.id}\n`);

    console.log('Step 2: Verifying user...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      console.error(`❌ Error: User with ID '${userId}' not found\n`);
      await prisma.$disconnect();
      process.exit(1);
    }
    console.log(`✅ User verified: ${user.name} (${user.email})\n`);

    console.log('Step 3: Sending test notification...');
    const notificationData = {
      title: '🧪 Test Notification',
      message:
        'This is a test push notification from ProBeauty backend. If you received this, everything is working! 🎉',
      type: 'promotion',
      data: {
        action: 'VIEW_HOME',
        screen: 'HomeScreen',
        testId: Date.now().toString(),
      },
    };

    await sendToUser(userId, notificationData);
    console.log('✅ Test notification sent successfully!\n');

    console.log('Step 4: Verifying notification in database...');
    const notification = await prisma.notification.findFirst({
      where: {
        userId,
        title: '🧪 Test Notification',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (notification) {
      console.log('✅ Notification found in database:');
      console.log(`   ID:        ${notification.id}`);
      console.log(`   Title:     ${notification.title}`);
      console.log(`   Message:   ${notification.message}`);
      console.log(`   Type:      ${notification.type}`);
      console.log(`   Created:   ${notification.createdAt.toISOString()}\n`);
    } else {
      console.warn('⚠️  Warning: Notification not found in database\n');
    }

    console.log('Step 5: Checking FCM response...');
    try {
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title: '🧪 FCM Direct Test',
          body: 'Direct FCM test message',
        },
        data: {
          type: 'test',
          test: 'direct',
        },
      };

      await admin.messaging().send(message);
      console.log('✅ Direct FCM test successful!\n');
    } catch (error: any) {
      console.error('❌ Direct FCM test failed:');
      console.error(`   Error: ${error.message}`);

      if (error.code === 'messaging/registration-token-not-registered') {
        console.error(`   ℹ️  The FCM token is not registered on FCM`);
        console.error(`   ℹ️  Make sure you have a valid, current FCM token from your app\n`);
      } else if (error.code === 'messaging/invalid-registration-token') {
        console.error(`   ℹ️  The FCM token is invalid\n`);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Test completed successfully!\n');
    console.log('Next steps:');
    console.log('  1. Check your device for test notification');
    console.log('  2. Check your device notification history');
    console.log('  3. Verify Firebase console for delivery status');
    console.log('  4. Use the GET /notifications API to fetch notifications\n');
  } catch (error: any) {
    console.error('\n❌ Test failed with error:');
    console.error(`   ${error.message}\n`);

    if (error.status === 400) {
      console.error('Possible causes:');
      console.error('  • FCM token is already registered to a different user');
      console.error('  • Invalid platform value\n');
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```
