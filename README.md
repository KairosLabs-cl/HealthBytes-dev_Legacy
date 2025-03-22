### ⚠️ Este no es el readme oficial es un esquema, asi que no tomar literal lo que dice acá como plan final

# ❤️‍🩹 SafeBities - 

El proyecto se centra en desarrollar una aplicación de e-commerce para personas con necesidades alimenticias específicas, como diabetes y celiaquía. La arquitectura será monolítica, usando FastAPI para el backend y React Native para el frontend, priorizando la versión móvil.

## 📂 Estructura del Proyecto

```
/App
  └── Backend        # Lógica del servidor y APIs (FastAPI)
  └── Backoffice     # Módulo de administración
  └── Frontend       # Aplicación móvil (React Native + TypeScript)

/Docs                # Documentación técnica y de APIs
/Test                # Pruebas unitarias y de integración
```

## ⚙️ Tecnologías Utilizadas

- **Frontend (App Móvil):** React Native + TypeScript
- **Backend:** Python + FastAPI 
- **Infrastructura cloud:** Amazon Web Services (AWS)
- **Base de Datos:** PostgreSQL
- **Entorno:** IDE que te acomode (Recomendacion: Cursor, Vscode, Jetbrains)

## 🛠 Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/safebities_app.git
cd safebities_app
```

### 2. Configurar variables de entorno
Copia el archivo `.env.example` y crea uno `.env` en `/App/Backend/` con tu configuración local.

### 3. Ejecutar el Backend (FastAPI)
```bash
cd App/Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 4. Ejecutar el Frontend (React Native)
```bash
cd App/Frontend
npm install
npm run android  # o npm run ios
```

## 📌 Próximas Tareas / Roadmap

- [ ] Integración completa con pasarela de pagos
- [ ] Sistema de notificaciones push
- [ ] Pruebas automatizadas y cobertura
- [ ] Documentación Swagger para las APIs
- [ ] Mejoras en el módulo Backoffice

## 🤝 Equipo de Desarrollo

- **Product Owner:** 
- **Scrum Master:** 
- **Equipo Técnico:** 

