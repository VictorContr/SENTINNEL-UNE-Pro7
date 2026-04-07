# 📄 PLAN.md - Sistema SENTINNEL - Población y Consistencia de Datos

## 🎯 Objetivo General
Restaurar y poblar la base de datos local con datos maestros y casos de prueba críticos, asegurando que la lógica de elegibilidad para despliegue (`puede_hacer_deploy_sm_vc`) sea calculada correctamente.

## 🏗️ Arquitectura de la Solución
- **Mecanismo:** Script de Seeding en TypeScript (`prisma/seed.ts`).
- **Estrategia:** 
  1. Truncado de tablas en orden inverso de dependencias (Integridad Referencial).
  2. Carga de configuración global y materias secuenciales UNE.
  3. Creación de perfiles de usuario (Admin, Profesores, Estudiantes).
  4. Simulación de flujo académico completo para el usuario de prueba de despliegue.
  5. Sincronización proactiva de flags de negocio basada en el estado de las entregas.
- **Herramientas:** `PrismaClient`, `ts-node`, `bcryptjs`.

## ✅ Checklist de Implementación
- [x] Auditoría técnica de `seed.ts`.
- [x] Verificación de consistencia de sufijos `_sm_vc` en `schema.prisma`.
- [ ] Ejecución de `npx prisma db seed`.
- [ ] Verificación de registros en base de datos (PostgreSQL).
- [ ] Prueba de login con credenciales sembradas (`deploy@estudiante.une.edu.ve`).

## 🛠️ Buenas Prácticas Aplicadas
- **Limpieza Transaccional:** El seed limpia los registros previos en una sola transacción para evitar estados huérfanos.
- **Hashing de Seguridad:** Las contraseñas se almacenan con Round 10 de Salt (Bcrypt).
- **Lógica Centralizada:** El flag de despliegue no se asigna manualmente, sino que se calcula comparando entregas finales contra el total de requisitos.
