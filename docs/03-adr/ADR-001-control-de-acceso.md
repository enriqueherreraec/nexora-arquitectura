# ADR-001. Control de acceso a evaluaciones e informes

## Estado

Propuesta documentada, pendiente de verificación en el código y de validación mediante pruebas.

## Contexto

Nexora conserva respuestas, evaluaciones y resultados asociados a cada estudiante, la consulta de estos recursos y el envío de informes requieren verificar la identidad del solicitante y su relación con la evaluación.

La autenticación por sí sola no garantiza la privacidad, un estudiante con una sesión válida podría intentar acceder a un informe ajeno si la API acepta el identificador del recurso sin comprobar su propietario.

El alcance de esta decisión comprende el inicio de sesión y los controles de acceso de los cuatro endpoints del deber, las funciones administrativas pertenecen al contexto general y no conceden acceso irrestricto a resultados privados.

## Drivers y restricciones relacionados

| Identificador | Relación con la decisión |
|---|---|
| S1. Estudiante | Requiere privacidad de sus respuestas, resultados e informes |
| S2. Administrador | Requiere una gestión de acceso conforme a permisos explícitos |
| D1. Seguridad | Restringir resultados e informes a su propietario |
| R1. Base tecnológica | Mantener FastAPI como backend |
| R3. Propiedad del recurso | Restringir las operaciones sobre evaluaciones e informes al estudiante propietario |

## Decisión

Centralizar la autenticación y los controles de autorización en la API FastAPI, utilizar el mecanismo JWT previsto para el proyecto y comprobar la propiedad de las evaluaciones antes de consultar resultados o solicitar el envío de informes.

La identidad del estudiante debe proceder del token validado por el backend, el identificador de usuario que envíe la interfaz no constituye una prueba de propiedad.

La validación del JWT debe comprobar su firma, su vigencia y los datos necesarios para identificar la cuenta, la implementación concreta y sus parámetros requieren revisión del código y de la configuración.

## Aplicación a los endpoints

| ID | Método y endpoint | Control requerido |
|---|---|---|
| EP1 | POST `/api/v1/auth/login` | Validar las credenciales antes de emitir un token |
| EP2 | POST `/api/v1/evaluaciones/` | Exigir autenticación y asociar la evaluación con la cuenta identificada por el token |
| EP3 | GET `/api/v1/evaluaciones/ultima` | Exigir autenticación y consultar únicamente la última evaluación de esa cuenta |
| EP4 | POST `/api/v1/informes/{id}/enviar-correo` | Exigir autenticación y verificar la propiedad del recurso antes de generar el PDF o solicitar su envío |

**Nota.** La relación entre el identificador de EP4, el informe y la evaluación requiere comprobación en OpenAPI y en el modelo de datos.

## Reglas de autorización

1. La API valida la identidad antes de ejecutar una operación protegida.
2. EP2 obtiene el propietario de la identidad autenticada.
3. EP3 limita la consulta a las evaluaciones del estudiante autenticado.
4. EP4 comprueba que el informe solicitado corresponde a una evaluación del solicitante.
5. El rechazo de una solicitud ajena debe ocurrir antes de generar o enviar el informe.
6. La interfaz puede ocultar opciones según el rol, el control efectivo permanece en el backend.
7. Los permisos del administrador y del gestor requieren reglas explícitas, su rol no concede acceso automático a resultados privados.
8. Los registros de diagnóstico deben excluir contraseñas, tokens completos y respuestas privadas innecesarias.

## Alternativas consideradas

| Alternativa | Ventaja | Limitación | Resultado |
|---|---|---|---|
| Controles solo en la interfaz | Menor esfuerzo inicial | Las solicitudes directas a la API pueden evitar las restricciones visuales | Descartada |
| Autenticación sin comprobación de propiedad | Identifica a la cuenta solicitante | Permite acceso indebido si se acepta un identificador ajeno | Descartada |
| Autenticación y autorización centralizadas en la API | Aplica los controles sobre cada operación y recurso | Exige verificar la propiedad y mantener pruebas de acceso | Seleccionada |

## Justificación

La API concentra las operaciones sobre datos persistentes y constituye el punto adecuado para aplicar los controles comunes, comprobar la propiedad en ese límite protege las consultas y los informes ante solicitudes directas o alteraciones de parámetros.

