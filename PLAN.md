# 🧠 PLAN: AntiGravity Tech Lead

## 🎯 Objetivo General
Modificar la estructura académica inicial del sistema SENTINNEL para alinearla con la realidad de los procesos de investigación. Específicamente, eliminar el requisito "Capítulo I (Fundamentos)" de la materia "Investigación y Desarrollo", dado que los ítems subsiguientes (Contexto, Situación Problemática, Objetivos, Justificación, Delimitación) conforman lógicamente ese capítulo en su conjunto.

## 🏛️ Arquitectura de la Solución (Base de Datos / Semilla)
- Archivo afectado: `backend/prisma/seed.ts`
- Lógica de Modificación: Remover el objeto `{ nombre: 'Capítulo I (Fundamentos)' }` del arreglo de requisitos para `mat1`.
- Consecuencia secundaria: La data de prueba que depende del índice de `reqs1` (estudiantes Luis, María, Carlos, Valentina, Andrés) seguirá funcionando correctamente ya que los índices se recorrerán de forma idéntica o recaerán en el siguiente ítem válido, adaptándose a la nueva composición de 5 requisitos.

## 📋 Checklist de Implementación
- [ ] Analizar impacto visual en las simulaciones seed de estudiantes.
- [ ] Eliminar la línea de "Capítulo I (Fundamentos)".
- [ ] Ejecutar el reseteo y repoblación de DB local: `npx prisma db seed`.

## 🛡️ Buenas Prácticas y Filosofía
- Evitar redundancias académicas: Mantener el principio DRY (Don't Repeat Yourself) llevado al modelo de negocio de la universidad.
- Data Mapeo Consistente: Validar que el borrado estructural no rompa los iteradores de dependencias del seed.
