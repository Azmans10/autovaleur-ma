---
status: complete
phase: 04-p-gina-estimer
source:
  - 04-01-SUMMARY.md
  - 04-02-SUMMARY.md
  - 04-03-SUMMARY.md
  - 04-04-SUMMARY.md
  - 04-05-SUMMARY.md
started: 2026-04-13T02:55:00Z
updated: 2026-04-13T03:05:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cascada Marca → Modelo → Año
expected: Al abrir la página Estimer, el selector de Modelo y el de Año aparecen desactivados (disabled/grises). Al elegir una marca (ej. Dacia), el selector de Modelo se activa y muestra sólo los modelos de esa marca. Al elegir un modelo (ej. Logan), el selector de Año se activa con los años disponibles de ese modelo. Si cambias de marca, Modelo y Año se resetean y vuelven a desactivarse.
result: issue
reported: "si, pero en mercedes por ejemplo, veo que faltan muchos mas modelos, el resto ok"
severity: major

### 2. Validación de km
expected: Dejar el campo Kilométrage vacío (o poner 0) e intentar pulsar el botón "Estimer" (con la marca, modelo y año ya seleccionados). El botón no debería hacer nada o mostrar un error visible bajo el campo de kilometraje. El formulario no avanza ni muestra resultado.
result: pass

### 3. Resultado con precio y rango
expected: Con todos los campos del formulario correctamente rellenados (marca, modelo, año, km, estado, carburant, transmisión, ciudad), pulsar "Estimer". Debe aparecer una tarjeta de resultado con el precio estimado en grande (ej. "95 000 MAD") y justo debajo el rango de valoración (ej. "85 000 MAD – 105 000 MAD"). La tarjeta debe aparecer con una animación suave de entrada (fade + slide hacia arriba).
result: pass

### 4. Tabla de desglose con colores
expected: Tras un submit válido, debajo de la tarjeta de precio aparece la tabla "Détail du calcul" con 7 filas. La primera fila (precio base) tiene fondo neutro (gris). Las filas siguientes tienen colores distintos según si el factor mejora el precio (verde) o lo penaliza (rojo). Cada fila muestra el nombre del factor, el coeficiente (ej. ×0.85) y el importe resultante.
result: pass

### 5. Chips de marketplaces con URLs dinámicas
expected: Tras el submit, aparece una sección con 3 botones/links: Avito, Moteur y Wandaloo. Cada uno debería abrir en una nueva pestaña. Las URLs deben ser específicas al vehículo buscado (contienen la marca y modelo en la URL, no son links genéricos "#").
result: pass

### 6. History.getAll() en consola
expected: Después de hacer al menos un submit válido, abrir la consola del navegador y escribir `History.getAll()`. Debe devolver un array con al menos un objeto que incluya campos como make, model, year, mileage, condition, result (precio), y una fecha (date).
result: pass

### 7. "Nouvelle estimation" resetea todo
expected: Pulsar el botón "Nouvelle estimation" que aparece en la sección de resultado. El resultado debe ocultarse con una animación suave. Los chips de marketplace deben desaparecer. El formulario debe volver al estado inicial: Modelo y Año desactivados (disabled), todos los campos en sus valores por defecto. El scroll debe volver a la zona del formulario.
result: pass

### 8. Cambio de idioma a árabe
expected: Usar el selector de idioma para cambiar a árabe (AR). Todos los textos visibles de la página Estimer deben traducirse al árabe: labels del formulario, opciones de los selects (estados, combustibles, transmisión, ciudades), el botón "Estimer", y si hay un resultado visible, los textos de la tarjeta de precio y la tabla de desglose también. El layout debe adaptarse a RTL (derecha a izquierda).
result: pass

## Summary

total: 8
passed: 7
issues: 1
skipped: 0
pending: 0

## Gaps

- truth: "Los selects en cascada muestran todos los modelos disponibles en CAR_DB para cada marca"
  status: failed
  reason: "User reported: en mercedes faltan muchos modelos"
  severity: major
  test: 1
  artifacts: []
  missing: []
