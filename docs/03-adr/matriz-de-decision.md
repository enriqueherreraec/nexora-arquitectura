# Matriz de decisión arquitectónica de Nexora

## Objetivo

Comparar tres alternativas para la arquitectura de Nexora y justificar la elección mediante criterios ponderados, el análisis comprende el inicio de sesión, el registro de evaluaciones, la consulta del último resultado y el envío del informe PDF.

Las puntuaciones expresan una valoración de diseño, su confirmación requiere inspección del código y pruebas de los escenarios de calidad.

## 1. Alternativas evaluadas

| ID | Alternativa | Descripción |
|---|---|---|
| A1 | Monolito modular con capas | Una API FastAPI con capacidades de acceso, evaluaciones, resultados e informes, responsabilidades internas separadas y persistencia en PostgreSQL |
| A2 | Microservicios por capacidad | Servicios con despliegue independiente, la evaluación conserva sus respuestas y resultado dentro de un mismo límite transaccional |
| A3 | Monolito con capas, eventos y outbox | La API registra de forma persistente las solicitudes de correo, un proceso separado las publica o consume y permite reintentos controlados |

**Nota.** A3 representa una alternativa evaluada, su infraestructura de eventos no forma parte de la arquitectura seleccionada.

## 2. Criterios y pesos

| ID | Criterio | Peso | Relación con Nexora |
|---|---|---:|---|
| C1 | Integridad de las evaluaciones | 25 % | Conservar evaluación, respuestas y resultado de forma coherente, según D2 y E2 |
| C2 | Seguridad y control de acceso | 20 % | Proteger los recursos del estudiante, según D1, E1 y E6 |
| C3 | Aislamiento de fallos del correo | 20 % | Mantener las operaciones principales ante fallos SMTP, según D5 y E5 |
| C4 | Desempeño | 15 % | Cumplir la meta de consulta de la última evaluación, según D3 y E3 |
| C5 | Facilidad de cambio | 10 % | Modificar reglas sin alterar el historial, según D4 y E4 |
| C6 | Simplicidad de operación | 10 % | Limitar las unidades de despliegue y la coordinación necesarias para el alcance |
| **Total** | | **100 %** | |

La integridad recibe el mayor peso por su relación con los datos persistentes y el historial, la seguridad y la continuidad ante fallos de correo reciben el siguiente nivel de prioridad, los pesos representan la valoración del caso y no porcentajes medidos de cumplimiento.

## 3. Rúbrica de puntuación

Cada alternativa recibe una puntuación entre 1 y 5 por criterio, los valores 2 y 4 corresponden a situaciones intermedias entre las descripciones, una puntuación alta representa mayor ajuste al criterio.

| Criterio | 5. Ajuste alto | 3. Ajuste intermedio | 1. Ajuste bajo |
|---|---|---|---|
| C1. Integridad | Transacción local y pocas piezas que coordinar | Coherencia viable con coordinación adicional | Sin mecanismo definido de reversión |
| C2. Seguridad | Controles comunes, verificación de propiedad y baja exposición | Políticas coordinadas en varios puntos | Controles dispersos o solo en la interfaz |
| C3. Correo | Aislamiento de proceso y entrega recuperable | Contención de errores y tiempo de espera limitado en la API | SMTP puede bloquear las demás funciones |
| C4. Desempeño | Amplio margen demostrado mediante pruebas | Diseño plausible, pendiente de prueba de E3 | Diseño o prueba incompatible con la meta |
| C5. Cambio | Reglas aisladas, historial versionado y cambios mínimos | Cambio localizado con coordinación adicional | El cambio obliga a modificar varios dominios |
| C6. Operación | Pocas unidades de backend para el alcance | Infraestructura adicional moderada | Muchas unidades y coordinación operativa |

**Nota.** En C6, una puntuación de 5 representa menor costo y carga operativa, las características previstas deben comprobarse antes de considerarlas capacidades implementadas.

### Ejemplo de aplicación: C3, aislamiento de fallos del correo

