import React from 'react';
import { StyleSheet, View, Pressable, Modal } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemeMode, Language, useAppSettings } from '@/contexts/AppSettingsContext';

type SettingsSelectorProps = {
  isVisible: boolean;
  onClose: () => void;
};

export function SettingsSelector({ isVisible, onClose }: SettingsSelectorProps) {
  const { themeMode, language, setThemeMode, setLanguage } = useAppSettings();
  const primaryColor = useThemeColor({}, 'primary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  
  // Opciones de tema
  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: language === 'en' ? 'Light Mode' : 'Modo Claro', icon: 'sun.max.fill' },
    { value: 'dark', label: language === 'en' ? 'Dark Mode' : 'Modo Oscuro', icon: 'moon.fill' },
    { value: 'system', label: language === 'en' ? 'System Default' : 'Predeterminado del Sistema', icon: 'gear' },
  ];
  
  // Opciones de idioma
  const languageOptions: { value: Language; label: string; flag: string }[] = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
  ];
  
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <ThemedView 
          style={[styles.container, { borderColor }]} 
          lightColor={surfaceColor}
          darkColor={surfaceColor}
        >
          <Pressable style={{ alignSelf: 'stretch' }} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <ThemedText style={styles.title} type="subtitle">
                {language === 'en' ? 'Settings' : 'Configuración'}
              </ThemedText>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>×</ThemedText>
              </Pressable>
            </View>
            
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{language === 'en' ? 'Theme' : 'Tema'}</ThemedText>
              
              {themeOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionItem,
                    themeMode === option.value && { borderColor: primaryColor, borderWidth: 2 }
                  ]}
                  onPress={() => setThemeMode(option.value)}
                >
                  <View style={styles.optionContent}>
                    <View style={[styles.iconContainer, { backgroundColor: primaryColor }]}>
                      <ThemedText style={styles.iconText}>{option.icon === 'sun.max.fill' ? '☀️' : option.icon === 'moon.fill' ? '🌙' : '⚙️'}</ThemedText>
                    </View>
                    <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                  </View>
                  {themeMode === option.value && (
                    <View style={[styles.checkmark, { borderColor: primaryColor }]}>
                      <ThemedText style={[styles.checkmarkText, { color: primaryColor }]}>✓</ThemedText>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
            
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>{language === 'en' ? 'Language' : 'Idioma'}</ThemedText>
              
              {languageOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.optionItem,
                    language === option.value && { borderColor: primaryColor, borderWidth: 2 }
                  ]}
                  onPress={() => setLanguage(option.value)}
                >
                  <View style={styles.optionContent}>
                    <View style={styles.flagContainer}>
                      <ThemedText style={styles.flagText}>{option.flag}</ThemedText>
                    </View>
                    <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                  </View>
                  {language === option.value && (
                    <View style={[styles.checkmark, { borderColor: primaryColor }]}>
                      <ThemedText style={[styles.checkmarkText, { color: primaryColor }]}>✓</ThemedText>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
  },
  closeButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  flagContainer: {
    marginRight: 12,
  },
  flagText: {
    fontSize: 20,
  },
  optionLabel: {
    fontSize: 16,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});