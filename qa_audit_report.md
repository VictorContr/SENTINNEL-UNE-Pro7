# 🔍 SENTINNEL — Reporte de Auditoría Funcional QA
**Auditor:** AntiGravity (Senior QA Engineer & Functional Analyst)
**Fecha:** 2026-03-29
**Commit auditado:** Estado actual del repo `SENTINNEL-UNE-Pro7`
**Cobertura:** Código real leído — no conceptual. Cada hallazgo tiene referencia de línea.

---

## ÁREA 1 — Integridad de Base de Datos y Prisma

### 🔴 CRÍTICO: Archivos físicos escritos ANTES de la transacción

**Archivo:** `backend/src/deploy/deploy.service.ts` — Líneas 68–72

```ts
// Guardar archivos físicamente  ← SE EJECUTA PRIMERO
fs.writeFileSync(rutaZip_sm_vc, archivoZip.buffer);
fs.writeFileSync(rutaPdf_sm_vc, archivoPdf.buffer);

// 4. Transacción Atómica para Base de Datos  ← SE EJECUTA DESPUÉS
const resultado_sm_vc = await this.prisma.$transaction(async (tx) => { ... });
```

**¿Qué pasa si la transacción falla?**

El flujo es: disco → DB. Si la DB lanza un error (constraint violation, timeout, red caída), los archivos `.zip` y `.pdf` ya fueron escritos en `./uploads/deploys/` pero **no existe ningún registro en `tddocumento_sm_vc` que los referencie**. Son **archivos huérfanos permanentes**. No hay rollback físico. No hay cleanup en el bloque `catch`. El disco se va llenando silenciosamente.

Adicionalmente, el bloque `catch` (líneas 126–133) captura el error y lanza un `InternalServerErrorException` — pero **no borra los archivos que ya escribió**.

---

### 🟡 ADVERTENCIA: Cascadas incompletas en las relaciones clave

**Archivo:** `backend/prisma/schema.prisma`

| Relación | `onDelete` configurado | ¿Es suficiente? |
|---|---|---|
| `Conversacion → Estudiante` | ✅ `Cascade` (línea 228) | Sí — correcto |
| `Mensaje → Conversacion` | ✅ `Cascade` (línea 241) | Sí — correcto |
| **`Entrega → Estudiante`** | ❌ **NO definido** (línea 153) | **Falla silenciosa** |
| **`ProyectoDeploy → Estudiante`** | ❌ **NO definido** (línea 213) | **Falla silenciosa** |
| **`Documento → Entrega`** | ❌ **NO definido** (línea 176) | **Falla silenciosa** |

Si intentas eliminar un `Estudiante` de prueba, PostgreSQL lanzará un **Foreign Key Constraint Error** porque `Entrega`, `ProyectoDeploy` y `Documento` no tienen `onDelete: Cascade`. La eliminación simplemente falla sin un mensaje claro al usuario administrador.

---

### 🟡 ADVERTENCIA: `upsert` del Deploy recrea documentos duplicados

**Archivo:** `deploy.service.ts` — Líneas 74–115

En el bloque `update` del `upsert`, se crean **dos nuevos documentos** (`docZip` y `docPdf`) pero los documentos anteriores (referenciados en el deploy previo) quedan **huérfanos en la tabla `tddocumento_sm_vc`** y sus archivos físicos permanecen en disco. El campo `@unique` en `archivo_codigo_id_sm_vc` y `documentacion_tecnica_id_sm_vc` podría además lanzar errores si no se desvinculan primero.

---

## ÁREA 2 — Resiliencia del Backend (NestJS)

### 🔴 CRÍTICO: Riesgo de Heap Out of Memory con uploads concurrentes

**Archivo:** `backend/src/config/multer.config.ts` — Líneas 31–44

```ts
export const multerDeployConfig = {
  storage: memoryStorage(),          // ← TODO en RAM
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB por archivo
};
```

**Cálculo exacto del escenario de 5 estudiantes simultáneos:**

```
Cada estudiante sube: ZIP (50 MB) + PDF (10 MB) = 60 MB en RAM
5 estudiantes simultáneos:
  → 5 × (archivoZip.buffer + archivoPdf.buffer) = 5 × 60 MB = 300 MB
```

Node.js por defecto tiene un heap límite de ~1.5 GB (dependiendo del OS), pero el problema real es que **durante el `writeFileSync` los buffers NO se liberan** porque el GC de V8 no actúa de forma síncrona. En un VPS con 512 MB o 1 GB de RAM (configuración típica universitaria), **5 uploads simultáneos pueden colapsar el proceso entero**.

