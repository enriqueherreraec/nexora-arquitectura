# Parte 1. Contexto y drivers arquitectónicos de Nexora

## Contexto del sistema

Nexora es un sistema web de orientación vocacional que permite al estudiante responder un cuestionario, consultar el resultado de su evaluación y solicitar el envío de un informe PDF a su correo, el sistema relaciona los resultados con información de carreras y universidades para apoyar la exploración académica, sus recomendaciones son orientativas y no garantizan admisión ni afinidad profesional definitiva.

La base tecnológica del proyecto comprende React con TypeScript, Vite y Material UI en la interfaz, FastAPI con Python en el backend y PostgreSQL para la persistencia, la generación del informe utiliza ReportLab dentro de la API y el envío utiliza Gmail SMTP como servicio externo.

El alcance de este análisis comprende cuatro operaciones de la API, el catálogo académico y su gestión forman parte del contexto general de Nexora, sus operaciones quedan fuera del alcance específico de esta entrega.

## Endpoints incluidos en el análisis

| ID | Método | Endpoint | Función |
|---|---|---|---|
| EP1 | POST | `/api/v1/auth/login` | Iniciar sesión |
| EP2 | POST | `/api/v1/evaluaciones/` | Enviar las respuestas y registrar la evaluación |
| EP3 | GET | `/api/v1/evaluaciones/ultima` | Consultar la última evaluación y su resultado |
| EP4 | POST | `/api/v1/informes/{id}/enviar-correo` | Enviar el informe PDF al correo |

**Nota.** Las cuatro operaciones constituyen el alcance acordado para el deber, la correspondencia exacta entre el identificador de EP4, la evaluación y el informe requiere comprobación en el contrato OpenAPI.

## Flujo funcional del alcance

1. El estudiante inicia sesión mediante EP1.
2. El estudiante responde el cuestionario y envía sus respuestas mediante EP2.
3. El sistema registra la evaluación y conserva las respuestas y el resultado asociado.
4. El estudiante consulta su última evaluación mediante EP3.
5. El estudiante solicita el envío del informe mediante EP4.
6. La API verifica la propiedad del recurso, genera el PDF y solicita su envío al proveedor de correo.

El registro de cuentas se considera una condición previa para este flujo, la consulta del cuestionario y la administración del catálogo no incorporan endpoints adicionales al análisis de esta entrega.

## Estado y alcance de las evidencias

Este archivo presenta requisitos, decisiones de diseño y criterios de aceptación, las cifras de carga, latencia, fallos y esfuerzo representan metas propuestas, su inclusión no implica que las pruebas ya se hayan ejecutado.

La verificación del código, del contrato OpenAPI y del comportamiento real debe aportar evidencias antes de declarar el cumplimiento, los registros de prueba y la revisión entre equipos deben conservar su estado pendiente hasta su ejecución.

## Paso 1. Stakeholders y concerns

Los stakeholders representan a las personas o entidades con interés en Nexora, sus concerns expresan necesidades o preocupaciones que influyen en la arquitectura.

| ID | Stakeholder | Participación | Concern principal | Prioridad |
|---|---|---|---|---|
| S1 | Estudiante | Responde el cuestionario, consulta su resultado y solicita el informe | Privacidad de sus respuestas, acceso a su resultado y recepción del informe correcto | Alta |
| S2 | Administrador | Administra el sistema conforme a los permisos establecidos | Acceso controlado, conservación de datos y continuidad de las funciones | Alta |
| S3 | Equipo de desarrollo | Mantiene la API y sus integraciones | Cambios localizados, diagnóstico de errores y coherencia del historial | Alta |
| S4 | Proveedor de correo | Procesa la solicitud de envío del informe | Uso autorizado, respeto de límites de envío y prevención de abuso | Media |

**Nota.** Elaboración propia para Nexora, la participación del administrador no supone acceso irrestricto a los resultados privados del estudiante.

### Actores y fuentes del contexto general

