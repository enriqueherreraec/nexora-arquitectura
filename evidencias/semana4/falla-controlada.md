# 🚨 Evidencia de Falla Controlada en el Pipeline CI/CD

| Metadato | Detalle |
|---|---|
| **Proyecto** | Nexora · Sistema web de orientación vocacional |
| **Módulo** | Automatización de Procesos de Software · Semana 4 |
| **Criterio de Evaluación** | Rúbrica Semana 4 · Criterio 2: Pipeline CI con quality gates funcionando (Ponderación: 30 %) |
| **Requisito Docente** | Evidencia de una falla provocada y corregida en el pipeline CI con checks obligatorios en `main` |
| **Estado de Verificación** | 🟡 **Demostración técnica estructurada localmente; ejecución y enlaces en GitHub Actions pendientes de generarse al abrir el Pull Request correspondiente** |

---

## 1. Diseño del Experimento de Falla Provocada

Para demostrar que el pipeline [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) actúa como una compuerta estricta (*Quality Gate*) y no permite el paso de código no conforme, se planificó y estructuró una falla inducida en dos etapas:

```mermaid
flowchart LR
    A["1. Código con Violación<br>(Flake8 / Spectral)"] --> B["2. Ejecución CI<br>(Job falla con exit code 1)"]
    B --> C["3. Compuerta Activa<br>(Bloqueo de Merge y CD)"]
    C --> D["4. Corrección Atómica<br>(Limpieza y re-formato)"]
    D --> E["5. Re-ejecución CI<br>(Job pasa a verde exit code 0)"]
```

### A. Fallo Inducido (Compuerta en Rojo)
- **Defecto inyectado:**
  1. **Linter (Flake8):** Inserción deliberada de importaciones huérfanas (`import sys, math`) y espaciado erróneo (`E302: expected 2 blank lines, found 1`) en `src/api/v1/auth.py`.
  2. **Contrato OpenAPI (Spectral CLI):** Omisión del campo requerido `access_token` en el esquema `AuthResponse` de `api/openapi.yaml`.
- **Comportamiento esperado en CI:**
  - El job `ci-lint-and-static-analysis` termina con código de salida `1`.
  - Los jobs dependientes (`ci-tests`, `ci-docs-and-frontend` y `cd-deploy`) se cancelan (*skipped*).
  - El Pull Request queda bloqueado en GitHub impidiendo la fusión hacia `main`.
  - Render no recibe solicitud de despliegue (`Auto-Deploy: No`).

### B. Corrección Aplicada (Compuerta en Verde)
- **Subsanación:**
  1. Retiro de módulos no utilizados y normalización de saltos de línea según `.flake8`.
  2. Restitución estricta de `access_token` como propiedad requerida en `api/openapi.yaml`.
- **Comportamiento esperado en CI:**
  - Todos los jobs (`ci-lint-and-static-analysis`, `ci-tests`, `ci-docs-and-frontend`) finalizan con código de salida `0`.
  - Se habilitan los checks en verde en el Pull Request.

---

## 2. Registro de Trazabilidad y Enlaces Pendientes en GitHub Actions

| Paso de la Demostración | Rama de Trabajo | Commit / PR Vinculado | Estado Técnico | Enlace de Ejecución en GitHub Actions |
|---|---|---|:---:|---|
| **1. Inyección de Falla** | `test/demostracion-falla-ci` | Pendiente de commit en rama de prueba | 🟡 Preparado localmente | *(Se generará automáticamente al enviar el PR a GitHub)* |
| **2. Bloqueo de Compuerta** | `test/demostracion-falla-ci` | Job `ci-lint-and-static-analysis` fallido | 🟡 Pendiente de log en GitHub | *(Enlace a la ejecución fallida en GitHub Actions)* |
| **3. Corrección Atómica** | `test/demostracion-falla-ci` | Commit correctivo de linter y contrato | 🟡 Preparado localmente | *(Enlace al commit de corrección)* |
| **4. Validación en Verde** | `test/demostracion-falla-ci` | Re-ejecución aprobada (exit code 0) | 🟡 Pendiente de log en GitHub | *(Enlace a la ejecución aprobada en GitHub Actions)* |

> [!NOTE]
> Para no contaminar el historial de la rama principal ni registrar ejecuciones ficticias, la demostración real en la interfaz de GitHub Actions se completará al abrir el Pull Request de prueba en el repositorio remoto.
