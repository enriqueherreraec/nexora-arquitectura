# 🏁 Informe de Consolidación y Cierre de Semana 3

| Metadato | Detalle |
|---|---|
| **Proyecto** | Nexora · Sistema web de orientación vocacional |
| **Módulo** | Módulo 8: Automatización de proceso de software |
| **Actividad** | Actividad autónoma · Semana 3: Repositorio gobernado, matriz Git vs SVN y ADR de selección |
| **Fecha de corte** | 30 de octubre de 2026 |
| **Rama de trabajo** | `docs/cierre-semana3` |
| **Incidencia** | Issue #11 · Cierre, auditoría y consolidación de gobernanza |

---

## 1. Objetivo del informe

Consolidar la evidencia técnica del repositorio gobernado de Nexora, contrastar el estado del proyecto frente a la rúbrica de la Universidad Politécnica Estatal del Carchi (UPEC), auditar la seguridad y dependencias, y registrar la trazabilidad de la colaboración entre los tres integrantes. La asignación de calificaciones y porcentajes de logro corresponde exclusivamente al criterio docente; este documento reporta los estados técnicos verificables: **Comprobado**, **Parcial** y **Pendiente**.

---

## 2. Matriz de contraste técnico frente a la rúbrica

| Criterio de la rúbrica | Ponderación académica | Estado técnico | Evidencias verificables en el repositorio | Pendientes concretos |
|---|:---:|:---:|---|---|
| **Estructura e higiene del repositorio** | 15 % | **Comprobado** | [`README.md`](../README.md) con visión y guía de ejecución; [`CONTRIBUTING.md`](../CONTRIBUTING.md); [`.gitignore`](../.gitignore) con exclusión de `.env`, entornos virtuales y cachés; plantillas [`.github/ISSUE_TEMPLATE/tarea.md`](../.github/ISSUE_TEMPLATE/tarea.md) y [`.github/pull_request_template.md`](../.github/pull_request_template.md). Cero archivos innecesarios. | Ninguno en este criterio. |
| **Historial y trazabilidad (commits convencionales, issues ↔ PR)** | 25 % | **Comprobado** | Historial organizado bajo GitHub Flow con commits atómicos convencionales (`feat:`, `docs:`, `fix:`) y confirmaciones de merge explícitas. Cada PR se vincula a su issue formal (`Closes #n`). Trazabilidad de los aportes individuales de Enrique, Rosa y Daniel. | Ninguno en este criterio. |
| **Ramas, PR, revisión cruzada y conflicto documentado** | 30 % | **Parcial** | Flujo issue → rama → PR → revisión cruzada → merge ejecutado en PR #2, #4, #6, #8 y #10. Conflicto deliberado documentado en [`docs/10-conflicto-integracion.md`](10-conflicto-integracion.md) y evidencia histórica en [`evidencias/semana3/conflicto/README-con-conflicto.md`](../evidencias/semana3/conflicto/README-con-conflicto.md). | Daniel Mera debe revisar el PR de cierre y el equipo debe ejecutar el merge hacia `main` para completar la participación equitativa (al menos 2 PR y 2 revisiones por integrante). |
| **Releases y tags con SemVer alineados a los hitos** | 10 % | **Parcial** | Etiqueta `v0.2.0` presente en referencias locales y remotas sobre el commit `478be4c` (Hito 2). | La etiqueta `v0.1.0` no aparece en las referencias locales ni remotas consultadas. La etiqueta `v0.3.0` debe crearse sobre `main` tras integrar el PR de cierre. |
| **Gobierno y seguridad del repositorio** | 10 % | **Comprobado** | Rama `main` protegida comprobada en API de GitHub (`protected: true`); ruleset documentado con 4 capturas en [`evidencias/semana3/gobernanza/`](../evidencias/semana3/gobernanza/); escaneo de patrones de secretos sin coincidencias ([`evidencias/semana3/seguridad/auditoria-secretos.txt`](../evidencias/semana3/seguridad/auditoria-secretos.txt)); compatibilidad con `pip check` ([`evidencias/semana3/seguridad/auditoria-dependencias.txt`](../evidencias/semana3/seguridad/auditoria-dependencias.txt)) y análisis de vulnerabilidades con `pip-audit` ([`evidencias/semana3/seguridad/auditoria-pip-audit.txt`](../evidencias/semana3/seguridad/auditoria-pip-audit.txt)). | Ninguno en este criterio. |
| **Matriz Git vs SVN y ADR de selección de Git** | 10 % | **Comprobado** | [`docs/08-matriz-git-vs-svn.md`](08-matriz-git-vs-svn.md) compara las 7 dimensiones con referencias APA (Chacon & Straub, 2014; Collins-Sussman et al., 2011). [`docs/03-adr/ADR-004-control-de-versiones.md`](03-adr/ADR-004-control-de-versiones.md) en estado Aceptado tras la integración del PR #6. | Ninguno en este criterio. |

