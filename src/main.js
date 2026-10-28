import './style.css'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { SceneManager } from './SceneManager.js'

// ─── WebGL support check ───
function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch { return false }
}

if (!hasWebGL()) {
  document.getElementById('loader').style.display = 'none'
  document.getElementById('no-webgl').style.display = 'block'
  throw new Error('WebGL not supported')
}

// ─── Renderer ───
const canvas = document.getElementById('bg')
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance'
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.15

// ─── Scene & Camera ───
const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x0c0114, 0.038)

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200)
camera.position.set(0, 1.2, 10)
camera.lookAt(0, 0, 0)

// ─── Scene Manager ───
const manager = new SceneManager(scene, camera, renderer)

// ─── Smooth Parallax Controller ───
let targetMouseX = 0
let targetMouseY = 0

window.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.45
  targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.35
})

window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    targetMouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 0.4
    targetMouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 0.3
  }
}, { passive: true })

// ─── Resize ───
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// ─── Nav buttons ───
const navBtns = document.querySelectorAll('.nav-btn')
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.scene
    manager.transitionTo(target)
  })
})

// ─── Animation loop ───
const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)
  const delta = Math.min(clock.getDelta(), 0.05)

  // Butter-smooth stereoscopic parallax on the 3D world
  scene.position.x = THREE.MathUtils.lerp(scene.position.x, -targetMouseX, 0.06)
  scene.position.y = THREE.MathUtils.lerp(scene.position.y, targetMouseY, 0.06)

  manager.update(delta)
  renderer.render(scene, camera)
}

// ─── Load & start ───
manager.init().then(() => {
  const loaderFill = document.getElementById('loaderFill')
  loaderFill.style.width = '100%'
  setTimeout(() => {
    const loader = document.getElementById('loader')
    loader.classList.add('hidden')
    setTimeout(() => {
      loader.style.display = 'none'
      manager.transitionTo('intro')
    }, 800)
  }, 600)
  animate()
})
