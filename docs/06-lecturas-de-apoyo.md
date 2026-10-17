# Lecturas de apoyo

## Propósito

Reunir fuentes de consulta para interpretar las vistas C4, documentar las decisiones arquitectónicas y orientar la evaluación de herramientas de apoyo utilizadas en Nexora.

## Fuentes y aplicación

| Fuente | Tema | Aplicación en Nexora |
|---|---|---|
| Brown, modelo C4 | Contexto y contenedores | Diferenciar actores, sistemas externos, aplicación web, API y base de datos |
| Nygard, registros ADR | Decisiones arquitectónicas | Documentar contexto, decisión, alternativas y consecuencias |
| ISO/IEC 14102:2008 | Evaluación y selección de herramientas CASE | Identificar necesidades y criterios para comparar herramientas |

## Aplicación de las lecturas

### Modelo C4

El nivel 1 presenta Nexora como un sistema y muestra sus relaciones con estudiantes, administrador, gestor académico y sistemas externos, el nivel 2 identifica la aplicación React, la API FastAPI y PostgreSQL, los módulos internos de la API no se representan como microservicios independientes.

### Registros de decisiones arquitectónicas

Los ADR conservan el problema, la decisión y sus consecuencias, Nexora utiliza ADR-001 para el control de acceso, ADR-002 para la integridad e historial de evaluaciones y ADR-003 para la elección del monolito modular con capas.

### Evaluación de herramientas CASE

La ficha pública de ISO/IEC 14102:2008 orienta el análisis de evaluación y selección de herramientas CASE, su aplicación al deber permite relacionar las necesidades de documentación con criterios como facilidad de uso, representación, exportación y mantenimiento.

Mermaid permite representar los diagramas mediante texto y GitHub conserva los archivos y su historial de cambios, esta relación describe su utilidad en el proyecto y no acredita cumplimiento de la norma.

## Alcance de la consulta

La referencia a ISO/IEC 14102 se limita a su información pública, no se declara acceso al texto completo ni una evaluación formal de conformidad, las fuentes respaldan el análisis y no sustituyen las pruebas de los escenarios de calidad.

## Referencias

Brown, S. (s. f.). *System context diagram*. C4 model. https://c4model.com/diagrams/system-context

Brown, S. (s. f.). *Container diagram*. C4 model. https://c4model.com/diagrams/container

International Organization for Standardization. (2008). *Information technology — Guideline for the evaluation and selection of CASE tools (ISO/IEC 14102:2008)*. https://www.iso.org/standard/43189.html

Nygard, M. (2011, 15 de noviembre). *Documenting architecture decisions*. Cognitect. https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions

## Documentación relacionada

- [Contexto y drivers](01-contexto-y-drivers/contexto-y-drivers.md)
- [C4 nivel 1](02-vistas-c4/nivel1.md)
- [C4 nivel 2](02-vistas-c4/nivel2.md)
- [Decisiones arquitectónicas](03-adr/)
- [Matriz de decisión](03-adr/matriz-de-decision.md)
