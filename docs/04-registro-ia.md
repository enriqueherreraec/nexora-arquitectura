# Registro de uso de inteligencia artificial

> **Nota:** Se incorpora la identificación de versiones y modelos en atención a la retroalimentación docente del dossier de la semana 1.

## Herramientas utilizadas

- **Semana 1:**
  - *Aplicación:* ChatGPT (OpenAI). *Modelo:* Modelo no identificado en la evidencia disponible. *Fuente de comprobación:* No registrada en la sesión original. Apoyó la organización, redacción inicial y revisión de documentos arquitectónicos.
  - *Aplicación:* Antigravity (Google DeepMind). *Modelo:* Modelo no identificado en la evidencia disponible (no extrapolable retrospectivamente desde capturas de sesiones posteriores). *Fuente de comprobación:* No registrada en la sesión original. Utilizado como entorno de desarrollo con asistencia de IA en desarrollo previo.
- **Semana 2 y seguimiento:**
  - *Aplicación:* Antigravity AI Assistant (Google DeepMind) integrado en el IDE como herramienta I-CASE.
  - *Actividades históricas de la Semana 2:* Modelo no identificado en la evidencia disponible en las sesiones originales (asistencia interactiva registrada en `evidencias/herramientas/t6-ia-assistance.md` sin especificación del modelo).
  - *Sesión de actualización (25/10/2026):* Modelo Gemini 3.8 Flash (High), comprobado directamente en el selector de modelo de la interfaz de la sesión activa en Antigravity IDE.

---

## Historial de actividades (Semana 1)

| Actividad | Herramienta | Versión o modelo utilizado | Fuente de comprobación de la versión | Prompt resumido | Salida | Revisión y tratamiento |
|---|---|---|---|---|---|---|
| Contexto y escenarios | ChatGPT (OpenAI) | Modelo no identificado en la evidencia disponible | No registrada en la sesión original | Adaptar el dossier a Nexora y sus cuatro endpoints | Propuestas de contexto, drivers y escenarios | Ajustar al alcance acordado y distinguir metas de resultados comprobados |
| Diagramas C4 | ChatGPT (OpenAI) | Modelo no identificado en la evidencia disponible | No registrada en la sesión original | Representar los niveles 1 y 2 de Nexora | Código Mermaid | Revisar actores y tecnologías, corregir la distribución y excluir un servicio independiente de notificaciones sin evidencia |
| Decisiones arquitectónicas | ChatGPT (OpenAI) | Modelo no identificado en la evidencia disponible | No registrada en la sesión original | Comparar alternativas y preparar los ADR | Borradores de decisiones y matriz ponderada | Comprobar cálculos y coherencia, conservar pendientes las pruebas y el contraste con el código |
| Desarrollo previo | Antigravity IDE (Google DeepMind) | Modelo no identificado en la evidencia disponible | No registrada en la sesión original | Apoyar ajustes del catálogo, cuestionario e informes | Cambios reportados mediante Antigravity | Consultar el historial de desarrollo para verificar el detalle de las intervenciones |

---

## Actividades realizadas en la Semana 2 y seguimiento

