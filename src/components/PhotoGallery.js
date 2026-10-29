/**
 * ============================================================================
 * PHOTO GALLERY COMPONENT (ÁLBUM SCRAPBOOK & LIGHTBOX EDITORIAL)
 * ============================================================================
 * Renderiza dinámicamente las fotografías desde `src/data/photos.js`
 * Proporciona un visor Lightbox con navegación completa y soporte de teclado.
 * ============================================================================
 */

import { photos } from '../data/photos.js'

export class PhotoGallery {
  constructor() {
    this.photos = photos
    this.currentIndex = 0
    this.container = null
    this.lightbox = null
    this.lightboxImg = null
    this.lightboxTitle = null
    this.lightboxSubtitle = null
    this.lightboxNote = null
    this.lightboxDate = null
    this.lightboxTag = null
    this.lightboxCounter = null
  }

  init() {
    this._renderGallery()
    this._initLightbox()
  }

  _renderGallery() {
    const grid = document.getElementById('photos-grid')
    if (!grid) return

    grid.innerHTML = ''

    this.photos.forEach((photo, index) => {
      const card = document.createElement('article')
      card.className = 'photo-card'
      card.dataset.index = index
      card.style.setProperty('--card-rot', `${photo.rotation || 0}deg`)

      // Washi tape style variant
      const tapeStyle = (index % 2 === 0) ? 'tape-left' : 'tape-center'

      card.innerHTML = `
        <div class="photo-washi-tape ${tapeStyle}"></div>
        <div class="photo-polaroid-frame">
          <div class="photo-img-wrap">
            <img src="${photo.src}" alt="${photo.alt}" loading="lazy" />
            <span class="photo-tag-pill">${photo.tag || '💜 Recuerdo'}</span>
          </div>
          <div class="photo-caption">
            <h3 class="photo-card-title">${photo.title}</h3>
            <p class="photo-card-subtitle">${photo.subtitle}</p>
            <div class="photo-card-footer">
              <span class="photo-card-note">«${photo.note}»</span>
              <span class="photo-card-date">${photo.date}</span>
            </div>
          </div>
        </div>
      `

      card.addEventListener('click', () => {
        this.openLightbox(index)
      })

      grid.appendChild(card)
    })
  }

  _initLightbox() {
    let lb = document.getElementById('photo-lightbox')
    if (!lb) {
      lb = document.createElement('div')
      lb.id = 'photo-lightbox'
      lb.className = 'photo-lightbox'
      lb.innerHTML = `
        <div class="lightbox-backdrop" id="lb-backdrop"></div>
        <div class="lightbox-dialog" role="dialog" aria-modal="true">
          <button class="lightbox-close" id="lb-close" aria-label="Cerrar vista ampliada">✕</button>

          <button class="lightbox-nav-btn prev" id="lb-prev" aria-label="Foto anterior">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>

          <div class="lightbox-content">
            <div class="lightbox-media">
              <img id="lb-img" src="" alt="" />
            </div>
            <div class="lightbox-info">
              <div class="lightbox-header-row">
                <span class="lightbox-tag" id="lb-tag"></span>
                <span class="lightbox-counter" id="lb-counter"></span>
              </div>
              <h2 class="lightbox-title" id="lb-title"></h2>
              <p class="lightbox-subtitle" id="lb-subtitle"></p>
              <div class="lightbox-note-box">
                <span class="lightbox-note-quote" id="lb-note"></span>
              </div>
              <div class="lightbox-footer">
                <span class="lightbox-date" id="lb-date"></span>
                <span class="lightbox-hint">Usa las flechas del teclado ◀ ▶ para navegar</span>
              </div>
            </div>
          </div>

          <button class="lightbox-nav-btn next" id="lb-next" aria-label="Foto siguiente">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        </div>
      `
      document.body.appendChild(lb)
    }

    this.lightbox = lb
    this.lightboxImg = lb.querySelector('#lb-img')
    this.lightboxTitle = lb.querySelector('#lb-title')
    this.lightboxSubtitle = lb.querySelector('#lb-subtitle')
    this.lightboxNote = lb.querySelector('#lb-note')
    this.lightboxDate = lb.querySelector('#lb-date')
    this.lightboxTag = lb.querySelector('#lb-tag')
    this.lightboxCounter = lb.querySelector('#lb-counter')

    // Handlers
    lb.querySelector('#lb-close').addEventListener('click', () => this.closeLightbox())
    lb.querySelector('#lb-backdrop').addEventListener('click', () => this.closeLightbox())
    lb.querySelector('#lb-prev').addEventListener('click', (e) => {
      e.stopPropagation()
      this.prev()
    })
    lb.querySelector('#lb-next').addEventListener('click', (e) => {
      e.stopPropagation()
      this.next()
    })

    window.addEventListener('keydown', (e) => {
      if (!this.lightbox.classList.contains('open')) return
      if (e.key === 'Escape') this.closeLightbox()
      if (e.key === 'ArrowLeft') this.prev()
      if (e.key === 'ArrowRight') this.next()
    })
  }

  openLightbox(index) {
    if (index < 0 || index >= this.photos.length) return
    this.currentIndex = index
    this._updateLightboxContent()
    this.lightbox.classList.add('open')
    document.body.style.overflow = 'hidden'
  }

  closeLightbox() {
    this.lightbox.classList.remove('open')
    document.body.style.overflow = ''
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.photos.length
    this._updateLightboxContent()
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.photos.length) % this.photos.length
    this._updateLightboxContent()
  }

  _updateLightboxContent() {
    const photo = this.photos[this.currentIndex]
    if (!photo) return

    this.lightboxImg.src = photo.src
    this.lightboxImg.alt = photo.alt
    this.lightboxTitle.textContent = photo.title
    this.lightboxSubtitle.textContent = photo.subtitle
    this.lightboxNote.textContent = `«${photo.note}»`
    this.lightboxDate.textContent = photo.date
    this.lightboxTag.textContent = photo.tag || '💜 Recuerdo'
    this.lightboxCounter.textContent = `${this.currentIndex + 1} / ${this.photos.length}`
  }
}
