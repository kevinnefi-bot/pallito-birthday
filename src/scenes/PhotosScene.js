import * as THREE from 'three'
import { gsap } from 'gsap'
import {
  makePolaroid,
  makeGlowLight,
  makeParticles,
  makeTextSprite,
  createWashiTapeTexture
} from '../utils/three-helpers.js'

export class PhotosScene {
  constructor({ scene, camera, manager }) {
    this.scene = scene
    this.camera = camera
    this.manager = manager
    this.group = new THREE.Group()

    this.photos = [
      {
        path: '/images/IMG_20260712_093118_130.png',
        label: 'vibe nocturna 🌙\n«el dúo definitivo +10000 de aura»',
        pos: [0, 0.4, 0.2],
        rot: [0, 0, -0.03],
        scale: 1.15,
        clip: 'clip'
      },
      {
        path: '/images/IMG_20260501_232148_294.png',
        label: 'lentes squad 👓\n«coordinación facial insana»',
        pos: [-3.8, 1.3, -1.2],
        rot: [0.06, 0.2, 0.07],
        scale: 0.98,
        clip: 'tape'
      },
      {
        path: '/images/IMG_20260501_232155_451.png',
        label: 'tickets en mano 🎟️\n«modo aventura activado»',
        pos: [3.8, 1.1, -1.4],
        rot: [-0.04, -0.22, -0.06],
        scale: 0.98,
        clip: 'clip'
      },
      {
        path: '/images/IMG_20260501_232207_432.png',
        label: 'la mirada legendaria 👀\n«−10000 de aura al que se pase de vivo»',
        pos: [-3.6, -1.9, -0.8],
        rot: [0.04, 0.16, -0.05],
        scale: 0.98,
        clip: 'tape'
      },
      {
        path: '/images/IMG-20260712-WA0089.jpg',
        label: 'sofá + pepsi 🛋️\n«chill mode: nivel maestro»',
        pos: [3.6, -1.8, -0.9],
        rot: [-0.05, -0.18, 0.04],
        scale: 0.98,
        clip: 'clip'
      },
      {
        path: '/images/IMG_20260712_092349_950.webp',
        label: 'dúo imparable 💫\n«siempre icónicos, nunca in-icónicos»',
        pos: [0, 3.3, -2.2],
        rot: [0.12, 0, 0.02],
        scale: 0.94,
        clip: 'tape'
      }
    ]

    this.frames = []
    this.focusedFrame = null
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this._onClickBound = this._onClick.bind(this)
    this._onTouchBound = this._onTouch.bind(this)
  }

  async init() {
    this._buildLights()
    this._buildScrapbookAesthetic()
    await this._buildPhotos()

    this.group.visible = false
    this.scene.add(this.group)
  }

  _buildLights() {
    const ambient = new THREE.AmbientLight(0x28073f, 0.9)
    const softMagenta = makeGlowLight(0xff3399, 100, 24, -4, 4, 3, 0.12)
    const softLilac = makeGlowLight(0x9d4edd, 100, 24, 4, 3, 2, 0.12)
    const keySpot = new THREE.SpotLight(0xfff7ed, 45)
    keySpot.position.set(0, 7, 7)
    keySpot.penumbra = 0.7

    this.group.add(ambient, softMagenta, softLilac, keySpot)
  }

