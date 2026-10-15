# Revisión cruzada de las vistas C4 de Nexora

## 1. Objetivo

Revisar con otro equipo la consistencia de los diagramas C4 de niveles 1 y 2, comprobar sus actores, límites, contenedores, tecnologías y relaciones, contrastar las vistas con el contexto, los escenarios de calidad y las decisiones arquitectónicas.

## 2. Datos de la revisión

| Campo | Registro |
|---|---|
| Estado | Pendiente de revisión por otro equipo |
| Fecha | Por completar |
| Equipo revisor | Por completar |
| Participantes | Por completar |
| Commit revisado | Por completar con el enlace del commit |
| Documentos principales | docs/02-vistas-c4/nivel1.md y docs/02-vistas-c4/nivel2.md |
| Documentos de contraste | Contexto y drivers, escenarios de calidad, ADR y matriz de decisión |

La revisión debe referirse a un commit concreto para identificar la versión de los documentos que recibe el equipo revisor.

## 3. Criterios de revisión

### 3.1 Nivel 1: Contexto

| Código | Criterio | Resultado | Observación |
|---|---|---|---|
| C1-01 | Incluye estudiante, gestor de información académica y administrador | Pendiente | Por completar |
| C1-02 | Representa Nexora como un único sistema de software | Pendiente | Por completar |
| C1-03 | Identifica Gmail SMTP como sistema externo | Pendiente | Por completar |
| C1-04 | Incluye los portales oficiales de universidades como sistemas externos | Pendiente | Por completar |
| C1-05 | Las relaciones describen las funciones de cada actor | Pendiente | Por completar |
| C1-06 | La relación con los portales representa navegación mediante enlaces | Pendiente | Por completar |
| C1-07 | La relación con el correo corresponde al envío del informe vocacional | Pendiente | Por completar |

### 3.2 Nivel 2: Contenedores

| Código | Criterio | Resultado | Observación |
|---|---|---|---|
| C2-01 | Conserva los tres actores del nivel 1 | Pendiente | Por completar |
| C2-02 | Delimita la aplicación web, la API y PostgreSQL dentro de Nexora | Pendiente | Por completar |
| C2-03 | Identifica React 19 y TypeScript en la aplicación web | Pendiente | Por completar |
| C2-04 | Identifica FastAPI y Python 3.11 en la API | Pendiente | Por completar |
| C2-05 | Identifica PostgreSQL como contenedor de persistencia | Pendiente | Por completar |
| C2-06 | Presenta ReportLab como biblioteca utilizada dentro de la API | Pendiente | Por completar |
| C2-07 | Representa la comunicación entre aplicación web y API | Pendiente | Por completar |
| C2-08 | Representa el acceso de la API a PostgreSQL mediante SQLAlchemy | Pendiente | Por completar |
| C2-09 | Conecta la API directamente con Gmail SMTP | Pendiente | Por completar |
| C2-10 | Evita atribuir un proceso independiente de notificaciones sin evidencia | Pendiente | Por completar |
| C2-11 | Conecta la aplicación web con los portales oficiales mediante enlaces | Pendiente | Por completar |
| C2-12 | Las relaciones incluyen propósito y protocolo o mecanismo cuando corresponde | Pendiente | Por completar |

### 3.3 Consistencia del dossier

| Código | Criterio | Resultado | Observación |
|---|---|---|---|
| CD-01 | Los nombres de actores y sistemas coinciden entre ambos niveles | Pendiente | Por completar |
| CD-02 | Las funciones representadas corresponden al alcance documentado | Pendiente | Por completar |
| CD-03 | La vista de contenedores es compatible con el estilo de ADR-003 | Pendiente | Por completar |
| CD-04 | La API representa el punto de aplicación de los controles de ADR-001 | Pendiente | Por completar |
| CD-05 | La relación API–PostgreSQL permite ubicar la responsabilidad de ADR-002 | Pendiente | Por completar |
| CD-06 | La integración de correo es coherente con el escenario E5 | Pendiente | Por completar |
| CD-07 | Los diagramas no presentan objetivos de calidad como resultados comprobados | Pendiente | Por completar |
| CD-08 | Ambos diagramas se muestran correctamente en GitHub | Pendiente | Por completar |
| CD-09 | El código Mermaid está versionado y sus etiquetas son legibles | Pendiente | Por completar |

## 4. Registro de resultados

El equipo revisor debe utilizar los valores Conforme, Requiere corrección o No aplica, cada criterio que requiere corrección debe incluir una observación concreta.

Una revisión documental puede detectar diferencias e inconsistencias, pero no sustituye las pruebas de calidad ni la inspección del código de la aplicación.

## 5. Observaciones y resolución

| Código | Criterio relacionado | Observación del equipo revisor | Resolución del equipo de Nexora | Estado | Evidencia |
|---|---|---|---|---|---|
| REV-01 | Por completar | Por completar tras la revisión | Por completar | Pendiente | Por completar |

Las observaciones pueden aceptarse, modificarse o rechazarse con una justificación, cada corrección debe identificar el archivo afectado y el commit que la incorpora.

## 6. Cierre de la revisión

| Campo | Registro |
|---|---|
| Resultado general | Pendiente |
| Correcciones solicitadas | Por completar |
| Correcciones aplicadas | Por completar |
| Observaciones abiertas | Por completar |
| Commit posterior a las correcciones | Por completar |
| Confirmación del equipo revisor | Por completar |

## 7. Estado de la evidencia

Este archivo prepara el registro de la revisión cruzada, todavía no acredita la participación de otro equipo ni la conformidad de los diagramas, los campos deben completarse con los datos y observaciones reales.

## 8. Documentos relacionados

- [C4 nivel 1: contexto](02-vistas-c4/nivel1.md)
- [C4 nivel 2: contenedores](02-vistas-c4/nivel2.md)
- [Contexto y drivers](01-contexto-y-drivers/contexto-y-drivers.md)
- [Escenarios de calidad](01-contexto-y-drivers/escenarios-de-calidad.md)
- [ADR-001: control de acceso](03-adr/ADR-001-control-de-acceso.md)
- [ADR-002: integridad de evaluaciones](03-adr/ADR-002.md)
- [ADR-003: estilo arquitectónico](03-adr/ADR-003-estilo-arquitectonico.md)
- [Matriz de decisión](03-adr/matriz-de-decision.md)