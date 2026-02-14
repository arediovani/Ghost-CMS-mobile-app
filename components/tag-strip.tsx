import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  FEED_TAG_LABELS,
  FEED_TAG_SLUGS,
  type FeedTagSlug,
} from '@/types/ghost';

interface TagStripProps {
  selectedTag: string | null;
  onSelectTag: (slug: string | null) => void;
}

export function TagStrip({ selectedTag, onSelectTag }: TagStripProps) {
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable
          style={[
            styles.pill,
            selectedTag === null && styles.pillSelected,
          ]}
          onPress={() => onSelectTag(null)}
        >
          <ThemedText
            style={[styles.pillText, selectedTag === null && styles.pillTextSelected]}
          >
            Të gjitha
          </ThemedText>
        </Pressable>
        {(FEED_TAG_SLUGS as readonly string[]).map((slug) => {
          const isSelected = selectedTag === slug;
          const label = FEED_TAG_LABELS[slug as FeedTagSlug];
          return (
            <Pressable
              key={slug}
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => onSelectTag(slug)}
            >
              <ThemedText
                style={[styles.pillText, isSelected && styles.pillTextSelected]}
              >
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.3)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(128,128,128,0.15)',
  },
  pillSelected: {
    backgroundColor: '#0a7ea4',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pillTextSelected: {
    color: '#fff',
  },
});
