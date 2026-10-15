# Lecturas de apoyo

## 1. Propósito

Estas lecturas apoyan la comparación de estilos arquitectónicos y la selección de herramientas para documentar Nexora, corresponden a las tareas de apoyo de la actividad y complementan la matriz de decisión y los ADR.

## 2. Estilos arquitectónicos

### 2.1 Síntesis de la lectura

Un estilo arquitectónico establece criterios para organizar los elementos del sistema y sus relaciones, su selección requiere considerar los atributos de calidad y las restricciones del caso.

La arquitectura por capas separa responsabilidades y limita dependencias, los microservicios distribuyen capacidades en servicios con despliegue independiente, esa distribución introduce necesidades de comunicación, coordinación y operación.

Un monolito puede conservar módulos y capas internas, por tanto, una sola unidad de despliegue no implica ausencia de organización.

**Fuentes:** Microsoft, Architecture styles y Common web application architectures.

### 2.2 Aplicación al caso Nexora

| Alternativa | Aplicación | Beneficio esperado | Compromiso |
|---|---|---|---|
| Monolito modular con capas | Organizar acceso, catálogo, evaluación e informes dentro de FastAPI | Aprovechar la implementación y facilitar transacciones locales | Compartir recursos y desplegar el backend como una unidad |
| Microservicios | Separar capacidades en servicios independientes | Permitir escalado y despliegues por capacidad | Gestionar contratos remotos, fallos de red y varios despliegues |

### 2.3 Criterio arquitectónico

Para Nexora se propone un monolito modular con capas, esta alternativa se ajusta a la base existente y permite abordar la integridad de las evaluaciones sin introducir distribución adicional.

La selección requiere límites modulares verificables, las pruebas de carga y disponibilidad pueden aportar evidencia para revisar la decisión en el futuro.

## 3. Herramientas CASE

### 3.1 Concepto

CASE significa Computer-Aided Software Engineering, el término se refiere a herramientas que apoyan actividades de ingeniería de software, como análisis, modelado, documentación y mantenimiento.

Una herramienta debe evaluarse por su ajuste a las tareas del equipo, la facilidad de uso y las posibilidades de integración, utilizar una herramienta no garantiza por sí solo la calidad del diseño.

### 3.2 Distinción de herramientas en Nexora

| Herramienta | Función |
|---|---|
| Mermaid | Representar diagramas mediante texto |
| Git | Conservar versiones e historial de cambios |
| GitHub | Alojar el repositorio y facilitar su revisión |
| Antigravity | Editar archivos y apoyar el desarrollo |
| ChatGPT | Proponer contenido que requiere revisión crítica |

Estas herramientas apoyan actividades distintas, su inclusión en esta tabla no significa que todas constituyan una suite CASE ni que cumplan una certificación.

## 4. Resumen introductorio de ISO/IEC 14102:2008

### 4.1 Identificación

**Título:** Information technology — Guideline for the evaluation and selection of CASE tools.

La descripción pública de ISO/IEC 14102:2008 presenta procesos y un conjunto estructurado de características para evaluar técnicamente y seleccionar herramientas CASE.

La selección debe considerar las necesidades de quienes utilizan las herramientas y su contexto de adopción, este resumen utiliza la ficha pública de ISO y no representa una revisión del contenido normativo completo.

### 4.2 Aplicación propuesta a Nexora

Para el dossier se propone definir necesidades, comparar alternativas y ejecutar una prueba con documentos reales del proyecto, los siguientes criterios son una adaptación del equipo y no una reproducción de requisitos de la norma.

| Criterio propuesto | Pregunta de evaluación | Evidencia |
|---|---|---|
| Adecuación | ¿Permite representar las vistas requeridas? | Diagramas C4 de niveles 1 y 2 |
| Legibilidad | ¿Los actores y relaciones se comprenden? | Revisión cruzada |
| Versionado | ¿Permite identificar los cambios? | Historial de Git |
| Integración | ¿Los diagramas pueden revisarse desde el repositorio? | Renderizado en GitHub |
| Portabilidad | ¿El código del diagrama puede conservarse y editarse? | Archivos Markdown |
| Costo de adopción | ¿Qué esfuerzo requiere aprender y mantener la herramienta? | Prueba de uso del equipo |

### 4.3 Evaluación práctica propuesta

| Paso | Aplicación |
|---|---|
| Definir la necesidad | Documentar las vistas C4 como código versionado |
| Identificar alternativas | Comparar Mermaid y PlantUML |
| Preparar una prueba | Representar el mismo fragmento de Nexora en ambas herramientas |
| Revisar resultados | Comparar legibilidad, edición y publicación |
| Registrar la selección | Justificar la herramienta elegida y sus límites |

Nexora utiliza Mermaid para las vistas del dossier, la comparación práctica con PlantUML permanece pendiente si no existe evidencia de su ejecución.

## 5. Relación con el dossier

La lectura de estilos aporta criterios para interpretar la matriz ponderada y ADR-003, la introducción a CASE aporta una guía para evaluar las herramientas de documentación.

Los diagramas y documentos requieren revisión aunque las herramientas permitan generarlos automáticamente, la consistencia se comprueba mediante trazabilidad, revisión cruzada y contraste con la implementación.

## 6. Referencias

International Organization for Standardization. (2008). *ISO/IEC 14102:2008: Information technology — Guideline for the evaluation and selection of CASE tools*. https://www.iso.org/standard/43189.html

Microsoft. (s. f.). *Architecture styles*. Azure Architecture Center. https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/

Microsoft. (s. f.). *Common web application architectures*. Microsoft Learn. https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures

## 7. Documentos relacionados

- [Matriz de decisión](03-adr/matriz-de-decision.md)
- [ADR-003: estilo arquitectónico](03-adr/ADR-003-estilo-arquitectonico.md)
- [Revisión cruzada](05-revision-cruzada.md)
- [Registro de IA](04-registro-ia.md)