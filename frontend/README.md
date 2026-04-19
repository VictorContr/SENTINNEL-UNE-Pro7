# 🎨 SENTINNEL - Frontend (Visual Interface)

Interfaz de usuario moderna y reactiva para la plataforma **SENTINNEL**, diseñada para ofrecer una experiencia fluida a estudiantes, tutores y administradores.

## 🚀 Tecnologías Core
- **Framework**: [Vue 3](https://vuejs.org/) (Composition API).
- **UI Framework**: [Quasar Framework v2](https://quasar.dev/) (Motor de componentes optimizado).
- **Estado Global**: [Pinia](https://pinia.vuejs.org/) (Sustituto moderno de Vuex).
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) & Quasar CSS para layouts complejos.
- **Comunicación**: Axios (REST) y Socket.io-client (Eventos en tiempo real).

## 🏗️ Convenciones de Desarrollo
Este frontend sigue estrictamente la convención de nomenclatura `_sm_vc`. Cada componente, servicio y store ha sido refactorizado para garantizar que las propiedades de datos correspondan exactamente con el contrato definido en el backend, eliminando errores de integración por desajuste de tipos.

## 📦 Instalación
```bash
# Navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install
```

## ⚙️ Comandos de Quasar
| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo en `http://localhost:9000`. |
| `npm run build` | Compila la aplicación para producción (SPA/PWA). |
| `npm run lint` | Ejecuta el análisis de calidad de código con ESLint. |

## 📂 Estructura de Directorios (src/)
```text
src/
├── assets/          # Recursos estáticos (Imágenes de autores, Logos UNE, etc).
├── boot/            # Inyección de plugins (Configuración de Axios y Sockets).
├── components/      # Unidades UI reutilizables bajo la arquitectura _sm_vc.
├── css/             # Configuración de Tailwind CSS y estilos base.
├── layouts/         # Estructuras maestras (Sidebar, Navbar y Footer).
├── pages/           # Vistas de alto nivel (Pasantías, Evaluaciones, Perfil).
├── router/          # Configuración de rutas y guardias de seguridad (RBAC).
├── services/        # Capa de API. Centralización de peticiones HTTP.
├── stores/          # Gestión de estado (notificacionesStore, mensajeriaStore).
├── utils/           # Ayudantes de lógica (Formateadores de fecha, validadores).
└── App.vue          # Componente de entrada principal.
```

---
© 2026 SENTINNEL Project - Frontend Division.
