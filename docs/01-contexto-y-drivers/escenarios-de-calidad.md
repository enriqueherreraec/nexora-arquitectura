# Escenarios de calidad de Nexora

## 1. Propósito

Los escenarios establecen condiciones verificables para evaluar los drivers arquitectónicos de Nexora, cada escenario contiene fuente del estímulo, estímulo, entorno, artefacto, respuesta y medida de respuesta.

Las cifras representan objetivos propuestos para el proyecto, su cumplimiento requiere pruebas y evidencia, no corresponden a capacidades ya demostradas.

## 2. Priorización

| Código | Escenario | Atributo | Driver | Prioridad |
|---|---|---|---|---|
| E1 | Rechazar modificaciones del catálogo sin permiso | Seguridad | D1 | Alta |
| E2 | Conservar una evaluación completa ante fallos de persistencia | Fiabilidad | D2 | Alta |
| E3 | Consultar el catálogo bajo carga concurrente | Eficiencia de desempeño | D3 | Alta |
| E4 | Modificar las reglas vocacionales con impacto limitado | Mantenibilidad | D4 | Alta |
| E5 | Mantener las consultas disponibles ante una falla del correo | Disponibilidad | D5 | Alta |
| E6 | Completar el cuestionario desde un dispositivo móvil | Capacidad de interacción | D6 | Media |

## 3. E1 — Rechazar modificaciones del catálogo sin permiso

| Parte | Definición |
|---|---|
| **Fuente del estímulo** | Estudiante autenticado |
| **Estímulo** | Enviar una solicitud directa a la API para modificar una carrera |
| **Entorno** | Operación normal, con una cuenta de estudiante y un token válido |
| **Artefacto** | Endpoint de mantenimiento de carreras en FastAPI |
| **Respuesta** | Rechazar la operación por falta de permisos y conservar el registro existente |
| **Medida de respuesta** | Rechazar las 100 solicitudes de prueba con HTTP 403 y producir 0 modificaciones en PostgreSQL |

**Driver relacionado:** D1 — Impedir operaciones sin permiso y acceso a resultados de otras cuentas.

**Verificación prevista:** ejecutar las solicitudes con una cuenta de estudiante, comparar el registro antes y después de la prueba y conservar las respuestas HTTP como evidencia.

## 4. E2 — Conservar una evaluación completa ante fallos de persistencia

| Parte | Definición |
|---|---|
| **Fuente del estímulo** | Herramienta de prueba con inyección de fallos |
| **Estímulo** | Interrumpir la operación de persistencia entre la escritura de las respuestas y la escritura del resultado |
| **Entorno** | Ambiente de pruebas con PostgreSQL y una evaluación de 20 respuestas válidas |
| **Artefacto** | Operación de registro de evaluaciones de la API y sus tablas relacionadas |
| **Respuesta** | Revertir la operación incompleta, informar el fallo y conservar las evaluaciones anteriores |
| **Medida de respuesta** | En 30 ejecuciones con fallo inducido, conservar 0 evaluaciones parciales y producir 0 cambios en las evaluaciones anteriores |

**Driver relacionado:** D2 — Conservar respuestas y resultados coherentes ante fallos o cambios del cuestionario.

**Verificación prevista:** provocar el fallo en el punto definido, consultar las tablas relacionadas y comprobar que cada operación mantiene la atomicidad.

## 5. E3 — Consultar el catálogo bajo carga concurrente

| Parte | Definición |
|---|---|
| **Fuente del estímulo** | 100 usuarios virtuales concurrentes |
| **Estímulo** | Consultar páginas del catálogo y aplicar filtros de universidad, carrera y modalidad |
| **Entorno** | Ambiente de pruebas con 2 vCPU, 4 GB de RAM y una copia de prueba del catálogo de al menos 1.200 ofertas, tras dos minutos de calentamiento |
| **Artefacto** | Endpoints de consulta del catálogo en FastAPI y consultas asociadas en PostgreSQL |
| **Respuesta** | Devolver resultados correctos mediante páginas de hasta 20 registros |
| **Medida de respuesta** | Durante 10 minutos de carga sostenida, obtener un percentil 95 de respuesta igual o inferior a 2 segundos y una tasa de errores técnicos inferior al 1 % |

**Driver relacionado:** D3 — Mantener tiempos de respuesta aceptables bajo una carga definida.

**Verificación prevista:** ejecutar una prueba de carga con una pausa de dos segundos entre solicitudes por usuario virtual, medir el tiempo desde el cliente de prueba y registrar recursos, volumen de datos y resultados.

**Condición de interpretación:** el objetivo de 100 usuarios concurrentes no constituye una capacidad demostrada hasta ejecutar la prueba en el ambiente descrito.

## 6. E4 — Modificar las reglas vocacionales con impacto limitado