El error manifiesto sería: `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory` — Node.js muere, NestJS no levanta, todos los usuarios pierden la sesión.

---

### 🟡 ADVERTENCIA: JWT expira durante un upload largo — respuesta inconsistente

**Archivo:** `backend/src/auth/jwt.strategy.ts` — Línea 21

```ts
ignoreExpiration: false,
```

**Archivo:** `backend/src/auth/guards.ts` — Línea 10

```ts
export class JwtAuthGuard_sm_vc extends AuthGuard('jwt') {}
```

La guardia `JwtAuthGuard_sm_vc` **no sobreescribe** el método `handleRequest`. Esto significa que cuando `passport-jwt` detecta un token expirado lanza un `JsonWebTokenError` o `TokenExpiredError` internamente.

El comportamiento real: `AuthGuard('jwt')` de Passport atrapa ese error y devuelve un **401 limpio** — eso está bien. El problema está en el **frontend**, no en el backend.

**Flujo del problema:**
1. El estudiante inicia el upload de un ZIP de 50 MB.
2. La subida tarda 45 segundos (red lenta universitaria).
3. El token expira *durante* la subida (si `JWT_EXPIRES_IN` es corto, ej. `15m`).
4. El backend devuelve 401.
5. El interceptor de Axios en `axios.js` (líneas 34–39) borra el token del localStorage.
6. **Pero el store `deployStore.js` sigue con `loading_sm_vc = true`** porque el `finally` sí se ejecuta, pero el interceptor de Axios rechazó la promesa *antes* de que el `catch` del store la pudiera procesar con un mensaje útil.

El resultado percibido por el estudiante: el botón de Quasar se desbloquea (correctamente) pero la notificación de error dice `"Error al procesar el despliegue"` sin indicar que su sesión expiró, y al intentar de nuevo tampoco puede porque su token ya no existe en localStorage — queda en un limbo que requiere F5 manual.

---

### 🟢 CORRECTO: Manejo de excepciones HTTP en el service

El bloque `catch` en `deploy.service.ts` (líneas 126–133) re-lanza correctamente `NotFoundException`, `ForbiddenException` y `BadRequestException` sin envolverlas en un 500. Esto es correcto.

---

## ÁREA 3 — Reactividad y Estado en el Frontend (Vue 3 + Pinia)

### 🟢 CORRECTO: El `deployStore` SÍ tiene `finally`

**Archivo:** `frontend/src/stores/deployStore.js` — Líneas 51–53

```js
} finally {
  loading_sm_vc.value = false   // ✅ SIEMPRE se ejecuta
}
```

El botón de Quasar **NO** se queda cargando infinitamente en caso de error 400 o 500. El bloque `finally` garantiza que `loading_sm_vc` se resetea. **Este punto está bien implementado.**

---

### 🔴 CRÍTICO: El Navigation Guard NO bloquea `/estudiante/deploy` por `puede_hacer_deploy_sm_vc`

**Archivo:** `frontend/src/router/index.js` — Líneas 26–55
**Archivo:** `frontend/src/router/routes.js` — Líneas 108–113

```js
// routes.js
{
  path: "/estudiante/deploy",
  name: "estudiante-deploy",
  meta: { requiresAuth: true, roles: ["ESTUDIANTE"] },  // ← solo verifica rol
}
```

```js
// index.js — el guard SOLO verifica:
// 1. ¿Está autenticado? ✅
// 2. ¿Tiene rol ESTUDIANTE? ✅
// 3. ¿puede_hacer_deploy_sm_vc? ❌ NUNCA SE VERIFICA
```

**El guard actual no tiene ninguna lógica que lea `user_sm_vc.estudiante_sm_vc?.puede_hacer_deploy_sm_vc`.** Un estudiante que NO ha aprobado todas las materias puede navegar directamente a `/estudiante/deploy` escribiendo la URL manualmente en el navegador.

La protección existe en el backend (el `ForbiddenException` en `deploy.service.ts` línea 45), pero un estudiante inelegible puede **ver y completar el formulario de deploy**, solo fallará al hacer submit — una UX terrible e inconsistente.

---

### 🟡 ADVERTENCIA: El `authStore` no expone `puede_hacer_deploy_sm_vc` como computed

**Archivo:** `frontend/src/stores/authStore.js` — Líneas 33–42

