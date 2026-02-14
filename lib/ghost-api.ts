/**
 * Ghost Content API client wrapper.
 * Single module for all Ghost data fetching; easy to swap or mock for tests.
 */

import GhostContentAPI from '@tryghost/content-api';
import type { GhostPostsResponse } from '@/types/ghost';
import { GHOST_CONFIG } from '@/constants/ghost';

function createClient() {
  const { url, key, version } = GHOST_CONFIG;
  if (!url || !key) {
    return null;
  }
  return new GhostContentAPI({ url, key, version });
}

const api = createClient();

const POSTS_LIMIT = 10;
const POSTS_INCLUDE = 'tags';

/**
 * Fetch latest posts for the feed. Optionally filter by tag slug.
 */
export async function fetchPosts(options: {
  limit?: number;
  tag?: string;
}): Promise<GhostPostsResponse> {
  if (!api) {
    throw new Error('Ghost API not configured. Set EXPO_PUBLIC_GHOST_URL and EXPO_PUBLIC_GHOST_CONTENT_API_KEY.');
  }
  const { limit = POSTS_LIMIT, tag } = options;
  const params: { limit: number; include: string; filter?: string } = {
    limit,
    include: POSTS_INCLUDE,
  };
  if (tag) {
    params.filter = `tag:${tag}`;
  }
  const result = await api.posts.browse(params);
  return result as GhostPostsResponse;
}

/**
 * Fetch a single post by slug (for article screen and deep links).
 */
export async function fetchPostBySlug(slug: string) {
  if (!api) {
    throw new Error('Ghost API not configured.');
  }
  const post = await api.posts.read(
    { slug },
    { include: 'tags', formats: ['html', 'plaintext'] }
  );
  return post;
}

/**
 * Check if the API is configured (for conditional UI or error state).
 */
export function isGhostConfigured(): boolean {
  return Boolean(api);
}
