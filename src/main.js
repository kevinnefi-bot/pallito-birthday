import './style.css'
import * as THREE from 'three'
import { SceneManager } from './SceneManager.js'
import { PhotoGallery } from './components/PhotoGallery.js'
import { MusicPlayer }  from './components/MusicPlayer.js'

// ─── WebGL support check ───
function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

if (!hasWebGL()) {
  document.getElementById('loader')?.classList.add('hidden')
  const noWebGL = document.getElementById('no-webgl')
  if (noWebGL) noWebGL.style.display = 'flex'
  throw new Error('WebGL not supported on this browser')
}

// ─── Three.js Renderer ───
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
scene.fog = new THREE.FogExp2(0x0b0114, 0.035)

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200)
camera.position.set(0, 0.8, 6.2)
camera.lookAt(0, 0, 0)

// ─── Scene Manager ───
const manager = new SceneManager(scene, camera, renderer)

// ─── Initialize Components ───
const photoGallery = new PhotoGallery()
photoGallery.init()
manager.photoGallery = photoGallery

const musicPlayer = new MusicPlayer()
musicPlayer.init()
manager.musicPlayer = musicPlayer

// ─── Parallax Controller ───
let targetMouseX = 0
let targetMouseY = 0

window.addEventListener('mousemove', (e) => {
  targetMouseX = (e.clientX / window.innerWidth - 0.5) * 0.35
  targetMouseY = (e.clientY / window.innerHeight - 0.5) * 0.25
})

window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    targetMouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 0.25
    targetMouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 0.2
  }
}, { passive: true })

// ─── Responsive Resize ───
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// ─── Nav Buttons ───
const navBtns = document.querySelectorAll('.nav-btn')
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.scene
    manager.transitionTo(target)
  })
})

// ─── Animation Loop ───
const clock = new THREE.Clock()
function animate() {
  requestAnimationFrame(animate)
  const delta = Math.min(clock.getDelta(), 0.05)

  // Gentle stereoscopic parallax on the 3D scene
  scene.position.x = THREE.MathUtils.lerp(scene.position.x, -targetMouseX, 0.05)
  scene.position.y = THREE.MathUtils.lerp(scene.position.y, targetMouseY, 0.05)

  manager.update(delta)
  renderer.render(scene, camera)
}

// ─── Boot ───
manager.init().then(() => {
  const loaderFill = document.getElementById('loaderFill')
  if (loaderFill) loaderFill.style.width = '100%'

  setTimeout(() => {
    const loader = document.getElementById('loader')
    if (loader) {
      loader.classList.add('hidden')
      setTimeout(() => {
        loader.style.display = 'none'
        manager.transitionTo('intro')
      }, 700)
    }
  }, 400)

  animate()
})
