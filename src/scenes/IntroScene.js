import * as THREE from 'three'
import { gsap }   from 'gsap'
import { makeTextSprite, makeParticles, makeGlowLight } from '../utils/three-helpers.js'

export class IntroScene {
  constructor({ scene, camera, manager }) {
    this.scene   = scene
    this.camera  = camera
    this.manager = manager
    this.group   = new THREE.Group()
    this.titleGroup = new THREE.Group()
    this.tween   = null
    this.opened  = false
    this._raycaster = new THREE.Raycaster()
    this._pointer   = new THREE.Vector2()
    this._onClickBound = this._onClick.bind(this)
    this._onTouchBound = this._onTouch.bind(this)
  }

  async init() {
    this._buildStars()
    this._buildGiftBox()
    this._buildAnnotations()
    this._buildTitleGroup()
    this._buildLights()
    this._buildParticles()

    this.group.visible = false
    this.titleGroup.visible = false
    this.scene.add(this.group)
    this.scene.add(this.titleGroup)
  }

  // ─── Stars background ───
  _buildStars() {
    const geo  = new THREE.BufferGeometry()
    const pos  = new Float32Array(3000)
    for (let i = 0; i < 1000; i++) {
      const r = 60 + Math.random() * 40
      const phi   = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta)
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i*3+2] = r * Math.cos(phi)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat   = new THREE.PointsMaterial({ color: 0xffffff, size: .12, sizeAttenuation: true, transparent: true, opacity: .6 })
    this.stars  = new THREE.Points(geo, mat)
    this.scene.add(this.stars) // stars stay always
  }

  // ─── Gift box ───
  _buildGiftBox() {
    this.boxGroup = new THREE.Group()

    // Box body
    const bodyGeo = new THREE.BoxGeometry(2, 1.8, 2)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1a0030, roughness: .4, metalness: .2,
      emissive: 0x3d006a, emissiveIntensity: .15
    })
    this.boxBody  = new THREE.Mesh(bodyGeo, bodyMat)
    this.boxBody.castShadow = true
    this.boxBody.position.y = -0.1
    this.boxGroup.add(this.boxBody)

    // Lid
    const lidGeo  = new THREE.BoxGeometry(2.12, .45, 2.12)
    const lidMat  = new THREE.MeshStandardMaterial({
      color: 0x2a004a, roughness: .3, metalness: .3,
      emissive: 0x6600aa, emissiveIntensity: .2
    })
    this.boxLid   = new THREE.Mesh(lidGeo, lidMat)
    this.boxLid.castShadow = true
    // Pivot at back edge
    this.lidPivot = new THREE.Group()
    this.lidPivot.position.set(0, 1.0, 1.06)  // hinge along back top edge
    this.boxLid.position.set(0, 0.225, -1.06) // relative to pivot
    this.lidPivot.add(this.boxLid)
    this.boxGroup.add(this.lidPivot)

    // Ribbon vertical
    const ribbonV = this._makeRibbon(0.12, 2.2, 0.12, 0, 0, 0)
    this.boxGroup.add(ribbonV)
    // Ribbon horizontal
    const ribbonH = this._makeRibbon(2.2, 0.12, 0.12, 0, 0, 0)
    this.boxGroup.add(ribbonH)

    // Bow top
    this._buildBow()

    this.boxGroup.position.set(0, -.3, 0)
    this.group.add(this.boxGroup)

    // Click target reference
    this._clickTargets = [this.boxBody, this.boxLid]
  }

  _makeRibbon(w, h, d, x, y, z) {
    const geo = new THREE.BoxGeometry(w, h, d)
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff6eb4, roughness: .5, metalness: 0,
      emissive: 0xff6eb4, emissiveIntensity: .3
    })
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    return m
  }

  _buildBow() {
    const mat = new THREE.MeshStandardMaterial({ color: 0xff6eb4, roughness: .5, emissive: 0xff6eb4, emissiveIntensity: .4 })
    for (let side = -1; side <= 1; side += 2) {
      const geo  = new THREE.TorusGeometry(.35, .07, 8, 16, Math.PI)
      const torus = new THREE.Mesh(geo, mat)
      torus.position.set(side * .28, 1.25, 0)
      torus.rotation.z = side * Math.PI / 4
      torus.rotation.x = Math.PI / 2
      this.boxGroup.add(torus)
    }
  }

  // ─── Annotation sprites ───
  _buildAnnotations() {
    const annotations = [
      { text: '«bueno pallito, hice una cosa xd»',   pos: [-3.2, 1.8,  -1], delay: .5 },
      { text: '«no es una plantilla de capcut»',       pos: [ 3.0, 2.2,  -2], delay: 1.2 },
      { text: '«tampoco es de internet»',              pos: [-2.5, -.5,  -1], delay: 1.8 },
      { text: '«me dio por hacer esto, ahora aguántate»', pos: [ 2.8, -.8, -2], delay: 2.4 },
    ]

    this.annotSprites = []
    annotations.forEach(({ text, pos, delay }) => {
      const sprite = makeTextSprite(text, {
        fontSize: 38, color: '#ff6eb4', fontFace: 'Indie Flower, cursive',
        bgColor: 'rgba(20,0,40,0.75)', padding: 18, scale: 2.8
      })
      sprite.position.set(...pos)
      sprite.material.opacity = 0
      this.group.add(sprite)
      this.annotSprites.push({ sprite, delay })
    })
  }

  // ─── Title ───
  _buildTitleGroup() {
    const main = makeTextSprite('FELIZ CUMPLEAÑOS\nPALLITO LAS PATAS', {
      fontSize: 72, color: '#ff6eb4', fontFace: 'Pacifico, cursive',
      bold: true, bgColor: null, padding: 30, scale: 7
    })
    main.position.set(0, 1.5, 0)
    this.titleGroup.add(main)

    const sub = makeTextSprite('by Kev, yo pues quién más xd 💜', {
      fontSize: 38, color: '#c084fc', fontFace: 'Indie Flower, cursive',
      padding: 16, scale: 4
    })
    sub.position.set(0, -1.2, 0)
    this.titleGroup.add(sub)

    const hint = makeTextSprite('↓  explora el universo  ↓', {
      fontSize: 32, color: '#ffffff', padding: 12, scale: 3
    })
    hint.position.set(0, -2.6, 0)
    this.titleGroup.add(hint)
  }

  // ─── Lights ───
  _buildLights() {
    const ambient = new THREE.AmbientLight(0x1a0030, .6)
    this.group.add(ambient)

    const pink  = makeGlowLight(0xff6eb4, 80, 20, -3, 3, 3, 0.1)
    const purp  = makeGlowLight(0xa855f7, 80, 20,  3, 2, -2, 0.1)
    const white = makeGlowLight(0xffffff, 20, 15,  0, 5, 2, 0)
    this.group.add(pink, purp, white)

    this.pinkLightRef  = pink.children[0]  // PointLight
    this.purpleLightRef = purp.children[0]
  }

  // ─── Particles ───
  _buildParticles() {
    this.particles1 = makeParticles(200, 20, 0xff6eb4, .05)
    this.particles2 = makeParticles(150, 15, 0xa855f7, .04)
    this.group.add(this.particles1, this.particles2)
  }

  // ─── Enter ───
  async enter() {
    this.opened = false
    this.group.visible = true
    this.titleGroup.visible = false

    // Camera
    this.camera.position.set(0, 2, 10)
    this.camera.lookAt(0, 0, 0)
    gsap.from(this.camera.position, { z: 16, duration: 1.6, ease: 'power3.out' })

    this.manager.setHint('Toca la caja de regalo para abrirla')

    // Animate box in
    this.boxGroup.scale.set(0, 0, 0)
    gsap.to(this.boxGroup.scale, { x: 1, y: 1, z: 1, duration: .8, ease: 'back.out(1.7)' })

    // Annotations fade in sequentially
    this.annotSprites.forEach(({ sprite, delay }) => {
      gsap.to(sprite.material, { opacity: 1, duration: .6, delay: delay + .5, ease: 'power2.out' })
    })

    // Pulse lights
    this._pulseTween = gsap.to(this.pinkLightRef, {
      intensity: 120, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut'
    })

    // Listen for interaction
    window.addEventListener('click', this._onClickBound)
    window.addEventListener('touchend', this._onTouchBound, { passive: true })
  }

  // ─── Exit ───
  async exit() {
    window.removeEventListener('click', this._onClickBound)
    window.removeEventListener('touchend', this._onTouchBound)
    this._pulseTween?.kill()
    this.manager.hideHint()

    await new Promise(r => {
      gsap.to(this.group, { duration: .3, onComplete: r })
    })
    this.group.visible = false
    this.titleGroup.visible = false
  }

  // ─── Update ───
  update(delta) {
    const t = performance.now() * 0.001
    // Float box
    if (this.boxGroup) {
      this.boxGroup.position.y = -0.3 + Math.sin(t * 0.7) * 0.12
      this.boxGroup.rotation.y += delta * 0.15
    }
    // Rotate particles
    if (this.particles1) this.particles1.rotation.y += delta * 0.04
    if (this.particles2) this.particles2.rotation.y -= delta * 0.03
    // Stars slow rotation
    if (this.stars) this.stars.rotation.y += delta * 0.005

    // Title float
    if (this.titleGroup.visible) {
      this.titleGroup.position.y = Math.sin(t * 0.5) * 0.08
    }
  }

  // ─── Interaction ───
  _getPointerNDC(x, y) {
    return {
      x:  (x / window.innerWidth)  * 2 - 1,
      y: -(y / window.innerHeight) * 2 + 1
    }
  }

  _onClick(e) {
    if (this.opened) return
    const ndc = this._getPointerNDC(e.clientX, e.clientY)
    this._checkHit(ndc.x, ndc.y)
  }

  _onTouch(e) {
    if (this.opened) return
    const t = e.changedTouches[0]
    const ndc = this._getPointerNDC(t.clientX, t.clientY)
    this._checkHit(ndc.x, ndc.y)
  }

  _checkHit(ndcX, ndcY) {
    this._pointer.set(ndcX, ndcY)
    this._raycaster.setFromCamera(this._pointer, this.camera)
    const hits = this._raycaster.intersectObjects(this._clickTargets, true)
    if (hits.length > 0) this._openBox()
  }

  _openBox() {
    this.opened = true
    this.manager.hideHint()

    const tl = gsap.timeline({ onComplete: () => this._revealTitle() })

    // Lid opens (rotate around back hinge)
    tl.to(this.lidPivot.rotation, {
      x: -Math.PI * 0.9,
      duration: 1.0,
      ease: 'back.out(1.2)'
    })

    // Light burst
    tl.to(this.pinkLightRef, { intensity: 300, duration: .3, ease: 'power4.out' }, '-=.3')
    tl.to(this.pinkLightRef, { intensity: 80,  duration: .8, ease: 'power2.in' })

    // Camera push in and up
    tl.to(this.camera.position, { z: 6, y: 3, duration: 1.4, ease: 'power2.inOut' }, '-=1.0')

    // Box particles burst
    this._burstParticles()
  }

  _burstParticles() {
    for (let i = 0; i < 3; i++) {
      const burst = makeParticles(80, 4, i % 2 === 0 ? 0xff6eb4 : 0xa855f7, .08)
      burst.position.set(0, .5, 0)
      this.group.add(burst)
      gsap.to(burst.position, { y: 4, duration: 1.5, ease: 'power2.out' })
      gsap.to(burst.material, { opacity: 0, duration: 1.5, delay: .5, onComplete: () => {
        this.group.remove(burst)
        burst.geometry.dispose()
      }})
    }
  }

  _revealTitle() {
    this.titleGroup.visible = true
    this.titleGroup.position.set(0, 0, -2)

    // Hide box
    gsap.to(this.boxGroup.scale, { x: 0, y: 0, z: 0, duration: .5, ease: 'power2.in' })

    // Hide annotations
    this.annotSprites.forEach(({ sprite }) => {
      gsap.to(sprite.material, { opacity: 0, duration: .4 })
    })

    // Camera reset for title view
    gsap.to(this.camera.position, { x: 0, y: 0, z: 8, duration: 1.4, ease: 'power2.out' })

    // Title appears
    this.titleGroup.children.forEach((c, i) => {
      if (c.material) c.material.opacity = 0
      gsap.to(c.material, { opacity: 1, duration: .8, delay: i * .3 })
    })

    this.manager.setHint('Usa la barra inferior para explorar 👇', 6000)
  }
}
