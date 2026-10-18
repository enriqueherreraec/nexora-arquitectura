# Revisión cruzada de las vistas C4 de Nexora

## 1. Objetivo

Evaluar la consistencia de las vistas C4 de contexto y contenedores de Nexora, comprobar actores, límites, tecnologías y relaciones, contrastar su contenido con los drivers, escenarios de calidad y decisiones arquitectónicas del dossier.

## 2. Datos de la revisión

| Campo | Registro |
| --- | --- |
| Tipo de revisión | Revisión documental de las vistas C4 |
| Equipo revisor identificado | Katherin Elizabeth Siza Imbaquingo, Kelly Johana Mora Arteaga y Oscar Hernan Arevalo Narvaez |
| Equipo responsable de la resolución | Equipo de Nexora |
| Documentos principales | docs/02-vistas-c4/nivel1.md y docs/02-vistas-c4/nivel2.md |
| Documentos de contraste | Contexto y drivers, escenarios de calidad, ADR y matriz de decisión |
| Alcance del registro | Propuesta de evaluación y resolución para validación del equipo revisor |

Los resultados siguientes constituyen una propuesta documental, su aceptación por el equipo revisor requiere una confirmación expresa sobre la versión del repositorio que revise.

## 3. Criterios de revisión

### 3.1 Nivel 1: Contexto

| Código | Criterio | Dictamen propuesto | Fundamento de la evaluación |
| --- | --- | --- | --- |
| C1-01 | Incluye estudiante, gestor de información académica y administrador | Conforme | Los tres actores representan la consulta vocacional, el mantenimiento de información académica y la administración de accesos |
| C1-02 | Representa Nexora como un único sistema de software | Conforme | La vista de contexto conserva el sistema como una unidad y reserva su descomposición para el nivel 2 |
| C1-03 | Identifica Gmail SMTP como sistema externo | Conforme | El proveedor de correo se ubica fuera del límite de Nexora |
| C1-04 | Incluye los portales oficiales universitarios como sistemas externos | Conforme | Las fuentes institucionales conservan su independencia respecto de Nexora |
| C1-05 | Las relaciones describen las funciones de cada actor | Conforme | Las etiquetas distinguen consulta, evaluación vocacional, mantenimiento del catálogo y gestión de cuentas |
| C1-06 | La relación con los portales representa navegación mediante enlaces | Conforme | La relación expresa acceso a información oficial, sin atribuir sincronización automática del catálogo |
| C1-07 | La relación con el correo corresponde al envío del informe vocacional | Conforme | El servicio externo recibe la solicitud de envío del informe al correo del estudiante |

### 3.2 Nivel 2: Contenedores

| Código | Criterio | Dictamen propuesto | Fundamento de la evaluación |
| --- | --- | --- | --- |
| C2-01 | Conserva los tres actores del nivel 1 | Conforme | Los actores mantienen sus nombres y responsabilidades entre ambas vistas |
| C2-02 | Delimita la aplicación web, la API y PostgreSQL dentro de Nexora | Conforme | El límite del sistema comprende la interfaz, el procesamiento y la persistencia |
| C2-03 | Identifica React 19 y TypeScript en la aplicación web | Conforme | Las tecnologías permiten reconocer la responsabilidad de presentación |
| C2-04 | Identifica FastAPI y Python 3.11 en la API | Conforme | La API concentra las operaciones del sistema y la aplicación de reglas |
| C2-05 | Identifica PostgreSQL como contenedor de persistencia | Conforme | La base relacional conserva cuentas, catálogo, respuestas y resultados |
| C2-06 | Presenta ReportLab como biblioteca utilizada dentro de la API | Conforme | La generación de PDF pertenece al backend y no constituye un servicio independiente |
| C2-07 | Representa la comunicación entre aplicación web y API | Conforme | La relación identifica el intercambio de solicitudes y respuestas mediante JSON y PDF |
| C2-08 | Representa el acceso de la API a PostgreSQL mediante SQLAlchemy | Conforme | La relación permite reconocer el mecanismo de acceso a la persistencia |
| C2-09 | Conecta la API directamente con Gmail SMTP | Conforme | La solicitud de envío del informe corresponde al backend |
| C2-10 | Evita atribuir un proceso independiente de notificaciones sin evidencia | Conforme | La propuesta conserva el correo como integración de la API |
| C2-11 | Conecta la aplicación web con los portales oficiales mediante enlaces | Conforme | El navegador permite acceder a las páginas institucionales externas |
| C2-12 | Las relaciones incluyen propósito y protocolo o mecanismo | Conforme | Las etiquetas distinguen comunicación web, acceso SQL y envío de correo |

### 3.3 Consistencia del dossier

