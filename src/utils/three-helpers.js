import * as THREE from 'three'

/**
 * Generates a procedural high-res paper texture with subtle fiber noise.
 */
export function createPaperCanvas(width = 512, height = 512, baseColor = '#fffdf7', noiseAlpha = 0.06) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, width, height)

  const imgData = ctx.getImageData(0, 0, width, height)
  const d = imgData.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 50 * noiseAlpha
    d[i] = Math.min(255, Math.max(0, d[i] + n))
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n))
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n))
  }
  ctx.putImageData(imgData, 0, 0)
  return canvas
}

/**
 * Creates a washi tape canvas texture with cute patterns (dots, stripes, hearts).
 */
export function createWashiTapeTexture(pattern = 'hearts', color = '#f472b6', bg = '#fce7f3') {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 256, 64)

  ctx.fillStyle = color
  if (pattern === 'hearts') {
    ctx.font = '24px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (let x = 20; x < 256; x += 40) {
      ctx.fillText('♥', x, 32)
    }
  } else if (pattern === 'stripes') {
    ctx.lineWidth = 6
    ctx.strokeStyle = color
    for (let x = -64; x < 320; x += 24) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x + 64, 64)
      ctx.stroke()
    }
  } else {
    // Stars & dots
    ctx.font = '20px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (let x = 20; x < 256; x += 36) {
      ctx.fillText('✦', x, 32)
    }
  }

  // Semi-transparent jagged edges
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

/**
 * Creates high quality scrapbook text sprite with styled badge, drop shadow and tape.
 */
export function makeTextSprite(text, {
  fontSize    = 42,
  fontFace    = 'Indie Flower, cursive',
  color       = '#ffffff',
  bgColor     = null,
  padding     = 20,
  maxWidth    = 600,
  bold        = false,
  borderColor = null,
  tapeTop     = false,
  scale       = 1
} = {}) {
  const canvas = document.createElement('canvas')
  const ctx    = canvas.getContext('2d')

  const font = `${bold ? 'bold ' : ''}${fontSize}px ${fontFace}`
  ctx.font = font

  const lines = text.split('\n')
  let maxW = 0
  lines.forEach(l => { maxW = Math.max(maxW, ctx.measureText(l).width) })
  maxW = Math.min(maxW, maxWidth)

  const lineH = fontSize * 1.35
  const textH = lineH * lines.length

  canvas.width  = Math.max(128, maxW + padding * 2)
  canvas.height = Math.max(64, textH + padding * 2 + (tapeTop ? 24 : 0))

  ctx.font = font
  ctx.textBaseline = 'top'

  const topOffset = tapeTop ? 20 : 0

  if (bgColor) {
    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetX = 3
    ctx.shadowOffsetY = 5

    ctx.fillStyle = bgColor
    const r = 14
    const x = 6, y = topOffset + 6, w = canvas.width - 12, h = canvas.height - topOffset - 12
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
    ctx.fill()

    ctx.shadowColor = 'transparent'
  }

  if (borderColor) {
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 3
    ctx.stroke()
  }

  // Washi tape on top if requested
  if (tapeTop) {
    ctx.fillStyle = 'rgba(255, 182, 193, 0.85)'
    ctx.save()
    ctx.translate(canvas.width / 2, 10)
    ctx.rotate(-0.03)
    ctx.fillRect(-45, -8, 90, 18)
    ctx.restore()
  }

  // Text with subtle shadow
  ctx.fillStyle = color
  lines.forEach((line, i) => {
    ctx.fillText(line, padding, padding + topOffset + i * lineH)
  })

  const texture  = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
  const sprite   = new THREE.Sprite(material)

  const aspect = canvas.width / canvas.height
  sprite.scale.set(aspect * scale, scale, 1)
  sprite.userData.canvasWidth  = canvas.width
  sprite.userData.canvasHeight = canvas.height

  return sprite
}

/**
 * Creates point light with multi-layer glowing flare halo.
 */
