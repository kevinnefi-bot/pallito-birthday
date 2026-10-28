import { gsap } from 'gsap'
import { IntroScene }  from './scenes/IntroScene.js'
import { PhotosScene } from './scenes/PhotosScene.js'
import { AuraScene }   from './scenes/AuraScene.js'
import { LetterScene } from './scenes/LetterScene.js'
import { FinalScene }  from './scenes/FinalScene.js'

export class SceneManager {
  constructor(scene, camera, renderer) {
    this.scene    = scene
    this.camera   = camera
    this.renderer = renderer
    this.scenes   = {}
    this.current  = null
    this.transitioning = false
    this.hint     = document.getElementById('hint')
    this.hintText = document.getElementById('hint-text')
  }

  async init() {
    const ctx = { scene: this.scene, camera: this.camera, manager: this }

    this.scenes.intro  = new IntroScene(ctx)
    this.scenes.photos = new PhotosScene(ctx)
    this.scenes.aura   = new AuraScene(ctx)
    this.scenes.letter = new LetterScene(ctx)
    this.scenes.final  = new FinalScene(ctx)

    for (const s of Object.values(this.scenes)) await s.init()

    // Simulate loading
    await new Promise(r => setTimeout(r, 400))
  }

  async transitionTo(name) {
    if (this.transitioning || this.current?.name === name) return
    this.transitioning = true

    const next = this.scenes[name]
    if (!next) { this.transitioning = false; return }

    // Update nav
    document.querySelectorAll('.nav-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.scene === name)
    })

    // Fade out current scene with camera pull-back
    if (this.current) {
      await this.current.exit()
    }

    // Black flash transition
    await this._flash()

    // Enter new scene
    this.current = next
    this.current.name = name
    await next.enter()

    this.transitioning = false
  }

  _flash() {
    return new Promise(resolve => {
      const overlay = document.createElement('div')
      overlay.style.cssText = `
        position:fixed;inset:0;background:#0a0010;z-index:400;
        pointer-events:none;opacity:0;
      `
      document.body.appendChild(overlay)
      gsap.timeline({ onComplete: () => { overlay.remove(); resolve() } })
        .to(overlay, { opacity: 1, duration: .25, ease: 'power2.in' })
        .to(overlay, { opacity: 0, duration: .4,  ease: 'power2.out', delay: .05 })
    })
  }

  update(delta) {
    this.current?.update(delta)
  }

  setHint(text, duration = 0) {
    this.hintText.textContent = text
    this.hint.classList.remove('hidden')
    if (duration > 0) {
      setTimeout(() => this.hint.classList.add('hidden'), duration)
    }
  }

  hideHint() {
    this.hint.classList.add('hidden')
  }
}
