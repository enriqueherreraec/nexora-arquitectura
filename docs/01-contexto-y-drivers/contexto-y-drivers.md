# Contexto y drivers arquitectónicos de Nexora

## 1. Contexto del proyecto

Nexora es un sistema web de orientación vocacional y consulta de universidades y carreras del Ecuador, reúne información de la oferta académica y permite explorar opciones de estudio, responder un cuestionario vocacional y consultar recomendaciones relacionadas con los intereses del estudiante.

La información universitaria se encuentra distribuida entre distintas fuentes institucionales, esta situación dificulta comparar carreras, modalidades y ubicaciones desde un mismo espacio, Nexora centraliza su consulta y ofrece enlaces hacia portales oficiales para ampliar información sobre carreras y procesos de admisión.

El sistema conserva evaluaciones y resultados asociados a cada cuenta, permite generar un informe PDF y solicitar su envío por correo electrónico, las recomendaciones tienen carácter orientativo y no garantizan admisión, disponibilidad de cupos ni afinidad definitiva con una profesión.

## 2. Objetivo

Facilitar la consulta de la oferta académica universitaria del Ecuador y apoyar la elección de carreras mediante un cuestionario vocacional, recomendaciones e informes personales, con una arquitectura que permita proteger los datos, mantener el catálogo y ampliar las funciones del sistema.

## 3. Alcance funcional

| Área | Funciones incluidas |
|---|---|
| Acceso | Autenticación de usuarios y acceso según los permisos de su perfil |
| Catálogo académico | Consulta de universidades, carreras, modalidades y ubicaciones disponibles |
| Orientación vocacional | Cuestionario de 20 preguntas organizado en cuatro bloques de cinco |
| Resultados | Consulta de resultados y recomendaciones asociadas a la evaluación |
| Historial | Conservación y consulta de evaluaciones personales |
| Informes | Generación y descarga del informe vocacional en PDF |
| Correo electrónico | Solicitud de envío del informe al correo del estudiante mediante Gmail SMTP |
| Enlaces oficiales | Apertura de portales universitarios desde enlaces disponibles en la interfaz |
| Gestión académica | Registro y actualización de universidades, carreras, modalidades y enlaces por el gestor autorizado |
| Administración | Gestión de cuentas, roles y permisos por el administrador |

Las funciones representan el alcance definido para Nexora, su inclusión en el dossier requiere contraste con el código y las pruebas de aceptación para determinar su estado de implementación.

### 3.1 Fuera del alcance

- Ejecutar postulaciones oficiales en las universidades
- Asignar cupos o garantizar admisión
- Reemplazar una evaluación profesional de orientación vocacional
- Procesar matrículas o pagos universitarios
- Sincronizar automáticamente el catálogo con plataformas universitarias sin una integración implementada y verificada

## 4. Actores e interesados

| Código | Interesado | Relación con Nexora | Preocupaciones |
|---|---|---|---|
| ST-01 | Estudiante | Consulta el catálogo, responde el cuestionario y obtiene resultados e informes | Comprender las recomendaciones, consultar información vigente, recibir respuestas oportunas y conservar la privacidad de sus resultados |
| ST-02 | Gestor de información académica | Mantiene el catálogo y sus enlaces oficiales | Publicar datos correctos, identificar su fuente y fecha de revisión, evitar duplicados y corregir registros sin afectar información relacionada |
| ST-03 | Administrador | Gestiona cuentas y permisos | Evitar accesos indebidos, controlar privilegios y mantener la continuidad de las operaciones |
| ST-04 | Equipo de desarrollo | Mantiene el código, los datos y las integraciones | Localizar las reglas de cada función, reducir el impacto de los cambios y verificar las modificaciones |
| ST-05 | Docente evaluador | Revisa el dossier y su justificación | Comprobar la coherencia entre requisitos, drivers, escenarios, vistas y decisiones |

Los actores funcionales de las vistas C4 son estudiante, gestor de información académica y administrador, el equipo de desarrollo y el docente son interesados del proyecto y no representan cuentas funcionales del sistema.

## 5. Requisitos funcionales clave

