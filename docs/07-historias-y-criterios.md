# Historias de Usuario y Criterios de Aceptación de Nexora

## 1. Introducción y Fundamento Normativo

Este documento formaliza los requisitos funcionales y de calidad para el alcance analizado de Nexora, correspondiente a los cuatro endpoints principales del sistema web de orientación vocacional:
- `POST /api/v1/auth/login` (Autenticación e inicio de sesión)
- `POST /api/v1/evaluaciones` (Registro transaccional de respuestas y evaluación vocacional)
- `GET /api/v1/evaluaciones/ultima` (Consulta de la evaluación vigente con aislamiento estricto)
- `POST /api/v1/informes/{id}/enviar-correo` (Generación de PDF y despacho vía SMTP)

La especificación adopta los principios de la norma internacional **ISO/IEC/IEEE 29148:2018** (*Requirements Engineering*), garantizando que cada requisito cumpla con las características de necesidad, no ambigüedad, verificabilidad, consistencia, completitud y trazabilidad bidireccional hacia los interesados, drivers de calidad y decisiones de arquitectura del proyecto.

---

## 2. Escenarios Originales de Calidad del Dossier (Línea Base)

Se preservan íntegros los seis escenarios originales definidos en el dossier de arquitectura base, sin renumeraciones ni adaptaciones artificiales:

| ID | Atributo | Driver | Escenario original del dossier | Medida y entorno original |
|---|---|---|---|---|
| **E1** | Seguridad | D1 (Control de acceso) | Un estudiante autenticado envía una solicitud directa a la API para modificar una carrera del catálogo; la API comprueba permisos de rol y deniega la operación. | 100 solicitudes de prueba rechazadas con **HTTP 403 Forbidden** y **0 modificaciones** en PostgreSQL. |
| **E2** | Fiabilidad e integridad | D2 (Integridad transaccional) | Una prueba interrumpe la persistencia entre la escritura de las respuestas y la del resultado; la API revierte la operación y conserva las evaluaciones históricas. | En **30 ejecuciones con fallo inducido**, conservar **0 evaluaciones parciales** y **0 alteraciones** en evaluaciones históricas. |
| **E3** | Eficiencia de desempeño | D3 (Desempeño) | 100 usuarios virtuales concurrentes consultan el catálogo/evaluaciones con filtros sobre al menos 1.200 ofertas tras 2 minutos de calentamiento en entorno de 2 vCPU y 4 GB RAM. | Durante **10 minutos de carga sostenida**, percentil 95 de latencia **≤ 2 segundos** y errores técnicos **< 1 %**. |
| **E4** | Mantenibilidad | D4 (Mantenibilidad) | El responsable funcional solicita un cambio de ponderación vocacional para evaluaciones nuevas; el cambio se localiza e identifica la versión de reglas. | Tiempo de implementación y validación **≤ 4 horas**, cambios en **≤ 3 archivos de producción** y **100 % de pruebas de regresión** acordadas aprobadas. |
| **E5** | Disponibilidad y continuidad | D5 (Continuidad ante fallos SMTP) | El servicio Gmail SMTP no responde o rechaza conexiones durante 10 minutos; la API informa el fallo sin terminar el proceso mientras 10 usuarios virtuales consultan. | Completar al menos el **99 % de las consultas válidas** (EP1–EP3) y devolver **20 respuestas controladas** en los 20 intentos de envío, sin caída de la API. |
| **E6** | Capacidad de interacción (Usabilidad) | D6 (Interacción en dispositivos) | Diez participantes representativos de perfil estudiante responden el cuestionario por primera vez desde un navegador móvil (360 px CSS) sin asistencia. | Al menos **9 de los 10 participantes** completan el cuestionario y obtienen resultado en un máximo de **8 minutos**, sin asistencia ni desplazamiento horizontal. |

---

## 3. Historias de Usuario (HU) y Criterios en Gherkin

### HU-01: Autenticación e inicio de sesión seguro del estudiante

