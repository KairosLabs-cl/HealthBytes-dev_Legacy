import React from 'react';
import { StyleSheet, Pressable, ImageBackground, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

type PromoBannerProps = {
  title: string;
  subtitle: string;
  imageUrl: any;
  onPress?: () => void;
};

const { width } = Dimensions.get('window');

export function PromoBanner({ title, subtitle, imageUrl, onPress }: PromoBannerProps) {
  const primaryColor = useThemeColor({}, 'primary');
  
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <ImageBackground source={imageUrl} style={styles.background} resizeMode="cover">
        <ThemedView style={styles.overlay} lightColor="rgba(0,0,0,0.3)" darkColor="rgba(0,0,0,0.5)">
          <ThemedText style={styles.title} lightColor="#FFFFFF" darkColor="#FFFFFF">
            {title}
          </ThemedText>
          <ThemedText style={styles.subtitle} lightColor="#FFFFFF" darkColor="#FFFFFF">
            {subtitle}
          </ThemedText>
          <Pressable style={[styles.button, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.buttonText} lightColor="#FFFFFF" darkColor="#FFFFFF">
              Shop Now
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 32,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  background: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  overlay: {
    width: '100%',
    height: '100%',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});