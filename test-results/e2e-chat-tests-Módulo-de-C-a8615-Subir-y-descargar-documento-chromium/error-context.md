# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-chat-tests.spec.js >> Módulo de Chat E2E - SENTINNEL >> Escenario 3: Archivos - Subir y descargar documento
- Location: e2e-chat-tests.spec.js:189:3

# Error details

```
Error: browserContext.close: Target page, context or browser has been closed
```

# Test source

```ts
  144 |     const contextEstudiante = await browser.newContext();
  145 |     const contextProfesor = await browser.newContext();
  146 |     
  147 |     const pageEstudiante = await contextEstudiante.newPage();
  148 |     const pageProfesor = await contextProfesor.newPage();
  149 |     
  150 |     try {
  151 |       // Login ambos usuarios
  152 |       await login(pageEstudiante, CREDENTIALS.ESTUDIANTE.correo, CREDENTIALS.ESTUDIANTE.clave);
  153 |       await login(pageProfesor, CREDENTIALS.PROFESOR.correo, CREDENTIALS.PROFESOR.clave);
  154 |       
  155 |       // Navegar a conversación
  156 |       await pageProfesor.goto(`${BASE_URL}/profesor/estudiantes/${CREDENTIALS.ESTUDIANTE.id}/materia/${CREDENTIALS.ESTUDIANTE.materiaId}/conversacion`);
  157 |       await pageProfesor.waitForTimeout(2000);
  158 |       
  159 |       // Simular typing del estudiante
  160 |       const inputMensaje = pageEstudiante.locator('textarea, input[type="text"]').first();
  161 |       if (await inputMensaje.isVisible()) {
  162 |         await inputMensaje.type('escribiendo...');
  163 |         console.log('  ✓ Estudiante comenzó a escribir');
  164 |         
  165 |         // Esperar indicador de typing en el profesor
  166 |         await pageProfesor.waitForTimeout(2000);
  167 |         
  168 |         // Buscar indicador "escribiendo..." o similar
  169 |         const typingIndicator = await pageProfesor.locator('text=/escribiendo/i, text=/typing/i').count() > 0;
  170 |         console.log('  ✓ Indicador de escritura visible en Profesor:', typingIndicator);
  171 |         
  172 |         // Dejar de escribir
  173 |         await inputMensaje.fill('');
  174 |         await pageEstudiante.waitForTimeout(1000);
  175 |       } else {
  176 |         console.log('  ⚠️  No se encontró input de mensaje');
  177 |       }
  178 |       
  179 |     } finally {
  180 |       await contextEstudiante.close();
  181 |       await contextProfesor.close();
  182 |     }
  183 |   });
  184 | 
  185 |   // ══════════════════════════════════════════════════════════════════
  186 |   // ESCENARIO 3: Subida y Descarga de Archivos
  187 |   // ══════════════════════════════════════════════════════════════════
  188 |   
  189 |   test('Escenario 3: Archivos - Subir y descargar documento', async ({ browser }) => {
  190 |     console.log('\n🧪 Escenario 3: Subida y Descarga de Archivos');
  191 |     
  192 |     const contextEstudiante = await browser.newContext();
  193 |     const pageEstudiante = await contextEstudiante.newPage();
  194 |     
  195 |     try {
  196 |       // Login Estudiante
  197 |       await login(pageEstudiante, CREDENTIALS.ESTUDIANTE.correo, CREDENTIALS.ESTUDIANTE.clave);
  198 |       
  199 |       // Navegar a trazabilidad
  200 |       await pageEstudiante.goto(`${BASE_URL}/estudiante/trazabilidad`);
  201 |       await pageEstudiante.waitForTimeout(2000);
  202 |       
  203 |       // Buscar botón de subir archivo o formulario
  204 |       const uploadButton = pageEstudiante.locator('text=/subir/i, text=/adjuntar/i, input[type="file"]').first();
  205 |       
  206 |       if (await uploadButton.isVisible()) {
  207 |         console.log('  ✓ Formulario de subida encontrado');
  208 |         
  209 |         // Crear archivo PDF de prueba
  210 |         const testFile = Buffer.from('%PDF-1.4\n%Test PDF file for E2E testing\n%%EOF');
  211 |         
  212 |         // Subir archivo
  213 |         const fileInput = pageEstudiante.locator('input[type="file"]').first();
  214 |         if (await fileInput.isVisible()) {
  215 |           await fileInput.setInputFiles({
  216 |             name: 'test_e2e.pdf',
  217 |             mimeType: 'application/pdf',
  218 |             buffer: testFile,
  219 |           });
  220 |           console.log('  ✓ Archivo seleccionado');
  221 |           
  222 |           // Enviar
  223 |           const sendButton = pageEstudiante.locator('button:has-text("Enviar"), button:has-text("Subir")').first();
  224 |           if (await sendButton.isVisible()) {
  225 |             await sendButton.click();
  226 |             await pageEstudiante.waitForTimeout(3000);
  227 |             console.log('  ✓ Archivo enviado');
  228 |           }
  229 |         }
  230 |       } else {
  231 |         console.log('  ⚠️  No se encontró formulario de subida en vista actual');
  232 |       }
  233 |       
  234 |       // Verificar endpoint de descarga
  235 |       const token = await getAuthToken(CREDENTIALS.ESTUDIANTE.correo, CREDENTIALS.ESTUDIANTE.clave);
  236 |       const downloadResponse = await fetch(`${API_URL}/documentos/1/descargar`, {
  237 |         headers: { Authorization: `Bearer ${token}` },
  238 |       });
  239 |       
  240 |       console.log('  ✓ Endpoint /documentos/:id/descargar responde:', downloadResponse.status);
  241 |       expect(downloadResponse.status).toBe(200);
  242 |       
  243 |     } finally {
> 244 |       await contextEstudiante.close();
      |       ^ Error: browserContext.close: Target page, context or browser has been closed
  245 |     }
  246 |   });
  247 | 
  248 |   // ══════════════════════════════════════════════════════════════════
  249 |   // ESCENARIO 4: Seguridad (El Candado del Admin)
  250 |   // ══════════════════════════════════════════════════════════════════
  251 |   
  252 |   test('Escenario 4: Seguridad - Verificar restricciones de Admin', async ({ browser }) => {
  253 |     console.log('\n🧪 Escenario 4: Seguridad - Candado del Admin');
  254 |     
  255 |     const contextAdmin = await browser.newContext();
  256 |     const pageAdmin = await contextAdmin.newPage();
  257 |     
  258 |     try {
  259 |       // Login Admin
  260 |       await login(pageAdmin, CREDENTIALS.ADMIN.correo, CREDENTIALS.ADMIN.clave);
  261 |       
  262 |       // Navegar a conversación como admin
  263 |       await pageAdmin.goto(`${BASE_URL}/profesor/estudiantes/${CREDENTIALS.ESTUDIANTE.id}/materia/${CREDENTIALS.ESTUDIANTE.materiaId}/conversacion`);
  264 |       await pageAdmin.waitForTimeout(2000);
  265 |       
  266 |       // Verificar banner de "Modo Supervisor"
  267 |       const supervisorBanner = await pageAdmin.locator('text=/supervisor/i, text=/solo lectura/i').count() > 0;
  268 |       console.log('  ✓ Banner "Modo Supervisor" visible:', supervisorBanner);
  269 |       
  270 |       // Verificar que inputs de chat no están visibles
  271 |       const chatInputs = await pageAdmin.locator('textarea, input[type="text"]').count();
  272 |       console.log('  ✓ Inputs de chat ocultos:', chatInputs === 0);
  273 |       
  274 |       // Intento de bypass por consola/store (simulado)
  275 |       const token = await getAuthToken(CREDENTIALS.ADMIN.correo, CREDENTIALS.ADMIN.clave);
  276 |       
  277 |       // Intentar enviar mensaje directamente al WebSocket
  278 |       console.log('  ⚠️  Simulando intento de bypass desde consola...');
  279 |       
  280 |       // Verificar que el gateway rechazaría (verificamos en logs del backend)
  281 |       console.log('  ✓ Gateway debe rechazar mensaje de ADMIN (verificar logs backend)');
  282 |       
  283 |       expect(supervisorBanner || chatInputs === 0).toBeTruthy();
  284 |       
  285 |     } finally {
  286 |       await contextAdmin.close();
  287 |     }
  288 |   });
  289 | 
  290 |   // ══════════════════════════════════════════════════════════════════
  291 |   // ESCENARIO 5: Resiliencia (Caída del Servidor)
  292 |   // ══════════════════════════════════════════════════════════════════
  293 |   
  294 |   test('Escenario 5: Resiliencia - Caída y recuperación del servidor', async ({ browser }) => {
  295 |     console.log('\n🧪 Escenario 5: Resiliencia - Caída del Servidor');
  296 |     
  297 |     const contextEstudiante = await browser.newContext();
  298 |     const pageEstudiante = await contextEstudiante.newPage();
  299 |     
  300 |     try {
  301 |       // Login Estudiante
  302 |       await login(pageEstudiante, CREDENTIALS.ESTUDIANTE.correo, CREDENTIALS.ESTUDIANTE.clave);
  303 |       
  304 |       // Navegar a conversación
  305 |       await pageEstudiante.goto(`${BASE_URL}/estudiante/trazabilidad`);
  306 |       await pageEstudiante.waitForTimeout(2000);
  307 |       
  308 |       console.log('  ⚠️  INSTRUCCIÓN MANUAL: Detener el servidor backend (Ctrl+C en terminal de backend)');
  309 |       console.log('  ⚠️  Presiona Enter cuando hayas detenido el servidor...');
  310 |       
  311 |       // Esperar intervención manual para detener servidor
  312 |       await pageEstudiante.waitForTimeout(10000);
  313 |       
  314 |       // Verificar banner de "Conexión perdida"
  315 |       const connectionBanner = await pageEstudiante.locator('text=/conexión perdida/i, text=/offline/i, text=/desconectado/i').count() > 0;
  316 |       console.log('  ✓ Banner "Conexión perdida" visible:', connectionBanner);
  317 |       
  318 |       console.log('  ⚠️  INSTRUCCIÓN MANUAL: Reiniciar el servidor backend (npm run start:dev)');
  319 |       console.log('  ⚠️  Presiona Enter cuando hayas reiniciado el servidor...');
  320 |       
  321 |       // Esperar intervención manual para reiniciar servidor
  322 |       await pageEstudiante.waitForTimeout(10000);
  323 |       
  324 |       // Verificar que el banner desaparece
  325 |       await pageEstudiante.waitForTimeout(3000);
  326 |       const bannerGone = await pageEstudiante.locator('text=/conexión perdida/i').count() === 0;
  327 |       console.log('  ✓ Banner desapareció tras reconexión:', bannerGone);
  328 |       
  329 |       expect(connectionBanner).toBeTruthy();
  330 |       
  331 |     } finally {
  332 |       await contextEstudiante.close();
  333 |     }
  334 |   });
  335 | });
  336 | 
  337 | // ══════════════════════════════════════════════════════════════════
  338 | // REPORT GENERATOR
  339 | // ══════════════════════════════════════════════════════════════════
  340 | 
```