import * as SecureStore from 'expo-secure-store';
import type { TokenCache } from '@clerk/clerk-expo';
import { Platform } from 'react-native';

const createTokenCache = (): TokenCache => {
  return {
    getToken: async (key: string) => {
      try {
        console.log(`[CACHE 🔍] getToken() - Obteniendo: "${key}"`);
        const item = await SecureStore.getItemAsync(key);
        if (item) {
          console.log(`[CACHE ✅] getToken() - Encontrado: "${key}" (${item.length} chars)`);
        } else {
          console.log(`[CACHE ❌] getToken() - No encontrado: "${key}"`);
        }
        return item;
      } catch (error) {
        console.error('[CACHE ❌] getToken() error:', error);
        await SecureStore.deleteItemAsync(key);
        return null;
      }
    },
    saveToken: async (key: string, value: string) => {
      try {
        console.log(`[CACHE 💾] saveToken() - Guardando: "${key}" (${value?.length} chars)`);
        const result = await SecureStore.setItemAsync(key, value);
        console.log(`[CACHE ✅] saveToken() - Guardado exitosamente: "${key}"`);
        return result;
      } catch (error) {
        console.error('[CACHE ❌] saveToken() error:', error);
        throw error;
      }
    },
  };
};

// SecureStore is not supported on the web
export const tokenCache = Platform.OS !== 'web' ? createTokenCache() : undefined;

// Debug: Verificar si tokenCache está configurado
console.log(`[CACHE] Platform: ${Platform.OS}, tokenCache enabled: ${!!tokenCache}`);