- **Formato:**
  - **Como:** Estudiante registrado en el sistema Nexora.
  - **Quiero:** Iniciar sesión introduciendo mi correo electrónico y contraseña.
  - **Para:** Obtener un token de acceso seguro que me permita responder el test vocacional, consultar mis evaluaciones previas y mantener la privacidad de mis resultados frente a otros usuarios.
- **Interesados relacionados:** S1 (Estudiante: privacidad de sus datos y acceso seguro), S2 (Administrador: control de acceso y prevención de uso no autorizado).
- **Drivers arquitectónicos:** D1 (Seguridad: restringir resultados e informes a su propietario), D5 (Continuidad: acceso operativo aún ante contingencias de correo).
- **Relación con escenarios:** Apoya la disponibilidad de autenticación requerida durante contingencias (E5) e incorpora la verificación específica de credenciales seguras propuesta en ADR-001.
- **Decisión arquitectónica:** ADR-001 (Control de acceso centralizado en FastAPI mediante JWT Bearer y hash seguro).

#### Criterios de aceptación (Gherkin en español)

```gherkin
Característica: Autenticación de usuarios mediante credenciales seguras

  Escenario: Inicio de sesión exitoso con credenciales válidas (Caso satisfactorio)
    Dado que existe un estudiante registrado con el correo "estudiante.demo@ejemplo.edu.ec" y contraseña "ClaveSegura2026."
    Y la cuenta se encuentra en estado activa
    Cuando el estudiante envía una solicitud HTTP POST a "/api/v1/auth/login" con las credenciales correspondientes
    Entonces la API responde con un código de estado HTTP 200 OK
    Y el cuerpo de la respuesta contiene un token JWT en el campo "access_token"
    Y el campo "token_type" tiene el valor "bearer"
    Y el campo "expires_in_seconds" indica una vigencia de 7200 segundos
    Y el objeto "usuario" contiene el identificador, correo y rol "estudiante" correspondiente

  Escenario: Rechazo de inicio de sesión por contraseña incorrecta (Verificación de credenciales ADR-001)
    Dado que existe un usuario registrado con el correo "estudiante.demo@ejemplo.edu.ec"
    Cuando el usuario envía una solicitud HTTP POST a "/api/v1/auth/login" con una contraseña incorrecta
    Entonces la API rechaza la solicitud con un código de estado HTTP 401 Unauthorized
    Y la cabecera "WWW-Authenticate" contiene el valor "Bearer"
    Y el cuerpo de la respuesta contiene el mensaje "Credenciales incorrectas. Verifique su correo y contraseña."
    Y no se emite ningún token de acceso ni se establece sesión

  Escenario: Rechazo de acceso a cuenta desactivada (Caso de error)
    Dado que existe un usuario con correo "inactivo.demo@ejemplo.edu.ec" cuya cuenta tiene el atributo "activo" en falso
    Cuando el usuario intenta iniciar sesión mediante HTTP POST a "/api/v1/auth/login" con su clave correcta
    Entonces la API deniega la solicitud con un código de estado HTTP 403 Forbidden
    Y el mensaje de detalle indica "Su cuenta se encuentra inactiva. Contacte al administrador del sistema."

  Escenario: Validación sintáctica de campos obligatorios ausentes (Caso de error)
    Dado que un cliente realiza una solicitud HTTP POST a "/api/v1/auth/login"
    Cuando el cuerpo de la solicitud no incluye el campo "password" o el formato del "email" es inválido
    Entonces la API responde con un código de estado HTTP 422 Unprocessable Entity
    Y el cuerpo detalla la ubicación y naturaleza del error de validación
```

---

### HU-02: Registro transaccional de evaluación vocacional de 20 preguntas

- **Formato:**
  - **Como:** Estudiante debidamente autenticado en la plataforma.
  - **Quiero:** Enviar las 20 respuestas de mi cuestionario vocacional en escala Likert (0 a 4 puntos).
  - **Para:** Obtener el cálculo de afinidad en las 10 áreas vocacionales, recomendaciones de carreras y registrar mi intento de forma permanente en mi historial sin alterar evaluaciones anteriores.
