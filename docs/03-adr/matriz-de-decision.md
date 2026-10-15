# Matriz de decisión arquitectónica de Nexora

## 1. Objetivo

Comparar dos alternativas de organización del backend de Nexora frente a los escenarios de calidad, la evaluación considera la implementación existente con React, FastAPI y PostgreSQL, sus necesidades de evolución y el costo operativo de cada alternativa.

## 2. Alternativas

| Alternativa | Descripción |
|---|---|
| **A — Monolito modular con capas** | Conservar una API FastAPI desplegable como una unidad, organizar el backend en módulos de acceso, catálogo, evaluación e informes, separar presentación de la API, lógica de aplicación y persistencia, mantener React como aplicación web y PostgreSQL como base de datos |
| **B — Microservicios por capacidad** | Separar acceso, catálogo, evaluación e informes en servicios desplegables de forma independiente, definir contratos entre servicios y propiedad de los datos, incorporar comunicación remota y mecanismos de observación y recuperación |

La alternativa A no significa colocar todo el código en un archivo, su modularidad exige límites de responsabilidad, la alternativa B requiere cambios sobre la estructura y la operación existentes.

## 3. Método de evaluación

Cada escenario recibe un peso según su prioridad para Nexora, la suma de los pesos es 100 %, las puntuaciones representan el ajuste estimado de cada alternativa al escenario y al contexto del proyecto.

| Puntuación | Interpretación |
|---|---|
| 1 | Ajuste muy bajo, con cambios o riesgos elevados |
| 2 | Ajuste bajo, requiere esfuerzo considerable |
| 3 | Ajuste aceptable, con condiciones relevantes |
| 4 | Ajuste alto, con medidas concretas y esfuerzo razonable |
| 5 | Ajuste muy alto para el contexto actual |

**Fórmula:** aporte ponderado = peso porcentual × puntuación / 100.

Las puntuaciones constituyen un juicio arquitectónico inicial, no representan resultados de pruebas ni demuestran el cumplimiento de los escenarios.

## 4. Matriz ponderada

| Escenario | Driver | Peso | A: puntuación | A: aporte | B: puntuación | B: aporte |
|---|---|---:|---:|---:|---:|---:|
| E1 — Rechazar operaciones sin permiso | D1 | 25 % | 4 | 1,00 | 3 | 0,75 |
| E2 — Evitar evaluaciones parciales | D2 | 25 % | 5 | 1,25 | 3 | 0,75 |
| E3 — Consultar el catálogo bajo carga | D3 | 15 % | 4 | 0,60 | 4 | 0,60 |
| E4 — Modificar reglas con impacto limitado | D4 | 15 % | 4 | 0,60 | 3 | 0,45 |
| E5 — Conservar consultas ante fallos del correo | D5 | 15 % | 3 | 0,45 | 4 | 0,60 |
| E6 — Completar el cuestionario desde móvil | D6 | 5 % | 4 | 0,20 | 4 | 0,20 |
| **Total** | | **100 %** | | **4,10 / 5** | | **3,35 / 5** |

## 5. Justificación de las puntuaciones

| Escenario | Alternativa A | Alternativa B |
|---|---|---|
| **E1** | Una API permite aplicar una política común de autorización, requiere verificar roles y propiedad de recursos en cada operación | La separación exige mantener controles consistentes entre servicios y proteger también sus comunicaciones |
| **E2** | Una transacción en PostgreSQL permite registrar respuestas y resultados de forma atómica dentro del módulo de evaluación | La atomicidad es viable si evaluación conserva la propiedad de sus datos, las operaciones entre servicios requieren coordinación adicional |
| **E3** | Las consultas paginadas, los índices y la optimización permiten abordar el objetivo de carga antes de ampliar la infraestructura | El catálogo puede escalar de forma independiente, pero la comunicación y la infraestructura añaden costos, el objetivo requiere pruebas en ambas opciones |
| **E4** | Un módulo vocacional con límites claros permite concentrar el cambio y conservar contratos internos | Un servicio de evaluación puede aislar el cambio, pero exige gestionar contratos remotos y compatibilidad entre versiones |
| **E5** | El backend comparte recursos de ejecución, por eso requiere límites de espera y tratamiento de fallos para evitar que SMTP afecte las consultas | Un servicio de informes separado puede aislar mejor los fallos, siempre que las llamadas no propaguen la espera ni el error |
| **E6** | React puede presentar bloques de preguntas, validaciones y progreso, la calidad depende principalmente del diseño de la interfaz | La misma interfaz React puede cumplir el escenario, la separación del backend no aporta una ventaja directa |

## 6. Análisis de compromisos

| Aspecto | Beneficio de A | Costo o límite de A | Beneficio de B | Costo o límite de B |
|---|---|---|---|---|
| Despliegue | Conservar una unidad de backend | Un cambio requiere desplegar esa unidad | Desplegar cada servicio por separado | Mantener varios despliegues y configuraciones |
| Persistencia | Facilitar transacciones locales | Exigir disciplina para evitar acceso indebido entre módulos | Definir propiedad de datos por servicio | Resolver consistencia entre servicios cuando corresponda |
| Escalado | Ampliar inicialmente con menor complejidad | Escalar el backend completo | Escalar capacidades concretas | Operar más componentes y conexiones |
| Fallos | Reducir llamadas remotas internas | Compartir recursos del proceso | Aislar procesos por capacidad | Controlar fallos y tiempos de espera de la red |
| Evolución | Aprovechar el stack y limitar la migración | Mantener límites modulares durante los cambios | Permitir mayor independencia por servicio | Gestionar contratos y compatibilidad |

## 7. Resultado

La alternativa A obtiene 4,10 sobre 5 y la alternativa B obtiene 3,35 sobre 5, el monolito modular con capas presenta el mejor ajuste estimado para el hito actual porque aprovecha FastAPI y PostgreSQL, facilita la integridad de las evaluaciones y reduce los cambios necesarios sobre la solución existente.

La alternativa B ofrece ventajas de aislamiento y escalado independiente, su costo de distribución no se justifica todavía con evidencia de carga, necesidades de despliegue independiente o límites operativos del backend actual.

## 8. Condiciones para seleccionar A

- Definir módulos con responsabilidades y dependencias explícitas
- Centralizar la autorización de operaciones protegidas
- Registrar cada evaluación completa dentro de una transacción
- Conservar la versión del cuestionario y de sus reglas
- Definir límites de espera y tratamiento de errores para SMTP
- Ejecutar las pruebas de calidad antes de afirmar cumplimiento

La selección del estilo no demuestra que estas condiciones ya estén implementadas.

## 9. Sensibilidad de la decisión

La ventaja de A es de 0,75 puntos, una variación aislada de un punto en la puntuación de un escenario modifica el total de una alternativa como máximo en 0,25 puntos, esa variación no invierte por sí sola el resultado.

La revisión de varios supuestos o un cambio de prioridades sí puede modificar la selección, las puntuaciones deben actualizarse ante evidencia nueva.

## 10. Criterios de revisión futura

La decisión requiere una nueva evaluación si las pruebas muestran que el backend completo limita una capacidad concreta pese a su optimización, si aparecen equipos con ciclos de despliegue independientes o si el envío de informes afecta la disponibilidad de las consultas y exige aislamiento de proceso.

## 11. Documentos relacionados

- [Contexto y drivers](../01-contexto-y-drivers/contexto-y-drivers.md)
- [Escenarios de calidad](../01-contexto-y-drivers/escenarios-de-calidad.md)
- [ADR-003: estilo arquitectónico](ADR-003-estilo-arquitectonico.md)