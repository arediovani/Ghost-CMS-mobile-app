/**
 * Types for Ghost Content API responses.
 * Kept minimal for the read-only news reader (single author, no members).
 */

export interface GhostTag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface GhostPost {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  excerpt: string | null;
  html: string | null;
  plaintext: string | null;
  feature_image: string | null;
  featured: boolean;
  published_at: string;
  updated_at: string;
  tags: GhostTag[];
  primary_tag: GhostTag | null;
  url: string;
  canonical_url: string | null;
}

export interface GhostPostsMeta {
  pagination: {
    page: number;
    limit: number;
    pages: number;
    total: number;
    next: number | null;
    prev: number | null;
  };
}

export type GhostPostsResponse = GhostPost[] & { meta?: GhostPostsMeta };

export const FEED_TAG_SLUGS = [
  'aktualitet',
  'sociale',
  'mat',
  'klos',
  'diber',
  'opinion',
  'ekonomi',
  'sport',
] as const;

export type FeedTagSlug = (typeof FEED_TAG_SLUGS)[number];

export const FEED_TAG_LABELS: Record<FeedTagSlug, string> = {
  aktualitet: 'Aktualitet',
  sociale: 'Sociale',
  mat: 'Mat',
  klos: 'Klos',
  diber: 'Dibër',
  opinion: 'Opinion',
  ekonomi: 'Ekonomi',
  sport: 'Sport',
};
