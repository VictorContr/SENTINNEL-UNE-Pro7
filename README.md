
# 🎓 SENTINNEL-UNE 
[cite_start]**Sistema de Gestión y Trazabilidad de Informes de Pasantías en Computación** [cite: 7, 8]

![Vue.js](https://img.shields.io/badge/Vue%203-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Quasar](https://img.shields.io/badge/Quasar-1976D2?style=for-the-badge&logo=quasar&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

## 📖 Descripción del Proyecto

[cite_start]El **SENTINNEL-UNE** es una plataforma integral (Single Page Application) diseñada para modernizar y digitalizar los procesos académicos vinculados al ciclo de pasantías de la Escuela de Computación de la Universidad Nueva Esparta (UNE)[cite: 17, 18, 302]. 

[cite_start]El objetivo central es eliminar la burocracia basada en papel y hojas de cálculo desconectadas [cite: 36, 304][cite_start], reemplazándolas por un flujo digital *step-by-step* que garantiza la trazabilidad auditada de cada entregable entre los tres actores principales: **Estudiantes, Profesores y Coordinadores**[cite: 38, 303].

## ✨ Características Principales (Propuesta de Valor)

- [cite_start]**Flujo Académico Step-by-Step:** Gestión secuencial estricta de 3 materias: *Investigación y Desarrollo*, *Seminario de Grado* y *Trabajo de Grado I*[cite: 18, 49, 50]. [cite_start]Un estudiante no avanza sin la aprobación explícita del profesor[cite: 21, 51].
- [cite_start]**Módulo de Software Deploy:** Repositorio centralizado para la evidencia técnica del proyecto final, incluyendo URL de producción (Railway/Netlify), código fuente (.zip) y documentación de arquitectura (PDF)[cite: 22, 72, 142].
- [cite_start]**Trazabilidad y Auditoría:** Historial inmutable de cada acción realizada en la plataforma (subidas, evaluaciones, correcciones)[cite: 38, 52, 148].
- **Sistema de Notificaciones:** Alertas en tiempo real (Importantes, Urgentes, Informativas) gestionadas desde la base de datos para mantener la comunicación fluida.
- [cite_start]**Seguridad y Control de Acceso:** Autenticación por JWT, validación de roles y sistema de "Soft Delete" para mantener la integridad referencial del personal inactivo[cite: 78, 117].

## 🛠️ Stack Tecnológico Estricto

### Frontend (Capa de Presentación)
- [cite_start]**Framework:** Vue 3 (Composition API estricta con `<script setup>`)[cite: 41].
- [cite_start]**UI & Componentes:** Quasar Framework + Tailwind CSS v4 (Dark Mode exclusivo institucional)[cite: 41, 313, 471].
- [cite_start]**State Management:** Pinia[cite: 41, 313].
- [cite_start]**Comunicación HTTP:** Axios (Peticiones asíncronas con interceptores JWT)[cite: 42, 313].
- [cite_start]**Accesibilidad:** Headless UI (Modales, Transitions)[cite: 313].

### Backend (Capa de Lógica de Negocio)
- [cite_start]**Framework:** NestJS (Node.js + TypeScript)[cite: 20, 43].
- [cite_start]**Arquitectura:** Modular (Controladores limpios, lógica en Servicios)[cite: 44, 122].
- [cite_start]**Seguridad:** Passport, JWT, Helmet, Class-Validator (DTOs)[cite: 78, 281, 284].
- [cite_start]**ORM:** Prisma Client[cite: 45].

### Base de Datos & Infraestructura
- [cite_start]**Motor Relacional:** PostgreSQL (Optimizado para integridad referencial y tablas temporales)[cite: 45, 263, 264].
- [cite_start]**Proxy Inverso:** Nginx[cite: 286, 287].

## 🗄️ Convenciones de Base de Datos

Este proyecto utiliza una estricta convención de nomenclatura a nivel de base de datos, implementada mediante los decoradores `@map` y `@@map` de Prisma:
- **Base de Datos:** `DBpasantias_sm_vc`
- **Tablas:** Prefijo `td` y sufijo `_sm_vc` (Ej. `tdusuario_sm_vc`, `tdestudiante_sm_vc`).
- **Columnas:** Sufijo `_sm_vc` (Ej. `nombre_sm_vc`, `activo_sm_vc`).

## 🚀 Instalación y Despliegue Local

### Requisitos Previos
- Node.js (v18 o superior)
- PostgreSQL (v14 o superior) corriendo localmente.

### 1. Configuración de Base de Datos y Backend (NestJS)

```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env y colocar: DATABASE_URL="postgresql://usuario:clave@localhost:5432/DBpasantias_sm_vc?schema=public"

# Ejecutar migraciones de Prisma para crear las tablas
npx prisma migrate dev --name init_SENTINNEL_db_sm_vc

# Generar el cliente de Prisma
npx prisma generate

# Levantar el servidor en modo desarrollo
npm run start:dev

```

### 2. Configuración del Frontend (Vue 3 + Quasar)

```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Levantar el servidor de desarrollo (Vite)
npm run dev

```

## 👥 Equipo de Desarrollo

* 
**Víctor Contreras** - *Desarrollador Full-Stack / UI-UX* 


* **Santiago** - *Desarrollador Full-Stack / Arquitectura*

---

*Proyecto desarrollado para la materia de Programación 7 - Facultad de Ciencias de la Computación, Universidad Nueva Esparta (2026).* 