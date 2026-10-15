# Registro de uso de inteligencia artificial

## 1. Propósito

Este registro documenta el apoyo de herramientas de inteligencia artificial en la preparación del dossier de arquitectura de Nexora, distingue las propuestas generadas, las correcciones solicitadas y las verificaciones pendientes.

El contenido generado requiere revisión del equipo, una propuesta de arquitectura no constituye evidencia de implementación ni de cumplimiento de los escenarios.

## 2. Herramientas

| Herramienta | Modelo o versión | Uso |
|---|---|---|
| ChatGPT | Modelo y versión exactos no registrados en esta sesión | Apoyo para redactar el dossier, definir escenarios, preparar diagramas Mermaid y comparar alternativas |
| Antigravity | Versión del IDE no registrada, el selector visible en una captura muestra Gemini 3.8 Flash High | Entorno utilizado para abrir el repositorio y editar archivos, también existe uso previo del asistente en el desarrollo de Nexora |

El modelo visible en una captura no permite atribuir esa misma versión a todas las intervenciones anteriores, los detalles de cada sesión previa deben recuperarse de su historial antes de declararlos como verificados.

## 3. Intervenciones en el dossier

| ID | Fecha | Actividad | Herramienta | Prompt resumido | Salida | Verificación y estado | Tratamiento |
|---|---|---|---|---|---|---|---|
| IA-01 | 15/10/2026 | Interpretar la actividad | ChatGPT | Revisar la rúbrica y explicar los entregables para Nexora | Lista de documentos, rutas y requisitos de entrega | Contraste de la respuesta con el PDF adjunto, pendiente de revisión final del equipo | Incorporar como guía de organización |
| IA-02 | 15/10/2026 | Organizar el repositorio | ChatGPT | Explicar cómo crear carpetas y archivos en GitHub y Antigravity | Estructura de documentación e instrucciones de edición | Las capturas permiten observar la copia local y la creación de archivos, falta revisar la estructura final | Modificar la propuesta inicial para agrupar contexto y escenarios en una carpeta |
| IA-03 | 15/10/2026 | Recuperar las tecnologías utilizadas | ChatGPT | Revisar el historial de Nexora y las instrucciones previas para Antigravity | Stack con React, TypeScript, Vite, Material UI, FastAPI, PostgreSQL y bibliotecas relacionadas | Contraste con el historial reportado, pendiente de cotejo con archivos de dependencias y configuración | Rechazar la afirmación inicial de que las tecnologías estaban por confirmar |
| IA-04 | 15/10/2026 | Redactar contexto y drivers | ChatGPT | Preparar contexto, interesados, requisitos, restricciones y drivers en Markdown | Documento de contexto con seis drivers priorizados | Revisión inicial del alcance durante la conversación, pendiente de validación integral del equipo | Incorporar como borrador sujeto a revisión |
| IA-05 | 15/10/2026 | Formular escenarios de calidad | ChatGPT | Elaborar escenarios con seis partes y medidas numéricas | Seis escenarios vinculados a D1–D6 | Se pueden revisar sus partes y trazabilidad, las medidas todavía no tienen pruebas de ejecución | Mantener las cifras como objetivos propuestos |
| IA-06 | 15/10/2026 | Preparar vistas C4 | ChatGPT | Crear los niveles 1 y 2 con los tres actores y las tecnologías de Nexora | Código Mermaid para contexto y contenedores | Revisión conceptual de actores y relaciones, pendiente de renderizado final y revisión cruzada | Simplificar los archivos de vistas a título y diagrama por solicitud del usuario |
| IA-07 | 15/10/2026 | Redactar ADR-001 | ChatGPT | Documentar autenticación y permisos con el formato de tabla del docente | Decisión sobre JWT y autorización en FastAPI | El historial reporta JWT y Argon2id, falta comprobar la cobertura completa de permisos | Modificar el estado para distinguir autenticación adoptada y autorización pendiente de verificación |
| IA-08 | 15/10/2026 | Redactar ADR-002 | ChatGPT | Documentar integridad de evaluaciones y conservación del historial | Propuesta de transacción y versión del cuestionario | La persistencia está reportada, la atomicidad y las versiones requieren revisión del código | Conservar como propuesta |
| IA-09 | 15/10/2026 | Comparar alternativas | ChatGPT | Crear una matriz ponderada entre monolito modular y microservicios | Matriz con resultados de 4,10 y 3,35 sobre 5 | Comprobar pesos, operaciones y justificación, las puntuaciones requieren revisión del equipo | Utilizar como valoración inicial y no como resultado experimental |
| IA-10 | 15/10/2026 | Redactar ADR-003 | ChatGPT | Registrar el estilo seleccionado a partir de la matriz | Propuesta de monolito modular con capas | Coherencia documental inicial con la matriz y el nivel 2, pendiente de aceptación y revisión del código | Conservar como decisión propuesta |
| IA-11 | 15/10/2026 | Documentar el uso de IA | ChatGPT | Crear el registro de herramientas, prompts, salidas y verificación | Este documento | Pendiente de revisión del equipo y de completar datos recuperables del historial | Incorporar sin declarar verificaciones inexistentes |