- **Interesados relacionados:** S1 (Estudiante: obtener recomendaciones válidas y completas), S3 (Equipo de desarrollo: facilidad de mantenimiento y modularidad de reglas).
- **Drivers arquitectónicos:** D2 (Fiabilidad e integridad: conservar completas y relacionadas las respuestas y el resultado), D4 (Mantenibilidad: modificar reglas sin alterar el historial).
- **Relación con escenarios:** Cumple directamente el escenario **E2** (atomicidad de la evaluación) y preserva la versión histórica requerida por **E4**.
- **Decisiones arquitectónicas:** ADR-002 (Integridad e historial de evaluaciones mediante transacciones locales en PostgreSQL), ADR-003 (Monolito modular con capas).

#### Criterios de aceptación (Gherkin en español)

```gherkin
Característica: Registro y cálculo atómico de evaluación vocacional

  Escenario: Registro exitoso de cuestionario completo con 20 respuestas Likert (Caso satisfactorio)
    Dado que el estudiante se encuentra autenticado con un token JWT válido
    Y ha completado exactamente las 20 preguntas del cuestionario con valores enteros entre 0 y 4
    Cuando envía una solicitud HTTP POST a "/api/v1/evaluaciones" con el mapa de respuestas
    Entonces la API responde con un código de estado HTTP 201 Created
    Y el cuerpo contiene el identificador numérico generado para la evaluación
    Y se calcula la puntuación acumulada para las 10 áreas vocacionales
    Y se incluye el campo "version_cuestionario" con el valor "3.0-20preguntas"
    Y se genera un listado de carreras sugeridas ordenadas por afinidad y pertinencia geográfica
    Y la transacción se confirma de forma atómica en PostgreSQL

  Escenario: Rechazo de envío con cuestionario incompleto (Caso de error)
    Dado que el estudiante se encuentra autenticado
    Cuando envía una solicitud HTTP POST a "/api/v1/evaluaciones" conteniendo únicamente 14 respuestas
    Entonces la API rechaza la solicitud con un código de estado HTTP 400 Bad Request
    Y el detalle especifica "Cuestionario incompleto. Debe responder las 20 preguntas del test. Faltan 6 respuestas."
    Y no se registra ninguna evaluación en la base de datos

  Escenario: Reversión transaccional completa ante fallo inducido en persistencia (Comprobación de E2)
    Dado que el estudiante envía un conjunto de 20 respuestas a "/api/v1/evaluaciones"
    Cuando ocurre una interrupción o fallo forzado en la sesión de PostgreSQL durante la inserción
    Entonces la API ejecuta un ROLLBACK de la transacción de base de datos
    Y no se persiste ningún registro incompleto o desvinculado en la base de datos
    Y el historial de evaluaciones previas del estudiante permanece 100 % inalterado

  Escenario: Detección controlada de respuestas en cero en todas las preguntas (Caso límite)
    Dado que el estudiante responde con valor 0 en las 20 preguntas del cuestionario
    Cuando envía la solicitud HTTP POST a "/api/v1/evaluaciones"
    Entonces la API responde con código HTTP 201 Created
    Y el campo "todas_cero" es verdadero (true)
    Y el mensaje de resultado indica la necesidad de explorar intereses con un orientador
    Y la lista de carreras sugeridas se retorna vacía para evitar recomendaciones engañosas
```

---

### HU-03: Consulta aislada y oportuna de la última evaluación vocacional

- **Formato:**
  - **Como:** Estudiante autenticado en Nexora.
  - **Quiero:** Consultar el resultado de mi última evaluación vocacional realizada.
  - **Para:** Conocer mi área predominante y las carreras universitarias sugeridas al reanudar mi sesión sin riesgo de visualizar datos de otros usuarios.
- **Interesados relacionados:** S1 (Estudiante: consulta ágil y privada de su diagnóstico vocacional).
- **Drivers arquitectónicos:** D1 (Seguridad y propiedad del recurso), D3 (Eficiencia de desempeño: responder oportunamente).
- **Relación con escenarios:** Apoya la capacidad de consulta evaluada bajo carga en **E3** e implementa el aislamiento de propiedad de **ADR-001**.
- **Decisiones arquitectónicas:** ADR-001 (Aislamiento de propiedad a nivel de endpoint en FastAPI), ADR-003 (Monolito modular).

