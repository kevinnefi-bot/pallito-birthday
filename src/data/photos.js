/**
 * ============================================================================
 * PALLITO BIRTHDAY — ARCHIVO CENTRAL DE FOTOGRAFÍAS Y RECUERDOS
 * ============================================================================
 *
 * ¿CÓMO AÑADIR MÁS FOTOS EN EL FUTURO?
 * ----------------------------------------------------------------------------
 * 1. Guarda la nueva imagen dentro de la carpeta: `public/images/`
 *    Ejemplo: `public/images/mi-nueva-foto.jpg`
 *
 * 2. Copia y pega uno de los bloques de abajo al final de la lista `photos`.
 *    Asegúrate de poner la ruta relativa: `./images/mi-nueva-foto.jpg`
 *
 * 3. Completa los campos:
 *    - `title`: Título corto del momento.
 *    - `subtitle`: Subtítulo o frase graciosa.
 *    - `note`: Anotación tipo "scrapbook" manuscrita.
 *    - `date`: Fecha aproximada o momento.
 *    - `tag`: Etiqueta distintiva (ej. "✨ Legendario", "💜 Inolvidable").
 *    - `alt`: Descripción para accesibilidad.
 *
 * 4. Guarda este archivo, ejecuta `npm run build` y haz commit a GitHub.
 *    ¡La galería se adaptará automáticamente sin importar cuántas fotos añadas!
 * ============================================================================
 */

export const photos = [
  {
    id: 1,
    src: './images/IMG_20260712_093118_130.png',
    alt: 'Vibe nocturna, plano cenital y dúo definitivo',
    title: 'Vibe Nocturna 🌙',
    subtitle: 'El dúo definitivo con +10000 de aura acumulada',
    note: 'Plano cenital, gafas y pura coordinación.',
    date: '12 Julio 2026',
    tag: '✨ Legendario',
    rotation: -1.8
  },
  {
    id: 2,
    src: './images/IMG_20260501_232148_294.png',
    alt: 'Encuentro con lentes y coordinación facial',
    title: 'Lentes Squad 👓',
    subtitle: 'Coordinación facial y estilo impecable',
    note: 'Dos personas con gafas y la mejor energía del lugar.',
    date: '01 Mayo 2026',
    tag: '🕶️ Icónico',
    rotation: 1.5
  },
  {
    id: 3,
    src: './images/IMG_20260501_232155_451.png',
    alt: 'Tickets en mano y modo aventura activado',
    title: 'Modo Aventura 🎟️',
    subtitle: 'Tickets en mano y sonrisa de que esto sale bien',
    note: 'Listos para lo que venga. Fondo colorido y buena vibra.',
    date: '01 Mayo 2026',
    tag: '🎟️ Aventura',
    rotation: -1.2
  },
  {
    id: 4,
    src: './images/IMG_20260501_232207_432.png',
    alt: 'La mirada histórica legendaria',
    title: 'La Mirada Legendaria 👀',
    subtitle: '−10000 de aura inmediata a quien se pase de listo',
    note: 'Esa foto que no se puede replicar: simplemente existe.',
    date: '01 Mayo 2026',
    tag: '🔥 Peligro',
    rotation: 2.1
  },
  {
    id: 5,
    src: './images/IMG-20260712-WA0089.jpg',
    alt: 'Sesión de sofá y Pepsi en modo chill maestro',
    title: 'Sofá + Pepsi 🛋️',
    subtitle: 'Chill mode: nivel maestro indiscutible',
    note: 'Pepsi, noche y la mejor compañía para una velada top.',
    date: '12 Julio 2026',
    tag: '🥤 Relax',
    rotation: -1.6
  },
  {
    id: 6,
    src: './images/IMG_20260712_092349_950.webp',
    alt: 'Dúo imparable siempre juntos',
    title: 'Dúo Imparable 💫',
    subtitle: 'Siempre icónicos, nunca in-icónicos',
    note: 'Todos los momentos, todas las risas. Compañeros de ruta.',
    date: '12 Julio 2026',
    tag: '💜 Siempre',
    rotation: 1.2
  }
]
