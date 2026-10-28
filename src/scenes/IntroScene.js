import * as THREE from 'three'
import { gsap }   from 'gsap'
import {
  makeTextSprite,
  makeParticles,
  makeGlowLight,
  createLuxuryGiftBox
} from '../utils/three-helpers.js'

export class IntroScene {
  constructor({ scene, camera, manager }) {
    this.scene   = scene
    this.camera  = camera
    this.manager = manager
    this.group   = new THREE.Group()
    this.titleGroup = new THREE.Group()
    this.opened  = false
    this._raycaster = new THREE.Raycaster()
    this._pointer   = new THREE.Vector2()
    this._onClickBound = this._onClick.bind(this)
    this._onTouchBound = this._onTouch.bind(this)
  }

  async init() {
    this._buildStars()
    this._buildGiftBox()
    this._buildScrapbookNotes()
    this._buildTitleGroup()
    this._buildLights()
    this._buildAtmosphere()

    this.group.visible = false
    this.titleGroup.visible = false
    this.scene.add(this.group)
    this.scene.add(this.titleGroup)
  }

  _buildStars() {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(3600)
    for (let i = 0; i < 1200; i++) {
      const r = 50 + Math.random() * 50
      const phi   = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({
      color: 0xffd6ec,
      size: 0.16,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.75
    })
    this.stars = new THREE.Points(geo, mat)
    this.scene.add(this.stars)
  }

  _buildGiftBox() {
    const { boxGroup, boxBody, boxLid, lidPivot, clickTargets } = createLuxuryGiftBox()
    this.boxGroup = boxGroup
    this.boxBody = boxBody
    this.boxLid = boxLid
    this.lidPivot = lidPivot
    this._clickTargets = clickTargets

    // Fairy glow inside box waiting to burst out
    this.boxInteriorLight = new THREE.PointLight(0xff00d4, 0, 8)
    this.boxInteriorLight.position.set(0, 0.4, 0)
    this.boxGroup.add(this.boxInteriorLight)

    this.boxGroup.position.set(0, -0.2, 0)
    this.group.add(this.boxGroup)
  }

  _buildScrapbookNotes() {
    const notes = [
      { text: '«bueno pallito, hice una cosa xd»',   pos: [-3.4, 1.8, -0.5], delay: 0.4, rot: -0.06 },
      { text: '«no es una plantilla de capcut 🎬»',   pos: [3.4, 2.0, -1.2], delay: 0.9, rot: 0.05 },
      { text: '«tampoco es copiado de internet»',    pos: [-3.2, -0.8, -0.8], delay: 1.4, rot: 0.04 },
      { text: '«me dio por hacer esto, ahora aguántate»', pos: [3.2, -0.9, -1.0], delay: 1.9, rot: -0.05 }
    ]

    this.noteSprites = []
    notes.forEach(({ text, pos, delay, rot }) => {
      const sprite = makeTextSprite(text, {
        fontSize: 34,
        color: '#ffd6ec',
        fontFace: 'Indie Flower, cursive',
        bgColor: 'rgba(30, 8, 48, 0.85)',
        borderColor: '#a855f7',
        tapeTop: true,
        padding: 16,
        scale: 2.7
      })
      sprite.position.set(...pos)
      sprite.material.opacity = 0
      this.group.add(sprite)
      this.noteSprites.push({ sprite, delay, rot })
    })
  }

  _buildTitleGroup() {
    // 3D Scrapbook Header Banner
    const main = makeTextSprite('FELIZ CUMPLEAÑOS\nPALLITO LAS PATAS 🎂💜', {
      fontSize: 66,
      color: '#fff0f8',
      fontFace: 'Pacifico, cursive',
      bold: true,
      bgColor: 'rgba(25, 4, 40, 0.88)',
      borderColor: '#ff6eb4',
      padding: 26,
      scale: 6.8
    })
    main.position.set(0, 1.8, 0)
    this.titleGroup.add(main)

    const sub = makeTextSprite('by Kev, yo pues quién más xd ✨\n«+10000 de aura acumulada hoy»', {
      fontSize: 36,
      color: '#ffd6ec',
      fontFace: 'Indie Flower, cursive',
      bgColor: 'rgba(40, 10, 60, 0.8)',
      padding: 16,
      scale: 4.2
    })
    sub.position.set(0, -0.8, 0)
    this.titleGroup.add(sub)

    const hint = makeTextSprite('👇  Usa la barra inferior para explorar el universo  👇', {
      fontSize: 28,
      color: '#e9d5ff',
      bgColor: 'rgba(15, 0, 30, 0.75)',
      padding: 12,
      scale: 3.2
    })
    hint.position.set(0, -2.4, 0)
    this.titleGroup.add(hint)
  }

  _buildLights() {
    const ambient = new THREE.AmbientLight(0x2d0b4d, 0.85)
    this.group.add(ambient)

    // Key magenta and violet rim lights
    this.pinkLight = makeGlowLight(0xff3399, 110, 25, -4, 4, 3, 0.12)
    this.purpleLight = makeGlowLight(0x9d4edd, 100, 25, 4, 3, -2, 0.12)
    this.warmTopLight = new THREE.DirectionalLight(0xfff5ea, 1.2)
    this.warmTopLight.position.set(0, 8, 4)
    this.warmTopLight.castShadow = true

    this.group.add(this.pinkLight, this.purpleLight, this.warmTopLight)
  }

  _buildAtmosphere() {
    this.fairyDust = makeParticles(240, 22, 0xff77cc, 0.05)
    this.goldenDust = makeParticles(160, 18, 0xfcd34d, 0.04)
    this.group.add(this.fairyDust, this.goldenDust)
  }

  async enter() {
    this.opened = false
    this.group.visible = true
    this.titleGroup.visible = false

    this.camera.position.set(0, 1.8, 9.5)
    this.camera.lookAt(0, 0, 0)
    gsap.from(this.camera.position, { z: 15, y: 3.5, duration: 1.8, ease: 'power3.out' })

    this.manager.setHint('Toca la caja de regalo para abrir tu sorpresa 🎁', 6000)

    // Intro gift pop-in
    this.boxGroup.scale.set(0, 0, 0)
    gsap.to(this.boxGroup.scale, { x: 1, y: 1, z: 1, duration: 1.0, ease: 'back.out(1.8)' })

    // Staggered note sprites fade-in
    this.noteSprites.forEach(({ sprite, delay }) => {
      gsap.to(sprite.material, { opacity: 1, duration: 0.7, delay: delay + 0.4, ease: 'power2.out' })
    })

    window.addEventListener('click', this._onClickBound)
    window.addEventListener('touchend', this._onTouchBound, { passive: true })
  }

  async exit() {
    window.removeEventListener('click', this._onClickBound)
    window.removeEventListener('touchend', this._onTouchBound)
    this.manager.hideHint()

    await new Promise(r => {
      gsap.to(this.group, { duration: 0.35, onComplete: r })
    })
    this.group.visible = false
    this.titleGroup.visible = false
  }

  update(delta) {
    const t = performance.now() * 0.001
    if (this.boxGroup && !this.opened) {
      this.boxGroup.position.y = -0.2 + Math.sin(t * 1.3) * 0.1
      this.boxGroup.rotation.y += delta * 0.22
    }

    if (this.fairyDust) this.fairyDust.rotation.y += delta * 0.03
    if (this.goldenDust) this.goldenDust.rotation.y -= delta * 0.02
    if (this.stars) this.stars.rotation.y += delta * 0.004

    if (this.titleGroup.visible) {
      this.titleGroup.position.y = Math.sin(t * 0.8) * 0.08
    }
  }

  _onClick(e) {
    if (this.opened) return
    const ndc = {
      x:  (e.clientX / window.innerWidth)  * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1
    }
    this._checkHit(ndc)
  }

  _onTouch(e) {
    if (this.opened) return
    const t = e.changedTouches[0]
    const ndc = {
      x:  (t.clientX / window.innerWidth)  * 2 - 1,
      y: -(t.clientY / window.innerHeight) * 2 + 1
    }
    this._checkHit(ndc)
  }

  _checkHit(ndc) {
    this._pointer.set(ndc.x, ndc.y)
    this._raycaster.setFromCamera(this._pointer, this.camera)
    const hits = this._raycaster.intersectObjects(this._clickTargets, true)
    if (hits.length > 0) this._openBox()
  }

  _openBox() {
    this.opened = true
    this.manager.hideHint()

    const tl = gsap.timeline({ onComplete: () => this._revealTitle() })

    // Hinge lid open smoothly
    tl.to(this.lidPivot.rotation, {
      x: -Math.PI * 0.88,
      duration: 1.2,
      ease: 'back.out(1.4)'
    })

    // Magical light burst from interior
    tl.to(this.boxInteriorLight, { intensity: 450, duration: 0.4, ease: 'power4.out' }, '-=0.4')
    tl.to(this.boxInteriorLight, { intensity: 80, duration: 0.8, ease: 'power2.in' })

    // Camera dramatic swoosh
    tl.to(this.camera.position, { z: 5.5, y: 2.8, duration: 1.5, ease: 'power2.inOut' }, '-=1.1')

    this._burstParticles()
  }

  _burstParticles() {
    for (let i = 0; i < 4; i++) {
      const burst = makeParticles(90, 4.5, i % 2 === 0 ? 0xff00aa : 0xfcd34d, 0.08)
      burst.position.set(0, 0.5, 0)
      this.group.add(burst)

      gsap.to(burst.position, { y: 4.5, duration: 1.8, ease: 'power2.out' })
      gsap.to(burst.material, {
        opacity: 0,
        duration: 1.8,
        delay: 0.4,
        onComplete: () => {
          this.group.remove(burst)
          burst.geometry.dispose()
        }
      })
    }
  }

  _revealTitle() {
    this.titleGroup.visible = true
    this.titleGroup.position.set(0, 0, -1.8)

    // Fade out gift box & notes
    gsap.to(this.boxGroup.scale, { x: 0, y: 0, z: 0, duration: 0.6, ease: 'power2.in' })
    this.noteSprites.forEach(({ sprite }) => {
      gsap.to(sprite.material, { opacity: 0, duration: 0.4 })
    })

    // Reset camera for title presentation
    gsap.to(this.camera.position, { x: 0, y: 0, z: 8.4, duration: 1.5, ease: 'power2.out' })

    // Title reveal stagger
    this.titleGroup.children.forEach((c, i) => {
      if (c.material) c.material.opacity = 0
      gsap.to(c.material, { opacity: 1, duration: 0.9, delay: i * 0.35, ease: 'power2.out' })
    })

    this.manager.setHint('Usa la barra inferior para recorrer los recuerdos y sorpresas 👇', 6000)
  }
}
