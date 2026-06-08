# 🛠️ Task — Bastian Soto (Frontend dev)

**Tarea:** UI Mapa "Dónde Conseguir" (estilo Copec/Submarino)  
**Branch:** `feat/store-locator-map`  
**ID:** `task-20260608-bastian-soto-store-locator-ui`  
**Deadline:** 2026-06-20 (2 semanas)  
**Tipo:** `feat` — PIVOTE P0

---

## 🎯 Objetivo

Crear una pantalla con **mapa interactivo** que muestre todas las tiendas donde conseguir un producto, con **UX similar a Copec y Submarino**.

**Desafío:** Primera vez trabajando con `react-native-maps` — buena oportunidad para aprender mapas en mobile.

---

## 🗺️ Referencia UX: Copec y Submarino

### **Estilo Copec (app de gasolineras):**

**Cómo funciona:**
1. Usuario abre la app
2. Mapa centrado en su ubicación actual (o ciudad default)
3. **Muestra TODAS las estaciones Copec** como markers rojos en el mapa
4. Usuario puede hacer zoom/pan para explorar
5. Click en marker → popup con info de la estación
6. Botón "Cómo llegar" → abre Google Maps/Waze

**Key features:**
- ✅ Vista de mapa como pantalla principal
- ✅ Todos los markers visibles de una vez
- ✅ No hay búsqueda ni filtros (muestra todo)
- ✅ Simple y directo

### **Estilo Submarino (app de sandwiches):**

**Cómo funciona:**
1. Usuario busca un local
2. Mapa centrado en Santiago (o su ubicación)
3. **Muestra TODOS los locales Submarino** como markers
4. Lista scrolleable abajo con todas las tiendas ordenadas por distancia
5. Click en marker → resalta la tienda en la lista
6. Click en tienda de la lista → centra el mapa en ese marker

**Key features:**
- ✅ Mapa + lista combinados (doble vista)
- ✅ Sincronización: marker ↔ lista
- ✅ Ordenado por distancia si hay ubicación
- ✅ Botones de acción (llamar, cómo llegar)

---

## 📱 Lo que vas a construir (mezcla de ambos):

### Pantalla: `frontend/app/product/[id]/stores.tsx`

**Layout:**
```
┌─────────────────────────────┐
│  ← "Dónde conseguir"        │  ← Header
├─────────────────────────────┤
│                             │
│      🗺️ MAPA               │  ← Mapa full-width
│   (markers de tiendas)      │     60% altura pantalla
│                             │
│                             │
├─────────────────────────────┤
│  📍 5 tiendas disponibles   │  ← Info row
├─────────────────────────────┤
│  ┌─────────────────────┐   │
│  │ NutriVida Prov...   │   │  ← Lista scrolleable
│  │ 📍 2.3 km          │   │     de tiendas
│  │ [📞] [🗺️ Cómo llegar] │   │     40% altura
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ BioMarket Las Co... │   │
│  │ 📍 4.1 km          │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

**Comportamiento:**
1. Usuario entra desde pantalla de producto → botón "Dónde conseguir"
2. Mapa centrado en **Santiago Centro** (`lat: -33.4372, lng: -70.6506`)
3. Muestra **todas las 5 tiendas** con markers
4. Lista abajo muestra las mismas 5 tiendas
5. Click en marker → scroll automático a esa tienda en la lista (resaltada)
6. Click en tienda de la lista → centra mapa en ese marker
7. Botón "Cómo llegar" → abre Google Maps con direcciones

---

## 🛠️ Implementación

### 1. Instalar dependencia

```bash
cd frontend
pnpm add react-native-maps
```

**Configuración Android:**

`android/app/src/main/AndroidManifest.xml`:
```xml
<application>
  <!-- Agregar antes de </application> -->
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
</application>
```

> **Nota:** Por ahora pueden usar una API key de prueba o el mapa sin key (tiene marca de agua pero funciona).

---

### 2. Crear API client

```typescript
// frontend/api/stores.ts
import { apiClient } from './client';

export interface Store {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  store_chain: string | null;
  phone: string | null;
  hours: string | null;
}

/**
 * Obtiene todas las tiendas donde está disponible un producto.
 */
export async function getProductStores(productId: string): Promise<Store[]> {
  const response = await apiClient.get(`/products/${productId}/stores`);
  return response.data;
}

/**
 * Obtiene todas las tiendas (para el mapa general).
 */
export async function getAllStores(): Promise<Store[]> {
  const response = await apiClient.get('/stores');
  return response.data;
}
```

---

### 3. Componente de mapa

```typescript
// frontend/components/StoreMap.tsx
import React, { useRef } from 'react';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import type { Store } from '@/api/stores';

