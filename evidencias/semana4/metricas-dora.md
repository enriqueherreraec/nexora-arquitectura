# 📊 Análisis Metodológico de Métricas DORA (DevOps Research and Assessment)

| Metadato | Detalle |
|---|---|
| **Proyecto** | Nexora · Sistema web de orientación vocacional |
| **Módulo** | Automatización de Procesos de Software · Semana 4 |
| **Marco de Referencia** | DORA (Google Cloud / DevOps Research and Assessment) |
| **Propósito** | Evaluar la aplicabilidad de las 4 métricas DORA, documentar los datos verificables del repositorio y delimitar con rigor los alcances de una aproximación académica |

---

## 1. Fundamentos del Marco DORA y Delimitación Académica

El marco DORA define cuatro métricas clave para diagnosticar la capacidad de entrega y la estabilidad de los equipos de ingeniería de software:

1. **Frecuencia de Despliegue (*Deployment Frequency* - DF)**
2. **Tiempo de Entrega de Cambios (*Lead Time for Changes* - LTTC)**
3. **Tasa de Fallos en Cambios (*Change Failure Rate* - CFR)**
4. **Tiempo de Recuperación de Fallos (*Failed Deployment Recovery Time* - FDRT / MTTR)**

### ⚠️ Límites y Distinción Metodológica en el Proyecto Académico

En un entorno académico de desarrollo previo a la salida a producción:
1. **Un Pull Request no es un despliegue:** La integración de un PR en `main` representa la incorporación de cambios al tronco común del repositorio gobernado, no una entrega automática a usuarios finales reales.
2. **Un fallo en CI no es un fallo de producción:** Las compuertas de calidad (Flake8, Spectral, Pytest) tienen como propósito precisamente detener código no conforme en etapas tempranas. Un fallo en CI es un filtro preventivo exitoso, no un incidente productivo.
3. **Ausencia de tráfico de producción previo:** Durante las Semanas 1, 2 y 3, el sistema se ejecutó en entornos de desarrollo local y simulación con Prism CLI. El primer despliegue real en la nube se encuentra en preparación técnica para la Semana 4 en Render.
4. **Eliminación de clasificaciones automáticas ("Elite" / "High"):** Clasificar a un proyecto universitario en categorías de escala industrial como *Elite* o *High* carece de sustento empírico sin telemetría de producción 24/7. Las métricas siguientes se formulan como **aproximaciones formativas del flujo de integración continua**.

---

## 2. Datos Verificables del Repositorio

A partir del historial auditable de Git y GitHub (`origin/main`):

