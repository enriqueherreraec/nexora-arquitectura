# ADR-003. Monolito modular con capas para Nexora

## Estado

Propuesta seleccionada en el dossier, pendiente de verificar en el código y validar mediante pruebas.

## Contexto

Nexora requiere autenticar al estudiante, registrar su evaluación, consultar el resultado y enviar un informe PDF por correo, el alcance académico comprende cuatro endpoints y conserva React, FastAPI y PostgreSQL como base tecnológica.

La estructura debe proteger los recursos del estudiante, conservar la integridad de las evaluaciones, permitir cambios de reglas y limitar el efecto de los fallos del correo, la comparación utiliza seis criterios con pesos definidos en la matriz de decisión.

## Decisión

Seleccionar la alternativa A1, monolito modular con capas, mantener las capacidades de acceso, evaluaciones, resultados e informes dentro de una misma API FastAPI, con responsabilidades separadas para solicitudes, lógica de aplicación, reglas y acceso a datos e integraciones.

La aplicación React consume la API, PostgreSQL conserva los datos y ReportLab genera el PDF dentro del backend, Gmail SMTP permanece como servicio externo.

El diseño contempla tiempos de espera limitados y errores controlados para el correo, no incorpora una cola persistente, un broker ni un consumidor independiente.

## Alternativas consideradas

| Alternativa | Característica principal | Total ponderado |
|---|---|---:|
| A1. Monolito modular con capas | Una API con responsabilidades internas separadas y transacciones locales | 4,00 |
| A2. Microservicios por capacidad | Servicios independientes con mayor coordinación operativa | 3,25 |
| A3. Capas con eventos y outbox | Registro persistente de solicitudes de correo y procesamiento separado con reintentos | 3,95 |

**Nota.** Las puntuaciones corresponden a una valoración de diseño sobre 5 y no representan resultados de pruebas.

## Justificación

A1 obtiene la mayor puntuación con los pesos del caso y permite conservar una transacción local para la evaluación, sus respuestas y su resultado, su menor cantidad de unidades de backend reduce la carga operativa frente a las alternativas evaluadas.

La diferencia de 0,05 respecto a A3 es pequeña y no demuestra superioridad general, la elección depende del alcance actual y de la importancia asignada a la simplicidad de operación.

El análisis de sensibilidad eleva el peso del correo del 20 % al 30 % y reduce el de operación del 10 % al 0 %, bajo ese supuesto A3 obtiene 4,15, A1 obtiene 3,80 y A2 obtiene 3,55, ese cambio identifica una condición para revisar la decisión y no sustituye los pesos originales.

## Consecuencias

| Beneficios | Costos y compromisos |
|---|---|
| Conservar transacciones locales en PostgreSQL | Mantener límites claros entre las responsabilidades internas |
| Compartir controles de acceso en la API | El backend comparte despliegue y recursos |
| Localizar cambios en las reglas de evaluación | Evitar dependencias que extiendan cambios a otros módulos |
| Reducir la carga operativa inicial | El correo carece de entrega recuperable automática en el diseño seleccionado |

Los tiempos de espera y el tratamiento de errores no garantizan por sí solos el aislamiento del correo, el cumplimiento de E5 requiere pruebas sobre la API y su configuración de ejecución.

## Validación

| Escenario | Aspecto que verifica |
|---|---|
| E1 | Rechazo de solicitudes de informes ajenos |
| E2 | Reversión del registro ante fallos de persistencia |
| E3 | Desempeño de la consulta de la última evaluación |
| E4 | Cambio localizado de reglas y conservación del historial |
| E5 | Continuidad de EP1–EP3 durante un fallo SMTP |
| E6 | Rechazo de credenciales inválidas sin emitir tokens válidos |

**Nota.** Las pruebas permanecen pendientes, los criterios completos se conservan en el contexto y drivers y en ADR-001 para E6.

## Condiciones para revisar la decisión

- Incumplimiento de E5 pese a los controles de espera y errores.
- Necesidad de conservar solicitudes de correo y reintentar su entrega automáticamente.
- Evidencia de que una capacidad requiere escalado o despliegue independiente.
- Cambios en los pesos o restricciones que alteren la comparación de alternativas.

## Documentación relacionada

- [Matriz de decisión](matriz-de-decision.md)
- [ADR-001: control de acceso](ADR-001-control-de-acceso.md)
- [ADR-002: integridad e historial](ADR-002.md)
- [Contexto, drivers y escenarios iniciales](../01-contexto-y-drivers/contexto-y-drivers.md)
- [C4 nivel 2: contenedores](../02-vistas-c4/nivel2.md)
