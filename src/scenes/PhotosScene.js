import * as THREE from 'three'
import { gsap } from 'gsap'
import { makePolaroid, makeGlowLight, makeParticles, makeTextSprite } from '../utils/three-helpers.js'

export class PhotosScene {
  constructor({ scene, camera, manager }) {
    this.scene = scene
    this.camera = camera
    this.manager = manager
    this.group = new THREE.Group()

    this.photos = [
      {
        path: '/images/IMG_20260712_093118_130.png',
        label: 'vibe nocturna 🌙\n+10000 de aura',
        pos: [0, 0.4, 0], // Centerpiece photo
        rot: [0, 0, -0.04],
        scale: 1.15
      },
      {
        path: '/images/IMG_20260501_232148_294.png',
        label: 'lentes squad 👓\ncoordinación élite',
        pos: [-3.8, 1.2, -1.5],
        rot: [0.08, 0.25, 0.08],
        scale: 0.95
      },
      {
        path: '/images/IMG_20260501_232155_451.png',
        label: 'tickets en mano 🎟️\nmodo aventura activado',
        pos: [3.8, 1.0, -1.8],
        rot: [-0.05, -0.28, -0.06],
        scale: 0.95
      },
      {
        path: '/images/IMG_20260501_232207_432.png',
        label: 'la mirada legendaria 👀\n−10000 al que se meta',
        pos: [-3.5, -2.0, -0.8],
        rot: [0.05, 0.2, -0.05],
        scale: 0.95
      },
      {
        path: '/images/IMG-20260712-WA0089.jpg',
        label: 'sofá + pepsi 🛋️\nchill mode: nivel pro',
        pos: [3.5, -1.8, -1.0],
        rot: [-0.06, -0.2, 0.04],
        scale: 0.95
      },
      {
        path: '/images/IMG_20260712_092349_950.webp',
        label: 'dúo imparable 💫\nsiempre icónicos',
        pos: [0, 3.2, -2.5],
        rot: [0.15, 0, 0.03],
        scale: 0.9
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
    this._buildDecorations()
    await this._buildPhotos()

    this.group.visible = false
    this.scene.add(this.group)
  }

  _buildLights() {
    const ambient = new THREE.AmbientLight(0x2a0845, 0.8)
    const pinkLight = makeGlowLight(0xff6eb4, 90, 25, -4, 4, 3, 0.1)
    const purpleLight = makeGlowLight(0xa855f7, 90, 25, 4, 3, 2, 0.1)
    const centerSpot = new THREE.SpotLight(0xffffff, 40)
    centerSpot.position.set(0, 6, 8)
    centerSpot.angle = Math.PI / 4
    centerSpot.penumbra = 0.8
    this.group.add(ambient, pinkLight, purpleLight, centerSpot)
  }

  _buildDecorations() {
    // Atmospheric floating particles
    this.particles = makeParticles(180, 22, 0xe9d5ff, 0.04)
    this.group.add(this.particles)

    // Scrapbook title banner
    const titleSprite = makeTextSprite('SALA DE RECUERDOS 📸\n«momentos que valen +10000 de aura»', {
      fontSize: 44,
      color: '#ffd6ec',
      fontFace: 'Pacifico, cursive',
      bgColor: 'rgba(20, 5, 30, 0.7)',
      padding: 20,
      scale: 4.5
    })
    titleSprite.position.set(0, 4.4, 0)
    this.group.add(titleSprite)

    // 3D Stylized Scrapbook elements (floating stickers, tapes, pins)
    const tapeMat = new THREE.MeshStandardMaterial({
      color: 0xffd6ec,
      transparent: true,
      opacity: 0.85,
      roughness: 0.6
    })
    for (let i = 0; i < 8; i++) {
      const tape = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.04), tapeMat)
      tape.position.set((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6, -1 + (Math.random() - 0.5) * 2)
      tape.rotation.set(0, 0, (Math.random() - 0.5) * 1.5)
      this.group.add(tape)
    }
  }

  async _buildPhotos() {
    for (let i = 0; i < this.photos.length; i++) {
      const data = this.photos[i]
      const frame = await makePolaroid(data.path, data.label, data.rot)
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

    this.camera.position.set(0, 0.5, 8.5)
    this.camera.lookAt(0, 0, 0)
    gsap.from(this.camera.position, { z: 14, y: 3, duration: 1.5, ease: 'power3.out' })

    // Stagger entrance of frames
    this.frames.forEach((frame, idx) => {
      frame.scale.set(0, 0, 0)
      gsap.to(frame.scale, {
        x: frame.userData.initialScale,
        y: frame.userData.initialScale,
        z: frame.userData.initialScale,
        duration: 0.8,
        delay: 0.1 * idx,
        ease: 'back.out(1.5)'
      })
    })

    this.manager.setHint('Toca cualquier foto para acercarla y verla en detalle 🔍', 5000)

    window.addEventListener('click', this._onClickBound)
    window.addEventListener('touchend', this._onTouchBound, { passive: true })
  }

  async exit() {
    window.removeEventListener('click', this._onClickBound)
    window.removeEventListener('touchend', this._onTouchBound)
    this.manager.hideHint()

    await new Promise(r => {
      gsap.to(this.camera.position, { z: 12, duration: 0.5, ease: 'power2.in', onComplete: r })
    })
    this.group.visible = false
  }

  update(delta) {
    const t = performance.now() * 0.001
    if (this.particles) this.particles.rotation.y += delta * 0.02

    // Gentle floating for all non-focused frames
    this.frames.forEach(frame => {
      if (frame === this.focusedFrame) return
      const phase = frame.userData.floatPhase
      frame.position.y = frame.userData.initialPos[1] + Math.sin(t * 1.2 + phase) * 0.08
      frame.rotation.z = frame.userData.initialRot[2] + Math.sin(t * 0.8 + phase) * 0.02
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

    // Find clicked frame
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

    // If clicked empty space while focusing, reset camera
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

    gsap.to(this.camera.position, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z + 3.2,
      duration: 1.0,
      ease: 'power2.inOut'
    })

    this.manager.setHint('Toca en cualquier espacio vacío para alejar ↩️', 4000)
  }

  _resetFocus() {
    this.focusedFrame = null
    gsap.to(this.camera.position, {
      x: 0,
      y: 0.5,
      z: 8.5,
      duration: 1.0,
      ease: 'power2.inOut'
    })
    this.manager.setHint('Toca cualquier foto para acercarla 🔍', 3000)
  }
}
