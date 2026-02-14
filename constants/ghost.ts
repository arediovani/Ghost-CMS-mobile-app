/**
 * Ghost CMS configuration.
 * Replace with your self-hosted Ghost URL and Content API key.
 * Key: Ghost Admin → Settings → Integrations → Add custom integration → Content API key.
 */

export const GHOST_CONFIG = {
  url: process.env.EXPO_PUBLIC_GHOST_URL || 'https://your-ghost-site.com',
  key: process.env.EXPO_PUBLIC_GHOST_CONTENT_API_KEY || '',
  version: 'v6.0' as const,
};
