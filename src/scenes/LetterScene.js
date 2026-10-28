import * as THREE from 'three'
import { gsap } from 'gsap'
import {
  makeTextSprite,
  makeGlowLight,
  makeParticles,
  createDetailedEnvelope
} from '../utils/three-helpers.js'

export class LetterScene {
  constructor({ scene, camera, manager }) {
    this.scene = scene
    this.camera = camera
    this.manager = manager
    this.group = new THREE.Group()

    this.opened = false
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this._onClickBound = this._onClick.bind(this)
    this._onTouchBound = this._onTouch.bind(this)
  }

  async init() {
    this._buildLights()
    this._buildEnvelope()
    this._buildDivergentPaths()
    this._buildAtmosphere()

    this.group.visible = false
    this.scene.add(this.group)

    const closeBtn = document.getElementById('letter-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this._closeLetter()
      })
    }
  }

  _buildLights() {
    const ambient = new THREE.AmbientLight(0x2d0b3f, 0.95)
    const softRose = makeGlowLight(0xff6eb4, 85, 22, -3.5, 3.5, 2.5, 0.1)
    const softViolet = makeGlowLight(0xc084fc, 85, 22, 3.5, 3.5, 1.5, 0.1)
    const keySpot = new THREE.SpotLight(0xfff7ed, 40)
    keySpot.position.set(0, 6, 6)
    keySpot.penumbra = 0.7

    this.group.add(ambient, softRose, softViolet, keySpot)
  }

  _buildEnvelope() {
    const env = createDetailedEnvelope()
    this.env = env
    this.envelopeGroup = env.envelopeGroup
    this.flapPivot = env.flapPivot
    this.sealGroup = env.sealGroup
    this.letterPaper = env.letterPaper

    // Scrapbook Header Banner
    const titleSprite = makeTextSprite('LA CARTA DE CUMPLEAÑOS 💌\n«lo que de verdad quería decirte de corazón»', {
      fontSize: 40,
      fontFace: 'Pacifico, cursive',
      color: '#fff0f8',
      bgColor: 'rgba(28, 4, 42, 0.85)',
      borderColor: '#ff6eb4',
      tapeTop: true,
      padding: 22,
      scale: 4.8
    })
    titleSprite.position.set(0, 3.4, 0)
    this.group.add(titleSprite)

    // Hint Sprite below envelope
    this.envHint = makeTextSprite('💌 Toca el sobre para romper el sello y abrir la carta 💌', {
      fontSize: 30,
      fontFace: 'Indie Flower, cursive',
      color: '#ffd6ec',
      bgColor: 'rgba(25, 4, 38, 0.8)',
      padding: 14,
      scale: 2.2
    })
    this.envHint.position.set(0, -1.5, 0.3)
    this.envelopeGroup.add(this.envHint)

    this.envelopeGroup.position.set(0, 0, 0)
    this.group.add(this.envelopeGroup)
  }

  _buildDivergentPaths() {
    // Two glowing luminous curves in the background symbolizing:
    // "A veces los caminos no van uno al lado del otro, pero eso no significa que sea el final"
    const curve1 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, -3.0, -5),
      new THREE.Vector3(-1.8, 0, -6),
      new THREE.Vector3(-4.0, 3.0, -7),
      new THREE.Vector3(-7.5, 6.0, -9)
    )

    const curve2 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, -3.0, -5),
      new THREE.Vector3(1.8, 0, -6),
      new THREE.Vector3(4.0, 3.0, -7),
      new THREE.Vector3(7.5, 6.0, -9)
    )

    const tubeGeo1 = new THREE.TubeGeometry(curve1, 40, 0.08, 12, false)
    const tubeGeo2 = new THREE.TubeGeometry(curve2, 40, 0.08, 12, false)

    const mat1 = new THREE.MeshStandardMaterial({
      color: 0xff6eb4,
      emissive: 0xff007f,
      emissiveIntensity: 0.85,
      roughness: 0.2
    })
    const mat2 = new THREE.MeshStandardMaterial({
      color: 0x9d4edd,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.85,
      roughness: 0.2
    })

    const p1 = new THREE.Mesh(tubeGeo1, mat1)
    const p2 = new THREE.Mesh(tubeGeo2, mat2)
    this.group.add(p1, p2)
  }

  _buildAtmosphere() {
    this.roseDust = makeParticles(160, 20, 0xfce7f3, 0.04)
    this.violetDust = makeParticles(120, 18, 0xc084fc, 0.04)
    this.group.add(this.roseDust, this.violetDust)
  }

  async enter() {
    this.opened = false
    this.group.visible = true

    this.camera.position.set(0, 0.3, 6.2)
    this.camera.lookAt(0, 0, 0)
    gsap.from(this.camera.position, { z: 11, y: 2.5, duration: 1.6, ease: 'power3.out' })

    // Envelope entrance scale
    this.envelopeGroup.scale.set(0, 0, 0)
    gsap.to(this.envelopeGroup.scale, { x: 1, y: 1, z: 1, duration: 1.0, ease: 'back.out(1.6)' })

    this.manager.setHint('Toca el sobre para abrir la carta 💌', 5000)

    window.addEventListener('click', this._onClickBound)
    window.addEventListener('touchend', this._onTouchBound, { passive: true })
  }

  async exit() {
    window.removeEventListener('click', this._onClickBound)
    window.removeEventListener('touchend', this._onTouchBound)
    document.getElementById('letter-overlay').classList.remove('open')
    this.manager.hideHint()
    this.group.visible = false
  }

  update(delta) {
    const t = performance.now() * 0.001
    if (this.roseDust) this.roseDust.rotation.y += delta * 0.02
    if (this.violetDust) this.violetDust.rotation.y -= delta * 0.015

    if (!this.opened && this.envelopeGroup) {
      this.envelopeGroup.position.y = Math.sin(t * 1.4) * 0.07
      this.envelopeGroup.rotation.y = Math.sin(t * 0.7) * 0.05
    }
  }

  _onClick(e) {
    if (e.target.closest('#scene-nav') || e.target.closest('#letter-overlay')) return
    const ndc = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1
    }
    this._checkHit(ndc)
  }

  _onTouch(e) {
    if (e.changedTouches[0].target.closest('#scene-nav')) return
    const t = e.changedTouches[0]
    const ndc = {
      x: (t.clientX / window.innerWidth) * 2 - 1,
      y: -(t.clientY / window.innerHeight) * 2 + 1
    }
    this._checkHit(ndc)
  }

  _checkHit(ndc) {
    if (this.opened) return
    this.pointer.set(ndc.x, ndc.y)
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObjects(this.envelopeGroup.children, true)
    if (hits.length > 0) {
      this._openLetter()
    }
  }

  _openLetter() {
    this.opened = true
    this.manager.hideHint()

    const tl = gsap.timeline()

    // 1. Lift wax seal
    tl.to(this.sealGroup.position, { z: 0.4, y: 0.6, duration: 0.4, ease: 'power2.out' })
    tl.to(this.sealGroup.scale, { x: 0, y: 0, z: 0, duration: 0.3, ease: 'power2.in' }, '-=0.1')

    // 2. Unfold envelope flap
    tl.to(this.flapPivot.rotation, { x: Math.PI * 0.88, duration: 0.7, ease: 'power2.out' }, '-=0.2')

    // 3. Letter paper slides smoothly out of envelope
    tl.to(this.letterPaper.position, { y: 1.6, z: 0.18, duration: 0.9, ease: 'power2.out' }, '-=0.3')

    // 4. Camera zooms gently into the parchment
    tl.to(this.camera.position, { z: 3.6, y: 0.85, duration: 1.1, ease: 'power2.inOut' }, '-=0.6')

    // 5. Open Reading Overlay with maximum legibility
    setTimeout(() => {
      document.getElementById('letter-overlay').classList.add('open')
    }, 1200)
  }

  _closeLetter() {
    document.getElementById('letter-overlay').classList.remove('open')
    this.opened = false

    const tl = gsap.timeline()
    tl.to(this.letterPaper.position, { y: 0.05, z: -0.01, duration: 0.6, ease: 'power2.in' })
    tl.to(this.flapPivot.rotation, { x: 0, duration: 0.5, ease: 'power2.in' }, '-=0.2')
    tl.to(this.sealGroup.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'back.out(1.5)' })
    tl.to(this.sealGroup.position, { z: 0.08, y: 0.25, duration: 0.4 }, '-=0.4')
    tl.to(this.camera.position, { z: 6.2, y: 0.3, duration: 0.9, ease: 'power2.out' }, '-=0.4')

    this.manager.setHint('Puedes volver a abrir la carta cuando quieras 💌', 3000)
  }
}