  _buildScrapbookAesthetic() {
    // 1. Scrapbook Header Banner with washi tape
    const titleSprite = makeTextSprite('SALA DE RECUERDOS 📸\n«momentos que valen +10000 de aura acumulada»', {
      fontSize: 42,
      fontFace: 'Pacifico, cursive',
      color: '#fff0f8',
      bgColor: 'rgba(25, 4, 40, 0.82)',
      borderColor: '#ff6eb4',
      tapeTop: true,
      padding: 22,
      scale: 4.8
    })
    titleSprite.position.set(0, 4.6, 0)
    this.group.add(titleSprite)

    // 2. Hanging scrapbook ribbons / fairy string lines
    const lineMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.4,
      metalness: 0.3
    })
    const lineCurve1 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-6, 2.5, -2),
      new THREE.Vector3(-2, 1.8, -1),
      new THREE.Vector3(2, 2.8, -1),
      new THREE.Vector3(6, 2.0, -2)
    )
    const line1 = new THREE.Mesh(new THREE.TubeGeometry(lineCurve1, 32, 0.02, 8, false), lineMat)
    this.group.add(line1)

    const lineCurve2 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-6, -0.6, -1.5),
      new THREE.Vector3(-1.5, -1.2, -0.8),
      new THREE.Vector3(2.5, -0.8, -0.8),
      new THREE.Vector3(6, -1.4, -1.5)
    )
    const line2 = new THREE.Mesh(new THREE.TubeGeometry(lineCurve2, 32, 0.02, 8, false), lineMat)
    this.group.add(line2)

    // 3. Floating Washi Tapes & Scrapbook Stickers in 3D
    const tapeTex = createWashiTapeTexture('stripes', '#ec4899', '#fce7f3')
    for (let i = 0; i < 6; i++) {
      const tapeMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.24, 0.02),
        new THREE.MeshStandardMaterial({ map: tapeTex, transparent: true, opacity: 0.85 })
      )
      tapeMesh.position.set(
        (Math.random() - 0.5) * 11,
        (Math.random() - 0.5) * 5.5,
        -1.5 + (Math.random() - 0.5) * 1.5
      )
      tapeMesh.rotation.set(0, 0, (Math.random() - 0.5) * 1.2)
      this.group.add(tapeMesh)
    }

    // 4. Magical fairy dust particles
    this.particles = makeParticles(200, 24, 0xfce7f3, 0.05)
    this.group.add(this.particles)
  }

  async _buildPhotos() {
    for (let i = 0; i < this.photos.length; i++) {
      const data = this.photos[i]
      const frame = await makePolaroid(data.path, data.label, data.rot, data.clip)
      frame.position.set(...data.pos)
      frame.scale.multiplyScalar(data.scale)
      frame.userData = {
        index: i,
        initialPos: [...data.pos],
        initialRot: [...data.rot],
        initialScale: data.scale,
        floatPhase: Math.random() * Math.PI * 2,
        isFrame: true
      }
      this.frames.push(frame)
      this.group.add(frame)
    }
  }

  async enter() {
    this.focusedFrame = null
    this.group.visible = true

    this.camera.position.set(0, 0.6, 8.8)
    this.camera.lookAt(0, 0, 0)
    gsap.from(this.camera.position, { z: 14.5, y: 3.2, duration: 1.8, ease: 'power3.out' })

    // Staggered smooth entrance of Polaroids
    this.frames.forEach((frame, idx) => {
      frame.scale.set(0, 0, 0)
      gsap.to(frame.scale, {
        x: frame.userData.initialScale,
        y: frame.userData.initialScale,
        z: frame.userData.initialScale,
        duration: 0.9,
        delay: 0.12 * idx,
        ease: 'back.out(1.5)'
      })
    })

    this.manager.setHint('Toca cualquier foto para acercarte y ver el recuerdo 🔍', 5000)

    window.addEventListener('click', this._onClickBound)
    window.addEventListener('touchend', this._onTouchBound, { passive: true })
  }

  async exit() {
    window.removeEventListener('click', this._onClickBound)
    window.removeEventListener('touchend', this._onTouchBound)
    this.manager.hideHint()

    await new Promise(r => {
      gsap.to(this.camera.position, { z: 12.5, duration: 0.5, ease: 'power2.in', onComplete: r })
    })
    this.group.visible = false
  }

  update(delta) {
    const t = performance.now() * 0.001
    if (this.particles) this.particles.rotation.y += delta * 0.025

    // Organic floating for non-focused photos
    this.frames.forEach(frame => {
      if (frame === this.focusedFrame) return
      const phase = frame.userData.floatPhase
      frame.position.y = frame.userData.initialPos[1] + Math.sin(t * 1.1 + phase) * 0.07
      frame.rotation.z = frame.userData.initialRot[2] + Math.sin(t * 0.7 + phase) * 0.02
    })
  }

  _onClick(e) {
    if (e.target.closest('#scene-nav') || e.target.closest('#letter-overlay') || e.target.closest('#aura-overlay')) return
    const ndc = {
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1
    }
    this._handleHit(ndc)
  }

  _onTouch(e) {
    if (e.changedTouches[0].target.closest('#scene-nav')) return
    const t = e.changedTouches[0]
    const ndc = {
      x: (t.clientX / window.innerWidth) * 2 - 1,
      y: -(t.clientY / window.innerHeight) * 2 + 1
    }
    this._handleHit(ndc)
  }

  _handleHit(ndc) {
    this.pointer.set(ndc.x, ndc.y)
    this.raycaster.setFromCamera(this.pointer, this.camera)

    const allMeshes = []
    this.frames.forEach(f => f.traverse(c => { if (c.isMesh) allMeshes.push({ mesh: c, frame: f }) }))
    const intersects = this.raycaster.intersectObjects(allMeshes.map(m => m.mesh))

    if (intersects.length > 0) {
      const hit = allMeshes.find(m => m.mesh === intersects[0].object)
      if (hit) {
        this._focusPhoto(hit.frame)
        return
      }
    }

    if (this.focusedFrame) {
      this._resetFocus()
    }
  }

  _focusPhoto(frame) {
    if (this.focusedFrame === frame) {
      this._resetFocus()
      return
    }

    this.focusedFrame = frame
    const targetPos = new THREE.Vector3()
    frame.getWorldPosition(targetPos)

    // Smooth cinematic curved camera tracking
    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z + 3.1,
      duration: 1.2,
      ease: 'power3.inOut'
    })

    this.manager.setHint('Toca el fondo para volver a la galería completa ↩️', 4000)
  }

  _resetFocus() {
    this.focusedFrame = null
    gsap.to(this.camera.position, {
      x: 0,
      y: 0.6,
      z: 8.8,
      duration: 1.1,
      ease: 'power3.inOut'
    })
    this.manager.setHint('Toca cualquier foto para ampliarla 🔍', 3000)
  }
}
