/**
 * Push Notifications Hook
 * Handles Expo push notification registration and token management
 */

import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Skip notifications on web platform
    if (Platform.OS === 'web') {
      console.log('[Notifications] Skipping on web platform');
      return;
    }

    // Dynamically import expo-notifications only on native platforms
    import('expo-notifications').then((Notifications) => {
      // Configure notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      // Register for push notifications
      registerForPushNotificationsAsync(Notifications)
        .then((token) => {
          if (token) {
            setExpoPushToken(token);
            // Register token with Supabase
            import('@/lib/supabase').then(({ registerPushToken }) => {
              registerPushToken(token).catch((err) => {
                console.error('Failed to register token with Supabase:', err);
                setError('Failed to register for notifications');
              });
            });
          }
        })
        .catch((err) => {
          console.error('Error getting push token:', err);
          setError(err.message);
        });

      // Handle notification received while app is open
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log('Notification received:', notification);
        });

      // Handle user tapping on notification
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          const slug = response.notification.request.content.data?.slug;
          if (slug && typeof slug === 'string') {
            // Navigate to the article
            router.push(`/article/${slug}`);
          }
        });
    });

    return () => {
      import('expo-notifications').then((Notifications) => {
        if (notificationListener.current) {
          Notifications.removeNotificationSubscription(
            notificationListener.current
          );
        }
        if (responseListener.current) {
          Notifications.removeNotificationSubscription(
            responseListener.current
          );
        }
      });
    };
  }, []);

  return { expoPushToken, error };
}

async function registerForPushNotificationsAsync(
  Notifications: any
): Promise<string | undefined> {
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0a7ea4',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push notification permissions');
    return;
  }

  try {
    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
  } catch (error) {
    console.error('Error getting Expo push token:', error);
  }

  return token;
}
