import * as THREE from 'three'
import { gsap } from 'gsap'
import {
  makeGlowLight,
  makeParticles
} from '../utils/three-helpers.js'

export class PhotosScene {
  constructor({ scene, camera, manager }) {
    this.scene = scene
    this.camera = camera
    this.manager = manager
    this.group = new THREE.Group()
  }

  async init() {
    this._buildLights()
    this._buildAtmosphere()

    this.group.visible = false
    this.scene.add(this.group)
  }

  _buildLights() {
    const ambient = new THREE.AmbientLight(0x220536, 1.1)
    const softMagenta = makeGlowLight(0xec4899, 90, 22, -4, 4, 3, 0.12)
    const softLilac = makeGlowLight(0xa855f7, 90, 22, 4, 3, 2, 0.12)
    const centerSpot = new THREE.SpotLight(0xfff5ea, 35)
    centerSpot.position.set(0, 8, 6)
    centerSpot.penumbra = 0.8

    this.group.add(ambient, softMagenta, softLilac, centerSpot)
  }

  _buildAtmosphere() {
    // 1. Hanging fairy string lines in 3D background
    const lineMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.4,
      metalness: 0.3
    })
    const curve1 = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-8, 3.5, -4),
      new THREE.Vector3(-2.5, 2.2, -3),
      new THREE.Vector3(2.5, 3.2, -3),
      new THREE.Vector3(8, 2.5, -4)
    )
    const line1 = new THREE.Mesh(new THREE.TubeGeometry(curve1, 32, 0.02, 8, false), lineMat)
    this.group.add(line1)

    // 2. Magical dust particles
    this.particles = makeParticles(180, 24, 0xfce7f3, 0.04)
    this.group.add(this.particles)
  }

  async enter() {
    this.group.visible = true

    this.camera.position.set(0, 0.5, 8.5)
    this.camera.lookAt(0, 0, 0)
    gsap.from(this.camera.position, { z: 12, y: 2.5, duration: 1.2, ease: 'power3.out' })

    this.manager.setHint('Toca cualquier foto para ampliarla y leer los recuerdos 📸', 4500)
  }

  async exit() {
    this.manager.hideHint()
    this.group.visible = false
  }

  update(delta) {
    if (this.particles) {
      this.particles.rotation.y += delta * 0.02
    }
  }
}