export function makeGlowLight(color, intensity, distance, x, y, z, sphereSize = 0.08) {
  const group = new THREE.Group()

  const light = new THREE.PointLight(color, intensity, distance)
  light.position.set(x, y, z)
  group.add(light)

  if (sphereSize > 0) {
    // Core flare
    const coreGeo = new THREE.SphereGeometry(sphereSize, 16, 16)
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const core = new THREE.Mesh(coreGeo, coreMat)
    core.position.set(x, y, z)
    group.add(core)

    // Outer glow aura
    const haloGeo = new THREE.SphereGeometry(sphereSize * 2.5, 16, 16)
    const haloMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    })
    const halo = new THREE.Mesh(haloGeo, haloMat)
    halo.position.set(x, y, z)
    group.add(halo)
  }

  return group
}

/**
 * Creates sparkling floating fairy particles.
 */
export function makeParticles(count, spread, color, size = 0.06) {
  const geo = new THREE.BufferGeometry()
  const pos = new Float32Array(count * 3)
  const scales = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * spread
    pos[i * 3 + 1] = (Math.random() - 0.5) * spread
    pos[i * 3 + 2] = (Math.random() - 0.5) * spread
    scales[i]      = Math.random() * 0.8 + 0.4
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('scale', new THREE.BufferAttribute(scales, 1))

  // Soft circle texture
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const cx = c.getContext('2d')
  const grad = cx.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.3, 'rgba(255,200,240,0.8)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  cx.fillStyle = grad
  cx.fillRect(0, 0, 64, 64)

  const tex = new THREE.CanvasTexture(c)
  const mat = new THREE.PointsMaterial({
    color,
    size,
    map: tex,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  return new THREE.Points(geo, mat)
}

/**
 * Creates high-detail scrapbook Polaroid photo frame with bevels, clips, washi tape, and sticker labels.
 */
export async function makePolaroid(imagePath, label = '', rotation = [0, 0, 0], clipType = 'clip') {
  const group = new THREE.Group()

  // 1. Polaroid Paper backing (with thickness and beveled feel)
  const paperCanvas = createPaperCanvas(512, 600, '#fffdfa', 0.08)
  const paperTex = new THREE.CanvasTexture(paperCanvas)
  const frameMat = new THREE.MeshStandardMaterial({
    map: paperTex,
    color: 0xffffff,
    roughness: 0.45,
    metalness: 0.05
  })
  const frameGeo = new THREE.BoxGeometry(2.3, 2.85, 0.06)
  const frame = new THREE.Mesh(frameGeo, frameMat)
  frame.castShadow = true
  group.add(frame)

  // 2. Drop shadow illusion plane behind polaroid
  const shadowGeo = new THREE.PlaneGeometry(2.45, 3.0)
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.35,
    depthWrite: false
  })
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat)
  shadowMesh.position.set(0.08, -0.08, -0.04)
  group.add(shadowMesh)

  // 3. Photo texture
  const photoGeo = new THREE.PlaneGeometry(2.0, 2.0)
  const loader = new THREE.TextureLoader()
  const tex = await new Promise(resolve => {
    loader.load(imagePath, resolve, undefined, () => {
      const c = document.createElement('canvas')
      c.width = c.height = 512
      const cx = c.getContext('2d')
      cx.fillStyle = '#f472b6'
      cx.fillRect(0, 0, 512, 512)
      cx.fillStyle = '#fff'
      cx.font = '64px sans-serif'
      cx.textAlign = 'center'
      cx.fillText('📸', 256, 280)
      resolve(new THREE.CanvasTexture(c))
    })
  })
  tex.colorSpace = THREE.SRGBColorSpace
  const photoMat = new THREE.MeshBasicMaterial({ map: tex })
  const photo = new THREE.Mesh(photoGeo, photoMat)
  photo.position.set(0, 0.28, 0.035)
  group.add(photo)

  // 4. Photographic glossy sheen over photo
  const sheenGeo = new THREE.PlaneGeometry(2.0, 2.0)
  const sheenMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.1,
    transmission: 0.9,
    transparent: true,
    opacity: 0.15,
    ior: 1.5
  })
  const sheen = new THREE.Mesh(sheenGeo, sheenMat)
  sheen.position.set(0, 0.28, 0.038)
  group.add(sheen)

  // 5. Washi Tape / Clip at the top
  if (clipType === 'tape') {
    const tapeTex = createWashiTapeTexture('hearts', '#ec4899', '#fce7f3')
    const tapeGeo = new THREE.BoxGeometry(1.0, 0.3, 0.02)
    const tapeMat = new THREE.MeshStandardMaterial({
      map: tapeTex,
      transparent: true,
      opacity: 0.9,
      roughness: 0.6
    })
    const tape = new THREE.Mesh(tapeGeo, tapeMat)
    tape.position.set((Math.random() - 0.5) * 0.4, 1.42, 0.05)
    tape.rotation.z = (Math.random() - 0.5) * 0.15
    group.add(tape)
  } else {
    // Rose-Gold Bulldog Clip
    const clipGroup = new THREE.Group()
    const clipMat = new THREE.MeshStandardMaterial({
      color: 0xff99bb,
      metalness: 0.9,
      roughness: 0.2
    })
    const clipBody = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 16), clipMat)
    clipBody.rotation.z = Math.PI / 2
    clipGroup.add(clipBody)

    // Clip handles
    const handleGeo = new THREE.TorusGeometry(0.18, 0.025, 8, 24, Math.PI)
    const h1 = new THREE.Mesh(handleGeo, clipMat)
    h1.position.set(0, 0.15, 0.05)
    clipGroup.add(h1)

    clipGroup.position.set(0, 1.42, 0.05)
    group.add(clipGroup)
  }

  // 6. Label text
  if (label) {
    const sprite = makeTextSprite(label, {
      fontSize: 34,
      color: '#4a2840',
      fontFace: 'Indie Flower, cursive',
      bold: true,
      scale: 1
    })
    sprite.position.set(0, -1.08, 0.05)
    sprite.scale.multiplyScalar(0.022)
    group.add(sprite)
  }

  group.rotation.set(...rotation)
  group.userData.isFrame = true
  return group
}

