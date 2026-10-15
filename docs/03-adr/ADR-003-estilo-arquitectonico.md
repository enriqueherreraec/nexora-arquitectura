# ADR-003: Selección del estilo arquitectónico de Nexora

| Campo | ADR-003 |
|---|---|
| **Título** | Monolito modular con capas para el backend de Nexora |
| **Estado** | Propuesta como decisión final del dossier, pendiente de aceptación del equipo y verificación de los límites modulares en el código |
| **Contexto** | Nexora utiliza una aplicación web con React y TypeScript, una API con FastAPI y una base de datos PostgreSQL, el proyecto requiere proteger los recursos personales, conservar evaluaciones coherentes, consultar el catálogo con tiempos aceptables y permitir cambios en sus reglas, la matriz compara un monolito modular con capas y una alternativa de microservicios |
| **Decisión** | Seleccionar un monolito modular con capas para el backend, conservar FastAPI como una unidad desplegable y organizar sus responsabilidades en módulos de acceso, catálogo académico, evaluación vocacional e informes, separar los endpoints, la lógica de aplicación y el acceso a datos, conservar React como contenedor de presentación y PostgreSQL como contenedor de persistencia |
| **Alternativas** | (a) Monolito modular con capas: obtiene 4,10 sobre 5 en la matriz ponderada, (b) microservicios por capacidad: obtiene 3,35 sobre 5, permite despliegue y escalado independientes, pero requiere gestionar comunicación remota, contratos, configuraciones y recuperación de fallos entre servicios |
| **Consecuencias** | A favor: aprovechar la implementación existente, facilitar transacciones locales, aplicar controles comunes y reducir la complejidad operativa, en contra: desplegar el backend como una unidad, compartir recursos de ejecución y exigir disciplina para conservar los límites entre módulos |
| **Trade-off** | Se priorizan la integridad de las evaluaciones y la simplicidad operativa, a cambio de limitar el despliegue y escalado independientes de cada capacidad, el aislamiento del correo requiere medidas explícitas para evitar que una falla externa afecte las consultas |
| **Vínculo** | Drivers D1 a D6, escenarios E1 a E6, restricciones R-01, R-04 y R-08, ADR-001, ADR-002, matriz de decisión y vistas C4 niveles 1 y 2 |
| **Verificación prevista** | Revisar las dependencias entre módulos y ejecutar los procedimientos de E1 a E6, registrar resultados, diferencias y acciones correctivas, comprobar que los diagramas representan los contenedores y relaciones de la solución |

## 1. Organización del backend

| Módulo | Responsabilidad |
|---|---|
| Acceso | Autenticación, autorización y comprobación de identidad y permisos |
| Catálogo académico | Consulta y mantenimiento de universidades y carreras |
| Evaluación vocacional | Validación de respuestas, aplicación de reglas, resultados e historial |
| Informes | Generación del PDF y coordinación de su envío por correo |

La organización define límites lógicos dentro de una misma aplicación FastAPI, los módulos no representan microservicios ni procesos independientes.

## 2. Separación por capas

| Capa | Responsabilidad | Regla de dependencia |
|---|---|---|
| Endpoints de la API | Recibir solicitudes, validar su estructura y devolver respuestas | Invocar la lógica de aplicación sin concentrar las reglas vocacionales |
| Lógica de aplicación y dominio | Resolver casos de uso, aplicar permisos y reglas, definir los límites de las operaciones | Utilizar interfaces o funciones de acceso a datos sin depender de la interfaz React |
| Persistencia e integraciones | Acceder a PostgreSQL y adaptar la comunicación con servicios externos | Evitar reglas vocacionales dentro de consultas o adaptadores de correo |

React pertenece al contenedor de presentación del sistema, la separación de capas del backend no implica crear contenedores adicionales en la vista C4 nivel 2.

## 3. Condiciones de la decisión

- Aplicar la autorización en el servidor y comprobar la propiedad de los recursos
- Conservar respuestas y resultados de una evaluación mediante una transacción
- Identificar las reglas utilizadas por cada evaluación
- Evitar dependencias circulares entre módulos
- Concentrar la integración SMTP en un adaptador con límites de espera y errores controlados
- Mantener las credenciales fuera del código y de la documentación pública

## 4. Correspondencia con las vistas C4

| Elemento del nivel 2 | Correspondencia con la decisión |
|---|---|
| Aplicación web React | Presentación de las funciones de Nexora |
| API FastAPI | Monolito modular con separación por capas |
| PostgreSQL | Persistencia de cuentas, catálogo y evaluaciones |
| Gmail SMTP | Servicio externo utilizado para entregar informes |

La generación de PDF mediante ReportLab ocurre dentro del backend, el estilo seleccionado conserva los contenedores del nivel 2 y define la organización interna de FastAPI.

## 5. Límites de la evidencia

La matriz expresa una valoración arquitectónica inicial, sus puntuaciones no demuestran el cumplimiento de los escenarios, la presencia de FastAPI y PostgreSQL tampoco acredita por sí sola una estructura modular con capas.

La revisión del código debe identificar las responsabilidades, dependencias y transacciones existentes, cualquier diferencia entre la decisión y la implementación debe registrarse como trabajo pendiente.

## 6. Revisión futura

La decisión debe revisarse si las pruebas revelan límites persistentes de rendimiento, si una capacidad requiere despliegues independientes o si los fallos del envío de informes afectan las consultas pese a las medidas de contención.

La revisión debe comparar evidencia, costo de cambio e impacto sobre los escenarios antes de separar una capacidad en otro servicio.

## 7. Documentos relacionados

- [Contexto y drivers](../01-contexto-y-drivers/contexto-y-drivers.md)
- [Escenarios de calidad](../01-contexto-y-drivers/escenarios-de-calidad.md)
- [Matriz de decisión](matriz-de-decision.md)
- [ADR-001: control de acceso](ADR-001-control-de-acceso.md)
- [ADR-002: integridad de evaluaciones](ADR-002.md)
- [C4 nivel 1](../02-vistas-c4/nivel1.md)
- [C4 nivel 2](../02-vistas-c4/nivel2.md)