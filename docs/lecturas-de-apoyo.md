# Lecturas de apoyo

## Propósito

Reunir fuentes de consulta para interpretar las vistas C4, documentar las decisiones arquitectónicas, orientar la evaluación de herramientas CASE y fundamentar los procesos de ingeniería de requisitos y control de versiones aplicados en Nexora.

## Fuentes y aplicación

| Fuente | Tema central | Aplicación en Nexora |
|---|---|---|
| Brown, modelo C4 | Contexto y contenedores | Diferenciar actores, sistemas externos, aplicación web, API modular y base de datos |
| Nygard, registros ADR | Decisiones de arquitectura | Documentar contexto, decisiones de diseño, alternativas evaluadas y consecuencias |
| ISO/IEC 14102:2008 | Evaluación y selección de herramientas CASE | Definir criterios y pesos para evaluar herramientas Upper, Lower e I-CASE |
| ISO/IEC/IEEE 29148:2018 | Procesos de ingeniería de requisitos | Formular requisitos verificables, no ambiguos, consistentes y trazables mediante historias de usuario y criterios de aceptación en Gherkin |
| Chacon & Straub (*Pro Git*, Caps. 1 y 2) | Fundamentos y práctica de Git | Gestionar el ciclo de vida del repositorio, estados de archivos (modified, staged, committed), inmutabilidad del historial y trazabilidad de versiones |

## Síntesis y aplicación de las lecturas

### 1. Modelo C4 (Simon Brown)

El modelo C4 proporciona una notación jerárquica y comprensible para describir la arquitectura de software. 
- **Nivel 1 (Contexto del sistema):** Delimita a Nexora como un sistema integral de orientación vocacional frente a sus actores (estudiante, administrador, gestor académico) y servicios externos (proveedor SMTP para correos y portales universitarios públicos).
- **Nivel 2 (Contenedores):** Especifica las unidades ejecutables independientes: la aplicación web (React + TypeScript), el backend API (FastAPI + Python estructurado en monolito modular) y la base de datos relacional (PostgreSQL). Los módulos internos de la API no se representan como microservicios separados, preservando la cohesión del diseño.

### 2. Registros de decisiones arquitectónicas (Michael Nygard)

Los ADR capturan decisiones de diseño significativas junto con su contexto, alternativas descartadas y consecuencias funcionales y técnicas:
- **ADR-001 (Control de acceso a evaluaciones e informes):** Resuelve la propiedad del recurso y aislamiento estricto entre cuentas mediante tokens JWT validados en FastAPI.
- **ADR-002 (Integridad e historial de evaluaciones):** Garantiza la atomicidad de las 20 respuestas Likert y su resultado mediante transacciones ACID locales en PostgreSQL, preservando inalterado el historial ante cambios futuros de ponderaciones.
- **ADR-003 (Estilo arquitectónico de monolito modular con capas):** Justifica la selección de una arquitectura modular sobre microservicios para reducir la sobrecarga operativa y asegurar transacciones locales confiables.

### 3. Evaluación y selección de herramientas CASE (ISO/IEC 14102:2008)

La norma internacional ISO/IEC 14102 establece guías para identificar necesidades organizacionales, estructurar criterios de evaluación y ponderar alternativas de herramientas CASE (Computer-Aided Software Engineering):
- Permite clasificar el herramental en **Upper CASE** (análisis y modelado de requisitos/arquitectura), **Lower CASE** (generación de código, pruebas, linting y construcción) e **I-CASE** (entornos integrados con soporte a múltiples fases).
- Proporciona el marco metodológico para la matriz de evaluación del proyecto, ponderando criterios como madurez, facilidad de integración, reproducibilidad en línea de comandos y costo.

### 4. Ingeniería de requisitos (ISO/IEC/IEEE 29148:2018)

