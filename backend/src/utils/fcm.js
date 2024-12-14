import admin from '../config/firebase.js';

/**
 * Send a push notification to a single FCM token.
 * Silently skips if Firebase is not configured or token is missing.
 */
export async function sendPushNotification({ token, title, body, data = {} }) {
  if (!token) return;
  if (!admin.apps.length) return;

  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: { priority: 'high' },
    });
  } catch (err) {
    console.warn('[FCM] Failed to send notification:', err.message);
  }
}
