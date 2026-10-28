import * as THREE from 'three'
import { gsap } from 'gsap'
import { makeTextSprite, makeGlowLight, makePolaroid, makeParticles } from '../utils/three-helpers.js'

export class FinalScene {
  constructor({ scene, camera, manager }) {
    this.scene = scene
    this.camera = camera
    this.manager = manager
    this.group = new THREE.Group()

    this.confettiPieces = []
    this.audioActive = false
    this.audioContext = null
    this.audioInterval = null
  }

  async init() {
    this._buildLights()
    this._buildDiscoBall()
    this._buildTitles()
    this._buildFloatingPhotos()
    this._buildConfetti()
    this._buildMusicButton()

    this.group.visible = false
    this.scene.add(this.group)
  }

  _buildLights() {
    const ambient = new THREE.AmbientLight(0x2d004d, 0.9)
    const pinkSpot = makeGlowLight(0xff6eb4, 120, 25, -4, 4, 3, 0.15)
    const purpleSpot = makeGlowLight(0xa855f7, 120, 25, 4, 4, -3, 0.15)
    const cyanSpot = makeGlowLight(0x00f0ff, 90, 20, 0, 6, 2, 0.15)
    this.group.add(ambient, pinkSpot, purpleSpot, cyanSpot)
    this.discoLights = [pinkSpot, purpleSpot, cyanSpot]
  }

