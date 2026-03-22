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

```text
src/
├── assets/         # Recursos estáticos (imágenes, logos)
├── boot/           # Plugins de inicialización de Quasar (Axios, Toastification)
├── components/     # Componentes Vue reutilizables
│   └── shared/     # Componentes compartidos agrupados por módulo
│       ├── conv/     # UI para flujos de feedback y mensajería
│       ├── deploy/   # Componentes de carga técnica (URLs/Zip)
│       └── usuarios/ # Formularios ABM y listados de perfiles
├── css/            # Estilos globales y tokens de TailwindCSS
├── layouts/        # Plantillas estructurales (ej. MainLayout.vue)
├── pages/          # Vistas principales de enrutamiento
│   ├── admin/      # Dashboards y ABM de Coordinadores
│   ├── estudiante/ # Pantallas de trazabilidad del Pasante
│   └── profesor/   # Módulo de corrección y veredicto del Docente
├── router/         # Reglas estáticas y dinámicas de Vue Router
└── stores/         # Stores atómicos de Pinia (sufijo `_vc`)
```

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

## 🌳 Workflow Git: Actualizar Rama `frontend` aisladamente

Si ambas ramas tienen la misma estructura de Monorepo (con carpetas `/frontend` y `/backend`), y necesitas actualizar la rama **local** `frontend` trayendo únicamente los cambios de tu carpeta de desarrollo para subirlos:

### 🛠️ Pasos de Sincronización Local y Push (Desde la raíz del proyecto):

1. **Cámbiate a la rama de destino**:
   ```bash
   git checkout frontend
   ```

2. **Copia/Extrae únicamente la carpeta `frontend`** de tu rama Dev (ej. `Victor-Dev-2` o `Santiago-Dev-1`):
   ```bash
   git checkout <Tu-Rama-Dev> -- frontend/
   ```

3. **Guarda los cambios**:
   ```bash
   git add frontend/
   git commit -m "frontend update"
   ```

4. **Sube los cambios al repositorio remoto**:
   ```bash
   git push origin frontend
   ```

5. **Regresa a tu rama de trabajo**:
   ```bash
   git checkout <Tu-Rama-Dev>
   ```

> 💡 **¿Por qué este método?**  
> Al copiar solo el directorio `frontend/` en la rama `frontend`, evitas mezclar código o commits del `backend` que pertenezcan a otras ramas, manteniendo la rama de frontend exclusiva y libre de conflictos cruzados de servicios.
