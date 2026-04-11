# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-chat-tests.spec.js >> Módulo de Chat E2E - SENTINNEL >> Escenario 5: Resiliencia - Caída y recuperación del servidor
- Location: e2e-chat-tests.spec.js:294:3

# Error details

```
Error: Channel closed
```

```
Error: page.fill: Target page, context or browser has been closed
Call log:
  - waiting for locator('input[placeholder*="clave"]')

```

# Test source

```ts
  1   | // ══════════════════════════════════════════════════════════════════
  2   | // E2E Chat Tests for SENTINNEL - QA Automation Suite
  3   | // Pruebas automatizadas del módulo de Chat en Tiempo Real
  4   | // ══════════════════════════════════════════════════════════════════
  5   | 
  6   | const { test, expect } = require('@playwright/test');
  7   | 
  8   | // ══════════════════════════════════════════════════════════════════
  9   | // CONFIGURACIÓN
  10  | // ══════════════════════════════════════════════════════════════════
  11  | 
  12  | const BASE_URL = 'http://localhost:9000';
  13  | const API_URL = 'http://localhost:4000/api';
  14  | 
  15  | // Credenciales de prueba (del seed)
  16  | const CREDENTIALS = {
  17  |   ESTUDIANTE: {
  18  |     correo: 'luis@une.edu.ve',
  19  |     clave: 'Est@2025!',
  20  |     id: 1, // Luis Ramírez
  21  |     materiaId: 1, // Investigación y Desarrollo
  22  |   },
  23  |   PROFESOR: {
  24  |     correo: 'ana.torres@une.edu.ve',
  25  |     clave: 'Prof@2025!',
  26  |     id: 2,
  27  |   },
  28  |   ADMIN: {
  29  |     correo: 'admin@une.edu.ve',
  30  |     clave: 'Admin@2025!',
  31  |     id: 1,
  32  |   },
  33  | };
  34  | 
  35  | // ══════════════════════════════════════════════════════════════════
  36  | // HELPER FUNCTIONS
  37  | // ══════════════════════════════════════════════════════════════════
  38  | 
  39  | async function login(page, correo, clave) {
  40  |   await page.goto(`${BASE_URL}/login`);
  41  |   await page.fill('input[placeholder*="correo"]', correo);
> 42  |   await page.fill('input[placeholder*="clave"]', clave);
      |              ^ Error: page.fill: Target page, context or browser has been closed
  43  |   await page.click('button[type="submit"]');
  44  |   await page.waitForTimeout(2000); // Esperar login
  45  | }
  46  | 
  47  | async function getAuthToken(correo, clave) {
  48  |   const response = await fetch(`${API_URL}/auth/login`, {
  49  |     method: 'POST',
  50  |     headers: { 'Content-Type': 'application/json' },
  51  |     body: JSON.stringify({ correo_sm_vc: correo, clave_sm_vc: clave }),
  52  |   });
  53  |   const data = await response.json();
  54  |   return data.access_token_sm_vc;
  55  | }
  56  | 
  57  | // ══════════════════════════════════════════════════════════════════
  58  | // TEST SUITE
  59  | // ══════════════════════════════════════════════════════════════════
  60  | 
  61  | test.describe('Módulo de Chat E2E - SENTINNEL', () => {
  62  |   
  63  |   test.beforeAll(async () => {
  64  |     console.log('🧪 Iniciando suite de pruebas E2E del módulo de Chat...');
  65  |     console.log('📍 Frontend:', BASE_URL);
  66  |     console.log('📍 Backend:', API_URL);
  67  |   });
  68  | 
  69  |   // ══════════════════════════════════════════════════════════════════
  70  |   // ESCENARIO 1: Tiempo Real y Simetría (Profesor <-> Estudiante)
  71  |   // ══════════════════════════════════════════════════════════════════
  72  |   
  73  |   test('Escenario 1: Tiempo Real - Mensaje Profesor->Estudiante en tiempo real', async ({ browser }) => {
  74  |     console.log('\n🧪 Escenario 1: Tiempo Real y Simetría');
  75  |     
  76  |     // Crear dos contextos de navegador (Estudiante y Profesor)
  77  |     const contextEstudiante = await browser.newContext();
  78  |     const contextProfesor = await browser.newContext();
  79  |     
  80  |     const pageEstudiante = await contextEstudiante.newPage();
  81  |     const pageProfesor = await contextProfesor.newPage();
  82  |     
  83  |     try {
  84  |       // Login Estudiante
  85  |       await login(pageEstudiante, CREDENTIALS.ESTUDIANTE.correo, CREDENTIALS.ESTUDIANTE.clave);
  86  |       
  87  |       // Navegar a la conversación del estudiante
  88  |       await pageEstudiante.goto(`${BASE_URL}/estudiante/trazabilidad`);
  89  |       await pageEstudiante.waitForTimeout(1000);
  90  |       
  91  |       // Login Profesor
  92  |       await login(pageProfesor, CREDENTIALS.PROFESOR.correo, CREDENTIALS.PROFESOR.clave);
  93  |       
  94  |       // Navegar a la conversación del estudiante desde la vista del profesor
  95  |       await pageProfesor.goto(`${BASE_URL}/profesor/estudiantes/${CREDENTIALS.ESTUDIANTE.id}/materia/${CREDENTIALS.ESTUDIANTE.materiaId}/conversacion`);
  96  |       await pageProfesor.waitForTimeout(2000);
  97  |       
  98  |       // Verificar que ambos están en la conversación
  99  |       const estudianteInChat = await pageEstudiante.locator('text=Conversación').count() > 0;
  100 |       const profesorInChat = await pageProfesor.locator('text=Conversación').count() > 0;
  101 |       
  102 |       console.log('  ✓ Estudiante en chat:', estudianteInChat);
  103 |       console.log('  ✓ Profesor en chat:', profesorInChat);
  104 |       
  105 |       if (!profesorInChat) {
  106 |         console.log('  ⚠️  El profesor necesita navegar a la conversación desde su vista');
  107 |       }
  108 |       
  109 |       // Enviar mensaje desde el profesor
  110 |       const mensajeTest = 'Mensaje de prueba E2E - Escenario 1';
  111 |       
  112 |       // Buscar input de mensaje y enviar
  113 |       const inputMensaje = pageProfesor.locator('textarea, input[type="text"]').first();
  114 |       if (await inputMensaje.isVisible()) {
  115 |         await inputMensaje.fill(mensajeTest);
  116 |         await pageProfesor.click('button:has-text("Enviar"), button:has-text("send")');
  117 |         console.log('  ✓ Mensaje enviado desde Profesor');
  118 |       } else {
  119 |         console.log('  ⚠️  No se encontró input de mensaje en vista de profesor');
  120 |       }
  121 |       
  122 |       // Esperar recepción en tiempo real (sin recargar)
  123 |       await pageEstudiante.waitForTimeout(3000);
  124 |       
  125 |       // Verificar que el mensaje apareció en el estudiante
  126 |       const mensajeRecibido = await pageEstudiante.locator(`text=${mensajeTest}`).count() > 0;
  127 |       console.log('  ✓ Mensaje recibido en Estudiante:', mensajeRecibido);
  128 |       
  129 |       expect(mensajeRecibido || profesorInChat).toBeTruthy();
  130 |       
  131 |     } finally {
  132 |       await contextEstudiante.close();
  133 |       await contextProfesor.close();
  134 |     }
  135 |   });
  136 | 
  137 |   // ══════════════════════════════════════════════════════════════════
  138 |   // ESCENARIO 2: UX e Indicador de Escritura
  139 |   // ══════════════════════════════════════════════════════════════════
  140 |   
  141 |   test('Escenario 2: Typing Indicator - Verificar indicador de escritura', async ({ browser }) => {
  142 |     console.log('\n🧪 Escenario 2: Typing Indicator');
```