  _buildDiscoBall() {
    this.discoGroup = new THREE.Group()

    // Sphere with mirror facet appearance
    const sphereGeo = new THREE.SphereGeometry(0.9, 32, 24)
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.95,
      roughness: 0.05,
      flatShading: true
    })
    this.discoBall = new THREE.Mesh(sphereGeo, sphereMat)
    this.discoGroup.add(this.discoBall)

    // Hanging string
    const stringGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.5, 8)
    const stringMat = new THREE.MeshBasicMaterial({ color: 0x888888 })
    const string = new THREE.Mesh(stringGeo, stringMat)
    string.position.y = 2.15
    this.discoGroup.add(string)

    this.discoGroup.position.set(0, 3.2, -1)
    this.group.add(this.discoGroup)
  }

  _buildTitles() {
    // 3D Giant Title
    const titleSprite = makeTextSprite('FELIZ CUMPLEAÑOS,\nPALLITO LAS PATAS 🎂💜', {
      fontSize: 68,
      color: '#ffd6ec',
      fontFace: 'Pacifico, cursive',
      bold: true,
      bgColor: 'rgba(25, 0, 45, 0.8)',
      padding: 24,
      scale: 6.5
    })
    titleSprite.position.set(0, 0.9, 0)
    this.group.add(titleSprite)

    // Kev humor notes
    const note1 = makeTextSprite('«Bueno, ya está. Te hice toda una página en 3D,\nasí que espero mínimo +10000 de aura para mí.»', {
      fontSize: 34,
      color: '#ff6eb4',
      fontFace: 'Indie Flower, cursive',
      bgColor: 'rgba(20, 5, 30, 0.75)',
      padding: 16,
      scale: 3.8
    })
    note1.position.set(0, -1.2, 0)
    this.group.add(note1)

    const note2 = makeTextSprite('«Feliz cumpleaños, loca. Te quiero un montón.\n— Kev, yo pues quién más xd 💜»', {
      fontSize: 32,
      color: '#c084fc',
      fontFace: 'Indie Flower, cursive',
      bgColor: 'rgba(20, 5, 30, 0.75)',
      padding: 14,
      scale: 3.5
    })
    note2.position.set(0, -2.4, 0)
    this.group.add(note2)

    const hashtag = makeTextSprite('#Muerte al Makina xd okno', {
      fontSize: 26,
      color: '#f43f5e',
      bold: true,
      scale: 1.8
    })
    hashtag.position.set(0, -3.3, 0)
    this.group.add(hashtag)
  }

  async _buildFloatingPhotos() {
    // 4 miniature floating polaroids around the celebration
    const photoConfigs = [
      { path: '/images/IMG_20260712_093118_130.png', pos: [-4.2, 1.4, -2], rot: [0.1, 0.3, -0.1] },
      { path: '/images/IMG_20260501_232155_451.png', pos: [4.2, 1.2, -2],  rot: [-0.1, -0.3, 0.1] },
      { path: '/images/IMG_20260501_232148_294.png', pos: [-4.0, -2.0, -1], rot: [0.05, 0.2, 0.05] },
      { path: '/images/IMG-20260712-WA0089.jpg',    pos: [4.0, -2.0, -1],  rot: [-0.05, -0.2, -0.05] }
    ]

    for (const c of photoConfigs) {
      const p = await makePolaroid(c.path, '', c.rot)
      p.position.set(...c.pos)
      p.scale.multiplyScalar(0.75)
      this.group.add(p)
    }
  }

  _buildConfetti() {
    // 3D Confetti meshes
    const colors = [0xff6eb4, 0xa855f7, 0x00f0ff, 0xfacc15, 0xec4899, 0x8b5cf6]
    for (let i = 0; i < 90; i++) {
      const geo = new THREE.PlaneGeometry(0.12, 0.22)
      const mat = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        side: THREE.DoubleSide
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 12 + 2,
        (Math.random() - 0.5) * 8
      )
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      mesh.userData = {
        speedY: 0.015 + Math.random() * 0.025,
        rotSpeedX: (Math.random() - 0.5) * 0.08,
        rotSpeedY: (Math.random() - 0.5) * 0.08
      }
      this.confettiPieces.push(mesh)
      this.group.add(mesh)
    }
  }

  _buildMusicButton() {
    this.musicSprite = makeTextSprite('🎵 ACTIVAR MÚSICA DE FIESTA 🔊\n(Lady Gaga - Just Dance vibes)', {
      fontSize: 28,
      color: '#ffffff',
      bgColor: 'rgba(168, 85, 247, 0.9)',
      padding: 12,
      scale: 2.2
    })
    this.musicSprite.position.set(0, -4.1, 0)
    this.group.add(this.musicSprite)
  }

  async enter() {
    this.group.visible = true
    this.camera.position.set(0, 0, 7.5)
    this.camera.lookAt(0, 0, 0)
    gsap.from(this.camera.position, { z: 12, y: 3, duration: 1.5, ease: 'power3.out' })

    this.manager.setHint('¡Feliz Cumpleaños Pallito! Toca la música para celebrar 🎶', 6000)

    window.addEventListener('click', this._onMusicClick.bind(this))
  }

  async exit() {
    window.removeEventListener('click', this._onMusicClick.bind(this))
    this._stopAudio()
    this.manager.hideHint()
    this.group.visible = false
  }

  update(delta) {
    // Spin disco ball
    if (this.discoBall) {
      this.discoBall.rotation.y += delta * 0.6
      this.discoBall.rotation.x = Math.sin(performance.now() * 0.001) * 0.1
    }

    // Drift confetti
    this.confettiPieces.forEach(p => {
      p.position.y -= p.userData.speedY
      p.rotation.x += p.userData.rotSpeedX
      p.rotation.y += p.userData.rotSpeedY
      if (p.position.y < -5) {
        p.position.y = 7
        p.position.x = (Math.random() - 0.5) * 16
      }
    })

    // Disco lights dynamic colors
    if (this.audioActive) {
      const t = performance.now() * 0.004
      this.discoLights.forEach((l, idx) => {
        l.children[0].intensity = 100 + Math.sin(t * 3 + idx) * 50
      })
    }
  }

  _onMusicClick(e) {
    if (e.target.closest('#scene-nav') || e.target.closest('#letter-overlay') || e.target.closest('#aura-overlay')) return
    this._toggleAudio()
  }

  _toggleAudio() {
    if (this.audioActive) {
      this._stopAudio()
      this.manager.setHint('Música pausada ⏸️', 2000)
    } else {
      this._startAudio()
      this.manager.setHint('🎶 Sonando Lady Gaga Vibes en la pista 3D ✨', 3000)
    }
  }

  _startAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return
      this.audioContext = new AudioContext()
      this.audioActive = true

      // Upbeat Just Dance inspired synth bassline & melody pattern (A minor / C major: A - C - D - E - G)
      const notes = [
        220, 220, 261.63, 293.66, 329.63, 329.63, 392.00, 329.63,
        220, 220, 261.63, 293.66, 329.63, 440.00, 392.00, 329.63
      ]
      let step = 0

      this.audioInterval = setInterval(() => {
        if (!this.audioActive || !this.audioContext) return
        const osc = this.audioContext.createOscillator()
        const gain = this.audioContext.createGain()
        osc.connect(gain)
        gain.connect(this.audioContext.destination)

        osc.type = step % 4 === 0 ? 'sawtooth' : 'triangle'
        osc.frequency.setValueAtTime(notes[step % notes.length], this.audioContext.currentTime)

        gain.gain.setValueAtTime(0.12, this.audioContext.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.18)

        osc.start()
        osc.stop(this.audioContext.currentTime + 0.18)
        step++
      }, 180)
    } catch (_) {}
  }

  _stopAudio() {
    this.audioActive = false
    if (this.audioInterval) {
      clearInterval(this.audioInterval)
      this.audioInterval = null
    }
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}
