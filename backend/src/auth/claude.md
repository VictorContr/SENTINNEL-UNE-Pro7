# Manual de Arquitectura: Autenticación y Guards (Backend)

**Ubicación:** `backend/src/auth/`

## 🎯 Responsabilidad
Este módulo lidera el sistema de control de acceso perimetral. Administra la emisión, validación y descifrado de JSON Web Tokens (JWT), la definición de estrategias mediante Passport y aloja los "Guards" que vigilan quién tiene permiso para ejecutar qué endpoint.

## ⚠️ Reglas y Convenciones Estrictas

1. **Rutas Protegidas por Defecto:**
   - La regla "Zero Trust" aplica para el API. Todo controlador nuevo y endpoint debe estar decorado con `@UseGuards(JwtAuthGuard_sm_vc)` por defecto. Las únicas excepciones son las rutas de inicio de sesión (`/auth/login`) o endpoints públicos explícitamente diseñados.

2. **Control de Acceso Basado en Roles (RBAC):**
   - Para restringir la funcionalidad a roles administrativos o profesorales, se DEBE usar el `RolesGuard_sm_vc` en conjunto con el decorador personalizado `@Roles_sm_vc(RolUsuario.ADMIN, RolUsuario.PROFESOR)`.
   - El sufijo `_sm_vc` se mantiene vivo tanto en los decoradores como en los nombres de clases.

3. **Payload del Token Limpio:**
   - En el `jwt_payload_sm_vc`, solo almacena información identificatoria indispensable (ej. `id_sm_vc`, `rol_sm_vc`, `correo_sm_vc`). No saturar el token con datos de relaciones complejas u objetos extensos.

4. **TypeScript Sensato:**
   - Interfaces rígidas y DTOs bien tipados deben avalar las solicitudes de credenciales antes del procesamiento del hash bcrypt.
