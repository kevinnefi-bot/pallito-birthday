import * as THREE from 'three'
import { gsap } from 'gsap'
import {
  makeTextSprite,
  makeGlowLight,
  makeParticles,
  createArcadeAuraMachine,
  createDetailedDumbbell,
  createAerodynamicHelmet
} from '../utils/three-helpers.js'

export class AuraScene {
  constructor({ scene, camera, manager }) {
    this.scene = scene
    this.camera = camera
    this.manager = manager
    this.group = new THREE.Group()

    this.measuring = false

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
    this._buildGymProps()
    this._buildMotoProps()
    this._buildAtmosphere()

    this.group.visible = false
    this.scene.add(this.group)

    const closeBtn = document.getElementById('aura-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('aura-overlay').classList.remove('open')
      })
    }
  }

  _buildLights() {
    const ambient = new THREE.AmbientLight(0x1a062e, 0.8)
    const neonCyan = makeGlowLight(0x00f0ff, 110, 24, -3.5, 3.5, 2.5, 0.12)
    const neonPink = makeGlowLight(0xff007f, 110, 24, 3.5, 3.5, 2.5, 0.12)
    const keySpot = new THREE.SpotLight(0xfff5ea, 50)
    keySpot.position.set(0, 8, 5)
    keySpot.penumbra = 0.6

    this.group.add(ambient, neonCyan, neonPink, keySpot)
  }

  _buildMachine() {
    const machine = createArcadeAuraMachine()
    this.machine = machine
    this.buttonMesh = machine.buttonMesh

    this.group.add(machine.group)

    // Scrapbook Header Banner
    const titleSprite = makeTextSprite('INSTITUTO INTERNACIONAL DEL AURA DE PALLITO ⚡\n«precisión científica: absolutamente ninguna»', {
      fontSize: 38,
      fontFace: 'Pacifico, cursive',
      color: '#00f0ff',
      bgColor: 'rgba(15, 2, 35, 0.88)',
      borderColor: '#a855f7',
      tapeTop: true,
      padding: 20,
      scale: 5.2
    })
    titleSprite.position.set(0, 4.2, 0)
    this.group.add(titleSprite)

    // Button Call-to-action
    const btnSprite = makeTextSprite('💥 PRESIONA AQUÍ PARA MEDIR TU AURA 💥\n(diagnóstico oficial de Kev)', {
      fontSize: 30,
      color: '#ffffff',
      fontFace: 'Indie Flower, cursive',
      bold: true,
      bgColor: 'rgba(255, 0, 85, 0.85)',
      padding: 14,
      scale: 1.8
    })
    btnSprite.position.set(0, -0.15, 2.3)
    this.group.add(btnSprite)
  }

  _buildGymProps() {
    const gymGroup = new THREE.Group()

    // High detail dumbbell with hex plates & knurling
    const dumbbell = createDetailedDumbbell()
    gymGroup.add(dumbbell)

    // Humorous Gym Sticker
    const gymTag = makeTextSprite('«+10000 de aura por levantarla 💪»\n#no pain no gain #disciplina xd', {
      fontSize: 26,
      fontFace: 'Indie Flower, cursive',
      color: '#ffd6ec',
      bgColor: 'rgba(25, 5, 40, 0.85)',
      borderColor: '#ec4899',
      tapeTop: true,
      padding: 12,
      scale: 1.6
    })
    gymTag.position.set(0, 0.75, 0)
    gymGroup.add(gymTag)

    gymGroup.position.set(-3.8, -0.6, 1.2)
    gymGroup.rotation.set(0.15, 0.55, -0.08)
    this.group.add(gymGroup)
  }

  _buildMotoProps() {
    const motoGroup = new THREE.Group()

    // Aerodynamic Racing Helmet with iridescent rainbow visor
    const helmet = createAerodynamicHelmet()
    motoGroup.add(helmet)

    // Humorous Moto Sticker
    const motoTag = makeTextSprite('🏍️ «Protege la cabeza,\nno las decisiones»\n#muerte al makina xd okno', {
      fontSize: 26,
      fontFace: 'Indie Flower, cursive',
      color: '#00f0ff',
      bgColor: 'rgba(10, 20, 45, 0.88)',
      borderColor: '#00f0ff',
      tapeTop: true,
      padding: 12,
      scale: 1.8
    })
    motoTag.position.set(0, 0.95, 0)
    motoGroup.add(motoTag)

    motoGroup.position.set(3.8, -0.4, 1.0)
    motoGroup.rotation.set(0.1, -0.5, 0.05)
    this.group.add(motoGroup)
  }

  _buildAtmosphere() {
    this.sparks = makeParticles(180, 22, 0x00f0ff, 0.05)
    this.magentaDust = makeParticles(140, 20, 0xff00aa, 0.04)
    this.group.add(this.sparks, this.magentaDust)
  }

  async enter() {
    this.group.visible = true
    this.camera.position.set(0, 1.4, 8.2)
    this.camera.lookAt(0, 0, 0)
    gsap.from(this.camera.position, { z: 13.5, y: 3.5, duration: 1.6, ease: 'power3.out' })

    this.manager.setHint('Toca el botón fucsia gigante para activar el detector de aura ⚡', 5000)

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

    if (this.sparks) this.sparks.rotation.y += delta * 0.03
    if (this.magentaDust) this.magentaDust.rotation.y -= delta * 0.025

    // Plasma core rotating
    if (this.machine?.plasmaCore) {
      this.machine.plasmaCore.rotation.x += delta * 0.8
      this.machine.plasmaCore.rotation.y += delta * 1.1
    }

    // Vacuum tube filament subtle flickering
    if (this.machine?.vacuumTubes) {
      this.machine.vacuumTubes.forEach((tube, idx) => {
        tube.filament.position.y = Math.sin(t * 3 + idx) * 0.02
      })
    }

    // Idle gentle twitching of analog meter needle
    if (!this.measuring && this.machine?.needlePivot) {
      this.machine.needlePivot.rotation.z = Math.sin(t * 2.5) * 0.25 - 0.2
    }
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
    this.manager.setHint('Escaneando ondas cerebrales y decisiones cuestionables... 🔬')

    // Web Audio API sci-fi synthesizer sound effect
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(180, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 1.2)
        gain.gain.setValueAtTime(0.18, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5)
        osc.start()
        osc.stop(ctx.currentTime + 1.5)
      }
    } catch (_) {}

    // 1. Mechanical Button Press with spring recoil
    gsap.timeline()
      .to(this.buttonMesh.position, { y: -0.84, duration: 0.12, ease: 'power2.in' })
      .to(this.buttonMesh.position, { y: -0.74, duration: 0.28, ease: 'back.out(2.5)' })

    // 2. Camera dramatic zoom toward machine core
    gsap.to(this.camera.position, {
      z: 5.4,
      y: 0.9,
      duration: 1.3,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1
    })

    // 3. Analog Gauge Needle frantic oscillation
    if (this.machine.needlePivot) {
      gsap.to(this.machine.needlePivot.rotation, {
        z: 1.2,
        duration: 0.1,
        repeat: 12,
        yoyo: true,
        ease: 'sine.inOut'
      })
    }

    // 4. LED Tower light cascade
    if (this.machine.ledSegments) {
      this.machine.ledSegments.forEach((led, i) => {
        gsap.to(led.material, {
          emissiveIntensity: 1.8,
          duration: 0.15,
          delay: i * 0.08,
          repeat: 3,
          yoyo: true
        })
      })
    }

    // 5. Plasma Core Turbo Spin
    gsap.to(this.machine.plasmaCore.rotation, {
      x: this.machine.plasmaCore.rotation.x + Math.PI * 6,
      y: this.machine.plasmaCore.rotation.y + Math.PI * 6,
      duration: 1.6,
      ease: 'power1.inOut'
    })

    // 6. Reveal Funny Aura Result
    setTimeout(() => {
      this.measuring = false
      const randomResult = this.results[Math.floor(Math.random() * this.results.length)]
      document.getElementById('aura-score-text').textContent = randomResult.score
      document.getElementById('aura-label-text').textContent = randomResult.label
      document.getElementById('aura-overlay').classList.add('open')
      this.manager.setHint('¡Medición completada! Resultado certificado por el Instituto de Aura ⚡', 4000)
    }, 1600)
  }
}
