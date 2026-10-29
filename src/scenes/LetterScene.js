import * as THREE from 'three'
import { gsap } from 'gsap'
import {
  makeGlowLight,
  makeParticles
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
    this._buildAtmosphere()

    this.group.visible = false
    this.scene.add(this.group)

    this._wireDOM()
  }

  _buildLights() {
    const ambient = new THREE.AmbientLight(0x280d38, 1.1)
    const softPink = makeGlowLight(0xff6eb4, 80, 20, -3, 3, 2, 0.12)
    const softLilac = makeGlowLight(0xc084fc, 80, 20, 3, 3, 1, 0.12)
    const centerSpot = new THREE.SpotLight(0xfff5ea, 40)
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
    this.seal = new THREE.Mesh(sealGeo, sealMat)
    this.seal.rotation.x = Math.PI / 2
    this.seal.position.set(0, 0, 0.08)
    this.envelopeGroup.add(this.seal)

    // Flap
    this.flapPivot = new THREE.Group()
    this.flapPivot.position.set(0, 0.95, 0.05)

    const flapGeo = new THREE.ConeGeometry(1.4, 0.95, 3)
    const flapMat = new THREE.MeshStandardMaterial({
      color: 0xf5d0fe,
      roughness: 0.5
    })
    const flap = new THREE.Mesh(flapGeo, flapMat)
    flap.rotation.z = Math.PI
    flap.position.set(0, -0.475, 0.01)
    this.flapPivot.add(flap)
    this.envelopeGroup.add(this.flapPivot)

    // Letter paper inside peeking out
    const paperGeo = new THREE.BoxGeometry(2.5, 1.7, 0.04)
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xfffdfa, roughness: 0.85 })
    this.letterPaper = new THREE.Mesh(paperGeo, paperMat)
    this.letterPaper.position.set(0, 0, -0.01)
    this.envelopeGroup.add(this.letterPaper)

    this.envelopeGroup.position.set(0, -0.2, 0)
    this.group.add(this.envelopeGroup)
  }

  _buildAtmosphere() {
    this.particles = makeParticles(150, 20, 0xfce7f3, 0.04)
    this.group.add(this.particles)
  }

  _wireDOM() {
    const openBtn = document.getElementById('btn-open-letter-overlay')
    const closeBtn = document.getElementById('letter-close')
    const backdrop = document.getElementById('letter-backdrop')

    if (openBtn) {
      openBtn.addEventListener('click', () => this.openLetter())
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeLetter())
    }
    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeLetter())
    }
  }

  async enter() {
    this.opened = false
    this.group.visible = true

    this.camera.position.set(0, 0.2, 5.8)
    this.camera.lookAt(0, 0, 0)
    gsap.from(this.camera.position, { z: 9.5, y: 2, duration: 1.3, ease: 'power3.out' })

    // Envelope entrance bounce
    this.envelopeGroup.scale.set(0, 0, 0)
    gsap.to(this.envelopeGroup.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'back.out(1.5)' })

    this.manager.setHint('Toca el sobre o pulsa el botón para leer la carta 💌', 4500)

    window.addEventListener('click', this._onClickBound)
    window.addEventListener('touchend', this._onTouchBound, { passive: true })
  }

  async exit() {
    window.removeEventListener('click', this._onClickBound)
    window.removeEventListener('touchend', this._onTouchBound)
    this.closeLetter()
    this.manager.hideHint()
    this.group.visible = false
  }

  update(delta) {
    const t = performance.now() * 0.001
    if (this.particles) this.particles.rotation.y += delta * 0.02

    if (!this.opened && this.envelopeGroup) {
      this.envelopeGroup.position.y = -0.2 + Math.sin(t * 1.5) * 0.07
      this.envelopeGroup.rotation.y = Math.sin(t * 0.8) * 0.06
    }
  }

  _onClick(e) {
    if (e.target.closest('#scene-nav') || e.target.closest('#music-dock') || e.target.closest('#letter-overlay') || e.target.closest('.letter-intro-box')) return
    const ndc = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1
    }
    this._checkHit(ndc)
  }

  _onTouch(e) {
    if (e.changedTouches[0].target.closest('#scene-nav') || e.changedTouches[0].target.closest('#music-dock') || e.changedTouches[0].target.closest('#letter-overlay') || e.changedTouches[0].target.closest('.letter-intro-box')) return
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
      this.openLetter()
    }
  }

  openLetter() {
    if (this.opened) return
    this.opened = true
    this.manager.hideHint()

    const tl = gsap.timeline()

    // 1. Seal scales down slightly
    tl.to(this.seal.scale, { x: 0.1, y: 0.1, z: 0.1, duration: 0.3, ease: 'power2.in' })

    // 2. Flap opens up
    tl.to(this.flapPivot.rotation, { x: Math.PI * 0.85, duration: 0.6, ease: 'power2.out' }, '-=0.1')

    // 3. Letter paper slides upwards out of envelope
    tl.to(this.letterPaper.position, { y: 1.5, z: 0.15, duration: 0.8, ease: 'power2.out' }, '-=0.2')

    // 4. Camera zooms smoothly toward paper
    tl.to(this.camera.position, { z: 3.5, y: 0.6, duration: 0.9, ease: 'power2.inOut' }, '-=0.5')

    // 5. Open HTML overlay for perfect reading comfort
    setTimeout(() => {
      const overlay = document.getElementById('letter-overlay')
      if (overlay) overlay.classList.add('open')
    }, 700)
  }

  closeLetter() {
    const overlay = document.getElementById('letter-overlay')
    if (overlay) overlay.classList.remove('open')
    this.opened = false

    const tl = gsap.timeline()
    tl.to(this.letterPaper.position, { y: 0, z: -0.01, duration: 0.5, ease: 'power2.in' })
    tl.to(this.flapPivot.rotation, { x: 0, duration: 0.5, ease: 'power2.in' }, '-=0.2')
    tl.to(this.seal.scale, { x: 1, y: 1, z: 1, duration: 0.3, ease: 'back.out(1.5)' }, '-=0.1')
    tl.to(this.camera.position, { z: 5.8, y: 0.2, duration: 0.8, ease: 'power2.out' }, '-=0.3')
  }
}