| ID | Actor o fuente | Participación en el contexto | Relación con el alcance |
|---|---|---|---|
| S5 | Gestor de información académica | Mantiene la vigencia y exactitud de la información de carreras y universidades | Su función pertenece al contexto general, sus operaciones no forman parte de EP1–EP4 |
| S6 | Universidades y portales oficiales | Proporcionan fuentes de información sobre la oferta académica | Constituyen fuentes externas, no se presupone una integración automática mediante API |

El estudiante, el administrador y el gestor de información académica forman parte del contexto de uso del sistema, el equipo de desarrollo participa en su construcción y mantenimiento, por lo que no requiere una relación de uso como actor en el diagrama C4 de contexto.

### Contraste de concerns

| Enunciado deficiente | Problema | Versión corregida |
|---|---|---|
| El estudiante necesita JWT | Confunde el interés del participante con una solución técnica | El estudiante necesita que sus resultados e informes permanezcan privados |

## Paso 2. Restricciones y supuestos

### Restricciones del caso

| ID | Tipo | Restricción | Origen | Negociable |
|---|---|---|---|---|
| R1 | Técnica | Conservar React, FastAPI y PostgreSQL como base tecnológica | Base tecnológica del proyecto | Parcial, cualquier cambio exige evaluar su impacto |
| R2 | Académica | Analizar únicamente EP1, EP2, EP3 y EP4 | Alcance acordado para el deber | No en esta versión |
| R3 | Acceso | Restringir la consulta de evaluaciones y las solicitudes de informe a su propietario | Privacidad y propiedad del recurso | No |
| R4 | Datos | Conservar respuestas, resultados e interpretación histórica ante cambios de reglas | Historial de evaluaciones | No respecto a la conservación de datos |
| R5 | Integración | Utilizar Gmail SMTP para enviar el PDF solicitado | Integración definida para Nexora | Sí, el proveedor puede sustituirse |
| R6 | Funcional | Ofrecer orientación sin garantizar ingreso universitario ni afinidad profesional definitiva | Propósito del sistema | No en el alcance definido |

**Nota.** Elaboración propia para Nexora, las restricciones delimitan el análisis y no constituyen evidencia de cumplimiento técnico.

### Supuestos sujetos a validación

| ID | Supuesto | Validación prevista |
|---|---|---|
| SU1 | La cuenta del estudiante existe antes de iniciar el flujo | Autenticar una cuenta ficticia previamente creada |
| SU2 | El correo de destino es válido y accesible | Comprobar la recepción del informe en un buzón de prueba |
| SU3 | El volumen de informes se ajusta a los límites del proveedor | Contrastar el volumen esperado con los límites aplicables |
| SU4 | EP3 devuelve información suficiente para identificar el recurso requerido por EP4 | Inspeccionar OpenAPI y comprobar la relación entre evaluación, resultado e informe |

No se asigna un presupuesto ni un número de integrantes sin evidencia, las capacidades de concurrencia y los tiempos de respuesta requieren medición en un entorno definido.

## Paso 3. Drivers arquitectónicos

Los drivers son factores que condicionan las decisiones de estructura, persistencia, acceso e integración, su selección responde al flujo de los cuatro endpoints y a los intereses de los participantes.

| ID | Driver | Tipo | Origen | Importancia | Dificultad |
|---|---|---|---|---|---|
| D1 | Restringir resultados e informes a su propietario | Seguridad | S1, S2, R3 | Alta | Alta |
| D2 | Conservar completas y relacionadas las respuestas y el resultado de cada evaluación | Fiabilidad e integridad | S1, R4 | Alta | Alta |
| D3 | Responder oportunamente al registro y a la consulta de evaluaciones | Eficiencia de desempeño | S1, R2 | Alta | Media |
| D4 | Modificar las reglas de evaluación sin alterar el historial ni extender los cambios a otras funciones | Mantenibilidad | S3, R1, R4 | Alta | Media |
| D5 | Mantener las funciones principales ante fallos del proveedor de correo | Fiabilidad y disponibilidad | S1, S4, R5 | Alta | Media |