#### Criterios de aceptación (Gherkin en español)

```gherkin
Característica: Consulta de última evaluación con aislamiento de cuenta

  Escenario: Consulta exitosa de la última evaluación del estudiante (Caso satisfactorio)
    Dado que el estudiante "Juan Pérez" con ID 1 tiene dos evaluaciones registradas en su historial
    Cuando envía una solicitud HTTP GET a "/api/v1/evaluaciones/ultima" con su token JWT en la cabecera
    Entonces la API responde con un código de estado HTTP 200 OK
    Y el cuerpo contiene exactamente la evaluación más reciente en base a su fecha de creación
    Y el campo "usuario_id" coincide con el ID 1 del usuario autenticado
    Y la respuesta incluye el desglose de afinidades, carreras sugeridas y recomendaciones pedagógicas

  Escenario: Consulta de última evaluación por estudiante sin historial previo (Caso límite)
    Dado que un nuevo estudiante registrado aún no ha realizado ningún test vocacional
    Cuando envía una solicitud HTTP GET a "/api/v1/evaluaciones/ultima" con su token válido
    Entonces la API responde con un código de estado HTTP 200 OK
    Y el cuerpo de la respuesta es null (o cuerpo vacío)
    Y no se genera ningún error interno en el servidor

  Escenario: Rechazo de consulta sin token de autorización (Caso de error)
    Dado que un cliente realiza una solicitud HTTP GET a "/api/v1/evaluaciones/ultima"
    Cuando la cabecera "Authorization" se encuentra ausente o contiene un token inválido
    Entonces la API rechaza la solicitud con un código de estado HTTP 401 Unauthorized
    Y no se expone ninguna información de evaluaciones

  Escenario: Aislamiento estricto entre cuentas y cero resultados ajenos (Garantía de privacidad ADR-001)
    Dado que el estudiante A (ID 1) y el estudiante B (ID 2) tienen evaluaciones registradas
    Cuando el estudiante A consulta "/api/v1/evaluaciones/ultima" utilizando su propio token
    Entonces la API filtra la consulta SQL exclusivamente por el identificador del token ("usuario_id == 1")
    Y bajo ninguna condición se entrega información de la evaluación del estudiante B
```

---

### HU-04: Despacho seguro del informe formal PDF al correo electrónico registrado

- **Formato:**
  - **Como:** Estudiante evaluado en Nexora.
  - **Quiero:** Solicitar el envío de mi informe vocacional en formato PDF a mi cuenta de correo registrada.
  - **Para:** Recibir un documento formal adjunto para conservar mis resultados y compartirlos con mis familiares y orientadores vocacionales.
- **Interesados relacionados:** S1 (Estudiante: recepción de su propio informe), S4 (Proveedor de correo: uso legítimo y prevención de abusos).
- **Drivers arquitectónicos:** D1 (Seguridad: control estricto de propiedad del recurso), D5 (Continuidad ante fallos de correo: preservar el sistema ante indisponibilidad SMTP).
- **Relación con escenarios:** Apoya la verificación de contención de errores requerida por **E5** e implementa la comprobación de propiedad de recursos de **ADR-001**.
- **Decisiones arquitectónicas:** ADR-001 (Comprobación de propiedad del recurso antes de generar el PDF o contactar al SMTP), ADR-002 (El envío no altera ni elimina evaluaciones confirmadas).

#### Criterios de aceptación (Gherkin en español)

