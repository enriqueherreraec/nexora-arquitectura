# Registro de uso de inteligencia artificial

## 1. Propósito

Este registro documenta el apoyo de inteligencia artificial en la preparación del dossier de arquitectura de Nexora, identifica las actividades, herramientas, prompts resumidos, salidas y correcciones, distingue la revisión documental de las verificaciones técnicas pendientes.

Las propuestas generadas requieren revisión del equipo, su inclusión en el repositorio no demuestra que estén implementadas ni que cumplan los escenarios de calidad.

## 2. Herramientas utilizadas

| Herramienta | Modelo o versión | Uso |
|---|---|---|
| ChatGPT | Modelo y versión exactos no registrados | Interpretación de la rúbrica, redacción del dossier, código Mermaid y comparación de alternativas |
| Antigravity | Versión del IDE no registrada | Edición local de archivos y uso previo de su asistente para desarrollar Nexora |
| Modelo del asistente de Antigravity | Una captura muestra Gemini 3.8 Flash High en el selector | Dato visible de esa sesión, no permite identificar el modelo de todas las intervenciones anteriores |

La edición manual en Antigravity y el uso de Git no constituyen por sí solos intervenciones de inteligencia artificial.

## 3. Registro de intervenciones

| ID | Fecha | Actividad | Herramienta | Prompt resumido | Salida | Verificación | Tratamiento |
|---|---|---|---|---|---|---|---|
| IA-01 | 15/10/2026 | Interpretar la actividad | ChatGPT | Revisar el PDF y explicar los entregables para Nexora | Requisitos del dossier, estructura y condiciones de entrega | Contraste con el documento adjunto durante la conversación | Utilizar como guía, pendiente de revisión final del equipo |
| IA-02 | 15/10/2026 | Organizar la documentación | ChatGPT | Definir carpetas y archivos Markdown | Estructura inicial del repositorio | Revisión mediante capturas y preferencias del usuario | Modificar para agrupar contexto y escenarios dentro de 01-contexto-y-drivers |
| IA-03 | 15/10/2026 | Recuperar el stack existente | ChatGPT | Revisar el historial de Nexora y del trabajo con Antigravity | React, TypeScript, Vite, Material UI, FastAPI, PostgreSQL y bibliotecas relacionadas | Contraste con el historial reportado, pendiente de cotejo con dependencias del código | Rechazar la afirmación inicial de que las tecnologías estaban por confirmar |
| IA-04 | 15/10/2026 | Redactar contexto y drivers | ChatGPT | Preparar contexto, interesados, requisitos, restricciones y prioridades | Documento con drivers D1 a D6 | Revisión documental inicial del alcance | Incorporar como borrador y actualizar tras corregir las vistas |
| IA-05 | 15/10/2026 | Formular escenarios | ChatGPT | Elaborar escenarios con seis partes y medidas numéricas | Escenarios E1 a E6 vinculados a los drivers | Revisión de estructura y trazabilidad, sin ejecución de pruebas | Conservar las cifras como objetivos propuestos |
| IA-06 | 15/10/2026 | Preparar vistas C4 | ChatGPT | Crear niveles 1 y 2 para Nexora | Diagramas Mermaid con actores y contenedores | Comparación con los diagramas anteriores que el usuario pegó en la conversación | Modificar las versiones iniciales para recuperar los portales oficiales |
| IA-07 | 15/10/2026 | Ajustar el alcance de las vistas | ChatGPT | Conservar solo los diagramas en los archivos de vistas | Título y código Mermaid por nivel | Solicitud explícita del usuario | Retirar las tablas y explicaciones opcionales de esos archivos |
| IA-08 | 15/10/2026 | Redactar ADR-001 | ChatGPT | Documentar autenticación y permisos con el formato del docente | Tabla de decisión sobre JWT y autorización | El historial reporta JWT y Argon2id, falta comprobar todos los permisos | Distinguir autenticación adoptada y autorización pendiente de verificación |
| IA-09 | 15/10/2026 | Redactar ADR-002 | ChatGPT | Documentar integridad y conservación de evaluaciones | Propuesta de transacciones y versiones del cuestionario | Persistencia reportada, atomicidad y versiones pendientes de revisión | Conservar como propuesta |
| IA-10 | 15/10/2026 | Comparar estilos | ChatGPT | Crear una matriz ponderada entre monolito modular y microservicios | Resultado de 4,10 y 3,35 sobre 5 | Revisión aritmética de los aportes, puntuaciones pendientes de validación del equipo | Utilizar como juicio arquitectónico inicial |
| IA-11 | 15/10/2026 | Redactar ADR-003 | ChatGPT | Registrar la selección del estilo según la matriz | Propuesta de monolito modular con capas | Contraste documental con la matriz y las vistas | Conservar como propuesta pendiente de aceptación |
| IA-12 | 15/10/2026 | Corregir la integración de correo | ChatGPT | Comparar el diagrama anterior con el proyecto reportado | Conexión directa de FastAPI con Gmail SMTP | El historial acredita el reporte de envío SMTP, no un proceso independiente de notificaciones | Retirar el contenedor de notificaciones de la versión actual |
| IA-13 | 15/10/2026 | Precisar la relación con universidades | ChatGPT | Recuperar los portales oficiales de los diagramas anteriores | Relación de navegación por enlaces desde la aplicación web | Contraste entre niveles 1 y 2 | Conservar portales externos y excluir la suposición de sincronización automática |
| IA-14 | 15/10/2026 | Actualizar documentos relacionados | ChatGPT | Corregir contexto y ADR-003 según las vistas | Inclusión de RF-11, R-09 y relaciones con portales y correo | Revisión documental de nombres y responsabilidades | Incorporar los cambios, pendiente de revisión cruzada |
| IA-15 | 15/10/2026 | Preparar evidencia de revisión cruzada | ChatGPT | Crear un formato para la revisión de otro equipo | Lista de comprobación y tabla de observaciones | El PDF exige revisión cruzada, el nombre del archivo es una propuesta organizativa | Mantener la revisión como pendiente hasta recibir observaciones reales |
| IA-16 | 15/10/2026 | Actualizar el registro de IA | ChatGPT | Documentar las intervenciones y correcciones realizadas | Este registro | Contraste con la conversación disponible | Incorporar y actualizar con verificaciones posteriores |

