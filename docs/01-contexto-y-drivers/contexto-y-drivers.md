# Contexto y drivers arquitectónicos de Nexora

## 1. Contexto del proyecto

Nexora es un sistema web de orientación vocacional y consulta de universidades y carreras del Ecuador, reúne información de la oferta académica y permite al estudiante explorar opciones de estudio según sus intereses, responder un cuestionario vocacional y consultar recomendaciones relacionadas con sus respuestas.

La información académica se encuentra distribuida entre distintas fuentes institucionales, esta situación dificulta comparar universidades, carreras, modalidades y ubicaciones desde un mismo espacio, Nexora facilita esa consulta mediante un catálogo centralizado y un proceso de orientación que sirve como apoyo para la elección de estudios.

El sistema permite conservar evaluaciones y resultados asociados a cada cuenta, generar un informe PDF y solicitar su envío por correo electrónico, la recomendación vocacional tiene carácter orientativo y no garantiza admisión, disponibilidad de cupos ni afinidad definitiva con una profesión.

## 2. Objetivo

Facilitar la consulta de la oferta académica universitaria del Ecuador y apoyar la elección de carreras mediante un cuestionario vocacional, recomendaciones e informes personales, con una arquitectura que permita proteger los datos, mantener el catálogo y ampliar las funciones del sistema.

## 3. Alcance funcional

| Área | Funciones incluidas |
|---|---|
| Acceso al sistema | Autenticación de usuarios y acceso según los permisos de su perfil |
| Catálogo académico | Consulta de universidades, carreras, modalidades y ubicaciones disponibles en el catálogo |
| Orientación vocacional | Cuestionario de 20 preguntas organizado en cuatro bloques de cinco preguntas |
| Resultados | Consulta de resultados y recomendaciones asociadas a la evaluación |
| Historial | Conservación y consulta de las evaluaciones personales |
| Informes | Generación y descarga de informes vocacionales en PDF |
| Correo electrónico | Solicitud de envío del informe al correo del estudiante |
| Gestión académica | Registro y actualización de universidades y carreras por el gestor autorizado |
| Administración | Gestión de cuentas, roles y permisos por el administrador |

Las funciones representan el alcance definido para el proyecto, su presencia en esta documentación no sustituye la verificación del código ni las pruebas de aceptación.

### 3.1 Fuera del alcance

- Ejecutar postulaciones oficiales en las universidades
- Asignar cupos o garantizar la admisión
- Reemplazar una evaluación profesional de orientación vocacional
- Procesar matrículas o pagos universitarios
- Suponer integración automática con plataformas universitarias sin una conexión implementada y verificada

## 4. Interesados y preocupaciones

| Código | Interesado | Relación con Nexora | Preocupaciones |
|---|---|---|---|
| ST-01 | Estudiante | Consulta el catálogo, responde el cuestionario y obtiene resultados e informes | Comprender las recomendaciones, consultar información académica vigente, recibir respuestas oportunas y conservar la privacidad de sus resultados |
| ST-02 | Gestor de información académica | Mantiene la información de universidades y carreras | Publicar datos correctos, identificar su fuente y fecha de revisión, evitar duplicados y corregir registros sin afectar otros datos |
| ST-03 | Administrador | Gestiona cuentas y permisos | Evitar accesos indebidos, controlar privilegios y mantener la continuidad de las operaciones |
| ST-04 | Equipo de desarrollo | Mantiene el código, la base de datos y las integraciones | Localizar las reglas de cada función, reducir el impacto de los cambios y verificar las modificaciones |
| ST-05 | Docente evaluador | Revisa el dossier y su justificación | Comprobar la coherencia entre requisitos, drivers, escenarios, diagramas y decisiones arquitectónicas |

Los tres actores que interactúan funcionalmente con el sistema son estudiante, gestor de información académica y administrador, el equipo de desarrollo y el docente son interesados del proyecto y no requieren aparecer como usuarios en las vistas C4.

## 5. Requisitos funcionales clave

| Código | Requisito | Descripción |
|---|---|---|
| RF-01 | Autenticar usuarios | Permitir el acceso mediante credenciales válidas y asociar la sesión con la identidad de la cuenta |
| RF-02 | Consultar oferta académica | Permitir la búsqueda y consulta de universidades y carreras con sus datos disponibles |
| RF-03 | Responder el cuestionario | Presentar 20 preguntas en bloques de cinco, conservar las respuestas entre bloques y mostrar el progreso |
| RF-04 | Obtener recomendaciones | Procesar las respuestas y presentar resultados según las reglas de evaluación vigentes |
| RF-05 | Consultar historial personal | Permitir al estudiante consultar las evaluaciones asociadas a su cuenta |
| RF-06 | Generar informes PDF | Generar un informe correspondiente a una evaluación del estudiante |
| RF-07 | Enviar informes por correo | Permitir al estudiante solicitar el envío de su informe mediante el servicio de correo |
| RF-08 | Mantener el catálogo | Permitir al gestor autorizado registrar y actualizar universidades y carreras |
| RF-09 | Gestionar usuarios y roles | Permitir al administrador gestionar cuentas y permisos |
| RF-10 | Proteger recursos personales | Restringir el acceso a evaluaciones e informes según la identidad y los permisos de la cuenta |

## 6. Base tecnológica existente

| Área | Tecnología | Uso en Nexora |
|---|---|---|
| Interfaz | React 19 y TypeScript | Construcción de las pantallas y componentes |
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

La base tecnológica corresponde al historial de implementación reportado del proyecto, la revisión del repositorio de la aplicación permite contrastar las dependencias, sus versiones y su configuración.

## 7. Restricciones

