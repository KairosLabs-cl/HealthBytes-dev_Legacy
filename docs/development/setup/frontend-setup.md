# 🔧 Configuración Rápida del Frontend

## Configuración Automática (Recomendado) ⚡

Ejecuta el script de configuración que detectará tu IP y configurará todo automáticamente:

```powershell
cd frontend
.\setup-env.ps1
```

El script te preguntará:
1. ¿Usarás solo Web, solo Expo Go, o ambos?
2. ¿Quieres actualizar el CORS del backend?

Y configurará todo automáticamente. ¡Así de fácil!

---

## Configuración Manual 🔨

Si prefieres configurar manualmente:

### 1. Crea el archivo `.env`

```bash
cp .env.example .env
```

### 2. Obtén tu IP local

```powershell
ipconfig | Select-String "IPv4"
```

Busca la IP que comienza con `192.168.x.x` (tu red WiFi/Ethernet)

### 3. Configura según tu caso de uso

#### Solo Web (desarrollo en navegador)
```bash
EXPO_PUBLIC_API_URL=http://localhost:3001
```

#### Solo Expo Go (desarrollo en celular)
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.127:3001  # Tu IP local
```

#### Ambos (recomendado)
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.127:3001  # Tu IP local
```
> Usar tu IP local funciona tanto en web como en Expo Go

---

## ⚠️ Problemas Comunes

### "Error cargando productos" en Expo Go
- ✅ Verifica que tu celular y computadora estén en la **misma red WiFi**
- ✅ Asegúrate de usar tu **IP local** (no localhost)
- ✅ Reinicia Expo después de cambiar `.env`: presiona `r` en la terminal

### "Network request failed"
- ✅ Verifica que el backend esté corriendo: `http://TU_IP:3001`
- ✅ Revisa el firewall de Windows (puerto 3001 debe estar abierto)
- ✅ Ejecuta `setup-env.ps1` de nuevo para actualizar CORS

### IP cambió después de reiniciar la computadora
```powershell
.\setup-env.ps1  # Vuelve a ejecutar el script
```

---

## 📱 Iniciar el Proyecto

```bash
# Instalar dependencias (solo la primera vez)
pnpm install

# Iniciar Expo
pnpm start
```

Luego:
- **Web**: Presiona `w` en la terminal
- **Expo Go**: Escanea el QR con tu celular