## 4. Correcciones y criterio crítico

| Propuesta o afirmación | Evaluación | Resolución |
|---|---|---|
| Las tecnologías de Nexora están por confirmar | Contradice el historial de trabajo del proyecto | Reemplazar por el stack previamente reportado y exigir contraste con el repositorio de la aplicación |
| El correo funciona solo como demostración | Existe un reporte posterior de envío real con Gmail SMTP | Utilizar el reporte más reciente y mantener pendiente la comprobación técnica actual |
| Todos los estados de los ADR pueden declararse aceptados | No existe constancia suficiente de aceptación ni de verificación completa | Distinguir decisiones existentes, propuestas y aspectos pendientes |
| Los objetivos de carga representan capacidad comprobada | No existen resultados de prueba asociados en este dossier | Presentar los valores como criterios de aceptación |
| Los permisos de los tres roles ya están completos | La autenticación no demuestra la autorización integral | Exigir pruebas de rol y propiedad de recursos |
| El servicio de notificaciones del ejemplo docente debe copiarse como contenedor | No existe evidencia de un proceso independiente equivalente en Nexora | Representar FastAPI conectado con Gmail SMTP |
| La selección de monolito modular demuestra que el código ya cumple sus límites | La tecnología utilizada no acredita la organización interna | Revisar módulos y dependencias antes de afirmar conformidad |

## 5. Verificaciones pendientes

| Elemento | Procedimiento | Evidencia requerida |
|---|---|---|
| Stack tecnológico | Revisar dependencias del frontend y backend | Archivos de dependencias y versiones |
| Autenticación y permisos | Revisar endpoints protegidos y ejecutar pruebas de acceso | Código y resultados de pruebas |
| Integridad de evaluaciones | Revisar transacciones e inducir fallos | Código, consultas y resultados de E2 |
| Historial del cuestionario | Revisar modelos y migraciones | Identificación de versiones y registros históricos |
| Vistas C4 | Abrir los archivos en GitHub y revisar sus relaciones | Diagramas renderizados y observaciones |
| Matriz | Recalcular aportes y revisar puntuaciones | Revisión documentada del equipo |
| Revisión cruzada | Solicitar la revisión a otro equipo | Fecha, participantes, observaciones y correcciones |
| Correo | Revisar la integración y ejecutar un envío de prueba | Resultado técnico sin exponer credenciales |

## 6. Uso previo de Antigravity

El historial del proyecto reporta apoyo de Antigravity en el desarrollo y actualización de Nexora, con trabajo sobre catálogo académico, cuestionario, autenticación, persistencia e informes, este registro no atribuye prompts exactos ni resultados de pruebas a sesiones cuyo detalle no se ha recuperado.

Los prompts, versiones y verificaciones de esas sesiones deben añadirse a partir de sus registros originales si se utilizan como evidencia del dossier.

## 7. Protección de información

Los ejemplos del dossier deben excluir contraseñas, tokens, claves SMTP, archivos de entorno y datos personales reales, las evidencias deben utilizar cuentas de prueba y ocultar cualquier información sensible.

## 8. Responsabilidad de revisión

El equipo conserva la responsabilidad sobre los requisitos, las puntuaciones y las decisiones arquitectónicas, cada verificación pendiente debe actualizarse con su resultado real y su evidencia, los fallos o diferencias deben registrarse sin sustituirlos por afirmaciones de cumplimiento.