| Código | Restricción | Origen | Negociabilidad |
|---|---|---|---|
| R-01 | Conservar React, FastAPI y PostgreSQL como base de la solución durante este hito | Implementación existente y costo de migración | Negociable mediante una decisión documentada y una evaluación de impacto |
| R-02 | Mantener los roles estudiante, gestor de información académica y administrador | Alcance funcional acordado | Un cambio requiere actualizar requisitos, permisos y vistas |
| R-03 | Utilizar información académica con fuente identificable y distinguir los datos sin verificación oficial | Necesidad de confiabilidad del catálogo | No negociable respecto a presentar datos sin verificar como oficiales |
| R-04 | Utilizar Gmail SMTP para el envío de informes en la integración actual | Configuración de correo reportada | Negociable si cambian los límites, costos o necesidades del servicio |
| R-05 | Entregar vistas C4 de niveles 1 y 2 como código, ADR, matriz y registro de IA en el repositorio | Rúbrica de la actividad | No negociable para la entrega académica |
| R-06 | Conservar la documentación versionada y etiquetar el hito como v0.1.0 | Rúbrica de la actividad | No negociable para la entrega académica |
| R-07 | Excluir credenciales y datos personales reales de los prompts y ejemplos del dossier | Instrucción de la actividad | No negociable para la entrega académica |
| R-08 | Conservar las evaluaciones históricas al modificar el cuestionario y sus reglas | Existencia de evaluaciones anteriores | No negociable respecto a perder o reinterpretar silenciosamente los resultados históricos |

## 8. Drivers arquitectónicos priorizados

La importancia expresa el efecto del driver sobre los objetivos del sistema, la dificultad expresa el esfuerzo y la coordinación necesarios para atenderlo, la prioridad representa el orden de atención propuesto para este hito.

| Código | Driver | Atributo principal | Importancia | Dificultad | Prioridad | Origen |
|---|---|---|---|---|---|---|
| D1 | Impedir operaciones sin permiso y acceso a resultados de otras cuentas | Seguridad | Alta | Alta | 1 | ST-01, ST-03, RF-09 y RF-10 |
| D2 | Conservar respuestas y resultados coherentes, incluso ante fallos o cambios del cuestionario | Fiabilidad | Alta | Alta | 2 | ST-01, RF-03, RF-05 y R-08 |
| D3 | Mantener tiempos de respuesta aceptables en consultas del catálogo y resultados bajo una carga definida | Eficiencia de desempeño | Alta | Media | 3 | ST-01 y RF-02 |
| D4 | Permitir cambios en el catálogo y las reglas vocacionales con impacto limitado y verificable | Mantenibilidad | Alta | Media | 4 | ST-02, ST-04, RF-04 y RF-08 |
| D5 | Mantener disponibles las consultas y los resultados ante una falla del servicio de correo | Disponibilidad | Alta | Media | 5 | ST-01, ST-03, RF-05, RF-07 y R-04 |
| D6 | Facilitar la comprensión y finalización del cuestionario desde dispositivos móviles y computadoras | Capacidad de interacción | Media | Media | 6 | ST-01 y RF-03 |

### 8.1 Justificación de la prioridad

D1 recibe la mayor prioridad porque Nexora conserva información personal y permite operaciones administrativas, una autorización incorrecta puede exponer resultados o permitir cambios indebidos en el catálogo y las cuentas.

D2 protege el valor de las evaluaciones y su historial, un cambio de cuestionario debe conservar el significado de los resultados anteriores y una operación incompleta debe evitar registros inconsistentes.

D3 responde a la necesidad de consultar el catálogo y los resultados con tiempos aceptables, la cantidad de usuarios concurrentes y los límites de respuesta deben establecerse en escenarios medibles y comprobarse mediante pruebas.

D4 facilita la actualización de la oferta académica y las reglas vocacionales, D5 reduce el efecto de las fallas del proveedor de correo sobre las funciones principales, D6 favorece la comprensión del cuestionario y su uso desde distintos tamaños de pantalla.

## 9. Implicaciones arquitectónicas por evaluar

| Driver | Aspectos que requieren decisión |
|---|---|
| D1 | Autorización en la API, propiedad de recursos, expiración de tokens y gestión de privilegios |
| D2 | Límites de transacción, validación de evaluaciones y versión del cuestionario |
| D3 | Consultas a PostgreSQL, paginación, índices y medición de tiempos |
| D4 | Separación de responsabilidades entre catálogo, evaluación, informes y acceso a datos |
| D5 | Límites de espera, tratamiento de errores y recuperación del envío de correo |
| D6 | Navegación por bloques, mensajes de validación y adaptación de la interfaz |

Estos aspectos constituyen temas de análisis, las decisiones aceptadas y sus consecuencias se registran en los ADR correspondientes.

## 10. Supuestos y verificación pendiente

- El catálogo se mantiene dentro de Nexora y no supone sincronización automática con cada universidad
- La cantidad de usuarios registrados no equivale a la cantidad de usuarios concurrentes
- Los objetivos numéricos de calidad se definen en los escenarios y requieren pruebas
- La autenticación existente no demuestra por sí sola la cobertura completa de autorización de los tres roles
- La generación del PDF y la aceptación del correo por el servidor SMTP no garantizan su llegada a la bandeja de entrada
- Las modificaciones del cuestionario deben distinguir las evaluaciones nuevas de las históricas

## 11. Documentos relacionados

- [Escenarios de calidad](escenarios-de-calidad.md)
- [C4 nivel 1: contexto](../02-vistas-c4/nivel1.md)
- [C4 nivel 2: contenedores](../02-vistas-c4/nivel2.md)
- [ADR-001: control de acceso](../03-adr/ADR-001-control-de-acceso.md)
- [Matriz de decisión](../03-adr/matriz-de-decision.md)
- [Registro de uso de IA](../04-registro-ia.md)