---

## 3. Registro de Pull Requests y colaboración cruzada

El equipo implementa GitHub Flow. La siguiente tabla distingue los datos comprobables directamente en el historial de Git (autoría de commits y confirmaciones de merge) de los registros de revisión en GitHub, los cuales requieren consulta de la plataforma:

| PR | Título de la entrega | Rama de origen | Autor en Git (`git log`) | Merge en `main` (`git log`) | Revisor(a) en GitHub | Issue vinculado | Estado de verificación |
|:---:|---|---|---|:---:|---|:---:|:---:|
| **#2** | `docs: definir reglas de contribucion y plantillas` | `docs/guia-contribucion` | Enrique Herrera | `c72e5ca` | Rosa Baren | Issue #1 | **Comprobado en Git y GitHub** |
| **#4** | `docs: matriz comparativa de git vs svn` | `docs/matriz-git-svn` | Rosa Baren | `a2c7d77` | Daniel Mera | Issue #3 | **Comprobado en Git y GitHub** |
| **#6** | `docs: justificar Git y GitHub Flow en ADR-004` | `docs/adr-control-versiones` | Daniel Mera | `d89409d` | Enrique Herrera | Issue #5 | **Comprobado en Git y GitHub** |
| **#8** | `docs: actualizar README con el flujo de colaboracion` | `docs/readme-colaboracion` | Rosa Baren | `fe08a5d` | Enrique Herrera | Issue #7 | **Comprobado en Git y GitHub** |
| **#10** | `docs: resolver y documentar conflicto de integracion en README` | `docs/conflicto-documentado` | Daniel Mera | `aa6d3ae` | Rosa Baren | Issue #9 | **Comprobado en Git y GitHub** |
| **Pendiente** | *PR de cierre de Semana 3 y consolidación* | `docs/cierre-semana3` | Enrique Herrera | *Pendiente* | Daniel Mera | Issue #11 | **En preparación local** |

### Balance individual de aportes y revisiones

- **Enrique Herrera:**
  - Autoría de PRs: PR #2 (integrado) y PR de cierre pendiente de creación (Issue #11).
  - Revisiones asignadas: PR #6 (ADR-004) y PR #8 (README Colaboración).
- **Rosa Baren:**
  - Autoría de PRs: PR #4 (Matriz Git vs SVN) y PR #8 (README Colaboración).
  - Revisiones asignadas: PR #2 (Gobernanza) y PR #10 (Conflicto de integración).
- **Daniel Mera:**
  - Autoría de PRs: PR #6 (ADR-004) y PR #10 (Conflicto de integración).
  - Revisiones asignadas: PR #4 (Matriz Git vs SVN) y PR de cierre pendiente de creación (Issue #11).

> [!IMPORTANT]
> **Condición de participación:** La evidencia de al menos 2 PR y 2 revisiones por integrante se alcanzará de forma completa una vez que Daniel Mera registre su revisión formal sobre el PR de cierre y este se integre en `main`.

