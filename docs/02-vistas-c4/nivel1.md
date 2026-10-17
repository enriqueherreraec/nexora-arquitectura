# C4 nivel 1. Contexto del sistema Nexora

## Propósito

Nexora es un sistema web de orientación vocacional que permite al estudiante responder un cuestionario, consultar su evaluación y solicitar un informe PDF por correo, el sistema presenta información de carreras y universidades para apoyar la exploración académica, sus resultados son orientativos y no garantizan admisión ni afinidad profesional definitiva.

## Alcance de la vista

La vista representa a Nexora como un único sistema y muestra sus relaciones con las personas y los sistemas externos, el alcance académico de esta entrega comprende cuatro endpoints, la administración y el mantenimiento del catálogo se incluyen como contexto general.

## Diagrama de contexto

```mermaid
flowchart TB
    estudiante["Estudiante — S1"]
    administrador["Administrador — S2"]
    gestor["Gestor de información académica — S5"]

    nexora["Nexora — Sistema web de orientación vocacional"]

    correo["Servicio externo de correo — S4"]
    portales["Portales oficiales de universidades — S6"]

    estudiante -->|"Responde el cuestionario y consulta resultados"| nexora
    administrador -->|"Administra el sistema"| nexora
    gestor -->|"Mantiene el catálogo académico"| nexora

    nexora -->|"Solicita el envío del informe PDF"| correo
    nexora ~~~ portales
    gestor -->|"Consulta la oferta oficial"| portales

    classDef persona fill:#E8F5E9,stroke:#267344,color:#153D25,stroke-width:2px
    classDef sistema fill:#1E5B2E,stroke:#123D1E,color:#FFFFFF,stroke-width:2px
    classDef externo fill:#F4F6F5,stroke:#718078,color:#26352C,stroke-width:2px

    class estudiante,administrador,gestor persona
    class nexora sistema
    class correo,portales externo
```

**Nota.** Elaboración propia para Nexora, el diagrama expresa el contexto del sistema, la consulta de los portales corresponde al gestor y no presupone una integración automática con las universidades.

## Participantes y responsabilidades

| ID | Participante | Responsabilidad o relación |
|---|---|---|
| S1 | Estudiante | Responder el cuestionario, consultar su última evaluación y solicitar el informe |
| S2 | Administrador | Administrar el sistema conforme a los permisos establecidos |
| S4 | Servicio externo de correo | Procesar la solicitud de envío y entregar el mensaje al destinatario |
| S5 | Gestor de información académica | Mantener la vigencia y exactitud del catálogo de carreras y universidades |
| S6 | Portales oficiales de universidades | Proporcionar fuentes para verificar la oferta académica |

El equipo de desarrollo, identificado como S3 en el contexto y los drivers, participa en la construcción y el mantenimiento, su interés se documenta como stakeholder y no requiere una relación de uso en esta vista.

## Operaciones incluidas en el análisis

| ID | Método | Endpoint | Función |
|---|---|---|---|
| EP1 | POST | `/api/v1/auth/login` | Iniciar sesión |
| EP2 | POST | `/api/v1/evaluaciones/` | Enviar las respuestas y registrar la evaluación |
| EP3 | GET | `/api/v1/evaluaciones/ultima` | Consultar la última evaluación y su resultado |
| EP4 | POST | `/api/v1/informes/{id}/enviar-correo` | Enviar el informe PDF al correo |

**Nota.** La tabla delimita las cuatro operaciones del deber, los endpoints de administración y catálogo quedan fuera de este análisis.

## Límites y condiciones

- Nexora conserva la responsabilidad de autenticar al estudiante y verificar la propiedad de los recursos.
- El proveedor de correo es externo al límite del sistema.
- La solicitud de envío no equivale a una garantía de recepción en la bandeja del destinatario.
- Los portales universitarios constituyen fuentes externas de información.
- El mantenimiento del catálogo no supone acceso del gestor a resultados privados.
- El registro de cuentas se considera una condición previa al flujo analizado.
- La correspondencia exacta de las rutas con la API requiere verificación mediante OpenAPI.

## Relación con los drivers

| Driver | Relación con el contexto |
|---|---|
| D1. Seguridad | Proteger respuestas, resultados e informes del estudiante |
| D2. Fiabilidad e integridad | Conservar la evaluación y su historial |
| D3. Desempeño | Responder oportunamente a las operaciones del estudiante |
| D4. Mantenibilidad | Permitir cambios localizados en reglas e integraciones |
| D5. Continuidad ante fallos de correo | Mantener el flujo principal ante la indisponibilidad del proveedor |

## Estado de la vista

La vista documenta el contexto acordado para el dossier, las relaciones y los controles requieren contraste con el código y las pruebas antes de declarar su cumplimiento.

## Documentación relacionada

- [Contexto, drivers y escenarios de calidad](../01-contexto-y-drivers/contexto-y-drivers.md)
- [C4 nivel 2: contenedores](nivel2.md)
- [Decisiones arquitectónicas](../03-adr/)
