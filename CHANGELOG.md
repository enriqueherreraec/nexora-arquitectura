# Registro de Cambios (Changelog)

Todos los cambios notables en el proyecto Nexora se documentan en este archivo.
El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [0.2.0] - 2026-10-22

### Añadido
- **Mapa de Toolchain y Cadena CASE (`docs/06-mapa-toolchain.md`):** Definición de 10 tareas del ciclo de desarrollo (T1 a T10) con escalas de frecuencia, esfuerzo manual y riesgo (F×E×R) y selección justificada de herramientas Upper, Lower e I-CASE.
- **Pruebas de Herramientas Prioritarias (`evidencias/herramientas/`):** Pruebas reales y verificables de Spectral CLI (T4), Stoplight Prism Mock (T7) y Antigravity AI Assistant (Google DeepMind) (T6).
- **Historias de Usuario y Criterios Gherkin (`docs/07-historias-y-criterios.md`):** Cuatro historias de usuario estructuradas (*Como / Quiero / Para*) con criterios ejecutables en español (*Dado / Cuando / Entonces*), evaluación formal de calidad bajo **ISO/IEC/IEEE 29148:2018** y matriz de trazabilidad bidireccional.
- **Contrato OpenAPI 3.0.3 (`api/openapi.yaml`):** Especificación formal completa para las cuatro operaciones analizadas (`/api/v1/auth/login`, `/api/v1/evaluaciones`, `/api/v1/evaluaciones/ultima`, `/api/v1/informes/{id}/enviar-correo`), con esquemas Pydantic, seguridad Bearer JWT y ejemplos sintéticos sin credenciales reales.
- **Configuración y Validación con Spectral (`.spectral.yaml`):** Conjunto de reglas estrictas para gobernanza del contrato OpenAPI, validado con cero errores de severidad.
- **Documentación Interactiva (`docs/api/index.html`):** Compilada estáticamente mediante Redocly CLI (`@redocly/cli` v1.26.1).
- **Stubs de Servidor Generados (`generated/server/`):** Generados automáticamente mediante OpenAPI Generator CLI (v7.26.0 sobre OpenJDK 17).
- **Servicio Backend Ejecutable (`src/`):** Implementación en FastAPI, SQLAlchemy y Argon2id organizada en monolito modular con capas (ADR-003): autenticación con hash seguro Argon2id, cálculo de 10 áreas sobre 20 respuestas Likert (0 a 4), validación estricta de cuestionario, generación de informes PDF en memoria con ReportLab y manejo controlado de excepciones SMTP (HTTP 503).
- **Suite de Pruebas Automatizadas (`tests/`):** 27 pruebas con `pytest` y `TestClient` sobre una base aislada `nexora_test_semana2` en PostgreSQL 18.4 real, verificando historias HU-01 a HU-04, reversión transaccional real E2 ante 30 fallos inducidos tras flush en DB con sesión limpia, resiliencia SMTP E5 con aislamiento estricto de simulación (HTTP 503 si falta flag explícito o si se elimina con `monkeypatch.delenv`), validación estricta de cuestionario con `StrictInt` (rechazo de booleanos, cadenas numéricas y flotantes con 422, claves y rangos con 400), carga explícita de `.env` y controles de seguridad CA-01.2 (100 credenciales inválidas rechazadas) y CA-04.2 (100 accesos a informes ajenos rechazados). Cobertura de código alcanzada: 92 %.
- **Matriz de Evaluación de Herramientas (`docs/08-evaluacion-herramientas.md`):** Comparación ponderada de Spectral, Prism y Antigravity AI con pesos que suman el 100 %, fundamentada en pruebas reales y análisis de complementariedad.
- **Informe Final de la Cadena CASE (`docs/09-informe-cadena-case.md`):** Documento técnico y académico completo que reúne todas las fases, evidencias, limitaciones y conclusiones.
- **Configuración de Linter (`.flake8`):** Archivo de configuración para Flake8 con cero violaciones detectadas.
- **Archivo de Dependencias Reproducible (`requirements.txt`):** Especificación de paquetes requeridos para backend y pruebas.
- **Ignorados de Control de Versiones (`.gitignore`):** Protección estricta contra subida de entornos virtuales, credenciales, secretos y cachés.

### Modificado
- **Lecturas de Apoyo (`docs/lecturas-de-apoyo.md`):** Renombrado desde `docs/06-lecturas-de-apoyo.md` para reservar el número 06 al mapa de toolchain; ampliado con síntesis académica de **ISO/IEC/IEEE 29148:2018** y **Pro Git** (capítulos 1 y 2).
- **Registro de Inteligencia Artificial (`docs/04-registro-ia.md`):** Actualizado preservando el historial de la Semana 1 e incorporando las 7 intervenciones reales de la Semana 2, sus prompts, salidas, defectos detectados y decisiones de refactorización.
- **README Principal (`README.md`):** Actualizado para reflejar la cadena CASE de la Semana 2, instrucciones paso a paso de reproducción, validación, mocking, ejecución y pruebas.

---

## [0.1.0] - 2026-10-15

### Añadido
- Dossier de arquitectura inicial de Nexora.
- Contexto, participantes (S1 a S4), restricciones (R1 a R6) y supuestos (SU1 a SU4).
- Drivers arquitectónicos (D1 a D5) y escenarios de calidad iniciales (E1 a E5).
- Vistas C4 de nivel 1 (Contexto) y nivel 2 (Contenedores).
- Registros de decisiones arquitectónicas: ADR-001 (Control de acceso), ADR-002 (Integridad e historial) y ADR-003 (Monolito modular con capas).
- Matriz de decisión de estilos arquitectónicos y análisis de sensibilidad.
- Registro inicial de uso de IA y bitácora de revisión cruzada.