---

## 4. Auditoría de seguridad e higiene del código

### A. Exclusión de variables de entorno y archivos sensibles
- **Regla en `.gitignore`:** Excluye `.env`, `.env.local`, `.env.*.local`, `*.key` y `*.pem`.
- **Comprobación en Git (`git ls-files`):** Solo existe la plantilla sintética `.env.example`. No existen archivos `.env` reales versionados.
- **Directorio de trabajo:** No existe ningún archivo `.env` real en el espacio local.

### B. Escaneo de secretos, alcance y limitaciones
- **Resultado:** Sin coincidencias en los patrones y archivos analizados.
- **Alcance del escaneo:** Se examinaron todos los archivos bajo seguimiento de Git mediante expresiones regulares para llaves privadas (RSA, EC, DSA, OPENSSH), tokens de GitHub (`ghp_`, `github_pat_`), llaves de AWS (`AKIA...`) y asignaciones de contraseñas en texto claro. Se verificaron los últimos 20 commits del historial.
- **Limitaciones del análisis:** El escaneo estático por patrones no detecta secretos con nombres no estándar, credenciales ofuscadas ni referencias fuera del conjunto de expresiones definidas. No audita objetos huérfanos del recolector de basura de Git.
- **Evidencia registrada:** [`evidencias/semana3/seguridad/auditoria-secretos.txt`](../evidencias/semana3/seguridad/auditoria-secretos.txt).

### C. Análisis de dependencias y vulnerabilidades
- **Distinción técnica:**
  * El comando `python -m pip check` comprueba compatibilidad entre paquetes y detecta dependencias rotas, pero **no comprueba vulnerabilidades**.
  * El comando `python -m pip list --outdated` muestra diferencias de versión frente a PyPI, pero **no sustituye un análisis de vulnerabilidades**.
- **Resultado de compatibilidad:** `python -m pip check` arrojó `No broken requirements found.` (cero dependencias rotas).
- **Análisis de vulnerabilidades con `pip-audit`:**
  * Se instaló `pip-audit` v2.10.1 en un entorno virtual aislado temporal fuera del proyecto.
  * Se ejecutó el análisis formal sobre `requirements.txt`:
    ```bash
    pip-audit -r requirements.txt
    ```
  * Resultado real: Código de salida 0, salida textual: `No known vulnerabilities found`.
  * Evidencia registrada: [`evidencias/semana3/seguridad/auditoria-pip-audit.txt`](../evidencias/semana3/seguridad/auditoria-pip-audit.txt) y [`evidencias/semana3/seguridad/auditoria-dependencias.txt`](../evidencias/semana3/seguridad/auditoria-dependencias.txt).
- **Alcance y límites:** La ausencia de vulnerabilidades conocidas se limita a los reportes públicos disponibles en la base de datos PyPA/OSV para las versiones fijadas. No se modificaron versiones de librerías para evitar alteraciones respecto a la suite histórica de pruebas de la Semana 2 (27 pruebas aprobadas y 92 % de cobertura).

---

## 5. Verificación de protecciones de la rama principal (`main`)

La configuración se administra en la plataforma bajo la ruta **Settings → Rules → Rulesets**:

- **Ruleset activo:** `Proteccion de main` ([`evidencias/semana3/gobernanza/01-ruleset-general-target.png`](../evidencias/semana3/gobernanza/01-ruleset-general-target.png)).
- **Estado de aplicación (Enforcement status):** `Active`.
- **Lista de excepciones (Bypass list):** Vacía (`Bypass list is empty`).
- **Rama objetivo (Target branches):** Criterio de rama `+ main` (Aplica a 1 objetivo: `main`).

### Opciones visibles en las capturas de auditoría

A partir de las capturas reales obtenidas del repositorio en GitHub, se describen exclusivamente las opciones visibles y su estado:

