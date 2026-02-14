import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import RenderHtml from 'react-native-render-html';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { fetchPostBySlug } from '@/lib/ghost-api';
import type { GhostPost } from '@/types/ghost';

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { width } = useWindowDimensions();
  const textColor = useThemeColor({}, 'text');
  const [post, setPost] = useState<GhostPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPostBySlug(slug);
      setPost(data as GhostPost);
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
        <ThemedText type="title" style={styles.title}>
          {post.title}
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
  title: {
    marginBottom: 16,
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
});
