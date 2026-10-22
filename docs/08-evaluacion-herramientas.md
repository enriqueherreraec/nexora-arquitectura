# Matriz de Evaluación y Selección de Herramientas CASE de Nexora

## 1. Propósito y Alcance

Este documento formaliza la evaluación comparativa y la selección de las herramientas CASE (Computer-Aided Software Engineering) evaluadas empíricamente durante la Semana 2 del proyecto Nexora.

A diferencia de la matriz de estilos arquitectónicos documentada en la Semana 1 (que comparó monolito modular, microservicios y arquitectura orientada a eventos en `docs/03-adr/matriz-de-decision.md`), esta matriz evalúa el herramental de software que soporta las fases de análisis, diseño, construcción, prueba y entrega de la API vocacional.

---

## 2. Herramientas Evaluadas y Tareas que Apoyan

Se evalúan en profundidad tres herramientas aplicadas sobre las tareas prioritarias del proyecto, incluyendo una herramienta de inteligencia artificial:

| Herramienta | Versión / Entorno | Clasificación CASE | Tarea principal que apoya | Función en el proyecto Nexora |
|---|:---:|:---:|:---:|---|
| **Stoplight Spectral CLI** | 6.17.0 (Node.js) | Lower CASE | **T4** (Gobernanza de contrato) | Análisis estático y linter del contrato OpenAPI (`api/openapi.yaml`), asegurando el cumplimiento de esquemas, descripciones y tipos de datos. |
| **Stoplight Prism CLI** | 5.15.11 (Node.js) | Lower CASE | **T7** (Simulación Mock) | Servidor HTTP mock que valida solicitudes entrantes y emula respuestas apegadas al contrato sin necesidad de base de datos activa. |
| **Antigravity AI Assistant** | Google DeepMind (Cloud Service) | I-CASE | **T6** (Lógica vocacional) | Asistencia cognitiva para el diseño de algoritmos de cálculo, estructuración de pruebas automatizadas y resolución de casos límite. |

---

## 3. Criterios de Evaluación y Ponderación

Los criterios se definen considerando las necesidades de reproducibilidad, rigor técnico e integración del equipo de desarrollo, sumando exactamente el **100 %**:

| ID | Criterio de evaluación | Peso (%) | Justificación del peso asignado |
|:---:|---|:---:|---|
| **C1** | **Facilidad de integración y automatización por CLI** | **20 %** | La herramienta debe poder ejecutarse sin intervención manual mediante scripts de PowerShell/Bash y pipelines de integración continua. |
| **C2** | **Fidelidad y cumplimiento estricto del estándar** | **25 %** | Es el criterio de mayor peso: la herramienta debe respetar estrictamente la especificación OpenAPI 3.0, validaciones JSON Schema y tipos Pydantic sin tolerar ambigüedades. |
| **C3** | **Calidad y precisión de diagnósticos y reportes** | **20 %** | Capacidad para reportar la línea exacta, severidad y causa raíz de fallos, reduciendo el tiempo de diagnóstico y corrección. |
| **C4** | **Rendimiento, latencia y consumo de recursos** | **15 %** | Velocidad de ejecución en frío y ligereza operativa para no degradar los tiempos del ciclo de desarrollo local. |
| **C5** | **Costo, licenciamiento y reproducibilidad** | **20 %** | Prioriza soluciones de código abierto o con esquemas transparentes que permitan su reproducción en cualquier máquina sin barreras propietarias. |
| **Total** | **Suma de criterios ponderados** | **100 %** | - |

---

## 4. Escala de Calificación y Fórmula de Puntuación

### Escala cuantitativa (1 a 5)
- **1 (Muy deficiente):** Incumple el criterio o introduce fricción severa.
- **2 (Deficiente):** Soporte parcial que requiere parches o adaptaciones manuales complejas.
- **3 (Aceptable):** Cumple con las funciones básicas con ciertas limitaciones de usabilidad.
- **4 (Bueno):** Comportamiento robusto y confiable con desviaciones mínimas.
- **5 (Excelente):** Cumplimiento sobresaliente, documentación completa y óptima integración.

### Fórmula de cálculo
$$\text{Puntaje Ponderado} = \sum_{i=1}^{5} (\text{Calificación}_{i} \times \text{Peso}_{i})$$

---

## 5. Calificaciones Justificadas por Pruebas Reales

### 5.1. Spectral CLI (Lower CASE)
- **C1 (CLI, 20 % = 5/5):** Se ejecuta con un único comando determinista (`npx @stoplight/spectral-cli lint`), admite códigos de salida estándar (código 0 en éxito, 1 en error) y no requiere entorno gráfico.
- **C2 (Estándar, 25 % = 5/5):** Detectó con precisión milimétrica la ausencia del campo `todas_cero` en el ejemplo de `GET /api/v1/evaluaciones/ultima` y advirtió sobre la barra final (`path-keys-no-trailing-slash`).
- **C3 (Reportes, 20 % = 5/5):** Salida clara indicando archivo, línea y columna (`api/openapi.yaml:228:23`), severidad y nombre de la regla infringida (`oas3-valid-media-example`).
- **C4 (Rendimiento, 15 % = 4/5):** Completó el análisis exhaustivo de más de 700 líneas de contrato YAML en 1,8 segundos.
- **C5 (Costo/Reproducibilidad, 20 % = 5/5):** Software libre (Apache 2.0), disponible globalmente vía NPM sin suscripción requerida.

