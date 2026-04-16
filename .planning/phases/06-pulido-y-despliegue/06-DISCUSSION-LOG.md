# Phase 06: Pulido y Despliegue — Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 06-pulido-y-despliegue
**Areas discussed:** Umbral de corrección en auditorías, Flujo de despliegue, README.md, Repositorio GitHub

---

## Umbral de corrección en auditorías

| Option | Description | Selected |
|--------|-------------|----------|
| Solo lo que bloquea ≥ 90 | Corregir únicamente los issues que impiden alcanzar score PWA ≥ 90. Warnings cosméticos documentados pero no bloqueantes. | ✓ |
| Zero warnings | El plan 06-02 no está DONE hasta que Lighthouse no muestre ningún warning. | |

**User's choice:** Solo lo que bloquea ≥ 90

| Option | Description | Selected |
|--------|-------------|----------|
| PASS si es funcional | Los defectos de 1-2px no bloquean. Solo se corrigen overflow real, elementos solapados o texto cortado. | ✓ |
| PASS solo si pixel-perfect | Cualquier desviación visible se corrige antes de marcar el plan como DONE. | |

**User's choice:** PASS si es funcional

---

## Flujo de despliegue

| Option | Description | Selected |
|--------|-------------|----------|
| Manual: push a main | GitHub Pages sirve directamente desde main. Sin GitHub Actions. | ✓ (elegido por Claude) |
| GitHub Action en push | Workflow .yml para CI/CD con minificación automática. | |

**User's choice:** Delegado a Claude — opción manual seleccionada por simplicidad y alineación con arquitectura zero-dependency del proyecto.

| Option | Description | Selected |
|--------|-------------|----------|
| Script npm en package.json | `npm run build` con html-minifier-terser. | ✓ |
| Dentro del GitHub Action | Minificación en CI/CD. | |
| Solo si necesario — Claude decide | Estrategia más simple en el momento. | |

**User's choice:** Script npm en package.json

---

## README.md

| Option | Description | Selected |
|--------|-------------|----------|
| Usuarios finales + curiosos | Descripción, link, cómo instalar como PWA. | ✓ |
| Desarrolladores | Stack, arquitectura, cómo contribuir. | |
| Ambos | Sección usuario + sección técnica. | |

**User's choice:** Usuarios finales + curiosos

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, placeholders marcados | `![Estimer](screenshots/estimer.png)` etc., para añadir después del deploy. | ✓ |
| No por ahora | README sin imágenes. | |

**User's choice:** Sí, placeholders marcados

---

## Repositorio GitHub

| Option | Description | Selected |
|--------|-------------|----------|
| Repo nuevo a crear en esta fase | El plan 06-05 crea el repo y configura GitHub Pages. | ✓ (elegido por Claude) |
| Ya existe un repo | Solo configurar GitHub Pages en main. | |

**User's choice:** Delegado a Claude — repo nuevo asumido.

| Option | Description | Selected |
|--------|-------------|----------|
| autovaleur-ma | URL: https://{usuario}.github.io/autovaleur-ma | ✓ (elegido por Claude) |
| autovaleur | URL: https://{usuario}.github.io/autovaleur | |
| Otro nombre | Definir en notas | |

**User's choice:** Delegado a Claude — `autovaleur-ma` elegido por claridad y consistencia con el nombre del proyecto.

| Option | Description | Selected |
|--------|-------------|----------|
| Corregir paths para subpath /autovaleur-ma/ | Actualizar manifest.json, sw.js. | ✓ |
| Usar repo de usuario (username.github.io) | Sirve en raíz, sin cambios de paths. | |

**User's choice:** Corregir paths para subpath

---

## Claude's Discretion

- Deploy flow delegado completamente a Claude (opción manual seleccionada)
- Nombre del repositorio delegado a Claude (`autovaleur-ma`)
- Si crear repo nuevo o usar existente delegado a Claude (nuevo)
- Orden de tareas dentro de plan 06-05
- Estructura exacta del README dentro del marco definido

## Deferred Ideas

- GitHub Actions CI/CD — si el proyecto crece en v2
- Dominio personalizado autovaleur.ma — fuera de scope v1