```gherkin
Característica: Despacho del informe vocacional PDF por correo electrónico

  Escenario: Envío exitoso del informe correspondiente a la propia evaluación (Caso satisfactorio)
    Dado que el estudiante titular (ID 1) es propietario de la evaluación con ID 101
    Y el servicio de correo se encuentra operativo
    Cuando el estudiante envía una solicitud HTTP POST a "/api/v1/informes/101/enviar-correo" con su token JWT
    Entonces la API valida que la evaluación 101 pertenezca al usuario 1
    Y genera en memoria el documento PDF oficial mediante ReportLab
    Y despacha el correo electrónico con el archivo "Informe_vocacional_Nexora.pdf" adjunto hacia su correo registrado
    Y responde con un código de estado HTTP 200 OK
    Y el cuerpo contiene "status": "success" y confirma la dirección de destino

  Escenario: Rechazo de solicitud de envío de evaluación ajena (Comprobación de propiedad ADR-001)
    Dado que el estudiante A (ID 1) se encuentra autenticado
    Y la evaluación con ID 202 pertenece al estudiante B (ID 2)
    Cuando el estudiante A envía una solicitud HTTP POST a "/api/v1/informes/202/enviar-correo"
    Entonces la API comprueba la propiedad del recurso y deniega la operación
    Y responde con un código de estado HTTP 404 Not Found (o 403 Forbidden)
    Y el mensaje indica "Evaluación no encontrada o no autorizada para su cuenta."
    Y la API aborta inmediatamente el procesamiento antes de invocar a ReportLab o al servicio SMTP
    Y se comprueba que se enviaron 0 correos electrónicos

  Escenario: Tratamiento controlado de indisponibilidad del servidor SMTP (Comprobación funcional de E5)
    Dado que el estudiante solicita el envío de su propio informe mediante HTTP POST a "/api/v1/informes/101/enviar-correo"
    Cuando el servidor SMTP no responde, rechaza la conexión o se simula su indisponibilidad
    Entonces la API captura la excepción de red de forma controlada
    Y no declara un éxito falso en la respuesta
    Y retorna un código de estado HTTP 503 Service Unavailable
    Y la evaluación 101 persiste intacta en la base de datos sin cancelarse
    Y las operaciones de login (EP1) y consulta (EP3) continúan operando normalmente
```

---

## 4. Revisión de Calidad de Requisitos conforme a ISO/IEC/IEEE 29148

Se evalúan los requisitos documentados frente a las seis características de calidad exigidas por el estándar ISO/IEC/IEEE 29148:

| Característica | Justificación observable en la especificación | Estado de cumplimiento |
|---|---|:---:|
| **Necesidad (*Necessity*)** | Cada historia responde a una necesidad explícita de los participantes (S1 estudiante, S2 administrador, S4 proveedor) y se vincula a los drivers de seguridad (D1), integridad (D2), desempeño (D3), mantenibilidad (D4) y continuidad (D5). | Cumplido |
| **Ausencia de ambigüedad (*Unambiguity*)** | La redacción en lenguaje Gherkin estandariza las condiciones previas (*Dado*), acciones (*Cuando*) y resultados esperados (*Entonces*). Se especifican códigos de estado HTTP exactos (200, 201, 400, 401, 403, 404, 422, 503) y estructuras JSON sin dobles interpretaciones. | Cumplido |
| **Verificabilidad (*Verifiability*)** | Cada criterio cuenta con un procedimiento de comprobación determinista mediante pruebas automatizadas de software (`pytest`, `TestClient`), consultas en PostgreSQL e inspección de salidas HTTP. | Cumplido |
| **Consistencia (*Consistency*)** | No existen contradicciones entre los criterios y las decisiones de diseño. La transaccionalidad atómica de EP2 es coherente con el modelo monolítico local de ADR-003 y con la integridad de ADR-002. | Cumplido |
| **Completitud (*Completeness*)** | Se cubren tanto los caminos felices (*happy paths*) como las situaciones de excepción, entradas inválidas, accesos a recursos ajenos, indisponibilidad de dependencias externas (SMTP) y valores límite (ej. todas las respuestas en cero). | Cumplido |
| **Trazabilidad (*Traceability*)** | Existe una matriz formal que enlaza cada historia y criterio con los escenarios de calidad del dossier, los endpoints de la API, las decisiones arquitectónicas ADR y las pruebas de validación. | Cumplido |

---

## 5. Tabla de Cobertura de Escenarios del Dossier