El store tiene getters para `is_admin_sm_vc`, `is_profesor_sm_vc`, `is_estudiante_sm_vc`, pero **no tiene un getter `puede_hacer_deploy_sm_vc`** derivado del perfil del estudiante que llega en `user_sm_vc.estudiante_sm_vc`. Para implementar la protección en el router o en la UI, los componentes tienen que acceder a `auth.user_sm_vc?.estudiante_sm_vc?.puede_hacer_deploy_sm_vc` manualmente — código frágil y difícil de mantener.

---

### 🟡 ADVERTENCIA: El interceptor 401 no redirige al login

**Archivo:** `frontend/src/boot/axios.js` — Líneas 34–40

```js
if (error_sm_vc.response?.status === 401) {
  LocalStorage.remove('sentinnel_session')
  LocalStorage.remove('token_sm_vc')
  // No redirigimos aquí directamente para evitar bucles,
  // el RouterGuard se encargará
}
```

El comentario es incorrecto. El RouterGuard (`beforeEach`) **solo se ejecuta en navegación de ruta**, NO en peticiones HTTP. Si el token expira mientras el usuario está en `/estudiante/deploy` sin cambiar de ruta, el guard no se re-evalúa. El usuario queda en la página con la sesión muerta en localStorage pero sin ser redirigido a login automáticamente.

---

## ÁREA 4 — Plan de Acción: Los 3 Riesgos Más Graves

> [!CAUTION]
> Los 3 riesgos siguientes, si no se parchean, pueden causar pérdida de datos en producción, acumulación de archivos basura en disco, y usuarios bloqueados sin poder hacer deploy.

---

### 🩹 RIESGO #1 — Archivos Huérfanos en Deploy (CRÍTICO)

**Problema:** Los archivos se escriben en disco ANTES de la transacción DB. Si la DB falla, los archivos quedan huérfanos.

**Parche:** Invertir el orden — escritura a disco DENTRO o DESPUÉS de la transacción exitosa, con cleanup en caso de error.