| Código | Requisito | Descripción |
|---|---|---|
| RF-01 | Autenticar usuarios | Permitir el acceso mediante credenciales válidas y asociar la sesión con la identidad de la cuenta |
| RF-02 | Consultar oferta académica | Permitir buscar y consultar universidades y carreras con sus datos disponibles |
| RF-03 | Responder el cuestionario | Presentar 20 preguntas en bloques de cinco, conservar las respuestas entre bloques y mostrar el progreso |
| RF-04 | Obtener recomendaciones | Procesar las respuestas y presentar resultados según las reglas de evaluación vigentes |
| RF-05 | Consultar historial personal | Permitir al estudiante consultar las evaluaciones asociadas a su cuenta |
| RF-06 | Generar informes PDF | Generar un informe correspondiente a una evaluación del estudiante |
| RF-07 | Enviar informes por correo | Permitir solicitar el envío del informe mediante Gmail SMTP |
| RF-08 | Mantener el catálogo | Permitir al gestor autorizado registrar y actualizar universidades, carreras, modalidades y enlaces |
| RF-09 | Gestionar usuarios y roles | Permitir al administrador gestionar cuentas y permisos |
| RF-10 | Proteger recursos personales | Restringir el acceso a evaluaciones e informes según la identidad y los permisos de la cuenta |
| RF-11 | Consultar portales oficiales | Permitir abrir enlaces oficiales de universidades para ampliar información sobre oferta académica y admisión |

## 6. Base tecnológica existente

| Área | Tecnología | Uso en Nexora |
|---|---|---|
| Interfaz | React 19 y TypeScript | Construcción de pantallas y componentes |
| Herramienta de frontend | Vite | Desarrollo y construcción de la aplicación web |
| Componentes visuales | Material UI | Controles, formularios y elementos de interfaz |
| Backend | Python 3.11 y FastAPI | API y procesamiento de operaciones |
| Persistencia | PostgreSQL | Almacenamiento de cuentas, catálogo y evaluaciones |
| Acceso a datos | SQLAlchemy | Consulta y persistencia desde el backend |
| Migraciones | Alembic | Control de cambios del esquema |
| Validación | Pydantic | Validación de datos de entrada y salida |
| Autenticación | PyJWT | Generación y validación de tokens JWT |
| Contraseñas | Argon2id | Hash y verificación de contraseñas |
| Informes | ReportLab | Generación de documentos PDF |
| Funciones geográficas | Geopy | Apoyo a las operaciones geográficas |
| Correo | Gmail SMTP | Envío de correos con informes |

Las tecnologías corresponden al historial de implementación reportado, las versiones y configuraciones deben contrastarse con los archivos de dependencias del proyecto.

## 7. Límites e integraciones

| Elemento | Ubicación | Responsabilidad |
|---|---|---|
| Aplicación web React | Dentro de Nexora | Presentar el catálogo, cuestionario, resultados y paneles, permitir abrir enlaces oficiales |
| API FastAPI | Dentro de Nexora | Procesar solicitudes, aplicar reglas y permisos, generar informes y solicitar su envío |
| PostgreSQL | Dentro de Nexora | Conservar cuentas, catálogo, respuestas y resultados |
| Gmail SMTP | Sistema externo | Recibir solicitudes de envío y gestionar la entrega de correos |
| Portales oficiales de universidades | Sistemas externos | Proporcionar información institucional que el estudiante consulta mediante enlaces |

La API se conecta directamente con Gmail SMTP, esta descripción no incorpora un servicio independiente de notificaciones ni supone un proceso separado en segundo plano.

La relación con los portales universitarios representa navegación mediante enlaces, no implica lectura automática de sus datos ni actualización directa del catálogo de Nexora.

## 8. Restricciones

| Código | Restricción | Origen | Negociabilidad |
|---|---|---|---|
| R-01 | Conservar React, FastAPI y PostgreSQL como base durante este hito | Implementación existente y costo de migración | Negociable mediante una decisión documentada y una evaluación de impacto |
| R-02 | Mantener los roles estudiante, gestor de información académica y administrador | Alcance funcional acordado | Un cambio requiere actualizar requisitos, permisos y vistas |
| R-03 | Utilizar información académica con fuente identificable y distinguir los datos sin verificación oficial | Necesidad de confiabilidad del catálogo | No negociable respecto a presentar datos sin verificar como oficiales |
| R-04 | Utilizar Gmail SMTP en la integración actual de informes | Configuración de correo reportada | Negociable si cambian los límites, costos o necesidades del servicio |
| R-05 | Entregar C4 niveles 1 y 2 como código, ADR, matriz y registro de IA | Rúbrica de la actividad | No negociable para la entrega académica |
| R-06 | Conservar documentación versionada y etiquetar el hito como v0.1.0 | Rúbrica de la actividad | No negociable para la entrega académica |
| R-07 | Excluir credenciales y datos personales reales de prompts y ejemplos | Instrucción de la actividad | No negociable para la entrega académica |
| R-08 | Conservar las evaluaciones históricas ante cambios del cuestionario | Existencia de evaluaciones anteriores | No negociable respecto a perder o reinterpretar silenciosamente resultados históricos |
| R-09 | Reconocer que la disponibilidad y el contenido de los portales oficiales dependen de cada universidad | Dependencia de sistemas externos | Fuera del control de Nexora, su efecto puede reducirse mediante revisión de enlaces |

