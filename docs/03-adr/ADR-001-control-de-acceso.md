# ADR-001. Control de acceso a evaluaciones e informes

## Estado

Propuesta, pendiente de verificación en el código y validación mediante pruebas.

## Contexto

Nexora conserva respuestas, resultados e informes privados de cada estudiante, una sesión válida identifica al solicitante, pero no garantiza que tenga autorización sobre una evaluación concreta.

Esta decisión responde a D1, seguridad, y R3, propiedad del recurso, el control debe aplicarse en la API para proteger los datos ante solicitudes directas o cambios en los identificadores.

## Decisión

Centralizar la autenticación y la autorización en FastAPI, utilizar el mecanismo JWT previsto para Nexora y obtener la identidad de la cuenta a partir del token validado.

EP1 valida las credenciales antes de emitir un token, EP2 asocia la evaluación con la cuenta autenticada, EP3 consulta únicamente su última evaluación y EP4 comprueba la propiedad del recurso antes de generar el PDF o solicitar su envío.

La API debe verificar la firma y vigencia del token, los roles de administrador y gestor no conceden acceso automático a resultados privados.

## Alternativas consideradas

| Alternativa | Limitación o beneficio | Decisión |
|---|---|---|
| Controles solo en la interfaz | Las solicitudes directas pueden evitar las restricciones visuales | Descartada |
| Autenticación sin comprobar la propiedad | Identifica al usuario, pero no impide solicitar recursos ajenos | Descartada |
| Autenticación y autorización en la API | Protege cada operación según la identidad y la propiedad del recurso | Seleccionada |

## Consecuencias

| Beneficios | Costos y compromisos |
|---|---|
| Aplicar controles comunes en las operaciones protegidas | Mantener la validación y configuración del mecanismo JWT |
| Proteger resultados e informes frente a otras cuentas | Comprobar la propiedad en las consultas y solicitudes |
| Asociar evaluaciones con una identidad verificada | Mantener pruebas de autorización y regresión |

La interfaz puede ocultar opciones según el rol, el control efectivo permanece en la API, la revocación de tokens requiere una política específica si el proyecto exige cierre inmediato de sesiones.

## Validación

| Escenario o comprobación | Criterio propuesto |
|---|---|
| E1. Solicitud de informe ajeno | 100 intentos, 100 rechazos y 0 informes enviados |
| E6. Credenciales inválidas | 100 intentos, 100 respuestas HTTP 401 y 0 tokens válidos |
| Propiedad en EP2 y EP3 | Impedir el registro a nombre de otra cuenta y la consulta de resultados ajenos |
| Tokens ausentes, inválidos o vencidos | Rechazar el acceso a EP2, EP3 y EP4 |

**Nota.** Las pruebas permanecen pendientes, E6 es el escenario adicional del dossier y HTTP 401 constituye su criterio propuesto, la correspondencia con el contrato real requiere verificación en OpenAPI.

## Documentación relacionada

- [Contexto, drivers y escenarios iniciales](../01-contexto-y-drivers/contexto-y-drivers.md)
- [ADR-002: integridad e historial](ADR-002.md)
- [C4 nivel 2: contenedores](../02-vistas-c4/nivel2.md)
- [Contexto, drivers y escenarios iniciales](../01-contexto-y-drivers/contexto-y-drivers.md)
- [C4 nivel 1: contexto](../02-vistas-c4/nivel1.md)
- [C4 nivel 2: contenedores](../02-vistas-c4/nivel2.md)
- [ADR-002: integridad de evaluaciones](ADR-002.md)