/**
 * Creates luxury 3D gift box with beveled trim, velvet paper, multi-loop satin bow, and gift tag.
 */
export function createLuxuryGiftBox() {
  const boxGroup = new THREE.Group()

  // Paper texture
  const boxTex = new THREE.CanvasTexture(createPaperCanvas(256, 256, '#28053f', 0.12))

  // 1. Box Body (Deep Royal Violet Velvet)
  const bodyGeo = new THREE.BoxGeometry(2.2, 2.0, 2.2)
  const bodyMat = new THREE.MeshPhysicalMaterial({
    map: boxTex,
    color: 0x220538,
    roughness: 0.55,
    metalness: 0.15,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2
  })
  const boxBody = new THREE.Mesh(bodyGeo, bodyMat)
  boxBody.castShadow = true
  boxBody.receiveShadow = true
  boxBody.position.y = -0.1
  boxGroup.add(boxBody)

  // Golden bottom trim
  const trimGeo = new THREE.BoxGeometry(2.25, 0.08, 2.25)
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.2
  })
  const bottomTrim = new THREE.Mesh(trimGeo, goldMat)
  bottomTrim.position.y = -1.08
  boxGroup.add(bottomTrim)

  // 2. Satin Ribbon wrapping box body (vertical & horizontal with thickness)
  const satinMat = new THREE.MeshPhysicalMaterial({
    color: 0xff4d94,
    emissive: 0x99004d,
    emissiveIntensity: 0.25,
    roughness: 0.25,
    metalness: 0.3,
    clearcoat: 0.6
  })
  const ribbonV = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.05, 2.24), satinMat)
  ribbonV.position.y = -0.1
  const ribbonH = new THREE.Mesh(new THREE.BoxGeometry(2.24, 2.05, 0.28), satinMat)
  ribbonH.position.y = -0.1
  boxGroup.add(ribbonV, ribbonH)

  // 3. Hinged Lid assembly
  const lidPivot = new THREE.Group()
  lidPivot.position.set(0, 0.95, 1.15) // Hinge pivot line along back top edge

  const lidGeo = new THREE.BoxGeometry(2.32, 0.45, 2.32)
  const lidMat = new THREE.MeshPhysicalMaterial({
    map: boxTex,
    color: 0x330852,
    roughness: 0.5,
    metalness: 0.2,
    clearcoat: 0.5
  })
  const boxLid = new THREE.Mesh(lidGeo, lidMat)
  boxLid.castShadow = true
  boxLid.position.set(0, 0.22, -1.15)
  lidPivot.add(boxLid)

  // Ribbons on Lid
  const lidRibbonV = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.47, 2.34), satinMat)
  lidRibbonV.position.set(0, 0.22, -1.15)
  const lidRibbonH = new THREE.Mesh(new THREE.BoxGeometry(2.34, 0.47, 0.29), satinMat)
  lidRibbonH.position.set(0, 0.22, -1.15)
  lidPivot.add(lidRibbonV, lidRibbonH)

  // 4. Elaborate Multi-Loop Satin Bow on Top
  const bowCenter = new THREE.Group()
  bowCenter.position.set(0, 0.45, -1.15)

  // Center knot
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), satinMat)
  bowCenter.add(knot)

  // 8 Bow loops arranged radially
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4
    const loopGeo = new THREE.TorusGeometry(0.35, 0.08, 12, 32, Math.PI * 1.3)
    const loop = new THREE.Mesh(loopGeo, satinMat)
    loop.rotation.z = angle
    loop.rotation.x = Math.PI / 2.8
    loop.position.set(Math.cos(angle) * 0.2, 0.15, Math.sin(angle) * 0.2)
    bowCenter.add(loop)
  }

  // Two draped ribbon tails
  for (let s = -1; s <= 1; s += 2) {
    const tailCurve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(s * 0.1, 0, 0),
      new THREE.Vector3(s * 0.4, -0.2, 0.2),
      new THREE.Vector3(s * 0.8, -0.6, 0.5),
      new THREE.Vector3(s * 1.1, -1.1, 0.7)
    )
    const tailGeo = new THREE.TubeGeometry(tailCurve, 20, 0.08, 8, false)
    const tail = new THREE.Mesh(tailGeo, satinMat)
    bowCenter.add(tail)
  }

  lidPivot.add(bowCenter)
  boxGroup.add(lidPivot)

  // 5. Hanging Gift Tag ("Para: Pallito 💜 De: Kev")
  const tagGroup = new THREE.Group()
  const tagGeo = new THREE.BoxGeometry(0.7, 1.1, 0.02)
  const tagMat = new THREE.MeshStandardMaterial({ color: 0xffe4f0, roughness: 0.6 })
  const tag = new THREE.Mesh(tagGeo, tagMat)
  tagGroup.add(tag)

  // Eyelet
  const eyelet = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 8, 16), goldMat)
  eyelet.position.set(0, 0.42, 0.015)
  tagGroup.add(eyelet)

  // Tag text sprite
  const tagText = makeTextSprite('Para:\nPallito 💜\nDe: Kev', {
    fontSize: 30,
    fontFace: 'Indie Flower, cursive',
    color: '#831843',
    bold: true,
    padding: 8,
    scale: 0.7
  })
  tagText.position.set(0, -0.05, 0.02)
  tagGroup.add(tagText)

  tagGroup.position.set(0.9, 0.6, 1.25)
  tagGroup.rotation.set(0.2, 0.3, -0.4)
  boxGroup.add(tagGroup)

  return {
    boxGroup,
    boxBody,
    boxLid,
    lidPivot,
    clickTargets: [boxBody, boxLid, knot]
  }
}