| Actividad | Herramienta | Versión o modelo utilizado | Fuente de comprobación de la versión | Prompt resumido | Salida o artefacto | Defectos y limitaciones detectados | Decisión | Método de verificación y evidencia |
|---|---|---|---|---|---|---|:---:|---|
| **Mapa de Toolchain CASE (06)** | Antigravity AI Assistant (Google DeepMind) | Modelo no identificado en la evidencia disponible | No registrada en la sesión original | "Diseñar cadena CASE para Nexora con 6 fases, 10 tareas identificadas T1-T10, escala F×E×R y priorización de las 3 herramientas Top." | Borrador de [`docs/06-mapa-toolchain.md`](06-mapa-toolchain.md) y diagrama Mermaid. | La propuesta inicial sugería tareas genéricas de un sistema de turnos en lugar del cuestionario vocacional de 20 preguntas y despacho PDF de Nexora. | **Modificar y aceptar** | Revisión humana y ajuste a las 4 operaciones reales del proyecto. Verificado en [06-mapa-toolchain.md](06-mapa-toolchain.md). |
| **Historias y Criterios Gherkin (07)** | Antigravity AI Assistant (Google DeepMind) | Modelo no identificado en la evidencia disponible | No registrada en la sesión original | "Redactar 4 historias HU y criterios CA en Gherkin vinculados a interesados S1/S2, drivers D1-D5, escenarios E1-E6 y norma ISO 29148." | Estructura de [`docs/07-historias-y-criterios.md`](07-historias-y-criterios.md) y matriz de trazabilidad. | Se omitió inicialmente el caso límite de respuestas todas en cero y se asignaba status 200 genérico a la creación de evaluaciones en lugar de 201 Created. | **Modificar y aceptar** | Inclusión de escenarios de error explícitos y revisión de necesidad, verificabilidad y consistencia bajo ISO 29148. |
| **Contrato OpenAPI y Spectral** | Antigravity AI Assistant (Google DeepMind) | Modelo no identificado en la evidencia disponible | No registrada en la sesión original | "Generar especificación OpenAPI 3.0.3 para las 4 rutas analizadas con esquemas reutilizables, ejemplos sintéticos y .spectral.yaml." | [`api/openapi.yaml`](../api/openapi.yaml) y [`.spectral.yaml`](../.spectral.yaml). | Spectral detectó una advertencia de barra final (`path-keys-no-trailing-slash`) en `/api/v1/evaluaciones/` y un error en el ejemplo al que le faltaba la propiedad requerida `todas_cero`. | **Modificar y aceptar** | Validación automatizada con Spectral CLI v6.17.0 arrojando 0 errores. Evidencia en [`evidencias/contrato/spectral-validation.txt`](../evidencias/contrato/spectral-validation.txt). |
| **Lógica Vocacional y Reglas (T6)** | Antigravity AI Assistant (Google DeepMind) | Modelo no identificado en la evidencia disponible | Servicio inteligente en sesión activa sin registro de modelo en [`t6-ia-assistance.md`](../evidencias/herramientas/t6-ia-assistance.md) | "Implementar algoritmo de cálculo de afinidades de 10 áreas sobre 20 preguntas Likert con detección de empates e inmutabilidad ADR-002." | Módulo [`src/services/evaluacion_service.py`](../src/services/evaluacion_service.py). | La función inicial resolvía empates seleccionando arbitrariamente la primera clave y no incluía la constante de versión histórica inmutable. | **Modificar y aceptar** | Se agregaron los campos `es_empate`, `areas_empatadas` y `version_cuestionario = '3.0-20preguntas'`. Evidencia en [`evidencias/herramientas/t6-ia-assistance.md`](../evidencias/herramientas/t6-ia-assistance.md). |
| **Generación de PDF con ReportLab** | Antigravity AI Assistant (Google DeepMind) | Modelo no identificado en la evidencia disponible | No registrada en la sesión original | "Crear servicio ReportLab para generar informe formal vocacional en PDF con encabezado, tabla de datos y carreras recomendadas." | Módulo [`src/services/pdf_service.py`](../src/services/pdf_service.py). | El código inicial intentaba guardar el archivo en disco (`output.pdf`) en lugar de generar un flujo en memoria (`io.BytesIO`), lo que causaba bloqueos de concurrencia. | **Modificar y aceptar** | Se refactorizó a `io.BytesIO` para permitir generación en memoria y streaming seguro. |
| **Manejo Controlado de SMTP (E5)** | Antigravity AI Assistant (Google DeepMind) | Modelo no identificado en la evidencia disponible | No registrada en la sesión original | "Implementar servicio de correo que capture errores o timeouts del servidor SMTP y retorne HTTP 503 sin crashear el backend." | Módulo [`src/services/email_service.py`](../src/services/email_service.py). | Inicialmente se propagaba un error 500 no controlado ante fallos de conexión de sockets. | **Modificar y aceptar** | Se introdujo `SMTPServiceUnavailableException` y manejo explícito con HTTP 503 controlado. |
| **Suite de Pruebas Pytest** | Antigravity AI Assistant (Google DeepMind) | Modelo no identificado en la evidencia disponible | No registrada en la sesión original | "Escribir suite de pruebas Pytest con cliente TestClient, base aislada PostgreSQL y comprobación rigurosa de CA-01.2, E2, E5 y CA-04.2." | Directorio [`tests/`](../tests/) (`conftest.py`, `test_auth.py`, `test_evaluaciones.py`, `test_informes.py`). | La prueba previa de E2 enviaba valores inválidos rechazados por Pydantic antes de persistir, sin probar rollback real. Se refactorizó con payload válido, flush transaccional e inyección de excepción en 30 iteraciones; además se incorporó validación estricta con StrictInt y aislamiento con monkeypatch.delenv. | **Modificar y aceptar** | Ejecución exitosa de 27 pruebas con Pytest 9.1.1 en Python 3.11.9 sobre PostgreSQL 18.4 con 92 % de cobertura. Evidencia en [`evidencias/pruebas/pytest-results.txt`](../evidencias/pruebas/pytest-results.txt). |
| **Actualización del registro de versiones por retroalimentación docente (25/10/2026)** | Antigravity AI Assistant (Google DeepMind) | Gemini 3.8 Flash (High) | Selector de modelo e información de sesión activa en Antigravity IDE (25/10/2026) | "Actualizar docs/04-registro-ia.md para registrar versiones de herramientas y modelos conforme a la recomendación docente, distinguiendo aplicación de modelo y evitando atribución retroactiva." | Registro actualizado en [`docs/04-registro-ia.md`](04-registro-ia.md) con trazabilidad de versiones. | La propuesta inicial intentó atribuir retrospectivamente el modelo actual a sesiones anteriores de la Semana 2. | **Modificar y aceptar** | Se corrigió restringiendo Gemini 3.8 Flash (High) exclusivamente a la sesión activa comprobada y declarando modelo no identificado en las actividades históricas previas. |