interface StoreMapProps {
  stores: Store[];
  selectedStore: Store | null;
  onMarkerPress: (store: Store) => void;
}

export default function StoreMap({ stores, selectedStore, onMarkerPress }: StoreMapProps) {
  const mapRef = useRef<MapView>(null);

  // Región inicial: Santiago Centro
  const initialRegion: Region = {
    latitude: -33.4372,
    longitude: -70.6506,
    latitudeDelta: 0.15,  // Zoom level (menor = más zoom)
    longitudeDelta: 0.15,
  };

  // Centrar mapa en tienda seleccionada
  React.useEffect(() => {
    if (selectedStore && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: selectedStore.lat,
        longitude: selectedStore.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);  // 500ms de animación
    }
  }, [selectedStore]);

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation={false}  // Por ahora sin ubicación del usuario
      showsMyLocationButton={false}
    >
      {stores.map((store) => (
        <Marker
          key={store.id}
          coordinate={{
            latitude: store.lat,
            longitude: store.lng,
          }}
          title={store.name}
          description={store.address}
          onPress={() => onMarkerPress(store)}
          pinColor={selectedStore?.id === store.id ? '#10b981' : '#ef4444'}  // Verde si seleccionado, rojo default
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});
```

---

### 4. Componente de card de tienda

```typescript
// frontend/components/StoreCard.tsx
import React from 'react';
import { View, Text, Pressable, Linking, Platform } from 'react-native';
import type { Store } from '@/api/stores';

interface StoreCardProps {
  store: Store;
  isSelected: boolean;
  onPress: () => void;
}

export default function StoreCard({ store, isSelected, onPress }: StoreCardProps) {
  const handleCall = () => {
    if (store.phone) {
      Linking.openURL(`tel:${store.phone}`);
    }
  };

  const handleDirections = () => {
    // Abrir Google Maps con direcciones
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${store.lat},${store.lng}&ll=${store.lat},${store.lng}`,
      android: `${scheme}${store.lat},${store.lng}?q=${store.lat},${store.lng}(${encodeURIComponent(store.name)})`,
    });
    
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <Pressable
      onPress={onPress}
      className={`p-4 mb-3 rounded-lg border-2 ${
        isSelected 
          ? 'bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-400' 
          : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
      }`}
    >
      <Text className="text-lg font-semibold text-gray-900 dark:text-white">
        {store.name}
      </Text>
      
      <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        📍 {store.address}
      </Text>
      
      {store.hours && (
        <Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          🕐 {store.hours}
        </Text>
      )}

      <View className="flex-row gap-2 mt-3">
        {store.phone && (
          <Pressable
            onPress={handleCall}
            className="flex-1 bg-blue-500 py-2 px-4 rounded-lg"
          >
            <Text className="text-white text-center font-medium">
              📞 Llamar
            </Text>
          </Pressable>
        )}
        
        <Pressable
          onPress={handleDirections}
          className="flex-1 bg-green-500 py-2 px-4 rounded-lg"
        >
          <Text className="text-white text-center font-medium">
            🗺️ Cómo llegar
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
```

---

### 5. Pantalla principal

```typescript
// frontend/app/product/[id]/stores.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import StoreMap from '@/components/StoreMap';
import StoreCard from '@/components/StoreCard';
import { getProductStores, type Store } from '@/api/stores';

export default function ProductStoresScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    loadStores();
  }, [id]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const data = await getProductStores(id);
      setStores(data);
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (store: Store) => {
    setSelectedStore(store);
    
    // Scroll automático a la tienda en la lista
    const index = stores.findIndex(s => s.id === store.id);
    if (index !== -1 && listRef.current) {
      listRef.current.scrollToIndex({ index, animated: true });
    }
  };

  const handleStorePress = (store: Store) => {
    setSelectedStore(store);
    // El mapa se centra automáticamente por el useEffect en StoreMap
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (stores.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          😔 No hay tiendas disponibles
        </Text>
        <Text className="text-center text-gray-600 dark:text-gray-400">
          Este producto aún no está disponible en ninguna tienda.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Mapa - 60% altura */}
      <View className="h-[60%]">
        <StoreMap
          stores={stores}
          selectedStore={selectedStore}
          onMarkerPress={handleMarkerPress}
        />
      </View>

      {/* Info + Lista - 40% altura */}
      <View className="h-[40%] bg-gray-50 dark:bg-gray-900">
        {/* Header con contador */}
        <View className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white">
            📍 {stores.length} {stores.length === 1 ? 'tienda disponible' : 'tiendas disponibles'}
          </Text>
        </View>

        {/* Lista de tiendas */}
        <FlatList
          ref={listRef}
          data={stores}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <StoreCard
              store={item}
              isSelected={selectedStore?.id === item.id}
              onPress={() => handleStorePress(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}
```

---

## 📱 Flujo de usuario completo

### Desde pantalla de producto:

1. Usuario ve producto: "Leche de Almendras Sin Azúcar"
2. Botón nuevo: **"¿Dónde conseguir?"** (en vez de "Agregar al carrito")
3. Click → navega a `/product/[id]/stores`

### En pantalla de mapa:

4. Mapa carga centrado en Santiago
5. Muestra 5 markers (las 5 tiendas mock)
6. Lista abajo muestra las mismas 5 tiendas
7. Usuario hace click en marker rojo → se pone verde y lista hace scroll
8. Usuario click en "Cómo llegar" → abre Google Maps con direcciones
9. Usuario click en "Llamar" → abre dialer con teléfono

---

## 🎨 Detalles de UX (estilo Copec/Submarino)

### ✅ DO (hacer):
- Markers rojos por default, verde cuando seleccionado
- Animación suave al centrar mapa (500ms)
- Lista y mapa sincronizados (click en uno afecta al otro)
- Botones grandes y táctiles (44x44pt mínimo)
- Info clara: nombre, dirección, horario
- "Cómo llegar" siempre visible y destacado

### ❌ DON'T (no hacer por ahora):
- ~~Geolocalización del usuario~~ (P1, no P0)
- ~~Filtros de tiendas~~ (son solo 5, no hace falta)
- ~~Búsqueda~~ (no necesario para demo)
- ~~Ruta dibujada en el mapa~~ (Google Maps lo hace mejor)
- ~~Distancia en km~~ (requiere ubicación del usuario, P1)

---

## ✅ Criterios de aceptación

- [ ] `react-native-maps` instalado y configurado
- [ ] Mapa centrado en Santiago mostrando las 5 tiendas
- [ ] Markers rojos (default) y verde (seleccionado)
- [ ] Click en marker → scroll a tienda en lista
- [ ] Click en tienda de lista → centra mapa en marker
- [ ] Botón "Llamar" abre dialer (si hay teléfono)
- [ ] Botón "Cómo llegar" abre Google Maps con direcciones
- [ ] Funciona en Android (iOS no es prioridad ahora)
- [ ] UI responsive, no se rompe en pantallas chicas
- [ ] `pnpm run type-check` pasa sin errores

---

## 🧪 Testing manual

```bash
cd frontend
pnpm start

# En Expo Go (Android):
1. Navegar a un producto
2. Click en "¿Dónde conseguir?"
3. Verificar que mapa carga con 5 markers
4. Click en marker → debe resaltar tienda en lista
5. Click en tienda de lista → mapa debe centrar
6. Click "Cómo llegar" → debe abrir Google Maps
7. Click "Llamar" → debe abrir dialer
```

---

## 🐛 Troubleshooting común

### Mapa no se ve (pantalla blanca):
- Falta API key de Google Maps
- Solución temporal: funciona con marca de agua

### Markers no aparecen:
- Verificar que `stores` tiene datos: `console.log(stores)`
- Verificar que lat/lng son números, no strings

### "Cómo llegar" no abre Google Maps:
- Verificar `Linking.canOpenURL()` primero
- En Android usar `geo:` scheme

### Crash en Android:
- Verificar que `react-native-maps` está en `android/app/build.gradle`

---

## 📚 Recursos útiles

- **React Native Maps docs**: https://github.com/react-native-maps/react-native-maps
- **Expo Location** (para P1): https://docs.expo.dev/versions/latest/sdk/location/
- **Linking API**: https://reactnative.dev/docs/linking

---

## 🚀 Commits esperados

```
feat(stores): add react-native-maps dependency
feat(stores): add StoreMap component with markers and selection
feat(stores): add StoreCard component with call and directions
feat(stores): add product stores screen with map + list
feat(stores): sync map markers with store list selection
feat(stores): add "Cómo llegar" opening Google Maps
```

---

## 💡 Para después del demo (P1):

- Geolocalización "cerca de ti"
- Ordenar tiendas por distancia
- Mostrar distancia en km
- Filtrar por tienda abierta ahora
- Modo oscuro para el mapa

---

> [!IMPORTANT]
> **Primer mapa en React Native** — tomá tu tiempo para entender `react-native-maps`. Si te trabás, pedí ayuda. El objetivo es aprender y entregar funcional, no perfecto.

---

## 🎯 Tip de Benjamin

> "El truco de Copec/Submarino es la **simplicidad**: mapa + lista + botón de acción. No sobrecompliques. Usuarios solo quieren saber dónde ir y cómo llegar. Eso es todo." 💪
