/**
 * Handles deep links and push notification taps so that opening a link
 * (e.g. from Facebook) or tapping a notification opens the article in-app.
 * Notifications are only set up on native (iOS/Android); expo-notifications
 * is not loaded on web to avoid localStorage errors in the bundler.
 */

import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { parseArticleLink } from '@/lib/linking';

/**
 * Navigate to article by slug. Call from linking and notification handlers.
 */
function navigateToArticle(router: ReturnType<typeof useRouter>, slug: string) {
  router.push(`/article/${slug}` as never);
}

/**
 * Set up deep link and notification response listeners.
 * Call once from the root layout.
 */
export function useDeepLinks() {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    const handleUrl = (url: string) => {
      const link = parseArticleLink(url);
      if (link?.type === 'article') {
        navigateToArticle(routerRef.current, link.slug);
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    const sub = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    let subscription: { remove: () => void } | null = null;
    void import('expo-notifications').then((Notifications) => {
      subscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content
            .data as Record<string, unknown> | undefined;
          const slug = data?.slug ?? data?.postSlug;
          const slugStr = typeof slug === 'string' ? slug : undefined;
          if (slugStr) {
            navigateToArticle(routerRef.current, slugStr);
          }
        }
      );
    });
    return () => subscription?.remove();
  }, []);
}