**Nota.** Elaboración propia para Nexora, la dificultad representa una estimación de diseño y requiere contraste con la estructura real del código.

La importancia alta expresa que los cinco drivers afectan el flujo principal, D1 y D2 presentan un mayor costo potencial de corrección por su relación con los permisos y los datos persistentes, la priorización relativa y la comparación de alternativas se desarrollan en la parte correspondiente del dossier.

### Implicaciones arquitectónicas

| Driver | Implicación para el diseño |
|---|---|
| D1 | Centralizar la autenticación y comprobar la propiedad del recurso en la API antes de consultar resultados o enviar informes |
| D2 | Definir una transacción para la evaluación, sus respuestas y su resultado, con reversión ante fallos |
| D3 | Revisar consultas, acceso a datos y comportamiento bajo carga mediante pruebas reproducibles |
| D4 | Separar las reglas de evaluación y conservar la versión de las reglas y del cuestionario asociada a cada resultado |
| D5 | Limitar la espera del proveedor de correo y controlar sus errores para preservar las demás operaciones |

Estas implicaciones orientan el diseño, su presencia en el documento no confirma su implementación, la arquitectura seleccionada y su justificación se registran en los ADR y en las vistas C4.

## Paso 4. Escenarios de calidad

Cada escenario identifica fuente, estímulo, entorno, artefacto, respuesta y medida, las tablas reúnen las situaciones de interés y las condiciones necesarias para reproducir su verificación.

### Escenarios del caso

| ID | Atributo | Driver | Escenario | Medida propuesta |
|---|---|---|---|---|
| E1 | Seguridad | D1 | Un estudiante autenticado solicita el envío del informe de una evaluación ajena, la API comprueba la propiedad y rechaza el acceso | 100 intentos, 100 rechazos y 0 informes enviados |
| E2 | Fiabilidad e integridad | D2 | Una prueba interrumpe la persistencia de respuestas y resultado, la API revierte la evaluación incompleta y conserva el historial | 30 fallos inducidos, 0 evaluaciones parciales y 0 alteraciones de evaluaciones anteriores |
| E3 | Eficiencia de desempeño | D3 | 50 usuarios virtuales consultan su última evaluación durante 10 minutos, la API devuelve el resultado correspondiente a cada cuenta | Percentil 95 de latencia ≤ 2 segundos, errores técnicos < 1 % y 0 resultados ajenos |
| E4 | Mantenibilidad | D4 | El responsable funcional solicita otra ponderación para nuevas evaluaciones, el cambio se localiza y conserva los resultados históricos | Tiempo ≤ 4 horas, cambios en ≤ 3 archivos de producción y 100 % de las pruebas de regresión acordadas aprobadas |
| E5 | Fiabilidad y disponibilidad | D5 | Gmail SMTP no responde durante 10 minutos, la API informa el fallo y mantiene operativos EP1, EP2 y EP3 | 20 errores de envío controlados, 0 éxitos falsos y ≥ 99 % de solicitudes válidas a EP1–EP3 correctas |

**Nota.** Elaboración propia para Nexora, las medidas representan criterios de aceptación propuestos y no resultados obtenidos, E5 es el escenario de fallo del correo.

### Condiciones de ejecución y respuesta observable

