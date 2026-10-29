# Guía de Contribución de Nexora

Este documento establece las directrices de colaboración, desarrollo y control de calidad para el proyecto Nexora. Estas pautas favorecen la consistencia del código, la trazabilidad del historial y la estabilidad de la arquitectura.

## 1. Flujo de Trabajo (GitHub Flow Adaptado)

Nexora adopta el modelo GitHub Flow adaptado a las necesidades del equipo:

1. **Rama principal (`main`):** Representa el estado estable y desplegable del proyecto. Todo cambio integrado en `main` debe superar las validaciones técnicas y la revisión por pares.
2. **Ciclo de vida de los cambios:** Ningún cambio se desarrolla directamente sobre `main`. Cada modificación se implementa en una rama corta creada a partir de la versión más reciente de `main`.

## 2. Gestión de Tareas y Ramas

El trabajo en el repositorio respeta la relación directa entre requerimientos y ramas:

- **Un issue por tarea:** Toda actividad debe contar con un issue previo en GitHub que detalle su alcance, criterios de aceptación y resultados previstos.
- **Ramas cortas:** Cada rama aborda un único cambio atómico. Su vida útil es breve y concluye con la integración del Pull Request.
- **Nomenclatura de ramas:** Los nombres de rama deben iniciar con un prefijo según la naturaleza del cambio, seguido de una descripción breve en minúsculas separada por guiones:
  - `docs/`: Documentación técnica, especificaciones o guías (ejemplo: `docs/guia-contribucion`).
  - `feat/`: Nuevas funcionalidades o componentes del sistema (ejemplo: `feat/autenticacion-jwt`).
  - `fix/`: Corrección de defectos, fallos o inconsistencias (ejemplo: `fix/error-validacion-esquema`).
  - `test/`: Adición o ajuste de pruebas automatizadas (ejemplo: `test/cobertura-casos-uso`).

## 3. Estándar de Confirmaciones (Commits)

Los mensajes de confirmación siguen la especificación de Commits Convencionales:

- **Estructura:** El alcance es opcional. Emplee cualquiera de estos dos formatos:
  - `tipo: descripción`
  - `tipo(alcance): descripción`
- **Tipos permitidos:** `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `style`, `perf`.
- **Atomicidad y coherencia:** Cada commit debe agrupar una sola unidad lógica de cambio. Evite commits masivos que mezclen propósitos dispares.
- **Idioma y tono:** Redacte los mensajes en español o en inglés según la convención del proyecto, con claridad y sin redundancias.

## 4. Solicitudes de Integración (Pull Requests)

La integración hacia `main` se realiza mediante Pull Requests (PR):

- **Destino:** La rama objetivo siempre es `main`.
- **Vinculación con el issue:** La descripción del PR debe incluir la palabra clave `Closes #n` (donde `n` es el número del issue) para asegurar el cierre automático del requerimiento tras el merge.
- **Uso de la plantilla:** Complete todas las secciones de la plantilla oficial de Pull Request.

## 5. Proceso de Revisión por Pares

La calidad del código es una responsabilidad colectiva:

- **Revisión sustantiva:** La revisión no es un trámite superficial; evalúa diseño, legibilidad, seguridad, cobertura de pruebas y cumplimiento de los requerimientos.
- **Aprobación mínima:** Todo PR requiere al menos una aprobación formal de otro integrante del equipo antes de su integración.
- **Resolución de observaciones:** El autor del PR debe atender cada comentario u observación. Toda conversación debe quedar resuelta formalmente en la plataforma antes del merge.
- **Nueva revisión ante cambios posteriores:** Si el autor agrega nuevos commits tras recibir una aprobación, la aprobación previa queda sin efecto y se requiere una nueva revisión formal por parte del revisor.

## 6. Políticas de Seguridad de la Rama Principal

Para proteger la integridad del repositorio:

- **Prohibición de commits directos:** Nadie puede realizar commits directos sobre la rama `main`.
- **Prohibición de push forzado:** Queda estrictamente prohibido el uso de `git push --force` o `git push -f` en `main` y en ramas compartidas.
- **Preservación del historial y etiquetas:** El historial de Git y las etiquetas existentes (como `v0.2.0`) son inmutables. No elimine ni modifique etiquetas previas.

## 7. Validación Técnica Proporcional y Veracidad

Las validaciones aportan evidencia sobre los aspectos comprobados:

- **Proporcionalidad:** Ejecute las verificaciones adecuadas a la naturaleza del cambio (análisis estático, linters, formato de código o pruebas unitarias).
- **Principio de veracidad:** Prohibido afirmar que se ejecutaron pruebas o comandos que no se realizaron en la práctica. Registre únicamente los resultados reales y comprobables en la descripción del PR.

## 8. Protección de Credenciales y Secretos

La seguridad de la información es prioritaria:

- **Archivos sensibles:** Nunca suba contraseñas, tokens de acceso, llaves privadas ni archivos `.env` reales al repositorio.
- **Plantillas públicas:** Utilice exclusivamente archivos de ejemplo con valores ficticios (como `.env.example`).
