import * as THREE from 'three'
import { gsap } from 'gsap'
import {
  makeGlowLight,
  makeParticles
} from '../utils/three-helpers.js'

export class AuraScene {
  constructor({ scene, camera, manager }) {
    this.scene = scene
    this.camera = camera
    this.manager = manager
    this.group = new THREE.Group()

    this.measuring = false
    this.gyroRings = []

    this.results = [
      {
        score: '+10000',
        title: 'DE AURA. COCINASTE. 🔥',
        desc: 'Rendimiento legendario comprobado. Ninguna decisión cuestionable puede bajarte de este pedestal hoy.'
      },
      {
        score: '−10000',
        title: 'DE AURA. QUÉ NECESIDAD. 💀',
        desc: 'Se detectó un fallo crítico en el sistema. Pero como es tu cumpleaños, te perdonamos el registro.'
      },
      {
        score: '+5000',
        title: 'ACTUACIÓN DECENTE 👏',
        desc: 'Ni muy callada ni muy peligrosa. Balance perfecto para sobrevivir un año más con estilo.'
      },
      {
        score: '−99999',
        title: 'NO VOY A EXPLICAR 📉',
        desc: 'Tú sabes perfectamente por qué. No me hagas sacar capturas del archivo histórico.'
      },
      {
        score: '+10000',
        title: 'POR EXISTIR. −10000 POR LAS DECISIONES 🧠',
        desc: 'Equilibrio cuántico perfecto entre ser una persona increíble y hacer estupideces memorables.'
      },
      {
        score: 'AURA ∞',
        title: 'NIVEL DUKE MÁXIMO 👑',
        desc: 'La escala colapsó por exceso de vibra. Eres intocable durante las próximas 24 horas.'
      }
    ]
  }

  async init() {
    this._buildLights()
    this._buildAuraCore()
    this._buildAtmosphere()

    this.group.visible = false
    this.scene.add(this.group)

    this._wireDOM()
  }

  _buildLights() {
    const ambient = new THREE.AmbientLight(0x18032b, 1.0)
    this.cyanLight = makeGlowLight(0x00f0ff, 90, 20, -3.5, 2.5, 2, 0.14)
    this.pinkLight = makeGlowLight(0xff007f, 90, 20, 3.5, 2.5, 2, 0.14)
    const centerSpot = new THREE.SpotLight(0xfff5ea, 40)
    centerSpot.position.set(0, 6, 5)

    this.group.add(ambient, this.cyanLight, this.pinkLight, centerSpot)
  }

  _buildAuraCore() {
    this.coreGroup = new THREE.Group()

    // Glowing crystal sphere in center
    const sphereGeo = new THREE.IcosahedronGeometry(1.0, 3)
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x9333ea,
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.85,
      wireframe: false
    })
    this.coreSphere = new THREE.Mesh(sphereGeo, sphereMat)
    this.coreGroup.add(this.coreSphere)

    // Inner wireframe sphere
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.4 })
    const wireSphere = new THREE.Mesh(sphereGeo, wireMat)
    wireSphere.scale.set(1.15, 1.15, 1.15)
    this.coreGroup.add(wireSphere)

    // 3 Concentric Gyro Rings
    const ringConfigs = [
      { radius: 1.6, tube: 0.04, color: 0xec4899, rx: 0.4, ry: 0 },
      { radius: 2.1, tube: 0.035, color: 0x00f0ff, rx: -0.6, ry: 0.5 },
      { radius: 2.6, tube: 0.03, color: 0xc084fc, rx: 0.8, ry: -0.4 }
    ]

    ringConfigs.forEach(cfg => {
      const ringGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 64)
      const ringMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.color,
        emissiveIntensity: 0.6,
        roughness: 0.2
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = cfg.rx
      ring.rotation.y = cfg.ry
      this.coreGroup.add(ring)
      this.gyroRings.push(ring)
    })

    this.coreGroup.position.set(0, 0, -1)
    this.group.add(this.coreGroup)
  }

  _buildAtmosphere() {
    this.particles = makeParticles(160, 22, 0xc084fc, 0.04)
    this.group.add(this.particles)
  }

  _wireDOM() {
    const measureBtn = document.getElementById('btn-measure-aura')
    const remeasureBtn = document.getElementById('btn-remeasure-aura')

    if (measureBtn) {
      measureBtn.addEventListener('click', () => this.measureAura())
    }
    if (remeasureBtn) {
      remeasureBtn.addEventListener('click', () => this.measureAura())
    }
  }

  async enter() {
    this.group.visible = true

    this.camera.position.set(0, 0.4, 7.5)
    this.camera.lookAt(0, 0, 0)
    gsap.from(this.camera.position, { z: 12, y: 2.5, duration: 1.2, ease: 'power3.out' })

    this.manager.setHint('Pulsa el botón para calcular tu nivel de aura ⚡', 4000)
  }

  async exit() {
    this.manager.hideHint()
    this.group.visible = false
  }

  update(delta) {
    const t = performance.now() * 0.001

    if (this.particles) this.particles.rotation.y += delta * 0.02

    if (this.coreSphere) {
      this.coreSphere.rotation.y += delta * 0.5
      this.coreSphere.rotation.x = Math.sin(t) * 0.2
    }

    if (this.gyroRings.length === 3) {
      const speedMult = this.measuring ? 4.5 : 1.0
      this.gyroRings[0].rotation.x += delta * 0.7 * speedMult
      this.gyroRings[1].rotation.y += delta * 0.9 * speedMult
      this.gyroRings[2].rotation.z += delta * 0.5 * speedMult
    }
  }

  measureAura() {
    if (this.measuring) return
    this.measuring = true
    this.manager.setHint('Calculando nivel cuántico de aura... 🔄', 2000)

    const resultBox = document.getElementById('aura-card-result')
    const badge = document.getElementById('aura-score-badge')
    const title = document.getElementById('aura-score-title')
    const desc = document.getElementById('aura-score-desc')

    // Animate 3D core & lights intensely
    gsap.to(this.coreSphere.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.3, yoyo: true, repeat: 3 })

    // Roll random numbers on badge
    let rolls = 0
    const rollInterval = setInterval(() => {
      const randomScore = (Math.random() > 0.5 ? '+' : '−') + (Math.floor(Math.random() * 9000) + 1000)
      if (badge) badge.textContent = randomScore
      rolls++
      if (rolls > 12) {
        clearInterval(rollInterval)
        this._showFinalResult(resultBox, badge, title, desc)
      }
    }, 80)
  }

  _showFinalResult(resultBox, badge, title, desc) {
    this.measuring = false
    const randomPick = this.results[Math.floor(Math.random() * this.results.length)]

    if (badge) badge.textContent = randomPick.score
    if (title) title.textContent = randomPick.title
    if (desc) desc.textContent = randomPick.desc

    if (resultBox) {
      resultBox.classList.remove('hidden')
    }

    this.manager.setHint('Diagnóstico de aura completado ⚡', 3500)
  }
}