/**
 * Creates high-detail gym dumbbell with knurled steel bar, chrome spinlock collars,
 * hex plates with embossed markings and chalk textures.
 */
export function createDetailedDumbbell() {
  const group = new THREE.Group()

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.95,
    roughness: 0.15
  })

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.08
  })

  const rubberMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.65,
    metalness: 0.2
  })

  // 1. Center Handle with knurled grip
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 24), steelMat)
  handle.rotation.z = Math.PI / 2
  group.add(handle)

  // Grip texture ring accents
  for (let x of [-0.35, -0.15, 0.15, 0.35]) {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.18, 24), chromeMat)
    ring.rotation.z = Math.PI / 2
    ring.position.x = x
    group.add(ring)
  }

  // 2. Weight Plates on both sides (Hexagonal with chamfer)
  for (let s of [-1, 1]) {
    // Inner plate (Large)
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 6), rubberMat)
    p1.rotation.z = Math.PI / 2
    p1.position.x = s * 0.58
    group.add(p1)

    // Outer plate (Medium)
    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 6), rubberMat)
    p2.rotation.z = Math.PI / 2
    p2.position.x = s * 0.74
    group.add(p2)

    // Spinlock collar
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.1, 16), chromeMat)
    collar.rotation.z = Math.PI / 2
    collar.position.x = s * 0.86
    group.add(collar)

    // Star locking nut
    const nut = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 16), steelMat)
    nut.rotation.y = Math.PI / 2
    nut.position.x = s * 0.92
    group.add(nut)
  }

  return group
}

