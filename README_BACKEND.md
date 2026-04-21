# ⚙️ SENTINNEL-UNE | Backend & Core Engine
> **El Motor Central y Cerebro Transaccional del Sistema de Pasantías**

## 🚀 Vision Pitch
El backend de SENTINNEL-UNE es la muralla infranqueable de la lógica de negocio académica. Diseñado para no confiar en nadie —ni siquiera en su propio frontend—, esta arquitectura se erige sobre principios sólidos de tipado estricto, validación "Fail-Fast" y trazabilidad absoluta. No es solo una API; es el árbitro final, seguro e inmutable de las evaluaciones universitarias.

## 🛠️ Stack Tecnológico Justificado

Las decisiones estructurales del núcleo de datos priorizan la seguridad operacional y la concurrencia.

| Tecnología | Rol Arquitectónico | Justificación Técnica |
| :--- | :--- | :--- |
| **NestJS** | Framework de Desarrollo Node.js | Impone una estructura opinada y fuertemente modular con Inyección de Dependencias, la cual evita el código "espagueti" que plaga a Express.js tradicional. |
| **TypeScript Estricto** | Regla de Tipado | Tolerancia cero al tipo puro `any`. Garantiza certidumbre estructural y previene el 90% de los errores en tiempo de compilación. |
| **Prisma ORM** | Capa de Mapeo a BD | Otorga seguridad de tipos y completado desde la base de datos hasta los Services, impidiendo vulnerabilidades nativas de SQL Injection de forma inherente. |
| **PostgreSQL** | Motor de Base de Datos | Fiel y estricto cumplimiento del teorema ACID, manejando el modelo de negocio relacional con alta eficiencia. |

## 🏗️ Arquitectura y Patrones (Modular Clean Architecture)

El equipo aplica una separación de responsabilidades quirúrgica:

- **Controladores Limpios ("Dumb Controllers"):** En este proyecto, el Controller tiene prohibido tocar lógica de negocio. Solo intercepta la red, valida la estructura del payload (DTO) e invoca métodos de Service.
- **Servicios Pesados ("Smart Services"):** Albergan toda la complejidad ciclomática. Manejan transacciones de Prisma, consultas externas y generación de errores HTTP pormenorizados (Patrón Unit of Work).
- **Validación "Fail-Fast" con Class-Validator y DTOs:** Usamos decoradores inflexibles. Si un dato llega manchado, no existe procesamiento; se rechaza la llamada perimetralmente con HTTP 400 antes de ejecutar ciclos de CPU en el Service.

```typescript
// Ejemplo Muestra: DTO Strict Payload
export class EvaluarDocumentoDto_sm_vc {
  @IsUUID()
  @IsNotEmpty()
  entrega_id_sm_vc: string;
}
```

## 🔄 Máquina de Estados: El Conflicto "Observaciones vs Reprobado"

Uno de los mayores logros del proyecto es la resolución sistemática en el proceso de evaluación, evitando la destrucción accidental del flujo del alumno.

> [!CAUTION]
> **El Problema Semántico Histórico:**
> Históricamente, el sistema tendía a colapsar el estado de rechazo. "Reprobar un ensayo" y "Reprobar la materia" eran ambiguos. La arquitectura introdujo una máquina de estados disjunta:
> 
> 1. **Estado `OBSERVACIONES` (Ciclo de Corrección):** Se emplea estrictamente para comunicar que un requisito individual adolece de errores. Activa las notificaciones automáticas y deja la compuerta abierta para la subida de un nuevo intento del archivo original.
> 2. **Estado `REPROBADO` (Terminación Definitiva):** Se reserva **exclusivamente** para el fallo estructural o académico de la Pasantía completa. Representa una bandera letal (Kill-Switch) en la base de datos, congelando el UI y exigiendo recursar la materia.

## 🛡️ Seguridad, Despliegue e Infraestructura

Las operaciones en producción no admiten negociación con vectores de ataque:

- **Guards JWT Restrictivos:** Las rutas están protegidas criptográficamente a nivel de endpoint. La aplicación **no confía** en los roles autoproclamados, sino que decodifica dinámicamente el Payload firmado por el servidor para autorizar operaciones (Role-Based Access Control).
- **Timezones Controlados:** Centralización absoluta de los temporizadores o validaciones Date, para destruir el infame "Solapamiento de Zonas Horarias". Un cierre de período expira cuando el núcleo marca el reloj local validado, nunca con GMT flotantes.
- **Proxy Inverso en Infraestructura Nginx + Helmet:**
  - **Helmet:** Inyecta cabeceras `HSTS`, deshabilita `X-Powered-By` y anula el Clickjacking mediante `X-Frame-Options`.
  - **Nginx:** Cortafuegos que envuelve el puerto encriptado (SSL/TLS), gestiona certificados de manera opaca contra el mundo exterior y funciona como balanceador de carga preventivo.
