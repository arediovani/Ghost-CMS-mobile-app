import { Image } from 'expo-image';
import { type Href, Link } from 'expo-router';
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { GhostPost } from '@/types/ghost';

const IMAGE_HEIGHT = 180;

interface FeedArticleCardProps {
  post: GhostPost;
}

export function FeedArticleCard({ post }: FeedArticleCardProps) {
  const { width } = useWindowDimensions();
  const excerpt = post.excerpt?.trim() || post.plaintext?.slice(0, 120)?.trim() || '';

  return (
    <Link href={(`/article/${post.slug}`) as Href} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <ThemedView style={styles.inner}>
          {post.feature_image ? (
            <Image
              source={{ uri: post.feature_image }}
              style={[styles.image, { width: width - 32 }]}
              contentFit="cover"
            />
          ) : (
            <ThemedView style={[styles.imagePlaceholder, { width: width - 32 }]} />
          )}
          <ThemedView style={styles.body}>
            <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={2}>
              {post.title}
            </ThemedText>
            {excerpt ? (
              <ThemedText style={styles.excerpt} numberOfLines={2}>
                {excerpt}
              </ThemedText>
            ) : null}
          </ThemedView>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.9,
  },
  inner: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  image: {
    height: IMAGE_HEIGHT,
    backgroundColor: '#e0e0e0',
  },
  imagePlaceholder: {
    height: IMAGE_HEIGHT,
    opacity: 0.2,
  },
  body: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  title: {
    marginBottom: 4,
  },
  excerpt: {
    fontSize: 14,
    opacity: 0.85,
  },
});
