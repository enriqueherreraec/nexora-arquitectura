# 🔀 Informe de Resolución de Conflicto de Integración

| Metadato | Detalle |
|---|---|
| **Proyecto** | Nexora · Sistema web de orientación vocacional |
| **Módulo** | Automatización de Procesos de Software · Semana 3 |
| **Incidencia** | Issue #9 · Resolución de conflicto de integración en PR #10 |
| **Pull Requests involucrados** | PR #8 (Rosa Baren) y PR #10 (Daniel Mera) |
| **Fecha de resolución** | 30 de octubre de 2026 |
| **Estado** | Resuelto y verificado localmente |

---

## 1. Objetivo del ejercicio controlado

El objetivo consistió en ejecutar una colisión de integración deliberada entre dos ramas de trabajo independientes (`docs/readme-colaboracion` y `docs/conflicto-documentado`), originadas desde el mismo commit base de la rama principal (`main`). El ejercicio permite evidenciar:

1. La detección determinista de colisiones por parte del motor de merge de Git.
2. La estructura de los marcadores tripartitos de conflicto.
3. El protocolo formal de resolución del equipo de desarrollo, con preservación de aportes concurrentes y trazabilidad completa.

---

## 2. Contexto de las ramas y PRs involucrados

| Elemento | Identificador | Autor | Rama | Propósito técnico |
|---|---|---|---|---|
| **Incidencia de control** | Issue #9 | Equipo Nexora | N/A | Coordinación y registro del conflicto entre PR #8 y PR #10 |
| **Aporte de colaboración** | PR #8 | Rosa Baren (`barenrosa6-bot`) | `docs/readme-colaboracion` | Actualización de README con metadatos de Semana 3, tabla de artefactos y sección de flujo de colaboración |
| **Aporte de gobernanza** | PR #10 | Daniel Mera (`DanielMera1802`) | `docs/conflicto-documentado` | Precisión de las reglas de control de versiones (protección de main, revisión por pares y SemVer) |

---

## 3. Hashes completos y trazabilidad de commits

El análisis del grafo de Git arrojó los siguientes identificadores criptográficos SHA-1:

- **Base común (`merge-base`):**
  `d89409ded502b884a641683f31cd42083a00c75c`
  *Mensaje:* `Merge pull request #6 from enriqueherreraec/docs/adr-control-versiones`
  *Descripción:* Punto de bifurcación compartido donde ambas ramas iniciaron su desarrollo.

- **Rama receptora local (`HEAD` / Daniel):**
  `20b3e0875179d21e405434bb0fea5988fe537989`
  *Mensaje:* `docs: precisar las reglas de control de versiones`
  *Autor:* Daniel Mera `<167786714+DanielMera1802@users.noreply.github.com>`

- **Rama entrante integrada (`MERGE_HEAD` / Rosa en `origin/main`):**
  `fe08a5d6881aa1e9e854f5e1f3fc6acf21ad7175`
  *Mensaje:* `Merge pull request #8 from enriqueherreraec/docs/readme-colaboracion`
  *Contiene:* Commit `bd48cac8a2b535d55b0a373b9e4a36f457ffad73` de Rosa Baren.

- **Commit de resolución del merge:**
  `a708ba5075d4836fc0ad8a3127e26178e1e79382`
  *Mensaje:* `docs: resolver conflicto de integracion en README`
  *Autoría:* Daniel Mera (ejecutado con identidad transitoria para este commit).

---

## 4. Comparación de redacciones y resolución unificada

Ambas ramas editaron de forma simultánea la fila de control de versiones de la tabla tecnológica en `README.md`:

### Fila de Daniel (`HEAD` - PR #10):
```markdown
| **Control de Versiones** | Git y GitHub con protección de main, revisión obligatoria por pares y etiquetas de versión |
```

### Fila de Rosa (`origin/main` - PR #8):
```markdown
| **Control de Versiones** | Git y GitHub bajo GitHub Flow, con ramas cortas por tarea y commits convencionales |
```

### Fila final combinada y consensuada:
```markdown
| **Control de Versiones** | Git y GitHub bajo GitHub Flow, con ramas cortas por tarea, commits convencionales, protección de main, revisión obligatoria por pares y etiquetas de versión |
```

---

## 5. Análisis del conflicto y preservación de contenidos