| Parte | Definición |
|---|---|
| **Fuente del estímulo** | Responsable funcional del proyecto |
| **Estímulo** | Solicitar el cambio de ponderación de una categoría vocacional para evaluaciones nuevas |
| **Entorno** | Mantenimiento de una versión estable, con reglas documentadas y pruebas de regresión disponibles |
| **Artefacto** | Módulo de evaluación vocacional del backend |
| **Respuesta** | Aplicar la nueva ponderación, identificar la versión de las reglas y conservar el significado de los resultados históricos |
| **Medida de respuesta** | Completar el cambio y su validación en un máximo de 4 horas de trabajo, modificar como máximo 3 archivos de producción y aprobar el 100 % de las pruebas de regresión acordadas |

**Driver relacionado:** D4 — Permitir cambios en las reglas vocacionales con impacto limitado y verificable.

**Verificación prevista:** registrar el tiempo desde el inicio de la modificación hasta su validación, revisar los archivos modificados y comparar resultados históricos antes y después del cambio.

**Criterio de conteo:** los archivos de pruebas y documentación no forman parte del límite de archivos de producción.

## 7. E5 — Mantener las consultas disponibles ante una falla del correo

| Parte | Definición |
|---|---|
| **Fuente del estímulo** | Servicio externo Gmail SMTP |
| **Estímulo** | Rechazar conexiones o no responder a las solicitudes de envío |
| **Entorno** | Prueba de 10 minutos con la API y PostgreSQL operativos, 10 usuarios virtuales consultan resultados mientras se ejecutan 20 intentos de envío |
| **Artefacto** | API de Nexora e integración con el servicio de correo |
| **Respuesta** | Informar el fallo de envío sin detener la API ni impedir la consulta de resultados |
| **Medida de respuesta** | Completar correctamente al menos el 99 % de las consultas válidas y devolver una respuesta controlada en los 20 intentos de envío, sin terminar el proceso de la API |

**Driver relacionado:** D5 — Mantener disponibles las consultas y los resultados ante una falla del servicio de correo.

**Verificación prevista:** simular la indisponibilidad de SMTP, ejecutar consultas durante los intentos de envío y registrar respuestas y continuidad del proceso.

**Límite de interpretación:** este escenario evalúa la disponibilidad de las consultas, la entrega efectiva del correo requiere una prueba independiente.

## 8. E6 — Completar el cuestionario desde un dispositivo móvil

| Parte | Definición |
|---|---|
| **Fuente del estímulo** | Diez participantes representativos del perfil estudiante |
| **Estímulo** | Responder por primera vez el cuestionario vocacional |
| **Entorno** | Navegador móvil con ancho de pantalla de 360 píxeles CSS, conexión estable y sin asistencia del evaluador |
| **Artefacto** | Interfaz del cuestionario en React y Material UI |
| **Respuesta** | Presentar las 20 preguntas en cuatro bloques de cinco, mostrar el progreso y conservar las respuestas al avanzar o retroceder |
| **Medida de respuesta** | Al menos 9 de los 10 participantes completan el cuestionario y llegan al resultado en un máximo de 8 minutos por participante, sin asistencia ni desplazamiento horizontal |

**Driver relacionado:** D6 — Facilitar la comprensión y finalización del cuestionario desde distintos dispositivos.

**Verificación prevista:** observar las sesiones, medir el tiempo desde la primera pregunta hasta la presentación del resultado y registrar finalización, solicitudes de ayuda y problemas de navegación.

## 9. Trazabilidad

| Escenario | Driver | Requisitos relacionados | Elementos de la vista C4 nivel 2 |
|---|---|---|---|
| E1 | D1 | RF-08, RF-09 y RF-10 | Aplicación web, API FastAPI y PostgreSQL |
| E2 | D2 | RF-03, RF-04 y RF-05 | API FastAPI y PostgreSQL |
| E3 | D3 | RF-02 | API FastAPI y PostgreSQL |
| E4 | D4 | RF-04 y RF-05 | API FastAPI y PostgreSQL |
| E5 | D5 | RF-05 y RF-07 | API FastAPI, PostgreSQL y Gmail SMTP |
| E6 | D6 | RF-03 y RF-04 | Aplicación web y API FastAPI |

## 10. Estado de verificación

Los seis escenarios tienen estado pendiente de ejecución, los resultados reales deben incorporar fecha, versión del sistema, ambiente, procedimiento y evidencia, una prueba que no alcanza el objetivo debe registrar la diferencia y su efecto sobre la decisión arquitectónica.

## 11. Documentos relacionados

- [Contexto y drivers](contexto-y-drivers.md)
- [C4 nivel 1](../02-vistas-c4/nivel1.md)
- [C4 nivel 2](../02-vistas-c4/nivel2.md)
- [Matriz de decisión](../03-adr/matriz-de-decision.md)