| Código | Criterio | Dictamen propuesto | Fundamento de la evaluación |
| --- | --- | --- | --- |
| CD-01 | Los nombres de actores y sistemas coinciden entre ambos niveles | Conforme | La nomenclatura permite relacionar el contexto con la descomposición en contenedores |
| CD-02 | Las funciones representadas corresponden al alcance documentado | Conforme | Las vistas cubren catálogo universitario, orientación vocacional, informes y administración |
| CD-03 | La vista de contenedores es compatible con ADR-003 | Conforme | Una API puede contener módulos y capas internas sin exigir servicios desplegables por separado |
| CD-04 | La API permite ubicar los controles de ADR-001 | Conforme | El backend constituye el punto de aplicación de la autorización, los roles y la propiedad de recursos |
| CD-05 | La relación API–PostgreSQL permite ubicar la responsabilidad de ADR-002 | Conforme | La persistencia de evaluaciones corresponde a las operaciones transaccionales del backend |
| CD-06 | La integración de correo es coherente con el escenario E5 | Conforme | La dependencia SMTP permite identificar el punto donde se requiere contener errores y limitar tiempos de espera |
| CD-07 | Los diagramas distinguen estructura y resultados de calidad | Conforme | La representación arquitectónica no demuestra por sí sola el cumplimiento de metas de seguridad, rendimiento o disponibilidad |
| CD-08 | Ambos diagramas deben visualizarse correctamente en GitHub | Comprobación en el repositorio | La aceptación de este criterio requiere abrir ambos archivos y comprobar su representación Mermaid |
| CD-09 | El código Mermaid debe conservar etiquetas legibles y control de versiones | Comprobación en el repositorio | La aceptación requiere revisar la legibilidad y el historial de la versión evaluada |

## 4. Interpretación de los resultados

El dictamen Conforme expresa el ajuste documental propuesto para cada criterio, no equivale a una prueba de ejecución ni a una aprobación atribuible al equipo revisor.

La revisión de diagramas permite evaluar responsabilidades y dependencias, las pruebas de seguridad, integridad, rendimiento, disponibilidad y usabilidad requieren evidencias específicas.

## 5. Observaciones propuestas y tratamiento

| Código | Criterio relacionado | Observación propuesta | Tratamiento recomendado | Evidencia para el cierre |
| --- | --- | --- | --- | --- |
| REV-01 | C1-06 y C2-11 | La relación con los portales puede confundirse con una integración automática de datos | Conservar etiquetas que expresen navegación mediante enlaces oficiales | Ambos diagramas describen la navegación y el alcance excluye la sincronización automática |
| REV-02 | C2-06 | La generación del informe PDF puede confundirse con un contenedor adicional | Identificar ReportLab como biblioteca interna de la API | El nivel 2 ubica la generación de PDF dentro de FastAPI |
| REV-03 | C2-09 y C2-10 | Un servicio independiente de notificaciones requiere evidencia de implementación o una decisión explícita de diseño | Conservar la conexión directa API–Gmail SMTP mientras esa sea la integración documentada | El nivel 2 y ADR-003 describen la misma dependencia de correo |
| REV-04 | C2-12 | Los protocolos del entorno local y del despliegue público deben distinguirse | Expresar HTTP en desarrollo local y HTTPS como condición del acceso público | La etiqueta web–API y la documentación del entorno conservan esa distinción |
| REV-05 | CD-04 y CD-05 | Las vistas ubican responsabilidades, pero no prueban autorización ni atomicidad | Relacionar las vistas con ADR-001, ADR-002 y sus escenarios de verificación | La trazabilidad identifica E1 y E2 sin presentar sus metas como resultados obtenidos |
| REV-06 | CD-06 | La dependencia SMTP puede afectar las operaciones si sus fallas no reciben un tratamiento explícito | Documentar límites de espera y contención de errores conforme al escenario E5 | E5 y ADR-003 describen el comportamiento esperado ante indisponibilidad del correo |

Estas observaciones son propuestas de revisión, el equipo de Nexora debe registrar como aplicadas únicamente las correcciones que consten en los archivos y en su historial de cambios.

## 6. Resultado técnico propuesto

La estructura descrita conserva una separación reconocible entre presentación, procesamiento y persistencia, los tres actores mantienen responsabilidades consistentes y los sistemas externos conservan su independencia respecto de Nexora.

La vista de contexto presenta el sistema como una unidad, la vista de contenedores desarrolla esa unidad mediante la aplicación web, la API y PostgreSQL, esta organización resulta compatible con la propuesta de monolito modular con capas para el backend.

Los puntos de atención se concentran en la precisión de las etiquetas, la ubicación de ReportLab dentro de la API, la integración directa con Gmail SMTP y la distinción entre decisiones documentadas y resultados de pruebas.

## 7. Evidencia y aceptación

La confirmación del equipo revisor debe identificar la versión evaluada mediante un enlace permanente al commit y expresar su conformidad o sus observaciones.

El cierre requiere relacionar cada corrección aceptada con el archivo afectado y el commit que la incorpora, si la revisión no exige cambios, la confirmación debe expresar esa conclusión de forma explícita.

Este registro conserva los nombres del equipo revisor identificado y una propuesta técnica de evaluación, no constituye una constancia de aprobación emitida por sus integrantes.

## 8. Documentos relacionados

- [C4 nivel 1: contexto](02-vistas-c4/nivel1.md)
- [C4 nivel 2: contenedores](02-vistas-c4/nivel2.md)
- [Contexto y drivers](01-contexto-y-drivers/contexto-y-drivers.md)
- [Escenarios de calidad](01-contexto-y-drivers/escenarios-de-calidad.md)
- [ADR-001: control de acceso](03-adr/ADR-001-control-de-acceso.md)
- [ADR-002: integridad de evaluaciones](03-adr/ADR-002.md)
- [ADR-003: estilo arquitectónico](03-adr/ADR-003-estilo-arquitectonico.md)
- [Matriz de decisión](03-adr/matriz-de-decision.md)