El uso de JWT se conserva como mecanismo previsto para Nexora, la protección depende de su validación correcta y de la autorización sobre cada recurso, disponer de un token válido no sustituye la comprobación de propiedad.

## Consecuencias

### Beneficios

- Unificar los controles de identidad en las operaciones protegidas.
- Evitar que una cuenta consulte o envíe informes de otra.
- Asociar las evaluaciones con una identidad verificada por el backend.
- Facilitar pruebas de acceso con cuentas y recursos distintos.

### Costos y compromisos

- Mantener la configuración y la gestión de claves del mecanismo de autenticación.
- Comprobar la propiedad en las consultas y operaciones sobre recursos.
- Definir el comportamiento ante tokens inválidos, vencidos o cuentas sin autorización.
- Mantener pruebas de regresión para prevenir fallos de acceso.
- Resolver la revocación de tokens conforme a las necesidades del proyecto, sin asumir que JWT la proporciona por sí solo.

## Escenarios de validación

### E1. Solicitud de informe ajeno

| Elemento | Definición |
|---|---|
| Fuente | Estudiante autenticado con la cuenta A |
| Estímulo | Solicitar mediante EP4 el informe de una evaluación perteneciente a la cuenta B |
| Entorno | Operación normal con cuentas y evaluaciones ficticias |
| Artefacto | EP4 y su control de propiedad |
| Respuesta | Rechazar la solicitud antes de generar el informe o contactar al proveedor SMTP |
| Medida | 100 intentos, 100 rechazos y 0 informes enviados |

### E6. Credenciales inválidas

Este escenario adicional corresponde a la fase posterior del dossier y amplía la validación del control de acceso sin incorporar otro endpoint.

| Elemento | Definición |
|---|---|
| Fuente | Cliente de prueba |
| Estímulo | Presentar credenciales inválidas en EP1 |
| Entorno | API disponible y cuentas ficticias preparadas para la prueba |
| Artefacto | POST `/api/v1/auth/login` |
| Respuesta | Rechazar la autenticación y no emitir un token válido |
| Medida | 100 intentos, 100 respuestas HTTP 401 y 0 tokens válidos |

**Nota.** HTTP 401 constituye el criterio propuesto para E6, su correspondencia con el contrato real requiere verificación antes de ejecutar la prueba, E6 no demuestra protección completa ante ataques de fuerza bruta.

### Comprobaciones complementarias

| Operación | Comprobación |
|---|---|
| EP2 | Un identificador de usuario alterado en la solicitud no permite registrar una evaluación a nombre de otra cuenta |
| EP3 | La respuesta corresponde exclusivamente a la cuenta autenticada |
| EP2, EP3 y EP4 | Un token ausente, inválido o vencido no permite ejecutar la operación |
| EP4 | Una solicitud rechazada no produce un correo ni una respuesta de envío exitoso |

## Evidencias requeridas

| Evidencia | Estado |
|---|---|
| Inspección del mecanismo JWT y de su configuración | Pendiente |
| Revisión de los controles de propiedad en la API | Pendiente |
| Registro de ejecución de E1 | Pendiente |
| Registro de ejecución de E6 | Pendiente |
| Comprobaciones complementarias de EP2 y EP3 | Pendiente |
| Correspondencia de respuestas con OpenAPI | Pendiente |

La decisión no acredita pruebas aprobadas, su validación requiere conservar solicitudes, respuestas y registros de ejecución con datos ficticios y sin credenciales sensibles.

## Impacto en las vistas C4

En el nivel 1, Nexora asume la responsabilidad de proteger los recursos del estudiante, en el nivel 2, la autenticación y la autorización pertenecen a la API y la aplicación web utiliza las operaciones expuestas por ese backend.

## Condiciones para revisar la decisión

- Incorporar nuevos clientes o integraciones con requisitos de identidad diferentes.
- Exigir cierre inmediato de todas las sesiones o revocación centralizada.
- Incorporar acceso institucional mediante un proveedor externo de identidad.
- Modificar los permisos sobre evaluaciones e informes.
- Detectar incumplimientos en E1, E6 o las pruebas complementarias.

## Documentación relacionada

- [Contexto, drivers y escenarios iniciales](../01-contexto-y-drivers/contexto-y-drivers.md)
- [C4 nivel 1: contexto](../02-vistas-c4/nivel1.md)
- [C4 nivel 2: contenedores](../02-vistas-c4/nivel2.md)
- [ADR-002: integridad de evaluaciones](ADR-002.md)
