import * as THREE from 'three'
import { gsap } from 'gsap'
import {
  makeParticles,
  makeGlowLight,
  createLuxuryGiftBox
} from '../utils/three-helpers.js'

export class IntroScene {
  constructor({ scene, camera, manager }) {
    this.scene = scene
    this.camera = camera
    this.manager = manager
    this.group = new THREE.Group()

    this.opened = false
    this.animating = false
    this.sparkles = []

    this._raycaster = new THREE.Raycaster()
    this._pointer = new THREE.Vector2()
    this._onClickBound = this._onClick.bind(this)
    this._onTouchBound = this._onTouch.bind(this)
  }

  async init() {
    this._buildStars()
    this._buildLights()
    this._buildGiftBox()
    this._buildSparkleSystem()

    this.group.visible = false
    this.scene.add(this.group)

    // Wire HTML button
    const openBtn = document.getElementById('btn-open-gift')
    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.openGift()
      })
    }
  }

  _buildStars() {
    const geo = new THREE.BufferGeometry()
    const pos = new Float32Array(3000)
    for (let i = 0; i < 1000; i++) {
      const r = 40 + Math.random() * 40
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({
      color: 0xffd6ec,
      size: 0.18,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.65
    })
    this.stars = new THREE.Points(geo, mat)
    this.scene.add(this.stars)
  }

  _buildLights() {
    const ambient = new THREE.AmbientLight(0x280540, 1.2)
    const softPink = makeGlowLight(0xf472b6, 90, 22, -3.5, 3, 3, 0.12)
    const softLilac = makeGlowLight(0xc084fc, 90, 22, 3.5, 3, -2, 0.12)
    const mainSpot = new THREE.SpotLight(0xfff7ed, 45)
    mainSpot.position.set(0, 6, 6)
    mainSpot.penumbra = 0.6
    mainSpot.castShadow = true

    this.group.add(ambient, softPink, softLilac, mainSpot)
  }

  _buildGiftBox() {
    const { boxGroup, boxBody, boxLid, lidPivot, clickTargets } = createLuxuryGiftBox()
    this.boxGroup = boxGroup
    this.boxBody = boxBody
    this.boxLid = boxLid
    this.lidPivot = lidPivot
    this._clickTargets = clickTargets

    // Glowing core inside gift box
    this.interiorLight = new THREE.PointLight(0xff00d4, 0, 10)
    this.interiorLight.position.set(0, 0.3, 0)
    this.boxGroup.add(this.interiorLight)

    // Position box in lower center of view
    this.boxGroup.position.set(0, -0.6, 0)
    this.boxGroup.scale.set(1.2, 1.2, 1.2)
    this.group.add(this.boxGroup)
  }

  _buildSparkleSystem() {
    this.ambientParticles = makeParticles(120, 18, 0xfce7f3, 0.04)
    this.group.add(this.ambientParticles)
  }

  async enter() {
    this.opened = false
    this.animating = false
    this.group.visible = true

    this.camera.position.set(0, 0.8, 6.2)
    this.camera.lookAt(0, -0.2, 0)
    gsap.from(this.camera.position, { z: 10, y: 3, duration: 1.4, ease: 'power3.out' })

    // Box entrance bounce
    this.boxGroup.scale.set(0, 0, 0)
    gsap.to(this.boxGroup.scale, {
      x: 1.2, y: 1.2, z: 1.2,
      duration: 1.1,
      ease: 'back.out(1.5)'
    })

    // Reset lid rotation
    if (this.lidPivot) {
      this.lidPivot.rotation.x = 0
      this.lidPivot.position.y = 0.85
    }
    if (this.interiorLight) {
      this.interiorLight.intensity = 0
    }

    this.manager.setHint('Toca la caja de regalo para abrirla ✨', 4500)

    window.addEventListener('click', this._onClickBound)
    window.addEventListener('touchend', this._onTouchBound, { passive: true })
  }

  async exit() {
    window.removeEventListener('click', this._onClickBound)
    window.removeEventListener('touchend', this._onTouchBound)
    this.manager.hideHint()
    this.group.visible = false
  }

  update(delta) {
    const t = performance.now() * 0.001

    if (this.stars) {
      this.stars.rotation.y += delta * 0.015
    }

    if (this.ambientParticles) {
      this.ambientParticles.rotation.y += delta * 0.02
    }

    // Gentle floating for unopened box
    if (!this.opened && !this.animating && this.boxGroup) {
      this.boxGroup.position.y = -0.6 + Math.sin(t * 1.5) * 0.06
      this.boxGroup.rotation.y = Math.sin(t * 0.8) * 0.08
    }
  }

  _onClick(e) {
    if (e.target.closest('#scene-nav') || e.target.closest('#music-dock') || e.target.closest('.hero-card')) return
    const ndc = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1
    }
    this._checkHit(ndc)
  }

  _onTouch(e) {
    if (e.changedTouches[0].target.closest('#scene-nav') || e.changedTouches[0].target.closest('#music-dock') || e.changedTouches[0].target.closest('.hero-card')) return
    const touch = e.changedTouches[0]
    const ndc = {
      x: (touch.clientX / window.innerWidth) * 2 - 1,
      y: -(touch.clientY / window.innerHeight) * 2 + 1
    }
    this._checkHit(ndc)
  }

  _checkHit(ndc) {
    if (this.opened || this.animating) return
    this._pointer.set(ndc.x, ndc.y)
    this._raycaster.setFromCamera(this._pointer, this.camera)

    const targets = this._clickTargets || this.boxGroup.children
    const hits = this._raycaster.intersectObjects(targets, true)
    if (hits.length > 0) {
      this.openGift()
    }
  }

  openGift() {
    if (this.opened || this.animating) return
    this.opened = true
    this.animating = true
    this.manager.hideHint()

    const tl = gsap.timeline({
      onComplete: () => {
        this.animating = false
        // Smoothly transition to photos scene
        this.manager.transitionTo('photos')
      }
    })

    // 1. Anticipation wobble
    tl.to(this.boxGroup.rotation, { z: 0.08, duration: 0.12, ease: 'power1.inOut' })
      .to(this.boxGroup.rotation, { z: -0.08, duration: 0.12, ease: 'power1.inOut' })
      .to(this.boxGroup.rotation, { z: 0, duration: 0.12, ease: 'power1.inOut' })

    // 2. Interior light bursts out
    tl.to(this.interiorLight, { intensity: 80, duration: 0.4, ease: 'power2.out' }, '-=0.1')

    // 3. Lid flips off and upwards
    tl.to(this.lidPivot.rotation, { x: -Math.PI * 0.7, duration: 0.7, ease: 'back.out(1.4)' }, '-=0.3')
    tl.to(this.lidPivot.position, { y: 2.2, z: -0.8, duration: 0.7, ease: 'power2.out' }, '<')

    // 4. Camera zooms forward smoothly
    tl.to(this.camera.position, { z: 3.8, y: 0.2, duration: 0.9, ease: 'power2.inOut' }, '-=0.4')
  }
}
