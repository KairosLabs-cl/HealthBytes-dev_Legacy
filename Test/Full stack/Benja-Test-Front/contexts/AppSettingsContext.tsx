import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipos para nuestras configuraciones
export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es';

type AppSettingsContextType = {
  themeMode: ThemeMode;
  language: Language;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
  resolvedTheme: 'light' | 'dark'; // El tema actual después de resolver la selección del sistema
};

// Valores por defecto
const DEFAULT_THEME_MODE: ThemeMode = 'system';
const DEFAULT_LANGUAGE: Language = 'en';

// Contexto con valores por defecto para evitar undefined
const defaultSettings: AppSettingsContextType = {
  themeMode: DEFAULT_THEME_MODE,
  language: DEFAULT_LANGUAGE,
  setThemeMode: () => {},
  setLanguage: () => {},
  resolvedTheme: 'light'
};

const AppSettingsContext = createContext<AppSettingsContextType>(defaultSettings);

// Claves para almacenamiento persistente
const THEME_STORAGE_KEY = 'SafeBities_ThemeMode';
const LANGUAGE_STORAGE_KEY = 'SafeBities_Language';

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  // Estados para los ajustes
  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  
  // Obtenemos el tema del dispositivo
  const deviceTheme = useDeviceColorScheme() || 'light';
  
  // Calculamos el tema resuelto basado en la preferencia
  const resolvedTheme = themeMode === 'system' 
    ? (deviceTheme === 'dark' ? 'dark' : 'light')
    : themeMode;
  
  // Cargar los ajustes guardados cuando se inicia la aplicación
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        
        if (savedTheme) {
          setThemeModeState(savedTheme as ThemeMode);
        }
        
        if (savedLanguage) {
          setLanguageState(savedLanguage as Language);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Funciones para cambiar los ajustes
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };
  
  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };
  
  const value = {
    themeMode,
    language,
    setThemeMode,
    setLanguage,
    resolvedTheme,
  };
  
  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}