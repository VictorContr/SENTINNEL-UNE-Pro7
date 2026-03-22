# 🎓 SENTINNEL - SGTIP-UNE

> **Sistema de Gestión y Trazabilidad de Informes de Pasantías**
> Interfaz de vanguardia de la SPA diseñada para centralizar, digitalizar y auditar el ciclo de vida académico de los pasantes de Computación en la Universidad Nueva Esparta.

---

## 🎯 De qué trata SENTINNEL (Elevator Pitch)

SENTINNEL elimina la burocracia del papel y los correos informales, sustituyéndolos por un flujo estrictamente secuencial (**Step-by-Step**) de tres materias: *Investigación y Desarrollo*, *Seminario de Grado* y *Trabajo de Grado I*.

Garantiza la trazabilidad total, donde un estudiante solo puede avanzar si sus entregables PDF son aprobados por un docente, integrando además un módulo de *Software Deploy* para la evidencia técnica del proyecto.

---

## 📦 Módulos Principales

- **📊 Módulo de Trazabilidad Académica**: Stepper visual que bloquea/habilita etapas según el estado de aprobación en tiempo real.
- **📄 Gestor Documental Digital**: Carga, previsualización y almacenamiento de informes en formato PDF.
- **🩺 Dashboard de Evaluación Crítica**: Panel denso para Profesores y Coordinadores con herramientas de corrección, feedback y veredictos.
- **🚀 Módulo de Evidencia Técnica (Deploy)**: Repositorio de URLs de producción y código fuente comprimido.

---

## 🛠️ Stack Tecnológico

### Core & UI
- **Framework**: `Vue 3.5+` (Composition API con `<script setup>` obligatorio).
- **UI Engine**: `Quasar Framework 2.x` (Componentes de alta densidad).
- **Styling**: `Tailwind CSS v4` (Design Tokens integrados en `.css`).
- **Iconografía**: Emoji-Logos (🎓) y Heroicons.

### Comunicación y Estado
- **State Management**: `Pinia` (Stores con sufijo `_vc`, ej: `estudiantesStore_vc`).
- **API Client**: `Axios` con Interceptores Globales para inyección de Bearer Tokens JWT.
- **Feedback**: `Vue Toastification` (Notificaciones asíncronas).

---

## ⚙️ Configuración del Entorno

### Requisitos previos
- **Node.js**: `v20+` (LTS Iron).
- **Gestor**: Se recomienda `pnpm` (Monorepo-friendly).

### Variables de Entorno (`.env`)
Crea un archivo `.env` en la raíz de `frontend/` con las siguientes variables:
```env
# URL del Servidor API (NestJS)
VITE_API_BACKEND_vc=http://tu-api-url.com

# Límite de carga de PDF (Default 10MB)
VITE_MAX_PDF_SIZE_vc=10485760 
```

---

## 📂 Estructura de Carpetas (`/src`)

- **`assets/`**: Recursos estáticos (imágenes, logos).
- **`boot/`**: Plugins de inicialización de Quasar (Axios, Toastification).
- **`components/`**: Componentes reutilizables (Botones, Modales). Contiene subcarpeta `shared/`.
- **`css/`**: Estilos globales y tokens de TailwindCSS.
- **`layouts/`**: Plantillas de vistas (Sidebar, Navbar, Layout de Alumno/Profesor).
- **`pages/`**: Vistas por rol (`admin/`, `estudiante/`, `profesor/`).
- **`router/`**: Configuración de rutas estáticas y dinámicas.
- **`stores/`**: Manejo de estado centralizado (Pinia).
- **`views/`**: Vistas complementarias o auxiliares.

---

## 🚀 Comandos Útiles

```bash
# 1. Instalar dependencias
pnpm install

# 2. Levantar servidor de desarrollo (Hot Reload)
pnpm run dev

# 3. Construir para producción
pnpm run build

# 4. Correr Linter
pnpm run lint
```

---

## 🌳 Workflow Git: Subir SOLO el Frontend desde Dev

Si estás trabajando en una rama como `Santiago-Dev` o `Victor-Dev` y necesitas empujar **únicamente** la carpeta `frontend` a la rama remota `frontend` (sin afectar el backend), ejecuta el siguiente comando **desde la raíz del proyecto**:

```bash
git subtree push --prefix=frontend origin frontend
```

> 💡 **¿Qué hace esto?**
> Filtra el historial de commits para aislar solo los cambios de la carpeta `frontend/` y los inyecta directamente en la rama remota de despliegue, previniendo conflictos y manteniendo la rama limpia.