1. **Reglas de rama (Branch rules) ([`evidencias/semana3/gobernanza/02-ruleset-branch-rules.png`](../evidencias/semana3/gobernanza/02-ruleset-branch-rules.png)):**
   - `Restrict deletions`: **Activado** (impide la eliminación accidental de la rama `main`).
   - `Require linear history`: Desactivado (permite las confirmaciones explícitas de merge bajo GitHub Flow).
   - `Restrict creations`: Desactivado.
   - `Restrict updates`: Desactivado.
   - `Require deployments to succeed`: Desactivado.
   - `Require signed commits`: Desactivado.

2. **Reglas de Pull Request ([`evidencias/semana3/gobernanza/03-ruleset-pull-request-settings.png`](../evidencias/semana3/gobernanza/03-ruleset-pull-request-settings.png)):**
   - `Require a pull request before merging`: **Activado** (obliga a enviar todo cambio mediante PR previo a su incorporación).
   - `Required approvals`: **1** (exige al menos una aprobación formal de otro integrante antes del merge).
   - `Dismiss stale pull request approvals when new commits are pushed`: **Activado** (invalida aprobaciones previas si se agregan commits nuevos al PR).
   - `Require conversation resolution before merging`: **Activado** (exige resolver todos los hilos de discusión antes de fusionar).
   - `Require an additional approval for unattributed Copilot pull requests`: **Activado**.
   - `Require review from specific teams`: Desactivado.
   - `Require review from Code Owners`: Desactivado.
   - `Require approval of the most recent reviewable push`: Desactivado.
   - `Allowed merge methods`: `Merge, Squash, Rebase` seleccionados.

3. **Bloqueo de push forzado y comprobaciones ([`evidencias/semana3/gobernanza/04-ruleset-force-pushes-checks.png`](../evidencias/semana3/gobernanza/04-ruleset-force-pushes-checks.png)):**
   - `Block force pushes`: **Activado** (bloquea `git push --force` hacia `main` para evitar la reescritura del historial).
   - `Require status checks to pass`: Desactivado.
   - `Require code scanning results`: Desactivado.
   - `Require code quality results`: Desactivado.
   - `Restrict code coverage`: Desactivado.
   - `Automatically request Copilot code review`: Desactivado.

---

## 6. Estado de etiquetas SemVer y releases

- **Hito 1 (`v0.1.0` - Semana 1):**
  *Estado:* **No aparece en las referencias locales y remotas consultadas** (`git tag -l -n` y `git ls-remote --tags origin`). La ausencia en las referencias consultadas no demuestra que nunca existió; se documenta el estado actual sin asignar una etiqueta retroactiva sobre un commit arbitrario.
- **Hito 2 (`v0.2.0` - Semana 2):**
  *Estado:* **Comprobado.** Etiqueta presente en commit `478be4c` (*Release v0.2.0 - Cadena CASE y entregables de Semana 2*).
- **Hito 3 (`v0.3.0` - Semana 3):**
  *Estado:* **Pendiente.** Se creará sobre `main` tras el merge del PR de cierre.

---

## 7. Pendientes concretos para la entrega final

1. Crear el commit en la rama local `docs/cierre-semana3`.
2. Publicar la rama mediante `git push origin docs/cierre-semana3`.
3. Abrir el Pull Request formal en GitHub vinculando `Closes #11`.
4. Daniel Mera debe revisar el PR, registrar comentarios sustantivos y emitir la aprobación formal.
5. Realizar el merge del PR hacia `main`.
6. Actualizar `main` local (`git pull --ff-only origin main`).
7. Crear y publicar la etiqueta `v0.3.0`:
   ```bash
   git tag -a v0.3.0 -m "Release v0.3.0 - Repositorio gobernado, matriz Git vs SVN, ADR-004 y resolucion de conflictos"
   git push origin v0.3.0
   ```
8. Entregar el enlace del repositorio por la plataforma Moodle.

---

**🌿 Nexora · Registro formal de consolidación, gobernanza y calidad de software**