La colisión ocurrió porque ambas ramas modificaron la misma línea (fila 82) con redacciones incompatibles para la integración automática. Además, el cambio de Rosa introdujo de forma contigua una nueva sección completa: `## 👥 Flujo de colaboración`, compuesta por 6 pasos normativos de trabajo.

La resolución aplicó los siguientes criterios de calidad:

1. **Unificación sustantiva:** La fila resultante sintetiza tanto las directrices de flujo (GitHub Flow, ramas cortas, commits convencionales) como los mecanismos de gobernanza (protección de main, revisión obligatoria por pares y versionado semántico).
2. **Preservación total del aporte de Rosa:** Se mantuvo íntegra la sección `## 👥 Flujo de colaboración`, la actualización de los metadatos académicos de Semana 3 y los nuevos enlaces hacia `CONTRIBUTING.md`, `docs/08-matriz-git-vs-svn.md` y `docs/03-adr/ADR-004-control-de-versiones.md`.
3. **Ausencia de regresiones:** El resto del archivo `README.md` conserva la paridad absoluta con `origin/main`.

---

## 6. Proceso de resolución local con asistencia de Antigravity

Los intentos de resolución mediante el editor web de GitHub no llegaron a confirmarse en el repositorio remoto debido a la dificultad para validar la integridad de bloques extensos en la interfaz del navegador y al riesgo de omitir la nueva sección añadida en `main`.

Por este motivo, el equipo trasladó la operación al entorno local con asistencia de Antigravity AI Assistant:

1. **Inspección del diff tripartito:** Visualización clara de ancestro común (`:1:`), versión local (`:2:`) y versión remota (`:3:`).
2. **Resolución determinista:** Sustitución quirúrgica de los marcadores sin alterar espacios ni saltos de línea LF.
3. **Verificación automatizada:** Ejecución de `git diff --check` y scripts de auditoría sintáctica para certificar la ausencia de marcadores residuales.

---

## 7. Registro cronológico de comandos ejecutados

A continuación se detallan los comandos ejecutados en la consola local y sus resultados reales:

1. **Actualización de referencias remotas:**
   ```bash
   git fetch origin
   ```
   *Resultado:* Descarga de las ramas remotas `origin/docs/conflicto-documentado` y avance de `origin/main` a `fe08a5d`.

2. **Cambio y sincronización de la rama local de Daniel:**
   ```bash
   git checkout docs/conflicto-documentado
   git merge --ff-only origin/docs/conflicto-documentado
   ```
   *Resultado:* Avance rápido de `d89409d` a `20b3e08` (`README.md | 2 +-`).

3. **Ejecución del merge con detección de conflicto:**
   ```bash
   git merge --no-commit --no-ff origin/main
   ```
   *Resultado:*
   ```text
   Auto-merging README.md
   CONFLICT (content): Merge conflict in README.md
   Automatic merge failed; fix conflicts and then commit the result.
   ```

4. **Respaldo de evidencia histórica:**
   Se copió el archivo con los marcadores de conflicto hacia `evidencias/semana3/conflicto/README-con-conflicto.md`.

5. **Resolución y verificación de formato:**
   Se aplicó la fila combinada en `README.md` y se comprobó la ausencia de marcadores y espacios espurios:
   ```bash
   git diff --check
   ```
   *Resultado:* Código de salida 0 (sin violaciones).

6. **Preparación y commit de resolución:**
   ```bash
   git add README.md
   git -c user.name="Daniel Mera" -c user.email="167786714+DanielMera1802@users.noreply.github.com" commit -m "docs: resolver conflicto de integracion en README"
   ```
   *Resultado:* Creación del commit `a708ba5075d4836fc0ad8a3127e26178e1e79382`.

---

## 8. Evidencias asociadas

- **Copia del archivo con marcadores de conflicto:**
  [`evidencias/semana3/conflicto/README-con-conflicto.md`](../evidencias/semana3/conflicto/README-con-conflicto.md)
  > [!NOTE]
  > Los marcadores `<<<<<<<`, `=======` y `>>>>>>>` contenidos en ese archivo corresponden a una captura histórica deliberada del estado de colisión previo a la resolución.

- **Registro de salida del comando de merge:**
  Salida textual capturada en consola durante la ejecución del paso 3.

---

**🌿 Nexora · Registro formal de control de versiones y resolución de conflictos**
