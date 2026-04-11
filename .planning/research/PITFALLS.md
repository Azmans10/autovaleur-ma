# Pitfalls Research — AutoValeur MA

## 1. PWA / Service Worker

### Problema: file:// no soporta Service Workers
**Síntoma:** En desarrollo local abriendo el HTML directamente, el SW no se registra.
**Mitigación:** Usar `http-server` o `python -m http.server` para desarrollo local. En producción (GitHub Pages, Netlify) funciona perfectamente.

### Problema: iOS Safari limitaciones PWA
**Síntomas conocidos:**
- iOS Safari limita localStorage a 50MB (no es problema real aquí)
- El "Add to Home Screen" en iOS Safari NO muestra el prompt automático — el usuario debe hacerlo manualmente via el menú compartir
- No hay `beforeinstallprompt` en iOS (solo Chrome/Android lo tiene)
- Los SW en iOS Safari tienen bugs ocasionales de caché
**Mitigación:** Mostrar instrucciones de instalación manual para iOS con screenshots. No depender de `beforeinstallprompt` para la experiencia.

### Problema: Cache stale — el usuario no ve actualizaciones
**Síntoma:** Después de actualizar el HTML, el SW sirve la versión antigua.
**Mitigación:** Usar versión en el nombre del cache: `CACHE_NAME = 'autovaleur-v1.2.0'`. Al activar el nuevo SW, borrar caches viejos.

```js
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
```

## 2. localStorage

### Problema: Safari en modo privado bloquea localStorage
**Síntoma:** `localStorage.setItem()` lanza `SecurityError` en Safari modo privado.
**Mitigación:** Envolver siempre en try/catch:

```js
function safeSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('Storage unavailable:', e);
    return false;
  }
}
```

### Problema: Límite de 5MB
**Síntoma:** Con 100 registros de valoración (~2KB cada uno), el uso es de ~200KB — muy por debajo del límite. No es un problema real.
**Mitigación preventiva:** Cap de 100 registros en historial y hacer `slice(0, 100)` al guardar.

## 3. RTL / Árabe

### Problema: Números en árabe con locale MA
**Síntoma:** `new Intl.NumberFormat('ar-MA').format(58000)` puede devolver `٥٨٫٠٠٠` (dígitos árabes) en lugar de `58.000`.
**Mitigación:** Usar `ar-MA-u-nu-latn` para forzar dígitos latinos en contexto árabe:

```js
const formatPrice = (n, lang) => 
  new Intl.NumberFormat(lang === 'ar' ? 'ar-MA-u-nu-latn' : 'fr-MA', {
    style: 'decimal', maximumFractionDigits: 0
  }).format(n);
```

### Problema: Iconos y flechas se invierten en RTL
**Síntoma:** `→` en LTR debe ser `←` en RTL. Las barras de progreso que crecen hacia la derecha deben crecer hacia la izquierda.
**Mitigación:** Usar `transform: scaleX(-1)` condicionalmente, o usar logical CSS properties (`margin-inline-start` en lugar de `margin-left`).

### Problema: Fuente árabe no carga offline
**Síntoma:** Si se usa Google Fonts para la tipografía árabe, no funciona offline.
**Mitigación:** Incluir fuente en base64 embebida en el CSS, o usar `system-ui` que en Android incluye Noto Arabic.

```css
@font-face {
  font-family: 'AppArabic';
  src: local('Noto Sans Arabic'), local('Cairo'), local('Amiri'),
       local('Arabic Typesetting'), local('Geeza Pro'); /* iOS */
  font-display: swap;
}
```

## 4. Single-file / Rendimiento

### Problema: Archivo HTML muy pesado
**Síntoma:** Con la DB de coches completa (14 marcas × ~20 modelos × data), el JSON puede ocupar 50-100KB. El HTML total puede superar 300KB.
**Mitigación:** Aceptable para uso con conexión. Para offline, el SW lo cachea la primera vez y luego es instantáneo. Comprimir con gzip en servidor (GitHub Pages lo hace automáticamente: ~70% reducción).

### Problema: CSP (Content Security Policy) bloquea inline scripts
**Síntoma:** Si el hosting añade CSP headers restrictivos, `<script>` inline puede fallar.
**Mitigación:** Asegurarse de que el SW no añade headers CSP restrictivos. GitHub Pages no añade CSP por defecto.

## 5. Algoritmo de Valoración

### Problema: Estimaciones absurdas para casos edge
**Casos problemáticos:**
- Coche de 20+ años: el factor de depreciación no debe llegar a 0 (hay un valor residual mínimo en MA)
- Kilómetros = 0: no existe, mínimo 1.000 km
- Coche de lujo (Mercedes, BMW) con km altos: la depreciación es diferente a coches populares
- Modelos del año actual: precio_base completo

**Mitigaciones:**
```js
// Factor edad mínimo: 30% del precio base (nunca llega a 0)
const ageFactor = Math.max(0.30, DEPRECIATION.age[Math.min(age, 15)]);

// Km mínimo
const safeKm = Math.max(1000, km);

// Precio mínimo absoluto (cualquier coche vale algo)
const MIN_PRICE = 8000; // DH
const price = Math.max(MIN_PRICE, calculatedPrice);
```

### Problema: Precios base obsoletos
**Síntoma:** Si la app se usa en 2028 con precios base de 2025, las estimaciones estarán desfasadas.
**Mitigación:** Mostrar en la UI: "Basé sur les prix de référence 2025". Los precios base pueden actualizarse editando el JSON embebido en el HTML.

## 6. URLs de Marketplace

### Problema: URLs de Avito/Moteur cambian
**Síntoma:** Los sitios rediseñan su estructura de URLs ocasionalmente.
**Mitigación:** Construir URLs con `try/catch` y abrir en nueva pestaña. Si la URL falla, el usuario simplemente ve que el sitio no existe con esa búsqueda — no es un error crítico de la app.

### Problema: Wandaloo no tiene todos los modelos en slug format
**Mitigación:** Para Wandaloo, usar URL de búsqueda genérica si el slug específico no existe:
```js
wandaloo(brand, model) {
  return `https://www.wandaloo.com/occasion/?marque=${encodeURIComponent(brand)}&modele=${encodeURIComponent(model)}`;
}
```

## 7. Android Chrome / Usuarios MA

### Problema: Pantallas pequeñas y teclados que tapan el form
**Síntoma:** En Android, el teclado virtual sube y puede ocultar campos del formulario.
**Mitigación:** Usar `scroll-padding-bottom` y asegurar que al hacer focus en un input, la pantalla scrollea para mostrarlo.

```css
html { scroll-padding-bottom: 200px; }
input:focus, select:focus { scroll-margin-bottom: 100px; }
```

### Problema: Conexiones lentas — primera carga lenta
**Mitigación:** Añadir loading skeleton, mostrar la UI inmediatamente y cargar los datos del JSON inline (ya están en el HTML, no hay petición de red).

## Checklist anti-pitfalls

- [ ] localStorage envuelto en try/catch
- [ ] Cache versioning en SW
- [ ] Números formateados con `Intl.NumberFormat` + dígitos latinos en árabe
- [ ] Factor de depreciación con floor mínimo (0.30)
- [ ] Precio mínimo absoluto (8.000 DH)
- [ ] Instrucciones de instalación manual para iOS
- [ ] URLs de marketplace con target="_blank" + rel="noopener"
- [ ] Fuente árabe con stack de fallbacks locales
- [ ] CSS logical properties para RTL automático
