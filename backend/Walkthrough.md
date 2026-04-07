# 📄 Walkthrough.md - Bitácora de Vuelo

## 🚀 Estado Actual
- **Fase:** Población de Datos y Verificación de Reglas de Negocio.
- **Acción:** Revisión técnica de `seed.ts` y sincronización con el esquema actual.

## 📝 Decisiones Técnicas
- **Auditoría de Sufijos**: Se confirmó que tanto el esquema como el script de seed utilizan consistentemente el sufijo `_sm_vc` para todos los identificadores y columnas críticas, evitando errores de "Unknown column".
- **Validación del Flujo de Deploy**: Se verificó que el script no solo inserta datos, sino que valida la relación `entregas_aprobadas === total_requisitos`. Esto garantiza que los tests de frontend para el módulo de despliegue funcionen con datos reales.
- **Manejo de Transacciones**: Se decidió mantener la limpieza transaccional para asegurar que si el seed falla a mitad de camino, la base de datos no quede en un estado inconsistente.

## 🏁 Pendiente
- Ejecutar el comando de seeding.
- Validar el acceso con el usuario `deploy@estudiante.une.edu.ve`.
- Confirmar que el flag `puede_hacer_deploy_sm_vc` es true para el usuario crítico.
