# Documentación del Contrato API de Nexora

Este directorio contiene la documentación formal generada a partir de la especificación [openapi.yaml](../../api/openapi.yaml).

## Artefactos generados

1. **Documentación interactiva HTML:**
   - Archivo: [`index.html`](index.html)
   - Herramienta: Redocly CLI (`@redocly/cli` v1.26.1).
   - Comando de compilación:
     ```bash
     npx -y @redocly/cli build-docs api/openapi.yaml --output docs/api/index.html
     ```

2. **Simulación Mock:**
   - Herramienta: Stoplight Prism CLI (`@stoplight/prism-cli` v5.15.11).
   - Comando de ejecución:
     ```bash
     npx -y @stoplight/prism-cli mock api/openapi.yaml -p 4010 -h 127.0.0.1
     ```
   - Evidencias: [`evidencias/contrato/mock-requests.json`](../../evidencias/contrato/mock-requests.json) y [`evidencias/contrato/mock-server-execution.log`](../../evidencias/contrato/mock-server-execution.log).

3. **Stubs de servidor Python / FastAPI:**
   - Directorio de salida: [`generated/server/`](../../generated/server/)
   - Herramienta: OpenAPI Generator CLI (`@openapitools/openapi-generator-cli` v7.26.0 sobre Java OpenJDK 17).
   - Comando de generación:
     ```bash
     npx -y @openapitools/openapi-generator-cli generate -i api/openapi.yaml -g python-fastapi -o generated/server/ --additional-properties=packageName=nexora_server_stubs
     ```

## Operaciones del alcance analizado

| ID | Método | Ruta | Resumen | operationId | Respuestas documentadas |
|---|---|---|---|---|---|
| EP1 | `POST` | `/api/v1/auth/login` | Iniciar sesión | `iniciarSesion` | 200 (Token JWT), 401 (Credenciales inválidas), 403 (Inactiva), 422 |
| EP2 | `POST` | `/api/v1/evaluaciones` | Registrar evaluación (20 preguntas) | `crearEvaluacion` | 201 (Resultado atómico), 400 (Incompleto), 401 (No auth), 422 |
| EP3 | `GET` | `/api/v1/evaluaciones/ultima` | Consultar última evaluación propia | `obtenerUltimaEvaluacion` | 200 (Última evaluación o null), 401 (No auth) |
| EP4 | `POST` | `/api/v1/informes/{id}/enviar-correo` | Enviar informe PDF al correo | `enviarInformeCorreo` | 200 (Despachado), 401 (No auth), 404 (No autorizado/ajeno), 503 (Fallo SMTP) |

## Distinción metodológica

- **Mock (Simulación):** Emula las respuestas basadas en ejemplos del contrato para desacoplar el desarrollo de la interfaz de usuario. No ejecuta lógica de persistencia ni genera archivos binarios reales.
- **Stubs (Código base generado):** Andamiaje sintáctico de modelos Pydantic y enrutadores generado automáticamente por OpenAPI Generator para garantizar compatibilidad con el contrato.
- **Servicio ejecutable (`src/`):** Implementación completa con reglas de negocio, transacciones atómicas en base de datos PostgreSQL real, generación de PDF con ReportLab y manejo controlado de excepciones.