La norma ISO/IEC/IEEE 29148 reemplaza a estándares históricos (como IEEE 830 e IEEE 1233) y estandariza los procesos del ciclo de vida de los requisitos de software. Define las características fundamentales de una especificación de requisitos de alta calidad:
1. **Necesidad (*Necessity*):** Cada requisito debe responder a un objetivo de negocio o preocupación real de los interesados (en Nexora, vinculados a los interesados S1 y S2 y a los drivers D1 a D5).
2. **Ausencia de ambigüedad (*Unambiguity*):** El enunciado debe admitir una única interpretación por parte de desarrolladores, evaluadores y usuarios. Esto se materializa mediante la sintaxis estructurada de Historias de Usuario (*Como / Quiero / Para*) y especificaciones ejecutables en lenguaje Gherkin (*Dado / Cuando / Entonces*).
3. **Verificabilidad (*Verifiability*):** Debe existir un procedimiento finito y cuantificable para comprobar si el sistema satisface el requisito. Nexora vincula cada criterio a códigos de estado HTTP concretos (ej. 200, 401, 404, 422), esquemas JSON estrictos o medidas de escenarios (E1 a E6).
4. **Consistencia (*Consistency*):** Los requisitos no deben contradecirse entre sí ni con las restricciones arquitectónicas (ej. no exigir transaccionalidad distribuida cuando se opera sobre un monolito local).
5. **Completitud (*Completeness*):** La especificación debe cubrir tanto los flujos satisfactorios (*happy path*) como las condiciones de error y casos límite (respuestas incompletas, credenciales inválidas, indisponibilidad del servicio de correo).
6. **Trazabilidad (*Traceability*):** Cada requisito debe ser rastreable hacia su origen (driver, interesado) y hacia sus artefactos de diseño, endpoints, código y pruebas automatizadas (matriz de trazabilidad bidireccional).

### 5. Control de versiones distribuido con Git (*Pro Git*, Caps. 1 y 2)

El texto de referencia de Scott Chacon y Ben Straub detalla los principios operativos de Git:
- **Modelo de datos basado en instantáneas (*snapshots*):** A diferencia de los sistemas VCS basados en diferencias delta, Git gestiona el historial como un grafo acíclico dirigido (DAG) de instantáneas inmutables indexadas criptográficamente mediante hashes SHA-1.
- **Los tres estados y las tres áreas:** Un archivo en Git transita por tres estados: *modified* (modificado en el árbol de trabajo), *staged* (preparado en el índice para confirmación) y *committed* (almacenado de forma segura en la base de datos de objetos local). Comprender este flujo evita operaciones accidentales y permite revisiones atómicas.
- **Integridad y trazabilidad del repositorio:** Toda modificación genera una firma identificable. En Nexora, las directrices de entrega prohíben estrictamente el uso de `git reset --hard` y `git push --force`, asegurando que el historial de auditoría y las revisiones entre pares permanezcan íntegras, auditables y directamente vinculadas a la versión de entrega `v0.2.0`.
- **Trabajo colaborativo y ramas locales:** Facilita la verificación aislada de contratos y stubs antes de su consolidación en la rama principal.

## Alcance de la consulta y advertencia legal

- **Normas ISO/IEC 14102 e ISO/IEC/IEEE 29148:** Las referencias a estas normas se basan en su documentación pública, guías de adopción técnica, preámbulos oficiales y estándares académicos abiertos derivados. No se declara ni presupone acceso no autorizado al texto comercial completo ni una certificación formal de conformidad de tercera parte.
- **Pro Git (Chacon & Straub):** Obra de libre consulta distribuida bajo licencia abierta Creative Commons Attribution Non Commercial Share Alike 3.0, consultada en su versión oficial actualizada.

## Referencias bibliográficas

- Brown, S. (2018). *The C4 model for visualising software architecture*. https://c4model.com/
- Chacon, S., & Straub, B. (2014). *Pro Git* (2.ª ed.). Apress. https://git-scm.com/book/en/v2
- International Organization for Standardization. (2008). *Information technology — Guideline for the evaluation and selection of CASE tools* (ISO/IEC 14102:2008). https://www.iso.org/standard/43189.html
- International Organization for Standardization, & Institute of Electrical and Electronics Engineers. (2018). *Systems and software engineering — Life cycle processes — Requirements engineering* (ISO/IEC/IEEE 29148:2018). https://www.iso.org/standard/72089.html
- Nygard, M. (2011, 15 de noviembre). *Documenting architecture decisions*. Cognitect Blog. https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions

## Documentación relacionada en Nexora

- [Contexto y drivers](01-contexto-y-drivers/contexto-y-drivers.md)
- [C4 nivel 1: Contexto](02-vistas-c4/nivel1.md)
- [C4 nivel 2: Contenedores](02-vistas-c4/nivel2.md)
- [Decisiones arquitectónicas ADR](03-adr/)
- [Mapa de toolchain](06-mapa-toolchain.md)
- [Historias y criterios](07-historias-y-criterios.md)
- [Evaluación de herramientas](08-evaluacion-herramientas.md)
