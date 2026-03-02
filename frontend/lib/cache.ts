import * as SecureStore from 'expo-secure-store';
import type { TokenCache } from '@clerk/clerk-expo';
import { Platform } from 'react-native';

const createTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        if (__DEV__) console.log(`[CACHE] getToken() - key: "${key}"`);
        const item = await SecureStore.getItemAsync(key);
        return item;
      } catch (error) {
        console.error('[CACHE] getToken() error:', error);
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    saveToken: async (key: string, value: string) => {
      try {
        const result = await SecureStore.setItemAsync(key, value);
        return result;
      } catch (error) {
        console.error('[CACHE] saveToken() error:', error);
        throw error;
      }
    },
  };
};

// SecureStore is not supported on the web
export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;
