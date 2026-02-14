import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { FeedArticleCard } from '@/components/feed-article-card';
import { TagStrip } from '@/components/tag-strip';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { fetchPosts } from '@/lib/ghost-api';
import type { GhostPost } from '@/types/ghost';

const POSTS_LIMIT = 10;

export default function HomeScreen() {
  const [posts, setPosts] = useState<GhostPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const loadFeed = useCallback(async (tag: string | null, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await fetchPosts({
        limit: POSTS_LIMIT,
        tag: tag ?? undefined,
      });
      setPosts(Array.isArray(result) ? result : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load articles');
      setPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(selectedTag);
  }, [selectedTag, loadFeed]);

  const onRefresh = useCallback(() => {
    loadFeed(selectedTag, true);
  }, [selectedTag, loadFeed]);

  if (error && !loading) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <TagStrip selectedTag={selectedTag} onSelectTag={setSelectedTag} />
      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FeedArticleCard post={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <ThemedView style={styles.centered}>
              <ThemedText>No articles found.</ThemedText>
            </ThemedView>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
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
