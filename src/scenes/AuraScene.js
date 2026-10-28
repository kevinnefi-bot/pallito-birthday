import * as THREE from 'three'
import { gsap } from 'gsap'
import { makeTextSprite, makeGlowLight, makeParticles } from '../utils/three-helpers.js'

export class AuraScene {
  constructor({ scene, camera, manager }) {
    this.scene = scene
    this.camera = camera
    this.manager = manager
    this.group = new THREE.Group()

    this.measuring = false
    this.rotatables = []
    this.tubes = []

    this.results = [
      { score: '+10000', label: 'DE AURA. COCINASTE. 🔥' },
      { score: '−10000', label: 'DE AURA. QUÉ NECESIDAD. 💀' },
      { score: '+5000',  label: 'DE AURA. ACTUACIÓN DECENTE. 👏' },
      { score: '−99999', label: 'DE AURA. NO VOY A EXPLICAR. 📉' },
      { score: 'AURA EN', label: 'NÚMEROS ROJOS. ALERTA CRÍTICA. 🚨' },
      { score: '+10000', label: 'POR EXISTIR. −10000 POR LAS DECISIONES. 🧠' }
    ]

    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this._onClickBound = this._onClick.bind(this)
    this._onTouchBound = this._onTouch.bind(this)
  }

  async init() {
    this._buildLights()
    this._buildMachine()
    this._buildGymElements()
    this._buildMotoElements()
    this._buildLabels()

    this.group.visible = false
    this.scene.add(this.group)

    // Wire overlay close button
    const closeBtn = document.getElementById('aura-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('aura-overlay').classList.remove('open')
      })
    }
  }

  _buildLights() {
    const ambient = new THREE.AmbientLight(0x18052e, 0.7)
    const pinkPillar = makeGlowLight(0xff007f, 100, 20, -3, 3, 2, 0.12)
    const cyanPillar = makeGlowLight(0x00f0ff, 100, 20, 3, 3, 2, 0.12)
    const labSpot = new THREE.SpotLight(0xffffff, 50)
    labSpot.position.set(0, 8, 4)
    labSpot.penumbra = 0.5
    this.group.add(ambient, pinkPillar, cyanPillar, labSpot)
  }

  _buildMachine() {
    this.machineGroup = new THREE.Group()

    // Base platform
    const baseGeo = new THREE.CylinderGeometry(2.4, 2.7, 0.4, 32)
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1f1538,
      metalness: 0.8,
      roughness: 0.2
    })
    const base = new THREE.Mesh(baseGeo, baseMat)
    base.position.y = -1.6
    this.machineGroup.add(base)

    // Inner chamber column (glass + plasma)
    const glassGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.6, 24)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xff6eb4,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.4
    })
    const glass = new THREE.Mesh(glassGeo, glassMat)
    glass.position.y = 0.1
    this.machineGroup.add(glass)

    // Core plasma sphere inside chamber
    const coreGeo = new THREE.IcosahedronGeometry(0.6, 2)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0xff00ff,
      emissiveIntensity: 0.8,
      wireframe: true
    })
    this.plasmaCore = new THREE.Mesh(coreGeo, coreMat)
    this.plasmaCore.position.y = 0.1
    this.machineGroup.add(this.plasmaCore)
    this.rotatables.push(this.plasmaCore)

    // Gyroscope rotating rings around chamber
    for (let r = 0; r < 3; r++) {
      const ringGeo = new THREE.TorusGeometry(1.5 + r * 0.22, 0.04, 12, 48)
      const ringMat = new THREE.MeshStandardMaterial({
        color: r % 2 === 0 ? 0xff6eb4 : 0x00f0ff,
        emissive: r % 2 === 0 ? 0xff00aa : 0x00aacc,
        emissiveIntensity: 0.6,
        metalness: 0.9,
        roughness: 0.1
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.position.y = 0.1
      ring.rotation.x = (r * Math.PI) / 3
      ring.rotation.y = (r * Math.PI) / 4
      this.machineGroup.add(ring)
      this.rotatables.push(ring)
    }

    // Neon columns / tubes
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4
      const tubeGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8, 16)
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.9
      })
      const tube = new THREE.Mesh(tubeGeo, tubeMat)
      tube.position.set(Math.cos(angle) * 1.8, 0.1, Math.sin(angle) * 1.8)
      this.machineGroup.add(tube)
      this.tubes.push(tube)
    }

    // Big interactive button pedestal in front
    const pedestalGeo = new THREE.CylinderGeometry(0.5, 0.65, 0.9, 24)
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x2d124d, metalness: 0.7, roughness: 0.3 })
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat)
    pedestal.position.set(0, -1.15, 2.2)
    this.machineGroup.add(pedestal)

    // Big Red/Pink button
    const btnGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.22, 32)
    const btnMat = new THREE.MeshStandardMaterial({
      color: 0xff0055,
      emissive: 0xff0044,
      emissiveIntensity: 0.6,
      roughness: 0.2
    })
    this.buttonMesh = new THREE.Mesh(btnGeo, btnMat)
    this.buttonMesh.position.set(0, -0.62, 2.2)
    this.buttonMesh.userData = { isButton: true }
    this.machineGroup.add(this.buttonMesh)

    // Button label
    const btnSprite = makeTextSprite('💥 MEDIR AURA 💥\n(presiona aquí)', {
      fontSize: 34,
      color: '#ffffff',
      bgColor: 'rgba(255, 0, 85, 0.8)',
      padding: 12,
      scale: 1.3
    })
    btnSprite.position.set(0, -0.2, 2.2)
    this.machineGroup.add(btnSprite)

    this.group.add(this.machineGroup)
  }

  _buildGymElements() {
    // 3D Stylized Dumbbell / Barbell
    const gymGroup = new THREE.Group()
    const barGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 16)
    const barMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.95, roughness: 0.1 })
    const bar = new THREE.Mesh(barGeo, barMat)
    bar.rotation.z = Math.PI / 2
    gymGroup.add(bar)

    // Weights plates on both sides
    const plateGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 24)
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.3, roughness: 0.7 })
    const p1 = new THREE.Mesh(plateGeo, plateMat)
    p1.rotation.z = Math.PI / 2
    p1.position.x = -0.55
    const p2 = new THREE.Mesh(plateGeo, plateMat)
    p2.rotation.z = Math.PI / 2
    p2.position.x = 0.55
    gymGroup.add(p1, p2)

    // Note tag on dumbbell
    const gymTag = makeTextSprite('«+10000 de aura por levantarla 💪»\n#no pain no gain', {
      fontSize: 26,
      color: '#ffd6ec',
      fontFace: 'Indie Flower, cursive',
      bgColor: 'rgba(30, 10, 40, 0.8)',
      padding: 10,
      scale: 1.5
    })
    gymTag.position.set(0, 0.55, 0)
    gymGroup.add(gymTag)

    gymGroup.position.set(-3.6, -0.6, 1.0)
    gymGroup.rotation.set(0.2, 0.6, -0.1)
    this.group.add(gymGroup)
  }

  _buildMotoElements() {
    const motoGroup = new THREE.Group()

    // Stylized motorcycle helmet in 3D
    const helmetGeo = new THREE.SphereGeometry(0.45, 24, 24)
    const helmetMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.9,
      roughness: 0.2
    })
    const helmet = new THREE.Mesh(helmetGeo, helmetMat)

    // Visor
    const visorGeo = new THREE.SphereGeometry(0.46, 24, 16, 0, Math.PI, Math.PI / 3, Math.PI / 3)
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0xff00aa,
      emissive: 0xaa0066,
      emissiveIntensity: 0.5,
      metalness: 0.95,
      roughness: 0.1
    })
    const visor = new THREE.Mesh(visorGeo, visorMat)
    visor.rotation.x = Math.PI / 2
    visor.position.set(0, 0.05, 0.05)
    motoGroup.add(helmet, visor)

    // Moto humor tag
    const motoTag = makeTextSprite('🏍️ «Protege la cabeza,\nno las decisiones»\n#muerte al makina xd okno', {
      fontSize: 26,
      color: '#00ffff',
      fontFace: 'Indie Flower, cursive',
      bgColor: 'rgba(10, 20, 40, 0.85)',
      padding: 12,
      scale: 1.8
    })
    motoTag.position.set(0, 0.75, 0)
    motoGroup.add(motoTag)

    motoGroup.position.set(3.6, -0.4, 0.8)
    motoGroup.rotation.set(0.1, -0.5, 0.05)
    this.group.add(motoGroup)
  }

  _buildLabels() {
    const titleSprite = makeTextSprite('INSTITUTO INTERNACIONAL DEL AURA DE PALLITO ⚡\n«precisión científica: ninguna»', {
      fontSize: 40,
      color: '#00f0ff',
      fontFace: 'Pacifico, cursive',
      bgColor: 'rgba(15, 0, 30, 0.8)',
      padding: 18,
      scale: 4.8
    })
    titleSprite.position.set(0, 3.8, 0)
    this.group.add(titleSprite)

    this.particles = makeParticles(160, 20, 0x00f0ff, 0.04)
    this.group.add(this.particles)
  }

  async enter() {
    this.group.visible = true
    this.camera.position.set(0, 1.2, 7.8)
    this.camera.lookAt(0, 0, 0)
    gsap.from(this.camera.position, { z: 12, y: 3, duration: 1.4, ease: 'power3.out' })

    this.manager.setHint('Presiona el botón gigante para medir el aura ⚡', 5000)

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
    if (this.particles) this.particles.rotation.y += delta * 0.03

    // Continuous rotation of rings and plasma
    this.rotatables.forEach((obj, idx) => {
      const speed = (idx + 1) * 0.4
      obj.rotation.x += delta * speed
      obj.rotation.y += delta * (speed * 0.8)
    })

    // Pulsing tubes
    const pulse = Math.sin(t * 4) * 0.5 + 0.5
    this.tubes.forEach(tube => {
      tube.material.emissiveIntensity = 0.5 + pulse * 0.6
    })
  }

  _onClick(e) {
    if (e.target.closest('#scene-nav') || e.target.closest('#aura-overlay')) return
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
    if (this.measuring) return
    this.pointer.set(ndc.x, ndc.y)
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hits = this.raycaster.intersectObject(this.buttonMesh, true)
    if (hits.length > 0) {
      this._activateMachine()
    }
  }

  _activateMachine() {
    this.measuring = true
    this.manager.setHint('Analizando ondas cósmicas de aura... 🔬')

    // Sound effect with Web Audio API synthesizer
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(150, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.2)
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5)
        osc.start()
        osc.stop(ctx.currentTime + 1.5)
      }
    } catch (_) {}

    // Physical button press animation
    gsap.timeline()
      .to(this.buttonMesh.position, { y: -0.72, duration: 0.15, ease: 'power2.in' })
      .to(this.buttonMesh.position, { y: -0.62, duration: 0.25, ease: 'back.out(2)' })

    // Camera dramatic zoom into core
    gsap.to(this.camera.position, {
      z: 5.2,
      y: 0.8,
      duration: 1.2,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1
    })

    // Turbo spin of rings
    const origRotatables = [...this.rotatables]
    origRotatables.forEach(r => {
      gsap.to(r.rotation, {
        x: r.rotation.x + Math.PI * 4,
        y: r.rotation.y + Math.PI * 4,
        duration: 1.5,
        ease: 'power1.inOut'
      })
    })

    // Flash tubes
    this.tubes.forEach(t => {
      gsap.to(t.material, { emissiveIntensity: 2.5, duration: 0.2, repeat: 5, yoyo: true })
    })

    // Reveal result after animation
    setTimeout(() => {
      this.measuring = false
      const randomResult = this.results[Math.floor(Math.random() * this.results.length)]
      document.getElementById('aura-score-text').textContent = randomResult.score
      document.getElementById('aura-label-text').textContent = randomResult.label
      document.getElementById('aura-overlay').classList.add('open')
      this.manager.setHint('Medición completada con éxito científico absoluto 🎯', 4000)
    }, 1500)
  }
}