```ts
// backend/src/deploy/deploy.service.ts
// REEMPLAZAR el método registrarDeploy_sm_vc con esta versión:

async registrarDeploy_sm_vc(
  estudianteId: number,
  dto: CrearDeployDto_sm_vc,
  archivoZip: Express.Multer.File,
  archivoPdf: Express.Multer.File,
  usuarioActorId: number,
) {
  // Variables para rastrear archivos escritos y poder borrarlos si falla
  const archivosEscritos_sm_vc: string[] = [];

  try {
    // 1. Verificaciones previas (sin cambios)
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id_sm_vc: estudianteId },
      include: { usuario: true },
    });
    if (!estudiante) throw new NotFoundException(`Estudiante ${estudianteId} no encontrado.`);
    if (!estudiante.puede_hacer_deploy_sm_vc)
      throw new ForbiddenException('No tienes permiso para realizar el deploy.');
    if (!archivoZip || !archivoPdf)
      throw new BadRequestException('Se requieren ambos archivos: ZIP y PDF.');

    // 2. Preparar rutas pero NO escribir todavía
    const uploadDir_sm_vc = path.join(process.cwd(), 'uploads', 'deploys');
    fs.mkdirSync(uploadDir_sm_vc, { recursive: true });

    const timestamp_sm_vc = Math.floor(Date.now() / 1000);
    const cedula_sm_vc = estudiante.usuario.cedula_sm_vc;
    const nombreZip_sm_vc = `${timestamp_sm_vc}_${cedula_sm_vc}_ZIP_sm_vc${path.extname(archivoZip.originalname)}`;
    const nombrePdf_sm_vc = `${timestamp_sm_vc}_${cedula_sm_vc}_PDF_sm_vc${path.extname(archivoPdf.originalname)}`;
    const rutaZip_sm_vc = path.join(uploadDir_sm_vc, nombreZip_sm_vc);
    const rutaPdf_sm_vc = path.join(uploadDir_sm_vc, nombrePdf_sm_vc);

    // 3. Transacción DB PRIMERO — si falla, no toca el disco
    const resultado_sm_vc = await this.prisma.$transaction(async (tx) => {
      const docZip = await tx.documento.create({
        data: {
          usuario_subida_id_sm_vc: usuarioActorId,
          tipo_sm_vc:              TipoDocumento.CODIGO_ZIP,
          nombre_archivo_sm_vc:    nombreZip_sm_vc,
          ruta_archivo_sm_vc:      rutaZip_sm_vc,
          tamanio_bytes_sm_vc:     archivoZip.size,
          mime_type_sm_vc:         archivoZip.mimetype,
        },
      });
      const docPdf = await tx.documento.create({
        data: {
          usuario_subida_id_sm_vc: usuarioActorId,
          tipo_sm_vc:              TipoDocumento.DOCUMENTACION_DEPLOY,
          nombre_archivo_sm_vc:    nombrePdf_sm_vc,
          ruta_archivo_sm_vc:      rutaPdf_sm_vc,
          tamanio_bytes_sm_vc:     archivoPdf.size,
          mime_type_sm_vc:         archivoPdf.mimetype,
        },
      });
      return await tx.proyectoDeploy.upsert({
        where:  { estudiante_id_sm_vc: estudianteId },
        create: {
          estudiante_id_sm_vc:            estudianteId,
          url_produccion_sm_vc:           dto.url_produccion_sm_vc,
          archivo_codigo_id_sm_vc:        docZip.id_sm_vc,
          documentacion_tecnica_id_sm_vc: docPdf.id_sm_vc,
        },
        update: {
          url_produccion_sm_vc:           dto.url_produccion_sm_vc,
          archivo_codigo_id_sm_vc:        docZip.id_sm_vc,
          documentacion_tecnica_id_sm_vc: docPdf.id_sm_vc,
          fecha_deploy_sm_vc:             new Date(),
        },
        include: { archivoCodigo: true, documentacionTecnica: true },
      });
    });

    // 4. Solo si la transacción fue exitosa → escribir al disco
    fs.writeFileSync(rutaZip_sm_vc, archivoZip.buffer);
    archivosEscritos_sm_vc.push(rutaZip_sm_vc);

    fs.writeFileSync(rutaPdf_sm_vc, archivoPdf.buffer);
    archivosEscritos_sm_vc.push(rutaPdf_sm_vc);

    // 5. Emitir evento de trazabilidad
    this.eventEmitter_sm_vc.emit('deploy.completado_sm_vc', {
      estudianteId,
      descripcion_sm_vc: `Deploy registrado. URL: ${dto.url_produccion_sm_vc}`,
      url_sm_vc: dto.url_produccion_sm_vc,
    });

    return this.generarRespuesta_sm_vc(resultado_sm_vc);

  } catch (error) {
    // CLEANUP: Si la escritura al disco falló a mitad, borrar lo que sí se escribió
    for (const ruta_sm_vc of archivosEscritos_sm_vc) {
      try { fs.unlinkSync(ruta_sm_vc); } catch { /* ignorar si ya no existe */ }
    }

    if (
      error instanceof NotFoundException ||
      error instanceof ForbiddenException ||
      error instanceof BadRequestException
    ) throw error;

    throw new InternalServerErrorException('Error al procesar el deploy en el servidor.');
  }
}
```

---

### 🩹 RIESGO #2 — Riesgo de OOM con memoryStorage (CRÍTICO)

**Problema:** 5 uploads simultáneos de 60 MB cada uno = 300 MB en heap de Node.js.

**Parche:** Migrar `multerDeployConfig` a `diskStorage` directamente. Los archivos se guardan al disco en streaming, sin pasar por RAM.

```ts
// backend/src/config/multer.config.ts
// REEMPLAZAR multerDeployConfig con esta versión:

import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// ⚠️ NOTA: Al usar diskStorage, en deploy.service.ts ya NO tendrás archivoZip.buffer
// En cambio tendrás archivoZip.path y archivoZip.filename (Multer los rellena).
// La escritura fs.writeFileSync se elimina — Multer ya la hizo.
export const multerDeployConfig = {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      const dest = join(process.cwd(), 'uploads', 'deploys');
      ensureDir(dest);
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      // Nombre temporal; el service lo renombrará con la cédula del estudiante
      const unique_sm_vc = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `tmp_${unique_sm_vc}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = [
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream',
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new BadRequestException('Solo se aceptan archivos ZIP y PDF.'), false);
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
};
```

Y en `deploy.service.ts`, reemplazar la escritura de buffer con un renombrado atómico:

```ts
// En lugar de: fs.writeFileSync(rutaZip_sm_vc, archivoZip.buffer)
// Usar: fs.renameSync (mueve el archivo temporal de Multer al nombre definitivo)

// 4. Renombrar archivos temporales al nombre definitivo (operación atómica, sin leer RAM)
fs.renameSync(archivoZip.path, rutaZip_sm_vc);
archivosEscritos_sm_vc.push(rutaZip_sm_vc);