## 9. Drivers arquitectónicos priorizados

La importancia expresa el efecto sobre los objetivos del sistema, la dificultad representa el esfuerzo y la coordinación necesarios, la prioridad establece el orden de atención propuesto para este hito.

| Código | Driver | Atributo principal | Importancia | Dificultad | Prioridad | Origen |
|---|---|---|---|---|---|---|
| D1 | Impedir operaciones sin permiso y acceso a resultados de otras cuentas | Seguridad | Alta | Alta | 1 | ST-01, ST-03, RF-09 y RF-10 |
| D2 | Conservar respuestas y resultados coherentes ante fallos o cambios del cuestionario | Fiabilidad | Alta | Alta | 2 | ST-01, RF-03, RF-05 y R-08 |
| D3 | Mantener tiempos de respuesta aceptables en consultas del catálogo y resultados bajo una carga definida | Eficiencia de desempeño | Alta | Media | 3 | ST-01 y RF-02 |
| D4 | Permitir cambios en el catálogo y las reglas vocacionales con impacto limitado y verificable | Mantenibilidad | Alta | Media | 4 | ST-02, ST-04, RF-04 y RF-08 |
| D5 | Mantener disponibles las consultas y los resultados ante una falla del servicio de correo | Disponibilidad | Alta | Media | 5 | ST-01, ST-03, RF-05, RF-07 y R-04 |
| D6 | Facilitar la comprensión y finalización del cuestionario desde dispositivos móviles y computadoras | Capacidad de interacción | Media | Media | 6 | ST-01 y RF-03 |

### 9.1 Justificación de la prioridad

D1 tiene la mayor prioridad porque Nexora conserva información personal y permite operaciones administrativas, un control incorrecto puede exponer resultados o permitir cambios indebidos en el catálogo y las cuentas.

D2 protege la coherencia de las evaluaciones y su historial, las modificaciones del cuestionario deben conservar el significado de los resultados anteriores y los fallos de persistencia deben evitar registros parciales.

D3 responde a la necesidad de consultar el catálogo y los resultados con tiempos aceptables, sus objetivos de concurrencia y respuesta se establecen en escenarios medibles que requieren pruebas.

D4 facilita la actualización de la información académica y las reglas vocacionales, D5 reduce el efecto de una falla de correo sobre las consultas, D6 favorece la comprensión y finalización del cuestionario desde distintos dispositivos.

## 10. Implicaciones arquitectónicas por evaluar

| Driver | Aspectos que requieren decisión |
|---|---|
| D1 | Autorización en la API, propiedad de recursos, expiración de tokens y gestión de privilegios |
| D2 | Límites de transacción, validación de evaluaciones y versión del cuestionario |
| D3 | Consultas a PostgreSQL, paginación, índices y medición de tiempos |
| D4 | Separación de responsabilidades entre catálogo, evaluación, informes y persistencia |
| D5 | Límites de espera, tratamiento de errores y recuperación del envío de correo |
| D6 | Navegación por bloques, mensajes de validación y adaptación de la interfaz |

Estos aspectos orientan el análisis, las decisiones y sus consecuencias se registran en los ADR correspondientes.

## 11. Supuestos y límites de verificación

- La consulta de portales oficiales ocurre mediante enlaces desde la aplicación web
- La falta de disponibilidad de un portal externo no debe interpretarse como una falla de sincronización del catálogo
- La cantidad de cuentas registradas no equivale a la cantidad de usuarios concurrentes
- Los objetivos numéricos de calidad requieren pruebas antes de declarar su cumplimiento
- La autenticación existente no acredita la cobertura completa de autorización de los tres roles
- La aceptación de un correo por SMTP no garantiza su llegada a la bandeja de entrada
- La conexión directa de FastAPI con Gmail SMTP no demuestra procesamiento asíncrono ni aislamiento de fallos
- Las modificaciones del cuestionario deben distinguir evaluaciones nuevas e históricas

## 12. Documentos relacionados

- [Escenarios de calidad](escenarios-de-calidad.md)
- [C4 nivel 1: contexto](../02-vistas-c4/nivel1.md)
- [C4 nivel 2: contenedores](../02-vistas-c4/nivel2.md)
- [ADR-001: control de acceso](../03-adr/ADR-001-control-de-acceso.md)
- [ADR-002: integridad de evaluaciones](../03-adr/ADR-002.md)
- [ADR-003: estilo arquitectónico](../03-adr/ADR-003-estilo-arquitectonico.md)
- [Matriz de decisión](../03-adr/matriz-de-decision.md)
- [Registro de uso de IA](../04-registro-ia.md)