import { gsap } from 'gsap'
import { IntroScene }  from './scenes/IntroScene.js'
import { PhotosScene } from './scenes/PhotosScene.js'
import { AuraScene }   from './scenes/AuraScene.js'
import { LetterScene } from './scenes/LetterScene.js'
import { FinalScene }  from './scenes/FinalScene.js'

export class SceneManager {
  constructor(scene, camera, renderer) {
    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.scenes = {}
    this.current = null
    this.transitioning = false
    this.hint = document.getElementById('hint')
    this.hintText = document.getElementById('hint-text')

    this.musicPlayer = null
    this.photoGallery = null
  }

  async init() {
    const ctx = { scene: this.scene, camera: this.camera, manager: this }

    this.scenes.intro  = new IntroScene(ctx)
    this.scenes.photos = new PhotosScene(ctx)
    this.scenes.aura   = new AuraScene(ctx)
    this.scenes.letter = new LetterScene(ctx)
    this.scenes.final  = new FinalScene(ctx)

    for (const s of Object.values(this.scenes)) {
      await s.init()
    }
  }

  async transitionTo(name) {
    if (this.transitioning || this.current?.name === name) return
    this.transitioning = true

    const next = this.scenes[name]
    if (!next) {
      this.transitioning = false
      return
    }

    // 1. Update Navigation Buttons
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.scene === name)
    })

    // 2. Hide current DOM UI
    document.querySelectorAll('.scene-overlay-ui').forEach(el => {
      el.classList.remove('active')
    })

    // 3. Exit current 3D Scene
    if (this.current) {
      await this.current.exit()
    }

    // 4. Subtle cinematic flash transition
    await this._flash()

    // 5. Activate new DOM UI
    const targetUI = document.getElementById(`scene-${name}-ui`)
    if (targetUI) {
      targetUI.classList.add('active')
      // Reset scroll to top if needed
      targetUI.scrollTop = 0
    }

    // 6. Enter new 3D Scene
    this.current = next
    this.current.name = name
    await next.enter()

    this.transitioning = false
  }

  _flash() {
    return new Promise(resolve => {
      const overlay = document.createElement('div')
      overlay.style.cssText = `
        position: fixed; inset: 0; background: #0b0114; z-index: 400;
        pointer-events: none; opacity: 0;
      `
      document.body.appendChild(overlay)
      gsap.timeline({ onComplete: () => { overlay.remove(); resolve() } })
        .to(overlay, { opacity: 0.85, duration: 0.2, ease: 'power2.in' })
        .to(overlay, { opacity: 0, duration: 0.35, ease: 'power2.out', delay: 0.05 })
    })
  }

  update(delta) {
    this.current?.update(delta)
  }

  setHint(text, duration = 0) {
    if (!this.hintText || !this.hint) return
    this.hintText.textContent = text
    this.hint.classList.remove('hidden')
    if (duration > 0) {
      if (this._hintTimeout) clearTimeout(this._hintTimeout)
      this._hintTimeout = setTimeout(() => this.hideHint(), duration)
    }
  }

  hideHint() {
    if (this.hint) {
      this.hint.classList.add('hidden')
    }
  }
}
