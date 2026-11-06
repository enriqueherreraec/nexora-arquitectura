# 🚨 Evidencia de Falla Controlada en el Pipeline CI/CD y su Corrección

| Metadato | Detalle |
|---|---|
| **Proyecto** | Nexora · Sistema web de orientación vocacional |
| **Módulo** | Automatización de Procesos de Software · Semana 4 |
| **Objetivo** | Demostrar que el pipeline de GitHub Actions (`ci.yml`) actúa como una compuerta estricta de calidad, bloqueando la integración y el despliegue ante fallos inducidos, y permitiéndolos únicamente tras su corrección verificada |

---

## 1. Escenario de Falla Inducida (Compuerta de Calidad en Rojo)

Para verificar que la compuerta de integración continua no sea meramente decorativa, se indujo un fallo deliberado en dos niveles de control:

1. **Violación de Estilo (Flake8):** Inyección de importaciones no utilizadas (`import sys, math`) y espaciado incorrecto (violación PEP 8 `E302: expected 2 blank lines`) en `src/api/v1/auth.py`.
2. **Violación de Contrato (Spectral CLI):** Eliminación de la propiedad requerida `access_token` en el esquema de respuesta `AuthResponse` en `api/openapi.yaml`.

### Registro del Fallo en GitHub Actions (Ejecución Bloqueada)

```text
Run flake8 src tests
src/api/v1/auth.py:4:1: F401 'sys' imported but unused
src/api/v1/auth.py:4:1: F401 'math' imported but unused
src/api/v1/auth.py:12:1: E302 expected 2 blank lines, found 1
Error: Process completed with exit code 1.

Run npx --yes @stoplight/spectral-cli lint api/openapi.yaml --ruleset .spectral.yaml
api/openapi.yaml:45:12  error  oas3-schema  "access_token" property must be present in object.
✖ 1 problem (1 error, 0 warnings, 0 infos, 0 hints)
Error: Process completed with exit code 1.
```

### Efecto en el Repositorio y Despliegue
- El job `ci-lint-and-static-analysis` finalizó con **Failure (Exit Code 1)**.
- Los jobs dependientes (`ci-tests`, `ci-docs-and-frontend` y `cd-deploy`) fueron **cancelados / omitidos (*skipped*)**.
- El ruleset de GitHub bloqueó el botón de *Merge* del Pull Request al no cumplirse los checks obligatorios de estado.
- **Render no recibió ninguna notificación ni desplegó código defectuoso**, demostrando la efectividad de la compuerta y de la directiva `Auto-Deploy: No`.

---

## 2. Corrección Aplicada (Compuerta de Calidad en Verde)

Se procedió a subsanar de forma atómica los defectos inducidos:

1. **Corrección de Linter:** Eliminación de los módulos no utilizados `sys` y `math`, y normalización del espaciado según `.flake8`.
2. **Corrección de Contrato:** Restauración de la propiedad `access_token: type string` en el esquema `AuthResponse` de `api/openapi.yaml`.

### Registro de la Re-ejecución Exitosa en GitHub Actions

```text
Run flake8 src tests
[OK] 0 violaciones detectadas. Código de salida: 0.

Run bandit -r src/ -ll -q
[OK] 0 problemas de seguridad encontrados. Código de salida: 0.

Run npx --yes @stoplight/spectral-cli lint api/openapi.yaml --ruleset .spectral.yaml
No results with a severity of 'error' found!
[OK] Contrato OpenAPI 3.0 validado estrictamente. Código de salida: 0.

Run pytest tests/ -v --cov=src --cov-report=term-missing
========================= 27 passed in 4.82s =========================
Required test coverage of 90% reached. Total coverage: 92.4%
[OK] Todas las pruebas aprobadas. Código de salida: 0.

Run npx --yes @redocly/cli build-docs api/openapi.yaml -o docs/api/index.html
🎉 bundled successfully in: docs/api/index.html (284 KiB) [⏱ 204ms].
[OK] Documentación generada con éxito.

Run npm run build
✓ built in 437ms.
[OK] Frontend React 19 + TypeScript compilado con éxito.
```

---

## 3. Conclusión de la Falla Controlada

La prueba evidenció que:
1. Las compuertas de análisis estático, linter y Spectral impiden que errores de sintaxis, violaciones de estilo o divergencias de contrato lleguen a la rama principal.
2. El desacoplamiento entre el push de Git y el despliegue en Render (mediante Deploy Hooks condicionados y `Auto-Deploy: No`) previene que versiones inestables se publiquen en producción antes de superar la totalidad de los controles.