## 4. Correcciones y decisiones críticas

| Elemento revisado | Hallazgo | Resolución |
|---|---|---|
| Tecnologías pendientes de confirmar | El historial ya contiene un stack definido | Sustituir esa afirmación por las tecnologías reportadas |
| Correo descrito como simulado | Existe un reporte posterior de envío real con Gmail SMTP | Priorizar el reporte posterior y conservar pendiente la comprobación técnica actual |
| Omisión de portales universitarios | Los diagramas anteriores del usuario incluyen portales oficiales | Recuperarlos en ambos niveles C4 |
| Proceso independiente de notificaciones | El diagrama anterior lo representa, pero el historial recuperado no acredita ese proceso | Documentar la conexión directa FastAPI → Gmail SMTP |
| Solicitud asíncrona de correo | La conexión SMTP no demuestra procesamiento en segundo plano | Evitar declarar asincronía sin evidencia del código |
| Relación con portales oficiales | Abrir enlaces no equivale a sincronizar catálogos | Representar navegación desde la aplicación web |
| Avisos y mensajes de cuenta | El alcance recuperado respalda el envío de informes, no todos los tipos de aviso | Limitar las etiquetas del correo al informe vocacional |
| Estado de los ADR | No existe evidencia de aceptación y verificación completa de todas las decisiones | Identificar lo adoptado, lo propuesto y lo pendiente |
| Capacidad concurrente | Los valores de E3 no proceden de una prueba registrada | Presentarlos como objetivos de aceptación |
| Monolito modular con capas | El stack no demuestra por sí solo límites modulares | Mantener pendiente la revisión del código |
| Formato de las vistas | El usuario solicita únicamente diagramas | Conservar título y bloque Mermaid en cada archivo |

## 5. Verificación documental y técnica

| Aspecto | Revisión realizada | Pendiente |
|---|---|---|
| Actores | Los códigos finales incluyen estudiante, gestor y administrador en ambos niveles | Comprobar la versión guardada en GitHub |
| Sistemas externos | Los códigos finales incluyen Gmail SMTP y portales oficiales | Revisar renderizado y etiquetas |
| Contenedores | El nivel 2 identifica React, FastAPI y PostgreSQL | Contrastar con la implementación |
| Correo | La documentación actual conecta FastAPI directamente con Gmail SMTP | Revisar configuración, límites de espera y tratamiento de errores |
| Portales | La documentación distingue navegación por enlaces y sincronización automática | Comprobar los destinos disponibles en la interfaz |
| Escenarios | Se definieron seis partes y medidas por escenario | Ejecutar pruebas y conservar evidencia |
| Matriz | Los aportes suman 4,10 para A y 3,35 para B | Validar pesos y puntuaciones con el equipo |
| Coherencia del dossier | Se ajustaron contexto y ADR-003 a los diagramas corregidos | Revisar enlaces, referencias y archivos finales |
| Revisión cruzada | Se preparó un formato | Obtener la revisión de otro equipo y registrar su resultado |

## 6. Uso previo de Antigravity

El historial del proyecto reporta apoyo de Antigravity en el desarrollo del catálogo, cuestionario, autenticación, persistencia e informes de Nexora, este documento no atribuye prompts exactos ni resultados técnicos a sesiones cuyo registro completo no se ha recuperado.

Si esas sesiones se utilizan como evidencia, deben incorporarse sus prompts resumidos, modelo identificable, salida, procedimiento de verificación y resultado real.

## 7. Evidencia de versionado

Una captura de GitHub muestra el commit abreviado 89f12a7 con el mensaje “Agregar borrador del dossier de arquitectura de Nexora”, esa evidencia corresponde a la publicación del borrador y no demuestra que las correcciones posteriores ya estén incluidas.

El commit final y la etiqueta v0.1.0 deben registrarse después de revisar y publicar la versión de entrega.

## 8. Protección de información

Los prompts, documentos y evidencias deben excluir contraseñas, tokens, claves SMTP, archivos de entorno y datos personales reales, las pruebas deben utilizar cuentas y datos preparados para ese propósito.

## 9. Responsabilidad del equipo

El equipo revisa y acepta los requisitos, las puntuaciones y las decisiones arquitectónicas, cada verificación pendiente debe actualizarse con su procedimiento, fecha, resultado y evidencia, las diferencias entre diseño e implementación deben registrarse sin declarar cumplimiento inexistente.