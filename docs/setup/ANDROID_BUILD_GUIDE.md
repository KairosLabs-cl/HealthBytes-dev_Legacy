# Android Build Guide - HealthBytes

Esta guía explica cómo compilar la aplicación HealthBytes para Android usando Expo.

## 📋 Tabla de Contenidos

- [Desarrollo Rápido (Expo Go)](#desarrollo-rápido-expo-go)
- [Build de Producción (EAS Build)](#build-de-producción-eas-build)
- [Build Local](#build-local-avanzado)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Desarrollo Rápido (Expo Go)

**Ideal para**: Testing rápido durante desarrollo

### Requisitos
- ✅ Smartphone Android físico o emulador
- ✅ App "Expo Go" instalada (desde Play Store)

### Pasos

```bash
cd frontend

# Iniciar el servidor de desarrollo
pnpm start

# O específicamente para Android
pnpm android
```

En tu dispositivo Android:
1. Abre **Expo Go**
2. Escanea el QR code que aparece en terminal
3. La app se cargará automáticamente

**Pros**: ⚡ Super rápido, hot reload instantáneo  
**Contras**: ❌ Requiere Expo Go instalado, no funciona para producción

---

## 📦 Build de Producción (EAS Build)

**Ideal para**: Distribución interna, Google Play Store

### Requisitos

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Login (necesitas cuenta Expo)
eas login
```

### 1️⃣ Primera Configuración

```bash
cd frontend

# Configurar proyecto (solo primera vez)
eas build:configure

# Esto crea el archivo eas.json (ya existe en el proyecto)
```

### 2️⃣ Build para Testing (APK)

```bash
# Build APK (instalable directamente)
pnpm build:android:preview

# O directamente con EAS
eas build --platform android --profile preview
```

**Output**: Archivo `.apk` descargable  
**Uso**: Instalar directamente en dispositivos Android  
**Tiempo**: ~10-15 minutos (build en cloud)

### 3️⃣ Build para Play Store (AAB)

```bash
# Build Android App Bundle (para Google Play)
pnpm build:android:production

# O directamente con EAS
eas build --platform android --profile production
```

**Output**: Archivo `.aab` (Android App Bundle)  
**Uso**: Subir a Google Play Store  
**Tiempo**: ~10-15 minutos

### 4️⃣ Descargar el Build

Cuando termine el build, EAS te dará:
- 🔗 URL para descargar el APK/AAB
- 📱 QR code para instalar directamente

```bash
# Ver lista de builds
eas build:list

# Ver detalles de un build específico
eas build:view [BUILD_ID]
```

### 5️⃣ Instalar en Dispositivo

**Opción A**: QR Code (para APK)
- Escanea el QR con tu Android
- Se descarga e instala automáticamente

**Opción B**: Descarga manual
```bash
# Descargar el APK
# URL disponible en dashboard: https://expo.dev/accounts/[your-account]/projects/shop/builds
```

**Opción C**: ADB (para testing)
```bash
# Con dispositivo conectado por USB
adb install app-release.apk
```

---

## 🛠️ Build Local (Avanzado)

**Ideal para**: Builds offline, CI/CD local, debugging profundo

### Requisitos

1. **Java Development Kit (JDK) 17**
   ```powershell
   # Verificar instalación
   java -version
   
   # Si no está instalado:
   # Descargar desde https://adoptium.net/
   ```

2. **Android Studio**
   - Descargar desde https://developer.android.com/studio
   - Durante instalación, incluir:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device (AVD)

3. **Variables de entorno**
   ```powershell
   # Agregar a variables de entorno del sistema
   ANDROID_HOME=C:\Users\[TU_USUARIO]\AppData\Local\Android\Sdk
   JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot
   
   # Agregar a PATH
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %JAVA_HOME%\bin
   ```

### Build Process

```bash
cd frontend

# 1. Generar archivos nativos de Android
npx expo prebuild --clean

# 2. Ir a carpeta android
cd android

# 3. Build APK de desarrollo
./gradlew assembleDebug

# 4. Build APK de producción (firmado)
./gradlew assembleRelease

# APK estará en:
# android/app/build/outputs/apk/release/app-release.apk
```

### Firmar APK (para producción)

1. **Crear keystore**
   ```bash
   keytool -genkeypair -v -storetype PKCS12 \
     -keystore healthbytes-release.keystore \
     -alias healthbytes-key \
     -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configurar firma** en `android/gradle.properties`:
   ```properties
   MYAPP_UPLOAD_STORE_FILE=healthbytes-release.keystore
   MYAPP_UPLOAD_KEY_ALIAS=healthbytes-key
   MYAPP_UPLOAD_STORE_PASSWORD=****
   MYAPP_UPLOAD_KEY_PASSWORD=****
   ```

3. **Build firmado**
   ```bash
   cd android
   ./gradlew bundleRelease  # AAB para Play Store
   ./gradlew assembleRelease  # APK firmado
   ```

---

## 🔧 Configuración del Proyecto

### app.json

```json
{
  "expo": {
    "android": {
      "package": "com.healthbytes.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "CAMERA"
      ]
    }
  }
}
```

### eas.json

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

---

## 🐛 Troubleshooting

### Error: "eas: command not found"
```bash
npm install -g eas-cli
```

### Error: "Unable to resolve expo-router"
```bash
cd frontend
pnpm install
npx expo install expo-router
```

### Error: "JAVA_HOME is not set"
```powershell
# Windows PowerShell (como Admin)
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot', 'Machine')
```

### Error: "SDK location not found"
```bash
# Crear android/local.properties
sdk.dir=C:\\Users\\[TU_USUARIO]\\AppData\\Local\\Android\\Sdk
```

### Build falla en EAS
```bash
# Ver logs detallados
eas build:view [BUILD_ID]

# Limpiar cache y reintentar
eas build --platform android --clear-cache
```

### APK no instala en dispositivo
```bash
# Verificar firma
jarsigner -verify -verbose -certs app-release.apk

# Instalar vía ADB
adb install -r app-release.apk
```

---

## 📊 Comparación de Métodos

| Método | Velocidad | Uso | Requisitos | Output |
|--------|-----------|-----|------------|--------|
| **Expo Go** | ⚡⚡⚡ Instantáneo | Desarrollo | Expo Go app | - |
| **EAS Build** | ⚡⚡ 10-15 min | Producción | Cuenta Expo | APK/AAB |
| **Local Build** | ⚡ 5-30 min | CI/CD, Debug | Android Studio | APK/AAB |

---

## 🚀 Workflow Recomendado

### Durante Desarrollo:
```bash
# Testing diario
pnpm start  # + Expo Go

# Testing semanal en build real
pnpm build:android:preview
```

### Pre-Producción:
```bash
# Build de staging
eas build --platform android --profile preview

# QA testing en dispositivos reales
```

### Producción:
```bash
# Build para Play Store
pnpm build:android:production

# Submit a Play Store (automático)
eas submit --platform android
```

---

## 📱 Instalación en Dispositivos

### Opción 1: Expo Go (desarrollo)
1. Instalar "Expo Go" desde Play Store
2. Escanear QR de `pnpm start`

### Opción 2: APK directo (preview)
1. Build APK: `pnpm build:android:preview`
2. Descargar desde URL de EAS
3. Instalar en dispositivo (permitir instalación de fuentes desconocidas)

### Opción 3: Google Play Store (producción)
1. Build AAB: `pnpm build:android:production`
2. Subir a Play Console
3. Publicar en Play Store

---

## 🔐 Variables de Entorno para Build

Asegúrate de configurar en EAS:

```bash
# Backend API
EXPO_PUBLIC_API_URL=https://api.healthbytes.cl

# Clerk Auth
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...

# Configurar en EAS Dashboard o vía CLI:
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://api.healthbytes.cl
```

---

## 📚 Recursos Adicionales

- 📖 [Expo Build Documentation](https://docs.expo.dev/build/introduction/)
- 🛠️ [EAS Build Configuration](https://docs.expo.dev/build-reference/eas-json/)
- 🤖 [Android Developer Guide](https://developer.android.com/studio)
- 📱 [Google Play Console](https://play.google.com/console)

---

## ✅ Checklist de Pre-Producción

Antes de publicar en Play Store:

- [ ] ✅ Incrementar `versionCode` en app.json
- [ ] ✅ Actualizar `version` en app.json (semver)
- [ ] ✅ Configurar variables de entorno de producción
- [ ] ✅ Testear en múltiples dispositivos Android
- [ ] ✅ Verificar permisos necesarios
- [ ] ✅ Crear keystore de firma (guardar en lugar seguro)
- [ ] ✅ Configurar Google Play Store listing
- [ ] ✅ Preparar screenshots y descripción
- [ ] ✅ Build AAB de producción
- [ ] ✅ Submit a Play Store

---

**Última actualización**: Febrero 13, 2026  
**Versión de Expo**: SDK 52
