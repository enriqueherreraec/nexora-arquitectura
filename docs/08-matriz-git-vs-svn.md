# Matriz comparativa de Git y SVN para Nexora

## 1. Contexto del proyecto

Nexora es un sistema web de orientación vocacional con frontend React y TypeScript, backend FastAPI y PostgreSQL, su arquitectura corresponde a un monolito modular por capas, el equipo de tres integrantes requiere registrar cambios, consultar el historial y revisar los aportes antes de integrarlos en la rama principal.

## 2. Diferencia entre Git y GitHub

Git es un sistema de control de versiones distribuido que permite crear commits, consultar versiones y gestionar ramas locales, GitHub aloja repositorios Git y aporta issues, pull requests, revisiones y reglas de protección de ramas, estas funciones colaborativas corresponden a la plataforma y no al núcleo de Git (Chacon & Straub, 2014).

## 3. Matriz comparativa

| Dimensión | Git | Apache Subversion (SVN) | Implicación para Nexora |
|---|---|---|---|
| **Modelo** | Distribuido, un clon completo conserva el historial y permite registrar cambios locales, también admite clones superficiales y parciales. | Centralizado, el servidor conserva el repositorio y los clientes utilizan copias de trabajo. | Git permite registrar avances locales y compartirlos después con el equipo. |
| **Historial** | Organiza commits relacionados mediante un grafo, los identificadores hash permiten verificar la integridad de los objetos, no equivalen a firmas digitales ni impiden reescribir referencias. | Cada commit genera una revisión global numerada que representa el estado del árbol del repositorio. | El historial de Git permite relacionar cambios y versiones, su conservación requiere reglas de protección y respaldos. |
| **Ramas** | Utiliza referencias ligeras a commits, crear ramas tiene un costo reducido, las fusiones pueden requerir resolver conflictos. | Utiliza copias baratas de rutas que comparten datos, admite ramas y fusiones con seguimiento de integraciones. | Las ramas cortas de Git se ajustan al trabajo por tareas y a la revisión mediante PR en GitHub. |
| **Trabajo sin conexión** | Permite commits, consulta del historial disponible y comparación de versiones locales, la sincronización con servidores remotos requiere conexión. | Permite editar archivos, consultar el estado, comparar con la base y revertir cambios locales, publicar commits y consultar información del servidor requiere conexión. | Git permite conservar avances como commits durante interrupciones de internet. |
| **Permisos** | No incorpora autorización de lectura por carpeta dentro de un repositorio compartido, el alojamiento puede añadir permisos y reglas por rama. | Permite configurar autorización de lectura y escritura por rutas del repositorio. | El equipo comparte los módulos de Nexora, por lo que no necesita restringir el acceso interno por carpetas. |
| **Rendimiento** | Muchas operaciones utilizan datos locales, el costo de clonar y almacenar el historial depende del tamaño del repositorio. | La copia de trabajo no necesita todo el historial, las operaciones que consultan el servidor dependen de la conexión. | El código Python, TypeScript, YAML y Markdown favorece un repositorio manejable, no se han medido diferencias de rendimiento entre ambas herramientas. |
| **Ecosistema** | Dispone de clientes, soporte en editores y plataformas como GitHub y GitLab, con opciones para revisión y automatización. | Dispone de clientes como TortoiseSVN y compatibilidad con herramientas de integración continua como Jenkins. | Git permite conservar el entorno de colaboración que Nexora ya utiliza en GitHub. |

La comparación considera el modelo distribuido y las ramas de Git descritos por Chacon y Straub (2014), junto con las revisiones, copias de trabajo y capacidades de SVN documentadas por Collins-Sussman et al. (2011).

## 4. Justificación de Git para Nexora

Git resulta adecuado para Nexora por la autonomía local, el uso de ramas por tarea y la continuidad con el repositorio existente, GitHub complementa estas capacidades con issues, PR y aprobación previa a la integración, la elección responde a las necesidades del equipo y no a una incapacidad de SVN para admitir colaboración.

El flujo acordado utiliza ramas cortas desde main, commits convencionales y revisión de otro integrante antes del merge, las etiquetas existentes, como v0.2.0, permiten identificar hitos del proyecto, las protecciones de la rama principal contribuyen a conservar el historial compartido.

## 5. Caso donde SVN sería adecuado

SVN sería adecuado para un estudio de diseño que gestione archivos CAD y recursos audiovisuales con permisos distintos por carpeta, su autorización por ruta permite limitar el acceso de proveedores externos y sus copias de trabajo permiten descargar las carpetas necesarias sin recuperar todo el historial.

El bloqueo mediante svn lock coordina los cambios sobre archivos que no admiten fusión textual, la propiedad svn:needs-lock favorece ese procedimiento mediante archivos de solo lectura en la copia de trabajo, aunque no impide toda edición local, estas características pueden ser útiles si la organización prioriza control centralizado y acceso por rutas.

## 6. Referencias

Chacon, S., & Straub, B. (2014). *Pro Git* (2.ª ed.). Apress. https://git-scm.com/book/es/v2

Collins-Sussman, B., Fitzpatrick, B. W., & Pilato, C. M. (2011). *Version control with Subversion: For Subversion 1.7*. https://svnbook.red-bean.com/en/1.7/