| Nivel | Pregunta que se responde | Resultado |
|---|---|---|
| 1 | ¿Qué haría fallar E5? | El fallo SMTP bloquea otras funciones o el sistema informa un envío exitoso que no ocurrió |
| 3 | ¿Cumple, pero con trabajo extra? | La API limita la espera y controla el error, el usuario debe solicitar otro envío tras la recuperación |
| 5 | ¿Cuál es la forma más simple de cumplirlo? | El procesamiento del correo queda aislado y la solicitud persistida permite reintentos sin registrar otra evaluación |

**Nota.** La pregunta del nivel 5 se interpreta respecto al cumplimiento del criterio, esa capacidad exige más infraestructura y puede reducir la puntuación de simplicidad de operación.

## 4. Matriz ponderada

| Criterio | Peso | A1. Monolito modular | A2. Microservicios | A3. Capas, eventos y outbox |
|---|---:|---:|---:|---:|
| C1. Integridad | 25 % | 5 | 4 | 4 |
| C2. Seguridad | 20 % | 4 | 3 | 4 |
| C3. Correo | 20 % | 3 | 4 | 5 |
| C4. Desempeño | 15 % | 3 | 3 | 3 |
| C5. Cambio | 10 % | 4 | 3 | 4 |
| C6. Operación | 10 % | 5 | 1 | 3 |
| **Total ponderado sobre 5** | **100 %** | **4,00** | **3,25** | **3,95** |
| **Orden de preferencia** | | **1.º** | **3.º** | **2.º** |

## 5. Cálculo de los totales

El total corresponde a la suma del peso de cada criterio multiplicado por su puntuación, con el peso expresado como proporción.

    Total = Σ [(peso porcentual × puntuación) / 100]

| Alternativa | Cálculo | Total |
|---|---|---:|
| A1 | (25×5 + 20×4 + 20×3 + 15×3 + 10×4 + 10×5) / 100 | 4,00 |
| A2 | (25×4 + 20×3 + 20×4 + 15×3 + 10×3 + 10×1) / 100 | 3,25 |
| A3 | (25×4 + 20×4 + 20×5 + 15×3 + 10×4 + 10×3) / 100 | 3,95 |

## 6. Justificación de las puntuaciones

Las justificaciones se basan en la estructura definida para cada alternativa y en sus mecanismos previstos, no constituyen resultados de pruebas ni una verificación del código existente.

| Criterio | A1. Monolito modular | A2. Microservicios | A3. Capas, eventos y outbox |
|---|---|---|---|
| C1. Integridad | **5**, evaluación, respuestas y resultado comparten una transacción local | **4**, el agregado de evaluación conserva su transacción, las relaciones entre servicios requieren coordinación | **4**, el registro mantiene integridad local, la publicación y el consumo exigen controlar duplicados y estados |
| C2. Seguridad | **4**, la API concentra controles, falta verificar su aplicación completa | **3**, las políticas deben mantenerse coherentes en varios servicios | **4**, conserva los controles de la API y exige proteger el proceso de correo |
| C3. Correo | **3**, contempla errores controlados y espera limitada, carece de recuperación persistente | **4**, el servicio separado reduce el efecto del fallo, la entrega recuperable no queda definida | **5**, la outbox y el proceso separado permiten conservar solicitudes y aplicar reintentos |
| C4. Desempeño | **3**, diseño plausible sin medición de E3 | **3**, no existe evidencia de que las llamadas entre servicios cumplan mejor la meta | **3**, separar el correo no demuestra por sí solo el desempeño de EP3 |
| C5. Cambio | **4**, separa reglas y conserva versiones, falta demostrar el alcance real del cambio | **3**, permite cambios por servicio, pero puede exigir ajustes de contratos y coordinación | **4**, separa el correo y las reglas, con contratos de eventos que deben mantenerse |
| C6. Operación | **5**, una unidad de backend para el alcance analizado | **1**, múltiples servicios incrementan despliegues, configuración y diagnóstico | **3**, añade procesamiento separado y mecanismos de publicación o consumo |

