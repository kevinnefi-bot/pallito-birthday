import * as THREE from 'three'
import { gsap } from 'gsap'
import {
  makeGlowLight,
  createDetailedDiscoBall
} from '../utils/three-helpers.js'

export class FinalScene {
  constructor({ scene, camera, manager }) {
    this.scene = scene
    this.camera = camera
    this.manager = manager
    this.group = new THREE.Group()

    this.confettiPieces = []
  }

  async init() {
    this._buildLights()
    this._buildDiscoBall()
    this._buildConfetti()

    this.group.visible = false
    this.scene.add(this.group)

    this._wireDOM()
  }

  _buildLights() {
    const ambient = new THREE.AmbientLight(0x280442, 1.1)
    this.pinkSpot = makeGlowLight(0xff0099, 120, 24, -4.5, 4.5, 3.5, 0.16)
    this.purpleSpot = makeGlowLight(0x9d4edd, 120, 24, 4.5, 4.5, -3.0, 0.16)
    this.cyanSpot = makeGlowLight(0x00f0ff, 110, 22, 0, 6.5, 2.5, 0.16)

    this.group.add(ambient, this.pinkSpot, this.purpleSpot, this.cyanSpot)
    this.discoLights = [this.pinkSpot, this.purpleSpot, this.cyanSpot]
  }

  _buildDiscoBall() {
    const { group: discoGroup, ball } = createDetailedDiscoBall(1.1)
    this.discoGroup = discoGroup
    this.discoBall = ball

    this.discoGroup.position.set(0, 3.2, -1.0)
    this.group.add(this.discoGroup)
  }

  _buildConfetti() {
    const colors = [0xff6eb4, 0xa855f7, 0x00f0ff, 0xfacc15, 0xec4899, 0xf472b6, 0xe2e8f0]
    for (let i = 0; i < 85; i++) {
      const geo = new THREE.PlaneGeometry(0.12, 0.2)
      const mat = new THREE.MeshBasicMaterial({
        color: colors[i % colors.length],
        side: THREE.DoubleSide
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10 + 2,
        (Math.random() - 0.5) * 8
      )
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
      mesh.userData = {
        speedY: 0.012 + Math.random() * 0.02,
        rotSpeedX: (Math.random() - 0.5) * 0.06,
        rotSpeedY: (Math.random() - 0.5) * 0.06
      }
      this.confettiPieces.push(mesh)
      this.group.add(mesh)
    }
  }

  _wireDOM() {
    const musicBtn = document.getElementById('btn-party-music')
    const backPhotos = document.getElementById('btn-back-to-photos')
    const backLetter = document.getElementById('btn-back-to-letter')

    if (musicBtn) {
      musicBtn.addEventListener('click', () => {
        if (this.manager.musicPlayer) {
          this.manager.musicPlayer.play()
          this.manager.musicPlayer.openPanel()
        }
      })
    }

    if (backPhotos) {
      backPhotos.addEventListener('click', () => {
        this.manager.transitionTo('photos')
      })
    }

    if (backLetter) {
      backLetter.addEventListener('click', () => {
        this.manager.transitionTo('letter')
      })
    }
  }

  async enter() {
    this.group.visible = true

    this.camera.position.set(0, 0.2, 7.8)
    this.camera.lookAt(0, 0, 0)
    gsap.from(this.camera.position, { z: 12, y: 2.8, duration: 1.4, ease: 'power3.out' })

    this.manager.setHint('¡Feliz Cumpleaños Pallito! 🎉 A celebrar con toda la onda', 4500)
  }

  async exit() {
    this.manager.hideHint()
    this.group.visible = false
  }

  update(delta) {
    // Spin disco ball
    if (this.discoBall) {
      this.discoBall.rotation.y += delta * 0.5
      this.discoBall.rotation.x = Math.sin(performance.now() * 0.001) * 0.08
    }

    // Drift confetti
    this.confettiPieces.forEach(p => {
      p.position.y -= p.userData.speedY
      p.rotation.x += p.userData.rotSpeedX
      p.rotation.y += p.userData.rotSpeedY
      if (p.position.y < -5) {
        p.position.y = 6.5
        p.position.x = (Math.random() - 0.5) * 16
      }
    })

    // Dynamic lights
    const t = performance.now() * 0.003
    if (this.discoLights) {
      this.discoLights.forEach((l, idx) => {
        if (l.children && l.children[0]) {
          l.children[0].intensity = 80 + Math.sin(t * 2 + idx) * 40
        }
      })
    }
  }
}
