# 🎓 Nexora
### Dossier de arquitectura · Sistema web de orientación vocacional

**MAESTRÍA EN INGENIERÍA EN SOFTWARE**

| Información académica | Detalle |
|---|---|
| **Tarea** | Dossier de arquitectura de Nexora |
| **Módulo** | Automatización de Procesos de Software |
| **Docente** | Ing. José Luis Rodríguez Chinchilla, Mgs. |

### 👥 Integrantes

- Baren Tarira Rosa Angélica
- Herrera Celi Enrique Rolando
- Mera Rodríguez Willington Daniel

---

## 🎯 Acerca del proyecto

Nexora es un sistema web de orientación vocacional que permite al estudiante responder un cuestionario, consultar su evaluación y solicitar un informe PDF por correo, ofrece información de carreras y universidades para apoyar la exploración de opciones académicas.

Los resultados tienen un propósito orientativo y no garantizan admisión universitaria ni afinidad profesional definitiva.

Este repositorio reúne la documentación arquitectónica del proyecto, sus drivers, escenarios de calidad, vistas C4 y decisiones justificadas.

## 📚 Explorar el dossier

| Documento | Contenido |
|---|---|
| [🧭 Contexto y drivers](docs/01-contexto-y-drivers/contexto-y-drivers.md) | Propósito, participantes, restricciones, supuestos y escenarios iniciales |
| [🌐 C4 nivel 1](docs/02-vistas-c4/nivel1.md) | Contexto de Nexora, actores y sistemas externos |
| [🧩 C4 nivel 2](docs/02-vistas-c4/nivel2.md) | Aplicación web, API, base de datos e integraciones |
| [🔐 ADR-001](docs/03-adr/ADR-001-control-de-acceso.md) | Autenticación y propiedad de los recursos |
| [💾 ADR-002](docs/03-adr/ADR-002.md) | Integridad e historial de las evaluaciones |
| [🏗️ Decisiones arquitectónicas](docs/03-adr/) | Registros ADR, incluido ADR-003 sobre el estilo seleccionado |
| [⚖️ Matriz de decisión](docs/03-adr/matriz-de-decision.md) | Alternativas, criterios, pesos y sensibilidad |
| [🤖 Registro de IA](docs/04-registro-ia.md) | Actividades asistidas y criterios de revisión |
| [🤝 Revisión cruzada](docs/05-revision-cruzada.md) | Registro de observaciones y correcciones entre equipos |
| [📖 Lecturas de apoyo](docs/06-lecturas-de-apoyo.md) | Fuentes sobre C4, ADR y herramientas CASE |

## 🔄 Flujo principal

1. Iniciar sesión con una cuenta existente.
2. Responder el cuestionario y registrar la evaluación.
3. Consultar la última evaluación y su resultado.
4. Solicitar el envío del informe PDF al correo.

## 🔌 Cuatro endpoints del alcance

| ID | Método | Endpoint | Función |
|---|---|---|---|
| EP1 | `POST` | `/api/v1/auth/login` | Iniciar sesión |
| EP2 | `POST` | `/api/v1/evaluaciones/` | Enviar las respuestas y registrar la evaluación |
| EP3 | `GET` | `/api/v1/evaluaciones/ultima` | Consultar la última evaluación y su resultado |
| EP4 | `POST` | `/api/v1/informes/{id}/enviar-correo` | Enviar el informe PDF al correo |

> El análisis académico comprende estas cuatro operaciones, las funciones de administración y catálogo pertenecen al contexto general, la correspondencia exacta del contrato requiere verificación en OpenAPI.

## 🛠️ Base tecnológica

| Área | Tecnologías |
|---|---|
| Interfaz web | React, TypeScript, Vite y Material UI |
| Backend | Python y FastAPI |
| Persistencia | PostgreSQL y SQLAlchemy |
| Generación de informes | ReportLab |
| Servicio externo de correo | Gmail SMTP |
| Diagramas | Mermaid |
| Documentación y versiones | Markdown, Git y GitHub |

## 🏗️ Arquitectura seleccionada

El dossier selecciona un **monolito modular con capas** para el backend, las capacidades de acceso, evaluaciones, resultados e informes pertenecen a una misma API, con responsabilidades diferenciadas para solicitudes, reglas, persistencia e integraciones.

La aplicación web utiliza la API y PostgreSQL conserva los datos, ReportLab genera el PDF dentro del backend y Gmail SMTP procesa la solicitud de envío.

La elección responde a la integridad de las evaluaciones y a la simplicidad de operación del alcance actual, su correspondencia con el código requiere inspección.

### Comparación de alternativas

| Alternativa | Total ponderado sobre 5 |
|---|---:|
| **A1. Monolito modular con capas** | **4,00** |
| A2. Microservicios por capacidad | 3,25 |
| A3. Capas, eventos y outbox | 3,95 |

> Las puntuaciones son valoraciones de diseño, la diferencia entre A1 y A3 es pequeña y el análisis de sensibilidad identifica condiciones para revisar la decisión.

## 🛡️ Atributos de calidad

| Driver | Prioridad del diseño |
|---|---|
| D1. Seguridad | Restringir resultados e informes a su propietario |
| D2. Fiabilidad e integridad | Conservar completas y relacionadas las respuestas y el resultado |
| D3. Desempeño | Responder oportunamente a las operaciones de evaluación |
| D4. Mantenibilidad | Localizar cambios de reglas y conservar el historial |
| D5. Continuidad ante fallos de correo | Mantener las funciones principales durante un fallo SMTP |

## 🧪 Escenarios de validación

| Escenario | Propósito |
|---|---|
| E1 | Rechazar solicitudes de informes ajenos |
| E2 | Revertir el registro ante fallos de persistencia |
| E3 | Medir el desempeño de la consulta de la última evaluación |
| E4 | Evaluar cambios de ponderación sin alterar el historial |
| E5 | Comprobar continuidad de EP1–EP3 ante fallos SMTP |
| E6 | Rechazar credenciales inválidas sin emitir tokens válidos |

Los escenarios E1–E5 se detallan en el contexto y drivers, E6 se incorpora como escenario adicional en ADR-001.

## 📌 Estado de las evidencias

| Elemento | Estado |
|---|---|
| Documentación de contexto, vistas y decisiones | Disponible en este repositorio |
| Correspondencia con el código y OpenAPI | Pendiente de verificación |
| Ejecución de escenarios de calidad | Pendiente |
| Revisión cruzada entre equipos | Pendiente de revisión real |

Las metas y puntuaciones del dossier no representan resultados de pruebas, cada validación debe conservar evidencia real y su relación con la versión revisada.

## 🤖 Uso de inteligencia artificial

ChatGPT apoya la preparación y revisión de la documentación, Antigravity se utiliza como entorno de desarrollo con asistencia de IA, el equipo conserva la responsabilidad de revisar el contenido y verificar su correspondencia con Nexora.

El detalle de las actividades y correcciones consta en el [registro de uso de IA](docs/04-registro-ia.md).

## 🕓 Historial de cambios

Los commits permiten identificar las actualizaciones de la documentación y consultar sus diferencias, para la entrega académica se utiliza el enlace del commit que contiene la versión final del dossier.

---

**🌿 Nexora · Explorar opciones académicas con orientación e información**
