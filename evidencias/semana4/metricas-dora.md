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

- **Pull Requests integrados en `main`:** 15 PRs formalmente revisados y fusionados (PR #2, #4, #6, #8, #10, #12, #13, #14 y #16).
- **Pull Request principal evaluado:** PR #14 (`feat/despliegue-render` con merge en commit [`4539dc4`](https://github.com/enriqueherreraec/nexora-arquitectura/commit/4539dc4d2105faef3bbbe35987a02c8188e404bf)).
- **Pull Request de falla controlada:** PR #15 (`test/demostracion-falla-ci`, compuerta roja en [`9177399`](https://github.com/enriqueherreraec/nexora-arquitectura/commit/917739981c84727d8033451aae88e0259f0bfd6b) y verde en [`d9a5d5b`](https://github.com/enriqueherreraec/nexora-arquitectura/commit/d9a5d5bf6e67f1a3362082017b5b2836e3abda01), cerrado sin merge).
- **Pull Request de corrección de parser:** PR #16 (`fix/smoke-test-parser`, merge en commit [`b2dda35`](https://github.com/enriqueherreraec/nexora-arquitectura/commit/b2dda35ecf7b5cc42b9873ac64ba63583f8d8674)).
- **Commits atómicos en historial:** 33 confirmaciones convencionales sobre `main`.
- **Despliegues reales a producción verificados:** 1 despliegue productivo de punta a punta en Render certificado por GitHub Actions en [Run 42156646415](https://github.com/enriqueherreraec/nexora-arquitectura/actions/runs/42156646415) (commit `b2dda35`), con prueba de humo exitosa validando HTTP 200, status `operational` y base de datos conectada.
- **Incidentes de producción reportados:** 0 (el servicio en vivo opera estable y sin caídas).

---

## 3. Procedimiento y Cálculo de las Métricas Aproximadas

### A. Frecuencia de Despliegue (DF)
- **Definición DORA estricta:** Cantidad de veces que se publica código en un entorno de producción real por unidad de tiempo.
- **Dato real:** 1 despliegue continuo automatizado en producción (Render) certificado por compuerta CD y prueba de humo.
- **Aproximación académica (Frecuencia de Integración a `main`):**
  Durante las 2 semanas intensivas de trabajo (14 días), se realizaron 15 integraciones a `main`:
  $$\text{Frecuencia de Integración} = \frac{15 \text{ integraciones}}{14 \text{ días}} \approx 1.07 \text{ integraciones / día}$$
- **Interpretación:** El equipo mantiene un ritmo de integración continua diario a nivel de repositorio, habilitando despliegues automáticos mediante Deploy Hooks de Render al fusionar en `main`.

---

### B. Tiempo de Entrega de Cambios (LTTC)
- **Definición DORA estricta:** Tiempo desde la confirmación del primer commit hasta que el código se ejecuta en producción.
- **Aproximación académica (Lead Time to Main):** Tiempo transcurrido desde el primer commit en una rama corta hasta la aprobación del PR y su merge en `main`.
- **Datos verificables (muestra de Pull Requests):**
  - **PR #2 (Gobernanza):** Primer commit 10:15 → Merge en `c72e5ca` 12:45 ($\Delta t = 2.5\text{ h}$).
  - **PR #4 (Matriz Git-SVN):** Primer commit 14:00 → Merge en `a2c7d77` 17:30 ($\Delta t = 3.5\text{ h}$).
  - **PR #6 (ADR-004):** Primer commit 09:30 → Merge en `d89409d` 12:00 ($\Delta t = 2.5\text{ h daylight}$).
  - **PR #10 (Conflicto):** Primer commit 15:00 → Merge en `aa6d3ae` 18:30 ($\Delta t = 3.5\text{ h}$).
  - **PR #12 (Cierre Semana 3):** Primer commit 11:00 → Merge en `0e6ca50` 13:30 ($\Delta t = 2.5\text{ h}$).
  - **PR #16 (Parser Humo):** Primer commit 22:00 → Merge en `b2dda35` 22:25 ($\Delta t = 0.42\text{ h}$).
- **Cálculo:**
  $$\text{LTTC}_{\text{promedio}} = \frac{2.5 + 3.5 + 2.5 + 3.5 + 2.5 + 0.42}{6} \approx 2.49 \text{ horas}$$
- **Interpretación:** Las ramas cortas y la asignación ágil de revisiones colegiadas permiten un ciclo de integración promedio inferior a 2.5 horas. Tras el merge, el job `cd-deploy` publica y verifica en Render en aproximadamente 3.5 minutos.

---

### C. Tasa de Fallos en Cambios (CFR)
- **Definición DORA estricta:** Porcentaje de despliegues en producción que requieren remediación de emergencia (hotfix, rollback, degradación de servicio).
- **Dato real:** No medible en producción por ausencia de historial con usuarios reales (0 incidentes).
- **Aproximación de compuerta (Tasa de Rechazo en Pipeline):**
  De los 15 PRs gestionados, 1 PR temporal ([PR #15](https://github.com/enriqueherreraec/nexora-arquitectura/pull/15)) se destinó a la verificación controlada de rechazo y corrección en compuerta CI.
- **Interpretación:** No debe confundirse el rechazo preventivo de un PR por linter o contrato con un incidente de producción. La compuerta de CI evita precisamente que el CFR en producción aumente.

---

### D. Tiempo de Recuperación de Fallos (FDRT / MTTR)
- **Definición DORA estricta:** Tiempo transcurrido desde la manifestación de un fallo en producción hasta la completa restauración del servicio para los usuarios finales.
- **Dato empírico real:** No medible en producción (0 incidentes productivos en el historial académico al no existir tráfico de usuarios reales).
- **Estimaciones teóricas propuestas (no son métricas DORA medidas):**
  Los tiempos de recuperación se documentan con estricta transparencia metodológica como **estimaciones propuestas de arquitectura**, delimitando su carácter hipotético y excluyéndolos de cualquier pretensión de métrica DORA empíricamente medida:
  1. *Rollback instantáneo de plataforma (Render):* **3 a 5 minutos** requeridos para pulsar *Rollback to this deploy* en el panel de Render hacia la versión previa estable.
  2. *Hotfix gobernado bajo Git Flow:* **10 a 15 minutos** estimados para aplicar una corrección en rama corta, verificarla automáticamente en la compuerta de CI (3 a 4 min), obtener la aprobación colegiada de un par y desplegar automáticamente por Deploy Hook.
- **Límites metodológicos:** No puede presentarse como MTTR medido sin haber experimentado y cronometrado incidentes reales bajo carga productiva con usuarios finales.

---

## 4. Tabla Resumen de Métricas Aproximadas y sus Límites

| Métrica DORA | Valor Empírico Verificable | Aproximación Formativa Declarada | Límite Metodológico Declarado |
|---|:---:|---|---|
| **Deployment Frequency (DF)** | 1 despliegue continuo certificado en Render ([Run 42156646415](https://github.com/enriqueherreraec/nexora-arquitectura/actions/runs/42156646415)) | 1.07 integraciones a `main` / día (15 PRs en 14 días) | Mide fusiones en Git bajo GitHub Flow y despliegues por webhook, no entregas a usuarios masivos. |
| **Lead Time for Changes (LTTC)** | 3.5 min de despliegue y humo tras merge en `main` | 2.49 horas promedio (de primer commit a merge colegiado) | Mide tiempo de ciclo de ramas cortas y revisión par, más tiempo de compilación y humo en Render. |
| **Change Failure Rate (CFR)** | 0 incidentes en producción real (servicio estable) | 1 fallo inducido y bloqueado en compuerta CI ([PR #15](https://github.com/enriqueherreraec/nexora-arquitectura/pull/15)) | El bloqueo en CI es un filtro preventivo, no un fallo productivo. |
| **Recovery Time (FDRT / MTTR)** | No medible en producción real (0 incidentes) | 3–5 min (estimación propuesta de rollback en plataforma) | **Estimación teórica propuesta, no métrica DORA medida.** |
