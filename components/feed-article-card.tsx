import { Image } from 'expo-image';
import { type Href, Link } from 'expo-router';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { GhostPost } from '@/types/ghost';

const IMAGE_HEIGHT = 200;

interface FeedArticleCardProps {
  post: GhostPost;
}

export function FeedArticleCard({ post }: FeedArticleCardProps) {
  const { width } = useWindowDimensions();
  const excerpt = post.excerpt?.trim() || post.plaintext?.slice(0, 150)?.trim() || '';
  const publishedDate = new Date(post.published_at).toLocaleDateString('sq-AL', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link href={(`/article/${post.slug}`) as Href} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
        <ThemedView style={styles.cardContainer}>
          {post.feature_image ? (
            <Image
              source={{ uri: post.feature_image }}
              style={styles.image}
              contentFit="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
          <View style={styles.contentContainer}>
            {post.primary_tag && (
              <ThemedText style={styles.tag}>
                {post.primary_tag.name.toUpperCase()}
              </ThemedText>
            )}
            <ThemedText style={styles.title} numberOfLines={3}>
              {post.title}
            </ThemedText>
            {excerpt ? (
              <ThemedText style={styles.excerpt} numberOfLines={3}>
                {excerpt}
              </ThemedText>
            ) : null}
            <ThemedText style={styles.date}>{publishedDate}</ThemedText>
          </View>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 4,
        }),
  },
  image: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#e0e0e0',
  },
  imagePlaceholder: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: '#e0e0e0',
    opacity: 0.3,
  },
  contentContainer: {
    padding: 20,
    gap: 10,
  },
  tag: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#0a7ea4',
    marginBottom: -4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  excerpt: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.7,
  },
  date: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 4,
  },
});