fs.renameSync(archivoPdf.path, rutaPdf_sm_vc);
archivosEscritos_sm_vc.push(rutaPdf_sm_vc);
```

> [!IMPORTANT]
> Al migrar a `diskStorage`, `archivoZip.buffer` ya no existirá — será `undefined`. El campo `archivoZip.path` contendrá la ruta temporal. Actualizar el service en consecuencia o la app lanzará un error silencioso al intentar escribir `undefined` al buffer.

---

### 🩹 RIESGO #3 — Navigation Guard sin control de `puede_hacer_deploy_sm_vc` (CRÍTICO)

**Problema:** Un estudiante inelegible puede acceder a `/estudiante/deploy` manualmente.

**Parche en 2 pasos:**

**Paso A:** Agregar el getter en `authStore.js`:

```js
// frontend/src/stores/authStore.js
// Agregar dentro del bloque de Getters:

const puede_hacer_deploy_sm_vc = computed(() =>
  user_sm_vc.value?.estudiante_sm_vc?.puede_hacer_deploy_sm_vc === true
)

// Y exponerlo en el return:
return {
  // ... todo lo anterior ...
  puede_hacer_deploy_sm_vc,
}
```

**Paso B:** Modificar la ruta en `routes.js` para incluir el meta:

```js
// frontend/src/router/routes.js
{
  path: "/estudiante/deploy",
  name: "estudiante-deploy",
  component: () => import("src/pages/estudiante/DeployPage.vue"),
  meta: {
    requiresAuth: true,
    roles: ["ESTUDIANTE"],
    requiresDeploy: true,  // ← nueva bandera
  },
},
```

**Paso C:** Ampliar el guard en `index.js`:

```js
// frontend/src/router/index.js
// Agregar dentro de Router.beforeEach, DESPUÉS de la verificación de roles:

// Verificar habilitación de deploy
if (to.meta.requiresDeploy) {
  const auth = useAuthStore()
  if (!auth.puede_hacer_deploy_sm_vc) {
    // Redirigir a trazabilidad con mensaje informativo
    Notify.create({
      type: 'warning',
      message: 'Debes aprobar todos los requisitos académicos antes de acceder al módulo de Deploy.',
      position: 'top',
    })
    return { name: 'estudiante-trazabilidad' }
  }
}

return true
```

> [!NOTE]
> Para usar `Notify` en el router, importar: `import { Notify } from 'quasar'` al inicio de `index.js`.

---

### 🩹 BONUS: Redireccionamiento automático al expirar el JWT

**Archivo:** `frontend/src/boot/axios.js`

```js
// Reemplazar el bloque del interceptor 401:
api.interceptors.response.use(
  (response_sm_vc) => response_sm_vc,
  async (error_sm_vc) => {
    if (error_sm_vc.response?.status === 401) {
      LocalStorage.remove('sentinnel_session')
      LocalStorage.remove('token_sm_vc')

      // Redirigir activamente al login con mensaje claro
      // Importar router dinámicamente para evitar dependencia circular
      const { Router } = await import('src/router')
      Notify.create({
        type: 'warning',
        message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        position: 'top',
      })
      // Usar window.location para un reset limpio del estado de Pinia
      window.location.href = '/#/login'
    }
    return Promise.reject(error_sm_vc)
  }
)
```

---

## Resumen Ejecutivo

| # | Riesgo | Severidad | Área | Estado |
|---|---|---|---|---|
| 1 | Archivos físicos escritos antes de la transacción DB → huérfanos en disco | 🔴 CRÍTICO | Backend | **Sin parchear** |
| 2 | `memoryStorage` en uploads concurrentes → Heap OOM en producción | 🔴 CRÍTICO | Backend | **Sin parchear** |
| 3 | Guard de ruta no verifica `puede_hacer_deploy_sm_vc` | 🔴 CRÍTICO | Frontend | **Sin parchear** |
| 4 | Cascadas `onDelete` faltantes en `Entrega`, `ProyectoDeploy`, `Documento` | 🟡 ALTO | DB/Prisma | **Sin parchear** |
| 5 | Interceptor 401 borra token pero no redirige al login | 🟡 ALTO | Frontend | **Parcial** |
| 6 | `upsert` de deploy crea documentos duplicados sin limpiar los anteriores | 🟡 ALTO | Backend | **Sin parchear** |
| 7 | `authStore` no expone getter `puede_hacer_deploy_sm_vc` | 🟠 MEDIO | Frontend | **Sin parchear** |
| 8 | JWT expira durante upload largo → mensaje de error no informativo | 🟠 MEDIO | Frontend | **Parcial** |
