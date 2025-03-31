import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from './IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type HeaderProps = {
  title?: string;
  onCartPress?: () => void;
  onProfilePress?: () => void;
  onSettingsPress?: () => void;
  cartItemsCount?: number;
};

export function Header({
  title = 'SafeBities',
  onCartPress,
  onProfilePress,
  onSettingsPress,
  cartItemsCount = 0,
}: HeaderProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <ThemedText style={styles.title} type="title">
        {title}
      </ThemedText>
      <View style={styles.actions}>
        {onSettingsPress && (
          <Pressable style={styles.iconButton} onPress={onSettingsPress}>
            <ThemedText style={{fontSize: 22}}>⚙️</ThemedText>
          </Pressable>
        )}
        {onProfilePress && (
          <Pressable style={styles.iconButton} onPress={onProfilePress}>
            <IconSymbol name="person.crop.circle" size={24} color={textColor} />
          </Pressable>
        )}
        {onCartPress && (
          <Pressable style={styles.iconButton} onPress={onCartPress}>
            <IconSymbol name="cart.fill" size={24} color={textColor} />
            {cartItemsCount > 0 && (
              <View style={[styles.badge, { backgroundColor: primaryColor }]}>
                <ThemedText style={styles.badgeText} lightColor="#FFFFFF" darkColor="#FFFFFF">
                  {cartItemsCount > 9 ? '9+' : cartItemsCount}
                </ThemedText>
              </View>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    right: 0,
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});