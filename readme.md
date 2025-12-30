# WebApp Abastecimiento - MVP

Aplicación web para planificar armadas de ataque contra incendios sobre un mapa satelital con validaciones operativas básicas.

## Estructura de carpetas
- `frontend/`: React + Vite para la UI (mapa, grafo, panel de componentes).
- `backend/`: API Node/Express para validaciones hidráulicas y gestión de librerías.
- `data/`: Almacenamiento de vehículos, planes guardados y manuales de referencia.
- `docs/`: Documentación técnica (arquitectura, modelo de datos, pseudocódigo).

## Cómo correr el MVP
1. **Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   El servidor usa el puerto `4000` por defecto. Configurable con `PORT`.

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Incluye un token público de prueba para Mapbox. En producción, define `VITE_MAPBOX_TOKEN` con tu propio token.

3. Abre `http://localhost:5173` (puerto de Vite) y el frontend consumirá la API en `http://localhost:4000`.

## Características del MVP
- Mapa satelital Mapbox con overlay de grafo (React Flow).
- Panel lateral con componentes arrastrables (fuente, manguera, accesorio, boquilla).
- Validación básica en tiempo real de caudal/diámetro y presión en boquilla.
- Guardar/cargar armadas sencillas contra la API.
- Librería de vehículos basada en archivos JSON con esquema simple.

Consulta `docs/architecture.md` para decisiones y extensiones futuras.
