# ADR-001: Control de acceso por roles

| Campo | ADR-001 |
|---|---|
| **Título** | Autenticación con JWT y autorización por roles en Nexora |
| **Estado** | Adoptada para la autenticación con JWT y Argon2id, pendiente de verificación integral de la autorización por roles y la propiedad de evaluaciones e informes |
| **Contexto** | Nexora utiliza React, FastAPI y PostgreSQL, la autenticación existente emplea JWT y contraseñas protegidas con Argon2id, el driver D1 exige impedir operaciones sin permiso y acceso a resultados de otras cuentas, el escenario E1 establece que un estudiante no puede modificar carreras mediante solicitudes directas a la API |
| **Decisión** | Conservar la autenticación con PyJWT y Argon2id, centralizar la autorización en FastAPI, verificar el rol en cada operación protegida y comprobar la propiedad de las evaluaciones e informes antes de permitir su consulta, descarga o envío por correo, denegar las operaciones que carecen de autorización |
| **Alternativas** | (a) Controlar permisos solo en React: se descarta porque una solicitud directa a la API puede evitar ese control, (b) utilizar sesiones almacenadas en el servidor: es viable, pero requiere sustituir el mecanismo JWT existente y mantener el estado de las sesiones |
| **Consecuencias** | A favor: aprovechar la autenticación existente, aplicar permisos comunes y proteger los recursos personales, en contra: controlar la expiración de tokens, definir cómo invalidar el acceso tras cambios de rol y mantener pruebas de autorización por operación |
| **Trade-off** | Se conserva JWT para reducir el cambio sobre la implementación existente, a cambio, la revocación inmediata de permisos requiere un mecanismo explícito, como consultar el estado y los permisos actuales de la cuenta en las operaciones protegidas |
| **Vínculo** | Driver D1, escenario E1, restricciones R-01 y R-02, requisitos RF-01, RF-09 y RF-10, vista C4 nivel 2: aplicación web → API de Nexora → PostgreSQL |
| **Verificación prevista** | Ejecutar las 100 solicitudes de modificación del catálogo con una cuenta de estudiante, comprobar 100 respuestas HTTP 403 y 0 modificaciones en PostgreSQL, verificar también que una cuenta no puede consultar evaluaciones ni informes de otra cuenta |

## Documentos relacionados

- [Contexto y drivers](../01-contexto-y-drivers/contexto-y-drivers.md)
- [Escenarios de calidad](../01-contexto-y-drivers/escenarios-de-calidad.md)
- [Vista C4 nivel 2](../02-vistas-c4/nivel2.md)