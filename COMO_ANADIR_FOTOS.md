# 📸 Guía: Cómo Añadir Más Fotos a la Galería

La galería de **Pallito Birthday 2026** está diseñada para ser completamente dinámica y extensible. No está limitada a 6 fotos; puedes tener 10, 20 o más sin romper el diseño ni la maquetación responsive.

---

## Pasos Rápidos

### 1. Guardar la nueva fotografía
Coloca el archivo de imagen dentro de la carpeta:
```
public/images/
```
*Ejemplo:* `public/images/viaje_playa_2026.jpg`

> **Recomendación:** Se admiten formatos `.jpg`, `.png`, `.webp`. Si la foto es muy pesada, redúcela a menos de 2 MB para que cargue rápido.

---

### 2. Registrar la foto en `src/data/photos.js`
Abre el archivo [src/data/photos.js](./src/data/photos.js) y añade un nuevo objeto al array `photos`:

```javascript
{
  id: 7, // Incrementa el número de ID
  src: './images/viaje_playa_2026.jpg', // Ruta relativa exacta
  alt: 'Recuerdo en la playa con Pallito',
  title: 'Tarde de Playa 🏖️',
  subtitle: 'Día soleado y anécdotas de sobra',
  note: 'Un recuerdo más para la colección legendaria.',
  date: 'Agosto 2026',
  tag: '🌊 Playa',
  rotation: -1.5 // Ligera rotación estética opcional (-3 a 3)
},
```

---

### 3. Compilar y publicar
Ejecuta en tu terminal:
```bash
npm run build
```

Haz commit y sube los cambios a GitHub:
```bash
git add public/images/ src/data/photos.js
git commit -m "Añadir nueva fotografía a la galería de Pallito"
git push origin main
```

Render detectará automáticamente el cambio en `main` y publicará la nueva galería con la foto añadida.

---

## Características de la Galería
- **Carga diferida (`loading="lazy"`)**: Las imágenes no ralentizan la página de inicio.
- **Lightbox de alta resolución**: Al pulsar sobre cualquier foto, se abre un visor a pantalla completa con navegación Anterior / Siguiente y teclas de dirección.
- **Estilo Polaroid Scrapbook**: Con detalles de washi tape, sombras suaves y notas manuscritas elegantes.
