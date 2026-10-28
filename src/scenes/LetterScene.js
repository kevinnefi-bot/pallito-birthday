import * as THREE from 'three'
import { gsap } from 'gsap'
import { makeTextSprite, makeGlowLight, makeParticles } from '../utils/three-helpers.js'

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

    // Wire letter close button
    const closeBtn = document.getElementById('letter-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this._closeLetter()
      })
    }
  }

  _buildLights() {
    const ambient = new THREE.AmbientLight(0x280d38, 0.9)
    const softPink = makeGlowLight(0xff6eb4, 80, 20, -3, 3, 2, 0.1)
    const softLilac = makeGlowLight(0xc084fc, 80, 20, 3, 3, 1, 0.1)
    const centerSpot = new THREE.SpotLight(0xfff5ea, 35)
    centerSpot.position.set(0, 5, 5)
    centerSpot.penumbra = 0.6
    this.group.add(ambient, softPink, softLilac, centerSpot)
  }

  _buildEnvelope() {
    this.envelopeGroup = new THREE.Group()

    // Envelope body
    const bodyGeo = new THREE.BoxGeometry(2.8, 1.9, 0.1)
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xfce7f3,
      roughness: 0.5,
      metalness: 0.05
    })
    const body = new THREE.Mesh(bodyGeo, bodyMat)
    body.castShadow = true
    this.envelopeGroup.add(body)

    // Wax seal in the center
    const sealGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 24)
    const sealMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.4,
      roughness: 0.3
    })
    const seal = new THREE.Mesh(sealGeo, sealMat)
    seal.rotation.x = Math.PI / 2
    seal.position.set(0, 0, 0.08)
    this.envelopeGroup.add(seal)

    // Heart icon on seal
    const sealText = makeTextSprite('💜', { fontSize: 32, padding: 4, scale: 0.5 })
    sealText.position.set(0, 0, 0.13)
    this.envelopeGroup.add(sealText)

    // Flap
    const flapGeo = new THREE.ConeGeometry(1.4, 0.95, 3)
    const flapMat = new THREE.MeshStandardMaterial({
      color: 0xf5d0fe,
      roughness: 0.5
    })
    this.flap = new THREE.Mesh(flapGeo, flapMat)
    this.flap.rotation.z = Math.PI
    this.flap.position.set(0, 0.48, 0.06)
    this.flapPivot = new THREE.Group()
    this.flapPivot.position.set(0, 0.95, 0.05)
    this.flap.position.set(0, -0.475, 0.01)
    this.flapPivot.add(this.flap)
    this.envelopeGroup.add(this.flapPivot)

    // Envelope Letter Paper (peeking out)
    const paperGeo = new THREE.BoxGeometry(2.5, 1.7, 0.04)
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 })
    this.letterPaper = new THREE.Mesh(paperGeo, paperMat)
    this.letterPaper.position.set(0, 0, -0.01)
    this.envelopeGroup.add(this.letterPaper)

    // Hint sprite under envelope
    this.envHint = makeTextSprite('💌 Toca el sobre para abrir la carta 💌', {
      fontSize: 32,
      color: '#ffd6ec',
      fontFace: 'Indie Flower, cursive',
      bgColor: 'rgba(20, 5, 35, 0.75)',
      padding: 12,
      scale: 2.2
    })
    this.envHint.position.set(0, -1.4, 0.2)
    this.envelopeGroup.add(this.envHint)

    this.envelopeGroup.position.set(0, 0, 0)
    this.group.add(this.envelopeGroup)
  }

  _buildDivergentPaths() {
    // Two glowing curved light paths in the background symbolizing:
    // "A veces los caminos no siempre van uno al lado del otro, pero eso no significa que sea el final"
    const curve1 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, -2.5, -4),
      new THREE.Vector3(-1.5, 0, -5),
      new THREE.Vector3(-3.5, 2.5, -6),
      new THREE.Vector3(-6, 5, -8)
    )

    const curve2 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, -2.5, -4),
      new THREE.Vector3(1.5, 0, -5),
      new THREE.Vector3(3.5, 2.5, -6),
      new THREE.Vector3(6, 5, -8)
    )

    const tubeGeo1 = new THREE.TubeGeometry(curve1, 32, 0.06, 8, false)
    const tubeGeo2 = new THREE.TubeGeometry(curve2, 32, 0.06, 8, false)

    const pathMat1 = new THREE.MeshStandardMaterial({
      color: 0xff6eb4,
      emissive: 0xff6eb4,
      emissiveIntensity: 0.8
    })
    const pathMat2 = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xa855f7,
      emissiveIntensity: 0.8
    })

    const p1 = new THREE.Mesh(tubeGeo1, pathMat1)
    const p2 = new THREE.Mesh(tubeGeo2, pathMat2)
    this.group.add(p1, p2)
  }

  _buildAtmosphere() {
    this.particles = makeParticles(150, 20, 0xfce7f3, 0.04)
    this.group.add(this.particles)

    const titleSprite = makeTextSprite('LA CARTA DE CUMPLEAÑOS 💌\n«lo que de verdad quería decirte»', {
      fontSize: 42,
      color: '#ffd6ec',
      fontFace: 'Pacifico, cursive',
      bgColor: 'rgba(20, 5, 30, 0.7)',
      padding: 16,
      scale: 4.4
    })
    titleSprite.position.set(0, 3.2, 0)
    this.group.add(titleSprite)
  }

  async enter() {
    this.opened = false
    this.group.visible = true

    this.camera.position.set(0, 0.2, 5.8)
    this.camera.lookAt(0, 0, 0)
    gsap.from(this.camera.position, { z: 10, y: 2, duration: 1.5, ease: 'power3.out' })

    // Envelope entrance bounce
    this.envelopeGroup.scale.set(0, 0, 0)
    gsap.to(this.envelopeGroup.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'back.out(1.6)' })

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
    if (this.particles) this.particles.rotation.y += delta * 0.02

    if (!this.opened && this.envelopeGroup) {
      this.envelopeGroup.position.y = Math.sin(t * 1.5) * 0.08
      this.envelopeGroup.rotation.y = Math.sin(t * 0.8) * 0.06
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

    // Flap opens up
    tl.to(this.flapPivot.rotation, { x: Math.PI * 0.85, duration: 0.6, ease: 'power2.out' })

    // Letter paper slides upwards out of envelope
    tl.to(this.letterPaper.position, { y: 1.5, z: 0.15, duration: 0.8, ease: 'power2.out' }, '-=0.2')

    // Camera zooms smoothly toward paper
    tl.to(this.camera.position, { z: 3.5, y: 0.8, duration: 1.0, ease: 'power2.inOut' }, '-=0.5')

    // Open HTML overlay for perfect reading comfort
    setTimeout(() => {
      document.getElementById('letter-overlay').classList.add('open')
    }, 1100)
  }

  _closeLetter() {
    document.getElementById('letter-overlay').classList.remove('open')
    this.opened = false

    const tl = gsap.timeline()
    tl.to(this.letterPaper.position, { y: 0, z: -0.01, duration: 0.6, ease: 'power2.in' })
    tl.to(this.flapPivot.rotation, { x: 0, duration: 0.5, ease: 'power2.in' }, '-=0.2')
    tl.to(this.camera.position, { z: 5.8, y: 0.2, duration: 0.8, ease: 'power2.out' }, '-=0.4')

    this.manager.setHint('Puedes volver a abrir la carta cuando quieras 💌', 3000)
  }
}
