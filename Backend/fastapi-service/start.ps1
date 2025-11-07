# Script para iniciar el servidor FastAPI
# Este script asegura que se use el entorno virtual correcto

Write-Host "Iniciando servidor FastAPI..." -ForegroundColor Green

# Verificar que estamos en el directorio correcto
$currentDir = Get-Location
if ($currentDir.Path -notlike "*fastapi-service") {
    Write-Host "Error: Debes estar en el directorio Backend/fastapi-service" -ForegroundColor Red
    exit 1
}

# Verificar Python
$pythonExe = "..\..\.venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) {
    Write-Host "Error: No se encuentra el entorno virtual en $pythonExe" -ForegroundColor Red
    exit 1
}

Write-Host "Usando Python: $pythonExe" -ForegroundColor Cyan

# Iniciar uvicorn
Write-Host "`nIniciando servidor en http://127.0.0.1:3002" -ForegroundColor Green
Write-Host "Documentacion disponible en http://127.0.0.1:3002/docs" -ForegroundColor Cyan
Write-Host "`nPresiona CTRL+C para detener el servidor`n" -ForegroundColor Yellow

# Usar run_server.py que configura el event loop correcto para Windows
& $pythonExe run_server.py