---

## Contrastes y correcciones transversales

| Propuesta inicial revisada | Tratamiento y corrección aplicada |
|---|---|
| Usar SQLite en memoria para pruebas de persistencia | **Rechazado.** Se mantuvo PostgreSQL 18.4 real sobre una base aislada (`nexora_test_semana2`) para cumplir estrictamente la regla de no sustitución del stack y probar transacciones reales (E2). |
| Simular correo sin activación explícita en pruebas | **Rechazado.** La simulación solo opera con activación explícita (`MODO_PRUEBAS_SIMULACION_CORREO=true`) en entorno `testing`. Fuera de testing o sin credenciales, se produce un error controlado (HTTP 503), nunca un éxito simulado falso. |
| Presentar respuestas estáticas como prueba del mock | **Rechazado.** Se ejecutó el servidor Prism CLI real en el puerto 4010, enviando solicitudes HTTP vivas y capturando sus respuestas en `mock-requests.json`. |
| Declarar cumplimiento de E3 mediante pruebas unitarias | **Rechazado.** Se distinguió formalmente la prueba funcional de aislamiento de la prueba de carga sostenida del dossier base (100 usuarios virtuales durante 10 minutos, P95 ≤ 2s, errores < 1 %). |

---

## Responsabilidad ética y académica

El equipo de desarrollo conserva la autoría, control y responsabilidad sobre todos los artefactos del proyecto. Ningún código o documento generado por herramientas de IA se incorporó sin inspección crítica, refactorización y verificación mediante pruebas automatizadas. Se garantiza la ausencia de credenciales reales, tokens de producción, archivos `.env` y datos personales en todo el repositorio.
