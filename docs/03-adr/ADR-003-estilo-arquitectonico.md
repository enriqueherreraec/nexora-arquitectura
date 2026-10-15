# ADR-003: Selección del estilo arquitectónico de Nexora

| Campo | ADR-003 |
|---|---|
| **Título** | Monolito modular con capas para el backend de Nexora |
| **Estado** | Propuesta como decisión final del dossier, pendiente de aceptación del equipo y verificación de los límites modulares en el código |
| **Contexto** | Nexora utiliza React y TypeScript como interfaz, FastAPI como API y PostgreSQL como base de datos, genera informes PDF con ReportLab y solicita su envío directamente a Gmail SMTP, la interfaz ofrece enlaces hacia portales oficiales de universidades, el sistema requiere proteger recursos personales, conservar evaluaciones coherentes y permitir cambios controlados |
| **Decisión** | Seleccionar un monolito modular con capas para el backend, conservar FastAPI como una unidad desplegable y organizar sus responsabilidades en acceso, catálogo académico, evaluación vocacional e informes, separar endpoints, lógica de aplicación y persistencia, conservar React y PostgreSQL como contenedores diferenciados |
| **Alternativas** | (a) Monolito modular con capas: obtiene 4,10 sobre 5 en la matriz ponderada, (b) microservicios por capacidad: obtiene 3,35 sobre 5, permite despliegues y escalado independientes, pero exige gestionar contratos remotos, configuraciones y recuperación de fallos entre servicios |
| **Consecuencias** | A favor: aprovechar la implementación existente, facilitar transacciones locales y reducir la complejidad operativa, en contra: desplegar el backend como una unidad, compartir recursos de ejecución y exigir disciplina para conservar los límites entre módulos |
| **Trade-off** | Se priorizan la integridad de las evaluaciones y la simplicidad operativa, a cambio de limitar el despliegue y escalado independientes, la conexión directa con SMTP exige controlar esperas y errores para evitar que una falla del proveedor afecte las consultas |
| **Vínculo** | Drivers D1 a D6, escenarios E1 a E6, restricciones R-01, R-04, R-08 y R-09, ADR-001, ADR-002, matriz de decisión y vistas C4 niveles 1 y 2 |
| **Verificación prevista** | Revisar módulos y dependencias, ejecutar los procedimientos de E1 a E6 y contrastar las relaciones de los diagramas con el código, comprobar que los enlaces oficiales abren el destino previsto sin suponer sincronización de datos |

## 1. Organización del backend

| Módulo | Responsabilidad |
|---|---|
| Acceso | Autenticar usuarios, aplicar permisos y comprobar la propiedad de los recursos |
| Catálogo académico | Consultar y mantener universidades, carreras, modalidades y enlaces oficiales |
| Evaluación vocacional | Validar respuestas, aplicar reglas y conservar resultados e historial |
| Informes | Generar el PDF y solicitar su envío a Gmail SMTP |

Los módulos representan una organización lógica dentro de FastAPI, su definición no implica procesos independientes ni microservicios.

## 2. Separación por capas

| Capa | Responsabilidad | Regla |
|---|---|---|
| Endpoints | Recibir solicitudes, validar su estructura y devolver respuestas | Delegar los casos de uso a la lógica de aplicación |
| Aplicación y dominio | Aplicar reglas vocacionales, coordinar operaciones y verificar permisos | Evitar dependencias de la interfaz React y del protocolo SMTP |
| Persistencia e integraciones | Acceder a PostgreSQL y adaptar la comunicación con Gmail SMTP | Evitar reglas vocacionales dentro de consultas y adaptadores externos |

La aplicación React presenta las funciones del sistema y consume la API, los enlaces oficiales forman parte de la navegación de la interfaz.

## 3. Correspondencia con las vistas C4

| Elemento | Tipo | Relación con la decisión |
|---|---|---|
| Aplicación web | Contenedor: React 19 y TypeScript | Presentar catálogo, cuestionario, resultados y paneles, abrir enlaces oficiales |
| API de Nexora | Contenedor: FastAPI y Python 3.11 | Ejecutar el backend modular, generar informes y solicitar correos |
| Base de datos | Contenedor: PostgreSQL | Conservar cuentas, catálogo, respuestas y resultados |
| Gmail SMTP | Sistema externo | Recibir las solicitudes de envío del informe PDF |
| Portales oficiales de universidades | Sistemas externos | Proporcionar información institucional mediante navegación por enlaces |

ReportLab funciona como biblioteca dentro del backend, el nivel 2 no incorpora un servicio independiente de notificaciones porque el flujo documentado conecta FastAPI directamente con Gmail SMTP.

Los portales oficiales permanecen fuera del límite de Nexora, su relación representa apertura de enlaces y no una integración automática para actualizar el catálogo.

## 4. Condiciones de la decisión

- Aplicar la autorización en FastAPI y comprobar la propiedad de evaluaciones e informes
- Registrar respuestas y resultados de una evaluación dentro de una transacción
- Identificar la versión del cuestionario y de sus reglas de cálculo
- Evitar dependencias circulares entre módulos
- Concentrar la comunicación SMTP en un adaptador con límites de espera y errores controlados
- Evitar que una falla del correo impida consultar resultados
- Mantener las credenciales fuera del código y de la documentación pública
- Revisar los enlaces oficiales como parte del mantenimiento del catálogo

La conexión directa con SMTP no garantiza por sí sola el aislamiento de fallos, el cumplimiento de E5 requiere una prueba específica.

## 5. Fundamento de la selección

La matriz ponderada favorece la alternativa A con 4,10 sobre 5 frente a 3,35 de la alternativa B, la selección aprovecha la base tecnológica existente y facilita la integridad de las evaluaciones mediante transacciones locales.

Los microservicios ofrecen independencia de despliegue y mayor aislamiento de procesos, esas ventajas requieren una infraestructura y una coordinación que deben justificarse con necesidades y evidencia del proyecto.

## 6. Límites de la evidencia

Las puntuaciones de la matriz corresponden a una valoración arquitectónica inicial, no representan resultados experimentales, la presencia de FastAPI y PostgreSQL tampoco demuestra por sí sola que el código respete límites modulares y capas.

La revisión del repositorio debe identificar las responsabilidades, dependencias y transacciones existentes, cualquier diferencia debe registrarse como trabajo pendiente y reflejarse en el dossier.

## 7. Criterios de revisión futura

La decisión debe revisarse si las pruebas muestran límites persistentes de rendimiento pese a la optimización, si una capacidad requiere despliegues independientes o si el envío de informes afecta las consultas pese a las medidas de contención.

La revisión debe comparar el costo y el beneficio de separar una capacidad en otro proceso o servicio, cualquier cambio requiere actualizar las vistas C4, la matriz y los ADR relacionados.

## 8. Documentos relacionados

- [Contexto y drivers](../01-contexto-y-drivers/contexto-y-drivers.md)
- [Escenarios de calidad](../01-contexto-y-drivers/escenarios-de-calidad.md)
- [Matriz de decisión](matriz-de-decision.md)
- [ADR-001: control de acceso](ADR-001-control-de-acceso.md)
- [ADR-002: integridad de evaluaciones](ADR-002.md)
- [C4 nivel 1](../02-vistas-c4/nivel1.md)
- [C4 nivel 2](../02-vistas-c4/nivel2.md)