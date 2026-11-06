# 🎓 Informe Final de Consolidación · Sistema Nexora
### Automatización de Procesos de Software · Semana 4: Informe, Repositorio y Pipeline CI/CD

**UNIVERSIDAD POLITÉCNICA ESTATAL DEL CARCHI (UPEC)**  
**POSGRADO · MAESTRÍA EN INGENIERÍA EN SOFTWARE**  
**MÓDULO 8: AUTOMATIZACIÓN DE PROCESOS DE SOFTWARE**

---

### Metadatos Académicos

| Campo | Detalle institucional |
|---|---|
| **Programa** | Maestría en Ingeniería en Software |
| **Módulo** | Automatización de Procesos de Software (Unidad 4) |
| **Actividad** | Actividad autónoma · Semana 4: Informe, repositorio y pipeline |
| **Docente** | Ing. José Luis Rodríguez Chinchilla, Mgs. |
| **Fecha de corte** | 06 de noviembre de 2026 |
| **Versión del sistema** | `v0.3.0` (SemVer) |
| **Repositorio oficial** | [`https://github.com/enriqueherreraec/nexora-arquitectura`](https://github.com/enriqueherreraec/nexora-arquitectura) |

### 👥 Integrantes del Equipo

- **Baren Tarira Rosa Angélica** (`rosa.baren@upec.edu.ec`)
- **Herrera Celi Enrique Rolando** (`enrique.herrera@upec.edu.ec`)
- **Mera Rodríguez Willington Daniel** (`willington.mera@upec.edu.ec`)

---

### 🛡️ Insignias de Estado del Repositorio (Badges)

[![CI/CD Pipeline](https://github.com/enriqueherreraec/nexora-arquitectura/actions/workflows/ci.yml/badge.svg)](https://github.com/enriqueherreraec/nexora-arquitectura/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-v0.3.0-blue.svg)](https://github.com/enriqueherreraec/nexora-arquitectura/releases)
[![Tests](https://img.shields.io/badge/tests-27%20passed%20(local)-brightgreen.svg)](tests/)
[![Flake8](https://img.shields.io/badge/linter-flake8--0%20violations-success.svg)](.flake8)
[![Spectral](https://img.shields.io/badge/OpenAPI-Spectral--0%20errors-brightgreen.svg)](.spectral.yaml)
[![UPEC](https://img.shields.io/badge/UPEC-Maestr%C3%ADa%20en%20Software-purple.svg)](https://www.upec.edu.ec/)
[![Render](https://img.shields.io/badge/Render-Deployment%20Ready-blue.svg)](backend/)

---

## 1. Resumen del Caso y Alcance del Sistema (a)

Nexora es un sistema web de orientación vocacional y consulta de oferta académica universitaria diseñado para estudiantes de bachillerato del Ecuador. Su objetivo es democratizar el acceso a la información universitaria pública, guiando al postulante a través de un cuestionario reflexivo no clínico de 20 preguntas en escala Likert (0–4), calculando su nivel de afinidad en 10 áreas vocacionales, permitiéndole comparar ofertas de 984 carreras vigentes en 31 universidades públicas del país y generando un informe formal en formato PDF despachado por correo electrónico.

El alcance formal analizado y automatizado en la maestría abarca cuatro operaciones clave:
1. **Autenticación segura (EP1 - `POST /api/v1/auth/login`):** Validación de credenciales con hash criptográfico Argon2id y emisión de Bearer JWT de 120 minutos.
2. **Registro atómico de evaluación (EP2 - `POST /api/v1/evaluaciones`):** Persistencia de 20 respuestas numéricas (`StrictInt`), cómputo en memoria de áreas vocacionales, control de inmutabilidad y atomicidad transaccional ACID en PostgreSQL.
3. **Consulta de histórico propio (EP3 - `GET /api/v1/evaluaciones/ultima`):** Aislamiento estricto de datos entre estudiantes verificado por token.
4. **Despacho de informe vocacional (EP4 - `POST /api/v1/informes/{id}/enviar-correo`):** Generación de PDF formal en memoria con ReportLab y despacho SMTP resiliente con manejo de excepciones (HTTP 503 controlado).

Enlaces directos a los artefactos:
- Contexto institucional y alcance: [`docs/01-contexto-y-drivers/contexto-y-drivers.md`](01-contexto-y-drivers/contexto-y-drivers.md).
- Especificación formal del contrato: [`api/openapi.yaml`](../api/openapi.yaml).
- Historias de usuario y criterios ejecutables: [`docs/07-historias-y-criterios.md`](07-historias-y-criterios.md).

---

## 2. Arquitectura de Software: Drivers, Escenarios y Decisiones (b)

La arquitectura de Nexora responde a cinco drivers arquitectónicos fundamentales (D1 a D5) y seis escenarios de calidad (E1 a E6), documentados formalmente en los Registros de Decisiones Arquitectónicas (ADR):

### Drivers y Escenarios de Calidad
- **D1 / E1 (Seguridad y Rendimiento en Autenticación):** P95 < 500 ms en emisión de tokens, hash Argon2id resistente a ataques de GPU, resuelto en [ADR-001](03-adr/ADR-001-control-de-acceso.md).
- **D2 / E2 (Integridad Transaccional e Inmutabilidad):** Atomicidad completa de las 20 respuestas Likert y su ponderación; reversión estricta (*rollback*) ante excepciones sin registros huérfanos, resuelto en [ADR-002](03-adr/ADR-002.md).
- **D3 / E3 (Aislamiento entre Estudiantes y Concurrencia):** Cada estudiante únicamente puede inspeccionar sus propias evaluaciones.
- **D4 / E4 (Disponibilidad y Mantenibilidad del Catálogo):** Consulta rápida de carreras universitarias sin dependencias externas bloqueantes.
- **D5 / E5 (Tolerancia a Fallos en Servicios Externos):** Ante caída o timeout del servidor SMTP, el sistema no crashea; retorna un código de error controlado HTTP 503 manteniendo íntegros los datos de la evaluación.
- **E6 (Generación Eficiente de Documentos):** Generación de informes PDF en memoria (`io.BytesIO`) con ReportLab sin almacenar temporales en disco.

### Decisiones de Arquitectura (ADR)
- [**ADR-001 (Control de acceso a evaluaciones e informes):**](03-adr/ADR-001-control-de-acceso.md) Selección de tokens Bearer JWT validados en FastAPI y hash seguro Argon2id.
- [**ADR-002 (Integridad e inmutabilidad de evaluaciones):**](03-adr/ADR-002.md) Transacciones ACID en PostgreSQL y congelamiento de versión de cuestionario (`version_cuestionario`).
- [**ADR-003 (Estilo arquitectónico de monolito modular con capas):**](03-adr/ADR-003-estilo-arquitectonico.md) Descarte de microservicios distribuidos en favor de un monolito modular con capas (FastAPI + React 19 + PostgreSQL) para eliminar latencias de red y complejidad operativa innecesaria.
- [**ADR-004 (Control de versiones con Git, GitHub y GitHub Flow):**](03-adr/ADR-004-control-de-versiones.md) Selección de Git y GitHub Flow con ramas cortas por tarea, commits convencionales y protección de rama principal con revisión por pares obligatoria.

Vistas de arquitectura C4:
- Contexto del sistema (Nivel 1): [`docs/02-vistas-c4/nivel1.md`](02-vistas-c4/nivel1.md).
- Contenedores del sistema (Nivel 2): [`docs/02-vistas-c4/nivel2.md`](02-vistas-c4/nivel2.md).

---

## 3. Cadena CASE: Herramientas Seleccionadas y Evaluación (c)

En la Semana 2 se definió y ponderó la cadena de herramientas CASE (*Computer-Aided Software Engineering*) bajo los lineamientos del estándar internacional **ISO/IEC 14102:2008**:

- **Fases del Ciclo de Vida y Tareas (T1 a T10):** Se priorizaron 10 tareas mediante la escala de Frecuencia, Esfuerzo Manual y Riesgo ($F \times E \times R$).
- **Herramientas Upper CASE:** Stoplight Spectral CLI (`v6.17.0`) para gobernanza estricta del contrato OpenAPI contra [`.spectral.yaml`](../.spectral.yaml).
- **Herramientas Lower CASE:** Stoplight Prism CLI para simulación mock, OpenAPI Generator CLI para andamiaje de stubs de servidor, Flake8 (`v7.4.0`) para análisis de estilo PEP 8 y Pytest (`v9.1.1`) para pruebas automatizadas.
- **Herramientas I-CASE:** Antigravity AI Assistant (Google DeepMind) como copiloto de arquitectura, refactorización y generación de pruebas.

Enlaces a evidencias y reportes CASE:
- Mapa de toolchain priorizado: [`docs/06-mapa-toolchain.md`](06-mapa-toolchain.md).
- Matriz ponderada de evaluación: [`docs/08-evaluacion-herramientas.md`](08-evaluacion-herramientas.md).
- Informe técnico de la cadena CASE: [`docs/09-informe-cadena-case.md`](09-informe-cadena-case.md).

---

## 4. Control de Versiones: Flujo de Ramas, Conflicto y Decisión Git vs SVN (d)

- **Modelo de Trabajo:** Adopción estricta de **GitHub Flow**, normada en [`CONTRIBUTING.md`](../CONTRIBUTING.md): toda actividad parte de un issue previo, se desarrolla en una rama corta atómica con prefijos estándar (`docs/`, `feat/`, `fix/`, `test/`), utiliza Commits Convencionales y se integra a `main` mediante Pull Request con al menos una revisión aprobada.
- **Matriz Comparativa Git vs SVN:** Documentada en [`docs/08-matriz-git-vs-svn.md`](08-matriz-git-vs-svn.md) evaluando 7 dimensiones técnicas (modelo descentralizado, inmutabilidad del historial SHA-1, ramas baratas, trabajo sin conexión, permisos a nivel de repositorio vs ruta, velocidad y ecosistema), justificando en [ADR-004](03-adr/ADR-004-control-de-versiones.md) la selección de Git para el equipo de 3 integrantes.
- **Conflicto de Integración Deliberado:** Ejercicio controlado de colisión entre PR #8 y PR #10 en `README.md`, resuelto y documentado localmente en [`docs/10-conflicto-integracion.md`](10-conflicto-integracion.md) con evidencia respaldada en [`evidencias/semana3/conflicto/README-con-conflicto.md`](../evidencias/semana3/conflicto/README-con-conflicto.md).
- **Consolidación y Cierre de Semana 3:** Reportado en [`docs/11-cierre-semana3.md`](11-cierre-semana3.md) acreditando 2 PRs y 2 revisiones por integrante y auditoría de seguridad (`auditoria-secretos.txt`, `pip check`, `pip-audit`).

---

## 5. Automatización: Pipeline CI, Quality Gates y Falla Provocada (e)

El archivo unificado [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) gobierna la integración continua con permisos mínimos (`permissions: contents: read`), acciones fijadas por versión y ausencia total de secretos en el código:

1. **`ci-lint-and-static-analysis`:**
   - Flake8: Linter PEP 8 con cero violaciones comprobadas localmente.
   - Bandit: Análisis estático de seguridad para detectar vulnerabilidades en código Python.
   - Spectral CLI: Validación estricta del contrato OpenAPI contra [`.spectral.yaml`](../.spectral.yaml) con cero errores comprobados localmente.
2. **`ci-tests`:**
   - Ejecución de la suite completa con contenedor PostgreSQL aislado (`nexora_test_semana2`).
3. **`ci-docs-and-frontend`:**
   - Compilación de documentación interactiva OpenAPI a HTML estático con Redocly CLI (`docs/api/index.html`).
   - Compilación de frontend TypeScript y Vite (`npm run build`) verificada localmente en 437 ms.
   - Verificación sintáctica de módulos y scripts backend con `py_compile`.

### Evidencia de la Falla Provocada y Corregida
- Reporte detallado en [`evidencias/semana4/falla-controlada.md`](../evidencias/semana4/falla-controlada.md).
- **Demostración en Rama de Prueba:** Implementada y publicada en GitHub en la rama [`test/demostracion-falla-ci`](https://github.com/enriqueherreraec/nexora-arquitectura/tree/test/demostracion-falla-ci).
  - **Commit con falla inducida:** [`9177399`](https://github.com/enriqueherreraec/nexora-arquitectura/commit/9177399) (`test: inyectar fallo controlado de linter para verificar compuerta de calidad CI`), donde Flake8 arroja código de salida 1 por violaciones `F401`, `E401` y `E302`.
  - **Commit con corrección atómica:** [`d9a5d5b`](https://github.com/enriqueherreraec/nexora-arquitectura/commit/d9a5d5b) (`test: subsanar fallo de linter y restaurar pase de compuerta de calidad CI`), restaurando 0 violaciones en Flake8 (código de salida 0).
  - **Pull Request en GitHub para visualización de la compuerta:** [Abrir PR test/demostracion-falla-ci → main](https://github.com/enriqueherreraec/nexora-arquitectura/pull/new/test/demostracion-falla-ci). Al abrirse, la interfaz de GitHub Actions refleja visualmente el bloqueo de la compuerta ante el commit fallido y la aprobación ante el commit corregido.

---

## 6. Métricas Aproximadas tipo DORA y Procedimiento de Cálculo (f)

De conformidad con el análisis metodológico de [`evidencias/semana4/metricas-dora.md`](../evidencias/semana4/metricas-dora.md), se delimitan los datos verificables evitando atribuir métricas de producción industrial a un proyecto académico:

| Métrica DORA | Datos Empíricos Verificables | Aproximación Formativa del Flujo | Límites Metodológicos Declarados |
|---|---|---|---|
| **Deployment Frequency (DF)** | 0 despliegues previos en producción real. | 0.93 integraciones a `main` / día (13 PRs integrados en 14 días). | Mide fusiones en la rama principal bajo GitHub Flow, no entregas a usuarios finales. Se eliminan calificaciones "Elite" sin sustento de tráfico. |
| **Lead Time for Changes (LTTC)** | No medible de punta a punta hacia usuarios. | 2.90 horas promedio (de primer commit a merge en `main`). | Mide el tiempo de ciclo de ramas cortas y revisión por pares, no el tiempo de despliegue en nube. |
| **Change Failure Rate (CFR)** | 0 incidentes de producción registrados. | 1 escenario de falla controlada en compuerta CI. | El rechazo preventivo de un commit en el linter o pruebas de CI no es un fallo productivo; es el funcionamiento normal de la compuerta. |
| **Recovery Time (FDRT / MTTR)** | No registrable en producción real. | 3–5 minutos estimados para rollback en plataforma Render. | Estimación técnica de infraestructura basada en reversión a commit previo, no un incidente real. |

---

## 7. Uso Responsable de Inteligencia Artificial (g)

Documentado exhaustivamente en [`docs/04-registro-ia.md`](04-registro-ia.md):
- **Herramienta y Modelo Comprobado:** Antigravity AI Assistant (Google DeepMind) con modelo **Gemini 3.8 Flash (High)** comprobado en selector del IDE.
- **Lista de Verificación de Workflows generados por IA:**
  - [x] **Permisos mínimos:** `permissions: contents: read` explícito en el archivo.
  - [x] **Acciones fijadas por versión:** `@v4`, `@v5` en todas las acciones oficiales.
  - [x] **Ausencia de secretos en código:** Variables y tokens inyectados mediante GitHub Secrets o variables de entorno.
  - [x] **Ejecución local verificada:** Pruebas con Flake8, Spectral, Pytest y Vite Build probadas localmente antes de confirmar.
  - [x] **Cero datos personales o credenciales reales:** Ningún dato sensible expuesto en prompts ni en archivos.

---

## 8. Análisis Crítico y Lecciones Aprendidas (h)

1. **Qué funcionó:**
   - La adopción de GitHub Flow con ramas cortas evitó bloqueos entre integrantes y facilitó revisiones cruzadas enfocadas.
   - El contrato OpenAPI validado con Spectral actuó como fuente única de verdad, desacoplando el desarrollo del frontend (React 19) del backend (FastAPI).
   - La compuerta unificada en `ci.yml` asegura que ningún cambio entre a `main` sin cumplir estándares de formato, seguridad estática y pruebas.
2. **Qué no funcionó o generó fricción:**
   - Intentar editar archivos extensos directamente en la interfaz web de GitHub provocó riesgos de truncamiento en la Semana 3, confirmando la necesidad de resolver colisiones exclusivamente en el entorno local.
   - La duplicidad transitoria entre archivos de workflow (`ci.yml` y `ci-cd.yml`) generaba ejecuciones redundantes antes de su consolidación en un único pipeline.
3. **Qué cambiaríamos en futuras iteraciones:**
   - Configurar los checks obligatorios en GitHub Rulesets desde el inicio del proyecto en lugar de al final del ciclo de entrega.
   - Implementar pruebas de integración de extremo a extremo (*E2E*) con herramientas como Playwright para verificar la interacción visual del frontend con el backend desplegado.
4. **Límites del proceso:**
   - Al ser un sistema académico, las métricas DORA son aproximaciones de integración y no mediciones de telemetría de producción continua con usuarios reales concurrentes.

---

## 9. Trabajo Complementario: Despliegue en la Nube y Diagnóstico en Vivo (i)

*(Trabajo de aplicación práctica solicitado en clase que complementa los entregables académicos sin sustituir los criterios de la rúbrica)*

- **Infraestructura en Render:** Preparada bajo el plan Free con tres recursos interconectados:
  1. Base de datos relacional PostgreSQL 16 (`orientacion_vocacional_db`).
  2. Web Service Backend en FastAPI con `Auto-Deploy: No` y Deploy Hooks condicionados al CI exitoso de `main`.
  3. Static Site Frontend en React 19 + TypeScript + Vite.
- **Seguridad en Despliegue:**
  - Procedimiento para generar `SECRET_KEY` aleatoria localmente (`python -c "import secrets; print(secrets.token_urlsafe(32))"`).
  - Script [`backend/scripts/seed_db.py`](../backend/scripts/seed_db.py) sin contraseñas predecibles (genera tokens criptográficos aleatorios únicos de 18 caracteres).
  - CORS restringido al dominio real `https://nexora-frontend.onrender.com`.
- **Endpoints de Diagnóstico y Humo:**
  - `/salud` y `/health` funcionales en backend, exponiendo versión (`0.3.0`), commit deployed y estado de PostgreSQL.
  - Paso de prueba de humo con sondeo activo en `ci.yml` que valida la correspondencia exacta entre `${{ github.sha }}` y el commit reportado por el backend en vivo.
- **Estado Técnico de Render:** En preparación técnica (código y configuración listos; pendiente de despliegue real en el panel de Render por el usuario).

---

## 10. Matriz de Cumplimiento de los Cinco Criterios de la Rúbrica de Semana 4

Contraste formal frente a los cinco criterios y ponderaciones exactos del documento oficial de calificación de la UPEC:

| Criterio Oficial de la Rúbrica | Ponderación | Estado Técnico Real | Evidencias Verificables en el Repositorio | Distinción (Preparado / Local / Aprobado en GitHub) |
|---|:---:|:---:|---|---|
| **1. Coherencia y trazabilidad punta a punta** | **25 %** | 🟢 **Comprobado** | [`docs/05-trazabilidad.md`](05-trazabilidad.md) enlaza rigurosamente: $\text{Requisito (HU/CA)} \to \text{Escenario (E1–E6)} \to \text{ADR (001–004)} \to \text{Artefacto (OpenAPI/Código/Tests)} \to \text{Commit/PR} \to \text{Pipeline}$. Identificadores coincidentes al 100 %. | **Comprobado localmente y en archivos versionados.** |
| **2. Pipeline CI con quality gates funcionando** | **30 %** | 🟡 **Preparado / Parcial** | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) unificado. Ejecuta lint (Flake8), pruebas (Pytest con PostgreSQL de servicio), análisis estático (Bandit), validación OpenAPI (Spectral) y build de docs (Redocly), con permisos mínimos y sin secretos. Evidencia de falla controlada implementada con commits reales [`9177399`](https://github.com/enriqueherreraec/nexora-arquitectura/commit/9177399) y [`d9a5d5b`](https://github.com/enriqueherreraec/nexora-arquitectura/commit/d9a5d5b) en rama [`test/demostracion-falla-ci`](https://github.com/enriqueherreraec/nexora-arquitectura/tree/test/demostracion-falla-ci) y documentada en [`evidencias/semana4/falla-controlada.md`](../evidencias/semana4/falla-controlada.md). | **Preparado y validado localmente;** ejecución completa en GitHub Actions y checks obligatorios en `main` pendientes de registrarse al formalizar el PR en GitHub. |
| **3. Informe: contenido, análisis crítico, métricas y lecciones** | **20 %** | 🟢 **Comprobado** | [`docs/09-informe-final.md`](09-informe-final.md) (este documento) contiene las 8 secciones oficiales (a–h), enlaza artefactos sin duplicar código, explica el procedimiento de cálculo de métricas DORA y sus límites, y aporta análisis crítico. | **Comprobado en repositorio.** |
| **4. Esqueleto ejecutable con pruebas** | **15 %** | 🟢 **Comprobado localmente** | Servicio backend ejecutable en [`src/`](../src/) y [`backend/`](../backend/) con **27 pruebas automatizadas** en [`tests/`](../tests/) pasando al 100 % (verificadas con PostgreSQL local en [`evidencias/pruebas/pytest-results.txt`](../evidencias/pruebas/pytest-results.txt)), cubriendo HU-01 a HU-04, E2 (rollback transaccional) y E5 (tolerancia SMTP con HTTP 503). | **Comprobado en entorno de pruebas local;** pendiente de certificación por el runner de GitHub Actions. |
| **5. Uso responsable de IA (registro y verificación)** | **10 %** | 🟢 **Comprobado** | [`docs/04-registro-ia.md`](04-registro-ia.md) actualizado con Semana 4, modelo `Gemini 3.8 Flash (High)` comprobado, lista de verificación de workflow, y ausencia estricta de credenciales reales o datos personales. | **Comprobado en repositorio.** |
| **Total Rúbrica Oficial** | **100 %** | — | — | — |
| *(Trabajo Complementario)* **Despliegue en la Nube (Render)** | *Complementario* | 🟡 **En preparación técnica** | Configuración de Render (PostgreSQL, FastAPI y React 19) en [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), [`backend/`](../backend/) y [`frontend/`](../frontend/) con endpoints `/salud`. | **Configurado en código;** pendiente de creación de servicios en dashboard de Render por el usuario. |
