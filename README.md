# SENTINNEL
**Sistema de Gestión y Trazabilidad de Informes de Pasantías**  
Universidad Nueva Esparta · Prototipo SPA v1.0

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework UI | Vue 3 Composition API (`<script setup>`) |
| Componentes | Quasar Framework v2 |
| Estado Global | Pinia |
| Enrutamiento | Vue Router 4 |
| Tipografía | IBM Plex Mono / IBM Plex Sans |
| Paleta | Dark Mode `#0b132b` / Teal `#6fffe9` / `#5bc0be` |

---

## Instalación Rápida

```bash
# 1. Crear proyecto base con Quasar CLI
npm create quasar@latest sentinnel
# Elegir: Vue 3 · Vite · SPA · TypeScript: No · ESLint: sí

# 2. Instalar dependencias adicionales
cd sentinnel
npm install pinia

# 3. Copiar el contenido de este src/ sobre el scaffolding
# (reemplaza src/App.vue, src/main.js, etc.)
cp -r sentinnel-src/* src/

# 4. Ejecutar en desarrollo
quasar dev
# → http://localhost:9000
```

---

## Credenciales de Demo

| Rol | Correo | Contraseña |
|-----|--------|-----------|
| Administrador | `admin@une.edu.ve` | `admin123` |
| Profesor | `profesor@une.edu.ve` | `prof123` |
| Estudiante | `estudiante@une.edu.ve` | `est123` |

---

## Arquitectura de Archivos

```
src/
├── main.js                        # Bootstrap: Vue + Quasar + Pinia + Router
├── App.vue                        # Root component + estilos globales
│
├── router/
│   └── index.js                   # Rutas + Navigation Guard (roles)
│
├── stores/
│   ├── authStore.js               # Autenticación, sesión, roles
│   ├── notificacionesStore.js     # Alertas filtradas por receptor_id_sm_vc
│   └── pasantiasStore.js          # Materias, Progreso, Conversaciones, Deploy
│
├── layouts/
│   └── MainLayout.vue             # Drawer responsivo + Header + menú por rol
│
├── views/
│   ├── LoginView.vue              # Split screen + Canvas animado
│   ├── NotificacionesView.vue     # Dashboard de alertas (todos los roles)
│   │
│   ├── admin/
│   │   ├── UsuariosView.vue       # q-table + Soft-delete (banear)
│   │   └── CargaMasivaView.vue    # q-stepper (Usuarios → Materias → Requisitos)
│   │
│   ├── profesor/
│   │   ├── EstudiantesView.vue    # Grid de tarjetas + filtros reactivos
│   │   ├── TrazabilidadView.vue   # Progreso 3 materias + tabs (conv/deploy)
│   │   ├── ConversacionView.vue   # Chat documental (wrapper)
│   │   └── DeployView.vue        # Deploy del estudiante (solo lectura)
│   │
│   └── estudiante/
│       ├── TrazabilidadView.vue   # Panel de progreso + panel de envío
│       ├── HistorialView.vue      # Conversación en modo solo lectura
│       └── DeployView.vue        # Formulario deploy + preflight checklist
│
└── components/
    └── shared/
        ├── DocumentConversacion.vue  # Chat de archivos (reusable, soporta readonly)
        └── MateriaProgressCard.vue   # Tarjeta de materia con progreso (reusable)
```

---

## Modelo de Datos (Convención de Sufijos Prisma)

Las variables reactivas que mapean con la BD respetan los sufijos:

| Sufijo | Tipo | Ejemplo |
|--------|------|---------|
| `_sm_vc` | `String` / `varchar` | `id_sm_vc`, `nombre_sm_vc` |
| `_sm_int` | `Int` | `orden_sm_int`, `intentos_sm_int` |
| `_sm_dec` | `Decimal` / `Float` | `nota_sm_dec`, `progreso_sm_dec` |
| `_sm_bool` | `Boolean` | `activo_sm_vc`, `obligatorio_sm_vc` |

---

## Flujo de la Conversación Documental

```
ESTUDIANTE                    PROFESOR
    │                            │
    │── enviarInforme() ────────>│
    │   (tipo: INFORME)          │
    │                            │── responderCorreccion()
    │                            │   (tipo: CORRECCION)
    │<─────────────────────────────   estado: OBSERVACIONES | APROBADO | REPROBADO
    │
    │ Si APROBADO → progreso_sm[materia].estado = 'APROBADO'
    │ Si REPROBADO → estudiante reenvía nueva versión
```

---

## Protección de Rutas (Navigation Guard)

```javascript
// router/index.js — beforeEach
1. Ruta pública (requiresAuth: false) → pasar (redirigir a /notificaciones si ya autenticado)
2. Ruta privada sin sesión → redirigir a /login
3. Ruta con roles requeridos → verificar auth.user.rol_sm_vc
   - roles: [] → cualquier usuario autenticado
   - roles: ['ADMINISTRADOR'] → solo admins
   - roles: ['PROFESOR'] → solo profesores
   - roles: ['ESTUDIANTE'] → solo estudiantes
```

---

## Política de Soft-Delete

Por temas de **auditoría**, el sistema **no elimina usuarios**. En su lugar:

- `UsuariosView.vue` → botón **"Revocar Permisos"** hace `activo_sm_vc = false`
- `authStore.banUser(id)` → actualiza el flag sin borrar el registro
- El Navigation Guard rechaza login si `activo_sm_vc === false`
- **No existe ningún botón DELETE en toda la aplicación**

---

*SENTINNEL © UNE — Prototipo educativo, datos simulados.*
