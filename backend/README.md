# 🛡️ SENTINNEL - Backend (Nucleus)

Backend de misión crítica para la plataforma **SENTINNEL**, diseñado para la gestión integral de programas de pasantías y seguimiento académico. Construido sobre **NestJS** y **Prisma ORM** con un enfoque de arquitectura estricta y tipado fuerte.

## 🏗️ Filosofía Arquitectónica
Este backend implementa el estándar `_sm_vc` (Strict Model Validation Contract). Todas las entidades, DTOs y servicios están blindados para garantizar la integridad de los datos y prevenir efectos secundarios en la lógica de negocio.

- **Stack**: NestJS (v10+), TypeScript (v5+), PostgreSQL, Prisma.
- **Validación**: Class-validator con esquemas DTO estrictos.
- **Seguridad**: JWT, Guards de roles específicos y filtros de excepción globales.

## 🚀 Requisitos Previos
- **Node.js**: v18.x o superior (Recomendado v20 LTS).
- **PostgreSQL**: v14 o superior.
- **npm**: v9.x o superior.

## 📦 Instalación Rápida
```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install
```

## 🗄️ Configuración de Base de Datos (CRÍTICO)
Para inicializar el sistema por primera vez o realizar un reset completo bajo el nuevo esquema de arquitectura estricta, ejecute el siguiente comando. 

> [!CAUTION]
> **ESTE COMANDO BORRARÁ LA BASE DE DATOS ACTUAL**, aplicará las nuevas migraciones y ejecutará el `seed` oficial con datos maestros.

```bash
npx prisma migrate reset
```

## ⚙️ Comandos de Ejecución
| Comando | Descripción |
| :--- | :--- |
| `npm run start:dev` | Inicia el servidor en modo desarrollo con hot-reload. |
| `npm run build` | Compila el proyecto para producción en la carpeta `/dist`. |
| `npm run start:prod` | Ejecuta la versión compilada en modo producción. |
| `npm run lint` | Ejecuta el linter para asegurar la calidad del código. |

## 📂 Árbol de Directorios (src/)
El código fuente ha sido modularizado para seguir el patrón de separación de intereses (SoC):

```text
src/
├── admin/           # Administración global de usuarios, roles y permisos.
├── auth/            # Gestión de autenticación, sockets y tokens JWT.
├── common/          # Decoradores, interceptores y constantes globales.
├── config/          # Centralización de variables de entorno y servicios.
├── conversaciones/  # Motor de mensajería interna (Chats).
├── deploy/          # Automatización y scripts de despliegue.
├── documentos/      # Gestión y almacenamiento de archivos/formatos.
├── estudiantes/     # Lógica central del ciclo de vida del estudiante.
├── evaluaciones/     # Sistema de corrección de entregas y feedback.
├── mailer/          # Microservicio de integración para envío de correos.
├── notificaciones/  # Orquestador de alertas y notificaciones push.
├── pasantias/       # Gestión de procesos de pasantía y aprobaciones.
├── periodos/        # Control de lapsos académicos y semestres.
├── prisma/          # Capa de datos y cliente de base de datos unificado.
├── users/           # Perfiles de usuario y gestión de datos personales.
├── app.module.ts    # Módulo raíz encargado del ensamblaje del sistema.
└── main.ts          # Punto de entrada y configuración global de la APP.
```

---
## 👥 Equipo de Ingeniería
- **Lead Software Architect**: Victor Contreras
- **Core Backend Engineer**: Victor Contreras

© 2026 SENTINNEL - Equipo de Ingeniería. Todos los derechos reservados.

