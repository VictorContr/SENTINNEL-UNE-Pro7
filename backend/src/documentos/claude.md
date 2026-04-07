# Manual de Arquitectura: Documentos y Entregables (Backend)

**Ubicación:** `backend/src/documentos/`

## 🎯 Responsabilidad
Recepción, formateo, verificación de integridad y almacenamiento físico/lógico de las tesis, informes, manuales y cualquier requerimiento evaluable de carácter ofimático o bibliográfico exigido por las asignaturas.

## ⚠️ Reglas y Convenciones Estrictas

1. **Ecosistema Multer Estricto:**
   - Todo ingreso documental usará el filtro de `Multer` como interceptor. Las reglas deben imponerse severamente: **Rechazar inmediato todo MIME type que no sea `application/pdf`**.
   - **Límite de Carga Hardcoded**: Establecer validación contra un peso bruto no mayor a **10 MB** (A menos que sea el deploy en código fuente, cuyo módulo tiene sus propias reglas de 50MB).

2. **Rutas Bi-Direccionales (Metadatos):**
   - Jamás se almacenará el archivo en base de datos como Blob.
   - Guardar en la DB de Postgre (usando Prisma) **exclusivamente la ruta unívoca** (`pathUrl_sm_vc`) enlazada semánticamente a `estudiante_id_sm_vc` y `materia_id_sm_vc`.

3. **Nombrado Deterministico Anticolisión:**
   - Todo archivo procesado será rebautizado según la entropía: `[TIMESTAMP]_[CEDULA_ESTUDIANTE]_DOCUMENTO_sm_vc.pdf`. No se respeta el nombre original dado por el estudiante mitigando caracteres extraños y espaciados vulnerables. 

4. **Variables y Modelado:**
   - Cualquier dto o buffer que deambule localmente llevará un sufijo `_sm_vc`, ejemplo: `archivo_enviado_sm_vc`, `ruta_final_sm_vc`.
