/**
 * Push Notifications Hook - Web version (stub)
 * Web doesn't support push notifications, so this is a no-op
 */

export function useNotifications() {
  console.log('[Notifications] Web platform - notifications not supported');
  return { expoPushToken: undefined, error: null };
}
