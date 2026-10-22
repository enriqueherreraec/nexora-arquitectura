# Evidencia de Prueba de Herramienta de IA (T6)

## Identificación
- **Herramienta:** Antigravity AI Assistant (Google DeepMind).
- **Tipo de acceso:** Servicio inteligente integrado en el entorno de desarrollo Antigravity IDE (DeepMind / Google), ejecutado mediante contexto interactivo en la sesión activa.
- **Categoría CASE:** I-CASE (Asistencia en análisis, diseño, codificación y pruebas).

## Objetivo de la prueba
Asistir en la estructuración de la lógica de evaluación vocacional de Nexora para procesar 20 respuestas Likert (0 a 4 puntos), calcular puntuaciones en 10 áreas académicas, detectar empates y registrar la versión histórica del cuestionario según ADR-002 (sin confundir dicho metadato con una comprobación empírica completa de mantenibilidad o inmutabilidad en E4).

## Entrada utilizada
Prompt estructurado con las especificaciones del cuestionario de Nexora:
```text
Generar módulo en Python para calcular las afinidades vocacionales de Nexora a partir de un diccionario de 20 respuestas Likert (claves 1 a 20, valores 0 a 4) mapeadas a 10 áreas:
- Preguntas 1 y 11: Tecnología e Innovación
- Preguntas 2 y 12: Ciencias Exactas
- Preguntas 3 y 13: Ciencias de la Salud
- Preguntas 4 y 14: Arte y Creatividad
- Preguntas 5 y 15: Humanidades y Sociedad
- Preguntas 6 y 16: Administración y Negocios
- Preguntas 7 y 17: Ciencias Naturales y Agro
- Preguntas 8 y 18: Comunicación y Medios
- Preguntas 9 y 19: Educación y Pedagogía
- Preguntas 10 y 20: Seguridad y Defensa
El algoritmo debe identificar área predominante, detectar empates sin arbitrariedad, detectar caso todas_cero y sugerir recomendaciones pedagógicas.
```

## Salida generada por la IA
Función de cálculo determinista `calcular_puntuaciones_vocacionales(respuestas)` y generador de recomendaciones `generar_recomendaciones_pedagogicas(area_predominante, afinidad_top, es_empate, areas_empatadas)`.

## Defectos y limitaciones detectados
1. **Manejo de empates incompleto:** La propuesta inicial seleccionaba arbitrariamente la primera clave del diccionario en caso de puntajes idénticos, lo cual sesgaba la orientación vocacional.
2. **Caso todas cero no controlado:** Si el estudiante respondía 0 en todas las preguntas, la IA asignaba una carrera tecnológica por defecto en lugar de advertir desinterés o cuestionario no diferenciado.
3. **Falta de versión de cuestionario:** No incluía el metadato `version_cuestionario = "3.0-20preguntas"` para el seguimiento de versiones según ADR-002.

## Correcciones aplicadas y decisión
- **Decisión:** Modificar y aceptar.
- **Ajustes:** Se implementó una lista explícita `areas_empatadas` y bandera booleana `es_empate`, se introdujo la validación `todas_cero` y se vinculó la constante de versión de cuestionario.
- **Resultado final:** Módulo completamente integrado y validado mediante pruebas unitarias en `src/services/evaluacion_service.py`.
