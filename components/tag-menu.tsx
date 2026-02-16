import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  FEED_TAG_LABELS,
  FEED_TAG_SLUGS,
  type FeedTagSlug,
} from '@/types/ghost';

interface TagMenuProps {
  selectedTag: string | null;
  onSelectTag: (slug: string | null) => void;
}

export function TagMenu({ selectedTag, onSelectTag }: TagMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const iconColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  const handleSelectTag = (slug: string | null) => {
    onSelectTag(slug);
    setIsOpen(false);
  };

  const selectedLabel = selectedTag
    ? FEED_TAG_LABELS[selectedTag as FeedTagSlug]
    : 'Të gjitha';

  return (
    <>
      <ThemedView style={styles.container}>
        <Pressable
          style={styles.menuButton}
          onPress={() => setIsOpen(true)}
        >
          <Ionicons name="menu" size={28} color={iconColor} />
          <ThemedText style={styles.selectedText}>{selectedLabel}</ThemedText>
        </Pressable>
      </ThemedView>

      <Modal
        visible={isOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor }]}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.header}>
                <ThemedText type="subtitle" style={styles.headerText}>
                  Kategoritë
                </ThemedText>
                <Pressable onPress={() => setIsOpen(false)}>
                  <Ionicons name="close" size={28} color={iconColor} />
                </Pressable>
              </View>

              <ScrollView style={styles.menuList}>
                <Pressable
                  style={[
                    styles.menuItem,
                    selectedTag === null && styles.menuItemSelected,
                  ]}
                  onPress={() => handleSelectTag(null)}
                >
                  <ThemedText
                    style={[
                      styles.menuItemText,
                      selectedTag === null && styles.menuItemTextSelected,
                    ]}
                  >
                    Të gjitha
                  </ThemedText>
                  {selectedTag === null && (
                    <Ionicons name="checkmark" size={24} color="#0a7ea4" />
                  )}
                </Pressable>

                {(FEED_TAG_SLUGS as readonly string[]).map((slug) => {
                  const isSelected = selectedTag === slug;
                  const label = FEED_TAG_LABELS[slug as FeedTagSlug];
                  return (
                    <Pressable
                      key={slug}
                      style={[
                        styles.menuItem,
                        isSelected && styles.menuItemSelected,
                      ]}
                      onPress={() => handleSelectTag(slug)}
                    >
                      <ThemedText
                        style={[
                          styles.menuItemText,
                          isSelected && styles.menuItemTextSelected,
                        ]}
                      >
                        {label}
                      </ThemedText>
                      {isSelected && (
                        <Ionicons name="checkmark" size={24} color="#0a7ea4" />
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.15)',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.05)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 2,
        }),
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedText: {
    fontSize: 18,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  menuContainer: {
    width: '75%',
    height: '100%',
    ...(Platform.OS === 'web'
      ? { boxShadow: '2px 0px 8px rgba(0, 0, 0, 0.25)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 5,
        }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.15)',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
  },
  menuList: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.08)',
  },
  menuItemSelected: {
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  menuItemText: {
    fontSize: 17,
    fontWeight: '500',
  },
  menuItemTextSelected: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
});
