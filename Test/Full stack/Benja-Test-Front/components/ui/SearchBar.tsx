import React from 'react';
import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onFilterPress?: () => void;
};

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search products...',
  onSubmit,
  onFilterPress,
}: SearchBarProps) {
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'textSecondary');
  const backgroundColor = useThemeColor({}, 'surfaceVariant');
  const primaryColor = useThemeColor({}, 'primary');
  
  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color={placeholderColor} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
        />
      </View>
      {onFilterPress && (
        <Pressable style={[styles.filterButton, { backgroundColor: primaryColor }]} onPress={onFilterPress}>
          <IconSymbol name="line.3.horizontal.decrease" size={20} color="#FFFFFF" />
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    height: 50,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    height: '100%',
  },
  filterButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
});