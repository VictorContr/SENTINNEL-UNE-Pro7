# 🛡️ SENTINNEL-UNE | Frontend Architecture
> **Sistema de Gestión y Trazabilidad de Informes de Pasantías**

## 🚀 Vision Pitch
SENTINNEL-UNE no es un simple panel de control; es la interfaz táctica y definitiva para la gestión académica. Diseñado para ofrecer una experiencia inmersiva, de alto rendimiento y cero fricción, este frontend consolida el caos de la administración universitaria en una experiencia de usuario quirúrgicamente precisa y estéticamente corporativa.

## 🛠️ Stack Tecnológico Justificado

La elección de tecnologías no es casualidad; responde a la necesidad de construir una aplicación altamente reactiva, mantenible a largo plazo y resistente a deuda técnica.

| Tecnología | Rol Arquitectónico | Justificación Técnica |
| :--- | :--- | :--- |
| **Vue 3 (Composition API)** | Renderizado y Lógica UI | Uso exclusivo de `<script setup>` para maximizar el rendimiento de compilación y evitar el boilerplate clásico de la Options API. |
| **Quasar Framework** | Componentes UI Core | Provee componentes pre-construidos de grado empresarial, optimizados para accesibilidad y extensibilidad sin sacrificar rendimiento. |
| **Tailwind CSS v4** | Motor de Utilidades CSS | Permite un estilizado de bajo nivel y en línea (Atomic CSS) garantizando que el diseño no sufra de colisiones de especificidad (CSS bloat). |
| **Pinia** | State Management | El estándar moderno de Vue. Ofrece tipado estricto por defecto, modularidad out-of-the-box y evita la mutación accidental del estado. |
| **Axios** | Cliente HTTP | Interceptores robustos para la inyección automática de tokens JWT y manejo centralizado de respuestas de error. |

## 🎨 Arquitectura UI/UX: Corporativo y Resolutivo

La interfaz de SENTINNEL-UNE está construida bajo una filosofía estricta de reducción de carga cognitiva.

> [!IMPORTANT]
> **Dark Mode Exclusivo:** Se ha prescindido enteramente de un "Light Mode" por decisión de diseño corporativo. Reducimos el cansancio visual del personal docente y directivo que pasa largas horas revisando documentos técnicos, al mismo tiempo que transmitimos la sobriedad y profesionalismo inherentes a un panel de auditoría de seguridad.

### Decisiones de Diseño Estrictas
- **Material Icons Nativos:** Queda **estrictamente prohibido** el uso de emojis en la interfaz. Toda iconografía debe usar el estándar Material Icons (ej. `warning`, `check_circle`, `cancel`). Esto asegura una renderización consistente y sin corrupcción visual a través de sistemas operativos modernos y legacy.
- **Manejo de Layouts:** Separación asimétrica clara entre el `Sidebar` (navegación estática bloqueada para alta prioridad) y el `Canvas` central (zona de interacción transaccional). Se minimizan los refrescos de la ventana base (Single Page Application pura).

## 🧠 Gestión del Estado (Pinia)

El manejo del árbol de datos y la sesión se basa en modelos matemáticos reactivos. Hemos estructurado el estado bajo los siguientes principios:

- **Reactividad de Períodos:** Los "Períodos Académicos" son hidratados como entidades vivas.
- **Control de Identidad y Múltiples Roles:** Pinia se encarga de discriminar dinámicamente las vistas funcionales (Estudiante, Profesor, Coordinador), aislando los componentes de UI según el JWT.
- **Prevención de "Muerte por Caché Local":** El diseño implementa mecanismos de rehidratación síncrona. Si el JWT expira o se lanza un Log-Out, la tienda limpia agresivamente (`$reset`) la persistencia entera de estados temporales, evitando que se mezclen vistas confusas (evitando ver datos confidenciales oxidados en el DOM re-renderizado).

## ⚖️ Estándar Estricto de Código

Para garantizar la trazabilidad del desarrollo dentro del contexto universitario y poder auditar fácilmente el código propietario del proyecto, se impone esta regla inquebrantable:

> [!WARNING]
> **Nomenclatura Obligatoria `_sm_vc`:**
> Todas las variables reactivas, funciones orquestadoras y referencias del modelo de negocio escritas internamente deben llevar forzosamente el sufijo `_sm_vc`.
> *Incorrecto:* `const isAuth = ref(false)`
> *Correcto:* `const isAuth_sm_vc = ref(false)`
> 
> Esta medida permite separar de un solo vistazo el código base que provee Node/Browser de la lógica comercial del estudiante.
