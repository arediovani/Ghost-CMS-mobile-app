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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(128,128,128,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  pillSelected: {
    backgroundColor: '#0a7ea4',
    borderColor: '#0a7ea4',
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  pillTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
});