### 5.2. Stoplight Prism CLI (Lower CASE)
- **C1 (CLI, 20 % = 4/5):** Fácil inicio con `prism mock`, pero al ser un proceso en segundo plano (daemon) requiere gestión de puertos y señales de detención (`kill`).
- **C2 (Estándar, 25 % = 5/5):** Negocia estrictamente los tipos MIME `application/json`, valida esquemas de solicitud y retorna los ejemplos definidos en el contrato.
- **C3 (Reportes, 20 % = 4/5):** Registra detalladamente en consola cada solicitud recibida, el estado del validador y el código HTTP negociado (200, 201), aunque carece de reportes gráficos exportables sin herramientas de terceros.
- **C4 (Rendimiento, 15 % = 4/5):** Atendió las solicitudes de prueba en menos de 15 ms por petición HTTP una vez inicializado el servidor.
- **C5 (Costo/Reproducibilidad, 20 % = 5/5):** Código abierto (Apache 2.0), ejecutable mediante Node.js en cualquier sistema operativo.

### 5.3. Antigravity AI Assistant (Google DeepMind) (I-CASE)
- **C1 (CLI/IDE, 20 % = 4/5):** Integrado directamente en el entorno de desarrollo Antigravity IDE, aunque su operación depende de conectividad a la nube y credenciales de acceso al servicio.
- **C2 (Estándar, 25 % = 4/5):** Alta capacidad para generar código alineado a Pydantic y Python 3.11; sin embargo, en su primera iteración omitió el metadato de control de versión inmutable (`version_cuestionario`), requiriendo intervención humana.
- **C3 (Reportes, 20 % = 4/5):** Explica detalladamente su razonamiento y propuestas de refactorización, pero los posibles errores lógicos no se señalan automáticamente hasta ejecutar pruebas unitarias.
- **C4 (Rendimiento, 15 % = 4/5):** Tiempo de respuesta ágil en streaming cognitivo (pocos segundos por consulta).
- **C5 (Costo/Reproducibilidad, 20 % = 4/5):** Servicio inteligente con modelo fundacional; su acceso requiere autenticación en la plataforma y no permite ejecución offline autocontenida.

---

## 6. Resultados Ponderados

| Criterio | Peso | Spectral CLI | Stoplight Prism | Antigravity AI Assistant |
|---|:---:|:---:|:---:|:---:|
| C1. Facilidad CLI e integración | 20 % | 5 (1,00) | 4 (0,80) | 4 (0,80) |
| C2. Cumplimiento de estándares | 25 % | 5 (1,25) | 5 (1,25) | 4 (1,00) |
| C3. Calidad de diagnósticos | 20 % | 5 (1,00) | 4 (0,80) | 4 (0,80) |
| C4. Rendimiento y recursos | 15 % | 4 (0,60) | 4 (0,60) | 4 (0,60) |
| C5. Costo y reproducibilidad | 20 % | 5 (1,00) | 5 (1,00) | 4 (0,80) |
| **Puntaje total ponderado (sobre 5)** | **100 %** | **4,85** | **4,45** | **4,00** |

---

## 7. Análisis de Complementariedad y Selección

### Explicación de complementariedad funcional
Las herramientas analizadas operan en diferentes fases del ciclo de vida y **no son sustitutas directas entre sí**:
1. **Spectral CLI** es una herramienta de gobernanza de diseño: asegura que el contrato OpenAPI sea sintáctica y semánticamente perfecto antes de escribir código.
2. **Prism CLI** es una herramienta de simulación de pruebas: permite al equipo de frontend desarrollar y probar pantallas contra la especificación formal sin esperar a que la base de datos o el backend estén finalizados.
3. **Antigravity AI Assistant** es un entorno I-CASE: potencia la productividad del desarrollador al redactar lógica de negocio, pruebas unitarias y análisis de casos límite.

> **Regla de decisión:** El mayor puntaje de Spectral (4,85) no significa que deba eliminarse Prism ni la asistencia de IA. Las tres herramientas se seleccionan de forma conjunta para formar la cadena CASE integrada de Nexora.

### Riesgos y limitaciones identificados

| Herramienta | Riesgos operativos | Limitaciones técnicas | Medidas de mitigación en Nexora |
|---|---|---|---|
| **Spectral CLI** | Reglas excesivamente permisivas si se omite un ruleset formal. | No valida comportamiento dinámico ni lógica de persistencia. | Se fijó el conjunto `.spectral.yaml` con severidades en `error` y reglas estrictas de esquemas. |
| **Prism CLI** | Servidor mock que podría mantenerse escuchando si no se detiene adecuadamente el proceso daemon. | Devuelve datos sintéticos basados en ejemplos fijos, no valida estados persistentes en PostgreSQL. | Se automatizó la parada del proceso mediante el gestor de tareas y se reservó el puerto 4010 para mocks. |
| **Antigravity AI** | Alucinaciones sutiles en reglas matemáticas o sesgos arbitrarios en la resolución de empates. | Dependencia de conexión a Internet y consumo de tokens de contexto. | Supervisión técnica estricta: todo código generado por IA debe ser auditado y validado mediante la suite de 16 pruebas en `pytest`. |
