# Script de Actualización de Dependencias - Frontend HealthBytes
# Este script actualiza todas las dependencias a sus últimas versiones compatibles

Write-Host "🚀 HealthBytes Frontend - Actualización de Dependencias" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""

# Verificar si pnpm está instalado
try {
    $null = Get-Command pnpm -ErrorAction Stop
} catch {
    Write-Host "❌ Error: pnpm no está instalado" -ForegroundColor Red
    Write-Host "   Instala pnpm: npm install -g pnpm" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Verificando dependencias actuales..." -ForegroundColor Cyan
pnpm outdated

Write-Host ""
$response = Read-Host "¿Deseas actualizar las dependencias? (y/n)"

if ($response -match '^[yY]') {
    Write-Host ""
    Write-Host "🔄 Actualizando dependencias principales..." -ForegroundColor Cyan
    
    # Update Expo and related packages
    Write-Host "  → Actualizando Expo SDK..." -ForegroundColor Yellow
    pnpm update expo@latest
    pnpm update expo-router@latest
    pnpm update expo-constants@latest
    pnpm update expo-linking@latest
    pnpm update expo-secure-store@latest
    
    # Update React Query
    Write-Host "  → Actualizando React Query..." -ForegroundColor Yellow
    pnpm update "@tanstack/react-query@latest"
    
    # Update Clerk
    Write-Host "  → Actualizando Clerk..." -ForegroundColor Yellow
    pnpm update "@clerk/clerk-expo@latest"
    
    # Update UI dependencies
    Write-Host "  → Actualizando UI dependencies..." -ForegroundColor Yellow
    pnpm update nativewind@latest
    pnpm update tailwindcss@latest
    pnpm update lucide-react-native@latest
    
    # Update Zustand
    Write-Host "  → Actualizando Zustand..." -ForegroundColor Yellow
    pnpm update zustand@latest
    
    # Update React Native & React
    Write-Host "  → Actualizando React Native..." -ForegroundColor Yellow
    pnpm update react-native@latest
    pnpm update react@latest
    pnpm update react-dom@latest
    
    Write-Host ""
    Write-Host "✅ Dependencias actualizadas!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Ejecutando type-check..." -ForegroundColor Cyan
    
    $typeCheckResult = pnpm run type-check
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Type-check exitoso!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Hay errores de TypeScript. Revisa la salida anterior." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🎉 Actualización completa!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "  1. Revisa los cambios: git diff package.json" -ForegroundColor White
    Write-Host "  2. Prueba la app: pnpm start" -ForegroundColor White
    Write-Host "  3. Si todo funciona, commitea los cambios" -ForegroundColor White
} else {
    Write-Host "❌ Actualización cancelada" -ForegroundColor Red
}
