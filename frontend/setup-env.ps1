#!/usr/bin/env pwsh
# HealthBytes Frontend - Environment Setup Script
# Configura automáticamente el .env según el modo de desarrollo

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  HealthBytes - Configuración de Entorno" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Función para obtener la IP local de WiFi/Ethernet
function Get-LocalIP {
    try {
        # Obtener todas las IPs IPv4 (excluyendo localhost y VirtualBox/Docker)
        $ips = Get-NetIPAddress -AddressFamily IPv4 | 
               Where-Object { 
                   $_.IPAddress -ne "127.0.0.1" -and 
                   $_.IPAddress -notlike "169.254.*" -and
                   $_.IPAddress -notlike "172.17.*" -and
                   $_.IPAddress -notlike "172.18.*" -and
                   $_.IPAddress -notlike "172.19.*" -and
                   $_.IPAddress -notlike "192.168.56.*"  # VirtualBox
               } | 
               Select-Object -First 1

        if ($ips) {
            return $ips.IPAddress
        }
    } catch {
        Write-Host "⚠️  Error detectando IP automáticamente" -ForegroundColor Yellow
    }
    
    # Fallback: usar ipconfig
    try {
        $ipLine = ipconfig | Select-String -Pattern "IPv4.*192\.168\.\d+\.\d+" | Select-Object -First 1
        if ($ipLine) {
            $ip = $ipLine.Line -replace ".*:\s*", ""
            return $ip.Trim()
        }
    } catch {}
    
    return $null
}

# Detectar IP local
$localIP = Get-LocalIP

if ($localIP) {
    Write-Host "✅ IP local detectada: " -NoNewline -ForegroundColor Green
    Write-Host $localIP -ForegroundColor Cyan
} else {
    Write-Host "⚠️  No se pudo detectar la IP local automáticamente" -ForegroundColor Yellow
    $localIP = Read-Host "Ingresa tu IP local manualmente (ej: 192.168.1.127)"
}

Write-Host ""
Write-Host "¿Cómo vas a usar la aplicación?" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [1] Solo Web (navegador) - usar localhost" -ForegroundColor White
Write-Host "  [2] Expo Go en celular/tablet - usar IP local ($localIP)" -ForegroundColor White
Write-Host "  [3] Ambos (Web + Expo Go) - usar IP local (recomendado)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Selecciona una opción [1/2/3]"

# Determinar la URL de la API
$apiUrl = switch ($choice) {
    "1" { "http://localhost:3001" }
    "2" { "http://${localIP}:3001" }
    "3" { "http://${localIP}:3001" }
    default { 
        Write-Host "❌ Opción inválida. Usando IP local por defecto." -ForegroundColor Red
        "http://${localIP}:3001"
    }
}

# Leer el archivo .env existente si existe
$envFilePath = Join-Path $PSScriptRoot ".env"
$clerkKey = "pk_test_ZXF1aXBwZWQtc3VuYmlyZC00NC5jbGVyay5hY2NvdW50cy5kZXYk"

if (Test-Path $envFilePath) {
    $envContent = Get-Content $envFilePath -Raw
    # Extraer la key de Clerk si existe
    if ($envContent -match "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=(.+)") {
        $clerkKey = $matches[1].Trim()
    }
}

# Crear contenido del .env
$envContent = @"

# Para desarrollo local en NAVEGADOR WEB - usar localhost:
$(if ($choice -eq "1") { "EXPO_PUBLIC_API_URL=$apiUrl" } else { "# EXPO_PUBLIC_API_URL=http://localhost:3001" })

# Para desarrollo local en CELULAR/EMULADOR - IP real de tu computadora
$(if ($choice -ne "1") { "EXPO_PUBLIC_API_URL=$apiUrl" } else { "# EXPO_PUBLIC_API_URL=http://${localIP}:3001" })
# IMPORTANTE: Si tu IP cambia, vuelve a ejecutar este script

# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=$clerkKey
"@

# Guardar el archivo .env
Set-Content -Path $envFilePath -Value $envContent -NoNewline

Write-Host ""
Write-Host "✅ Archivo .env configurado correctamente" -ForegroundColor Green
Write-Host ""
Write-Host "Configuración aplicada:" -ForegroundColor Cyan
Write-Host "  API URL: $apiUrl" -ForegroundColor White
Write-Host ""

# Preguntar si quiere actualizar el CORS del backend
Write-Host "¿Deseas actualizar también el CORS del backend? [S/n]" -ForegroundColor Yellow
$updateCors = Read-Host

if ($updateCors -eq "" -or $updateCors -eq "S" -or $updateCors -eq "s") {
    $backendMainPath = Join-Path (Split-Path $PSScriptRoot -Parent) "backend\app\main.py"
    
    if (Test-Path $backendMainPath) {
        $mainContent = Get-Content $backendMainPath -Raw
        
        # Actualizar todas las IPs viejas con la nueva
        $mainContent = $mainContent -replace "192\.168\.\d+\.\d+", $localIP
        
        Set-Content -Path $backendMainPath -Value $mainContent -NoNewline
        
        Write-Host "✅ CORS del backend actualizado con IP: $localIP" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANTE: Reinicia el backend para aplicar cambios de CORS" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️  No se encontró el archivo main.py del backend" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Si Expo está corriendo, presiona 'r' para recargar" -ForegroundColor White
Write-Host "  2. Si no está corriendo, ejecuta: pnpm start" -ForegroundColor White
if ($updateCors -eq "" -or $updateCors -eq "S" -or $updateCors -eq "s") {
    Write-Host "  3. Reinicia el backend para aplicar CORS" -ForegroundColor White
}
Write-Host ""
Write-Host "¡Listo para desarrollar! 🚀" -ForegroundColor Green
Write-Host ""
