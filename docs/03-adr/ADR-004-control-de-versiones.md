# ADR-004. Selección de Git, GitHub y GitHub Flow para el control de versiones

## Estado

Propuesto (30 de octubre de 2026), pendiente de revisión y aprobación del pull request correspondiente.

## Contexto

Nexora es un sistema de orientación vocacional con una aplicación web en React y TypeScript, un backend FastAPI y PostgreSQL, su arquitectura corresponde a un monolito modular por capas, el equipo de tres integrantes requiere autonomía local, cambios pequeños, revisión por pares y trazabilidad entre tareas y versiones.

El proyecto conserva un repositorio existente y la etiqueta `v0.2.0`, esta decisión formaliza las herramientas y las reglas de colaboración para las siguientes entregas.

## Decisión

Adoptar Git como sistema de control de versiones, GitHub como plataforma de colaboración y GitHub Flow como flujo de trabajo, con responsabilidades diferenciadas:

- **Git:** Registrar commits, consultar el historial disponible, crear ramas y fusionar cambios, muchas operaciones se realizan de forma local sin conexión a internet.
- **GitHub:** Alojar el repositorio remoto y proporcionar issues, pull requests, revisiones y reglas de protección de ramas.
- **GitHub Flow:** Organizar los cambios en ramas cortas desde `main`, presentar los cambios mediante PR e integrarlos tras su revisión.

Nexora adopta como reglas complementarias los commits convencionales, la validación proporcional al cambio, una aprobación de otro integrante y la resolución de observaciones antes del merge, estas condiciones dependen de los acuerdos del equipo y de la configuración del repositorio.

## Alternativas consideradas

La evaluación utiliza las siete dimensiones de la matriz comparativa: modelo, historial, ramas, trabajo sin conexión, permisos, rendimiento y ecosistema.

| Alternativa | Características | Resultado |
|---|---|---|
| Apache Subversion (SVN) | Repositorio centralizado, revisiones globales, ramas mediante copias baratas y autorización por rutas | No seleccionada para el contexto actual |
| Git con GitHub y GitHub Flow | Commits y ramas locales, historial distribuido y colaboración mediante PR en GitHub | Seleccionada |

Ambos sistemas permiten colaboración y fusiones, la autonomía local de Git y la continuidad del repositorio existente favorecen su elección para Nexora (Chacon & Straub, 2014; Collins-Sussman et al., 2011).

## Justificación

1. **Autonomía local:** Cada integrante puede crear ramas y registrar avances antes de compartirlos, la sincronización con GitHub requiere conexión.
2. **Ramas por tarea:** Las referencias ligeras de Git facilitan separar cambios de documentación, funcionalidades, correcciones y pruebas, las fusiones pueden presentar conflictos.
3. **Revisión por pares:** Los PR permiten examinar los cambios, las reglas configuradas en GitHub exigen una aprobación antes del merge hacia `main`.
4. **Continuidad:** Se conserva el repositorio y la etiqueta existente `v0.2.0`, los hashes permiten verificar la integridad de los objetos, la conservación del historial requiere protección y respaldos.
5. **Trazabilidad:** La relación entre issues, commits y PR permite consultar el propósito de cada cambio y su proceso de revisión.

## Consecuencias

### Beneficios

- Registrar avances locales durante interrupciones de conectividad.
- Separar tareas mediante ramas cortas.
- Relacionar los PR con sus issues mediante `Closes #n`.
- Revisar cambios antes de integrarlos en `main`.
- Conservar el entorno de colaboración que el proyecto utiliza en GitHub.

### Limitaciones, compromisos y responsabilidades

- **Respaldos:** Mantener medidas de respaldo y recuperación, las copias locales no sustituyen toda la información de colaboración almacenada en GitHub.
- **Disciplina:** Evitar ramas prolongadas, describir los cambios y realizar revisiones sustantivas.
- **Conflictos:** Resolver los conflictos que Git no pueda integrar automáticamente y verificar el resultado antes de publicar.
- **Acceso:** Git no proporciona autorización de lectura por carpetas dentro de un mismo repositorio compartido.
- **Protección:** Conservar las reglas de `main`, evitar commits directos y pushes forzados sobre el historial compartido.
- **Validación:** Registrar únicamente las comprobaciones realizadas, sin atribuir pruebas funcionales a cambios que solo recibieron revisión documental.

## Caso donde Subversion sería adecuado

SVN sería adecuado para un estudio de diseño industrial o animación que gestione archivos CAD, modelos tridimensionales y recursos audiovisuales con permisos distintos por carpeta, su autorización por ruta permite limitar el acceso de proveedores externos y sus copias de trabajo permiten recuperar las carpetas necesarias sin descargar todo el historial.

El bloqueo mediante `svn lock` coordina la confirmación de cambios sobre archivos que no admiten fusión textual, la propiedad `svn:needs-lock` favorece ese procedimiento mediante archivos de solo lectura en la copia de trabajo, aunque no impide toda edición local simultánea si se alteran los permisos del sistema de archivos (Collins-Sussman et al., 2011).

Nexora comparte código Python, TypeScript, YAML y Markdown entre sus tres integrantes, el proyecto no requiere restricciones internas de lectura por carpetas, por lo que la autonomía local de Git y la continuidad con GitHub resultan más adecuadas para su contexto.

## Documentación relacionada

- [Matriz comparativa de Git y SVN](../08-matriz-git-vs-svn.md)
- [Guía de contribución](../../CONTRIBUTING.md)
- [ADR-001: control de acceso](ADR-001-control-de-acceso.md)
- [ADR-002: integridad e historial](ADR-002.md)
- [ADR-003: estilo arquitectónico](ADR-003-estilo-arquitectonico.md)
- [Issue #5: selección de Git](https://github.com/enriqueherreraec/nexora-arquitectura/issues/5)

## Referencias

Chacon, S., & Straub, B. (2014). *Pro Git* (2.ª ed.). Apress. https://git-scm.com/book/es/v2

Collins-Sussman, B., Fitzpatrick, B. W., & Pilato, C. M. (2011). *Version control with Subversion: For Subversion 1.7*. https://svnbook.red-bean.com/en/1.7/