/**
 * Creates high-detail aerodynamic motorcycle racing helmet with iridescent visor,
 * carbon fiber trim, aerodynamic spoiler, and vents.
 */
export function createAerodynamicHelmet() {
  const group = new THREE.Group()

  // 1. Pearlescent Metallic Shell (Two-tone magenta/violet)
  const shellGeo = new THREE.SphereGeometry(0.55, 32, 32)
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0x991b1b,
    emissive: 0x701a75,
    emissiveIntensity: 0.3,
    metalness: 0.4,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  })
  const shell = new THREE.Mesh(shellGeo, shellMat)
  group.add(shell)

  // 2. Aerodynamic Top Scoop & Rear Spoiler
  const spoilerGeo = new THREE.BoxGeometry(0.35, 0.12, 0.4)
  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.4,
    metalness: 0.8
  })
  const spoiler = new THREE.Mesh(spoilerGeo, carbonMat)
  spoiler.position.set(0, 0.25, -0.38)
  spoiler.rotation.x = -0.25
  group.add(spoiler)

  // 3. Iridium / Rainbow Chrome Visor
  const visorGeo = new THREE.SphereGeometry(0.56, 32, 24, 0, Math.PI, Math.PI / 3.2, Math.PI / 2.6)
  const visorMat = new THREE.MeshPhysicalMaterial({
    color: 0xff007f,
    emissive: 0x00f0ff,
    emissiveIntensity: 0.35,
    metalness: 0.95,
    roughness: 0.05,
    clearcoat: 1.0,
    reflectivity: 1.0
  })
  const visor = new THREE.Mesh(visorGeo, visorMat)
  visor.rotation.x = Math.PI / 2
  visor.position.set(0, 0.06, 0.06)
  group.add(visor)

  // 4. Chin bar & vents
  const chinVent = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.1), carbonMat)
  chinVent.position.set(0, -0.25, 0.52)
  group.add(chinVent)

  // 5. Racing Decal ("Duke #1")
  const decalSprite = makeTextSprite('DUKE #1\nPallito Ed.', {
    fontSize: 26,
    fontFace: 'Nunito, sans-serif',
    color: '#00f0ff',
    bold: true,
    padding: 6,
    scale: 0.65
  })
  decalSprite.position.set(0, 0.38, 0.42)
  group.add(decalSprite)

  return group
}

/**
 * Creates arcade retro-futuristic Aura Machine console with vacuum tubes,
 * multi-dial analog meters, animated LED bar, and juicy dome button.
 */
