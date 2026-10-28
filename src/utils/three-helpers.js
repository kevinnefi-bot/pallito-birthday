import * as THREE from 'three'

/**
 * Creates a canvas-based text sprite for use in 3D scenes.
 */
export function makeTextSprite(text, {
  fontSize    = 48,
  fontFace    = 'Nunito, sans-serif',
  color       = '#ffffff',
  bgColor     = null,
  padding     = 20,
  maxWidth    = 512,
  bold        = false,
  italic      = false,
  borderColor = null,
  scale       = 1,
} = {}) {
  const canvas = document.createElement('canvas')
  const ctx    = canvas.getContext('2d')

  const font = `${bold ? 'bold ' : ''}${italic ? 'italic ' : ''}${fontSize}px ${fontFace}`
  ctx.font = font

  // Measure text (handle multi-line)
  const lines  = text.split('\n')
  let maxW = 0
  lines.forEach(l => { maxW = Math.max(maxW, ctx.measureText(l).width) })
  maxW = Math.min(maxW, maxWidth)

  const lineH = fontSize * 1.3
  canvas.width  = maxW + padding * 2
  canvas.height = lineH * lines.length + padding * 2

  // Re-apply font after resize
  ctx.font = font
  ctx.textBaseline = 'top'

  if (bgColor) {
    ctx.fillStyle = bgColor
    const r = 12
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.lineTo(canvas.width - r, 0)
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r)
    ctx.lineTo(canvas.width, canvas.height - r)
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height)
    ctx.lineTo(r, canvas.height)
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r)
    ctx.lineTo(0, r)
    ctx.quadraticCurveTo(0, 0, r, 0)
    ctx.closePath()
    ctx.fill()
  }

  if (borderColor) {
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 3
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4)
  }

  ctx.fillStyle = color
  lines.forEach((line, i) => {
    ctx.fillText(line, padding, padding + i * lineH)
  })

  const texture  = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
  const sprite   = new THREE.Sprite(material)

  const aspect = canvas.width / canvas.height
  sprite.scale.set(aspect * scale, scale, 1)
  sprite.userData.canvasWidth  = canvas.width
  sprite.userData.canvasHeight = canvas.height

  return sprite
}

/**
 * Creates a glowing point light with a visible lens-flare sphere.
 */
export function makeGlowLight(color, intensity, distance, x, y, z, sphereSize = 0.08) {
  const group = new THREE.Group()

  const light = new THREE.PointLight(color, intensity, distance)
  light.position.set(x, y, z)
  group.add(light)

  if (sphereSize > 0) {
    const geo  = new THREE.SphereGeometry(sphereSize, 8, 8)
    const mat  = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .8 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(x, y, z)
    group.add(mesh)
  }

  return group
}

/**
 * Creates a simple particle system as a THREE.Points object.
 */
export function makeParticles(count, spread, color, size = 0.04) {
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - .5) * spread
    pos[i * 3 + 1] = (Math.random() - .5) * spread
    pos[i * 3 + 2] = (Math.random() - .5) * spread
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const mat = new THREE.PointsMaterial({ color, size, transparent: true, opacity: .7, sizeAttenuation: true, depthWrite: false })
  return new THREE.Points(geo, mat)
}

/**
 * Creates a polaroid-style frame with a photo texture.
 */
export async function makePolaroid(imagePath, label = '', rotation = [0,0,0]) {
  const group = new THREE.Group()

  // Frame
  const frameGeo = new THREE.BoxGeometry(2.2, 2.7, 0.08)
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .3, metalness: 0 })
  const frame    = new THREE.Mesh(frameGeo, frameMat)
  frame.castShadow = true
  group.add(frame)

  // Photo area
  const photoGeo = new THREE.PlaneGeometry(1.9, 1.9)
  const loader   = new THREE.TextureLoader()
  const tex      = await new Promise(resolve => {
    loader.load(imagePath, resolve, undefined, () => {
      // Fallback: pink placeholder
      const c = document.createElement('canvas')
      c.width = c.height = 512
      const cx = c.getContext('2d')
      cx.fillStyle = '#ff6eb4'
      cx.fillRect(0, 0, 512, 512)
      cx.fillStyle = '#fff'
      cx.font = '48px sans-serif'
      cx.textAlign = 'center'
      cx.fillText('📸', 256, 280)
      resolve(new THREE.CanvasTexture(c))
    })
  })
  tex.colorSpace = THREE.SRGBColorSpace
  const photoMat = new THREE.MeshBasicMaterial({ map: tex })
  const photo    = new THREE.Mesh(photoGeo, photoMat)
  photo.position.set(0, 0.25, 0.045)
  group.add(photo)

  // Label text
  if (label) {
    const sprite = makeTextSprite(label, { fontSize: 36, color: '#555555', fontFace: 'Indie Flower, cursive', bold: false })
    sprite.position.set(0, -1.05, 0.06)
    sprite.scale.multiplyScalar(0.018)
    group.add(sprite)
  }

  group.rotation.set(...rotation)
  group.userData.isFrame = true
  return group
}
