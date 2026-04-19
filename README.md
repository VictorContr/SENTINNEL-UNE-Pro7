# 🛡️ Proyecto SENTINNEL - UNE

**SENTINNEL** es una plataforma integral de gestión y seguimiento académico diseñada para optimizar los procesos de pasantías, evaluaciones y comunicación técnica entre la comunidad universitaria.

## 🌌 Visión General del Sistema
El proyecto se divide en dos ecosistemas principales interconectados, diseñados bajo el estándar de arquitectura estricta `_sm_vc`:

1.  **[Backend (Nucleus)](./backend/)**: La "Mente" del sistema. Una API RESTful robusta encargada de la lógica de negocio pesada, seguridad y persistencia delegada.
2.  **[Frontend (Visual Interface)](./frontend/)**: La "Cara" del sistema. Una interfaz reactiva de alto rendimiento diseñada para una experiencia de usuario fluida y profesional.

## 🛠️ Stack Tecnológico Global
- **Arquitectura de Datos**: PostgreSQL + Prisma ORM.
- **Servicios Core**: NestJS (TypeScript) + JWT.
- **Capa Visual**: Vue 3 + Quasar Framework + Tailwind CSS v4.
- **Motor de Estado**: Pinia.
- **Comunicación en Tiempo Real**: WebSockets (Socket.io).

## 🚀 Guía de Despegue Rápido
Para poner en marcha el ecosistema completo por primera vez:

1.  **Configuración de Datos**: En `backend/`, configura tu `.env` y ejecuta `npx prisma migrate reset`.
2.  **Encendido del Nucleus**: Ejecuta `npm run start:dev` en el directorio de backend.
3.  **Encendido de la Interfaz**: Ejecuta `npm run dev` en el directorio de frontend.

## 👥 Equipo de Ingeniería
- **Lead Software Architect**: Victor Contreras
- **Frontend Engineer / UI UX**: Santiago Maldonado

---
© 2026 Universidad de Nueva Esparta (UNE) - Proyecto SENTINNEL.