export function createArcadeAuraMachine() {
  const group = new THREE.Group()

  // 1. Console Housing (Lavender metallic chassis)
  const housingMat = new THREE.MeshPhysicalMaterial({
    color: 0x24113a,
    emissive: 0x150724,
    metalness: 0.5,
    roughness: 0.25,
    clearcoat: 0.8
  })
  const chromeTrimMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.95,
    roughness: 0.1
  })

  // Pedestal Column
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.5, 32), housingMat)
  base.position.y = -1.6
  group.add(base)

  // Lower chrome ring
  const baseRing = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.06, 12, 48), chromeTrimMat)
  baseRing.position.y = -1.4
  baseRing.rotation.x = Math.PI / 2
  group.add(baseRing)

  // 2. Center Glass Plasma Cylinder
  const glassGeo = new THREE.CylinderGeometry(1.2, 1.2, 2.6, 32)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xff77cc,
    transmission: 0.9,
    roughness: 0.08,
    transparent: true,
    opacity: 0.95,
    ior: 1.45
  })
  const glassChamber = new THREE.Mesh(glassGeo, glassMat)
  glassChamber.position.y = 0.15
  group.add(glassChamber)

  // 3. Central Energy Core (Plasma Spark Icosahedron)
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x00ffff,
    emissive: 0xff00d4,
    emissiveIntensity: 0.9,
    wireframe: true
  })
  const plasmaCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.65, 2), coreMat)
  plasmaCore.position.y = 0.15
  group.add(plasmaCore)

  // 4. Glowing Vacuum Tubes with spiral filaments
  const vacuumTubes = []
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4
    const tubeGroup = new THREE.Group()

    const tubeGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 1.6, 16),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.95, transparent: true, opacity: 0.9 })
    )
    // Filament inside
    const filament = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 1.3, 8),
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xff00ff : 0x00f0ff })
    )
    tubeGroup.add(tubeGlass, filament)
    tubeGroup.position.set(Math.cos(angle) * 1.8, 0.15, Math.sin(angle) * 1.8)
    group.add(tubeGroup)
    vacuumTubes.push({ group: tubeGroup, filament })
  }

  // 5. Analog Gauge Meter
  const gaugeGroup = new THREE.Group()
  const gaugeBezel = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.1, 32), chromeTrimMat)
  gaugeBezel.rotation.x = Math.PI / 2
  gaugeGroup.add(gaugeBezel)

  // Dial face
  const dialFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.4, 32),
    new THREE.MeshBasicMaterial({ color: 0xfffff0 })
  )
  dialFace.position.z = 0.06
  gaugeGroup.add(dialFace)

  // Indicator Needle
  const needleGeo = new THREE.ConeGeometry(0.03, 0.32, 8)
  const needleMat = new THREE.MeshBasicMaterial({ color: 0xff0033 })
  const needle = new THREE.Mesh(needleGeo, needleMat)
  needle.position.set(0, 0.1, 0.07)
  const needlePivot = new THREE.Group()
  needlePivot.position.set(0, -0.05, 0.07)
  needle.position.set(0, 0.15, 0)
  needlePivot.add(needle)
  gaugeGroup.add(needlePivot)

  gaugeGroup.position.set(-1.2, 0.2, 1.5)
  gaugeGroup.rotation.y = 0.4
  group.add(gaugeGroup)

  // 6. LED Indicator Segment Tower
  const ledTower = new THREE.Group()
  const ledSegments = []
  const ledColors = [0x22c55e, 0x22c55e, 0xfacc15, 0xfacc15, 0xf97316, 0xef4444, 0xa855f7, 0xec4899]
  for (let i = 0; i < 8; i++) {
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.08, 0.08),
      new THREE.MeshStandardMaterial({
        color: ledColors[i],
        emissive: ledColors[i],
        emissiveIntensity: 0.3
      })
    )
    led.position.y = i * 0.12 - 0.4
    ledTower.add(led)
    ledSegments.push(led)
  }
  ledTower.position.set(1.2, 0.2, 1.5)
  ledTower.rotation.y = -0.4
  group.add(ledTower)

  // 7. Big Arcade Dome Push-Button
  const btnPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.75, 24), housingMat)
  btnPedestal.position.set(0, -1.15, 2.3)
  group.add(btnPedestal)

  const btnChromeBezel = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.05, 12, 32), chromeTrimMat)
  btnChromeBezel.rotation.x = Math.PI / 2
  btnChromeBezel.position.set(0, -0.74, 2.3)
  group.add(btnChromeBezel)

  const btnDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshPhysicalMaterial({
      color: 0xff0066,
      emissive: 0xff0044,
      emissiveIntensity: 0.65,
      roughness: 0.2,
      clearcoat: 1.0
    })
  )
  btnDome.position.set(0, -0.74, 2.3)
  group.add(btnDome)

  return {
    group,
    plasmaCore,
    vacuumTubes,
    needlePivot,
    ledSegments,
    buttonMesh: btnDome
  }
}

/**
 * Creates detailed 3D folded parchment envelope with wax seal, ribbon, and paper slide.
 */
