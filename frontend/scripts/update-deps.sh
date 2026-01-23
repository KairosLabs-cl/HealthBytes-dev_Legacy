#!/bin/bash

# HealthBytes Frontend - Dependency Update Script
# This script updates all dependencies to their latest compatible versions

echo "🚀 HealthBytes Frontend - Actualización de Dependencias"
echo "=========================================================="
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm no está instalado"
    echo "   Instala pnpm: npm install -g pnpm"
    exit 1
fi

echo "📦 Verificando dependencias actuales..."
pnpm outdated

echo ""
echo "¿Deseas actualizar las dependencias? (y/n)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo "🔄 Actualizando dependencias principales..."
    
    # Update Expo and related packages
    echo "  → Actualizando Expo SDK..."
    pnpm update expo@latest
    pnpm update expo-router@latest
    pnpm update expo-constants@latest
    pnpm update expo-linking@latest
    
    # Update React Query
    echo "  → Actualizando React Query..."
    pnpm update @tanstack/react-query@latest
    
    # Update Clerk
    echo "  → Actualizando Clerk..."
    pnpm update @clerk/clerk-expo@latest
    
    # Update UI dependencies
    echo "  → Actualizando UI dependencies..."
    pnpm update nativewind@latest
    pnpm update tailwindcss@latest
    
    # Update Zustand
    echo "  → Actualizando Zustand..."
    pnpm update zustand@latest
    
    echo ""
    echo "✅ Dependencias actualizadas!"
    echo ""
    echo "📝 Ejecutando type-check..."
    pnpm run type-check
    
    if [ $? -eq 0 ]; then
        echo "✅ Type-check exitoso!"
    else
        echo "⚠️  Hay errores de TypeScript. Revisa la salida anterior."
    fi
    
    echo ""
    echo "🎉 Actualización completa!"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Revisa los cambios: git diff package.json"
    echo "  2. Prueba la app: pnpm start"
    echo "  3. Si todo funciona, commitea: git add . && git commit -m 'chore: update dependencies'"
else
    echo "❌ Actualización cancelada"
fi
