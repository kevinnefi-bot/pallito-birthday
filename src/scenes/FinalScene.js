import * as THREE from 'three'
import { gsap } from 'gsap'
import {
  makeTextSprite,
  makeGlowLight,
  makePolaroid,
  createDetailedDiscoBall
} from '../utils/three-helpers.js'

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
    this._buildMusicControl()

    this.group.visible = false
    this.scene.add(this.group)
  }

  _buildLights() {
    const ambient = new THREE.AmbientLight(0x2d054d, 0.95)
    this.pinkSpot = makeGlowLight(0xff0099, 130, 26, -4.5, 4.5, 3.5, 0.16)
    this.purpleSpot = makeGlowLight(0x9d4edd, 130, 26, 4.5, 4.5, -3.0, 0.16)
    this.cyanSpot = makeGlowLight(0x00f0ff, 110, 22, 0, 6.5, 2.5, 0.16)

    this.group.add(ambient, this.pinkSpot, this.purpleSpot, this.cyanSpot)
    this.discoLights = [this.pinkSpot, this.purpleSpot, this.cyanSpot]
  }

  _buildDiscoBall() {
    const { group: discoGroup, ball } = createDetailedDiscoBall(1.1)
    this.discoGroup = discoGroup
    this.discoBall = ball

    this.discoGroup.position.set(0, 3.4, -0.8)
    this.group.add(this.discoGroup)
  }

  _buildTitles() {
    // 3D Giant Celebratory Title
    const titleSprite = makeTextSprite('FELIZ CUMPLEAÑOS,\nPALLITO LAS PATAS 🎂💜', {
      fontSize: 66,
      fontFace: 'Pacifico, cursive',
      bold: true,
      color: '#fff0f8',
      bgColor: 'rgba(25, 4, 42, 0.88)',
      borderColor: '#ff007f',
      tapeTop: true,
      padding: 26,
      scale: 6.8
    })
    titleSprite.position.set(0, 0.9, 0)
    this.group.add(titleSprite)

    // Kev humor notes
    const note1 = makeTextSprite('«Bueno, ya está. Te hice toda una página en 3D,\nasí que espero mínimo +10000 de aura para mí.»', {
      fontSize: 34,
      fontFace: 'Indie Flower, cursive',
      color: '#ffd6ec',
      bgColor: 'rgba(30, 5, 45, 0.82)',
      padding: 16,
      scale: 4.0
    })
    note1.position.set(0, -1.25, 0)
    this.group.add(note1)

    const note2 = makeTextSprite('«Feliz cumpleaños, loca. Te quiero un montón.\n— Kev, yo pues quién más xd 💜»', {
      fontSize: 32,
      fontFace: 'Indie Flower, cursive',
      color: '#c084fc',
      bgColor: 'rgba(25, 4, 40, 0.82)',
      padding: 14,
      scale: 3.6
    })
    note2.position.set(0, -2.45, 0)
    this.group.add(note2)

    const hashtag = makeTextSprite('#Muerte al Makina xd okno', {
      fontSize: 28,
      fontFace: 'Nunito, sans-serif',
      bold: true,
      color: '#f43f5e',
      bgColor: 'rgba(15, 0, 20, 0.7)',
      padding: 10,
      scale: 2.0
    })
    hashtag.position.set(0, -3.35, 0)
    this.group.add(hashtag)
  }

  async _buildFloatingPhotos() {
    const photoConfigs = [
      { path: '/images/IMG_20260712_093118_130.png', pos: [-4.4, 1.4, -2.0], rot: [0.08, 0.28, -0.08] },
      { path: '/images/IMG_20260501_232155_451.png', pos: [4.4, 1.2, -2.0], rot: [-0.08, -0.28, 0.08] },
      { path: '/images/IMG_20260501_232148_294.png', pos: [-4.2, -2.1, -1.2], rot: [0.05, 0.18, 0.05] },
      { path: '/images/IMG-20260712-WA0089.jpg', pos: [4.2, -2.1, -1.2], rot: [-0.05, -0.18, -0.05] }
    ]

    for (const c of photoConfigs) {
      const p = await makePolaroid(c.path, '', c.rot, 'tape')
      p.position.set(...c.pos)
      p.scale.multiplyScalar(0.78)
      this.group.add(p)
    }
  }

  _buildConfetti() {
    // Multi-shape metallic confetti (foils, streamers, hearts)
    const colors = [0xff007f, 0x9d4edd, 0x00f0ff, 0xfacc15, 0xff77cc, 0xa855f7]
    for (let i = 0; i < 110; i++) {
      const geo = i % 3 === 0
        ? new THREE.CircleGeometry(0.12, 8)
        : new THREE.PlaneGeometry(0.14, 0.26)

      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        metalness: 0.8,
        roughness: 0.2,
        side: THREE.DoubleSide
      })

      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 14 + 2,
        (Math.random() - 0.5) * 9
      )
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      mesh.userData = {
        speedY: 0.016 + Math.random() * 0.028,
        rotSpeedX: (Math.random() - 0.5) * 0.09,
        rotSpeedY: (Math.random() - 0.5) * 0.09
      }
      this.confettiPieces.push(mesh)
      this.group.add(mesh)
    }
  }

  _buildMusicControl() {
    this.musicSprite = makeTextSprite('🎵 ACTIVAR MÚSICA DE FIESTA 🔊\n(Lady Gaga - Just Dance vibes)', {
      fontSize: 28,
      fontFace: 'Indie Flower, cursive',
      bold: true,
      color: '#ffffff',
      bgColor: 'rgba(147, 51, 234, 0.92)',
      borderColor: '#f472b6',
      padding: 14,
      scale: 2.3
    })
    this.musicSprite.position.set(0, -4.2, 0)
    this.group.add(this.musicSprite)
  }

  async enter() {
    this.group.visible = true
    this.camera.position.set(0, 0, 7.8)
    this.camera.lookAt(0, 0, 0)
    gsap.from(this.camera.position, { z: 13, y: 3.2, duration: 1.6, ease: 'power3.out' })

    this.manager.setHint('¡Feliz Cumpleaños Pallito! Toca el botón de música para encender la pista 🎶', 6000)

    window.addEventListener('click', this._onMusicClick.bind(this))
  }

  async exit() {
    window.removeEventListener('click', this._onMusicClick.bind(this))
    this._stopAudio()
    this.manager.hideHint()
    this.group.visible = false
  }

  update(delta) {
    // Disco ball spin
    if (this.discoBall) {
      this.discoBall.rotation.y += delta * 0.55
      this.discoBall.rotation.x = Math.sin(performance.now() * 0.001) * 0.08
    }

    // Fluttering confetti physics
    this.confettiPieces.forEach(p => {
      p.position.y -= p.userData.speedY
      p.rotation.x += p.userData.rotSpeedX
      p.rotation.y += p.userData.rotSpeedY
      if (p.position.y < -5.5) {
        p.position.y = 7.5
        p.position.x = (Math.random() - 0.5) * 18
      }
    })

    // Dynamic party spot lights
    if (this.audioActive) {
      const t = performance.now() * 0.005
      this.discoLights.forEach((l, idx) => {
        l.children[0].intensity = 110 + Math.sin(t * 3 + idx * 2) * 60
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
      this.manager.setHint('🎶 Sonando Lady Gaga Vibes en la pista 3D ✨', 3500)
    }
  }

  _startAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return
      this.audioContext = new AudioCtx()
      this.audioActive = true

      // Upbeat Just Dance Lady Gaga inspired synthesizer sequence
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

        gain.gain.setValueAtTime(0.14, this.audioContext.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.18)

        osc.start()
        osc.stop(this.audioContext.currentTime + 0.18)
        step++
      }, 175)
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