export function createDetailedEnvelope() {
  const envelopeGroup = new THREE.Group()

  const paperTex = new THREE.CanvasTexture(createPaperCanvas(512, 512, '#fff4f9', 0.08))

  // 1. Envelope Body (Beveled edges with satin paper texture)
  const bodyGeo = new THREE.BoxGeometry(3.0, 2.05, 0.08)
  const bodyMat = new THREE.MeshStandardMaterial({
    map: paperTex,
    color: 0xfdf2f8,
    roughness: 0.45,
    metalness: 0.05
  })
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  body.castShadow = true
  envelopeGroup.add(body)

  // 2. Border foil trim
  const borderGeo = new THREE.BoxGeometry(3.04, 2.09, 0.02)
  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.95,
    roughness: 0.15
  })
  const foilBorder = new THREE.Mesh(borderGeo, goldFoilMat)
  foilBorder.position.z = -0.04
  envelopeGroup.add(foilBorder)

  // 3. Flap with Hinge Pivot
  const flapPivot = new THREE.Group()
  flapPivot.position.set(0, 1.025, 0.045)

  // Triangular flap geometry
  const flapShape = new THREE.Shape()
  flapShape.moveTo(-1.5, 0)
  flapShape.lineTo(1.5, 0)
  flapShape.lineTo(0, -1.0)
  flapShape.closePath()

  const flapGeo = new THREE.ShapeGeometry(flapShape)
  const flapMat = new THREE.MeshStandardMaterial({
    map: paperTex,
    color: 0xfce7f3,
    roughness: 0.5,
    side: THREE.DoubleSide
  })
  const flap = new THREE.Mesh(flapGeo, flapMat)
  flapPivot.add(flap)
  envelopeGroup.add(flapPivot)

  // 4. Stamped Wax Seal with embossed Heart
  const sealGroup = new THREE.Group()
  const waxGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.08, 32)
  const waxMat = new THREE.MeshPhysicalMaterial({
    color: 0x9333ea,
    emissive: 0x7c3aed,
    emissiveIntensity: 0.2,
    roughness: 0.35,
    clearcoat: 0.6
  })
  const waxMesh = new THREE.Mesh(waxGeo, waxMat)
  waxMesh.rotation.x = Math.PI / 2
  sealGroup.add(waxMesh)

  const heartSprite = makeTextSprite('💜', { fontSize: 36, padding: 4, scale: 0.55 })
  heartSprite.position.set(0, 0, 0.05)
  sealGroup.add(heartSprite)

  sealGroup.position.set(0, 0.25, 0.08)
  envelopeGroup.add(sealGroup)

  // 5. Letter paper that peeks out inside
  const letterPaperGeo = new THREE.BoxGeometry(2.7, 1.85, 0.03)
  const letterPaperMat = new THREE.MeshStandardMaterial({
    map: paperTex,
    color: 0xffffff,
    roughness: 0.5
  })
  const letterPaper = new THREE.Mesh(letterPaperGeo, letterPaperMat)
  letterPaper.position.set(0, 0.05, -0.01)
  envelopeGroup.add(letterPaper)

  return {
    envelopeGroup,
    flapPivot,
    sealGroup,
    letterPaper
  }
}

/**
 * Creates faceted Mirror Disco Ball with realistic mirror squares, chain, and rotating spindle.
 */
export function createDetailedDiscoBall(radius = 1.0) {
  const group = new THREE.Group()

  // High-poly faceted sphere with flat shading to look like real mirrored glass tiles
  const sphereGeo = new THREE.SphereGeometry(radius, 40, 24)
  const mirrorMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.98,
    roughness: 0.05,
    flatShading: true
  })
  const ball = new THREE.Mesh(sphereGeo, mirrorMat)
  group.add(ball)

  // Top mount spindle
  const spindleGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 16)
  const spindleMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 })
  const spindle = new THREE.Mesh(spindleGeo, spindleMat)
  spindle.position.y = radius + 0.15
  group.add(spindle)

  // Hanging steel chain
  for (let i = 0; i < 8; i++) {
    const linkGeo = new THREE.TorusGeometry(0.08, 0.02, 8, 16)
    const link = new THREE.Mesh(linkGeo, spindleMat)
    link.position.y = radius + 0.3 + i * 0.22
    link.rotation.y = (i % 2) * (Math.PI / 2)
    group.add(link)
  }

  return { group, ball }
}
