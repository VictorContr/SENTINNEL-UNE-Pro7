# 🚀 Walkthrough (Bitácora de Vuelo)

## 📌 Contexto
Se solicitó remover un requisito global ("Capítulo I") debido a que su desglose funcional ya se encuentra mapeado en el resto de los entregables de la materia (Contexto, Problema, Objetivos, etc.).

## 📝 Registro de Ejecución
1. **Revisión de `seed.ts`:**
   Mapeamos donde se declara `mat1` -> 'Investigación y Desarrollo'. Originalmente contenía 6 requisitos.

2. **Modificación Estructural:**
   Se borra el índice principal. Los métodos `simularAprobado` y `simularReprobado` del perfil de estudiantes seguirán consumiendo los `reqs1[0]`, `reqs1[1]`, etc., que ahora equivalen directamente a cosas accionables ("Contexto Organizacional", "Situación Problemática", etc.). Esto es perfecto porque ahora un simulacro de error rebotará en un apartado específico en vez de uno abstracto.

3. **Re-sembrado de Base de Datos:**
   Se aplicará el comando en el backend para limpiar la DB y recrear la nueva trazabilidad correcta.

## 📉 Evaluaciones y Revisiones Pendientes
- Esperar feedback del comando `npx prisma db seed` para asegurar que el cambio de longitud del array de requisitos no impacte los loops más avanzados (`casiGraduadoData`). Al ser iteraciones dinámicas, no debería haber problemas.