Para garantizar absoluta rigurosidad técnica y evitar afirmaciones de cumplimiento infundadas, la siguiente tabla detalla el estado exacto de cobertura de cada escenario original:

| Escenario original | Meta y medida definida en el dossier base | Prueba técnica ejecutada | Evidencia observable | Nivel de cobertura alcanzado | Comprobación adicional pendiente |
|---|---|---|---|:---:|---|
| **E1** (Rechazo de modificaciones del catálogo sin permiso) | 100 intentos de modificación sin permiso de admin rechazados con **HTTP 403** y **0 modificaciones** en PostgreSQL. | No se ejecutó prueba directa sobre el endpoint de catálogo (fuera de EP1–EP4). La prueba ejecutada sobre informes ajenos ([CA-04.2](file:///c:/Users/HP%20VICTUS/nexora-semana2/tests/test_informes.py#L22-L46)) es complementaria de autorización y control de propiedad, pero no verifica el rechazo de modificaciones del catálogo. | [`evidencias/pruebas/pytest-results.txt`](../evidencias/pruebas/pytest-results.txt) (100 rechazos en EP4). | **Sin evaluación directa** *(La prueba CA-04.2 es complementaria; catálogo pendiente).* | Desplegar el módulo de catálogo y ejecutar 100 peticiones de edición de carreras con token de estudiante. |
| **E2** (Integridad transaccional ante fallos de persistencia) | 30 fallos inducidos durante la persistencia de la evaluación, produciendo **0 evaluaciones parciales** y **0 alteraciones** históricas. | `test_evaluaciones.py::test_transaccionalidad_reversion_e2`. 30 fallos inducidos en PostgreSQL real `nexora_test_semana2`. | [`evidencias/pruebas/pytest-results.txt`](../evidencias/pruebas/pytest-results.txt) (Rollback confirmado, conteo intacto). | **Total** *(En el alcance de EP2).* | Pruebas de interrupción física de proceso o caída de red durante commit en staging. |
| **E3** (Consulta de catálogo/evaluación bajo carga concurrente) | 100 usuarios virtuales durante 10 minutos de carga sostenida (2 min calentamiento, 2 vCPU, 4 GB RAM); **P95 ≤ 2 s** y **errores < 1 %**. | Prueba funcional unitaria de consulta aislada (`test_obtener_ultima_evaluacion_propia`). No se ejecutó prueba de estrés masivo. | [`evidencias/pruebas/pytest-results.txt`](../evidencias/pruebas/pytest-results.txt) | **Sin evaluación de carga** *(Funcionalmente correcto; desempeño masivo pendiente).* | Ejecutar script de carga concurrente con k6 / Locust en ambiente de 2 vCPU y 4 GB RAM durante 10 minutos con 100 usuarios concurrentes. |
| **E4** (Modificación de reglas vocacionales con impacto limitado) | Cambio de ponderaciones completado en **≤ 4 horas**, cambios en **≤ 3 archivos de producción** y **100 % de regresión** aprobada. | Se instrumentó el metadato `version_cuestionario = "3.0-20preguntas"` en el modelo y esquema. Guardar la versión en el registro no demuestra por sí solo modularidad, inmutabilidad histórica ante cambios de reglas, ni el tiempo de cambio. | [`evidencias/pruebas/pytest-results.txt`](../evidencias/pruebas/pytest-results.txt) | **Sin evaluación empírica** *(Instrumentación de campo lista; inmutabilidad y tiempo pendientes).* | Aplicar una nueva ponderación en el código, cronometrar el tiempo (≤ 4 h), auditar archivos modificados (≤ 3) y verificar que los resultados históricos permanezcan intactos. |
| **E5** (Continuidad de consultas ante caída SMTP durante 10 min) | Indisponibilidad SMTP durante 10 minutos con 20 intentos de envío; **≥ 99 % de consultas válidas correctas** y **20 respuestas controladas**. | `test_informes.py::test_fallo_smtp_controlado_e5`. Se inyectó fallo SMTP; la API retornó HTTP 503 controlado y EP1 y EP3 continuaron operando. | [`evidencias/pruebas/pytest-results.txt`](../evidencias/pruebas/pytest-results.txt) | **Parcial** *(Manejo de excepción y continuidad comprobados; prueba sostenida de 10 minutos pendiente).* | Ejecutar prueba de resistencia de 10 minutos continuos con mock SMTP bloqueado y tráfico concurrente en EP1–EP3. |
| **E6** (Completar cuestionario en móvil 360 px en ≤ 8 min) | Al menos 9 de 10 estudiantes completan el test en navegador móvil de 360 px en **≤ 8 minutos** sin asistencia. | No aplica a la API de backend (es una prueba de interacción de interfaz de usuario en la aplicación cliente). | No aplica en backend. | **Sin evaluación** *(Corresponde a la interfaz web móvil).* | Sesión de usabilidad con 10 usuarios reales en dispositivos móviles interactuando con la app React. |

---

## 6. Matriz de Trazabilidad Bidireccional

Esta tabla vincula formalmente el flujo de requisitos desde el dossier de arquitectura hasta los artefactos de código y pruebas automatizadas:

| Historia (HU) | Criterio (CA) | Escenario dossier apoyado | Driver | Método y ruta del Endpoint | Decisión ADR | Prueba automatizada en `tests/` |
|---|---|:---:|:---:|---|:---:|---|
| **HU-01** | CA-01.1 (Login exitoso) | E5 (Continuidad) | D1, D5 | `POST /api/v1/auth/login` | ADR-001, ADR-003 | `test_auth.py::test_login_exitoso` |
| **HU-01** | CA-01.2 (Credenciales inválidas) | Apoyo seguridad | D1 | `POST /api/v1/auth/login` | ADR-001 | `test_auth.py::test_login_credenciales_invalidas_ca012` |
| **HU-01** | CA-01.3 (Cuenta inactiva) | Apoyo seguridad | D1 | `POST /api/v1/auth/login` | ADR-001 | `test_auth.py::test_login_cuenta_inactiva` |
| **HU-01** | CA-01.4 (Sintaxis inválida) | - | D1 | `POST /api/v1/auth/login` | ADR-001 | `test_auth.py::test_login_campos_faltantes_422` |
| **HU-01** | CA-01.5 (Carga explícita .env) | Operación | - | `src/core/config.py` | ADR-003 | `test_auth.py::test_carga_explicita_archivo_env` |
| **HU-02** | CA-02.1 (Registro exitoso 20 preguntas) | E4 (Reglas) | D2, D4 | `POST /api/v1/evaluaciones` | ADR-002, ADR-003 | `test_evaluaciones.py::test_crear_evaluacion_exitosa` |
| **HU-02** | CA-02.2 (Cuestionario incompleto) | - | D2 | `POST /api/v1/evaluaciones` | ADR-002 | `test_evaluaciones.py::test_crear_evaluacion_incompleta_400` |
| **HU-02** | CA-02.3 (Reversión atómica) | **E2 (Atomicidad)** | D2 | `POST /api/v1/evaluaciones` | ADR-002 | `test_evaluaciones.py::test_transaccionalidad_reversion_e2` |
| **HU-02** | CA-02.4 (Control de ceros) | E4 (Reglas) | D2, D4 | `POST /api/v1/evaluaciones` | ADR-002 | `test_evaluaciones.py::test_evaluacion_todas_cero` |
| **HU-02** | CA-02.5 (Rechazo claves desconocidas) | Reglas / Contrato | D2 | `POST /api/v1/evaluaciones` | ADR-002 | `test_evaluaciones.py::test_crear_evaluacion_claves_desconocidas_400` |
| **HU-02** | CA-02.6 (Rechazo valor fuera de rango) | Reglas / Contrato | D2 | `POST /api/v1/evaluaciones` | ADR-002 | `test_evaluaciones.py::test_crear_evaluacion_valor_fuera_de_rango_400` |
| **HU-02** | CA-02.7 (Rechazo tipo no entero) | Reglas / Contrato | D2 | `POST /api/v1/evaluaciones` | ADR-002 | `test_evaluaciones.py::test_crear_evaluacion_tipo_no_entero_422` |
| **HU-02** | CA-02.8 (Rechazo booleanos StrictInt) | Reglas / Contrato | D2 | `POST /api/v1/evaluaciones` | ADR-002 | `test_evaluaciones.py::test_crear_evaluacion_rechaza_booleano_422` |
| **HU-02** | CA-02.9 (Rechazo cadenas StrictInt) | Reglas / Contrato | D2 | `POST /api/v1/evaluaciones` | ADR-002 | `test_evaluaciones.py::test_crear_evaluacion_rechaza_cadena_numerica_422` |
| **HU-02** | CA-02.10 (Rechazo flotantes StrictInt) | Reglas / Contrato | D2 | `POST /api/v1/evaluaciones` | ADR-002 | `test_evaluaciones.py::test_crear_evaluacion_rechaza_flotante_422` |
| **HU-03** | CA-03.1 (Consulta última propia) | E3 (Funcional) | D1, D3 | `GET /api/v1/evaluaciones/ultima` | ADR-001, ADR-003 | `test_evaluaciones.py::test_obtener_ultima_evaluacion_propia` |
| **HU-03** | CA-03.2 (Estudiante sin historial) | - | D3 | `GET /api/v1/evaluaciones/ultima` | ADR-001 | `test_evaluaciones.py::test_obtener_ultima_evaluacion_sin_registros` |
| **HU-03** | CA-03.3 (Rechazo sin token) | Apoyo seguridad | D1 | `GET /api/v1/evaluaciones/ultima` | ADR-001 | `test_evaluaciones.py::test_consulta_sin_token_401` |
| **HU-03** | CA-03.4 (Aislamiento de cuenta) | E1 / E3 (Privacidad) | D1 | `GET /api/v1/evaluaciones/ultima` | ADR-001 | `test_evaluaciones.py::test_aislamiento_estricto_entre_cuentas` |
| **HU-04** | CA-04.1 (Envío propio exitoso) | E5 (Continuidad) | D1, D5 | `POST /api/v1/informes/{id}/enviar-correo` | ADR-001, ADR-002 | `test_informes.py::test_enviar_informe_propio_exitoso` |
| **HU-04** | CA-04.2 (Rechazo informe ajeno) | Apoyo seguridad | D1 | `POST /api/v1/informes/{id}/enviar-correo` | ADR-001 | `test_informes.py::test_rechazo_informe_ajeno_ca042` |
| **HU-04** | CA-04.3 (Control de fallo SMTP) | **E5 (Resiliencia)** | D5 | `POST /api/v1/informes/{id}/enviar-correo` | ADR-003 | `test_informes.py::test_fallo_smtp_controlado_e5` |
| **HU-04** | CA-04.4 (Rechazo sin token) | Apoyo seguridad | D1 | `POST /api/v1/informes/{id}/enviar-correo` | ADR-001 | `test_informes.py::test_informe_sin_token_401` |
| **HU-04** | CA-04.5 (Simulación sin activación) | E5 (Aislamiento) | D5 | `POST /api/v1/informes/{id}/enviar-correo` | ADR-003 | `test_informes.py::test_correo_sin_activacion_explicita_no_produce_exito_simulado` |
| **HU-04** | CA-04.6 (Falta de credenciales prod) | E5 (Seguridad) | D5 | `POST /api/v1/informes/{id}/enviar-correo` | ADR-003 | `test_informes.py::test_correo_fuera_de_testing_sin_credenciales_produce_error_controlado` |
| **HU-04** | CA-04.7 (Cero contacto SMTP real) | E5 (Aislamiento) | D5 | `POST /api/v1/informes/{id}/enviar-correo` | ADR-003 | `test_informes.py::test_correo_ninguna_prueba_contacta_smtp_real` |
| **HU-04** | CA-04.8 (Eliminación variable delenv) | E5 (Aislamiento) | D5 | `POST /api/v1/informes/{id}/enviar-correo` | ADR-003 | `test_informes.py::test_correo_eliminacion_variable_entorno_no_produce_exito_simulado` |
