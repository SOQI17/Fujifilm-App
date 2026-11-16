# Orimec Field Analytics

Sistema de gestión de inventario y monitoreo de consumo de películas radiográficas
Fujifilm (DI-HT, DI-HL, DI-ML) e impresoras DRYPIX. Los datos se sincronizan en tiempo
real con Firebase (Firestore).

## Ejecutar en local

**Requisitos:** Node.js

1. Instalar dependencias: `npm install`
2. (Opcional) Colocar `serviceAccountKey.json` en la raíz para la API del servidor.
3. Modo web: `npm run dev` → http://localhost:3000
4. Modo escritorio (Electron): `npm run electron:dev`

## Compilar

- Web: `npm run build`
- Instalador Windows: `npm run electron:build` (salida en `dist_electron/`)

## Convenciones de datos

- Fechas en formato `YYYY-MM-DD`, interpretadas en hora local (`parseDate` en `src/App.tsx`).
- Medidas de venta en pulgadas: `8x10`, `10x12`, `10x14`, `14x17`
  (equivalencias de compra en cm: 20x25, 25x30, 26x36, 35x43).
- m² por caja: tabla única `FILM_M2_PER_BOX`.
- Ingresos: `recordRevenue` (precio de venta neto de devoluciones) en todas las vistas.
- Ajustes compartidos (metas, mínimos de stock, Imager) y el historial de auditoría
  se guardan en Firestore (`settings/*`, `audit_logs`).
