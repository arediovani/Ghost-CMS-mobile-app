import { Image } from 'expo-image';
import { type Href, Link, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import RenderHtml from 'react-native-render-html';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { fetchPostBySlug, fetchPosts } from '@/lib/ghost-api';
import type { GhostPost } from '@/types/ghost';

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width } = useWindowDimensions();
  const textColor = useThemeColor({}, 'text');
  const [post, setPost] = useState<GhostPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentPosts, setRecentPosts] = useState<GhostPost[]>([]);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const [postData, recentData] = await Promise.all([
        fetchPostBySlug(slug),
        fetchPosts({ limit: 6 }),
      ]);
      setPost(postData as GhostPost);
      // Filter out the current post and limit to 5
      const filtered = (Array.isArray(recentData) ? recentData : [])
        .filter((p) => p.slug !== slug)
        .slice(0, 5);
      setRecentPosts(filtered);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load article');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  if (!slug) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Missing article.</ThemedText>
      </ThemedView>
    );
  }

  if (error && !loading) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  if (loading || !post) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const html = post.html || '<p>No content.</p>';
  const contentWidth = width - 32;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <ThemedView style={styles.article}>
        {post.feature_image && (
          <Image
            source={{ uri: post.feature_image }}
            style={[styles.featuredImage, { width: width - 32 }]}
            contentFit="cover"
          />
        )}
        <ThemedText type="title" style={styles.title}>
          {post.title}
        </ThemedText>
        <ThemedText style={styles.publishedDate}>
          {new Date(post.published_at).toLocaleDateString('sq-AL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </ThemedText>
        <RenderHtml
          contentWidth={contentWidth}
          source={{ html }}
          baseStyle={{ ...styles.htmlBase, color: textColor }}
          tagsStyles={{
            body: { color: textColor },
            p: { marginVertical: 8, color: textColor },
            a: { color: '#0a7ea4' },
            img: { maxWidth: '100%', height: undefined },
          }}
        />

        {recentPosts.length > 0 && (
          <ThemedView style={styles.readMoreSection}>
            <ThemedText type="subtitle" style={styles.readMoreTitle}>
              Lexo më shumë
            </ThemedText>
            {recentPosts.map((recentPost) => (
              <Link
                key={recentPost.id}
                href={(`/article/${recentPost.slug}`) as Href}
                asChild
              >
                <Pressable style={styles.recentPostItem}>
                  {recentPost.feature_image && (
                    <Image
                      source={{ uri: recentPost.feature_image }}
                      style={styles.recentPostImage}
                      contentFit="cover"
                    />
                  )}
                  <View style={styles.recentPostContent}>
                    <ThemedText
                      style={styles.recentPostTitle}
                      numberOfLines={2}
                    >
                      {recentPost.title}
                    </ThemedText>
                    <ThemedText style={styles.recentPostDate}>
                      {new Date(recentPost.published_at).toLocaleDateString(
                        'sq-AL',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </ThemedText>
                  </View>
                </Pressable>
              </Link>
            ))}
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  article: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  featuredImage: {
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#e0e0e0',
  },
  title: {
    marginBottom: 12,
  },
  publishedDate: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 24,
  },
  htmlBase: {
    fontSize: 16,
    lineHeight: 24,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    textAlign: 'center',
  },
  readMoreSection: {
    marginTop: 48,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.15)',
  },
  readMoreTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  recentPostItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
    paddingVertical: 8,
  },
  recentPostImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  recentPostContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  recentPostTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  recentPostDate: {
    fontSize: 12,
    opacity: 0.6,
  },
});