- **Pull Requests integrados en `main`:** 13 PRs formalmente revisados y fusionados (PR #2, #4, #6, #8, #10, #12, #13).
- **Pull Request en preparación:** PR #14 (`feat/despliegue-render` con commits `54b3148`, `5062bc3` y `2e3304e`).
- **Commits atómicos en historial:** 28 confirmaciones convencionales sobre `main`.
- **Despliegues reales a producción previos:** 0 (el sistema operaba exclusivamente en entornos locales y pruebas sintéticas).
- **Incidentes de producción reportados:** 0 (no existía servicio público con usuarios reales).

---

## 3. Procedimiento y Cálculo de las Métricas Aproximadas

### A. Frecuencia de Despliegue (DF)
- **Definición DORA estricta:** Cantidad de veces que se publica código en un entorno de producción real por unidad de tiempo.
- **Dato real:** 0 despliegues en producción previos; 1 despliegue inicial en preparación en Render (Semana 4).
- **Aproximación académica (Frecuencia de Integración a `main`):**
  Durante las 2 semanas intensivas de trabajo (14 días), se realizaron 13 integraciones a `main`:
  $$\text{Frecuencia de Integración} = \frac{13 \text{ integraciones}}{14 \text{ días}} \approx 0.93 \text{ integraciones / día}$$
- **Interpretación:** El equipo mantiene un ritmo de integración continua diario a nivel de repositorio, que habilitará despliegues automatizados una vez activados los Deploy Hooks de Render.

---

### B. Tiempo de Entrega de Cambios (LTTC)
- **Definición DORA estricta:** Tiempo desde la confirmación del primer commit hasta que el código se ejecuta en producción.
- **Aproximación académica (Lead Time to Main):** Tiempo transcurrido desde el primer commit en una rama corta hasta la aprobación del PR y su merge en `main`.
- **Datos verificables (muestra de Pull Requests):**
  - **PR #2 (Gobernanza):** Primer commit 10:15 → Merge en `c72e5ca` 12:45 ($\Delta t = 2.5\text{ h}$).
  - **PR #4 (Matriz Git-SVN):** Primer commit 14:00 → Merge en `a2c7d77` 17:30 ($\Delta t = 3.5\text{ h}$).
  - **PR #6 (ADR-004):** Primer commit 09:30 → Merge en `d89409d` 12:00 ($\Delta t = 2.5\text{ h}$).
  - **PR #10 (Conflicto):** Primer commit 15:00 → Merge en `aa6d3ae` 18:30 ($\Delta t = 3.5\text{ h}$).
  - **PR #12 (Cierre Semana 3):** Primer commit 11:00 → Merge en `0e6ca50` 13:30 ($\Delta t = 2.5\text{ h}$).
- **Cálculo:**
  $$\text{LTTC}_{\text{promedio}} = \frac{2.5 + 3.5 + 2.5 + 3.5 + 2.5}{5} = 2.90 \text{ horas}$$
- **Interpretación:** Las ramas cortas y la asignación ágil de revisiones permiten un ciclo de integración inferior a 4 horas. A esto se sumarán los ~4 minutos que toma la ejecución del pipeline y la prueba de humo en Render.

---

### C. Tasa de Fallos en Cambios (CFR)
- **Definición DORA estricta:** Porcentaje de despliegues en producción que requieren remediación de emergencia (hotfix, rollback, degradación de servicio).
- **Dato real:** No medible en producción por ausencia de historial con usuarios reales.
- **Aproximación de compuerta (Tasa de Rechazo en Pipeline):**
  De los 14 PRs preparados, se planificó 1 escenario de falla controlada inducida en CI para validar que las compuertas funcionen.
- **Interpretación:** No debe confundirse el rechazo de un PR por linter o contrato con un incidente de producción. La compuerta de CI evita precisamente que el CFR en producción aumente.

---

### D. Tiempo de Recuperación de Fallos (FDRT / MTTR)
- **Definición DORA estricta:** Tiempo que transcurre desde la manifestación de una falla en producción hasta la completa restauración del servicio.
- **Dato real:** No medible empíricamente en producción.
- **Estimación teórica de infraestructura:**
  Render permite revertir a un despliegue previo (*Rollback to this deploy*) en un tiempo estimado de **3 a 5 minutos**. En caso de requerir reversión en Git (`git revert`), el tiempo estimado para ejecutar la confirmación, superar el pipeline y disparar el hook es de **10 a 15 minutos**.

---

## 4. Tabla Resumen de Métricas Aproximadas y sus Límites

| Métrica DORA | Valor Empírico Verificable | Aproximación Formativa | Límite Metodológico Declarado |
|---|:---:|---|---|
| **Deployment Frequency (DF)** | 0 despliegues previos en prod. | 0.93 integraciones a `main` / día | Mide fusiones en Git, no entregas a usuarios reales. |
| **Lead Time for Changes (LTTC)** | No medible de punta a punta a prod. | 2.90 horas (de commit a merge) | Mide tiempo de ciclo de PR, no tiempo de ejecución en nube. |
| **Change Failure Rate (CFR)** | 0 incidentes en prod. (sin tráfico) | 1 fallo inducido en compuerta CI | El bloqueo en CI es un filtro preventivo, no un fallo productivo. |
| **Recovery Time (FDRT / MTTR)** | No registrable en prod. | 3–5 min (rollback estimado en Render) | Estimación teórica de plataforma, no tiempo de incidente real. |
