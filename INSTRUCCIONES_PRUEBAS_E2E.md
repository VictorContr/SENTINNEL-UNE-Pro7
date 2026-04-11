# 🧪 INSTRUCCIONES PARA PRUEBAS E2E - MÓDULO DE CHAT SENTINNEL

## 📋 CREDENCIALES DE PRUEBA (del seed ejecutado)

### Estudiante (Luis Ramírez)
- **Correo**: `luis@une.edu.ve`
- **Clave**: `Est@2025!`
- **ID Estudiante**: 1
- **Materia Activa**: 1 (Investigación y Desarrollo)

### Profesor (Ana Torres)
- **Correo**: `ana.torres@une.edu.ve`
- **Clave**: `Prof@2025!`

### Admin (Carlos Mendoza)
- **Correo**: `admin@une.edu.ve`
- **Clave**: `Admin@2025!`

---

## 🎯 ESCENARIOS A EJECUTAR

### 🧪 Escenario 1: Tiempo Real y Simetría (Profesor <-> Estudiante)

**Pasos:**
1. Abre una pestaña/incógnito y logueate como **Estudiante** (luis@une.edu.ve)
2. Navega a la vista de Trazabilidad del estudiante
3. Abre una **SEGUNDA pestaña/incógnito** y logueate como **Profesor** (ana.torres@une.edu.ve)
4. Desde la vista del profesor, navega a: `http://localhost:9000/profesor/estudiantes/1/materia/1/conversacion`
5. En la ventana del **Profesor**, escribe un mensaje de prueba y envíalo
6. **Verificación**: Confirma que el mensaje aparece inmediatamente en la ventana del **Estudiante** SIN recargar la página

**Resultado esperado**: ✅ Mensaje aparece en tiempo real en ambas ventanas

---

### 🧪 Escenario 2: UX e Indicador de Escritura

**Pasos:**
1. Mantén las dos ventanas abiertas (Estudiante y Profesor en la misma conversación)
2. En la ventana del **Estudiante**, comienza a teclear en el input de mensaje sin enviar
3. **Verificación**: Observa si aparece el indicador "escribiendo..." en la ventana del **Profesor**
4. Deja de escribir y verifica que el indicador desaparece

**Resultado esperado**: ✅ Indicador `typing_sm_vc` aparece y desaparece correctamente

---

### 🧪 Escenario 3: Subida y Descarga de Archivos

**Pasos:**
1. En la ventana del **Estudiante**, busca el formulario de subir documento
2. Adjunta un PDF de prueba y envíalo
3. **Verificación 1**: El mensaje llega al **Profesor** con el botón de "Descargar"
4. **Verificación 2**: Haz clic en "Descargar" y verifica que el archivo se descarga correctamente
5. **Verificación 3**: El endpoint `/api/documentos/:id/descargar` debe responder HTTP 200

**Resultado esperado**: ✅ Archivo subido, visible en profesor, descargable

---

### 🧪 Escenario 4: Seguridad (El Candado del Admin)

**Pasos:**
1. Abre una **TERCERA pestaña/incógnito** y logueate como **Admin** (admin@une.edu.ve)
2. Navega a la misma conversación: `http://localhost:9000/profesor/estudiantes/1/materia/1/conversacion`
3. **Verificación 1**: Confirma que la interfaz muestra el banner de "Modo Supervisor" o similar
4. **Verificación 2**: Confirma que los inputs de chat NO están visibles (solo lectura)
5. **Verificación 3 (Hacking interno)**: Abre la consola del navegador (F12) y ejecuta:
   ```javascript
   // Intentar forzar envío usando el store
   const chatStore = window.$nuxt?.$pinia?.state.value?.chat_sm_vc;
   if (chatStore) {
     chatStore.enviarMensaje_sm_vc('Mensaje hackeado desde admin', 1);
   }
   ```
6. **Verificación 4**: El backend debe rechazar el mensaje y aparecer un Notify rojo con el error

**Resultado esperado**: ✅ Admin en modo solo lectura, intento de bypass bloqueado

---

### 🧪 Escenario 5: Resiliencia (Caída del Servidor)

**Pasos:**
1. Con las ventanas del Estudiante y Profesor abiertas en la conversación
2. **Acción**: Ve al terminal donde corre el backend y detén el servidor (Ctrl+C)
3. **Verificación 1**: Confirma que aparece inmediatamente un `<q-banner>` amarillo/rojo avisando de "Conexión perdida"
4. **Acción**: Reinicia el servidor backend (`npm run start:dev` en el directorio backend)
5. **Verificación 2**: Confirma que el banner de desconexión desaparece automáticamente al reconectar

**Resultado esperado**: ✅ Banner de desconexión aparece y desaparece correctamente

---

## 📊 REPORTE DE RESULTADOS

Después de ejecutar cada escenario, anota:
- ✅ **PASÓ**: Funcionó correctamente
- ❌ **FALLÓ**: No funcionó como esperado (describe el error)
- ⚠️ **PARCIAL**: Funcionó parcialmente (describe lo que sí funcionó)

---

## 🔍 OBSERVACIONES ADICIONALES

- ¿Hubo algún error en la consola del navegador?
- ¿Los mensajes aparecen en el orden correcto?
- ¿La reconexión automática funciona después de desconectar?
- ¿Los archivos MOCK muestran el badge correspondiente?

---

## 📝 NOTAS TÉCNICAS

- **Backend**: `http://localhost:4000/api`
- **Frontend**: `http://localhost:9000`
- **WebSocket Namespace**: `/chat_sm_vc`
- **Room Pattern**: `conv:{estudianteId}:{materiaId|'global'}`
