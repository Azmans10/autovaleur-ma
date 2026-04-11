# Features Research — AutoValeur MA

## Mercado de coches de segunda mano en Marruecos

### Plataformas dominantes
- **Avito.ma** — líder absoluto en anuncios de coches usados (URL de búsqueda: `avito.ma/annonces/voitures-occasion`)
- **Moteur.ma** — especializado en coches, más datos técnicos
- **Wandaloo.ma** — precios de referencia, también nuevo y usado

### Marcas más vendidas en MA (orden de popularidad)
1. **Dacia** — líder absoluto, Logan y Sandero dominan
2. **Renault** — Clio, Megane, Symbol
3. **Peugeot** — 206, 208, 301
4. **Citroën** — C3, C4, Berlingo
5. **Hyundai** — i10, i20, Tucson
6. **Kia** — Picanto, Rio, Sportage
7. **Toyota** — Yaris, Corolla, Hilux
8. **Volkswagen** — Polo, Golf
9. **Ford** — Fiesta, Focus, EcoSport
10. **Fiat** — Punto, 500
11. **Seat** — Ibiza, Leon
12. **Suzuki** — Swift, Celerio
13. **Mercedes** — Clase A, Clase C (segmento premium)
14. **BMW** — Serie 3 (premium)

### Rangos de precio típicos (DH, 2024-2025)
- Dacia Logan 2015-2018: 40.000 – 70.000 DH
- Renault Clio 2015-2019: 45.000 – 85.000 DH
- Peugeot 208 2014-2019: 50.000 – 90.000 DH
- Hyundai i10 2015-2019: 40.000 – 75.000 DH
- Toyota Yaris 2015-2019: 55.000 – 95.000 DH

### Factores de mercado MA específicos
- **Diesel premium**: El gasoil está subvencionado → coches diesel mantienen mejor valor. Factor: +5% a +8% vs equivalente essence
- **Correcciones por ciudad**:
  - Casablanca: +8% (mercado más líquido, mayor demanda)
  - Rabat: +5%
  - Marrakech: +3%
  - Tanger: +2%
  - Fès: 0% (referencia)
  - Agadir: -2%
  - Meknès: -3%
  - Oujda: -7%
  - Laayoune: -5%
- **Transmisión**: Automático tiene prima creciente (+5% a +10%) pero aún menos demandado que manual en gamas bajas
- **Primera main (premier main)**: Si el vendedor es el primer propietario, prima real de +5%-10%

## Algoritmo de Depreciación Recomendado

### Modelo base

```
Precio_estimado = Precio_base × Factor_edad × Factor_km × Factor_estado × Bonus_carburant × Corrección_ciudad × Factor_transmisión
```

### Factor de edad (depreciación anual)
Basado en curvas de depreciación estándar adaptadas a MA:

| Edad (años) | Factor |
|-------------|--------|
| 0-1 | 0.85 |
| 2 | 0.78 |
| 3 | 0.72 |
| 4 | 0.67 |
| 5 | 0.63 |
| 6 | 0.59 |
| 7 | 0.56 |
| 8 | 0.53 |
| 9 | 0.50 |
| 10 | 0.47 |
| 11-12 | 0.43 |
| 13-15 | 0.38 |
| >15 | 0.33 |

### Factor de kilómetros (por km adicional sobre la media)
Media marroquí: ~15.000 km/año

- < 10.000 km/año: +3%
- 10.000-20.000 km/año: 0% (normal)
- 20.000-30.000 km/año: -5%
- 30.000-40.000 km/año: -10%
- > 40.000 km/año: -15%

Aplicar sobre km_real vs km_esperado (edad × 15000):
```
km_esperado = edad_años × 15000
desviación = (km_real - km_esperado) / km_esperado
factor_km = 1 - (desviación × 0.15)  // capped entre 0.75 y 1.10
```

### Factor de estado (état)
| Estado | Descripción | Factor |
|--------|-------------|--------|
| Excellent | Comme neuf, aucun défaut | +0.08 |
| Très bon | Quelques petits défauts | +0.04 |
| Bon | État normal pour l'âge | 0.00 |
| Passable | Défauts visibles, petite mécanique | -0.08 |
| Mauvais | Réparations importantes nécessaires | -0.18 |

### Bonus carburant
| Carburant | Factor |
|-----------|--------|
| Diesel / Gasoil | +0.06 |
| Essence | 0.00 |
| Hybride | +0.08 |
| Électrique | +0.05 |
| GPL | -0.05 |

### Factor transmisión
| Transmisión | Factor |
|-------------|--------|
| Manuelle | 0.00 |
| Automatique | +0.07 |

## Transparencia del Cálculo — Patrones que funcionan

Las mejores herramientas (Argus FR, CarGurus US) muestran:
1. **Precio base del modelo** en estado normal
2. **Ajuste por edad**: "- X DH (X años)"
3. **Ajuste por km**: "+ / - X DH (X km vs. moyenne)"
4. **Ajuste por état**: "+ / - X DH"
5. **Correction carburant**: "+ X DH (diesel premium)"
6. **Correction ville**: "+ / - X DH (Casablanca)"
7. **Prix estimé final** bien visible, grande taille

Esto construye confianza: el usuario puede verificar cada paso.

## URLs de búsqueda en marketplaces MA

### Avito.ma
```
https://www.avito.ma/fr/maroc/voitures-r43/[MARQUE]_[MODELE]~[ANNÉE_MIN],[ANNÉE_MAX]/
```
Ejemplo: `https://www.avito.ma/fr/maroc/voitures-r43/dacia_logan/`

O con búsqueda: `https://www.avito.ma/fr/maroc/voitures-r43/?o=6&q=dacia+logan+2019`

### Moteur.ma
```
https://www.moteur.ma/fr/voiture/achat-voiture-occasion/?q=[MARQUE]+[MODELE]
```

### Wandaloo.ma
```
https://www.wandaloo.com/occasion/[MARQUE]/[MODELE]/
```

**Recomendación:** Construir URLs de búsqueda dinámicas con `encodeURIComponent(brand + ' ' + model + ' ' + year)` para Avito/Moteur, y rutas slug para Wandaloo.

## Features Table Stakes vs Diferenciadores

### Table stakes (obligatorio)
- Selección de marca/modelo/año
- Input de kilómetros
- Selección de estado
- Precio estimado claro
- Funciona en móvil

### Diferenciadores de AutoValeur MA
- **Desglose del cálculo** (muy raro en herramientas gratuitas)
- **Calibración para MA** (no existe herramienta local con esto)
- **Historial local** sin cuenta
- **Comparador** de estimaciones
- **PWA offline** (único en el mercado MA)
- **Bilingüe FR/AR**
