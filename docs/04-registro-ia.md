# Registro de uso de inteligencia artificial

## Herramientas utilizadas

- **Semana 1:** ChatGPT (OpenAI) apoyó la organización, redacción inicial y revisión de documentos arquitectónicos; Antigravity se utilizó como entorno de desarrollo con asistencia de IA.
- **Semana 2:** Antigravity AI Assistant (Google DeepMind) integrado en el IDE como herramienta I-CASE para la generación de especificaciones OpenAPI, diseño de algoritmos vocacionales, implementación de endpoints FastAPI, pruebas unitarias y transaccionales en PostgreSQL, y redacción de informes técnicos.

---

## Historial de actividades (Semana 1)

| Actividad | Prompt resumido | Salida | Revisión y tratamiento |
|---|---|---|---|
| Contexto y escenarios | Adaptar el dossier a Nexora y sus cuatro endpoints | Propuestas de contexto, drivers y escenarios | Ajustar al alcance acordado y distinguir metas de resultados comprobados |
| Diagramas C4 | Representar los niveles 1 y 2 de Nexora | Código Mermaid | Revisar actores y tecnologías, corregir la distribución y excluir un servicio independiente de notificaciones sin evidencia |
| Decisiones arquitectónicas | Comparar alternativas y preparar los ADR | Borradores de decisiones y matriz ponderada | Comprobar cálculos y coherencia, conservar pendientes las pruebas y el contraste con el código |
| Desarrollo previo | Apoyar ajustes del catálogo, cuestionario e informes | Cambios reportados mediante Antigravity | Consultar el historial de desarrollo para verificar el detalle de las intervenciones |

---

## Actividades realizadas en la Semana 2

| Actividad | Herramienta y modelo | Prompt resumido | Salida o artefacto | Defectos y limitaciones detectados | Decisión | Método de verificación y evidencia |
|---|---|---|---|---|:---:|---|
| **Mapa de Toolchain CASE (06)** | Antigravity AI Assistant (Google DeepMind) | "Diseñar cadena CASE para Nexora con 6 fases, 10 tareas identificadas T1-T10, escala F×E×R y priorización de las 3 herramientas Top." | Borrador de [`docs/06-mapa-toolchain.md`](06-mapa-toolchain.md) y diagrama Mermaid. | La propuesta inicial sugería tareas genéricas de un sistema de turnos en lugar del cuestionario vocacional de 20 preguntas y despacho PDF de Nexora. | **Modificar y aceptar** | Revisión humana y ajuste a las 4 operaciones reales del proyecto. Verificado en [06-mapa-toolchain.md](06-mapa-toolchain.md). |
| **Historias y Criterios Gherkin (07)** | Antigravity AI Assistant (Google DeepMind) | "Redactar 4 historias HU y criterios CA en Gherkin vinculados a interesados S1/S2, drivers D1-D5, escenarios E1-E6 y norma ISO 29148." | Estructura de [`docs/07-historias-y-criterios.md`](07-historias-y-criterios.md) y matriz de trazabilidad. | Se omitió inicialmente el caso límite de respuestas todas en cero y se asignaba status 200 genérico a la creación de evaluaciones en lugar de 201 Created. | **Modificar y aceptar** | Inclusión de escenarios de error explícitos y revisión de necesidad, verificabilidad y consistencia bajo ISO 29148. |
| **Contrato OpenAPI y Spectral** | Antigravity AI Assistant (Google DeepMind) | "Generar especificación OpenAPI 3.0.3 para las 4 rutas analizadas con esquemas reutilizables, ejemplos sintéticos y .spectral.yaml." | [`api/openapi.yaml`](../api/openapi.yaml) y [`.spectral.yaml`](../.spectral.yaml). | Spectral detectó una advertencia de barra final (`path-keys-no-trailing-slash`) en `/api/v1/evaluaciones/` y un error en el ejemplo al que le faltaba la propiedad requerida `todas_cero`. | **Modificar y aceptar** | Validación automatizada con Spectral CLI arrojando 0 errores. Evidencia en [`evidencias/contrato/spectral-validation.txt`](../evidencias/contrato/spectral-validation.txt). |
| **Lógica Vocacional y Reglas (T6)** | Antigravity AI Assistant (Google DeepMind) | "Implementar algoritmo de cálculo de afinidades de 10 áreas sobre 20 preguntas Likert con detección de empates e inmutabilidad ADR-002." | Módulo [`src/services/evaluacion_service.py`](../src/services/evaluacion_service.py). | La función inicial resolvía empates seleccionando arbitrariamente la primera clave y no incluía la constante de versión histórica inmutable. | **Modificar y aceptar** | Se agregaron los campos `es_empate`, `areas_empatadas` y `version_cuestionario = '3.0-20preguntas'`. Evidencia en [`evidencias/herramientas/t6-ia-assistance.md`](../evidencias/herramientas/t6-ia-assistance.md). |
| **Generación de PDF con ReportLab** | Antigravity AI Assistant (Google DeepMind) | "Crear servicio ReportLab para generar informe formal vocacional en PDF con encabezado, tabla de datos y carreras recomendadas." | Módulo [`src/services/pdf_service.py`](../src/services/pdf_service.py). | El código inicial intentaba guardar el archivo en disco (`output.pdf`) en lugar de generar un flujo en memoria (`io.BytesIO`), lo que causaba bloqueos de concurrencia. | **Modificar y aceptar** | Se refactorizó a `io.BytesIO` para permitir generación en memoria y streaming seguro. |
| **Manejo Controlado de SMTP (E5)** | Antigravity AI Assistant (Google DeepMind) | "Implementar servicio de correo que capture errores o timeouts del servidor SMTP y retorne HTTP 503 sin crashear el backend." | Módulo [`src/services/email_service.py`](../src/services/email_service.py). | Inicialmente se propagaba un error 500 no controlado ante fallos de conexión de sockets. | **Modificar y aceptar** | Se introdujo `SMTPServiceUnavailableException` y manejo explícito con HTTP 503 controlado. |
| **Suite de Pruebas Pytest** | Antigravity AI Assistant (Google DeepMind) | "Escribir suite de pruebas Pytest con cliente TestClient, base aislada PostgreSQL y comprobación rigurosa de CA-01.2, E2, E5 y CA-04.2." | Directorio [`tests/`](../tests/) (`conftest.py`, `test_auth.py`, `test_evaluaciones.py`, `test_informes.py`). | La prueba previa de E2 enviaba valores inválidos rechazados por Pydantic antes de persistir, sin probar rollback real. Se refactorizó con payload válido, flush transaccional e inyección de excepción en 30 iteraciones; además se incorporó validación estricta con StrictInt y aislamiento con monkeypatch.delenv. | **Modificar y aceptar** | Ejecución exitosa de 27 pruebas con 92 % de cobertura de código. Evidencia en [`evidencias/pruebas/pytest-results.txt`](../evidencias/pruebas/pytest-results.txt). |

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