| ID | Fuente del estímulo | Estímulo | Entorno | Artefacto | Respuesta observable |
|---|---|---|---|---|---|
| E1 | Cuenta A autenticada | Solicitud de envío de un informe perteneciente a la cuenta B | Operación normal con datos ficticios de ambas cuentas | EP4 y control de propiedad | Denegar la operación antes de solicitar el envío SMTP, comprobar ausencia de correos y revisar el registro de solicitudes |
| E2 | Herramienta de inyección de fallos | Interrupción entre las escrituras de una evaluación | Base de prueba con 20 respuestas válidas por evaluación y evaluaciones históricas ficticias | EP2 y PostgreSQL | Revertir todas las escrituras de la evaluación fallida y conservar los registros anteriores |
| E3 | Herramienta de carga con 50 cuentas | Consultas concurrentes de la última evaluación | API con 2 vCPU y 4 GB de RAM, base de datos de prueba, 2 minutos de calentamiento y 10 minutos de medición, pausas de 2 segundos por usuario | EP3 | Devolver el resultado propio de cada cuenta y registrar latencia, errores e identidad del recurso |
| E4 | Responsable funcional | Solicitud de cambio de ponderación | Versión estable, reglas vigentes identificadas y conjunto de regresión definido antes del cambio | Lógica de evaluación utilizada por EP2 | Aplicar la nueva ponderación a evaluaciones nuevas, conservar el historial y registrar tiempo y archivos modificados |
| E5 | Proveedor SMTP simulado | Ausencia de respuesta durante 10 minutos | API y base de datos disponibles, 10 usuarios virtuales sobre EP1–EP3 con cuentas de prueba y 20 intentos de envío | EP4 y su integración de correo | Controlar el fallo sin declarar un envío exitoso, mantener operativas las otras tres operaciones y conservar las evaluaciones |

**Nota.** La medición de E4 excluye los archivos de pruebas y documentación del límite de tres archivos de producción, el entorno y la configuración definitiva de las pruebas deben registrarse junto a sus evidencias.

### Contraste de escenarios

| Enunciado vago | Qué falta | Versión verificable |
|---|---|---|
| El sistema debe ser rápido | Carga, entorno y medida | E3 establece 50 usuarios virtuales, 10 minutos de medición y percentil 95 de latencia ≤ 2 segundos en el entorno definido |
| El sistema debe ser seguro | Actor, recurso y respuesta | E1 establece que una cuenta A solicita el informe de una cuenta B, con 100 rechazos y 0 envíos |
| El correo no debe afectar al sistema | Duración del fallo, operaciones protegidas y criterio de éxito | E5 establece una caída SMTP de 10 minutos, 20 errores controlados y continuidad de EP1–EP3 |

### Trazabilidad del alcance

| Endpoint | Drivers relacionados | Escenarios relacionados | Verificación prevista |
|---|---|---|---|
| EP1 | D1, D5 | E5 respecto a la continuidad del inicio de sesión | Comprobar acceso con cuentas de prueba durante el fallo SMTP, la comprobación específica de credenciales inválidas se incorpora como escenario nuevo en la fase posterior |
| EP2 | D2, D4, D5 | E2, E4 y E5 | Comprobar reversión transaccional, conservación del historial y continuidad del registro |
| EP3 | D1, D3, D5 | E3 y E5 | Verificar identidad del resultado, latencia y continuidad de consulta |
| EP4 | D1, D5 | E1 y E5 | Rechazar solicitudes sobre recursos ajenos y controlar fallos de correo |

**Nota.** La relación entre endpoints y escenarios delimita lo que evalúa cada caso, E1 verifica el control de propiedad en EP4 y no sustituye una prueba específica de autorización de EP3.

## Estado de validación de la parte 1

| Elemento | Estado | Evidencia pendiente |
|---|---|---|
| Correspondencia de EP1–EP4 con la API | Pendiente de verificación | Contrato OpenAPI y solicitudes de prueba |
| E1. Propiedad del informe | Pendiente de ejecución | Registro de intentos rechazados y comprobación del buzón |
| E2. Integridad transaccional | Pendiente de ejecución | Registros de fallos y consultas de integridad |
| E3. Desempeño | Pendiente de ejecución | Configuración del entorno e informe de carga |
| E4. Cambio de reglas | Pendiente de ejecución | Diferencias de código, tiempo y resultados de regresión |
| E5. Fallo de correo | Pendiente de ejecución | Registros de errores y continuidad de EP1–EP3 |

La parte 1 reúne el contexto, los participantes, las restricciones, los supuestos, los drivers y los escenarios iniciales de calidad, el escenario adicional E6, la revisión cruzada, las alternativas, la matriz ponderada y los ADR se desarrollan en las secciones posteriores del dossier.
