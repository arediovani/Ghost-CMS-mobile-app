/**
 * Deep link parsing for opening articles from external links (e.g. Facebook)
 * or from push notifications. Supports custom scheme and Ghost site URL.
 */

import { GHOST_CONFIG } from '@/constants/ghost';

export interface ArticleLink {
  type: 'article';
  slug: string;
}

/**
 * Parse a URL and return article route params if it points to a post.
 * - Custom scheme: mattelevizion://article/<slug>
 * - Ghost site: https://your-ghost.com/<slug>/ or https://your-ghost.com/posts/<slug>/
 */
export function parseArticleLink(url: string | null): ArticleLink | null {
  if (!url || typeof url !== 'string') return null;

  try {
    const parsed = new URL(url);

    // Custom scheme: mattelevizion://article/slug
    if (parsed.protocol === 'mattelevizion:') {
      const path = parsed.pathname.replace(/^\/+|\/+$/g, '');
      const segments = path.split('/').filter(Boolean);
      const slug = segments[0] ?? segments[segments.length - 1];
      if (slug) return { type: 'article', slug };
      return null;
    }

    // HTTPS: same host as Ghost site → treat as article by path
    const ghostHost = GHOST_CONFIG.url ? new URL(GHOST_CONFIG.url).host : '';
    if (parsed.protocol === 'https:' && ghostHost && parsed.host === ghostHost) {
      const path = parsed.pathname.replace(/^\/+|\/+$/g, '');
      const segments = path.split('/').filter(Boolean);
      // Ghost often uses /slug/ or /posts/slug/ or /p/slug/
      const slug =
        segments[segments.length - 1] ??
        segments[0];
      if (slug && slug !== 'posts' && slug !== 'p') return { type: 'article', slug };
    }
  } catch {
    // ignore invalid URLs
  }
  return null;
}