**Nota.** La puntuación de C6 compara las unidades de backend y su coordinación, las necesidades comunes de interfaz y base de datos no desaparecen en ninguna alternativa.

## 7. Resultado de la comparación

A1 obtiene 4,00 y ocupa el primer lugar con los pesos definidos, su elección prioriza la integridad mediante una transacción local y la menor carga operativa para los cuatro endpoints.

A3 obtiene 3,95 y ofrece mejores mecanismos para recuperar solicitudes de correo, su infraestructura adicional reduce la puntuación de operación, la diferencia de 0,05 frente a A1 es pequeña y exige revisar la decisión ante cambios de prioridades o evidencias.

A2 obtiene 3,25, la independencia de servicios aporta aislamiento, pero exige más coordinación y unidades operativas para el alcance del caso.

## 8. Análisis de sensibilidad

Se modifica el peso del correo del 20 % al 30 % y el de operación del 10 % al 0 %, los demás pesos y todas las puntuaciones permanecen iguales.

| Criterio | Peso original | Peso de sensibilidad |
|---|---:|---:|
| C1. Integridad | 25 % | 25 % |
| C2. Seguridad | 20 % | 20 % |
| C3. Correo | 20 % | 30 % |
| C4. Desempeño | 15 % | 15 % |
| C5. Cambio | 10 % | 10 % |
| C6. Operación | 10 % | 0 % |
| **Total** | **100 %** | **100 %** |

### Resultado con los pesos modificados

| Alternativa | Total original | Total de sensibilidad | Orden con sensibilidad |
|---|---:|---:|---:|
| A1. Monolito modular | 4,00 | 3,80 | 2.º |
| A2. Microservicios | 3,25 | 3,55 | 3.º |
| A3. Capas, eventos y outbox | 3,95 | 4,15 | 1.º |

**Nota.** El peso de 0 % en operación constituye un supuesto extremo para explorar la sensibilidad, no representa los pesos adoptados para la decisión.

El cambio favorece a A3 porque aumenta la importancia de la recuperación del correo y elimina la penalización por complejidad operativa, el resultado confirma que la selección depende de las prioridades y no de una superioridad universal de A1.

## 9. Decisión y condiciones de revisión

Se selecciona A1, monolito modular con capas, la decisión se registra en ADR-003 y se representa en la vista C4 de contenedores.

La decisión debe revisarse si E5 no se cumple con los controles previstos, si el proyecto exige conservar solicitudes de correo para reintentos automáticos o si existen evidencias de la necesidad de despliegue y escalado independientes.

## 10. Evidencias pendientes

| Aspecto | Evidencia requerida |
|---|---|
| Integridad | Ejecución de E2 e inspección de la transacción |
| Seguridad | Ejecución de E1 y E6, con comprobaciones de autorización adicionales |
| Correo | Ejecución de E5 y revisión de tiempos de espera y tratamiento de errores |
| Desempeño | Ejecución de E3 en el entorno definido |
| Cambio | Ejecución de E4 y revisión de diferencias de código |
| Operación | Inventario de unidades de despliegue, configuración y dependencias |

Las puntuaciones deben actualizarse si las evidencias contradicen las capacidades previstas, cualquier modificación debe conservar su justificación y recalcular los totales.

## Documentación relacionada

- [Contexto, drivers y escenarios iniciales](../01-contexto-y-drivers/contexto-y-drivers.md)
- [ADR-001: control de acceso](ADR-001-control-de-acceso.md)
- [ADR-002: integridad e historial](ADR-002.md)
- [Decisiones arquitectónicas, incluido ADR-003](./)
- [C4 nivel 2: contenedores](../02-vistas-c4/nivel2.md)
## 11. Documentos relacionados

- [Contexto y drivers](../01-contexto-y-drivers/contexto-y-drivers.md)
- [Escenarios de calidad](../01-contexto-y-drivers/escenarios-de-calidad.md)
- [ADR-003: estilo arquitectónico](ADR-003-estilo-arquitectonico.md)
